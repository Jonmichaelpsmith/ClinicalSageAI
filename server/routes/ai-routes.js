/**
 * TrialSage AI Routes
 * 
 * This module provides API endpoints for AI-powered features including context retrieval
 * and document drafting.
 */

import express from 'express';
import { retrieveContext } from '../brain/vaultRetriever.js';
import { generateDraft } from '../brain/draftGenerator.js';

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

/**
 * POST /api/ai/draft
 * Generates a draft for a regulatory document section using AI
 * 
 * Body: { 
 *   moduleId: string,
 *   sectionId: string,
 *   currentContent: string,
 *   contextIds?: string[],
 *   query?: string
 * }
 * Response: { success: boolean, draft: string }
 */
router.post('/draft', async (req, res) => {
  try {
    const { moduleId, sectionId, currentContent, contextIds, query } = req.body;
    
    if (!moduleId || !sectionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Module ID and Section ID are required' 
      });
    }
    
    const draftContent = await generateDraft({
      moduleId,
      sectionId,
      currentContent: currentContent || '',
      contextIds: contextIds || [],
      query: query || ''
    });
    
    res.json({ 
      success: true, 
      draft: draftContent 
    });
  } catch (err) {
    console.error('Error in /api/ai/draft:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

export default router;