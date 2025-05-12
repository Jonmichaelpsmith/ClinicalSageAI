/**
 * Literature Summarizer Service
 * 
 * This service provides AI-powered summaries of literature and research papers,
 * generating concise, structured overviews for use in 510k submissions.
 */

import { Pool } from 'pg';
import OpenAI from 'openai';

interface SummaryRequest {
  literatureIds: number[];
  searchId?: number;
  summaryType: 'standard' | 'detailed' | 'critical' | 'comparison';
  focus?: string;
  tenantId: number;
  organizationId: number;
  userId?: number;
}

interface LiteratureEntry {
  id: number;
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
  source_name?: string;
}

interface SummaryResponse {
  summary: string;
  summaryId?: number;
  literatureIds: number[];
  processingTimeMs: number;
  modelUsed: string;
  promptTokens?: number;
  completionTokens?: number;
}

export class LiteratureSummarizerService {
  private pool: Pool;
  private openai: OpenAI | null = null;

  constructor(pool: Pool) {
    this.pool = pool;
    
    // Initialize OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  /**
   * Generate a summary of literature entries
   */
  async generateSummary(request: SummaryRequest): Promise<SummaryResponse> {
    const startTime = Date.now();
    
    // Fetch literature entries
    const entries = await this.fetchLiteratureEntries(request.literatureIds, request.tenantId);
    
    if (entries.length === 0) {
      throw new Error('No literature entries found with the provided IDs');
    }
    
    // Default response parameters
    let summary = '';
    let modelUsed = 'gpt-4o'; // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
    let promptTokens = 0;
    let completionTokens = 0;
    
    // Generate summary based on type
    try {
      if (!this.openai) {
        throw new Error('OpenAI API is not available');
      }
      
      let summaryResult;
      switch (request.summaryType) {
        case 'detailed':
          summaryResult = await this.generateDetailedSummary(entries, request.focus);
          break;
        case 'critical':
          summaryResult = await this.generateCriticalSummary(entries, request.focus);
          break;
        case 'comparison':
          summaryResult = await this.generateComparisonSummary(entries, request.focus);
          break;
        case 'standard':
        default:
          summaryResult = await this.generateStandardSummary(entries, request.focus);
          break;
      }
      
      summary = summaryResult.summary;
      modelUsed = summaryResult.modelUsed;
      promptTokens = summaryResult.promptTokens || 0;
      completionTokens = summaryResult.completionTokens || 0;
    } catch (error) {
      console.error('Error generating literature summary:', error);
      summary = `Error generating summary: ${error instanceof Error ? error.message : String(error)}`;
    }
    
    // Store summary in database
    const summaryId = await this.storeSummary({
      summary,
      literatureIds: request.literatureIds,
      searchId: request.searchId,
      summaryType: request.summaryType,
      focus: request.focus,
      tenantId: request.tenantId,
      organizationId: request.organizationId,
      userId: request.userId,
      modelUsed,
      promptTokens,
      completionTokens,
      processingTimeMs: Date.now() - startTime,
    });
    
    return {
      summary,
      summaryId,
      literatureIds: request.literatureIds,
      processingTimeMs: Date.now() - startTime,
      modelUsed,
      promptTokens,
      completionTokens,
    };
  }

  /**
   * Fetch literature entries from database
   */
  private async fetchLiteratureEntries(ids: number[], tenantId: number): Promise<LiteratureEntry[]> {
    try {
      const result = await this.pool.query(`
        SELECT 
          e.*,
          s.source_name
        FROM literature_entries e
        JOIN literature_sources s ON e.source_id = s.id
        WHERE 
          e.id = ANY($1) AND
          e.tenant_id = $2
      `, [ids, tenantId]);
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching literature entries:', error);
      throw error;
    }
  }

  /**
   * Store summary in database
   */
  private async storeSummary(data: {
    summary: string;
    literatureIds: number[];
    searchId?: number;
    summaryType: string;
    focus?: string;
    tenantId: number;
    organizationId: number;
    userId?: number;
    modelUsed: string;
    promptTokens: number;
    completionTokens: number;
    processingTimeMs: number;
  }): Promise<number> {
    try {
      const result = await this.pool.query(`
        INSERT INTO literature_summaries (
          literature_ids,
          search_id,
          summary_type,
          focus,
          summary_text,
          tenant_id,
          organization_id,
          user_id,
          model_used,
          prompt_tokens,
          completion_tokens,
          processing_time_ms,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
        RETURNING id
      `, [
        data.literatureIds,
        data.searchId || null,
        data.summaryType,
        data.focus || null,
        data.summary,
        data.tenantId,
        data.organizationId,
        data.userId || null,
        data.modelUsed,
        data.promptTokens,
        data.completionTokens,
        data.processingTimeMs,
      ]);
      
      return result.rows[0].id;
    } catch (error) {
      console.error('Error storing literature summary:', error);
      return 0;
    }
  }

  /**
   * Generate a standard summary of literature
   */
  private async generateStandardSummary(
    entries: LiteratureEntry[],
    focus?: string
  ): Promise<{ summary: string; modelUsed: string; promptTokens?: number; completionTokens?: number }> {
    if (!this.openai) {
      throw new Error('OpenAI API is not available');
    }
    
    // Prepare literature data for the prompt
    const literatureData = entries.map(entry => {
      const authors = entry.authors && entry.authors.length > 0 
        ? entry.authors.join(', ') 
        : 'Unknown';
        
      const date = entry.publication_date 
        ? new Date(entry.publication_date).toISOString().split('T')[0] 
        : 'Unknown date';
        
      return `
TITLE: ${entry.title}
AUTHORS: ${authors}
DATE: ${date}
SOURCE: ${entry.source_name || 'Unknown'}
${entry.journal ? `JOURNAL: ${entry.journal}` : ''}
${entry.pmid ? `PMID: ${entry.pmid}` : ''}
${entry.doi ? `DOI: ${entry.doi}` : ''}

ABSTRACT:
${entry.abstract || 'No abstract available.'}
-------------------
`;
    }).join('\n');
    
    // Create a system message
    const systemMessage = `You are an expert medical device regulatory analyst tasked with summarizing literature for 510(k) submissions. Provide a concise, factual, and neutral summary that captures the key points from the literature entries provided. Focus on the following aspects:
1. Key findings relevant to medical devices
2. Safety and effectiveness data
3. Regulatory implications
4. Technological characteristics
5. Clinical performance

${focus ? `Pay special attention to aspects related to: ${focus}` : ''}

Your summary should be well-structured, using bullet points where appropriate, and divided into clear sections. Avoid introducing information not present in the source material. Citations to specific papers should be in the format (Author et al., Year).`;

    // Generate the summary
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: `Please provide a standard summary of the following literature entries for use in a 510(k) submission:\n\n${literatureData}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });
    
    // Extract the summary
    const summary = response.choices[0].message.content || 'No summary could be generated.';
    
    return {
      summary,
      modelUsed: response.model,
      promptTokens: response.usage?.prompt_tokens,
      completionTokens: response.usage?.completion_tokens,
    };
  }

  /**
   * Generate a detailed summary of literature
   */
  private async generateDetailedSummary(
    entries: LiteratureEntry[],
    focus?: string
  ): Promise<{ summary: string; modelUsed: string; promptTokens?: number; completionTokens?: number }> {
    if (!this.openai) {
      throw new Error('OpenAI API is not available');
    }
    
    // Prepare literature data for the prompt
    const literatureData = entries.map(entry => {
      const authors = entry.authors && entry.authors.length > 0 
        ? entry.authors.join(', ') 
        : 'Unknown';
        
      const date = entry.publication_date 
        ? new Date(entry.publication_date).toISOString().split('T')[0] 
        : 'Unknown date';
      
      // Include full text if available
      const contentText = entry.full_text || entry.abstract || 'No content available.';
        
      return `
TITLE: ${entry.title}
AUTHORS: ${authors}
DATE: ${date}
SOURCE: ${entry.source_name || 'Unknown'}
${entry.journal ? `JOURNAL: ${entry.journal}` : ''}
${entry.pmid ? `PMID: ${entry.pmid}` : ''}
${entry.doi ? `DOI: ${entry.doi}` : ''}

CONTENT:
${contentText}
-------------------
`;
    }).join('\n');
    
    // Create a system message
    const systemMessage = `You are an expert medical device regulatory analyst tasked with creating detailed summaries of literature for 510(k) submissions. Provide a comprehensive, in-depth analysis that thoroughly examines the key points, methodologies, results, and conclusions from the literature entries provided. Your summary should include:

1. Detailed description of study designs and methodologies
2. Comprehensive analysis of safety and effectiveness data
3. Statistical significance of findings
4. Thorough examination of technological characteristics
5. Complete analysis of clinical performance metrics
6. Critical evaluation of the strength of evidence

${focus ? `Pay special attention to aspects related to: ${focus}` : ''}

Your summary should be well-structured with clear section headings, detailed bullet points, and proper citations to specific papers in the format (Author et al., Year). Include a conclusion section that synthesizes the findings across all papers.`;

    // Generate the summary
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: `Please provide a detailed, comprehensive summary of the following literature entries for use in a 510(k) submission:\n\n${literatureData}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2500,
    });
    
