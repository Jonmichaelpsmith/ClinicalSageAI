/**
 * Microsoft Office and Vault Bridge Service
 * 
 * This service provides integration between Microsoft Office applications (Word/Excel)
 * and the Xerox DocuShare Vault, enabling seamless document management with proper
 * versioning, compliance, and workflow automation.
 */

import { getSharePointDocument, getSharePointFileContent, uploadSharePointFile, updateSharePointFile } from './microsoftGraphService';
import { getWordDocumentContent } from './officeJsService';
import { getAccessToken } from './microsoftAuthService';

// Constants
const VAULT_API_URL = '/api/vault';

/**
 * Check out a document from Vault to Microsoft Office
 * @param {Object} options Document checkout options
 * @param {string} options.documentId Document ID in the Vault
 * @param {string} options.checkoutLocation Where to check out the document ('sharepoint', 'onedrive', 'word')
 * @returns {Promise<Object>} Checkout result with document link
 */
export const checkoutDocumentToOffice = async ({ documentId, checkoutLocation = 'word' }) => {
  try {
    console.log(`Checking out document ${documentId} to ${checkoutLocation}`);
    
    // 1. Mark document as checked out in the Vault
    const checkoutResponse = await fetch(`${VAULT_API_URL}/documents/${documentId}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ location: checkoutLocation })
    });
    
    if (!checkoutResponse.ok) {
      throw new Error(`Failed to check out document: ${checkoutResponse.statusText}`);
    }
    
    const checkoutData = await checkoutResponse.json();
    
    // 2. Get document metadata and content from Vault
    const documentResponse = await fetch(`${VAULT_API_URL}/documents/${documentId}`);
    
    if (!documentResponse.ok) {
      throw new Error(`Failed to get document: ${documentResponse.statusText}`);
    }
    
    const document = await documentResponse.json();
    
    // 3. Copy the document to the requested location
    let officeDocumentLink;
    
    switch (checkoutLocation) {
      case 'sharepoint':
        // Copy to SharePoint
        const sharePointResponse = await copyToSharePoint(documentId, document.name, document.content);
        officeDocumentLink = sharePointResponse.webUrl;
        break;
        
      case 'onedrive':
        // Copy to OneDrive
        const oneDriveResponse = await copyToOneDrive(documentId, document.name, document.content);
        officeDocumentLink = oneDriveResponse.webUrl;
        break;
        
      case 'word':
      default:
        // Generate direct Word Online URL
        officeDocumentLink = await generateWordOnlineUrl(documentId, document);
        break;
    }
    
    return {
      success: true,
      documentId,
      checkoutId: checkoutData.checkoutId,
      documentLink: officeDocumentLink,
      expiresAt: checkoutData.expiresAt
    };
  } catch (error) {
    console.error('Error checking out document to Office:', error);
    throw error;
  }
};

/**
 * Check in a document from Microsoft Office to Vault
 * @param {Object} options Document check-in options
 * @param {string} options.documentId Document ID in the Vault
 * @param {string} options.checkoutId Checkout ID
 * @param {string} options.comment Check-in comment
 * @param {string} options.source Document source ('sharepoint', 'onedrive', 'word')
 * @param {string} options.sourceId Source document ID
 * @returns {Promise<Object>} Check-in result
 */
export const checkinDocumentFromOffice = async ({ documentId, checkoutId, comment = '', source = 'word', sourceId }) => {
  try {
    console.log(`Checking in document ${documentId} from ${source}`);
    
    // 1. Get the document content from the source
    let content;
    
    switch (source) {
      case 'sharepoint':
        // Get from SharePoint
        if (!sourceId) {
          throw new Error('SharePoint document ID is required');
        }
        
        // In a real implementation, this would use the Microsoft Graph API
        // to get the document content from SharePoint
        content = await getSharePointContent(sourceId);
        break;
        
      case 'onedrive':
        // Get from OneDrive
        if (!sourceId) {
          throw new Error('OneDrive document ID is required');
        }
        
        // In a real implementation, this would use the Microsoft Graph API
        // to get the document content from OneDrive
        content = await getOneDriveContent(sourceId);
        break;
        
      case 'word':
      default:
        // Get from Word (direct content)
        if (window.Word) {
          content = await getWordDocumentContent();
        } else {
          throw new Error('Word is not available');
        }
        break;
    }
    
    if (!content) {
      throw new Error('Failed to get document content');
    }
    
    // 2. Check in the document to the Vault
    const checkinResponse = await fetch(`${VAULT_API_URL}/documents/${documentId}/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checkoutId,
        content,
        comment
      })
    });
    
    if (!checkinResponse.ok) {
      throw new Error(`Failed to check in document: ${checkinResponse.statusText}`);
    }
    
    const checkinData = await checkinResponse.json();
    
    return {
      success: true,
      documentId,
      versionId: checkinData.versionId,
      comment
    };
  } catch (error) {
    console.error('Error checking in document from Office:', error);
    throw error;
  }
};

