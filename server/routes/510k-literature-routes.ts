/**
 * 510(k) Literature Routes
 * 
 * This module provides API routes for the enhanced literature discovery and citation 
 * management features in the 510(k) workflow.
 */

import express from 'express';
import { LiteratureAggregator } from '../services/LiteratureAggregatorService';
import { LiteratureSummarizer } from '../services/LiteratureSummarizerService';

const router = express.Router();

// Create service instances
const literatureAggregator = new LiteratureAggregator();
const literatureSummarizer = new LiteratureSummarizer();

// Middleware to extract tenant context
const extractTenantContext = (req: any, res: any, next: any) => {
  req.tenantContext = {
    organizationId: req.headers['x-org-id'] || null,
    tenantId: req.headers['x-tenant-id'] || null,
    userId: req.headers['x-user-id'] || null
  };
  next();
};

// Apply middleware to all routes
router.use(extractTenantContext);

/**
 * Search literature across multiple sources
 * 
 * GET /api/510k/literature/search
 */
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query parameter is required'
      });
    }
    
    // Process filters from query parameters
    const filters: any = {};
    
    // Source filter
    if (req.query.source) {
      filters.source = Array.isArray(req.query.source) 
        ? req.query.source 
        : [req.query.source];
    }
    
    // Date filters
    if (req.query.startDate) {
      filters.startDate = req.query.startDate as string;
    }
    
    if (req.query.endDate) {
      filters.endDate = req.query.endDate as string;
    }
    
    // Journal filter
    if (req.query.journal) {
      filters.journal = Array.isArray(req.query.journal)
        ? req.query.journal
        : [req.query.journal];
    }
    
    // Author filter
    if (req.query.author) {
      filters.author = Array.isArray(req.query.author)
        ? req.query.author
        : [req.query.author];
    }
    
    // Relevance threshold
    if (req.query.relevanceThreshold) {
      filters.relevanceThreshold = parseFloat(req.query.relevanceThreshold as string);
    }
    
    // Device type filter
    if (req.query.deviceType) {
      filters.deviceType = req.query.deviceType as string;
    }
    
    // Predicate device filter
    if (req.query.predicate) {
      filters.predicate = req.query.predicate === 'true';
    }
    
    // Regulatory category filter
    if (req.query.regulatoryCategory) {
      filters.regulatoryCategory = req.query.regulatoryCategory as string;
    }
    
    // Add tenant context
    filters.organizationId = req.tenantContext.organizationId;
    filters.tenantId = req.tenantContext.tenantId;
    
    // Perform search
    const results = await literatureAggregator.search(query as string, filters);
    
    res.json(results);
  } catch (error: any) {
    console.error('Error searching literature:', error);
    res.status(500).json({
      error: 'Failed to search literature',
      message: error.message
    });
  }
});

/**
 * Get a literature entry by ID
 * 
 * GET /api/510k/literature/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        error: 'Invalid literature ID'
      });
    }
    
    const literature = await literatureAggregator.getLiteratureById(id);
    
    if (!literature) {
      return res.status(404).json({
        error: 'Literature not found'
      });
    }
    
    res.json(literature);
  } catch (error: any) {
    console.error('Error getting literature:', error);
    res.status(500).json({
      error: 'Failed to get literature',
      message: error.message
    });
  }
});

/**
 * Generate a summary for a literature entry
 * 
 * POST /api/510k/literature/:id/summary
 */
router.post('/:id/summary', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        error: 'Invalid literature ID'
      });
    }
    
    // Get summary options from request body
    const {
      type = 'abstract',
      maxLength,
      focusOn,
      regulatoryContext,
      device510k,
      comparativeFocus
    } = req.body;
    
    // Check if summary already exists
    const existingSummary = await literatureSummarizer.getSummary(id, type);
    
    if (existingSummary && !req.query.force) {
      return res.json({
        summary: existingSummary,
        cached: true
      });
    }
    
    // Generate a new summary
    const summary = await literatureSummarizer.generateSummary(id, {
      type,
      maxLength,
      focusOn,
      regulatoryContext,
      device510k,
      comparativeFocus
    });
    
    res.json({
      summary,
      cached: false
    });
  } catch (error: any) {
    console.error('Error generating summary:', error);
    res.status(500).json({
      error: 'Failed to generate summary',
      message: error.message
    });
  }
});

/**
 * Add a citation to a document
 * 
 * POST /api/510k/literature/citations
 */
router.post('/citations', async (req, res) => {
  try {
    const {
      documentId,
      sectionId,
      literatureId,
      citationText,
      citationStyle = 'APA'
    } = req.body;
    
    if (!documentId || !literatureId || !citationText) {
      return res.status(400).json({
        error: 'Missing required fields: documentId, literatureId, citationText'
      });
    }
    
    const citationId = await literatureAggregator.addCitation(
      documentId,
      sectionId,
      literatureId,
      citationText,
      citationStyle,
      req.tenantContext.organizationId,
      req.tenantContext.tenantId,
      req.tenantContext.userId
    );
    
    if (!citationId) {
      return res.status(500).json({
        error: 'Failed to add citation'
      });
    }
    
    res.status(201).json({
      id: citationId,
      message: 'Citation added successfully'
    });
  } catch (error: any) {
    console.error('Error adding citation:', error);
    res.status(500).json({
      error: 'Failed to add citation',
      message: error.message
    });
  }
});

/**
 * Get citations for a document
 * 
 * GET /api/510k/literature/citations/:documentId
 */
router.get('/citations/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    
    if (!documentId) {
      return res.status(400).json({
        error: 'Document ID is required'
      });
    }
    
    const citations = await literatureAggregator.getDocumentCitations(documentId);
    
    res.json(citations);
  } catch (error: any) {
    console.error('Error getting citations:', error);
    res.status(500).json({
      error: 'Failed to get citations',
      message: error.message
    });
  }
});

/**
 * Generate a comparative analysis of multiple literature entries
 * 
 * POST /api/510k/literature/comparative-analysis
 */
router.post('/comparative-analysis', async (req, res) => {
  try {
    const { literatureIds, context } = req.body;
    
    if (!literatureIds || !Array.isArray(literatureIds) || literatureIds.length < 2) {
      return res.status(400).json({
        error: 'At least two literature IDs are required'
      });
    }
    
    const analysis = await literatureSummarizer.generateComparativeAnalysis(
      literatureIds,
      context
    );
    
    res.json({
      analysis
    });
  } catch (error: any) {
    console.error('Error generating comparative analysis:', error);
    res.status(500).json({
      error: 'Failed to generate comparative analysis',
      message: error.message
    });
  }
});

/**
 * Generate a 510(k) literature review section
 * 
 * POST /api/510k/literature/review-section
 */
router.post('/review-section', async (req, res) => {
  try {
    const { documentId, deviceType, predicateDevice } = req.body;
    
    if (!documentId || !deviceType) {
      return res.status(400).json({
        error: 'Missing required fields: documentId, deviceType'
      });
    }
    
    const reviewSection = await literatureSummarizer.generate510kLiteratureReviewSection(
      documentId,
      deviceType,
      predicateDevice
    );
    
    res.json({
      reviewSection
    });
  } catch (error: any) {
    console.error('Error generating literature review section:', error);
    res.status(500).json({
      error: 'Failed to generate literature review section',
      message: error.message
    });
  }
});

export default router;