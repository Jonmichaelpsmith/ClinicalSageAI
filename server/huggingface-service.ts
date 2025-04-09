/**
 * Hugging Face AI Service for the Research Companion
 * 
 * This service provides a friendly AI research assistant powered by
 * Hugging Face's Inference API using models like Mixtral-8x7B-Instruct.
 */

import axios from 'axios';
import { InsertChatMessage, InsertChatConversation, ChatMessage, ChatConversation, chatConversations, chatMessages } from '@shared/schema';
import { db } from './db';
import { eq, asc, desc } from 'drizzle-orm';

const HF_API_KEY = process.env.HF_API_KEY;
const HF_MODEL_URL = 'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1';

// Research companion persona
const RESEARCH_COMPANION_PERSONA = `
You are a helpful and friendly research assistant named TrialSage. 
You help scientists and biotech founders navigate clinical trial data, understand regulatory precedent, and brainstorm trial designs.

You are an expert in clinical trial design, protocol development, and regulatory science. Your job is to guide researchers 
through understanding trial protocols, regulatory strategy, and data analysis.
      
Act like a knowledgeable peer. Be clear, curious, and supportive. Focus on providing practical insights
related to clinical studies, trial design, and pharmaceutical research.

Be brief but insightful. Provide specific, actionable advice when possible.
`;

/**
 * Query the Hugging Face Inference API directly
 */
export async function queryHuggingFace(prompt: string, max_new_tokens: number = 300, temperature: number = 0.5): Promise<string> {
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
    const response = await axios.post(HF_MODEL_URL, payload, { headers });
    return response.data[0]?.generated_text || '[No response]';
  } catch (error) {
    console.error('Hugging Face API error:', error);
    throw new Error(`Failed to query AI model: ${(error as Error).message}`);
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
    return HF_API_KEY !== null && HF_API_KEY !== undefined && HF_API_KEY !== '';
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
    title: string = "New Conversation"
  ): Promise<ChatConversation> {
    const conversation: InsertChatConversation = {
      title,
      active: true
    };
    
    if (userId) conversation.userId = userId;
    if (reportId) conversation.reportId = reportId;
    
    // Insert system message with persona
    const [createdConversation] = await db.insert(chatConversations).values(conversation).returning();
    
    await this.addMessageToConversation(
      createdConversation.id,
      "system",
      RESEARCH_COMPANION_PERSONA
    );
    
    return createdConversation;
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
    role: "user" | "assistant" | "system",
    content: string,
    metadata: Record<string, any> = {}
  ): Promise<ChatMessage> {
    const message: InsertChatMessage = {
      conversationId,
      role,
      content,
      metadata
    };
    
    const [createdMessage] = await db.insert(chatMessages).values(message).returning();
    
    // Update conversation "updated" timestamp
    await db.update(chatConversations)
      .set({ updated: new Date() })
      .where(eq(chatConversations.id, conversationId));
      
    return createdMessage;
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
    return await db.select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(asc(chatMessages.timestamp))
      .limit(limit);
  }
  
  /**
   * Get all active conversations
   * @param userId Optional user ID to filter conversations
   * @returns Array of conversations
   */
  async getConversations(userId?: number): Promise<ChatConversation[]> {
    let query = db.select()
      .from(chatConversations)
      .where(eq(chatConversations.active, true));
      
    if (userId) {
      query = query.where(eq(chatConversations.userId, userId));
    }
    
    return await query.orderBy(desc(chatConversations.updated));
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
    // Add user message to conversation
    await this.addMessageToConversation(conversationId, "user", userMessage);
    
    // Get conversation history
    const messages = await this.getConversationMessages(conversationId);
    
    // Prepare prompt with conversation history
    let prompt = "";
    
    // Add system prompt from first message if it exists
    const systemMessage = messages.find(m => m.role === "system");
    if (systemMessage) {
      prompt += systemMessage.content + "\n\n";
    } else {
      prompt += RESEARCH_COMPANION_PERSONA + "\n\n";
    }
    
    // Add conversation history (skip system messages)
    const conversationHistory = messages
      .filter(m => m.role !== "system")
      .slice(-10); // Only include the last 10 messages for context
    
    for (const message of conversationHistory) {
      if (message.role === "user") {
        prompt += `User: ${message.content}\n\n`;
      } else if (message.role === "assistant") {
        prompt += `TrialSage: ${message.content}\n\n`;
      }
    }
    
    // Add final request for assistant response
    prompt += "TrialSage:";
    
    // Generate response
    const responseContent = await queryHuggingFace(prompt, 500, 0.7);
    
    // Add response to conversation
    const assistantMessage = await this.addMessageToConversation(
      conversationId, 
      "assistant", 
      responseContent,
      { model: "huggingface-mixtral" }
    );
    
    return assistantMessage;
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
    additionalContext: string = ''
  ): Promise<string> {
    const prompt = `As a clinical trial protocol expert, provide detailed suggestions for a ${phase} clinical trial targeting ${indication}.
    
    Focus on the following key elements:
    1. Primary and secondary endpoints that are appropriate for ${indication} studies
    2. Suitable inclusion/exclusion criteria
    3. Recommended sample size and statistical power considerations
    4. Safety monitoring recommendations
    5. Study design considerations (randomization, blinding, control groups)
    
    ${additionalContext ? 'Additional context: ' + additionalContext : ''}
    
    Format your response as actionable suggestions a researcher could implement.`;
    
    return await queryHuggingFace(prompt, 500, 0.5);
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
    const prompt = `As an AI research assistant, analyze this excerpt from a Clinical Study Report and answer the user's question.
    
    CSR content: ${reportContent.slice(0, 3500)} ${reportContent.length > 3500 ? '...' : ''}
    
    User question: ${question}
    
    Provide a concise but comprehensive answer based solely on the CSR content provided. If the information isn't available in the content, acknowledge this limitation.`;
    
    return await queryHuggingFace(prompt, 400, 0.5);
  }
}

// Create and export a singleton instance
export const huggingFaceService = new HuggingFaceService();