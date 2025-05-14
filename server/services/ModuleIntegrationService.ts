/**
 * Module Integration Service
 * 
 * This service provides integration capabilities between different modules
 * and the unified document workflow system. It handles:
 * - Document registration from modules to the unified system
 * - Document retrieval with module-specific transformations
 * - Workflow management across modules
 */

import { db } from '../db/connection';
import { 
  documents, 
  insertDocumentSchema,
  documentFolders
} from '../../shared/schema';
import {
  moduleDocuments,
  insertModuleDocumentSchema,
  workflowTemplates
} from '../../shared/schema/unified_workflow';
import { WorkflowService } from './WorkflowService';
import { eq, and, isNull, asc, desc } from 'drizzle-orm';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Module document registration parameters
export const moduleDocumentRegistrationSchema = z.object({
  documentId: z.string(),         // Original document ID in the module
  moduleType: z.enum(['cmc_wizard', 'ectd_coauthor', 'med_device', 'study_architect']),
  title: z.string(),
  organizationId: z.number(),
  clientWorkspaceId: z.number().optional(),
  documentType: z.string(),       // Type of document within the module
  content: z.any().optional(),    // Optional document content
  metadata: z.any().optional(),   // Module-specific metadata
  folderId: z.number().optional(),// Optional target folder in Vault
  initiateWorkflow: z.boolean().optional().default(false), // Whether to start a default workflow
  workflowTemplateId: z.string().optional(), // Optional specific workflow template
});

export type ModuleDocumentRegistration = z.infer<typeof moduleDocumentRegistrationSchema>;

export class ModuleIntegrationService {
  private workflowService: WorkflowService;

  constructor() {
    this.workflowService = new WorkflowService();
  }

  /**
   * Register a document from a module in the unified system
   */
  async registerModuleDocument(registration: ModuleDocumentRegistration, userId: number): Promise<{ documentId: number, workflowId?: string }> {
    try {
      // Validate registration parameters
      const validatedRegistration = moduleDocumentRegistrationSchema.parse(registration);
      
      // 1. Create a document in the unified system
      const documentData = {
        organizationId: validatedRegistration.organizationId,
        name: validatedRegistration.title,
        type: validatedRegistration.documentType,
        status: 'draft',
        folderId: validatedRegistration.folderId || 
                 await this.getDefaultModuleFolder(validatedRegistration.moduleType, validatedRegistration.organizationId),
        content: validatedRegistration.content || {},
        metadata: validatedRegistration.metadata || {},
        createdById: userId,
        clientWorkspaceId: validatedRegistration.clientWorkspaceId,
      };
      
      // Insert document
      const insertDocumentResult = await db.insert(documents)
        .values(documentData)
        .returning();
      
      if (insertDocumentResult.length === 0) {
        throw new Error('Failed to create document in unified system');
      }
      
      const document = insertDocumentResult[0];
      
      // 2. Create module document link
      const moduleDocData = {
        documentId: document.id,
        moduleType: validatedRegistration.moduleType,
        moduleDocumentId: validatedRegistration.documentId,
        metadata: validatedRegistration.metadata || {}
      };
      
      await db.insert(moduleDocuments)
        .values(moduleDocData);
      
      // 3. Optionally start a workflow
      let workflowId: string | undefined;
      
      if (validatedRegistration.initiateWorkflow) {
        const templateId = validatedRegistration.workflowTemplateId || 
                         await this.getDefaultWorkflowTemplate(validatedRegistration.moduleType);
        
        if (templateId) {
          workflowId = await this.workflowService.initiateWorkflow({
            documentId: document.id,
            workflowTemplateId: templateId,
            initiatedBy: userId
          });
        }
      }
      
      return {
        documentId: document.id,
        workflowId
      };
    } catch (error) {
      console.error(`Error registering module document: ${error.message}`);
      throw new Error(`Failed to register module document: ${error.message}`);
    }
  }
  