    // Extract the summary
    const summary = response.choices[0].message.content || 'No summary could be generated.';
    
    return {
      summary,
      modelUsed: response.model,
      promptTokens: response.usage?.prompt_tokens,
      completionTokens: response.usage?.completion_tokens,
    };
  }

  /**
   * Generate a critical summary of literature
   */
  private async generateCriticalSummary(
    entries: LiteratureEntry[],
    focus?: string
  ): Promise<{ summary: string; modelUsed: string; promptTokens?: number; completionTokens?: number }> {
    if (!this.openai) {
      throw new Error('OpenAI API is not available');
    }
    
    // Prepare literature data for the prompt
    const literatureData = entries.map(entry => {
      const authors = entry.authors && entry.authors.length > 0 
        ? entry.authors.join(', ') 
        : 'Unknown';
        
      const date = entry.publication_date 
        ? new Date(entry.publication_date).toISOString().split('T')[0] 
        : 'Unknown date';
      
      // Include full text if available
      const contentText = entry.full_text || entry.abstract || 'No content available.';
        
      return `
TITLE: ${entry.title}
AUTHORS: ${authors}
DATE: ${date}
SOURCE: ${entry.source_name || 'Unknown'}
${entry.journal ? `JOURNAL: ${entry.journal}` : ''}
${entry.pmid ? `PMID: ${entry.pmid}` : ''}
${entry.doi ? `DOI: ${entry.doi}` : ''}

CONTENT:
${contentText}
-------------------
`;
    }).join('\n');
    
    // Create a system message
    const systemMessage = `You are an expert medical device regulatory analyst tasked with critically evaluating literature for 510(k) submissions. Provide a balanced, objective assessment that examines both strengths and limitations of the literature entries provided. Your critical summary should include:

1. Evaluation of study design quality and potential biases
2. Assessment of statistical rigor and appropriateness of methods
3. Analysis of potential confounding factors
4. Discussion of how generalizable the findings are to the broader device category
5. Identification of gaps in the evidence
6. Comparison with current regulatory standards and expectations

${focus ? `Pay special attention to aspects related to: ${focus}` : ''}

Your summary should be thorough but fair, highlighting both supportive evidence and areas where additional data may be needed. Structure your response with clear sections for each paper and a synthesis section that weighs the collective evidence. Use proper citations in the format (Author et al., Year).`;

    // Generate the summary
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: `Please provide a critical evaluation of the following literature entries for use in a 510(k) submission:\n\n${literatureData}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });
    
    // Extract the summary
    const summary = response.choices[0].message.content || 'No summary could be generated.';
    
    return {
      summary,
      modelUsed: response.model,
      promptTokens: response.usage?.prompt_tokens,
      completionTokens: response.usage?.completion_tokens,
    };
  }

  /**
   * Generate a comparison summary of literature
   */
  private async generateComparisonSummary(
    entries: LiteratureEntry[],
    focus?: string
  ): Promise<{ summary: string; modelUsed: string; promptTokens?: number; completionTokens?: number }> {
    if (!this.openai) {
      throw new Error('OpenAI API is not available');
    }
    
    if (entries.length < 2) {
      throw new Error('At least two literature entries are required for a comparison summary');
    }
    
    // Prepare literature data for the prompt
    const literatureData = entries.map(entry => {
      const authors = entry.authors && entry.authors.length > 0 
        ? entry.authors.join(', ') 
        : 'Unknown';
        
      const date = entry.publication_date 
        ? new Date(entry.publication_date).toISOString().split('T')[0] 
        : 'Unknown date';
      
      // Include full text if available
      const contentText = entry.full_text || entry.abstract || 'No content available.';
        
      return `
TITLE: ${entry.title}
AUTHORS: ${authors}
DATE: ${date}
SOURCE: ${entry.source_name || 'Unknown'}
${entry.journal ? `JOURNAL: ${entry.journal}` : ''}
${entry.pmid ? `PMID: ${entry.pmid}` : ''}
${entry.doi ? `DOI: ${entry.doi}` : ''}

CONTENT:
${contentText}
-------------------
`;
    }).join('\n');
    
    // Create a system message
    const systemMessage = `You are an expert medical device regulatory analyst tasked with comparing literature for 510(k) submissions. Create a structured comparative analysis that highlights similarities, differences, and complementary findings across the literature entries provided. Your comparison should include:

1. Side-by-side comparison of key methodologies
2. Comparative analysis of safety and effectiveness outcomes
3. Consistency and contradictions in findings across studies
4. Relative strengths of evidence for each study
5. Evolution of understanding over time if studies span different periods
6. Complementary aspects that collectively strengthen the overall evidence

${focus ? `Pay special attention to aspects related to: ${focus}` : ''}

Organize your response using a clear comparative structure with tables or parallel sections where appropriate. Highlight points of consensus and divergence. Conclude with a synthesis that explains how these studies collectively inform the 510(k) submission. Use proper citations in the format (Author et al., Year).`;

    // Generate the summary
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: `Please provide a comparative analysis of the following literature entries for use in a 510(k) submission:\n\n${literatureData}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2500,
    });
    
    // Extract the summary
    const summary = response.choices[0].message.content || 'No summary could be generated.';
    
    return {
      summary,
      modelUsed: response.model,
      promptTokens: response.usage?.prompt_tokens,
      completionTokens: response.usage?.completion_tokens,
    };
  }

  /**
   * Get summary by ID
   */
  async getSummaryById(summaryId: number, tenantId: number): Promise<any> {
    try {
      const result = await this.pool.query(`
        SELECT *
        FROM literature_summaries
        WHERE id = $1 AND tenant_id = $2
      `, [summaryId, tenantId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      // Get literature details for the summary
      const literatureResult = await this.pool.query(`
        SELECT 
          e.*,
          s.source_name
        FROM literature_entries e
        JOIN literature_sources s ON e.source_id = s.id
        WHERE e.id = ANY($1) AND e.tenant_id = $2
      `, [result.rows[0].literature_ids, tenantId]);
      
      return {
        ...result.rows[0],
        literature: literatureResult.rows,
      };
    } catch (error) {
      console.error(`Error getting summary ${summaryId}:`, error);
      return null;
    }
  }

  /**
   * Get recent summaries for a tenant
   */
  async getRecentSummaries(tenantId: number, limit: number = 10): Promise<any[]> {
    try {
      const result = await this.pool.query(`
        SELECT *
        FROM literature_summaries
        WHERE tenant_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `, [tenantId, limit]);
      
      // For each summary, fetch the first few literature entries
      const summaries = [];
      for (const summary of result.rows) {
        // Get up to 3 literature entries for preview
        const literatureIds = summary.literature_ids.slice(0, 3);
        
        const literatureResult = await this.pool.query(`
          SELECT 
            e.id,
            e.title,
            e.authors,
            e.publication_date,
            e.journal,
            s.source_name
          FROM literature_entries e
          JOIN literature_sources s ON e.source_id = s.id
          WHERE e.id = ANY($1) AND e.tenant_id = $2
        `, [literatureIds, tenantId]);
        
        summaries.push({
          ...summary,
          literature_preview: literatureResult.rows,
          total_literature_count: summary.literature_ids.length,
        });
      }
      
      return summaries;
    } catch (error) {
      console.error(`Error getting recent summaries for tenant ${tenantId}:`, error);
      return [];
    }
  }
}