/**
 * CER QMP Integration API Routes
 * 
 * This module provides API endpoints for generating CER sections with integrated
 * Quality Management Plan (QMP) data based on ICH E6(R3) principles.
 * 
 * The API uses GPT-4o to embed risk-based quality principles directly into the
 * generated content, ensuring regulatory compliance with ICH E6(R3) and EU MDR 2017/745.
 */

const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// Initialize OpenAI with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate a QMP-integrated CER section
 * POST /api/cer/generate-qmp-section
 */
router.post('/generate-qmp-section', async (req, res) => {
  try {
    const { section, context, qmpData, criticalFactors, regulatoryFramework } = req.body;
    
    if (!section) {
      return res.status(400).json({
        success: false,
        error: 'Section type is required'
      });
    }
    
    if (!qmpData) {
      return res.status(400).json({
        success: false,
        error: 'QMP data is required for ICH E6(R3) integration'
      });
    }
    
    // Format context for the section generation prompt
    const sectionContext = context || '';
    const regulatoryContext = regulatoryFramework || 'EU MDR';
    
    // Format critical factors information
    const ctqContext = criticalFactors && criticalFactors.length > 0 
      ? formatCriticalFactors(criticalFactors)
      : 'No specific Critical-to-Quality factors identified for this section.';
    
    // Use OpenAI GPT-4o to generate the section with integrated QMP principles
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert medical device regulatory writer specializing in Clinical Evaluation Reports (CER) with integrated
          ICH E6(R3) Quality Management principles. Your task is to generate a CER section that incorporates risk-based
          quality management principles throughout the content.
          
          For this section (${section}), carefully consider:
          1. The Critical-to-Quality (CtQ) factors that impact this section's content quality and reliability
          2. ICH E6(R3) principles relevant to this type of content
          3. Risk-based approach to quality management
          4. Data integrity and reliability considerations
          5. EU MDR 2017/745 or other relevant regulatory requirements
          
          The generated content should:
          - Be professional, detailed, and appropriate for direct inclusion in a regulatory submission
          - Include specific subsections that address quality management aspects of the content
          - Reference and address the specific Critical-to-Quality factors and risks provided
          - Maintain full compliance with ${regulatoryContext} requirements
          - Include appropriate references to quality system standards
          - Be comprehensive yet concise (approximately 600-1000 words)
          
          Format your response in well-structured Markdown without any introductory or concluding remarks.`
        },
        {
          role: "user",
          content: `I need to generate the "${section}" section of a CER with ICH E6(R3) quality management integration.
          
          Context information for this section:
          ${sectionContext}
          
          Quality Management Plan information:
          ${formatQMPData(qmpData)}
          
          Critical-to-Quality Factors specific to this section:
          ${ctqContext}
          
          Regulatory Context: ${regulatoryContext}
          
          Please generate a comprehensive, submission-ready section that integrates quality management principles.`
        }
      ],
      temperature: 0.2,
      max_tokens: 3000
    });
    
    const content = response.choices[0].message.content;
    
    // Format the response
    res.json({
      success: true,
      section: {
        title: formatSectionTitle(section),
        type: section,
        content: content,
        hasQmpIntegration: true,
        regulatoryFramework: regulatoryFramework,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating QMP-integrated section:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate QMP-integrated section',
      details: error.message
    });
  }
});

/**
 * Validate CER against ICH E6(R3) quality management principles
 * POST /api/cer/validate-qmp-compliance
 */
router.post('/validate-qmp-compliance', async (req, res) => {
  try {
    const { documentId, sections, qmpData } = req.body;
    
    if (!sections || sections.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Document sections are required for validation'
      });
    }
    
    if (!qmpData) {
      return res.status(400).json({
        success: false,
        error: 'QMP data is required for ICH E6(R3) validation'
      });
    }
    
    // Prepare sections summary for validation
    const sectionsSummary = sections.map(s => ({
      title: s.title || s.name || 'Untitled Section',
      content: s.content ? (s.content.length > 250 ? s.content.substring(0, 250) + '...' : s.content) : 'No content'
    }));
    
    // Use OpenAI GPT-4o to validate compliance with ICH E6(R3) principles
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert regulatory validator specialized in ICH E6(R3) quality management principles.
          Your task is to validate a Clinical Evaluation Report (CER) for compliance with ICH E6(R3) quality
          management principles and identify any gaps or issues.
          
          Focus on these key areas:
          1. Integration of risk-based quality management throughout the document
          2. Addressing Critical-to-Quality factors in appropriate sections
          3. Quality control measures for clinical data and literature
          4. Evidence of quality system integration
          5. Documentation of quality monitoring processes
          
          Provide a detailed validation report with specific findings, compliance score, and recommendations.
          Format your response as a JSON object.`
        },
        {
          role: "user",
          content: JSON.stringify({
            sections: sectionsSummary,
            qmpData: qmpData
          })
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
      max_tokens: 2000
    });
    
    const validationResults = JSON.parse(response.choices[0].message.content);
    
    res.json({
      success: true,
      validationResults
    });
  } catch (error) {
    console.error('Error validating QMP compliance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate QMP compliance',
      details: error.message
    });
  }
});

