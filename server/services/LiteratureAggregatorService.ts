/**
 * Literature Aggregator Service
 * 
 * This service is responsible for fetching and aggregating literature data 
 * from multiple sources, including PubMed, FDA databases, and internal documents.
 * It provides unified query capabilities across all sources with advanced filters.
 */

import axios from 'axios';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';
import { createHash } from 'crypto';

// Load environment variables
dotenv.config();

// Initialize OpenAI client for embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Define pgvector operations 
// Will use dot product similarity for vector search
const pgvector = {
  extension: 'vector',
  similaritySearch: (embedding: number[], limit: number) => {
    return `
      SELECT 
        l.id, 
        l.title, 
        l.abstract, 
        l.authors, 
        l.journal, 
        l.publication_date,
        l.pmid, 
        l.doi, 
        l.source,
        l.relevance_score,
        le.embedding <-> $1 as similarity
      FROM 
        literature_entries l
      JOIN 
        literature_embeddings le ON l.id = le.literature_id
      WHERE 
        le.embedding_type = 'openai'
      ORDER BY 
        le.embedding <-> $1
      LIMIT $2;
    `;
  }
};

// Source types
enum LiteratureSource {
  PUBMED = 'pubmed',
  FDA = 'fda',
  INTERNAL = 'internal',
  EUDAMED = 'eudamed',
  PMCID = 'pmcid'
}

// Literature entry interface
interface LiteratureEntry {
  id?: number;
  title: string;
  abstract?: string;
  authors?: string;
  journal?: string;
  publication_date?: Date | string;
  pmid?: string;
  doi?: string;
  url?: string;
  source: string;
  relevance_score?: number;
  full_text?: string;
  metadata?: Record<string, any>;
  organization_id?: string;
  tenant_id?: string;
}

// Search filters interface
interface LiteratureSearchFilters {
  source?: string[];
  startDate?: string;
  endDate?: string;
  journal?: string[];
  author?: string[];
  relevanceThreshold?: number;
  includeFullText?: boolean;
  organizationId?: string;
  tenantId?: string;
  deviceType?: string;
  predicate?: boolean;
  regulatoryCategory?: string;
}

// Search response interface
interface LiteratureSearchResponse {
  entries: LiteratureEntry[];
  totalCount: number;
  sources: { [key: string]: number };
  query: string;
  filters: LiteratureSearchFilters;
  timestamp: Date;
}

/**
 * Main class for literature aggregation
 */
export class LiteratureAggregator {
  private apiKeys: {
    pubmed?: string;
    fda?: string;
    eudamed?: string;
  };

  constructor() {
    // Initialize API keys from environment variables
    this.apiKeys = {
      pubmed: process.env.PUBMED_API_KEY,
      fda: process.env.FDA_API_KEY,
      eudamed: process.env.EUDAMED_API_KEY
    };
  }

  /**
   * Search PubMed for articles
   */
  private async searchPubMed(query: string, filters: LiteratureSearchFilters = {}): Promise<LiteratureEntry[]> {
    try {
      // First, search for PMIDs
      const baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
      const searchUrl = `${baseUrl}/esearch.fcgi`;
      
      // Build date filter
      let dateFilter = '';
      if (filters.startDate) {
        dateFilter += `${filters.startDate}[PDAT]`;
        if (filters.endDate) {
          dateFilter += `:${filters.endDate}[PDAT]`;
        }
      } else if (filters.endDate) {
        dateFilter = `1900[PDAT]:${filters.endDate}[PDAT]`;
      }
      
      // Combine query with filters
      let fullQuery = query;
      if (dateFilter) {
        fullQuery = `(${fullQuery}) AND (${dateFilter})`;
      }
      if (filters.journal && filters.journal.length > 0) {
        const journalFilter = filters.journal.map(j => `"${j}"[Journal]`).join(' OR ');
        fullQuery = `(${fullQuery}) AND (${journalFilter})`;
      }
      if (filters.author && filters.author.length > 0) {
        const authorFilter = filters.author.map(a => `"${a}"[Author]`).join(' OR ');
        fullQuery = `(${fullQuery}) AND (${authorFilter})`;
      }
      
      // Add a device type filter if specified
      if (filters.deviceType) {
        fullQuery = `(${fullQuery}) AND ("${filters.deviceType}"[MeSH Terms] OR "${filters.deviceType}"[All Fields])`;
      }
      
      // Add predicate device filter if specified
      if (filters.predicate) {
        fullQuery = `(${fullQuery}) AND ("predicate device"[All Fields] OR "substantial equivalence"[All Fields])`;
      }
      
      // Add regulatory category filter if specified
      if (filters.regulatoryCategory) {
        fullQuery = `(${fullQuery}) AND ("${filters.regulatoryCategory}"[All Fields])`;
      }
      
      // Search parameters
      const searchParams = {
        db: 'pubmed',
        term: fullQuery,
        retmax: 100, // Maximum results to return
        retmode: 'json',
        sort: 'relevance',
        api_key: this.apiKeys.pubmed
      };
      
      const searchResponse = await axios.get(searchUrl, { params: searchParams });
      const pmids = searchResponse.data.esearchresult.idlist || [];
      
      if (pmids.length === 0) {
        return [];
      }
      
      // Fetch details for the PMIDs
      const fetchUrl = `${baseUrl}/efetch.fcgi`;
      const fetchParams = {
        db: 'pubmed',
        id: pmids.join(','),
        retmode: 'xml',
        rettype: 'abstract',
        api_key: this.apiKeys.pubmed
      };
      
      const fetchResponse = await axios.get(fetchUrl, { params: fetchParams });
      const xmlData = fetchResponse.data;
      
      // Parse XML data to extract article information
      // In a real implementation, use a proper XML parser
      const articles: LiteratureEntry[] = await this.parsePubMedXml(xmlData, pmids);
      
      return articles;
    } catch (error) {
      console.error('Error searching PubMed:', error);
      return [];
    }
  }

