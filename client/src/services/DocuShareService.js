/**
 * DocuShare Service
 * 
 * This service handles document management and sharing across 
 * the TrialSage platform. It provides a unified interface for 
 * working with documents across all modules.
 */

import securityService from './SecurityService';

class DocuShareService {
  constructor() {
    // Simulate a document database
    this.documents = [
      { 
        id: 'doc-001', 
        title: 'Protocol v1.2', 
        type: 'protocol', 
        status: 'verified',
        dateAdded: '2024-03-15',
        lastModified: '2024-03-20',
        size: '2.4 MB',
        verifiedAt: '2024-03-21',
        owner: 'John Smith',
        module: 'trial-vault',
        organizationId: 'org-001',
        tags: ['oncology', 'phase-2', 'active']
      },
      { 
        id: 'doc-002', 
        title: 'Informed Consent Form', 
        type: 'form', 
        status: 'verified',
        dateAdded: '2024-03-10',
        lastModified: '2024-03-12',
        size: '0.8 MB',
        verifiedAt: '2024-03-13',
        owner: 'Sarah Johnson',
        module: 'trial-vault',
        organizationId: 'org-001',
        tags: ['consent', 'active']
      },
      { 
        id: 'doc-003', 
        title: 'Statistical Analysis Plan', 
        type: 'analysis', 
        status: 'pending',
        dateAdded: '2024-03-22',
        lastModified: '2024-03-22',
        size: '1.5 MB',
        verifiedAt: null,
        owner: 'Michael Lee',
        module: 'trial-vault',
        organizationId: 'org-001',
        tags: ['statistics', 'draft']
      },
      { 
        id: 'doc-004', 
        title: 'IND Application Draft', 
        type: 'regulatory', 
        status: 'draft',
        dateAdded: '2024-03-18',
        lastModified: '2024-03-25',
        size: '5.2 MB',
        verifiedAt: null,
        owner: 'John Smith',
        module: 'ind-wizard',
        organizationId: 'org-001',
        tags: ['ind', 'fda', 'draft']
      },
      { 
        id: 'doc-005', 
        title: 'Phase 2 Oncology Study CSR', 
        type: 'csr', 
        status: 'in-progress',
        dateAdded: '2024-03-05',
        lastModified: '2024-03-24',
        size: '8.7 MB',
        verifiedAt: null,
        owner: 'Emily Davis',
        module: 'csr-intelligence',
        organizationId: 'org-001',
        tags: ['csr', 'oncology', 'phase-2']
      },
      { 
        id: 'doc-006', 
        title: 'Study Design Templates', 
        type: 'template', 
        status: 'verified',
        dateAdded: '2024-02-28',
        lastModified: '2024-03-01',
        size: '1.3 MB',
        verifiedAt: '2024-03-02',
        owner: 'Michael Lee',
        module: 'study-architect',
        organizationId: 'org-001',
        tags: ['template', 'design']
      }
    ];
    
    // Document shares
    this.shares = [
      {
        documentId: 'doc-001',
        sharedWith: [
          {
            type: 'user',
            id: 'user-003',
            name: 'Sarah Johnson',
            accessLevel: 'view',
            expiresAt: '2024-05-01'
          },
          {
            type: 'user',
            id: 'user-004',
            name: 'Michael Lee',
            accessLevel: 'edit',
            expiresAt: '2024-05-15'
          },
          {
            type: 'group',
            id: 'group-001',
            name: 'FDA Review Team',
            accessLevel: 'view',
            expiresAt: '2024-06-30'
          }
        ]
      },
      {
        documentId: 'doc-002',
        sharedWith: [
          {
            type: 'group',
            id: 'group-002',
            name: 'IRB Committee',
            accessLevel: 'view',
            expiresAt: '2024-05-15'
          },
          {
            type: 'group',
            id: 'group-003',
            name: 'Site Coordinators',
            accessLevel: 'view',
            expiresAt: '2024-06-01'
          }
        ]
      }
    ];
    
    // Document version history
    this.versions = {
      'doc-001': [
        {
          version: 'v1.2',
          createdAt: '2024-03-20',
          createdBy: 'John Smith',
          comments: 'Updated per FDA feedback',
          size: '2.4 MB'
        },
        {
          version: 'v1.1',
          createdAt: '2024-02-28',
          createdBy: 'John Smith',
          comments: 'Incorporated biostatistics feedback',
          size: '2.3 MB'
        },
        {
          version: 'v1.0',
          createdAt: '2024-02-15',
          createdBy: 'Emily Davis',
          comments: 'Initial version',
          size: '2.1 MB'
        }
      ]
    };
  }
  
