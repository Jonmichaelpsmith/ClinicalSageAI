/**
 * Document Processor Service
 * 
 * This service provides advanced document processing capabilities for the TrialSage platform,
 * including content extraction, structural analysis, metadata processing, and regulatory 
 * document generation. It serves as a shared service layer accessible to all platform modules.
 * 
 * The service integrates with advanced AI models for document understanding, extraction,
 * and generation while maintaining strict compliance with regulatory standards.
 */

import { OpenAI } from 'openai';
import { db } from '../db.js';
import path from 'path';
import fs from 'fs';
import util from 'util';

// Convert fs functions to promise-based
const readFile = util.promisify(fs.readFile);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Document processor configuration
const PROCESSOR_CONFIG = {
  defaultModel: 'gpt-4o',
  enhancedModel: 'gpt-4-turbo-preview',
  maxTokens: 8000,
  temperature: 0.1,
  extractionConfidenceThreshold: 0.75,
  supportedFileTypes: ['.pdf', '.docx', '.doc', '.txt', '.rtf', '.html', '.xml', '.json'],
  maxFileSize: 20 * 1024 * 1024 // 20 MB
};

/**
 * Extract data from document
 * @param {Object} document - Document object with content
 * @param {Array} extractionPoints - Data points to extract
 * @param {Object} options - Extraction options
 * @returns {Promise<Object>} - Extracted data with confidence scores
 */
