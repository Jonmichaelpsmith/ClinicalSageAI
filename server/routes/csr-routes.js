/**
 * CSR Routes - TrialSage
 * API endpoints for CSR intelligence and comparison
 */

const express = require('express');
const { pool } = require('../db');
const { generateDeltaAnalysis } = require('../services/delta-comparison-service');

const router = express.Router();

/**
 * Get a single CSR by ID
 */
router.get('/api/csrs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM csrs WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'CSR not found' });
    }
    
    const csr = result.rows[0];
    return res.json({
      id: csr.id,
      filename: csr.filename,
      structured_data: csr.structured_data,
      text: csr.text?.substring(0, 1000) // Send a preview of text
    });
  } catch (error) {
    console.error('Error fetching CSR:', error);
    return res.status(500).json({ error: 'Failed to fetch CSR' });
  }
});

/**
 * Search CSRs semantically
 * Requires external vector search capability (implemented in Python FastAPI)
 */
router.get('/api/csrs/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    // This is a proxy to the Python FastAPI endpoint
    // In production, this would call the vector search service
    const response = await fetch(`http://localhost:8000/api/csrs/search/?query=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    return res.json(data);
  } catch (error) {
    console.error('Error searching CSRs:', error);
    return res.status(500).json({ error: 'Failed to search CSRs' });
  }
});

/**
 * Get summary insights for matched CSRs
 * Requires LLM service (implemented in Python FastAPI)
 */
router.get('/api/csrs/summary', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    // This is a proxy to the Python FastAPI endpoint with LLM capabilities
    const response = await fetch(`http://localhost:8000/api/csrs/summary/?query=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    return res.json(data);
  } catch (error) {
    console.error('Error generating CSR summary:', error);
    return res.status(500).json({ error: 'Failed to generate summary' });
  }
});

/**
 * Compare top CSRs and generate delta analysis
 */
router.get('/api/csrs/compare-deltas', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    // First get the top matching CSRs from the semantic search service
    const searchResponse = await fetch(`http://localhost:8000/api/csrs/search/?query=${encodeURIComponent(query)}`);
    const searchData = await searchResponse.json();
    
    if (!searchData.results || searchData.results.length < 2) {
      return res.status(404).json({ error: 'Not enough comparable CSRs found' });
    }
    
    // Get the IDs of the top 2 CSRs
    const csrIds = searchData.results.slice(0, 2).map(result => result.id);
    
    // Generate comprehensive delta analysis
    const deltaAnalysis = await generateDeltaAnalysis(csrIds);
    
    return res.json(deltaAnalysis);
  } catch (error) {
    console.error('Error generating delta analysis:', error);
    return res.status(500).json({ error: 'Failed to generate delta analysis' });
  }
});

module.exports = router;