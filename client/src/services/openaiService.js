import OpenAI from 'openai';

// Initialize the OpenAI client
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

export default {
  generateCER,
  analyzeClinicalData,
  generateLiteratureReview,
  generateRiskAssessment,
  analyzeDocument,
  generateExecutiveSummary,
  generateMethodValidationProtocol,
  assessRegulatoryCompliance,
  simulateOpenAIResponse
};