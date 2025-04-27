/**
 * DocuShare Service
 * 
 * This service provides document sharing capabilities across all TrialSage modules.
 * It enables secure, structured, and context-aware document sharing with version control,
 * permissions management, and blockchain verification integration.
 */

import regulatoryIntelligenceCore from './RegulatoryIntelligenceCore';
import securityService from './SecurityService';

const API_BASE = '/api/docushare';

class DocuShareService {
  constructor() {
    this.isInitialized = false;
    this.config = {
      blockchainIntegration: false,
      versionControl: true,
      autoReindex: true
    };
    this.documentCache = new Map();
    this.collectionCache = new Map();
    this.pendingUploads = new Map();
    this.activeSubscriptions = new Map();
  }

  /**
   * Initialize DocuShare service
   * @param {Object} options - Initialization options
   * @returns {Promise<Object>} - Initialization status
   */
  async initialize(options = {}) {
    if (this.isInitialized) {
      console.log('DocuShareService already initialized');
      return { status: 'already_initialized', config: this.config };
    }
    
    console.log('Initializing DocuShareService...');
    
    try {
      // Update configuration
      this.config = {
        ...this.config,
        ...options
      };
      
      // Initialize intelligence core if needed
      if (!regulatoryIntelligenceCore.isInitialized) {
        await regulatoryIntelligenceCore.initialize({
          enableBlockchain: this.config.blockchainIntegration
        });
      }
      
      this.isInitialized = true;
      console.log('DocuShareService initialized successfully');
      
      return {
        status: 'success',
        config: this.config
      };
    } catch (error) {
      console.error('Failed to initialize DocuShareService:', error);
      
      return {
        status: 'error',
        error: error.message
      };
    }
  }
  
