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
    if (!organizationId || !userId || !moduleType || !documentMetadata) {
      throw new Error('Missing required parameters for document registration');
    }
    
    // Ensure required metadata fields
    const metadata = {
      title: documentMetadata.title || 'Untitled Document',
      description: documentMetadata.description || '',
      documentType: documentMetadata.documentType || 'general',
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
        metadata,
        workflowTemplateId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to register document');
    }
    
    const data = await response.json();
    return data.document;
    
  } catch (error) {
    console.error('Error registering document:', error);
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
    if (!documentId || !newStatus || !userId) {
      throw new Error('Missing required parameters for updating document status');
    }
    
    // Call the API to update document status
    const response = await fetch(`/api/module-integration/document-status/${documentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        newStatus,
        userId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update document status');
    }
    
    const data = await response.json();
    return data.document;
    
  } catch (error) {
    console.error('Error updating document status:', error);
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
    if (!documentId) {
      throw new Error('Document ID is required for getting workflow progression');
    }
    
    // Call the API to get workflow progression
    const response = await fetch(`/api/module-integration/workflow-progression/${documentId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to retrieve workflow progression');
    }
    
    const data = await response.json();
    return data.progression;
    
  } catch (error) {
    console.error('Error getting workflow progression:', error);
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
    if (!documentId || !userId) {
      throw new Error('Missing required parameters for removing document from workflow');
    }
    
    // Call the API to remove the document
    const response = await fetch(`/api/module-integration/remove-document/${documentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to remove document from workflow');
    }
    
    return true;
    
  } catch (error) {
    console.error('Error removing document from workflow:', error);
    throw error;
  }
}