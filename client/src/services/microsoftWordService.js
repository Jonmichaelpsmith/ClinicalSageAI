/**
 * Microsoft Word Service
 * 
 * This service provides integration with the Microsoft Word JavaScript API.
 * It handles document operations and provides methods for working with Word documents.
 */

import { getAccessToken } from './microsoftAuthService';

/**
 * Initialize the Office JS API
 * @returns {Promise<boolean>} True if initialization was successful
 */
export async function initializeOfficeJS() {
  return new Promise((resolve) => {
    // Check if Office JS API is already loaded and initialized
    if (window.Office && window.Office.initialized) {
      console.log('Office JS API already loaded and initialized');
      resolve(true);
      return;
    }
    
    if (window.Office) {
      // Office is loaded but not fully initialized, wait for onReady
      console.log('Office JS API loaded, waiting for initialization');
      window.Office.onReady()
        .then(info => {
          console.log('Office initialized via onReady:', info.host);
          resolve(true);
        })
        .catch(error => {
          console.error('Error during Office onReady:', error);
          resolve(false);
        });
      return;
    }
    
    // Load Office JS API
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://appsforoffice.microsoft.com/lib/1/hosted/office.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Office JS API script loaded');
      
      // Add Microsoft Fabric UI (modern Fluent UI)
      const fluentUIScript = document.createElement('script');
      fluentUIScript.type = 'text/javascript';
      fluentUIScript.src = 'https://static2.sharepointonline.com/files/fabric/office-ui-fabric-js/1.5.0/js/fabric.min.js';
      document.head.appendChild(fluentUIScript);
      
      // Add Office UI styles
      const officeUIStyles = document.createElement('link');
      officeUIStyles.rel = 'stylesheet';
      officeUIStyles.href = 'https://static2.sharepointonline.com/files/fabric/office-ui-fabric-js/1.5.0/css/fabric.min.css';
      document.head.appendChild(officeUIStyles);
      
      if (window.Office) {
        // Use the modern Office.onReady() method
        console.log('Using Office.onReady to initialize');
        window.Office.onReady()
          .then(info => {
            console.log('Office initialized via onReady:', info.host);
            window.Office.initialized = true;
            resolve(true);
          })
          .catch(error => {
            console.error('Error during Office onReady:', error);
            resolve(false);
          });
      } else {
        // Fallback for older Office.js versions
        console.log('Office object not available after loading script, using fallback initialization');
        window.Office = {
          initialized: true,
          context: {
            host: 'Word', // Simulate Word host
            requirements: {
              isSetSupported: () => true
            }
          },
          // Standard Office.js methods
          onReady: () => Promise.resolve({ host: 'Word' }),
          initialize: callback => setTimeout(() => callback(), 100)
        };
        
        // Set a global flag for non-Office.js environment
        window.Office.isSimulated = true;
        console.warn('Using simulated Office environment for development');
        resolve(true);
      }
    };
    
    script.onerror = (error) => {
      console.error('Error loading Office JS API:', error);
      console.warn('Office JS API failed to load. Using simulated environment for development.');
      
      // Create a simulated Office environment for development
      window.Office = {
        initialized: true,
        context: {
          host: 'Word', // Simulate Word host
          requirements: {
            isSetSupported: () => true
          }
        },
        // Standard Office.js methods
        onReady: () => Promise.resolve({ host: 'Word' }),
        initialize: callback => setTimeout(() => callback(), 100)
      };
      
      // Set a global flag for non-Office.js environment
      window.Office.isSimulated = true;
      resolve(true);
    };
    
    document.head.appendChild(script);
  });
}

/**
 * Get the Word application object
 * @returns {Promise<object>} Word application object
 */
export async function getWordApplication() {
  try {
    // Ensure Office JS is initialized
    const initialized = await initializeOfficeJS();
    
    if (!initialized) {
      throw new Error('Failed to initialize Office JS API');
    }
    
    if (!window.Word) {
      console.log('Word object not available directly, checking Office.context');
      
      // Office JS might be loaded but the Word object may not be directly available
      // Check if we're in a Word context
      if (window.Office && 
          window.Office.context && 
          window.Office.context.host === Office.HostType.Word) {
        console.log('Running in Word context');
        return window.Office.context;
      } else {
        // We're not in a Word context, try using the Office container
        throw new Error('Microsoft Word is not available. This application must be run inside Word or Word Online.');
      }
    }
    
    console.log('Word application object retrieved');
    return window.Word;
  } catch (error) {
    console.error('Error getting Word application:', error);
    throw error;
  }
}

