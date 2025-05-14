/**
 * Module Document Registration Utility
 * 
 * This utility handles the registration of documents in the workflow system,
 * providing a unified approach across different modules (CER, 510k, CMC, etc.).
 */

/**
 * Register a document in the workflow system
 * 
 * @param {number} organizationId - The organization ID
 * @param {number} userId - The user ID
 * @param {string} moduleType - The module type (cer, medical_device, cmc, study, ectd, vault)
 * @param {Object} documentMetadata - Metadata about the document
 * @param {string} workflowTemplateId - The workflow template ID to use
 * @returns {Promise<Object>} - The registered document data
 */
export async function registerModuleDocument(
  organizationId,
  userId,
  moduleType,
  documentMetadata,
  workflowTemplateId
) {
  try {
    // Validate inputs
    if (!organizationId || !userId || !moduleType || !documentMetadata || !workflowTemplateId) {
      throw new Error('Missing required parameters for document registration');
    }
    
    // Ensure the document has required fields
    const document = {
      title: documentMetadata.title || 'Untitled Document',
      type: documentMetadata.type || 'report',
      format: documentMetadata.format || 'pdf',
      status: documentMetadata.status || 'draft',
      ...documentMetadata
    };
    
    // Call the API to register the document
    const response = await fetch('/api/module-integration/register-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        organizationId,
        userId,
        moduleType,
        document,
        workflowTemplateId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to register document in workflow system');
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error registering document in workflow system:', error);
    throw error;
  }
}

/**
 * Update document workflow status
 * 
 * @param {number} documentId - The document ID
 * @param {string} newStatus - The new status
 * @param {number} userId - The user ID making the change
 * @returns {Promise<Object>} - The updated document data
 */
export async function updateDocumentWorkflowStatus(documentId, newStatus, userId) {
  try {
    // Call the API to update the document status
    const response = await fetch('/api/module-integration/update-document-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        documentId,
        newStatus,
        userId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update document status');
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error updating document workflow status:', error);
    throw error;
  }
}

/**
 * Get workflow progression for a document
 * 
 * @param {number} documentId - The document ID
 * @returns {Promise<Object>} - The workflow progression data
 */
export async function getDocumentWorkflowProgression(documentId) {
  try {
    // Call the API to get the document workflow progression
    const response = await fetch(`/api/module-integration/document-workflow/${documentId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to retrieve document workflow progression');
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error getting document workflow progression:', error);
    throw error;
  }
}

/**
 * Delete a document from the workflow system
 * 
 * @param {number} documentId - The document ID
 * @param {number} userId - The user ID making the request
 * @returns {Promise<boolean>} - Success indicator
 */
export async function removeDocumentFromWorkflow(documentId, userId) {
  try {
    // Call the API to delete the document
    const response = await fetch('/api/module-integration/remove-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        documentId,
        userId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to remove document from workflow system');
    }
    
    return true;
    
  } catch (error) {
    console.error('Error removing document from workflow system:', error);
    throw error;
  }
}