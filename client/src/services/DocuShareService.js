/**
 * DocuShare Service
 * 
 * This service handles interactions with the document management system,
 * providing methods for retrieving, storing, and managing documents.
 */

import { apiRequest } from '../lib/queryClient';

class DocuShareService {
  /**
   * Get documents from the vault
   * 
   * @param {Object} filters Filter criteria
   * @param {Object} pagination Pagination options
   * @returns {Promise<Object>} Documents and pagination info
   */
  async getDocuments(filters = {}, pagination = { page: 1, limit: 20 }) {
    try {
      // Build query string parameters
      const params = new URLSearchParams();
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);
      
      // Add filter parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, value);
        }
      });
      
      const response = await apiRequest.get(`/api/vault/documents?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }
  
  /**
   * Get a document by ID
   * 
   * @param {string} documentId Document ID
   * @returns {Promise<Object>} Document details
   */
  async getDocument(documentId) {
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
   * @param {File} file File to upload
   * @param {Object} metadata Document metadata
   * @returns {Promise<Object>} Upload result
   */
  async uploadDocument(file, metadata = {}) {
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
   * @param {string} documentId Document ID
   * @param {Object} metadata Updated metadata
   * @returns {Promise<Object>} Updated document
   */
  async updateDocumentMetadata(documentId, metadata) {
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
   * @param {string} documentId Document ID
   * @returns {Promise<Blob>} Document blob
   */
  async downloadDocument(documentId) {
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
   * Upload a file to a specific folder in the vault
   * 
   * @param {string} folderId Parent folder ID
   * @param {FormData} formData Form data with file and metadata
   * @returns {Promise<Object>} Uploaded file metadata
   */
  async uploadFile(folderId, formData) {
    try {
      // Ensure folderId is included in the formData
      if (!formData.has('folderId')) {
        formData.append('folderId', folderId);
      }
      
      const response = await apiRequest.post('/api/vault/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error uploading file to folder ${folderId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get file content by document ID
   * 
   * @param {string} documentId Document ID
   * @returns {Promise<any>} File content
   */
  async getFileContent(documentId) {
    try {
      const response = await apiRequest.get(`/api/vault/files/${documentId}/content`);
      return response.data;
    } catch (error) {
      console.error(`Error retrieving file content for document ${documentId}:`, error);
      throw error;
    }
  }
  
  /**
   * List files in a folder with optional filters
   * 
   * @param {string} folderId Folder ID
   * @param {Object} filters Optional filters for the file listing
   * @returns {Promise<Array>} List of files in the folder
   */
  async listFiles(folderId, filters = {}) {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('folderId', folderId);
      
      // Add filter parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, value);
        }
      });
      
      const response = await apiRequest.get(`/api/vault/files?${params.toString()}`);
      return response.data.files || [];
    } catch (error) {
      console.error(`Error listing files in folder ${folderId}:`, error);
      throw error;
    }
  }
}

// Create and export singleton instance
const docuShareService = new DocuShareService();
export default docuShareService;