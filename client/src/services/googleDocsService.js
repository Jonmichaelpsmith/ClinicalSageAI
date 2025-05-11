/**
 * Google Docs Integration Service
 * 
 * This service provides integration with Google Docs for document editing and management.
 * It handles creating, opening, and manipulating Google Docs within the TrialSage platform.
 */

import { getAccessToken, isAuthenticated } from './googleAuthService';

// Constants for Google API endpoints
const GOOGLE_DOCS_API = 'https://docs.googleapis.com/v1/documents';
const GOOGLE_DRIVE_API = 'https://www.googleapis.com/drive/v3';

/**
 * Initialize the Google Docs API
 * @returns {Promise<boolean>} True if initialization was successful
 */
export async function initializeGoogleDocsAPI() {
  try {
    // Check if gapi is available
    if (!window.gapi) {
      await loadGapiScript();
    }
    
    // Load the necessary APIs
    await new Promise((resolve, reject) => {
      window.gapi.load('client:auth2', {
        callback: resolve,
        onerror: reject,
        timeout: 10000,
        ontimeout: reject
      });
    });
    
    // Initialize the Google API client
    await window.gapi.client.init({
      apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
      discoveryDocs: [
        'https://docs.googleapis.com/$discovery/rest?version=v1',
        'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
      ],
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file'
    });
    
    console.log('Google Docs API initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Google Docs API:', error);
    return false;
  }
}

/**
 * Load the Google API client script dynamically
 * @returns {Promise<void>}
 */
function loadGapiScript() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

/**
 * Create a new Google Doc
 * @param {string} title - Document title
 * @param {string} initialContent - Initial document content (optional)
 * @returns {Promise<object>} The created document
 */
export async function createDocument(title, initialContent = '') {
  try {
    if (!isAuthenticated()) {
      throw new Error('Google authentication required');
    }
    
    // First create an empty document
    const createResponse = await window.gapi.client.docs.documents.create({
      title: title || 'Untitled Document'
    });
    
    const documentId = createResponse.result.documentId;
    console.log('Created new Google Doc with ID:', documentId);
    
    // If initial content is provided, update the document
    if (initialContent) {
      await updateDocumentContent(documentId, initialContent);
    }
    
    return {
      id: documentId,
      title: title || 'Untitled Document',
      url: `https://docs.google.com/document/d/${documentId}/edit`,
      embedUrl: `https://docs.google.com/document/d/${documentId}/edit?embedded=true`,
      shareUrl: `https://docs.google.com/document/d/${documentId}/edit?usp=sharing`
    };
  } catch (error) {
    console.error('Error creating Google Doc:', error);
    throw error;
  }
}

/**
 * Open an existing Google Doc
 * @param {string} documentId - Google Doc ID
 * @returns {Promise<object>} The document object with embed information
 */
export async function openDocument(documentId) {
  try {
    if (!isAuthenticated()) {
      throw new Error('Google authentication required');
    }
    
    // Verify the document exists and we have access
    const response = await window.gapi.client.docs.documents.get({
      documentId
    });
    
    const document = response.result;
    
    return {
      id: documentId,
      title: document.title,
      url: `https://docs.google.com/document/d/${documentId}/edit`,
      embedUrl: `https://docs.google.com/document/d/${documentId}/edit?embedded=true`,
      shareUrl: `https://docs.google.com/document/d/${documentId}/edit?usp=sharing`
    };
  } catch (error) {
    console.error('Error opening Google Doc:', error);
    throw error;
  }
}

/**
 * Create an iframe element for embedding a Google Doc
 * @param {string} documentId - Google Doc ID
 * @param {string} width - Iframe width (default: '100%')
 * @param {string} height - Iframe height (default: '600px')
 * @returns {HTMLIFrameElement} The iframe element for embedding
 */
export function createEmbedIframe(documentId, width = '100%', height = '600px') {
  // Create iframe for Google Docs
  const iframe = document.createElement('iframe');
  iframe.src = `https://docs.google.com/document/d/${documentId}/edit?embedded=true`;
  iframe.width = width;
  iframe.height = height;
  iframe.style.border = 'none';
  iframe.allow = 'autoplay; clipboard-write';
  iframe.allowFullscreen = true;
  
  // Set additional attributes for better integration
  iframe.setAttribute('data-google-doc-id', documentId);
  
  return iframe;
}

