/**
 * Intelligence API Routes
 * 
 * This module provides the server-side implementation of the central intelligence system
 * for TrialSage, exposing endpoints for AI-powered regulatory and scientific intelligence,
 * blockchain verification, and cross-module data analysis.
 */

import { Router } from 'express';
import { OpenAI } from 'openai';
import { db } from '../db.js';
import { verifyAuthorization } from '../middleware/auth.js';
import { verifyBlockchain } from '../services/blockchain.js';
import { getRegulationsByAuthority } from '../services/regulatory-database.js';
import { extractDocumentData } from '../services/document-processor.js';
import { generatePredictiveModel } from '../services/ai-models.js';

const router = Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// AI model configurations
const MODEL_CONFIGURATIONS = {
  standard: {
    model: 'gpt-4o',
    temperature: 0.2,
    maxTokens: 4000,
    blockchainEnabled: false
  },
  advanced: {
    model: 'gpt-4o',
    temperature: 0.1,
    maxTokens: 8000,
    blockchainEnabled: true
  },
  expert: {
    model: 'gpt-4o-2024-08', // Example of future model
    temperature: 0.1,
    maxTokens: 16000,
    blockchainEnabled: true
  },
  enterprise: {
    model: 'gpt-4-turbo-preview',
    temperature: 0.05,
    maxTokens: 32000,
    blockchainEnabled: true,
    enhancedSecurity: true
  }
};

// Current active model configuration (can be updated via API)
let currentModelConfig = MODEL_CONFIGURATIONS.advanced;

// Initialize the intelligence system
router.post('/initialize', verifyAuthorization(['user', 'admin']), async (req, res) => {
  try {
    const { aiModelTier = 'advanced', enableBlockchain = true } = req.body;
    
    // Set model configuration based on tier
    if (MODEL_CONFIGURATIONS[aiModelTier]) {
      currentModelConfig = MODEL_CONFIGURATIONS[aiModelTier];
    }
    
    // Get active regulatory authorities from database
    const authorities = await db.query(`
      SELECT code, name, country, last_update 
      FROM regulatory_authorities 
      WHERE is_active = true
    `);
    
    // Test connection to OpenAI
    const aiTest = await openai.chat.completions.create({
      model: currentModelConfig.model,
      messages: [{ role: 'user', content: 'Test connection' }],
      max_tokens: 5
    });
    
    // Initialize blockchain if enabled
    let blockchainStatus = { enabled: false };
    if (enableBlockchain) {
      blockchainStatus = await verifyBlockchain.initialize();
    }
    
    return res.status(200).json({
      status: 'success',
      aiStatus: {
        connected: !!aiTest,
        model: currentModelConfig.model
      },
      authorities: authorities.rows,
      blockchainStatus,
      activeModel: {
        tier: aiModelTier,
        config: currentModelConfig
      }
    });
  } catch (error) {
    console.error('Error initializing intelligence system:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to initialize intelligence system',
      error: error.message
    });
  }
});

