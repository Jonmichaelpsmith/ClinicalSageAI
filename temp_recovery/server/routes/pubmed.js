/**
 * PubMed API Routes
 * 
 * This module provides API endpoints to interact with PubMed data:
 * - /api/pubmed/search: Search PubMed for articles
 * - /api/pubmed/abstracts: Fetch article abstracts by PMID
 * - /api/pubmed/citations: Generate formatted citations for articles
 */

import express from 'express';
import { OpenAI } from 'openai';

const router = express.Router();

// Initialize OpenAI client for AI-enhanced abstracts and summaries
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

/**
 * @route GET /api/pubmed/search
 * @description Search PubMed for scientific articles
 * @param {string} query - Search query term
 * @param {number} limit - Maximum results to return (default: 10)
 * @returns {Array} Array of publication objects
 */
router.get('/search', async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    // In production, this would call the actual PubMed API
    // const pubmedUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${limit}&retmode=json`;
    // const response = await fetch(pubmedUrl);
    // const data = await response.json();
    
    // For development, return mock data based on the query
    console.log(`[PubMed] Mock search for query: ${query}`);
    
    // Generate deterministic results based on the query
    const mockResults = generateMockPubmedResults(query, parseInt(limit));
    
    res.json({ 
      success: true,
      query,
      results: mockResults
    });
  } catch (error) {
    console.error('Error searching PubMed:', error);
    res.status(500).json({ error: 'Failed to search PubMed' });
  }
});

/**
 * @route POST /api/pubmed/abstracts
 * @description Fetch abstracts for a list of PubMed IDs
 * @param {Array} pmids - Array of PubMed IDs
 * @returns {Object} Map of PMIDs to abstract objects
 */
router.post('/abstracts', async (req, res) => {
  try {
    const { pmids } = req.body;
    
    if (!pmids || !Array.isArray(pmids) || pmids.length === 0) {
      return res.status(400).json({ error: 'Valid PMIDs array is required' });
    }

    // In production, this would call the actual PubMed API
    // const pubmedUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=json`;
    // const response = await fetch(pubmedUrl);
    // const data = await response.json();
    
    // For development, generate mock abstracts
    console.log(`[PubMed] Fetching abstracts for PMIDs: ${pmids.join(', ')}`);
    
    // Generate deterministic mock abstracts
    const abstracts = {};
    pmids.forEach(pmid => {
      abstracts[pmid] = generateMockAbstract(pmid);
    });
    
    res.json({ 
      success: true,
      abstracts 
    });
  } catch (error) {
    console.error('Error fetching PubMed abstracts:', error);
    res.status(500).json({ error: 'Failed to fetch abstracts' });
  }
});

/**
 * @route POST /api/pubmed/citations
 * @description Generate formatted citations for PubMed articles
 * @param {Array} pmids - Array of PubMed IDs
 * @param {string} style - Citation style (vancouver, apa, etc.)
 * @returns {Array} Array of formatted citation strings
 */
router.post('/citations', async (req, res) => {
  try {
    const { pmids, style = 'vancouver' } = req.body;
    
    if (!pmids || !Array.isArray(pmids) || pmids.length === 0) {
      return res.status(400).json({ error: 'Valid PMIDs array is required' });
    }

    // In production, this would call the actual PubMed citation service
    // For development, generate mock formatted citations
    console.log(`[PubMed] Generating ${style} citations for PMIDs: ${pmids.join(', ')}`);
    
    const citations = pmids.map(pmid => {
      const abstract = generateMockAbstract(pmid);
      return formatCitation(abstract, style);
    });
    
    res.json({ 
      success: true,
      style,
      citations 
    });
  } catch (error) {
    console.error('Error generating citations:', error);
    res.status(500).json({ error: 'Failed to generate citations' });
  }
});

/**
 * Generate mock PubMed search results based on query
 */
