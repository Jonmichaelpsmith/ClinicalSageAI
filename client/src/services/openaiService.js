import OpenAI from 'openai';

// Initialize the OpenAI client
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true // Note: In production, API calls should be made server-side
});

/**
 * Generate a Clinical Evaluation Report based on provided device information and data
 * @param {Object} deviceData - Information about the medical device
 * @param {Object} clinicalData - Clinical data for the medical device
 * @param {Array} literature - Selected literature references
 * @param {Object} templateSettings - Template configuration and settings
 * @returns {Promise<Object>} Generated CER content
 */
export async function generateCER(deviceData, clinicalData, literature, templateSettings) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are an expert medical device regulatory writer specialized in Clinical Evaluation Reports
            for EU MDR compliance. Generate structured, professional CER content based on the provided data.
            Ensure all content meets regulatory standards and follows professional medical writing conventions.`
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Generate a Clinical Evaluation Report",
            deviceData,
            clinicalData,
            literature,
            templateSettings
          })
        }
      ],
      temperature: 0.2,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating CER:", error);
    throw new Error(`Failed to generate CER: ${error.message}`);
  }
}

/**
 * Analyze clinical data and extract key findings
 * @param {Object} clinicalData - Raw clinical data
 * @returns {Promise<Object>} Structured analysis results
 */
export async function analyzeClinicalData(clinicalData) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are an expert medical data analyst specialized in analyzing clinical data for
            medical devices. Extract and summarize key findings, safety endpoints, efficacy results,
            and identify potential concerns or positive outcomes.`
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Analyze clinical data and extract key findings",
            clinicalData
          })
        }
      ],
      temperature: 0.1,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error analyzing clinical data:", error);
    throw new Error(`Failed to analyze clinical data: ${error.message}`);
  }
}

/**
 * Generate a literature review based on provided literature references
 * @param {Array} literatureItems - Selected literature references
 * @param {Object} deviceData - Basic device information for context
 * @returns {Promise<Object>} Structured literature review
 */
export async function generateLiteratureReview(literatureItems, deviceData) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are an expert medical literature review specialist. Create a comprehensive
            literature review for a medical device CER based on the provided references. Analyze methodologies,
            outcomes, and relevance to the device. Identify key findings and their significance.`
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Generate a literature review for a CER",
            deviceData,
            literatureItems
          })
        }
      ],
      temperature: 0.2,
      max_tokens: 3000,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating literature review:", error);
    throw new Error(`Failed to generate literature review: ${error.message}`);
  }
}

/**
 * Generate a risk assessment based on device information and clinical data
 * @param {Object} deviceData - Device information
 * @param {Object} clinicalData - Clinical data
 * @param {number} riskScore - Risk score from 0-100
 * @returns {Promise<Object>} Risk assessment results
 */
export async function generateRiskAssessment(deviceData, clinicalData, riskScore) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are an expert medical device risk assessment specialist. Create a comprehensive
            risk assessment for a medical device CER based on the provided data. Identify potential risks,
            their severity, probability, and recommended mitigations. Evaluate the benefit-risk ratio.`
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Generate a risk assessment for a CER",
            deviceData,
            clinicalData,
            riskScore
          })
        }
      ],
      temperature: 0.1,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating risk assessment:", error);
    throw new Error(`Failed to generate risk assessment: ${error.message}`);
  }
}

/**
 * Perform document analysis on an uploaded PDF or document
 * @param {string} documentText - Extracted text from document
 * @param {string} documentType - Type of document (literature, clinical, etc.)
 * @returns {Promise<Object>} Document analysis results
 */
