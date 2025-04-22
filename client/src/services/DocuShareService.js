import axios from 'axios';

/**
 * DocuShare Integration Service
 * 
 * This service handles all communication with the DocuShare API
 * for regulatory document management with 21 CFR Part 11 compliance.
 */
class DocuShareService {
  constructor() {
    // DocuShare API endpoints using environment variables
    this.baseUrl = import.meta.env.DOCUSHARE_API_URL || 'https://api.docushare.com/v1';
    this.authToken = null;
    this.serverId = import.meta.env.DOCUSHARE_SERVER_ID || 'TrialSAGE-DS7';
    this.licenseKey = import.meta.env.DOCUSHARE_LICENSE_KEY;
    this.publicKey = import.meta.env.VITE_DOCUSHARE_PUBLIC_KEY;
    
    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-DocuShare-Server-ID': this.serverId,
        'X-DocuShare-Public-Key': this.publicKey
      }
    });
    
    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Authenticate with DocuShare using credentials
   * @param {string} username - The username
   * @param {string} password - The password
   * @returns {Promise<Object>} - Authentication result with token
   */
  async authenticate(username, password) {
    try {
      const response = await this.client.post('/auth', { username, password });
      this.authToken = response.data.token;
      return response.data;
    } catch (error) {
      console.error('DocuShare authentication error:', error);
      throw new Error('Failed to authenticate with DocuShare');
    }
  }
  
  /**
   * Get documents from a specific collection or folder
   * @param {string} collectionId - The collection or folder ID
   * @param {Object} options - Query options like pagination, sorting, etc.
   * @returns {Promise<Array>} - List of documents
   */
  async getDocuments(collectionId, options = {}) {
    try {
      const response = await this.client.get(`/collections/${collectionId}/documents`, {
        params: options
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw new Error('Failed to fetch documents from DocuShare');
    }
  }
  
  /**
   * Get a specific document's metadata
   * @param {string} documentId - The document ID
   * @returns {Promise<Object>} - Document metadata
   */
  async getDocumentMetadata(documentId) {
    try {
      const response = await this.client.get(`/documents/${documentId}/metadata`);
      return response.data;
    } catch (error) {
      console.error('Error fetching document metadata:', error);
      throw new Error('Failed to fetch document metadata');
    }
  }
  
  /**
   * Get a document's content
   * @param {string} documentId - The document ID
   * @param {string} format - Desired format (pdf, docx, html)
   * @returns {Promise<Blob>} - Document content as blob
   */
  async getDocumentContent(documentId, format = 'pdf') {
    try {
      const response = await this.client.get(`/documents/${documentId}/content`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching document content:', error);
      throw new Error('Failed to fetch document content');
    }
  }
  
  /**
   * Upload a new document
   * @param {string} collectionId - Target collection ID
   * @param {File} file - File to upload
   * @param {Object} metadata - Document metadata
   * @returns {Promise<Object>} - Uploaded document info
   */
  async uploadDocument(collectionId, file, metadata = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metadata', JSON.stringify(metadata));
      
      const response = await this.client.post(`/collections/${collectionId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw new Error('Failed to upload document to DocuShare');
    }
  }
  
  /**
   * Update a document's content
   * @param {string} documentId - Document ID to update
   * @param {File} file - New file content
   * @returns {Promise<Object>} - Updated document info
   */
  async updateDocumentContent(documentId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await this.client.put(`/documents/${documentId}/content`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating document content:', error);
      throw new Error('Failed to update document content');
    }
  }
  
  /**
   * Update a document's metadata
   * @param {string} documentId - Document ID
   * @param {Object} metadata - New metadata values
   * @returns {Promise<Object>} - Updated document metadata
   */
  async updateDocumentMetadata(documentId, metadata) {
    try {
      const response = await this.client.put(`/documents/${documentId}/metadata`, metadata);
      return response.data;
    } catch (error) {
      console.error('Error updating document metadata:', error);
      throw new Error('Failed to update document metadata');
    }
  }
  
  /**
   * Get audit trail for a document
   * @param {string} documentId - Document ID
   * @param {Object} options - Query options like time range, pagination
   * @returns {Promise<Array>} - Audit trail entries
   */
  async getDocumentAuditTrail(documentId, options = {}) {
    try {
      const response = await this.client.get(`/documents/${documentId}/audit-trail`, {
        params: options
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      throw new Error('Failed to fetch document audit trail');
    }
  }
  
  /**
   * Apply electronic signature to a document
   * @param {string} documentId - Document ID
   * @param {Object} signatureData - Signature information including reason
   * @returns {Promise<Object>} - Signature result
   */
  async signDocument(documentId, signatureData) {
    try {
      const response = await this.client.post(`/documents/${documentId}/signatures`, signatureData);
      return response.data;
    } catch (error) {
      console.error('Error signing document:', error);
      throw new Error('Failed to apply electronic signature');
    }
  }
  
  /**
   * Get all signatures for a document
   * @param {string} documentId - Document ID
   * @returns {Promise<Array>} - List of signatures
   */
  async getDocumentSignatures(documentId) {
    try {
      const response = await this.client.get(`/documents/${documentId}/signatures`);
      return response.data;
    } catch (error) {
      console.error('Error fetching signatures:', error);
      throw new Error('Failed to fetch document signatures');
    }
  }
  
  /**
   * Search for documents using advanced criteria
   * @param {Object} criteria - Search criteria
   * @returns {Promise<Array>} - Search results
   */
  async searchDocuments(criteria) {
    try {
      const response = await this.client.post('/search', criteria);
      return response.data;
    } catch (error) {
      console.error('Error searching documents:', error);
      throw new Error('Failed to search documents');
    }
  }
  
  /**
   * Initiate regulatory workflow for a document
   * @param {string} documentId - Document ID
   * @param {string} workflowType - Type of workflow (review, approval, submission)
   * @param {Object} workflowParams - Workflow parameters
   * @returns {Promise<Object>} - Workflow information
   */
  async initiateWorkflow(documentId, workflowType, workflowParams) {
    try {
      const response = await this.client.post(`/documents/${documentId}/workflows`, {
        type: workflowType,
        parameters: workflowParams
      });
      return response.data;
    } catch (error) {
      console.error('Error initiating workflow:', error);
      throw new Error('Failed to initiate document workflow');
    }
  }
  
  /**
   * Get workflow status for a document
   * @param {string} documentId - Document ID
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<Object>} - Workflow status
   */
  async getWorkflowStatus(documentId, workflowId) {
    try {
      const response = await this.client.get(`/documents/${documentId}/workflows/${workflowId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workflow status:', error);
      throw new Error('Failed to fetch workflow status');
    }
  }
  
  /**
   * Complete a workflow task
   * @param {string} documentId - Document ID
   * @param {string} workflowId - Workflow ID
   * @param {string} taskId - Task ID
   * @param {Object} taskData - Task completion data
   * @returns {Promise<Object>} - Task completion result
   */
  async completeWorkflowTask(documentId, workflowId, taskId, taskData) {
    try {
      const response = await this.client.post(
        `/documents/${documentId}/workflows/${workflowId}/tasks/${taskId}/complete`,
        taskData
      );
      return response.data;
    } catch (error) {
      console.error('Error completing workflow task:', error);
      throw new Error('Failed to complete workflow task');
    }
  }
}

// Create and export a singleton instance
const docuShareService = new DocuShareService();
export default docuShareService;