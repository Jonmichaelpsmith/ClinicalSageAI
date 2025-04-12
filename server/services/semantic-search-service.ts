import { huggingFaceService, HFModel } from '../huggingface-service';

/**
 * Semantic similarity calculation between two embeddings
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (normA * normB);
}

/**
 * The embedded document with its original content 
 */
export interface EmbeddedDocument {
  id: number;
  content: string;
  embedding: number[];
  metadata?: Record<string, any>;
}

/**
 * Semantic search results
 */
export interface SearchResult {
  document: EmbeddedDocument;
  score: number;
}

/**
 * Service for semantic search using text embeddings
 */
export class SemanticSearchService {
  private documents: EmbeddedDocument[] = [];
  private embeddingModel: HFModel;

  constructor(embeddingModel: HFModel = HFModel.CLINICAL_EMBEDDINGS) {
    this.embeddingModel = embeddingModel;
  }

  /**
   * Add a new document to the search index
   */
  async addDocument(id: number, content: string, metadata?: Record<string, any>): Promise<void> {
    try {
      console.log(`Generating embedding for document ${id}...`);
      
      // Generate embedding via HuggingFace API
      const embedding = await huggingFaceService.generateEmbeddings(content, this.embeddingModel);
      
      // Store the document with its embedding
      this.documents.push({
        id,
        content,
        embedding,
        metadata
      });
      
      console.log(`Document ${id} added to semantic search index`);
    } catch (error) {
      console.error(`Failed to add document ${id} to semantic search index:`, error);
      throw error;
    }
  }

  /**
   * Clear all documents from the index
   */
  clearIndex(): void {
    this.documents = [];
  }

  /**
   * Get the number of documents in the index
   */
  getDocumentCount(): number {
    return this.documents.length;
  }

  /**
   * Search for documents similar to the query string
   */
  async search(query: string, limit: number = 5): Promise<SearchResult[]> {
    if (this.documents.length === 0) {
      return [];
    }
    
    try {
      console.log(`Generating embedding for query: "${query.substring(0, 50)}..."`);
      
      // Generate embedding for the query
      const queryEmbedding = await huggingFaceService.generateEmbeddings(query, this.embeddingModel);
      
      // Calculate similarity scores for all documents
      const results: SearchResult[] = this.documents.map(doc => ({
        document: doc,
        score: cosineSimilarity(queryEmbedding, doc.embedding)
      }));
      
      // Sort by similarity score (highest first) and limit results
      return results
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Error performing semantic search:', error);
      throw error;
    }
  }

  /**
   * Retrieve the most semantically similar context for a given query
   */
  async retrieveRelevantContext(query: string, maxChars: number = 10000): Promise<string> {
    const results = await this.search(query, 5);
    
    let contextText = '';
    let totalChars = 0;
    
    for (const result of results) {
      if (totalChars + result.document.content.length <= maxChars) {
        contextText += result.document.content + '\n\n';
        totalChars += result.document.content.length + 2;
      } else {
        // If adding the full document would exceed the limit, add a portion
        const remainingChars = maxChars - totalChars;
        if (remainingChars > 200) {  // Only add if we can include a meaningful portion
          contextText += result.document.content.substring(0, remainingChars) + '...\n\n';
        }
        break;
      }
    }
    
    return contextText;
  }
}

// Export a singleton instance for convenience
export const semanticSearchService = new SemanticSearchService();