  /**
   * Parse PubMed XML response
   * Note: In a real implementation, use a proper XML parser
   */
  private async parsePubMedXml(xmlData: string, pmids: string[]): Promise<LiteratureEntry[]> {
    // Simple placeholder implementation - in reality, use an XML parser
    // For demonstration purposes, we'll create mock entries based on the PMIDs
    const entries: LiteratureEntry[] = pmids.map(pmid => ({
      title: `Article ${pmid} on Medical Devices`,
      abstract: `This is a mock abstract for article ${pmid} about medical devices and regulatory considerations.`,
      authors: 'Smith J, Johnson A, Lee R',
      journal: 'Journal of Medical Devices',
      publication_date: new Date().toISOString().split('T')[0],
      pmid,
      doi: `10.1234/med${pmid}`,
      source: LiteratureSource.PUBMED,
      relevance_score: Math.random() * 100
    }));
    
    return entries;
  }

  /**
   * Search FDA database for device-related literature
   */
  private async searchFDA(query: string, filters: LiteratureSearchFilters = {}): Promise<LiteratureEntry[]> {
    try {
      // FDA endpoints
      const fdaUrl = 'https://api.fda.gov/device/510k.json';
      
      // Build FDA query
      let fdaQuery = query.replace(/\s+/g, '+AND+');
      
      // Add filters
      if (filters.deviceType) {
        fdaQuery += `+AND+device_name:"${filters.deviceType}"`;
      }
      
      // Add date range if provided
      if (filters.startDate || filters.endDate) {
        const startDate = filters.startDate || '1900-01-01';
        const endDate = filters.endDate || new Date().toISOString().split('T')[0];
        fdaQuery += `+AND+decision_date:[${startDate}+TO+${endDate}]`;
      }
      
      // FDA query parameters
      const params = {
        search: fdaQuery,
        limit: 50,
        api_key: this.apiKeys.fda
      };
      
      const response = await axios.get(fdaUrl, { params });
      const results = response.data.results || [];
      
      // Transform FDA results to literature entries
      const entries: LiteratureEntry[] = results.map((result: any) => ({
        title: result.device_name || `510(k) Submission ${result.k_number}`,
        abstract: result.summary || `${result.device_name} 510(k) submission.`,
        authors: result.applicant || 'Unknown Applicant',
        journal: 'FDA 510(k) Database',
        publication_date: result.decision_date || result.date_received,
        pmid: null,
        doi: null,
        url: `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm?ID=${result.k_number}`,
        source: LiteratureSource.FDA,
        relevance_score: 90,
        metadata: {
          k_number: result.k_number,
          decision: result.decision,
          product_code: result.product_code,
          predicate_device: result.predicate_devices || []
        }
      }));
      
      return entries;
    } catch (error) {
      console.error('Error searching FDA database:', error);
      return [];
    }
  }

