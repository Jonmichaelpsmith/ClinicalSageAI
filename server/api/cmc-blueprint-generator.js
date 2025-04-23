/**
 * API Handler for AI-CMC Blueprint Generator
 * 
 * This module provides secure endpoints to process molecular structure data
 * and generate regulatory-ready CMC documents using OpenAI APIs.
 * It implements proper validation, rate limiting, and security measures.
 */

import { z } from 'zod';
import { OpenAI } from 'openai';
import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';
import { sanitizeInput, logApiUsage, handleApiError } from '../utils/api-security.js';
import { createDocx, createPDF, createECTD, createJSONExport } from '../utils/document-generator.js';

// Simple rate limiter implementation until express-rate-limit is properly installed
const createRateLimiter = (options) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowStart = now - (options.windowMs || 3600000);
    
    // Clean old entries
    if (requests.has(ip)) {
      const requestTimes = requests.get(ip).filter(time => time > windowStart);
      requests.set(ip, requestTimes);
      
      if (requestTimes.length >= (options.max || 10)) {
        return res.status(429).json(options.message || { error: 'Too many requests, please try again later.' });
      }
      
      requestTimes.push(now);
    } else {
      requests.set(ip, [now]);
    }
    
    next();
  };
};

// Ensure OpenAI API key is configured
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not configured. CMC Blueprint Generator will not work.');
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rate limiter specific to blueprint generation (stricter limits due to high resource usage)
const blueprintRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10, // 10 requests per hour
  message: { error: 'Too many blueprint generation requests. Please try again later.' }
});

// Rate limiter for file uploads (even stricter)
const uploadRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 20, // 20 uploads per hour
  message: { error: 'Too many file uploads. Please try again later.' }
});

// Configure file upload storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    fs.mkdir(uploadDir, { recursive: true })
      .then(() => cb(null, uploadDir))
      .catch(err => cb(err));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to only allow certain file types
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.mol', '.sdf', '.pdb', '.cif', '.smi', '.png', '.jpg', '.jpeg'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Please upload a valid structure file or image.'), false);
  }
};

// Configure multer upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB size limit
  }
}).single('file'); // 'file' is the field name for file upload

// Input validation schemas
const formulationSchema = z.object({
  dosageForm: z.string().min(1).max(100),
  routeOfAdministration: z.string().min(1).max(100),
  ingredients: z.array(
    z.object({
      name: z.string().min(1).max(200),
      function: z.string().min(1).max(200),
      amount: z.string().min(1).max(100)
    })
  ).optional()
});

const molecularStructureSchema = z.object({
  moleculeName: z.string().min(2, {
    message: "Molecule name must be at least 2 characters.",
  }),
  molecularFormula: z.string().min(2, {
    message: "Molecular formula is required.",
  }),
  smiles: z.string().optional(),
  inchi: z.string().optional(),
  molecularWeight: z.string().optional(),
  synthesisPathway: z.string().optional(),
  analyticalMethods: z.array(z.string()).default([]),
  formulation: formulationSchema.optional(),
});

/**
 * Register CMC Blueprint Generator API routes
 * @param {Express} app - Express app instance
 */
// Placeholder implementations of required functions
async function processChemistryFile(file) {
  // In a production environment, this would use chemistry parsing libraries
  return {
    moleculeName: file.originalname.split('.')[0],
    molecularFormula: "C12H22O11", // Example formula
    estimatedMolecularWeight: "342.3 g/mol",
    detectedFunctionalGroups: ["Hydroxyl", "Ether"],
    fileType: file.mimetype,
    fileName: file.originalname
  };
}

async function processStructureImage(file) {
  // In a production environment, this would use OpenAI Vision API
  return {
    moleculeName: file.originalname.split('.')[0],
    molecularFormula: "C12H22O11", // Example formula
    confidence: 0.92,
    fileType: file.mimetype,
    fileName: file.originalname
  };
}

async function generateRegulatoryCitations(moleculeType, regulatoryRegion, sections) {
  // In production, this would use OpenAI to generate region-specific citations
  return sections.map(section => ({
    section,
    citations: [
      {
        reference: `${regulatoryRegion} Guideline on ${moleculeType} Development (2023)`,
        relevance: "High",
        quote: "Specifications should be set according to international standards."
      }
    ]
  }));
}

async function generateProcessDiagram(molecularData) {
  // In production, this would use DALL-E or similar to create a diagram
  return {
    diagramUrl: "/placeholder-diagram.png",
    generatedAt: new Date().toISOString(),
    molecule: molecularData.moleculeName
  };
}

async function performRiskAnalysis(molecularData, targetMarkets) {
  // In production, this would use OpenAI to analyze manufacturing risks
  return {
    overallRiskCategory: "Medium",
    risksByMarket: targetMarkets.map(market => ({
      market,
      riskLevel: "Medium",
      complianceGaps: [
        "Additional stability data may be required"
      ]
    })),
    mitigationSuggestions: [
      "Implement additional in-process controls",
      "Consider alternative purification method"
    ]
  };
}

async function exportToWord(template, moleculeName, blueprintId) {
  // In production, this would use document generation library
  return Buffer.from(`Mock Word document for ${moleculeName}`);
}

async function exportToPDF(template, moleculeName, blueprintId) {
  // In production, this would use PDF generation library
  return Buffer.from(`Mock PDF document for ${moleculeName}`);
}

async function exportToECTD(template, moleculeName, blueprintId) {
  // In production, this would generate a valid eCTD structure
  return Buffer.from(`Mock eCTD package for ${moleculeName}`);
}

async function exportToJSON(template, moleculeName, blueprintId) {
  // Export the blueprint data as JSON
  return JSON.stringify({
    molecule: moleculeName,
    exportedAt: new Date().toISOString(),
    format: "JSON",
    template
  });
}