export async function extractDocumentData(document, extractionPoints = [], options = {}) {
  console.log('Extracting data from document:', document.id);
  
  const startTime = Date.now();
  let documentContent = '';
  let extractionPrompt = '';
  const model = options.enhancedExtraction ? PROCESSOR_CONFIG.enhancedModel : PROCESSOR_CONFIG.defaultModel;
  
  try {
    // Get document content based on format
    if (typeof document.content === 'string') {
      // Plain text or serialized JSON
      try {
        documentContent = JSON.parse(document.content);
      } catch (e) {
        documentContent = document.content;
      }
    } else if (typeof document.content === 'object') {
      documentContent = document.content;
    } else if (document.file_path) {
      // Read from file
      const filePath = document.file_path;
      const fileExt = path.extname(filePath).toLowerCase();
      
      if (!PROCESSOR_CONFIG.supportedFileTypes.includes(fileExt)) {
        throw new Error(`Unsupported file type: ${fileExt}`);
      }
      
      // Check file size
      const stats = fs.statSync(filePath);
      if (stats.size > PROCESSOR_CONFIG.maxFileSize) {
        throw new Error(`File size exceeds maximum allowed: ${stats.size} bytes`);
      }
      
      // Read file content
      const fileContent = await readFile(filePath, 'utf8');
      documentContent = fileContent;
    } else {
      throw new Error('No document content or file path provided');
    }
    
    // Determine extraction points
    let extractionTargets = extractionPoints;
    
    if (!extractionTargets.length) {
      // Use default extraction points based on document type
      switch (document.document_type) {
        case 'protocol':
          extractionTargets = [
            'study_title', 'phase', 'sponsor', 'study_design', 'inclusion_criteria',
            'exclusion_criteria', 'primary_endpoints', 'secondary_endpoints', 
            'study_population', 'sample_size', 'treatment_duration'
          ];
          break;
        case 'csr':
          extractionTargets = [
            'study_title', 'protocol_id', 'sponsor', 'study_phase', 'study_dates',
            'efficacy_results', 'safety_results', 'conclusion'
          ];
          break;
        case 'regulatory_submission':
          extractionTargets = [
            'submission_type', 'submission_date', 'sponsor', 'product_name',
            'application_number', 'review_division', 'indication'
          ];
          break;
        default:
          extractionTargets = [
            'title', 'author', 'date', 'document_type', 'keywords', 
            'main_sections', 'summary'
          ];
      }
    }
    
    // Build extraction prompt
    extractionPrompt = `
      You are TrialSage's Document Processor, a specialized AI for regulatory document analysis.
      
      Document Type: ${document.document_type || 'Unknown'}
      Document ID: ${document.id}
      
      Please extract the following information from the document content provided below.
      For each extraction point, provide:
      1. The extracted content
      2. A confidence score (0.0-1.0) indicating your confidence in the extraction
      3. The location or section where the information was found
      
      Extraction Points:
      ${extractionTargets.map(point => `- ${point}`).join('\n')}
      
      Document Content:
      ${typeof documentContent === 'object' ? JSON.stringify(documentContent) : documentContent}
      
      Format your response as a JSON object with:
      - extractedData: an object with each extraction point as a key
      - confidenceScores: an object with each extraction point as a key and confidence score as value
      - sources: an object with each extraction point as a key and source location as value
    `;
    
    // Call OpenAI for extraction
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: extractionPrompt }],
      temperature: PROCESSOR_CONFIG.temperature,
      max_tokens: PROCESSOR_CONFIG.maxTokens,
      response_format: { type: 'json_object' }
    });
    
    const extractionResult = JSON.parse(completion.choices[0].message.content);
    
    // Filter out low-confidence extractions
    const filteredData = {};
    const filteredScores = {};
    const filteredSources = {};
    
    for (const key of Object.keys(extractionResult.extractedData)) {
      const confidence = extractionResult.confidenceScores[key] || 0;
      
      if (confidence >= PROCESSOR_CONFIG.extractionConfidenceThreshold) {
        filteredData[key] = extractionResult.extractedData[key];
        filteredScores[key] = confidence;
        filteredSources[key] = extractionResult.sources[key];
      }
    }
    
    // Store extraction in database
    await db.query(`
      INSERT INTO document_extractions
      (document_id, document_type, extraction_points, extracted_data, confidence_scores, processing_time)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      document.id, 
      document.document_type, 
      JSON.stringify(extractionTargets),
      JSON.stringify(filteredData),
      JSON.stringify(filteredScores),
      Date.now() - startTime
    ]);
    
    return {
      extractedData: filteredData,
      confidenceScores: filteredScores,
      sources: filteredSources,
      processingTime: Date.now() - startTime
    };
  } catch (error) {
    console.error('Error extracting document data:', error);
    
    // Log extraction error
    await db.query(`
      INSERT INTO document_extraction_errors
      (document_id, error_message, extraction_points, processing_time)
      VALUES ($1, $2, $3, $4)
    `, [
      document.id,
      error.message,
      JSON.stringify(extractionPoints),
      Date.now() - startTime
    ]);
    
    throw error;
  }
}

/**
 * Analyze document structure
 * @param {Object} document - Document object
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} - Document structure analysis
 */
export async function analyzeDocumentStructure(document, options = {}) {
  console.log('Analyzing document structure:', document.id);
  
  const startTime = Date.now();
  let documentContent = '';
  const model = options.enhancedAnalysis ? PROCESSOR_CONFIG.enhancedModel : PROCESSOR_CONFIG.defaultModel;
  
  try {
    // Get document content (same as extractDocumentData)
    if (typeof document.content === 'string') {
      try {
        documentContent = JSON.parse(document.content);
      } catch (e) {
        documentContent = document.content;
      }
    } else if (typeof document.content === 'object') {
      documentContent = document.content;
    } else if (document.file_path) {
      const fileContent = await readFile(document.file_path, 'utf8');
      documentContent = fileContent;
    } else {
      throw new Error('No document content or file path provided');
    }
    
    // Build analysis prompt
    const analysisPrompt = `
      You are TrialSage's Document Structure Analyzer, a specialized AI for regulatory document analysis.
      
      Document Type: ${document.document_type || 'Unknown'}
      Document ID: ${document.id}
      
      Please analyze the structure of the document and provide:
      1. The hierarchical organization (sections, subsections, etc.)
      2. Key structural elements (tables, figures, references, etc.)
      3. Document completeness assessment
      4. Structural compliance with regulatory standards
      5. Structural gaps or issues
      
      Document Content:
      ${typeof documentContent === 'object' ? JSON.stringify(documentContent) : documentContent}
      
      Format your response as a JSON object with:
      - sections: array of section objects with title, level, and completeness
      - elements: object with counts of tables, figures, references, etc.
      - compliance: assessment of structural compliance with standards
      - gaps: array of identified structural gaps
      - completeness: overall completeness score (0.0-1.0)
    `;
    
    // Call OpenAI for analysis
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: analysisPrompt }],
      temperature: PROCESSOR_CONFIG.temperature,
      max_tokens: PROCESSOR_CONFIG.maxTokens,
      response_format: { type: 'json_object' }
    });
    
    const analysisResult = JSON.parse(completion.choices[0].message.content);
    
    // Store analysis in database
    await db.query(`
      INSERT INTO document_structure_analyses
      (document_id, document_type, sections, elements, compliance, gaps, completeness, processing_time)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      document.id,
      document.document_type,
      JSON.stringify(analysisResult.sections),
      JSON.stringify(analysisResult.elements),
      JSON.stringify(analysisResult.compliance),
      JSON.stringify(analysisResult.gaps),
      analysisResult.completeness,
      Date.now() - startTime
    ]);
    
    return {
      ...analysisResult,
      processingTime: Date.now() - startTime
    };
  } catch (error) {
    console.error('Error analyzing document structure:', error);
    
    // Log analysis error
    await db.query(`
      INSERT INTO document_analysis_errors
      (document_id, error_message, analysis_type, processing_time)
      VALUES ($1, $2, $3, $4)
    `, [
      document.id,
      error.message,
      'structure',
      Date.now() - startTime
    ]);
    
    throw error;
  }
}

