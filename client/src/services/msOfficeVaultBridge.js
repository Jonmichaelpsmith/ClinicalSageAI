/**
 * Microsoft Office Vault Bridge Service
 * 
 * This service provides integration between Microsoft Office and the TrialSage Vault,
 * facilitating document exchange, synchronization, and collaboration.
 */

import axios from 'axios';

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