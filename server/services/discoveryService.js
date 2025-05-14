/**
 * Unified Discovery Service for CER and 510(k) Modules
 * 
 * This service provides semantic search capabilities across different contexts:
 * - Literature search for scientific/medical papers (used by both CER and 510k modules)
 * - Predicate device search for similar medical devices (primarily used by 510k module)
 * 
 * The service uses OpenAI embeddings for vector representation and pgvector for similarity search.
 */

const axios = require('axios');
const { Configuration, OpenAIApi } = require('openai');
const { Pool } = require('pg');

// Initialize OpenAI client
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Initialize PostgreSQL client with pgvector extension
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

/**
 * Generate an embedding vector for the input text using OpenAI's API
 * 
 * @param {string} text - The text to generate an embedding for
 * @returns {Promise<Array<number>>} - The embedding vector
 */
async function getEmbedding(text) {
  try {
    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: text.trim(),
    });
    
    if (response.data && response.data.data && response.data.data[0] && response.data.data[0].embedding) {
      return response.data.data[0].embedding;
    }
    
    throw new Error('Invalid embedding response from OpenAI');
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error(`Failed to generate text embedding: ${error.message}`);
  }
}

/**
 * Perform vector similarity search against a database table
 * 
 * @param {Array<number>} embedding - The query embedding vector
 * @param {string} tableName - The database table to query against
 * @param {number} topK - Number of results to return
 * @param {number} threshold - Minimum similarity score threshold (0-1)
 * @returns {Promise<Array<Object>>} - Array of matching documents with similarity scores
 */
async function queryVectorIndex(embedding, tableName, topK = 5, threshold = 0.7) {
  try {
    // Use pgvector's <-> operator for cosine distance
    // Lower distance = higher similarity
    const query = `
      SELECT *, embedding <-> $1 AS distance
      FROM ${tableName}
      WHERE embedding <-> $1 < ${1 - threshold}
      ORDER BY embedding <-> $1
      LIMIT $2;
    `;
    
    const result = await pool.query(query, [embedding, topK]);
    return result.rows;
  } catch (error) {
    console.error(`Error querying vector index (${tableName}):`, error);
    throw new Error(`Vector search failed: ${error.message}`);
  }
}

/**
 * Search for relevant literature based on a query
 * 
 * @param {string} query - The search query
 * @param {Object} options - Search options
 * @param {string} options.module - The module context ('CER' or '510k')
 * @param {number} options.topK - Number of results to return
 * @param {number} options.threshold - Minimum similarity score threshold (0-1)
 * @returns {Promise<Array<Object>>} - Array of relevant literature with similarity scores
 */
async function searchLiterature(query, { module = 'CER', topK = 5, threshold = 0.7 } = {}) {
  try {
    const embedding = await getEmbedding(query);
    let results = await queryVectorIndex(embedding, 'literature_vectors', topK, threshold);
    
    // Format results based on module context
    if (module === 'CER') {
      return results.map(r => ({
        id: r.id,
        title: r.title,
        authors: r.authors || [],
        journal: r.journal || '',
        year: r.year || '',
        abstract: r.abstract || r.snippet || '',
        keywords: r.keywords || [],
        doi: r.doi,
        url: r.url,
        peerReviewed: r.peer_reviewed || true,
        fullTextAvailable: r.full_text_available || false,
        score: parseFloat((1 - r.distance).toFixed(3)),  // Convert distance to similarity score
        source: r.source || 'database'
      }));
    } else if (module === '510k') {
      // 510(k) may need different formatting for literature
      return results.map(r => ({
        id: r.id,
        title: r.title,
        source: r.journal || r.source || '',
        year: r.year || '',
        relevance: parseFloat((1 - r.distance).toFixed(3)),
        snippet: r.abstract || r.snippet || '',
        url: r.url || '',
        authors: r.authors || []
      }));
    }
    
    // Default formatting (if module is not specified)
    return results.map(r => ({
      ...r,
      score: parseFloat((1 - r.distance).toFixed(3))
    }));
  } catch (error) {
    console.error('Error searching literature:', error);
    throw new Error(`Literature search failed: ${error.message}`);
  }
}

/**
 * Search for predicate/similar devices based on a device description
 * 
 * @param {string} deviceDescription - The device description
 * @param {Object} options - Search options
 * @param {string} options.module - The module context ('CER' or '510k')
 * @param {number} options.topK - Number of results to return
 * @param {number} options.threshold - Minimum similarity score threshold (0-1)
 * @returns {Promise<Array<Object>>} - Array of similar devices with similarity scores
 */
async function findPredicates(deviceDescription, { module = '510k', topK = 5, threshold = 0.75 } = {}) {
  try {
    const embedding = await getEmbedding(deviceDescription);
    let devices = await queryVectorIndex(embedding, 'device_vectors', topK, threshold);
    
    // Format results based on module context
    if (module === '510k') {
      return devices.map(d => ({
        k_number: d.k_number,
        device_name: d.device_name,
        manufacturer: d.manufacturer || '',
        decision_date: d.decision_date || '',
        product_code: d.product_code || '',
        score: parseFloat((1 - d.distance).toFixed(3)),
        device_class: d.device_class || '',
        regulation_number: d.regulation_number || ''
      }));
    } else if (module === 'CER') {
      // CER might use "equivalent device" concept
      return devices.map(d => ({
        name: d.device_name,
        manufacturer: d.manufacturer || '',
        type: d.device_type || 'Predicate Device',
        similarity: parseFloat((1 - d.distance).toFixed(3)),
        regulatoryId: d.k_number || d.regulatory_id || '',
        description: d.description || ''
      }));
    }
    
    // Default formatting
    return devices.map(d => ({
      ...d,
      similarity: parseFloat((1 - d.distance).toFixed(3))
    }));
  } catch (error) {
    console.error('Error finding predicate devices:', error);
    throw new Error(`Predicate device search failed: ${error.message}`);
  }
}

