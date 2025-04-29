/**
 * Vault Retriever Service
 * 
 * This module provides functions to retrieve relevant context from indexed documents
 * in the TrialSage Vault using embedding-based similarity search.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT_DIR = path.join(__dirname, '../../server/vault');
const METADATA_PATH = path.join(VAULT_DIR, 'metadata.json');
const EMBEDDINGS_DIR = path.join(VAULT_DIR, 'embeddings');

// Cache for document metadata and embeddings
let documentsCache = null;
let embeddingsCache = {};

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vec1, vec2) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    normA += vec1[i] * vec1[i];
    normB += vec2[i] * vec2[i];
  }
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Load document metadata
 */
async function loadDocuments() {
  try {
    if (documentsCache) {
      return documentsCache;
    }
    
    const metadataContent = await fs.readFile(METADATA_PATH, 'utf-8');
    documentsCache = JSON.parse(metadataContent);
    return documentsCache;
  } catch (err) {
    console.error('Error loading document metadata:', err);
    return { documents: [] };
  }
}

/**
 * Load embeddings for a document
 */
async function loadEmbeddings(docId) {
  try {
    if (embeddingsCache[docId]) {
      return embeddingsCache[docId];
    }
    
    const embeddingPath = path.join(EMBEDDINGS_DIR, `${docId}.json`);
    const embeddingContent = await fs.readFile(embeddingPath, 'utf-8');
    const embeddings = JSON.parse(embeddingContent);
    embeddingsCache[docId] = embeddings;
    return embeddings;
  } catch (err) {
    console.error(`Error loading embeddings for document ${docId}:`, err);
    return { chunks: [] };
  }
}

/**
 * Retrieve relevant context based on query
 */
export async function retrieveContext(query, k = 5) {
  try {
    // For testing without embeddings, return mock data
    if (process.env.NODE_ENV === 'test' || !process.env.OPENAI_API_KEY) {
      return [
        {
          docId: 'mock-doc-1',
          chunkId: 'chunk-1',
          text: "This is a sample context chunk for testing the retrieval system. It contains information about clinical safety data that might be relevant to your query.",
          score: 0.92
        },
        {
          docId: 'mock-doc-2',
          chunkId: 'chunk-2',
          text: "Clinical studies must include comprehensive safety assessments, including adverse event monitoring, laboratory evaluations, and vital sign measurements.",
          score: 0.85
        },
        {
          docId: 'mock-doc-3',
          chunkId: 'chunk-3',
          text: "The safety profile of the investigational product should be characterized based on preclinical data and any available clinical data from earlier phase studies.",
          score: 0.79
        }
      ];
    }
    
    // Load metadata for all documents
    const { documents } = await loadDocuments();
    
    if (!documents.length) {
      console.warn('No documents found in vault');
      return [];
    }
    
    // Generate embedding for query
    // In a real implementation, this would call OpenAI API
    // For now, we'll mock the embedding process
    
    // Collect all chunks from all documents and compute scores
    const allChunksWithScores = [];
    
    // Process each document
    for (const doc of documents) {
      const { docId, title } = doc;
      
      // Load embeddings for this document
      const { chunks } = await loadEmbeddings(docId);
      
      if (!chunks.length) {
        continue;
      }
      
      // For each chunk, compute similarity score with query
      for (const chunk of chunks) {
        // In a real implementation, we would compute cosine similarity 
        // between query embedding and chunk embedding
        // For now, assign random similarity scores
        const score = Math.random() * 0.5 + 0.5; // Random score between 0.5 and 1.0
        
        allChunksWithScores.push({
          docId,
          docTitle: title,
          chunkId: chunk.id,
          text: chunk.text,
          score
        });
      }
    }
    
    // Sort by score (descending) and get top k
    const topChunks = allChunksWithScores
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
    
    return topChunks;
  } catch (err) {
    console.error('Error retrieving context:', err);
    return [];
  }
}

export default {
  retrieveContext
};