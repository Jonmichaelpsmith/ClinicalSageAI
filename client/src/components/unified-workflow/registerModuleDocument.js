/**
 * Module Document Registration Utility
 * 
 * This utility provides a clean API for registering documents from various modules
 * into the unified document workflow system.
 */

import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

/**
 * Registers a document from a module in the unified document system
 * 
 * @param {Object} documentData - Document data including module information
 * @returns {Promise<Object>} The registered document with its module reference
 */
export async function registerModuleDocument(documentData) {
  try {
    const result = await apiRequest({
      url: '/api/module-integration/documents/register',
      method: 'POST',
      data: documentData
    });
    
    // Invalidate any related queries
    const moduleType = documentData.moduleType;
    queryClient.invalidateQueries({
      queryKey: [`/api/module-integration/documents/module/${moduleType}`]
    });
    
    return result;
  } catch (error) {
    console.error('Error registering module document:', error);
    throw error;
  }
}

/**
 * Updates a document in the unified document system
 * 
 * @param {number} documentId - The document ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} The updated document
 */
export async function updateDocument(documentId, updateData) {
  try {
    const result = await apiRequest({
      url: `/api/module-integration/documents/${documentId}`,
      method: 'PATCH',
      data: updateData
    });
    
    // Invalidate specific document query
    queryClient.invalidateQueries({
      queryKey: [`/api/module-integration/documents/${documentId}`]
    });
    
    return result;
  } catch (error) {
    console.error(`Error updating document with ID ${documentId}:`, error);
    throw error;
  }
}

/**
 * Creates a workflow for a document
 * 
 * @param {number} documentId - The document ID
 * @param {number} templateId - The workflow template ID
 * @param {number} startedBy - User ID of workflow initiator
 * @param {Object} metadata - Optional workflow metadata
 * @returns {Promise<Object>} The created workflow with approvals
 */
export async function createDocumentWorkflow(documentId, templateId, startedBy, metadata = {}) {
  try {
    const result = await apiRequest({
      url: `/api/module-integration/documents/${documentId}/workflows`,
      method: 'POST',
      data: { templateId, startedBy, metadata }
    });
    
    // Invalidate document workflows query
    queryClient.invalidateQueries({
      queryKey: [`/api/module-integration/documents/${documentId}/workflows`]
    });
    
    return result;
  } catch (error) {
    console.error(`Error creating workflow for document ${documentId}:`, error);
    throw error;
  }
}

/**
 * Gets a document by its module-specific ID
 * 
 * @param {string} moduleType - The module type
 * @param {string} originalId - The original document ID in the module
 * @param {number} organizationId - The organization ID
 * @returns {Promise<Object|null>} The document with its module reference, or null if not found
 */
export async function getDocumentByModuleId(moduleType, originalId, organizationId) {
  try {
    const result = await apiRequest({
      url: `/api/module-integration/documents/module/${moduleType}/${originalId}?organizationId=${organizationId}`,
      method: 'GET'
    });
    
    return result;
  } catch (error) {
    // If 404, return null rather than throwing
    if (error.response && error.response.status === 404) {
      return null;
    }
    
    console.error(`Error retrieving module document ${moduleType}/${originalId}:`, error);
    throw error;
  }
}

/**
 * Gets all workflows for a document
 * 
 * @param {number} documentId - The document ID
 * @returns {Promise<Array>} The document's workflows
 */
export async function getDocumentWorkflows(documentId) {
  try {
    const result = await apiRequest({
      url: `/api/module-integration/documents/${documentId}/workflows`,
      method: 'GET'
    });
    
    return result;
  } catch (error) {
    console.error(`Error retrieving workflows for document ${documentId}:`, error);
    throw error;
  }
}

/**
 * Gets detailed workflow information
 * 
 * @param {number} workflowId - The workflow ID
 * @returns {Promise<Object>} The workflow with approvals and audit logs
 */
export async function getWorkflowDetails(workflowId) {
  try {
    const result = await apiRequest({
      url: `/api/module-integration/workflows/${workflowId}`,
      method: 'GET'
    });
    
    return result;
  } catch (error) {
    console.error(`Error retrieving workflow ${workflowId}:`, error);
    throw error;
  }
}

/**
 * Approves a workflow step
 * 
 * @param {number} approvalId - The approval step ID
 * @param {number} userId - User ID performing approval
 * @param {string} comments - Optional approval comments
 * @returns {Promise<Object>} The approval result
 */