/**
 * Format a section title based on the section type
 * @param {string} sectionType - The type of section
 * @returns {string} - Formatted section title
 */
function formatSectionTitle(sectionType) {
  // Convert kebab-case or snake_case to Title Case with spaces
  let title = sectionType
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Handle camelCase
    .replace(/\b\w/g, c => c.toUpperCase()); // Title Case
  
  // Special case handling for common abbreviations
  title = title
    .replace(/\bCer\b/gi, 'CER')
    .replace(/\bEu\b/gi, 'EU')
    .replace(/\bMdr\b/gi, 'MDR')
    .replace(/\bQms\b/gi, 'QMS')
    .replace(/\bIch\b/gi, 'ICH')
    .replace(/\bSota\b/gi, 'SOTA')
    .replace(/\bGspr\b/gi, 'GSPR');
  
  return title;
}

/**
 * Format QMP data for inclusion in the prompt
 * @param {Object} qmpData - The QMP data
 * @returns {string} - Formatted QMP information
 */
function formatQMPData(qmpData) {
  if (!qmpData) return 'No QMP data available.';
  
  let formattedData = '';
  
  // Format objectives
  if (qmpData.objectives && qmpData.objectives.length > 0) {
    formattedData += 'Quality Objectives:\n';
    qmpData.objectives.forEach((obj, idx) => {
      formattedData += `${idx + 1}. ${obj.title}: ${obj.description}\n`;
    });
    formattedData += '\n';
  }
  
  // Format risk assessments
  if (qmpData.riskAssessments && qmpData.riskAssessments.length > 0) {
    formattedData += 'Risk Assessments:\n';
    qmpData.riskAssessments.forEach((risk, idx) => {
      formattedData += `${idx + 1}. ${risk.title} (Risk Level: ${risk.riskLevel}): ${risk.description}\n`;
      formattedData += `   Mitigation: ${risk.mitigationStrategy || 'Not specified'}\n`;
    });
    formattedData += '\n';
  }
  
  // Format CtQ factors
  if (qmpData.ctqFactors && qmpData.ctqFactors.length > 0) {
    formattedData += 'Critical-to-Quality Factors:\n';
    qmpData.ctqFactors.forEach((factor, idx) => {
      formattedData += `${idx + 1}. ${factor.name} (Risk Level: ${factor.riskLevel}): ${factor.description}\n`;
      formattedData += `   Associated Section: ${factor.associatedSection || 'Not specified'}\n`;
    });
  }
  
  return formattedData;
}

/**
 * Format critical factors for inclusion in the prompt
 * @param {Array} factors - The critical factors
 * @returns {string} - Formatted critical factors information
 */
function formatCriticalFactors(factors) {
  if (!factors || factors.length === 0) {
    return 'No Critical-to-Quality factors specified for this section.';
  }
  
  let formatted = 'The following Critical-to-Quality factors have been identified for this section:\n\n';
  
  factors.forEach((factor, idx) => {
    formatted += `${idx + 1}. ${factor.name} (Risk Level: ${factor.riskLevel})\n`;
    formatted += `   Description: ${factor.description}\n`;
    formatted += `   Mitigation Strategy: ${factor.mitigation || 'Not specified'}\n\n`;
  });
  
  return formatted;
}

