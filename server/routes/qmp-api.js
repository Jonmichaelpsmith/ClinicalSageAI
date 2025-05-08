const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// Initialize OpenAI with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// In-memory storage for QMP data (in production, this would be a database)
let qmpData = {
  objectives: [
    {
      id: "obj1",
      title: "Data Integrity Across Clinical Evaluation",
      description: "Ensure the integrity, accuracy, and traceability of all data used in clinical evaluation",
      measures: "100% verification of critical data sources, zero unresolved data integrity issues",
      responsible: "Clinical Data Manager",
      timeline: "Continuous throughout CER development",
      status: "in-progress"
    },
    {
      id: "obj2",
      title: "Regulatory Compliance with EU MDR",
      description: "Ensure complete compliance with EU MDR 2017/745 and MEDDEV 2.7/1 Rev 4 requirements",
      measures: "Pass all compliance checks with zero critical findings",
      responsible: "Regulatory Affairs Manager",
      timeline: "Verification prior to CER finalization",
      status: "in-progress"
    },
    {
      id: "obj3",
      title: "ICH E6(R3) Implementation",
      description: "Fully implement ICH E6(R3) risk-based quality management across clinical evaluation process",
      measures: "Risk assessment and mitigation strategies for all critical processes",
      responsible: "Quality Assurance Manager",
      timeline: "Q2 2025",
      status: "in-progress"
    }
  ],
  ctqFactors: [
    {
      id: "ctq1",
      objectiveId: "obj1",
      name: "Literature Search Reproducibility",
      description: "Search methodology must be transparent and reproducible by third parties",
      associatedSection: "Literature Review Methodology",
      riskLevel: "high",
      mitigation: "Detailed documentation of search terms, databases, inclusion/exclusion criteria",
      mitigated: false,
      controlStatus: "partial"
    },
    {
      id: "ctq2",
      objectiveId: "obj1",
      name: "Data Traceability",
      description: "All data must be traceable to original source with verification method",
      associatedSection: "Clinical Data Analysis",
      riskLevel: "high", 
      mitigation: "Implementation of data provenance tracking system",
      mitigated: true,
      controlStatus: "complete"
    },
    {
      id: "ctq3",
      objectiveId: "obj2",
      name: "GSPR Mapping Completeness",
      description: "All applicable GSPRs must be mapped to specific evidence",
      associatedSection: "GSPR Assessment",
      riskLevel: "critical",
      mitigation: "Gap analysis and evidence mapping verification by multiple reviewers",
      mitigated: false,
      controlStatus: "partial"
    },
    {
      id: "ctq4",
      objectiveId: "obj2",
      name: "PMS Data Integration",
      description: "Post-market surveillance data must be fully integrated into clinical evaluation",
      associatedSection: "Post-Market Surveillance",
      riskLevel: "medium",
      mitigation: "Automated PMS data pipeline with validation checks",
      mitigated: true,
      controlStatus: "complete"
    },
    {
      id: "ctq5",
      objectiveId: "obj3",
      name: "Risk-Based Quality Monitoring",
      description: "Implementation of risk-based monitoring for critical data points",
      associatedSection: "Quality Management",
      riskLevel: "medium",
      mitigation: "Risk assessment for all data sources with corresponding monitoring plans",
      mitigated: false,
      controlStatus: "planned"
    }
  ],
  riskAssessments: [
    {
      id: "risk1",
      title: "Incomplete Literature Review Coverage",
      description: "Risk that literature review misses relevant publications due to inadequate search strategy",
      riskLevel: "high",
      impactedProcess: "Literature Review",
      applicableSection: "Literature Analysis",
      mitigationStrategy: "Implement peer review of search strategy and results by independent clinical evaluator",
      mitigated: false,
      controlStatus: "partial"
    },
    {
      id: "risk2",
      title: "Outdated Clinical Data",
      description: "Risk that clinical evidence becomes outdated during CER preparation process",
      riskLevel: "medium",
      impactedProcess: "State of the Art Assessment",
      applicableSection: "Clinical Evaluation Results",
      mitigationStrategy: "Implement automated monitoring of literature databases for new publications",
      mitigated: true,
      controlStatus: "complete"
    },
    {
      id: "risk3",
      title: "Inadequate Equivalence Justification",
      description: "Risk that equivalence to predicate devices is not sufficiently substantiated",
      riskLevel: "critical",
      impactedProcess: "Equivalence Assessment",
      applicableSection: "Device Equivalence",
      mitigationStrategy: "Comprehensive documentation of equivalence with detailed technical, biological and clinical characteristics",
      mitigated: false,
      controlStatus: "planned"
    },
    {
      id: "risk4",
      title: "Inconsistent Benefit-Risk Determination",
      description: "Risk of inconsistent methodology in benefit-risk determination across device variants",
      riskLevel: "high",
      impactedProcess: "Benefit-Risk Analysis",
      applicableSection: "Benefit-Risk Determination",
      mitigationStrategy: "Standardized benefit-risk assessment methodology with independent verification",
      mitigated: false,
      controlStatus: "partial"
    },
    {
      id: "risk5",
      title: "Incomplete Adverse Event Analysis",
      description: "Risk that adverse events from FAERS and other sources are not fully captured or analyzed",
      riskLevel: "medium",
      impactedProcess: "Safety Evaluation",
      applicableSection: "Clinical Safety",
      mitigationStrategy: "Implement automated adverse event data collection with verification by clinical safety expert",
      mitigated: true,
      controlStatus: "complete"
    }
  ]
};

