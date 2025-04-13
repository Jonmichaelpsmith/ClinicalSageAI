/**
 * Sage+ Memory-Based AI Assistant Service
 * 
 * This service provides an enhanced AI research assistant with long-term memory
 * using vector embeddings stored in PostgreSQL for document and conversation history.
 */

import { db } from './db';
import { pgTable, serial, integer, varchar, text, timestamp, json, boolean } from 'drizzle-orm/pg-core';
import { eq, sql, desc } from 'drizzle-orm';

// Define temporary schema for CSR tables until they are properly added to the schema file
export const csrSegments = pgTable('csr_segments', {
  id: serial('id').primaryKey(),
  reportId: integer('report_id').notNull(),
  segmentNumber: integer('segment_number').notNull(),
  segmentType: varchar('segment_type', { length: 50 }).notNull(),
  content: text('content').notNull(),
  pageNumbers: varchar('page_numbers', { length: 100 }),
  embedding: json('embedding').notNull(),
  extractedEntities: json('extracted_entities')
});

export const csrReports = pgTable('csr_reports', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  sponsor: varchar('sponsor', { length: 255 }),
  indication: varchar('indication', { length: 255 }),
  phase: varchar('phase', { length: 50 }),
  fileName: varchar('file_name', { length: 255 }),
  fileSize: integer('file_size'),
  uploadDate: timestamp('upload_date').defaultNow(),
  summary: text('summary')
});

export const csrDetails = pgTable('csr_details', {
  id: serial('id').primaryKey(),
  reportId: integer('report_id').notNull(),
  filePath: varchar('file_path', { length: 255 }),
  studyDesign: text('study_design'),
  primaryObjective: text('primary_objective'),
  studyDescription: text('study_description'),
  inclusionCriteria: json('inclusion_criteria').$type<string[]>().default(sql`'[]'`),
  exclusionCriteria: json('exclusion_criteria').$type<string[]>().default(sql`'[]'`),
  endpoints: json('endpoints').default(sql`'[]'`),
  treatmentArms: json('treatment_arms').default(sql`'[]'`),
  processed: boolean('processed').default(false),
  processingStatus: varchar('processing_status', { length: 50 }).default('pending')
});
import PDFParse from 'pdf-parse';
import * as tf from '@tensorflow/tfjs-node';
import axios from 'axios';

/**
 * Vector operations for document similarity
 */
