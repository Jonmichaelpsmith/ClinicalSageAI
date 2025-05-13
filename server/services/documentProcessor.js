/**
 * Document Processor Service for TrialSage
 * 
 * This service extracts text from PDF documents and processes them
 * for the regulatory knowledge base.
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { PDFDocument } = require('pdf-lib');

// Ensure required directories exist
const DATA_DIR = path.join(__dirname, '../../data');
const DB_PATH = path.join(DATA_DIR, 'knowledge_base.db');

// Known regulatory authorities by region
const REGULATORY_AUTHORITIES = {
  FDA: ['fda', 'food and drug administration', 'cdrh', 'cber', 'cder', 'cfsan', 'usa', 'us', 'united states'],
  EMA: ['ema', 'european medicines agency', 'eu', 'europe', 'european union', 'mdr', 'ivdr', 'meddev'],
  PMDA: ['pmda', 'pharmaceuticals and medical devices agency', 'japan', 'japanese'],
  NMPA: ['nmpa', 'national medical products administration', 'china', 'chinese'],
  'Health Canada': ['health canada', 'canada', 'canadian'],
  TGA: ['tga', 'therapeutic goods administration', 'australia', 'australian'],
  ICH: ['ich', 'international council for harmonisation', 'international', 'harmonisation', 'harmonization'],
  WHO: ['who', 'world health organization', 'global'],
  ISO: ['iso', 'international organization for standardization'],
  IMDRF: ['imdrf', 'international medical device regulators forum'],
  MHRA: ['mhra', 'medicines and healthcare products regulatory agency', 'uk', 'united kingdom', 'great britain']
};

// Document type categories
const DOCUMENT_TYPES = {
  Guidance: ['guidance', 'guide', 'guideline', 'guiding', 'recommendation'],
  Regulation: ['regulation', 'regulatory', 'law', 'legal', 'statute', 'directive', 'rule'],
  Standard: ['standard', 'iso', 'en', 'astm', 'ansi', 'iec'],
  Report: ['report', 'whitepaper', 'white paper', 'review', 'assessment'],
  Template: ['template', 'form', 'checklist', 'submission'],
  ClinicalStudy: ['clinical', 'study', 'trial', 'protocol', 'ich e6', 'ich e8', 'ich e9'],
  Technical: ['technical', 'specification', 'requirement', 'documentation'],
};

/**
 * Initialize the SQLite database with the knowledge base schema
 */
