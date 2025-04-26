import axios from "axios";
import crypto from "crypto";
import { v4 as uuidv4 } from 'uuid';
import FormData from 'form-data';
import prisma from "../prisma/client.js";

/**
 * Enhanced DocuShare Service Layer
 * 
 * Production-quality integration with DocuShare document management system,
 * with enterprise-grade authentication, versioning, metadata management,
 * and audit trail support.
 */

// Authentication state
let accessToken = null;
let tokenExpiry = null;
let tokenRefreshPromise = null;

/**
 * Authenticate with DocuShare using OAuth2 client credentials flow
 * Implements token refresh handling to prevent session interruptions
 */
export async function authenticateDocuShare() {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }
  
  // If a refresh is already in progress, wait for it to complete
  if (tokenRefreshPromise) return tokenRefreshPromise;
  
  // Start a new token request
  tokenRefreshPromise = fetchNewToken();
  try {
    return await tokenRefreshPromise;
  } finally {
    tokenRefreshPromise = null;
  }
}

/**
 * Fetch a new token from DocuShare
 */
async function fetchNewToken() {
  try {
    const response = await axios.post(
      `${process.env.DS_DOMAIN}/oauth2/token`, 
      {
        grant_type: 'client_credentials',
        client_id: process.env.DS_CLIENT_ID || 'TrialSAGE-DS7',
        client_secret: process.env.DS_CLIENT_SECRET,
      }
    );

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // renew 1 min before expiry
    
    // Log successful authentication
    await logApiActivity('POST', '/oauth2/token', 200);
    
    return accessToken;
  } catch (error) {
    // Log authentication failure
    await logApiActivity('POST', '/oauth2/token', error.response?.status || 500, error.message);
    console.error("DocuShare authentication failed:", error.message);
    throw new Error("DocuShare authentication failed: " + error.message);
  }
}

/**
 * List documents from a specific folder
 * 
 * @param {string} folderId - ID of the folder to list
 * @param {Object} options - Filter options
 * @returns {Promise<Array>} - Documents in the folder
 */
export async function listDocuments(folderId = '', options = {}) {
  try {
    const token = await authenticateDocuShare();
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('folder', folderId);
    
    if (options.studyId) queryParams.append('studyId', options.studyId);
    if (options.indId) queryParams.append('indId', options.indId);
    if (options.trialPhase) queryParams.append('trialPhase', options.trialPhase);
    if (options.module) queryParams.append('module', options.module);
    if (options.documentType) queryParams.append('documentType', options.documentType);
    
    const url = `${process.env.DS_DOMAIN}/api/documents?${queryParams.toString()}`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    // Log successful API call
    await logApiActivity('GET', url, response.status);
    
    return response.data;
  } catch (error) {
    // Log API failure
    const url = `${process.env.DS_DOMAIN}/api/documents?folder=${folderId}`;
    await logApiActivity('GET', url, error.response?.status || 500, error.message);
    
    console.error("Error listing documents:", error.message);
    
    // In development mode with missing credentials, return simulated data
    if (process.env.NODE_ENV === 'development') {
      return getSimulatedDocuments(folderId);
    }
    
    throw error;
  }
}

/**
 * Upload a document to DocuShare
 * 
 * @param {string} folderId - ID of the target folder
 * @param {Buffer|Blob|File} file - File to upload
 * @param {Object} metadata - Document metadata
 * @returns {Promise<Object>} - Upload result
 */
