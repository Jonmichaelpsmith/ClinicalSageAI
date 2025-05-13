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
      
      // Create the enhanced knowledge base table with more metadata
      db.run(`
        CREATE TABLE IF NOT EXISTS knowledge_base (
          id INTEGER PRIMARY KEY,
          source TEXT,  -- e.g., "ICH E6(R2)" or "FDA 510(k)"
          section TEXT,  -- e.g., "5.2" or "Module 3"
          content TEXT,  -- Extracted text
          jurisdiction TEXT,  -- e.g., "Global", "USA", "EU", "Japan"
          tags TEXT,  -- e.g., "GCP,clinical trials,efficacy"
          doc_type TEXT, -- e.g., "Guideline", "Regulation", "Standard"
          confidence REAL, -- Classification confidence score (0.0 to 1.0)
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating knowledge_base table:', err.message);
          reject(err);
          return;
        }
        
        // Create a search index for more efficient text lookups
        db.run(`
          CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_search 
          USING fts5(
            content, 
            source, 
            section, 
            tags,
            jurisdiction,
            doc_type,
            content_rowid=id
          )
        `, (err) => {
          if (err) {
            // If FTS5 is not supported, fall back to FTS4
            console.warn('FTS5 not supported, falling back to FTS4:', err.message);
            db.run(`
              CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_search 
              USING fts4(
                content, 
                source, 
                section, 
                tags,
                jurisdiction,
                doc_type,
                content_rowid=id
              )
            `, (innerErr) => {
              if (innerErr) {
                // If FTS4 also fails, just continue without it
                console.warn('FTS4 also not supported, proceeding without search optimization:', innerErr.message);
                console.log('Database initialized with basic tables');
                resolve();
              } else {
                console.log('Database initialized with FTS4 search index');
                resolve();
              }
              db.close();
            });
          } else {
            console.log('Database initialized with FTS5 search index');
            resolve();
            db.close();
          }
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
        console.error('Error opening database:', err.message);
        reject(err);
        return;
      }
      
      // Updated statement to include the new fields
      const stmt = db.prepare(`
        INSERT INTO knowledge_base (
          source, 
          section, 
          content, 
          jurisdiction, 
          tags, 
          doc_type, 
          confidence
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      // Statement to insert into search index if it exists
      const searchStmt = db.prepare(`
        INSERT OR IGNORE INTO knowledge_search (
          source,
          section,
          content,
          tags,
          jurisdiction,
          doc_type
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        let docsInserted = 0;
        docs.forEach(doc => {
          try {
            // Insert into main table
            stmt.run(
              doc.filename || '',
              doc.section || '',
              doc.content || '',
              doc.jurisdiction || 'Global',
              doc.tags || '',
              doc.docType || 'General',
              doc.confidence || 0.5,
              function(err) {
                if (err) {
                  console.error('Error inserting document:', err.message);
                } else {
                  docsInserted++;
                  
                  // Also try to insert into search index
                  try {
                    searchStmt.run(
                      doc.filename || '',
                      doc.section || '',
                      doc.content || '',
                      doc.tags || '',
                      doc.jurisdiction || 'Global',
                      doc.docType || 'General',
                      (searchErr) => {
                        if (searchErr) {
                          // Just log the error but don't fail the whole transaction
                          console.warn('Could not update search index:', searchErr.message);
                        }
                      }
                    );
                  } catch (searchErr) {
                    // If search index operation fails, just log and continue
                    console.warn('Search index not available:', searchErr.message);
                  }
                }
              }
            );
          } catch (docErr) {
            console.error('Error processing document for insertion:', docErr.message);
          }
        });
        
        stmt.finalize();
        searchStmt.finalize();
        
        db.run('COMMIT', (err) => {
          if (err) {
            console.error('Error committing transaction:', err.message);
            reject(err);
          } else {
            console.log(`${docsInserted} documents inserted successfully into knowledge base`);
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
 * Use basic file reading for now, will be enhanced with pdf-parse later
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Promise<string>} - The extracted text
 */
async function extractPdfText(pdfPath) {
  console.log(`Extracting text from: ${pdfPath}`);
  
  try {
    // For now, extract basic file metadata as our "text"
    const stats = await fs.promises.stat(pdfPath);
    const fileName = path.basename(pdfPath);
    const fileExt = path.extname(pdfPath);
    const fileSize = stats.size;
    const createDate = stats.birthtime;
    const modifyDate = stats.mtime;
    
    // Get first few bytes as a sample (safely handling binary data)
    let sampleContent = '';
    try {
      const fd = await fs.promises.open(pdfPath, 'r');
      const buffer = Buffer.alloc(1024); // Read first 1KB
      const { bytesRead } = await fd.read(buffer, 0, 1024, 0);
      await fd.close();
      
      // Convert to string, filtering out non-printable characters
      sampleContent = buffer
        .slice(0, bytesRead)
        .toString('utf8', 0, bytesRead)
        .replace(/[^\x20-\x7E]/g, ' ')
        .trim()
        .substring(0, 200); // First 200 printable chars
    } catch (err) {
      console.log(`Could not read file sample: ${err.message}`);
      sampleContent = '[Binary content]';
    }
    
    // Create a simple text representation with file metadata
    const extractedText = `
FILENAME: ${fileName}
FILE_TYPE: ${fileExt}
FILE_SIZE: ${fileSize} bytes
CREATED: ${createDate}
MODIFIED: ${modifyDate}
CONTENT_SAMPLE: ${sampleContent}
    `;
    
    return extractedText;
  } catch (error) {
    console.error(`Error extracting text from ${pdfPath}:`, error);
    return `Error processing file: ${path.basename(pdfPath)}. ${error.message}`;
  }
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
        const docMetadata = determineDocumentType(file, text);
        
        // Split content into sections if possible
        const sections = extractDocumentSections(text);
        
        if (sections.length > 0) {
          // Process each section separately for more granular knowledge
          for (const section of sections) {
            results.push({
              filename: file,
              content: section.content,
              section: section.id,
              jurisdiction: docMetadata.jurisdiction,
              tags: docMetadata.tags + (section.title ? `,${section.title.replace(/\s+/g, '_')}` : ''),
              docType: docMetadata.docType,
              confidence: docMetadata.confidence
            });
          }
          console.log(`Processed ${sections.length} sections from: ${file}`);
        } else {
          // Process the whole document as one piece
          results.push({
            filename: file,
            content: text,
            section: docMetadata.section || '',
            jurisdiction: docMetadata.jurisdiction,
            tags: docMetadata.tags,
            docType: docMetadata.docType,
            confidence: docMetadata.confidence
          });
          console.log(`Processed: ${file} (no sections detected)`);
        }
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
 * Extract document sections to allow for more granular knowledge retrieval
 * @param {string} text - Document text
 * @returns {Array} - Array of section objects
 */
function extractDocumentSections(text) {
  const sections = [];
  
  // Look for section headers in the text
  // Patterns like "Chapter X", "Section X", "X. Title", etc.
  const sectionPatterns = [
    // Common numbered section formats
    /\b(\d+\.?\d*)\s+([A-Z][A-Za-z0-9\s&;,\-–—]+?)(?=\n|\r|\.$)/g,
    // Chapter headings
    /\bCHAPTER\s+(\d+|[IVXLCDM]+)[\.\s:]+([A-Z][A-Za-z0-9\s&;,\-–—]+?)(?=\n|\r|\.$)/gi,
    // Section headings
    /\bSECTION\s+(\d+|[IVXLCDM]+)[\.\s:]+([A-Z][A-Za-z0-9\s&;,\-–—]+?)(?=\n|\r|\.$)/gi,
    // Appendix headings
    /\bAPPENDIX\s+([A-Z\d]+)[\.\s:]+([A-Z][A-Za-z0-9\s&;,\-–—]+?)(?=\n|\r|\.$)/gi,
    // Simple headers in all caps
    /^([A-Z][A-Z\s&;,\-–—]{4,})$/gm
  ];
  
  // Extract sections based on matches
  let sectionMatches = [];
  for (const pattern of sectionPatterns) {
    const matches = [...text.matchAll(pattern)];
    if (matches.length > 0) {
      sectionMatches = sectionMatches.concat(matches);
    }
  }
  
  // Sort matches by their index in the text
  sectionMatches.sort((a, b) => a.index - b.index);
  
  // If we have too many matches (> 50), it's probably not a good section breakdown
  if (sectionMatches.length > 50 || sectionMatches.length === 0) {
    return [];
  }
  
  // Convert matches to actual sections
  for (let i = 0; i < sectionMatches.length; i++) {
    const match = sectionMatches[i];
    const startPos = match.index;
    const endPos = i < sectionMatches.length - 1 ? sectionMatches[i+1].index : text.length;
    const sectionId = match[1] || `section-${i + 1}`;
    const sectionTitle = match[2] || `Section ${i + 1}`;
    const sectionContent = text.substring(startPos, endPos).trim();
    
    // Only include sections with meaningful content
    if (sectionContent.length > 100) {
      sections.push({
        id: sectionId,
        title: sectionTitle,
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
  const lowerContent = content.toLowerCase().substring(0, 5000); // Analyze first 5000 chars
  
  // Document metadata
  const result = {
    jurisdiction: 'Global',
    tags: 'regulatory',
    docType: 'General',
    section: '',
    confidence: 0.5 // Default confidence level
  };
  
  // Regulatory jurisdictions
  const jurisdictionPatterns = [
    // FDA (USA)
    {pattern: /\bfda\b|\bu\.?s\.? food and drug\b|\bcfr\b|\bcode of federal regulations\b|\b21 cfr\b/g, jurisdiction: 'USA', tags: 'FDA', confidence: 0.8},
    {pattern: /\b510\(?k\)?|\bpremarket notification\b|\bsubstantial equivalence\b/g, jurisdiction: 'USA', tags: 'FDA,510k,premarket', confidence: 0.9},
    {pattern: /\bpma\b|\bpremarket approval\b/g, jurisdiction: 'USA', tags: 'FDA,PMA,premarket', confidence: 0.9},
    {pattern: /\bde novo\b|\bde novo classification\b/g, jurisdiction: 'USA', tags: 'FDA,De Novo,classification', confidence: 0.9},
    {pattern: /\bhde\b|\bhumanitarian device\b/g, jurisdiction: 'USA', tags: 'FDA,HDE', confidence: 0.9},
    
    // EMA (EU)
    {pattern: /\bema\b|\beu\b|\bemea\b|\beuropean medicines agency\b/g, jurisdiction: 'EU', tags: 'EMA,EU', confidence: 0.8},
    {pattern: /\bmdr\b|\bmedical device regulation\b|\b2017\/745\b/g, jurisdiction: 'EU', tags: 'EU,MDR,regulation', confidence: 0.9},
    {pattern: /\bivdr\b|\bin vitro diagnostic\b|\b2017\/746\b/g, jurisdiction: 'EU', tags: 'EU,IVDR,regulation', confidence: 0.9},
    {pattern: /\bmeddev\b|\beu directive\b/g, jurisdiction: 'EU', tags: 'EU,MEDDEV,guidance', confidence: 0.8},
    {pattern: /\beudamed\b/g, jurisdiction: 'EU', tags: 'EU,EUDAMED,database', confidence: 0.9},
    
    // PMDA (Japan)
    {pattern: /\bpmda\b|\bjapan\b|\bjapanese\b/g, jurisdiction: 'Japan', tags: 'PMDA,Japan', confidence: 0.8},
    {pattern: /\bj-mhlw\b|\bmhlw\b|\bjapanese ministry\b/g, jurisdiction: 'Japan', tags: 'PMDA,MHLW,Japan', confidence: 0.9},
    
    // NMPA (China)
    {pattern: /\bnmpa\b|\bchina\b|\bchinese\b/g, jurisdiction: 'China', tags: 'NMPA,China', confidence: 0.8},
    {pattern: /\bcfda\b|\bchina food and drug\b/g, jurisdiction: 'China', tags: 'NMPA,CFDA,China', confidence: 0.9},
    
    // Health Canada
    {pattern: /\bhealth canada\b|\bcanada\b|\bcanadian\b/g, jurisdiction: 'Canada', tags: 'Health Canada', confidence: 0.8},
    {pattern: /\bcmdcas\b|\bmdel\b|\bcanadian medical device\b/g, jurisdiction: 'Canada', tags: 'Health Canada,CMDCAS,medical device', confidence: 0.9},
    
    // TGA (Australia)
    {pattern: /\btga\b|\baustralia\b|\baustralian\b|\btherapeutic goods\b/g, jurisdiction: 'Australia', tags: 'TGA,Australia', confidence: 0.8},
    
    // ICH (Global)
    {pattern: /\bich\b|\binternational council for harmonisation\b/g, jurisdiction: 'Global', tags: 'ICH,harmonisation', confidence: 0.9},
    
    // ISO (Global)
    {pattern: /\biso\b|\binternational organization for standardization\b/g, jurisdiction: 'Global', tags: 'ISO,standard', confidence: 0.8},
    {pattern: /\biso 13485\b/g, jurisdiction: 'Global', tags: 'ISO,13485,quality management', confidence: 0.9},
    {pattern: /\biso 14971\b/g, jurisdiction: 'Global', tags: 'ISO,14971,risk management', confidence: 0.9},
    {pattern: /\biso 10993\b/g, jurisdiction: 'Global', tags: 'ISO,10993,biocompatibility', confidence: 0.9}
  ];
  
  // ICH guideline patterns
  const ichGuidelinePatterns = [
    // Efficacy guidelines
    {pattern: /\bich e1\b/, tags: 'ICH,E1,population exposure', section: 'E1', confidence: 0.95},
    {pattern: /\bich e2\b/, tags: 'ICH,E2,pharmacovigilance', section: 'E2', confidence: 0.95},
    {pattern: /\bich e3\b/, tags: 'ICH,E3,study reports', section: 'E3', confidence: 0.95},
    {pattern: /\bich e4\b/, tags: 'ICH,E4,dose response', section: 'E4', confidence: 0.95},
    {pattern: /\bich e5\b/, tags: 'ICH,E5,ethnic factors', section: 'E5', confidence: 0.95},
    {pattern: /\bich e6\b|gcp/, tags: 'ICH,E6,GCP,good clinical practice', section: 'E6', confidence: 0.95},
    {pattern: /\bich e7\b/, tags: 'ICH,E7,geriatric studies', section: 'E7', confidence: 0.95},
    {pattern: /\bich e8\b/, tags: 'ICH,E8,general considerations', section: 'E8', confidence: 0.95},
    {pattern: /\bich e9\b/, tags: 'ICH,E9,statistical principles', section: 'E9', confidence: 0.95},
    {pattern: /\bich e10\b/, tags: 'ICH,E10,control groups', section: 'E10', confidence: 0.95},
    {pattern: /\bich e11\b/, tags: 'ICH,E11,pediatric populations', section: 'E11', confidence: 0.95},
    {pattern: /\bich e12\b/, tags: 'ICH,E12,clinical evaluation', section: 'E12', confidence: 0.95},
    {pattern: /\bich e14\b/, tags: 'ICH,E14,QT interval', section: 'E14', confidence: 0.95},
    {pattern: /\bich e15\b/, tags: 'ICH,E15,genomic biomarkers', section: 'E15', confidence: 0.95},
    {pattern: /\bich e16\b/, tags: 'ICH,E16,biomarkers', section: 'E16', confidence: 0.95},
    {pattern: /\bich e17\b/, tags: 'ICH,E17,multi-regional trials', section: 'E17', confidence: 0.95},
    {pattern: /\bich e18\b/, tags: 'ICH,E18,genomic sampling', section: 'E18', confidence: 0.95},
    {pattern: /\bich e19\b/, tags: 'ICH,E19,safety data collection', section: 'E19', confidence: 0.95},
    {pattern: /\bich e20\b/, tags: 'ICH,E20,adaptive trials', section: 'E20', confidence: 0.95}
  ];
  
  // Document type patterns
  const documentTypePatterns = [
    {pattern: /\bguidance\b|\bguideline\b|\bguide\b/, docType: 'Guidance', confidence: 0.7},
    {pattern: /\bregulation\b|\bdirective\b|\blaw\b/, docType: 'Regulation', confidence: 0.8},
    {pattern: /\bstandard\b|\biso\b|\bastm\b/, docType: 'Standard', confidence: 0.8},
    {pattern: /\breport\b|\bstudy\b|\btrial\b/, docType: 'Report', confidence: 0.7},
    {pattern: /\bform\b|\btemplate\b|\bapplication\b/, docType: 'Form', confidence: 0.7},
    {pattern: /\bclinical evaluation report\b|\bcer\b/, docType: 'Clinical Evaluation Report', confidence: 0.9},
    {pattern: /\btechnical\s+file\b|\btechnical\s+documentation\b/, docType: 'Technical Documentation', confidence: 0.8},
    {pattern: /\brisk\s+management\b|\brisk\s+analysis\b/, docType: 'Risk Management', confidence: 0.8},
    {pattern: /\bpost[- ]market surveillance\b|\bpms\b|\bpmsur\b/, docType: 'Post-Market Surveillance', confidence: 0.9},
    {pattern: /\bmanufacturer\b|\bquality system\b|\bqms\b/, docType: 'Quality System', confidence: 0.7},
    {pattern: /\blabeling\b|\blabelling\b|\bpackage insert\b/, docType: 'Labeling', confidence: 0.8}
  ];
  
  // Check for jurisdiction matches
  for (const jp of jurisdictionPatterns) {
    const matches = (lowerFilename.match(jp.pattern) || []).concat(lowerContent.match(jp.pattern) || []);
    if (matches.length > 0) {
      result.jurisdiction = jp.jurisdiction;
      result.tags = jp.tags;
      result.confidence = Math.max(result.confidence, jp.confidence);
      break;
    }
  }
  
  // Special handling for ICH guidelines
  for (const ich of ichGuidelinePatterns) {
    if (lowerFilename.match(ich.pattern) || lowerContent.match(ich.pattern)) {
      result.jurisdiction = 'Global';
      result.tags = ich.tags;
      result.section = ich.section;
      result.confidence = Math.max(result.confidence, ich.confidence);
      result.docType = 'ICH Guideline';
      break;
    }
  }
  
  // Check for document type
  for (const dt of documentTypePatterns) {
    if (lowerFilename.match(dt.pattern) || lowerContent.match(dt.pattern)) {
      result.docType = dt.docType;
      result.confidence = Math.max(result.confidence, dt.confidence);
      break;
    }
  }
  
  // Convert tags to proper tag format if they're not already
  if (!result.tags.includes(',')) {
    result.tags = result.tags.split(' ').filter(Boolean).join(',');
  }
  
  return result;
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