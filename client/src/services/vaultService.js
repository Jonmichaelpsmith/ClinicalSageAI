/**
 * Vault Service
 * 
 * This service handles all interactions with the document vault file system,
 * providing a secure repository for regulatory documents.
 */

import { apiRequest } from '../lib/queryClient';

/**
 * Get documents from the vault
 * 
 * @param {Object} filters - Filter criteria for documents
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} - Documents and pagination info
 */
export async function getDocuments(filters = {}, pagination = { page: 1, limit: 20 }) {
  try {
    const params = new URLSearchParams();
    
    // Add pagination parameters
    params.append('page', pagination.page);
    params.append('limit', pagination.limit);
    
    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, value);
      }
    });
    
    const response = await apiRequest.get(`/api/vault/documents?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vault documents:', error);
    throw error;
  }
}

/**
 * Get a document by ID
 * 
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} - Document details
 */
export async function getDocument(documentId) {
  try {
    const response = await apiRequest.get(`/api/vault/documents/${documentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching document ${documentId}:`, error);
    throw error;
  }
}

/**
 * Upload a document to the vault
 * 
 * @param {File} file - The file to upload
 * @param {Object} metadata - Document metadata
 * @returns {Promise<Object>} - Upload result
 */
export async function uploadDocument(file, metadata = {}) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    
    const response = await apiRequest.post('/api/vault/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
}

/**
 * Update document metadata
 * 
 * @param {string} documentId - Document ID
 * @param {Object} metadata - Updated metadata
 * @returns {Promise<Object>} - Updated document details
 */
export async function updateDocumentMetadata(documentId, metadata) {
  try {
    const response = await apiRequest.patch(`/api/vault/documents/${documentId}/metadata`, metadata);
    return response.data;
  } catch (error) {
    console.error(`Error updating document ${documentId} metadata:`, error);
    throw error;
  }
}

/**
 * Download a document
 * 
 * @param {string} documentId - Document ID
 * @returns {Promise<Blob>} - Document blob
 */
export async function downloadDocument(documentId) {
  try {
    const response = await apiRequest.get(`/api/vault/documents/${documentId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error(`Error downloading document ${documentId}:`, error);
    throw error;
  }
}

/**
 * Share a document with other users
 * 
 * @param {string} documentId - Document ID
 * @param {Array<string>} userIds - User IDs to share with
 * @param {string} permission - Permission level (view, edit, admin)
 * @returns {Promise<Object>} - Share result
 */
export async function shareDocument(documentId, userIds, permission = 'view') {
  try {
    const response = await apiRequest.post(`/api/vault/documents/${documentId}/share`, {
      userIds,
      permission
    });
    return response.data;
  } catch (error) {
    console.error(`Error sharing document ${documentId}:`, error);
    throw error;
  }
}

/**
 * Delete a document
 * 
 * @param {string} documentId - Document ID
 * @returns {Promise<boolean>} - True if successful
 */
export async function deleteDocument(documentId) {
  try {
    await apiRequest.delete(`/api/vault/documents/${documentId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting document ${documentId}:`, error);
    throw error;
  }
}

/**
 * Get document version history
 * 
 * @param {string} documentId - Document ID
 * @returns {Promise<Array>} - Version history
 */
export async function getDocumentVersionHistory(documentId) {
  try {
    const response = await apiRequest.get(`/api/vault/documents/${documentId}/versions`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching version history for document ${documentId}:`, error);
    throw error;
  }
}

/**
 * Restore document to a previous version
 * 
 * @param {string} documentId - Document ID
 * @param {string} versionId - Version ID to restore
 * @returns {Promise<Object>} - Restored document details
 */
export async function restoreDocumentVersion(documentId, versionId) {
  try {
    const response = await apiRequest.post(`/api/vault/documents/${documentId}/restore/${versionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error restoring document ${documentId} to version ${versionId}:`, error);
    throw error;
  }
}

/**
 * Create a folder in the vault
 * 
 * @param {string} name - Folder name
 * @param {string} parentId - Parent folder ID (null for root)
 * @returns {Promise<Object>} - Created folder details
 */
export async function createFolder(name, parentId = null) {
  try {
    const response = await apiRequest.post('/api/vault/folders', {
      name,
      parentId
    });
    return response.data;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
}

/**
 * Get folder contents
 * 
 * @param {string} folderId - Folder ID (null for root)
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} - Folder contents
 */
export async function getFolderContents(folderId = null, pagination = { page: 1, limit: 50 }) {
  try {
    const params = new URLSearchParams();
    params.append('page', pagination.page);
    params.append('limit', pagination.limit);
    
    const url = folderId 
      ? `/api/vault/folders/${folderId}/contents?${params.toString()}`
      : `/api/vault/folders/root/contents?${params.toString()}`;
    
    const response = await apiRequest.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching contents of folder ${folderId || 'root'}:`, error);
    throw error;
  }
}

/**
 * Move document to a folder
 * 
 * @param {string} documentId - Document ID
 * @param {string} folderId - Destination folder ID
 * @returns {Promise<Object>} - Move result
 */
export async function moveDocumentToFolder(documentId, folderId) {
  try {
    const response = await apiRequest.post(`/api/vault/documents/${documentId}/move`, {
      folderId
    });
    return response.data;
  } catch (error) {
    console.error(`Error moving document ${documentId} to folder ${folderId}:`, error);
    throw error;
  }
}

/**
 * Search documents in vault
 * 
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} - Search results
 */
export async function searchDocuments(query, filters = {}, pagination = { page: 1, limit: 20 }) {
  try {
    const params = new URLSearchParams();
    params.append('query', query);
    params.append('page', pagination.page);
    params.append('limit', pagination.limit);
    
    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, value);
      }
    });
    
    const response = await apiRequest.get(`/api/vault/search?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error(`Error searching vault documents for "${query}":`, error);
    throw error;
  }
}

/**
 * Get statistics about the vault
 * 
 * @returns {Promise<Object>} - Vault statistics
 */
export async function getVaultStatistics() {
  try {
    const response = await apiRequest.get('/api/vault/statistics');
    return response.data;
  } catch (error) {
    console.error('Error fetching vault statistics:', error);
    throw error;
  }
}

/**
 * Lock a document to prevent editing
 * 
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} - Lock result
 */
export async function lockDocument(documentId) {
  try {
    const response = await apiRequest.post(`/api/vault/documents/${documentId}/lock`);
    return response.data;
  } catch (error) {
    console.error(`Error locking document ${documentId}:`, error);
    throw error;
  }
}

/**
 * Unlock a document
 * 
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} - Unlock result
 */
export async function unlockDocument(documentId) {
  try {
    const response = await apiRequest.post(`/api/vault/documents/${documentId}/unlock`);
    return response.data;
  } catch (error) {
    console.error(`Error unlocking document ${documentId}:`, error);
    throw error;
  }
}