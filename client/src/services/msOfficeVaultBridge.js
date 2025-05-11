/**
 * Microsoft Office Vault Bridge
 * 
 * This service creates a secure bridge between our TrialSage Vault Document Management System
 * and Microsoft SharePoint/OneDrive, enabling compliant document management for
 * regulatory submissions while leveraging Microsoft's editing capabilities.
 * 
 * Key features:
 * - FDA 21 CFR Part 11 compliance enforcement
 * - Electronic signature integration
 * - Audit trail synchronization
 * - Document validation
 * - Version control and lifecycle management
 * - Secure document exchange between systems
 * - Microsoft Word editing while maintaining compliance
 */

import { getAccessToken } from './microsoftAuthService';

// Configuration
const BRIDGE_CONFIG = {
  vaultApiUrl: process.env.VAULT_API_URL || '/api/vault',
  sharepointSiteUrl: process.env.SHAREPOINT_SITE_URL || '',
  complianceEnabled: true,
  validationRules: {
    requireElectronicSignature: true,
    enforceVersioning: true,
    trackAuditTrail: true,
    validateMetadata: true
  }
};

/**
 * Initialize the Vault-SharePoint Bridge
 * 
 * @returns {Promise<boolean>} Success status
 */
export async function initializeBridge() {
  try {
    const msToken = getAccessToken();
    
    if (!msToken) {
      console.error('Microsoft authentication required');
      return false;
    }
    
    // Check if bridge is already initialized by validating connection to both systems
    const vaultStatus = await checkVaultConnection();
    const sharepointStatus = await checkSharePointConnection(msToken);
    
    if (!vaultStatus || !sharepointStatus) {
      console.error('Failed to establish connection to one or both systems');
      return false;
    }
    
    console.log('Vault-SharePoint Bridge initialized successfully');
    return true;
  } catch (err) {
    console.error('Failed to initialize Vault-SharePoint Bridge:', err);
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
    const response = await fetch(`${BRIDGE_CONFIG.vaultApiUrl}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Vault connection failed');
    }
    
    const data = await response.json();
    return data.status === 'connected';
  } catch (err) {
    console.error('Vault connection check failed:', err);
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
    const response = await fetch('/api/microsoft/sharepoint/status', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${msToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('SharePoint connection failed');
    }
    
    const data = await response.json();
    return data.status === 'connected';
  } catch (err) {
    console.error('SharePoint connection check failed:', err);
    return false;
  }
}

/**
 * Get document from Vault and prepare for SharePoint
 * 
 * @param {string} vaultDocId - Vault document ID
 * @returns {Promise<Object>} Document info with SharePoint URLs
 */
export async function getDocumentForEditing(vaultDocId) {
  try {
    // 1. Fetch document metadata from Vault
    const vaultDoc = await fetchVaultDocument(vaultDocId);
    
    if (!vaultDoc) {
      throw new Error('Document not found in Vault');
    }
    
    // 2. Check document checkout status and permissions
    if (vaultDoc.status === 'locked' && vaultDoc.lockedBy !== getCurrentUserId()) {
      throw new Error('Document is locked by another user');
    }
    
    // 3. Checkout document if not already checked out
    if (vaultDoc.status !== 'checked_out') {
      await checkoutVaultDocument(vaultDocId);
    }
    
    // 4. Create or update document in SharePoint
    const msToken = getAccessToken();
    const sharepointDoc = await createOrUpdateInSharePoint(vaultDoc, msToken);
    
    // 5. Combine metadata from both systems
    return {
      id: vaultDocId,
      vaultMetadata: vaultDoc.metadata,
      name: vaultDoc.name,
      version: vaultDoc.version,
      status: vaultDoc.status,
      webUrl: sharepointDoc.webUrl,
      embedUrl: sharepointDoc.embedUrl,
      sharepointId: sharepointDoc.id
    };
  } catch (err) {
    console.error('Failed to prepare document for editing:', err);
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
  try {
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
  } catch (err) {
    console.error('Error fetching document from Vault:', err);
    throw err;
  }
}

/**
 * Checkout document in Vault
 * 
 * @param {string} docId - Document ID
 * @returns {Promise<Object>} Checkout result
 */
async function checkoutVaultDocument(docId) {
  try {
    const response = await fetch(`${BRIDGE_CONFIG.vaultApiUrl}/documents/${docId}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to checkout document from Vault');
    }
    
    return await response.json();
  } catch (err) {
    console.error('Error checking out document from Vault:', err);
    throw err;
  }
}

