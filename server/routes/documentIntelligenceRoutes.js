/**
 * Document Intelligence API Routes
 * 
 * These routes handle document processing and intelligent data extraction
 * from regulatory documents.
 */

const express = require('express');
const router = express.Router();
const documentIntelligenceController = require('../controllers/documentIntelligenceController');

// POST /api/document-intelligence/extract
// Uploads and processes documents to extract structured data
router.post('/extract', documentIntelligenceController.processDocuments);

module.exports = router;