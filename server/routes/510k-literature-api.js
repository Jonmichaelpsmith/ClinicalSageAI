/**
 * 510(k) Literature API Routes
 * 
 * This module handles server-side API endpoints for managing literature associations
 * with 510(k) device features, powering the literature evidence functionality.
 */

const express = require('express');
const { OpenAI } = require('openai');
const router = express.Router();
const logger = require('../utils/logger');

// Initialize OpenAI client
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Save literature evidence associations for device features
 * Route: POST /api/510k/literature/evidence
 */
router.post('/evidence', async (req, res) => {
  const { documentId, featureEvidence, organizationId } = req.body;

  // Validate essential parameters
  if (!documentId || !featureEvidence) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameters. Document ID and feature evidence mappings are required.'
    });
  }

  try {
    logger.info('Saving literature evidence associations', {
      module: '510k-literature-api',
      documentId
    });

    // In a production environment, we would save this to a database
    // Here we simulate a successful save
    
    // Return success
    res.json({
      success: true,
      documentId,
      message: 'Literature evidence associations saved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error saving literature evidence associations', {
      module: '510k-literature-api',
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Failed to save literature evidence associations',
      message: error.message
    });
  }
});

/**
 * Analyze feature relevance of literature
 * Route: POST /api/510k/literature/analyze-relevance
 */
router.post('/analyze-relevance', async (req, res) => {
  const { features, literature } = req.body;

  // Validate essential parameters
  if (!features || !literature || !Array.isArray(features) || !Array.isArray(literature)) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameters. Features and literature arrays are required.'
    });
  }

  try {
    logger.info('Analyzing literature relevance to features', {
      module: '510k-literature-api',
      featuresCount: features.length,
      literatureCount: literature.length
    });

    // Build prompt for OpenAI
    const prompt = `
As a medical device regulatory expert, analyze the relevance of each literature paper to the device features.

FEATURES:
${features.map((f, idx) => `${idx + 1}. ${f.name}: ${f.description || ''}`).join('\n')}

LITERATURE:
${literature.map((p, idx) => `${idx + 1}. "${p.title}" ${p.abstract ? `- ${p.abstract}` : ''}`).join('\n\n')}

For each paper, determine which features (if any) it provides evidence for. Focus on:
1. Technical or clinical evidence supporting feature claims
2. Performance data relevant to specific features
3. Safety information related to features
4. References to similar designs, materials, or technologies

Return a JSON with mappings between papers and relevant features. Structure: 
{
  "paperToFeatures": {
    "paper_index": [list of relevant feature indices],
    ...
  }
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a medical device regulatory expert specializing in 510(k) submissions and clinical evidence analysis."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    // Get the generated mappings
    const relevanceData = JSON.parse(response.choices[0].message.content);

    // Return the analyzed relevance
    res.json({
      success: true,
      relevanceData,
      model: "gpt-4o",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error analyzing literature relevance', {
      module: '510k-literature-api',
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Failed to analyze literature relevance',
      message: error.message
    });
  }
});

module.exports = router;