async function initializeDatabase() {
  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }
      
      db.serialize(() => {
        // Main knowledge base table
        db.run(`
          CREATE TABLE IF NOT EXISTS knowledge_base (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source TEXT NOT NULL,
            section TEXT,
            content TEXT NOT NULL,
            jurisdiction TEXT,
            tags TEXT,
            doc_type TEXT,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) {
            reject(err);
            return;
          }
          
          // Create full-text search table
          db.run(`
            CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_search 
            USING fts5(
              id, source, section, content, jurisdiction, tags, doc_type,
              content=knowledge_base
            )
          `, (err) => {
            if (err) {
              console.warn('FTS5 not available, falling back to standard search:', err.message);
              
              // Close the database connection
              db.close((closeErr) => {
                if (closeErr) {
                  console.error('Error closing database:', closeErr);
                }
                resolve(true);
              });
              return;
            }
            
            // Create trigger to keep FTS table updated on insert
            db.run(`
              CREATE TRIGGER IF NOT EXISTS knowledge_base_ai AFTER INSERT ON knowledge_base
              BEGIN
                INSERT INTO knowledge_search(
                  id, source, section, content, jurisdiction, tags, doc_type
                ) VALUES (
                  new.id, new.source, new.section, new.content, new.jurisdiction, new.tags, new.doc_type
                );
              END
            `, (err) => {
              if (err) {
                console.error('Error creating insert trigger:', err);
              }
              
              // Create trigger to keep FTS table updated on delete
              db.run(`
                CREATE TRIGGER IF NOT EXISTS knowledge_base_ad AFTER DELETE ON knowledge_base
                BEGIN
                  DELETE FROM knowledge_search WHERE id = old.id;
                END
              `, (err) => {
                if (err) {
                  console.error('Error creating delete trigger:', err);
                }
                
                // Create trigger to keep FTS table updated on update
                db.run(`
                  CREATE TRIGGER IF NOT EXISTS knowledge_base_au AFTER UPDATE ON knowledge_base
                  BEGIN
                    DELETE FROM knowledge_search WHERE id = old.id;
                    INSERT INTO knowledge_search(
                      id, source, section, content, jurisdiction, tags, doc_type
                    ) VALUES (
                      new.id, new.source, new.section, new.content, new.jurisdiction, new.tags, new.doc_type
                    );
                  END
                `, (err) => {
                  if (err) {
                    console.error('Error creating update trigger:', err);
                  }
                  
                  // Create index for jurisdiction
                  db.run(`
                    CREATE INDEX IF NOT EXISTS idx_knowledge_base_jurisdiction
                    ON knowledge_base(jurisdiction)
                  `, (err) => {
                    if (err) {
                      console.error('Error creating jurisdiction index:', err);
                    }
                    
                    // Create index for doc_type
                    db.run(`
                      CREATE INDEX IF NOT EXISTS idx_knowledge_base_doc_type
                      ON knowledge_base(doc_type)
                    `, (err) => {
                      if (err) {
                        console.error('Error creating doc_type index:', err);
                      }
                      
                      // Close the database connection
                      db.close((closeErr) => {
                        if (closeErr) {
                          console.error('Error closing database:', closeErr);
                        }
                        resolve(true);
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}

/**
 * Store document content in the knowledge base
 * @param {Array} docs - Array of document objects with metadata
 */
async function storeDocuments(docs) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }
      
      db.serialize(() => {
        const stmt = db.prepare(`
          INSERT INTO knowledge_base (
            source, section, content, jurisdiction, tags, doc_type
          ) VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        for (const doc of docs) {
          stmt.run(
            doc.source,
            doc.section || null,
            doc.content,
            doc.jurisdiction || 'Unknown',
            doc.tags ? JSON.stringify(doc.tags) : null,
            doc.doc_type || 'Unknown'
          );
        }
        
        stmt.finalize((err) => {
          if (err) {
            db.close();
            reject(err);
            return;
          }
          
          // Get the count of inserted documents
          db.get('SELECT changes() as count', (err, row) => {
            db.close();
            
            if (err) {
              reject(err);
            } else {
              resolve({ count: row.count, documents: docs });
            }
          });
        });
      });
    });
  });
}

/**
 * Extract text from a PDF file
 * Basic extraction using pdf-lib for simple files
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Promise<string>} - The extracted text
 */
async function extractPdfText(pdfPath) {
  try {
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const numPages = pdfDoc.getPageCount();
    
    // We can't extract text directly with pdf-lib, so we're returning basic metadata for now
    // This should be enhanced with a more robust PDF text extractor like pdf-parse or pdfjs
    return `PDF Document: ${path.basename(pdfPath)}\nPages: ${numPages}\n` +
      `This is a placeholder for extracted text content. In a production implementation, ` +
      `we would use a dedicated PDF text extraction library like pdf-parse.`;
  } catch (error) {
    console.error(`Error extracting text from ${pdfPath}:`, error);
    return `Failed to extract text from ${path.basename(pdfPath)}: ${error.message}`;
  }
}

/**
 * Process all PDF files in a directory
 * @param {string} folderPath - Path to the folder containing PDFs
 * @returns {Promise<Array>} - Array of document objects
 */