  /**
   * Create document collection
   * @param {string} name - Collection name
   * @param {string} module - Source module
   * @param {Object} options - Collection options
   * @returns {Promise<Object>} - Created collection
   */
  async createCollection(name, module, options = {}) {
    if (!this.isInitialized) {
      console.warn('DocuShareService not initialized. Initializing now...');
      await this.initialize();
    }
    
    try {
      const collection = {
        id: `collection-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name,
        module,
        description: options.description || '',
        createdAt: new Date().toISOString(),
        createdBy: options.userId || securityService.currentUser?.id,
        tags: options.tags || [],
        permissions: options.permissions || {
          read: ['*'],
          write: [options.userId || securityService.currentUser?.id],
          admin: [options.userId || securityService.currentUser?.id]
        },
        documentCount: 0,
        documents: []
      };
      
      // Store in cache
      this.collectionCache.set(collection.id, collection);
      
      // In production, would call API to persist collection
      // const response = await fetch(`${API_BASE}/collections`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(collection)
      // });
      // const result = await response.json();
      
      return collection;
    } catch (error) {
      console.error('Error creating document collection:', error);
      throw error;
    }
  }
  
  /**
   * Get document collections
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Document collections
   */
  async getCollections(options = {}) {
    if (!this.isInitialized) {
      console.warn('DocuShareService not initialized. Initializing now...');
      await this.initialize();
    }
    
    try {
      // In production, would call API to retrieve collections
      // const queryParams = new URLSearchParams({
      //   module: options.module || '',
      //   userId: options.userId || '',
      //   ...options
      // });
      
      // const response = await fetch(`${API_BASE}/collections?${queryParams}`);
      // const collections = await response.json();
      
      // For now, use cached collections
      let collections = Array.from(this.collectionCache.values());
      
      // Filter based on options
      if (options.module) {
        collections = collections.filter(c => c.module === options.module);
      }
      
      if (options.userId) {
        collections = collections.filter(
          c => c.createdBy === options.userId || 
               c.permissions.read.includes('*') || 
               c.permissions.read.includes(options.userId)
        );
      }
      
      // Sort by created date (newest first)
      collections.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      return collections;
    } catch (error) {
      console.error('Error getting document collections:', error);
      throw error;
    }
  }
  
  /**
   * Share document with collection
   * @param {Object} document - Document to share
   * @param {string} collectionId - Collection ID
   * @param {Object} options - Sharing options
   * @returns {Promise<Object>} - Shared document
   */
  async shareDocument(document, collectionId, options = {}) {
    if (!this.isInitialized) {
      console.warn('DocuShareService not initialized. Initializing now...');
      await this.initialize();
    }
    
    try {
      // Verify document
      if (!document || !document.id) {
        throw new Error('Invalid document: Document ID is required');
      }
      
      // Get collection
      const collection = this.collectionCache.get(collectionId);
      if (!collection) {
        throw new Error(`Collection not found: ${collectionId}`);
      }
      
      // Check permissions
      const userId = options.userId || securityService.currentUser?.id;
      if (!collection.permissions.write.includes('*') && 
          !collection.permissions.write.includes(userId) &&
          !collection.permissions.admin.includes(userId)) {
        throw new Error('You do not have permission to share documents in this collection');
      }
      
      // Prepare shared document
      const sharedDocument = {
        id: document.id,
        name: document.name || document.title,
        type: document.type,
        sourceModule: document.module || options.sourceModule,
        originalPath: document.path,
        collectionId,
        sharedAt: new Date().toISOString(),
        sharedBy: userId,
        tags: options.tags || document.tags || [],
        metadata: {
          ...document.metadata,
          shared: true,
          sharedFrom: document.module || options.sourceModule,
          originalId: document.originalId || document.id
        }
      };
      
      // Store document in cache
      this.documentCache.set(document.id, {
        ...document,
        shared: true,
        collections: [...(document.collections || []), collectionId]
      });
      
      // Update collection
      collection.documents.push(sharedDocument.id);
      collection.documentCount = collection.documents.length;
      this.collectionCache.set(collectionId, collection);
      
      // Register document in blockchain if enabled
      if (this.config.blockchainIntegration && regulatoryIntelligenceCore.config.blockchain.enabled) {
        try {
          await regulatoryIntelligenceCore.registerDocumentWithBlockchain({
            id: document.id,
            type: document.type,
            content: JSON.stringify(document)
          });
        } catch (blockchainError) {
          console.warn('Failed to register document in blockchain:', blockchainError);
          // Continue even if blockchain registration fails
        }
      }
      
      // In production, would call API to persist shared document
      // const response = await fetch(`${API_BASE}/collections/${collectionId}/documents`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(sharedDocument)
      // });
      // const result = await response.json();
      
      return sharedDocument;
    } catch (error) {
      console.error(`Error sharing document to collection ${collectionId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get shared documents from a collection
   * @param {string} collectionId - Collection ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Shared documents
   */
  async getSharedDocuments(collectionId, options = {}) {
    if (!this.isInitialized) {
      console.warn('DocuShareService not initialized. Initializing now...');
      await this.initialize();
    }
    
    try {
      // Get collection
      const collection = this.collectionCache.get(collectionId);
      if (!collection) {
        throw new Error(`Collection not found: ${collectionId}`);
      }
      
      // Check read permissions
      const userId = options.userId || securityService.currentUser?.id;
      if (!collection.permissions.read.includes('*') && 
          !collection.permissions.read.includes(userId) &&
          !collection.permissions.write.includes(userId) &&
          !collection.permissions.admin.includes(userId)) {
        throw new Error('You do not have permission to view documents in this collection');
      }
      
      // Get documents
      const documents = collection.documents
        .map(docId => this.documentCache.get(docId))
        .filter(doc => doc !== undefined);
      
      // Apply filters
      let filteredDocuments = [...documents];
      
      if (options.type) {
        filteredDocuments = filteredDocuments.filter(
          doc => doc.type === options.type
        );
      }
      
      if (options.sourceModule) {
        filteredDocuments = filteredDocuments.filter(
          doc => doc.sourceModule === options.sourceModule
        );
      }
      
      if (options.tags && options.tags.length > 0) {
        filteredDocuments = filteredDocuments.filter(
          doc => options.tags.some(tag => doc.tags.includes(tag))
        );
      }
      
      // Apply sorting
      if (options.sort) {
        const [field, direction] = options.sort.split(':');
        const multiplier = direction === 'desc' ? -1 : 1;
        
        filteredDocuments.sort((a, b) => {
          if (field === 'name') {
            return multiplier * a.name.localeCompare(b.name);
          } else if (field === 'sharedAt') {
            return multiplier * (new Date(a.sharedAt) - new Date(b.sharedAt));
          } else {
            return 0;
          }
        });
      } else {
        // Default sort by shared date (newest first)
        filteredDocuments.sort((a, b) => new Date(b.sharedAt) - new Date(a.sharedAt));
      }
      
      return filteredDocuments;
    } catch (error) {
      console.error(`Error getting shared documents from collection ${collectionId}:`, error);
      throw error;
    }
  }
  
  /**
   * Upload document to collection
   * @param {File} file - File to upload
   * @param {string} collectionId - Collection ID
   * @param {Object} metadata - Document metadata
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} - Upload result
   */
  async uploadDocument(file, collectionId, metadata = {}, options = {}) {
    if (!this.isInitialized) {
      console.warn('DocuShareService not initialized. Initializing now...');
      await this.initialize();
    }
    
    try {
      // Get collection
      const collection = this.collectionCache.get(collectionId);
      if (!collection) {
        throw new Error(`Collection not found: ${collectionId}`);
      }
      
      // Check write permissions
      const userId = options.userId || securityService.currentUser?.id;
      if (!collection.permissions.write.includes('*') && 
          !collection.permissions.write.includes(userId) &&
          !collection.permissions.admin.includes(userId)) {
        throw new Error('You do not have permission to upload documents to this collection');
      }
      
      // Create upload ID
      const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Store upload in pendingUploads
      this.pendingUploads.set(uploadId, {
        file,
        collectionId,
        metadata,
        options,
        status: 'pending',
        progress: 0,
        startedAt: new Date().toISOString()
      });
      
      // Simulate upload process
      const processUpload = async () => {
        // Update progress
        const updateProgress = (progress) => {
          const upload = this.pendingUploads.get(uploadId);
          if (upload) {
            this.pendingUploads.set(uploadId, {
              ...upload,
              progress
            });
          }
        };
        
        try {
          // Simulate upload steps
          updateProgress(10);
          await new Promise(resolve => setTimeout(resolve, 200));
          
          updateProgress(30);
          await new Promise(resolve => setTimeout(resolve, 200));
          
          updateProgress(60);
          await new Promise(resolve => setTimeout(resolve, 200));
          
          updateProgress(90);
          
          // Create document object
          const document = {
            id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: metadata.name || file.name,
            type: metadata.type || this.detectDocumentType(file),
            size: file.size,
            fileName: file.name,
            collectionId,
            uploadedAt: new Date().toISOString(),
            uploadedBy: userId,
            tags: metadata.tags || [],
            module: collection.module,
            metadata: {
              ...metadata,
              fileType: file.type,
              originalFileName: file.name
            },
            shared: true,
            collections: [collectionId],
            sourceModule: collection.module
          };
          
          // Store document in cache
          this.documentCache.set(document.id, document);
          
          // Update collection
          collection.documents.push(document.id);
          collection.documentCount = collection.documents.length;
          this.collectionCache.set(collectionId, collection);
          
          // Register document in blockchain if enabled
          if (this.config.blockchainIntegration && regulatoryIntelligenceCore.config.blockchain.enabled) {
            try {
              await regulatoryIntelligenceCore.registerDocumentWithBlockchain({
                id: document.id,
                type: document.type,
                content: JSON.stringify(document)
              });
            } catch (blockchainError) {
              console.warn('Failed to register document in blockchain:', blockchainError);
              // Continue even if blockchain registration fails
            }
          }
          
          // Update upload status
          this.pendingUploads.set(uploadId, {
            ...this.pendingUploads.get(uploadId),
            status: 'completed',
            progress: 100,
            completedAt: new Date().toISOString(),
            document
          });
          
          // In production, would process document text with intelligence core
          if (options.processContent !== false) {
            // Simulating document processing
            console.log(`Would process document content for ${document.id}`);
          }
          
          return document;
        } catch (error) {
          // Update upload status on error
          this.pendingUploads.set(uploadId, {
            ...this.pendingUploads.get(uploadId),
            status: 'failed',
            error: error.message
          });
          
          throw error;
        }
      };
      
      // Start upload process (don't await it)
      const uploadPromise = processUpload();
      
      // Return initial upload status
      return {
        uploadId,
        status: 'started',
        message: 'Document upload started'
      };
    } catch (error) {
      console.error(`Error uploading document to collection ${collectionId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get upload status
   * @param {string} uploadId - Upload ID
   * @returns {Object} - Upload status
   */
  getUploadStatus(uploadId) {
    const upload = this.pendingUploads.get(uploadId);
    
    if (!upload) {
      return {
        status: 'not_found',
        message: `Upload not found: ${uploadId}`
      };
    }
    
    return {
      id: uploadId,
      status: upload.status,
      progress: upload.progress,
      startedAt: upload.startedAt,
      completedAt: upload.completedAt,
      document: upload.document,
      error: upload.error
    };
  }
  
  /**
   * Remove document from collection
   * @param {string} documentId - Document ID
   * @param {string} collectionId - Collection ID
   * @param {Object} options - Removal options
   * @returns {Promise<Object>} - Removal result
   */
  async removeDocument(documentId, collectionId, options = {}) {
    if (!this.isInitialized) {
      console.warn('DocuShareService not initialized. Initializing now...');
      await this.initialize();
    }
    
    try {
      // Get collection
      const collection = this.collectionCache.get(collectionId);
      if (!collection) {
        throw new Error(`Collection not found: ${collectionId}`);
      }
      
      // Check write permissions
      const userId = options.userId || securityService.currentUser?.id;
      if (!collection.permissions.write.includes('*') && 
          !collection.permissions.write.includes(userId) &&
          !collection.permissions.admin.includes(userId)) {
        throw new Error('You do not have permission to remove documents from this collection');
      }
      
      // Get document
      const document = this.documentCache.get(documentId);
      if (!document) {
        throw new Error(`Document not found: ${documentId}`);
      }
      
      // Remove document from collection
      collection.documents = collection.documents.filter(id => id !== documentId);
      collection.documentCount = collection.documents.length;
      this.collectionCache.set(collectionId, collection);
      
      // Update document collections
      document.collections = document.collections.filter(id => id !== collectionId);
      
      // If document is no longer in any collections, mark as not shared
      if (document.collections.length === 0) {
        document.shared = false;
      }
      
      this.documentCache.set(documentId, document);
      
      // In production, would call API to persist changes
      // const response = await fetch(`${API_BASE}/collections/${collectionId}/documents/${documentId}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   }
      // });
      // const result = await response.json();
      
      return {
        success: true,
        documentId,
        collectionId,
        message: 'Document removed from collection'
      };
    } catch (error) {
      console.error(`Error removing document ${documentId} from collection ${collectionId}:`, error);
      throw error;
    }
  }
  
  /**
   * Update collection
   * @param {string} collectionId - Collection ID
   * @param {Object} updates - Collection updates
   * @param {Object} options - Update options
   * @returns {Promise<Object>} - Updated collection
   */
  async updateCollection(collectionId, updates, options = {}) {
    if (!this.isInitialized) {
      console.warn('DocuShareService not initialized. Initializing now...');
      await this.initialize();
    }
    
    try {
      // Get collection
      const collection = this.collectionCache.get(collectionId);
      if (!collection) {
        throw new Error(`Collection not found: ${collectionId}`);
      }
      
      // Check admin permissions
      const userId = options.userId || securityService.currentUser?.id;
      if (!collection.permissions.admin.includes('*') && 
          !collection.permissions.admin.includes(userId)) {
        throw new Error('You do not have permission to update this collection');
      }
      
      // Update collection
      const updatedCollection = {
        ...collection,
        ...updates,
        updatedAt: new Date().toISOString(),
        updatedBy: userId
      };
      
      // Store updated collection
      this.collectionCache.set(collectionId, updatedCollection);
      
      // In production, would call API to persist changes
      // const response = await fetch(`${API_BASE}/collections/${collectionId}`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(updates)
      // });
      // const result = await response.json();
      
      return updatedCollection;
    } catch (error) {
      console.error(`Error updating collection ${collectionId}:`, error);
      throw error;
    }
  }
  
  /**
   * Search for documents across collections
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} - Search results
   */
  async searchDocuments(query, options = {}) {
    if (!this.isInitialized) {
      console.warn('DocuShareService not initialized. Initializing now...');
      await this.initialize();
    }
    
    try {
      const userId = options.userId || securityService.currentUser?.id;
      
      // Get all collections the user has access to
      const allCollections = Array.from(this.collectionCache.values());
      const accessibleCollections = allCollections.filter(
        c => c.permissions.read.includes('*') || 
             c.permissions.read.includes(userId) ||
             c.permissions.write.includes(userId) ||
             c.permissions.admin.includes(userId)
      );
      
      const accessibleCollectionIds = accessibleCollections.map(c => c.id);
      
      // Get all documents from accessible collections
      let documents = Array.from(this.documentCache.values())
        .filter(doc => doc.collections.some(cId => accessibleCollectionIds.includes(cId)));
      
      // Filter by keyword
      if (query && query.trim() !== '') {
        const normalizedQuery = query.toLowerCase();
        documents = documents.filter(
          doc => doc.name.toLowerCase().includes(normalizedQuery) ||
                 doc.tags.some(tag => tag.toLowerCase().includes(normalizedQuery)) ||
                 (doc.metadata.description && doc.metadata.description.toLowerCase().includes(normalizedQuery))
        );
      }
      
      // Apply additional filters
      if (options.module) {
        documents = documents.filter(
          doc => doc.module === options.module || doc.sourceModule === options.module
        );
      }
      
      if (options.type) {
        documents = documents.filter(
          doc => doc.type === options.type
        );
      }
      
      if (options.tags && options.tags.length > 0) {
        documents = documents.filter(
          doc => options.tags.some(tag => doc.tags.includes(tag))
        );
      }
      
      if (options.collections && options.collections.length > 0) {
        documents = documents.filter(
          doc => doc.collections.some(cId => options.collections.includes(cId))
        );
      }
      
      // Apply sorting
      if (options.sort) {
        const [field, direction] = options.sort.split(':');
        const multiplier = direction === 'desc' ? -1 : 1;
        
        documents.sort((a, b) => {
          if (field === 'name') {
            return multiplier * a.name.localeCompare(b.name);
          } else if (field === 'uploadedAt') {
            return multiplier * (new Date(a.uploadedAt) - new Date(b.uploadedAt));
          } else if (field === 'size') {
            return multiplier * (a.size - b.size);
          } else {
            return 0;
          }
        });
      } else {
        // Default sort by uploaded date (newest first)
        documents.sort((a, b) => {
          const dateA = a.uploadedAt || a.sharedAt;
          const dateB = b.uploadedAt || b.sharedAt;
          return new Date(dateB) - new Date(dateA);
        });
      }
      
      // Apply pagination
      if (options.limit) {
        const start = options.offset || 0;
        const end = start + options.limit;
        documents = documents.slice(start, end);
      }
      
      return {
        results: documents,
        total: documents.length,
        query
      };
    } catch (error) {
      console.error(`Error searching documents:`, error);
      throw error;
    }
  }
  
  /**
   * Get document by ID
   * @param {string} documentId - Document ID
   * @returns {Object|null} - Document or null if not found
   */
  getDocument(documentId) {
    return this.documentCache.get(documentId) || null;
  }
  
  /**
   * Detect document type from file
   * @param {File} file - File object
   * @returns {string} - Document type
   */
  detectDocumentType(file) {
    const fileName = file.name.toLowerCase();
    const fileType = file.type;
    
    if (fileName.includes('protocol')) {
      return 'protocol';
    } else if (fileName.includes('csr') || fileName.includes('clinical study report')) {
      return 'csr';
    } else if (fileName.includes('ib') || fileName.includes('investigator') && fileName.includes('brochure')) {
      return 'investigator_brochure';
    } else if (fileName.includes('ind') || fileName.includes('application')) {
      return 'application';
    } else if (fileName.includes('cmc')) {
      return 'cmc';
    } else if (fileType === 'application/pdf') {
      return 'document';
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
               fileType === 'application/msword') {
      return 'document';
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
               fileType === 'application/vnd.ms-excel') {
      return 'spreadsheet';
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
               fileType === 'application/vnd.ms-powerpoint') {
      return 'presentation';
    } else {
      return 'other';
    }
  }
  
  /**
   * Create document subscription
   * @param {string} documentId - Document ID
   * @param {Function} callback - Subscription callback
   * @returns {string} - Subscription ID
   */
  subscribeToDocument(documentId, callback) {
    const subscriptionId = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    this.activeSubscriptions.set(subscriptionId, {
      documentId,
      callback,
      createdAt: new Date().toISOString()
    });
    
    return subscriptionId;
  }
  
  /**
   * Remove document subscription
   * @param {string} subscriptionId - Subscription ID
   * @returns {boolean} - Whether subscription was removed
   */
  unsubscribeFromDocument(subscriptionId) {
    const removed = this.activeSubscriptions.delete(subscriptionId);
    return removed;
  }
  
  /**
   * Clear document cache
   */
  clearCache() {
    this.documentCache.clear();
    this.collectionCache.clear();
    this.pendingUploads.clear();
    console.log('DocuShareService cache cleared');
  }
}

// Create singleton instance
const docuShareService = new DocuShareService();
export default docuShareService;