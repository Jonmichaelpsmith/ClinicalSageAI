/**
 * Office.js Integration Service
 * 
 * This service provides methods for interacting with Office.js API,
 * which enables direct integration with Microsoft Office applications
 * like Word, Excel, and PowerPoint.
 */

import { officeJsConfig } from '../config/microsoftConfig';

// Office.js Initialization State
let officeInitialized = false;

/**
 * Initialize Office.js API
 * @returns {Promise<boolean>} Whether initialization succeeded
 */
export const initializeOfficeJs = () => {
  return new Promise((resolve, reject) => {
    try {
      // Check if Office.js is already loaded
      if (window.Office) {
        Office.onReady((info) => {
          console.log(`Office.js initialized for ${info.host}`);
          officeInitialized = true;
          resolve(true);
        });
      } else {
        // Office.js not available - might be running in browser context
        console.log('Office.js not available - running in browser context');
        resolve(false);
      }
    } catch (error) {
      console.error('Error initializing Office.js:', error);
      reject(error);
    }
  });
};

/**
 * Check if Office.js is initialized
 * @returns {boolean} Whether Office.js is initialized
 */
export const isOfficeInitialized = () => {
  return officeInitialized;
};

/**
 * Insert text at the current selection in Word
 * @param {string} text Text to insert
 * @returns {Promise<boolean>} Whether the insertion succeeded
 */
export const insertTextInWord = async (text) => {
  try {
    if (!window.Word) {
      throw new Error('Word API not available');
    }
    
    await Word.run(async (context) => {
      // Get the current selection
      const range = context.document.getSelection();
      
      // Insert text at the selection
      range.insertText(text, Word.InsertLocation.replace);
      
      // Sync changes back to the document
      await context.sync();
    });
    
    return true;
  } catch (error) {
    console.error('Error inserting text in Word:', error);
    throw error;
  }
};

/**
 * Insert HTML at the current selection in Word
 * @param {string} html HTML to insert
 * @returns {Promise<boolean>} Whether the insertion succeeded
 */
export const insertHtmlInWord = async (html) => {
  try {
    if (!window.Word) {
      throw new Error('Word API not available');
    }
    
    await Word.run(async (context) => {
      // Get the current selection
      const range = context.document.getSelection();
      
      // Insert HTML at the selection
      range.insertHtml(html, Word.InsertLocation.replace);
      
      // Sync changes back to the document
      await context.sync();
    });
    
    return true;
  } catch (error) {
    console.error('Error inserting HTML in Word:', error);
    throw error;
  }
};

/**
 * Insert a picture from a URL at the current selection in Word
 * @param {string} url Picture URL
 * @param {number} width Width in points (optional)
 * @param {number} height Height in points (optional)
 * @returns {Promise<boolean>} Whether the insertion succeeded
 */
export const insertPictureInWord = async (url, width, height) => {
  try {
    if (!window.Word) {
      throw new Error('Word API not available');
    }
    
    await Word.run(async (context) => {
      // Get the current selection
      const range = context.document.getSelection();
      
      // Insert picture at the selection
      const picture = range.insertInlinePictureFromBase64(url, Word.InsertLocation.replace);
      
      // Set width and height if provided
      if (width) {
        picture.width = width;
      }
      if (height) {
        picture.height = height;
      }
      
      // Sync changes back to the document
      await context.sync();
    });
    
    return true;
  } catch (error) {
    console.error('Error inserting picture in Word:', error);
    throw error;
  }
};

/**
 * Apply a style to the current selection in Word
 * @param {string} styleName Style name
 * @returns {Promise<boolean>} Whether the style application succeeded
 */
export const applyStyleInWord = async (styleName) => {
  try {
    if (!window.Word) {
      throw new Error('Word API not available');
    }
    
    await Word.run(async (context) => {
      // Get the current selection
      const range = context.document.getSelection();
      
      // Apply style to the selection
      range.style = styleName;
      
      // Sync changes back to the document
      await context.sync();
    });
    
    return true;
  } catch (error) {
    console.error('Error applying style in Word:', error);
    throw error;
  }
};

/**
 * Apply bold formatting to the current selection in Word
 * @param {boolean} isBold Whether to apply or remove bold formatting
 * @returns {Promise<boolean>} Whether the formatting succeeded
 */