// Get regulatory insights
router.get('/regulatory-insights', verifyAuthorization(['user', 'admin']), async (req, res) => {
  try {
    const { contextType, contextId } = req.query;
    
    if (!contextType || !contextId) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters: contextType and contextId'
      });
    }
    
    // Retrieve context data based on type
    let contextData;
    switch (contextType) {
      case 'project':
        contextData = await db.query(`
          SELECT * FROM projects WHERE id = $1
        `, [contextId]);
        break;
      case 'document':
        contextData = await db.query(`
          SELECT * FROM documents WHERE id = $1
        `, [contextId]);
        break;
      case 'submission':
        contextData = await db.query(`
          SELECT * FROM regulatory_submissions WHERE id = $1
        `, [contextId]);
        break;
      default:
        return res.status(400).json({
          status: 'error',
          message: 'Invalid contextType'
        });
    }
    
    if (!contextData.rows.length) {
      return res.status(404).json({
        status: 'error',
        message: 'Context not found'
      });
    }
    
    // Get related regulatory information
    const projectId = contextType === 'project' ? contextId : contextData.rows[0].project_id;
    
    // Get project information
    const projectInfo = await db.query(`
      SELECT * FROM projects WHERE id = $1
    `, [projectId]);
    
    // Get applicable regulations
    const regulations = await getRegulationsByAuthority(projectInfo.rows[0].target_authority);
    
    // Generate AI insights based on context and regulations
    const prompt = `
      You are TrialSage's Regulatory Intelligence System, a specialized AI for pharmaceutical regulatory affairs.
      
      Context: ${JSON.stringify(contextData.rows[0])}
      
      Project Information: ${JSON.stringify(projectInfo.rows[0])}
      
      Applicable Regulations: ${JSON.stringify(regulations)}
      
      Based on the above information, provide comprehensive regulatory insights including:
      1. Key regulatory considerations for this ${contextType}
      2. Potential regulatory challenges or gaps
      3. Strategic recommendations to enhance regulatory compliance
      4. Relevant regulatory guidance documents
      5. Submission strategy recommendations
      
      Format your response as a structured JSON object with the following keys:
      - keyConsiderations (array of objects with title and description)
      - challenges (array of objects with title, description, and severity)
      - recommendations (array of objects with title, description, and priority)
      - guidanceDocuments (array of objects with title, authority, and relevance)
      - submissionStrategy (object with approach, timeline, and recommendations)
    `;
    
    const completion = await openai.chat.completions.create({
      model: currentModelConfig.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: currentModelConfig.temperature,
      max_tokens: currentModelConfig.maxTokens,
      response_format: { type: 'json_object' }
    });
    
    const insights = JSON.parse(completion.choices[0].message.content);
    
    // Enrich with additional metadata
    const enhancedInsights = {
      ...insights,
      metadata: {
        generatedAt: new Date().toISOString(),
        contextType,
        contextId,
        targetAuthority: projectInfo.rows[0].target_authority,
        modelVersion: currentModelConfig.model,
        confidenceScore: 0.85 // This would be dynamically calculated in a real system
      }
    };
    
    return res.status(200).json(enhancedInsights);
  } catch (error) {
    console.error('Error generating regulatory insights:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to generate regulatory insights',
      error: error.message
    });
  }
});

// Get scientific insights
router.get('/scientific-insights', verifyAuthorization(['user', 'admin']), async (req, res) => {
  try {
    const { contextType, contextId } = req.query;
    
    if (!contextType || !contextId) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters: contextType and contextId'
      });
    }
    
    // Retrieve context data based on type
    let contextData;
    let scientificData = {};
    
    switch (contextType) {
      case 'project':
        contextData = await db.query(`
          SELECT * FROM projects WHERE id = $1
        `, [contextId]);
        
        // Get scientific data related to the project
        const clinicalData = await db.query(`
          SELECT * FROM clinical_data WHERE project_id = $1
        `, [contextId]);
        
        const nonclinicalData = await db.query(`
          SELECT * FROM nonclinical_data WHERE project_id = $1
        `, [contextId]);
        
        scientificData = {
          clinical: clinicalData.rows,
          nonclinical: nonclinicalData.rows
        };
        break;
        
      case 'protocol':
        contextData = await db.query(`
          SELECT * FROM protocols WHERE id = $1
        `, [contextId]);
        
        // Get protocol-specific scientific data
        const endpointData = await db.query(`
          SELECT * FROM protocol_endpoints WHERE protocol_id = $1
        `, [contextId]);
        
        scientificData = {
          endpoints: endpointData.rows
        };
        break;
        
      default:
        return res.status(400).json({
          status: 'error',
          message: 'Invalid contextType for scientific insights'
        });
    }
    
    if (!contextData.rows.length) {
      return res.status(404).json({
        status: 'error',
        message: 'Context not found'
      });
    }
    
    // Generate AI insights based on context and scientific data
    const prompt = `
      You are TrialSage's Scientific Intelligence System, a specialized AI for pharmaceutical and clinical research.
      
      Context: ${JSON.stringify(contextData.rows[0])}
      
      Scientific Data: ${JSON.stringify(scientificData)}
      
      Based on the above information, provide comprehensive scientific insights including:
      1. Scientific rationale and approach analysis
      2. Endpoint and outcome measure evaluation
      3. Statistical considerations and recommendations
      4. Study design and methodology assessment
      5. Potential scientific challenges and solutions
      
      Format your response as a structured JSON object with the following keys:
      - scientificRationale (object with strengths, gaps, and recommendations)
      - endpointEvaluation (array of objects with endpoint, evaluation, and recommendations)
      - statisticalConsiderations (object with approach, sampleSize, powering, and recommendations)
      - studyDesignAssessment (object with design, strengths, limitations, and alternatives)
      - scientificChallenges (array of objects with challenge, impact, and solutions)
    `;
    
    const completion = await openai.chat.completions.create({
      model: currentModelConfig.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: currentModelConfig.temperature,
      max_tokens: currentModelConfig.maxTokens,
      response_format: { type: 'json_object' }
    });
    
    const insights = JSON.parse(completion.choices[0].message.content);
    
    // Enrich with additional metadata
    const enhancedInsights = {
      ...insights,
      metadata: {
        generatedAt: new Date().toISOString(),
        contextType,
        contextId,
        dataPoints: Object.keys(scientificData).reduce((acc, key) => acc + (Array.isArray(scientificData[key]) ? scientificData[key].length : 0), 0),
        modelVersion: currentModelConfig.model,
        confidenceScore: 0.83 // This would be dynamically calculated in a real system
      }
    };
    
    return res.status(200).json(enhancedInsights);
  } catch (error) {
    console.error('Error generating scientific insights:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to generate scientific insights',
      error: error.message
    });
  }
});

