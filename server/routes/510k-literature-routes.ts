/**
 * 510(k) Literature API Routes
 * 
 * API endpoints for the 510(k) literature search, aggregation, and citation
 * functionality, supporting the Enhanced Literature Discovery feature.
 */

import { Router, Request, Response } from 'express';
import literatureAggregator, { LITERATURE_SOURCES } from '../services/LiteratureAggregatorService';
import literatureSummarizer from '../services/LiteratureSummarizerService';

const router = Router();

/**
 * Middleware to extract tenant context
 */
const extractTenantContext = (req: Request, res: Response, next: Function) => {
  // Default organization ID for testing if not provided
  req.body.organizationId = req.body.organizationId || 'test-org-id';
  next();
};

/**
 * Get available literature sources
 */
router.get('/sources', async (req: Request, res: Response) => {
  try {
    const sources = LITERATURE_SOURCES.filter(source => source.enabled);
    
    res.json({
      sources,
      count: sources.length
    });
  } catch (error) {
    console.error('Error fetching literature sources:', error);
    res.status(500).json({ 
      error: 'Failed to fetch literature sources', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Search literature from multiple sources
 */
router.post(
  '/search',
  extractTenantContext,
  [
    body('query').isString().notEmpty().withMessage('Search query is required'),
    body('sources').optional().isArray(),
    body('startDate').optional().isString(),
    body('endDate').optional().isString(),
    body('useSemanticSearch').optional().isBoolean(),
    body('filters').optional().isObject(),
    body('limit').optional().isInt({ min: 1, max: 100 }),
    body('offset').optional().isInt({ min: 0 })
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const searchParams = {
        query: req.body.query,
        sources: req.body.sources,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        useSemanticSearch: req.body.useSemanticSearch !== false, // Default to true
        filters: req.body.filters || {},
        limit: req.body.limit || 20,
        offset: req.body.offset || 0,
        organizationId: req.body.organizationId
      };
      
      const results = await literatureAggregator.searchLiterature(searchParams);
      
      res.json(results);
    } catch (error) {
      console.error('Error searching literature:', error);
      res.status(500).json({ 
        error: 'Failed to search literature', 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

/**
 * Get literature entry by ID
 */
router.get(
  '/entry/:id',
  extractTenantContext,
  [
    param('id').isString().notEmpty().withMessage('Literature ID is required')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const organizationId = req.query.organizationId?.toString() || 'test-org-id';
      const entry = await literatureAggregator.getLiteratureById(req.params.id, organizationId);
      
      if (!entry) {
        return res.status(404).json({ error: 'Literature entry not found' });
      }
      
      res.json({ entry });
    } catch (error) {
      console.error('Error fetching literature entry:', error);
      res.status(500).json({ 
        error: 'Failed to fetch literature entry', 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

/**
 * Get recent literature entries
 */
router.get(
  '/recent',
  extractTenantContext,
  [
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit.toString(), 10) : 10;
      const organizationId = req.query.organizationId?.toString() || 'test-org-id';
      
      const entries = await literatureAggregator.getRecentLiterature(organizationId, limit);
      
      res.json({ entries, count: entries.length });
    } catch (error) {
      console.error('Error fetching recent literature:', error);
      res.status(500).json({ 
        error: 'Failed to fetch recent literature', 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

/**
 * Cite literature in a document
 */
router.post(
  '/cite',
  extractTenantContext,
  [
    body('literatureId').isString().notEmpty().withMessage('Literature ID is required'),
    body('documentId').isString().notEmpty().withMessage('Document ID is required'),
    body('documentType').isString().notEmpty().withMessage('Document type is required'),
    body('sectionId').isString().notEmpty().withMessage('Section ID is required'),
    body('sectionName').isString().withMessage('Section name is required'),
    body('citationText').optional().isString()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const citation = await literatureAggregator.addCitation(
        req.body.literatureId,
        req.body.documentId,
        req.body.documentType,
        req.body.sectionId,
        req.body.sectionName,
        req.body.citationText || '',
        req.body.organizationId
      );
      
      res.json({ 
        message: 'Literature cited successfully', 
        citation_id: citation.id,
        citation
      });
    } catch (error) {
      console.error('Error citing literature:', error);
      res.status(500).json({ 
        error: 'Failed to cite literature', 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

/**
 * Get citations for a document
 */
router.get(
  '/citations/:documentId',
  extractTenantContext,
  [
    param('documentId').isString().notEmpty().withMessage('Document ID is required'),
    query('type').optional().isString()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const documentType = req.query.type?.toString() || '510k';
      const organizationId = req.query.organizationId?.toString() || 'test-org-id';
      
      const citations = await literatureAggregator.getCitations(
        req.params.documentId,
        documentType,
        organizationId
      );
      
      res.json({ citations, count: citations.length });
    } catch (error) {
      console.error('Error fetching citations:', error);
      res.status(500).json({ 
        error: 'Failed to fetch citations', 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

/**
 * Remove a citation
 */
router.delete(
  '/citations/:citationId',
  extractTenantContext,
  [
    param('citationId').isString().notEmpty().withMessage('Citation ID is required')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const organizationId = req.query.organizationId?.toString() || 'test-org-id';
      
      await literatureAggregator.removeCitation(
        req.params.citationId,
        organizationId
      );
      
      res.json({ 
        message: 'Citation removed successfully',
        citation_id: req.params.citationId
      });
    } catch (error) {
      console.error('Error removing citation:', error);
      res.status(500).json({ 
        error: 'Failed to remove citation', 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

/**
 * Generate a summary from multiple literature entries
 */
router.post(
  '/summarize',
  extractTenantContext,
  [
    body('literatureIds').isArray().notEmpty().withMessage('Literature IDs are required'),
    body('summaryType').isString().isIn(['standard', 'detailed', 'critical', 'comparison']).withMessage('Valid summary type is required'),
    body('focus').optional().isString()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const result = await literatureSummarizer.generateSummary({
        literatureIds: req.body.literatureIds,
        summaryType: req.body.summaryType,
        focus: req.body.focus,
        organizationId: req.body.organizationId
      });
      
      res.json({
        summary: result.summary,
        summary_id: result.id,
        processing_time_ms: result.processing_time_ms,
        literature_count: result.total_literature_count
      });
    } catch (error) {
      console.error('Error generating summary:', error);
      res.status(500).json({ 
        error: 'Failed to generate summary', 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

/**
 * Get recent summaries
 */
router.get(
  '/summaries',
  extractTenantContext,
  [
    query('limit').optional().isInt({ min: 1, max: 20 })
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit.toString(), 10) : 5;
      const organizationId = req.query.organizationId?.toString() || 'test-org-id';
      
      const summaries = await literatureSummarizer.getRecentSummaries(organizationId, limit);
      
      res.json({ summaries, count: summaries.length });
    } catch (error) {
      console.error('Error fetching summaries:', error);
      res.status(500).json({ 
        error: 'Failed to fetch summaries', 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

/**
 * Get summary by ID
 */
router.get(
  '/summary/:id',
  extractTenantContext,
  [
    param('id').isString().notEmpty().withMessage('Summary ID is required')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const organizationId = req.query.organizationId?.toString() || 'test-org-id';
      const summary = await literatureSummarizer.getSummaryById(req.params.id, organizationId);
      
      if (!summary) {
        return res.status(404).json({ error: 'Summary not found' });
      }
      
      res.json({ summary });
    } catch (error) {
      console.error('Error fetching summary:', error);
      res.status(500).json({ 
        error: 'Failed to fetch summary', 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

export default router;