/**
 * Retrieve Quality Management Plan data
 * GET /api/qmp
 */
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      data: qmpData
    });
  } catch (error) {
    console.error('Error fetching QMP data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve Quality Management Plan data',
      details: error.message
    });
  }
});

/**
 * Save Quality Management Plan data
 * POST /api/qmp
 */
router.post('/', async (req, res) => {
  try {
    const { objectives, ctqFactors } = req.body;
    
    if (!objectives || !Array.isArray(objectives)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid objectives data. Expected an array.'
      });
    }
    
    qmpData = {
      objectives: objectives,
      ctqFactors: ctqFactors || []
    };
    
    res.json({
      success: true,
      message: 'Quality Management Plan data saved successfully',
      data: qmpData
    });
  } catch (error) {
    console.error('Error saving QMP data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save Quality Management Plan data',
      details: error.message
    });
  }
});

/**
 * Generate QMP content for CER document
 * POST /api/qmp/generate
 */
router.post('/generate', async (req, res) => {
  try {
    const { deviceName, manufacturer, objectives, ctqFactors } = req.body;
    
    if (!objectives || objectives.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No objectives provided. At least one quality objective is required.'
      });
    }

    // Format data for OpenAI
    const data = {
      device: deviceName || 'Unnamed Device',
      manufacturer: manufacturer || 'Unnamed Manufacturer',
      objectives: objectives,
      ctqFactors: ctqFactors || []
    };

    // Use OpenAI to enhance QMP content
    const enhancedContent = await generateEnhancedQMP(data);
    
    res.json({
      success: true,
      content: enhancedContent,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating QMP content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate Quality Management Plan content',
      details: error.message
    });
  }
});

/**
 * Validate QMP against ICH E6(R3) and regulatory requirements
 * POST /api/qmp/validate
 */
router.post('/validate', async (req, res) => {
  try {
    const { objectives, ctqFactors } = req.body;
    
    if (!objectives || objectives.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No objectives provided. At least one quality objective is required for validation.'
      });
    }

    // Validate using OpenAI
    const validationResults = await validateQMP({ objectives, ctqFactors });
    
    res.json({
      success: true,
      validationResults
    });
  } catch (error) {
    console.error('Error validating QMP:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate Quality Management Plan',
      details: error.message
    });
  }
});

/**
 * Get CtQ factors that might affect a specific CER section
 * GET /api/qmp/ctq-for-section/:sectionName
 */
