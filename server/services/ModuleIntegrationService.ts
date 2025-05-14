/**
 * Module Integration Service
 * 
 * This service handles the integration of documents from different modules
 * into the unified document workflow system.
 */

import { eq, and } from 'drizzle-orm';
import { SQL } from 'drizzle-orm';
import { db } from '../db/connection';
import { 
  unifiedDocuments,
  documentWorkflows,
  workflowTemplates,
  workflowApprovals,
  workflowAuditLog,
  moduleTypeEnum,
  InsertUnifiedDocument,
  UnifiedDocument
} from '../../shared/schema/unified_workflow';
import { WorkflowService } from './WorkflowService';

export class ModuleIntegrationService {
  private workflowService: WorkflowService;
  
  constructor() {
    this.workflowService = new WorkflowService();
  }
  
  /**
   * Register a document from a module in the unified system
   * 
   * @param moduleType - Type of module (med_device, cmc_wizard, etc.)
   * @param originalDocumentId - Original document ID in the source module
   * @param title - Document title
   * @param documentType - Type of document (510k, CER, etc.)
   * @param organizationId - Organization ID
   * @param userId - User ID registering the document
   * @param metadata - Optional document metadata
   * @param content - Optional document content
   * @param vaultFolderId - Optional vault folder ID
   * @returns The registered document record
   */
  async registerModuleDocument(
    moduleType: string,
    originalDocumentId: string,
    title: string,
    documentType: string,
    organizationId: number,
    userId: number,
    metadata: any = {},
    content: any = null,
    vaultFolderId: number = null
  ): Promise<UnifiedDocument> {
    // Validate module type
    if (!Object.values(moduleTypeEnum.enum).includes(moduleType as any)) {
      throw new Error(`Invalid module type: ${moduleType}`);
    }
    
    try {
      // Check if document already exists for this module + original ID + org
      const existingDoc = await db.select()
        .from(unifiedDocuments)
        .where(
          and(
            eq(unifiedDocuments.moduleType, moduleType),
            eq(unifiedDocuments.originalDocumentId, originalDocumentId),
            eq(unifiedDocuments.organizationId, organizationId),
            eq(unifiedDocuments.isDeleted, false)
          )
        )
        .limit(1);
      
      if (existingDoc.length > 0) {
        // Document already exists, update it
        const [updated] = await db.update(unifiedDocuments)
          .set({
            title,
            documentType,
            metadata,
            content,
            vaultFolderId,
            updatedAt: new Date(),
            updatedBy: userId
          })
          .where(eq(unifiedDocuments.id, existingDoc[0].id))
          .returning();
        
        return updated;
      }
      
      // Insert new document
      const [document] = await db.insert(unifiedDocuments)
        .values({
          moduleType,
          originalDocumentId,
          title,
          documentType,
          metadata,
          content,
          vaultFolderId,
          organizationId,
          createdBy: userId,
          updatedBy: userId
        })
        .returning();
      
      return document;
    } catch (error) {
      console.error('Error registering module document:', error);
      throw new Error(`Failed to register document: ${error.message}`);
    }
  }
  
  /**
   * Get a document by its module ID
   * 
   * @param moduleType - Type of module (med_device, cmc_wizard, etc.)
   * @param originalDocumentId - Original document ID in the source module
   * @param organizationId - Organization ID
   * @returns The document record or null if not found
   */
  async getDocumentByModuleId(
    moduleType: string,
    originalDocumentId: string,
    organizationId: number
  ): Promise<UnifiedDocument> {
    try {
      // Validate module type
      if (!Object.values(moduleTypeEnum.enum).includes(moduleType as any)) {
        throw new Error(`Invalid module type: ${moduleType}`);
      }
      
      const documents = await db.select()
        .from(unifiedDocuments)
        .where(
          and(
            eq(unifiedDocuments.moduleType, moduleType),
            eq(unifiedDocuments.originalDocumentId, originalDocumentId),
            eq(unifiedDocuments.organizationId, organizationId),
            eq(unifiedDocuments.isDeleted, false)
          )
        )
        .limit(1);
      
      if (documents.length === 0) {
        throw new Error(`Document not found for ${moduleType}:${originalDocumentId}`);
      }
      
      return documents[0];
    } catch (error) {
      console.error('Error getting document by module ID:', error);
      throw new Error(`Failed to get document: ${error.message}`);
    }
  }
  
