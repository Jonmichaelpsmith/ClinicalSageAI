/**
 * 510(k) Literature API Routes
 * 
 * This module provides API endpoints for literature search, citation management,
 * and AI-powered summaries for 510(k) submissions.
 */

import express from 'express';
import { Pool } from 'pg';
// Import services
import { LiteratureAggregatorService } from '../services/LiteratureAggregatorService';
import { LiteratureSummarizerService } from '../services/LiteratureSummarizerService';

// Initialize router
const router = express.Router();

// Initialize services with database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const literatureAggregator = new LiteratureAggregatorService(pool);
const literatureSummarizer = new LiteratureSummarizerService(pool);

/**
 * Get available literature sources
 */
router.get('/api/510k/literature/sources', async (req, res) => {
  try {
    const sources = await literatureAggregator.getEnabledSources();
    res.json({ success: true, sources });
  } catch (error) {
    console.error('Error fetching literature sources:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch literature sources',
      details: String(error)
    });
  }
});

/**
 * Search literature across multiple sources
 */
router.post('/api/510k/literature/search', async (req, res) => {
  try {
    // Validate request
    const { query, sources, startDate, endDate, limit, useSemanticSearch, filters } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    // Check for tenant context
    if (!req.tenantContext) {
      return res.status(401).json({
        success: false,
        error: 'Tenant context is required'
      });
    }
    
    // Execute search
    const results = await literatureAggregator.search({
      query,
      sources,
      startDate,
      endDate,
      limit: limit || 20,
      tenantId: req.tenantContext.organizationId, // Using organizationId as tenantId 
      organizationId: req.tenantContext.organizationId,
      userId: req.tenantContext.userId,
      useSemanticSearch: Boolean(useSemanticSearch),
      filters
    });
    
    res.json({
      success: true,
      results: results.entries,
      total: results.total,
      search_id: results.search_id,
      execution_time_ms: results.execution_time_ms,
      sources_queried: results.sources_queried
    });
  } catch (error) {
    console.error('Error searching literature:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search literature',
      details: String(error)
    });
  }
});

/**
 * Get literature entry by ID
 */
