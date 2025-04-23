/**
 * API Handler for AI-CMC Blueprint Generator
 * 
 * This module provides secure endpoints to process molecular structure data
 * and generate regulatory-ready CMC documents using OpenAI APIs.
 * It implements proper validation, rate limiting, and security measures.
 */

import { z } from 'zod';
import { OpenAI } from 'openai';
import { sanitizeInput, logApiUsage, handleApiError, shouldRateLimit } from '../utils/api-security.js';

// Ensure OpenAI API key is configured
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not configured. CMC Blueprint Generator will not work.');
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple rate limiting middleware for blueprint generation
const blueprintRateLimiter = (req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress;
  const key = `blueprint_${clientIp}`;
  
  if (shouldRateLimit(key, 10, 60 * 60 * 1000)) { // 10 requests per hour
    return res.status(429).json({ 
      error: 'Too many blueprint generation requests. Please try again later.',
      retryAfter: '60 minutes'
    });
  }
  
  next();
};

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
export function registerCMCBlueprintRoutes(app) {
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