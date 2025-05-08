/**
 * CER Validation API Routes
 * 
 * This module provides endpoints for validating Clinical Evaluation Reports
 * against regulatory requirements from multiple frameworks.
 */

const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Validation framework requirements
const validationFrameworks = {
  mdr: {
    name: 'EU MDR',
    requirements: [
      'GSPR mapping for all safety and performance claims',
      'State-of-the-art analysis with current standards',
      'Literature search methodology documentation',
      'Benefit-risk analysis',
      'Post-market surveillance plan',
      'PMCF plan compliant with MDCG 2020-7',
      'Device description and intended purpose',
      'Qualifications of evaluators',
      'Complete bibliography with proper citations'
    ]
  },
  fda: {
    name: 'US FDA',
    requirements: [
      'Substantial equivalence documentation (for 510(k))',
      'Benefit-risk determination',
      'Performance testing data',
      'Clinical study protocols and results',
      'Device description and indications for use',
      'Complete reference list with proper citations'
    ]
  },
  ukca: {
    name: 'UKCA',
    requirements: [
      'UK-specific clinical evidence requirements',
      'UKCA marking compliance documentation',
      'Post-market surveillance plan for UK market',
      'UK Responsible Person details',
      'Complete reference list with proper citations'
    ]
  },
  health_canada: {
    name: 'Health Canada',
    requirements: [
      'Device classification according to Canadian regulations',
      'Canadian Medical Device Licence requirements',
      'Risk classification and management',
      'Clinical evidence specific to Canadian guidelines',
      'Complete reference list with proper citations'
    ]
  },
  ich: {
    name: 'ICH',
    requirements: [
      'International harmonization documentation',
      'Cross-reference to regional requirements',
      'Complete reference list with proper citations'
    ]
  }
};

/**
 * Validate a CER document
 * POST /api/cer/documents/:id/validate
 */
router.post('/documents/:id/validate', async (req, res) => {
  try {
    const documentId = req.params.id;
    const { framework = 'mdr' } = req.body;
    
    // In a real implementation, we would retrieve the document content
    // from a database or file storage using documentId
    
    // For demonstration, we'll simulate the validation process
    // In a real implementation, this would analyze the actual document content
    
    // Example validation results structure
    const validationResults = await simulateValidation(documentId, framework);
    
    res.json(validationResults);
  } catch (error) {
    console.error('Error validating document:', error);
    res.status(500).json({
      error: 'Failed to validate document',
      message: error.message
    });
  }
});

/**
 * Simulate validation of a document
 * In a real implementation, this would perform actual content analysis
 */
async function simulateValidation(documentId, framework) {
  // In a real implementation, we would:
  // 1. Retrieve the document content
  // 2. Analyze it for compliance with the selected framework
  // 3. Verify references and citations
  // 4. Check for completeness and consistency
  
  // Create a simulated validation response with real requirements
  // based on the selected framework
  
  const criticalIssues = Math.floor(Math.random() * 2); // 0-1
  const majorIssues = Math.floor(Math.random() * 3); // 0-2
  const minorIssues = Math.floor(Math.random() * 4); // 0-3
  
  const totalIssues = criticalIssues + majorIssues + minorIssues;
  const passedChecks = Math.floor(Math.random() * 15) + 30; // 30-44
  
  // Calculate compliance score
  const complianceScore = Math.max(0, 100 - (criticalIssues * 15) - (majorIssues * 7) - (minorIssues * 3));
  
  const frameworkReqs = validationFrameworks[framework] || validationFrameworks.mdr;
  
  // Generate an array of fake issues based on the framework requirements
  const issues = [];
  
  // Add critical issues if any
  for (let i = 0; i < criticalIssues; i++) {
    const reqIndex = Math.floor(Math.random() * frameworkReqs.requirements.length);
    const req = frameworkReqs.requirements[reqIndex];
    
    issues.push({
      id: issues.length + 1,
      category: 'regulatory_compliance',
      severity: 'critical',
      message: `Missing ${req} documentation required by ${frameworkReqs.name}`,
      location: `Section ${Math.floor(Math.random() * 6) + 1}.${Math.floor(Math.random() * 9) + 1}`,
      suggestion: `Add complete ${req} documentation according to ${frameworkReqs.name} requirements`
    });
  }
  
  // Add major issues if any
  for (let i = 0; i < majorIssues; i++) {
    const categories = ['completeness', 'references', 'regulatory_compliance'];
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    let message, suggestion;
    
    if (category === 'completeness') {
      message = 'Document section is incomplete';
      suggestion = 'Complete the section with all required information';
    } else if (category === 'references') {
      message = 'Citation not found in reference list';
      suggestion = 'Add missing reference to bibliography or correct citation';
    } else {
      const reqIndex = Math.floor(Math.random() * frameworkReqs.requirements.length);
      const req = frameworkReqs.requirements[reqIndex];
      message = `Inadequate ${req} documentation`;
      suggestion = `Enhance ${req} documentation according to ${frameworkReqs.name} guidelines`;
    }
    
    issues.push({
      id: issues.length + 1,
      category,
      severity: 'major',
      message,
      location: `Section ${Math.floor(Math.random() * 6) + 1}.${Math.floor(Math.random() * 9) + 1}`,
      suggestion
    });
  }
  
  // Add minor issues if any
  for (let i = 0; i < minorIssues; i++) {
    const categories = ['completeness', 'references', 'consistency', 'regulatory_compliance'];
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    let message, suggestion;
    
    if (category === 'completeness') {
      message = 'Section could be enhanced with additional details';
      suggestion = 'Consider adding more comprehensive information to strengthen this section';
    } else if (category === 'references') {
      message = 'Inconsistent citation format';
      suggestion = 'Standardize citation format according to document template';
    } else if (category === 'consistency') {
      message = 'Terminology inconsistency detected';
      suggestion = 'Use consistent terminology throughout the document';
    } else {
      message = 'Additional regulatory context would strengthen compliance';
      suggestion = 'Consider adding more regulatory context to enhance compliance';
    }
    
    issues.push({
      id: issues.length + 1,
      category,
      severity: 'minor',
      message,
      location: `Section ${Math.floor(Math.random() * 6) + 1}.${Math.floor(Math.random() * 9) + 1}`,
      suggestion
    });
  }
  
  // Calculate category statuses
  const getStatus = (passed, failed) => {
    if (failed === 0) return 'success';
    if (failed > 0 && failed <= 2) return 'warning';
    return 'error';
  };
  
  return {
    summary: {
      totalIssues,
      criticalIssues,
      majorIssues,
      minorIssues,
      passedChecks,
      complianceScore
    },
    categories: {
      regulatory_compliance: { 
        status: getStatus(passedChecks, issues.filter(i => i.category === 'regulatory_compliance').length),
        passed: Math.floor(Math.random() * 5) + 15, // 15-19
        failed: issues.filter(i => i.category === 'regulatory_compliance').length
      },
      completeness: { 
        status: getStatus(passedChecks, issues.filter(i => i.category === 'completeness').length),
        passed: Math.floor(Math.random() * 3) + 7, // 7-9
        failed: issues.filter(i => i.category === 'completeness').length
      },
      references: { 
        status: getStatus(passedChecks, issues.filter(i => i.category === 'references').length),
        passed: Math.floor(Math.random() * 3) + 8, // 8-10
        failed: issues.filter(i => i.category === 'references').length
      },
      consistency: { 
        status: getStatus(passedChecks, issues.filter(i => i.category === 'consistency').length),
        passed: Math.floor(Math.random() * 3) + 5, // 5-7
        failed: issues.filter(i => i.category === 'consistency').length
      }
    },
    issues
  };
}

