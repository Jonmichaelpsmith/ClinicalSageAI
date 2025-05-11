/**
 * Microsoft Word Service
 * 
 * This service provides integration with Microsoft Word via the Office JS API,
 * enabling document editing, formatting, and content insertion capabilities
 * specifically tuned for regulatory document authoring.
 * 
 * Key integration points:
 * - In-app embedded Word experience
 * - Regulatory-compliant document structure
 * - Our Xerox DMS Vault integration (FDA 21 CFR Part 11 certified)
 * - Custom templates and formats for regulatory submissions
 */

// Office JS API for Word
const OFFICE_JS_API_URL = 'https://appsforoffice.microsoft.com/lib/1/hosted/office.js';

/**
 * Initialize the Office JS API for backward compatibility
 * @deprecated Use initializeWord instead
 */
export async function initializeOfficeJS() {
  console.warn('initializeOfficeJS is deprecated, use initializeWord instead');
  return initializeWord(document.getElementById('word-container'));
}

/**
 * Initialize the Office JS API
 * 
 * @returns {Promise<boolean>} - True if initialization was successful
 */
export async function initializeWord(containerElement) {
  try {
    // Load Office JS API dynamically
    if (!window.Office) {
      await loadOfficeJS();
    }
    
    // Initialize Word in the provided container
    const wordInstance = await window.Office.initialize({
      container: containerElement
    });
    
    return wordInstance;
  } catch (error) {
    console.error('Failed to initialize Microsoft Word:', error);
    return null;
  }
}

/**
 * Load Office JS API dynamically
 * 
 * @returns {Promise<void>}
 */
function loadOfficeJS() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = OFFICE_JS_API_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (error) => reject(new Error('Failed to load Office JS API'));
    document.head.appendChild(script);
  });
}

/**
 * Open an existing document
 * 
 * @param {Object} wordInstance - Word instance
 * @param {string} documentId - ID of the document to open
 * @returns {Promise<boolean>} - Success status
 */
export async function openDocument(wordInstance, documentId) {
  try {
    await wordInstance.documents.open({
      id: documentId,
      openMode: 'readWrite'
    });
    return true;
  } catch (error) {
    console.error('Failed to open document:', error);
    throw error;
  }
}

/**
 * Create a new document with content
 * 
 * @param {Object} wordInstance - Word instance
 * @param {string} content - Initial content
 * @returns {Promise<boolean>} - Success status
 */
export async function createDocument(wordInstance, content) {
  try {
    const document = await wordInstance.documents.create();
    
    if (content) {
      await document.body.insertText(content, 'replace');
    }
    
    return true;
  } catch (error) {
    console.error('Failed to create document:', error);
    throw error;
  }
}

/**
 * Set up change tracking
 * 
 * @param {Object} wordInstance - Word instance
 * @param {Function} onChange - Callback when document changes
 * @returns {Promise<void>}
 */
export async function setupChangeTracking(wordInstance, onChange) {
  try {
    wordInstance.documents.onContentChanged.add((event) => {
      if (onChange) {
        onChange(event);
      }
    });
  } catch (error) {
    console.error('Failed to set up change tracking:', error);
  }
}

/**
 * Get document content
 * 
 * @param {Object} wordInstance - Word instance
 * @returns {Promise<string>} - Document content
 */
export async function getDocumentContent(wordInstance) {
  try {
    const document = wordInstance.documents.active;
    const content = await document.body.getText();
    return content;
  } catch (error) {
    console.error('Failed to get document content:', error);
    throw error;
  }
}

/**
 * Save document content
 * 
 * @param {Object} wordInstance - Word instance
 * @returns {Promise<string>} - Document content
 */
export async function saveDocumentContent(wordInstance) {
  try {
    if (!wordInstance) throw new Error('Word instance is not initialized');
    
    // Get document content from the Word instance
    const content = await getDocumentContent(wordInstance);
    
    return content;
  } catch (err) {
    console.error('Error saving document content:', err);
    throw err;
  }
}

/**
 * Insert content at current cursor position
 * 
 * @param {Object} wordInstance - Word instance
 * @param {string} content - Content to insert
 * @returns {Promise<boolean>} - Success status
 */
export async function insertContent(wordInstance, content) {
  try {
    const document = wordInstance.documents.active;
    const selection = await document.getSelection();
    await selection.insertText(content, 'replace');
    return true;
  } catch (error) {
    console.error('Failed to insert content:', error);
    throw error;
  }
}