async function processPdfs(folderPath) {
  const processedDocs = [];
  
  try {
    // Get all PDF files in the directory
    const files = fs.readdirSync(folderPath);
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
    
    // Process each PDF
    for (const pdfFile of pdfFiles) {
      const pdfPath = path.join(folderPath, pdfFile);
      const fileName = path.basename(pdfFile);
      
      try {
        // Extract text from the PDF
        const text = await extractPdfText(pdfPath);
        
        // Determine document type and jurisdiction from filename and content
        const docInfo = determineDocumentType(fileName, text);
        
        // Extract document sections for more granular knowledge
        const sections = extractDocumentSections(text);
        
        // If no sections were extracted, store the whole document
        if (sections.length === 0) {
          processedDocs.push({
            source: fileName,
            content: text,
            jurisdiction: docInfo.jurisdiction,
            doc_type: docInfo.type,
            tags: docInfo.tags
          });
        } else {
          // Store each section separately for more granular retrieval
          sections.forEach(section => {
            processedDocs.push({
              source: fileName,
              section: section.title,
              content: section.content,
              jurisdiction: docInfo.jurisdiction,
              doc_type: docInfo.type,
              tags: docInfo.tags
            });
          });
        }
      } catch (error) {
        console.error(`Error processing PDF ${pdfFile}:`, error);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${folderPath}:`, error);
  }
  
  return processedDocs;
}

/**
 * Extract document sections to allow for more granular knowledge retrieval
 * @param {string} text - Document text
 * @returns {Array} - Array of section objects
 */
function extractDocumentSections(text) {
  // This is a simple section extractor that looks for header patterns
  // In a production implementation, this would use a more sophisticated approach
  
  const sections = [];
  
  // Common section header patterns in regulatory documents
  const sectionPatterns = [
    /\n(\d+\.\s+[A-Z][A-Za-z\s]+)\n/g, // Numbered section headers: "1. Introduction"
    /\n([A-Z][A-Z\s]+)(?:\n|\s*:)/g,   // ALL CAPS headers: "INTRODUCTION" or "SCOPE:"
    /\n(Chapter\s+\d+[.:]\s+[A-Za-z\s]+)\n/gi, // Chapter headers: "Chapter 1: Introduction"
    /\n(Appendix\s+[A-Z]\s*[.:]\s+[A-Za-z\s]+)\n/gi, // Appendix headers: "Appendix A: References"
    /\n(Section\s+\d+[.:]\s+[A-Za-z\s]+)\n/gi, // Section headers: "Section 1: Scope"
  ];
  
  // Find potential section headers
  const potentialSections = [];
  
  sectionPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      potentialSections.push({
        title: match[1].trim(),
        index: match.index + 1 // +1 to skip the newline
      });
    }
  });
  
  // Sort sections by their position in the document
  potentialSections.sort((a, b) => a.index - b.index);
  
  // Extract content between sections
  for (let i = 0; i < potentialSections.length; i++) {
    const sectionStart = potentialSections[i].index + potentialSections[i].title.length;
    const sectionEnd = i < potentialSections.length - 1 
      ? potentialSections[i + 1].index
      : text.length;
    
    const sectionContent = text.substring(sectionStart, sectionEnd).trim();
    
    // Only add if there's meaningful content (more than just a few characters)
    if (sectionContent.length > 20) {
      sections.push({
        title: potentialSections[i].title,
        content: sectionContent
      });
    }
  }
  
  return sections;
}

/**
 * Determine document type and jurisdiction from filename and content
 * This enhanced version provides a more comprehensive classification system
 * @param {string} filename - The filename to analyze
 * @param {string} content - Document content for additional context
 * @returns {Object} - Document type information
 */
function determineDocumentType(filename, content = '') {
  const lowerFilename = filename.toLowerCase();
  const lowerContent = content.toLowerCase().substring(0, 2000); // Use just the first part for efficiency
  
  // Determine jurisdiction
  let jurisdiction = 'Unknown';
  let highestMatch = 0;
  
  for (const [auth, keywords] of Object.entries(REGULATORY_AUTHORITIES)) {
    let matchCount = 0;
    
    keywords.forEach(keyword => {
      // Check filename for jurisdiction keywords
      if (lowerFilename.includes(keyword)) {
        matchCount += 3; // Filename matches are more important
      }
      
      // Check content for jurisdiction keywords
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const contentMatches = (lowerContent.match(regex) || []).length;
      matchCount += contentMatches;
    });
    
    if (matchCount > highestMatch) {
      highestMatch = matchCount;
      jurisdiction = auth;
    }
  }
  
  // Determine document type
  let docType = 'Unknown';
  highestMatch = 0;
  
  for (const [type, keywords] of Object.entries(DOCUMENT_TYPES)) {
    let matchCount = 0;
    
    keywords.forEach(keyword => {
      // Check filename for type keywords
      if (lowerFilename.includes(keyword)) {
        matchCount += 3; // Filename matches are more important
      }
      
      // Check content for type keywords
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const contentMatches = (lowerContent.match(regex) || []).length;
      matchCount += contentMatches;
    });
    
    if (matchCount > highestMatch) {
      highestMatch = matchCount;
      docType = type;
    }
  }
  
  // Extract potential tags
  const tags = [];
  
  // Check for specific document identifiers
  const ichGuidanceMatch = lowerContent.match(/\bich\s+([a-z]\d+[a-z]*)(?:\s*\(r\d+\))?/gi);
  if (ichGuidanceMatch) {
    ichGuidanceMatch.forEach(match => tags.push(match.toUpperCase()));
    jurisdiction = 'ICH';
    docType = 'Guidance';
  }
  
  // Check for FDA guidance numbers
  const fdaGuidanceMatch = lowerContent.match(/\bguidance\s+(?:for\s+industry\s+)?(?:no\.\s+)?(\d+-\d+)/gi);
  if (fdaGuidanceMatch) {
    fdaGuidanceMatch.forEach(match => tags.push(match));
    jurisdiction = 'FDA';
    docType = 'Guidance';
  }
  
  // Check for EU MDR/IVDR references
  if (lowerContent.includes('2017/745') || lowerContent.includes('mdr')) {
    tags.push('MDR');
    tags.push('2017/745');
    jurisdiction = 'EMA';
    docType = 'Regulation';
  }
  
  if (lowerContent.includes('2017/746') || lowerContent.includes('ivdr')) {
    tags.push('IVDR');
    tags.push('2017/746');
    jurisdiction = 'EMA';
    docType = 'Regulation';
  }
  
  // ISO standards
  const isoMatch = lowerContent.match(/\biso\s+(\d+(?:-\d+)*(?::\d+)?)/gi);
  if (isoMatch) {
    isoMatch.forEach(match => tags.push(match.toUpperCase()));
    docType = 'Standard';
  }
  
  return {
    jurisdiction,
    type: docType,
    tags: tags.length > 0 ? [...new Set(tags)] : undefined // Deduplicate tags
  };
}

/**
 * Setup the knowledge base with initial data
 */
async function setupKnowledgeBase() {
  try {
    await initializeDatabase();
    return true;
  } catch (error) {
    console.error('Error setting up knowledge base:', error);
    return false;
  }
}

/**
 * Import documents into the knowledge base
 * @param {string} folderPath - Path to the folder containing documents
 */
async function importDocuments(folderPath) {
  try {
    // Process PDFs in the directory
    const processedDocs = await processPdfs(folderPath);
    
    if (processedDocs.length === 0) {
      return {
        success: false,
        message: 'No documents found or processed',
        processedCount: 0
      };
    }
    
    // Store the processed documents in the knowledge base
    const result = await storeDocuments(processedDocs);
    
    return {
      success: true,
      message: `Successfully processed ${result.count} document sections`,
      processedCount: processedDocs.length,
      documents: processedDocs.map(doc => ({
        source: doc.source,
        section: doc.section,
        jurisdiction: doc.jurisdiction,
        doc_type: doc.doc_type
      }))
    };
  } catch (error) {
    console.error('Error importing documents:', error);
    return {
      success: false,
      message: `Error importing documents: ${error.message}`,
      error: error.message
    };
  }
}

module.exports = {
  setupKnowledgeBase,
  importDocuments,
  extractPdfText,
  processPdfs,
  initializeDatabase,
  storeDocuments,
  determineDocumentType,
  extractDocumentSections
};