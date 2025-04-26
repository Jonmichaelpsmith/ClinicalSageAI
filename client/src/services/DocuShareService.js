/**
 * DocuShare Service
 * 
 * Production-quality integration with the DocuShare document management system
 * for TrialSage IND Module.
 * 
 * Enterprise features include:
 * - Folder management and organization
 * - Document locking and versioning
 * - Document movement between folders
 * - Metadata for trial ID and molecule tracking
 */

/**
 * List documents from DocuShare with optional filtering
 * 
 * @param {string} folderPath - Optional folder path to list
 * @param {Object} options - Filter options
 * @returns {Promise<Array>} - List of documents
 */
export async function listDocuments(folderPath = '/', options = {}) {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (folderPath) queryParams.append('folder', folderPath);
    
    if (options.studyId) queryParams.append('studyId', options.studyId);
    if (options.indId) queryParams.append('indId', options.indId);
    if (options.trialPhase) queryParams.append('trialPhase', options.trialPhase);
    if (options.module) queryParams.append('module', options.module);
    if (options.documentType) queryParams.append('documentType', options.documentType);
    if (options.trialId) queryParams.append('trialId', options.trialId);
    if (options.molecule) queryParams.append('molecule', options.molecule);
    
    const response = await fetch(`/api/docs/list?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching documents: ${response.statusText}`);
    }
    
    // For development purposes, if the API returns an empty response, create sample data
    const data = await response.json();
    
    // In production, we would use the real data from the API
    return data.documents || data;
  } catch (error) {
    console.error('DocuShare Service Error (listDocuments):', error);
    // In case of error, return empty array to prevent UI crashes
    return [];
  }
}

/**
 * List folders in DocuShare
 * 
 * @param {string} parentPath - Parent folder path
 * @returns {Promise<Array>} - List of folders
 */
export async function listFolders(parentPath = '/') {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('parentPath', parentPath);
    
    const response = await fetch(`/api/docs/folders?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching folders: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.folders || data;
  } catch (error) {
    console.error('DocuShare Service Error (listFolders):', error);
    return [];
  }
}

/**
 * Create a new folder in DocuShare
 * 
 * @param {string} parentPath - Parent folder path
 * @param {string} folderName - Name of the new folder
 * @returns {Promise<Object>} - Created folder
 */
export async function createFolder(parentPath, folderName) {
  try {
    const response = await fetch('/api/docs/folders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parentPath,
        folderName,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error creating folder: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('DocuShare Service Error (createFolder):', error);
    throw error;
  }
}

/**
 * Upload a document to DocuShare
 * 
 * @param {string} folderPath - Target folder path
 * @param {File} file - File to upload
 * @param {Object} metadata - Document metadata
 * @returns {Promise<Object>} - Upload result
 */
export async function uploadDocument(folderPath = '/', file, metadata = {}) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (folderPath) formData.append('folder', folderPath);
    
    // Add metadata fields
    if (metadata.studyId) formData.append('studyId', metadata.studyId);
    if (metadata.indId) formData.append('indId', metadata.indId);
    if (metadata.trialPhase) formData.append('trialPhase', metadata.trialPhase);
    if (metadata.module) formData.append('module', metadata.module);
    if (metadata.documentType) formData.append('documentType', metadata.documentType);
    if (metadata.status) formData.append('status', metadata.status);
    if (metadata.trialId) formData.append('trialId', metadata.trialId);
    if (metadata.molecule) formData.append('molecule', metadata.molecule);
    
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
 * Lock a document in DocuShare
 * 
 * @param {string} documentId - Document ID to lock
 * @returns {Promise<Object>} - Lock result
 */
export async function lockDocument(documentId) {
  try {
    const response = await fetch('/api/docs/lock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ documentId }),
    });
    
    if (!response.ok) {
      throw new Error(`Error locking document: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('DocuShare Service Error (lockDocument):', error);
    throw error;
  }
}

/**
 * Unlock a document in DocuShare
 * 
 * @param {string} documentId - Document ID to unlock
 * @returns {Promise<Object>} - Unlock result
 */
export async function unlockDocument(documentId) {
  try {
    const response = await fetch('/api/docs/unlock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ documentId }),
    });
    
    if (!response.ok) {
      throw new Error(`Error unlocking document: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('DocuShare Service Error (unlockDocument):', error);
    throw error;
  }
}

/**
 * Move a document to a different folder in DocuShare
 * 
 * @param {string} documentId - Document ID to move
 * @param {string} targetFolderPath - Target folder path
 * @returns {Promise<Object>} - Move result
 */
export async function moveDocument(documentId, targetFolderPath) {
  try {
    const response = await fetch('/api/docs/move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        documentId, 
        targetFolder: targetFolderPath 
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error moving document: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('DocuShare Service Error (moveDocument):', error);
    throw error;
  }
}

/**
 * Delete a document from DocuShare
 * 
 * @param {string} documentId - Document ID to delete
 * @returns {Promise<Object>} - Delete result
 */
export async function deleteDocument(documentId) {
  try {
    const response = await fetch(`/api/docs/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ documentId }),
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting document: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('DocuShare Service Error (deleteDocument):', error);
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
 * Get document version history
 * 
 * @param {string} documentId - Document ID
 * @returns {Promise<Array>} - Version history
 */
export async function getDocumentVersions(documentId) {
  try {
    const response = await fetch(`/api/docs/versions?objectId=${encodeURIComponent(documentId)}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching document versions: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('DocuShare Service Error (getDocumentVersions):', error);
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