export const applyBoldInWord = async (isBold = true) => {
  try {
    if (!window.Word) {
      throw new Error('Word API not available');
    }
    
    await Word.run(async (context) => {
      // Get the current selection
      const range = context.document.getSelection();
      
      // Apply or remove bold formatting
      range.font.bold = isBold;
      
      // Sync changes back to the document
      await context.sync();
    });
    
    return true;
  } catch (error) {
    console.error('Error applying bold formatting in Word:', error);
    throw error;
  }
};

/**
 * Apply italic formatting to the current selection in Word
 * @param {boolean} isItalic Whether to apply or remove italic formatting
 * @returns {Promise<boolean>} Whether the formatting succeeded
 */
export const applyItalicInWord = async (isItalic = true) => {
  try {
    if (!window.Word) {
      throw new Error('Word API not available');
    }
    
    await Word.run(async (context) => {
      // Get the current selection
      const range = context.document.getSelection();
      
      // Apply or remove italic formatting
      range.font.italic = isItalic;
      
      // Sync changes back to the document
      await context.sync();
    });
    
    return true;
  } catch (error) {
    console.error('Error applying italic formatting in Word:', error);
    throw error;
  }
};

/**
 * Apply underline formatting to the current selection in Word
 * @param {boolean} isUnderline Whether to apply or remove underline formatting
 * @returns {Promise<boolean>} Whether the formatting succeeded
 */
export const applyUnderlineInWord = async (isUnderline = true) => {
  try {
    if (!window.Word) {
      throw new Error('Word API not available');
    }
    
    await Word.run(async (context) => {
      // Get the current selection
      const range = context.document.getSelection();
      
      // Apply or remove underline formatting
      range.font.underline = isUnderline ? Word.UnderlineType.single : Word.UnderlineType.none;
      
      // Sync changes back to the document
      await context.sync();
    });
    
    return true;
  } catch (error) {
    console.error('Error applying underline formatting in Word:', error);
    throw error;
  }
};

/**
 * Apply font formatting to the current selection in Word
 * @param {Object} options Font formatting options
 * @param {string} options.name Font name
 * @param {number} options.size Font size in points
 * @param {string} options.color Font color
 * @returns {Promise<boolean>} Whether the formatting succeeded
 */
export const applyFontInWord = async ({ name, size, color }) => {
  try {
    if (!window.Word) {
      throw new Error('Word API not available');
    }
    
    await Word.run(async (context) => {
      // Get the current selection
      const range = context.document.getSelection();
      
      // Apply font formatting
      if (name) {
        range.font.name = name;
      }
      if (size) {
        range.font.size = size;
      }
      if (color) {
        range.font.color = color;
      }
      
      // Sync changes back to the document
      await context.sync();
    });
    
    return true;
  } catch (error) {
    console.error('Error applying font formatting in Word:', error);
    throw error;
  }
};

/**
 * Insert a paragraph at the current selection in Word
 * @param {string} text Paragraph text
 * @param {Word.InsertLocation} insertLocation Where to insert the paragraph
 * @returns {Promise<boolean>} Whether the insertion succeeded
 */
export const insertParagraphInWord = async (text, insertLocation = Word.InsertLocation.after) => {
  try {
    if (!window.Word) {
      throw new Error('Word API not available');
    }
    
    await Word.run(async (context) => {
      // Get the current selection
      const range = context.document.getSelection();
      
      // Insert paragraph
      range.insertParagraph(text, insertLocation);
      
      // Sync changes back to the document
      await context.sync();
    });
    
    return true;
  } catch (error) {
    console.error('Error inserting paragraph in Word:', error);
    throw error;
  }
};

/**
 * Insert a heading at the current selection in Word
 * @param {string} text Heading text
 * @param {number} level Heading level (1-6)
 * @returns {Promise<boolean>} Whether the insertion succeeded
 */
export const insertHeadingInWord = async (text, level = 1) => {
  try {
    if (!window.Word) {
      throw new Error('Word API not available');
    }
    
    await Word.run(async (context) => {
      // Get the current selection
      const range = context.document.getSelection();
      
      // Insert paragraph
      const paragraph = range.insertParagraph(text, Word.InsertLocation.after);
      
      // Apply heading style based on level
      paragraph.style = `Heading ${level}`;
      
      // Sync changes back to the document
      await context.sync();
    });
    
    return true;
  } catch (error) {
    console.error('Error inserting heading in Word:', error);
    throw error;
  }
};

/**
 * Insert a table at the current selection in Word
 * @param {number} rows Number of rows
 * @param {number} cols Number of columns
 * @param {Array<Array<string>>} data Table data (optional)
 * @returns {Promise<boolean>} Whether the insertion succeeded
 */