  /**
   * Search internal document database
   */
  private async searchInternal(query: string, filters: LiteratureSearchFilters = {}): Promise<LiteratureEntry[]> {
    try {
      // Check if internal database already has entries related to the query
      const client = await pool.connect();
      try {
        // Get embedding for the query
        const embedding = await this.getEmbedding(query);
        
        // Search for similar entries
        const searchResult = await client.query(
          pgvector.similaritySearch(embedding, 20),
          [embedding, 20]
        );
        
        // Apply filters
        let filteredResults = searchResult.rows;
        
        if (filters.startDate || filters.endDate) {
          const startDate = filters.startDate 
            ? new Date(filters.startDate) 
            : new Date('1900-01-01');
          const endDate = filters.endDate 
            ? new Date(filters.endDate) 
            : new Date();
          
          filteredResults = filteredResults.filter(row => {
            const pubDate = new Date(row.publication_date);
            return pubDate >= startDate && pubDate <= endDate;
          });
        }
        
        if (filters.journal && filters.journal.length > 0) {
          filteredResults = filteredResults.filter(row => 
            filters.journal!.some(j => row.journal && row.journal.includes(j))
          );
        }
        
        if (filters.author && filters.author.length > 0) {
          filteredResults = filteredResults.filter(row =>
            filters.author!.some(a => row.authors && row.authors.includes(a))
          );
        }
        
        // Map to standard format
        return filteredResults.map(row => ({
          id: row.id,
          title: row.title,
          abstract: row.abstract,
          authors: row.authors,
          journal: row.journal,
          publication_date: row.publication_date,
          pmid: row.pmid,
          doi: row.doi,
          source: row.source,
          relevance_score: 100 - row.similarity * 100
        }));
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error searching internal documents:', error);
      return [];
    }
  }

  /**
   * Generate OpenAI embedding for a text
   */
  private async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      // Return empty embedding array as fallback
      return new Array(1536).fill(0);
    }
  }

  /**
   * Store literature entry in the database
   */
  private async storeLiteratureEntry(entry: LiteratureEntry): Promise<number> {
    const client = await pool.connect();
    try {
      // Check if entry already exists by PMID or DOI
      let checkQuery = 'SELECT id FROM literature_entries WHERE 1=1';
      const checkParams = [];
      
      if (entry.pmid) {
        checkQuery += ' AND pmid = $1';
        checkParams.push(entry.pmid);
      } else if (entry.doi) {
        checkQuery += ' AND doi = $1';
        checkParams.push(entry.doi);
      } else {
        // Generate a content hash for deduplication
        const contentHash = createHash('sha256')
          .update(entry.title + (entry.abstract || ''))
          .digest('hex');
          
        checkQuery += ' AND title = $1 AND abstract = $2';
        checkParams.push(entry.title, entry.abstract || '');
      }
      
      const checkResult = await client.query(checkQuery, checkParams);
      
      if (checkResult.rowCount > 0) {
        // Entry already exists
        return checkResult.rows[0].id;
      }
      
      // Insert new entry
      const insertQuery = `
        INSERT INTO literature_entries (
          title, abstract, authors, journal, publication_date, 
          pmid, doi, url, source, relevance_score, 
          full_text, metadata, organization_id, tenant_id
        ) VALUES (
          $1, $2, $3, $4, $5, 
          $6, $7, $8, $9, $10, 
          $11, $12, $13, $14
        ) RETURNING id
      `;
      
      const insertParams = [
        entry.title,
        entry.abstract || null,
        entry.authors || null,
        entry.journal || null,
        entry.publication_date || null,
        entry.pmid || null,
        entry.doi || null,
        entry.url || null,
        entry.source,
        entry.relevance_score || 0,
        entry.full_text || null,
        entry.metadata ? JSON.stringify(entry.metadata) : null,
        entry.organization_id || null,
        entry.tenant_id || null
      ];
      
      const result = await client.query(insertQuery, insertParams);
      return result.rows[0].id;
    } finally {
      client.release();
    }
  }

  /**
   * Store embedding for a literature entry
   */
  private async storeEmbedding(literatureId: number, text: string): Promise<void> {
    try {
      const embedding = await this.getEmbedding(text);
      
      const client = await pool.connect();
      try {
        // Check if embedding already exists
        const checkQuery = `
          SELECT id FROM literature_embeddings 
          WHERE literature_id = $1 AND embedding_type = $2
        `;
        
        const checkResult = await client.query(checkQuery, [literatureId, 'openai']);
        
        if (checkResult.rowCount > 0) {
          // Update existing embedding
          const updateQuery = `
            UPDATE literature_embeddings 
            SET embedding = $1 
            WHERE literature_id = $2 AND embedding_type = $3
          `;
          
          await client.query(updateQuery, [embedding, literatureId, 'openai']);
        } else {
          // Insert new embedding
          const insertQuery = `
            INSERT INTO literature_embeddings (
              literature_id, embedding_type, embedding
            ) VALUES (
              $1, $2, $3
            )
          `;
          
          await client.query(insertQuery, [literatureId, 'openai', embedding]);
        }
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error storing embedding:', error);
    }
  }

  /**
   * Main search method that aggregates results from all sources
   */
  public async search(
    query: string, 
    filters: LiteratureSearchFilters = {}
  ): Promise<LiteratureSearchResponse> {
    // Determine which sources to search
    const sources = filters.source || Object.values(LiteratureSource);
    
    // Store search history
    await this.storeSearchQuery(query, filters);
    
    // Initialize results
    let allEntries: LiteratureEntry[] = [];
    const sourceCounts: Record<string, number> = {};
    
    // Run searches in parallel
    const searchPromises: Promise<LiteratureEntry[]>[] = [];
    
    if (sources.includes(LiteratureSource.PUBMED)) {
      searchPromises.push(this.searchPubMed(query, filters));
    }
    
    if (sources.includes(LiteratureSource.FDA)) {
      searchPromises.push(this.searchFDA(query, filters));
    }
    
    if (sources.includes(LiteratureSource.INTERNAL)) {
      searchPromises.push(this.searchInternal(query, filters));
    }
    
    // Wait for all searches to complete
    const results = await Promise.all(searchPromises);
    
    // Combine results and count by source
    results.forEach(entries => {
      allEntries = [...allEntries, ...entries];
      
      // Count by source
      entries.forEach(entry => {
        const source = entry.source;
        sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      });
    });
    
    // Store new entries in the database
    for (const entry of allEntries) {
      if (!entry.id) { // Only store entries that don't have an ID yet (new from external sources)
        const literatureId = await this.storeLiteratureEntry(entry);
        entry.id = literatureId;
        
        // Generate and store embedding
        const textForEmbedding = `${entry.title} ${entry.abstract || ''}`;
        await this.storeEmbedding(literatureId, textForEmbedding);
      }
    }
    
    // Sort by relevance
    allEntries.sort((a, b) => 
      (b.relevance_score || 0) - (a.relevance_score || 0)
    );
    
    return {
      entries: allEntries,
      totalCount: allEntries.length,
      sources: sourceCounts,
      query,
      filters,
      timestamp: new Date()
    };
  }

  /**
   * Store search query for analytics
   */
  private async storeSearchQuery(
    query: string, 
    filters: LiteratureSearchFilters
  ): Promise<void> {
    try {
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO semantic_search_history 
           (query, filters, user_id, organization_id, tenant_id) 
           VALUES ($1, $2, $3, $4, $5)`,
          [
            query,
            JSON.stringify(filters),
            null, // user_id will be filled in by a middleware
            filters.organizationId || null,
            filters.tenantId || null
          ]
        );
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error storing search query:', error);
    }
  }

  /**
   * Get literature entry by ID
   */
  public async getLiteratureById(id: number): Promise<LiteratureEntry | null> {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM literature_entries WHERE id = $1',
          [id]
        );
        
        if (result.rows.length === 0) {
          return null;
        }
        
        return result.rows[0];
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error getting literature by ID:', error);
      return null;
    }
  }

  /**
   * Add a citation to a document
   */
  public async addCitation(
    documentId: string,
    sectionId: string,
    literatureId: number,
    citationText: string,
    citationStyle: string = 'APA',
    organizationId?: string,
    tenantId?: string,
    userId?: string
  ): Promise<number | null> {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `INSERT INTO literature_citations
           (document_id, section_id, literature_id, citation_text, 
            citation_style, organization_id, tenant_id, user_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id`,
          [
            documentId,
            sectionId,
            literatureId,
            citationText,
            citationStyle,
            organizationId || null,
            tenantId || null,
            userId || null
          ]
        );
        
        return result.rows[0].id;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error adding citation:', error);
      return null;
    }
  }

  /**
   * Get citations for a document
   */
  public async getDocumentCitations(
    documentId: string
  ): Promise<any[]> {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT c.*, l.title, l.journal, l.authors, l.publication_date
           FROM literature_citations c
           JOIN literature_entries l ON c.literature_id = l.id
           WHERE c.document_id = $1
           ORDER BY c.inserted_at ASC`,
          [documentId]
        );
        
        return result.rows;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error getting document citations:', error);
      return [];
    }
  }
}