/**
 * Compare documents
 * @param {Object} sourceDocument - Source document
 * @param {Object} targetDocument - Target document
 * @param {Array} comparisonPoints - Comparison points
 * @param {Object} options - Comparison options
 * @returns {Promise<Object>} - Document comparison results
 */
export async function compareDocuments(sourceDocument, targetDocument, comparisonPoints = [], options = {}) {
  console.log('Comparing documents:', sourceDocument.id, 'vs', targetDocument.id);
  
  const startTime = Date.now();
  const model = options.enhancedComparison ? PROCESSOR_CONFIG.enhancedModel : PROCESSOR_CONFIG.defaultModel;
  
  try {
    // Get documents content
    let sourceContent = '';
    let targetContent = '';
    
    // Source document
    if (typeof sourceDocument.content === 'string') {
      try {
        sourceContent = JSON.parse(sourceDocument.content);
      } catch (e) {
        sourceContent = sourceDocument.content;
      }
    } else if (typeof sourceDocument.content === 'object') {
      sourceContent = sourceDocument.content;
    } else if (sourceDocument.file_path) {
      sourceContent = await readFile(sourceDocument.file_path, 'utf8');
    }
    
    // Target document
    if (typeof targetDocument.content === 'string') {
      try {
        targetContent = JSON.parse(targetDocument.content);
      } catch (e) {
        targetContent = targetDocument.content;
      }
    } else if (typeof targetDocument.content === 'object') {
      targetContent = targetDocument.content;
    } else if (targetDocument.file_path) {
      targetContent = await readFile(targetDocument.file_path, 'utf8');
    }
    
    // Determine comparison points if not provided
    if (!comparisonPoints.length) {
      comparisonPoints = [
        'overall_structure',
        'key_sections',
        'content_alignment',
        'critical_data_points',
        'regulatory_compliance'
      ];
    }
    
    // Build comparison prompt
    const comparisonPrompt = `
      You are TrialSage's Document Comparison Engine, a specialized AI for regulatory document comparison.
      
      Source Document: ${sourceDocument.document_type || 'Unknown'} (ID: ${sourceDocument.id})
      Target Document: ${targetDocument.document_type || 'Unknown'} (ID: ${targetDocument.id})
      
      Please compare these documents on the following points:
      ${comparisonPoints.map(point => `- ${point}`).join('\n')}
      
      Source Document Content:
      ${typeof sourceContent === 'object' ? JSON.stringify(sourceContent) : sourceContent}
      
      Target Document Content:
      ${typeof targetContent === 'object' ? JSON.stringify(targetContent) : targetContent}
      
      Format your response as a JSON object with:
      - summary: overall comparison summary
      - comparisonPoints: object with each comparison point as a key
      - differences: array of significant differences
      - similarities: array of significant similarities
      - alignmentScore: overall alignment score (0.0-1.0)
      - recommendations: array of recommendations based on the comparison
    `;
    
    // Call OpenAI for comparison
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: comparisonPrompt }],
      temperature: PROCESSOR_CONFIG.temperature,
      max_tokens: PROCESSOR_CONFIG.maxTokens,
      response_format: { type: 'json_object' }
    });
    
    const comparisonResult = JSON.parse(completion.choices[0].message.content);
    
    // Store comparison in database
    await db.query(`
      INSERT INTO document_comparisons
      (source_document_id, target_document_id, comparison_points, summary, differences, similarities, alignment_score, processing_time)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      sourceDocument.id,
      targetDocument.id,
      JSON.stringify(comparisonPoints),
      comparisonResult.summary,
      JSON.stringify(comparisonResult.differences),
      JSON.stringify(comparisonResult.similarities),
      comparisonResult.alignmentScore,
      Date.now() - startTime
    ]);
    
    return {
      ...comparisonResult,
      processingTime: Date.now() - startTime
    };
  } catch (error) {
    console.error('Error comparing documents:', error);
    
    // Log comparison error
    await db.query(`
      INSERT INTO document_comparison_errors
      (source_document_id, target_document_id, error_message, processing_time)
      VALUES ($1, $2, $3, $4)
    `, [
      sourceDocument.id,
      targetDocument.id,
      error.message,
      Date.now() - startTime
    ]);
    
    throw error;
  }
}

/**
 * Generate document from template
 * @param {Object} template - Document template
 * @param {Object} data - Data to populate template
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} - Generated document
 */
export async function generateDocumentFromTemplate(template, data, options = {}) {
  console.log('Generating document from template:', template.id);
  
  const startTime = Date.now();
  const model = options.enhancedGeneration ? PROCESSOR_CONFIG.enhancedModel : PROCESSOR_CONFIG.defaultModel;
  
  try {
    // Get template content
    let templateContent = '';
    
    if (typeof template.content === 'string') {
      templateContent = template.content;
    } else if (typeof template.content === 'object') {
      templateContent = JSON.stringify(template.content);
    } else if (template.file_path) {
      templateContent = await readFile(template.file_path, 'utf8');
    } else {
      throw new Error('No template content or file path provided');
    }
    
    // Build generation prompt
    const generationPrompt = `
      You are TrialSage's Document Generator, a specialized AI for regulatory document generation.
      
      Template Type: ${template.template_type || 'Unknown'}
      Template ID: ${template.id}
      
      Please generate a document based on the following template and data:
      
      Template:
      ${templateContent}
      
      Data:
      ${JSON.stringify(data)}
      
      Format your response exactly according to the template structure, replacing all placeholders
      with appropriate values from the provided data. Maintain the original formatting, headings,
      and structure of the template. For any missing data, use reasonable defaults based on the
      context.
      
      Return your response as a JSON object with:
      - title: the document title
      - content: the generated document content
      - metadata: metadata about the generation process
    `;
    
    // Call OpenAI for generation
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: generationPrompt }],
      temperature: PROCESSOR_CONFIG.temperature,
      max_tokens: PROCESSOR_CONFIG.maxTokens,
      response_format: { type: 'json_object' }
    });
    
    const generationResult = JSON.parse(completion.choices[0].message.content);
    
    // Enhance with metadata
    generationResult.metadata = {
      ...generationResult.metadata,
      generatedAt: new Date().toISOString(),
      templateId: template.id,
      templateType: template.template_type,
      processingTime: Date.now() - startTime
    };
    
    // Store generation in database if requested
    if (options.saveToDatabase) {
      const documentInsert = await db.query(`
        INSERT INTO documents
        (title, content, document_type, project_id, created_by, created_at, is_generated, template_id)
        VALUES ($1, $2, $3, $4, $5, NOW(), true, $6)
        RETURNING id
      `, [
        generationResult.title,
        JSON.stringify(generationResult.content),
        template.template_type,
        data.projectId,
        options.userId,
        template.id
      ]);
      
      generationResult.metadata.documentId = documentInsert.rows[0].id;
    }
    
    return generationResult;
  } catch (error) {
    console.error('Error generating document from template:', error);
    
    // Log generation error
    await db.query(`
      INSERT INTO document_generation_errors
      (template_id, error_message, processing_time)
      VALUES ($1, $2, $3)
    `, [
      template.id,
      error.message,
      Date.now() - startTime
    ]);
    
    throw error;
  }
}

/**
 * Check document compliance with standards
 * @param {Object} document - Document to check
 * @param {Array} standards - Standards to check against
 * @param {Object} options - Compliance check options
 * @returns {Promise<Object>} - Compliance check results
 */
export async function checkDocumentCompliance(document, standards = [], options = {}) {
  console.log('Checking document compliance:', document.id);
  
  const startTime = Date.now();
  const model = options.enhancedChecking ? PROCESSOR_CONFIG.enhancedModel : PROCESSOR_CONFIG.defaultModel;
  
  try {
    // Get document content
    let documentContent = '';
    
    if (typeof document.content === 'string') {
      try {
        documentContent = JSON.parse(document.content);
      } catch (e) {
        documentContent = document.content;
      }
    } else if (typeof document.content === 'object') {
      documentContent = document.content;
    } else if (document.file_path) {
      documentContent = await readFile(document.file_path, 'utf8');
    } else {
      throw new Error('No document content or file path provided');
    }
    
    // Get standards if not provided
    let standardsToCheck = standards;
    
    if (!standardsToCheck.length) {
      // Get default standards based on document type
      const standardsQuery = await db.query(`
        SELECT s.* 
        FROM compliance_standards s
        JOIN document_type_standards dts ON s.id = dts.standard_id
        WHERE dts.document_type = $1
      `, [document.document_type]);
      
      standardsToCheck = standardsQuery.rows;
    }
    
    if (!standardsToCheck.length) {
      throw new Error('No compliance standards found for this document type');
    }
    
    // Build compliance check prompt
    const compliancePrompt = `
      You are TrialSage's Compliance Checker, a specialized AI for regulatory compliance assessment.
      
      Document Type: ${document.document_type || 'Unknown'}
      Document ID: ${document.id}
      
      Please check this document for compliance with the following standards:
      ${standardsToCheck.map(std => `- ${std.name}: ${std.description}`).join('\n')}
      
      Document Content:
      ${typeof documentContent === 'object' ? JSON.stringify(documentContent) : documentContent}
      
      For each standard, provide:
      1. Compliance status (compliant, partially compliant, non-compliant)
      2. Specific compliance issues identified
      3. Recommendations to achieve full compliance
      4. Citation of specific standard sections relevant to findings
      
      Format your response as a JSON object with:
      - overallCompliance: overall compliance status
      - standardsAssessment: object with each standard as a key
      - criticalIssues: array of critical compliance issues
      - recommendations: array of recommendations
      - complianceScore: overall compliance score (0.0-1.0)
    `;
    
    // Call OpenAI for compliance check
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: compliancePrompt }],
      temperature: PROCESSOR_CONFIG.temperature,
      max_tokens: PROCESSOR_CONFIG.maxTokens,
      response_format: { type: 'json_object' }
    });
    
    const complianceResult = JSON.parse(completion.choices[0].message.content);
    
    // Store compliance check in database
    await db.query(`
      INSERT INTO document_compliance_checks
      (document_id, document_type, standards, overall_compliance, critical_issues, compliance_score, processing_time)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      document.id,
      document.document_type,
      JSON.stringify(standardsToCheck.map(std => std.id || std.name)),
      complianceResult.overallCompliance,
      JSON.stringify(complianceResult.criticalIssues),
      complianceResult.complianceScore,
      Date.now() - startTime
    ]);
    
    return {
      ...complianceResult,
      processingTime: Date.now() - startTime
    };
  } catch (error) {
    console.error('Error checking document compliance:', error);
    
    // Log compliance check error
    await db.query(`
      INSERT INTO document_compliance_errors
      (document_id, error_message, standards, processing_time)
      VALUES ($1, $2, $3, $4)
    `, [
      document.id,
      error.message,
      JSON.stringify(standards),
      Date.now() - startTime
    ]);
    
    throw error;
  }
}

