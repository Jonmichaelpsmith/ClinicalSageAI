/**
 * Sage+ Memory-Based AI Assistant Service
 * 
 * This service provides an enhanced AI research assistant with long-term memory
 * using vector embeddings stored in PostgreSQL for document and conversation history.
 */

import * as tf from '@tensorflow/tfjs-node';
import { db } from './db';
import { huggingFaceService } from './huggingface-service';
import PDFParser from 'pdf-parse';
import { SQL, eq, sql } from 'drizzle-orm';
import { csrDetails, csrReports, csrSegments } from '@shared/schema';
import fs from 'fs/promises';
import path from 'path';

// Enhanced persona with memory context
const SAGE_PLUS_PERSONA = `
You are Sage+, an advanced and friendly research assistant specialized in clinical trials, medical research, 
and pharmaceutical drug development. You have access to a knowledge base of clinical study reports, 
medical literature, and historical conversations.

Your capabilities include:
- Recalling information from previously analyzed documents
- Understanding complex clinical trial designs and outcomes
- Providing evidence-based insights from medical literature
- Maintaining context across multiple conversation sessions

Always provide thoughtful, accurate responses based on the available information. When information is 
incomplete or uncertain, acknowledge those limitations. Be helpful, precise, and supportive in guiding 
researchers through complex biomedical questions.
`;

/**
 * Vector operations for document similarity
 */
class VectorOperations {
  /**
   * Generate an embedding vector for text using TensorFlow
   * @param text Text to generate embedding for
   * @returns Float32Array of embedding values
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    // Preprocess text - lowercase, remove extra whitespace
    const preprocessedText = text.toLowerCase().replace(/\\s+/g, ' ').trim();
    
    // Use Universal Sentence Encoder or similar model
    // This is a simplified version; in production, use a proper embedding model
    const model = await tf.loadGraphModel(
      'https://tfhub.dev/tensorflow/tfjs-model/universal-sentence-encoder-lite/1/default/1',
      { fromTFHub: true }
    );
    
    // Generate embedding
    const embeddings = await model.predict(tf.tensor([preprocessedText]));
    const embeddingArray = await embeddings.array();
    
    // Return the first embedding as a regular array
    return Array.from(embeddingArray[0]);
  }
  
  /**
   * Calculate cosine similarity between two vectors
   */
  static cosineSimilarity(vecA: number[], vecB: number[]): number {
    // Calculate dot product
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    
    // Calculate magnitudes
    const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    
    // Calculate cosine similarity
    return dotProduct / (magA * magB);
  }
}

/**
 * Sage+ Memory-Based AI Assistant Service
 */