export async function uploadDocument(folderId, file, metadata = {}) {
  try {
    const token = await authenticateDocuShare();
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderId', folderId);
    
    // Add metadata as separate fields
    if (metadata.studyId) formData.append('studyId', metadata.studyId);
    if (metadata.indId) formData.append('indId', metadata.indId);
    if (metadata.trialPhase) formData.append('trialPhase', metadata.trialPhase);
    if (metadata.module) formData.append('module', metadata.module);
    if (metadata.documentType) formData.append('documentType', metadata.documentType);
    if (metadata.status) formData.append('status', metadata.status);
    if (metadata.version) formData.append('version', metadata.version);
    
    const url = `${process.env.DS_DOMAIN}/api/documents/upload`;
    const response = await axios.post(url, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Calculate file hash for integrity checks
    let sha256 = '';
    if (Buffer.isBuffer(file)) {
      sha256 = crypto.createHash("sha256").update(file).digest("hex");
    }
    
    // Log document upload in local database
    await logDocumentActivity(
      response.data.documentId || 'unknown',
      sha256,
      'upload',
      folderId,
      metadata
    );
    
    // Log successful API call
    await logApiActivity('POST', url, response.status);
    
    return {
      ...response.data,
      sha256
    };
  } catch (error) {
    // Log API failure
    const url = `${process.env.DS_DOMAIN}/api/documents/upload`;
    await logApiActivity('POST', url, error.response?.status || 500, error.message);
    
    console.error("Error uploading document:", error.message);
    throw error;
  }
}

/**
 * Download a document from DocuShare
 * 
 * @param {string} documentId - ID of the document to download
 * @returns {Promise<Blob>} - Document content
 */
export async function downloadDocument(documentId) {
  try {
    const token = await authenticateDocuShare();
    
    const url = `${process.env.DS_DOMAIN}/api/documents/${documentId}/download`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob',
    });
    
    // Log document download
    await logDocumentActivity(documentId, null, 'download');
    
    // Log successful API call
    await logApiActivity('GET', url, response.status);
    
    return response.data;
  } catch (error) {
    // Log API failure
    const url = `${process.env.DS_DOMAIN}/api/documents/${documentId}/download`;
    await logApiActivity('GET', url, error.response?.status || 500, error.message);
    
    console.error("Error downloading document:", error.message);
    throw error;
  }
}

/**
 * Get document version history
 * 
 * @param {string} documentId - ID of the document
 * @returns {Promise<Array>} - Version history
 */
export async function getVersionHistory(documentId) {
  try {
    const token = await authenticateDocuShare();
    
    const url = `${process.env.DS_DOMAIN}/api/documents/${documentId}/versions`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    // Log successful API call
    await logApiActivity('GET', url, response.status);
    
    return response.data.versions || [];
  } catch (error) {
    // Log API failure
    const url = `${process.env.DS_DOMAIN}/api/documents/${documentId}/versions`;
    await logApiActivity('GET', url, error.response?.status || 500, error.message);
    
    console.error("Error fetching version history:", error.message);
    throw error;
  }
}

/**
 * Get document metadata
 * 
 * @param {string} documentId - ID of the document
 * @returns {Promise<Object>} - Document metadata
 */
export async function getDocumentMetadata(documentId) {
  try {
    const token = await authenticateDocuShare();
    
    const url = `${process.env.DS_DOMAIN}/api/documents/${documentId}/metadata`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    // Log successful API call
    await logApiActivity('GET', url, response.status);
    
    return response.data;
  } catch (error) {
    // Log API failure
    const url = `${process.env.DS_DOMAIN}/api/documents/${documentId}/metadata`;
    await logApiActivity('GET', url, error.response?.status || 500, error.message);
    
    console.error("Error fetching document metadata:", error.message);
    throw error;
  }
}

/**
 * Log API activity for audit trail
 */
async function logApiActivity(method, url, status, errorMessage = null) {
  try {
    await prisma.docushare_activity.create({
      data: {
        method,
        endpoint: url,
        status,
        error: errorMessage,
        timestamp: new Date(),
        request_id: uuidv4()
      }
    });
  } catch (logError) {
    console.error("Failed to log DocuShare API activity:", logError);
  }
}

/**
 * Log document activity
 */
async function logDocumentActivity(documentId, sha256, action, path = null, metadata = null) {
  try {
    await prisma.document_activity.create({
      data: {
        document_id: documentId,
        sha256: sha256,
        action: action,
        path: path,
        metadata: metadata ? JSON.stringify(metadata) : null,
        timestamp: new Date(),
        user_id: 1, // Replace with actual user ID from auth context
      }
    });
  } catch (logError) {
    console.error("Failed to log document activity:", logError);
  }
}

/**
 * Provide simulated documents for development environment
 */