router.get('/api/510k/literature/entries/:id', async (req, res) => {
  try {
    const entryId = parseInt(req.params.id, 10);
    
    if (isNaN(entryId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid literature entry ID'
      });
    }
    
    // Check for tenant context
    if (!req.tenantContext) {
      return res.status(401).json({
        success: false,
        error: 'Tenant context is required'
      });
    }
    
    const entry = await literatureAggregator.getLiteratureEntryById(
      entryId,
      req.tenantContext.organizationId // Using organizationId as tenantId
    );
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Literature entry not found'
      });
    }
    
    res.json({ success: true, entry });
  } catch (error) {
    console.error(`Error fetching literature entry:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch literature entry',
      details: String(error)
    });
  }
});

/**
 * Get recent literature
 */
router.get('/api/510k/literature/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 10;
    
    // Check for tenant context
    if (!req.tenantContext) {
      return res.status(401).json({
        success: false,
        error: 'Tenant context is required'
      });
    }
    
    const entries = await literatureAggregator.getRecentLiterature(
      req.tenantContext.organizationId, // Using organizationId as tenantId
      limit
    );
    
    res.json({ success: true, entries });
  } catch (error) {
    console.error('Error fetching recent literature:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent literature',
      details: String(error)
    });
  }
});

/**
 * Cite literature in a document
 */
router.post('/api/510k/literature/cite', async (req, res) => {
  try {
    // Validate request
    const {
      literatureId,
      documentId,
      documentType,
      sectionId,
      sectionName,
      citationText
    } = req.body;
    
    if (!literatureId || !documentId || !sectionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: literatureId, documentId, sectionId'
      });
    }
    
    // Check for tenant context
    if (!req.tenantContext) {
      return res.status(401).json({
        success: false,
        error: 'Tenant context is required'
      });
    }
    
    // Add citation
    const result = await literatureAggregator.citeLiteratureInDocument(
      literatureId,
      documentId,
      documentType || '510k',
      sectionId,
      sectionName || '',
      citationText || '',
      req.tenantContext.organizationId, // Using organizationId as tenantId
      req.tenantContext.organizationId
    );
    
    res.json({
      success: true,
      citation_id: result.id,
      message: 'Citation added successfully'
    });
  } catch (error) {
    console.error('Error citing literature:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cite literature',
      details: String(error)
    });
  }
});

/**
 * Get citations for a document
 */
router.get('/api/510k/literature/citations/:documentId', async (req, res) => {
  try {
    const documentId = parseInt(req.params.documentId, 10);
    const documentType = req.query.type as string || '510k';
    
    if (isNaN(documentId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid document ID'
      });
    }
    
    // Check for tenant context
    if (!req.tenantContext) {
      return res.status(401).json({
        success: false,
        error: 'Tenant context is required'
      });
    }
    
    const citations = await literatureAggregator.getDocumentCitations(
      documentId,
      documentType,
      req.tenantContext.organizationId // Using organizationId as tenantId
    );
    
    res.json({ success: true, citations });
  } catch (error) {
    console.error('Error fetching document citations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch document citations',
      details: String(error)
    });
  }
});

/**
 * Remove a citation
 */
router.delete('/api/510k/literature/citations/:citationId', async (req, res) => {
  try {
    const citationId = parseInt(req.params.citationId, 10);
    
    if (isNaN(citationId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid citation ID'
      });
    }
    
    // Check for tenant context
    if (!req.tenantContext) {
      return res.status(401).json({
        success: false,
        error: 'Tenant context is required'
      });
    }
    
    const result = await literatureAggregator.removeCitation(
      citationId,
      req.tenantContext.organizationId // Using organizationId as tenantId
    );
    
    if (result) {
      res.json({
        success: true,
        message: 'Citation removed successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Citation not found or could not be removed'
      });
    }
  } catch (error) {
    console.error('Error removing citation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove citation',
      details: String(error)
    });
  }
});

/**
 * Generate an AI-powered summary of literature
 */
router.post('/api/510k/literature/summarize', async (req, res) => {
  try {
    // Validate request
    const {
      literatureIds,
      searchId,
      summaryType,
      focus
    } = req.body;
    
    if (!literatureIds || !Array.isArray(literatureIds) || literatureIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Literature IDs array is required'
      });
    }
    
    // Check for tenant context
    if (!req.tenantContext) {
      return res.status(401).json({
        success: false,
        error: 'Tenant context is required'
      });
    }
    
    // Generate summary
    const summary = await literatureSummarizer.generateSummary({
      literatureIds,
      searchId,
      summaryType: summaryType || 'standard',
      focus,
      tenantId: req.tenantContext.organizationId, // Using organizationId as tenantId
      organizationId: req.tenantContext.organizationId,
      userId: req.tenantContext.userId
    });
    
    res.json({
      success: true,
      summary: summary.summary,
      summary_id: summary.summaryId,
      processing_time_ms: summary.processingTimeMs,
      model_used: summary.modelUsed
    });
  } catch (error) {
    console.error('Error generating literature summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate literature summary',
      details: String(error)
    });
  }
});

/**
 * Get summary by ID
 */
router.get('/api/510k/literature/summaries/:id', async (req, res) => {
  try {
    const summaryId = parseInt(req.params.id, 10);
    
    if (isNaN(summaryId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid summary ID'
      });
    }
    
    // Check for tenant context
    if (!req.tenantContext) {
      return res.status(401).json({
        success: false,
        error: 'Tenant context is required'
      });
    }
    
    const summary = await literatureSummarizer.getSummaryById(
      summaryId,
      req.tenantContext.organizationId // Using organizationId as tenantId
    );
    
    if (!summary) {
      return res.status(404).json({
        success: false,
        error: 'Summary not found'
      });
    }
    
    res.json({ success: true, summary });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch summary',
      details: String(error)
    });
  }
});

/**
 * Get recent summaries
 */
router.get('/api/510k/literature/summaries', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 10;
    
    // Check for tenant context
    if (!req.tenantContext) {
      return res.status(401).json({
        success: false,
        error: 'Tenant context is required'
      });
    }
    
    const summaries = await literatureSummarizer.getRecentSummaries(
      req.tenantContext.organizationId, // Using organizationId as tenantId
      limit
    );
    
    res.json({ success: true, summaries });
  } catch (error) {
    console.error('Error fetching recent summaries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent summaries',
      details: String(error)
    });
  }
});

export { router };