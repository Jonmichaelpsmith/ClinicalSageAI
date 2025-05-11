/**
 * Microsoft Word Service
 * 
 * This service provides functions for working with Microsoft Word documents
 * through the Microsoft Graph API, enabling document creation, editing, and 
 * synchronization with OneDrive/SharePoint.
 * 
 * The service is designed to work with the genuine Microsoft Word application
 * embedded in the TrialSage platform.
 */

import * as microsoftAuthService from './microsoftAuthService';

// Microsoft Graph API endpoints
const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0';
const ONEDRIVE_ENDPOINT = `${GRAPH_API_BASE}/me/drive`;
const SITES_ENDPOINT = `${GRAPH_API_BASE}/sites`;

/**
 * Initialize the Microsoft Word service
 */
export async function initializeWordService() {
  try {
    // Ensure user is authenticated with Microsoft
    const authResult = await microsoftAuthService.initializeMicrosoftAuth();
    
    if (!authResult.isAuthenticated) {
      console.log('User not authenticated with Microsoft. Word service not initialized.');
      return { isInitialized: false, needsAuth: true };
    }
    
    // Check if Word is available in the user's subscription
    const wordAvailability = await microsoftAuthService.checkMicrosoftWordAvailability();
    
    if (!wordAvailability.isAvailable) {
      console.error('Microsoft Word is not available in the user subscription');
      return { isInitialized: false, error: 'Microsoft Word is not available in your subscription' };
    }
    
    return { isInitialized: true };
  } catch (error) {
    console.error('Failed to initialize Microsoft Word service:', error);
    return { isInitialized: false, error };
  }
}

/**
 * Create a new Word document in OneDrive
 * @param {string} filename - Name of the document
 * @param {string} content - Initial content (optional)
 * @param {object} metadata - Additional metadata (optional)
 */
