/**
 * Literature Aggregator Service
 * 
 * This service handles fetching and aggregating literature data from multiple sources,
 * including PubMed, ClinicalTrials.gov, and preprint servers.
 */

import axios from 'axios';
import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';
import { Database } from '../types/database';
import { pgvector } from 'pgvector/pg';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Set up database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Register pgvector with pg
pgvector.registerType(pool);

// Define interfaces
export interface LiteratureSearchParams {
  query: string;
  source: string; // 'pubmed', 'clinicaltrials', 'preprints'
  publicationTypes?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  semanticSearch?: boolean;
  page?: number;
  pageSize?: number;
  projectId: string;
}

export interface LiteratureResult {
  id: string;
  title: string;
  authors: string[];
  journal?: string;
  source: string;
  year: number;
  abstract?: string;
  url?: string;
  pmid?: string;
  nctId?: string;
  doi?: string;
  publicationType?: string[];
  relevanceScore?: number;
  summary?: string;
  insights?: {
    studyDesign?: string;
    sampleSize?: string;
    primaryEfficacy?: string;
    safetyConcerns?: string;
  };
  selected?: boolean;
  projectId: string;
}

export interface SearchResponse {
  results: LiteratureResult[];
  total: number;
  page: number;
  pageSize: number;
}

class LiteratureAggregatorService {
  /**
   * Search PubMed for articles matching the query
   * 
   * @param query Search query
   * @param filters Additional search filters
   * @returns Array of literature results
   */
  async searchPubMed(
    query: string, 
    filters: {
      publicationTypes?: string[];
      dateRange?: { start: string; end: string };
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<{ results: LiteratureResult[]; total: number }> {
    try {
      const baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
      
      // Build PubMed query string
      let pubmedQuery = query;
      
      // Add publication type filters
      if (filters.publicationTypes && filters.publicationTypes.length > 0) {
        const typeMap: Record<string, string> = {
          'clinical-trial': 'Clinical Trial[Publication Type]',
          'review': 'Review[Publication Type]',
          'meta-analysis': 'Meta-Analysis[Publication Type]'
        };
        
        const typeFilters = filters.publicationTypes
          .map(type => typeMap[type])
          .filter(Boolean);
        
        if (typeFilters.length > 0) {
          pubmedQuery += ` AND (${typeFilters.join(' OR ')})`;
        }
      }
      
      // Add date range filters
      if (filters.dateRange) {
        if (filters.dateRange.start) {
          pubmedQuery += ` AND ${filters.dateRange.start}[PDAT]`;
        }
        if (filters.dateRange.end) {
          pubmedQuery += `:${filters.dateRange.end}[PDAT]`;
        }
      }
      
      // Build pagination parameters
      const page = filters.page || 1;
      const pageSize = filters.pageSize || 10;
      const start = (page - 1) * pageSize;
      
      // Search for IDs first
      const searchResponse = await axios.get(`${baseUrl}/esearch.fcgi`, {
        params: {
          db: 'pubmed',
          term: pubmedQuery,
          retmode: 'json',
          retmax: pageSize,
          retstart: start,
          usehistory: 'y',
          api_key: process.env.PUBMED_API_KEY
        }
      });
      
      const data = searchResponse.data;
      const pmids = data.esearchresult.idlist;
      const total = parseInt(data.esearchresult.count, 10);
      
      if (pmids.length === 0) {
        return { results: [], total };
      }
      
      // Fetch detailed information for the IDs
      const summaryResponse = await axios.get(`${baseUrl}/esummary.fcgi`, {
        params: {
          db: 'pubmed',
          id: pmids.join(','),
          retmode: 'json',
          api_key: process.env.PUBMED_API_KEY
        }
      });
      
      const summaryData = summaryResponse.data;
      
      // Transform the response to our common format
      const results: LiteratureResult[] = pmids.map(pmid => {
        const article = summaryData.result[pmid];
        if (!article) return null;
        
        // Extract and process the publication date
        const pubDate = article.pubdate || '';
        const year = pubDate ? parseInt(pubDate.split(' ')[0], 10) : null;
        
        // Extract authors
        const authors = article.authors
          ? article.authors.map((author: any) => `${author.name}`)
          : [];
        
        return {
          id: `pubmed-${pmid}`,
          title: article.title || 'No title available',
          authors,
          journal: article.fulljournalname || article.source || 'Unknown Journal',
          source: 'PubMed',
          year: year || new Date().getFullYear(),
          abstract: article.abstract || '',
          url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
          pmid,
          publicationType: article.pubtype || [],
          projectId: '', // To be set by the caller
        };
      }).filter(Boolean) as LiteratureResult[];
      
      return { results, total };
    } catch (error) {
      console.error('Error searching PubMed:', error);
      throw new Error(`Failed to search PubMed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Search ClinicalTrials.gov for studies matching the query
   * 
   * @param query Search query
   * @param filters Additional search filters
   * @returns Array of literature results
   */
  async searchClinicalTrials(
    query: string, 
    filters: {
      dateRange?: { start: string; end: string };
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<{ results: LiteratureResult[]; total: number }> {
    try {
      // Build pagination parameters
      const page = filters.page || 1;
      const pageSize = filters.pageSize || 10;
      
      // Build ClinicalTrials.gov API query
      const params: Record<string, string> = {
        expr: query,
        fmt: 'json',
        min_rnk: ((page - 1) * pageSize + 1).toString(),
        max_rnk: (page * pageSize).toString(),
      };
      
      // Add date range if provided
      if (filters.dateRange) {
        if (filters.dateRange.start) {
          params.lup_s = `${filters.dateRange.start}/01/01`;
        }
        if (filters.dateRange.end) {
          params.lup_e = `${filters.dateRange.end}/12/31`;
        }
      }
      
      const response = await axios.get('https://clinicaltrials.gov/api/query/full_studies', { params });
      
      const data = response.data;
      const studies = data.FullStudiesResponse?.FullStudies || [];
      const total = data.FullStudiesResponse?.NStudiesFound || 0;
      
      // Transform the response to our common format
      const results: LiteratureResult[] = studies.map(study => {
        const protocol = study.Study.ProtocolSection;
        const identification = protocol.IdentificationModule;
        const statusModule = protocol.StatusModule;
        const sponsorCollaborators = protocol.SponsorCollaboratorsModule;
        
        // Get the start date year
        const startDate = statusModule?.StartDateStruct?.StartDate || '';
        const year = startDate ? parseInt(startDate.split(' ').pop() || '', 10) : null;
        
        // Build author list from sponsor and investigators
        const sponsors = sponsorCollaborators?.LeadSponsor?.OrganizationName || '';
        const investigators = protocol.ContactsLocationsModule?.OverallOfficials?.map(
          (official: any) => official.OverallOfficialName
        ) || [];
        
        const authors = [sponsors, ...investigators].filter(Boolean);
        
        return {
          id: `ct-${identification.NCTId}`,
          title: identification.BriefTitle || 'No title available',
          authors,
          journal: 'ClinicalTrials.gov',
          source: 'ClinicalTrials.gov',
          year: year || new Date().getFullYear(),
          abstract: protocol.DescriptionModule?.BriefSummary || '',
          url: `https://clinicaltrials.gov/study/${identification.NCTId}`,
          nctId: identification.NCTId,
          publicationType: ['Clinical Trial'],
          projectId: '', // To be set by the caller
        };
      });
      
      return { results, total };
    } catch (error) {
      console.error('Error searching ClinicalTrials.gov:', error);
      throw new Error(`Failed to search ClinicalTrials.gov: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Search bioRxiv and medRxiv for preprints matching the query
   * 
   * @param query Search query
   * @param filters Additional search filters
   * @returns Array of literature results
   */
  async searchPreprints(
    query: string, 
    filters: {
      dateRange?: { start: string; end: string };
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<{ results: LiteratureResult[]; total: number }> {
    try {
      // Build pagination parameters
      const page = filters.page || 1;
      const pageSize = filters.pageSize || 10;
      
      // Build bioRxiv/medRxiv API query parameters
      const params: Record<string, string> = {
        q: query,
        format: 'json',
        page: page.toString(),
        size: pageSize.toString(),
      };
      
      // Add date range if provided
      if (filters.dateRange) {
        if (filters.dateRange.start) {
          params.from_date = `${filters.dateRange.start}-01-01`;
        }
        if (filters.dateRange.end) {
          params.to_date = `${filters.dateRange.end}-12-31`;
        }
      }
      
      // Combined results from both bioRxiv and medRxiv
      const bioRxivResponse = await axios.get('https://api.biorxiv.org/search', { params });
      const medRxivResponse = await axios.get('https://api.medrxiv.org/search', { params });
      
      const bioRxivData = bioRxivResponse.data.results || [];
      const medRxivData = medRxivResponse.data.results || [];
      
      // Combine and deduplicate results
      const allPreprints = [...bioRxivData, ...medRxivData];
      const uniqueDOIs = new Set<string>();
      const uniquePreprints = allPreprints.filter(preprint => {
        if (!preprint.doi || uniqueDOIs.has(preprint.doi)) return false;
        uniqueDOIs.add(preprint.doi);
        return true;
      });
      
      // Limit to the requested page size
      const paginatedPreprints = uniquePreprints.slice(0, pageSize);
      
      // Transform to our common format
      const results: LiteratureResult[] = paginatedPreprints.map(preprint => {
        const source = preprint.server === 'biorxiv' ? 'bioRxiv' : 'medRxiv';
        
        return {
          id: `preprint-${preprint.doi.replace('/', '-')}`,
          title: preprint.title || 'No title available',
          authors: preprint.authors?.split(';').map((a: string) => a.trim()) || [],
          journal: source,
          source,
          year: preprint.date ? new Date(preprint.date).getFullYear() : new Date().getFullYear(),
          abstract: preprint.abstract || '',
          url: preprint.doi ? `https://doi.org/${preprint.doi}` : '',
          doi: preprint.doi,
          publicationType: ['Preprint'],
          projectId: '', // To be set by the caller
        };
      });
      
