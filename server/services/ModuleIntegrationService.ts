/**
 * Module Integration Service
 * 
 * This service manages the integration between different modules
 * and provides a unified document management and workflow system.
 */

import { eq, and } from 'drizzle-orm';
import { db } from '../db/connection';
import {
  documents,
  moduleDocuments,
  workflowTemplates,
  Document,
  ModuleDocument,
  WorkflowTemplate,
} from '../../shared/schema/unified_workflow';
import { WorkflowService } from './WorkflowService';

// Supported module types
const MODULE_TYPES = ['med_device', 'cmc_wizard', 'ectd_coauthor', 'study_architect', 'vault'];

/**
 * Service for managing cross-module document integration
 */
export class ModuleIntegrationService {
  private workflowService: WorkflowService;

  constructor() {
    this.workflowService = new WorkflowService();
  }

  /**
   * Get supported module types
   */
  async getModuleTypes(): Promise<string[]> {
    return MODULE_TYPES;
  }

  /**
   * Register a document from a module in the unified system
   * 
   * @param moduleType - The module type (med_device, cmc_wizard, etc.)
   * @param originalDocumentId - The original document ID in the source module
   * @param title - Document title
   * @param documentType - Type of document (510k, CER, etc.)
   * @param organizationId - Organization ID
   * @param userId - User ID registering the document
   * @param metadata - Optional document metadata
   * @param content - Optional document content
   * @param vaultFolderId - Optional vault folder ID
   * @returns Registered document
   */
  async registerDocument(
    moduleType: string,
    originalDocumentId: string,
    title: string,
    documentType: string,
    organizationId: number,
    userId: number,
    metadata: Record<string, any> = {},
    content: any = null,
    vaultFolderId: number | null = null
  ): Promise<Document & { moduleDocument: ModuleDocument }> {
    try {
      // Check if the document already exists
      const existingDoc = await this.getDocumentByModuleId(moduleType, originalDocumentId, organizationId);
      
      if (existingDoc) {
        return existingDoc;
      }
      
      // Begin transaction
      const result = await db.transaction(async (tx) => {
        // Insert document
        const [document] = await tx
          .insert(documents)
          .values({
            title,
            documentType,
            organizationId,
            createdBy: userId,
            vaultFolderId,
            metadata,
            content,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
        
        // Insert module document
        const [moduleDocument] = await tx
          .insert(moduleDocuments)
          .values({
            documentId: document.id,
            moduleType,
            originalDocumentId,
            organizationId,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
        
        return { ...document, moduleDocument };
      });
      
      return result;
    } catch (error) {
      console.error('Error registering document:', error);
      throw new Error('Failed to register document');
    }
  }

  /**
   * Get a document by its module type and original ID
   * 
   * @param moduleType - The module type
   * @param originalId - Original document ID in the source module
   * @param organizationId - Organization ID
   * @returns Document with its module details
   */
  async getDocumentByModuleId(
    moduleType: string,
    originalId: string,
    organizationId: number
  ): Promise<(Document & { moduleDocument: ModuleDocument }) | null> {
    try {
      // Find module document
      const moduleDoc = await db.query.moduleDocuments.findFirst({
        where: and(
          eq(moduleDocuments.moduleType, moduleType),
          eq(moduleDocuments.originalDocumentId, originalId),
          eq(moduleDocuments.organizationId, organizationId)
        ),
      });
      
      if (!moduleDoc) {
        return null;
      }
      
      // Get the related document
      const document = await db.query.documents.findFirst({
        where: eq(documents.id, moduleDoc.documentId),
      });
      
      if (!document) {
        return null;
      }
      
      return { ...document, moduleDocument: moduleDoc };
    } catch (error) {
      console.error('Error finding document by module ID:', error);
      throw new Error('Failed to find document by module ID');
    }
  }

  /**
   * Get a document by its internal ID
   * 
   * @param id - Document ID
   * @returns Document with its module details
   */
  async getDocumentById(id: number): Promise<(Document & { moduleDocument: ModuleDocument }) | null> {
    try {
      // Find document
      const document = await db.query.documents.findFirst({
        where: eq(documents.id, id),
      });
      
      if (!document) {
        return null;
      }
      
      // Get the related module document
      const moduleDoc = await db.query.moduleDocuments.findFirst({
        where: eq(moduleDocuments.documentId, id),
      });
      
      if (!moduleDoc) {
        return null;
      }
      
      return { ...document, moduleDocument: moduleDoc };
    } catch (error) {
      console.error('Error finding document by ID:', error);
      throw new Error('Failed to find document by ID');
    }
  }

  /**
   * Update a document
   * 
   * @param id - Document ID
   * @param data - The data to update
   * @returns The updated document
   */
  async updateDocument(id: number, data: Partial<Document>): Promise<Document | null> {
    try {
      // Ensure we don't update ID or timestamps
      const { id: _, createdAt, updatedAt, ...updateData } = data as any;
      
      // Update the document
      const [updated] = await db
        .update(documents)
        .set({ 
          ...updateData,
          updatedAt: new Date() 
        })
        .where(eq(documents.id, id))
        .returning();
      
      return updated || null;
    } catch (error) {
      console.error('Error updating document:', error);
      throw new Error('Failed to update document');
    }
  }

  /**
   * Get workflow templates for a module type
   * 
   * @param moduleType - The module type
   * @param organizationId - Organization ID
   * @returns List of workflow templates
   */
  async getWorkflowTemplates(
    moduleType: string,
    organizationId: number
  ): Promise<WorkflowTemplate[]> {
    try {
      // Get templates for the module and organization
      const templates = await db.query.workflowTemplates.findMany({
        where: and(
          eq(workflowTemplates.moduleType, moduleType),
          eq(workflowTemplates.organizationId, organizationId),
          eq(workflowTemplates.isActive, true)
        ),
        orderBy: (templates, { desc }) => [desc(templates.createdAt)],
      });
      
      return templates;
    } catch (error) {
      console.error('Error getting workflow templates:', error);
      throw new Error('Failed to get workflow templates');
    }
  }

  /**
   * Initiate a workflow for a document
   * 
   * @param documentId - Document ID
   * @param templateId - Workflow template ID
   * @param userId - User ID initiating the workflow
   * @param metadata - Optional workflow metadata
   * @returns The created workflow with steps
   */
  async initiateWorkflow(
    documentId: number,
    templateId: number,
    userId: number,
    metadata: Record<string, any> = {}
  ) {
    try {
      // Check if document exists
      const document = await this.getDocumentById(documentId);
      
      if (!document) {
        throw new Error('Document not found');
      }
      
      // Create the workflow
      const workflow = await this.workflowService.createWorkflow(
        documentId,
        templateId,
        userId,
        metadata
      );
      
      return workflow;
    } catch (error) {
      console.error('Error initiating workflow:', error);
      throw new Error('Failed to initiate workflow');
    }
  }

  /**
   * Submit an approval for a workflow step
   * 
   * @param workflowId - Workflow ID
   * @param stepIndex - Step index
   * @param userId - User ID submitting the approval
   * @param status - Approval status (approved, rejected)
   * @param comments - Optional comments
   * @returns The updated workflow
   */
  async submitApproval(
    workflowId: number,
    stepIndex: number,
    userId: number,
    status: 'approved' | 'rejected',
    comments: string = ''
  ) {
    try {
      // Submit the approval
      const workflow = await this.workflowService.submitApproval(
        workflowId,
        stepIndex,
        userId,
        status,
        comments
      );
      
      return workflow;
    } catch (error) {
      console.error('Error submitting approval:', error);
      throw new Error('Failed to submit approval');
    }
  }

  /**
   * Assign a user to an approval step
   * 
   * @param workflowId - Workflow ID
   * @param stepIndex - Step index
   * @param userId - User ID to assign
   * @param assignedById - User ID making the assignment
   * @returns The updated workflow
   */
  async assignUserToApproval(
    workflowId: number,
    stepIndex: number,
    userId: number,
    assignedById: number
  ) {
    try {
      // Get the workflow with approvals
      const workflow = await this.workflowService.getWorkflowWithApprovals(workflowId);
      
      if (!workflow) {
        throw new Error('Workflow not found');
      }
      
      if (!workflow.approvals || workflow.approvals.length <= stepIndex) {
        throw new Error('Invalid step index');
      }
      
      // Get the approval ID
      const approvalId = workflow.approvals[stepIndex].id;
      
      // Assign the user
      const updatedApproval = await this.workflowService.assignUserToApproval(
        approvalId,
        userId,
        assignedById
      );
      
      // Get the updated workflow
      const updatedWorkflow = await this.workflowService.getWorkflowWithApprovals(workflowId);
      
      return updatedWorkflow;
    } catch (error) {
      console.error('Error assigning user to approval:', error);
      throw new Error('Failed to assign user to approval');
    }
  }

  /**
   * Get a document's active workflow
   * 
   * @param documentId - Document ID
   * @returns The document's active workflow with approvals and audit log
   */
  async getDocumentWorkflow(documentId: number) {
    try {
      // Find active workflows for the document
      const workflows = await this.workflowService.getWorkflowsForDocument(documentId);
      
      // Filter for active workflows (not completed or rejected)
      const activeWorkflows = workflows.filter(
        w => w.status !== 'completed' && w.status !== 'rejected'
      );
      
      if (activeWorkflows.length === 0) {
        return null;
      }
      
      // Get the most recent active workflow
      const latestWorkflow = activeWorkflows.reduce((latest, current) => {
        if (!latest) return current;
        return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest;
      }, null);
      
      if (!latestWorkflow) {
        return null;
      }
      
      // Get full workflow details with approvals and audit log
      return this.workflowService.getWorkflowWithApprovals(latestWorkflow.id);
    } catch (error) {
      console.error('Error getting document workflow:', error);
      throw new Error('Failed to get document workflow');
    }
  }

  /**
   * Get all workflows for a document
   * 
   * @param documentId - Document ID
   * @returns List of workflows for the document
   */
  async getDocumentWorkflows(documentId: number) {
    try {
      return this.workflowService.getWorkflowsForDocument(documentId);
    } catch (error) {
      console.error('Error getting document workflows:', error);
      throw new Error('Failed to get document workflows');
    }
  }
}