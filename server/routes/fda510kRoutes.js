/**
 * FDA 510(k) Routes
 * 
 * This module provides API routes for FDA 510(k) Automation,
 * including predicate discovery, regulatory pathway analysis,
 * compliance checking, and NLP summaries.
 */

import express from 'express';
const router = express.Router();
import { OpenAI } from 'openai';
import { Pool } from 'pg';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { fetchPubMed, fetchFAERS, fetchScholar } from '../config/literatureSources';

// Set up multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Initialize OpenAI with environment API key
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Middleware to validate required data
const validateDeviceData = (req, res, next) => {
  const { deviceData } = req.body;
  
  if (!deviceData) {
    return res.status(400).json({
      success: false,
      message: 'Device data is required'
    });
  }
  
  if (!deviceData.deviceName) {
    return res.status(400).json({
      success: false,
      message: 'Device name is required'
    });
  }
  
  next();
};

// Middleware to validate item data for NLP summarization
const validateItemData = (req, res, next) => {
  const { item, type } = req.body;
  
  if (!item) {
    return res.status(400).json({
      success: false,
      message: 'Item data is required'
    });
  }
  
  // For predicate devices, ensure we have name and description
  if (type === 'predicate' && (!item.deviceName || !item.description)) {
    return res.status(400).json({
      success: false,
      message: 'Device name and description are required for predicate summary'
    });
  }
  
  // For literature, ensure we have title and abstract
  if (type === 'literature' && (!item.title || !item.abstract)) {
    return res.status(400).json({
      success: false,
      message: 'Title and abstract are required for literature summary'
    });
  }
  
  next();
};

/**
 * Get 510(k) requirements for a specific device class
 */
router.get('/requirements/:deviceClass', async (req, res) => {
  try {
    const { deviceClass } = req.params;
    
    // Basic validation
    if (!['I', 'II', 'III'].includes(deviceClass)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid device class. Must be I, II, or III.'
      });
    }
    
    // Load device class specific requirements
    const requirements = {
      I: {
        requirements: [
          { id: 'req_class_i_1', name: 'Intended Use', description: 'Statement of intended use and indications for use' },
          { id: 'req_class_i_2', name: 'Device Description', description: 'Comprehensive description of the device' },
          { id: 'req_class_i_3', name: 'Substantial Equivalence', description: 'Comparison to predicate device(s)' },
          { id: 'req_class_i_4', name: 'Labeling', description: 'Draft labeling for the device' },
          { id: 'req_class_i_5', name: 'Risk Analysis', description: 'Identification and analysis of risks' }
        ],
        recommendedPathway: 'Traditional 510(k)'
      },
      II: {
        requirements: [
          { id: 'req_class_ii_1', name: 'Intended Use', description: 'Statement of intended use and indications for use' },
          { id: 'req_class_ii_2', name: 'Device Description', description: 'Comprehensive description of the device' },
          { id: 'req_class_ii_3', name: 'Substantial Equivalence', description: 'Comparison to predicate device(s)' },
          { id: 'req_class_ii_4', name: 'Bench Testing', description: 'Performance data and bench testing results' },
          { id: 'req_class_ii_5', name: 'Biocompatibility', description: 'Biocompatibility evaluation (if applicable)' },
          { id: 'req_class_ii_6', name: 'Sterilization', description: 'Sterilization validation (if applicable)' },
          { id: 'req_class_ii_7', name: 'Software Validation', description: 'Software validation documentation (if applicable)' },
          { id: 'req_class_ii_8', name: 'Electrical Safety', description: 'Electrical safety and EMC testing (if applicable)' },
          { id: 'req_class_ii_9', name: 'Labeling', description: 'Draft labeling for the device' },
          { id: 'req_class_ii_10', name: 'Risk Analysis', description: 'Identification and analysis of risks' }
        ],
        recommendedPathway: 'Traditional 510(k)'
      },
      III: {
        requirements: [
          { id: 'req_class_iii_1', name: 'Intended Use', description: 'Statement of intended use and indications for use' },
          { id: 'req_class_iii_2', name: 'Device Description', description: 'Comprehensive description of the device' },
          { id: 'req_class_iii_3', name: 'Substantial Equivalence', description: 'Comparison to predicate device(s)' },
          { id: 'req_class_iii_4', name: 'Bench Testing', description: 'Performance data and bench testing results' },
          { id: 'req_class_iii_5', name: 'Biocompatibility', description: 'Biocompatibility evaluation (if applicable)' },
          { id: 'req_class_iii_6', name: 'Sterilization', description: 'Sterilization validation (if applicable)' },
          { id: 'req_class_iii_7', name: 'Software Validation', description: 'Software validation documentation (if applicable)' },
          { id: 'req_class_iii_8', name: 'Clinical Data', description: 'Clinical study data' },
          { id: 'req_class_iii_9', name: 'Animal Testing', description: 'Animal testing data (if applicable)' },
          { id: 'req_class_iii_10', name: 'Manufacturing Information', description: 'Manufacturing process information' },
          { id: 'req_class_iii_11', name: 'Labeling', description: 'Draft labeling for the device' },
          { id: 'req_class_iii_12', name: 'Risk Analysis', description: 'Identification and analysis of risks' }
        ],
        recommendedPathway: 'Traditional 510(k) or De Novo'
      }
    };
    
    res.status(200).json({
      success: true,
      requirements: requirements[deviceClass].requirements,
      recommendedPathway: requirements[deviceClass].recommendedPathway
    });
    
  } catch (error) {
    console.error('Error fetching 510(k) requirements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch 510(k) requirements'
    });
  }
});

