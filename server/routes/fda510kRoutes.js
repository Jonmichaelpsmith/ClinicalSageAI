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
export default router;
export { router };