      // Calculate total (this is approximate since we're combining sources)
      const total = bioRxivResponse.data.total + medRxivResponse.data.total;
      
      return { results, total };
    } catch (error) {
      console.error('Error searching preprints:', error);
      throw new Error(`Failed to search preprints: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Generate embedding vector for a text using OpenAI API
   * 
   * @param text Text to generate embedding for
   * @returns Embedding vector
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        dimensions: 1536
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Store embedding vector for a literature item
   * 
   * @param id Literature item ID
   * @param projectId Project ID
   * @param embedding Embedding vector
   */
  async storeEmbedding(id: string, projectId: string, embedding: number[]): Promise<void> {
    try {
      // Check if embedding already exists
      const checkResult = await pool.query(
        'SELECT id FROM literature_embeddings WHERE id = $1',
        [id]
      );
      
      if (checkResult.rowCount > 0) {
        // Update existing embedding
        await pool.query(
          'UPDATE literature_embeddings SET vector = $1, updated_at = NOW() WHERE id = $2',
          [embedding, id]
        );
      } else {
        // Insert new embedding
        await pool.query(
          'INSERT INTO literature_embeddings (id, project_id, vector, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
          [id, projectId, embedding]
        );
      }
    } catch (error) {
      console.error('Error storing embedding:', error);
      throw new Error(`Failed to store embedding: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Perform semantic search using embeddings
   * 
   * @param query Search query
   * @param projectId Project ID
   * @param limit Maximum number of results to return
   * @returns Ranked literature IDs with relevance scores
   */
  async semanticSearch(query: string, projectId: string, limit: number = 50): Promise<Array<{ id: string; score: number }>> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Search literature embeddings
      const result = await pool.query(
        `SELECT id, 1 - (vector <=> $1) AS similarity 
         FROM literature_embeddings 
         WHERE project_id = $2 
         ORDER BY similarity DESC 
         LIMIT $3`,
        [queryEmbedding, projectId, limit]
      );
      
      return result.rows.map(row => ({
        id: row.id,
        score: row.similarity
      }));
    } catch (error) {
      console.error('Error performing semantic search:', error);
      throw new Error(`Failed to perform semantic search: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Get literature entries from database
   * 
   * @param ids Array of literature IDs
   * @param projectId Project ID
   * @returns Array of literature results
   */
  async getLiteratureEntries(ids: string[], projectId: string): Promise<LiteratureResult[]> {
    try {
      if (ids.length === 0) {
        return [];
      }
      
      const result = await pool.query(
        `SELECT * FROM literature_entries 
         WHERE id = ANY($1) AND project_id = $2`,
        [ids, projectId]
      );
      
      return result.rows.map(row => ({
        id: row.id,
        title: row.title,
        authors: row.authors,
        journal: row.journal,
        source: row.source,
        year: row.year,
        abstract: row.abstract,
        url: row.url,
        pmid: row.pmid,
        nctId: row.nct_id,
        doi: row.doi,
        publicationType: row.publication_type,
        summary: row.summary,
        insights: row.insights,
        selected: row.selected,
        projectId: row.project_id
      }));
    } catch (error) {
      console.error('Error getting literature entries:', error);
      throw new Error(`Failed to get literature entries: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Store literature entries in database
   * 
   * @param entries Array of literature results
   * @returns Array of stored literature IDs
   */
  async storeLiteratureEntries(entries: LiteratureResult[]): Promise<string[]> {
    try {
      if (entries.length === 0) {
        return [];
      }
      
      const storedIds: string[] = [];
      
      // Process each entry individually to handle conflicts
      for (const entry of entries) {
        // Check if entry already exists
        const checkResult = await pool.query(
          'SELECT id FROM literature_entries WHERE id = $1',
          [entry.id]
        );
        
        if (checkResult.rowCount > 0) {
          // Update existing entry
          await pool.query(
            `UPDATE literature_entries 
             SET title = $1, authors = $2, journal = $3, source = $4, year = $5,
                 abstract = $6, url = $7, pmid = $8, nct_id = $9, doi = $10,
                 publication_type = $11, updated_at = NOW()
             WHERE id = $12`,
            [
              entry.title, entry.authors, entry.journal, entry.source, entry.year,
              entry.abstract, entry.url, entry.pmid, entry.nctId, entry.doi,
              entry.publicationType, entry.id
            ]
          );
        } else {
          // Insert new entry
          await pool.query(
            `INSERT INTO literature_entries 
             (id, project_id, title, authors, journal, source, year, abstract, url, pmid, nct_id, doi, publication_type, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())`,
            [
              entry.id, entry.projectId, entry.title, entry.authors, entry.journal, entry.source, entry.year,
              entry.abstract, entry.url, entry.pmid, entry.nctId, entry.doi, entry.publicationType
            ]
          );
        }
        
        storedIds.push(entry.id);
        
        // Generate and store embedding if abstract is available
        if (entry.abstract) {
          try {
            const embedding = await this.generateEmbedding(entry.abstract);
            await this.storeEmbedding(entry.id, entry.projectId, embedding);
          } catch (embeddingError) {
            console.error(`Error generating embedding for ${entry.id}:`, embeddingError);
            // Continue with other entries even if embedding fails
          }
        }
      }
      
      return storedIds;
    } catch (error) {
      console.error('Error storing literature entries:', error);
      throw new Error(`Failed to store literature entries: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Search literature from multiple sources
   * 
   * @param params Search parameters
   * @returns Search response with results and pagination info
   */
  async searchLiterature(params: LiteratureSearchParams): Promise<SearchResponse> {
    try {
      const { query, source, publicationTypes, dateRange, semanticSearch, page = 1, pageSize = 10, projectId } = params;
      
      let results: LiteratureResult[] = [];
      let total = 0;
      
      // If semantic search is enabled and we have a query
      if (semanticSearch && query.trim()) {
        // Perform semantic search to get ranked IDs
        const semanticResults = await this.semanticSearch(query, projectId, pageSize * 2);
        
        // Get full entries for the IDs
        const semanticEntries = await this.getLiteratureEntries(
          semanticResults.map(r => r.id),
          projectId
        );
        
        // Add relevance scores to the entries
        results = semanticEntries.map(entry => {
          const match = semanticResults.find(r => r.id === entry.id);
          return {
            ...entry,
            relevanceScore: match ? match.score : 0
          };
        });
        
        // Sort by relevance score
        results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
        
        // Paginate results
        const startIndex = (page - 1) * pageSize;
        results = results.slice(startIndex, startIndex + pageSize);
        total = semanticResults.length;
      } else {
        // Regular keyword search
        let sourceResults: { results: LiteratureResult[]; total: number };
        
        switch (source) {
          case 'pubmed':
            sourceResults = await this.searchPubMed(query, {
              publicationTypes,
              dateRange,
              page,
              pageSize
            });
            break;
            
          case 'clinicaltrials':
            sourceResults = await this.searchClinicalTrials(query, {
              dateRange,
              page,
              pageSize
            });
            break;
            
          case 'preprints':
            sourceResults = await this.searchPreprints(query, {
              dateRange,
              page,
              pageSize
            });
            break;
            
          default:
            throw new Error(`Unsupported source: ${source}`);
        }
        
        // Add project ID to each result
        results = sourceResults.results.map(result => ({
          ...result,
          projectId
        }));
        
        total = sourceResults.total;
      }
      
      // Store the results in the database
      if (results.length > 0) {
        await this.storeLiteratureEntries(results);
      }
      
      return {
        results,
        total,
        page,
        pageSize
      };
    } catch (error) {
      console.error('Error searching literature:', error);
      throw new Error(`Failed to search literature: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export default new LiteratureAggregatorService();