// Generate recommendations
router.post('/recommendations', verifyAuthorization(['user', 'admin']), async (req, res) => {
  try {
    const { contextType, contextId, options = {} } = req.body;
    
    if (!contextType || !contextId) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters: contextType and contextId'
      });
    }
    
    // Get context data
    let contextData;
    switch (contextType) {
      case 'project':
        contextData = await db.query(`
          SELECT p.*, 
                 a.name as authority_name, 
                 pt.name as product_type_name
          FROM projects p
          LEFT JOIN regulatory_authorities a ON p.target_authority = a.code
          LEFT JOIN product_types pt ON p.product_type = pt.code
          WHERE p.id = $1
        `, [contextId]);
        break;
        
      case 'document':
        contextData = await db.query(`
          SELECT d.*, 
                 dt.name as document_type_name,
                 p.name as project_name,
                 p.target_authority
          FROM documents d
          LEFT JOIN document_types dt ON d.document_type = dt.code
          LEFT JOIN projects p ON d.project_id = p.id
          WHERE d.id = $1
        `, [contextId]);
        break;
        
      case 'submission':
        contextData = await db.query(`
          SELECT s.*, 
                 p.name as project_name,
                 p.target_authority,
                 a.name as authority_name
          FROM regulatory_submissions s
          LEFT JOIN projects p ON s.project_id = p.id
          LEFT JOIN regulatory_authorities a ON p.target_authority = a.code
          WHERE s.id = $1
        `, [contextId]);
        break;
        
      default:
        return res.status(400).json({
          status: 'error',
          message: 'Invalid contextType'
        });
    }
    
    if (!contextData.rows.length) {
      return res.status(404).json({
        status: 'error',
        message: 'Context not found'
      });
    }
    
    // Generate AI recommendations
    const prompt = `
      You are TrialSage's Strategic Recommendation Engine, a specialized AI for pharmaceutical development and regulatory strategy.
      
      Context: ${JSON.stringify(contextData.rows[0])}
      
      Options: ${JSON.stringify(options)}
      
      Based on the above information, provide strategic recommendations for this ${contextType} including:
      1. Action items with priority levels
      2. Strategic considerations
      3. Risk mitigation approaches
      4. Timeline optimization suggestions
      5. Resource allocation recommendations
      
      Format your response as an array of recommendation objects, each containing:
      - title (string): The recommendation title
      - description (string): Detailed description
      - category (string): Category of the recommendation (strategic, tactical, compliance, etc.)
      - priority (number): 1-5 with 5 being highest priority
      - impact (string): Expected impact of implementing this recommendation
      - timeframe (string): When this should be implemented
      - risks (array): Potential risks of not implementing this recommendation
      - implementationSteps (array): Steps to implement this recommendation
    `;
    
    const completion = await openai.chat.completions.create({
      model: currentModelConfig.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: currentModelConfig.temperature,
      max_tokens: currentModelConfig.maxTokens,
      response_format: { type: 'json_object' }
    });
    
    const recommendations = JSON.parse(completion.choices[0].message.content);
    
    // Store recommendations in database for future reference
    const recommendationInsert = await db.query(`
      INSERT INTO ai_recommendations
      (context_type, context_id, recommendations, created_by, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id
    `, [contextType, contextId, JSON.stringify(recommendations), req.user.id]);
    
    return res.status(200).json({
      recommendations,
      metadata: {
        id: recommendationInsert.rows[0].id,
        generatedAt: new Date().toISOString(),
        contextType,
        contextId,
        modelVersion: currentModelConfig.model
      }
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to generate recommendations',
      error: error.message
    });
  }
});