function generateMockPubmedResults(query, limit) {
  const baseYear = 2020;
  const queryHash = hashString(query); // Get a deterministic hash from the query
  
  const mockResults = [];
  for (let i = 0; i < limit; i++) {
    const pmid = String(10000000 + (queryHash % 1000000) + i);
    const yearOffset = i % 5;
    
    mockResults.push({
      pmid,
      title: `${capitalizeFirstLetter(query)} in clinical evaluation of medical devices: a ${5-yearOffset}-year study`,
      authors: `Smith J, Johnson A, Williams B${i % 2 === 0 ? ', et al.' : ''}`,
      journal: `Journal of ${capitalize(query.split(' ')[0])} Research`,
      year: (baseYear - yearOffset).toString(),
      doi: `10.1234/jcr.${pmid}`
    });
  }
  
  return mockResults;
}

/**
 * Generate a mock abstract for a given PMID
 */
function generateMockAbstract(pmid) {
  const pmidNum = parseInt(pmid);
  const year = 2020 - (pmidNum % 5);
  const isRCT = pmidNum % 3 === 0;
  const isPositive = pmidNum % 2 === 0;
  const sampleSize = 50 + (pmidNum % 150);
  
  let topic;
  if (pmidNum % 4 === 0) topic = "cardiac pacemakers";
  else if (pmidNum % 4 === 1) topic = "glucose monitoring systems";
  else if (pmidNum % 4 === 2) topic = "orthopedic implants";
  else topic = "neurostimulation devices";
  
  const title = `${isRCT ? 'Randomized controlled trial of ' : 'Evaluating '}${topic} in ${isPositive ? 'improving' : 'managing'} patient outcomes`;
  
  const abstract = `BACKGROUND: Medical devices play a crucial role in modern healthcare. This study evaluated the safety and efficacy of ${topic} in clinical practice.
  
METHODS: ${isRCT ? 'A randomized controlled trial' : 'A prospective cohort study'} was conducted with ${sampleSize} patients between ${year-2} and ${year}. ${isRCT ? 'Participants were randomly assigned to intervention or control groups.' : 'All participants were followed for 24 months.'} Primary outcomes included device performance and adverse events.

RESULTS: The study demonstrated ${isPositive ? 'significant improvements' : 'no significant difference'} in patient outcomes (p ${isPositive ? '< 0.05' : '> 0.05'}). Adverse events were reported in ${pmidNum % 10}% of cases, most commonly including minor inflammation at the device site.

CONCLUSIONS: This study provides evidence that ${topic} are ${isPositive ? 'effective and safe' : 'safe but require further investigation for efficacy'} for clinical use. Further studies with larger sample sizes are warranted.`;

  return {
    pmid,
    title,
    abstract,
    authors: `Smith J, Johnson A, Williams B${pmidNum % 2 === 0 ? ', et al.' : ''}`,
    journal: `Journal of Medical Device Research`,
    year: year.toString(),
    doi: `10.1234/jmdr.${pmid}`
  };
}

/**
 * Format a citation based on the given style
 */
function formatCitation(article, style) {
  if (style === 'vancouver') {
    return `${article.authors}. ${article.title}. ${article.journal}. ${article.year};${article.pmid % 10 + 1}(${article.pmid % 4 + 1}):${article.pmid % 100 + 100}-${article.pmid % 100 + 120}.`;
  } else if (style === 'apa') {
    return `${article.authors} (${article.year}). ${article.title}. ${article.journal}, ${article.pmid % 10 + 1}(${article.pmid % 4 + 1}), ${article.pmid % 100 + 100}-${article.pmid % 100 + 120}.`;
  } else {
    return `${article.authors}. "${article.title}" ${article.journal}, vol. ${article.pmid % 10 + 1}, no. ${article.pmid % 4 + 1}, ${article.year}, pp. ${article.pmid % 100 + 100}-${article.pmid % 100 + 120}.`;
  }
}

/**
 * Utility function to get a hash code from a string
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function capitalizeFirstLetter(string) {
  return string.split(' ').map(word => capitalize(word)).join(' ');
}

export default router;