/**
 * Get current user ID
 * 
 * @returns {string} User ID
 */
function getCurrentUserId() {
  // This would be implemented to get the current user ID from the system
  return '12345'; // Placeholder
}

/**
 * Create or update document in SharePoint
 * 
 * @param {Object} vaultDoc - Vault document data
 * @param {string} msToken - Microsoft access token
 * @returns {Promise<Object>} SharePoint document info
 */
async function createOrUpdateInSharePoint(vaultDoc, msToken) {
  try {
    // Check if document already exists in SharePoint mapping
    const mappingResponse = await fetch(`${BRIDGE_CONFIG.vaultApiUrl}/documents/${vaultDoc.id}/sharepoint-mapping`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const existingMapping = mappingResponse.ok ? await mappingResponse.json() : null;
    let sharepointDocId = existingMapping?.sharepointId;
    
    if (sharepointDocId) {
      // Update existing SharePoint document
      const updateResponse = await fetch(`/api/microsoft/documents/${sharepointDocId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${msToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: vaultDoc.content,
          metadata: {
            vaultId: vaultDoc.id,
            vaultVersion: vaultDoc.version,
            regulatoryStatus: vaultDoc.status,
            documentType: vaultDoc.type,
            ctdSection: vaultDoc.metadata?.ctdSection || '',
            isRegulatory: true
          }
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to update document in SharePoint');
      }
      
      return await updateResponse.json();
    } else {
      // Create new SharePoint document
      const createResponse = await fetch('/api/microsoft/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${msToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: vaultDoc.name,
          content: vaultDoc.content,
          folderId: getFolderIdForDocument(vaultDoc),
          metadata: {
            vaultId: vaultDoc.id,
            vaultVersion: vaultDoc.version,
            regulatoryStatus: vaultDoc.status,
            documentType: vaultDoc.type,
            ctdSection: vaultDoc.metadata?.ctdSection || '',
            isRegulatory: true
          }
        })
      });
      
      if (!createResponse.ok) {
        throw new Error('Failed to create document in SharePoint');
      }
      
      const newSharePointDoc = await createResponse.json();
      
      // Create mapping between Vault and SharePoint
      await fetch(`${BRIDGE_CONFIG.vaultApiUrl}/documents/${vaultDoc.id}/sharepoint-mapping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sharepointId: newSharePointDoc.id,
          sharepointUrl: newSharePointDoc.webUrl
        })
      });
      
      return newSharePointDoc;
    }
  } catch (err) {
    console.error('Error creating/updating document in SharePoint:', err);
    throw err;
  }
}

/**
 * Get appropriate SharePoint folder ID for document
 * 
 * @param {Object} doc - Document data
 * @returns {string} Folder ID
 */
function getFolderIdForDocument(doc) {
  // This would be implemented to determine the appropriate folder based on document type and CTD section
  return 'regulatory-documents'; // Placeholder
}

/**
 * Save document from SharePoint back to Vault
 * 
 * @param {string} vaultDocId - Vault document ID
 * @param {string} sharepointId - SharePoint document ID
 * @returns {Promise<Object>} Save result
 */
