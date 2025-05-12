/**
 * Literature Aggregator Service
 * 
 * This service handles the aggregation of literature from multiple sources,
 * including PubMed, FDA databases, and clinical trial registries.
 * It manages search, fetching, and persistence of literature data.
 */

import { Pool } from 'pg';
import OpenAI from 'openai';

interface LiteratureSearchParams {
  query: string;
  sources?: string[];
  startDate?: string;
  endDate?: string;
  limit?: number;
  includeFullText?: boolean;
  tenantId: number;
  organizationId: number;
  userId?: number;
  useSemanticSearch?: boolean;
  filters?: Record<string, any>;
}

interface LiteratureEntry {
  id?: number;
  tenant_id: number;
  organization_id: number;
  source_id: number;
  external_id: string;
  title: string;
  authors?: string[];
  publication_date?: Date;
  journal?: string;
  abstract?: string;
  full_text?: string;
  doi?: string;
  pmid?: string;
  url?: string;
  citation_count?: number;
  publication_type?: string;
  keywords?: string[];
  mesh_terms?: string[];
  embedding?: number[];
  relevance_score?: number;
  fulltext_available?: boolean;
  pdf_path?: string;
}

interface LiteratureSource {
  id: number;
  source_name: string;
  source_type: string;
  api_endpoint?: string;
  requires_auth: boolean;
  enabled: boolean;
  priority: number;
}

interface LiteratureSearchResult {
  entries: LiteratureEntry[];
  total: number;
  search_id?: number;
  execution_time_ms?: number;
  sources_queried?: string[];
  suggestion?: string;
}

interface Citation {
  id: number;
  literature_id: number;
  document_id: number;
  document_type: string;
  section_id: string;
  section_name: string;
  citation_text: string;
  created_at: Date;
  tenant_id: number;
  organization_id: number;
}

export class LiteratureAggregatorService {
  private pool: Pool;
  private openai: OpenAI | null = null;
  private pubmedKey: string | null = null;
  private sourceCache: Map<number, LiteratureSource> = new Map();
  private sourceNameToIdMap: Map<string, number> = new Map();

  constructor(pool: Pool) {
    this.pool = pool;
    
    // Initialize OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    
    // Initialize PubMed API key if available
    if (process.env.PUBMED_API_KEY) {
      this.pubmedKey = process.env.PUBMED_API_KEY;
    }
    
    // Load sources on initialization
    this.loadSourcesCache().catch(err => {
      console.error('Failed to load literature sources:', err);
    });
  }

  /**
   * Load and cache literature sources from the database
   */
  private async loadSourcesCache(): Promise<void> {
    try {
      const result = await this.pool.query(`
        SELECT 
          id, 
          source_name, 
          source_type, 
          api_endpoint, 
          requires_auth, 
          enabled, 
          priority
        FROM literature_sources
        WHERE enabled = true
        ORDER BY priority DESC
      `);
      
      this.sourceCache.clear();
      this.sourceNameToIdMap.clear();
      
      for (const source of result.rows) {
        this.sourceCache.set(source.id, source);
        this.sourceNameToIdMap.set(source.source_name.toLowerCase(), source.id);
      }
    } catch (error) {
      console.error('Error loading literature sources:', error);
      throw error;
    }
  }

