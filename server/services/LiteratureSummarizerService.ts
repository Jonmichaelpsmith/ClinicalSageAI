/**
 * Literature Summarizer Service
 * 
 * This service is responsible for generating AI-powered summaries of literature entries
 * for enhanced comprehension and analysis in 510(k) submissions.
 */

import { Pool } from 'pg';
import { OpenAI } from 'openai';
import { LiteratureAggregator } from './LiteratureAggregatorService';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Create literature aggregator instance for fetching literature
const literatureAggregator = new LiteratureAggregator();

// Summary types
enum SummaryType {
  ABSTRACT = 'abstract',
  CONCLUSION = 'conclusion',
  METHODS = 'methods',
  RESULTS = 'results',
  FULL = 'full',
  REGULATORY = 'regulatory'
}

// Summary options
interface SummaryOptions {
  type: SummaryType;
  maxLength?: number;
  focusOn?: string[];
  regulatoryContext?: boolean;
  device510k?: boolean;
  comparativeFocus?: boolean;
}

/**
 * Main class for AI-powered literature summarization
 */
export class LiteratureSummarizer {
  
  /**
   * Generate a summary for a literature entry
   */
  public async generateSummary(
    literatureId: number,
    options: SummaryOptions
  ): Promise<string> {
    try {
      // Fetch the literature entry
      const literature = await literatureAggregator.getLiteratureById(literatureId);
      
      if (!literature) {
        throw new Error(`Literature with ID ${literatureId} not found`);
      }
      
      // Generate the summary with OpenAI
      const summaryText = await this.createOpenAISummary(literature, options);
      
      // Store the summary in the database
      await this.storeSummary(literatureId, summaryText, options.type);
      
      return summaryText;
    } catch (error) {
      console.error('Error generating summary:', error);
      throw error;
    }
  }
  
