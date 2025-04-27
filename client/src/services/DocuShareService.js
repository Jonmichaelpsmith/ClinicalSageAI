/**
 * DocuShare Service
 * 
 * This service provides cross-module document sharing, versioning, and collaboration
 * capabilities for the TrialSage platform. It enables seamless document workflows across
 * all platform modules and ensures consistent document management throughout the
 * regulatory lifecycle.
 * 
 * Features:
 * - Cross-module document sharing and access control
 * - Real-time collaborative editing and commenting
 * - Document versioning and change tracking
 * - Automated document routing between modules
 * - Regulatory metadata preservation
 * - Integration with blockchain verification
 * - Customizable document workflows
 */

import regulatoryIntelligenceCore from './RegulatoryIntelligenceCore';

const API_BASE = '/api/docushare';

/**
 * Document sharing levels
 */
export const SHARING_LEVELS = {
  PRIVATE: 'private',           // Only owner can access
  TEAM: 'team',                 // Team members can access
  ORGANIZATION: 'organization',  // Organization members can access
  PUBLIC: 'public'              // All authenticated users can access
};

/**
 * Document permission types
 */
export const PERMISSIONS = {
  VIEW: 'view',                 // Can view document
  COMMENT: 'comment',           // Can comment on document
  EDIT: 'edit',                 // Can edit document
  APPROVE: 'approve',           // Can approve document changes
  ADMIN: 'admin',               // Full administrative control
  OWNER: 'owner'                // Document owner
};

/**
 * Document states
 */
export const DOCUMENT_STATES = {
  DRAFT: 'draft',               // Initial draft stage
  REVIEW: 'review',             // Under review
  APPROVED: 'approved',         // Approved version
  LOCKED: 'locked',             // Locked/finalized version
  ARCHIVED: 'archived',         // Archived version
  DEPRECATED: 'deprecated',     // Deprecated version
  PUBLISHED: 'published'        // Published version
};

/**
 * Document workflow types
 */
export const WORKFLOW_TYPES = {
  SEQUENTIAL: 'sequential',     // Sequential approval workflow
  PARALLEL: 'parallel',         // Parallel approval workflow
  HYBRID: 'hybrid',             // Hybrid approval workflow
  COLLABORATIVE: 'collaborative' // Collaborative editing workflow
};

class DocuShareService {
  constructor() {
    this.currentUser = null;
    this.collaborationSessions = new Map();
    this.documentListeners = new Map();
    this.currentFilters = {};
    this.lastSyncTimestamp = null;
    this.moduleIntegrations = {
      'ind-wizard': true,
      'csr-intelligence': true,
      'trial-vault': true,
      'study-architect': true,
      'ich-wiz': true,
      'clinical-metadata': true,
      'analytics': true
    };
  }