  /**
   * Get source ID by name
   */
  private async getSourceIdByName(sourceName: string): Promise<number | null> {
    // Try to get from cache first
    const cachedId = this.sourceNameToIdMap.get(sourceName.toLowerCase());
    if (cachedId) {
      return cachedId;
    }
    
    // If not in cache, try to get from database
    try {
      const result = await this.pool.query(`
        SELECT id FROM literature_sources 
        WHERE LOWER(source_name) = LOWER($1)
        AND enabled = true
      `, [sourceName]);
      
      if (result.rows.length > 0) {
        const id = result.rows[0].id;
        this.sourceNameToIdMap.set(sourceName.toLowerCase(), id);
        return id;
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting source ID for ${sourceName}:`, error);
      return null;
    }
  }

  /**
   * Get enabled sources
   */
  async getEnabledSources(): Promise<LiteratureSource[]> {
    if (this.sourceCache.size === 0) {
      await this.loadSourcesCache();
    }
    
    return Array.from(this.sourceCache.values());
  }

  /**
   * Basic search across multiple literature sources
   */
  async search(params: LiteratureSearchParams): Promise<LiteratureSearchResult> {
    const startTime = Date.now();
    const sourcesQueried: string[] = [];
    let combinedResults: LiteratureEntry[] = [];
    
    // Determine which sources to query
    let sourcesToQuery: string[] = [];
    if (params.sources && params.sources.length > 0) {
      sourcesToQuery = params.sources;
    } else {
      // Default to all enabled sources
      sourcesToQuery = Array.from(this.sourceNameToIdMap.keys());
    }
    
    // Query each source in parallel
    const searchPromises: Promise<LiteratureSearchResult>[] = [];
    
    for (const source of sourcesToQuery) {
      switch (source.toLowerCase()) {
        case 'pubmed':
          searchPromises.push(this.searchPubMed(params));
          sourcesQueried.push('pubmed');
          break;
        case 'fda':
          searchPromises.push(this.searchFdaDatabase(params));
          sourcesQueried.push('fda');
          break;
        case 'clinicaltrials':
          searchPromises.push(this.searchClinicalTrials(params));
          sourcesQueried.push('clinicaltrials');
          break;
        // Add more sources as needed
      }
    }
    
    // Wait for all search promises to resolve
    const results = await Promise.all(searchPromises);
    
    // Combine results
    for (const result of results) {
      combinedResults = [...combinedResults, ...result.entries];
    }
    
    // Apply semantic ranking if requested
    if (params.useSemanticSearch && this.openai && combinedResults.length > 0) {
      combinedResults = await this.applySemanticRanking(combinedResults, params.query);
    }
    
    // Sort by relevance score or publication date
    combinedResults.sort((a, b) => {
      if (a.relevance_score !== undefined && b.relevance_score !== undefined) {
        return b.relevance_score - a.relevance_score;
      }
      
      // Fall back to publication date if available
      if (a.publication_date && b.publication_date) {
        return new Date(b.publication_date).getTime() - new Date(a.publication_date).getTime();
      }
      
      return 0;
    });
    
    // Limit results
    const limit = params.limit || 20;
    combinedResults = combinedResults.slice(0, limit);
    
    // Store results in database
    await this.storeSearchResults(combinedResults, params.tenantId, params.organizationId);
    
    // Record search in history
    const searchId = await this.recordSearchHistory(params, sourcesQueried);
    
    // Update search history with result count
    await this.updateSearchHistory(searchId, combinedResults.length, Date.now() - startTime);
    
    return {
      entries: combinedResults,
      total: combinedResults.length,
      search_id: searchId,
      execution_time_ms: Date.now() - startTime,
      sources_queried: sourcesQueried,
    };
  }

  /**
   * Search PubMed for literature
   */
  private async searchPubMed(params: LiteratureSearchParams): Promise<LiteratureSearchResult> {
    const sourceId = await this.getSourceIdByName('pubmed');
    if (!sourceId) {
      console.error('PubMed source not found in database');
      return { entries: [], total: 0 };
    }
    
    if (!this.pubmedKey) {
      console.warn('PubMed API key not available');
      return { entries: [], total: 0 };
    }
    
    try {
      // This is a simplified implementation - in production, you would make actual API calls
      // to the PubMed E-utilities API
      
      // For demonstration, return mock data that would otherwise come from the API
      const mockPubMedData = [
        {
          pmid: '12345678',
          title: 'Advances in Medical Device Technology',
          authors: ['Smith J', 'Johnson A'],
          publication_date: '2023-05-10',
          journal: 'Journal of Medical Devices',
          abstract: 'This paper discusses recent advances in medical device technology and their impact on patient outcomes.',
          keywords: ['medical devices', 'technology', 'innovation'],
          mesh_terms: ['Medical Devices', 'Technology', 'Patient Outcomes'],
        },
        {
          pmid: '87654321',
          title: 'Regulatory Pathways for Novel Medical Devices',
          authors: ['Brown R', 'Williams T'],
          publication_date: '2023-03-15',
          journal: 'Regulatory Science Journal',
          abstract: 'An analysis of regulatory pathways for novel medical devices and comparison of global approval processes.',
          keywords: ['regulatory', '510(k)', 'medical devices'],
          mesh_terms: ['Equipment and Supplies', 'United States Food and Drug Administration', 'Device Approval'],
        },
      ];
      
      const entries: LiteratureEntry[] = mockPubMedData.map(item => {
          const entry: LiteratureEntry = {
            tenant_id: params.tenantId,
            organization_id: params.organizationId,
            source_id: sourceId,
            external_id: item.pmid,
            title: item.title,
            authors: item.authors,
            publication_date: new Date(item.publication_date),
            journal: item.journal,
            abstract: item.abstract,
            pmid: item.pmid,
            keywords: item.keywords,
            mesh_terms: item.mesh_terms,
            fulltext_available: false,
          };
          return entry;
      });
      
      return {
        entries,
        total: entries.length,
      };
    } catch (error) {
      console.error('Error searching PubMed:', error);
      return { entries: [], total: 0 };
    }
  }

  /**
   * Search FDA database for literature
   */
  private async searchFdaDatabase(params: LiteratureSearchParams): Promise<LiteratureSearchResult> {
    const sourceId = await this.getSourceIdByName('fda');
    if (!sourceId) {
      console.error('FDA source not found in database');
      return { entries: [], total: 0 };
    }
    
    try {
      // This is a simplified implementation - in production, you would make actual API calls
      // to the FDA's open APIs
      
      // For demonstration, return mock data that would otherwise come from the API
      const mockFdaData = [
        {
          id: 'FDA-2023-12345',
          title: 'Safety and Effectiveness of Medical Device X',
          authors: ['FDA Device Division'],
          publication_date: '2023-06-20',
          abstract: 'FDA report on the safety and effectiveness of Medical Device X based on clinical trials and post-market surveillance.',
          keywords: ['safety', 'effectiveness', 'medical device'],
        },
        {
          id: 'FDA-2023-67890',
          title: 'Guidance for Industry: 510(k) Submissions for Medical Devices',
          authors: ['FDA Regulatory Affairs Division'],
          publication_date: '2023-01-15',
          abstract: 'Updated guidance for industry on preparing 510(k) submissions for medical devices, including new requirements and best practices.',
          keywords: ['510(k)', 'guidance', 'submission', 'regulatory'],
        },
      ];
      
      const entries: LiteratureEntry[] = mockFdaData.map(item => {
        const entry: LiteratureEntry = {
          tenant_id: params.tenantId,
          organization_id: params.organizationId,
          source_id: sourceId,
          external_id: item.id,
          title: item.title,
          authors: item.authors,
          publication_date: new Date(item.publication_date),
          abstract: item.abstract,
          keywords: item.keywords,
          fulltext_available: true,
        };
        return entry;
      });
      
      return {
        entries,
        total: entries.length,
      };
    } catch (error) {
      console.error('Error searching FDA database:', error);
      return { entries: [], total: 0 };
    }
  }

  /**
   * Search ClinicalTrials.gov for literature
   */
  private async searchClinicalTrials(params: LiteratureSearchParams): Promise<LiteratureSearchResult> {
    const sourceId = await this.getSourceIdByName('clinicaltrials');
    if (!sourceId) {
      console.error('ClinicalTrials.gov source not found in database');
      return { entries: [], total: 0 };
    }
    
    try {
      // This is a simplified implementation - in production, you would make actual API calls
      // to the ClinicalTrials.gov API
      
      // For demonstration, return mock data that would otherwise come from the API
      const mockTrialsData = [
        {
          nct_id: 'NCT04123456',
          title: 'Clinical Evaluation of Novel Medical Device for Treatment of Condition Y',
          sponsors: ['Medical Device Company A', 'University Medical Center'],
          start_date: '2022-03-15',
          completion_date: '2023-09-30',
          abstract: 'A randomized controlled trial evaluating the safety and efficacy of a novel medical device for the treatment of Condition Y.',
          keywords: ['medical device', 'condition Y', 'treatment', 'clinical trial'],
        },
        {
          nct_id: 'NCT04987654',
          title: 'Post-Market Surveillance Study of Predicate Device Z',
          sponsors: ['Medical Device Company B'],
          start_date: '2021-11-01',
          completion_date: '2023-10-31',
          abstract: 'A post-market surveillance study of Predicate Device Z to assess long-term outcomes and adverse events in real-world use.',
          keywords: ['post-market surveillance', 'predicate device', 'real-world evidence'],
        },
      ];
      
      const entries: LiteratureEntry[] = mockTrialsData.map(item => {
        const entry: LiteratureEntry = {
          tenant_id: params.tenantId,
          organization_id: params.organizationId,
          source_id: sourceId,
          external_id: item.nct_id,
          title: item.title,
          authors: item.sponsors,
          publication_date: new Date(item.start_date),
          abstract: item.abstract,
          keywords: item.keywords,
          url: `https://clinicaltrials.gov/ct2/show/${item.nct_id}`,
          fulltext_available: false,
        };
        return entry;
      });
      