// Predict submission success
router.post('/predict/submission-success', verifyAuthorization(['user', 'admin']), async (req, res) => {
  try {
    const { submissionType, projectId, submissionData } = req.body;
    
    if (!submissionType || !projectId) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters: submissionType and projectId'
      });
    }
    
    // Get project information
    const projectInfo = await db.query(`
      SELECT p.*, 
             a.name as authority_name, 
             pt.name as product_type_name
      FROM projects p
      LEFT JOIN regulatory_authorities a ON p.target_authority = a.code
      LEFT JOIN product_types pt ON p.product_type = pt.code
      WHERE p.id = $1
    `, [projectId]);
    
    if (!projectInfo.rows.length) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
    }
    
    // Get historical submission data for similar products
    const historicalData = await db.query(`
      SELECT * FROM submission_outcomes
      WHERE submission_type = $1 AND product_type = $2
    `, [submissionType, projectInfo.rows[0].product_type]);
    
    // Generate predictive model
    const predictionModel = await generatePredictiveModel(
      submissionType, 
      projectInfo.rows[0].product_type,
      historicalData.rows
    );
    
    // Apply model to current submission data
    const prediction = predictionModel.predict(submissionData);
    
    // Generate AI analysis of prediction factors
    const prompt = `
      You are TrialSage's Submission Success Predictor, a specialized AI for regulatory submission outcomes.
      
      Project Information: ${JSON.stringify(projectInfo.rows[0])}
      
      Submission Type: ${submissionType}
      
      Submission Data: ${JSON.stringify(submissionData)}
      
      Predicted Success Probability: ${prediction.probability}
      
      Based on the above information, provide a comprehensive analysis of the factors affecting this submission's success probability, including:
      1. Key strengths that enhance the probability of success
      2. Critical gaps or weaknesses that could jeopardize approval
      3. Comparison to similar historical submissions
      4. Specific recommendations to improve the success probability
      
      Format your response as a JSON object with the following keys:
      - strengths (array of objects with factor and impact)
      - weaknesses (array of objects with factor, impact, and recommendations)
      - historicalComparison (object with similarities, differences, and insights)
      - recommendations (array of objects with title, description, and expectedImpact)
    `;
    
    const completion = await openai.chat.completions.create({
      model: currentModelConfig.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: currentModelConfig.temperature,
      max_tokens: currentModelConfig.maxTokens,
      response_format: { type: 'json_object' }
    });
    
    const analysis = JSON.parse(completion.choices[0].message.content);
    
    // Store prediction in database
    const predictionInsert = await db.query(`
      INSERT INTO submission_predictions
      (project_id, submission_type, probability, factors, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id
    `, [projectId, submissionType, prediction.probability, JSON.stringify(analysis)]);
    
    return res.status(200).json({
      probability: prediction.probability,
      confidenceInterval: prediction.confidenceInterval,
      analysis,
      metadata: {
        id: predictionInsert.rows[0].id,
        generatedAt: new Date().toISOString(),
        projectId,
        submissionType,
        modelVersion: predictionModel.version
      }
    });
  } catch (error) {
    console.error('Error predicting submission success:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to predict submission success',
      error: error.message
    });
  }
});

