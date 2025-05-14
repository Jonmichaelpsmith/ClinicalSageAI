/**
 * Module Integration Service
 * 
 * This service handles integration between different modules and the unified document system.
 */

import { z } from 'zod';
import { eq, and, or, inArray, desc, sql } from 'drizzle-orm';
import { db, pgClient } from '../db/connection';
import * as schema from '../../shared/schema/unified_workflow';
import { workflowService } from './WorkflowService';

// Define validation schemas
export const registerDocumentSchema = z.object({
  documentType: z.string().min(1),
  name: z.string().min(1),
  version: z.string().optional().default('1.0'),
  organizationId: z.number().int().positive(),
  status: z.string().optional().default('draft'),
  metadata: z.record(z.any()).optional().default({}),
  externalId: z.string().min(1),
  createdBy: z.number().int().positive(),
  moduleType: z.string().min(1),
  originalId: z.string().min(1),
  moduleUrl: z.string().optional(),
});

export const moduleReferenceSchema = z.object({
  moduleType: z.string().min(1),
  originalId: z.string().min(1),
  organizationId: z.number().int().positive(),
});

class ModuleIntegrationService {
  /**
   * Register a document from a module in the unified document system
   * 
   * @param data Document data
   * @returns The registered document with its module reference
   */
  async registerModuleDocument(data: z.infer<typeof registerDocumentSchema>) {
    // Check if document already exists by module reference
    const existingDoc = await this.getDocumentByModuleId(
      data.moduleType,
      data.originalId,
      data.organizationId
    );

    if (existingDoc) {
      // If document exists, update it
      return this.updateDocument(existingDoc.id, {
        name: data.name,
        version: data.version,
        status: data.status,
        metadata: data.metadata,
        updatedAt: new Date()
      });
    }

    const client = await pgClient.begin();

    try {
      // Insert the document
      const [document] = await db
        .insert(schema.documents)
        .values({
          documentType: data.documentType,
          name: data.name,
          version: data.version || '1.0',
          organizationId: data.organizationId,
          status: data.status || 'draft',
          metadata: data.metadata || {},
          externalId: data.externalId,
          createdBy: data.createdBy,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning()
        .execute(client as any);

      // Insert module reference
      const [moduleRef] = await db
        .insert(schema.moduleReferences)
        .values({
          documentId: document.id,
          moduleType: data.moduleType,
          originalId: data.originalId,
          moduleUrl: data.moduleUrl,
          createdAt: new Date()
        })
        .returning()
        .execute(client as any);

      await client.commit();

      return {
        ...document,
        moduleReference: moduleRef
      };
    } catch (error) {
      await client.rollback();
      console.error('Error registering module document:', error);
      throw error;
    }
  }

  /**
   * Update a document in the unified document system
   * 
   * @param documentId Document ID
   * @param updateData Data to update
   * @returns The updated document
   */
  async updateDocument(documentId: number, updateData: Partial<typeof schema.documents.$inferInsert>) {
    const client = await pgClient.begin();

    try {
      const [updatedDoc] = await db
        .update(schema.documents)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(schema.documents.id, documentId))
        .returning()
        .execute(client as any);

      const moduleReference = await db
        .select()
        .from(schema.moduleReferences)
        .where(eq(schema.moduleReferences.documentId, documentId))
        .execute(client as any);

      await client.commit();

      return {
        ...updatedDoc,
        moduleReference: moduleReference[0]
      };
    } catch (error) {
      await client.rollback();
      console.error('Error updating document:', error);
      throw error;
    }
  }

  /**
   * Get a document by its module-specific ID
   * 
   * @param moduleType Module type
   * @param originalId Original document ID in the module
   * @param organizationId Organization ID
   * @returns The document with its module reference, or null if not found
   */
  async getDocumentByModuleId(moduleType: string, originalId: string, organizationId: number) {
    const results = await db
      .select()
      .from(schema.documents)
      .innerJoin(
        schema.moduleReferences,
        eq(schema.documents.id, schema.moduleReferences.documentId)
      )
      .where(
        and(
          eq(schema.moduleReferences.moduleType, moduleType),
          eq(schema.moduleReferences.originalId, originalId),
          eq(schema.documents.organizationId, organizationId)
        )
      )
      .execute();

    if (results.length === 0) {
      return null;
    }

    const res = results[0];
    return {
      id: res.documents.id,
      ...res.documents,
      moduleReference: res.module_references
    };
  }

  /**
   * Create a document workflow
   * 
   * @param documentId Document ID
   * @param templateId Workflow template ID
   * @param startedBy User who started the workflow
   * @param metadata Optional workflow metadata
   * @returns The created workflow with approvals
   */
  async createDocumentWorkflow(documentId: number, templateId: number, startedBy: number, metadata = {}) {
    return workflowService.createWorkflow(documentId, templateId, startedBy, metadata);
  }

  /**
   * Create default workflow templates for an organization
   * 
   * @param organizationId Organization ID
   * @param createdBy User ID of creator
   * @returns The created templates
   */
  async createDefaultWorkflowTemplates(organizationId: number, createdBy: number) {
    const moduleTypes = ['CER', '510k', 'ClinicalTrial', 'IND', 'eCTD'];
    const templates = [];

    for (const moduleType of moduleTypes) {
      const templateStructure = this.getDefaultTemplateStructure(moduleType);
      
      if (templateStructure) {
        const templateData = {
          name: templateStructure.name,
          description: templateStructure.description,
          organizationId,
          moduleType,
          isDefault: true,
          createdBy,
          steps: templateStructure.steps.map((step: any, index: number) => ({
            name: step.name,
            description: step.description,
            order: index,
            assigneeType: step.assigneeType || 'any'
          }))
        };
        
        const template = await workflowService.createWorkflowTemplate(templateData);
        templates.push(template);
      }
    }
    
    return templates;
  }

  /**
   * Get documents for a module
   * 
   * @param moduleType Module type
   * @param organizationId Organization ID
   * @returns List of documents
   */
  async getModuleDocuments(moduleType: string, organizationId: number) {
    const results = await db
      .select()
      .from(schema.documents)
      .innerJoin(
        schema.moduleReferences,
        eq(schema.documents.id, schema.moduleReferences.documentId)
      )
      .where(
        and(
          eq(schema.moduleReferences.moduleType, moduleType),
          eq(schema.documents.organizationId, organizationId)
        )
      )
      .orderBy(desc(schema.documents.updatedAt))
      .execute();

    return results.map((result) => ({
      ...result.documents,
      moduleReference: result.module_references
    }));
  }

  /**
   * Get document counts by type for an organization
   * 
   * @param organizationId Organization ID
   * @returns Map of document types to counts
   */
  async getDocumentCountByType(organizationId: number) {
    const results = await db
      .select({
        moduleType: schema.moduleReferences.moduleType,
        count: sql`COUNT(*)`
      })
      .from(schema.documents)
      .innerJoin(
        schema.moduleReferences,
        eq(schema.documents.id, schema.moduleReferences.documentId)
      )
      .where(eq(schema.documents.organizationId, organizationId))
      .groupBy(schema.moduleReferences.moduleType)
      .execute();

    return results.reduce((acc: Record<string, number>, ref: any) => {
      acc[ref.moduleType] = ref.count;
      return acc;
    }, {});
  }

  /**
   * Get documents in review
   * 
   * @param organizationId Organization ID
   * @returns Documents in review
   */
  async getDocumentsInReview(organizationId: number) {
    const documents = await db
      .select()
      .from(schema.documents)
      .innerJoin(
        schema.moduleReferences,
        eq(schema.documents.id, schema.moduleReferences.documentId)
      )
      .innerJoin(
        schema.documentWorkflows,
        eq(schema.documents.id, schema.documentWorkflows.documentId)
      )
      .where(
        and(
          eq(schema.documents.organizationId, organizationId),
          eq(schema.documentWorkflows.status, 'in_progress')
        )
      )
      .orderBy(desc(schema.documentWorkflows.startedAt))
      .execute();

    // Get all workflow IDs
    const workflowIds = [...new Set(documents.map((doc: any) => doc.document_workflows.id))];
    
    // Get all approvals
    const approvals = workflowIds.length > 0 
      ? await db
          .select()
          .from(schema.workflowApprovals)
          .where(inArray(schema.workflowApprovals.workflowId, workflowIds))
          .execute()
      : [];

    // Organize results by document
    return documents.reduce((acc: any[], doc: any) => {
      const existingDoc = acc.find(d => d.id === doc.documents.id);
      
      if (existingDoc) {
        existingDoc.workflows.push({
          ...doc.document_workflows,
          approvals: approvals.filter(a => a.workflowId === doc.document_workflows.id)
        });
      } else {
        acc.push({
          ...doc.documents,
          moduleReference: doc.module_references,
          workflows: [{
            ...doc.document_workflows,
            approvals: approvals.filter(a => a.workflowId === doc.document_workflows.id)
          }]
        });
      }
      
      return acc;
    }, []);
  }

  /**
   * Get recent documents for a user
   * 
   * @param userId User ID
   * @param organizationId Organization ID
   * @param limit Result limit
   * @returns Recent documents
   */
  async getRecentDocumentsForUser(userId: number, organizationId: number, limit: number = 10) {
    // Get documents created by user
    const createdByUser = await db
      .select()
      .from(schema.documents)
      .innerJoin(
        schema.moduleReferences,
        eq(schema.documents.id, schema.moduleReferences.documentId)
      )
      .where(
        and(
          eq(schema.documents.createdBy, userId),
          eq(schema.documents.organizationId, organizationId)
        )
      )
      .orderBy(desc(schema.documents.updatedAt))
      .limit(limit)
      .execute();

    // Get workflows where user is an approver
    const approvalWorkflows = await db
      .select()
      .from(schema.workflowApprovals)
      .innerJoin(
        schema.documentWorkflows,
        eq(schema.workflowApprovals.workflowId, schema.documentWorkflows.id)
      )
      .where(
        or(
          eq(schema.workflowApprovals.approvedBy, userId),
          eq(schema.workflowApprovals.status, 'pending')
        )
      )
      .execute();

    const documentIds = approvalWorkflows.map(w => w.document_workflows.documentId);
    
    // Get documents for the workflows
    const approvalDocuments = documentIds.length > 0 
      ? await db
          .select()
          .from(schema.documents)
          .innerJoin(
            schema.moduleReferences,
            eq(schema.documents.id, schema.moduleReferences.documentId)
          )
          .where(
            and(
              inArray(schema.documents.id, documentIds),
              eq(schema.documents.organizationId, organizationId)
            )
          )
          .execute()
      : [];

    // Combine and sort results
    const combined = [
      ...createdByUser.map(doc => ({
        ...doc.documents,
        moduleReference: doc.module_references,
        relationshipType: 'created'
      })),
      ...approvalDocuments.map(doc => ({
        ...doc.documents,
        moduleReference: doc.module_references,
        relationshipType: 'approval'
      }))
    ];

    // Remove duplicates and sort by updatedAt
    const seen = new Set();
    return combined
      .filter(doc => {
        if (seen.has(doc.id)) {
          return false;
        }
        seen.add(doc.id);
        return true;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }

  /**
   * Compare document versions
   * 
   * @param currentVersionId Current document version ID
   * @param previousVersionId Previous document version ID
   * @returns The comparison result
   */
  async compareDocumentVersions(currentVersionId: number, previousVersionId: number) {
    // This would be expanded to do field-by-field comparison for document versions
    // For now we'll return a basic structure
    return {
      currentVersion: await this.getDocumentById(currentVersionId),
      previousVersion: await this.getDocumentById(previousVersionId),
      differences: [] // This would be populated with the actual differences
    };
  }

  /**
   * Get a document by ID
   * 
   * @param documentId Document ID
   * @returns The document with its module reference
   */
  private async getDocumentById(documentId: number) {
    const results = await db
      .select()
      .from(schema.documents)
      .leftJoin(
        schema.moduleReferences,
        eq(schema.documents.id, schema.moduleReferences.documentId)
      )
      .where(eq(schema.documents.id, documentId))
      .execute();

    if (results.length === 0) {
      return null;
    }

    return {
      ...results[0].documents,
      moduleReference: results[0].module_references
    };
  }

  /**
   * Get default template structure for module type
   */
  getDefaultTemplateStructure(moduleType: string) {
    const templates: Record<string, any> = {
      '510k': {
        name: '510(k) Review Workflow',
        description: 'Standard review process for 510(k) submissions',
        steps: [
          {
            name: 'Technical Review',
            description: 'Technical staff review of documentation',
            assigneeType: 'technical'
          },
          {
            name: 'QA Review',
            description: 'Quality assurance review',
            assigneeType: 'qa'
          },
          {
            name: 'Regulatory Review',
            description: 'Regulatory affairs review',
            assigneeType: 'regulatory'
          },
          {
            name: 'Final Approval',
            description: 'Final approval by management',
            assigneeType: 'management'
          }
        ]
      },
      'CER': {
        name: 'CER Review Workflow',
        description: 'Standard review process for Clinical Evaluation Reports',
        steps: [
          {
            name: 'Clinical Data Review',
            description: 'Review of clinical data',
            assigneeType: 'clinical'
          },
          {
            name: 'Technical Review',
            description: 'Technical staff review',
            assigneeType: 'technical'
          },
          {
            name: 'QA Review',
            description: 'Quality assurance review',
            assigneeType: 'qa'
          },
          {
            name: 'Final Approval',
            description: 'Final approval by management',
            assigneeType: 'management'
          }
        ]
      },
      'ClinicalTrial': {
        name: 'Clinical Trial Documentation Workflow',
        description: 'Review process for clinical trial documentation',
        steps: [
          {
            name: 'Protocol Review',
            description: 'Review of protocol documentation',
            assigneeType: 'clinical'
          },
          {
            name: 'Statistical Review',
            description: 'Review of statistical methods',
            assigneeType: 'statistical'
          },
          {
            name: 'Medical Review',
            description: 'Medical review of study design',
            assigneeType: 'medical'
          },
          {
            name: 'Final Approval',
            description: 'Final approval by management',
            assigneeType: 'management'
          }
        ]
      },
      'IND': {
        name: 'IND Review Workflow',
        description: 'Review process for Investigational New Drug applications',
        steps: [
          {
            name: 'CMC Review',
            description: 'Chemistry, Manufacturing and Controls review',
            assigneeType: 'cmc'
          },
          {
            name: 'Toxicology Review',
            description: 'Review of toxicology data',
            assigneeType: 'toxicology'
          },
          {
            name: 'Clinical Review',
            description: 'Review of clinical protocol',
            assigneeType: 'clinical'
          },
          {
            name: 'Regulatory Review',
            description: 'Regulatory affairs review',
            assigneeType: 'regulatory'
          },
          {
            name: 'Final Approval',
            description: 'Final approval by management',
            assigneeType: 'management'
          }
        ]
      },
      'eCTD': {
        name: 'eCTD Review Workflow',
        description: 'Review process for eCTD submissions',
        steps: [
          {
            name: 'Content Review',
            description: 'Review of submission content',
            assigneeType: 'content'
          },
          {
            name: 'Technical Review',
            description: 'Technical validation of eCTD format',
            assigneeType: 'technical'
          },
          {
            name: 'Regulatory Review',
            description: 'Regulatory affairs review',
            assigneeType: 'regulatory'
          },
          {
            name: 'Final Approval',
            description: 'Final approval by management',
            assigneeType: 'management'
          }
        ]
      }
    };

    return templates[moduleType] || null;
  }
}

export const moduleIntegrationService = new ModuleIntegrationService();