/**
 * Perform compliance check on a document in Microsoft Office
 * @param {Object} options Compliance check options
 * @param {string} options.documentId Document ID in the Vault
 * @param {string} options.ectdSection eCTD section code (e.g., 'm2.5')
 * @param {string} options.content Document content (optional, will get from Word if not provided)
 * @returns {Promise<Object>} Compliance check results
 */
export const performComplianceCheck = async ({ documentId, ectdSection, content }) => {
  try {
    console.log(`Performing compliance check for document ${documentId} (${ectdSection})`);
    
    // If content is not provided, get it from Word
    if (!content && window.Word) {
      content = await getWordDocumentContent();
    }
    
    if (!content) {
      throw new Error('Document content is required for compliance check');
    }
    
    // Call compliance check API
    const complianceResponse = await fetch(`${VAULT_API_URL}/compliance/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentId,
        ectdSection,
        content
      })
    });
    
    if (!complianceResponse.ok) {
      throw new Error(`Failed to perform compliance check: ${complianceResponse.statusText}`);
    }
    
    const complianceResults = await complianceResponse.json();
    
    return complianceResults;
  } catch (error) {
    console.error('Error performing compliance check:', error);
    throw error;
  }
};

/**
 * Apply a regulatory template to a document in Microsoft Word
 * @param {Object} options Template application options
 * @param {string} options.templateId Template ID in the Vault
 * @param {string} options.ectdSection eCTD section code (e.g., 'm2.5')
 * @returns {Promise<Object>} Template application result
 */
export const applyRegulatoryTemplate = async ({ templateId, ectdSection }) => {
  try {
    console.log(`Applying regulatory template ${templateId} for section ${ectdSection}`);
    
    // 1. Get the template from the Vault
    const templateResponse = await fetch(`${VAULT_API_URL}/templates/${templateId}`);
    
    if (!templateResponse.ok) {
      throw new Error(`Failed to get template: ${templateResponse.statusText}`);
    }
    
    const template = await templateResponse.json();
    
    // 2. Apply the template to the Word document
    if (!window.Word) {
      throw new Error('Word is not available');
    }
    
    await Word.run(async (context) => {
      // Clear the document
      context.document.body.clear();
      
      // Insert template content
      context.document.body.insertHtml(template.content, Word.InsertLocation.replace);
      
      // Sync changes back to the document
      await context.sync();
    });
    
    return {
      success: true,
      templateId,
      ectdSection,
      templateName: template.name
    };
  } catch (error) {
    console.error('Error applying regulatory template:', error);
    throw error;
  }
};

/**
 * Get version history of a document in the Vault
 * @param {string} documentId Document ID in the Vault
 * @returns {Promise<Array>} Document version history
 */
export const getDocumentVersionHistory = async (documentId) => {
  try {
    console.log(`Getting version history for document ${documentId}`);
    
    // Call Vault API to get version history
    const historyResponse = await fetch(`${VAULT_API_URL}/documents/${documentId}/versions`);
    
    if (!historyResponse.ok) {
      throw new Error(`Failed to get version history: ${historyResponse.statusText}`);
    }
    
    const versions = await historyResponse.json();
    
    return versions;
  } catch (error) {
    console.error('Error getting document version history:', error);
    throw error;
  }
};

/**
 * Compare two versions of a document
 * @param {Object} options Version comparison options
 * @param {string} options.documentId Document ID in the Vault
 * @param {string} options.version1 First version ID
 * @param {string} options.version2 Second version ID
 * @returns {Promise<Object>} Version comparison results
 */
export const compareDocumentVersions = async ({ documentId, version1, version2 }) => {
  try {
    console.log(`Comparing versions ${version1} and ${version2} of document ${documentId}`);
    
    // Call Vault API to compare versions
    const compareResponse = await fetch(`${VAULT_API_URL}/documents/${documentId}/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version1,
        version2
      })
    });
    
    if (!compareResponse.ok) {
      throw new Error(`Failed to compare versions: ${compareResponse.statusText}`);
    }
    
    const comparison = await compareResponse.json();
    
    return comparison;
  } catch (error) {
    console.error('Error comparing document versions:', error);
    throw error;
  }
};