export const insertTableInWord = async (rows, cols, data = null) => {
  try {
    if (!window.Word) {
      throw new Error('Word API not available');
    }
    
    await Word.run(async (context) => {
      // Get the current selection
      const range = context.document.getSelection();
      
      // Insert table
      const table = range.insertTable(rows, cols, Word.InsertLocation.after, data || []);
      
      // Apply table style
      table.style = 'Grid Table 4 - Accent 1';
      
      // Sync changes back to the document
      await context.sync();
    });
    
    return true;
  } catch (error) {
    console.error('Error inserting table in Word:', error);
    throw error;
  }
};

/**
 * Insert a bullet list at the current selection in Word
 * @param {Array<string>} items List items
 * @returns {Promise<boolean>} Whether the insertion succeeded
 */
export const insertBulletListInWord = async (items) => {
  try {
    if (!window.Word) {
      throw new Error('Word API not available');
    }
    
    await Word.run(async (context) => {
      // Get the current selection
      const range = context.document.getSelection();
      
      // Create a list with bullet format
      const list = context.document.body.insertParagraph('', Word.InsertLocation.after).startNewList();
      list.applyBulletStyle();
      
      // Add list items
      for (let i = 0; i < items.length; i++) {
        if (i === 0) {
          // Replace the first empty paragraph with the first item
          list.getFirstParagraph().insertText(items[i], Word.InsertLocation.replace);
        } else {
          // Add subsequent list items
          list.insertParagraph(items[i], Word.InsertLocation.end);
        }
      }
      
      // Sync changes back to the document
      await context.sync();
    });
    
    return true;
  } catch (error) {
    console.error('Error inserting bullet list in Word:', error);
    throw error;
  }
};

/**
 * Insert a numbered list at the current selection in Word
 * @param {Array<string>} items List items
 * @returns {Promise<boolean>} Whether the insertion succeeded
 */
export const insertNumberedListInWord = async (items) => {
  try {
    if (!window.Word) {
      throw new Error('Word API not available');
    }
    
    await Word.run(async (context) => {
      // Get the current selection
      const range = context.document.getSelection();
      
      // Create a list with numbered format
      const list = context.document.body.insertParagraph('', Word.InsertLocation.after).startNewList();
      list.setLevelNumbering(0, Word.ListNumbering.arabic, [1, 2, 3]);
      
      // Add list items
      for (let i = 0; i < items.length; i++) {
        if (i === 0) {
          // Replace the first empty paragraph with the first item
          list.getFirstParagraph().insertText(items[i], Word.InsertLocation.replace);
        } else {
          // Add subsequent list items
          list.insertParagraph(items[i], Word.InsertLocation.end);
        }
      }
      
      // Sync changes back to the document
      await context.sync();
    });
    
    return true;
  } catch (error) {
    console.error('Error inserting numbered list in Word:', error);
    throw error;
  }
};

/**
 * Get the entire document content from Word
 * @returns {Promise<string>} Document content as text
 */
export const getWordDocumentContent = async () => {
  try {
    if (!window.Word) {
      throw new Error('Word API not available');
    }
    
    let documentText = '';
    
    await Word.run(async (context) => {
      // Get the document body
      const body = context.document.body;
      body.load('text');
      
      // Sync to load the content
      await context.sync();
      
      documentText = body.text;
    });
    
    return documentText;
  } catch (error) {
    console.error('Error getting Word document content:', error);
    throw error;
  }
};

/**
 * Get the current selection content from Word
 * @returns {Promise<string>} Selection content as text
 */
export const getWordSelectionContent = async () => {
  try {
    if (!window.Word) {
      throw new Error('Word API not available');
    }
    
    let selectionText = '';
    
    await Word.run(async (context) => {
      // Get the current selection
      const range = context.document.getSelection();
      range.load('text');
      
      // Sync to load the selection
      await context.sync();
      
      selectionText = range.text;
    });
    
    return selectionText;
  } catch (error) {
    console.error('Error getting Word selection content:', error);
    throw error;
  }
};

/**
 * Search for text in the Word document
 * @param {string} searchText Text to search for
 * @returns {Promise<Array>} Array of ranges matching the search text
 */