/**
 * Update the content of a Google Doc
 * @param {string} documentId - Google Doc ID
 * @param {string} content - Content to write to the document
 * @returns {Promise<object>} Response from the API
 */
export async function updateDocumentContent(documentId, content) {
  try {
    if (!isAuthenticated()) {
      throw new Error('Google authentication required');
    }
    
    // Clear existing content
    const document = await window.gapi.client.docs.documents.get({
      documentId
    });
    
    // If document has content, clear it first
    if (document.result.body && document.result.body.content && document.result.body.content.length > 1) {
      const endIndex = document.result.body.content[document.result.body.content.length - 1].endIndex;
      
      await window.gapi.client.docs.documents.batchUpdate({
        documentId,
        resource: {
          requests: [
            {
              deleteContentRange: {
                range: {
                  startIndex: 1,
                  endIndex: endIndex - 1
                }
              }
            }
          ]
        }
      });
    }
    
    // Now insert the new content
    return window.gapi.client.docs.documents.batchUpdate({
      documentId,
      resource: {
        requests: [
          {
            insertText: {
              location: {
                index: 1
              },
              text: content
            }
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error updating Google Doc content:', error);
    throw error;
  }
}

/**
 * Get the content of a Google Doc
 * @param {string} documentId - Google Doc ID
 * @returns {Promise<string>} The document content as text
 */
export async function getDocumentContent(documentId) {
  try {
    if (!isAuthenticated()) {
      throw new Error('Google authentication required');
    }
    
    const response = await window.gapi.client.docs.documents.get({
      documentId
    });
    
    const document = response.result;
    let content = '';
    
    // Extract text content from the document
    if (document.body && document.body.content) {
      document.body.content.forEach(element => {
        if (element.paragraph) {
          element.paragraph.elements.forEach(paragraphElement => {
            if (paragraphElement.textRun) {
              content += paragraphElement.textRun.content;
            }
          });
        }
      });
    }
    
    return content;
  } catch (error) {
    console.error('Error getting Google Doc content:', error);
    throw error;
  }
}

/**
 * Export a Google Doc to PDF
 * @param {string} documentId - Google Doc ID
 * @returns {Promise<Blob>} The PDF file as a Blob
 */
export async function exportToPDF(documentId) {
  try {
    if (!isAuthenticated()) {
      throw new Error('Google authentication required');
    }
    
    const accessToken = await getAccessToken();
    
    // Use the Drive API to export the document as PDF
    const response = await fetch(
      `${GOOGLE_DRIVE_API}/files/${documentId}/export?mimeType=application/pdf`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Error exporting Google Doc to PDF: ${response.statusText}`);
    }
    
    return await response.blob();
  } catch (error) {
    console.error('Error exporting Google Doc to PDF:', error);
    throw error;
  }
}

/**
 * Insert content at the cursor position in a Google Doc
 * @param {string} documentId - Google Doc ID
 * @param {string} content - Content to insert
 * @returns {Promise<object>} Response from the API
 */
export async function insertContentAtCursor(documentId, content) {
  try {
    if (!isAuthenticated()) {
      throw new Error('Google authentication required');
    }
    
    // For Google Docs API, there's no direct way to insert at cursor
    // As a workaround, we'll append to the end of the document
    const document = await window.gapi.client.docs.documents.get({
      documentId
    });
    
    const endIndex = document.result.body.content[document.result.body.content.length - 1].endIndex;
    
    return window.gapi.client.docs.documents.batchUpdate({
      documentId,
      resource: {
        requests: [
          {
            insertText: {
              location: {
                index: endIndex - 1
              },
              text: content
            }
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error inserting content into Google Doc:', error);
    throw error;
  }
}

/**
 * Share a Google Doc with specific users
 * @param {string} documentId - Google Doc ID
 * @param {string} email - Email address to share with
 * @param {string} role - Role to assign (reader, commenter, writer, owner)
 * @returns {Promise<object>} Response from the API
 */
export async function shareDocument(documentId, email, role = 'writer') {
  try {
    if (!isAuthenticated()) {
      throw new Error('Google authentication required');
    }
    
    return window.gapi.client.drive.permissions.create({
      fileId: documentId,
      resource: {
        type: 'user',
        role: role,
        emailAddress: email
      }
    });
  } catch (error) {
    console.error('Error sharing Google Doc:', error);
    throw error;
  }
}

/**
 * Insert a regulatory template into a Google Doc
 * @param {string} documentId - Google Doc ID
 * @param {string} templateType - Type of template to insert
 * @returns {Promise<object>} Response from the API
 */
export async function insertTemplate(documentId, templateType) {
  try {
    if (!isAuthenticated()) {
      throw new Error('Google authentication required');
    }
    
    // Get the template content based on type
    let templateContent;
    switch (templateType) {
      case 'clinicalProtocol':
        templateContent = getTemplateForClinicalProtocol();
        break;
      case 'clinicalStudyReport':
        templateContent = getTemplateForClinicalStudyReport();
        break;
      case 'regulatorySubmission':
        templateContent = getTemplateForRegulatorySubmission();
        break;
      case 'clinicalEvaluation':
        templateContent = getTemplateForClinicalEvaluation();
        break;
      default:
        templateContent = '';
        break;
    }
    
    // Insert the template content into the document
    return updateDocumentContent(documentId, templateContent);
  } catch (error) {
    console.error('Error inserting template into Google Doc:', error);
    throw error;
  }
}

// Helper functions for template content
function getTemplateForClinicalProtocol() {
  return `# Clinical Protocol Template
  
## 1. Protocol Summary
[Enter protocol summary here]

## 2. Introduction
### 2.1 Background
[Enter background information here]
### 2.2 Rationale
[Enter study rationale here]

## 3. Objectives
### 3.1 Primary Objective
[Enter primary objective here]
### 3.2 Secondary Objectives
[Enter secondary objectives here]

## 4. Study Design
[Enter study design description here]

## 5. Study Population
### 5.1 Inclusion Criteria
[Enter inclusion criteria here]
### 5.2 Exclusion Criteria
[Enter exclusion criteria here]

## 6. Study Procedures
[Enter study procedures here]

## 7. Statistical Analysis
[Enter statistical analysis plan here]

## 8. Safety Assessments
[Enter safety assessment procedures here]

## 9. Ethics and Regulatory Considerations
[Enter ethics and regulatory information here]
`;
}

function getTemplateForClinicalStudyReport() {
  return `# Clinical Study Report Template
  
## 1. Synopsis
[Enter study synopsis here]

## 2. Introduction
[Enter introduction here]

## 3. Study Objectives
[Enter study objectives here]

## 4. Investigational Plan
### 4.1 Study Design
[Enter study design here]
### 4.2 Study Population
[Enter study population details here]

## 5. Efficacy Results
[Enter efficacy results here]

## 6. Safety Results
[Enter safety results here]

## 7. Discussion and Conclusion
[Enter discussion and conclusion here]

## 8. References
[Enter references here]
`;
}

function getTemplateForRegulatorySubmission() {
  return `# Regulatory Submission Template
  
## 1. Administrative Information
[Enter administrative information here]

## 2. Product Information
[Enter product information here]

## 3. Non-Clinical Overview
[Enter non-clinical overview here]

## 4. Clinical Overview
[Enter clinical overview here]

## 5. Risk Management Plan
[Enter risk management plan here]

## 6. Labeling
[Enter labeling information here]

## 7. Appendices
[Enter appendices here]
`;
}

function getTemplateForClinicalEvaluation() {
  return `# Clinical Evaluation Report Template
  
## 1. Executive Summary
[Enter executive summary here]

## 2. Scope
[Enter scope here]

## 3. Device Description
[Enter device description here]

## 4. Clinical Background
[Enter clinical background here]

## 5. Literature Review
[Enter literature review here]

## 6. Clinical Experience
[Enter clinical experience here]

## 7. Risk Analysis
[Enter risk analysis here]

## 8. Conclusion
[Enter conclusion here]

## 9. References
[Enter references here]
`;
}