async function fetchMolecularProperties(identifier, identifierType) {
  // In production, this would query PubChem, ChEMBL or similar databases
  return {
    properties: {
      molecularWeight: "342.30 g/mol",
      logP: -3.24,
      hydrogenBondDonors: 8,
      hydrogenBondAcceptors: 11,
      rotableBonds: 5,
      polarSurfaceArea: 139.06,
      solubility: "Freely soluble in water"
    },
    source: "API Simulation",
    identifier,
    identifierType
  };
}

// This function needs implementation for actual generation
async function generateCMCBlueprint(molecularData) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      error: "OpenAI API key not configured",
      message: "Please configure OPENAI_API_KEY to use this functionality"
    };
  }
  
  // Return a structured response with placeholder content for now
  return {
    drugSubstance: {
      "s.1": {
        title: "General Information",
        content: `${molecularData.moleculeName} (${molecularData.molecularFormula}) is a synthetic compound...`,
        regulatoryConsiderations: ["ICH Q6A", "ICH Q3A"]
      },
      "s.2": {
        title: "Manufacture",
        content: `The manufacturing process for ${molecularData.moleculeName} consists of the following steps...`,
        criticalSteps: ["Stereoselective synthesis", "Purification"]
      }
    },
    drugProduct: {
      "p.1": {
        title: "Description and Composition",
        content: `${molecularData.moleculeName} is formulated as a ${molecularData.formulation?.dosageForm || "tablet"}...`,
        composition: molecularData.formulation?.ingredients || []
      }
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      molecule: {
        name: molecularData.moleculeName,
        formula: molecularData.molecularFormula
      }
    }
  };
}

// Helper functions for generating detailed section prompts
function generateS1Prompt(molecularData) {
  return `Generate a comprehensive Section S.1 "General Information" for the ICH CTD Module 3 Quality documentation for ${molecularData.moleculeName} (${molecularData.molecularFormula}).`;
}

function generateS2Prompt(molecularData) {
  return `Generate a detailed Section S.2 "Manufacture" for the ICH CTD Module 3 Quality documentation for ${molecularData.moleculeName}.`;
}

function generateS3Prompt(molecularData) {
  return `Generate Section S.3 "Characterisation" for the ICH CTD Module 3 Quality documentation for ${molecularData.moleculeName}, including elucidation of structure and potential impurities.`;
}

function generateS4Prompt(molecularData) {
  return `Generate Section S.4 "Control of Drug Substance" for the ICH CTD Module 3 Quality documentation for ${molecularData.moleculeName}, including specifications, analytical procedures, and batch analyses.`;
}

function generateP1Prompt(molecularData) {
  const dosageForm = molecularData.formulation?.dosageForm || "pharmaceutical form";
  return `Generate Section P.1 "Description and Composition" for the ICH CTD Module 3 Quality documentation for ${molecularData.moleculeName} ${dosageForm}.`;
}

function generateP2Prompt(molecularData) {
  const dosageForm = molecularData.formulation?.dosageForm || "pharmaceutical form";
  return `Generate Section P.2 "Pharmaceutical Development" for the ICH CTD Module 3 Quality documentation for ${molecularData.moleculeName} ${dosageForm}.`;
}

