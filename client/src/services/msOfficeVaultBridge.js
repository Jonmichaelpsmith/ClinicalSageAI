/**
 * Microsoft Office Vault Bridge Service
 * 
 * This service provides integration between Microsoft Office and the TrialSage Vault,
 * facilitating document exchange, synchronization, and collaboration.
 */

import axios from 'axios';
import { getAccessToken } from './microsoftAuthService';

/**
 * Get a document from the vault and prepare it for Microsoft Office editing
 * 
 * @param {string} documentId - The vault document ID 
 * @returns {Promise<Object>} - Document with Graph file URL
 */
export async function getDocumentForOfficeEditing(documentId) {
  try {
    const token = localStorage.getItem('ms_access_token');
    if (!token) {
      throw new Error('Microsoft authentication required');
    }
    
    const response = await axios.get(`/api/microsoft-office/document/${documentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting document for Office editing:', error);
    throw error;
  }
}

/**
 * Save changes from Microsoft Office back to the vault
 * 
 * @param {string} documentId - The vault document ID
 * @param {string} graphFileId - The Microsoft Graph file ID
 * @returns {Promise<Object>} - Updated document
 */
export async function saveOfficeChangesToVault(documentId, graphFileId) {
  try {
    const token = localStorage.getItem('ms_access_token');
    if (!token) {
      throw new Error('Microsoft authentication required');
    }
    
    const response = await axios.post(
      `/api/microsoft-office/save/${documentId}`,
      { graphFileId },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error saving Office changes to vault:', error);
    throw error;
  }
}

/**
 * Get Microsoft Office embedding URL for a document
 * 
 * @param {string} fileUrl - Microsoft Graph file URL
 * @returns {string} - Embed URL for Office Online
 */
export function getOfficeEmbedUrl(fileUrl) {
  // Get access token from local storage
  const token = localStorage.getItem('ms_access_token');
  if (!token) {
    throw new Error('Microsoft authentication required');
  }
  
  // Create the embed URL with authentication
  if (fileUrl.includes('sharepoint.com') || fileUrl.includes('onedrive.com')) {
    // Already a web URL, just add token
    return `${fileUrl}&access_token=${encodeURIComponent(token)}`;
  }
  
  // If using Microsoft Graph, transform to web URL
  if (fileUrl.includes('graph.microsoft.com')) {
    // Extract drive ID and item ID from Graph URL
    const driveIdMatch = fileUrl.match(/drives\/([^/]+)/);
    const itemIdMatch = fileUrl.match(/items\/([^/]+)/);
    
    if (driveIdMatch && itemIdMatch) {
      const driveId = driveIdMatch[1];
      const itemId = itemIdMatch[1];
      
      return `https://office.com/launch/word/item?drive=${driveId}&item=${itemId}&auth=1&access_token=${encodeURIComponent(token)}`;
    }
  }
  
  // Fallback - direct Office Online URL
  return `https://word-edit.officeapps.live.com/we/wordeditorframe.aspx?ui=en-us&rs=en-us&WOPISrc=${encodeURIComponent(fileUrl)}&access_token=${encodeURIComponent(token)}`;
}

/**
 * Create a new document in Microsoft Office linked to the vault
 * 
 * @param {Object} documentInfo - Document information (name, type, etc.)
 * @returns {Promise<Object>} - Created document with Graph file URL
 */
export async function createNewOfficeDocument(documentInfo) {
  try {
    const token = localStorage.getItem('ms_access_token');
    if (!token) {
      throw new Error('Microsoft authentication required');
    }
    
    const response = await axios.post(
      '/api/microsoft-office/document',
      documentInfo,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error creating new Office document:', error);
    throw error;
  }
}

/**
 * Get document from the vault
 * @param {string} documentId - The document ID
 * @returns {Promise<Object>} The document data
 */
export async function getDocument(documentId) {
  try {
    const token = await getAccessToken();
    const response = await axios.get(`/api/vault/documents/${documentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting document from vault:', error);
    throw error;
  }
}

/**
 * Save document to the vault
 * @param {string} documentId - The document ID
 * @param {string} content - The document content
 * @returns {Promise<Object>} The updated document
 */
export async function saveDocument(documentId, content) {
  try {
    const token = await getAccessToken();
    const response = await axios.put(
      `/api/vault/documents/${documentId}`,
      { content },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error saving document to vault:', error);
    throw error;
  }
}

/**
 * Create a new version of a document
 * @param {string} documentId - The document ID
 * @param {string} content - The document content
 * @param {string} versionNotes - Notes about this version
 * @returns {Promise<Object>} The created version
 */
export async function createDocumentVersion(documentId, content, versionNotes = '') {
  try {
    const token = await getAccessToken();
    const response = await axios.post(
      `/api/vault/documents/${documentId}/versions`,
      { content, versionNotes },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating document version:', error);
    throw error;
  }
}

/**
 * Get document version history
 * @param {string} documentId - The document ID
 * @returns {Promise<Array>} Array of versions
 */
export async function getDocumentVersionHistory(documentId) {
  try {
    const token = await getAccessToken();
    const response = await axios.get(`/api/vault/documents/${documentId}/versions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting document version history:', error);
    return []; // Return empty array on error to prevent UI issues
  }
}

/**
 * Register collaboration status for a document
 * @param {string} documentId - The document ID
 * @param {string} status - The collaboration status (editing, viewing, etc)
 * @param {string} userId - The user ID (optional)
 * @returns {Promise<Object>} The status registration
 */
export async function registerCollaborationStatus(documentId, status, userId = null) {
  try {
    const token = await getAccessToken();
    const response = await axios.post(
      `/api/vault/documents/${documentId}/collaboration`,
      { status, userId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error registering collaboration status:', error);
    // Return a minimal object on error
    return { 
      documentId, 
      status: 'unknown',
      registered: false,
      timestamp: new Date().toISOString()
    };
  }
}