/**
 * Find predicate devices based on device profile
 */
router.post('/find-predicates', validateDeviceData, async (req, res) => {
  try {
    const { deviceData, organizationId } = req.body;
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not available. Cannot perform predicate device search.');
      return res.status(500).json({
        success: false,
        message: 'OpenAI API key is required for predicate device discovery. Please provide a valid API key.'
      });
    }
    
    // Initialize OpenAI if not already done
    if (!openai) {
      try {
        const { OpenAI } = require('openai');
        openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });
        console.log('OpenAI client initialized for predicate device search');
      } catch (err) {
        console.error('Failed to initialize OpenAI client:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to initialize AI services for predicate device search'
        });
      }
    }

    // Use OpenAI to find predicates in the real implementation
    console.log('Searching for predicate devices using OpenAI for:', deviceData.deviceName);
    
    try {
      // Create a structured prompt to get consistently formatted results
      const prompt = `
        Analyze the following medical device and find potential predicate devices (similar FDA-cleared devices) 
        and relevant literature references that could support a 510(k) submission.
        
        DEVICE DETAILS:
        - Name: ${deviceData.deviceName}
        - Class: ${deviceData.deviceClass}
        - Intended Use: ${deviceData.intendedUse || 'Not specified'}
        - Description: ${deviceData.description || 'Not specified'}
        - Technology Type: ${deviceData.technologyType || 'Not specified'}
        
        INSTRUCTIONS:
        1. Search for similar FDA-cleared medical devices that could serve as predicates.
        2. Find relevant scientific literature to support substantial equivalence.
        3. Format your response as structured JSON with the following format:
        {
          "predicateDevices": [
            {
              "deviceName": "string",
              "kNumber": "string",
              "clearanceDate": "YYYY-MM-DD",
              "manufacturer": "string",
              "deviceClass": "string",
              "matchScore": number (0.0-1.0),
              "matchRationale": "string",
              "description": "string"
            },
            ...
          ],
          "literatureReferences": [
            {
              "title": "string",
              "authors": ["string"],
              "journal": "string",
              "year": number,
              "doi": "string",
              "url": "string",
              "relevanceScore": number (0.0-1.0),
              "abstract": "string"
            },
            ...
          ]
        }
        
        Return only the JSON with 3-5 predicate devices and 3-5 literature references.
      `;
      
      // Make the OpenAI API call
      const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: "You are a regulatory affairs specialist with expertise in FDA 510(k) submissions." },
                  { role: "user", content: prompt }],
        model: "gpt-4o",
        response_format: { type: "json_object" }
      });
      
      // Parse the response
      const responseContent = completion.choices[0].message.content;
      let jsonResponse;
      
      try {
        jsonResponse = JSON.parse(responseContent);
        
        // Log success and return the formatted response
        console.log('Successfully generated predicate devices using OpenAI');
        
        // Restructure the response to match client expectations
        // The client expects predicateDevices at the top level
        res.status(200).json({
          success: true,
          predicateDevices: jsonResponse.predicateDevices || [],
          literatureReferences: jsonResponse.literatureReferences || [],
          // Include the full response as a fallback
          predicates: jsonResponse
        });
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        console.log('Raw response:', responseContent);
        
        // If parsing fails, return a fallback with error details
        throw new Error('Failed to parse AI response: ' + parseError.message);
      }
    } catch (aiError) {
      console.error('Error using OpenAI for predicate search:', aiError);
      
      // Instead of using mock fallback data, return an error for GA release quality
      return res.status(500).json({
        success: false,
        message: 'Failed to perform AI-powered predicate device search: ' + aiError.message,
        recommendation: 'Please try again or check your OpenAI API key configuration.'
      });
    }
    
  } catch (error) {
    console.error('Error finding predicate devices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find predicate devices'
    });
  }
});