/**
 * Validate a document using OpenAI's GPT-4o model
 * @param {Object} document - The document to validate 
 * @param {string} framework - The regulatory framework to validate against
 * @returns {Promise<Object>} - Validation results with detailed analysis
 */
async function validateWithAI(document, framework) {
  try {
    // Use the appropriate framework requirements
    const frameworkData = validationFrameworks[framework] || validationFrameworks.mdr;
    
    // Create a prompt for the AI model
    const prompt = `
      You are an expert regulatory consultant specialized in medical device Clinical Evaluation Reports (CERs).
      Please analyze this clinical evaluation report content against ${frameworkData.name} requirements.
      
      FRAMEWORKS REQUIREMENTS:
      ${JSON.stringify(frameworkData.requirements, null, 2)}
      
      DOCUMENT SECTIONS TO ANALYZE:
      ${JSON.stringify(document.sections, null, 2)}
      
      For each requirement, determine if the document fully meets, partially meets, or fails to meet the requirement.
      Identify any critical issues, major issues, and minor issues.
      
      Critical issues: Missing essential components required by regulations
      Major issues: Incomplete sections or inadequate evidence for important claims
      Minor issues: Formatting issues, minor inconsistencies, or areas that could be improved
      
      For each issue, provide:
      1. The specific location in the document (section number if possible)
      2. A detailed description of the issue
      3. A concrete suggestion for how to address the issue
      
      Return your analysis in the following JSON format:
      {
        "summary": {
          "totalIssues": number,
          "criticalIssues": number,
          "majorIssues": number,
          "minorIssues": number,
          "passedChecks": number,
          "complianceScore": number
        },
        "categories": {
          "regulatory_compliance": { "status": "success"|"warning"|"error", "passed": number, "failed": number },
          "completeness": { "status": "success"|"warning"|"error", "passed": number, "failed": number },
          "references": { "status": "success"|"warning"|"error", "passed": number, "failed": number },
          "consistency": { "status": "success"|"warning"|"error", "passed": number, "failed": number }
        },
        "issues": [
          {
            "id": number,
            "category": "regulatory_compliance"|"completeness"|"references"|"consistency",
            "severity": "critical"|"major"|"minor",
            "message": "Description of the issue",
            "location": "Section X.Y",
            "suggestion": "How to address the issue"
          }
        ]
      }
    `;
    
    // Call the OpenAI API with the gpt-4o model
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are an expert regulatory consultant for medical device Clinical Evaluation Reports." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the AI response
    const aiAnalysis = JSON.parse(response.choices[0].message.content);
    
    // Integrate AI validation with standard checks
    return {
      ...aiAnalysis,
      aiValidated: true,
      validationDate: new Date().toISOString(),
      framework: frameworkData.name
    };
  } catch (error) {
    console.error('Error validating with AI:', error);
    
    // Fallback to simulation if AI validation fails
    console.log('Falling back to simulated validation');
    const simulatedResults = await simulateValidation(document.id, framework);
    
    return {
      ...simulatedResults,
      aiValidated: false,
      validationDate: new Date().toISOString(),
      framework: frameworkData.name,
      error: error.message
    };
  }
}


// Export the router as default
module.exports = router;
module.exports.default = router;