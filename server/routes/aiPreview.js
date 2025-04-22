/**
 * AI Preview Routes
 * 
 * Provides instant document analysis during upload preview,
 * enhancing the user experience with immediate AI insights.
 */

import { Router } from 'express';
import * as aiUtils from '../services/aiUtils.js';
import pdf from 'pdf-parse';

const router = Router();

/**
 * POST /api/ai/preview - Analyze a document before upload
 * 
 * Accepts a base64-encoded document and returns AI-generated insights
 * including summary, document type, regulatory context, and keywords.
 * 
 * @param {Object} req.body.base64 - Base64-encoded document data
 */
router.post('/ai/preview', async (req, res, next) => {
  try {
    const { base64 } = req.body;
    
    if (!base64) {
      return res.status(400).json({ error: 'Missing base64 document data' });
    }
    
    // Convert base64 to buffer
    const buffer = Buffer.from(base64, 'base64');
    
    // Extract text from the PDF
    let text;
    try {
      const data = await pdf(buffer);
      text = data.text;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      // If PDF parsing fails, return a helpful error
      return res.status(422).json({ 
        error: 'Unable to extract text from document. Please ensure it is a valid PDF.'
      });
    }
    
    // Process with AI in parallel for faster response
    const [summary, classification] = await Promise.all([
      aiUtils.generateDocumentSummary(text),
      aiUtils.analyzeDocumentType(text, req.body.filename || 'uploaded-document.pdf')
    ]);
    
    // Extract keywords
    const keywords = await aiUtils.extractKeywords(text, 8);
    
    // Return the analysis results
    res.json({
      summary,
      documentType: classification.documentType || 'unknown',
      regulatoryContext: classification.regulatoryContext || 'unknown',
      therapeuticArea: classification.therapeuticArea || 'unknown',
      module: classification.documentType || 'unknown',  // For backward compatibility
      subSection: classification.regulatoryContext || 'unknown',  // For backward compatibility
      keywords: keywords || []
    });
  } catch (error) {
    console.error('Error in AI preview:', error);
    next(error);
  }
});

export default router;