export async function approveWorkflowStep(approvalId, userId, comments) {
  try {
    const result = await apiRequest({
      url: `/api/module-integration/workflows/approvals/${approvalId}/approve`,
      method: 'POST',
      data: { userId, comments }
    });
    
    // Invalidate pending approvals query
    queryClient.invalidateQueries({
      queryKey: ['/api/module-integration/workflows/pending-approvals']
    });
    
    return result;
  } catch (error) {
    console.error(`Error approving workflow step ${approvalId}:`, error);
    throw error;
  }
}

/**
 * Rejects a workflow step
 * 
 * @param {number} approvalId - The approval step ID
 * @param {number} userId - User ID performing rejection
 * @param {string} comments - Required rejection comments
 * @returns {Promise<Object>} The rejection result
 */
export async function rejectWorkflowStep(approvalId, userId, comments) {
  if (!comments) {
    throw new Error('Comments are required when rejecting a workflow step');
  }
  
  try {
    const result = await apiRequest({
      url: `/api/module-integration/workflows/approvals/${approvalId}/reject`,
      method: 'POST',
      data: { userId, comments }
    });
    
    // Invalidate pending approvals query
    queryClient.invalidateQueries({
      queryKey: ['/api/module-integration/workflows/pending-approvals']
    });
    
    return result;
  } catch (error) {
    console.error(`Error rejecting workflow step ${approvalId}:`, error);
    throw error;
  }
}

/**
 * Gets document counts by type for an organization
 * 
 * @param {number} organizationId - The organization ID
 * @returns {Promise<Object>} Map of document types to counts
 */
export async function getDocumentCountByType(organizationId) {
  try {
    const result = await apiRequest({
      url: `/api/module-integration/documents/counts/by-type?organizationId=${organizationId}`,
      method: 'GET'
    });
    
    return result;
  } catch (error) {
    console.error(`Error retrieving document counts for organization ${organizationId}:`, error);
    throw error;
  }
}

/**
 * Gets recent documents for a user
 * 
 * @param {number} userId - The user ID
 * @param {number} organizationId - The organization ID
 * @param {number} limit - Optional limit on results
 * @returns {Promise<Array>} Recent documents
 */
export async function getRecentDocumentsForUser(userId, organizationId, limit = 10) {
  try {
    const result = await apiRequest({
      url: `/api/module-integration/documents/recent?userId=${userId}&organizationId=${organizationId}&limit=${limit}`,
      method: 'GET'
    });
    
    return result;
  } catch (error) {
    console.error(`Error retrieving recent documents for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Gets documents currently in review
 * 
 * @param {number} organizationId - The organization ID
 * @returns {Promise<Array>} Documents in review
 */
export async function getDocumentsInReview(organizationId) {
  try {
    const result = await apiRequest({
      url: `/api/module-integration/documents/in-review?organizationId=${organizationId}`,
      method: 'GET'
    });
    
    return result;
  } catch (error) {
    console.error(`Error retrieving documents in review for organization ${organizationId}:`, error);
    throw error;
  }
}

/**
 * Gets pending workflow approvals for a user
 * 
 * @param {number} userId - The user ID
 * @returns {Promise<Object>} Pending workflows and approvals
 */
export async function getPendingApprovals(userId) {
  try {
    const result = await apiRequest({
      url: `/api/module-integration/workflows/pending-approvals?userId=${userId}`,
      method: 'GET'
    });
    
    return result;
  } catch (error) {
    console.error(`Error retrieving pending approvals for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Module type constants for consistent usage
 */
export const ModuleType = {
  CER: 'cer',
  CMC: 'cmc',
  MEDICAL_DEVICE: 'medical_device',
  IND: 'ind',
  ECTD: 'ectd',
  VAULT: 'vault',
  STUDY: 'study'
};

/**
 * Document type constants for consistent usage
 */
export const DocumentType = {
  REPORT_510K: '510k_report',
  CER_REPORT: 'cer_report',
  QMS_DOCUMENT: 'qms_document',
  CMC_SECTION: 'cmc_section',
  STUDY_PROTOCOL: 'study_protocol',
  REGULATORY_SUBMISSION: 'regulatory_submission',
  LITERATURE_REVIEW: 'literature_review'
};