export class SagePlusService {
  /**
   * Initialize PostgreSQL pgvector extension if not already done
   */
  static async initVectorExtension(): Promise<void> {
    try {
      // Check if pgvector extension is already created
      const extensionExists = await db.execute(sql`
        SELECT 1 FROM pg_extension WHERE extname = 'vector';
      `);
      
      if (extensionExists.length === 0) {
        // Create the pgvector extension
        await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector;`);
        console.log('PostgreSQL vector extension created successfully');
      }
    } catch (error) {
      console.error('Failed to initialize vector extension:', error);
      throw new Error('Failed to initialize vector extension');
    }
  }
  
  /**
   * Process a PDF file and extract segments with vector embeddings
   * @param filePath Path to the PDF file
   * @param reportId Associated report ID
   */
  static async processDocumentWithVectors(filePath: string, reportId: number): Promise<void> {
    try {
      // Read the PDF file
      const pdfBuffer = await fs.readFile(filePath);
      const pdfData = await PDFParser(pdfBuffer);
      const fullText = pdfData.text;
      
      // Split into segments (paragraphs or sections)
      const segments = fullText.split(/\n\n+/).filter(segment => 
        segment.trim().length > 100); // Only keep substantial segments
      
      // Process each segment
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const segmentText = segment.trim();
        
        // Skip very short segments
        if (segmentText.length < 100) continue;
        
        // Generate embedding vector
        const embedding = await VectorOperations.generateEmbedding(segmentText);
        
        // Store segment with vector in database
        await db.execute(sql`
          INSERT INTO csr_segments (
            report_id,
            segment_text,
            segment_type,
            page_number,
            position,
            embedding
          ) VALUES (
            ${reportId},
            ${segmentText},
            'pdf_extract',
            ${Math.floor(i / 5) + 1}, -- Approximate page number
            ${i},
            ${sql.array(embedding)}::vector
          )
        `);
      }
      
      console.log(`Processed document segments for report ID ${reportId}`);
    } catch (error) {
      console.error(`Error processing document with vectors: ${error}`);
      throw error;
    }
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
      
      // Search for similar segments using vector similarity
      const results = await db.execute(sql`
        SELECT 
          s.id,
          s.segment_text,
          s.segment_type,
          s.page_number,
          r.title as report_title,
          r.id as report_id,
          s.embedding <=> ${sql.array(queryEmbedding)}::vector as distance
        FROM 
          csr_segments s
        JOIN
          csr_reports r ON s.report_id = r.id
        ORDER BY 
          s.embedding <=> ${sql.array(queryEmbedding)}::vector
        LIMIT ${limit}
      `);
      
      return results;
    } catch (error) {
      console.error(`Error finding relevant documents: ${error}`);
      return [];
    }
  }
  
  /**
   * Generate an enhanced response with document memory
   * @param userMessage User's question or message
   * @param conversationHistory Previous messages in the conversation
   * @returns AI assistant's response
   */
  static async generateMemoryResponse(userMessage: string, conversationHistory: any[]): Promise<string> {
    try {
      // Find relevant documents for this query
      const relevantDocs = await this.findRelevantDocuments(userMessage);
      
      // Build context from relevant documents
      let documentContext = '';
      if (relevantDocs.length > 0) {
        documentContext = 'Relevant information from documents:\n\n';
        relevantDocs.forEach((doc, index) => {
          documentContext += `[Document ${index + 1}] ${doc.report_title} (Page ${doc.page_number}):\n${doc.segment_text}\n\n`;
        });
      }
      
      // Build the conversation history context
      let conversationContext = '';
      if (conversationHistory.length > 0) {
        // Get the last few messages (excluding system messages)
        const recentMessages = conversationHistory
          .filter(msg => msg.role !== 'system')
          .slice(-6); // Last 6 messages
          
        recentMessages.forEach(msg => {
          if (msg.role === 'user') {
            conversationContext += `User: ${msg.content}\n\n`;
          } else if (msg.role === 'assistant') {
            conversationContext += `Sage+: ${msg.content}\n\n`;
          }
        });
      }
      
      // Combine all contexts
      const fullPrompt = `${SAGE_PLUS_PERSONA}
      
${documentContext ? 'DOCUMENT CONTEXT:\n' + documentContext + '\n' : ''}

${conversationContext ? 'CONVERSATION HISTORY:\n' + conversationContext + '\n' : ''}

User: ${userMessage}

Sage+:`;
      
      // Use Hugging Face service to generate the response
      return await huggingFaceService.queryModel(fullPrompt, undefined, {
        temperature: 0.7,
        max_new_tokens: 800
      });
    } catch (error) {
      console.error(`Error generating memory response: ${error}`);
      return 'I apologize, but I encountered an error processing your request. Please try again.';
    }
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
    } = {}
  ): Promise<{ id: number; status: string }> {
    try {
      // Parse basic information from PDF
      const pdfData = await PDFParser(pdfBuffer);
      
      // Insert document record
      const [report] = await db.insert(csrReports).values({
        title: metadata.title || fileName,
        fileName: fileName,
        fileSize: pdfBuffer.length,
        sponsor: metadata.author || 'Unknown',
        indication: metadata.topic || 'General',
        phase: 'Unknown',
        status: 'Processing'
      }).returning();
      
      // Save PDF to disk
      const filePath = path.join(process.cwd(), 'uploads', `${report.id}_${fileName}`);
      await fs.writeFile(filePath, pdfBuffer);
      
      // Process document in the background
      setTimeout(async () => {
        try {
          await this.processDocumentWithVectors(filePath, report.id);
          
          // Update status to processed
          await db.update(csrReports)
            .set({ status: 'Processed' })
            .where(eq(csrReports.id, report.id));
            
          console.log(`Document ${report.id} processed successfully`);
        } catch (error) {
          console.error(`Failed to process document ${report.id}:`, error);
          
          // Update status to failed
          await db.update(csrReports)
            .set({ status: 'Failed' })
            .where(eq(csrReports.id, report.id));
        }
      }, 100); // Start processing almost immediately but don't block response
      
      return {
        id: report.id,
        status: 'Processing'
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      throw new Error('Failed to upload and process document');
    }
  }
}

// Create and export a singleton instance
export const sagePlusService = new SagePlusService();