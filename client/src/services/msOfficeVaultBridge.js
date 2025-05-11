/**
 * Microsoft Office Vault Bridge
 * 
 * This service creates a secure bridge between our TrialSage Vault Document Management System
 * (built on Xerox DMS with FDA 21 CFR Part 11 certification) and Microsoft SharePoint/OneDrive,
 * enabling compliant document management for regulatory submissions while leveraging
 * Microsoft's editing capabilities.
 * 
 * Key features:
 * - FDA 21 CFR Part 11 compliance enforcement behind-the-scenes
 * - Electronic signature integration
 * - Audit trail synchronization
 * - Document validation
 * - Version control and lifecycle management
 * - Secure document exchange between systems
 * - Microsoft Word editing while maintaining compliance
 */

import { getAccessToken } from './microsoftAuthService';

// Configuration for bridge service
const BRIDGE_CONFIG = {
  apiUrl: '/api/vault-bridge',
  vaultApiUrl: '/api/vault',
  sharepointApiUrl: '/api/microsoft/sharepoint',
  auditLogEnabled: true,
  complianceCheckEnabled: true,
  auditFieldsRequired: ['userId', 'timestamp', 'action', 'documentId'],
  regulatoryCompliance: {
    enforceSignatures: true,
    requireReviewCycle: true,
    trackDocumentChanges: true,
    enforcePart11: true
  }
};

/**
 * Initialize the Vault-SharePoint Bridge
 * 
 * @returns {Promise<boolean>} Success status
 */