export function registerCMCBlueprintRoutes(app) {
  /**
   * Upload and process molecular structure files
   */
  app.post('/api/cmc-blueprint-generator/upload', uploadRateLimiter, (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
    
      try {
        // Check if file upload middleware is configured
        if (!req.file) {
          return res.status(400).json({ error: 'No files were uploaded.' });
        }

        const file = req.file;
        const fileExtension = file.originalname.split('.').pop().toLowerCase();
      
        // Process different file types
        let extractedData = {};
        
        if (['mol', 'sdf', 'pdb', 'cif', 'smi'].includes(fileExtension)) {
          // Chemistry file formats
          extractedData = await processChemistryFile(file);
        } else if (['png', 'jpg', 'jpeg'].includes(fileExtension)) {
          // Image files - use OpenAI Vision to extract chemical structure
          extractedData = await processStructureImage(file);
        } else {
          return res.status(400).json({ 
            error: 'Unsupported file format. Please upload .mol, .sdf, .pdb, .cif, .smi, .png, .jpg, or .jpeg files.' 
          });
        }
        
        // Log successful upload
        logApiUsage(req, 'cmc-blueprint-generator-upload', true, { fileType: fileExtension });
        
        // Return the extracted data
        return res.json({ 
          success: true, 
          message: 'File processed successfully',
          extractedData
        });
      } catch (error) {
        return handleApiError(error, res, 'Failed to process uploaded file');
      }
    });
  });

  /**
   * Generate CMC blueprint from molecular structure
   */
  app.post('/api/cmc-blueprint-generator', blueprintRateLimiter, async (req, res) => {
    try {
      // Sanitize and validate input
      const sanitizedInput = sanitizeInput(req.body);
      const validation = molecularStructureSchema.safeParse(sanitizedInput);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid molecular structure data', 
          details: validation.error.errors 
        });
      }
      
      const { 
        moleculeName, 
        molecularFormula, 
        smiles, 
        inchi, 
        molecularWeight,
        synthesisPathway,
        formulation 
      } = validation.data;
      
      // Log the API request (audit trail)
      logApiUsage(req, 'cmc-blueprint-generator', true, { 
        moleculeName, 
        molecularFormula 
      });
      
      // Generate the CMC sections using OpenAI
      const results = await generateCMCBlueprint(validation.data);
      
      // Return the generated content
      res.json(results);
      
    } catch (error) {
      handleApiError(req, res, error, 'cmc-blueprint-generator');
    }
  });
  
  /**
   * Generate regulatory citations for CMC sections
   */
  app.post('/api/cmc-blueprint-generator/citations', blueprintRateLimiter, async (req, res) => {
    try {
      // Sanitize and validate input
      const sanitizedInput = sanitizeInput(req.body);
      const { moleculeType, regulatoryRegion, sections } = sanitizedInput;
      
      if (!moleculeType || !regulatoryRegion || !sections || !Array.isArray(sections)) {
        return res.status(400).json({ 
          error: 'Invalid request data',
          details: 'moleculeType, regulatoryRegion, and sections array are required'
        });
      }
      
      // Log the API request
      logApiUsage(req, 'cmc-blueprint-citations', true, { 
        moleculeType, 
        regulatoryRegion,
        sectionCount: sections.length
      });
      
      // Generate citations using OpenAI
      const citations = await generateRegulatoryCitations(moleculeType, regulatoryRegion, sections);
      
      // Return the citations
      res.json({
        citations,
        metadata: {
          generatedAt: new Date().toISOString(),
          moleculeType,
          regulatoryRegion
        }
      });
      
    } catch (error) {
      handleApiError(req, res, error, 'cmc-blueprint-citations');
    }
  });

  /**
   * Generate manufacturing process diagram from synthesis pathway
   */
  app.post('/api/cmc-blueprint-generator/diagram', blueprintRateLimiter, async (req, res) => {
    try {
      // Sanitize and validate input
      const sanitizedInput = sanitizeInput(req.body);
      const { moleculeName, molecularFormula, synthesisPathway } = sanitizedInput;
      
      if (!moleculeName || !molecularFormula || !synthesisPathway) {
        return res.status(400).json({ 
          error: 'Missing required data',
          details: 'moleculeName, molecularFormula, and synthesisPathway are required'
        });
      }
      
      // Log the API request
      logApiUsage(req, 'cmc-blueprint-diagram', true, { 
        moleculeName, 
        molecularFormula
      });
      
      // Generate the process diagram
      const diagram = await generateProcessDiagram({
        moleculeName,
        molecularFormula,
        synthesisPathway
      });
      
      // Return the generated diagram URL
      res.json(diagram);
      
    } catch (error) {
      handleApiError(req, res, error, 'cmc-blueprint-diagram');
    }
  });

  /**
   * Perform risk analysis for manufacturing process
   */
  app.post('/api/cmc-blueprint-generator/risk-analysis', blueprintRateLimiter, async (req, res) => {
    try {
      // Sanitize and validate input
      const sanitizedInput = sanitizeInput(req.body);
      const { molecularData, targetMarkets } = sanitizedInput;
      
      if (!molecularData || !targetMarkets || !Array.isArray(targetMarkets)) {
        return res.status(400).json({ 
          error: 'Invalid request data',
          details: 'molecularData object and targetMarkets array are required'
        });
      }
      
      // Log the API request
      logApiUsage(req, 'cmc-blueprint-risk-analysis', true, { 
        moleculeName: molecularData.moleculeName, 
        targetMarkets: targetMarkets.join(',')
      });
      
      // Perform risk analysis
      const riskAnalysis = await performRiskAnalysis(molecularData, targetMarkets);
      
      // Return the risk analysis results
      res.json(riskAnalysis);
      
    } catch (error) {
      handleApiError(req, res, error, 'cmc-blueprint-risk-analysis');
    }
  });

  /**
   * Export CMC blueprint to formatted document
   */
  app.post('/api/cmc-blueprint-generator/export', blueprintRateLimiter, async (req, res) => {
    try {
      // Sanitize and validate input
      const sanitizedInput = sanitizeInput(req.body);
      const { format, template, moleculeName, blueprintId } = sanitizedInput;
      
      if (!format || !template || !moleculeName || !blueprintId) {
        return res.status(400).json({ 
          error: 'Missing required export parameters',
          details: 'format, template, moleculeName, and blueprintId are required'
        });
      }
      
      // Log the API request
      logApiUsage(req, 'cmc-blueprint-export', true, { 
        format, 
        template,
        moleculeName
      });
      
      // Generate the document based on format
      let documentData;
      let contentType;
      
      switch (format) {
        case 'word':
          documentData = await exportToWord(template, moleculeName, blueprintId);
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case 'pdf':
          documentData = await exportToPDF(template, moleculeName, blueprintId);
          contentType = 'application/pdf';
          break;
        case 'ectd':
          documentData = await exportToECTD(template, moleculeName, blueprintId);
          contentType = 'application/zip';
          break;
        case 'json':
          documentData = await exportToJSON(template, moleculeName, blueprintId);
          contentType = 'application/json';
          break;
        default:
          return res.status(400).json({ error: 'Unsupported export format' });
      }
      
      // Set the appropriate headers for the response
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${moleculeName}-CMC-Module3.${format}"`);
      
      // Send the document data
      res.send(documentData);
      
    } catch (error) {
      handleApiError(req, res, error, 'cmc-blueprint-export');
    }
  });

  /**
   * Fetch molecular property information from external databases
   */
  app.post('/api/cmc-blueprint-generator/molecular-properties', blueprintRateLimiter, async (req, res) => {
    try {
      // Sanitize and validate input
      const sanitizedInput = sanitizeInput(req.body);
      
      // Extract the identifier
      const { identifier, identifierType } = sanitizedInput;
      
      if (!identifier || !identifierType) {
        return res.status(400).json({ 
          error: 'Missing identifier information',
          details: 'Both identifier and identifierType are required'
        });
      }
      
      // Log the API request (audit trail)
      logApiUsage(req, 'molecular-properties', true, { 
        identifierType,
        identifier: identifierType === 'name' ? identifier : '[REDACTED]' // Don't log SMILES or InChI for privacy
      });
      
      // In production, this would fetch data from PubChem, ChEMBL, or similar services
      // For demonstration, we'll use OpenAI to generate plausible properties
      const results = await fetchMolecularProperties(identifier, identifierType);
      
      // Return the properties
      res.json(results);
      
    } catch (error) {
      handleApiError(req, res, error, 'molecular-properties');
    }
  });
}

/**
 * Generate complete CMC blueprint using OpenAI
 * @param {Object} molecularData - Validated molecular data
 * @returns {Promise<Object>} Generated CMC blueprint
 */
