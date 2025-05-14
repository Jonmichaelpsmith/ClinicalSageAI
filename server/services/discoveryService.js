/**
 * Discovery Service
 * 
 * Provides unified discovery capabilities for literature search and predicate device search
 * across CER and 510(k) modules using vector search with OpenAI-powered fallbacks.
 */

import OpenAI from 'openai';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Setup IEEE API connection
const IEEE_API_KEY = process.env.IEEE_API_KEY;

// Utility functions
async function vectorizeQuery(text) {
  try {
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return embedding.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate text embedding for search');
  }
}

async function performVectorSearch(embedding, type = 'literature', limit = 20) {
  try {
    const table = type === 'literature' ? 'literature_vectors' : 'predicate_devices';
    const query = `
      SELECT id, title, authors, publication_date, journal, similarity(embedding, $1) as similarity
      FROM ${table}
      ORDER BY embedding <-> $1
      LIMIT $2;
    `;
    
    const result = await pool.query(query, [embedding, limit]);
    return result.rows;
  } catch (error) {
    console.error(`Error performing vector search for ${type}:`, error);
    throw new Error(`Failed to perform ${type} vector search`);
  }
}

async function searchIEEE(query, filters = {}) {
  if (!IEEE_API_KEY) {
    throw new Error('IEEE API key not configured');
  }
  
  try {
    const baseUrl = 'https://ieeexploreapi.ieee.org/api/v1/search/articles';
    
    // Build filter parameters
    const params = new URLSearchParams({
      apikey: IEEE_API_KEY,
      format: 'json',
      max_records: 25,
      start_record: 1,
      sort_order: 'desc',
      sort_field: 'article_number',
      querytext: query,
    });
    
    // Add optional filters
    if (filters.yearStart && filters.yearEnd) {
      params.append('start_year', filters.yearStart);
      params.append('end_year', filters.yearEnd);
    }
    
    if (filters.contentType) {
      params.append('content_type', filters.contentType);
    }
    
    const response = await fetch(`${baseUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`IEEE API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error('Error searching IEEE:', error);
    return [];
  }
}

async function searchPubMed(query, filters = {}) {
  try {
    // PubMed API endpoints
    const searchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
    const fetchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi';
    
    // Build base parameters
    const params = new URLSearchParams({
      db: 'pubmed',
      term: query,
      retmode: 'json',
      retmax: 20,
      api_key: process.env.PUBMED_API_KEY || '',
    });
    
    // Add date filters if provided
    if (filters.yearStart && filters.yearEnd) {
      params.append('mindate', filters.yearStart);
      params.append('maxdate', filters.yearEnd);
      params.append('datetype', 'pdat');
    }
    
    // Step 1: Search for PMIDs
    const searchResponse = await fetch(`${searchUrl}?${params.toString()}`);
    const searchData = await searchResponse.json();
    const pmids = searchData.esearchresult?.idlist || [];
    
    if (pmids.length === 0) {
      return [];
    }
    
    // Step 2: Fetch article details for these PMIDs
    const fetchParams = new URLSearchParams({
      db: 'pubmed',
      id: pmids.join(','),
      retmode: 'xml',
      api_key: process.env.PUBMED_API_KEY || '',
    });
    
    const fetchResponse = await fetch(`${fetchUrl}?${fetchParams.toString()}`);
    const articleXml = await fetchResponse.text();
    
    // Basic XML parsing to extract article information
    // In a production environment, use a proper XML parser
    const articles = [];
    const articleMatches = articleXml.match(/<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g) || [];
    
    for (const articleXml of articleMatches) {
      // Extract basic information
      const pmid = (articleXml.match(/<PMID[^>]*>(.*?)<\/PMID>/) || [])[1];
      const title = (articleXml.match(/<ArticleTitle>(.*?)<\/ArticleTitle>/) || [])[1];
      const journal = (articleXml.match(/<Title>(.*?)<\/Title>/) || [])[1];
      const year = (articleXml.match(/<Year>(.*?)<\/Year>/) || [])[1];
      const month = (articleXml.match(/<Month>(.*?)<\/Month>/) || [])[1];
      const day = (articleXml.match(/<Day>(.*?)<\/Day>/) || [])[1];
      
      // Extract authors
      const authorMatches = articleXml.match(/<Author[\s\S]*?<\/Author>/g) || [];
      const authors = authorMatches.map(author => {
        const lastName = (author.match(/<LastName>(.*?)<\/LastName>/) || [])[1] || '';
        const initials = (author.match(/<Initials>(.*?)<\/Initials>/) || [])[1] || '';
        return `${lastName} ${initials}`.trim();
      }).join(', ');
      
      // Create date string
      let date = '';
      if (year) {
        date = year;
        if (month) {
          date = `${date}-${month.padStart(2, '0')}`;
          if (day) {
            date = `${date}-${day.padStart(2, '0')}`;
          }
        }
      }
      
      articles.push({
        id: pmid,
        pmid,
        title: title || 'Unknown Title',
        authors: authors || 'Unknown Authors',
        journal: journal || 'Unknown Journal',
        publication_date: date || 'Unknown Date',
        source: 'PubMed'
      });
    }
    
    return articles;
  } catch (error) {
    console.error('Error searching PubMed:', error);
    return [];
  }
}

async function searchFDA510K(query, filters = {}) {
  try {
    const baseUrl = 'https://api.fda.gov/device/510k.json';
    
    // Build query parameters
    const params = new URLSearchParams({
      search: `device_name:"${query}" OR product_code:"${query}"`,
      limit: 20,
    });
    
    // Add any applicable filters
    if (filters.yearStart && filters.yearEnd) {
      params.set(
        'search', 
        `${params.get('search')} AND decision_date:[${filters.yearStart}-01-01 TO ${filters.yearEnd}-12-31]`
      );
    }
    
    const response = await fetch(`${baseUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`FDA API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    const results = data.results || [];
    
    return results.map(item => ({
      id: item.k_number,
      title: item.device_name,
      manufacturer: item.applicant,
      clearance_date: item.decision_date,
      product_code: item.product_code,
      source: 'FDA',
      similarity: 0.9, // Default high similarity for exact matches
      type: 'predicate',
    }));
  } catch (error) {
    console.error('Error searching FDA 510(k) database:', error);
    return [];
  }
}

async function fallbackPredicateSearch(query) {
  try {
    // Use OpenAI to handle cases where structured data is unavailable
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",  // Use the latest model for best results
      messages: [
        {
          role: "system",
          content: "You are a medical device regulatory expert. Based on the query, provide information about relevant predicate devices that might exist. Format your response as JSON with an array of objects containing: id, title, manufacturer, clearance_date, product_code, and similarity (0-1)."
        },
        {
          role: "user",
          content: `Find predicate devices similar to: ${query}`
        }
      ],
      response_format: { type: "json_object" },
    });
    
    const result = JSON.parse(completion.choices[0].message.content);
    
    if (Array.isArray(result.devices)) {
      return result.devices.map(device => ({
        ...device,
        source: 'AI-Generated',
        type: 'predicate',
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error in AI fallback search:', error);
    return [];
  }
}

// Main service functions
const discoveryService = {
  /**
   * Unified literature search function
   * Works for both CER and 510(k) contexts
   */
  async searchLiterature(query, filters = {}, context = 'cer') {
    try {
      console.log(`Searching literature for: "${query}" with context: ${context}`);
      
      // First try vector search if available
      let results = [];
      try {
        const embedding = await vectorizeQuery(query);
        results = await performVectorSearch(embedding, 'literature');
      } catch (error) {
        console.warn('Vector search failed, falling back to API searches:', error.message);
      }
      
      // If vector search returned insufficient results, or failed, try IEEE
      if (results.length < 10) {
        try {
          const ieeeResults = await searchIEEE(query, filters);
          if (ieeeResults.length > 0) {
            // Transform IEEE results to match our format
            const transformedResults = ieeeResults.map(article => ({
              id: article.article_number,
              title: article.title,
              authors: article.authors?.authors?.map(a => a.full_name).join(', ') || 'Unknown',
              publication_date: article.publication_date || 'Unknown',
              journal: article.publisher || 'IEEE',
              source: 'IEEE',
              url: article.html_url,
              similarity: 0.85, // Default similarity for API results
            }));
            
            results = [...results, ...transformedResults];
          }
        } catch (error) {
          console.warn('IEEE search failed:', error.message);
        }
      }
      
      // Also try PubMed regardless
      try {
        const pubmedResults = await searchPubMed(query, filters);
        if (pubmedResults.length > 0) {
          results = [...results, ...pubmedResults];
        }
      } catch (error) {
        console.warn('PubMed search failed:', error.message);
      }
      
      // If we still have no results, use an AI fallback
      if (results.length === 0) {
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: "You are a medical literature expert. Based on the query, provide information about relevant medical literature that might exist. Format your response as JSON with an array of objects containing: id, title, authors, publication_date, journal, and similarity (0-1)."
              },
              {
                role: "user",
                content: `Find medical literature related to: ${query}`
              }
            ],
            response_format: { type: "json_object" },
          });
          
          const aiResult = JSON.parse(completion.choices[0].message.content);
          
          if (Array.isArray(aiResult.articles)) {
            results = aiResult.articles.map(article => ({
              ...article,
              source: 'AI-Generated',
              type: 'literature',
            }));
          }
        } catch (error) {
          console.error('AI fallback search failed:', error);
        }
      }
      
      // Apply filters
      let filteredResults = results;
      
      if (filters.yearStart && filters.yearEnd) {
        filteredResults = filteredResults.filter(article => {
          const year = parseInt(article.publication_date?.substring(0, 4));
          return !isNaN(year) && year >= filters.yearStart && year <= filters.yearEnd;
        });
      }
      
      if (filters.peerReviewedOnly) {
        filteredResults = filteredResults.filter(article => 
          article.source !== 'AI-Generated' && article.source !== 'ArXiv'
        );
      }
      
      // Sort by similarity or date
      if (filters.sortBy === 'date') {
        filteredResults.sort((a, b) => {
          return new Date(b.publication_date || '1900-01-01') - new Date(a.publication_date || '1900-01-01');
        });
      } else {
        // Default sort by similarity/relevance
        filteredResults.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
      }
      
      // Add a flag based on context
      const formattedResults = filteredResults.map(item => ({
        ...item,
        context: context,
        type: 'literature',
      }));
      
      return formattedResults;
    } catch (error) {
      console.error('Error in searchLiterature:', error);
      throw new Error(`Literature search failed: ${error.message}`);
    }
  },
  
  /**
   * Search for predicate devices
   * Primarily used in 510(k) context but available to both
   */
  async searchPredicateDevices(query, filters = {}) {
    try {
      console.log(`Searching predicate devices for: "${query}"`);
      
      // First try vector search if available
      let results = [];
      try {
        const embedding = await vectorizeQuery(query);
        results = await performVectorSearch(embedding, 'predicates');
      } catch (error) {
        console.warn('Vector search failed for predicates, falling back to API:', error.message);
      }
      
      // Try FDA 510(k) database search
      try {
        const fdaResults = await searchFDA510K(query, filters);
        if (fdaResults.length > 0) {
          results = [...results, ...fdaResults];
        }
      } catch (error) {
        console.warn('FDA 510(k) search failed:', error.message);
      }
      
      // If we still have no results, use AI fallback
      if (results.length === 0) {
        try {
          const aiResults = await fallbackPredicateSearch(query);
          if (aiResults.length > 0) {
            results = aiResults;
          }
        } catch (error) {
          console.error('AI fallback predicate search failed:', error);
        }
      }
      
      // Apply filters
      let filteredResults = results;
      
      if (filters.yearStart && filters.yearEnd) {
        filteredResults = filteredResults.filter(device => {
          const year = parseInt(device.clearance_date?.substring(0, 4));
          return !isNaN(year) && year >= filters.yearStart && year <= filters.yearEnd;
        });
      }
      
      // Sort by similarity (relevance)
      filteredResults.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
      
      return filteredResults;
    } catch (error) {
      console.error('Error in searchPredicateDevices:', error);
      throw new Error(`Predicate device search failed: ${error.message}`);
    }
  },
  
  /**
   * Process uploaded literature file
   * Extracts text, generates embeddings, and stores in database
   */
  async processLiteratureFile(fileBuffer, filename) {
    try {
      console.log(`Processing literature file: ${filename}`);
      
      // Extract text from PDF
      let extractedText = "Error extracting text";
      
      try {
        // Use OpenAI to extract structured information from PDF
        const base64 = fileBuffer.toString('base64');
        
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a medical literature extraction expert. Extract key information from this PDF into a structured format including title, authors, publication date, journal, abstract, and key findings. Format as JSON."
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Extract key information from this medical literature PDF"
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:application/pdf;base64,${base64}`
                  }
                }
              ]
            }
          ],
          response_format: { type: "json_object" },
        });
        
        const extractedData = JSON.parse(completion.choices[0].message.content);
        extractedText = JSON.stringify(extractedData);
        
        // Generate embedding
        const embedding = await vectorizeQuery(
          `${extractedData.title} ${extractedData.abstract || ''}`
        );
        
        // Store in database
        const query = `
          INSERT INTO literature_vectors (
            title, authors, publication_date, journal, abstract, full_text, filename, embedding
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id;
        `;
        
        const values = [
          extractedData.title || 'Unknown Title',
          extractedData.authors || 'Unknown Authors',
          extractedData.publication_date || new Date().toISOString().split('T')[0],
          extractedData.journal || 'Unknown Journal',
          extractedData.abstract || '',
          extractedText,
          filename,
          embedding
        ];
        
        const result = await pool.query(query, values);
        
        return {
          success: true,
          id: result.rows[0].id,
          metadata: extractedData
        };
      } catch (error) {
        console.error('Error processing literature file:', error);
        throw new Error(`Failed to process literature file: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in processLiteratureFile:', error);
      throw new Error(`Literature file processing failed: ${error.message}`);
    }
  },
  
  /**
   * Generate literature review from selected articles
   */
  async generateLiteratureReview(selectedArticles, deviceDescription, context = 'cer') {
    try {
      console.log(`Generating literature review for ${selectedArticles.length} articles in ${context} context`);
      
      const articleDetails = selectedArticles.map((article, index) => 
        `Article ${index + 1}: "${article.title}" by ${article.authors} (${article.publication_date || 'unknown date'})`
      ).join('\n');
      
      // Use different prompts based on context
      let systemPrompt = '';
      
      if (context === '510k') {
        systemPrompt = `You are a medical device regulatory expert specializing in 510(k) submissions. Your task is to create a comprehensive literature review section that focuses on demonstrating substantial equivalence to predicate devices and satisfying FDA requirements. The review should emphasize safety, effectiveness, and technological characteristics compared to predicates.`;
      } else { // Default CER context
        systemPrompt = `You are a medical device regulatory expert specializing in Clinical Evaluation Reports (CERs) under EU MDR. Your task is to create a comprehensive literature review section that establishes the current state of knowledge about the device's safety and performance compared to alternatives. The review should emphasize clinical data, post-market experience, and benefit-risk determinations.`;
      }
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Generate a comprehensive literature review for the following medical device:\n\n${deviceDescription}\n\nBased on these selected articles:\n${articleDetails}\n\nThe review should be well-structured with sections including Introduction, Methods, Results, Analysis, and Conclusion. Include appropriate citations in IEEE format.`
          }
        ],
      });
      
      const review = completion.choices[0].message.content;
      
      // Store the generated review
      const query = `
        INSERT INTO literature_reviews (
          device_description, context, articles_count, content, created_at
        ) VALUES ($1, $2, $3, $4, NOW())
        RETURNING id;
      `;
      
      const values = [
        deviceDescription,
        context,
        selectedArticles.length,
        review
      ];
      
      const result = await pool.query(query, values);
      
      return {
        success: true,
        id: result.rows[0].id,
        review: review,
        articleCount: selectedArticles.length
      };
    } catch (error) {
      console.error('Error in generateLiteratureReview:', error);
      throw new Error(`Literature review generation failed: ${error.message}`);
    }
  },
  
  /**
   * Generate a predicate device comparison report
   */
  async generatePredicateComparison(selectedPredicates, deviceDescription) {
    try {
      console.log(`Generating predicate comparison for ${selectedPredicates.length} devices`);
      
      const predicateDetails = selectedPredicates.map((device, index) => 
        `Predicate ${index + 1}: "${device.title}" by ${device.manufacturer} (${device.clearance_date || 'unknown date'})`
      ).join('\n');
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a medical device regulatory expert specializing in 510(k) submissions. Your task is to create a comprehensive predicate device comparison section that demonstrates substantial equivalence according to FDA requirements. Focus on technological characteristics, performance, safety, and effectiveness.`
          },
          {
            role: "user",
            content: `Generate a detailed predicate device comparison for the following medical device:\n\n${deviceDescription}\n\nBased on these selected predicate devices:\n${predicateDetails}\n\nThe comparison should include a clear tabular format showing similarities and differences across key characteristics, followed by a detailed analysis of substantial equivalence.`
          }
        ],
      });
      
      const comparison = completion.choices[0].message.content;
      
      // Store the generated comparison
      const query = `
        INSERT INTO predicate_comparisons (
          device_description, predicates_count, content, created_at
        ) VALUES ($1, $2, $3, NOW())
        RETURNING id;
      `;
      
      const values = [
        deviceDescription,
        selectedPredicates.length,
        comparison
      ];
      
      const result = await pool.query(query, values);
      
      return {
        success: true,
        id: result.rows[0].id,
        comparison: comparison,
        predicateCount: selectedPredicates.length
      };
    } catch (error) {
      console.error('Error in generatePredicateComparison:', error);
      throw new Error(`Predicate comparison generation failed: ${error.message}`);
    }
  },
  
  /**
   * Get all saved literature reviews
   */
  async getSavedReviews() {
    try {
      const query = `
        SELECT id, device_description, context, articles_count, 
               created_at, LEFT(content, 200) as preview
        FROM literature_reviews
        ORDER BY created_at DESC;
      `;
      
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error in getSavedReviews:', error);
      throw new Error(`Failed to retrieve saved reviews: ${error.message}`);
    }
  },
  
  /**
   * Get a specific saved review by ID
   */
  async getReviewById(id) {
    try {
      const query = `
        SELECT * FROM literature_reviews WHERE id = $1;
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        throw new Error('Review not found');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error in getReviewById for ID ${id}:`, error);
      throw new Error(`Failed to retrieve review: ${error.message}`);
    }
  },
  
  /**
   * Create SQL tables if they don't exist
   */
  async ensureTablesExist() {
    try {
      // Create literature vectors table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS literature_vectors (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          authors TEXT,
          publication_date DATE,
          journal TEXT,
          abstract TEXT,
          full_text TEXT,
          filename TEXT,
          embedding VECTOR(1536),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Create predicate devices table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS predicate_devices (
          id SERIAL PRIMARY KEY,
          k_number TEXT,
          device_name TEXT NOT NULL,
          manufacturer TEXT,
          clearance_date DATE,
          product_code TEXT,
          device_description TEXT,
          embedding VECTOR(1536),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Create literature reviews table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS literature_reviews (
          id SERIAL PRIMARY KEY,
          device_description TEXT NOT NULL,
          context TEXT DEFAULT 'cer',
          articles_count INTEGER,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Create predicate comparisons table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS predicate_comparisons (
          id SERIAL PRIMARY KEY,
          device_description TEXT NOT NULL,
          predicates_count INTEGER,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('All required tables exist or were created');
      return true;
    } catch (error) {
      console.error('Error ensuring tables exist:', error);
      throw new Error(`Failed to create required database tables: ${error.message}`);
    }
  },
};

// Export the service
export default discoveryService;