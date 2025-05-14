/**
 * Module Document Registration Utility
 * 
 * This utility provides functions for registering documents from various modules
 * in the unified document workflow system.
 */

import { apiRequest } from '@/lib/queryClient';

/**
 * Register a document from the Medical Device module in the unified workflow system
 * 
 * @param {Object} params - Registration parameters
 * @param {string} params.originalDocumentId - Original document ID in the Medical Device module
 * @param {string} params.title - Document title
 * @param {string} params.documentType - Type of document (510k, CER, etc.)
 * @param {number} params.organizationId - Organization ID
 * @param {number} params.userId - User ID registering the document
 * @param {Object} params.metadata - Optional document metadata
 * @param {Object} params.content - Optional document content
 * @param {number} params.vaultFolderId - Optional vault folder ID
 * @returns {Promise<Object>} The registered document
 */
export const registerMedicalDeviceDocument = async ({
  originalDocumentId,
  title,
  documentType,
  organizationId,
  userId,
  metadata = {},
  content = null,
  vaultFolderId = null
}) => {
  try {
    const response = await apiRequest('/api/module-integration/register-document', {
      method: 'POST',
      data: {
        moduleType: 'med_device',
        originalDocumentId,
        title,
        documentType,
        organizationId,
        userId,
        metadata,
        content,
        vaultFolderId
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error registering medical device document:', error);
    throw error;
  }
};

/**
 * Register a document from the CMC Wizard module in the unified workflow system
 * 
 * @param {Object} params - Registration parameters
 * @param {string} params.originalDocumentId - Original document ID in the CMC Wizard module
 * @param {string} params.title - Document title
 * @param {string} params.documentType - Type of document
 * @param {number} params.organizationId - Organization ID
 * @param {number} params.userId - User ID registering the document
 * @param {Object} params.metadata - Optional document metadata
 * @param {Object} params.content - Optional document content
 * @param {number} params.vaultFolderId - Optional vault folder ID
 * @returns {Promise<Object>} The registered document
 */
export const registerCmcWizardDocument = async ({
  originalDocumentId,
  title,
  documentType,
  organizationId,
  userId,
  metadata = {},
  content = null,
  vaultFolderId = null
}) => {
  try {
    const response = await apiRequest('/api/module-integration/register-document', {
      method: 'POST',
      data: {
        moduleType: 'cmc_wizard',
        originalDocumentId,
        title,
        documentType,
        organizationId,
        userId,
        metadata,
        content,
        vaultFolderId
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error registering CMC Wizard document:', error);
    throw error;
  }
};

/**
 * Initiate a workflow for a document in the unified system
 * 
 * @param {Object} params - Workflow initiation parameters
 * @param {number} params.documentId - The document ID in the unified system
 * @param {number} params.templateId - The workflow template ID
 * @param {number} params.userId - User ID initiating the workflow
 * @param {Object} params.metadata - Optional workflow metadata
 * @returns {Promise<Object>} The created workflow with approval steps
 */
export const initiateDocumentWorkflow = async ({
  documentId,
  templateId,
  userId,
  metadata = {}
}) => {
  try {
    const response = await apiRequest(`/api/module-integration/document/${documentId}/workflow`, {
      method: 'POST',
      data: {
        templateId,
        userId,
        metadata
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error initiating document workflow:', error);
    throw error;
  }
};

/**
 * Get the active workflow for a document
 * 
 * @param {number} documentId - The document ID in the unified system
 * @returns {Promise<Object|null>} The workflow with approvals, or null if no workflow exists
 */
export const getDocumentWorkflow = async (documentId) => {
  try {
    const response = await apiRequest(`/api/module-integration/document/${documentId}/workflow`);
    return response.data;
  } catch (error) {
    console.error('Error getting document workflow:', error);
    return null;
  }
};

/**
 * Submit an approval for a workflow step
 * 
 * @param {Object} params - Approval submission parameters
 * @param {number} params.workflowId - The workflow ID
 * @param {number} params.stepIndex - The step index (0-based)
 * @param {number} params.userId - User ID approving the step
 * @param {string} params.status - Approval status ('approved' or 'rejected')
 * @param {string} params.comments - Optional comments
 * @returns {Promise<Object>} The updated workflow
 */
export const submitWorkflowApproval = async ({
  workflowId,
  stepIndex,
  userId,
  status,
  comments = ''
}) => {
  try {
    const response = await apiRequest(`/api/module-integration/workflow/${workflowId}/approval/${stepIndex}`, {
      method: 'POST',
      data: {
        userId,
        status,
        comments
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error submitting workflow approval:', error);
    throw error;
  }
};

/**
 * Get available workflow templates for a module
 * 
 * @param {string} moduleType - The module type
 * @param {number} organizationId - Organization ID
 * @returns {Promise<Array>} - List of workflow templates
 */
export const getWorkflowTemplates = async (moduleType, organizationId) => {
  try {
    const response = await apiRequest(`/api/module-integration/workflow-templates/${moduleType}?organizationId=${organizationId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting workflow templates:', error);
    return [];
  }
};