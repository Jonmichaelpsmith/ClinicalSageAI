/**
 * DocuShare Service
 * 
 * This service enables document sharing and management across modules in the TrialSage platform.
 */

class DocuShareService {
  constructor() {
    this.initialized = false;
    this.connected = false;
    this.documents = [];
    this.sharedDocuments = [];
    this.documentSubscriptions = [];
    this.status = 'disconnected';
    this.connectionError = null;
  }
  
  // Initialize DocuShare service
  async initialize() {
    try {
      console.log('[DocuShare] Initializing DocuShare service...');
      
      // In a real implementation, this would connect to a document sharing service
      // For now, simulated with a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.initialized = true;
      this.connected = true;
      this.status = 'connected';
      
      console.log('[DocuShare] DocuShare service initialized successfully');
      
      return true;
    } catch (error) {
      console.error('[DocuShare] Initialization error:', error);
      this.status = 'error';
      this.connectionError = error;
      throw error;
    }
  }
  
  // Share document between modules
  async shareDocument({ document, sourceModule, targetModule, user, organization }) {
    if (!this.initialized || !this.connected) {
      throw new Error('DocuShare service not initialized or disconnected');
    }
    
    try {
      console.log(`[DocuShare] Sharing document from ${sourceModule} to ${targetModule}...`);
      
      if (!document || !document.id) {
        throw new Error('Invalid document: Document ID is required');
      }
      
      if (!sourceModule) {
        throw new Error('Invalid source module: Source module is required');
      }
      
      if (!targetModule) {
        throw new Error('Invalid target module: Target module is required');
      }
      
      const sharedDocument = {
        ...document,
        sharedId: `${document.id}-${Date.now()}`,
        sourceModule,
        targetModule,
        sharedBy: user?.id || 'unknown',
        organizationId: organization?.id || 'unknown',
        sharedAt: new Date().toISOString(),
        status: 'shared'
      };
      
      // In a real implementation, record the shared document in a database or service
      // For now, just add to the internal list
      this.sharedDocuments.push(sharedDocument);
      
      console.log(`[DocuShare] Document shared successfully: ${sharedDocument.sharedId}`);
      
      // Notify subscribers
      this.notifyDocumentSubscribers(sharedDocument);
      
      return {
        success: true,
        document: sharedDocument
      };
    } catch (error) {
      console.error('[DocuShare] Error sharing document:', error);
      throw error;
    }
  }
  
