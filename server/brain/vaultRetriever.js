// server/brain/vaultRetriever.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { OpenAI } from "openai";

// Get the directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load precomputed embeddings
const EMBEDDINGS_FILE = path.join(__dirname, "embeddings.json");
let embeddingsIndex = [];

try {
  if (fs.existsSync(EMBEDDINGS_FILE)) {
    const raw = fs.readFileSync(EMBEDDINGS_FILE, "utf8");
    embeddingsIndex = JSON.parse(raw);
    console.log(`Loaded ${embeddingsIndex.length} embeddings from ${EMBEDDINGS_FILE}`);
  } else {
    console.warn(`Embeddings file not found at ${EMBEDDINGS_FILE}. Run vaultIndexer.js first.`);
  }
} catch (error) {
  console.error("Error loading embeddings:", error);
}

// Helper: cosine similarity
function cosineSim(a, b) {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return dot / (magA * magB);
}

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * retrieveContext(query, k):
 *  - embeds the query text
 *  - compares against all vault chunks
 *  - returns top-k chunks sorted by similarity
 */
export async function retrieveContext(query, k = 5) {
  // Check if embeddings are loaded
  if (embeddingsIndex.length === 0) {
    throw new Error("No embeddings available. Run the indexer first.");
  }

  // 1) Get query embedding
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: query,
  });
  const queryEmb = embeddingResponse.data[0].embedding;

  // 2) Score each chunk
  const scores = embeddingsIndex.map((item) => {
    return {
      docId: item.docId,
      chunkId: item.chunkId,
      text: item.text,
      score: cosineSim(queryEmb, item.embedding),
    };
  });

  // 3) Sort and return top-k
  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, k);
}

// For backward compatibility and testing
export function isReady() {
  return embeddingsIndex.length > 0;
}