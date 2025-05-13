/**
 * Document Processor Service for TrialSage
 * 
 * This service extracts text from PDF documents and processes them
 * for the regulatory knowledge base.
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const readdir = util.promisify(fs.readdir);
const mkdir = util.promisify(fs.mkdir);
const sqlite3 = require('sqlite3').verbose();

// Database setup
const DB_PATH = path.join(__dirname, '../../data/knowledge_base.db');

/**
 * Initialize the SQLite database with the knowledge base schema
 */
async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        reject(err);
        return;
      }
      
      db.run(`
        CREATE TABLE IF NOT EXISTS knowledge_base (
          id INTEGER PRIMARY KEY,
          source TEXT,  -- e.g., "ICH E6(R2)" or "FDA eCTD"
          section TEXT,  -- e.g., "5.2" or "Module 3"
          content TEXT,  -- Extracted text
          jurisdiction TEXT,  -- e.g., "Global", "USA"
          tags TEXT,  -- e.g., "GCP,clinical trials"
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating table:', err.message);
          reject(err);
        } else {
          console.log('Database initialized successfully');
          resolve();
        }
        db.close();
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
        console.error('Error opening database:', err.message);
        reject(err);
        return;
      }
      
      const stmt = db.prepare(`
        INSERT INTO knowledge_base (source, section, content, jurisdiction, tags)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        let docsInserted = 0;
        docs.forEach(doc => {
          stmt.run(
            doc.filename || '',
            doc.section || '',
            doc.content || '',
            doc.jurisdiction || 'Global',
            doc.tags || '',
            function(err) {
              if (err) {
                console.error('Error inserting document:', err.message);
              } else {
                docsInserted++;
              }
            }
          );
        });
        
        stmt.finalize();
        
        db.run('COMMIT', (err) => {
          if (err) {
            console.error('Error committing transaction:', err.message);
            reject(err);
          } else {
            console.log(`${docsInserted} documents inserted successfully`);
            resolve(docsInserted);
          }
          db.close();
        });
      });
    });
  });
}

/**
 * Extract text from a PDF file
 * This is a placeholder that should be replaced with a real PDF parser
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Promise<string>} - The extracted text
 */
async function extractPdfText(pdfPath) {
  // In a real implementation, use a PDF parsing library
  // For now, return a placeholder text
  console.log(`[Placeholder] Extracting text from: ${pdfPath}`);
  return `This is placeholder text for ${path.basename(pdfPath)}. In a real implementation, this would be the extracted PDF content.`;
}

/**
 * Process all PDF files in a directory
 * @param {string} folderPath - Path to the folder containing PDFs
 * @returns {Promise<Array>} - Array of document objects
 */
async function processPdfs(folderPath) {
  try {
    const files = await readdir(folderPath);
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
    
    console.log(`Found ${pdfFiles.length} PDF files in ${folderPath}`);
    
    const results = [];
    for (const file of pdfFiles) {
      const filePath = path.join(folderPath, file);
      try {
        const text = await extractPdfText(filePath);
        const docType = determineDocumentType(file);
        
        results.push({
          filename: file,
          content: text,
          jurisdiction: docType.jurisdiction,
          tags: docType.tags
        });
        
        console.log(`Processed: ${file}`);
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }
    
    return results;
  } catch (error) {
    console.error(`Error reading directory ${folderPath}:`, error);
    return [];
  }
}

/**
 * Determine document type and jurisdiction from filename
 * @param {string} filename - The filename to analyze
 * @returns {Object} - Document type information
 */
function determineDocumentType(filename) {
  const lowerFilename = filename.toLowerCase();
  
  // ICH Guidelines
  if (lowerFilename.includes('ich') && lowerFilename.match(/e\d+/)) {
    return {
      jurisdiction: 'Global',
      tags: 'ICH,efficacy,guidelines'
    };
  }
  
  // FDA Documents
  if (lowerFilename.includes('fda')) {
    return {
      jurisdiction: 'USA',
      tags: 'FDA,regulation'
    };
  }
  
  // EMA Documents
  if (lowerFilename.includes('ema') || lowerFilename.includes('eu') || lowerFilename.includes('emea')) {
    return {
      jurisdiction: 'EU',
      tags: 'EMA,regulation'
    };
  }
  
  // PMDA Documents
  if (lowerFilename.includes('pmda') || lowerFilename.includes('japan')) {
    return {
      jurisdiction: 'Japan',
      tags: 'PMDA,regulation'
    };
  }
  
  // Default
  return {
    jurisdiction: 'Global',
    tags: 'regulatory'
  };
}

/**
 * Setup the knowledge base with initial data
 */
async function setupKnowledgeBase() {
  try {
    // Ensure data directory exists
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }
    
    // Initialize database
    await initializeDatabase();
    
    console.log('Knowledge base setup complete');
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
    const docs = await processPdfs(folderPath);
    if (docs.length > 0) {
      const insertedCount = await storeDocuments(docs);
      return {
        success: true,
        count: insertedCount,
        message: `Imported ${insertedCount} documents from ${folderPath}`
      };
    } else {
      return {
        success: false,
        count: 0,
        message: `No documents found in ${folderPath}`
      };
    }
  } catch (error) {
    console.error('Error importing documents:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  setupKnowledgeBase,
  initializeDatabase,
  processPdfs,
  storeDocuments,
  importDocuments
};