// Generate regulatory document
router.post('/generate/document', verifyAuthorization(['user', 'admin']), async (req, res) => {
  try {
    const { documentType, contextData, options = {} } = req.body;
    
    if (!documentType || !contextData) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters: documentType and contextData'
      });
    }
    
    // Get document template
    const templateQuery = await db.query(`
      SELECT * FROM document_templates
      WHERE document_type = $1 AND active = true
      ORDER BY version DESC
      LIMIT 1
    `, [documentType]);
    
    if (!templateQuery.rows.length) {
      return res.status(404).json({
        status: 'error',
        message: 'Document template not found'
      });
    }
    
    const template = templateQuery.rows[0];
    
    // Get regulatory requirements for document type
    const regulatoryRequirements = await db.query(`
      SELECT r.* 
      FROM regulatory_requirements r
      JOIN document_type_requirements dtr ON r.id = dtr.requirement_id
      WHERE dtr.document_type = $1 AND r.authority = $2
    `, [documentType, contextData.authority || 'FDA']);
    
    // Generate document content
    const prompt = `
      You are TrialSage's Document Generator, a specialized AI for pharmaceutical regulatory documentation.
      
      Document Type: ${documentType}
      
      Template: ${template.content}
      
      Context Data: ${JSON.stringify(contextData)}
      
      Regulatory Requirements: ${JSON.stringify(regulatoryRequirements.rows)}
      
      Options: ${JSON.stringify(options)}
      
      Based on the above information, generate a complete and compliant ${documentType} document:
      1. Follow the document template structure exactly
      2. Incorporate all context data appropriately
      3. Ensure compliance with all regulatory requirements
      4. Maintain scientific accuracy and clarity
      5. Use formal, professional language appropriate for regulatory submissions
      
      Format your response as a JSON object with the following keys:
      - title (string): Document title
      - content (object): The document content structured according to the template sections
      - metadata (object): Generated document metadata
    `;
    
    const completion = await openai.chat.completions.create({
      model: currentModelConfig.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: currentModelConfig.temperature,
      max_tokens: currentModelConfig.maxTokens,
      response_format: { type: 'json_object' }
    });
    
    const generatedDocument = JSON.parse(completion.choices[0].message.content);
    
    // Add additional metadata
    generatedDocument.metadata = {
      ...generatedDocument.metadata,
      generatedAt: new Date().toISOString(),
      documentType,
      templateId: template.id,
      templateVersion: template.version,
      modelVersion: currentModelConfig.model
    };
    
    // Store document in database if requested
    if (options.saveToDatabase) {
      const documentInsert = await db.query(`
        INSERT INTO documents
        (title, content, document_type, project_id, created_by, created_at, is_ai_generated)
        VALUES ($1, $2, $3, $4, $5, NOW(), true)
        RETURNING id
      `, [
        generatedDocument.title,
        JSON.stringify(generatedDocument.content),
        documentType,
        contextData.projectId,
        req.user.id
      ]);
      
      generatedDocument.metadata.id = documentInsert.rows[0].id;
    }
    
    // Create blockchain verification if enabled
    if (currentModelConfig.blockchainEnabled && options.enableBlockchain) {
      const blockchainResult = await verifyBlockchain.addDocument({
        documentType,
        content: JSON.stringify(generatedDocument),
        userId: req.user.id,
        timestamp: new Date().toISOString()
      });
      
      generatedDocument.metadata.blockchain = {
        verified: true,
        transactionId: blockchainResult.transactionId,
        timestamp: blockchainResult.timestamp
      };
    }
    
    return res.status(200).json(generatedDocument);
  } catch (error) {
    console.error('Error generating document:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to generate document',
      error: error.message
    });
  }
});

// Extract data from regulatory documents
router.post('/extract/document-data', verifyAuthorization(['user', 'admin']), async (req, res) => {
  try {
    const { documentId, extractionPoints = [], options = {} } = req.body;
    
    if (!documentId) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameter: documentId'
      });
    }
    
    // Get document from database
    const documentQuery = await db.query(`
      SELECT d.*, dt.name as document_type_name
      FROM documents d
      LEFT JOIN document_types dt ON d.document_type = dt.code
      WHERE d.id = $1
    `, [documentId]);
    
    if (!documentQuery.rows.length) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found'
      });
    }
    
    const document = documentQuery.rows[0];
    
    // Extract data using document processor service
    const extractionResult = await extractDocumentData(document, extractionPoints, options);
    
    return res.status(200).json({
      documentId,
      documentType: document.document_type,
      extractedData: extractionResult.extractedData,
      metadata: {
        extractionTimestamp: new Date().toISOString(),
        confidenceScores: extractionResult.confidenceScores,
        processingTime: extractionResult.processingTime
      }
    });
  } catch (error) {
    console.error('Error extracting document data:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to extract document data',
      error: error.message
    });
  }
});

