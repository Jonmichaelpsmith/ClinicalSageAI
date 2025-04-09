/**
 * Hugging Face AI Service for TrialSage
 * 
 * This service provides access to various open-source AI models via the Hugging Face
 * Inference API, supporting tasks like text generation, trial analysis, and Q&A about CSRs.
 */
import axios from 'axios';
import { db } from './db';
import { 
  chatConversations, 
  chatMessages,
  type ChatConversation,
  type ChatMessage,
  type InsertChatConversation,
  type InsertChatMessage
} from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';

// Available model endpoints
export enum HFModel {
  // Basic text generation models
  FLAN_T5_SMALL = 'google/flan-t5-small',        // Fast, lightweight model
  FLAN_T5_XL = 'google/flan-t5-xl',              // Better quality, larger model
  LLAMA3_8B = 'meta-llama/Meta-Llama-3-8B',      // Strong general purpose 8B parameter model
  
  // Specialized models
  MISTRAL_7B = 'mistralai/Mistral-7B-Instruct-v0.2',  // Good instruction following
  ZEPHYR_7B = 'HuggingFaceH4/zephyr-7b-beta',    // Good for scientific text
  GEMMA_7B = 'google/gemma-7b-it',               // Good instruction-tuned model
  
  // Text-to-SQL models
  SQL_CODER = 'defog/sqlcoder-7b-2',             // Specialized for SQL generation
  
  // Structured output models
  STARLING = 'Nexusflow/Starling-LM-7B-alpha',   // Good structured output
}

// Default model to use
const DEFAULT_MODEL = HFModel.FLAN_T5_SMALL;

/**
 * Query the Hugging Face Inference API
 * 
 * @param prompt The text prompt to send to the model
 * @param model The specific model to use (from HFModel enum)
 * @param max_new_tokens Maximum number of tokens to generate
 * @param temperature Temperature for generation (0.0-1.0) - higher = more random
 * @param options Additional model-specific parameters
 * @returns The generated text response
 */
export async function queryHuggingFace(
  prompt: string, 
  model: HFModel = DEFAULT_MODEL,
  max_new_tokens: number = 512, 
  temperature: number = 0.7,
  options: Record<string, any> = {}
): Promise<string> {
  const HF_API_KEY = process.env.HF_API_KEY;
  
  if (!HF_API_KEY) {
    console.error('Hugging Face API key is missing');
    throw new Error('HF_API_KEY environment variable is not set');
  }

  const headers = {
    Authorization: `Bearer ${HF_API_KEY}`,
    'Content-Type': 'application/json',
  };

  // Base parameters that work with most models
  const parameters = {
    max_new_tokens,
    temperature,
    top_p: 0.95,
    ...options
  };

  // Construct the model URL
  const hfModelUrl = `https://api-inference.huggingface.co/models/${model}`;
  
  console.log(`Using Hugging Face model: ${model}`);

  try {
    console.log('Sending request to Hugging Face API...');
    
    const response = await axios.post(hfModelUrl, {
      inputs: prompt,
      parameters
    }, { headers });
    
    // Handle different response formats based on the model
    if (Array.isArray(response.data) && response.data[0]?.generated_text) {
      // Format for models like Mistral, LLaMA, etc.
      return response.data[0].generated_text;
    } else if (response.data?.generated_text) {
      // Alternative format
      return response.data.generated_text;
    } else {
      // Fallback - just return whatever we got
      return response.data?.toString() || '[No response]';
    }
  } catch (error: any) {
    console.error('Hugging Face API error:', error.message);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw new Error(`Hugging Face API error: ${error.message}`);
  }
}

/**
 * Hugging Face AI Service
 */
export class HuggingFaceService {
  /**
   * Check if the API key is available
   * @returns True if API key is available, false otherwise
   */
  isApiKeyAvailable(): boolean {
    return !!process.env.HF_API_KEY;
  }

  /**
   * Create a new conversation
   * @param userId Optional user ID associated with the conversation
   * @param reportId Optional report ID associated with the conversation
   * @param title Optional title for the conversation
   * @returns The created conversation
   */
  async createConversation(
    userId?: number,
    reportId?: number,
    title?: string
  ): Promise<ChatConversation> {
    const conversation: InsertChatConversation = {
      title: title || 'New Conversation',
      userId: userId || null,
      reportId: reportId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      active: true,
    };

    const [result] = await db.insert(chatConversations).values(conversation).returning();
    return result;
  }