/**
 * Analyze regulatory pathway for device
 */
router.post('/analyze-pathway', validateDeviceData, async (req, res) => {
  try {
    const { deviceData, organizationId } = req.body;
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not available. Cannot perform regulatory pathway analysis.');
      return res.status(500).json({
        success: false,
        message: 'OpenAI API key is required for regulatory pathway analysis. Please provide a valid API key.'
      });
    }
    
    // Initialize OpenAI if not already done
    if (!openai) {
      try {
        const { OpenAI } = require('openai');
        openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });
        console.log('OpenAI client initialized for regulatory pathway analysis');
      } catch (err) {
        console.error('Failed to initialize OpenAI client:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to initialize AI services for regulatory pathway analysis'
        });
      }
    }
    
    console.log('Analyzing regulatory pathway for device:', deviceData.deviceName);
    
    try {
      // Create a structured prompt to get consistently formatted results
      const prompt = `
        Perform a regulatory pathway analysis for the following medical device 510(k) submission:
        
        DEVICE DETAILS:
        - Name: ${deviceData.deviceName}
        - Class: ${deviceData.deviceClass}
        - Intended Use: ${deviceData.intendedUse || 'Not specified'}
        - Description: ${deviceData.description || 'Not specified'}
        - Technology Type: ${deviceData.technologyType || 'Not specified'}
        
        INSTRUCTIONS:
        Analyze the appropriate regulatory pathway for this device and provide:
        1. The recommended submission pathway (Traditional 510(k), Special 510(k), Abbreviated 510(k), or De Novo)
        2. Rationale for your recommendation
        3. Estimated timeline in days
        4. Key milestones with estimated days for each
        5. Any special requirements specific to this device type
        
        FORMAT YOUR RESPONSE AS A JSON OBJECT with the following structure:
        {
          "recommendedPathway": "string",
          "confidenceScore": number (0.0-1.0),
          "rationale": "string",
          "estimatedTimelineInDays": number,
          "keyMilestones": [
            { "name": "string", "days": number, "description": "string" }
          ],
          "specialRequirements": [
            "string"
          ]
        }
      `;
      
      // Call OpenAI with a structured prompt
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a medical device regulatory expert specializing in FDA 510(k) submissions. Provide detailed, accurate regulatory pathway analysis based on device specifications."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });
      
      // Parse the response from OpenAI
      let pathwayAnalysis;
      try {
        pathwayAnalysis = JSON.parse(completion.choices[0].message.content);
        console.log('Successfully parsed regulatory pathway analysis');
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', parseError);
        throw new Error('Failed to parse AI-generated regulatory pathway analysis');
      }
      
      return res.status(200).json({
        success: true,
        ...pathwayAnalysis
      });
    } catch (aiError) {
      console.error('Error in OpenAI processing:', aiError);
      throw new Error(`AI processing error: ${aiError.message}`);
    }
  } catch (error) {
    console.error('Error analyzing regulatory pathway:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to analyze regulatory pathway'
    });
  }
});