  /**
   * Create a summary using OpenAI
   */
  private async createOpenAISummary(literature: any, options: SummaryOptions): Promise<string> {
    const { title, abstract, full_text, authors, journal, publication_date, source } = literature;
    
    // Determine the content to summarize
    const contentToSummarize = full_text || abstract || '';
    
    if (!contentToSummarize) {
      return "Unable to generate summary: No content available";
    }
    
    // Construct the prompt based on the summary type
    let prompt = `Please provide a ${options.type} summary of the following ${source} article:\n\n`;
    prompt += `Title: ${title}\n`;
    prompt += `Authors: ${authors || 'Unknown'}\n`;
    prompt += `Journal: ${journal || 'Unknown'}\n`;
    prompt += `Date: ${publication_date || 'Unknown'}\n\n`;
    
    // Add specific instructions based on summary type
    if (options.type === SummaryType.ABSTRACT) {
      prompt += `Generate a concise abstract summary in 3-5 sentences that captures the main points.`;
    } else if (options.type === SummaryType.CONCLUSION) {
      prompt += `Focus on the key conclusions and implications of this article in 3-4 sentences.`;
    } else if (options.type === SummaryType.METHODS) {
      prompt += `Summarize the methods and approach used in this study in a short paragraph.`;
    } else if (options.type === SummaryType.RESULTS) {
      prompt += `Provide a summary of the main results and findings in a concise format.`;
    } else if (options.type === SummaryType.REGULATORY) {
      prompt += `Provide a summary focused on regulatory implications and relevance to medical device submissions. Highlight any information related to safety, efficacy, and regulatory pathways. Include key points that would be relevant for a 510(k) submission.`;
    } else {
      prompt += `Provide a comprehensive summary of the entire article, including methods, results, and conclusions.`;
    }
    
    // Add specific focus areas if provided
    if (options.focusOn && options.focusOn.length > 0) {
      prompt += ` Pay special attention to aspects related to: ${options.focusOn.join(', ')}.`;
    }
    
    // Add regulatory context if requested
    if (options.regulatoryContext) {
      prompt += ` Frame the summary in a regulatory context, highlighting elements that would be important for medical device submissions.`;
    }
    
    // Add 510(k) specific focus if requested
    if (options.device510k) {
      prompt += ` Emphasize aspects relevant to medical device substantial equivalence, safety, and effectiveness comparisons.`;
    }
    
    // Add comparative focus if requested
    if (options.comparativeFocus) {
      prompt += ` Focus on comparative aspects of this study, especially where devices or methods are compared with predicates or alternatives.`;
    }
    
    // Set max length if specified
    if (options.maxLength) {
      prompt += ` Limit your summary to approximately ${options.maxLength} words.`;
    }
    
    // Add the content to summarize
    prompt += `\n\nContent to summarize:\n${contentToSummarize}`;
    
    // Generate the summary using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert medical device regulatory specialist with extensive experience in literature review and synthesis for regulatory submissions. Your summaries are accurate, concise, and focused on regulatory relevance."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: options.maxLength ? Math.min(options.maxLength * 2, 1000) : 1000
    });
    
    return response.choices[0].message.content || "Unable to generate summary";
  }
  
  /**
   * Store a summary in the database
   */
  private async storeSummary(
    literatureId: number,
    summaryText: string,
    summaryType: string
  ): Promise<void> {
    try {
      const client = await pool.connect();
      try {
        // Check if a summary of this type already exists
        const checkQuery = `
          SELECT id FROM literature_summaries
          WHERE literature_id = $1 AND summary_type = $2
        `;
        
        const checkResult = await client.query(checkQuery, [literatureId, summaryType]);
        
        if (checkResult.rows.length > 0) {
          // Update the existing summary
          const updateQuery = `
            UPDATE literature_summaries
            SET summary_text = $1, ai_generated = true
            WHERE literature_id = $2 AND summary_type = $3
          `;
          
          await client.query(updateQuery, [summaryText, literatureId, summaryType]);
        } else {
          // Insert a new summary
          const insertQuery = `
            INSERT INTO literature_summaries
            (literature_id, summary_text, summary_type, ai_generated)
            VALUES ($1, $2, $3, true)
          `;
          
          await client.query(insertQuery, [literatureId, summaryText, summaryType]);
        }
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error storing summary:', error);
      throw error;
    }
  }
  
  /**
   * Get existing summary for a literature entry
   */
  public async getSummary(
    literatureId: number,
    summaryType: string = SummaryType.ABSTRACT
  ): Promise<string | null> {
    try {
      const client = await pool.connect();
      try {
        const query = `
          SELECT summary_text FROM literature_summaries
          WHERE literature_id = $1 AND summary_type = $2
          ORDER BY created_at DESC
          LIMIT 1
        `;
        
        const result = await client.query(query, [literatureId, summaryType]);
        
        if (result.rows.length === 0) {
          return null;
        }
        
        return result.rows[0].summary_text;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error getting summary:', error);
      return null;
    }
  }
  
  /**
   * Generate a comparative analysis of multiple literature entries
   */
  public async generateComparativeAnalysis(
    literatureIds: number[],
    context: string = ''
  ): Promise<string> {
    try {
      if (literatureIds.length < 2) {
        throw new Error('At least two literature entries are required for comparative analysis');
      }
      
      // Fetch all literature entries
      const literatureEntries = [];
      for (const id of literatureIds) {
        const entry = await literatureAggregator.getLiteratureById(id);
        if (entry) {
          literatureEntries.push(entry);
        }
      }
      
      if (literatureEntries.length < 2) {
        throw new Error('Could not find at least two valid literature entries');
      }
      
      // Prepare a prompt for the analysis
      let prompt = 'Please provide a comparative analysis of the following literature entries related to medical devices:\n\n';
      
      literatureEntries.forEach((entry, index) => {
        prompt += `--- Entry ${index + 1} ---\n`;
        prompt += `Title: ${entry.title}\n`;
        prompt += `Authors: ${entry.authors || 'Unknown'}\n`;
        prompt += `Journal: ${entry.journal || 'Unknown'}\n`;
        prompt += `Publication Date: ${entry.publication_date || 'Unknown'}\n`;
        prompt += `Abstract: ${entry.abstract || 'Not available'}\n\n`;
      });
      
      // Add context if provided
      if (context) {
        prompt += `Context for analysis: ${context}\n\n`;
      }
      
      prompt += `Please compare these articles for a 510(k) submission, focusing on:
1. Methodological similarities and differences
2. Key findings and their consistency or contradictions
3. Relevance to safety and effectiveness determinations
4. Support for substantial equivalence claims
5. Limitations of each study and overall evidence
6. Regulatory implications for medical device submissions

Format your analysis as a structured report with clear sections addressing each focus area.`;
      
      // Generate the analysis using OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert medical device regulatory specialist with extensive experience in literature analysis for 510(k) submissions. Your comparative analyses are thorough, balanced, and focused on regulatory relevance."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2000
      });
      
      return response.choices[0].message.content || "Unable to generate comparative analysis";
    } catch (error) {
      console.error('Error generating comparative analysis:', error);
      throw error;
    }
  }
  
  /**
   * Generate a 510(k) literature review section based on provided citations
   */
  public async generate510kLiteratureReviewSection(
    documentId: string,
    deviceType: string,
    predicateDevice?: string
  ): Promise<string> {
    try {
      // Fetch all citations for this document
      const client = await pool.connect();
      let citations;
      
      try {
        const citationsQuery = `
          SELECT c.*, l.title, l.abstract, l.authors, l.journal, l.publication_date
          FROM literature_citations c
          JOIN literature_entries l ON c.literature_id = l.id
          WHERE c.document_id = $1
          ORDER BY c.inserted_at ASC
        `;
        
        const result = await client.query(citationsQuery, [documentId]);
        citations = result.rows;
      } finally {
        client.release();
      }
      
      if (!citations || citations.length === 0) {
        return "No citations found for this document. Add literature citations before generating a review section.";
      }
      
      // Prepare a prompt for the literature review section
      let prompt = `Please write a comprehensive literature review section for a 510(k) submission for a ${deviceType} medical device`;
      
      if (predicateDevice) {
        prompt += ` with ${predicateDevice} as the predicate device`;
      }
      
      prompt += `. Base your review on the following literature citations:\n\n`;
      
      citations.forEach((citation, index) => {
        prompt += `--- Citation ${index + 1} ---\n`;
        prompt += `Title: ${citation.title}\n`;
        prompt += `Authors: ${citation.authors || 'Unknown'}\n`;
        prompt += `Journal: ${citation.journal || 'Unknown'}\n`;
        prompt += `Date: ${citation.publication_date || 'Unknown'}\n`;
        prompt += `Abstract: ${citation.abstract || 'Not available'}\n\n`;
      });
      
      prompt += `Structure the literature review section to:
1. Introduce the context and purpose of the literature review
2. Summarize key findings relevant to device safety and effectiveness
3. Discuss evidence supporting substantial equivalence claims
4. Address any potential concerns or contradictory findings
5. Conclude with an assessment of the literature's support for the 510(k) submission

Format the section as a professional, well-structured portion of a 510(k) submission document.`;
      
      // Generate the literature review section using OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert medical device regulatory specialist who writes comprehensive and persuasive literature review sections for 510(k) submissions. Your writing is clear, scientifically accurate, and focused on demonstrating safety, effectiveness, and substantial equivalence."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 3000
      });
      
      return response.choices[0].message.content || "Unable to generate literature review section";
    } catch (error) {
      console.error('Error generating 510(k) literature review section:', error);
      throw error;
    }
  }
}