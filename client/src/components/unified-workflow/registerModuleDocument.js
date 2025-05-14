/**
 * Module Document Registration Utility
 * 
 * This utility provides functions to register documents from different modules
 * with the unified workflow system.
 */

import { apiRequest } from '@/lib/queryClient';

/**
 * Register a document from any module to the unified workflow system
 * 
 * @param {Object} params - Registration parameters
 * @param {string} params.documentId - Original document ID in the module
 * @param {string} params.moduleType - Type of module (cmc_wizard, ectd_coauthor, med_device, study_architect)
 * @param {string} params.title - Document title
 * @param {string} params.documentType - Type of document within the module
 * @param {Object} [params.content] - Optional document content
 * @param {Object} [params.metadata] - Optional module-specific metadata
 * @param {number} [params.folderId] - Optional target folder in Vault
 * @param {boolean} [params.initiateWorkflow] - Whether to start a default workflow
 * @param {string} [params.workflowTemplateId] - Optional specific workflow template
 * @returns {Promise<Object>} - Response with unified document ID and workflow ID
 */
export async function registerModuleDocument(params) {
  try {
    const response = await apiRequest(
      `/api/integration/modules/${params.moduleType}/documents`,
      {
        method: 'POST',
        body: JSON.stringify(params)
      }
    );
    
    return response;
  } catch (error) {
    console.error('Error registering module document:', error);
    throw error;
  }
}

/**
 * Register a 510(k) document with the unified workflow system
 * 
 * @param {Object} params - 510(k) registration parameters
 * @param {string} params.documentId - Original 510(k) document ID
 * @param {string} params.title - 510(k) document title
 * @param {string} params.documentType - 510(k) document type (submission, review, etc.)
 * @param {Object} [params.content] - Optional document content
 * @param {Object} [params.metadata] - Optional metadata (device details, predicates, etc.)
 * @param {number} [params.folderId] - Optional target folder in Vault
 * @param {boolean} [params.initiateWorkflow] - Whether to start a default workflow
 * @param {string} [params.workflowTemplateId] - Optional specific workflow template
 * @returns {Promise<Object>} - Response with unified document ID and workflow ID
 */
export async function register510kDocument(params) {
  return registerModuleDocument({
    ...params,
    moduleType: 'med_device'
  });
}

/**
 * Register a CER document with the unified workflow system
 * 
 * @param {Object} params - CER registration parameters
 * @param {string} params.documentId - Original CER document ID
 * @param {string} params.title - CER document title
 * @param {string} params.documentType - CER document type
 * @param {Object} [params.content] - Optional document content
 * @param {Object} [params.metadata] - Optional metadata (device details, etc.)
 * @param {number} [params.folderId] - Optional target folder in Vault
 * @param {boolean} [params.initiateWorkflow] - Whether to start a default workflow
 * @param {string} [params.workflowTemplateId] - Optional specific workflow template
 * @returns {Promise<Object>} - Response with unified document ID and workflow ID
 */
export async function registerCERDocument(params) {
  return registerModuleDocument({
    ...params,
    moduleType: 'med_device'
  });
}

/**
 * Register a CMC document with the unified workflow system
 * 
 * @param {Object} params - CMC registration parameters
 * @param {string} params.documentId - Original CMC document ID
 * @param {string} params.title - CMC document title
 * @param {string} params.documentType - CMC document type
 * @param {Object} [params.content] - Optional document content
 * @param {Object} [params.metadata] - Optional metadata
 * @param {number} [params.folderId] - Optional target folder in Vault
 * @param {boolean} [params.initiateWorkflow] - Whether to start a default workflow
 * @param {string} [params.workflowTemplateId] - Optional specific workflow template
 * @returns {Promise<Object>} - Response with unified document ID and workflow ID
 */
export async function registerCMCDocument(params) {
  return registerModuleDocument({
    ...params,
    moduleType: 'cmc_wizard'
  });
}

/**
 * Register an eCTD document with the unified workflow system
 * 
 * @param {Object} params - eCTD registration parameters
 * @param {string} params.documentId - Original eCTD document ID
 * @param {string} params.title - eCTD document title
 * @param {string} params.documentType - eCTD document type
 * @param {Object} [params.content] - Optional document content
 * @param {Object} [params.metadata] - Optional metadata
 * @param {number} [params.folderId] - Optional target folder in Vault
 * @param {boolean} [params.initiateWorkflow] - Whether to start a default workflow
 * @param {string} [params.workflowTemplateId] - Optional specific workflow template
 * @returns {Promise<Object>} - Response with unified document ID and workflow ID
 */
export async function registerECTDDocument(params) {
  return registerModuleDocument({
    ...params,
    moduleType: 'ectd_coauthor'
  });
}

/**
 * Register a Study document with the unified workflow system
 * 
 * @param {Object} params - Study registration parameters
 * @param {string} params.documentId - Original Study document ID
 * @param {string} params.title - Study document title
 * @param {string} params.documentType - Study document type
 * @param {Object} [params.content] - Optional document content
 * @param {Object} [params.metadata] - Optional metadata
 * @param {number} [params.folderId] - Optional target folder in Vault
 * @param {boolean} [params.initiateWorkflow] - Whether to start a default workflow
 * @param {string} [params.workflowTemplateId] - Optional specific workflow template
 * @returns {Promise<Object>} - Response with unified document ID and workflow ID
 */
export async function registerStudyDocument(params) {
  return registerModuleDocument({
    ...params,
    moduleType: 'study_architect'
  });
}

/**
 * Update a module document's content or metadata
 * 
 * @param {Object} params - Update parameters
 * @param {string} params.moduleType - Type of module
 * @param {string} params.documentId - Original document ID in the module
 * @param {Object} [params.content] - Optional updated content
 * @param {Object} [params.metadata] - Optional updated metadata
 * @param {string} [params.status] - Optional updated status
 * @returns {Promise<Object>} - Response with unified document ID
 */
export async function updateModuleDocument(params) {
  try {
    const { moduleType, documentId, content, metadata, status } = params;
    
    const response = await apiRequest(
      `/api/integration/modules/${moduleType}/documents/${documentId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          content,
          metadata,
          status
        })
      }
    );
    
    return response;
  } catch (error) {
    console.error('Error updating module document:', error);
    throw error;
  }
}