async function generateCMCBlueprint(molecularData) {
  // Map of section IDs to their detailed prompts
  const sectionPrompts = {
    's.1': generateS1Prompt(molecularData),
    's.2': generateS2Prompt(molecularData),
    's.3': generateS3Prompt(molecularData),
    's.4': generateS4Prompt(molecularData),
    'p.1': generateP1Prompt(molecularData),
    'p.2': generateP2Prompt(molecularData),
  };
  
  // Result object to store all generated content
  const results = {
    drugSubstance: {},
    drugProduct: {},
    diagrams: {},
    metadata: {
      generatedAt: new Date().toISOString(),
      molecule: {
        name: molecularData.moleculeName,
        formula: molecularData.molecularFormula
      }
    }
  };
  
  // Batch promises for efficiency (but limit concurrency to avoid rate limits)
  const maxConcurrent = 2;
  const sections = Object.keys(sectionPrompts);
  
  for (let i = 0; i < sections.length; i += maxConcurrent) {
    const batch = sections.slice(i, i + maxConcurrent);
    const promises = batch.map(async (sectionId) => {
      const content = await generateSectionContent(sectionId, sectionPrompts[sectionId]);
      
      // Store in appropriate category
      if (sectionId.startsWith('s.')) {
        results.drugSubstance[sectionId] = content;
      } else if (sectionId.startsWith('p.')) {
        results.drugProduct[sectionId] = content;
      }
      
      return { sectionId, content };
    });
    
    // Wait for current batch to complete before starting next batch
    await Promise.all(promises);
  }
  
  // Generate manufacturing process diagram separately
  if (molecularData.synthesisPathway) {
    results.diagrams.manufacturingProcess = await generateProcessDiagram(molecularData);
  }
  
  return results;
}

/**
 * Generate content for a specific CTD section
 * @param {string} sectionId - The ICH CTD section ID
 * @param {string} prompt - The detailed prompt for OpenAI
 * @returns {Promise<Object>} Generated content with structured data
 */
async function generateSectionContent(sectionId, prompt) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: 'system',
          content: 'You are an expert pharmaceutical regulatory writer specializing in Chemistry, Manufacturing, and Controls (CMC) documentation. Create detailed, scientifically accurate content for ICH CTD Module 3 sections.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    // Parse the response as JSON
    const content = JSON.parse(response.choices[0].message.content);
    
    // Add metadata
    return {
      ...content,
      metadata: {
        sectionId,
        generatedAt: new Date().toISOString(),
        model: 'gpt-4o',
        tokens: response.usage.total_tokens
      }
    };
    
  } catch (error) {
    console.error(`Error generating content for section ${sectionId}:`, error);
    // Return a partial result with error information
    return {
      title: `Section ${sectionId}`,
      content: `Error generating content: ${error.message}`,
      subsections: [],
      metadata: {
        sectionId,
        error: true,
        errorMessage: error.message
      }
    };
  }
}

/**
 * Generate a process diagram for the manufacturing process
 * @param {Object} molecularData - Validated molecular data
 * @returns {Promise<Object>} Generated diagram data
 */
async function generateProcessDiagram(molecularData) {
  try {
    // Create a detailed prompt for DALL-E 3
    const prompt = `
      Create a detailed pharmaceutical manufacturing process flow diagram for the synthesis of ${molecularData.moleculeName} (${molecularData.molecularFormula}).
      The diagram should be:
      1. Professionally styled with clear steps and directional arrows
      2. Include reaction conditions (temperature, pressure, catalysts) at each step
      3. Show chemical structures transitioning through intermediates to the final API
      4. Include critical process controls and parameters
      5. Use a clean, technical, blueprint-style design with blue and white colors
      6. Suitable for inclusion in regulatory documentation (ICH CTD Module 3)
      7. Text should be clearly readable
      8. Include proper scientific notation and chemical structures
    `;
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "natural",
    });
    
    return {
      url: response.data[0].url,
      revisedPrompt: response.data[0].revised_prompt,
      generatedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error generating manufacturing process diagram:', error);
    return {
      error: true,
      errorMessage: error.message
    };
  }
}

/**
 * Fetch molecular properties from scientific databases or generate with AI
 * @param {string} identifier - Chemical identifier
 * @param {string} identifierType - Type of identifier (name, smiles, inchi)
 * @returns {Promise<Object>} Molecular properties
 */
/**
 * Process a chemistry file format to extract molecular data
 * @param {Object} file - The uploaded chemistry file
 * @returns {Promise<Object>} Extracted molecular data
 */
async function processChemistryFile(file) {
  try {
    // Read file content
    const fileContent = file.data.toString('utf8');
    
    // Use OpenAI to analyze the file content and extract data
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: 'system',
          content: 'You are an expert computational chemist specializing in molecular file formats and structure analysis.'
        },
        {
          role: 'user',
          content: `Analyze this molecular structure file and extract key information in JSON format:\n\n${fileContent.substring(0, 4000)}`
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const extractedData = JSON.parse(response.choices[0].message.content);
    
    // Ensure minimum required fields
    return {
      moleculeName: extractedData.moleculeName || extractedData.name || "Unknown Compound",
      molecularFormula: extractedData.molecularFormula || extractedData.formula || "",
      smiles: extractedData.smiles || "",
      inchi: extractedData.inchi || "",
      molecularWeight: extractedData.molecularWeight || extractedData.weight || ""
    };
    
  } catch (error) {
    console.error('Error processing chemistry file:', error);
    throw new Error(`Failed to process chemistry file: ${error.message}`);
  }
}

/**
 * Process an image file to extract molecular structure using OpenAI Vision
 * @param {Object} file - The uploaded image file
 * @returns {Promise<Object>} Extracted molecular data
 */
async function processStructureImage(file) {
  try {
    // Convert file to base64
    const base64Image = file.data.toString('base64');
    
    // Use OpenAI Vision to analyze the image
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: 'system',
          content: 'You are an expert chemist specializing in molecular structure identification from images.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this chemical structure image and extract the following information in JSON format: moleculeName, molecularFormula, smiles (if possible), and a brief description of the compound or its class.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const extractedData = JSON.parse(response.choices[0].message.content);
    
    // Ensure minimum required fields
    return {
      moleculeName: extractedData.moleculeName || "Unknown Compound",
      molecularFormula: extractedData.molecularFormula || "",
      smiles: extractedData.smiles || "",
      description: extractedData.description || ""
    };
    
  } catch (error) {
    console.error('Error processing structure image:', error);
    throw new Error(`Failed to process structure image: ${error.message}`);
  }
}