/**
 * Literature Review API Endpoint
 * Retrieves relevant scientific literature based on search query and date range
 */
router.post('/literature-review', async (req, res) => {
  try {
    const { query, fromDate, toDate } = req.body;
    
    // Basic validation
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    console.log(`Performing literature review for query: "${query}" from ${fromDate || 'any time'} to ${toDate || 'present'}`);
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not available. Cannot perform literature review.');
      return res.status(500).json({
        success: false,
        message: 'OpenAI API key is required for literature review. Please provide a valid API key.'
      });
    }
    
    try {
      // Fetch literature from multiple sources (PubMed, Google Scholar, etc.)
      // This would call actual APIs in production
      const dateParams = {
        fromDate: fromDate || '2015-01-01',
        toDate: toDate || new Date().toISOString().split('T')[0]
      };
      
      // Fetch results from multiple sources
      const literatureResults = await Promise.allSettled([
        // These would be actual API calls in production
        fetchPubMed(query, dateParams),
        fetchScholar(query, dateParams),
        fetchFAERS(query, dateParams)
      ]);
      
      // Extract successful results
      const allResults = literatureResults
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => result.value)
        .slice(0, 15); // Limit to top 15 results across all sources
      
      // Use OpenAI to enhance and summarize each result
      const enhancedResults = await Promise.all(
        allResults.map(async (item) => {
          try {
            // Create a prompt for the AI to generate a summary and extract key points
            const prompt = `
              Please review this scientific literature and extract key information relevant to FDA 510(k) medical device submissions:
              
              Title: ${item.title}
              Date: ${item.date}
              Authors: ${item.authors}
              Abstract: ${item.abstract}
              
              Create a concise summary that highlights:
              1. The key findings or conclusions
              2. Relevance to medical device regulatory submissions
              3. Any safety or efficacy data that could support substantial equivalence claims
              4. Any novel methods or technologies described
              
              Format your response in 3-5 sentences that would be most useful for a regulatory affairs professional preparing a 510(k) submission.
            `;
            
            // Call OpenAI to generate the summary
            const completion = await openai.chat.completions.create({
              messages: [
                { role: "system", content: "You are a regulatory affairs specialist with expertise in medical device literature reviews for FDA submissions." },
                { role: "user", content: prompt }
              ],
              model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
              temperature: 0.2,
              max_tokens: 250
            });
            
            const summary = completion.choices[0].message.content.trim();
            
            // Return enhanced item with AI-generated summary
            return {
              ...item,
              summary,
              id: `lit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            };
          } catch (error) {
            console.error(`Error enhancing literature item: ${error.message}`);
            // Return the original item without enhancement if AI processing fails
            return {
              ...item,
              summary: "Summary generation failed. Please try again later.",
              id: `lit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            };
          }
        })
      );
      
      // Return the enhanced results
      return res.status(200).json({
        success: true,
        results: enhancedResults,
        query,
        dateRange: {
          fromDate: dateParams.fromDate,
          toDate: dateParams.toDate
        }
      });
      
    } catch (processingError) {
      console.error('Error processing literature review:', processingError);
      return res.status(500).json({
        success: false,
        message: `Failed to process literature review: ${processingError.message}`
      });
    }
    
  } catch (error) {
    console.error('Error in literature review endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to perform literature review'
    });
  }
});

/**
 * Run compliance check on device profile
 */