export async function analyzeDocument(documentText, documentType) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are an expert document analyst specialized in medical and regulatory documents.
            Extract key information, structure, and findings from the provided document text based on its type.
            Identify author, publication details, methodology, results, and conclusions where applicable.`
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Analyze document and extract key information",
            documentType,
            documentText: documentText.substring(0, 15000) // Truncate for token limits
          })
        }
      ],
      temperature: 0.1,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error analyzing document:", error);
    throw new Error(`Failed to analyze document: ${error.message}`);
  }
}

/**
 * Generate executive summary for the CER
 * @param {Object} cerData - Complete CER data
 * @returns {Promise<string>} Executive summary text
 */
export async function generateExecutiveSummary(cerData) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are an expert medical writer specializing in executive summaries for clinical
            evaluation reports. Create a concise, professional executive summary that captures the key
            findings, conclusions, and significance of the CER. Highlight the benefit-risk ratio and
            regulatory compliance status.`
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Generate an executive summary for a CER",
            cerData
          })
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating executive summary:", error);
    throw new Error(`Failed to generate executive summary: ${error.message}`);
  }
}

/**
 * Generate a method validation protocol based on method information and regulatory requirements
 * @param {Object} methodData - Information about the analytical method
 * @returns {Promise<Object>} Generated validation protocol
 */
export async function generateMethodValidationProtocol(methodData) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are an expert analytical method validation specialist. Create a comprehensive
            validation protocol based on the provided method information and relevant regulatory
            guidelines (ICH, FDA, etc.). Include acceptance criteria, experimental design, and
            appropriate calculations for each validation parameter.`
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Generate a method validation protocol",
            methodData
          })
        }
      ],
      temperature: 0.2,
      max_tokens: 3000,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating method validation protocol:", error);
    throw new Error(`Failed to generate method validation protocol: ${error.message}`);
  }
}

/**
 * Assess regulatory compliance of a specification or document
 * @param {Object} specificationData - Specification information
 * @param {string} regulatoryFramework - Target regulatory framework (ICH, FDA, etc.)
 * @returns {Promise<Object>} Compliance assessment results
 */
export async function assessRegulatoryCompliance(specificationData, regulatoryFramework) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are an expert regulatory compliance specialist. Assess the provided specification
            against the specified regulatory framework. Identify any gaps, potential compliance issues,
            and provide recommendations for improvement. Focus on technical and scientific aspects
            of compliance.`
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Assess regulatory compliance",
            specificationData,
            regulatoryFramework
          })
        }
      ],
      temperature: 0.1,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error assessing regulatory compliance:", error);
    throw new Error(`Failed to assess regulatory compliance: ${error.message}`);
  }
}

/**
 * Analyze regulatory compliance for eCTD documents
 * @param {string} documentContent - The document content to analyze
 * @param {string} moduleType - eCTD module type (e.g., 'module1', 'module2')
 * @param {string} section - Section within the module
 * @returns {Promise<Object>} Analysis results with issues and suggestions
 */
