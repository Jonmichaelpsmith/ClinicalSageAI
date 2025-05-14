/**
 * Module Integration Service
 * 
 * This service provides integration between various modules and the unified document workflow system.
 * It handles cross-module document registration, retrieval, and synchronization.
 */

import { and, eq, sql, desc } from 'drizzle-orm';
import { db, unifiedWorkflowSchema } from '../db/connection';
import { 
  documents, moduleDocuments, workflowTemplates 
} from '../../shared/schema/unified_workflow';
import type { 
  Document, DocumentInsert, ModuleDocument, ModuleDocumentInsert, WorkflowTemplate 
} from '../../shared/schema/unified_workflow';
import { z } from 'zod';
import { workflowService } from './WorkflowService';

// Define supported module types
export const ModuleType = {
  CER: 'cer',
  CMC: 'cmc',
  MEDICAL_DEVICE: 'medical_device',
  IND: 'ind',
  ECTD: 'ectd',
  VAULT: 'vault',
  STUDY: 'study'
};

// Module-specific document types
export const DocumentType = {
  REPORT_510K: '510k_report',
  CER_REPORT: 'cer_report',
  QMS_DOCUMENT: 'qms_document',
  CMC_SECTION: 'cmc_section',
  STUDY_PROTOCOL: 'study_protocol',
  REGULATORY_SUBMISSION: 'regulatory_submission',
  LITERATURE_REVIEW: 'literature_review'
};

// Define module document registration input validation
export const registerDocumentSchema = z.object({
  title: z.string().min(3).max(255),
  documentType: z.string().min(3).max(100),
  moduleType: z.string().min(2).max(50),
  originalDocumentId: z.string().min(1).max(255),
  organizationId: z.number().int().positive(),
  createdBy: z.number().int().positive(),
  vaultFolderId: z.number().int().positive().optional(),
  metadata: z.record(z.any()).optional(),
  content: z.any().optional()
});

export type RegisterDocumentInput = z.infer<typeof registerDocumentSchema>;

export class ModuleIntegrationService {
  /**
   * Registers a document from a specific module into the unified document system
   * 
   * @param documentData - The document data for registration
   * @returns The registered document with its module reference
   */
  async registerModuleDocument(
    documentData: RegisterDocumentInput
  ): Promise<{ document: Document; moduleDocument: ModuleDocument }> {
    // Validate input
    const validatedData = registerDocumentSchema.parse(documentData);
    
    // Use a transaction to ensure both document and moduleDocument are created
    const result = await db.transaction(async (tx) => {
      // Insert the unified document
      const [createdDocument] = await tx
        .insert(documents)
        .values({
          title: validatedData.title,
          documentType: validatedData.documentType,
          organizationId: validatedData.organizationId,
          createdBy: validatedData.createdBy,
          vaultFolderId: validatedData.vaultFolderId,
          metadata: validatedData.metadata || {},
          content: validatedData.content || null
        })
        .returning();
      
      if (!createdDocument) {
        throw new Error('Failed to create unified document');
      }
      
      // Create the module-specific reference
      const [moduleRef] = await tx
        .insert(moduleDocuments)
        .values({
          documentId: createdDocument.id,
          moduleType: validatedData.moduleType,
          originalDocumentId: validatedData.originalDocumentId,
          organizationId: validatedData.organizationId
        })
        .returning();
      
      if (!moduleRef) {
        throw new Error('Failed to create module document reference');
      }
      
      return { document: createdDocument, moduleDocument: moduleRef };
    });
    
    return result;
  }
  