class VectorOperations {
  /**
   * Generate an embedding vector for text using Hugging Face Inference API
   * @param text Text to generate embedding for
   * @returns Array of embedding values
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Check if HF_API_KEY is available
      if (!process.env.HF_API_KEY) {
        console.warn('HF_API_KEY not available, using fallback embedding method');
        // Use TensorFlow as a fallback
        return this.generateTensorflowEmbedding(text);
      }

      // Use Hugging Face for embedding generation
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2',
        { inputs: text },
        {
          headers: {
            Authorization: `Bearer ${process.env.HF_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (Array.isArray(response.data)) {
        // Return the first embedding array from the response
        return response.data[0];
      } else {
        throw new Error('Unexpected response format from Hugging Face API');
      }
    } catch (error) {
      console.error('Error generating embedding from Hugging Face, using fallback:', error);
      return this.generateTensorflowEmbedding(text);
    }
  }

  /**
   * Generate a simple embedding vector using TensorFlow Universal Sentence Encoder
   * This is a fallback method when external API is not available
   */
  static async generateTensorflowEmbedding(text: string): Promise<number[]> {
    try {
      // Load Universal Sentence Encoder model
      const model = await tf.node.loadSavedModel(
        'https://tfhub.dev/google/universal-sentence-encoder/4',
        ['serve'],
        'serving_default'
      );
      
      // Get embeddings
      const embeddings = model.predict({ 'inputs': [text] });
      
      // Convert to array
      const values = Array.from(await embeddings.arraySync()[0]);
      
      // Return embedding array
      return values;
    } catch (error) {
      console.error('Error with TensorFlow embedding:', error);
      // Fallback to random vector as last resort
      return Array.from({ length: 512 }, () => Math.random() * 2 - 1);
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

/**
 * Sage+ Memory-Based AI Assistant Service
 */
export class SagePlusService {
  /**
   * Initialize any database extensions or tables needed for the service
   */
  static async initVectorExtension(): Promise<void> {
    // Since we're using JSONB for storing embeddings, we don't need
    // a special extension. Just create any necessary tables or indexes.
    try {
      // We could add additional initialization here if needed
      console.log('Sage+ initialization complete');
      return Promise.resolve();
    } catch (error) {
      console.error('Error initializing Sage+:', error);
      throw error;
    }
  }

  /**
   * Process a PDF file and extract segments with vector embeddings
   * @param pdfBuffer Buffer containing the PDF file data
   * @param reportId Associated report ID
   */
  static async processDocumentWithVectors(pdfBuffer: Buffer, reportId: number): Promise<void> {
    try {
      // Parse PDF document
      const pdfData = await PDFParse(pdfBuffer);
      
      // Split into segments (e.g., paragraphs or pages)
      const segments = this.splitIntoSegments(pdfData.text);
      
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        if (segment.trim().length < 10) continue; // Skip very short segments
        
        // Generate embedding for segment
        const embedding = await VectorOperations.generateEmbedding(segment);
        
        // Store segment with embedding
        await db.insert(csrSegments).values({
          reportId,
          segmentNumber: i + 1,
          segmentType: 'text',
          content: segment,
          pageNumbers: `${Math.floor(i / 2) + 1}`, // Rough estimation of page number
          embedding: JSON.stringify(embedding),
          extractedEntities: null
        });
      }
      
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    }
  }

  /**
   * Split text into meaningful segments
   * @param text Full document text
   * @returns Array of text segments
   */
  private static splitIntoSegments(text: string): string[] {
    // Split by double newlines to separate paragraphs
    const paragraphs = text.split(/\n\s*\n/);
    
    // Merge very short paragraphs
    const segments: string[] = [];
    let currentSegment = '';
    
    for (const paragraph of paragraphs) {
      if (paragraph.trim().length < 50) {
        currentSegment += ' ' + paragraph;
      } else {
        if (currentSegment) {
          segments.push(currentSegment.trim());
          currentSegment = '';
        }
        segments.push(paragraph.trim());
      }
    }
    
    if (currentSegment) {
      segments.push(currentSegment.trim());
    }
    
    return segments;
  }

  /**
   * Find relevant documents for a query
   * @param query User's question or query
   * @param limit Maximum number of results to return
   * @returns Array of relevant document segments
   */
  static async findRelevantDocuments(query: string, limit: number = 5): Promise<any[]> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await VectorOperations.generateEmbedding(query);
      
      // Get all segments (in a production system, this would use a more efficient search)
      const allSegments = await db.select().from(csrSegments);
      
      // Calculate similarity scores
      const scoredSegments = allSegments.map(segment => {
        const segmentEmbedding = JSON.parse(segment.embedding as string) as number[];
        const similarity = VectorOperations.cosineSimilarity(queryEmbedding, segmentEmbedding);
        return { ...segment, similarity };
      });
      
      // Sort by similarity and take top results
      const topResults = scoredSegments
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
      
      // Fetch report details for each segment
      const resultsWithReportDetails = await Promise.all(
        topResults.map(async segment => {
          const [report] = await db.select().from(csrReports).where(eq(csrReports.id, segment.reportId));
          return {
            ...segment,
            reportTitle: report?.title || 'Unknown Report',
            reportSponsor: report?.sponsor || 'Unknown Sponsor',
            reportDate: report?.date || null
          };
        })
      );
      
      return resultsWithReportDetails;
    } catch (error) {
      console.error('Error finding relevant documents:', error);
      return [];
    }
  }

