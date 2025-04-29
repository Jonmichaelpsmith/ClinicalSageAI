/**
 * CSR Routes - Server-side API routes for CSR Deep Intelligence module
 */

import express from 'express';
import fetch from 'node-fetch';
import { generateNarrativeWithAI } from '../services/aiService.js';

const router = express.Router();

/**
 * Generate a patient case narrative
 * 
 * @route POST /api/csr/generate-narrative
 * @param {Object} req.body - Input data for narrative generation
 * @returns {Object} - Generated narrative
 */
router.post('/generate-narrative', async (req, res) => {
  try {
    console.log('Generating CSR narrative with data:', JSON.stringify(req.body, null, 2));
    
    // Use AI service to generate the narrative
    const narrativeResult = await generateNarrativeWithAI(req.body);
    
    res.json({
      success: true,
      narrative: narrativeResult.narrative,
      metadata: narrativeResult.metadata
    });
  } catch (error) {
    console.error('Error generating CSR narrative:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate narrative'
    });
  }
});

/**
 * Detect adverse event signals
 * 
 * @route POST /api/csr/detect-signals
 * @param {Object} req.body - Input data for signal detection
 * @returns {Object} - Detected signals
 */
router.post('/detect-signals', async (req, res) => {
  try {
    console.log('Detecting signals with data:', JSON.stringify(req.body, null, 2));
    
    // Mock signal detection (replace with actual implementation)
    const signals = [
      {
        id: 'sig001',
        name: 'Headache frequency increase',
        strength: 0.87,
        patientCount: 12,
        description: 'Increased frequency of moderate to severe headaches reported'
      },
      {
        id: 'sig002',
        name: 'Mild dizziness',
        strength: 0.64,
        patientCount: 8,
        description: 'Short-term dizziness reported within 30 minutes of administration'
      }
    ];
    
    res.json({
      success: true,
      signals,
      analysis: {
        totalSignals: signals.length,
        significanceThreshold: 0.6,
        recommendedActions: [
          'Review headache reports in detail',
          'Compare with historical data for this indication'
        ]
      }
    });
  } catch (error) {
    console.error('Error detecting signals:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to detect signals'
    });
  }
});

/**
 * Analyze benefit-risk profile
 * 
 * @route POST /api/csr/analyze-benefit-risk
 * @param {Object} req.body - Input data for benefit-risk analysis
 * @returns {Object} - Benefit-risk analysis results
 */
router.post('/analyze-benefit-risk', async (req, res) => {
  try {
    console.log('Analyzing benefit-risk with data:', JSON.stringify(req.body, null, 2));
    
    // Mock benefit-risk analysis (replace with actual implementation)
    const analysis = {
      overallRatio: 3.2,
      benefits: [
        {
          id: 'ben001',
          name: 'Primary endpoint improvement',
          strength: 0.91,
          description: 'Significant improvement in primary efficacy endpoint'
        },
        {
          id: 'ben002',
          name: 'Quality of life enhancement',
          strength: 0.78,
          description: 'Moderate improvement in patient-reported quality of life'
        }
      ],
      risks: [
        {
          id: 'risk001',
          name: 'Headache (mild to moderate)',
          strength: 0.45,
          description: 'Transient headache reported in some patients'
        },
        {
          id: 'risk002',
          name: 'Temporary dizziness',
          strength: 0.32,
          description: 'Short-term dizziness following administration'
        }
      ],
      recommendation: 'Favorable benefit-risk profile with monitoring recommendations for headache frequency'
    };
    
    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Error analyzing benefit-risk:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze benefit-risk profile'
    });
  }
});

/**
 * Search CSR documents
 * 
 * @route GET /api/csr/search
 * @param {string} req.query.query - Search query
 * @param {string} req.query.fields - Fields to search (comma-separated)
 * @param {number} req.query.limit - Maximum number of results to return
 * @returns {Object} - Search results
 */
router.get('/search', async (req, res) => {
  try {
    const { query, fields = 'all', limit = 10 } = req.query;
    
    if (!query || query.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 3 characters'
      });
    }
    
    console.log(`Searching CSR documents with query: "${query}", fields: ${fields}, limit: ${limit}`);
    
    // Mock search results (replace with actual implementation)
    const results = [
      {
        id: 'csr001',
        title: 'Clinical Study Report - Phase 3 Trial XYZ123',
        relevance: 0.92,
        highlights: [
          'The primary endpoint was met with statistical significance (p<0.001)',
          'Safety profile was consistent with previous studies'
        ]
      },
      {
        id: 'csr002',
        title: 'Clinical Study Report - Extension Study ABC456',
        relevance: 0.87,
        highlights: [
          'Long-term safety demonstrated over 24 months',
          'No new safety signals identified in the extension period'
        ]
      }
    ];
    
    res.json({
      success: true,
      query,
      fields: fields.split(','),
      results,
      total: results.length,
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error searching CSR documents:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to search CSR documents'
    });
  }
});

export default router;