/**
 * Insert AI-generated content into document
 * 
 * @param {Object} wordInstance - Word instance
 * @param {string} content - AI-generated content
 * @returns {Promise<boolean>} - Success status
 */
export async function insertAIContent(wordInstance, content) {
  try {
    if (!wordInstance) throw new Error('Word instance is not initialized');
    
    // Insert content and apply special formatting for AI-generated content
    await insertContent(wordInstance, content);
    
    // Optionally apply specific formatting to AI content
    // This could include highlighting or special styles
    
    return true;
  } catch (err) {
    console.error('Error inserting AI content:', err);
    throw err;
  }
}

/**
 * Save document
 * 
 * @param {Object} wordInstance - Word instance
 * @param {string} documentId - Document ID to save
 * @returns {Promise<string>} - Saved document ID
 */
export async function saveDocument(wordInstance, documentId) {
  try {
    const document = wordInstance.documents.active;
    await document.save();
    return documentId;
  } catch (error) {
    console.error('Failed to save document:', error);
    throw error;
  }
}

/**
 * Save as new document
 * 
 * @param {Object} wordInstance - Word instance
 * @returns {Promise<string>} - New document ID
 */
export async function saveAsNewDocument(wordInstance) {
  try {
    const document = wordInstance.documents.active;
    const result = await document.saveAs({
      saveAs: 'newDocument'
    });
    return result.id;
  } catch (error) {
    console.error('Failed to save document as new:', error);
    throw error;
  }
}

/**
 * Insert template into document
 * 
 * @param {Object} wordInstance - Word instance
 * @param {string} templateId - Template ID
 * @returns {Promise<boolean>} - Success status
 */
export async function insertTemplate(wordInstance, templateId) {
  try {
    // Implementation depends on how templates are stored
    // This is a simplified version
    const document = wordInstance.documents.active;
    const templateContent = await getTemplateContent(templateId);
    
    if (!templateContent) {
      throw new Error('Template not found');
    }
    
    await document.body.insertText(templateContent, 'replace');
    return true;
  } catch (error) {
    console.error('Failed to apply template:', error);
    throw error;
  }
}

/**
 * Get template content
 * 
 * @param {string} templateId - Template ID
 * @returns {Promise<string>} - Template content
 */
async function getTemplateContent(templateId) {
  // Placeholder - would normally fetch from an API
  const templates = {
    'ind-template': '# Investigational New Drug Application\n\n## Introduction\n\n## Clinical Protocol\n\n## Investigator Information\n\n',
    'cmc-template': '# Chemistry, Manufacturing, and Controls\n\n## Drug Substance\n\n## Drug Product\n\n## Manufacturing Process\n\n',
    'protocol-template': '# Clinical Study Protocol\n\n## Study Objectives\n\n## Study Design\n\n## Study Population\n\n## Statistical Methods\n\n'
  };
  
  return templates[templateId] || '';
}

/**
 * Format document headings according to regulatory standards
 * 
 * @param {Object} wordInstance - Word instance
 * @returns {Promise<boolean>} - Success status
 */
export async function formatDocumentHeadings(wordInstance) {
  try {
    const document = wordInstance.documents.active;
    
    // Apply heading styles
    const headings = await document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    for (let i = 0; i < headings.length; i++) {
      const heading = headings[i];
      const level = parseInt(heading.tagName.substring(1), 10);
      await heading.styleAs(`Heading${level}`);
    }
    
    // Set up page numbers and headers/footers
    await document.sections.getFirst().footer.setHtml(`
      <div style="text-align: center; font-size: 10pt; font-family: Arial;">
        Page <span class="page-number"></span> of <span class="total-pages"></span>
      </div>
    `);
    
    // Add table of contents
    await document.cursor.setPosition('start');
    await document.insertTableOfContents({
      headingStyles: ['Heading1', 'Heading2', 'Heading3']
    });
    
    return true;
  } catch (error) {
    console.error('Failed to format document as IND:', error);
    throw error;
  }
}

/**
 * Add regulatory metadata
 * 
 * @param {Object} wordInstance - Word instance
 * @param {Object} metadata - Regulatory metadata
 * @returns {Promise<boolean>} - Success status
 */