/**
 * Generate regulatory citations for CMC sections
 * @param {string} moleculeType - Type of molecule (small-molecule, biological, etc.)
 * @param {string} regulatoryRegion - Target regulatory region (fda, ema, pmda, etc.)
 * @param {Array<string>} sections - Array of CTD section IDs
 * @returns {Promise<Array<Object>>} Generated citations
 */
async function generateRegulatoryCitations(moleculeType, regulatoryRegion, sections) {
  try {
    // Create a detailed prompt
    const prompt = `
      Generate a list of key regulatory citations and references for ICH CTD Module 3 sections for a ${moleculeType} pharmaceutical.
      Target regulatory region: ${regulatoryRegion.toUpperCase()}
      Sections to cover: ${sections.join(', ')}
      
      For each citation, provide:
      1. Title of the guideline or reference
      2. Source (e.g., FDA, EMA, ICH)
      3. Date of publication/latest revision
      4. Brief text excerpt that highlights key requirements
      5. The specific CTD section it applies to
      6. The regulatory authority (e.g., FDA, EMA, PMDA)
      
      Focus on the most important and up-to-date guidelines that would be essential for regulatory compliance.
      Format as a JSON array of citation objects, each with these keys: title, source, date, text, section, authority
    `;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: 'system',
          content: 'You are an expert regulatory affairs specialist with deep knowledge of global pharmaceutical regulations and guidelines for Chemistry, Manufacturing, and Controls.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const result = JSON.parse(response.choices[0].message.content);
    return result.citations || [];
    
  } catch (error) {
    console.error('Error generating regulatory citations:', error);
    return [
      {
        title: "Error generating citations",
        source: "Internal system",
        date: new Date().toISOString().split('T')[0],
        text: `An error occurred: ${error.message}. Please try again.`,
        section: sections[0] || "all",
        authority: regulatoryRegion.toUpperCase()
      }
    ];
  }
}

/**
 * Perform risk analysis on manufacturing process
 * @param {Object} molecularData - Molecular and manufacturing data
 * @param {Array<string>} targetMarkets - Array of target markets for risk analysis
 * @returns {Promise<Object>} Risk analysis results
 */
async function performRiskAnalysis(molecularData, targetMarkets) {
  try {
    const prompt = `
      Perform a comprehensive risk analysis for the manufacturing process of ${molecularData.moleculeName} (${molecularData.molecularFormula}).
      
      Target markets: ${targetMarkets.join(', ')}
      
      Based on the following information about the molecule and its synthesis, identify:
      
      1. Overall risk score (0-10 scale) with rationale
      2. Specific risk factors, their severity (low/medium/high), and descriptions
      3. A summary risk assessment statement suitable for regulatory documentation
      
      Molecular details:
      - Name: ${molecularData.moleculeName}
      - Formula: ${molecularData.molecularFormula}
      - Synthesis pathway: ${molecularData.synthesisPathway || "Not provided"}
      ${molecularData.formulation ? `- Dosage form: ${molecularData.formulation.dosageForm}` : ''}
      ${molecularData.formulation ? `- Route of administration: ${molecularData.formulation.routeOfAdministration}` : ''}
      
      Format response as a JSON object with these exact keys: overallRiskScore, riskSummary, riskFactors (array of objects with severity and description)
    `;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: 'system',
          content: 'You are an expert in pharmaceutical manufacturing risk assessment with extensive knowledge of global regulatory requirements.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const analysis = JSON.parse(response.choices[0].message.content);
    
    // Add metadata
    return {
      ...analysis,
      metadata: {
        generatedAt: new Date().toISOString(),
        moleculeName: molecularData.moleculeName,
        targetMarkets,
        model: 'gpt-4o'
      }
    };
    
  } catch (error) {
    console.error('Error performing risk analysis:', error);
    return {
      overallRiskScore: 5,
      riskSummary: `Error performing risk analysis: ${error.message}. Using default medium risk score.`,
      riskFactors: [
        {
          severity: 'medium',
          description: 'Analysis error - unable to assess specific risks.'
        }
      ],
      metadata: {
        error: true,
        errorMessage: error.message,
        generatedAt: new Date().toISOString()
      }
    };
  }
}

/**
 * Export blueprint data to Word document format
 * @param {string} template - Regulatory template to use (fda, ema, etc.)
 * @param {string} moleculeName - Name of the molecule
 * @param {string} blueprintId - ID of the blueprint to export
 * @returns {Promise<Buffer>} Word document as buffer
 */
async function exportToWord(template, moleculeName, blueprintId) {
  try {
    // In a production system, this would:
    // 1. Retrieve the blueprint data from a database using blueprintId
    // 2. Use a document generation library to create a properly formatted Word document
    // 3. Apply the correct template based on target regulatory authority
    
    // For demonstration, we'll create a simple document with placeholder structure
    const docData = {
      title: `CMC Documentation for ${moleculeName}`,
      template: template.toUpperCase(),
      sections: [
        { heading: 'S.1 General Information', content: 'Placeholder content for S.1' },
        { heading: 'S.2 Manufacture', content: 'Placeholder content for S.2' },
        { heading: 'S.3 Characterisation', content: 'Placeholder content for S.3' },
        { heading: 'S.4 Control of Drug Substance', content: 'Placeholder content for S.4' },
        { heading: 'P.1 Description and Composition', content: 'Placeholder content for P.1' },
        { heading: 'P.2 Pharmaceutical Development', content: 'Placeholder content for P.2' }
      ],
      metadata: {
        author: 'TrialSage AI-CMC Blueprint Generator',
        createdDate: new Date().toISOString(),
        id: blueprintId
      }
    };
    
    // Generate a Word document using the document generation utility
    // In a real implementation, this would use a library like docx
    const docBuffer = await createDocx(docData);
    return docBuffer;
    
  } catch (error) {
    console.error('Error exporting to Word:', error);
    throw new Error(`Failed to export to Word: ${error.message}`);
  }
}