router.post('/compliance-check', validateDeviceData, async (req, res) => {
  try {
    const { deviceData, organizationId } = req.body;
    console.log('Running compliance check for device:', deviceData.deviceName);
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not available. Cannot perform compliance check.');
      return res.status(500).json({
        success: false,
        message: 'OpenAI API key is required for compliance checking. Please provide a valid API key.'
      });
    }
    
    // Initialize OpenAI if not already done
    if (!openai) {
      try {
        const { OpenAI } = require('openai');
        openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });
        console.log('OpenAI client initialized for compliance check');
      } catch (err) {
        console.error('Failed to initialize OpenAI client:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to initialize AI services for compliance checking'
        });
      }
    }
    
    // Use OpenAI for real compliance checking
    try {
      // Create a structured prompt to get consistently formatted results
      const prompt = `
        Perform a comprehensive 510(k) compliance check for the following medical device:
        
        DEVICE DETAILS:
        - Name: ${deviceData.deviceName}
        - Class: ${deviceData.deviceClass}
        - Intended Use: ${deviceData.intendedUse || 'Not specified'}
        - Description: ${deviceData.description || 'Not specified'}
        - Technology Type: ${deviceData.technologyType || 'Not specified'}
        
        INSTRUCTIONS:
        1. Analyze the device against FDA 510(k) submission requirements.
        2. Identify potential compliance issues or gaps based on device classification.
        3. Format your response as structured JSON with the following format:
        {
          "isValid": boolean,
          "score": number (0.0-1.0),
          "passedChecks": number,
          "totalChecks": number,
          "criticalIssues": number,
          "warnings": number,
          "errors": number,
          "detailedChecks": [
            {
              "id": "string",
              "name": "string",
              "category": "Documentation" | "Technical" | "Clinical" | "Labeling" | "Regulatory",
              "status": "passed" | "warning" | "failed",
              "description": "string",
              "recommendation": "string"
            },
            ...
          ]
        }
        
        Ensure the detailed checks include at least 10-15 specific items relevant to this device type and class.
        Return only the JSON data without any additional text.
      `;
      
      // Make the OpenAI API call
      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: "You are a medical device regulatory specialist with expertise in FDA 510(k) submissions." },
          { role: "user", content: prompt }
        ],
        model: "gpt-4o",
        response_format: { type: "json_object" }
      });
      
      // Parse the response
      const responseContent = completion.choices[0].message.content;
      let complianceResults;
      
      try {
        complianceResults = JSON.parse(responseContent);
        
        // Add timestamp to results
        complianceResults.timestamp = new Date().toISOString();
        
        // Log success and return the formatted response
        console.log('Successfully generated compliance check using OpenAI');
        
        res.status(200).json({
          success: true,
          ...complianceResults
        });
      } catch (parseError) {
        console.error('Error parsing OpenAI compliance check response:', parseError);
        throw new Error('Failed to parse AI response: ' + parseError.message);
      }
    } catch (aiError) {
      console.error('Error using OpenAI for compliance check:', aiError);
      
      // Instead of using mock fallback data, return an error for GA release quality
      return res.status(500).json({
        success: false,
        message: 'Failed to perform AI-powered compliance check: ' + aiError.message,
        recommendation: 'Please try again or check your OpenAI API key configuration.'
      });
    }
  } catch (error) {
    console.error('Error running compliance check:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run compliance check'
    });
  }
});

/**
 * Generate NLP summary for text
 */
router.post('/summarize', async (req, res) => {
  const { text } = req.body;
  
  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key not available. Cannot generate summary.');
    return res.status(500).json({
      success: false,
      message: 'OpenAI API key is required for summary generation'
    });
  }
  
  try {
    // Initialize OpenAI if needed
    await initializeOpenAI();
    
    const summary = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a regulatory affairs assistant.' },
        { role: 'user', content: `Please summarize this text in 2–3 sentences:\n\n${text}` }
      ]
    });
    
    res.json({ summary: summary.choices[0].message.content.trim() });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ 
      error: 'Failed to generate summary',
      message: error.message 
    });
  }
});

// Utility function to initialize OpenAI
const initializeOpenAI = async () => {
  if (!openai) {
    try {
      if (!process.env.OPENAI_API_KEY) {
        console.error('OpenAI API key not available');
        throw new Error('OpenAI API key is required for FDA 510(k) automation');
      }
      
      const { OpenAI } = require('openai');
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      console.log('OpenAI client initialized for FDA 510(k) automation');
      return openai;
    } catch (err) {
      console.error('Failed to initialize OpenAI client:', err);
      throw new Error('Failed to initialize AI services for FDA 510(k) automation');
    }
  }
  return openai;
};

/**
 * Get AI recommendations for predicate devices based on device profile
 */
