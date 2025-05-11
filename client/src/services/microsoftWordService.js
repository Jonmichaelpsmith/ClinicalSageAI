/**
 * Microsoft Word Service
 * 
 * This service provides integration with Microsoft Word via the Office JS API,
 * enabling document editing, formatting, and content insertion capabilities.
 */

import axios from 'axios';

/**
 * Initialize the Office JS API
 * 
 * @returns {Promise<boolean>} - True if initialization was successful
 */
export async function initializeOfficeJS() {
  try {
    // Check if Office is already available
    if (window.Office && window.Word) {
      console.log('Office JS API already available');
      return true;
    }
    
    // Add Office JS script if not already included
    return new Promise((resolve) => {
      // Check if the script already exists
      if (document.getElementById('office-js-api')) {
        console.log('Office JS API script already loaded');
        resolve(true);
        return;
      }
      
      console.log('Loading Office JS API...');
      const script = document.createElement('script');
      script.id = 'office-js-api';
      script.src = 'https://appsforoffice.microsoft.com/lib/1/hosted/office.js';
      script.async = true;
      script.onload = () => {
        console.log('Office JS API loaded successfully');
        
        // Initialize Office
        if (window.Office) {
          window.Office.initialize = () => {
            console.log('Office initialized successfully');
            resolve(true);
          };
        } else {
          console.error('Failed to load Office JS API');
          resolve(false);
        }
      };
      
      script.onerror = () => {
        console.error('Error loading Office JS API');
        resolve(false);
      };
      
      document.body.appendChild(script);
    });
  } catch (error) {
    console.error('Error initializing Office JS:', error);
    return false;
  }
}

/**
 * Open a document in Microsoft Word
 * 
 * @param {string} documentId - The document ID
 * @param {string} content - Document content
 * @returns {Promise<Object>} - Word document object
 */
export async function openDocument(documentId, content) {
  try {
    // First check if we have access to the Office JS API
    if (!window.Word) {
      throw new Error('Microsoft Word API not available');
    }
    
    console.log('Creating Word document container...');
    
    // Create a container for the Word editor
    const container = document.createElement('div');
    container.id = `word-editor-container-${documentId}`;
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.minHeight = '500px';
    container.style.border = '1px solid #e2e8f0';
    
    // Create the Word document
    const wordDocument = {
      id: documentId,
      container,
      content,
      instance: null
    };
    
    // Initialize the Word document
    console.log('Initializing Word document...');
    
    // Use the Office JS API to create a new Word document
    // This is a simplified implementation - actual implementation would use
    // the Office JS API to initialize a Word document in the container
    try {
      // Request the embedded Word instance from Microsoft
      const response = await axios.post('/api/microsoft-office/embed', {
        documentId,
        content
      });
      
      if (response.data.embedHtml) {
        // Insert the embed HTML into the container
        container.innerHTML = response.data.embedHtml;
        wordDocument.instance = response.data;
      } else {
        throw new Error('Failed to get Word embed HTML');
      }
    } catch (err) {
      console.error('Error initializing Word document:', err);
      // Fallback approach - simple iframe pointing to Office Online
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      
      // Use Microsoft's Office Online embed URL
      iframe.src = `https://word-edit.officeapps.live.com/we/wordeditorframe.aspx?ui=en-us&rs=en-us&wopisrc=${encodeURIComponent(`https://yourdomain.com/api/wopi/files/${documentId}`)}`;
      
      container.innerHTML = '';
      container.appendChild(iframe);
      
      wordDocument.instance = {
        type: 'iframe',
        iframe
      };
    }
    
    return wordDocument;
  } catch (error) {
    console.error('Error opening document:', error);
    throw error;
  }
}

/**
 * Save document content
 * 
 * @param {Object} document - Word document object
 * @returns {Promise<string>} - Document content
 */
export async function saveDocumentContent(document) {
  try {
    if (!document || !document.id) {
      throw new Error('Invalid document');
    }
    
    // Get content from the Word document
    // This is a simplified implementation - actual implementation would use
    // the Office JS API to get the document content
    
    // Request the content from the server
    const response = await axios.get(`/api/microsoft-office/content/${document.id}`);
    
    return response.data.content || '';
  } catch (error) {
    console.error('Error saving document content:', error);
    throw error;
  }
}

/**
 * Insert template into a document
 * 
 * @param {Object} document - Word document object
 * @param {string} templateName - Name of the template to insert
 * @returns {Promise<boolean>} - Success status
 */
export async function insertTemplate(document, templateName) {
  try {
    if (!document || !document.id) {
      throw new Error('Invalid document');
    }
    
    // Get template content
    const response = await axios.get(`/api/microsoft-office/templates/${templateName}`);
    
    if (!response.data.content) {
      throw new Error(`Template ${templateName} not found`);
    }
    
    // Insert template content
    const insertResponse = await axios.post(`/api/microsoft-office/content/${document.id}/insert`, {
      content: response.data.content,
      position: 'start' // or 'end', 'cursor'
    });
    
    return !!insertResponse.data.success;
  } catch (error) {
    console.error('Error inserting template:', error);
    throw error;
  }
}

/**
 * Insert AI-generated content into a document
 * 
 * @param {Object} document - Word document object
 * @param {string} content - Content to insert
 * @returns {Promise<boolean>} - Success status
 */
export async function insertAIContent(document, content) {
  try {
    if (!document || !document.id) {
      throw new Error('Invalid document');
    }
    
    // Insert AI content
    const insertResponse = await axios.post(`/api/microsoft-office/content/${document.id}/insert`, {
      content,
      position: 'cursor' // Insert at cursor position
    });
    
    return !!insertResponse.data.success;
  } catch (error) {
    console.error('Error inserting AI content:', error);
    throw error;
  }
}

/**
 * Format document headings
 * 
 * @param {Object} document - Word document object
 * @returns {Promise<boolean>} - Success status
 */
export async function formatDocumentHeadings(document) {
  try {
    if (!document || !document.id) {
      throw new Error('Invalid document');
    }
    
    // Format document headings
    const formatResponse = await axios.post(`/api/microsoft-office/format/${document.id}/headings`);
    
    return !!formatResponse.data.success;
  } catch (error) {
    console.error('Error formatting document headings:', error);
    throw error;
  }
}

/**
 * Export document to PDF
 * 
 * @param {Object} document - Word document object
 * @returns {Promise<Blob>} - PDF blob
 */
export async function exportToPDF(document) {
  try {
    if (!document || !document.id) {
      throw new Error('Invalid document');
    }
    
    // Export to PDF
    const response = await axios.get(`/api/microsoft-office/export/${document.id}/pdf`, {
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
}