/**
 * Search for similar content across both literature and devices
 * (For general semantic search functionality)
 * 
 * @param {string} query - The search query
 * @param {Object} options - Search options
 * @param {string} options.target - What to search for ('literature', 'device', or 'both')
 * @param {string} options.module - The module context ('CER' or '510k')
 * @param {number} options.topK - Number of results to return for each target
 * @returns {Promise<Object>} - Object containing search results for each target
 */
async function semanticSearch(query, { target = 'both', module = 'CER', topK = 5 } = {}) {
  try {
    const results = {};
    
    // Perform literature search if requested
    if (target === 'both' || target === 'literature') {
      results.literature = await searchLiterature(query, { module, topK });
    }
    
    // Perform device search if requested
    if (target === 'both' || target === 'device') {
      results.devices = await findPredicates(query, { module, topK });
    }
    
    return results;
  } catch (error) {
    console.error('Error performing semantic search:', error);
    throw new Error(`Semantic search failed: ${error.message}`);
  }
}

// External API integration helpers for literature enrichment
// This allows us to fetch additional information from external sources when needed

/**
 * Fetch additional details for a PubMed article by PMID
 * 
 * @param {string} pmid - PubMed ID
 * @returns {Promise<Object>} - Enhanced article data
 */
async function fetchPubMedDetails(pmid) {
  try {
    const apiKey = process.env.PUBMED_API_KEY;
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmid}&retmode=json${apiKey ? `&api_key=${apiKey}` : ''}`;
    
    const response = await axios.get(url);
    const data = response.data;
    
    if (data.result && data.result[pmid]) {
      const article = data.result[pmid];
      return {
        id: pmid,
        title: article.title,
        authors: article.authors ? article.authors.map(a => `${a.name}`) : [],
        journal: article.fulljournalname || article.source,
        year: article.pubdate ? article.pubdate.substring(0, 4) : '',
        abstract: article.abstract || '',
        doi: article.elocationid || '',
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        source: 'PubMed'
      };
    }
    
    throw new Error('Invalid response from PubMed API');
  } catch (error) {
    console.error(`Error fetching PubMed details for ${pmid}:`, error);
    return null; // Return null to allow the process to continue
  }
}

/**
 * Fetch additional details for an IEEE article by article number
 * 
 * @param {string} articleId - IEEE article ID
 * @returns {Promise<Object>} - Enhanced article data
 */
async function fetchIEEEDetails(articleId) {
  try {
    const apiKey = process.env.IEEE_API_KEY;
    if (!apiKey) {
      throw new Error('IEEE API key not configured');
    }
    
    const url = `https://ieeexploreapi.ieee.org/api/v1/search/articles?article_number=${articleId}&apikey=${apiKey}`;
    
    const response = await axios.get(url);
    const data = response.data;
    
    if (data.articles && data.articles.length > 0) {
      const article = data.articles[0];
      return {
        id: articleId,
        title: article.title,
        authors: article.authors ? article.authors.map(a => a.full_name) : [],
        journal: article.publication_title,
        year: article.publication_year,
        abstract: article.abstract || '',
        doi: article.doi,
        url: `https://ieeexplore.ieee.org/document/${articleId}`,
        source: 'IEEE'
      };
    }
    
    throw new Error('Invalid response from IEEE API');
  } catch (error) {
    console.error(`Error fetching IEEE details for ${articleId}:`, error);
    return null; // Return null to allow the process to continue
  }
}

/**
 * Enrich search results with additional data from external sources
 * 
 * @param {Array<Object>} results - The search results to enrich
 * @returns {Promise<Array<Object>>} - Enriched search results
 */
async function enrichLiteratureResults(results) {
  const enrichedResults = await Promise.all(
    results.map(async (result) => {
      try {
        // Skip enrichment if this is a user uploaded document or already complete
        if (result.isUpload || (result.abstract && result.authors && result.authors.length > 0)) {
          return result;
        }
        
        // Check source and fetch additional data if needed
        if (result.source === 'PubMed' && result.id) {
          const enrichedData = await fetchPubMedDetails(result.id);
          return enrichedData ? { ...result, ...enrichedData } : result;
        } else if (result.source === 'IEEE' && result.id) {
          const enrichedData = await fetchIEEEDetails(result.id);
          return enrichedData ? { ...result, ...enrichedData } : result;
        }
        
        return result;
      } catch (error) {
        console.error(`Error enriching result ${result.id}:`, error);
        return result; // Return original result if enrichment fails
      }
    })
  );
  
  return enrichedResults;
}

module.exports = {
  searchLiterature,
  findPredicates,
  semanticSearch,
  enrichLiteratureResults,
  getEmbedding // Exported for potential direct use
};