// Get global regulatory requirements
router.get('/global-requirements', verifyAuthorization(['user', 'admin']), async (req, res) => {
  try {
    const { productType, authorities = '', ...options } = req.query;
    
    if (!productType) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameter: productType'
      });
    }
    
    // Parse authorities parameter
    const authorityList = authorities ? authorities.split(',') : [];
    
    // Get global requirements from database
    let requirementsQuery;
    if (authorityList.length > 0) {
      requirementsQuery = await db.query(`
        SELECT r.*, a.name as authority_name 
        FROM regulatory_requirements r
        JOIN regulatory_authorities a ON r.authority = a.code
        WHERE r.product_type = $1 AND r.authority = ANY($2)
        ORDER BY r.authority, r.category, r.id
      `, [productType, authorityList]);
    } else {
      requirementsQuery = await db.query(`
        SELECT r.*, a.name as authority_name 
        FROM regulatory_requirements r
        JOIN regulatory_authorities a ON r.authority = a.code
        WHERE r.product_type = $1
        ORDER BY r.authority, r.category, r.id
      `, [productType]);
    }
    
    // Group requirements by authority
    const groupedRequirements = {};
    
    for (const req of requirementsQuery.rows) {
      if (!groupedRequirements[req.authority]) {
        groupedRequirements[req.authority] = {
          authorityCode: req.authority,
          authorityName: req.authority_name,
          requirements: []
        };
      }
      
      groupedRequirements[req.authority].requirements.push({
        id: req.id,
        category: req.category,
        description: req.description,
        complianceLevel: req.compliance_level,
        documentationNeeded: req.documentation_needed,
        effectiveDate: req.effective_date,
        reference: req.reference
      });
    }
    
    return res.status(200).json({
      productType,
      authorities: Object.values(groupedRequirements),
      metadata: {
        timestamp: new Date().toISOString(),
        totalRequirements: requirementsQuery.rows.length
      }
    });
  } catch (error) {
    console.error('Error getting global regulatory requirements:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get global regulatory requirements',
      error: error.message
    });
  }
});

// Perform regulatory gap analysis
router.post('/gap-analysis', verifyAuthorization(['user', 'admin']), async (req, res) => {
  try {
    const { projectId, targetAuthority, options = {} } = req.body;
    
    if (!projectId || !targetAuthority) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters: projectId and targetAuthority'
      });
    }
    
    // Get project information
    const projectQuery = await db.query(`
      SELECT p.*, pt.name as product_type_name
      FROM projects p
      LEFT JOIN product_types pt ON p.product_type = pt.code
      WHERE p.id = $1
    `, [projectId]);
    
    if (!projectQuery.rows.length) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
    }
    
    const project = projectQuery.rows[0];
    
    // Get project documents
    const documentsQuery = await db.query(`
      SELECT d.*, dt.name as document_type_name
      FROM documents d
      LEFT JOIN document_types dt ON d.document_type = dt.code
      WHERE d.project_id = $1
    `, [projectId]);
    
    // Get target authority requirements
    const requirementsQuery = await db.query(`
      SELECT r.*, a.name as authority_name 
      FROM regulatory_requirements r
      JOIN regulatory_authorities a ON r.authority = a.code
      WHERE r.product_type = $1 AND r.authority = $2
      ORDER BY r.category, r.id
    `, [project.product_type, targetAuthority]);
    
    // Generate gap analysis
    const prompt = `
      You are TrialSage's Regulatory Gap Analyzer, a specialized AI for regulatory compliance analysis.
      
      Project Information: ${JSON.stringify(project)}
      
      Project Documents: ${JSON.stringify(documentsQuery.rows)}
      
      Target Authority Requirements: ${JSON.stringify(requirementsQuery.rows)}
      
      Based on the above information, perform a comprehensive regulatory gap analysis:
      1. Identify requirements that are fully met by existing documentation
      2. Identify requirements that are partially met and need additional information
      3. Identify requirements that are completely unaddressed
      4. Prioritize gaps based on criticality and impact on submission success
      5. Provide specific recommendations to address each gap
      
      Format your response as a JSON object with the following keys:
      - summary (object with overview, compliancePercentage, and criticalGapsCount)
      - metRequirements (array of requirement objects that are fully met)
      - partialRequirements (array of requirement objects with what's missing and recommendations)
      - missingRequirements (array of requirement objects with impact and recommendations)
      - strategicRecommendations (array of high-level recommendations)
    `;
    
    const completion = await openai.chat.completions.create({
      model: currentModelConfig.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: currentModelConfig.temperature,
      max_tokens: currentModelConfig.maxTokens,
      response_format: { type: 'json_object' }
    });
    
    const gapAnalysis = JSON.parse(completion.choices[0].message.content);
    
    // Store gap analysis in database
    const analysisInsert = await db.query(`
      INSERT INTO gap_analysis
      (project_id, target_authority, analysis_data, created_by, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id
    `, [projectId, targetAuthority, JSON.stringify(gapAnalysis), req.user.id]);
    
    return res.status(200).json({
      ...gapAnalysis,
      metadata: {
        id: analysisInsert.rows[0].id,
        generatedAt: new Date().toISOString(),
        projectId,
        targetAuthority,
        modelVersion: currentModelConfig.model
      }
    });
  } catch (error) {
    console.error('Error performing gap analysis:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to perform gap analysis',
      error: error.message
    });
  }
});

