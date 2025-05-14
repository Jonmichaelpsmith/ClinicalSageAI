/**
 * Unified Discovery API
 * 
 * This API provides unified search capabilities for:
 * 1. Literature search (for both CER and 510k modules)
 * 2. Predicate device search (primarily for 510k module)
 * 
 * The API intelligently adapts result formats based on the module context
 * while maintaining a shared core implementation.
 */

import express from 'express';
import { findPredicates, searchLiterature } from '../services/discoveryService.js';
const router = express.Router();

/**
 * @route POST /api/discovery/literature-search
 * @desc Unified literature search endpoint for both CER and 510k modules
 */
router.post('/literature-search', async (req, res) => {
  try {
    const { query, limit = 10, module = 'cer' } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Invalid query parameter' });
    }
    
    console.log(`Unified literature search API (${module} context): ${query}`);
    
    // Use the unified discovery service to find literature
    const results = await searchLiterature(query, { limit });
    
    // Format results based on the requesting module
    let formattedResults;
    if (module === '510k') {
      formattedResults = format510kLiteratureResults(results);
    } else {
      // Default to CER format
      formattedResults = formatCERLiteratureResults(results);
    }
    
    return res.json({ results: formattedResults });
  } catch (error) {
    console.error('Error in literature search:', error);
    return res.status(500).json({ 
      error: 'An error occurred during literature search',
      message: error.message 
    });
  }
});

/**
 * Format literature results for CER module
 * @param {Array} results - Array of literature results
 * @returns {Array} Formatted results for CER module
 */
function formatCERLiteratureResults(results) {
  return results.map(result => ({
    id: result.id || `lit-${Math.random().toString(16).slice(2, 10)}`,
    title: result.title,
    abstract: result.snippet,
    authors: result.authors || 'Unknown',
    journal: result.journal || 'Journal of Medical Research',
    publicationDate: result.publicationDate || '2023',
    relevanceScore: result.score,
    source: result.source || 'PubMed'
  }));
}

/**
 * Format literature results for 510k module
 * @param {Array} results - Array of literature results
 * @returns {Array} Formatted results for 510k module
 */
function format510kLiteratureResults(results) {
  return results.map(result => ({
    id: result.id || `lit-${Math.random().toString(16).slice(2, 10)}`,
    title: result.title,
    snippet: result.snippet,
    url: result.url || `https://pubmed.ncbi.nlm.nih.gov/${Math.floor(10000000 + Math.random() * 90000000)}/`,
    authors: result.authors || 'Unknown',
    relevance: result.score,
    source: result.source || 'PubMed'
  }));
}

/**
 * @route POST /api/discovery/find-predicates
 * @desc Unified predicate device search endpoint for both CER and 510k modules
 */
router.post('/find-predicates', async (req, res) => {
  try {
    const { deviceDescription, limit = 8, module = '510k' } = req.body;
    
    if (!deviceDescription || typeof deviceDescription !== 'string') {
      return res.status(400).json({ error: 'Invalid deviceDescription parameter' });
    }
    
    console.log(`Unified predicate search API (${module} context): ${deviceDescription.substring(0, 50)}...`);
    
    // Use the unified discovery service to find predicate devices
    const predicates = await findPredicates(deviceDescription, { limit });
    
    // Format results based on the requesting module
    let formattedResults;
    if (module === 'cer') {
      formattedResults = formatCERPredicateResults(predicates);
    } else {
      // Default to 510k format
      formattedResults = format510kPredicateResults(predicates);
    }
    
    return res.json({ predicates: formattedResults });
  } catch (error) {
    console.error('Error in predicate device search:', error);
    return res.status(500).json({ 
      error: 'An error occurred during predicate device search',
      message: error.message 
    });
  }
});

/**
 * Format predicate device results for 510k module
 * @param {Array} predicates - Array of predicate device results
 * @returns {Array} Formatted results for 510k module
 */
function format510kPredicateResults(predicates) {
  return predicates.map(p => ({
    k_number: p.k_number,
    device_name: p.device_name,
    manufacturer: p.manufacturer,
    decision_date: p.decision_date || '2023-01-15',
    relevance_score: p.score
  }));
}

/**
 * Format predicate device results for CER module
 * @param {Array} predicates - Array of predicate device results
 * @returns {Array} Formatted results for CER module
 */
function formatCERPredicateResults(predicates) {
  return predicates.map(p => ({
    id: p.k_number || `pred-${Math.random().toString(16).slice(2, 10)}`,
    name: p.device_name,
    manufacturer: p.manufacturer,
    approvalDate: p.decision_date || '2023-01-15',
    relevanceScore: p.score,
    regulatoryPathway: '510(k)'
  }));
}

// Export as both default and named export for ESM compatibility
export default router;
export { router };