/**
 * Process document with custom pipeline
 * @param {Object} document - Document to process
 * @param {Array} pipeline - Processing pipeline steps
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} - Processing results
 */
export async function processDocumentWithPipeline(document, pipeline = [], options = {}) {
  console.log('Processing document with pipeline:', document.id);
  
  const startTime = Date.now();
  const results = {};
  
  try {
    // Process each pipeline step
    for (const step of pipeline) {
      console.log(`Executing pipeline step: ${step.type}`);
      
      switch (step.type) {
        case 'extraction':
          results.extraction = await extractDocumentData(document, step.config?.extractionPoints, step.config);
          break;
        case 'structure_analysis':
          results.structureAnalysis = await analyzeDocumentStructure(document, step.config);
          break;
        case 'compliance_check':
          results.complianceCheck = await checkDocumentCompliance(document, step.config?.standards, step.config);
          break;
        case 'custom':
          // Handle custom processing steps
          if (step.processor && typeof step.processor === 'function') {
            results[step.name || 'customStep'] = await step.processor(document, step.config);
          }
          break;
        default:
          console.warn(`Unknown pipeline step type: ${step.type}`);
      }
    }
    
    // Store pipeline results in database
    await db.query(`
      INSERT INTO document_pipeline_results
      (document_id, pipeline_steps, results, processing_time)
      VALUES ($1, $2, $3, $4)
    `, [
      document.id,
      JSON.stringify(pipeline.map(step => ({ type: step.type, name: step.name }))),
      JSON.stringify(results),
      Date.now() - startTime
    ]);
    
    return {
      results,
      processingTime: Date.now() - startTime
    };
  } catch (error) {
    console.error('Error processing document with pipeline:', error);
    
    // Log pipeline error
    await db.query(`
      INSERT INTO document_pipeline_errors
      (document_id, error_message, pipeline_steps, processing_time)
      VALUES ($1, $2, $3, $4)
    `, [
      document.id,
      error.message,
      JSON.stringify(pipeline),
      Date.now() - startTime
    ]);
    
    throw error;
  }
}