      return {
        entries,
        total: entries.length,
      };
    } catch (error) {
      console.error('Error searching ClinicalTrials.gov:', error);
      return { entries: [], total: 0 };
    }
  }

  /**
   * Apply semantic ranking to search results using embeddings
   */
  private async applySemanticRanking(entries: LiteratureEntry[], query: string): Promise<LiteratureEntry[]> {
    if (!this.openai) {
      console.warn('OpenAI API not available for semantic ranking');
      return entries;
    }
    
    try {
      // Generate embedding for the query
      const embeddingResponse = await this.openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: query,
      });
      
      const queryEmbedding = embeddingResponse.data[0].embedding;
      
      // Calculate similarity scores
      for (const entry of entries) {
        let entryEmbedding = entry.embedding;
        
        // If entry doesn't have an embedding, generate one
        if (!entryEmbedding) {
          // For existing entries, try to get from database
          if (entry.id) {
            entryEmbedding = await this.getEntryEmbedding(entry.id);
          }
          
          // If still no embedding, generate one
          if (!entryEmbedding) {
            const content = [entry.title, entry.abstract].filter(Boolean).join(' ');
            
            const entryEmbeddingResponse = await this.openai.embeddings.create({
              model: "text-embedding-ada-002",
              input: content,
            });
            
            entryEmbedding = entryEmbeddingResponse.data[0].embedding;
            
            // Update entry with new embedding
            entry.embedding = entryEmbedding;
            
            // Save embedding to database if entry has ID
            if (entry.id) {
              await this.updateEntryEmbedding(entry.id, entryEmbedding);
            }
          }
        }
        
        // Calculate cosine similarity
        if (entryEmbedding) {
          entry.relevance_score = this.computeCosineSimilarity(queryEmbedding, entryEmbedding);
        }
      }
      
      // Sort by relevance score
      return entries.sort((a, b) => {
        const scoreA = a.relevance_score || 0;
        const scoreB = b.relevance_score || 0;
        return scoreB - scoreA;
      });
    } catch (error) {
      console.error('Error applying semantic ranking:', error);
      return entries;
    }
  }

  /**
   * Get embedding for an existing literature entry
   */
  private async getEntryEmbedding(entryId: number): Promise<number[] | null> {
    try {
      const result = await this.pool.query(`
        SELECT embedding 
        FROM literature_entries 
        WHERE id = $1
      `, [entryId]);
      
      if (result.rows.length > 0 && result.rows[0].embedding) {
        return result.rows[0].embedding;
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting embedding for entry ${entryId}:`, error);
      return null;
    }
  }

  /**
   * Compute cosine similarity between two vectors
   */
  private computeCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (normA * normB);
  }

  /**
   * Record a search in the search history
   */
  private async recordSearchHistory(params: LiteratureSearchParams, sources: string[]): Promise<number> {
    try {
      const result = await this.pool.query(`
        INSERT INTO literature_search_history (
          tenant_id, 
          organization_id, 
          user_id, 
          query_text, 
          sources, 
          filters,
          semantic_search,
          timestamp
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING id
      `, [
        params.tenantId,
        params.organizationId,
        params.userId || null,
        params.query,
        sources,
        params.filters ? JSON.stringify(params.filters) : null,
        params.useSemanticSearch || false,
      ]);
      
      return result.rows[0].id;
    } catch (error) {
      console.error('Error recording search history:', error);
      return 0;
    }
  }

  /**
   * Update search history with results
   */
  private async updateSearchHistory(
    searchId: number,
    resultCount: number,
    executionTimeMs: number
  ): Promise<void> {
    if (!searchId) return;
    
    try {
      await this.pool.query(`
        UPDATE literature_search_history
        SET 
          result_count = $2,
          execution_time_ms = $3
        WHERE id = $1
      `, [searchId, resultCount, executionTimeMs]);
    } catch (error) {
      console.error(`Error updating search history ${searchId}:`, error);
    }
  }

  /**
   * Store search results in the database
   */
  private async storeSearchResults(entries: LiteratureEntry[], tenantId: number, organizationId: number): Promise<void> {
    if (entries.length === 0) return;
    
    // Store entries that don't already exist
    for (const entry of entries) {
      try {
        // Check if entry already exists
        const existingResult = await this.pool.query(`
          SELECT id
          FROM literature_entries
          WHERE 
            tenant_id = $1 AND
            organization_id = $2 AND
            source_id = $3 AND
            external_id = $4
        `, [tenantId, organizationId, entry.source_id, entry.external_id]);
        
        if (existingResult.rows.length > 0) {
          // Entry exists, use its ID
          entry.id = existingResult.rows[0].id;
        } else {
          // Insert new entry
          const insertResult = await this.pool.query(`
            INSERT INTO literature_entries (
              tenant_id,
              organization_id,
              source_id,
              external_id,
              title,
              authors,
              publication_date,
              journal,
              abstract,
              full_text,
              doi,
              pmid,
              url,
              citation_count,
              publication_type,
              keywords,
              mesh_terms,
              embedding,
              fulltext_available,
              pdf_path,
              created_at,
              updated_at
            )
            VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW(), NOW()
            )
            RETURNING id
          `, [
            tenantId,
            organizationId,
            entry.source_id,
            entry.external_id,
            entry.title,
            entry.authors || null,
            entry.publication_date || null,
            entry.journal || null,
            entry.abstract || null,
            entry.full_text || null,
            entry.doi || null,
            entry.pmid || null,
            entry.url || null,
            entry.citation_count || 0,
            entry.publication_type || null,
            entry.keywords || null,
            entry.mesh_terms || null,
            entry.embedding || null,
            entry.fulltext_available || false,
            entry.pdf_path || null,
          ]);
          
          entry.id = insertResult.rows[0].id;
        }
      } catch (error) {
        console.error(`Error storing literature entry:`, error);
      }
    }
  }

  /**
   * Get literature entry by ID
   */
  async getLiteratureEntryById(id: number, tenantId: number): Promise<LiteratureEntry | null> {
    try {
      const result = await this.pool.query(`
        SELECT 
          e.*,
          s.source_name
        FROM literature_entries e
        JOIN literature_sources s ON e.source_id = s.id
        WHERE 
          e.id = $1 AND
          e.tenant_id = $2
      `, [id, tenantId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error getting literature entry ${id}:`, error);
      return null;
    }
  }

  /**
   * Get recent literature entries for a tenant
   */
  async getRecentLiterature(tenantId: number, limit: number = 10): Promise<LiteratureEntry[]> {
    try {
      const result = await this.pool.query(`
        SELECT 
          e.*,
          s.source_name
        FROM literature_entries e
        JOIN literature_sources s ON e.source_id = s.id
        WHERE e.tenant_id = $1
        ORDER BY e.created_at DESC
        LIMIT $2
      `, [tenantId, limit]);
      
      return result.rows;
    } catch (error) {
      console.error(`Error getting recent literature for tenant ${tenantId}:`, error);
      return [];
    }
  }

  /**
   * Get frequently cited literature for a tenant
   */
  async getFrequentlyCitedLiterature(tenantId: number, limit: number = 10): Promise<LiteratureEntry[]> {
    try {
      const result = await this.pool.query(`
        SELECT 
          e.*,
          s.source_name,
          COUNT(c.id) as citation_count
        FROM literature_entries e
        JOIN literature_sources s ON e.source_id = s.id
        LEFT JOIN literature_citations c ON e.id = c.literature_id
        WHERE e.tenant_id = $1
        GROUP BY e.id, s.id
        ORDER BY citation_count DESC, e.created_at DESC
        LIMIT $2
      `, [tenantId, limit]);
      
      return result.rows;
    } catch (error) {
      console.error(`Error getting frequently cited literature for tenant ${tenantId}:`, error);
      return [];
    }
  }

  /**
   * Cite literature in a document
   */
  async citeLiteratureInDocument(
    literatureId: number,
    documentId: number,
    documentType: string,
    sectionId: string,
    sectionName: string,
    citationText: string,
    tenantId: number,
    organizationId: number
  ): Promise<{ id: number }> {
    try {
      const result = await this.pool.query(`
        INSERT INTO literature_citations (
          literature_id,
          document_id,
          document_type,
          section_id,
          section_name,
          citation_text,
          tenant_id,
          organization_id,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING id
      `, [
        literatureId,
        documentId,
        documentType,
        sectionId,
        sectionName,
        citationText,
        tenantId,
        organizationId,
      ]);
      
      // Update citation count for the literature entry
      await this.pool.query(`
        UPDATE literature_entries
        SET citation_count = (
          SELECT COUNT(*)
          FROM literature_citations
          WHERE literature_id = $1
        )
        WHERE id = $1
      `, [literatureId]);
      
      return { id: result.rows[0].id };
    } catch (error) {
      console.error(`Error citing literature ${literatureId} in document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Get citations for a document
   */
  async getDocumentCitations(
    documentId: number,
    documentType: string,
    tenantId: number
  ): Promise<any[]> {
    try {
      const result = await this.pool.query(`
        SELECT 
          c.*,
          e.title as literature_title,
          e.authors as literature_authors,
          e.journal as literature_journal,
          e.publication_date as literature_publication_date,
          s.source_name
        FROM literature_citations c
        JOIN literature_entries e ON c.literature_id = e.id
        JOIN literature_sources s ON e.source_id = s.id
        WHERE 
          c.document_id = $1 AND
          c.document_type = $2 AND
          c.tenant_id = $3
        ORDER BY c.created_at DESC
      `, [documentId, documentType, tenantId]);
      
      return result.rows;
    } catch (error) {
      console.error(`Error getting citations for document ${documentId}:`, error);
      return [];
    }
  }

  /**
   * Remove a citation from a document
   */
  async removeCitation(
    citationId: number,
    tenantId: number
  ): Promise<boolean> {
    try {
      // Get the literature ID before deletion
      const citationResult = await this.pool.query(`
        SELECT literature_id
        FROM literature_citations
        WHERE id = $1 AND tenant_id = $2
      `, [citationId, tenantId]);
      
      if (citationResult.rows.length === 0) {
        return false;
      }
      
      const literatureId = citationResult.rows[0].literature_id;
      
      // Delete the citation
      const result = await this.pool.query(`
        DELETE FROM literature_citations
        WHERE id = $1 AND tenant_id = $2
        RETURNING id
      `, [citationId, tenantId]);
      
      if (result.rowCount === 0) {
        return false;
      }
      
      // Update citation count for the literature entry
      await this.pool.query(`
        UPDATE literature_entries
        SET citation_count = (
          SELECT COUNT(*)
          FROM literature_citations
          WHERE literature_id = $1
        )
        WHERE id = $1
      `, [literatureId]);
      
      return true;
    } catch (error) {
      console.error(`Error removing citation ${citationId}:`, error);
      return false;
    }
  }

  /**
   * Update an entry's embedding
   */
  async updateEntryEmbedding(entryId: number, embedding: number[]): Promise<boolean> {
    try {
      await this.pool.query(`
        UPDATE literature_entries
        SET 
          embedding = $2,
          updated_at = NOW()
        WHERE id = $1
      `, [entryId, embedding]);
      
      return true;
    } catch (error) {
      console.error(`Error updating embedding for entry ${entryId}:`, error);
      return false;
    }
  }
}