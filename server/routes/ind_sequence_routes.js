/**
 * IND Sequence Routes
 * 
 * Handles eCTD sequence creation, generation of XML backbone files, and management
 * of document lifecycles for IND submissions.
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const xml2js = require('xml2js');
const crypto = require('crypto');
const { db } = require('../db');
const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

// Get the last eCTD sequence for this IND
router.get('/ind/last-sequence', async (req, res) => {
  try {
    // Query the database for the last sequence number
    const result = await db.query(
      'SELECT sequence_number FROM ind_sequences ORDER BY created_at DESC LIMIT 1'
    );
    
    if (result.rowCount > 0) {
      res.json(result.rows[0].sequence_number);
    } else {
      // Return 0000 if no sequences exist yet
      res.json("0000");
    }
  } catch (error) {
    console.error('Error retrieving last sequence:', error);
    res.status(500).json({ error: 'Failed to retrieve last sequence number' });
  }
});

// Create a new eCTD sequence
router.post('/ind/sequence/create', async (req, res) => {
  const { base, plan } = req.body;
  
  try {
    // Calculate next sequence number
    let nextSeq = "0000";
    if (base && base !== "0000") {
      // Increment sequence (e.g., 0001 to 0002)
      const seqNum = parseInt(base, 10) + 1;
      nextSeq = seqNum.toString().padStart(4, '0');
    }
    
    // Generate sequence directory structure
    const outputDir = path.join(process.cwd(), 'exports', 'ectd', nextSeq);
    await createSequenceDirectories(outputDir);
    
    // Track copied documents and their locations
    const docRegistry = [];
    
    // Process each document in the plan
    for (const doc of plan) {
      if (doc.errors && doc.errors.length > 0) {
        // Skip documents with errors
        continue;
      }
      
      // Get document details from database
      const docResult = await db.query(
        'SELECT file_path, title, version, metadata FROM documents WHERE id = $1',
        [doc.id]
      );
      
      if (docResult.rowCount === 0) {
        console.warn(`Document ${doc.id} not found`);
        continue;
      }
      
      const document = docResult.rows[0];
      const metadata = document.metadata || {};
      
      // Determine target path within eCTD structure
      const targetFolder = path.join(outputDir, doc.module);
      await mkdir(targetFolder, { recursive: true });
      
      // CTD-compliant filename construction
      const filename = generateEctdFilename(document.title, document.version, metadata);
      const targetPath = path.join(targetFolder, filename);
      
      // Copy document to target location
      await copyFile(document.file_path, targetPath);
      
      // Calculate MD5 hash for integrity verification
      const fileBuffer = await fs.promises.readFile(targetPath);
      const md5Hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
      
      // Record document in registry
      docRegistry.push({
        id: doc.id,
        title: document.title,
        module: doc.module,
        operation: doc.operation,
        path: path.relative(outputDir, targetPath),
        md5: md5Hash,
        version: document.version
      });
      
      // Update document's last_submitted_version in database
      await db.query(
        'UPDATE documents SET last_submitted_version = $1 WHERE id = $2',
        [document.version, doc.id]
      );
    }
    
    // Generate XML backbone files
    await generateIndexXml(outputDir, docRegistry);
    await generateUsRegionalXml(outputDir, docRegistry, nextSeq);
    
    // Create sequence record in database
    const userId = req.user?.id || 1; // Fallback to admin user if auth not implemented
    await db.query(
      'INSERT INTO ind_sequences (sequence_number, created_by, document_count, directory_path) VALUES ($1, $2, $3, $4)',
      [nextSeq, userId, docRegistry.length, outputDir]
    );
    
    // Create audit trail entries
    await createAuditTrail(nextSeq, docRegistry, userId);
    
    // Return the created sequence info
    res.json({ 
      sequence: nextSeq, 
      documentCount: docRegistry.length,
      path: outputDir
    });
    
  } catch (error) {
    console.error('Error creating sequence:', error);
    res.status(500).json({ error: 'Failed to create sequence', details: error.message });
  }
});

/**
 * Create the eCTD directory structure
 */
async function createSequenceDirectories(baseDir) {
  // Create main directory
  await mkdir(baseDir, { recursive: true });
  
  // Create module directories
  const modules = [
    'util',
    'util/dtd',
    'util/style',
    'm1',
    'm1/us',
    'm2',
    'm2/common',
    'm2/2.2-intro',
    'm2/2.3-quality',
    'm2/2.4-nonclinical',
    'm2/2.5-clinical',
    'm2/2.6-nonclinical',
    'm2/2.7-clinical',
    'm3',
    'm3/3.2-body-data',
    'm3/3.3-lit-references',
    'm4',
    'm4/4.2-study-reports',
    'm4/4.3-lit-references',
    'm5',
    'm5/5.2-tabular-listing',
    'm5/5.3-clinical-study-reports',
    'm5/5.3.1-reports-biopharm-studies',
    'm5/5.3.5-reports-efficacy-safety',
    'm5/5.4-lit-references'
  ];
  
  // Create each directory
  for (const dir of modules) {
    await mkdir(path.join(baseDir, dir), { recursive: true });
  }
}