  // Get shared documents for a module
  async getSharedDocuments(moduleId, filters = {}) {
    if (!this.initialized || !this.connected) {
      throw new Error('DocuShare service not initialized or disconnected');
    }
    
    try {
      console.log(`[DocuShare] Getting shared documents for module: ${moduleId}...`);
      
      let filteredDocuments = this.sharedDocuments.filter(doc => 
        doc.targetModule === moduleId || doc.sourceModule === moduleId
      );
      
      // Apply additional filters
      if (filters.status) {
        filteredDocuments = filteredDocuments.filter(doc => doc.status === filters.status);
      }
      
      if (filters.documentType) {
        filteredDocuments = filteredDocuments.filter(doc => doc.type === filters.documentType);
      }
      
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        filteredDocuments = filteredDocuments.filter(doc => new Date(doc.sharedAt) >= startDate);
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        filteredDocuments = filteredDocuments.filter(doc => new Date(doc.sharedAt) <= endDate);
      }
      
      // Sort by shared date (newest first)
      filteredDocuments.sort((a, b) => new Date(b.sharedAt) - new Date(a.sharedAt));
      
      console.log(`[DocuShare] Found ${filteredDocuments.length} shared documents for module: ${moduleId}`);
      
      return filteredDocuments;
    } catch (error) {
      console.error('[DocuShare] Error getting shared documents:', error);
      throw error;
    }
  }
  
  // Get a specific shared document
  async getSharedDocument(sharedId) {
    if (!this.initialized || !this.connected) {
      throw new Error('DocuShare service not initialized or disconnected');
    }
    
    try {
      console.log(`[DocuShare] Getting shared document: ${sharedId}...`);
      
      const sharedDocument = this.sharedDocuments.find(doc => doc.sharedId === sharedId);
      
      if (!sharedDocument) {
        throw new Error(`Shared document not found: ${sharedId}`);
      }
      
      return sharedDocument;
    } catch (error) {
      console.error('[DocuShare] Error getting shared document:', error);
      throw error;
    }
  }
  
  // Subscribe to document events for a module
  subscribeToDocuments(moduleId, callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    
    const subscriptionId = `${moduleId}-${Date.now()}`;
    
    this.documentSubscriptions.push({
      id: subscriptionId,
      moduleId,
      callback
    });
    
    console.log(`[DocuShare] Module ${moduleId} subscribed to document events`);
    
    // Return subscription object with unsubscribe method
    return {
      id: subscriptionId,
      unsubscribe: () => {
        this.documentSubscriptions = this.documentSubscriptions.filter(sub => sub.id !== subscriptionId);
        console.log(`[DocuShare] Module ${moduleId} unsubscribed from document events`);
      }
    };
  }
  
  // Notify document subscribers
  notifyDocumentSubscribers(document) {
    // Find all subscribers for the source and target modules
    const subscriptions = this.documentSubscriptions.filter(sub => 
      sub.moduleId === document.sourceModule || sub.moduleId === document.targetModule
    );
    
    // Notify each subscriber
    subscriptions.forEach(subscription => {
      try {
        subscription.callback(document);
      } catch (error) {
        console.error(`[DocuShare] Error notifying subscriber ${subscription.id}:`, error);
      }
    });
  }
  
  // Update document status
  async updateDocumentStatus(sharedId, status, metadata = {}) {
    if (!this.initialized || !this.connected) {
      throw new Error('DocuShare service not initialized or disconnected');
    }
    
    try {
      console.log(`[DocuShare] Updating document status: ${sharedId} to ${status}...`);
      
      const documentIndex = this.sharedDocuments.findIndex(doc => doc.sharedId === sharedId);
      
      if (documentIndex === -1) {
        throw new Error(`Shared document not found: ${sharedId}`);
      }
      
      // Update the document status
      const updatedDocument = {
        ...this.sharedDocuments[documentIndex],
        status,
        updatedAt: new Date().toISOString(),
        ...metadata
      };
      
      // Update in the list
      this.sharedDocuments[documentIndex] = updatedDocument;
      
      // Notify subscribers
      this.notifyDocumentSubscribers(updatedDocument);
      
      console.log(`[DocuShare] Document status updated successfully: ${sharedId}`);
      
      return updatedDocument;
    } catch (error) {
      console.error('[DocuShare] Error updating document status:', error);
      throw error;
    }
  }
  
  // Delete a shared document
  async deleteSharedDocument(sharedId) {
    if (!this.initialized || !this.connected) {
      throw new Error('DocuShare service not initialized or disconnected');
    }
    
    try {
      console.log(`[DocuShare] Deleting shared document: ${sharedId}...`);
      
      const documentIndex = this.sharedDocuments.findIndex(doc => doc.sharedId === sharedId);
      
      if (documentIndex === -1) {
        throw new Error(`Shared document not found: ${sharedId}`);
      }
      
      // Get the document to notify subscribers
      const deletedDocument = {
        ...this.sharedDocuments[documentIndex],
        status: 'deleted',
        deletedAt: new Date().toISOString()
      };
      
      // Remove from the list
      this.sharedDocuments.splice(documentIndex, 1);
      
      // Notify subscribers
      this.notifyDocumentSubscribers(deletedDocument);
      
      console.log(`[DocuShare] Document deleted successfully: ${sharedId}`);
      
      return { success: true, documentId: sharedId };
    } catch (error) {
      console.error('[DocuShare] Error deleting shared document:', error);
      throw error;
    }
  }
  
  // Get recent documents
  async getRecentDocuments(limit = 10) {
    if (!this.initialized || !this.connected) {
      throw new Error('DocuShare service not initialized or disconnected');
    }
    
    try {
      console.log(`[DocuShare] Getting recent documents (limit: ${limit})...`);
      
      // Sort by shared date (newest first)
      const sortedDocuments = [...this.sharedDocuments]
        .sort((a, b) => new Date(b.sharedAt) - new Date(a.sharedAt))
        .slice(0, limit);
      
      return sortedDocuments;
    } catch (error) {
      console.error('[DocuShare] Error getting recent documents:', error);
      throw error;
    }
  }
  
  // Check the current connection status
  getStatus() {
    return {
      initialized: this.initialized,
      connected: this.connected,
      status: this.status,
      error: this.connectionError,
      documentCount: this.sharedDocuments.length,
      subscriptionCount: this.documentSubscriptions.length
    };
  }
  
  // Disconnect from DocuShare service
  disconnect() {
    if (this.connected) {
      console.log('[DocuShare] Disconnecting DocuShare service...');
      
      this.connected = false;
      this.status = 'disconnected';
      
      console.log('[DocuShare] DocuShare service disconnected');
    }
    
    return true;
  }
}

// Export as singleton instance
const docuShareService = new DocuShareService();
export default docuShareService;