  /**
   * Generate an enhanced response with document memory
   * @param userMessage User's question or message
   * @param conversationHistory Previous messages in the conversation
   * @returns AI assistant's response
   */
  static async generateMemoryResponse(userMessage: string, conversationHistory: any[] = []): Promise<string> {
    try {
      // Find relevant document segments
      const relevantDocuments = await this.findRelevantDocuments(userMessage, 3);
      
      // If no HF_API_KEY is available, use a basic response
      if (!process.env.HF_API_KEY) {
        return this.generateBasicResponse(userMessage, relevantDocuments);
      }
      
      // Construct context from relevant documents
      const context = relevantDocuments.map(doc => 
        `[Document: ${doc.reportTitle}, Segment: ${doc.segmentNumber}]\n${doc.content}`
      ).join('\n\n');
      
      // Construct conversation history
      const historyText = conversationHistory.map(msg => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n');
      
      // Construct full prompt
      const prompt = `
Context from clinical study reports:
${context}

Conversation history:
${historyText}

User: ${userMessage}

You are an expert research assistant specializing in clinical trial research. Use the provided context to answer the user's question accurately. If you don't know the answer, say so rather than making up information.
`;
      
      // Call Hugging Face API
      try {
        const response = await axios.post(
          'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
          {
            inputs: prompt,
            parameters: {
              max_new_tokens: 1024,
              temperature: 0.7,
              top_p: 0.95,
              do_sample: true
            }
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.HF_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data && response.data[0] && response.data[0].generated_text) {
          const fullResponse = response.data[0].generated_text;
          // Extract just the assistant's response (after the prompt)
          const responseText = fullResponse.substring(prompt.length).trim();
          return responseText || "I'm not sure how to answer that based on the available information.";
        } else {
          throw new Error('Unexpected response format from Hugging Face API');
        }
      } catch (error) {
        console.error('Error calling Hugging Face API:', error);
        return this.generateBasicResponse(userMessage, relevantDocuments);
      }
    } catch (error) {
      console.error('Error generating memory response:', error);
      return "I'm sorry, I encountered an error while processing your request. Please try again.";
    }
  }
  
  /**
   * Generate a basic response when advanced AI is not available
   * @param userMessage User's question
   * @param relevantDocuments Relevant documents found
   * @returns Simple response based on keyword matching
   */
  private static generateBasicResponse(userMessage: string, relevantDocuments: any[]): string {
    // Simple keyword-based response when AI is not available
    const lowerQuery = userMessage.toLowerCase();
    
    // If no relevant documents were found
    if (relevantDocuments.length === 0) {
      return "I couldn't find any specific information about that in our clinical study reports. Can you try rephrasing your question?";
    }
    
    // Check for common question patterns
    if (lowerQuery.includes('endpoint') || lowerQuery.includes('outcome')) {
      const docTitle = relevantDocuments[0].reportTitle;
      return `Based on the report "${docTitle}", endpoints are discussed in the clinical study. You can find more details by examining the full report. Would you like me to provide a summary of the available information?`;
    }
    
    if (lowerQuery.includes('safety') || lowerQuery.includes('adverse') || lowerQuery.includes('side effect')) {
      const docTitle = relevantDocuments[0].reportTitle;
      return `Safety information is available in the report "${docTitle}". The report contains details about adverse events and safety monitoring. Would you like me to provide the relevant sections?`;
    }
    
    if (lowerQuery.includes('protocol') || lowerQuery.includes('design')) {
      const docTitle = relevantDocuments[0].reportTitle;
      return `The study design for "${docTitle}" is described in the report. It includes information about randomization, blinding, and treatment arms. Would you like more specific details?`;
    }
    
    // Default response with the most relevant document excerpt
    const mostRelevant = relevantDocuments[0];
    const excerpt = mostRelevant.content.length > 300 
      ? mostRelevant.content.substring(0, 300) + '...' 
      : mostRelevant.content;
    
    return `Here's what I found in the report "${mostRelevant.reportTitle}":\n\n${excerpt}\n\nWould you like more information on this topic?`;
  }
  
  /**
   * Upload and process a document for the memory system
   * @param pdfBuffer Buffer containing the PDF file data
   * @param fileName Original name of the file
   * @param metadata Additional metadata for the document
   * @returns Document ID and processing status
   */
  static async uploadDocument(
    pdfBuffer: Buffer, 
    fileName: string,
    metadata: { 
      title?: string; 
      author?: string;
      topic?: string;
      description?: string;
    }
  ): Promise<{ id: number; status: string }> {
    try {
      // Parse PDF document to get basic info
      const pdfData = await PDFParse(pdfBuffer);
      
      // Extract metadata from PDF if available
      const title = metadata.title || pdfData.info.Title || fileName;
      const author = metadata.author || pdfData.info.Author || 'Unknown';
      
      // Create report entry
      const [report] = await db.insert(csrReports).values({
        title: title,
        sponsor: author,
        indication: metadata.topic || 'General',
        phase: 'N/A',
        fileName: fileName,
        fileSize: pdfBuffer.length,
        uploadDate: new Date(),
        summary: metadata.description || pdfData.text.substring(0, 500)
      }).returning();
      
      // Process document in background
      this.processDocumentWithVectors(pdfBuffer, report.id)
        .then(() => {
          console.log(`Document ${report.id} processed successfully`);
        })
        .catch(err => {
          console.error(`Error processing document ${report.id}:`, err);
        });
      
      return {
        id: report.id,
        status: 'processing'
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }
}