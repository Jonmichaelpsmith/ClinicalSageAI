/**
 * Document Intelligence Routes
 * 
 * This module defines the routes for document intelligence features,
 * including document upload and structured data extraction.
 */

const express = require('express');
const router = express.Router();
const documentIntelligenceController = require('../controllers/documentIntelligenceController');

/**
 * @route POST /api/document-intelligence/process
 * @description Process uploaded documents to extract structured data
 * @access Private
 */
router.post('/process', documentIntelligenceController.processDocuments);

module.exports = router;