  /**
   * Update a document's details
   * 
   * @param documentId - The document ID
   * @param updates - Updates to apply
   * @param userId - User ID making the update
   * @returns Updated document
   */
  async updateDocument(
    documentId: number,
    updates: Partial<UnifiedDocument>,
    userId: number
  ): Promise<UnifiedDocument> {
    try {
      // Get current document to ensure it exists
      const documents = await db.select()
        .from(unifiedDocuments)
        .where(eq(unifiedDocuments.id, documentId))
        .limit(1);
      
      if (documents.length === 0) {
        throw new Error(`Document not found with ID: ${documentId}`);
      }
      
      // Prepare update fields, ensure certain fields can't be changed
      const updateFields = {
        ...updates,
        updatedAt: new Date(),
        updatedBy: userId
      };
      
      // Remove fields that shouldn't be updateable
      delete updateFields.id;
      delete updateFields.moduleType;
      delete updateFields.originalDocumentId;
      delete updateFields.organizationId;
      delete updateFields.createdAt;
      delete updateFields.createdBy;
      
      // Update the document
      const [updated] = await db.update(unifiedDocuments)
        .set(updateFields)
        .where(eq(unifiedDocuments.id, documentId))
        .returning();
      
      return updated;
    } catch (error) {
      console.error('Error updating document:', error);
      throw new Error(`Failed to update document: ${error.message}`);
    }
  }
  
  /**
   * Get workflow templates for a module type
   * 
   * @param moduleType - Type of module (med_device, cmc_wizard, etc.)
   * @param organizationId - Organization ID
   * @returns Array of workflow templates
   */
  async getWorkflowTemplatesForModule(
    moduleType: string,
    organizationId: number
  ): Promise<any[]> {
    try {
      // Validate module type
      if (!Object.values(moduleTypeEnum.enum).includes(moduleType as any)) {
        throw new Error(`Invalid module type: ${moduleType}`);
      }
      
      const templates = await db.select()
        .from(workflowTemplates)
        .where(
          and(
            eq(workflowTemplates.moduleType, moduleType),
            eq(workflowTemplates.organizationId, organizationId),
            eq(workflowTemplates.isActive, true)
          )
        )
        .orderBy(workflowTemplates.name);
      
      return templates;
    } catch (error) {
      console.error('Error getting workflow templates:', error);
      throw new Error(`Failed to get workflow templates: ${error.message}`);
    }
  }
  
  /**
   * Get the workflow for a document
   * 
   * @param documentId - The document ID
   * @returns Workflow details with approvals, or null if no workflow exists
   */
  async getDocumentWorkflow(documentId: number) {
    try {
      const workflows = await db.select()
        .from(documentWorkflows)
        .where(eq(documentWorkflows.documentId, documentId))
        .orderBy(documentWorkflows.createdAt, 'desc')
        .limit(1);
      
      if (workflows.length === 0) {
        return null;
      }
      
      const workflowId = workflows[0].id;
      
      // Get workflow with approvals
      const workflowWithApprovals = await this.workflowService.getWorkflowWithApprovals(workflowId);
      
      return workflowWithApprovals;
    } catch (error) {
      console.error('Error getting document workflow:', error);
      throw new Error(`Failed to get document workflow: ${error.message}`);
    }
  }
  
  /**
   * Initiate a workflow for a document
   * 
   * @param documentId - The document ID
   * @param templateId - The workflow template ID
   * @param userId - User ID initiating the workflow
   * @param metadata - Optional workflow metadata
   * @returns Created workflow with approvals
   */
  async initiateWorkflow(
    documentId: number,
    templateId: number,
    userId: number,
    metadata: any = {}
  ) {
    try {
      // Check if document exists
      const documents = await db.select()
        .from(unifiedDocuments)
        .where(
          and(
            eq(unifiedDocuments.id, documentId),
            eq(unifiedDocuments.isDeleted, false)
          )
        )
        .limit(1);
      
      if (documents.length === 0) {
        throw new Error(`Document not found with ID: ${documentId}`);
      }
      
      // Check if workflow already exists and is active
      const existingWorkflows = await db.select()
        .from(documentWorkflows)
        .where(
          and(
            eq(documentWorkflows.documentId, documentId),
            eq(documentWorkflows.status, 'pending')
          )
        )
        .limit(1);
      
      if (existingWorkflows.length > 0) {
        throw new Error('A workflow is already in progress for this document');
      }
      
      // Use the workflow service to create the workflow
      const workflow = await this.workflowService.createWorkflow(
        documentId,
        templateId,
        userId,
        metadata
      );
      
      // Get the full workflow with approvals
      const workflowWithApprovals = await this.workflowService.getWorkflowWithApprovals(workflow.id);
      
      return workflowWithApprovals;
    } catch (error) {
      console.error('Error initiating workflow:', error);
      throw new Error(`Failed to initiate workflow: ${error.message}`);
    }
  }
}