// Helper functions

/**
 * Copy a document to SharePoint
 * @param {string} documentId Document ID in the Vault
 * @param {string} documentName Document name
 * @param {string|ArrayBuffer} content Document content
 * @returns {Promise<Object>} SharePoint document metadata
 */
async function copyToSharePoint(documentId, documentName, content) {
  try {
    // Get SharePoint site ID and drive ID
    // In a real implementation, this would use the Microsoft Graph API
    const siteId = 'your-sharepoint-site-id';
    const driveId = 'your-sharepoint-drive-id';
    const folderPath = 'Regulatory/Working';
    
    // Upload the document to SharePoint
    const uploadedFile = await uploadSharePointFile(siteId, driveId, folderPath, documentName, content);
    
    return uploadedFile;
  } catch (error) {
    console.error('Error copying document to SharePoint:', error);
    throw error;
  }
}

/**
 * Copy a document to OneDrive
 * @param {string} documentId Document ID in the Vault
 * @param {string} documentName Document name
 * @param {string|ArrayBuffer} content Document content
 * @returns {Promise<Object>} OneDrive document metadata
 */
async function copyToOneDrive(documentId, documentName, content) {
  try {
    // In a real implementation, this would use the Microsoft Graph API
    // to upload the document to the user's OneDrive
    
    // For now, return a placeholder result
    return {
      id: `onedrive-${documentId}`,
      name: documentName,
      webUrl: `https://tenant-my.sharepoint.com/personal/user/Documents/${documentName}`,
      lastModifiedDateTime: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error copying document to OneDrive:', error);
    throw error;
  }
}

/**
 * Generate a Word Online URL for direct editing
 * @param {string} documentId Document ID in the Vault
 * @param {Object} document Document metadata
 * @returns {Promise<string>} Word Online URL
 */
async function generateWordOnlineUrl(documentId, document) {
  try {
    // Create a temporary copy in SharePoint for editing
    const tempFile = await copyToSharePoint(documentId, document.name, document.content);
    
    // Generate a Word Online URL for editing
    const shareUrl = tempFile.webUrl;
    const webUrl = `https://tenant.sharepoint.com/_layouts/15/Doc.aspx?sourcedoc=${encodeURIComponent(shareUrl)}&action=edit`;
    
    return webUrl;
  } catch (error) {
    console.error('Error generating Word Online URL:', error);
    throw error;
  }
}

/**
 * Get document content from SharePoint
 * @param {string} sharePointId SharePoint document ID
 * @returns {Promise<ArrayBuffer>} Document content
 */
async function getSharePointContent(sharePointId) {
  try {
    // In a real implementation, this would use the Microsoft Graph API
    // to get the document content from SharePoint
    
    // For now, return a placeholder result
    return new ArrayBuffer(0);
  } catch (error) {
    console.error('Error getting SharePoint content:', error);
    throw error;
  }
}

/**
 * Get document content from OneDrive
 * @param {string} oneDriveId OneDrive document ID
 * @returns {Promise<ArrayBuffer>} Document content
 */
async function getOneDriveContent(oneDriveId) {
  try {
    // In a real implementation, this would use the Microsoft Graph API
    // to get the document content from OneDrive
    
    // For now, return a placeholder result
    return new ArrayBuffer(0);
  } catch (error) {
    console.error('Error getting OneDrive content:', error);
    throw error;
  }
}

// Export a default API for importing
export default {
  checkoutDocumentToOffice,
  checkinDocumentFromOffice,
  performComplianceCheck,
  applyRegulatoryTemplate,
  getDocumentVersionHistory,
  compareDocumentVersions
};