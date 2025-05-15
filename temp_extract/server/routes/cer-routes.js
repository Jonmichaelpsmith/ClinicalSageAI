/**
 * CER Routes
 * 
 * This file defines the API routes for the Clinical Evaluation Report (CER) functionality.
 * It provides endpoints for generating CERs, analyzing multiple products, and exporting reports.
 */

import express from 'express';
import axios from 'axios';
import { analyzeCers, generateCer, generateCerPdf } from '../fastapi_bridge.js';
import { analyzeText } from '../openai-service.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'cer-api',
    timestamp: new Date().toISOString()
  });
});

// Generate a single CER
router.post('/generate', async (req, res) => {
  try {
    const { ndc_code } = req.body;
    
    if (!ndc_code) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: ndc_code'
      });
    }
    
    const result = await generateCer(ndc_code);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error generating CER:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate CER'
    });
  }
});

// Analyze multiple NDC codes for comparison
router.post('/analyze', async (req, res) => {
  try {
    const { ndc_codes, device_codes } = req.body;
    
    if (!ndc_codes && !device_codes) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: ndc_codes or device_codes'
      });
    }
    
    const codes = ndc_codes || [];
    const deviceCodes = device_codes || [];
    
    if (codes.length === 0 && deviceCodes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one NDC code or device code must be provided'
      });
    }
    
    const result = await analyzeCers([...codes, ...deviceCodes]);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error analyzing CERs:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze CERs'
    });
  }
});

// Process natural language query
router.post('/nlp-query', async (req, res) => {
  try {
    const { query, context, data } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: query'
      });
    }
    
    // Prepare prompt for OpenAI
    const prompt = `
    You are a Clinical Evaluation Report analyst. The user is asking: "${query}"
    
    ${context ? `Additional context: ${context}` : ''}
    
    ${data ? `Data available for analysis: ${JSON.stringify(data, null, 2)}` : ''}
    
    Your task is to interpret the user's query related to clinical data and return:
    1. A structured API call that would answer this query
    2. A plain English explanation of the query's intent
    3. Recommended filters or parameters to use

    Format your response as JSON with the following structure:
    {
      "api_call": { "endpoint": string, "parameters": object },
      "interpretation": string,
      "filters": object,
      "visualization": string
    }
    `;
    
    // Process with OpenAI
    const result = await analyzeText(prompt, "You are a helpful Clinical Evaluation Report analyst.");
    
    // Parse JSON from response
    try {
      const jsonStart = result.indexOf('{');
      const jsonEnd = result.lastIndexOf('}') + 1;
      const jsonString = result.substring(jsonStart, jsonEnd);
      const parsedResult = JSON.parse(jsonString);
      
      res.json({
        success: true,
        data: parsedResult
      });
    } catch (parseError) {
      // If parsing fails, return the raw text
      res.json({
        success: true,
        data: {
          interpretation: result,
          api_call: { endpoint: "unknown", parameters: {} },
          filters: {},
          visualization: "table"
        }
      });
    }
  } catch (error) {
    console.error('Error processing NLP query:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process NLP query'
    });
  }
});

// Export CER as PDF
router.post('/export-pdf', async (req, res) => {
  try {
    const { ndc_codes, device_codes } = req.body;
    
    if (!ndc_codes && !device_codes) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: ndc_codes or device_codes'
      });
    }
    
    const codes = ndc_codes || [];
    const deviceCodes = device_codes || [];
    
    if (codes.length === 0 && deviceCodes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one NDC code or device code must be provided'
      });
    }
    
    const pdfBuffer = await generateCerPdf([...codes, ...deviceCodes]);
    
    // Set appropriate headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=CER_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Send the PDF buffer as the response
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate PDF'
    });
  }
});

// Get FAERS data for an NDC code
router.get('/faers/:ndc_code', async (req, res) => {
  try {
    const { ndc_code } = req.params;
    
    if (!ndc_code) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: ndc_code'
      });
    }
    
    // Proxy request to FDA FAERS API
    const faersResponse = await axios.get(
      `https://api.fda.gov/drug/event.json?search=openfda.product_ndc:${ndc_code}&limit=100`
    );
    
    res.json({
      success: true,
      data: faersResponse.data
    });
  } catch (error) {
    console.error('Error fetching FAERS data:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch FAERS data'
    });
  }
});

// Submit user feedback on a CER
router.post('/feedback', (req, res) => {
  try {
    const { ndc_code, rating, comments, user_id } = req.body;
    
    if (!ndc_code || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: ndc_code, rating'
      });
    }
    
    // In a real implementation, we would store this feedback in a database
    console.log(`CER Feedback received - NDC: ${ndc_code}, Rating: ${rating}, Comments: ${comments || 'none'}`);
    
    res.json({
      success: true,
      message: 'Feedback received successfully'
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit feedback'
    });
  }
});

export default router;