/**
 * Generate a regulatory traceability report for CtQ factors
 * POST /api/cer-qmp-integration/traceability-report
 */
router.post('/traceability-report', async (req, res) => {
  try {
    const { deviceName, qmpData, sectionTitles } = req.body;
    
    if (!qmpData || !qmpData.ctqFactors || qmpData.ctqFactors.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Critical-to-Quality factors are required for traceability report generation'
      });
    }
    
    // Format the CtQ factor data for the report
    const ctqFactorSummary = qmpData.ctqFactors.map(factor => {
      // Get associated objective
      const objective = qmpData.objectives ? 
        qmpData.objectives.find(obj => obj.id === factor.objectiveId) : null;
      
      // Check if the factor has linked sections
      const linkedSections = sectionTitles ? sectionTitles.filter(title => {
        const sectionTitle = (title || '').toLowerCase();
        const associatedSection = (factor.associatedSection || '').toLowerCase();
        return sectionTitle.includes(associatedSection) || associatedSection.includes(sectionTitle);
      }) : [];
      
      return {
        name: factor.name,
        description: factor.description,
        riskLevel: factor.riskLevel,
        associatedSection: factor.associatedSection,
        objectiveTitle: objective ? objective.title : 'Unknown objective',
        status: factor.status || 'pending',
        complianceStatus: factor.complianceStatus || { ich: 'pending', mdr: 'pending' },
        linkedSectionCount: linkedSections.length,
        linkedSections: linkedSections,
        verificationActivities: factor.verificationActivities || [],
        controls: factor.controls || []
      };
    });
    
    // Use OpenAI to generate a comprehensive traceability report
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Using the latest model for comprehensive analysis
      messages: [
        {
          role: "system",
          content: `You are a regulatory documentation specialist with expertise in clinical evaluation reporting, ICH E6(R3), and EU MDR requirements.
          
          Your task is to generate a comprehensive regulatory traceability report section for a Clinical Evaluation Report (CER). This report must document how 
          Critical-to-Quality (CtQ) factors identified in the Quality Management Plan are traced, monitored, and controlled throughout 
          the clinical evaluation process.
          
          The report should follow these principles:
          1. It must be written in a formal, regulatory-appropriate language suitable for EU MDR submissions
          2. It must emphasize the systematic approach to quality management in line with ICH E6(R3) principles
          3. It must provide clear evidence of traceability between requirements and implemented controls
          4. It should address both ICH E6(R3) and EU MDR/MEDDEV 2.7/1 Rev 4 requirements
          5. It should include appropriate section headers and formatting for a professional document
          
          The report should include these sections:
          1. Introduction & Scope
          2. Quality Management Approach (ICH E6(R3) alignment)
          3. Critical-to-Quality Factors Identification
          4. Monitoring & Control Measures
          5. Regulatory Framework Compliance (EU MDR & ICH E6(R3))
          6. Verification & Evidence Collection
          7. Conclusion`
        },
        {
          role: "user",
          content: `Generate a comprehensive regulatory traceability report for a Clinical Evaluation Report for the device: "${deviceName}".
          
          The Critical-to-Quality factors data is provided below:
          ${JSON.stringify(ctqFactorSummary, null, 2)}
          
          The report should demonstrate how these CtQ factors are monitored and controlled throughout the clinical evaluation process,
          providing clear evidence of traceability for both ICH E6(R3) and EU MDR regulatory frameworks.`
        }
      ],
      temperature: 0.1, // Using lower temperature for more factual output
      max_tokens: 3000 // Allowing substantial space for a comprehensive report
    });
    
    const reportContent = completion.choices[0].message.content;
    
    // Format the response
    res.json({
      success: true,
      reportSection: {
        title: "Regulatory Traceability Matrix Report",
        type: "traceability-report",
        content: reportContent,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating traceability report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate traceability report',
      details: error.message
    });
  }
});

module.exports = router;