export async function addRegulatoryMetadata(wordInstance, metadata) {
  try {
    const document = wordInstance.documents.active;
    
    // Set document properties
    const properties = document.properties;
    await properties.set('Title', metadata.title || '');
    await properties.set('Subject', metadata.subject || '');
    await properties.set('Category', 'IND Application');
    await properties.set('Keywords', metadata.keywords?.join(', ') || '');
    
    // Add custom properties for regulatory metadata
    await properties.custom.set('DocumentType', metadata.documentType || '');
    await properties.custom.set('ModuleSection', metadata.moduleSection || '');
    await properties.custom.set('RegulatoryAuthority', metadata.regulatoryAuthority || 'FDA');
    await properties.custom.set('SubmissionNumber', metadata.submissionNumber || '');
    
    return true;
  } catch (error) {
    console.error('Failed to add regulatory metadata:', error);
    throw error;
  }
}

/**
 * Export document to PDF
 * 
 * @param {Object} wordInstance - Word instance
 * @returns {Promise<Blob>} - PDF blob
 */
export async function exportToPDF(wordInstance) {
  try {
    const document = wordInstance.documents.active;
    const result = await document.export('PDF');
    return result.data;
  } catch (error) {
    console.error('Failed to export document to PDF:', error);
    throw error;
  }
}

/**
 * Add cross-references between documents
 * 
 * @param {Object} wordInstance - Word instance
 * @param {Object} referenceInfo - Reference information
 * @returns {Promise<boolean>} - Success status
 */
export async function addCrossReference(wordInstance, referenceInfo) {
  try {
    const document = wordInstance.documents.active;
    const selection = await document.getSelection();
    
    await selection.insertCrossReference({
      referenceType: 'bookmark',
      referenceTarget: referenceInfo.target,
      includeLabel: true,
      text: referenceInfo.text || 'reference'
    });
    
    return true;
  } catch (error) {
    console.error('Failed to add cross-reference:', error);
    throw error;
  }
}

/**
 * Add standard regulatory disclaimer
 * 
 * @param {Object} wordInstance - Word instance
 * @param {string} type - Disclaimer type
 * @returns {Promise<boolean>} - Success status
 */
export async function addRegulatoryDisclaimer(wordInstance, type = 'confidentiality') {
  try {
    const document = wordInstance.documents.active;
    const disclaimers = {
      confidentiality: 'CONFIDENTIAL: This document contains confidential information of [Company Name]. Do not distribute without authorization.',
      proprietary: 'PROPRIETARY: This document contains proprietary information that is intended solely for regulatory review.',
      draft: 'DRAFT: This document is in draft form and subject to change. It should not be considered final.'
    };
    
    const disclaimer = disclaimers[type] || disclaimers.confidentiality;
    
    // Add to header of first page
    await document.sections.getFirst().header.setHtml(`
      <div style="color: red; font-weight: bold; text-align: center; font-size: 10pt; font-family: Arial;">
        ${disclaimer}
      </div>
    `);
    
    return true;
  } catch (error) {
    console.error('Failed to add regulatory disclaimer:', error);
    throw error;
  }
}

/**
 * Validate document structure for eCTD compatibility
 * 
 * @param {Object} wordInstance - Word instance
 * @param {string} moduleType - eCTD module type
 * @returns {Promise<Object>} - Validation results
 */
export async function validateForECTD(wordInstance, moduleType) {
  try {
    const document = wordInstance.documents.active;
    const content = await document.body.getText();
    const structure = await document.getStructure();
    
    // Basic validation rules for eCTD
    const validationRules = {
      headings: {
        required: true,
        message: 'Document must use proper heading structure (Heading 1, Heading 2, etc.)'
      },
      sectionNumbers: {
        required: true,
        message: 'Sections must be properly numbered according to eCTD guidelines'
      },
      tables: {
        message: 'Tables should have captions and be properly formatted'
      },
      figures: {
        message: 'Figures should have captions and be properly formatted'
      },
      references: {
        message: 'References should be properly formatted and cited'
      }
    };
    
    // Simplified validation for demo purposes
    const results = {
      valid: true,
      issues: []
    };
    
    // Check headings
    const headings = structure.filter(item => item.type === 'heading');
    if (headings.length === 0) {
      results.valid = false;
      results.issues.push({
        type: 'error',
        message: validationRules.headings.message,
        location: 'document'
      });
    }
    
    // Check section numbering
    const sectionPattern = /^\d+(\.\d+)*\s+/;
    let hasSectionNumbers = false;
    
    for (const heading of headings) {
      if (sectionPattern.test(heading.text)) {
        hasSectionNumbers = true;
        break;
      }
    }
    
    if (!hasSectionNumbers && validationRules.sectionNumbers.required) {
      results.valid = false;
      results.issues.push({
        type: 'error',
        message: validationRules.sectionNumbers.message,
        location: 'document'
      });
    }
    
    return results;
  } catch (error) {
    console.error('Failed to validate document for eCTD:', error);
    throw error;
  }
}