router.get('/ctq-for-section/:sectionName', async (req, res) => {
  try {
    const { sectionName } = req.params;
    
    // Filter CtQ factors that are relevant to this section
    const relevantFactors = qmpData.ctqFactors.filter(factor => 
      factor.associatedSection && 
      factor.associatedSection.toLowerCase().includes(sectionName.toLowerCase())
    );
    
    res.json({
      success: true,
      factors: relevantFactors,
      count: relevantFactors.length
    });
  } catch (error) {
    console.error(`Error fetching CtQ factors for section ${req.params.sectionName}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve CtQ factors for section',
      details: error.message
    });
  }
});

/**
 * Enhance QMP-related validation issues with ICH E6(R3) context
 * POST /api/qmp/enhance-issues
 */
router.post('/enhance-issues', async (req, res) => {
  try {
    const { documentId, framework, qmpIssues, regulatoryContext } = req.body;
    
    if (!qmpIssues || qmpIssues.length === 0) {
      return res.json({
        success: true,
        message: 'No QMP issues to enhance',
        enhancedIssues: []
      });
    }
    
    // Use OpenAI to enhance the QMP issues with ICH E6(R3) context
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a Quality Management expert specializing in ICH E6(R3) and EU MDR 2017/745 compliance.
          Your task is to enhance QMP-related validation issues with context from ICH E6(R3) Good Clinical Practice
          and other relevant regulatory frameworks.
          
          For each validation issue:
          1. Maintain the original structure and severity level
          2. Enhance the description with specific references to ICH E6(R3) principles
          3. Add more detailed remediation steps with concrete actions
          4. Provide context about why this issue is important for regulatory compliance
          5. If possible, reference specific sections of ICH E6(R3), EU MDR, or other relevant regulations
          
          Return the enhanced issues array in the same format as provided, with enriched descriptions and remediation suggestions.`
        },
        {
          role: "user",
          content: JSON.stringify({
            framework,
            regulatoryContext,
            issues: qmpIssues
          })
        }
      ],
      temperature: 0.3,
      max_tokens: 2500
    });
    
    const enhancedContent = JSON.parse(response.choices[0].message.content);
    const enhancedIssues = enhancedContent.issues || enhancedContent;
    
    res.json({
      success: true,
      message: 'QMP issues enhanced successfully',
      enhancedIssues
    });
  } catch (error) {
    console.error('Error enhancing QMP issues:', error);
    
    // Return the original issues if enhancement fails
    res.json({
      success: true,
      message: 'Could not enhance QMP issues, returning original',
      enhancedIssues: req.body.qmpIssues,
      error: error.message
    });
  }
});

/**
 * Use OpenAI to enhance the QMP with ICH E6(R3) compliant content
 */