function getSimulatedDocuments(path) {
  // Base structure for IND modules
  const indModules = {
    '': [
      {
        id: 'folder-ind',
        type: 'folder',
        name: 'IND Documents',
        path: '/IND',
        items: 8,
        lastModified: '2025-04-20T14:30:00Z'
      },
      {
        id: 'folder-templates',
        type: 'folder',
        name: 'Templates',
        path: '/Templates',
        items: 6,
        lastModified: '2025-04-19T10:15:00Z'
      },
      {
        id: 'folder-archived',
        type: 'folder',
        name: 'Archived',
        path: '/Archived',
        items: 15,
        lastModified: '2025-04-18T09:45:00Z'
      }
    ],
    '/IND': [
      {
        id: 'folder-1',
        type: 'folder',
        name: 'Module 1',
        path: '/IND/Module 1',
        items: 5,
        lastModified: '2025-04-20T14:30:00Z'
      },
      {
        id: 'folder-2',
        type: 'folder',
        name: 'Module 2',
        path: '/IND/Module 2',
        items: 3,
        lastModified: '2025-04-22T09:15:00Z'
      },
      {
        id: 'folder-3',
        type: 'folder',
        name: 'Module 3',
        path: '/IND/Module 3',
        items: 8,
        lastModified: '2025-04-21T16:45:00Z'
      },
      {
        id: 'folder-4',
        type: 'folder',
        name: 'Module 4',
        path: '/IND/Module 4',
        items: 2,
        lastModified: '2025-04-23T11:20:00Z'
      },
      {
        id: 'folder-5',
        type: 'folder',
        name: 'Module 5',
        path: '/IND/Module 5',
        items: 6,
        lastModified: '2025-04-19T15:10:00Z'
      },
      {
        id: 'doc-1',
        type: 'document',
        name: 'IND Application Cover Letter.pdf',
        size: '285KB',
        lastModified: '2025-04-24T10:45:00Z',
        status: 'approved',
        metadata: {
          module: 'Module 1',
          documentType: 'Cover Letter',
          trialPhase: 'Phase 1',
          version: '1.2'
        },
        creator: 'Sarah Johnson'
      },
      {
        id: 'doc-2',
        type: 'document',
        name: 'Form FDA 1571.pdf',
        size: '420KB',
        lastModified: '2025-04-25T09:30:00Z',
        status: 'pending',
        metadata: {
          module: 'Module 1',
          documentType: 'FDA Form',
          trialPhase: 'Phase 1',
          version: '1.0'
        },
        creator: 'David Lee'
      },
      {
        id: 'doc-3',
        type: 'document',
        name: 'Study Protocol.pdf',
        size: '3.2MB',
        lastModified: '2025-04-23T14:15:00Z',
        status: 'approved',
        metadata: {
          module: 'Module 5',
          documentType: 'Protocol',
          trialPhase: 'Phase 1',
          studyId: 'ABC-123',
          version: '2.1'
        },
        creator: 'Michael Chen'
      }
    ],
    '/IND/Module 1': [
      {
        id: 'doc-4',
        type: 'document',
        name: 'FDA Form 1571.pdf',
        size: '420KB',
        lastModified: '2025-04-25T09:30:00Z',
        status: 'pending',
        metadata: {
          module: 'Module 1',
          documentType: 'FDA Form',
          trialPhase: 'Phase 1',
          version: '1.0'
        },
        creator: 'David Lee'
      },
      {
        id: 'doc-5',
        type: 'document',
        name: 'FDA Form 1572.pdf',
        size: '380KB',
        lastModified: '2025-04-25T09:35:00Z',
        status: 'approved',
        metadata: {
          module: 'Module 1',
          documentType: 'FDA Form',
          trialPhase: 'Phase 1',
          version: '1.0'
        },
        creator: 'David Lee'
      },
      {
        id: 'doc-6',
        type: 'document',
        name: 'IND Application Cover Letter.pdf',
        size: '285KB',
        lastModified: '2025-04-24T10:45:00Z',
        status: 'approved',
        metadata: {
          module: 'Module 1',
          documentType: 'Cover Letter',
          trialPhase: 'Phase 1',
          version: '1.2'
        },
        creator: 'Sarah Johnson'
      },
      {
        id: 'doc-7',
        type: 'document',
        name: 'Investigator CV - Dr. Smith.pdf',
        size: '1.2MB',
        lastModified: '2025-04-22T16:30:00Z',
        status: 'approved',
        metadata: {
          module: 'Module 1',
          documentType: 'Investigator CV',
          trialPhase: 'Phase 1',
          version: '1.0'
        },
        creator: 'Jennifer Wilson'
      },
      {
        id: 'doc-8',
        type: 'document',
        name: 'Financial Disclosure.pdf',
        size: '420KB',
        lastModified: '2025-04-21T11:20:00Z',
        status: 'approved',
        metadata: {
          module: 'Module 1',
          documentType: 'Financial Disclosure',
          trialPhase: 'Phase 1',
          version: '1.0'
        },
        creator: 'Robert Taylor'
      }
    ]
  };
  
  // Return documents for the requested path
  return indModules[path] || [];
}

// Export aliases to maintain backward compatibility with previous code
export const getToken = authenticateDocuShare;
export const list = listDocuments;
export const upload = uploadDocument;
export const download = downloadDocument;