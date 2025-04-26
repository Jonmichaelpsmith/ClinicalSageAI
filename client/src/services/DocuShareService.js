/**
 * DocuShare Service
 * 
 * Production-quality integration with the DocuShare document management system
 * for TrialSage IND Module.
 */

/**
 * List documents from DocuShare with optional filtering
 * 
 * @param {string} folderId - Optional folder ID to list
 * @param {Object} options - Filter options
 * @returns {Promise<Array>} - List of documents
 */
export async function listDocuments(folderId = '', options = {}) {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (folderId) queryParams.append('folder', folderId);
    
    if (options.studyId) queryParams.append('studyId', options.studyId);
    if (options.indId) queryParams.append('indId', options.indId);
    if (options.trialPhase) queryParams.append('trialPhase', options.trialPhase);
    if (options.module) queryParams.append('module', options.module);
    if (options.documentType) queryParams.append('documentType', options.documentType);
    
    const response = await fetch(`/api/docs/list?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching documents: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('DocuShare Service Error (listDocuments):', error);
    // Return empty array in case of error to prevent UI crashes
    return [];
  }
}

/**
 * Upload a document to DocuShare
 * 
 * @param {string} folderId - Target folder ID
 * @param {File} file - File to upload
 * @param {Object} metadata - Document metadata
 * @returns {Promise<Object>} - Upload result
 */
export async function uploadDocument(folderId = '', file, metadata = {}) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) formData.append('folder', folderId);
    
    // Add metadata fields
    if (metadata.studyId) formData.append('studyId', metadata.studyId);
    if (metadata.indId) formData.append('indId', metadata.indId);
    if (metadata.trialPhase) formData.append('trialPhase', metadata.trialPhase);
    if (metadata.module) formData.append('module', metadata.module);
    if (metadata.documentType) formData.append('documentType', metadata.documentType);
    if (metadata.status) formData.append('status', metadata.status);
    
    const response = await fetch('/api/docs/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Error uploading document: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('DocuShare Service Error (uploadDocument):', error);
    throw error;
  }
}

/**
 * Download a document from DocuShare
 * 
 * @param {string} documentId - Document ID to download
 * @returns {Promise<void>} - Triggers download
 */
export async function downloadDocument(documentId) {
  try {
    const response = await fetch(`/api/docs/download?objectId=${encodeURIComponent(documentId)}`);
    
    if (!response.ok) {
      throw new Error(`Error downloading document: ${response.statusText}`);
    }
    
    // Create blob from response
    const blob = await response.blob();
    
    // Create object URL and trigger download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    
    // Use document ID as filename, or get from content-disposition if available
    const contentDisposition = response.headers.get('content-disposition');
    const filename = contentDisposition 
      ? contentDisposition.split('filename=')[1].replace(/"/g, '') 
      : documentId;
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('DocuShare Service Error (downloadDocument):', error);
    throw error;
  }
}

/**
 * Get document metadata
 * 
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} - Document metadata
 */
export async function getDocumentMetadata(documentId) {
  try {
    const response = await fetch(`/api/docs/metadata?objectId=${encodeURIComponent(documentId)}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching document metadata: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('DocuShare Service Error (getDocumentMetadata):', error);
    throw error;
  }
}

/**
 * Get DocuShare status for IND Module
 * 
 * @returns {Promise<Object>} - Status information
 */
export async function getDocuShareStatus() {
  try {
    const response = await fetch('/api/ind/docushare/status');
    
    if (!response.ok) {
      throw new Error(`Error fetching DocuShare status: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('DocuShare Service Error (getDocuShareStatus):', error);
    return {
      status: {
        connectionActive: false,
        errorMessage: error.message,
        timestamp: new Date().toISOString()
      },
      statistics: {
        totalDocuments: 0,
        byModule: {}
      },
      recentActivity: []
    };
  }
}