  /**
   * Add a message to a conversation
   * @param conversationId The ID of the conversation
   * @param role The role of the message sender (user/assistant/system)
   * @param content The content of the message
   * @param metadata Optional metadata for the message
   * @returns The created message
   */
  async addMessageToConversation(
    conversationId: number,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: Record<string, any>
  ): Promise<ChatMessage> {
    const message: InsertChatMessage = {
      conversationId,
      role,
      content,
      metadata: metadata || {},
      createdAt: new Date(),
    };

    const [result] = await db.insert(chatMessages).values(message).returning();
    
    // Update conversation's updatedAt
    await db.update(chatConversations)
      .set({ updatedAt: new Date() })
      .where(eq(chatConversations.id, conversationId));
    
    return result;
  }

  /**
   * Get messages from a conversation
   * @param conversationId The ID of the conversation
   * @param limit Maximum number of messages to retrieve
   * @returns Array of messages
   */
  async getConversationMessages(
    conversationId: number,
    limit: number = 50
  ): Promise<ChatMessage[]> {
    const messages = await db.select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(chatMessages.createdAt)
      .limit(limit);
    
    return messages;
  }

  /**
   * Get all active conversations
   * @param userId Optional user ID to filter conversations
   * @returns Array of conversations
   */
  async getConversations(userId?: number): Promise<ChatConversation[]> {
    const query = db.select()
      .from(chatConversations)
      .orderBy(desc(chatConversations.updatedAt))
      .where(eq(chatConversations.active, true));

    if (userId) {
      // Filtering by user ID if provided
      query.where(eq(chatConversations.userId, userId));
    }

    return await query;
  }

  /**
   * Generate a new message in a conversation from the Research Companion persona
   * @param conversationId The ID of the conversation
   * @param userMessage The user's message to respond to
   * @returns The generated response message
   */
  async generateConversationResponse(
    conversationId: number,
    userMessage: string
  ): Promise<ChatMessage> {
    // First, get context from previous messages
    const messages = await this.getConversationMessages(conversationId);
    
    // Build a context prompt with the recent conversation history
    let context = 'You are SagePlus, an AI research assistant specialized in clinical trials and medical research. You help researchers analyze Clinical Study Reports (CSRs) and make informed decisions about trial design. You are friendly, helpful, and provide detailed but concise responses.\n\n';
    
    // Add relevant conversation history (last 5 messages)
    const recentMessages = messages.slice(-5);
    for (const msg of recentMessages) {
      context += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    }
    
    // Add the current user query
    context += `\nUser: ${userMessage}\n\nAssistant: `;
    
    try {
      // Get response from Hugging Face
      const aiResponse = await queryHuggingFace(context);
      
      // Save the response as a new message
      const responseMessage = await this.addMessageToConversation(
        conversationId,
        'assistant',
        aiResponse,
        { source: 'huggingface' }
      );
      
      return responseMessage;
    } catch (error: any) {
      console.error('Error generating response:', error);
      
      // Save error message as assistant response
      const errorMessage = await this.addMessageToConversation(
        conversationId,
        'assistant',
        `I'm sorry, I encountered an error while processing your request. ${error.message}`,
        { error: error.message }
      );
      
      return errorMessage;
    }
  }

  /**
   * Generate protocol suggestions based on specific indications and phases
   * @param indication The medical indication/condition
   * @param phase The clinical trial phase 
   * @param additionalContext Any additional context about the protocol
   * @returns Suggested protocol elements
   */
  async generateProtocolSuggestions(
    indication: string,
    phase: string,
    additionalContext?: string
  ): Promise<string> {
    const prompt = `
    As a clinical trial protocol expert, generate suggestions for a ${phase} clinical trial protocol for ${indication}.
    
    ${additionalContext ? 'Additional context: ' + additionalContext : ''}
    
    Please provide specific recommendations for:
    1. Primary and secondary endpoints 
    2. Inclusion/exclusion criteria
    3. Sample size considerations
    4. Study design (randomization, blinding, etc.)
    5. Statistical analysis approaches
    `;
    
    try {
      const suggestions = await queryHuggingFace(prompt);
      return suggestions;
    } catch (error: any) {
      console.error('Error generating protocol suggestions:', error);
      throw new Error(`Failed to generate protocol suggestions: ${error.message}`);
    }
  }