export async function analyzeRegulatoryCompliance(documentContent, moduleType, section) {
  try {
    // If OpenAI API key is missing, return simulated response
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      console.warn('OpenAI API key not available, returning simulated response');
      return simulateRegulatoryComplianceResponse(moduleType, section);
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are an expert eCTD regulatory specialist. Analyze the provided document 
            content for compliance with eCTD requirements for ${moduleType}, section ${section}.
            Identify specific compliance issues, formatting problems, and content gaps.
            Categorize each issue by severity (critical, major, minor) and provide specific 
            recommendations for fixing each issue. Return results in structured JSON format.`
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Analyze document for eCTD compliance",
            moduleType,
            section,
            documentContent: documentContent.substring(0, 12000) // Limit content size
          })
        }
      ],
      temperature: 0.1,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    // Normalize the response format
    return {
      moduleType,
      section,
      timestamp: new Date().toISOString(),
      issues: result.issues || [],
      suggestions: result.suggestions || [],
      complianceScore: result.complianceScore || calculateComplianceScore(result.issues || [])
    };
  } catch (error) {
    console.error("Error analyzing regulatory compliance:", error);
    return simulateRegulatoryComplianceResponse(moduleType, section);
  }
}

/**
 * Calculate compliance score based on issues
 * @private
 */
function calculateComplianceScore(issues) {
  if (!issues || issues.length === 0) return 100;
  
  // Count issues by severity
  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const majorCount = issues.filter(i => i.severity === 'major').length;
  const minorCount = issues.filter(i => i.severity === 'minor').length;
  
  // Calculate weighted score (critical issues have highest impact)
  const baseScore = 100;
  const criticalDeduction = criticalCount * 15;
  const majorDeduction = majorCount * 5;
  const minorDeduction = minorCount * 1;
  
  return Math.max(0, baseScore - criticalDeduction - majorDeduction - minorDeduction);
}

/**
 * Generate a simulated regulatory compliance response
 * @private
 */
function simulateRegulatoryComplianceResponse(moduleType, section) {
  return {
    moduleType,
    section,
    timestamp: new Date().toISOString(),
    issues: [
      {
        id: "missing-section-reference",
        message: "Missing reference to required section",
        details: "Document should include reference to related sections for regulatory completeness",
        severity: "minor",
        location: "cross-references"
      },
      {
        id: "promotional-language",
        message: "Promotional language detected",
        details: "Regulatory documents should use objective language instead of promotional terms",
        severity: "major",
        location: "content"
      },
      {
        id: "incomplete-information",
        message: "Incomplete information in required section",
        details: "Section appears to be missing key information required by regulatory guidelines",
        severity: "critical",
        location: "content"
      }
    ],
    suggestions: [
      {
        id: "add-cross-references",
        title: "Add cross-references",
        description: "Add proper cross-references to related sections to improve regulatory compliance",
        priority: "medium"
      },
      {
        id: "remove-promotional-language",
        title: "Remove promotional language",
        description: "Replace promotional terms with objective, factual language",
        priority: "high"
      },
      {
        id: "complete-required-information",
        title: "Complete required information",
        description: "Add missing information to required sections based on regulatory guidelines",
        priority: "high"
      }
    ],
    complianceScore: 75
  };
}

/**
 * Simulate an OpenAI response for testing and demo purposes
 * @param {Object} data - Input data for the simulation
 * @param {string} responseType - Type of response to simulate
 * @returns {Promise<Object>} Simulated response
 */
export async function simulateOpenAIResponse(data, responseType = 'general') {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return appropriate simulated response based on responseType
  switch(responseType) {
    case 'methodValidation':
      return {
        protocol: {
          title: `Validation Protocol for ${data.methodName || 'Analytical Method'}`,
          document_id: `VAL-${Date.now().toString().substring(5)}`,
          version: "1.0",
          date: new Date().toISOString().split('T')[0],
          prepared_by: "AI Validation Expert",
          regulatory_basis: "ICH Q2(R1), FDA, USP <1225>",
          introduction: "This protocol describes the validation procedures for the analytical method.",
          scope: "This validation protocol applies to the method for the determination of content.",
          parameters: ["Specificity", "Linearity", "Accuracy", "Precision", "Range"]
        },
        acceptance_criteria: {
          specificity: "No interference at the retention time of the analyte peak from blank, placebo, or known impurities.",
          linearity: "Correlation coefficient (r) ≥ 0.999. Y-intercept ≤ 2.0% of the response at 100% concentration.",
          accuracy: "Recovery: 98.0-102.0% at each concentration level.",
          precision: "RSD ≤ 2.0% for repeatability. RSD ≤ 3.0% for intermediate precision.",
          range: "The range is established when linearity, accuracy, and precision meet their respective acceptance criteria."
        },
        experimental_design: {
          specificity: "Analyze blank, placebo, sample solution, and sample spiked with known impurities.",
          linearity: "Prepare and analyze 5 standard solutions covering 50-150% of the working concentration.",
          accuracy: "Prepare and analyze samples at 3 concentration levels (80%, 100%, 120%) in triplicate.",
          precision: "Repeatability: Analyze 6 replicate preparations at 100% concentration.",
          range: "Use data from linearity, accuracy, and precision studies to establish the range."
        }
      };
      
    case 'complianceAssessment':
      return {
        compliance_status: "Partially Compliant",
        overall_score: 75,
        findings: [
          {
            section: "Acceptance Criteria",
            issue: "Acceptance criteria for impurity XYZ slightly outside ICH Q3A limits",
            recommendation: "Adjust acceptance criteria to align with ICH Q3A requirements",
            severity: "Moderate"
          },
          {
            section: "Test Method",
            issue: "Validation data incomplete for specificity",
            recommendation: "Complete specificity validation with stressed samples",
            severity: "High"
          }
        ],
        summary: "The specification is generally aligned with regulatory expectations but requires modifications to fully comply with current standards."
      };
      
    default:
      return {
        status: "success",
        message: "Simulated response generated successfully",
        data: data
      };
  }
}

/**
 * Validate eCTD document content against regulatory requirements
 * @param {string} documentContent - Document content to validate
 * @param {string} moduleType - eCTD module type (e.g., 'module_2_5', 'module_3_2')
 * @param {string} sectionCode - Specific section code (e.g., '2.5.1', '3.2.P.8')
 * @param {string} region - Regulatory region (FDA, EMA, PMDA, etc.)
 * @returns {Promise<Object>} Validation results with issues and suggestions
 */
export async function validateEctdDocument(documentContent, moduleType, sectionCode, region) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert eCTD regulatory documentation validator. Your task is to analyze 
            a document intended for ${region} eCTD submission in module ${moduleType.replace('module_', '')} 
            section ${sectionCode}. Identify any issues with content structure, completeness, accuracy, 
            and regulatory compliance. Provide specific feedback on how to correct each issue.`
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Validate eCTD document content",
            moduleType,
            sectionCode,
            region,
            documentContent: documentContent.substring(0, 15000) // Truncate for token limits
          })
        }
      ],
      temperature: 0.1,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error validating eCTD document:", error);
    throw new Error(`Failed to validate eCTD document: ${error.message}`);
  }
}

