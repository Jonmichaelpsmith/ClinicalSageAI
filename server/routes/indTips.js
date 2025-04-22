/**
 * IND Tips Routes
 * 
 * Provides AI-powered gap analysis for IND submissions,
 * helping users identify missing modules and documents.
 */

import { Router } from 'express';
import prisma from '../../prisma/client.js';
import * as aiUtils from '../services/aiUtils.js';

const router = Router();

/**
 * GET /api/ind/tips - Get IND gap analysis tips
 * 
 * Analyzes the current document set and provides suggestions
 * for missing modules and documents for a complete IND submission.
 */
router.get('/ind/tips', async (req, res, next) => {
  try {
    // Get all documents from database
    const documents = await prisma.document.findMany();
    
    // Create sets of present modules and sections
    const modulesPresent = new Set(
      documents
        .map(doc => doc.module)
        .filter(Boolean)
    );
    
    // Create context for AI with current document state
    const context = `
    Current IND status:
    - Modules present: ${[...modulesPresent].join(', ')}
    - Document count: ${documents.length}
    `;
    
    // Ask AI for guidance on what's missing
    const question = `Given the current state of my IND submission where I have modules (${[...modulesPresent].join(', ')}), 
    what specific modules or sections am I missing that are essential for a complete IND application? 
    Please provide 3-5 specific recommendations, focusing on high-priority items first.`;
    
    let tipsList;
    
    // Try to use function calling first for structured output
    try {
      const tips = await aiUtils.processWithOpenAIJson(
        context + '\n' + question,
        'You are an FDA regulatory expert. Analyze the IND submission status and provide recommendations for missing components.',
        {
          tips: [
            {
              module: 'string',
              importance: 'string',
              description: 'string'
            }
          ]
        }
      );
      
      // Format structured tips into messages
      tipsList = tips.tips.map(tip => 
        `${tip.module} (${tip.importance}): ${tip.description}`
      );
    } catch (error) {
      // Fall back to text response if structured fails
      console.warn('Structured tips failed, falling back to text response:', error);
      const answer = await aiUtils.processWithOpenAI(
        context + '\n' + question,
        'You are an FDA regulatory expert. Analyze the IND submission status and provide recommendations for missing components.'
      );
      
      // Convert text response to list
      tipsList = answer
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.trim());
    }
    
    // Return the tips
    res.json(tipsList);
  } catch (error) {
    console.error('Error generating IND tips:', error);
    next(error);
  }
});

export default router;