/**
 * CER Validation API Routes
 * 
 * This module provides the API endpoints for validating Clinical Evaluation Reports (CERs)
 * against various regulatory frameworks and ensuring compliance with standards.
 */

const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const { OpenAI } = require('openai');

// Initialize OpenAI client with GPT-4o for advanced validation
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Validate CER Document Endpoint
 * Validates a CER document against a specific regulatory framework
 */
router.post('/documents/:documentId/validate', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { framework = 'mdr', sections = [] } = req.body;
    
    console.log(`Validating document ${documentId} against ${framework} framework`);
    
    // Get document from database
    const documentService = require('../services/documentService');
    const document = await documentService.getDocumentById(documentId);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Load regulatory requirements from database based on framework
    const regulatoryService = require('../services/regulatoryService');
    const regulatoryRequirements = await regulatoryService.getRequirements(framework);
    
    // Create a validation context with document content and requirements
    const validationContext = {
      document: document,
      framework: framework,
      requirements: regulatoryRequirements,
      sectionsToValidate: sections.length > 0 ? sections : null // If specified, only validate these sections
    };
    
    // Use regulatory validation service to perform validation
    const validationService = require('../services/validationService');
    const validationResults = await validationService.validateDocument(validationContext);
    
    // Log validation result summary
    console.log(`Validation complete for document ${documentId}. Score: ${validationResults.validationResults.summary.overallScore}. Critical issues: ${validationResults.validationResults.summary.criticalIssues}`);
    
    res.json(validationResults);
  } catch (error) {
    console.error('Error validating document:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Enhanced Validation Endpoint using GPT-4o 
 * Provides deeper analysis including hallucination detection, reference checking,
 * and regulatory gap analysis
 */
router.post('/documents/:documentId/validate-enhanced', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { framework = 'mdr', sections = [], options = {} } = req.body;
    
    console.log(`Running enhanced validation for document ${documentId} against ${framework}`);
    
    // Get document from database
    const documentService = require('../services/documentService');
    const document = await documentService.getDocumentById(documentId);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Load regulatory requirements from database based on framework
    const regulatoryService = require('../services/regulatoryService');
    const regulatoryRequirements = await regulatoryService.getRequirements(framework);
    
    // Extract references from document for verification
    const referenceService = require('../services/referenceService');
    const references = await referenceService.extractReferences(document);
    
    // Initialize base result structure
    const enhancedValidationResults = {
      documentId,
      framework,
      timestamp: new Date().toISOString(),
      analysisMode: 'enhanced',
      validationResults: {
        summary: {
          overallScore: 0,
          criticalIssues: 0,
          majorIssues: 0,
          minorIssues: 0,
          recommendations: 0
        },
        hallucinations: [],
        referenceIssues: [],
        sections: [],
        regulatoryRequirements: []
      }
    };
    
    // 1. Perform enhanced validation using GPT-4o
    console.log("Performing GPT-4o enhanced validation analysis...");
    const openaiService = require('../services/openaiService');
    
    // Convert document to text for analysis
    const documentText = documentService.convertToText(document);
    
    // Build prompt for GPT-4o
    const systemPrompt = `You are an expert regulatory validator for Clinical Evaluation Reports (CER) in the medical device industry.
You are analyzing a CER document for compliance with ${framework} framework.
Your task is to:
1. Identify potential hallucinations (claims not supported by evidence)
2. Detect any inconsistencies within the document
3. Evaluate adherence to regulatory requirements
4. Find any scientific or medical inaccuracies
5. Provide an overall assessment with specific, actionable recommendations

Format your response as a valid JSON with the following structure:
{
  "summary": {
    "overallScore": <number between 0-100>,
    "criticalIssues": <number>,
    "majorIssues": <number>,
    "minorIssues": <number>,
    "recommendations": <number>
  },
  "hallucinations": [
    {
      "text": "<the problematic claim>",
      "location": "<section reference>",
      "confidence": <number between 0-1>,
      "details": "<explanation>",
      "suggestedCorrection": "<suggested fix>"
    }
  ],
  "sections": [
    {
      "name": "<section name>",
      "score": <number between 0-100>,
      "issues": [
        {
          "severity": "<critical|major|minor>",
          "description": "<issue description>",
          "location": "<precise location in document>"
        }
      ],
      "recommendations": ["<recommendation 1>", "<recommendation 2>"]
    }
  ],
  "regulatoryRequirements": [
    {
      "requirement": "<regulatory reference>",
      "compliant": <boolean>,
      "details": "<explanation>"
    }
  ]
}`;

    try {
      const gpt4oResponse = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this Clinical Evaluation Report for compliance with ${framework}:\n\n${documentText}` }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      });
      
      // Parse and validate the response
      const aiAnalysis = JSON.parse(gpt4oResponse.choices[0].message.content);
      
      // Update enhanced validation results with AI analysis
      enhancedValidationResults.validationResults.summary = aiAnalysis.summary;
      enhancedValidationResults.validationResults.hallucinations = aiAnalysis.hallucinations;
      enhancedValidationResults.validationResults.sections = aiAnalysis.sections;
      enhancedValidationResults.validationResults.regulatoryRequirements = aiAnalysis.regulatoryRequirements;
      
      console.log(`GPT-4o analysis complete. Overall score: ${aiAnalysis.summary.overallScore}`);
    } catch (openaiError) {
      console.error("Error during GPT-4o analysis:", openaiError);
      throw new Error(`Enhanced validation failed during AI analysis: ${openaiError.message}`);
    }
    
    // 2. Verify references against literature databases
    console.log("Verifying document references against literature databases...");
    
    try {
      const verifiedReferences = await Promise.all(
        references.map(reference => referenceService.verifyReference(reference))
      );
      
      // Add reference issues to results
      enhancedValidationResults.validationResults.referenceIssues = verifiedReferences
        .filter(result => !result.valid)
        .map(result => ({
          reference: result.reference,
          valid: false,
          confidence: result.confidence,
          issue: result.issue,
          suggestedCorrection: result.suggestedCorrection
        }));
      
      console.log(`Reference verification complete. Found ${enhancedValidationResults.validationResults.referenceIssues.length} issues.`);
    } catch (referenceError) {
      console.error("Error during reference verification:", referenceError);
      throw new Error(`Enhanced validation failed during reference verification: ${referenceError.message}`);
    }
    
    // Log validation result summary
    console.log(`Enhanced validation complete for document ${documentId}. Score: ${enhancedValidationResults.validationResults.summary.overallScore}. Critical issues: ${enhancedValidationResults.validationResults.summary.criticalIssues}`);
    
    res.json(enhancedValidationResults);
  } catch (error) {
    console.error('Error performing enhanced validation:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Check Specific Section Endpoint
 * Validates a single section of a CER document
 */
router.post('/documents/:documentId/check-section', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { section, framework = 'mdr' } = req.body;
    
    if (!section) {
      return res.status(400).json({ error: 'Section identifier is required' });
    }
    
    console.log(`Checking section ${section} of document ${documentId}`);
    
    // Get document from database
    const documentService = require('../services/documentService');
    const document = await documentService.getDocumentById(documentId);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Extract just the specified section
    const sectionContent = documentService.getSectionContent(document, section);
    
    if (!sectionContent) {
      return res.status(404).json({ error: 'Section not found in document' });
    }
    
    // Load section-specific requirements from the regulatory framework
    const regulatoryService = require('../services/regulatoryService');
    const sectionRequirements = await regulatoryService.getSectionRequirements(section, framework);
    
    // Use GPT-4o to analyze the specific section
    console.log(`Using GPT-4o to analyze section ${section} against ${framework} requirements`);
    
    const systemPrompt = `You are an expert regulatory validator for Clinical Evaluation Reports (CER) in the medical device industry.
You are analyzing a specific section of a CER document for compliance with ${framework} framework.
The section being analyzed is: ${section}

Your task is to:
1. Evaluate if the section satisfies all regulatory requirements
2. Identify any missing elements required by the standard
3. Check for consistency with standard format and structure
4. Provide an overall assessment with specific, actionable recommendations

Format your response as a valid JSON with the following structure:
{
  "score": <number between 0-100>,
  "compliantWithRegulation": <boolean>,
  "issues": [
    {
      "severity": "<critical|major|minor>",
      "description": "<issue description>",
      "details": "<details of the issue>"
    }
  ],
  "recommendations": ["<recommendation 1>", "<recommendation 2>"]
}`;

    try {
      const gpt4oResponse = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this section (${section}) for compliance with ${framework}:\n\n${sectionContent}` }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      });
      
      // Parse and validate the response
      const aiAnalysis = JSON.parse(gpt4oResponse.choices[0].message.content);
      
      // Structure the final response
      const sectionCheckResults = {
        documentId,
        section,
        framework,
        timestamp: new Date().toISOString(),
        results: aiAnalysis
      };
      
      console.log(`Section ${section} analysis complete. Score: ${aiAnalysis.score}`);
      
      res.json(sectionCheckResults);
    } catch (error) {
      console.error(`Error analyzing section ${section}:`, error);
      throw new Error(`Section validation failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Error checking section:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * QMP Integration Validation Endpoint
 * Validates a Quality Management Plan's objectives against CER sections
 * to ensure proper compliance with ICH E6(R3) and regulatory requirements
 */
router.post('/qmp-integration/validate', async (req, res) => {
  try {
    const { objectives, cerSections, framework = 'mdr' } = req.body;
    
    if (!objectives || !Array.isArray(objectives) || objectives.length === 0) {
      return res.status(400).json({ 
        error: 'Valid quality objectives array is required' 
      });
    }
    
    console.log(`Validating QMP integration with ${objectives.length} objectives against framework: ${framework}`);
    
    // Extract required sections for the specified framework
    const regulatoryService = require('../services/regulatoryService');
    const frameworkSections = await regulatoryService.getRequiredSections(framework);
    
    // Check which required sections are covered by objectives
    const coveredSections = new Set();
    objectives.forEach(objective => {
      if (objective.scopeSections && Array.isArray(objective.scopeSections)) {
        objective.scopeSections.forEach(section => {
          coveredSections.add(section);
        });
      }
    });
    
    // Check for missing critical sections
    const criticalSections = ['Safety', 'Clinical Data', 'GSPR Mapping'];
    const missingSections = frameworkSections.filter(section => !coveredSections.has(section));
    const missingCriticalSections = criticalSections.filter(section => !coveredSections.has(section));
    
    // Use GPT-4o for advanced validation of QMP integration
    console.log(`Using GPT-4o to analyze QMP compliance with ICH E6(R3) requirements`);
    
    // Convert objectives to easily readable text format for the AI
    const objectivesText = objectives.map(obj => {
      return `Objective: ${obj.title}
Description: ${obj.description}
Status: ${obj.status}
Scope Sections: ${obj.scopeSections ? obj.scopeSections.join(', ') : 'None'}
Mitigation Actions: ${obj.mitigationActions || 'None'}
`;
    }).join('\n\n');
    
    const systemPrompt = `You are an expert in regulatory compliance focusing on Quality Management Plans for medical device Clinical Evaluation Reports.
You are evaluating whether a set of quality objectives properly addresses ICH E6(R3) requirements and provides adequate coverage for CER sections.

Your task is to:
1. Analyze if the quality objectives adequately cover the critical sections of a CER
2. Evaluate the completeness and specificity of the objectives
3. Assess if mitigation actions are appropriate and sufficient
4. Determine if the overall QMP approach meets ICH E6(R3) standards
5. Identify any gaps or areas for improvement

Format your response as a valid JSON with the following structure:
{
  "compliance": {
    "score": <number between 0-100>,
    "compliantWithICH": <boolean>,
    "compliantWithFramework": <boolean>,
    "adequateCoverage": <boolean>
  },
  "gaps": [
    {
      "section": "<section name>",
      "impact": "<high|medium|low>",
      "description": "<description of the gap>"
    }
  ],
  "recommendations": [
    {
      "priority": "<high|medium|low>",
      "description": "<recommendation>",
      "justification": "<regulatory reference or rationale>"
    }
  ],
  "strengths": ["<strength 1>", "<strength 2>"]
}`;

    try {
      const gpt4oResponse = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze these Quality Management Plan objectives for compliance with ICH E6(R3) and coverage of CER sections:\n\n${objectivesText}` }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      });
      
      // Parse and validate the response
      const aiAnalysis = JSON.parse(gpt4oResponse.choices[0].message.content);
      
      // Calculate section coverage metrics
      const coveragePercentage = frameworkSections.length > 0 
        ? Math.round((coveredSections.size / frameworkSections.length) * 100) 
        : 0;
      
      // Compile final validation results
      const validationResults = {
        timestamp: new Date().toISOString(),
        framework,
        sectionsAnalysis: {
          requiredSections: frameworkSections,
          coveredSections: Array.from(coveredSections),
          missingSections,
          missingCriticalSections,
          coveragePercentage
        },
        aiAnalysis,
        complianceStatus: {
          compliant: aiAnalysis.compliance.compliantWithICH && aiAnalysis.compliance.compliantWithFramework,
          objectivesWithoutScope: objectives.filter(obj => !obj.scopeSections || obj.scopeSections.length === 0).length,
          objectivesWithoutMitigation: objectives.filter(obj => !obj.mitigationActions || obj.mitigationActions.trim() === '').length,
          coverage: coveragePercentage,
          criticalSectionsMissing: missingCriticalSections.length > 0,
          recommendationCount: aiAnalysis.recommendations.length
        }
      };
      
      console.log(`QMP validation complete. Coverage: ${coveragePercentage}%, Compliance score: ${aiAnalysis.compliance.score}`);
      
      res.json(validationResults);
    } catch (error) {
      console.error(`Error analyzing QMP objectives:`, error);
      throw new Error(`QMP validation failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Error validating QMP integration:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export the router
module.exports = router;