/**
 * Export blueprint data to PDF format
 * @param {string} template - Regulatory template to use (fda, ema, etc.)
 * @param {string} moleculeName - Name of the molecule
 * @param {string} blueprintId - ID of the blueprint to export
 * @returns {Promise<Buffer>} PDF document as buffer
 */
async function exportToPDF(template, moleculeName, blueprintId) {
  try {
    // Similar to Word export, but generates PDF
    // In production, would use PDF generation library
    const pdfBuffer = await createPDF({
      title: `CMC Documentation for ${moleculeName}`,
      template: template.toUpperCase(),
      id: blueprintId
    });
    
    return pdfBuffer;
    
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error(`Failed to export to PDF: ${error.message}`);
  }
}

/**
 * Export blueprint data to eCTD format (XML + PDF)
 * @param {string} template - Regulatory template to use (fda, ema, etc.)
 * @param {string} moleculeName - Name of the molecule
 * @param {string} blueprintId - ID of the blueprint to export
 * @returns {Promise<Buffer>} Zip file containing eCTD submission as buffer
 */
async function exportToECTD(template, moleculeName, blueprintId) {
  try {
    // In production, this would:
    // 1. Generate properly formatted XML backbone
    // 2. Create PDFs for each section
    // 3. Organize files according to eCTD structure
    // 4. Package everything in a zip file
    
    // For demo purposes, create a simple ZIP buffer
    // This would be replaced with actual eCTD generation code
    const buffer = Buffer.from('Placeholder for eCTD ZIP file');
    return buffer;
    
  } catch (error) {
    console.error('Error exporting to eCTD:', error);
    throw new Error(`Failed to export to eCTD: ${error.message}`);
  }
}

/**
 * Export blueprint data to JSON format
 * @param {string} template - Regulatory template to use (fda, ema, etc.)
 * @param {string} moleculeName - Name of the molecule
 * @param {string} blueprintId - ID of the blueprint to export
 * @returns {Promise<Buffer>} JSON data as buffer
 */
async function exportToJSON(template, moleculeName, blueprintId) {
  try {
    // Simply return the JSON data
    // In production, would fetch from database
    const jsonData = JSON.stringify({
      title: `CMC Documentation for ${moleculeName}`,
      template: template.toUpperCase(),
      id: blueprintId,
      generatedAt: new Date().toISOString(),
      sections: {
        drugSubstance: {
          's.1': { title: 'S.1 General Information', content: 'Placeholder content' },
          's.2': { title: 'S.2 Manufacture', content: 'Placeholder content' },
          's.3': { title: 'S.3 Characterisation', content: 'Placeholder content' },
          's.4': { title: 'S.4 Control of Drug Substance', content: 'Placeholder content' }
        },
        drugProduct: {
          'p.1': { title: 'P.1 Description and Composition', content: 'Placeholder content' },
          'p.2': { title: 'P.2 Pharmaceutical Development', content: 'Placeholder content' }
        }
      }
    }, null, 2);
    
    return Buffer.from(jsonData);
    
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    throw new Error(`Failed to export to JSON: ${error.message}`);
  }
}

async function fetchMolecularProperties(identifier, identifierType) {
  try {
    // In production, this would call PubChem, ChEMBL, or similar APIs
    // For demonstration, we'll use OpenAI to generate plausible properties
    
    const prompt = `
      Given the following molecular ${identifierType}:
      ${identifier}
      
      Provide scientifically accurate properties for this molecule in JSON format. Include:
      1. IUPAC name
      2. Molecular weight (g/mol)
      3. Exact mass
      4. LogP
      5. Hydrogen bond donors
      6. Hydrogen bond acceptors
      7. Rotatable bonds
      8. Topological polar surface area (TPSA)
      9. Physical appearance description
      10. Water solubility characteristics
      11. Common therapeutic class or application
      
      Format as JSON with these exact keys: iupacName, molecularWeight, exactMass, logP, hbondDonors, hbondAcceptors, rotatableBonds, tpsa, appearance, solubility, therapeuticClass
    `;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: 'system',
          content: 'You are a computational chemist with expertise in medicinal chemistry and pharmaceutical sciences.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });
    
    // Parse the response as JSON
    const properties = JSON.parse(response.choices[0].message.content);
    
    // Add metadata
    return {
      ...properties,
      metadata: {
        identifier: identifierType === 'name' ? identifier : '[REDACTED]', // Don't return SMILES or InChI
        identifierType,
        generatedAt: new Date().toISOString(),
        source: 'openai',
        model: 'gpt-4o'
      }
    };
    
  } catch (error) {
    console.error('Error fetching molecular properties:', error);
    throw new Error(`Failed to fetch molecular properties: ${error.message}`);
  }
}

// Export functions already handled by export statements

/**
 * Generate prompt for S.1 General Information
 * @param {Object} molecularData - Validated molecular data
 * @returns {string} Detailed prompt for OpenAI
 */
function generateS1Prompt(molecularData) {
  return `
    Generate the complete content for CTD Section S.1 (General Information) for the API ${molecularData.moleculeName} (${molecularData.molecularFormula}).
    
    This section should include:
    
    1. S.1.1 Nomenclature - including:
       - International Non-proprietary Name (INN)
       - Chemical name (IUPAC)
       - Company or laboratory code
       - CAS registry number (use a plausible placeholder)
       - Other non-proprietary names
       
    2. S.1.2 Structure - detailed description of:
       - Structural formula
       - Molecular formula: ${molecularData.molecularFormula}
       - Molecular weight: ${molecularData.molecularWeight || 'To be determined based on molecular formula'}
       - SMILES: ${molecularData.smiles || 'Not provided'}
       - InChI: ${molecularData.inchi || 'Not provided'}
       
    3. S.1.3 General Properties - including:
       - Physical description (appearance, color, state)
       - Solubility profile across different solvents
       - pKa values and pH in solution
       - Polymorphism information
       - Hygroscopicity data
       - Melting point or typical thermal characteristics
    
    Format your response as a detailed JSON object with these exact keys:
    {
      "title": "S.1 General Information",
      "content": "Brief overview paragraph",
      "subsections": [
        {
          "title": "S.1.1 Nomenclature",
          "content": "Detailed text"
        },
        {
          "title": "S.1.2 Structure",
          "content": "Detailed text"
        },
        {
          "title": "S.1.3 General Properties",
          "content": "Detailed text with property tables"
        }
      ]
    }
    
    Make the content scientifically accurate and appropriate for a regulatory submission.
  `;
}

