/**
 * 510k Literature Routes
 * 
 * This module provides API routes for literature search, summarization, and citation
 * management for 510(k) submissions.
 */

import express from 'express';
import LiteratureAggregatorService from '../services/LiteratureAggregatorService';
import LiteratureSummarizerService from '../services/LiteratureSummarizerService';

const router = express.Router();

/**
 * Search literature from multiple sources
 * GET /api/510k/literature/search
 */
router.get('/search', async (req, res) => {
  try {
    const {
      query,
      source = 'pubmed',
      publicationTypes,
      dateRange,
      semanticSearch,
      page = 1,
      pageSize = 10,
      projectId
    } = req.query;
    
    // Validate required parameters
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    // Parse publication types array
    let parsedPublicationTypes: string[] | undefined;
    if (publicationTypes) {
      parsedPublicationTypes = typeof publicationTypes === 'string' 
        ? [publicationTypes] 
        : (publicationTypes as string[]);
    }
    
    // Parse date range
    let parsedDateRange: { start: string; end: string } | undefined;
    if (typeof dateRange === 'string' && dateRange) {
      try {
        parsedDateRange = JSON.parse(dateRange);
      } catch (err) {
        parsedDateRange = undefined;
      }
    }
    
    // Convert string parameters to appropriate types
    const numPage = parseInt(page as string, 10) || 1;
    const numPageSize = parseInt(pageSize as string, 10) || 10;
    const boolSemanticSearch = semanticSearch === 'true';
    
    // Call service to search literature
    const results = await LiteratureAggregatorService.searchLiterature({
      query: query as string,
      source: source as string,
      publicationTypes: parsedPublicationTypes,
      dateRange: parsedDateRange,
      semanticSearch: boolSemanticSearch,
      page: numPage,
      pageSize: numPageSize,
      projectId: projectId as string
    });
    
    res.json(results);
  } catch (error) {
    console.error('Error searching literature:', error);
    res.status(500).json({ error: 'Failed to search literature' });
  }
});

/**
 * Summarize literature entries
 * POST /api/510k/literature/summarize
 */
router.post('/summarize', async (req, res) => {
  try {
    const { ids, projectId, forceRefresh } = req.body;
    
    // Validate required parameters
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Literature IDs array is required' });
    }
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    // Call service to summarize literature
    const summaries = await LiteratureSummarizerService.summarizeByIds(
      ids,
      forceRefresh === true
    );
    
    res.json({ summaries });
  } catch (error) {
    console.error('Error summarizing literature:', error);
    res.status(500).json({ error: 'Failed to summarize literature' });
  }
});

/**
 * Add literature entries as citations to a 510(k) report
 * POST /api/510k/literature/citations
 */
router.post('/citations', async (req, res) => {
  try {
    const { ids, projectId } = req.body;
    
    // Validate required parameters
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Literature IDs array is required' });
    }
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    // Mark entries as selected in the database
    await LiteratureSummarizerService.markEntriesAsSelected(ids, projectId);
    
    // Format citations for the report
    const citations = await LiteratureSummarizerService.formatCitations(ids, projectId);
    
    res.json({ citations });
  } catch (error) {
    console.error('Error adding citations:', error);
    res.status(500).json({ error: 'Failed to add citations' });
  }
});

/**
 * Export literature entries as BibTeX
 * POST /api/510k/literature/export/bibtex
 */
router.post('/export/bibtex', async (req, res) => {
  try {
    const { ids, projectId } = req.body;
    
    // Validate required parameters
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Literature IDs array is required' });
    }
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    // Generate BibTeX for the selected entries
    const bibtex = await LiteratureSummarizerService.generateBibTeX(ids, projectId);
    
    res.json({ bibtex });
  } catch (error) {
    console.error('Error exporting BibTeX:', error);
    res.status(500).json({ error: 'Failed to export BibTeX' });
  }
});

/**
 * Get selected literature citations for a project
 * GET /api/510k/literature/selected
 */
router.get('/selected', async (req, res) => {
  try {
    const { projectId } = req.query;
    
    // Validate required parameters
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    // Get selected entries for the project
    const entries = await LiteratureSummarizerService.getSelectedEntries(projectId as string);
    
    // Format citations
    const citations = await LiteratureSummarizerService.formatCitations(
      entries.map(entry => entry.id),
      projectId as string
    );
    
    res.json({ citations });
  } catch (error) {
    console.error('Error getting selected citations:', error);
    res.status(500).json({ error: 'Failed to get selected citations' });
  }
});

export default router;