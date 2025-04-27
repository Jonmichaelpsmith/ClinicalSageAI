/**
 * DocuShare Service
 * 
 * This centralized service manages document operations across all modules of the TrialSage platform.
 * It provides a unified API for document creation, retrieval, sharing, and version control,
 * eliminating siloed document management between different modules.
 */

// Document type constants
export const DOCUMENT_TYPES = {
  PROTOCOL: 'protocol',
  CSR: 'csr',
  CMC: 'cmc',
  REGULATORY: 'regulatory',
  FDA_FORM: 'fda-form',
  SAFETY: 'safety',
  CLINICAL: 'clinical',
  TEMPLATE: 'template',
  OTHER: 'other'
};

// Document status constants
export const DOCUMENT_STATUS = {
  DRAFT: 'draft',
  IN_REVIEW: 'in-review',
  APPROVED: 'approved',
  FINAL: 'final',
  OBSOLETE: 'obsolete',
  ARCHIVED: 'archived'
};

class DocuShareService {
  constructor() {
    this.apiBase = '/api/docushare';
    this.documentListeners = new Map();
    this.recentDocuments = [];
  }

  /**
   * Get a document by ID
   * @param {string} documentId - The ID of the document to retrieve
   * @returns {Promise<Object>} - The document object
   */
  async getDocument(documentId) {
    try {
      const response = await fetch(`${this.apiBase}/documents/${documentId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  }

  /**
   * Get documents by project ID
   * @param {string} projectId - The ID of the project
   * @param {Object} options - Query options like type, status, etc.
   * @returns {Promise<Array>} - Array of document objects
   */
  async getDocumentsByProject(projectId, options = {}) {
    const queryParams = new URLSearchParams({
      projectId,
      ...options
    }).toString();

    try {
      const response = await fetch(`${this.apiBase}/documents?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch project documents: ${response.statusText}`);
      }
      const documents = await response.json();
      this.recentDocuments = documents.slice(0, 5); // Cache recent documents
      return documents;
    } catch (error) {
      console.error('Error fetching project documents:', error);
      throw error;
    }
  }

  /**
   * Create a new document
   * @param {Object} documentData - The document data
   * @returns {Promise<Object>} - The created document
   */
  async createDocument(documentData) {
    try {
      const response = await fetch(`${this.apiBase}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(documentData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create document: ${response.statusText}`);
      }

      const newDocument = await response.json();
      this._notifyDocumentListeners('create', newDocument);
      return newDocument;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  /**
   * Update an existing document
   * @param {string} documentId - The ID of the document to update
   * @param {Object} updateData - The document data to update
   * @returns {Promise<Object>} - The updated document
   */
  async updateDocument(documentId, updateData) {
    try {
      const response = await fetch(`${this.apiBase}/documents/${documentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error(`Failed to update document: ${response.statusText}`);
      }

      const updatedDocument = await response.json();
      this._notifyDocumentListeners('update', updatedDocument);
      return updatedDocument;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  /**
   * Delete a document
   * @param {string} documentId - The ID of the document to delete
   * @returns {Promise<boolean>} - Success status
   */
  async deleteDocument(documentId) {
    try {
      const response = await fetch(`${this.apiBase}/documents/${documentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete document: ${response.statusText}`);
      }

      this._notifyDocumentListeners('delete', { id: documentId });
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  /**
   * Share a document with a specific module or user
   * @param {string} documentId - The ID of the document to share
   * @param {Object} shareOptions - Options for sharing (module, user, permissions)
   * @returns {Promise<Object>} - The sharing result
   */
  async shareDocument(documentId, shareOptions) {
    try {
      const response = await fetch(`${this.apiBase}/documents/${documentId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shareOptions)
      });

      if (!response.ok) {
        throw new Error(`Failed to share document: ${response.statusText}`);
      }

      const result = await response.json();
      this._notifyDocumentListeners('share', { id: documentId, shareOptions });
      return result;
    } catch (error) {
      console.error('Error sharing document:', error);
      throw error;
    }
  }

  /**
   * Create a new version of a document
   * @param {string} documentId - The ID of the document
   * @param {Object} versionData - The version data and content
   * @returns {Promise<Object>} - The new version object
   */
  async createDocumentVersion(documentId, versionData) {
    try {
      const response = await fetch(`${this.apiBase}/documents/${documentId}/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(versionData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create document version: ${response.statusText}`);
      }

      const newVersion = await response.json();
      this._notifyDocumentListeners('version', { id: documentId, version: newVersion });
      return newVersion;
    } catch (error) {
      console.error('Error creating document version:', error);
      throw error;
    }
  }

  /**
   * Get document version history
   * @param {string} documentId - The ID of the document
   * @returns {Promise<Array>} - Array of version objects
   */
  async getDocumentVersions(documentId) {
    try {
      const response = await fetch(`${this.apiBase}/documents/${documentId}/versions`);
      if (!response.ok) {
        throw new Error(`Failed to fetch document versions: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching document versions:', error);
      throw error;
    }
  }

  /**
   * Search for documents across the platform
   * @param {string} query - The search query
   * @param {Object} filters - Search filters
   * @returns {Promise<Array>} - Array of matching documents
   */
  async searchDocuments(query, filters = {}) {
    const queryParams = new URLSearchParams({
      q: query,
      ...filters
    }).toString();

    try {
      const response = await fetch(`${this.apiBase}/documents/search?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Failed to search documents: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  }

  /**
   * Get document templates by category
   * @param {string} category - The template category
   * @returns {Promise<Array>} - Array of template objects
   */
  async getTemplates(category) {
    try {
      const url = category 
        ? `${this.apiBase}/templates?category=${category}`
        : `${this.apiBase}/templates`;
        
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }

  /**
   * Get recently accessed documents across modules
   * @param {number} limit - Maximum number of documents to return
   * @returns {Promise<Array>} - Array of recent documents
   */
  async getRecentDocuments(limit = 10) {
    if (this.recentDocuments.length > 0) {
      return Promise.resolve(this.recentDocuments.slice(0, limit));
    }
    
    try {
      const response = await fetch(`${this.apiBase}/documents/recent?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch recent documents: ${response.statusText}`);
      }
      const documents = await response.json();
      this.recentDocuments = documents;
      return documents;
    } catch (error) {
      console.error('Error fetching recent documents:', error);
      throw error;
    }
  }

  /**
   * Create a document from a template
   * @param {string} templateId - The ID of the template to use
   * @param {Object} documentData - Initial document data
   * @returns {Promise<Object>} - The created document
   */
  async createFromTemplate(templateId, documentData) {
    try {
      const response = await fetch(`${this.apiBase}/templates/${templateId}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(documentData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create document from template: ${response.statusText}`);
      }

      const newDocument = await response.json();
      this._notifyDocumentListeners('create', newDocument);
      return newDocument;
    } catch (error) {
      console.error('Error creating document from template:', error);
      throw error;
    }
  }

  /**
   * Get document metadata
   * @param {string} documentId - The ID of the document
   * @returns {Promise<Object>} - The document metadata
   */
  async getDocumentMetadata(documentId) {
    try {
      const response = await fetch(`${this.apiBase}/documents/${documentId}/metadata`);
      if (!response.ok) {
        throw new Error(`Failed to fetch document metadata: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching document metadata:', error);
      throw error;
    }
  }

  /**
   * Update document metadata
   * @param {string} documentId - The ID of the document
   * @param {Object} metadata - The metadata to update
   * @returns {Promise<Object>} - The updated metadata
   */
  async updateDocumentMetadata(documentId, metadata) {
    try {
      const response = await fetch(`${this.apiBase}/documents/${documentId}/metadata`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata)
      });

      if (!response.ok) {
        throw new Error(`Failed to update document metadata: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating document metadata:', error);
      throw error;
    }
  }

  /**
   * Generate document from module data
   * @param {string} moduleType - The source module type
   * @param {Object} moduleData - The module data to generate document from
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} - The generated document
   */
  async generateDocumentFromModule(moduleType, moduleData, options = {}) {
    try {
      const response = await fetch(`${this.apiBase}/generate/${moduleType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ moduleData, options })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate document: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error generating document:', error);
      throw error;
    }
  }

  /**
   * Subscribe to document events
   * @param {string} eventType - The event type (create, update, delete, share, version)
   * @param {Function} callback - The callback function
   * @returns {string} - Subscription ID for unsubscribing
   */
  subscribeToDocumentEvents(eventType, callback) {
    const subscriptionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    if (!this.documentListeners.has(eventType)) {
      this.documentListeners.set(eventType, new Map());
    }
    
    this.documentListeners.get(eventType).set(subscriptionId, callback);
    return subscriptionId;
  }

  /**
   * Unsubscribe from document events
   * @param {string} eventType - The event type
   * @param {string} subscriptionId - The subscription ID
   */
  unsubscribeFromDocumentEvents(eventType, subscriptionId) {
    if (this.documentListeners.has(eventType)) {
      this.documentListeners.get(eventType).delete(subscriptionId);
    }
  }

  /**
   * Notify document event listeners
   * @param {string} eventType - The event type
   * @param {Object} data - The event data
   * @private
   */
  _notifyDocumentListeners(eventType, data) {
    if (this.documentListeners.has(eventType)) {
      this.documentListeners.get(eventType).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in document ${eventType} listener:`, error);
        }
      });
    }
  }
}

// Singleton instance
const docuShareService = new DocuShareService();
export default docuShareService;