/**
 * Generate prompt for S.2 Manufacture
 * @param {Object} molecularData - Validated molecular data
 * @returns {string} Detailed prompt for OpenAI
 */
function generateS2Prompt(molecularData) {
  return `
    Generate the complete content for CTD Section S.2 (Manufacture) for the API ${molecularData.moleculeName} (${molecularData.molecularFormula}).
    
    Use the following synthesis pathway information if provided:
    ${molecularData.synthesisPathway || 'No specific synthesis pathway provided. Generate a plausible multi-step synthetic route appropriate for pharmaceutical manufacturing of this type of compound.'}
    
    This section should include:
    
    1. S.2.1 Manufacturer(s) - placeholder text for manufacturing facilities
       
    2. S.2.2 Description of Manufacturing Process and Process Controls - detailed narrative of:
       - Synthetic route overview
       - Reaction scheme
       - Step-by-step manufacturing process
       - Process controls for each step
       - Solvents, reagents, and catalysts
       - Critical process parameters
       - In-process controls
       
    3. S.2.3 Control of Materials - information on:
       - Starting materials and their specifications
       - Raw materials and reagents
       - Control strategy for critical materials
       
    4. S.2.4 Controls of Critical Steps and Intermediates - detailed:
       - Critical steps identification
       - Process parameters and their acceptance criteria
       - Controls for key intermediates
       
    5. S.2.5 Process Validation and/or Evaluation - overview of:
       - Validation approach
       - Critical aspects requiring validation
       - Demonstration of process consistency
       
    6. S.2.6 Manufacturing Process Development - narrative on:
       - Development history
       - Improvements made during development
       - Rationale for the final process
    
    Format your response as a detailed JSON object with these exact keys:
    {
      "title": "S.2 Manufacture",
      "content": "Brief overview paragraph",
      "subsections": [
        {
          "title": "S.2.1 Manufacturer(s)",
          "content": "Text"
        },
        {
          "title": "S.2.2 Description of Manufacturing Process and Process Controls",
          "content": "Detailed text"
        },
        {
          "title": "S.2.3 Control of Materials",
          "content": "Detailed text"
        },
        {
          "title": "S.2.4 Controls of Critical Steps and Intermediates",
          "content": "Detailed text"
        },
        {
          "title": "S.2.5 Process Validation and/or Evaluation",
          "content": "Detailed text"
        },
        {
          "title": "S.2.6 Manufacturing Process Development",
          "content": "Detailed text"
        }
      ]
    }
    
    Make the content scientifically accurate, regulatory-compliant, and appropriate for CMC documentation.
  `;
}

/**
 * Generate prompt for S.3 Characterisation
 * @param {Object} molecularData - Validated molecular data
 * @returns {string} Detailed prompt for OpenAI
 */
function generateS3Prompt(molecularData) {
  return `
    Generate the complete content for CTD Section S.3 (Characterisation) for the API ${molecularData.moleculeName} (${molecularData.molecularFormula}).
    
    This section should include:
    
    1. S.3.1 Elucidation of Structure and other Characteristics - detailed description of:
       - Structural elucidation methods used (NMR, MS, IR, UV, etc.)
       - Confirmation of stereochemistry
       - Physicochemical characterization
       - Biological activity characterization if applicable
       
    2. S.3.2 Impurities - comprehensive information on:
       - Organic impurities (process- and drug-related)
       - Inorganic impurities
       - Residual solvents
       - Potential genotoxic impurities
       - Impurity qualification and control strategy
    
    Analytical methods mentioned (if provided):
    ${molecularData.analyticalMethods?.length ? molecularData.analyticalMethods.join(', ') : 'No specific analytical methods provided. Include appropriate methods for this type of compound.'}
    
    Format your response as a detailed JSON object with these exact keys:
    {
      "title": "S.3 Characterisation",
      "content": "Brief overview paragraph",
      "subsections": [
        {
          "title": "S.3.1 Elucidation of Structure and other Characteristics",
          "content": "Detailed text with analytical data interpretation"
        },
        {
          "title": "S.3.2 Impurities",
          "content": "Detailed text with tables of impurities"
        }
      ]
    }
    
    Make the content scientifically accurate and appropriate for regulatory submission. Include plausible analytical data interpretations and impurity profiles relevant to the molecular structure.
  `;
}

/**
 * Generate prompt for S.4 Control of Drug Substance
 * @param {Object} molecularData - Validated molecular data
 * @returns {string} Detailed prompt for OpenAI
 */
function generateS4Prompt(molecularData) {
  return `
    Generate the complete content for CTD Section S.4 (Control of Drug Substance) for the API ${molecularData.moleculeName} (${molecularData.molecularFormula}).
    
    This section should include:
    
    1. S.4.1 Specification - detailed:
       - Release and shelf-life specifications
       - Test parameters (description, identification, assay, impurities, etc.)
       - Analytical procedures references
       - Acceptance criteria
       
    2. S.4.2 Analytical Procedures - overview of:
       - Methods used for each test
       - Brief description of methodologies
       - References to standard methods
       
    3. S.4.3 Validation of Analytical Procedures - information on:
       - Validation parameters (specificity, linearity, accuracy, precision, etc.)
       - Validation summary for each test method
       
    4. S.4.4 Batch Analyses - summary of:
       - Results from representative batches
       - Batch information
       - Purpose of batch analyses
       
    5. S.4.5 Justification of Specification - rationale for:
       - Selection of tests
       - Acceptance criteria
       - Pharmacopoeial and non-pharmacopoeial methods
    
    Format your response as a detailed JSON object with these exact keys:
    {
      "title": "S.4 Control of Drug Substance",
      "content": "Brief overview paragraph",
      "subsections": [
        {
          "title": "S.4.1 Specification",
          "content": "Detailed specification table and text"
        },
        {
          "title": "S.4.2 Analytical Procedures",
          "content": "Detailed text"
        },
        {
          "title": "S.4.3 Validation of Analytical Procedures",
          "content": "Detailed text"
        },
        {
          "title": "S.4.4 Batch Analyses",
          "content": "Detailed text with batch table"
        },
        {
          "title": "S.4.5 Justification of Specification",
          "content": "Detailed text"
        }
      ]
    }
    
    Make the content scientifically accurate and appropriate for regulatory submission. Include detailed specification tables and acceptance criteria relevant to the drug substance characteristics.
  `;
}

