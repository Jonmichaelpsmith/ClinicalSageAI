/**
 * Document Approval Routes
 * 
 * This module provides API endpoints for document approval workflows, 
 * including individual and bulk approval with QC validation.
 */

import express from 'express';
import { publish } from '../utils/event_bus.js';

const router = express.Router();

// Sample QC data for demonstration
const qcResults = {
  passed: {
    status: 'passed',
    errors: [],
    warnings: [],
    details: {
      pageCount: 12,
      hasBookmarks: true,
      fileSize: 2458921,
      pdfVersion: '1.7',
      isCompliant: true
    }
  },
  failed: {
    status: 'failed',
    errors: ['Missing bookmarks', 'File too large (>25MB)'],
    warnings: ['Image resolution below 300dpi'],
    details: {
      pageCount: 156,
      hasBookmarks: false,
      fileSize: 28901245,
      pdfVersion: '1.5',
      isCompliant: false
    }
  }
};

// Mock document storage
const documents = new Map();

/**
 * Run QC check on a document
 * 
 * @param {string} path Document file path
 * @returns {object} QC result 
 */
function runQcCheck(path) {
  // For demo purposes, randomize pass/fail
  return Math.random() > 0.3 ? qcResults.passed : qcResults.failed;
}

/**
 * Approve a single document
 */
router.post('/api/documents/:id/approve', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid document ID' });
  }
  
  try {
    const doc = documents.get(id) || { id, path: `/tmp/doc_${id}.pdf` };
    const qcResult = runQcCheck(doc.path);
    
    if (qcResult.status === 'passed') {
      doc.status = 'approved';
      doc.approved_at = new Date().toISOString();
    } else {
      doc.status = 'qc_failed'; 
    }
    
    doc.qc_json = qcResult;
    documents.set(id, doc);
    
    // Publish QC event
    publish('qc', { id, status: qcResult.status });
    
    return res.json({ 
      id, 
      status: doc.status, 
      qc_json: doc.qc_json 
    });
  } catch (error) {
    console.error(`Error approving document ${id}:`, error);
    return res.status(500).json({ error: 'Failed to approve document' });
  }
});

/**
 * Bulk approve multiple documents - this is a stub endpoint
 * The actual implementation is in the FastAPI service
 */
router.post('/api/documents/bulk-approve', async (req, res) => {
  const { ids } = req.body;
  
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Invalid document IDs' });
  }
  
  try {
    // Pass through to the FastAPI endpoint
    return res.json({ 
      message: 'Bulk approval request forwarded to processing service',
      count: ids.length
    });
  } catch (error) {
    console.error('Error in bulk approve:', error);
    return res.status(500).json({ error: 'Failed to process bulk approval' });
  }
});

/**
 * Save document builder order
 */
router.post('/api/documents/builder-order', async (req, res) => {
  const { docs } = req.body;
  
  if (!Array.isArray(docs)) {
    return res.status(400).json({ error: 'Invalid document order data' });
  }
  
  try {
    // Store the order (implementation depends on storage mechanism)
    console.log('Saving document order:', docs);
    
    return res.json({ 
      success: true,
      count: docs.length
    });
  } catch (error) {
    console.error('Error saving document order:', error);
    return res.status(500).json({ error: 'Failed to save document order' });
  }
});

export function registerRoutes(app) {
  app.use(router);
}

export default {
  registerRoutes
};