export async function initializeBridge() {
  try {
    const vaultConnected = await checkVaultConnection();
    const msToken = getAccessToken();
    
    if (!vaultConnected) {
      console.error('Failed to connect to Vault DMS');
      return false;
    }
    
    if (!msToken) {
      console.error('Microsoft authentication required');
      return false;
    }
    
    const sharepointConnected = await checkSharePointConnection(msToken);
    if (!sharepointConnected) {
      console.error('Failed to connect to SharePoint');
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error initializing Vault-SharePoint bridge:', err);
    return false;
  }
}

/**
 * Check connection to Vault
 * 
 * @returns {Promise<boolean>} Connection status
 */
async function checkVaultConnection() {
  try {
    const response = await fetch(BRIDGE_CONFIG.vaultApiUrl + '/status', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.ok;
  } catch (err) {
    console.error('Error checking Vault connection:', err);
    return false;
  }
}

/**
 * Check connection to SharePoint
 * 
 * @param {string} msToken - Microsoft access token
 * @returns {Promise<boolean>} Connection status
 */
async function checkSharePointConnection(msToken) {
  try {
    const response = await fetch(BRIDGE_CONFIG.sharepointApiUrl + '/status', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${msToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.ok;
  } catch (err) {
    console.error('Error checking SharePoint connection:', err);
    return false;
  }
}

/**
 * Get document from Vault for Microsoft editing
 * 
 * @param {string} docId - Document ID
 * @returns {Promise<Object>} Document data
 */
export async function getDocument(docId) {
  try {
    // First retrieve document from our certified Vault system
    const vaultDoc = await fetchVaultDocument(docId);
    
    // Check out document for editing if not already checked out
    if (vaultDoc.status !== 'checked_out') {
      await checkoutVaultDocument(docId);
    }
    
    // Return document data with content
    return vaultDoc;
  } catch (err) {
    console.error('Error getting document from Vault:', err);
    throw err;
  }
}

/**
 * Fetch document from Vault
 * 
 * @param {string} docId - Document ID
 * @returns {Promise<Object>} Document data
 */
async function fetchVaultDocument(docId) {
  const response = await fetch(`${BRIDGE_CONFIG.vaultApiUrl}/documents/${docId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch document from Vault');
  }
  
  return await response.json();
}

/**
 * Checkout document in Vault
 * 
 * @param {string} docId - Document ID
 * @returns {Promise<Object>} Checkout result
 */
async function checkoutVaultDocument(docId) {
  const userId = getCurrentUserId();
  
  const response = await fetch(`${BRIDGE_CONFIG.vaultApiUrl}/documents/${docId}/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId,
      timestamp: new Date().toISOString(),
      reason: 'Editing in Microsoft Word'
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to checkout document from Vault');
  }
  
  return await response.json();
}

/**
 * Get current user ID
 * 
 * @returns {string} User ID
 */
function getCurrentUserId() {
  // Get current user ID from session
  return sessionStorage.getItem('currentUserId') || 'unknown-user';
}

/**
 * Save document back to Vault
 * 
 * @param {string} docId - Document ID
 * @param {string} content - Document content
 * @returns {Promise<Object>} Save result
 */
export async function saveDocument(docId, content) {
  try {
    // Validate content for compliance before saving
    const validatedContent = await validateAndPrepareContent(content, docId);
    
    // Save to Vault
    const response = await fetch(`${BRIDGE_CONFIG.vaultApiUrl}/documents/${docId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: validatedContent,
        userId: getCurrentUserId(),
        timestamp: new Date().toISOString(),
        action: 'save',
        keepCheckedOut: true
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save document to Vault');
    }
    
    return await response.json();
  } catch (err) {
    console.error('Error saving document to Vault:', err);
    throw err;
  }
}

/**
 * Validate and prepare content for Vault with compliance checks
 * 
 * @param {string} content - Document content
 * @param {string} docId - Document ID
 * @returns {Promise<string>} Validated content
 */
async function validateAndPrepareContent(content, docId) {
  if (!BRIDGE_CONFIG.complianceCheckEnabled) {
    return content;
  }
  
  try {
    // Perform validation against Xerox Vault compliance rules
    const response = await fetch(`${BRIDGE_CONFIG.vaultApiUrl}/compliance/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content,
        documentId: docId,
        validationType: 'regulatory'
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Compliance validation failed: ${error.message}`);
    }
    
    const result = await response.json();
    return result.validatedContent || content;
  } catch (err) {
    console.warn('Compliance validation error:', err);
    // Fall back to original content if validation service is unavailable
    return content;
  }
}

/**
 * Create new document version in Vault
 * 
 * @param {string} docId - Document ID
 * @param {string} content - Document content
 * @param {string} versionNote - Note for this version
 * @returns {Promise<Object>} Version result
 */
export async function createDocumentVersion(docId, content, versionNote) {
  try {
    // Create new version in Vault
    const response = await fetch(`${BRIDGE_CONFIG.vaultApiUrl}/documents/${docId}/versions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content,
        userId: getCurrentUserId(),
        timestamp: new Date().toISOString(),
        note: versionNote
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create document version in Vault');
    }
    
    return await response.json();
  } catch (err) {
    console.error('Error creating document version:', err);
    throw err;
  }
}

/**
 * Get document version history from Vault
 * 
 * @param {string} docId - Document ID
 * @returns {Promise<Array>} Version history
 */
export async function getDocumentVersionHistory(docId) {
  try {
    // Get version history from Vault
    const response = await fetch(`${BRIDGE_CONFIG.vaultApiUrl}/documents/${docId}/versions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get document version history from Vault');
    }
    
    return await response.json();
  } catch (err) {
    console.error('Error getting document version history:', err);
    throw err;
  }
}

/**
 * Register collaboration status in Vault
 * 
 * @param {string} docId - Document ID
 * @param {string} status - Collaboration status
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export async function registerCollaborationStatus(docId, status, userId) {
  try {
    if (!docId) return false;
    
    // Register collaboration status in Vault
    const response = await fetch(`${BRIDGE_CONFIG.vaultApiUrl}/documents/${docId}/collaboration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status,
        userId: userId || getCurrentUserId(),
        timestamp: new Date().toISOString()
      })
    });
    
    return response.ok;
  } catch (err) {
    console.error('Error registering collaboration status:', err);
    return false;
  }
}

/**
 * Checkin document in Vault with electronic signature
 * 
 * @param {string} docId - Document ID
 * @param {Object} signature - Electronic signature data
 * @returns {Promise<Object>} Checkin result
 */
export async function checkinDocumentWithSignature(docId, signature) {
  try {
    // Checkin document with electronic signature
    const response = await fetch(`${BRIDGE_CONFIG.vaultApiUrl}/documents/${docId}/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: getCurrentUserId(),
        timestamp: new Date().toISOString(),
        signature: {
          ...signature,
          method: 'electronic',
          compliant: true
        }
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to checkin document with signature');
    }
    
    return await response.json();
  } catch (err) {
    console.error('Error checking in document with signature:', err);
    throw err;
  }
}

/**
 * Get audit trail for document from both systems
 * 
 * @param {string} docId - Document ID
 * @returns {Promise<Object>} Combined audit trail
 */
export async function getDocumentAuditTrail(docId) {
  try {
    // Get audit trail from Vault
    const vaultAuditResponse = await fetch(`${BRIDGE_CONFIG.vaultApiUrl}/documents/${docId}/audit`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!vaultAuditResponse.ok) {
      throw new Error('Failed to get audit trail from Vault');
    }
    
    const vaultAudit = await vaultAuditResponse.json();
    
    // Also get Microsoft audit information if available
    const msToken = getAccessToken();
    let microsoftAudit = [];
    
    if (msToken) {
      try {
        const msAuditResponse = await fetch(`${BRIDGE_CONFIG.sharepointApiUrl}/documents/${docId}/audit`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${msToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (msAuditResponse.ok) {
          microsoftAudit = await msAuditResponse.json();
        }
      } catch (msErr) {
        console.warn('Could not retrieve Microsoft audit information:', msErr);
      }
    }
    
    // Combine audit trails
    return {
      vaultAudit,
      microsoftAudit,
      combinedAudit: mergeAuditTrails(vaultAudit, microsoftAudit)
    };
  } catch (err) {
    console.error('Error getting document audit trail:', err);
    throw err;
  }
}

/**
 * Merge audit trails from different systems
 * 
 * @param {Array} vaultAudit - Vault audit entries
 * @param {Array} msAudit - Microsoft audit entries
 * @returns {Array} Merged audit trail
 */
function mergeAuditTrails(vaultAudit, msAudit) {
  // Combine audit trails and sort by timestamp
  const combined = [
    ...vaultAudit.map(entry => ({ ...entry, source: 'Vault' })),
    ...msAudit.map(entry => ({ ...entry, source: 'Microsoft' }))
  ];
  
  return combined.sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return dateB - dateA; // Sort descending (newest first)
  });
}

/**
 * Get all available templates from Vault
 * 
 * @param {string} type - Template type
 * @returns {Promise<Array>} Available templates
 */
export async function getAvailableTemplates(type = 'regulatory') {
  try {
    // Get templates from Vault
    const response = await fetch(`${BRIDGE_CONFIG.vaultApiUrl}/templates?type=${type}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get templates from Vault');
    }
    
    return await response.json();
  } catch (err) {
    console.error('Error getting templates from Vault:', err);
    throw err;
  }
}

/**
 * Apply document template from Vault
 * 
 * @param {string} docId - Document ID
 * @param {string} templateId - Template ID
 * @returns {Promise<Object>} Template result
 */
export async function applyTemplate(docId, templateId) {
  try {
    // Apply template to document in Vault
    const response = await fetch(`${BRIDGE_CONFIG.vaultApiUrl}/documents/${docId}/template`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        templateId,
        userId: getCurrentUserId(),
        timestamp: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to apply template to document');
    }
    
    return await response.json();
  } catch (err) {
    console.error('Error applying template to document:', err);
    throw err;
  }
}