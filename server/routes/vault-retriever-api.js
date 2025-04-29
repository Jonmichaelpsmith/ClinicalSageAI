import express from 'express';
import { retrieveRelevantChunks, isReady } from '../brain/vaultRetriever.js';

const router = express.Router();

// GET endpoint to check if the vault retriever is ready
router.get('/api/vault/retriever/status', (req, res) => {
  res.json({ 
    ready: isReady(),
    message: isReady() 
      ? 'Vault retriever ready with embeddings loaded' 
      : 'Vault retriever not ready. Run indexer first.'
  });
});

// POST endpoint to retrieve relevant chunks based on a query
router.post('/api/vault/retriever/search', async (req, res) => {
  try {
    const { query, topK = 5 } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: 'Query is required' 
      });
    }
    
    if (!isReady()) {
      return res.status(503).json({ 
        success: false, 
        message: 'Vault retriever not ready. Run indexer first.' 
      });
    }
    
    console.log(`[VaultRetriever] Processing query: "${query}" (topK=${topK})`);
    const results = await retrieveRelevantChunks(query, topK);
    
    return res.json({
      success: true,
      query,
      results,
      count: results.length
    });
    
  } catch (error) {
    console.error('[VaultRetriever] Error processing search request:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error processing search request', 
      error: error.message 
    });
  }
});

export default router;