// CSR Search Service
// This service replaces the Python FastAPI backend for CSR search

import fs from 'fs';
import path from 'path';
import { huggingFaceService } from '../huggingface-service';

// Constants
const PROCESSED_CSR_DIR = path.join(process.cwd(), 'data/processed_csrs');

// Type definitions
interface CSRData {
  csr_id: string;
  title: string;
  indication: string;
  phase: string;
  outcome?: string;
  sample_size?: number;
  sponsor?: string;
  date?: string;
  embedding?: number[];
  // Any other properties in the CSR data
  [key: string]: any;
}

// In-memory storage for embeddings 
let embeddingStore: CSRData[] = [];
let isInitialized = false;

export class CSRSearchService {
  
  /**
   * Initialize the search service and load embeddings
   */
  async initialize() {
    if (isInitialized) return;
    
    console.log('🔍 Initializing CSR Search Service...');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(PROCESSED_CSR_DIR)) {
      fs.mkdirSync(PROCESSED_CSR_DIR, { recursive: true });
      console.log(`Created directory: ${PROCESSED_CSR_DIR}`);
    }
    
    // Load CSR data into memory
    await this.loadEmbeddings();
    
    isInitialized = true;
    console.log(`✅ CSR Search Service initialized with ${embeddingStore.length} CSRs`);
  }
  
  /**
   * Load all CSR embeddings into memory
   */
  async loadEmbeddings() {
    embeddingStore = [];
    
    try {
      const files = fs.readdirSync(PROCESSED_CSR_DIR);
      
      for (const filename of files) {
        if (filename.endsWith('.json')) {
          const filePath = path.join(PROCESSED_CSR_DIR, filename);
          
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(content);
            
            // Add CSR data to store, ensuring it has a csr_id
            if (!data.csr_id) {
              // Extract ID from filename (e.g., HC-1240.json -> HC-1240)
              data.csr_id = path.basename(filename, '.json');
              
              // Write updated data back to file
              fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            }
            
            embeddingStore.push(data);
          } catch (error) {
            console.error(`Error loading CSR file ${filename}:`, error);
          }
        }
      }
      
      console.log(`Loaded ${embeddingStore.length} CSRs into memory`);
    } catch (error) {
      console.error('Error loading CSR embeddings:', error);
    }
  }
  
  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    // Check for valid vectors
    if (!a || !b || a.length !== b.length || a.length === 0) {
      return 0;
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    // Handle edge cases
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  
  /**
   * Search for CSRs by query text and/or filters
   */
  async searchCSRs(params: {
    query_text?: string;
    indication?: string;
    phase?: string;
    outcome?: string;
    min_sample_size?: number;
    limit?: number;
  }): Promise<{
    csrs: CSRData[];
    results_count: number;
  }> {
    // Initialize if not already done
    if (!isInitialized) {
      await this.initialize();
    }
    
    // Default limit
    const limit = params.limit || 10;
    
    // Start with all CSRs in memory
    let results = [...embeddingStore];
    
    // Apply filters
    if (params.indication && params.indication !== 'Any') {
      results = results.filter(csr => 
        csr.indication && csr.indication.toLowerCase().includes(params.indication!.toLowerCase())
      );
    }
    
    if (params.phase && params.phase !== 'Any') {
      results = results.filter(csr => 
        csr.phase && csr.phase.toLowerCase().includes(params.phase!.toLowerCase())
      );
    }
    
    if (params.outcome) {
      results = results.filter(csr => 
        csr.outcome && csr.outcome.toLowerCase().includes(params.outcome!.toLowerCase())
      );
    }
    
    if (params.min_sample_size) {
      results = results.filter(csr => 
        csr.sample_size && csr.sample_size >= params.min_sample_size!
      );
    }
    
    // Calculate similarity scores if query text is provided
    if (params.query_text && params.query_text.trim()) {
      try {
        // Get embedding for query text using Hugging Face
        const queryEmbedding = await huggingFaceService.getEmbedding(params.query_text);
        
        // Calculate similarity for each CSR
        const scoredResults = results
          .map(csr => {
            // Only calculate similarity if CSR has embedding
            const similarity = csr.embedding 
              ? this.cosineSimilarity(queryEmbedding, csr.embedding)
              : 0;
            
            return {
              ...csr,
              similarity
            };
          })
          .filter(csr => csr.similarity > 0)
          .sort((a, b) => b.similarity - a.similarity);
        
        results = scoredResults;
      } catch (error) {
        console.error('Error getting query embedding:', error);
        // Continue with filtered results but without similarity ranking
      }
    }
    
    // Limit results
    const limitedResults = results.slice(0, limit);
    
    return {
      csrs: limitedResults,
      results_count: results.length
    };
  }
  
  /**
   * Get CSR details by ID
   */
  async getCSRById(id: string): Promise<CSRData | null> {
    // Initialize if not already done
    if (!isInitialized) {
      await this.initialize();
    }
    
    const csr = embeddingStore.find(c => c.csr_id === id);
    return csr || null;
  }
  
  /**
   * Get stats about the CSR database
   */
  async getStats(): Promise<{
    total_csrs: number;
    indications: Record<string, number>;
    phases: Record<string, number>;
    outcomes: Record<string, number>;
  }> {
    // Initialize if not already done
    if (!isInitialized) {
      await this.initialize();
    }
    
    // Count indications
    const indications: Record<string, number> = {};
    embeddingStore.forEach(csr => {
      if (csr.indication) {
        indications[csr.indication] = (indications[csr.indication] || 0) + 1;
      }
    });
    
    // Count phases
    const phases: Record<string, number> = {};
    embeddingStore.forEach(csr => {
      if (csr.phase) {
        phases[csr.phase] = (phases[csr.phase] || 0) + 1;
      }
    });
    
    // Count outcomes
    const outcomes: Record<string, number> = {};
    embeddingStore.forEach(csr => {
      if (csr.outcome) {
        outcomes[csr.outcome] = (outcomes[csr.outcome] || 0) + 1;
      }
    });
    
    return {
      total_csrs: embeddingStore.length,
      indications,
      phases,
      outcomes
    };
  }
}

// Export singleton instance
export const csrSearchService = new CSRSearchService();