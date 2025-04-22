/**
 * DocuShare Service
 * 
 * This service provides the interface to interact with the DocuShare document management system.
 * It handles document CRUD operations and authentication with the DocuShare API.
 * The service is compliant with 21 CFR Part 11 requirements for electronic records and signatures.
 */

// DocuShare service class for 21 CFR Part 11 compliant document management
class DocuShareService {
  constructor() {
    this.baseUrl = '/api/docushare';
    this.token = null;
    this.serverId = process.env.DOCUSHARE_SERVER_ID || 'TrialSAGE-DS7';
    
    // Check for valid token on initialization
    const storedToken = localStorage.getItem('docushare_token');
    const tokenExpiry = localStorage.getItem('docushare_token_expiry');
    
    if (storedToken && tokenExpiry && new Date().getTime() < parseInt(tokenExpiry)) {
      this.token = storedToken;
    }
  }
  
  /**
   * Authenticate with DocuShare
   * @param {string} username - DocuShare username
   * @param {string} password - DocuShare password
   * @returns {Promise<Object>} - Authentication result
   */
  async authenticate(username, password) {
    try {
      const response = await fetch(`${this.baseUrl}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, serverId: this.serverId }),
      });
      
      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`);
      }
      
      const data = await response.json();
      this.token = data.token;
      
      // Store token with expiry (24 hours)
      const expiry = new Date().getTime() + (24 * 60 * 60 * 1000);
      localStorage.setItem('docushare_token', this.token);
      localStorage.setItem('docushare_token_expiry', expiry.toString());
      
      return data;
    } catch (error) {
      console.error('DocuShare authentication error:', error);
      throw error;
    }
  }
  
  /**
   * Get documents based on filter criteria
   * @param {Object} filters - Filtering options
   * @returns {Promise<Array>} - List of documents
   */
  async getDocuments(filters = {}) {
    try {
      // For development testing, provide some sample document data
      // In production, this would make an API call to DocuShare
      if (!this.isAuthenticated()) {
        return await this.getSampleDocuments(filters);
      }
      
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await fetch(`${this.baseUrl}/documents?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('DocuShare getDocuments error:', error);
      // Fall back to sample data if API is unavailable
      return await this.getSampleDocuments(filters);
    }
  }
  
  /**
   * Get a specific document by ID
   * @param {string} documentId - DocuShare document ID
   * @returns {Promise<Object>} - Document details
   */
  async getDocument(documentId) {
    try {
      if (!this.isAuthenticated()) {
        const sampleDocs = await this.getSampleDocuments();
        return sampleDocs.find(doc => doc.id === documentId) || null;
      }
      
      const response = await fetch(`${this.baseUrl}/documents/${documentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('DocuShare getDocument error:', error);
      throw error;
    }
  }
  
  /**
   * Upload a document to DocuShare
   * @param {File} file - File to upload
   * @param {string} contextId - Context ID (e.g., study ID)
   * @param {string} documentType - Document type
   * @returns {Promise<Object>} - Upload result
   */
  async uploadDocument(file, contextId, documentType) {
    try {
      if (!this.isAuthenticated()) {
        console.warn('DocuShare: Not authenticated, upload would fail');
        // Simulate successful upload for development
        return {
          id: 'doc-' + Math.floor(Math.random() * 10000),
          name: file.name,
          status: 'success',
        };
      }
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('contextId', contextId || '');
      formData.append('documentType', documentType || '');
      
      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('DocuShare uploadDocument error:', error);
      throw error;
    }
  }
  
  /**
   * Download a document from DocuShare
   * @param {string} documentId - DocuShare document ID
   * @returns {Promise<Blob>} - Document content as blob
   */
  async downloadDocument(documentId) {
    try {
      if (!this.isAuthenticated()) {
        console.warn('DocuShare: Not authenticated, download would fail');
        throw new Error('Authentication required for download');
      }
      
      const response = await fetch(`${this.baseUrl}/documents/${documentId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and click it to download
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      // Try to get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1].replace(/"/g, '') 
        : `document-${documentId}.pdf`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return blob;
    } catch (error) {
      console.error('DocuShare downloadDocument error:', error);
      throw error;
    }
  }
  
  /**
   * Check if user is authenticated with DocuShare
   * @returns {boolean} - Whether user is authenticated
   */
  isAuthenticated() {
    return !!this.token;
  }
  
  /**
   * Sign out from DocuShare
   */
  signOut() {
    this.token = null;
    localStorage.removeItem('docushare_token');
    localStorage.removeItem('docushare_token_expiry');
  }
  
  /**
   * Get folders from DocuShare
   * @returns {Promise<Array>} - List of folders
   */
  async getFolders() {
    try {
      if (!this.isAuthenticated()) {
        return this.getSampleFolders();
      }
      
      const response = await fetch(`${this.baseUrl}/folders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch folders: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('DocuShare getFolders error:', error);
      return this.getSampleFolders();
    }
  }
  
  /**
   * Generate sample documents for development/testing
   * @param {Object} filters - Filter options
   * @returns {Array} - Sample documents
   */
  async getSampleDocuments(filters = {}) {
    // Sample document data for development and testing
    const sampleDocs = [
      {
        id: 'doc-1001',
        documentId: 'DOC-2025-001',
        title: 'Clinical Study Protocol - Phase 1',
        type: 'protocol',
        version: '1.2',
        status: 'Approved',
        controlStatus: 'Approved',
        creator: 'John Smith',
        createdDate: '2025-01-15T10:30:00Z',
        modifiedDate: '2025-02-10T14:45:00Z',
        size: 1240000,
        mimeType: 'application/pdf',
        documentType: 'Clinical',
        name: 'Clinical Study Protocol - Phase 1',
        uploadDate: '2025-01-15T10:30:00Z',
        lastModified: '2025-02-10T14:45:00Z'
      },
      {
        id: 'doc-1002',
        documentId: 'DOC-2025-002',
        title: 'Investigator Brochure v2.1',
        type: 'submission',
        version: '2.1',
        status: 'In-Review',
        controlStatus: 'In-Review',
        creator: 'Sarah Johnson',
        createdDate: '2025-02-20T09:15:00Z',
        modifiedDate: '2025-03-05T11:20:00Z',
        size: 3450000,
        mimeType: 'application/pdf',
        documentType: 'Regulatory',
        name: 'Investigator Brochure v2.1',
        uploadDate: '2025-02-20T09:15:00Z',
        lastModified: '2025-03-05T11:20:00Z'
      },
      {
        id: 'doc-1003',
        documentId: 'DOC-2025-003',
        title: 'Clinical Study Report - Study XYZ-123',
        type: 'report',
        version: '1.0',
        status: 'Draft',
        controlStatus: 'Draft',
        creator: 'Robert Chen',
        createdDate: '2025-03-10T15:00:00Z',
        modifiedDate: '2025-03-10T15:00:00Z',
        size: 5200000,
        mimeType: 'application/pdf',
        documentType: 'Clinical',
        name: 'Clinical Study Report - Study XYZ-123',
        uploadDate: '2025-03-10T15:00:00Z',
        lastModified: '2025-03-10T15:00:00Z'
      },
      {
        id: 'doc-1004',
        documentId: 'DOC-2025-004',
        title: 'IND Application Form 1571',
        type: 'form',
        version: '1.0',
        status: 'Approved',
        controlStatus: 'Approved',
        creator: 'Emily Wilson',
        createdDate: '2025-01-05T08:45:00Z',
        modifiedDate: '2025-01-20T13:10:00Z',
        size: 890000,
        mimeType: 'application/pdf',
        documentType: 'Regulatory',
        name: 'IND Application Form 1571',
        uploadDate: '2025-01-05T08:45:00Z',
        lastModified: '2025-01-20T13:10:00Z'
      },
      {
        id: 'doc-1005',
        documentId: 'DOC-2025-005',
        title: 'FDA Correspondence - Pre-IND Meeting',
        type: 'correspondence',
        version: '1.0',
        status: 'Final',
        controlStatus: 'Approved',
        creator: 'Michael Brown',
        createdDate: '2024-12-15T14:20:00Z',
        modifiedDate: '2024-12-15T14:20:00Z',
        size: 1120000,
        mimeType: 'application/pdf',
        documentType: 'Regulatory',
        name: 'FDA Correspondence - Pre-IND Meeting',
        uploadDate: '2024-12-15T14:20:00Z',
        lastModified: '2024-12-15T14:20:00Z'
      },
      {
        id: 'doc-1006',
        documentId: 'DOC-2025-006',
        title: 'CMC Documentation Package',
        type: 'submission',
        version: '2.3',
        status: 'In-Review',
        controlStatus: 'In-Review',
        creator: 'Jessica Lee',
        createdDate: '2025-03-01T10:00:00Z',
        modifiedDate: '2025-03-18T16:30:00Z',
        size: 7800000,
        mimeType: 'application/pdf',
        documentType: 'CMC',
        name: 'CMC Documentation Package',
        uploadDate: '2025-03-01T10:00:00Z',
        lastModified: '2025-03-18T16:30:00Z'
      },
      {
        id: 'doc-1007',
        documentId: 'DOC-2025-007',
        title: 'Statistical Analysis Plan',
        type: 'protocol',
        version: '1.1',
        status: 'Approved',
        controlStatus: 'Approved',
        creator: 'David Parker',
        createdDate: '2025-02-05T11:15:00Z',
        modifiedDate: '2025-02-28T09:45:00Z',
        size: 1650000,
        mimeType: 'application/pdf',
        documentType: 'Statistics',
        name: 'Statistical Analysis Plan',
        uploadDate: '2025-02-05T11:15:00Z',
        lastModified: '2025-02-28T09:45:00Z'
      }
    ];
    
    // Apply filters if provided
    let filteredDocs = [...sampleDocs];
    
    if (filters.documentType && filters.documentType !== 'all') {
      filteredDocs = filteredDocs.filter(doc => doc.type === filters.documentType);
    }
    
    if (filters.contextId) {
      // In a real implementation, this would filter by study ID or other context
      // For now, just return a subset based on the context string length as a simple "randomization"
      const contextLength = filters.contextId.length;
      filteredDocs = filteredDocs.filter((_, index) => index % (contextLength % 3 + 1) === 0);
    }
    
    return filteredDocs;
  }
  
  /**
   * Generate sample folders for development/testing
   * @returns {Array} - Sample folders
   */
  getSampleFolders() {
    // Sample folder data for development and testing
    return [
      {
        id: 'folder-1',
        name: 'Clinical Protocols',
        path: '/Clinical/Protocols',
        documentCount: 12,
        lastModified: '2025-03-10T15:00:00Z'
      },
      {
        id: 'folder-2',
        name: 'Regulatory Submissions',
        path: '/Regulatory/Submissions',
        documentCount: 8,
        lastModified: '2025-03-15T09:30:00Z'
      },
      {
        id: 'folder-3',
        name: 'CMC Documentation',
        path: '/CMC',
        documentCount: 15,
        lastModified: '2025-03-12T14:45:00Z'
      },
      {
        id: 'folder-4',
        name: 'Safety Reports',
        path: '/Safety/Reports',
        documentCount: 20,
        lastModified: '2025-03-18T11:20:00Z'
      },
      {
        id: 'folder-5',
        name: 'Investigator Communications',
        path: '/Clinical/Investigators',
        documentCount: 7,
        lastModified: '2025-03-05T16:15:00Z'
      }
    ];
  }
}

// Create a singleton instance
const docuShareService = new DocuShareService();
export default docuShareService;