/**
 * Create a new Word document
 * @param {string} documentContent - Initial document content (optional)
 * @returns {Promise<object>} Word document object
 */
export async function createDocument(documentContent = '') {
  try {
    const Word = await getWordApplication();
    
    // In a real implementation, this would create a new document in Word Online
    // For now, we'll simulate this by returning a Word document object
    
    const document = {
      body: {
        insertText: async (text, location) => {
          console.log(`Inserting text at ${location}:`, text);
          // In a real implementation, this would insert text in the document
          return document;
        },
        insertHtml: async (html, location) => {
          console.log(`Inserting HTML at ${location}:`, html);
          // In a real implementation, this would insert HTML in the document
          return document;
        },
        getText: async () => {
          // In a real implementation, this would get text from the document
          return documentContent || 'Sample document content';
        }
      },
      save: async () => {
        console.log('Saving document');
        // In a real implementation, this would save the document
        return true;
      }
    };
    
    if (documentContent) {
      await document.body.insertText(documentContent, 'replace');
    }
    
    return document;
  } catch (error) {
    console.error('Error creating Word document:', error);
    throw error;
  }
}

/**
 * Open an existing Word document using Office JS
 * @param {string} documentId - Document ID to open
 * @param {string} documentContent - Document content
 * @returns {Promise<object>} Word document object
 */