export async function createWordDocument(filename, content = '', metadata = {}) {
  try {
    // Get Microsoft Graph token
    const { accessToken, error } = await microsoftAuthService.getMicrosoftGraphToken();
    
    if (error) {
      throw new Error('Failed to get Microsoft Graph token');
    }
    
    // In a production implementation, this would:
    // 1. Create a new .docx file in OneDrive
    // 2. Set initial content if provided
    // 3. Set metadata
    
    // For demo purposes, simulate a successful document creation
    const mockDocumentId = 'doc_' + Date.now();
    const mockDocumentUrl = `https://onedrive.live.com/edit.aspx?cid=123456&id=${mockDocumentId}`;
    
    return {
      documentId: mockDocumentId,
      documentUrl: mockDocumentUrl,
      filename: filename,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to create Word document:', error);
    throw error;
  }
}

/**
 * Get a Word document from OneDrive or SharePoint
 * @param {string} documentId - OneDrive/SharePoint document ID
 */
export async function getWordDocument(documentId) {
  try {
    // Get Microsoft Graph token
    const { accessToken, error } = await microsoftAuthService.getMicrosoftGraphToken();
    
    if (error) {
      throw new Error('Failed to get Microsoft Graph token');
    }
    
    // In a production implementation, this would:
    // 1. Call Microsoft Graph API to get document details
    // 2. Generate a proper embed URL
    
    // For demo purposes, generate mock document data
    const mockDocumentUrl = `https://onedrive.live.com/edit.aspx?cid=123456&id=${documentId}`;
    const embedUrl = getMsWordEmbedUrl(documentId, mockDocumentUrl);
    
    return {
      documentId,
      documentUrl: mockDocumentUrl,
      embedUrl,
      filename: `Document_${documentId.substring(0, 8)}.docx`,
      lastModified: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to get Word document:', error);
    throw error;
  }
}

/**
 * Generate a Microsoft Word Online embed URL
 * @param {string} documentId - OneDrive/SharePoint document ID
 * @param {string} documentUrl - OneDrive/SharePoint document URL
 */
export function getMsWordEmbedUrl(documentId, documentUrl) {
  try {
    // In a production implementation, this would:
    // 1. Generate a proper Word Online embed URL with authentication tokens
    
    // For demo purposes, generate a mock embed URL
    // Real implementation would use proper WOPI host parameters
    
    // This base URL points to Microsoft's Word Online editor
    const baseUrl = 'https://word-edit.officeapps.live.com/we/wordeditorframe.aspx';
    
    // These parameters are required for embedding Word Online
    const params = new URLSearchParams({
      ui: 'en-us',                     // Interface language
      rs: 'en-us',                     // Resource language
      WOPISrc: encodeURIComponent(documentUrl),  // Document source URL
      wdStartOn: 'edit',               // Start in edit mode
      wdEmbedCode: documentId,         // Embed code/ID
      wdPreviousSession: 'false',      // Start a new session
      wdenableroaming: '1',            // Enable roaming settings
      wdfromweb: '1',                  // Indicate from web
      wdforcenorefresh: '1',           // Prevent auto-refresh that might lose user's data
      wdPreviousCorrelation: 'true',   // Correlation with previous session
      wdNewAndOpenCt: '1658749737832', // Timestamp (for cache busting)
      wdActionStates: 'AQAAAAAAAAAAAAAAAAAAAA',  // Action states (empty)
      nmwdredigest: 'YbdHlEsLCFgcvfh%2BDVFM2A', // Digest value
      wdOSs: 'Windows',                // Operating system 
      wdApe: 'Browser',                // Client app
      wdlcid: '1033',                  // Locale ID
      wdUserLocale: 'en-US',           // User locale
    });
    
    return `${baseUrl}?${params.toString()}`;
  } catch (error) {
    console.error('Failed to generate Word Online embed URL:', error);
    // Return a fallback URL that might work with minimal functionality
    return `https://word-edit.officeapps.live.com/we/wordeditorframe.aspx?ui=en-us&rs=en-us&WOPISrc=${encodeURIComponent(documentUrl)}`;
  }
}

/**
 * Get documents from a SharePoint folder
 * @param {string} siteId - SharePoint site ID
 * @param {string} listId - SharePoint list/library ID
 * @param {string} folderId - SharePoint folder ID
 */
export async function getDocumentsFromSharePoint(siteId, listId, folderId) {
  try {
    // Get Microsoft Graph token
    const { accessToken, error } = await microsoftAuthService.getMicrosoftGraphToken();
    
    if (error) {
      throw new Error('Failed to get Microsoft Graph token');
    }
    
    // In a production implementation, this would:
    // 1. Call Microsoft Graph API to get documents from SharePoint
    
    // For demo purposes, generate mock document data
    return [
      {
        id: 'doc_1',
        name: 'Clinical Trial Protocol.docx',
        webUrl: 'https://example.sharepoint.com/sites/example/Shared%20Documents/Clinical%20Trial%20Protocol.docx',
        createdDateTime: '2025-05-09T10:30:00Z',
        lastModifiedDateTime: '2025-05-10T14:45:00Z'
      },
      {
        id: 'doc_2',
        name: 'Regulatory Submission Report.docx',
        webUrl: 'https://example.sharepoint.com/sites/example/Shared%20Documents/Regulatory%20Submission%20Report.docx',
        createdDateTime: '2025-05-08T09:15:00Z',
        lastModifiedDateTime: '2025-05-11T11:20:00Z'
      }
    ];
  } catch (error) {
    console.error('Failed to get documents from SharePoint:', error);
    throw error;
  }
}

/**
 * Save a VAULT document to OneDrive/SharePoint
 * @param {string} vaultDocumentId - VAULT document ID
 * @param {Blob|string} content - Document content
 * @param {string} destinationFolderId - Destination folder ID (optional)
 */
export async function saveVaultDocumentToMicrosoft(vaultDocumentId, content, destinationFolderId = null) {
  try {
    // Get Microsoft Graph token
    const { accessToken, error } = await microsoftAuthService.getMicrosoftGraphToken();
    
    if (error) {
      throw new Error('Failed to get Microsoft Graph token');
    }
    
    // In a production implementation, this would:
    // 1. Get document details from VAULT
    // 2. Upload document to OneDrive/SharePoint
    // 3. Return the Microsoft document ID and URL
    
    // For demo purposes, simulate a successful upload
    const mockDocumentId = 'ms_' + Date.now();
    const mockDocumentUrl = `https://onedrive.live.com/edit.aspx?cid=123456&id=${mockDocumentId}`;
    
    return {
      microsoftDocumentId: mockDocumentId,
      microsoftDocumentUrl: mockDocumentUrl,
      vaultDocumentId,
      syncedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to save VAULT document to Microsoft:', error);
    throw error;
  }
}

/**
 * Save a Microsoft document to VAULT
 * @param {string} microsoftDocumentId - Microsoft document ID
 * @param {string} vaultDocumentId - VAULT document ID (optional, for updating existing documents)
 */
export async function saveMicrosoftDocumentToVault(microsoftDocumentId, vaultDocumentId = null) {
  try {
    // Get Microsoft Graph token
    const { accessToken, error } = await microsoftAuthService.getMicrosoftGraphToken();
    
    if (error) {
      throw new Error('Failed to get Microsoft Graph token');
    }
    
    // In a production implementation, this would:
    // 1. Download document content from Microsoft
    // 2. Save/update document in VAULT
    // 3. Return the VAULT document ID
    
    // For demo purposes, simulate a successful save
    const newVaultDocumentId = vaultDocumentId || 'vault_' + Date.now();
    
    return {
      vaultDocumentId: newVaultDocumentId,
      microsoftDocumentId,
      syncedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to save Microsoft document to VAULT:', error);
    throw error;
  }
}

/**
 * Get document version history
 * @param {string} documentId - Microsoft document ID
 */
export async function getDocumentVersionHistory(documentId) {
  try {
    // Get Microsoft Graph token
    const { accessToken, error } = await microsoftAuthService.getMicrosoftGraphToken();
    
    if (error) {
      throw new Error('Failed to get Microsoft Graph token');
    }
    
    // In a production implementation, this would:
    // 1. Call Microsoft Graph API to get version history
    
    // For demo purposes, generate mock version history
    return [
      {
        id: 'v1',
        lastModifiedBy: {
          user: { displayName: 'John Doe' }
        },
        lastModifiedDateTime: '2025-05-09T10:30:00Z',
        size: 12345
      },
      {
        id: 'v2',
        lastModifiedBy: {
          user: { displayName: 'Jane Smith' }
        },
        lastModifiedDateTime: '2025-05-10T14:45:00Z',
        size: 13572
      }
    ];
  } catch (error) {
    console.error('Failed to get document version history:', error);
    throw error;
  }
}

/**
 * Restore a previous document version
 * @param {string} documentId - Microsoft document ID
 * @param {string} versionId - Version ID to restore
 */
export async function restoreDocumentVersion(documentId, versionId) {
  try {
    // Get Microsoft Graph token
    const { accessToken, error } = await microsoftAuthService.getMicrosoftGraphToken();
    
    if (error) {
      throw new Error('Failed to get Microsoft Graph token');
    }
    
    // In a production implementation, this would:
    // 1. Call Microsoft Graph API to restore version
    
    // For demo purposes, simulate a successful restore
    return {
      success: true,
      restoredVersionId: versionId,
      restoreTime: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to restore document version:', error);
    throw error;
  }
}