async function generateEnhancedQMP(data) {
  try {
    // Prepare the CtQ factors by objective for better formatting
    const ctqByObjective = {};
    for (const factor of data.ctqFactors) {
      if (!ctqByObjective[factor.objectiveId]) {
        ctqByObjective[factor.objectiveId] = [];
      }
      ctqByObjective[factor.objectiveId].push(factor);
    }
    
    // Format objective data with their associated CtQ factors
    const objectivesWithCtq = data.objectives.map(obj => {
      return {
        ...obj,
        ctqFactors: ctqByObjective[obj.id] || []
      };
    });

    // Use GPT-4o for enhanced QMP generation
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a Clinical Quality Management expert specializing in ICH E6(R3) compliance and EU MDR regulations. 
          Your task is to format an enhanced, professionally written Quality Management Plan (QMP) for a medical device's 
          Clinical Evaluation Report based on the provided quality objectives and critical-to-quality factors. 
          Follow these guidelines:
          
          1. Create a comprehensive QMP document structure with numbered sections
          2. Include an introduction to quality management for medical device clinical evaluations
          3. Format each quality objective with its description, measures, timeline, and status
          4. For each objective, include its associated critical-to-quality factors with risk levels
          5. Add a section on quality monitoring and continuous improvement 
          6. Add a section on compliance with ICH E6(R3) and EU MDR 2017/745
          7. Include references to MEDDEV 2.7/1 Rev 4 and ISO 14155:2020
          8. Format the output in Markdown for direct inclusion in the CER
          9. Ensure the content is suitable for regulatory submission
          10. Maintain professional, formal language throughout`
        },
        {
          role: "user",
          content: JSON.stringify({
            device: data.device,
            manufacturer: data.manufacturer,
            objectives: objectivesWithCtq
          })
        }
      ],
      temperature: 0.2,
      max_tokens: 3000
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating enhanced QMP content with OpenAI:', error);
    
    // Fallback to basic formatting if OpenAI fails
    const deviceInfo = data.device ? 
      `Device: ${data.device}${data.manufacturer ? ` (Manufacturer: ${data.manufacturer})` : ''}` : 
      `Unnamed Device${data.manufacturer ? ` (Manufacturer: ${data.manufacturer})` : ''}`;

    let content = `
# Quality Management Plan

${deviceInfo}

## 1. Introduction

This Quality Management Plan (QMP) has been developed in accordance with ICH E6(R3) principles and EU MDR 2017/745 requirements to ensure the quality, integrity, and compliance of the clinical evaluation process for this medical device. The QMP outlines quality objectives, critical-to-quality factors, and methods for monitoring and maintaining quality throughout the clinical evaluation process.

## 2. Quality Objectives

`;

    // Format objectives and their CtQ factors
    data.objectives.forEach((obj, idx) => {
      content += `
### 2.${idx + 1}. ${obj.title}

**Description:** ${obj.description}

**Success Measures:** ${obj.measures || 'Not specified'}

**Responsible Party:** ${obj.responsible || 'Not specified'}

**Timeline:** ${obj.timeline || 'Not specified'}

**Status:** ${obj.status.charAt(0).toUpperCase() + obj.status.slice(1)}

`;

      // Add CtQ factors
      const factors = data.ctqFactors.filter(factor => factor.objectiveId === obj.id);
      if (factors.length > 0) {
        content += `**Critical-to-Quality Factors:**\n`;
        factors.forEach(factor => {
          content += `
* **${factor.name}**
  * Associated Section: ${factor.associatedSection || 'Not specified'}
  * Risk Level: ${factor.riskLevel.charAt(0).toUpperCase() + factor.riskLevel.slice(1)}
  * Description: ${factor.description}
  * Mitigation: ${factor.mitigation || 'Not specified'}
`;
        });
      } else {
        content += `No Critical-to-Quality factors defined for this objective.\n`;
      }
    });

    // Add remaining sections
    content += `
## 3. Quality Risk Management

The Critical-to-Quality factors identified above form the basis of our risk-based approach to quality management throughout the clinical evaluation process. Each factor has been assessed for risk level and appropriate mitigation strategies have been implemented.

## 4. Monitoring and Continuous Improvement

Quality monitoring will be conducted continuously throughout the clinical evaluation process. Regular quality reviews will be conducted at key milestones, with a comprehensive review prior to finalization of the CER.

## 5. Compliance Statement

This Quality Management Plan complies with:
- ICH E6(R3) Good Clinical Practice
- EU MDR 2017/745 Quality Management System requirements
- ISO 14155:2020 Clinical investigation of medical devices for human subjects
- MEDDEV 2.7/1 Rev 4 Clinical Evaluation guidance

_Document Generated: ${new Date().toLocaleDateString()}_
`;

    return content;
  }
}

/**
 * Validate QMP against ICH E6(R3) requirements
 */
async function validateQMP(data) {
  try {
    // Use GPT-4o for QMP validation
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a regulatory expert specializing in ICH E6(R3) and EU MDR 2017/745 compliance. 
          Your task is to validate a medical device Quality Management Plan (QMP) against regulatory requirements.
          Analyze the provided objectives and critical-to-quality factors and identify any gaps or issues.
          
          Provide the following validation outputs:
          1. An overall compliance score (0-100%)
          2. Identification of any gaps in compliance with ICH E6(R3)
          3. Specific recommendations for improvement
          4. Analysis of risk coverage across the clinical evaluation process
          5. Assessment of whether critical areas (data integrity, regulatory compliance, clinical evidence quality) are addressed
          
          Format the response as a JSON object with the following structure:
          {
            "score": number,
            "compliant": boolean,
            "gaps": string[],
            "recommendations": string[],
            "riskCoverage": {
              "dataIntegrity": boolean,
              "regulatoryCompliance": boolean,
              "clinicalEvidence": boolean,
              "postMarketSurveillance": boolean,
              "literatureReview": boolean
            },
            "summary": string
          }`
        },
        {
          role: "user",
          content: JSON.stringify(data)
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
      max_tokens: 1500
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error validating QMP with OpenAI:', error);
    // Return a basic validation result if OpenAI fails
    return {
      score: 0,
      compliant: false,
      gaps: ["Unable to validate due to API error"],
      recommendations: ["Try again later or validate manually"],
      riskCoverage: {
        dataIntegrity: false,
        regulatoryCompliance: false,
        clinicalEvidence: false,
        postMarketSurveillance: false,
        literatureReview: false
      },
      summary: "Validation could not be completed due to an error."
    };
  }
}

module.exports = router;