/**
 * Generate prompt for P.1 Description and Composition
 * @param {Object} molecularData - Validated molecular data
 * @returns {string} Detailed prompt for OpenAI
 */
function generateP1Prompt(molecularData) {
  const formulation = molecularData.formulation || {
    dosageForm: 'tablet',
    routeOfAdministration: 'oral',
    ingredients: []
  };
  
  const ingredientsText = formulation.ingredients && formulation.ingredients.length > 0
    ? `The formulation contains these ingredients:\n${formulation.ingredients.map(ing => `- ${ing.name} (${ing.function}): ${ing.amount}`).join('\n')}`
    : 'No specific ingredients provided. Generate a plausible formulation appropriate for this type of product.';
  
  return `
    Generate the complete content for CTD Section P.1 (Description and Composition of the Drug Product) for a ${formulation.dosageForm} containing ${molecularData.moleculeName} (${molecularData.molecularFormula}).
    
    The product is designed for ${formulation.routeOfAdministration} administration.
    
    ${ingredientsText}
    
    This section should include:
    
    1. Description of the dosage form - detailed:
       - Physical description
       - Dosage form characteristics
       - Strengths available
       - Primary packaging system
       
    2. Composition - comprehensive table of:
       - All ingredients (active and inactive)
       - Quantity per unit
       - Quality standard references
       - Function in the formulation
       
    3. Description of accompanying reconstitution diluent(s) if applicable
    
    4. Type of container and closure used for the dosage form
    
    Format your response as a detailed JSON object with these exact keys:
    {
      "title": "P.1 Description and Composition of the Drug Product",
      "content": "Comprehensive overview paragraph",
      "composition": {
        "activeIngredient": {
          "name": "API name",
          "amount": "amount per unit",
          "function": "active ingredient",
          "reference": "quality standard"
        },
        "inactiveIngredients": [
          {
            "name": "excipient name",
            "amount": "amount per unit",
            "function": "specific function",
            "reference": "quality standard"
          }
        ]
      },
      "description": "Detailed physical description",
      "containerClosure": "Container and closure system details"
    }
    
    Make the content scientifically accurate and appropriate for regulatory submission. Ensure the formulation is pharmaceutically elegant and all excipients serve appropriate functions.
  `;
}

/**
 * Generate prompt for P.2 Pharmaceutical Development
 * @param {Object} molecularData - Validated molecular data
 * @returns {string} Detailed prompt for OpenAI
 */
function generateP2Prompt(molecularData) {
  const formulation = molecularData.formulation || {
    dosageForm: 'tablet',
    routeOfAdministration: 'oral'
  };
  
  return `
    Generate the complete content for CTD Section P.2 (Pharmaceutical Development) for a ${formulation.dosageForm} containing ${molecularData.moleculeName} (${molecularData.molecularFormula}) for ${formulation.routeOfAdministration} administration.
    
    This section should include:
    
    1. P.2.1 Components of the Drug Product
       - P.2.1.1 Drug Substance - compatibility with excipients, physicochemical characteristics, etc.
       - P.2.1.2 Excipients - justification for each excipient, novel excipients if any
       
    2. P.2.2 Drug Product
       - P.2.2.1 Formulation Development - development history, overformulation if any
       - P.2.2.2 Overages - justification for any overages
       - P.2.2.3 Physicochemical and Biological Properties - parameters relevant to performance
       
    3. P.2.3 Manufacturing Process Development - selection of process, critical parameters
    
    4. P.2.4 Container Closure System - selection and suitability
    
    5. P.2.5 Microbiological Attributes - preservative effectiveness, etc.
    
    6. P.2.6 Compatibility - with diluents, administration devices, etc.
    
    Format your response as a detailed JSON object with these exact keys:
    {
      "title": "P.2 Pharmaceutical Development",
      "content": "Brief overview paragraph",
      "subsections": [
        {
          "title": "P.2.1 Components of the Drug Product",
          "content": "Overview text",
          "subsections": [
            {
              "title": "P.2.1.1 Drug Substance",
              "content": "Detailed text"
            },
            {
              "title": "P.2.1.2 Excipients",
              "content": "Detailed text"
            }
          ]
        },
        {
          "title": "P.2.2 Drug Product",
          "content": "Overview text",
          "subsections": [
            {
              "title": "P.2.2.1 Formulation Development",
              "content": "Detailed text"
            },
            {
              "title": "P.2.2.2 Overages",
              "content": "Detailed text"
            },
            {
              "title": "P.2.2.3 Physicochemical and Biological Properties",
              "content": "Detailed text"
            }
          ]
        },
        {
          "title": "P.2.3 Manufacturing Process Development",
          "content": "Detailed text"
        },
        {
          "title": "P.2.4 Container Closure System",
          "content": "Detailed text"
        },
        {
          "title": "P.2.5 Microbiological Attributes",
          "content": "Detailed text"
        },
        {
          "title": "P.2.6 Compatibility",
          "content": "Detailed text"
        }
      ]
    }
    
    Make the content scientifically accurate, regulatory-compliant, and appropriate for CMC documentation. Include Quality by Design (QbD) principles where applicable.
  `;
}