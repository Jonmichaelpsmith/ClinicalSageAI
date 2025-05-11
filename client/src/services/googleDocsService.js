/**
 * Google Docs Service
 * 
 * Handles interaction with Google Docs including creating new documents,
 * loading existing ones, and saving content back to the VAULT.
 */

import { toast } from '@/hooks/use-toast';
import { SAMPLE_DOCUMENTS, API_ENDPOINTS, DOCUMENT_TEMPLATES } from '../config/googleConfig';
import googleAuthService from './googleAuthService';

/**
 * Get a document ID based on module type or ID
 * @param {string|number} moduleIdOrType - Module identifier
 * @returns {string} Google Docs document ID
 */
export const getDocumentId = (moduleIdOrType) => {
  // If a number is provided, map it to a document
  if (typeof moduleIdOrType === 'number') {
    switch(moduleIdOrType) {
      case 1: return SAMPLE_DOCUMENTS.module_2_5;
      case 2: return SAMPLE_DOCUMENTS.module_2_7;
      default: return SAMPLE_DOCUMENTS.default;
    }
  }
  
  // If a string (module type) is provided
  if (moduleIdOrType && SAMPLE_DOCUMENTS[moduleIdOrType]) {
    return SAMPLE_DOCUMENTS[moduleIdOrType];
  }
  
  return SAMPLE_DOCUMENTS.default;
};

/**
 * Create a new Google Doc from a template
 * @param {string} templateId - Template document ID
 * @param {string} title - Title for the new document
 * @param {Object} metadata - Additional metadata for the document
 * @returns {Promise<Object>} New document information
 */
export const createNewDoc = async (templateId, title, metadata = {}) => {
  try {
    console.log(`Creating new Google Doc from template ${templateId} with title: ${title}`);
    
    // Call the backend API to create a new document
    const response = await fetch(API_ENDPOINTS.CREATE_DOC, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        templateId,
        content: metadata.initialContent || '',
        organizationId: metadata.organizationId,
        folderId: metadata.folderId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create new document');
    }
    
    const result = await response.json();
    
    toast({
      title: "New Document Created",
      description: `Created "${title}" in Google Docs`,
    });
    
    return result;
  } catch (error) {
    console.error("Error creating Google Doc:", error);
    toast({
      title: "Error Creating Document",
      description: "Failed to create a new Google document. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};

/**
 * Save a document from Google Docs to the VAULT
 * @param {string} docId - Google Docs document ID
 * @param {Object} vaultMetadata - Metadata for VAULT storage
 * @returns {Promise<Object>} Result of save operation
 */
export const saveToVault = async (docId, vaultMetadata = {}) => {
  try {
    console.log(`Saving Google Doc ${docId} to VAULT with metadata:`, vaultMetadata);
    
    // Get Google access token for authorization
    const accessToken = googleAuthService.getAccessToken();
    if (!accessToken) {
      throw new Error("No Google access token available. Please sign in again.");
    }
    
    // Call the backend API to save the document to VAULT
    const response = await fetch(`${API_ENDPOINTS.SAVE_TO_VAULT}/${docId}?access_token=${accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        vaultMetadata
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save document to VAULT');
    }
    
    const result = await response.json();
    
    toast({
      title: "Document Saved to VAULT",
      description: "Your Google Doc has been successfully saved to the document VAULT.",
    });
    
    return result;
  } catch (error) {
    console.error("Error saving to VAULT:", error);
    toast({
      title: "Error Saving to VAULT",
      description: "Failed to save document to VAULT. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};

/**
 * Get document status (lock information, version, etc.)
 * @param {string} docId - Document ID
 * @returns {Promise<Object>} Document status information
 */
export const getDocumentStatus = async (docId) => {
  try {
    console.log(`Getting status for document ${docId}`);
    
    // Simulate a server call to get document status
    return {
      isLocked: false,
      lockedBy: null,
      currentVersion: "1.0",
      lastModified: new Date().toISOString(),
      status: "draft"
    };
  } catch (error) {
    console.error("Error getting document status:", error);
    throw error;
  }
};

/**
 * Check if user has access to a document
 * @param {string} docId - Document ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Whether user has access
 */
export const checkDocumentAccess = async (docId, userId) => {
  // Simplified access check that always returns true
  // In a real implementation, this would check against Google Docs permissions
  return true;
};