  /**
   * Answer specific questions about CSR reports
   * @param question The specific question about a CSR report
   * @param reportContent Relevant content from the CSR report
   * @returns An answer to the question based on the report content
   */
  async answerCSRQuestion(
    question: string,
    reportContent: string
  ): Promise<string> {
    const prompt = `
    As a clinical research assistant, answer the following question about a Clinical Study Report (CSR):
    
    Question: ${question}
    
    Relevant CSR Content: 
    ${reportContent.substring(0, 3000)} // Truncate if too long
    
    Please provide a clear and concise answer based specifically on the information provided in the CSR content.
    `;
    
    try {
      // Use a more powerful model for detailed analysis
      const answer = await queryHuggingFace(prompt, HFModel.MISTRAL_7B, 1024, 0.5);
      return answer;
    } catch (error: any) {
      console.error('Error answering CSR question:', error);
      throw new Error(`Failed to answer CSR question: ${error.message}`);
    }
  }
  
  /**
   * Generate SQL queries from natural language
   * 
   * @param question The natural language question about clinical trial data
   * @param tableSchema The schema of the database tables
   * @returns A SQL query that answers the question
   */
  async generateSQLQuery(
    question: string,
    tableSchema: string
  ): Promise<string> {
    const prompt = `
    You are an expert SQL query generator for a clinical trials database. 
    
    Database Schema:
    ${tableSchema}
    
    User Question: ${question}
    
    Generate a single, efficient PostgreSQL query that answers the question. 
    Only return the SQL query without any explanation or comments.
    `;
    
    try {
      // Use SQL-specialized model
      const sqlQuery = await queryHuggingFace(prompt, HFModel.SQL_CODER, 1024, 0.1);
      // Extract just the SQL part if there's any surrounding text
      const sqlPattern = /```sql\s*([\s\S]*?)\s*```|```([\s\S]*?)```|SELECT[\s\S]*/i;
      const match = sqlQuery.match(sqlPattern);
      return match ? (match[1] || match[2] || match[0]).trim() : sqlQuery.trim();
    } catch (error: any) {
      console.error('Error generating SQL query:', error);
      throw new Error(`Failed to generate SQL query: ${error.message}`);
    }
  }
  