export async function saveDocumentToVault(vaultDocId, sharepointId) {
  try {
    const msToken = getAccessToken();
    
    if (!msToken) {
      throw new Error('Microsoft authentication required');
    }
    
    // 1. Get document content from SharePoint
    const sharepointDocResponse = await fetch(`/api/microsoft/documents/${sharepointId}/content`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${msToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!sharepointDocResponse.ok) {
      throw new Error('Failed to get document content from SharePoint');
    }
    
    const { content, metadata } = await sharepointDocResponse.json();
    
    // 2. Prepare content for Vault with compliance validation
    const validatedContent = await validateAndPrepareContent(content, vaultDocId);
    
    // 3. Save content to Vault
    const saveResponse = await fetch(`${BRIDGE_CONFIG.vaultApiUrl}/documents/${vaultDocId}/content`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: validatedContent,
        comment: 'Updated via Microsoft Word',
        sharepointMetadata: metadata
      })
    });
    
    if (!saveResponse.ok) {
      throw new Error('Failed to save document to Vault');
    }
    
    const saveResult = await saveResponse.json();
    
    // 4. Optionally check in the document in Vault if requested
    return saveResult;
  } catch (err) {
    console.error('Failed to save document to Vault:', err);
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
  try {
    if (!BRIDGE_CONFIG.complianceEnabled) {
      return content;
    }
    
    // Perform FDA 21 CFR Part 11 compliance validation
    const validationResponse = await fetch(`${BRIDGE_CONFIG.vaultApiUrl}/compliance/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content,
        documentId: docId,
        validationRules: BRIDGE_CONFIG.validationRules
      })
    });
    
    if (!validationResponse.ok) {
      const error = await validationResponse.json();
      throw new Error(`Compliance validation failed: ${error.message}`);
    }
    
    const { validatedContent } = await validationResponse.json();
    return validatedContent;
  } catch (err) {
    console.error('Content validation failed:', err);
    throw err;
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
    // First save the latest content
    await saveDocumentToVault(docId, signature.sharepointId);
    
    // Then perform checkin with electronic signature
    const response = await fetch(`${BRIDGE_CONFIG.vaultApiUrl}/documents/${docId}/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        comment: signature.comment || 'Document approved',
        electronicSignature: {
          signedBy: signature.username,
          meaning: signature.meaning || 'Approved',
          password: signature.password, // This would be handled securely in real implementation
          signatureDate: new Date().toISOString()
        }
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to checkin document with signature');
    }
    
    return await response.json();
  } catch (err) {
    console.error('Failed to checkin document with signature:', err);
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
    // Get Vault audit trail
    const vaultAuditResponse = await fetch(`${BRIDGE_CONFIG.vaultApiUrl}/documents/${docId}/audit-trail`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!vaultAuditResponse.ok) {
      throw new Error('Failed to get audit trail from Vault');
    }
    
    const vaultAudit = await vaultAuditResponse.json();
    
    // Get SharePoint audit if mapping exists
    const mappingResponse = await fetch(`${BRIDGE_CONFIG.vaultApiUrl}/documents/${docId}/sharepoint-mapping`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    let sharepointAudit = { entries: [] };
    
    if (mappingResponse.ok) {
      const mapping = await mappingResponse.json();
      
      if (mapping.sharepointId) {
        const msToken = getAccessToken();
        
        const sharepointAuditResponse = await fetch(`/api/microsoft/documents/${mapping.sharepointId}/activity`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${msToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (sharepointAuditResponse.ok) {
          sharepointAudit = await sharepointAuditResponse.json();
        }
      }
    }
    
    // Combine and sort audit entries
    const combinedEntries = [
      ...vaultAudit.entries,
      ...sharepointAudit.entries.map(entry => ({
        ...entry,
        source: 'SharePoint'
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return {
      documentId: docId,
      entries: combinedEntries
    };
  } catch (err) {
    console.error('Failed to get document audit trail:', err);
    throw err;
  }
}

/**
 * Convert a standard SharePoint document to a compliant Vault document
 * 
 * @param {string} sharepointId - SharePoint document ID
 * @param {Object} vaultMetadata - Metadata for Vault document
 * @returns {Promise<Object>} Vault document info
 */
export async function importSharePointDocumentToVault(sharepointId, vaultMetadata) {
  try {
    const msToken = getAccessToken();
    
    if (!msToken) {
      throw new Error('Microsoft authentication required');
    }
    
    // 1. Get document from SharePoint
    const sharepointDocResponse = await fetch(`/api/microsoft/documents/${sharepointId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${msToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!sharepointDocResponse.ok) {
      throw new Error('Failed to get document from SharePoint');
    }
    
    const sharepointDoc = await sharepointDocResponse.json();
    
    // 2. Get document content
    const contentResponse = await fetch(`/api/microsoft/documents/${sharepointId}/content`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${msToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!contentResponse.ok) {
      throw new Error('Failed to get document content from SharePoint');
    }
    
    const { content } = await contentResponse.json();
    
    // 3. Create in Vault with compliance validation
    const createResponse = await fetch(`${BRIDGE_CONFIG.vaultApiUrl}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: sharepointDoc.name,
        content: content,
        type: vaultMetadata.type || 'regulatory',
        status: 'draft',
        metadata: {
          ...vaultMetadata,
          importedFromSharePoint: true,
          sharepointId: sharepointId,
          sharepointUrl: sharepointDoc.webUrl
        }
      })
    });
    
    if (!createResponse.ok) {
      throw new Error('Failed to create document in Vault');
    }
    
    const newVaultDoc = await createResponse.json();
    
    // 4. Create mapping between Vault and SharePoint
    await fetch(`${BRIDGE_CONFIG.vaultApiUrl}/documents/${newVaultDoc.id}/sharepoint-mapping`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sharepointId: sharepointId,
        sharepointUrl: sharepointDoc.webUrl
      })
    });
    
    return newVaultDoc;
  } catch (err) {
    console.error('Failed to import SharePoint document to Vault:', err);
    throw err;
  }
}

/**
 * Export Vault document to SharePoint with compliance metadata
 * 
 * @param {string} vaultDocId - Vault document ID
 * @param {string} sharepointFolderId - SharePoint folder ID
 * @returns {Promise<Object>} SharePoint document info
 */
export async function exportVaultDocumentToSharePoint(vaultDocId, sharepointFolderId) {
  try {
    // 1. Get document from Vault
    const vaultDoc = await fetchVaultDocument(vaultDocId);
    
    if (!vaultDoc) {
      throw new Error('Document not found in Vault');
    }
    
    const msToken = getAccessToken();
    
    if (!msToken) {
      throw new Error('Microsoft authentication required');
    }
    
    // 2. Create in SharePoint
    const createResponse = await fetch('/api/microsoft/documents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${msToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: vaultDoc.name,
        content: vaultDoc.content,
        folderId: sharepointFolderId || getFolderIdForDocument(vaultDoc),
        metadata: {
          vaultId: vaultDoc.id,
          vaultVersion: vaultDoc.version,
          regulatoryStatus: vaultDoc.status,
          documentType: vaultDoc.type,
          ctdSection: vaultDoc.metadata?.ctdSection || '',
          isRegulatory: true
        }
      })
    });
    
    if (!createResponse.ok) {
      throw new Error('Failed to create document in SharePoint');
    }
    
    const newSharePointDoc = await createResponse.json();
    
    // 3. Create mapping between Vault and SharePoint
    await fetch(`${BRIDGE_CONFIG.vaultApiUrl}/documents/${vaultDoc.id}/sharepoint-mapping`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sharepointId: newSharePointDoc.id,
        sharepointUrl: newSharePointDoc.webUrl
      })
    });
    
    return newSharePointDoc;
  } catch (err) {
    console.error('Failed to export Vault document to SharePoint:', err);
    throw err;
  }
}