// Get regulatory authority updates
router.get('/regulatory-updates', verifyAuthorization(['user', 'admin']), async (req, res) => {
  try {
    const { authorities = '', ...options } = req.query;
    
    // Parse authorities parameter
    const authorityList = authorities ? authorities.split(',') : [];
    
    // Get regulatory updates from database
    let updatesQuery;
    if (authorityList.length > 0) {
      updatesQuery = await db.query(`
        SELECT u.*, a.name as authority_name 
        FROM regulatory_updates u
        JOIN regulatory_authorities a ON u.authority = a.code
        WHERE u.authority = ANY($1)
        ORDER BY u.published_date DESC
        LIMIT $2
      `, [authorityList, options.limit || 100]);
    } else {
      updatesQuery = await db.query(`
        SELECT u.*, a.name as authority_name 
        FROM regulatory_updates u
        JOIN regulatory_authorities a ON u.authority = a.code
        ORDER BY u.published_date DESC
        LIMIT $1
      `, [options.limit || 100]);
    }
    
    // Group updates by authority
    const groupedUpdates = {};
    
    for (const update of updatesQuery.rows) {
      if (!groupedUpdates[update.authority]) {
        groupedUpdates[update.authority] = {
          authorityCode: update.authority,
          authorityName: update.authority_name,
          updates: []
        };
      }
      
      groupedUpdates[update.authority].updates.push({
        id: update.id,
        title: update.title,
        summary: update.summary,
        category: update.category,
        impactLevel: update.impact_level,
        publishedDate: update.published_date,
        effectiveDate: update.effective_date,
        url: update.url
      });
    }
    
    return res.status(200).json({
      authorities: Object.values(groupedUpdates),
      metadata: {
        timestamp: new Date().toISOString(),
        totalUpdates: updatesQuery.rows.length
      }
    });
  } catch (error) {
    console.error('Error getting regulatory updates:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get regulatory updates',
      error: error.message
    });
  }
});

// System health endpoint
router.get('/system-health', verifyAuthorization(['admin']), async (req, res) => {
  try {
    // Check database connection
    const dbCheck = await db.query('SELECT NOW()');
    
    // Check OpenAI connection
    let aiStatus = { available: false, error: null };
    try {
      const aiCheck = await openai.chat.completions.create({
        model: currentModelConfig.model,
        messages: [{ role: 'user', content: 'System check' }],
        max_tokens: 5
      });
      
      aiStatus.available = true;
      aiStatus.model = currentModelConfig.model;
    } catch (error) {
      aiStatus.error = error.message;
    }
    
    // Check blockchain service if enabled
    let blockchainStatus = { enabled: currentModelConfig.blockchainEnabled, available: false, error: null };
    if (currentModelConfig.blockchainEnabled) {
      try {
        blockchainStatus = await verifyBlockchain.checkHealth();
      } catch (error) {
        blockchainStatus.error = error.message;
      }
    }
    
    return res.status(200).json({
      status: 'operational',
      components: {
        database: {
          available: !!dbCheck,
          timestamp: dbCheck?.rows[0]?.now
        },
        aiService: aiStatus,
        blockchainService: blockchainStatus
      },
      configuration: {
        aiModel: currentModelConfig.model,
        blockchainEnabled: currentModelConfig.blockchainEnabled
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking system health:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to check system health',
      error: error.message
    });
  }
});

export default router;