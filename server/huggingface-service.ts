/**
 * Hugging Face Integration Service
 * 
 * This service provides integration with Hugging Face's Inference API
 * for all AI-powered features, replacing OpenAI and Perplexity integrations.
 */

import axios from 'axios';
import { db } from './db';
import { users, chatConversations, chatMessages } from '../shared/schema';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { Json } from '@prisma/client/runtime/library';

// Hugging Face API configuration
const HF_API_URL = 'https://api-inference.huggingface.co/models';
const HF_API_KEY = process.env.HF_API_KEY;

// Default models
const DEFAULT_TEXT_MODEL = 'mistralai/Mixtral-8x7B-Instruct-v0.1';
const DEFAULT_EMBEDDINGS_MODEL = 'BAAI/bge-large-en-v1.5';
const DEFAULT_MULTIMODAL_MODEL = 'llava-hf/llava-1.5-13b-hf';

// Error message for missing API key
const MISSING_API_KEY_ERROR = 'Hugging Face API key not configured. Please set the HF_API_KEY environment variable.';

/**
 * Query the Hugging Face Inference API for text generation
 * 
 * @param prompt The prompt text to send to the model
 * @param modelId Optional model ID to use (defaults to Mixtral 8x7B)
 * @param temperature Optional temperature parameter (defaults to 0.7)
 * @param maxTokens Optional maximum tokens to generate (defaults to 1024)
 * @returns Generated text response
 */