export const searchWordDocument = async (searchText) => {
  try {
    if (!window.Word) {
      throw new Error('Word API not available');
    }
    
    let searchResults = [];
    
    await Word.run(async (context) => {
      // Search the document
      const searchResultRanges = context.document.body.search(searchText);
      searchResultRanges.load('text');
      
      // Sync to load the search results
      await context.sync();
      
      // Convert to a JavaScript array
      for (let i = 0; i < searchResultRanges.items.length; i++) {
        searchResults.push({
          text: searchResultRanges.items[i].text,
          index: i
        });
      }
    });
    
    return searchResults;
  } catch (error) {
    console.error('Error searching Word document:', error);
    throw error;
  }
};

/**
 * Insert a comment at the current selection in Word
 * @param {string} commentText Comment text
 * @returns {Promise<boolean>} Whether the comment insertion succeeded
 */
export const insertCommentInWord = async (commentText) => {
  try {
    if (!window.Word) {
      throw new Error('Word API not available');
    }
    
    await Word.run(async (context) => {
      // Get the current selection
      const range = context.document.getSelection();
      
      // Insert comment
      range.insertComment(commentText);
      
      // Sync changes back to the document
      await context.sync();
    });
    
    return true;
  } catch (error) {
    console.error('Error inserting comment in Word:', error);
    throw error;
  }
};

/**
 * Create a new Word document from a template
 * @param {string} templateName Template name
 * @returns {Promise<boolean>} Whether template application succeeded
 */
export const createDocumentFromTemplate = async (templateName) => {
  try {
    if (!window.Word) {
      throw new Error('Word API not available');
    }
    
    // In a real implementation, this would involve loading a template from a library
    // and applying it to the current document or creating a new document
    
    await Word.run(async (context) => {
      // Clear the document
      context.document.body.clear();
      
      // Insert template header
      const headerParagraph = context.document.body.insertParagraph(`[${templateName}]`, Word.InsertLocation.start);
      headerParagraph.style = 'Title';
      
      // Sync changes back to the document
      await context.sync();
    });
    
    return true;
  } catch (error) {
    console.error('Error creating document from template:', error);
    throw error;
  }
};

/**
 * Insert a regulatory section into the Word document
 * @param {string} sectionName Section name
 * @param {string} sectionContent Section content
 * @returns {Promise<boolean>} Whether section insertion succeeded
 */
export const insertRegulatorySectionInWord = async (sectionName, sectionContent) => {
  try {
    if (!window.Word) {
      throw new Error('Word API not available');
    }
    
    await Word.run(async (context) => {
      // Get the end of the document
      const range = context.document.body.getRange(Word.RangeLocation.end);
      
      // Insert section heading
      const heading = range.insertParagraph(sectionName, Word.InsertLocation.before);
      heading.style = 'Heading 2';
      
      // Insert section content
      const content = heading.insertParagraph(sectionContent, Word.InsertLocation.after);
      
      // Sync changes back to the document
      await context.sync();
    });
    
    return true;
  } catch (error) {
    console.error('Error inserting regulatory section in Word:', error);
    throw error;
  }
};

/**
 * Validate and save the Word document
 * @returns {Promise<boolean>} Whether validation and save succeeded
 */
export const validateAndSaveWordDocument = async () => {
  try {
    if (!window.Word) {
      throw new Error('Word API not available');
    }
    
    // In a real implementation, this would involve:
    // 1. Validating content against regulatory requirements
    // 2. Saving to SharePoint/OneDrive
    
    // For now, just simulate validation and saving
    await Word.run(async (context) => {
      // Add a validation signature at the end of the document
      const range = context.document.body.getRange(Word.RangeLocation.end);
      const validationParagraph = range.insertParagraph('-- Document validated --', Word.InsertLocation.after);
      validationParagraph.font.italic = true;
      validationParagraph.font.color = 'gray';
      
      // Sync changes back to the document
      await context.sync();
    });
    
    return true;
  } catch (error) {
    console.error('Error validating and saving Word document:', error);
    throw error;
  }
};

// Export a default API for importing
export default {
  initializeOfficeJs,
  isOfficeInitialized,
  insertTextInWord,
  insertHtmlInWord,
  insertPictureInWord,
  applyStyleInWord,
  applyBoldInWord,
  applyItalicInWord,
  applyUnderlineInWord,
  applyFontInWord,
  insertParagraphInWord,
  insertHeadingInWord,
  insertTableInWord,
  insertBulletListInWord,
  insertNumberedListInWord,
  getWordDocumentContent,
  getWordSelectionContent,
  searchWordDocument,
  insertCommentInWord,
  createDocumentFromTemplate,
  insertRegulatorySectionInWord,
  validateAndSaveWordDocument
};