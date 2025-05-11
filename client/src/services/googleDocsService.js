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
    
    // Get authentication token
    const accessToken = googleAuthService.getAccessToken();
    if (!accessToken) {
      throw new Error("Authentication required. Please sign in with Google.");
    }
    
    // Use the template endpoint if a template is provided, otherwise use the regular create endpoint
    const endpoint = templateId ? 
      `${API_ENDPOINTS.FROM_TEMPLATE}?access_token=${accessToken}` : 
      `${API_ENDPOINTS.CREATE_DOC}?access_token=${accessToken}`;
    
    // Call the backend API to create a new document
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        templateId,
        content: metadata.initialContent || '',
        organizationId: metadata.organizationId,
        folderId: metadata.folderId,
        metadata: metadata  // Pass full metadata for regulatory compliance
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
 * Save a document from Google Docs to the VAULT with enhanced regulatory metadata
 * @param {string} docId - Google Docs document ID
 * @param {Object} vaultMetadata - Metadata for VAULT storage
 * @returns {Promise<Object>} Result of save operation
 */
export const saveToVault = async (docId, vaultMetadata = {}) => {
  try {
    console.log(`Saving Google Doc ${docId} to VAULT with metadata:`, vaultMetadata);
    
    // Get authentication info
    let accessToken = googleAuthService.getAccessToken();
    let authHeaders = {};
    
    // Check for authentication method
    if (accessToken === 'replit-auth-token') {
      console.log('Using Replit Auth for document saving');
      
      // When using Replit Auth, we don't send a token in the headers
      // The server will handle authentication through the Replit Auth cookie
      authHeaders = {
        'Content-Type': 'application/json',
        'X-Auth-Provider': 'replit'
      };
    } else if (accessToken) {
      // When using standard OAuth token
      console.log('Using OAuth token for document saving');
      authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      };
    } else {
      throw new Error("No authentication available. Please sign in again.");
    }
    
    // Enhance vaultMetadata with eCTD-specific regulatory information if not provided
    const enhancedMetadata = {
      ...vaultMetadata,
      // Add default regulatory classifications if not specified
      regulatoryClassification: vaultMetadata.regulatoryClassification || {
        ectdSection: vaultMetadata.moduleType || (vaultMetadata.title?.includes('Overview') ? 'module_2_5' : 'module_2_7'),
        region: vaultMetadata.region || 'FDA',
        submissionType: vaultMetadata.submissionType || 'IND',
        documentType: vaultMetadata.documentType || 'scientific',
        lifecycle: vaultMetadata.lifecycle || 'active'
      },
      // Add version control information
      versionControl: vaultMetadata.versionControl || {
        majorVersion: vaultMetadata.majorVersion || 1,
        minorVersion: vaultMetadata.minorVersion || 0,
        docStatus: vaultMetadata.status || 'Draft',
        previousVersionId: vaultMetadata.previousVersionId || null
      },
      // Add audit information for regulatory compliance
      auditInfo: vaultMetadata.auditInfo || {
        createdBy: googleAuthService.getCurrentUser()?.email || 'system',
        createdDate: new Date().toISOString(),
        reviewedBy: vaultMetadata.reviewedBy || null,
        approvedBy: vaultMetadata.approvedBy || null,
        lastModifiedBy: googleAuthService.getCurrentUser()?.email || 'system',
        lastModifiedDate: new Date().toISOString()
      }
    };
    
    // Call the backend API to save the document to VAULT with enhanced metadata
    const response = await fetch(`${API_ENDPOINTS.SAVE_TO_VAULT}/${docId}`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        vaultMetadata: enhancedMetadata,
        userInfo: googleAuthService.getCurrentUser(), // Include user info in the request
        format: vaultMetadata.format || 'pdf', // Default to PDF format for regulatory compliance
        preserveReviewComments: vaultMetadata.preserveReviewComments !== undefined ? vaultMetadata.preserveReviewComments : true,
        applyMetadataToDocument: vaultMetadata.applyMetadataToDocument !== undefined ? vaultMetadata.applyMetadataToDocument : true
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save document to VAULT');
    }
    
    const result = await response.json();
    
    // Show more detailed success message
    toast({
      title: "Document Saved to VAULT",
      description: result.message || `Your document has been successfully saved to VAULT with version ${enhancedMetadata.versionControl.majorVersion}.${enhancedMetadata.versionControl.minorVersion}.`,
    });
    
    return result;
  } catch (error) {
    console.error("Error saving to VAULT:", error);
    toast({
      title: "Error Saving to VAULT",
      description: error.message || "Failed to save document to VAULT. Please try again.",
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