export async function queryHuggingFace(
  prompt: string,
  modelId: string = DEFAULT_TEXT_MODEL,
  temperature: number = 0.7,
  maxTokens: number = 1024
): Promise<string> {
  if (!HF_API_KEY) {
    throw new Error(MISSING_API_KEY_ERROR);
  }

  try {
    const response = await axios.post(
      `${HF_API_URL}/${encodeURIComponent(modelId)}`,
      {
        inputs: prompt,
        parameters: {
          temperature,
          max_new_tokens: maxTokens,
          return_full_text: false
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      return response.data[0].generated_text || '';
    }
    
    return response.data?.generated_text || '';
  } catch (error: any) {
    console.error('Error querying Hugging Face API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw new Error(`Failed to query Hugging Face API: ${error.message}`);
  }
}

/**
 * Generate text embeddings using Hugging Face models
 * 
 * @param text The text to generate embeddings for
 * @param modelId Optional model ID to use (defaults to BGE-large-en)
 * @returns Vector embedding of the text
 */
export async function generateEmbeddings(
  text: string,
  modelId: string = DEFAULT_EMBEDDINGS_MODEL
): Promise<number[]> {
  if (!HF_API_KEY) {
    throw new Error(MISSING_API_KEY_ERROR);
  }

  try {
    const response = await axios.post(
      `${HF_API_URL}/${encodeURIComponent(modelId)}`,
      { inputs: text },
      {
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // BGE models return embeddings in a specific format
    if (response.data && Array.isArray(response.data)) {
      return response.data[0];
    }
    
    return response.data?.embedding || response.data;
  } catch (error: any) {
    console.error('Error generating embeddings:', error.message);
    throw new Error(`Failed to generate embeddings: ${error.message}`);
  }
}

/**
 * Process an image using a multimodal model
 * 
 * @param imagePath Path to the image file
 * @param prompt Text prompt to accompany the image
 * @param modelId Optional model ID to use (defaults to LLaVA)
 * @returns Generated text response about the image
 */
export async function processImage(
  imagePath: string,
  prompt: string,
  modelId: string = DEFAULT_MULTIMODAL_MODEL
): Promise<string> {
  if (!HF_API_KEY) {
    throw new Error(MISSING_API_KEY_ERROR);
  }

  try {
    // Read and encode the image
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const response = await axios.post(
      `${HF_API_URL}/${encodeURIComponent(modelId)}`,
      {
        inputs: {
          image: base64Image,
          text: prompt
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data?.generated_text || '';
  } catch (error: any) {
    console.error('Error processing image:', error.message);
    throw new Error(`Failed to process image: ${error.message}`);
  }
}

/**
 * Format a chat history for the model
 * 
 * @param messages Array of chat messages
 * @returns Formatted chat history string
 */
function formatChatHistory(messages: Array<{role: string, content: string}>): string {
  // Format for Mixtral and similar models
  let formattedPrompt = '';
  
  for (const message of messages) {
    if (message.role === 'system') {
      formattedPrompt += `<s>[INST] ${message.content} [/INST]</s>\n`;
    } else if (message.role === 'user') {
      formattedPrompt += `<s>[INST] ${message.content} [/INST]</s>\n`;
    } else if (message.role === 'assistant') {
      formattedPrompt += `${message.content}\n`;
    }
  }
  
  return formattedPrompt;
}

/**
 * Create a new chat conversation
 * 
 * @param title The title of the conversation
 * @param userId Optional user ID
 * @param context Optional context information
 * @returns The created conversation ID
 */
export async function createChatConversation(
  title: string,
  userId?: number | null,
  context?: string | null
): Promise<number> {
  try {
    const conversation = {
      title,
      userId,
      context,
      active: true,
      createdAt: new Date()
    };
    
    const [newConversation] = await db.insert(chatConversations).values(conversation).returning();
    
    return newConversation.id;
  } catch (error) {
    console.error('Error creating chat conversation:', error);
    throw new Error('Failed to create chat conversation');
  }
}

/**
 * Add a message to a chat conversation
 * 
 * @param conversationId The conversation ID
 * @param role The role of the message sender (user, assistant, system)
 * @param content The message content
 * @param metadata Optional metadata
 * @returns The created message ID
 */
export async function addChatMessage(
  conversationId: number,
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata?: any
): Promise<number> {
  try {
    const message = {
      role,
      content,
      conversationId,
      metadata,
      createdAt: new Date()
    };
    
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    
    // Update the conversation's last activity time
    await db.update(chatConversations)
      .set({ 
        updatedAt: new Date(),
        title: role === 'user' && content.length <= 100 ? content : undefined 
      })
      .where(sql`${chatConversations.id} = ${conversationId}`);
    
    return newMessage.id;
  } catch (error) {
    console.error('Error adding chat message:', error);
    throw new Error('Failed to add chat message');
  }
}

/**
 * Get all messages for a conversation, ordered by creation time
 * 
 * @param conversationId The conversation ID
 * @returns Array of messages
 */
export async function getChatMessages(conversationId: number): Promise<any[]> {
  try {
    const messages = await db.select()
      .from(chatMessages)
      .where(sql`${chatMessages.conversationId} = ${conversationId}`)
      .orderBy(chatMessages.createdAt);
    
    return messages;
  } catch (error) {
    console.error('Error getting chat messages:', error);
    throw new Error('Failed to get chat messages');
  }
}

/**
 * Get all conversations for a user, ordered by last activity
 * 
 * @param userId The user ID
 * @returns Array of conversations
 */
export async function getChatConversations(userId?: number | null): Promise<any[]> {
  try {
    let query = db.select()
      .from(chatConversations)
      .orderBy(sql`${chatConversations.updatedAt} DESC`);
    
    if (userId) {
      query = query.where(sql`${chatConversations.userId} = ${userId}`);
    }
    
    return await query;
  } catch (error) {
    console.error('Error getting chat conversations:', error);
    throw new Error('Failed to get chat conversations');
  }
}

/**
 * Process a chat message and get a response from the AI
 * 
 * @param conversationId The conversation ID
 * @param userMessage The user's message
 * @returns The AI's response
 */
export async function processChatMessage(
  conversationId: number,
  userMessage: string
): Promise<string> {
  try {
    // Add the user message to the conversation
    await addChatMessage(conversationId, 'user', userMessage);
    
    // Get the conversation history
    const messages = await getChatMessages(conversationId);
    
    // Format the conversation history for the model
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Add system instructions if there are none
    if (!formattedMessages.some(msg => msg.role === 'system')) {
      formattedMessages.unshift({
        role: 'system',
        content: 'You are TrialSage, an AI assistant specialized in clinical trials and clinical study reports. You provide helpful, accurate, and concise information about clinical trials, study designs, and regulatory requirements.'
      });
    }
    
    // Format the prompt
    const prompt = formatChatHistory(formattedMessages);
    
    // Get the response from Hugging Face
    const response = await queryHuggingFace(prompt);
    
    // Add the assistant message to the conversation
    await addChatMessage(conversationId, 'assistant', response);
    
    return response;
  } catch (error) {
    console.error('Error processing chat message:', error);
    const errorMessage = 'I apologize, but I encountered an error while processing your message. Please try again later.';
    
    // Add the error message to the conversation
    await addChatMessage(conversationId, 'assistant', errorMessage);
    
    return errorMessage;
  }
}

/**
 * Delete a chat conversation
 * 
 * @param conversationId The conversation ID
 * @returns Success indication
 */
export async function deleteChatConversation(conversationId: number): Promise<boolean> {
  try {
    // Soft delete by marking as inactive
    await db.update(chatConversations)
      .set({ active: false })
      .where(sql`${chatConversations.id} = ${conversationId}`);
    
    return true;
  } catch (error) {
    console.error('Error deleting chat conversation:', error);
    throw new Error('Failed to delete chat conversation');
  }
}

/**
 * Train a custom model using clinical trial data
 * 
 * @param datasetPath Path to the dataset file
 * @param modelName Name to give the fine-tuned model
 * @returns Status message
 */
export async function trainCustomModel(
  datasetPath: string,
  modelName: string
): Promise<string> {
  if (!HF_API_KEY) {
    throw new Error(MISSING_API_KEY_ERROR);
  }

  // This is a placeholder for model training
  // In a real implementation, we would use the Hugging Face API to train a custom model
  console.log(`Would train model ${modelName} with dataset ${datasetPath}`);
  
  return `Model training initiated for ${modelName} using ${path.basename(datasetPath)}`;
}