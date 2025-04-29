/**
 * TrialSage AI Routes
 * 
 * This module provides API endpoints for AI-powered features including context retrieval
 * and document drafting.
 */

import express from 'express';
import { retrieveContext } from '../brain/vaultRetriever.js';

const router = express.Router();

/**
 * POST /api/ai/retrieve
 * Retrieves relevant context based on a query
 * 
 * Body: { query: string, k?: number }
 * Response: { success: boolean, chunks: Array<{docId, chunkId, text, score}> }
 */
router.post('/retrieve', async (req, res) => {
  try {
    const { query, k } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        error: 'Query is required' 
      });
    }
    
    const topChunks = await retrieveContext(query, k ?? 5);
    
    res.json({ 
      success: true, 
      chunks: topChunks 
    });
  } catch (err) {
    console.error('Error in /api/ai/retrieve:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

export default router;