  /**
   * Get a unified document by its module document ID
   */
  async getDocumentByModuleId(moduleType: string, moduleDocumentId: string): Promise<any> {
    try {
      // Find the module document link
      const moduleDoc = await db.select()
        .from(moduleDocuments)
        .where(
          and(
            eq(moduleDocuments.moduleType, moduleType),
            eq(moduleDocuments.moduleDocumentId, moduleDocumentId)
          )
        )
        .limit(1);
        
      if (moduleDoc.length === 0) {
        throw new Error(`Document not found for module ${moduleType} with ID ${moduleDocumentId}`);
      }
      
      // Get the unified document
      const doc = await db.select()
        .from(documents)
        .where(eq(documents.id, moduleDoc[0].documentId))
        .limit(1);
        
      if (doc.length === 0) {
        throw new Error(`Document not found with ID ${moduleDoc[0].documentId}`);
      }
      
      return {
        ...doc[0],
        moduleMetadata: moduleDoc[0].metadata
      };
    } catch (error) {
      console.error(`Error retrieving document by module ID: ${error.message}`);
      throw new Error(`Failed to retrieve document by module ID: ${error.message}`);
    }
  }
  
  /**
   * Update a document's content or metadata from its source module
   */
  async updateDocumentFromModule(
    moduleType: string, 
    moduleDocumentId: string, 
    updates: { content?: any, metadata?: any, status?: string },
    userId: number
  ): Promise<number> {
    try {
      // Find the module document link
      const moduleDoc = await db.select()
        .from(moduleDocuments)
        .where(
          and(
            eq(moduleDocuments.moduleType, moduleType),
            eq(moduleDocuments.moduleDocumentId, moduleDocumentId)
          )
        )
        .limit(1);
        
      if (moduleDoc.length === 0) {
        throw new Error(`Document not found for module ${moduleType} with ID ${moduleDocumentId}`);
      }
      
      const documentId = moduleDoc[0].documentId;
      
      // Update the document
      const updateData: any = {};
      
      if (updates.content) {
        updateData.content = updates.content;
      }
      
      if (updates.status) {
        updateData.status = updates.status;
      }
      
      updateData.updatedAt = new Date();
      
      // Update the document
      if (Object.keys(updateData).length > 0) {
        await db.update(documents)
          .set(updateData)
          .where(eq(documents.id, documentId));
      }
      
      // Update the module document metadata if provided
      if (updates.metadata) {
        await db.update(moduleDocuments)
          .set({ 
            metadata: updates.metadata,
            updatedAt: new Date()
          })
          .where(
            and(
              eq(moduleDocuments.moduleType, moduleType),
              eq(moduleDocuments.moduleDocumentId, moduleDocumentId)
            )
          );
      }
      
      return documentId;
    } catch (error) {
      console.error(`Error updating document from module: ${error.message}`);
      throw new Error(`Failed to update document from module: ${error.message}`);
    }
  }
  
  /**
   * Get the default folder for a module
   */
  private async getDefaultModuleFolder(moduleType: string, organizationId: number): Promise<number> {
    try {
      // Locate or create module folder
      const folderName = this.getModuleFolderName(moduleType);
      
      // Check if folder exists
      const existingFolder = await db.select()
        .from(documentFolders)
        .where(
          and(
            eq(documentFolders.name, folderName),
            eq(documentFolders.organizationId, organizationId),
            isNull(documentFolders.parentId)
          )
        )
        .limit(1);
        
      if (existingFolder.length > 0) {
        return existingFolder[0].id;
      }
      
      // Create folder
      const result = await db.insert(documentFolders)
        .values({
          name: folderName,
          organizationId,
          description: `Documents from ${folderName}`,
          path: `/${folderName}`
        })
        .returning();
        
      return result[0].id;
    } catch (error) {
      console.error(`Error getting default module folder: ${error.message}`);
      // Return null and let the caller handle it (document will be created without a folder)
      throw new Error(`Failed to get default module folder: ${error.message}`);
    }
  }
  
  /**
   * Get default workflow template for a module
   */
  private async getDefaultWorkflowTemplate(moduleType: string): Promise<string | null> {
    try {
      const result = await db.select()
        .from(workflowTemplates)
        .where(
          and(
            eq(workflowTemplates.moduleType, moduleType),
            eq(workflowTemplates.isActive, true)
          )
        )
        .orderBy(desc(workflowTemplates.updatedAt))
        .limit(1);
        
      return result.length > 0 ? result[0].id : null;
    } catch (error) {
      console.error(`Error getting default workflow template: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Get folder name for a module
   */
  private getModuleFolderName(moduleType: string): string {
    switch (moduleType) {
      case 'cmc_wizard':
        return 'CMC Wizard';
      case 'ectd_coauthor':
        return 'eCTD Co-author';
      case 'med_device':
        return 'Medical Device and Diagnostics';
      case 'study_architect':
        return 'Study Architect';
      default:
        return moduleType;
    }
  }
}