router.post('/recommend', async (req, res) => {
  try {
    const profile = req.body.deviceProfile;
    
    // Validate input
    if (!profile) {
      return res.status(400).json({
        success: false,
        message: 'Device profile is required'
      });
    }
    
    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not available. Cannot generate recommendations.');
      return res.status(500).json({
        success: false,
        message: 'OpenAI API key is required for recommendations'
      });
    }
    
    // Initialize OpenAI if needed
    await initializeOpenAI();
    
    const prompt = `
    You are a regulatory AI assistant. Given this device profile JSON:
    ${JSON.stringify(profile, null, 2)}
    Recommend the top 5 predicate devices (by name & ID) with a one-sentence rationale each.
    Respond in JSON: [{ id: string, name: string, rationale: string }, …].
    `;
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" }
    });
    
    try {
      const recs = JSON.parse(completion.choices[0].message.content);
      res.json({ 
        success: true,
        recommendations: recs 
      });
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      res.status(500).json({
        success: false,
        message: 'Failed to parse AI recommendations'
      });
    }
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate recommendations'
    });
  }
});

// Export the router
/**
 * Semantic search for predicate devices
 */
router.post('/semantic-search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'A valid search query is required'
      });
    }
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not available. Cannot perform semantic search.');
      return res.status(500).json({
        success: false,
        message: 'OpenAI API key is required for semantic search. Please provide a valid API key.'
      });
    }
    
    try {
      // 1) Get embedding for user query
      const embedRes = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: query
      });
      const qVec = embedRes.data[0].embedding;

      // 2) Connect to the database pool
      const db = new Pool({ connectionString: process.env.DATABASE_URL });
      
      // 3) Find top-10 nearest predicate_devices by cosine similarity
      // PostgreSQL vector embedding handling
      // Ensure the vector is properly formatted for pgvector operations
      let formattedVector;
      
      // Check if the database supports passing arrays directly
      try {
        // First try with a direct array approach
        const sql = `
          SELECT id, name, description,
            1 - (embedding <=> $1::vector) AS score
          FROM predicate_devices
          WHERE embedding IS NOT NULL
          ORDER BY embedding <=> $1::vector
          LIMIT 10
        `;
        
        const { rows } = await db.query(sql, [qVec]);
        
        // If successful, return the results
        console.log(`Semantic search successful with direct approach, found ${rows.length} results`);
        return res.json({ success: true, results: rows });
      } catch (directError) {
        console.warn("Direct vector approach failed, falling back to string formatting:", directError.message);
        
        // Fall back to string formatting as a backup approach
        formattedVector = `[${qVec.join(',')}]`;
        
        const sql = `
          SELECT id, name, description,
            1 - (embedding <=> $1) AS score
          FROM predicate_devices
          WHERE embedding IS NOT NULL
          ORDER BY embedding <=> $1
          LIMIT 10
        `;
        
        const { rows } = await db.query(sql, [formattedVector]);
        
        // Close the database connection when done
        await db.end();
        
        // 4) Return results from fallback approach
        return res.json({ 
          success: true,
          results: rows 
        });
      }
      // This code is now unreachable due to the early returns in both try and catch
    } catch (err) {
      console.error('Semantic search error:', err);
      res.status(500).json({ 
        success: false,
        error: 'Semantic search failed',
        message: err.message
      });
    }
  } catch (error) {
    console.error('Error in semantic search endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Semantic search failed due to a server error'
    });
  }
});

/**
 * Semantic Scholar search endpoint
 */
router.post('/semantic-scholar', async (req, res) => {
  try {
    const { query } = req.body;
    const resp = await fetch(
      `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=15&fields=title,abstract,url,year`
    );
    const json = await resp.json();
    // normalize
    const results = json.data.map(p => ({
      id: p.paperId,
      title: p.title,
      abstract: p.abstract,
      url: p.url,
      year: p.year,
      source: "Semantic Scholar"
    }));
    res.json({ results });
  } catch (err) {
    console.error('Semantic Scholar error:', err);
    res.status(500).json({ error: 'Semantic Scholar search failed' });
  }
});

/**
 * ClinicalTrials.gov search endpoint
 */
