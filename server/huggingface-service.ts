/**
 * Hugging Face AI Service for the Research Companion
 * 
 * This service provides a friendly AI research assistant powered by
 * Hugging Face's Inference API using models like flan-t5-small.
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

// Change to flan-t5-small which we verified working
const HF_MODEL_URL = 'https://api-inference.huggingface.co/models/google/flan-t5-small';

/**
 * Query the Hugging Face Inference API directly
 */
export async function queryHuggingFace(prompt: string, max_new_tokens: number = 250, temperature: number = 0.7): Promise<string> {
  const HF_API_KEY = process.env.HF_API_KEY;
  
  if (!HF_API_KEY) {
    console.error('Hugging Face API key is missing');
    throw new Error('HF_API_KEY environment variable is not set');
  }

  const headers = {
    Authorization: `Bearer ${HF_API_KEY}`,
    'Content-Type': 'application/json',
  };

  const payload = {
    inputs: prompt,
    parameters: {
      max_new_tokens,
      temperature,
    },
  };

  try {
    console.log('Sending request to Hugging Face API...');
    
    const response = await axios.post(HF_MODEL_URL, payload, { headers });
    return response.data || '[No response]';
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
      const answer = await queryHuggingFace(prompt);
      return answer;
    } catch (error: any) {
      console.error('Error answering CSR question:', error);
      throw new Error(`Failed to answer CSR question: ${error.message}`);
    }
  }
}

export const huggingFaceService = new HuggingFaceService();