  /**
   * Retrieves a document by its module-specific ID
   * 
   * @param moduleType - The type of module
   * @param originalDocumentId - The original ID in the module
   * @param organizationId - The organization ID
   * @returns The document with its module reference
   */
  async getDocumentByModuleId(
    moduleType: string, 
    originalDocumentId: string, 
    organizationId: number
  ): Promise<{ document: Document; moduleDocument: ModuleDocument } | null> {
    // First find the module document reference
    const moduleRef = await db.query.moduleDocuments.findFirst({
      where: and(
        eq(moduleDocuments.moduleType, moduleType),
        eq(moduleDocuments.originalDocumentId, originalDocumentId),
        eq(moduleDocuments.organizationId, organizationId)
      )
    });
    
    if (!moduleRef) {
      return null;
    }
    
    // Get the unified document
    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, moduleRef.documentId)
    });
    
    if (!doc) {
      return null;
    }
    
    return { document: doc, moduleDocument: moduleRef };
  }
  
  /**
   * Updates a unified document
   * 
   * @param documentId - The document ID
   * @param updateData - The data to update
   * @returns The updated document
   */
  async updateDocument(
    documentId: number, 
    updateData: Partial<DocumentInsert>
  ): Promise<Document> {
    // Verify the document exists
    const existingDoc = await db.query.documents.findFirst({
      where: eq(documents.id, documentId)
    });
    
    if (!existingDoc) {
      throw new Error(`Document with ID ${documentId} not found`);
    }
    
    // Update the document
    const [updatedDoc] = await db
      .update(documents)
      .set(updateData)
      .where(eq(documents.id, documentId))
      .returning();
    
    if (!updatedDoc) {
      throw new Error('Failed to update document');
    }
    
    return updatedDoc;
  }
  
  /**
   * Creates a workflow for a document using a specified template
   * 
   * @param documentId - The document ID
   * @param templateId - The workflow template ID
   * @param startedBy - User ID of the workflow initiator
   * @param metadata - Optional workflow metadata
   * @returns The created workflow with its approvals
   */
  async createDocumentWorkflow(
    documentId: number, 
    templateId: number, 
    startedBy: number,
    metadata: Record<string, any> = {}
  ) {
    // Verify the document exists
    const document = await db.query.documents.findFirst({
      where: eq(documents.id, documentId)
    });
    
    if (!document) {
      throw new Error(`Document with ID ${documentId} not found`);
    }
    
    // Use the workflow service to create the workflow
    return await workflowService.createWorkflow(
      documentId,
      templateId,
      startedBy,
      metadata
    );
  }
  
  /**
   * Gets all documents for a specific module and organization
   * 
   * @param moduleType - The module type
   * @param organizationId - The organization ID
   * @returns Array of documents with their module references
   */
  async getModuleDocuments(
    moduleType: string, 
    organizationId: number
  ): Promise<{ document: Document; moduleDocument: ModuleDocument }[]> {
    // Find all module document references
    const moduleRefs = await db.query.moduleDocuments.findMany({
      where: and(
        eq(moduleDocuments.moduleType, moduleType),
        eq(moduleDocuments.organizationId, organizationId)
      )
    });
    
    if (!moduleRefs.length) {
      return [];
    }
    
    // Get all document IDs
    const documentIds = moduleRefs.map(ref => ref.documentId);
    
    // Get all documents
    const docs = await db.query.documents.findMany({
      where: sql`${documents.id} IN (${sql.join(documentIds, sql`, `)})`
    });
    
    // Map documents to their module references
    return moduleRefs.map(moduleRef => {
      const document = docs.find(doc => doc.id === moduleRef.documentId);
      if (!document) {
        throw new Error(`Document with ID ${moduleRef.documentId} not found`);
      }
      return { document, moduleDocument: moduleRef };
    });
  }
  
  /**
   * Gets document count by document type for an organization
   * 
   * @param organizationId - The organization ID
   * @returns Map of document types to counts
   */
  async getDocumentCountByType(
    organizationId: number
  ): Promise<Record<string, number>> {
    const results = await db.execute(sql`
      SELECT document_type, COUNT(*) as count
      FROM unified_documents
      WHERE organization_id = ${organizationId}
      GROUP BY document_type
    `);
    
    const countMap: Record<string, number> = {};
    for (const row of results.rows as { document_type: string; count: string }[]) {
      countMap[row.document_type] = parseInt(row.count, 10);
    }
    
    return countMap;
  }
  
  /**
   * Creates a default set of workflow templates for a new organization
   * 
   * @param organizationId - The organization ID
   * @param createdBy - User ID of the creator
   * @returns The created templates
   */
  async createDefaultWorkflowTemplates(
    organizationId: number,
    createdBy: number
  ): Promise<WorkflowTemplate[]> {
    const defaultTemplates = [
      {
        name: '510(k) Standard Review',
        description: 'Standard workflow for 510(k) submission review',
        moduleType: ModuleType.MEDICAL_DEVICE,
        organizationId,
        isActive: true,
        createdBy,
        steps: [
          { name: 'Initial Review', description: 'Technical content review' },
          { name: 'Quality Check', description: 'Formatting and completeness check' },
          { name: 'Regulatory Review', description: 'Compliance with regulations' },
          { name: 'Final Approval', description: 'Final sign-off before submission' }
        ]
      },
      {
        name: 'CER Standard Review',
        description: 'Standard workflow for Clinical Evaluation Report review',
        moduleType: ModuleType.CER,
        organizationId,
        isActive: true,
        createdBy,
        steps: [
          { name: 'Data Review', description: 'Clinical data validation' },
          { name: 'Medical Writing', description: 'Narrative and structure' },
          { name: 'Quality Check', description: 'Formatting and references' },
          { name: 'Medical Expert Review', description: 'Clinical validity check' },
          { name: 'Final Approval', description: 'Final sign-off for use' }
        ]
      },
      {
        name: 'Expedited Review',
        description: 'Faster review for time-sensitive documents',
        moduleType: ModuleType.MEDICAL_DEVICE,
        organizationId,
        isActive: true,
        createdBy,
        steps: [
          { name: 'Rapid Review', description: 'Combined technical and quality review' },
          { name: 'Final Approval', description: 'Final sign-off' }
        ]
      }
    ];
    
    const createdTemplates = await Promise.all(
      defaultTemplates.map(template => 
        workflowService.createWorkflowTemplate(template)
      )
    );
    
    return createdTemplates;
  }
  
  /**
   * Gets the most recent document versions from each module for a user
   * 
   * @param userId - The user ID
   * @param organizationId - The organization ID
   * @param limit - Optional limit on results
   * @returns Recent documents from all modules
   */
  async getRecentDocumentsForUser(
    userId: number,
    organizationId: number,
    limit = 10
  ): Promise<Document[]> {
    const recentDocs = await db.query.documents.findMany({
      where: and(
        eq(documents.organizationId, organizationId),
        eq(documents.createdBy, userId)
      ),
      orderBy: [desc(documents.updatedAt)],
      limit
    });
    
    return recentDocs;
  }
  
  /**
   * Gets all documents that are currently in review workflows
   * 
   * @param organizationId - The organization ID
   * @returns Documents with active workflows
   */
  async getDocumentsInReview(
    organizationId: number
  ): Promise<{ document: Document; workflowCount: number }[]> {
    // This query finds documents with active workflows
    const results = await db.execute(sql`
      SELECT d.*, COUNT(w.id) as workflow_count
      FROM unified_documents d
      JOIN workflows w ON d.id = w.document_id
      WHERE d.organization_id = ${organizationId}
      AND w.status = 'in_progress'
      GROUP BY d.id
      ORDER BY d.updated_at DESC
    `);
    
    // Convert the raw results to proper types
    const docsWithCounts: { document: Document; workflowCount: number }[] = [];
    
    for (const row of results.rows) {
      const doc = {
        id: row.id,
        title: row.title,
        documentType: row.document_type,
        organizationId: row.organization_id,
        createdBy: row.created_by,
        vaultFolderId: row.vault_folder_id,
        metadata: row.metadata,
        content: row.content,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      } as Document;
      
      docsWithCounts.push({
        document: doc,
        workflowCount: parseInt(row.workflow_count, 10)
      });
    }
    
    return docsWithCounts;
  }
  
  /**
   * Compares two versions of a document to identify changes
   * 
   * @param currentVersionId - Current document version ID
   * @param previousVersionId - Previous document version ID
   * @returns Difference summary
   */
  async compareDocumentVersions(
    currentVersionId: number, 
    previousVersionId: number
  ): Promise<{
    hasDifferences: boolean;
    currentVersion: Document;
    previousVersion: Document;
    differences: string[];
  }> {
    // Get both document versions
    const currentVersion = await db.query.documents.findFirst({
      where: eq(documents.id, currentVersionId)
    });
    
    const previousVersion = await db.query.documents.findFirst({
      where: eq(documents.id, previousVersionId)
    });
    
    if (!currentVersion || !previousVersion) {
      throw new Error('One or both document versions not found');
    }
    
    // Compare basic fields
    const differences: string[] = [];
    
    if (currentVersion.title !== previousVersion.title) {
      differences.push(`Title changed from "${previousVersion.title}" to "${currentVersion.title}"`);
    }
    
    // Compare metadata (simplistic approach)
    const currentMeta = currentVersion.metadata as Record<string, any>;
    const previousMeta = previousVersion.metadata as Record<string, any>;
    
    // Get all unique keys from both metadata objects
    const allKeys = new Set([
      ...Object.keys(currentMeta || {}),
      ...Object.keys(previousMeta || {})
    ]);
    
    for (const key of allKeys) {
      const current = currentMeta?.[key];
      const previous = previousMeta?.[key];
      
      if (JSON.stringify(current) !== JSON.stringify(previous)) {
        differences.push(`Metadata field "${key}" changed`);
      }
    }
    
    // Compare content (simplistic approach)
    if (JSON.stringify(currentVersion.content) !== JSON.stringify(previousVersion.content)) {
      differences.push('Document content changed');
    }
    
    return {
      hasDifferences: differences.length > 0,
      currentVersion,
      previousVersion,
      differences
    };
  }
}

// Export a singleton instance
export const moduleIntegrationService = new ModuleIntegrationService();