router.post('/clinical-trials', async (req, res) => {
  try {
    const { query } = req.body;
    const resp = await fetch(
      `https://clinicaltrials.gov/api/query/study_fields?expr=${encodeURIComponent(query)}&fields=BriefTitle,BriefSummary,Condition,URL&max_rnk=15&fmt=json`
    );
    const json = await resp.json();
    const results = json.StudyFieldsResponse.StudyFields.map(s => ({
      id: s.NCTId?.[0] || `trial-${Date.now()}`,
      title: s.BriefTitle?.[0],
      abstract: s.BriefSummary?.[0],
      url: `https://clinicaltrials.gov/ct2/show/${s.NCTId?.[0]}`,
      source: "ClinicalTrials.gov"
    }));
    res.json({ results });
  } catch (err) {
    console.error('ClinicalTrials.gov error:', err);
    res.status(500).json({ error: 'ClinicalTrials.gov search failed' });
  }
});

/**
 * IEEE Xplore search endpoint
 */
router.post('/ieee-xplore', async (req, res) => {
  try {
    const { query } = req.body;
    
    // Check for IEEE API key
    const apiKey = process.env.IEEE_API_KEY;
    if (!apiKey) {
      console.warn('IEEE API key not found, using fallback example data');
      return res.json({ 
        results: [
          {
            id: "example-ieee-1",
            title: "Medical Device Security: A Survey of Concerns, Approaches, and Challenges",
            abstract: "Medical devices are increasingly connected to networks for remote monitoring and control. This survey examines security challenges and approaches for securing these devices.",
            url: "https://ieeexplore.ieee.org/document/example1",
            year: 2023,
            source: "IEEE Xplore (Example)"
          },
          {
            id: "example-ieee-2",
            title: "Regulatory Considerations for AI-Based Medical Devices",
            abstract: "This paper reviews the current regulatory landscape for artificial intelligence and machine learning technologies in medical devices.",
            url: "https://ieeexplore.ieee.org/document/example2",
            year: 2024,
            source: "IEEE Xplore (Example)"
          }
        ]
      });
    }
    
    const resp = await fetch(
      `https://ieeexploreapi.ieee.org/api/v1/search/articles?querytext=${encodeURIComponent(query)}&max_records=15&apikey=${apiKey}`
    );
    const json = await resp.json();
    const results = json.articles.map(a => ({
      id: a.article_number,
      title: a.title,
      abstract: a.abstract,
      url: a.html_url,
      year: a.publication_year,
      source: "IEEE Xplore"
    }));
    res.json({ results });
  } catch (err) {
    console.error('IEEE Xplore error:', err);
    res.status(500).json({ error: 'IEEE Xplore search failed' });
  }
});

/**
 * DOAJ (Directory of Open Access Journals) search endpoint
 */
router.post('/doaj-search', async (req, res) => {
  try {
    const { query } = req.body;
    const resp = await fetch(
      `https://doaj.org/api/v2/search/articles/${encodeURIComponent(query)}`
    );
    const json = await resp.json();
    const results = json.results.slice(0,15).map(r => ({
      id: r.id,
      title: r.bibjson.title,
      abstract: r.bibjson.abstract[0],
      url: r.bibjson.link.find(l=>l.type==='full text')?.url,
      year: r.bibjson.year,
      source: "DOAJ"
    }));
    res.json({ results });
  } catch (err) {
    console.error('DOAJ error:', err);
    res.status(500).json({ error: 'DOAJ search failed' });
  }
});

/**
 * PDF upload and processing endpoint
 */
router.post('/upload-literature', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }
    
    console.log(`Processing uploaded PDF file: ${req.file.originalname}, size: ${req.file.size} bytes`);
    
    // Parse the PDF file
    const data = await pdfParse(req.file.buffer);
    
    // Extract text and truncate if too large 
    // (to avoid overwhelming the API and the UI)
    const text = data.text.slice(0, 15000); 
    
    res.json({ 
      success: true,
      text: text, 
      pageCount: data.numpages,
      fileName: req.file.originalname
    });
  } catch (err) {
    console.error('Error processing PDF file:', err);
    res.status(500).json({ 
      success: false,
      message: 'PDF parsing failed: ' + err.message 
    });
  }
});

export default router;
export { router };