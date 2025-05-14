/**
 * Module Integration Service
 * 
 * This service provides functionality for managing document integration between
 * different modules in the unified document workflow system.
 */

import { db } from '../db/connection';
import { sql } from 'drizzle-orm';
import { WorkflowService } from './WorkflowService';

export class ModuleIntegrationService {
  private workflowService: WorkflowService;
  
  constructor() {
    this.workflowService = new WorkflowService();
  }
  
  /**
   * Register a document from a module in the unified system
   * 
   * @param {Object} documentData Document data to register
   * @returns {Promise<Object>} The registered document with its module reference
   */
  async registerModuleDocument(documentData) {
    const {
      title,
      documentType,
      organizationId,
      createdBy,
      status,
      latestVersion,
      moduleType,
      originalId,
      metadata
    } = documentData;
    
    // Begin transaction
    return await db.transaction(async (tx) => {
      // Insert into unified documents table
      const [document] = await tx.execute(
        sql`INSERT INTO unified_documents 
          (title, document_type, organization_id, created_by, status, latest_version, created_at, updated_at)
          VALUES (${title}, ${documentType}, ${organizationId}, ${createdBy}, ${status}, ${latestVersion}, NOW(), NOW())
          RETURNING *`
      );
      
      // Insert module reference
      const [moduleRef] = await tx.execute(
        sql`INSERT INTO module_documents
          (document_id, module_type, original_id, organization_id, metadata, created_at, updated_at)
          VALUES (${document.id}, ${moduleType}, ${originalId}, ${organizationId}, ${JSON.stringify(metadata)}, NOW(), NOW())
          RETURNING *`
      );
      
      // Return combined result
      return {
        ...document,
        moduleReference: moduleRef
      };
    });
  }
  
  /**
   * Get a document by its module-specific ID
   * 
   * @param {string} moduleType Module type
   * @param {string} originalId Original document ID in the module
   * @param {number} organizationId Organization ID
   * @returns {Promise<Object>} The document or null if not found
   */
  async getDocumentByModuleId(moduleType, originalId, organizationId) {
    try {
      const [result] = await db.execute(
        sql`SELECT d.*, m.module_type, m.original_id, m.metadata
          FROM unified_documents d
          JOIN module_documents m ON d.id = m.document_id
          WHERE m.module_type = ${moduleType}
          AND m.original_id = ${originalId}
          AND d.organization_id = ${organizationId}
          LIMIT 1`
      );
      
      if (!result) {
        return null;
      }
      
      return result;
    } catch (error) {
      console.error('Error in getDocumentByModuleId:', error);
      throw error;
    }
  }
  
  /**
   * Get documents for a module
   * 
   * @param {string} moduleType Module type
   * @param {number} organizationId Organization ID
   * @returns {Promise<Array>} List of documents
   */
  async getModuleDocuments(moduleType, organizationId) {
    try {
      const results = await db.execute(
        sql`SELECT d.*, m.module_type, m.original_id, m.metadata
          FROM unified_documents d
          JOIN module_documents m ON d.id = m.document_id
          WHERE m.module_type = ${moduleType}
          AND d.organization_id = ${organizationId}
          ORDER BY d.updated_at DESC`
      );
      
      return results;
    } catch (error) {
      console.error('Error in getModuleDocuments:', error);
      throw error;
    }
  }
  
  /**
   * Get document counts by type for an organization
   * 
   * @param {number} organizationId Organization ID
   * @returns {Promise<Object>} Map of document types to counts
   */
  async getDocumentCountByType(organizationId) {
    try {
      const results = await db.execute(
        sql`SELECT m.module_type, COUNT(*) as count
          FROM module_documents m
          JOIN unified_documents d ON m.document_id = d.id
          WHERE d.organization_id = ${organizationId}
          GROUP BY m.module_type`
      );
      
      const countMap = {};
      for (const row of results) {
        countMap[row.module_type] = Number(row.count);
      }
      
      return countMap;
    } catch (error) {
      console.error('Error in getDocumentCountByType:', error);
      throw error;
    }
  }
  
  /**
   * Get documents in review
   * 
   * @param {number} organizationId Organization ID
   * @returns {Promise<Array>} Documents in review
   */
  async getDocumentsInReview(organizationId) {
    try {
      // Get all active workflows
      const activeWorkflows = await this.workflowService.getActiveWorkflowsByOrganization(organizationId);
      
      // Extract document IDs from active workflows
      const documentIds = new Set(activeWorkflows.map(w => w.document_id));
      
      if (documentIds.size === 0) {
        return [];
      }
      
      // Get documents in review
      const documentIdsArray = Array.from(documentIds);
      const placeholders = documentIdsArray.map((_, i) => `$${i + 1}`).join(', ');
      
      const documents = await db.execute(
        sql`SELECT d.*, m.module_type, m.original_id, m.metadata
          FROM unified_documents d
          JOIN module_documents m ON d.id = m.document_id
          WHERE d.id IN (${placeholders})
          AND d.organization_id = ${organizationId}
          ORDER BY d.updated_at DESC`,
        documentIdsArray
      );
      
      // Attach workflow information to each document
      for (const doc of documents) {
        doc.workflows = activeWorkflows.filter(w => w.document_id === doc.id);
      }
      
      return documents;
    } catch (error) {
      console.error('Error in getDocumentsInReview:', error);
      throw error;
    }
  }
  
  /**
   * Compare document versions
   * 
   * @param {number} currentVersionId Current document version ID
   * @param {number} previousVersionId Previous document version ID
   * @returns {Promise<Object>} Comparison result
   */
  async compareDocumentVersions(currentVersionId, previousVersionId) {
    try {
      // Get the versions
      const [currentVersion] = await db.execute(
        sql`SELECT * FROM document_versions WHERE id = ${currentVersionId} LIMIT 1`
      );
      
      const [previousVersion] = await db.execute(
        sql`SELECT * FROM document_versions WHERE id = ${previousVersionId} LIMIT 1`
      );
      
      if (!currentVersion || !previousVersion) {
        throw new Error('One or both versions not found');
      }
      
      // Simple comparison method - in a real implementation, this would use
      // a diff algorithm or specialized document comparison logic
      const comparison = {
        documentId: currentVersion.document_id,
        currentVersionId,
        previousVersionId,
        currentVersionNumber: currentVersion.version_number,
        previousVersionNumber: previousVersion.version_number,
        createdAt: currentVersion.created_at,
        createdBy: currentVersion.created_by,
        changes: []
      };
      
      // Add mock comparison for demo - would be replaced with actual diff
      if (currentVersion.content && previousVersion.content) {
        // In a real implementation, this would be a more sophisticated diff
        const currentContent = JSON.parse(currentVersion.content);
        const previousContent = JSON.parse(previousVersion.content);
        
        // Find changed fields
        for (const key in currentContent) {
          if (JSON.stringify(currentContent[key]) !== JSON.stringify(previousContent[key])) {
            comparison.changes.push({
              field: key,
              previous: previousContent[key],
              current: currentContent[key]
            });
          }
        }
        
        // Find added fields
        for (const key in currentContent) {
          if (!(key in previousContent)) {
            comparison.changes.push({
              field: key,
              action: 'added',
              value: currentContent[key]
            });
          }
        }
        
        // Find removed fields
        for (const key in previousContent) {
          if (!(key in currentContent)) {
            comparison.changes.push({
              field: key,
              action: 'removed',
              value: previousContent[key]
            });
          }
        }
      }
      
      return comparison;
    } catch (error) {
      console.error('Error in compareDocumentVersions:', error);
      throw error;
    }
  }
}