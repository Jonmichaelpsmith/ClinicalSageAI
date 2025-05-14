/**
 * Module Document Registration Helper
 * 
 * This module provides a simple helper function to register documents from
 * different modules with the unified document workflow system.
 */

import { apiRequest } from '@/lib/queryClient';

/**
 * Register a document with the unified workflow system
 * 
 * @param {string} moduleType - The type of module (med_device, cmc_wizard, etc.)
 * @param {string} originalDocumentId - The document ID in the original module
 * @param {string} title - Document title
 * @param {string} documentType - Type of document (510k, CER, etc.)
 * @param {Object} metadata - Optional document metadata
 * @param {Object} content - Optional document content
 * @param {number} vaultFolderId - Optional vault folder ID
 * @returns {Promise<Object>} The registered document
 */
export async function registerModuleDocument(
  moduleType,
  originalDocumentId,
  title,
  documentType,
  metadata = {},
  content = null,
  vaultFolderId = null
) {
  try {
    const response = await apiRequest({
      url: `/api/integration/modules/${moduleType}/documents`,
      method: 'POST',
      data: {
        originalDocumentId,
        title,
        documentType,
        metadata,
        content,
        vaultFolderId
      }
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to register document');
    }

    return response.document;
  } catch (error) {
    console.error('Error registering document with unified workflow:', error);
    throw error;
  }
}

/**
 * Get document workflow status
 * 
 * @param {string} moduleType - The type of module
 * @param {string} originalDocumentId - The document ID in the original module
 * @returns {Promise<Object>} Workflow status
 */
export async function getDocumentWorkflow(moduleType, originalDocumentId) {
  try {
    const response = await apiRequest({
      url: `/api/integration/modules/${moduleType}/documents/${originalDocumentId}/workflow`,
      method: 'GET'
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to get document workflow');
    }

    return {
      document: response.document,
      workflow: response.workflow
    };
  } catch (error) {
    console.error('Error getting document workflow:', error);
    // Return null for workflow if not found (document might not be in workflow yet)
    if (error.response?.status === 404) {
      return { document: null, workflow: null };
    }
    throw error;
  }
}

/**
 * Initiate a workflow for a document
 * 
 * @param {string} moduleType - The type of module
 * @param {string} originalDocumentId - The document ID in the original module
 * @param {number} templateId - The workflow template ID
 * @param {Object} metadata - Optional workflow metadata
 * @returns {Promise<Object>} The initiated workflow
 */
export async function initiateDocumentWorkflow(
  moduleType,
  originalDocumentId,
  templateId,
  metadata = {}
) {
  try {
    const response = await apiRequest({
      url: `/api/integration/modules/${moduleType}/documents/${originalDocumentId}/workflow`,
      method: 'POST',
      data: {
        templateId,
        metadata
      }
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to initiate workflow');
    }

    return response.workflow;
  } catch (error) {
    console.error('Error initiating document workflow:', error);
    throw error;
  }
}

/**
 * Get available workflow templates for a module
 * 
 * @param {string} moduleType - The type of module
 * @returns {Promise<Array>} Available workflow templates
 */
export async function getWorkflowTemplates(moduleType) {
  try {
    const response = await apiRequest({
      url: `/api/integration/modules/${moduleType}/templates`,
      method: 'GET'
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to get workflow templates');
    }

    return response.templates;
  } catch (error) {
    console.error('Error getting workflow templates:', error);
    throw error;
  }
}

/**
 * Submit an approval for a workflow step
 * 
 * @param {number} workflowId - The workflow ID
 * @param {number} stepIndex - The step index
 * @param {string} status - Approval status (approved or rejected)
 * @param {string} comments - Optional comments
 * @returns {Promise<Object>} Updated workflow
 */
export async function submitWorkflowApproval(
  workflowId,
  stepIndex,
  status,
  comments = ''
) {
  try {
    const response = await apiRequest({
      url: `/api/integration/workflows/${workflowId}/approve`,
      method: 'POST',
      data: {
        stepIndex,
        status,
        comments
      }
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to submit approval');
    }

    return response.workflow;
  } catch (error) {
    console.error('Error submitting workflow approval:', error);
    throw error;
  }
}