  /**
   * Get all documents for the current organization/module
   * @param {object} options - Filter options
   * @returns {Promise<Array>} Array of documents
   */
  async getDocuments(options = {}) {
    console.log('[DocuShare] Getting documents with options:', options);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get current organization ID
    const organizationId = securityService.currentOrganization?.id;
    if (!organizationId) {
      throw new Error('No organization selected');
    }
    
    // Filter documents by organization
    let filteredDocs = this.documents.filter(doc => 
      doc.organizationId === organizationId
    );
    
    // Apply module filter if provided
    if (options.module) {
      filteredDocs = filteredDocs.filter(doc => 
        doc.module === options.module
      );
    }
    
    // Apply type filter if provided
    if (options.type) {
      filteredDocs = filteredDocs.filter(doc => 
        doc.type === options.type
      );
    }
    
    // Apply status filter if provided
    if (options.status) {
      filteredDocs = filteredDocs.filter(doc => 
        doc.status === options.status
      );
    }
    
    // Apply tags filter if provided
    if (options.tags && options.tags.length > 0) {
      filteredDocs = filteredDocs.filter(doc => 
        options.tags.some(tag => doc.tags.includes(tag))
      );
    }
    
    // Apply search query if provided
    if (options.query) {
      const query = options.query.toLowerCase();
      filteredDocs = filteredDocs.filter(doc => 
        doc.title.toLowerCase().includes(query) ||
        doc.owner.toLowerCase().includes(query) ||
        doc.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Sort documents
    if (options.sortBy) {
      const sortField = options.sortBy;
      const sortDirection = options.sortDirection === 'desc' ? -1 : 1;
      
      filteredDocs.sort((a, b) => {
        if (a[sortField] < b[sortField]) return -1 * sortDirection;
        if (a[sortField] > b[sortField]) return 1 * sortDirection;
        return 0;
      });
    } else {
      // Default sort by last modified date (newest first)
      filteredDocs.sort((a, b) => {
        return new Date(b.lastModified) - new Date(a.lastModified);
      });
    }
    
    return filteredDocs;
  }
  
  /**
   * Get a single document by ID
   * @param {string} documentId - Document ID
   * @returns {Promise<object>} Document object
   */
  async getDocument(documentId) {
    console.log(`[DocuShare] Getting document: ${documentId}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const document = this.documents.find(doc => doc.id === documentId);
    
    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }
    
    // Check if current organization has access to this document
    const organizationId = securityService.currentOrganization?.id;
    if (!organizationId || document.organizationId !== organizationId) {
      throw new Error('Access denied to this document');
    }
    
    return document;
  }
  
  /**
   * Get document version history
   * @param {string} documentId - Document ID
   * @returns {Promise<Array>} Array of versions
   */
  async getDocumentVersions(documentId) {
    console.log(`[DocuShare] Getting versions for document: ${documentId}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Check if document exists
    const document = await this.getDocument(documentId);
    
    // Get versions for this document
    const versions = this.versions[documentId] || [];
    
    return versions;
  }
  
  /**
   * Upload a new document
   * @param {object} documentData - Document data
   * @returns {Promise<object>} Newly created document
   */
  async uploadDocument(documentData) {
    console.log('[DocuShare] Uploading document:', documentData);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Validate required fields
    if (!documentData.title || !documentData.type) {
      throw new Error('Title and type are required');
    }
    
    // Get current organization and user
    const organizationId = securityService.currentOrganization?.id;
    const user = securityService.currentUser;
    
    if (!organizationId || !user) {
      throw new Error('Not authenticated or no organization selected');
    }
    
    // Create new document
    const newDocument = {
      id: `doc-${Date.now()}`,
      title: documentData.title,
      type: documentData.type,
      status: 'pending',
      dateAdded: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      size: documentData.size || '0 KB',
      verifiedAt: null,
      owner: `${user.firstName} ${user.lastName}`,
      module: documentData.module || 'trial-vault',
      organizationId,
      tags: documentData.tags || []
    };
    
    // Add to documents collection
    this.documents.push(newDocument);
    
    return newDocument;
  }
  
  /**
   * Update an existing document
   * @param {string} documentId - Document ID
   * @param {object} updates - Fields to update
   * @returns {Promise<object>} Updated document
   */
  async updateDocument(documentId, updates) {
    console.log(`[DocuShare] Updating document ${documentId}:`, updates);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find document index
    const documentIndex = this.documents.findIndex(doc => doc.id === documentId);
    
    if (documentIndex === -1) {
      throw new Error(`Document not found: ${documentId}`);
    }
    
    // Check if current organization has access to this document
    const organizationId = securityService.currentOrganization?.id;
    if (!organizationId || this.documents[documentIndex].organizationId !== organizationId) {
      throw new Error('Access denied to this document');
    }
    
    // Update document fields
    const updatedDocument = {
      ...this.documents[documentIndex],
      ...updates,
      lastModified: new Date().toISOString().split('T')[0]
    };
    
    // Replace document in collection
    this.documents[documentIndex] = updatedDocument;
    
    return updatedDocument;
  }
  
  /**
   * Delete a document
   * @param {string} documentId - Document ID
   * @returns {Promise<boolean>} Success indicator
   */
  async deleteDocument(documentId) {
    console.log(`[DocuShare] Deleting document: ${documentId}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find document index
    const documentIndex = this.documents.findIndex(doc => doc.id === documentId);
    
    if (documentIndex === -1) {
      throw new Error(`Document not found: ${documentId}`);
    }
    
    // Check if current organization has access to this document
    const organizationId = securityService.currentOrganization?.id;
    if (!organizationId || this.documents[documentIndex].organizationId !== organizationId) {
      throw new Error('Access denied to this document');
    }
    
    // Remove document from collection
    this.documents.splice(documentIndex, 1);
    
    // Remove any shares or versions
    this.shares = this.shares.filter(share => share.documentId !== documentId);
    delete this.versions[documentId];
    
    return true;
  }
  
  /**
   * Share a document with users or groups
   * @param {string} documentId - Document ID
   * @param {Array} recipients - Array of recipient objects
   * @param {string} accessLevel - Access level (view, edit, admin)
   * @param {string} expiresAt - Expiration date (YYYY-MM-DD)
   * @returns {Promise<object>} Updated share information
   */
  async shareDocument(documentId, recipients, accessLevel, expiresAt) {
    console.log(`[DocuShare] Sharing document ${documentId} with:`, recipients);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if document exists
    const document = await this.getDocument(documentId);
    
    // Find existing share for this document
    let documentShare = this.shares.find(share => share.documentId === documentId);
    
    // Create new share if none exists
    if (!documentShare) {
      documentShare = {
        documentId,
        sharedWith: []
      };
      
      this.shares.push(documentShare);
    }
    
    // Add recipients to the share
    recipients.forEach(recipient => {
      // Check if recipient already exists
      const existingIndex = documentShare.sharedWith.findIndex(
        r => r.type === recipient.type && r.id === recipient.id
      );
      
      const shareEntry = {
        type: recipient.type,
        id: recipient.id,
        name: recipient.name,
        accessLevel,
        expiresAt
      };
      
      if (existingIndex !== -1) {
        // Update existing recipient
        documentShare.sharedWith[existingIndex] = shareEntry;
      } else {
        // Add new recipient
        documentShare.sharedWith.push(shareEntry);
      }
    });
    
    return documentShare;
  }
  
  /**
   * Verify a document with blockchain
   * @param {string} documentId - Document ID
   * @returns {Promise<object>} Verification result
   */
  async verifyDocument(documentId) {
    console.log(`[DocuShare] Verifying document: ${documentId}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find document
    const documentIndex = this.documents.findIndex(doc => doc.id === documentId);
    
    if (documentIndex === -1) {
      throw new Error(`Document not found: ${documentId}`);
    }
    
    // Update document status to verified
    this.documents[documentIndex] = {
      ...this.documents[documentIndex],
      status: 'verified',
      verifiedAt: new Date().toISOString().split('T')[0]
    };
    
    return {
      verified: true,
      document: this.documents[documentIndex],
      verificationHash: Math.random().toString(36).substring(2, 15)
    };
  }
}

// Export a singleton instance
const docuShareService = new DocuShareService();
export default docuShareService;