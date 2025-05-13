/**
 * Regulatory AI Routes
 * 
 * These routes provide the API for the Regulatory AI Assistant that leverages
 * a knowledge base of regulatory documents to provide accurate responses.
 */

const express = require('express');
const router = express.Router();
const regulatoryAIService = require('../services/regulatoryAIService');

console.log('Using hardcoded responses for regulatory AI queries');

/**
 * @route POST /api/regulatory-ai/query
 * @description Process a regulatory query and provide an AI-enhanced response
 */
router.post('/query', async (req, res) => {
  try {
    const { query, context = 'general' } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required and must be a string' });
    }
    
    // Process the query with the regulatory AI service
    const result = await regulatoryAIService.processQuery(query, context);
    
    res.json(result);
  } catch (error) {
    console.error('Error processing regulatory AI query:', error);
    res.status(500).json({ 
      error: 'An error occurred while processing your query',
      details: error.message
    });
  }
});

/**
 * @route GET /api/regulatory-ai/health
 * @description Check the health of the regulatory AI service
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'regulatory-ai',
    knowledgeBase: {
      active: true,
      mode: 'hybrid', // 'local', 'hybrid', or 'remote'
      description: 'This service uses a hybrid approach, combining local document processing with AI capabilities.'
    }
  });
});

/**
 * @route GET /api/regulatory-ai/jurisdictions
 * @description Get a list of supported regulatory jurisdictions
 */
router.get('/jurisdictions', (req, res) => {
  res.json({
    jurisdictions: [
      { id: 'FDA', name: 'FDA (US)', description: 'Food and Drug Administration, United States' },
      { id: 'EMA', name: 'EMA (EU)', description: 'European Medicines Agency, European Union' },
      { id: 'PMDA', name: 'PMDA (Japan)', description: 'Pharmaceuticals and Medical Devices Agency, Japan' },
      { id: 'NMPA', name: 'NMPA (China)', description: 'National Medical Products Administration, China' },
      { id: 'Health Canada', name: 'Health Canada', description: 'Health Canada, Canada' },
      { id: 'TGA', name: 'TGA (Australia)', description: 'Therapeutic Goods Administration, Australia' },
      { id: 'ICH', name: 'ICH', description: 'International Council for Harmonisation of Technical Requirements for Pharmaceuticals for Human Use' },
      { id: 'WHO', name: 'WHO', description: 'World Health Organization' },
      { id: 'IMDRF', name: 'IMDRF', description: 'International Medical Device Regulators Forum' }
    ]
  });
});

/**
 * @route GET /api/regulatory-ai/frameworks
 * @description Get a list of supported regulatory frameworks
 */
router.get('/frameworks', (req, res) => {
  res.json({
    frameworks: [
      { id: '510k', name: '510(k)', jurisdiction: 'FDA', description: 'Premarket notification for demonstrating substantial equivalence' },
      { id: 'pma', name: 'PMA', jurisdiction: 'FDA', description: 'Premarket Approval for Class III devices' },
      { id: 'de-novo', name: 'De Novo', jurisdiction: 'FDA', description: 'Classification for novel devices without predicates' },
      { id: 'mdr', name: 'MDR', jurisdiction: 'EMA', description: 'Medical Device Regulation (EU) 2017/745' },
      { id: 'ivdr', name: 'IVDR', jurisdiction: 'EMA', description: 'In Vitro Diagnostic Regulation (EU) 2017/746' },
      { id: 'qsr', name: 'QSR', jurisdiction: 'FDA', description: 'Quality System Regulation (21 CFR Part 820)' },
      { id: 'iso-13485', name: 'ISO 13485', jurisdiction: 'Global', description: 'Medical devices - Quality management systems' },
      { id: 'iso-14971', name: 'ISO 14971', jurisdiction: 'Global', description: 'Medical devices - Application of risk management' },
      { id: 'ich-e6', name: 'ICH E6', jurisdiction: 'ICH', description: 'Good Clinical Practice (GCP)' },
      { id: 'ich-e8', name: 'ICH E8', jurisdiction: 'ICH', description: 'General Considerations for Clinical Trials' },
      { id: 'ich-e9', name: 'ICH E9', jurisdiction: 'ICH', description: 'Statistical Principles for Clinical Trials' }
    ]
  });
});

module.exports = router;