/**
 * Generate CTD-compliant filename
 */
function generateEctdFilename(title, version, metadata) {
  // Remove special characters and spaces
  const baseName = title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  
  // Add version and extension
  return `${baseName}-v${version}.pdf`;
}

/**
 * Generate main index.xml backbone file
 */
async function generateIndexXml(baseDir, documents) {
  const indexObj = {
    'ectd:ectd': {
      '$': {
        'xmlns:ectd': 'http://www.ich.org/ectd',
        'xmlns:xlink': 'http://www.w3c.org/1999/xlink',
        'dtd-version': '3.2'
      },
      'ectd:backbone': {
        'ectd:title': 'eCTD FDA Submission'
      },
      'ectd:leaf-index': {
        'ectd:leaf': documents.map(doc => ({
          '$': {
            operation: doc.operation,
            checksum: doc.md5,
            'checksum-type': 'md5',
            'xlink:href': doc.path.replace(/\\/g, '/')
          },
          'ectd:title': doc.title
        }))
      }
    }
  };
  
  const builder = new xml2js.Builder({ headless: true });
  const xml = builder.buildObject(indexObj);
  
  await writeFile(path.join(baseDir, 'index.xml'), xml);
  
  // Generate MD5 for index.xml
  const indexBuffer = await fs.promises.readFile(path.join(baseDir, 'index.xml'));
  const indexMd5 = crypto.createHash('md5').update(indexBuffer).digest('hex');
  
  // Write checksum file
  await writeFile(path.join(baseDir, 'index-md5.txt'), indexMd5);
}

/**
 * Generate FDA-specific us-regional.xml file for Module 1
 */
async function generateUsRegionalXml(baseDir, documents, sequenceNum) {
  // Filter only Module 1 documents
  const m1Docs = documents.filter(doc => doc.module.startsWith('m1'));
  
  const usRegionalObj = {
    'us-regional:us-regional': {
      '$': {
        'xmlns:us-regional': 'http://www.fda.gov/xml/us-regional',
        'xmlns:xlink': 'http://www.w3c.org/1999/xlink',
        'dtd-version': '2.0'
      },
      'us-regional:admin': {
        'us-regional:application-set': {
          'us-regional:application': {
            'us-regional:application-information': {
              'us-regional:application-number': {
                'us-regional:application-number-original': 'IND-000000' // Replace with actual IND number
              },
              'us-regional:application-type': 'ind',
              'us-regional:submission-type': 'original',
              'us-regional:sequence-number': sequenceNum
            }
          }
        }
      },
      'us-regional:m1-regional': {
        'us-regional:leaf-index': {
          'us-regional:leaf': m1Docs.map(doc => ({
            '$': {
              operation: doc.operation,
              checksum: doc.md5,
              'checksum-type': 'md5',
              'xlink:href': doc.path.replace(/\\/g, '/')
            },
            'us-regional:title': doc.title
          }))
        }
      }
    }
  };
  
  const builder = new xml2js.Builder({ headless: true });
  const xml = builder.buildObject(usRegionalObj);
  
  await writeFile(path.join(baseDir, 'm1', 'us', 'us-regional.xml'), xml);
}

/**
 * Create audit trail entries for the sequence
 */
async function createAuditTrail(sequenceNum, documents, userId) {
  // Log sequence creation
  await db.query(
    'INSERT INTO audit_trail (event_type, user_id, event_details) VALUES ($1, $2, $3)',
    ['SEQUENCE_CREATED', userId, JSON.stringify({
      sequence: sequenceNum,
      documentCount: documents.length,
      timestamp: new Date().toISOString()
    })]
  );
  
  // Log each document inclusion
  for (const doc of documents) {
    await db.query(
      'INSERT INTO audit_trail (event_type, user_id, event_details) VALUES ($1, $2, $3)',
      ['DOCUMENT_INCLUDED', userId, JSON.stringify({
        sequence: sequenceNum,
        documentId: doc.id,
        documentTitle: doc.title,
        documentVersion: doc.version,
        module: doc.module,
        operation: doc.operation,
        md5: doc.md5,
        timestamp: new Date().toISOString()
      })]
    );
  }
}

module.exports = router;