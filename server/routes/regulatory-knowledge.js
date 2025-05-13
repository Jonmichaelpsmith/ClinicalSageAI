/**
 * Regulatory Knowledge Routes
 * 
 * These routes manage the regulatory knowledge base, which powers the enhanced
 * regulatory AI capabilities with comprehensive global regulatory information.
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const documentProcessor = require('../services/documentProcessor');

// Base path for regulatory documents
const DOCS_BASE_PATH = path.join(__dirname, '../../attached_assets');

/**
 * @route GET /api/regulatory-knowledge/status
 * @description Get the status of the regulatory knowledge base
 */
router.get('/status', async (req, res) => {
  try {
    // Check if knowledge base is initialized
    const dbPath = path.join(__dirname, '../../data/knowledge_base.db');
    const dbExists = fs.existsSync(dbPath);
    
    let status = {
      initialized: dbExists,
      documentCount: 0,
      jurisdictions: {},
      lastUpdated: null
    };
    
    if (dbExists) {
      // Get document statistics
      const sqlite3 = require('sqlite3').verbose();
      const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
      
      // Count total documents
      await new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as count FROM knowledge_base', (err, row) => {
          if (err) {
            reject(err);
          } else {
            status.documentCount = row.count;
            resolve();
          }
        });
      });
      
      // Get jurisdiction breakdown
      await new Promise((resolve, reject) => {
        db.all('SELECT jurisdiction, COUNT(*) as count FROM knowledge_base GROUP BY jurisdiction', (err, rows) => {
          if (err) {
            reject(err);
          } else {
            rows.forEach(row => {
              status.jurisdictions[row.jurisdiction] = row.count;
            });
            resolve();
          }
        });
      });
      
      // Get last updated date
      await new Promise((resolve, reject) => {
        db.get('SELECT MAX(last_updated) as last_updated FROM knowledge_base', (err, row) => {
          if (err) {
            reject(err);
          } else {
            status.lastUpdated = row.last_updated;
            resolve();
          }
        });
      });
      
      db.close();
    }
    
    res.json(status);
  } catch (error) {
    console.error('Error getting knowledge base status:', error);
    res.status(500).json({ error: 'Failed to get knowledge base status' });
  }
});

/**
 * @route POST /api/regulatory-knowledge/initialize
 * @description Initialize the regulatory knowledge base
 */
router.post('/initialize', async (req, res) => {
  try {
    const result = await documentProcessor.setupKnowledgeBase();
    res.json({ success: result, message: 'Knowledge base initialized' });
  } catch (error) {
    console.error('Error initializing knowledge base:', error);
    res.status(500).json({ error: 'Failed to initialize knowledge base' });
  }
});

/**
 * @route POST /api/regulatory-knowledge/process-documents
 * @description Process regulatory documents and add them to the knowledge base
 */
router.post('/process-documents', async (req, res) => {
  try {
    const { folderPath } = req.body;
    const targetPath = folderPath 
      ? path.join(DOCS_BASE_PATH, folderPath) 
      : DOCS_BASE_PATH;
    
    // Check if path exists
    if (!fs.existsSync(targetPath)) {
      return res.status(404).json({ error: `Folder not found: ${folderPath || 'attached_assets'}` });
    }
    
    // Process PDFs in the directory
    const result = await documentProcessor.importDocuments(targetPath);
    res.json(result);
  } catch (error) {
    console.error('Error processing documents:', error);
    res.status(500).json({ 
      error: 'Failed to process documents',
      details: error.message
    });
  }
});

/**
 * @route GET /api/regulatory-knowledge/document-folders
 * @description Get a list of available document folders in attached_assets
 */
router.get('/document-folders', async (req, res) => {
  try {
    const folders = [];
    
    // Check if path exists
    if (fs.existsSync(DOCS_BASE_PATH)) {
      const items = fs.readdirSync(DOCS_BASE_PATH, { withFileTypes: true });
      
      for (const item of items) {
        if (item.isDirectory()) {
          const folderInfo = {
            name: item.name,
            path: item.name,
            docCount: 0
          };
          
          // Count PDF files in the folder
          const folderPath = path.join(DOCS_BASE_PATH, item.name);
          const files = fs.readdirSync(folderPath);
          folderInfo.docCount = files.filter(f => f.toLowerCase().endsWith('.pdf')).length;
          
          folders.push(folderInfo);
        }
      }
      
      // Also count PDFs in the root folder
      const rootFiles = fs.readdirSync(DOCS_BASE_PATH);
      const rootPdfCount = rootFiles.filter(f => 
        f.toLowerCase().endsWith('.pdf') && 
        fs.statSync(path.join(DOCS_BASE_PATH, f)).isFile()
      ).length;
      
      folders.unshift({
        name: 'Root Documents',
        path: '',
        docCount: rootPdfCount
      });
    }
    
    res.json({ folders });
  } catch (error) {
    console.error('Error getting document folders:', error);
    res.status(500).json({ error: 'Failed to get document folders' });
  }
});

/**
 * @route GET /api/regulatory-knowledge/search
 * @description Search the knowledge base for relevant content
 */
router.get('/search', async (req, res) => {
  try {
    const { query, jurisdiction, limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.join(__dirname, '../../data/knowledge_base.db');
    
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: 'Knowledge base has not been initialized' });
    }
    
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
    
    let sql = '';
    let params = [];
    
    try {
      // First try using the FTS search table if it exists
      sql = `
        SELECT id, source, section, content, jurisdiction, tags, doc_type 
        FROM knowledge_search 
        WHERE content MATCH ?
      `;
      params = [query];
      
      if (jurisdiction) {
        sql += ' AND jurisdiction = ?';
        params.push(jurisdiction);
      }
      
      sql += ` LIMIT ${parseInt(limit, 10)}`;
      
      const results = await new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
          if (err) {
            // If FTS table doesn't exist or other error, we'll fall back to regular search
            if (err.message.includes('no such table')) {
              resolve([]);
            } else {
              reject(err);
            }
          } else {
            resolve(rows);
          }
        });
      });
      
      // If we got results from FTS, return them
      if (results.length > 0) {
        db.close();
        return res.json({ results });
      }
      
      // Otherwise, fall back to LIKE search
      sql = `
        SELECT id, source, section, content, jurisdiction, tags, doc_type 
        FROM knowledge_base 
        WHERE content LIKE ?
      `;
      params = [`%${query}%`];
      
      if (jurisdiction) {
        sql += ' AND jurisdiction = ?';
        params.push(jurisdiction);
      }
      
      sql += ` LIMIT ${parseInt(limit, 10)}`;
      
      const fallbackResults = await new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
      
      res.json({ results: fallbackResults });
    } finally {
      db.close();
    }
  } catch (error) {
    console.error('Error searching knowledge base:', error);
    res.status(500).json({ error: 'Failed to search knowledge base' });
  }
});

module.exports = router;