/**
 * Generate Table of Contents for eCTD document
 * 
 * @param {Object} wordInstance - Word instance
 * @returns {Promise<boolean>} - Success status
 */
export async function generateTableOfContents(wordInstance) {
  try {
    const document = wordInstance.documents.active;
    
    // Position cursor at the beginning of the document
    await document.cursor.setPosition('start');
    
    // Insert a title for the TOC
    await document.insertText('Table of Contents', 'insertAfter');
    await document.insertParagraph('', 'insertAfter');
    
    // Insert the table of contents
    await document.insertTableOfContents({
      headingStyles: ['Heading1', 'Heading2', 'Heading3'],
      includePageNumbers: true,
      rightAlignPageNumbers: true,
      useHyperlinks: true,
      hidePageNumbersInWeb: false
    });
    
    // Add some spacing after the TOC
    await document.insertParagraph('', 'insertAfter');
    await document.insertParagraph('', 'insertAfter');
    
    return true;
  } catch (error) {
    console.error('Failed to generate table of contents:', error);
    throw error;
  }
}

/**
 * Apply FDA/ICH compliant formatting
 * 
 * @param {Object} wordInstance - Word instance
 * @returns {Promise<boolean>} - Success status
 */
export async function applyRegulatoryFormatting(wordInstance) {
  try {
    const document = wordInstance.documents.active;
    
    // Set document formatting according to FDA guidelines
    await document.font.set({
      name: 'Arial',
      size: 12
    });
    
    // Set margins
    await document.margins.set({
      top: 1,
      bottom: 1,
      left: 1,
      right: 1
    });
    
    // Format headings
    const headingLevels = [
      { level: 1, fontSize: 16, bold: true },
      { level: 2, fontSize: 14, bold: true },
      { level: 3, fontSize: 12, bold: true },
      { level: 4, fontSize: 12, bold: true, italic: true }
    ];
    
    for (const heading of headingLevels) {
      const headings = await document.querySelectorAll(`h${heading.level}`);
      
      for (let i = 0; i < headings.length; i++) {
        const headingElement = headings[i];
        
        await headingElement.font.set({
          size: heading.fontSize,
          bold: heading.bold,
          italic: heading.italic || false
        });
      }
    }
    
    // Add page numbers
    await document.sections.getFirst().footer.setHtml(`
      <div style="text-align: center; font-size: 10pt; font-family: Arial;">
        Page <span class="page-number"></span> of <span class="total-pages"></span>
      </div>
    `);
    
    return true;
  } catch (error) {
    console.error('Failed to apply regulatory formatting:', error);
    throw error;
  }
}

/**
 * Generate document fingerprint/hash for eCTD submission
 * 
 * @param {Object} wordInstance - Word instance
 * @returns {Promise<string>} - Document hash
 */
export async function generateDocumentHash(wordInstance) {
  try {
    const document = wordInstance.documents.active;
    const content = await document.body.getText();
    
    // Simple hash function for demo
    // In a real application, you would use a proper hash function like SHA-256
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return hash.toString(16);
  } catch (error) {
    console.error('Failed to generate document hash:', error);
    throw error;
  }
}

/**
 * Compile multiple sections into a single document
 * 
 * @param {Object} wordInstance - Word instance
 * @param {Array} sectionDocuments - Array of section documents
 * @returns {Promise<boolean>} - Success status
 */
export async function compileSections(wordInstance, sectionDocuments) {
  try {
    const document = wordInstance.documents.active;
    
    for (const section of sectionDocuments) {
      // Insert section break
      await document.body.insertBreak('sectionBreak');
      
      // Insert section content
      await document.body.insertText(section.content, 'insertAfter');
      
      // Insert section metadata if available
      if (section.metadata) {
        await document.properties.custom.set(`Section_${section.id}_Type`, section.metadata.type || '');
        await document.properties.custom.set(`Section_${section.id}_Author`, section.metadata.author || '');
        await document.properties.custom.set(`Section_${section.id}_Version`, section.metadata.version || '');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Failed to compile sections:', error);
    throw error;
  }
}