  /**
   * Initialize DocuShare service
   * @param {Object} options - Initialization options
   * @returns {Promise<Object>} - Initialization status
   */
  async initialize(options = {}) {
    try {
      const response = await fetch(`${API_BASE}/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
      });

      if (!response.ok) {
        throw new Error(`Failed to initialize DocuShare: ${response.statusText}`);
      }

      const initStatus = await response.json();
      this.currentUser = initStatus.currentUser;
      this.lastSyncTimestamp = new Date().toISOString();
      
      // Setup real-time connections if WebSockets available
      if (initStatus.socketEnabled) {
        this._setupRealtimeConnections();
      }
      
      // Initialize blockchain verification if enabled
      if (options.enableBlockchain !== false) {
        await regulatoryIntelligenceCore.initialize({ enableBlockchain: true });
      }
      
      return initStatus;
    } catch (error) {
      console.error('Error initializing DocuShare service:', error);
      throw error;
    }
  }

  /**
   * Setup real-time connections for collaborative features
   * @private
   */
  _setupRealtimeConnections() {
    if (typeof window === 'undefined') return;
    
    // Setup WebSocket for real-time updates
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws-docushare`;
    
    try {
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = () => {
        console.log('DocuShare WebSocket connection established');
        this.socket.send(JSON.stringify({
          type: 'authenticate',
          userId: this.currentUser?.id
        }));
      };
      
      this.socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'document_update':
            this._handleDocumentUpdate(message.data);
            break;
          case 'comment_added':
            this._handleCommentAdded(message.data);
            break;
          case 'workflow_update':
            this._handleWorkflowUpdate(message.data);
            break;
          case 'collaboration_update':
            this._handleCollaborationUpdate(message.data);
            break;
        }
      };
      
      this.socket.onerror = (error) => {
        console.error('DocuShare WebSocket error:', error);
      };
      
      this.socket.onclose = () => {
        console.log('DocuShare WebSocket connection closed');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this._setupRealtimeConnections(), 5000);
      };
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
    }
  }
  
  /**
   * Handle real-time document updates
   * @param {Object} data - Update data
   * @private
   */
  _handleDocumentUpdate(data) {
    // Notify all document listeners
    if (this.documentListeners.has(data.documentId)) {
      const listeners = this.documentListeners.get(data.documentId);
      listeners.forEach(listener => {
        listener(data);
      });
    }
    
    // Update collaboration session if active
    if (this.collaborationSessions.has(data.documentId)) {
      const session = this.collaborationSessions.get(data.documentId);
      session.latestRevision = data.revision;
      session.lastUpdated = new Date().toISOString();
    }
  }
  
  /**
   * Handle real-time comment notifications
   * @param {Object} data - Comment data
   * @private
   */
  _handleCommentAdded(data) {
    // Notify document listeners about new comments
    if (this.documentListeners.has(data.documentId)) {
      const listeners = this.documentListeners.get(data.documentId);
      listeners.forEach(listener => {
        listener({
          type: 'comment_added',
          comment: data
        });
      });
    }
  }
  
  /**
   * Handle real-time workflow updates
   * @param {Object} data - Workflow update data
   * @private
   */
  _handleWorkflowUpdate(data) {
    // Notify document listeners about workflow changes
    if (this.documentListeners.has(data.documentId)) {
      const listeners = this.documentListeners.get(data.documentId);
      listeners.forEach(listener => {
        listener({
          type: 'workflow_update',
          workflow: data
        });
      });
    }
  }
  
  /**
   * Handle real-time collaboration updates
   * @param {Object} data - Collaboration update data
   * @private
   */
  _handleCollaborationUpdate(data) {
    // Update active collaboration session
    if (this.collaborationSessions.has(data.documentId)) {
      const session = this.collaborationSessions.get(data.documentId);
      
      // Update session with latest collaboration data
      session.activeUsers = data.activeUsers;
      session.cursorPositions = data.cursorPositions;
      session.lastActivity = new Date().toISOString();
      
      // Notify listeners
      if (session.listeners) {
        session.listeners.forEach(listener => {
          listener(data);
        });
      }
    }
  }

  /**
   * Get document by ID
   * @param {string} documentId - Document ID
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Document data
   */
  async getDocument(documentId, options = {}) {
    try {
      const queryParams = new URLSearchParams({
        ...options
      }).toString();

      const response = await fetch(`${API_BASE}/documents/${documentId}?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Failed to get document: ${response.statusText}`);
      }
      
      const document = await response.json();
      
      // Register for real-time updates if requested
      if (options.subscribe && this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
          type: 'subscribe',
          documentId
        }));
      }
      
      return document;
    } catch (error) {
      console.error(`Error getting document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Get document metadata
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} - Document metadata
   */
  async getDocumentMetadata(documentId) {
    try {
      const response = await fetch(`${API_BASE}/documents/${documentId}/metadata`);
      if (!response.ok) {
        throw new Error(`Failed to get document metadata: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error getting document metadata for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Get document version history
   * @param {string} documentId - Document ID
   * @param {Object} options - Request options
   * @returns {Promise<Array>} - Version history
   */
  async getDocumentVersions(documentId, options = {}) {
    try {
      const queryParams = new URLSearchParams({
        ...options
      }).toString();

      const response = await fetch(`${API_BASE}/documents/${documentId}/versions?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Failed to get document versions: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error getting document versions for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Create new document
   * @param {Object} document - Document data
   * @param {Object} options - Creation options
   * @returns {Promise<Object>} - Created document
   */
  async createDocument(document, options = {}) {
    try {
      const response = await fetch(`${API_BASE}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          document,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create document: ${response.statusText}`);
      }

      const createdDocument = await response.json();
      
      // Create blockchain verification if requested
      if (options.enableBlockchain) {
        try {
          const blockchainResult = await regulatoryIntelligenceCore.addDocumentToBlockchain(
            createdDocument.id,
            'document_creation',
            { documentType: document.documentType }
          );
          
          createdDocument.blockchain = blockchainResult;
        } catch (blockchainError) {
          console.error('Error adding document to blockchain:', blockchainError);
        }
      }
      
      return createdDocument;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  /**
   * Update existing document
   * @param {string} documentId - Document ID
   * @param {Object} updates - Document updates
   * @param {Object} options - Update options
   * @returns {Promise<Object>} - Updated document
   */
  async updateDocument(documentId, updates, options = {}) {
    try {
      const response = await fetch(`${API_BASE}/documents/${documentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          updates,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update document: ${response.statusText}`);
      }

      const updatedDocument = await response.json();
      
      // Create blockchain verification if requested
      if (options.enableBlockchain) {
        try {
          const blockchainResult = await regulatoryIntelligenceCore.addDocumentToBlockchain(
            documentId,
            'document_update',
            { 
              documentType: updatedDocument.documentType,
              revisionNumber: updatedDocument.revision
            }
          );
          
          updatedDocument.blockchain = blockchainResult;
        } catch (blockchainError) {
          console.error('Error adding document update to blockchain:', blockchainError);
        }
      }
      
      return updatedDocument;
    } catch (error) {
      console.error(`Error updating document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Delete document
   * @param {string} documentId - Document ID
   * @param {Object} options - Deletion options
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteDocument(documentId, options = {}) {
    try {
      const queryParams = new URLSearchParams({
        ...options
      }).toString();

      const response = await fetch(`${API_BASE}/documents/${documentId}?${queryParams}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete document: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Create blockchain audit trail for deletion
      if (options.enableBlockchain) {
        try {
          await regulatoryIntelligenceCore.createBlockchainAuditTrail(
            'document',
            documentId,
            {
              action: 'document_deletion',
              reason: options.reason || 'User requested deletion'
            }
          );
        } catch (blockchainError) {
          console.error('Error creating blockchain audit trail for deletion:', blockchainError);
        }
      }
      
      return result;
    } catch (error) {
      console.error(`Error deleting document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Share document with users or teams
   * @param {string} documentId - Document ID
   * @param {Object} shareSettings - Share settings
   * @returns {Promise<Object>} - Updated sharing status
   */
  async shareDocument(documentId, shareSettings) {
    try {
      const response = await fetch(`${API_BASE}/documents/${documentId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shareSettings)
      });

      if (!response.ok) {
        throw new Error(`Failed to share document: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error sharing document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Get document sharing settings
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} - Sharing settings
   */
  async getDocumentSharing(documentId) {
    try {
      const response = await fetch(`${API_BASE}/documents/${documentId}/share`);
      if (!response.ok) {
        throw new Error(`Failed to get document sharing: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error getting document sharing for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Start collaborative editing session
   * @param {string} documentId - Document ID
   * @param {Object} options - Collaboration options
   * @returns {Promise<Object>} - Collaboration session
   */
  async startCollaboration(documentId, options = {}) {
    try {
      const response = await fetch(`${API_BASE}/documents/${documentId}/collaborate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
      });

      if (!response.ok) {
        throw new Error(`Failed to start collaboration: ${response.statusText}`);
      }

      const session = await response.json();
      
      // Register collaboration session
      this.collaborationSessions.set(documentId, {
        ...session,
        listeners: new Set(),
        lastActivity: new Date().toISOString()
      });
      
      // Subscribe to real-time updates
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
          type: 'join_collaboration',
          documentId,
          sessionId: session.id
        }));
      }
      
      return session;
    } catch (error) {
      console.error(`Error starting collaboration for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * End collaborative editing session
   * @param {string} documentId - Document ID
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} - End session result
   */
  async endCollaboration(documentId, sessionId) {
    try {
      const response = await fetch(`${API_BASE}/documents/${documentId}/collaborate/${sessionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to end collaboration: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Clean up collaboration session
      this.collaborationSessions.delete(documentId);
      
      // Unsubscribe from real-time updates
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
          type: 'leave_collaboration',
          documentId,
          sessionId
        }));
      }
      
      return result;
    } catch (error) {
      console.error(`Error ending collaboration for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Send collaborative editing update
   * @param {string} documentId - Document ID
   * @param {string} sessionId - Session ID
   * @param {Object} update - Collaboration update
   * @returns {Promise<Object>} - Update result
   */
  async sendCollaborationUpdate(documentId, sessionId, update) {
    try {
      const response = await fetch(`${API_BASE}/documents/${documentId}/collaborate/${sessionId}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(update)
      });

      if (!response.ok) {
        throw new Error(`Failed to send collaboration update: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error sending collaboration update for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Add comment to document
   * @param {string} documentId - Document ID
   * @param {Object} comment - Comment data
   * @returns {Promise<Object>} - Created comment
   */
  async addComment(documentId, comment) {
    try {
      const response = await fetch(`${API_BASE}/documents/${documentId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(comment)
      });

      if (!response.ok) {
        throw new Error(`Failed to add comment: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error adding comment to ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Get comments for a document
   * @param {string} documentId - Document ID
   * @param {Object} options - Request options
   * @returns {Promise<Array>} - Document comments
   */
  async getComments(documentId, options = {}) {
    try {
      const queryParams = new URLSearchParams({
        ...options
      }).toString();

      const response = await fetch(`${API_BASE}/documents/${documentId}/comments?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Failed to get comments: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error getting comments for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Create document workflow
   * @param {string} documentId - Document ID
   * @param {Object} workflow - Workflow definition
   * @returns {Promise<Object>} - Created workflow
   */
  async createWorkflow(documentId, workflow) {
    try {
      const response = await fetch(`${API_BASE}/documents/${documentId}/workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workflow)
      });

      if (!response.ok) {
        throw new Error(`Failed to create workflow: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error creating workflow for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Get document workflow status
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} - Workflow status
   */
  async getWorkflowStatus(documentId) {
    try {
      const response = await fetch(`${API_BASE}/documents/${documentId}/workflow`);
      if (!response.ok) {
        throw new Error(`Failed to get workflow status: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error getting workflow status for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Update workflow status
   * @param {string} documentId - Document ID
   * @param {string} workflowId - Workflow ID
   * @param {Object} update - Workflow update
   * @returns {Promise<Object>} - Updated workflow
   */
  async updateWorkflow(documentId, workflowId, update) {
    try {
      const response = await fetch(`${API_BASE}/documents/${documentId}/workflow/${workflowId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(update)
      });

      if (!response.ok) {
        throw new Error(`Failed to update workflow: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating workflow ${workflowId}:`, error);
      throw error;
    }
  }

  /**
   * Approve document in workflow
   * @param {string} documentId - Document ID
   * @param {string} workflowId - Workflow ID
   * @param {Object} approval - Approval data
   * @returns {Promise<Object>} - Approval result
   */
  async approveDocument(documentId, workflowId, approval) {
    try {
      const response = await fetch(`${API_BASE}/documents/${documentId}/workflow/${workflowId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(approval)
      });

      if (!response.ok) {
        throw new Error(`Failed to approve document: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Create blockchain verification for approval
      try {
        const blockchainResult = await regulatoryIntelligenceCore.createBlockchainAuditTrail(
          'workflow',
          workflowId,
          {
            action: 'document_approval',
            documentId,
            workflowId,
            approver: this.currentUser?.id,
            timestamp: new Date().toISOString()
          }
        );
        
        result.blockchain = blockchainResult;
      } catch (blockchainError) {
        console.error('Error creating blockchain audit trail for approval:', blockchainError);
      }
      
      return result;
    } catch (error) {
      console.error(`Error approving document ${documentId} in workflow ${workflowId}:`, error);
      throw error;
    }
  }

  /**
   * Reject document in workflow
   * @param {string} documentId - Document ID
   * @param {string} workflowId - Workflow ID
   * @param {Object} rejection - Rejection data
   * @returns {Promise<Object>} - Rejection result
   */
  async rejectDocument(documentId, workflowId, rejection) {
    try {
      const response = await fetch(`${API_BASE}/documents/${documentId}/workflow/${workflowId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rejection)
      });

      if (!response.ok) {
        throw new Error(`Failed to reject document: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Create blockchain verification for rejection
      try {
        const blockchainResult = await regulatoryIntelligenceCore.createBlockchainAuditTrail(
          'workflow',
          workflowId,
          {
            action: 'document_rejection',
            documentId,
            workflowId,
            rejector: this.currentUser?.id,
            reason: rejection.reason,
            timestamp: new Date().toISOString()
          }
        );
        
        result.blockchain = blockchainResult;
      } catch (blockchainError) {
        console.error('Error creating blockchain audit trail for rejection:', blockchainError);
      }
      
      return result;
    } catch (error) {
      console.error(`Error rejecting document ${documentId} in workflow ${workflowId}:`, error);
      throw error;
    }
  }

  /**
   * Search for documents
   * @param {Object} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} - Search results
   */
  async searchDocuments(query, options = {}) {
    try {
      const response = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          options
        })
      });

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
   * Transfer document to another module
   * @param {string} documentId - Document ID
   * @param {string} targetModule - Target module
   * @param {Object} options - Transfer options
   * @returns {Promise<Object>} - Transfer result
   */
  async transferToModule(documentId, targetModule, options = {}) {
    try {
      const response = await fetch(`${API_BASE}/documents/${documentId}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetModule,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to transfer document: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Create blockchain audit trail for transfer
      if (options.enableBlockchain) {
        try {
          const blockchainResult = await regulatoryIntelligenceCore.createBlockchainAuditTrail(
            'document',
            documentId,
            {
              action: 'document_transfer',
              sourceModule: result.sourceModule,
              targetModule,
              timestamp: new Date().toISOString()
            }
          );
          
          result.blockchain = blockchainResult;
        } catch (blockchainError) {
          console.error('Error creating blockchain audit trail for transfer:', blockchainError);
        }
      }
      
      return result;
    } catch (error) {
      console.error(`Error transferring document ${documentId} to ${targetModule}:`, error);
      throw error;
    }
  }

  /**
   * Get document access history
   * @param {string} documentId - Document ID
   * @param {Object} options - History options
   * @returns {Promise<Array>} - Access history
   */
  async getDocumentAccessHistory(documentId, options = {}) {
    try {
      const queryParams = new URLSearchParams({
        ...options
      }).toString();

      const response = await fetch(`${API_BASE}/documents/${documentId}/access-history?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Failed to get access history: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error getting access history for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Verify document with blockchain
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} - Verification result
   */
  async verifyWithBlockchain(documentId) {
    try {
      return await regulatoryIntelligenceCore.verifyDocumentWithBlockchain(documentId);
    } catch (error) {
      console.error(`Error verifying document ${documentId} with blockchain:`, error);
      throw error;
    }
  }

  /**
   * Get document audit trail
   * @param {string} documentId - Document ID
   * @param {Object} options - Audit options
   * @returns {Promise<Array>} - Audit trail
   */
  async getDocumentAuditTrail(documentId, options = {}) {
    try {
      const queryParams = new URLSearchParams({
        ...options
      }).toString();

      const response = await fetch(`${API_BASE}/documents/${documentId}/audit-trail?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Failed to get audit trail: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error getting audit trail for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Export document to format
   * @param {string} documentId - Document ID
   * @param {string} format - Export format
   * @param {Object} options - Export options
   * @returns {Promise<Object>} - Export result
   */
  async exportDocument(documentId, format, options = {}) {
    try {
      const response = await fetch(`${API_BASE}/documents/${documentId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to export document: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error exporting document ${documentId} to ${format}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to document updates
   * @param {string} documentId - Document ID
   * @param {Function} listener - Update listener
   * @returns {string} - Subscription ID
   */
  subscribeToDocumentUpdates(documentId, listener) {
    const subscriptionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    if (!this.documentListeners.has(documentId)) {
      this.documentListeners.set(documentId, new Map());
    }
    
    this.documentListeners.get(documentId).set(subscriptionId, listener);
    
    // Subscribe to real-time updates if available
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'subscribe',
        documentId
      }));
    }
    
    return subscriptionId;
  }

  /**
   * Unsubscribe from document updates
   * @param {string} documentId - Document ID
   * @param {string} subscriptionId - Subscription ID
   */
  unsubscribeFromDocumentUpdates(documentId, subscriptionId) {
    if (this.documentListeners.has(documentId)) {
      this.documentListeners.get(documentId).delete(subscriptionId);
      
      // If no more listeners, unsubscribe from real-time updates
      if (this.documentListeners.get(documentId).size === 0) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.send(JSON.stringify({
            type: 'unsubscribe',
            documentId
          }));
        }
      }
    }
  }
}

// Create singleton instance
const docuShareService = new DocuShareService();
export default docuShareService;