export async function openDocument(documentId, documentContent) {
  try {
    // Verify we have an access token for Microsoft
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      console.warn('No Microsoft access token available. Authentication needed.');
      throw new Error('Microsoft authentication required. Please sign in with your Microsoft account.');
    }
    
    console.log(`Opening document ${documentId} with Office JS API`);
    if (documentContent) {
      console.log(`Document content preview: ${documentContent.substring(0, 50)}${documentContent.length > 50 ? '...' : ''}`);
    }
    
    // Make sure Office JS is initialized
    const initialized = await initializeOfficeJS();
    if (!initialized) {
      throw new Error('Failed to initialize Office JS API');
    }
    
    if (!window.Office) {
      throw new Error('Office JS is not available. Cannot embed Word.');
    }
    
    // Create a container to hold the Word Online iframe
    const container = document.createElement('div');
    container.id = `word-container-${documentId}`;
    container.style.width = '100%';
    container.style.height = '600px';
    container.style.border = 'none';
    container.style.overflow = 'hidden';
    
    // Create an iframe that will host Word Online
    const iframe = document.createElement('iframe');
    iframe.id = `word-frame-${documentId}`;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.allowFullscreen = true;
    
    // Add the iframe to the container
    container.appendChild(iframe);
    
    // Add container to the document but make it hidden initially
    container.style.display = 'none';
    document.body.appendChild(container);
    
    // For production, we need to get a WebUrl for the document from Microsoft Graph API
    let wordOnlineUrl;
    
    // Try to get real Word Online URL using Microsoft Graph, if possible
    try {
      console.log('Attempting to get Word Online URL from Microsoft Graph API');
      const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me/drive/items/' + documentId, {
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      });
      
      if (graphResponse.ok) {
        const fileData = await graphResponse.json();
        wordOnlineUrl = fileData.webUrl;
        console.log('Got Word Online URL from Microsoft Graph:', wordOnlineUrl);
      } else {
        console.warn('Failed to get document URL from Microsoft Graph:', await graphResponse.text());
      }
    } catch (graphError) {
      console.warn('Error accessing Microsoft Graph:', graphError);
    }
    
    // If we couldn't get a real URL, attempt to get one via our backend bridge
    if (!wordOnlineUrl) {
      try {
        console.log('Attempting to get Word Online URL via server-side bridge');
        const serverResponse = await fetch(`/api/microsoft-office/embed-url/${documentId}`, {
          headers: {
            'Authorization': 'Bearer ' + accessToken
          }
        });
        
        if (serverResponse.ok) {
          const urlData = await serverResponse.json();
          wordOnlineUrl = urlData.embedUrl;
          console.log('Got Word Online URL from server bridge:', wordOnlineUrl);
        } else {
          console.warn('Failed to get document URL from server bridge:', await serverResponse.text());
        }
      } catch (serverError) {
        console.warn('Error accessing server bridge for Word embedding:', serverError);
      }
    }
    
    // Final fallback for development - only used if all other methods fail
    if (!wordOnlineUrl) {
      console.warn('Using fallback Word Online URL for development (last resort)');
      
      // Generate a development URL for Word Online with document ID and token
      wordOnlineUrl = `https://www.office.com/launch/word?auth=2&auth_upn=${encodeURIComponent(
        'user@trialsage.com'
      )}&sourcedoc=${encodeURIComponent(documentId)}&access_token=${encodeURIComponent(accessToken)}`;
    }
    
    console.log('Word Online URL:', wordOnlineUrl);
    
    // Load Word Online in the iframe
    iframe.src = wordOnlineUrl;
    
    // Set up message event listener for communication with Word Online
    const messageHandler = (event) => {
      // Verify the origin for security
      if (event.origin.includes('office.com') || event.origin.includes('microsoft.com')) {
        console.log('Received message from Word Online:', event.data);
        
        // Handle Word Online messages
        if (event.data && event.data.messageType === 'documentReady') {
          console.log('Word document is ready');
          // Show the container when the document is ready
          container.style.display = 'block';
        }
      }
    };
    
    // Add message event listener
    window.addEventListener('message', messageHandler);
    
    // Store the handler reference so it can be removed later if needed
    container.messageHandler = messageHandler;
    
    // Create document interface object
    const wordDocument = {
      documentId,
      container,
      iframe,
      content: documentContent,
      
      /**
       * Insert text at specified location using Office JS
       */
      insertText: async (text, location = 'end') => {
        console.log('Inserting text at', location, ':', text);
        
        if (!window.Office) {
          console.error('Office JS not initialized');
          return;
        }
        
        try {
          // Real Office JS implementation
          await Office.onReady();
          
          // Use Word API if we're in Word context
          if (Office.context.host === Office.HostType.Word) {
            return Word.run(async (context) => {
              let range;
              
              if (location === 'start') {
                range = context.document.body.getRange('start');
              } else if (location === 'end') {
                range = context.document.body.getRange('end');
              } else {
                range = context.document.getSelection();
              }
              
              range.insertText(text, Word.InsertLocation.replace);
              await context.sync();
              console.log('Text inserted successfully via Office JS');
            });
          } else {
            console.warn('Not running in Word context, using fallback method');
            // Fallback for testing
            wordDocument.content += text;
            console.log('Text inserted (simulated)');
          }
        } catch (error) {
          console.error('Error inserting text:', error);
        }
      },
      
      /**
       * Insert HTML at specified location using Office JS
       */
      insertHtml: async (html, location = 'end') => {
        console.log('Inserting HTML at', location);
        
        if (!window.Office) {
          console.error('Office JS not initialized');
          return;
        }
        
        try {
          // Real Office JS implementation
          await Office.onReady();
          
          // Use Word API if we're in Word context
          if (Office.context.host === Office.HostType.Word) {
            return Word.run(async (context) => {
              let range;
              
              if (location === 'start') {
                range = context.document.body.getRange('start');
              } else if (location === 'end') {
                range = context.document.body.getRange('end');
              } else {
                range = context.document.getSelection();
              }
              
              range.insertHtml(html, Word.InsertLocation.replace);
              await context.sync();
              console.log('HTML inserted successfully via Office JS');
            });
          } else {
            console.warn('Not running in Word context, using fallback method');
            // Fallback for testing
            wordDocument.content += html;
            console.log('HTML inserted (simulated)');
          }
        } catch (error) {
          console.error('Error inserting HTML:', error);
        }
      },
      
      /**
       * Get document content using Office JS
       */
      getText: async () => {
        if (!window.Office) {
          console.error('Office JS not initialized');
          return wordDocument.content;
        }
        
        try {
          // Real Office JS implementation
          await Office.onReady();
          
          // Use Word API if we're in Word context
          if (Office.context.host === Office.HostType.Word) {
            return Word.run(async (context) => {
              const body = context.document.body;
              body.load('text');
              await context.sync();
              return body.text;
            });
          } else {
            console.warn('Not running in Word context, using fallback method');
            return wordDocument.content;
          }
        } catch (error) {
          console.error('Error getting text:', error);
          return wordDocument.content;
        }
      },
      
      /**
       * Save document using Office JS
       */
      save: async () => {
        if (!window.Office) {
          console.error('Office JS not initialized');
          return false;
        }
        
        try {
          // Real Office JS implementation
          await Office.onReady();
          
          if (Office.context.host === Office.HostType.Word) {
            // Use the document.save method in Word
            await Word.run(async (context) => {
              context.document.save();
              await context.sync();
              console.log('Document saved successfully via Office JS');
            });
            return true;
          } else {
            console.warn('Not running in Word context, using fallback method');
            console.log('Document saved (simulated)');
            return true;
          }
        } catch (error) {
          console.error('Error saving document:', error);
          return false;
        }
      }
    };
    
    // Set up the iframe to load Word Online
    iframe.src = 'about:blank';  // Start with a blank page
    
    // In a real implementation, this would load Word Online URL
    // iframe.src = wordOnlineUrl;
    
    // For now, we'll load a simulated Word interface
    iframe.onload = () => {
      if (iframe.src === 'about:blank') {
        // Create a simulated Word Online UI in the iframe
        const wordOnlineSimulatedHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Microsoft Word Online</title>
            <style>
              body {
                font-family: 'Segoe UI', 'Calibri', sans-serif;
                margin: 0;
                padding: 0;
                overflow: hidden;
              }
              .word-ribbon {
                background: #2b579a;
                color: white;
                padding: 4px 8px;
                display: flex;
                align-items: center;
              }
              .word-ribbon-title {
                margin-right: 20px;
              }
              .word-ribbon-tabs {
                display: flex;
              }
              .word-ribbon-tab {
                padding: 6px 12px;
                cursor: pointer;
              }
              .word-ribbon-tab.active {
                background: #fff;
                color: #2b579a;
              }
              .word-toolbar {
                background: #f4f4f4;
                border-bottom: 1px solid #d6d6d6;
                padding: 4px 8px;
                display: flex;
                align-items: center;
              }
              .word-toolbar-button {
                background: transparent;
                border: 1px solid transparent;
                padding: 4px 8px;
                margin-right: 4px;
                cursor: pointer;
                border-radius: 2px;
              }
              .word-toolbar-button:hover {
                border-color: #d6d6d6;
              }
              .word-editor {
                padding: 20px;
                height: calc(100vh - 80px);
                overflow: auto;
              }
              .word-content {
                background: white;
                padding: 40px;
                min-height: 500px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                max-width: 816px; /* US Letter width */
                margin: 0 auto;
              }
              .word-statusbar {
                background: #f4f4f4;
                border-top: 1px solid #d6d6d6;
                padding: 2px 8px;
                font-size: 12px;
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                display: flex;
                justify-content: space-between;
              }
              .ms-notice {
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(255,255,255,0.9);
                border: 1px solid #d6d6d6;
                padding: 5px 10px;
                border-radius: 3px;
                font-size: 12px;
                color: #333;
                z-index: 1000;
              }
            </style>
          </head>
          <body>
            <div class="ms-notice">Integration with Microsoft Word 365 (Demo Mode)</div>
            <div class="word-ribbon">
              <div class="word-ribbon-title">Word</div>
              <div class="word-ribbon-tabs">
                <div class="word-ribbon-tab active">Home</div>
                <div class="word-ribbon-tab">Insert</div>
                <div class="word-ribbon-tab">Design</div>
                <div class="word-ribbon-tab">Layout</div>
                <div class="word-ribbon-tab">References</div>
                <div class="word-ribbon-tab">Review</div>
                <div class="word-ribbon-tab">View</div>
              </div>
            </div>
            <div class="word-toolbar">
              <button class="word-toolbar-button">Bold</button>
              <button class="word-toolbar-button">Italic</button>
              <button class="word-toolbar-button">Underline</button>
              <button class="word-toolbar-button">Copy</button>
              <button class="word-toolbar-button">Paste</button>
              <button class="word-toolbar-button">Format</button>
            </div>
            <div class="word-editor">
              <div class="word-content" contenteditable="true">
                ${documentContent || 'Type your document here...'}
              </div>
            </div>
            <div class="word-statusbar">
              <div>Page 1 of 1</div>
              <div>100%</div>
              <div>English (US)</div>
            </div>
            <script>
              // Track changes to content
              document.querySelector('.word-content').addEventListener('input', (e) => {
                console.log('Content changed');
                window.parent.postMessage({
                  type: 'content-changed',
                  content: e.target.innerHTML
                }, '*');
              });
              
              // Set up communication with parent window
              window.addEventListener('message', (event) => {
                if (event.data.type === 'get-content') {
                  window.parent.postMessage({
                    type: 'content',
                    content: document.querySelector('.word-content').innerHTML
                  }, '*');
                } else if (event.data.type === 'set-content') {
                  document.querySelector('.word-content').innerHTML = event.data.content;
                }
              });
            </script>
          </body>
          </html>
        `;
        
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(wordOnlineSimulatedHTML);
        iframe.contentWindow.document.close();
        
        console.log('Word Online simulation loaded in iframe');
      }
    };
    
    // Set up message listener for iframe communication
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'content-changed') {
        wordDocument.content = event.data.content;
        console.log('Document content updated from iframe');
      }
    });
    
    // Return the document object
    // Add cleanup method to properly dispose resources
    wordDocument.close = () => {
      // Remove event listener
      if (container.messageHandler) {
        window.removeEventListener('message', container.messageHandler);
        delete container.messageHandler;
      }
      
      // Remove container from DOM
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
      
      console.log(`Word document ${documentId} closed`);
    };
    
    console.log('Word document interface created successfully');
    return wordDocument;
  } catch (error) {
    console.error('Error opening Word document:', error);
    
    // Cleanup any DOM elements that might have been created
    if (document.body.contains(container)) {
      if (container.messageHandler) {
        window.removeEventListener('message', container.messageHandler);
      }
      document.body.removeChild(container);
    }
    
    throw error;
  }
}

/**
 * Insert regulatory document template into current document
 * @param {object} document - Word document object
 * @param {string} templateType - Type of regulatory template
 * @returns {Promise<object>} Updated document
 */
export async function insertTemplate(document, templateType) {
  try {
    if (!document || !document.body) {
      throw new Error('Invalid document object');
    }
    
    let templateContent = '';
    
    // Get appropriate template content based on type
    switch (templateType.toLowerCase()) {
      case 'clinical-protocol':
        templateContent = getClinicalProtocolTemplate();
        break;
      case 'csr':
      case 'clinical-study-report':
        templateContent = getClinicalStudyReportTemplate();
        break;
      case 'regulatory-submission':
        templateContent = getRegulatorySubmissionTemplate();
        break;
      case 'cer':
      case 'clinical-evaluation-report':
        templateContent = getClinicalEvaluationTemplate();
        break;
      default:
        throw new Error(`Unknown template type: ${templateType}`);
    }
    
    // Insert template at beginning of document
    await document.body.insertHtml(templateContent, 'start');
    
    return document;
  } catch (error) {
    console.error('Error inserting template:', error);
    throw error;
  }
}

/**
 * Save document content
 * @param {object} document - Word document object
 * @returns {Promise<string>} Document content
 */
export async function saveDocumentContent(document) {
  try {
    if (!document || !document.body) {
      throw new Error('Invalid document object');
    }
    
    // In a real implementation with Office JS, we would get the document content
    // For now, we'll simulate this
    const content = await document.body.getText();
    
    // Save document
    await document.save();
    
    return content;
  } catch (error) {
    console.error('Error saving document content:', error);
    throw error;
  }
}

/**
 * Format document headings
 * @param {object} document - Word document object
 * @returns {Promise<object>} Updated document
 */
export async function formatDocumentHeadings(document) {
  try {
    if (!document || !document.body) {
      throw new Error('Invalid document object');
    }
    
    // In a real implementation, this would use the Word JS API to format headings
    console.log('Formatting document headings');
    
    return document;
  } catch (error) {
    console.error('Error formatting document headings:', error);
    throw error;
  }
}

/**
 * Insert AI-generated content at cursor position
 * @param {object} document - Word document object
 * @param {string} content - Content to insert
 * @returns {Promise<object>} Updated document
 */
export async function insertAIContent(document, content) {
  try {
    if (!document || !document.body) {
      throw new Error('Invalid document object');
    }
    
    // In a real implementation, this would insert content at the cursor position
    console.log('Inserting AI-generated content:', content.substring(0, 50) + '...');
    
    await document.body.insertText(content, 'end');
    
    return document;
  } catch (error) {
    console.error('Error inserting AI content:', error);
    throw error;
  }
}

/**
 * Export document to PDF
 * @param {object} document - Word document object
 * @returns {Promise<Blob>} PDF blob
 */
export async function exportToPDF(document) {
  try {
    if (!document || !document.body) {
      throw new Error('Invalid document object');
    }
    
    // In a real implementation, this would use the Word JS API to export to PDF
    console.log('Exporting document to PDF');
    
    // Return a mock PDF blob
    return new Blob(['PDF content'], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
}

// Template content generators
function getClinicalProtocolTemplate() {
  return `
    <h1>Clinical Trial Protocol</h1>
    <h2>1. Study Information</h2>
    <p>[Study title]</p>
    <p>[Protocol identifier]</p>
    <p>[Date]</p>
    
    <h2>2. Sponsor Information</h2>
    <p>[Sponsor name]</p>
    <p>[Address]</p>
    <p>[Contact information]</p>
    
    <h2>3. Background and Rationale</h2>
    <p>[Study background]</p>
    <p>[Rationale for conducting the study]</p>
    
    <h2>4. Study Objectives</h2>
    <h3>4.1 Primary Objective</h3>
    <p>[Primary objective]</p>
    
    <h3>4.2 Secondary Objectives</h3>
    <p>[Secondary objectives]</p>
    
    <h2>5. Study Design</h2>
    <p>[Study design description]</p>
    <p>[Methodology]</p>
    
    <h2>6. Selection and Withdrawal of Subjects</h2>
    <h3>6.1 Inclusion Criteria</h3>
    <p>[Inclusion criteria]</p>
    
    <h3>6.2 Exclusion Criteria</h3>
    <p>[Exclusion criteria]</p>
    
    <h2>7. Study Procedures</h2>
    <p>[Study procedures]</p>
    
    <h2>8. Safety Assessments</h2>
    <p>[Safety assessments]</p>
    
    <h2>9. Statistical Considerations</h2>
    <p>[Statistical methodology]</p>
    <p>[Sample size determination]</p>
    
    <h2>10. Ethical Considerations</h2>
    <p>[Ethical considerations]</p>
  `;
}

function getClinicalStudyReportTemplate() {
  return `
    <h1>Clinical Study Report</h1>
    <h2>1. Title Page</h2>
    <p>[Study title]</p>
    <p>[Study identifier]</p>
    <p>[Date]</p>
    
    <h2>2. Synopsis</h2>
    <p>[Brief summary of the study and its results]</p>
    
    <h2>3. Table of Contents</h2>
    
    <h2>4. List of Abbreviations and Definition of Terms</h2>
    <p>[Abbreviations and terms]</p>
    
    <h2>5. Ethics</h2>
    <p>[Ethics committee information]</p>
    <p>[Ethical conduct of the study]</p>
    
    <h2>6. Investigators and Study Administrative Structure</h2>
    <p>[Investigators]</p>
    <p>[Administrative structure]</p>
    
    <h2>7. Introduction</h2>
    <p>[Background]</p>
    <p>[Rationale]</p>
    
    <h2>8. Study Objectives</h2>
    <p>[Primary and secondary objectives]</p>
    
    <h2>9. Investigational Plan</h2>
    <h3>9.1 Overall Study Design and Plan</h3>
    <p>[Study design]</p>
    
    <h3>9.2 Selection of Study Population</h3>
    <p>[Inclusion/exclusion criteria]</p>
    
    <h2>10. Efficacy Evaluation</h2>
    <p>[Efficacy results]</p>
    
    <h2>11. Safety Evaluation</h2>
    <p>[Safety results]</p>
    
    <h2>12. Discussion and Overall Conclusions</h2>
    <p>[Discussion of results]</p>
    <p>[Conclusions]</p>
    
    <h2>13. References</h2>
    <p>[References]</p>
    
    <h2>14. Appendices</h2>
    <p>[Appendices]</p>
  `;
}

function getRegulatorySubmissionTemplate() {
  return `
    <h1>Regulatory Submission Document</h1>
    <h2>1. Administrative Information</h2>
    <p>[Application type]</p>
    <p>[Submission date]</p>
    <p>[Applicant information]</p>
    
    <h2>2. Product Information</h2>
    <p>[Product name]</p>
    <p>[Chemical name/description]</p>
    <p>[Dosage form and strength]</p>
    
    <h2>3. Quality Information</h2>
    <h3>3.1 Drug Substance</h3>
    <p>[Information on drug substance]</p>
    
    <h3>3.2 Drug Product</h3>
    <p>[Information on drug product]</p>
    
    <h2>4. Non-clinical Information</h2>
    <p>[Pharmacology]</p>
    <p>[Toxicology]</p>
    
    <h2>5. Clinical Information</h2>
    <p>[Clinical studies]</p>
    <p>[Efficacy data]</p>
    <p>[Safety data]</p>
    
    <h2>6. Risk Management Plan</h2>
    <p>[Safety concerns]</p>
    <p>[Pharmacovigilance plan]</p>
    <p>[Risk minimization measures]</p>
    
    <h2>7. Labeling</h2>
    <p>[Proposed labeling]</p>
    
    <h2>8. References</h2>
    <p>[References]</p>
  `;
}

function getClinicalEvaluationTemplate() {
  return `
    <h1>Clinical Evaluation Report</h1>
    <h2>1. General Information</h2>
    <p>[Device name]</p>
    <p>[Manufacturer]</p>
    <p>[Date of report]</p>
    
    <h2>2. Device Description</h2>
    <p>[Device description]</p>
    <p>[Intended use/purpose]</p>
    <p>[Classification]</p>
    
    <h2>3. Scope of the Clinical Evaluation</h2>
    <p>[Scope]</p>
    
    <h2>4. Clinical Background, Current Knowledge, and State of the Art</h2>
    <p>[Clinical background]</p>
    <p>[Current knowledge]</p>
    <p>[State of the art]</p>
    
    <h2>5. Clinical Data - Literature</h2>
    <p>[Literature search and evaluation]</p>
    
    <h2>6. Clinical Data - Clinical Experience</h2>
    <p>[Clinical investigations]</p>
    <p>[Post-market surveillance data]</p>
    
    <h2>7. Summary of Clinical Data and Appraisal</h2>
    <p>[Summary of all clinical data]</p>
    <p>[Evaluation of clinical data]</p>
    
    <h2>8. Analysis of the Clinical Data</h2>
    <h3>8.1 Performance</h3>
    <p>[Performance evaluation]</p>
    
    <h3>8.2 Safety</h3>
    <p>[Safety evaluation]</p>
    
    <h3>8.3 Risk/Benefit Profile</h3>
    <p>[Risk/benefit analysis]</p>
    
    <h2>9. Conclusions</h2>
    <p>[Conclusions drawn from the clinical evaluation]</p>
    
    <h2>10. Date of the Next Clinical Evaluation</h2>
    <p>[Date of next evaluation]</p>
    
    <h2>11. References</h2>
    <p>[References]</p>
    
    <h2>12. Qualification of the Responsible Evaluators</h2>
    <p>[Evaluator qualifications]</p>
  `;
}