  /**
   * Extract structured information from clinical trial documents
   * 
   * @param documentText Text content from the clinical trial document
   * @param extractionType What type of information to extract (endpoints, criteria, adverse events, etc.)
   * @returns Structured data extracted from the document
   */
  async extractStructuredData(
    documentText: string,
    extractionType: 'endpoints' | 'criteria' | 'adverse_events' | 'all'
  ): Promise<any> {
    // Truncate text if too large
    const truncatedText = documentText.substring(0, 6000);
    
    const prompt = `
    Extract structured information from the following clinical trial text.
    Focus on ${extractionType === 'all' ? 'all relevant information' : extractionType}.
    
    Document Text:
    ${truncatedText}
    
    Return the extracted information as a JSON object with the following structure:
    ${this.getExtractionSchema(extractionType)}
    
    Only return valid JSON without any explanation or additional text.
    `;
    
    try {
      // Use a model good at structured data extraction
      const response = await queryHuggingFace(prompt, HFModel.STARLING, 2048, 0.2);
      
      // Try to extract valid JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.error('Error parsing extracted JSON:', parseError);
          return { error: 'Failed to parse structured data', partial_text: response };
        }
      } else {
        return { error: 'No structured data found', text: response };
      }
    } catch (error: any) {
      console.error('Error extracting structured data:', error);
      throw new Error(`Failed to extract structured data: ${error.message}`);
    }
  }
  
  /**
   * Generate comprehensive trial comparisons between two or more clinical trials
   * 
   * @param trials Array of trial data to compare
   * @returns Structured comparison data
   */
  async compareTrials(trials: Array<{id: number, title: string, data: string}>): Promise<any> {
    if (trials.length < 2) {
      throw new Error('At least two trials are required for comparison');
    }
    
    // Create a summarized version of each trial
    const trialSummaries = trials.map(t => 
      `Trial ${t.id} - ${t.title}: ${t.data.substring(0, 1000)}...`
    ).join('\n\n');
    
    const prompt = `
    Compare the following clinical trials and provide a structured analysis of their similarities and differences.
    
    ${trialSummaries}
    
    Focus on comparing:
    1. Study designs
    2. Primary and secondary endpoints
    3. Patient populations
    4. Efficacy results
    5. Safety profiles
    
    Return your analysis as a JSON object with the following structure:
    {
      "comparisonSummary": "Brief overall comparison",
      "designComparison": { 
        "similarities": ["Similar design aspect 1", ...], 
        "differences": ["Different design aspect 1", ...] 
      },
      "endpointComparison": { 
        "similarities": ["Similar endpoint 1", ...], 
        "differences": ["Different endpoint 1", ...] 
      },
      "populationComparison": { 
        "similarities": ["Similar population aspect 1", ...], 
        "differences": ["Different population aspect 1", ...] 
      },
      "efficacyComparison": { 
        "similarities": ["Similar efficacy result 1", ...], 
        "differences": ["Different efficacy result 1", ...] 
      },
      "safetyComparison": { 
        "similarities": ["Similar safety finding 1", ...], 
        "differences": ["Different safety finding 1", ...] 
      },
      "recommendedTrial": {
        "id": "ID of recommended trial based on quality",
        "reason": "Reason for recommendation"
      }
    }
    
    Only return valid JSON without any explanation or additional text.
    `;
    
    try {
      // Use a powerful model for detailed analysis
      const response = await queryHuggingFace(prompt, HFModel.MISTRAL_7B, 2048, 0.3);
      
      // Try to extract valid JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.error('Error parsing comparison JSON:', parseError);
          return { error: 'Failed to parse comparison data', partial_text: response };
        }
      } else {
        return { error: 'No structured comparison found', text: response };
      }
    } catch (error: any) {
      console.error('Error comparing trials:', error);
      throw new Error(`Failed to compare trials: ${error.message}`);
    }
  }
  
  /**
   * Get the schema template for structured data extraction
   * @param extractionType The type of data to extract
   * @returns A JSON schema template as a string
   */
  private getExtractionSchema(extractionType: string): string {
    const schemas: Record<string, string> = {
      'endpoints': `{
        "primary_endpoints": [
          { "name": "Endpoint name", "description": "Detailed description", "measurement": "How it's measured" }
        ],
        "secondary_endpoints": [
          { "name": "Endpoint name", "description": "Detailed description", "measurement": "How it's measured" }
        ]
      }`,
      
      'criteria': `{
        "inclusion_criteria": [
          { "id": 1, "description": "Criterion description" }
        ],
        "exclusion_criteria": [
          { "id": 1, "description": "Criterion description" }
        ],
        "population_characteristics": {
          "age_range": "e.g. 18-65 years",
          "gender": "Male/Female/Both",
          "other_characteristics": ["Characteristic 1", "Characteristic 2"]
        }
      }`,
      
      'adverse_events': `{
        "serious_adverse_events": [
          { "event": "Event name", "frequency": "Number or percentage", "severity": "Severity level" }
        ],
        "common_adverse_events": [
          { "event": "Event name", "frequency": "Number or percentage", "severity": "Severity level" }
        ],
        "discontinuations": {
          "total": "Number of discontinuations",
          "due_to_adverse_events": "Number due to AEs",
          "details": ["Reason 1", "Reason 2"]
        }
      }`,
      
      'all': `{
        "study_design": {
          "type": "Study type (RCT, observational, etc.)",
          "phase": "Trial phase",
          "blinding": "Blinding approach",
          "randomization": "Randomization details",
          "arms": ["Arm 1 description", "Arm 2 description"]
        },
        "endpoints": {
          "primary": ["Primary endpoint 1", "Primary endpoint 2"],
          "secondary": ["Secondary endpoint 1", "Secondary endpoint 2"]
        },
        "population": {
          "inclusion_criteria": ["Criterion 1", "Criterion 2"],
          "exclusion_criteria": ["Criterion 1", "Criterion 2"],
          "demographics": {
            "age_range": "Age range",
            "gender_distribution": "Gender distribution"
          },
          "size": "Sample size"
        },
        "results": {
          "primary_outcomes": ["Outcome 1 with results", "Outcome 2 with results"],
          "secondary_outcomes": ["Outcome 1 with results", "Outcome 2 with results"],
          "statistical_significance": "Statistical significance information"
        },
        "safety": {
          "serious_adverse_events": ["SAE 1 with frequency", "SAE 2 with frequency"],
          "common_adverse_events": ["AE 1 with frequency", "AE 2 with frequency"],
          "deaths": "Number of deaths if reported"
        },
        "conclusions": "Main study conclusions"
      }`
    };
    
    return schemas[extractionType] || schemas['all'];
  }
}

export const huggingFaceService = new HuggingFaceService();