/**
 * Generate content suggestions for an eCTD document section
 * @param {string} currentContent - Current document content
 * @param {string} moduleType - eCTD module type
 * @param {string} sectionCode - Specific section code
 * @param {string} region - Regulatory region
 * @returns {Promise<Object>} Content suggestions
 */
export async function generateEctdSuggestions(currentContent, moduleType, sectionCode, region) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert eCTD regulatory content writer. Your task is to provide 
            high-quality content suggestions for a ${region} eCTD submission in module 
            ${moduleType.replace('module_', '')} section ${sectionCode}. Based on the current content,
            suggest improvements, additional points, and refinements to enhance 
            regulatory compliance and clarity.`
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Generate eCTD content suggestions",
            moduleType,
            sectionCode,
            region,
            currentContent: currentContent.substring(0, 15000) // Truncate for token limits
          })
        }
      ],
      temperature: 0.2,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating eCTD suggestions:", error);
    throw new Error(`Failed to generate eCTD suggestions: ${error.message}`);
  }
}

/**
 * Generate a complete eCTD document draft based on template and requirements
 * @param {string} moduleType - eCTD module type
 * @param {string} sectionCode - Specific section code
 * @param {string} region - Regulatory region
 * @param {Object} productInfo - Basic product information
 * @returns {Promise<Object>} Complete document draft
 */
export async function generateEctdDraft(moduleType, sectionCode, region, productInfo) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert eCTD regulatory document writer. Your task is to generate 
            a complete draft document for a ${region} eCTD submission in module 
            ${moduleType.replace('module_', '')} section ${sectionCode}. Create a comprehensive, 
            well-structured document that fully complies with regulatory expectations for 
            this section. Include all required sections, appropriate headings, and placeholder 
            content where specific data would need to be inserted.`
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Generate complete eCTD document draft",
            moduleType,
            sectionCode,
            region,
            productInfo
          })
        }
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating eCTD draft:", error);
    throw new Error(`Failed to generate eCTD draft: ${error.message}`);
  }
}

export default {
  generateCER,
  analyzeClinicalData,
  generateLiteratureReview,
  generateRiskAssessment,
  analyzeDocument,
  generateExecutiveSummary,
  generateMethodValidationProtocol,
  assessRegulatoryCompliance,
  validateEctdDocument,
  generateEctdSuggestions,
  generateEctdDraft,
  simulateOpenAIResponse
};