import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { OpenAI } from "openai";

// Get the directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Path to embeddings file
const EMBEDDINGS_FILE = path.join(__dirname, "embeddings.json");
const METADATA_FILE = path.join(__dirname, "../vault/metadata.json");

// Load embeddings and metadata
let embeddings = [];
let metadata = { documents: [] };

try {
  if (fs.existsSync(EMBEDDINGS_FILE)) {
    embeddings = JSON.parse(fs.readFileSync(EMBEDDINGS_FILE, "utf8"));
    console.log(`Loaded ${embeddings.length} embeddings`);
  } else {
    console.warn("Embeddings file not found. Run vaultIndexer.js first.");
  }

  if (fs.existsSync(METADATA_FILE)) {
    metadata = JSON.parse(fs.readFileSync(METADATA_FILE, "utf8"));
    console.log(`Loaded metadata for ${metadata.documents.length} documents`);
  } else {
    console.warn("Metadata file not found.");
  }
} catch (error) {
  console.error("Error loading embeddings or metadata:", error);
}

// Helper function to compute cosine similarity
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (normA * normB);
}

// Main retrieval function
export async function retrieveRelevantChunks(query, topK = 5) {
  // If no embeddings, return empty array
  if (embeddings.length === 0) {
    return [];
  }
  
  try {
    // Get the query embedding from OpenAI
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: query,
    });
    
    const queryEmbedding = embeddingResponse.data[0].embedding;
    
    // Calculate similarities between query and all document chunks
    const similarities = embeddings.map(item => ({
      ...item,
      similarity: cosineSimilarity(queryEmbedding, item.embedding)
    }));
    
    // Sort by similarity (descending) and take top K
    const topResults = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
      
    // Add document metadata
    const resultsWithMetadata = topResults.map(result => {
      const docMetadata = metadata.documents.find(doc => doc.id === result.docId) || {};
      return {
        docId: result.docId,
        chunkId: result.chunkId,
        text: result.text,
        similarity: result.similarity,
        metadata: {
          title: docMetadata.title || "Unknown",
          author: docMetadata.author || "Unknown",
          date: docMetadata.date || "Unknown",
          type: docMetadata.type || "Unknown",
          path: docMetadata.path || "Unknown",
        }
      };
    });
    
    return resultsWithMetadata;
    
  } catch (error) {
    console.error("Error retrieving relevant chunks:", error);
    return [];
  }
}

// Export a function to check if we're ready (have embeddings)
export function isReady() {
  return embeddings.length > 0;
}