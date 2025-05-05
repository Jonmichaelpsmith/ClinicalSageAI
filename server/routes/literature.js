/**
 * Literature API
 * 
 * API routes for handling literature search, PDF analysis, and citation generation
 * for the CER module's Literature AI component.
 */

import express from 'express';
import axios from 'axios';
import OpenAI from 'openai';

const router = express.Router();

// Configure OpenAI
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
}

/**
 * @route POST /api/literature/search
 * @desc Search PubMed and other sources for literature related to a medical device
 */
router.post('/search', async (req, res) => {
  try {
    const { query, limit = 10, filters = {} } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Format filters for the PubMed API
    let filterString = '';
    if (filters.yearFrom) filterString += ` AND ${filters.yearFrom}[PDAT]`;
    if (filters.yearTo) filterString += `:${filters.yearTo}[PDAT]`;
    if (filters.journalType) filterString += ` AND ${filters.journalType}[PT]`;
    
    // Construct PubMed API URL
    const encodedQuery = encodeURIComponent(`${query}${filterString}`);
    const baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
    
    // First, search for IDs
    const searchUrl = `${baseUrl}/esearch.fcgi?db=pubmed&term=${encodedQuery}&retmax=${limit}&retmode=json`;
    const searchResponse = await axios.get(searchUrl);
    
    if (!searchResponse.data || !searchResponse.data.esearchresult || !searchResponse.data.esearchresult.idlist) {
      return res.json({ results: [] });
    }
    
    const ids = searchResponse.data.esearchresult.idlist;
    
    if (ids.length === 0) {
      return res.json({ results: [] });
    }
    
    // Then fetch details for those IDs
    const summaryUrl = `${baseUrl}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
    const summaryResponse = await axios.get(summaryUrl);
    
    if (!summaryResponse.data || !summaryResponse.data.result) {
      return res.json({ results: [] });
    }
    
    // Parse and format the results
    const results = ids.map(id => {
      const article = summaryResponse.data.result[id];
      if (!article) return null;
      
      return {
        id,
        title: article.title || '',
        authors: article.authors ? article.authors.map(author => `${author.name}`) : [],
        journal: article.fulljournalname || '',
        publicationDate: article.pubdate || '',
        abstract: article.abstract || '',
        doi: article.articleids ? article.articleids.find(id => id.idtype === 'doi')?.value : '',
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
      };
    }).filter(Boolean);
    
    res.json({ results });
  } catch (error) {
    console.error('Literature search error:', error);
    res.status(500).json({ error: 'An error occurred during literature search' });
  }
});

/**
 * @route POST /api/literature/summarize
 * @desc Summarize a scientific paper using GPT-4o
 */
router.post('/summarize', async (req, res) => {
  try {
    const { text, context } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text parameter is required' });
    }
    
    if (!openai) {
      return res.status(500).json({ error: 'OpenAI client not initialized' });
    }
    
    const prompt = `You are an expert medical writer specializing in regulatory documentation. 
    Summarize the following scientific literature in the context of ${context || 'a medical device clinical evaluation'}. 
    Focus on key findings, safety data, efficacy results, and any implications for device safety or performance. 
    Keep the summary concise, focused, and suitable for inclusion in a Clinical Evaluation Report:

    ${text}`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert medical and scientific writer specializing in regulatory documentation." },
        { role: "user", content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });
    
    const summary = response.choices[0].message.content;
    res.json({ summary });
  } catch (error) {
    console.error('Literature summarization error:', error);
    res.status(500).json({ error: 'An error occurred during literature summarization' });
  }
});

/**
 * @route POST /api/literature/generate-citations
 * @desc Generate formatted citations for a list of papers
 */
router.post('/generate-citations', async (req, res) => {
  try {
    const { papers, format = 'vancouverStyle' } = req.body;
    
    if (!papers || !Array.isArray(papers) || papers.length === 0) {
      return res.status(400).json({ error: 'Papers array is required' });
    }
    
    if (!openai) {
      return res.status(500).json({ error: 'OpenAI client not initialized' });
    }
    
    const formatInstructions = {
      vancouverStyle: 'Use Vancouver style citation format (commonly used in medical literature)',
      apa: 'Use APA style citation format',
      mla: 'Use MLA style citation format',
      harvard: 'Use Harvard style citation format',
    };
    
    const prompt = `Generate properly formatted citations for the following scientific papers.
    ${formatInstructions[format] || formatInstructions.vancouverStyle}
    
    Please format each citation correctly and return them as a numbered list:
    
    ${papers.map(paper => {
      return `- Title: ${paper.title || 'Unknown'}
      - Authors: ${paper.authors?.join(', ') || 'Unknown'}
      - Journal: ${paper.journal || 'Unknown'}
      - Publication Date: ${paper.publicationDate || 'Unknown'}
      - DOI: ${paper.doi || 'Unknown'}
      `;
    }).join('\n')}`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a citation formatting expert for scientific and medical literature." },
        { role: "user", content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.1,
    });
    
    const citations = response.choices[0].message.content;
    res.json({ citations });
  } catch (error) {
    console.error('Citation generation error:', error);
    res.status(500).json({ error: 'An error occurred during citation generation' });
  }
});

export default router;
