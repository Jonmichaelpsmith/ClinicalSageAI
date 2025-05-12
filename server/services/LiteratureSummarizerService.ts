/**
 * Literature Summarizer Service
 * 
 * This service handles summarizing literature articles and extracting key insights
 * using OpenAI's GPT models.
 */

import { Pool } from 'pg';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Set up database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface SummarizationResult {
  id: string;
  summary: string;
  insights: {
    studyDesign?: string;
    sampleSize?: string;
    primaryEfficacy?: string;
    safetyConcerns?: string;
  };
}

class LiteratureSummarizerService {
  /**
   * Summarize a single abstract using OpenAI
   * 
   * @param abstract Abstract text to summarize
   * @returns Summary text
   */
  async summarizeAbstract(abstract: string): Promise<string> {
    try {
      if (!abstract || abstract.trim().length === 0) {
        return "No abstract available for summarization.";
      }
      
      const prompt = `
        Summarize the following abstract in two sentences focused on:
        • Safety findings
        • Key performance results
        • Any notable device-related adverse events

        Abstract: ${abstract}
      `;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are a medical literature expert specializing in regulatory documentation for medical devices. Provide concise, accurate summaries highlighting safety and performance relevant to 510(k) submissions." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 200,
      });
      
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error summarizing abstract:', error);
      throw new Error(`Failed to summarize abstract: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Extract insights from an abstract using OpenAI
   * 
   * @param abstract Abstract text to analyze
   * @returns Structured insights
   */
  async extractInsights(abstract: string): Promise<{
    studyDesign?: string;
    sampleSize?: string;
    primaryEfficacy?: string;
    safetyConcerns?: string;
  }> {
    try {
      if (!abstract || abstract.trim().length === 0) {
        return {};
      }
      
      const prompt = `
        From this abstract, extract:
        1. Study design (eg. RCT, cohort)
        2. Sample size
        3. Primary efficacy endpoint
        4. Safety concerns
        
        Return as JSON with keys: studyDesign, sampleSize, primaryEfficacy, safetyConcerns.
        If information is not available for a field, omit that field from the JSON.
        
        Abstract: ${abstract}
      `;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are a medical literature analyst specializing in extracting structured information from clinical studies. Extract precise data relevant to 510(k) submissions." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 300,
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0].message.content.trim();
      const insights = JSON.parse(content);
      
      return {
        studyDesign: insights.studyDesign,
        sampleSize: insights.sampleSize,
        primaryEfficacy: insights.primaryEfficacy,
        safetyConcerns: insights.safetyConcerns
      };
    } catch (error) {
      console.error('Error extracting insights:', error);
      // Return empty object if we fail to extract insights
      return {};
    }
  }
  
  /**
   * Retrieve abstract for a literature entry
   * 
   * @param id Literature entry ID
   * @returns Abstract text
   */
  async getAbstractById(id: string): Promise<string | null> {
    try {
      const result = await pool.query(
        'SELECT abstract FROM literature_entries WHERE id = $1',
        [id]
      );
      
      if (result.rowCount === 0) {
        return null;
      }
      
      return result.rows[0].abstract;
    } catch (error) {
      console.error(`Error fetching abstract for ID ${id}:`, error);
      throw new Error(`Failed to fetch abstract: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Update literature entry with summary and insights
   * 
   * @param id Literature entry ID
   * @param summary Summary text
   * @param insights Extracted insights
   */
  async updateLiteratureEntry(
    id: string, 
    summary: string, 
    insights: {
      studyDesign?: string;
      sampleSize?: string;
      primaryEfficacy?: string;
      safetyConcerns?: string;
    }
  ): Promise<void> {
    try {
      await pool.query(
        `UPDATE literature_entries 
         SET summary = $1, insights = $2, updated_at = NOW()
         WHERE id = $3`,
        [summary, insights, id]
      );
    } catch (error) {
      console.error(`Error updating literature entry ${id}:`, error);
      throw new Error(`Failed to update literature entry: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Process a batch of literature entries for summarization
   * 
   * @param ids Array of literature entry IDs
   * @returns Array of summarization results
   */
  async processBatch(ids: string[]): Promise<SummarizationResult[]> {
    try {
      if (ids.length === 0) {
        return [];
      }
      
      // Limit batch size to prevent overloading the API
      const batchSize = Math.min(ids.length, 10);
      const batchIds = ids.slice(0, batchSize);
      
      const results: SummarizationResult[] = [];
      
      // Process each ID sequentially to avoid rate limits
      for (const id of batchIds) {
        // Get abstract for the literature entry
        const abstract = await this.getAbstractById(id);
        
        if (!abstract) {
          console.warn(`No abstract found for ID ${id}`);
          continue;
        }
        
        // Summarize abstract and extract insights
        const [summary, insights] = await Promise.all([
          this.summarizeAbstract(abstract),
          this.extractInsights(abstract)
        ]);
        
        // Update the literature entry in the database
        await this.updateLiteratureEntry(id, summary, insights);
        
        results.push({
          id,
          summary,
          insights
        });
      }
      
      return results;
    } catch (error) {
      console.error('Error processing batch:', error);
      throw new Error(`Failed to process batch: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Get summaries for specific literature entries
   * 
   * @param ids Array of literature entry IDs
   * @returns Array of summarization results
   */
  async getSummaries(ids: string[]): Promise<SummarizationResult[]> {
    try {
      if (ids.length === 0) {
        return [];
      }
      
      const result = await pool.query(
        `SELECT id, summary, insights 
         FROM literature_entries 
         WHERE id = ANY($1) AND summary IS NOT NULL`,
        [ids]
      );
      
      return result.rows.map(row => ({
        id: row.id,
        summary: row.summary,
        insights: row.insights
      }));
    } catch (error) {
      console.error('Error getting summaries:', error);
      throw new Error(`Failed to get summaries: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Summarize literature entries by IDs
   * 
   * @param ids Array of literature entry IDs
   * @param forceRefresh Whether to force regeneration of summaries
   * @returns Array of summarization results
   */
  async summarizeByIds(ids: string[], forceRefresh: boolean = false): Promise<SummarizationResult[]> {
    try {
      if (ids.length === 0) {
        return [];
      }
      
      // If not forcing refresh, get existing summaries
      if (!forceRefresh) {
        const existingSummaries = await this.getSummaries(ids);
        const existingIds = new Set(existingSummaries.map(s => s.id));
        
        // Filter out IDs that already have summaries
        const idsToProcess = ids.filter(id => !existingIds.has(id));
        
        // If all IDs already have summaries, return them
        if (idsToProcess.length === 0) {
          return existingSummaries;
        }
        
        // Process only the IDs that don't have summaries
        const newSummaries = await this.processBatch(idsToProcess);
        
        // Combine existing and new summaries
        return [...existingSummaries, ...newSummaries];
      }
      
      // Force refresh: process all IDs
      return await this.processBatch(ids);
    } catch (error) {
      console.error('Error summarizing by IDs:', error);
      throw new Error(`Failed to summarize by IDs: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Mark literature entries as selected (added to report)
   * 
   * @param ids Array of literature entry IDs
   * @param projectId Project ID
   * @param selected Whether entries are selected
   */
  async markEntriesAsSelected(ids: string[], projectId: string, selected: boolean = true): Promise<void> {
    try {
      if (ids.length === 0) {
        return;
      }
      
      await pool.query(
        `UPDATE literature_entries 
         SET selected = $1, updated_at = NOW()
         WHERE id = ANY($2) AND project_id = $3`,
        [selected, ids, projectId]
      );
    } catch (error) {
      console.error('Error marking entries as selected:', error);
      throw new Error(`Failed to mark entries as selected: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Generate BibTeX citations for literature entries
   * 
   * @param ids Array of literature entry IDs
   * @param projectId Project ID
   * @returns BibTeX formatted string
   */
  async generateBibTeX(ids: string[], projectId: string): Promise<string> {
    try {
      if (ids.length === 0) {
        return "";
      }
      
      const result = await pool.query(
        `SELECT * FROM literature_entries 
         WHERE id = ANY($1) AND project_id = $2`,
        [ids, projectId]
      );
      
      if (result.rowCount === 0) {
        return "";
      }
      
      const entries = result.rows;
      let bibtex = "";
      
      for (const entry of entries) {
        // Create BibTeX key from ID
        const key = entry.id.replace(/[^a-zA-Z0-9]/g, '_');
        
        // Determine entry type based on source
        let entryType = 'article';
        if (entry.source === 'ClinicalTrials.gov') {
          entryType = 'misc';
        } else if (entry.source === 'bioRxiv' || entry.source === 'medRxiv') {
          entryType = 'unpublished';
        }
        
        // Build BibTeX entry
        bibtex += `@${entryType}{${key},\n`;
        bibtex += `  title = {${entry.title}},\n`;
        
        // Authors
        if (entry.authors && entry.authors.length > 0) {
          bibtex += `  author = {${entry.authors.join(' and ')}},\n`;
        }
        
        // Journal/source
        if (entry.journal) {
          bibtex += `  journal = {${entry.journal}},\n`;
        } else if (entry.source) {
          bibtex += `  howpublished = {${entry.source}},\n`;
        }
        
        // Year
        if (entry.year) {
          bibtex += `  year = {${entry.year}},\n`;
        }
        
        // URL
        if (entry.url) {
          bibtex += `  url = {${entry.url}},\n`;
        }
        
        // DOI
        if (entry.doi) {
          bibtex += `  doi = {${entry.doi}},\n`;
        }
        
        // PMID
        if (entry.pmid) {
          bibtex += `  note = {PMID: ${entry.pmid}},\n`;
        }
        
        // NCT ID
        if (entry.nct_id) {
          bibtex += `  note = {NCT ID: ${entry.nct_id}},\n`;
        }
        
        // Close entry
        bibtex += `}\n\n`;
      }
      
      return bibtex;
    } catch (error) {
      console.error('Error generating BibTeX:', error);
      throw new Error(`Failed to generate BibTeX: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Get selected literature entries for a project
   * 
   * @param projectId Project ID
   * @returns Array of selected literature entries
   */
  async getSelectedEntries(projectId: string): Promise<any[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM literature_entries 
         WHERE project_id = $1 AND selected = true
         ORDER BY updated_at DESC`,
        [projectId]
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
      console.error('Error getting selected entries:', error);
      throw new Error(`Failed to get selected entries: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Format literature entries as citations
   * 
   * @param ids Array of literature entry IDs
   * @param projectId Project ID
   * @returns Array of formatted citations
   */
  async formatCitations(ids: string[], projectId: string): Promise<any[]> {
    try {
      if (ids.length === 0) {
        return [];
      }
      
      const result = await pool.query(
        `SELECT * FROM literature_entries 
         WHERE id = ANY($1) AND project_id = $2`,
        [ids, projectId]
      );
      
      return result.rows.map((row, index) => {
        // Format authors for citation
        const authorText = row.authors && row.authors.length > 0 
          ? this.formatAuthorList(row.authors)
          : 'No authors listed';
        
        // Create citation text in Vancouver style
        const citation = `${authorText}. ${row.title}. ${row.journal || row.source}. ${row.year};${row.volume || ''}${row.issue ? `(${row.issue})` : ''}:${row.pages || ''}. ${row.doi ? `doi: ${row.doi}` : ''}`;
        
        return {
          id: row.id,
          number: index + 1,
          citationText: citation,
          title: row.title,
          authors: row.authors,
          journal: row.journal || row.source,
          year: row.year,
          url: row.url,
          summary: row.summary
        };
      });
    } catch (error) {
      console.error('Error formatting citations:', error);
      throw new Error(`Failed to format citations: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Format author list for citation
   * 
   * @param authors Array of author names
   * @returns Formatted author string
   */
  private formatAuthorList(authors: string[]): string {
    if (!authors || authors.length === 0) {
      return 'No authors listed';
    }
    
    if (authors.length === 1) {
      return authors[0];
    }
    
    if (authors.length <= 6) {
      return authors.join(', ');
    }
    
    // For more than 6 authors, show first 3 followed by "et al."
    return `${authors.slice(0, 3).join(', ')}, et al.`;
  }
}

export default new LiteratureSummarizerService();