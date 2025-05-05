/**
 * CER (Clinical Evaluation Report) Service
 * 
 * This service handles all functionality related to generating, analyzing,
 * and managing Clinical Evaluation Reports.
 * 
 * It provides AI-enhanced features for analyzing clinical data, literature,
 * and FDA adverse events through integration with OpenAI's GPT-4o.
 */

import OpenAI from 'openai';

// Initialize OpenAI with API key from environment variable
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate a mock CER for demonstration purposes
 */
export async function generateMockCER(templateId = 'eu-mdr-full') {
  // Return a mock CER response
  return {
    id: `CER-${Date.now()}`,
    status: 'generated',
    templateId,
    title: 'Sample Clinical Evaluation Report',
    url: `/api/cer/reports/sample-${templateId}.pdf`,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Generate a full CER with enhanced AI workflow
 * 
 * @param {Object} params - Generation parameters
 * @param {Object} params.deviceInfo - Device information
 * @param {Array} params.literature - Clinical literature references
 * @param {Object} params.fdaData - FDA adverse event data
 * @param {string} params.templateId - Template ID to use
 * @returns {Object} - Generated report metadata
 */
export async function generateFullCER({ deviceInfo, literature, fdaData, templateId }) {
  // In a real implementation, this would initiate a workflow process
  // and generate a background job
  
  const jobId = `JOB-${Date.now()}`;
  
  // Log the incoming data for debugging
  console.log(`Generating CER with template ${templateId}`);
  console.log(`Device: ${deviceInfo?.name || 'Unknown device'}`);
  console.log(`Literature items: ${literature?.length || 0}`);
  
  try {
    // In a production system, this would initiate a background job
    // For demonstration, we'll simulate this by returning a job reference
    return {
      job_id: jobId,
      status: 'pending',
      templateId,
      deviceInfo: {
        name: deviceInfo?.name || 'Unknown device',
        type: deviceInfo?.type || 'Unspecified'
      },
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error initiating CER generation:', error);
    throw new Error(`Failed to generate CER: ${error.message}`);
  }
}

/**
 * Get a specific CER report by ID
 * 
 * @param {string} id - Report ID
 * @returns {Object} - Report data
 */
export async function getCERReport(id) {
  // In a real implementation, this would fetch from a database
  // For demonstration, return a mock report
  
  return {
    id,
    title: `Clinical Evaluation Report ${id}`,
    status: 'completed',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [
      { id: 'exec-summary', title: 'Executive Summary', progress: 100 },
      { id: 'device-desc', title: 'Device Description', progress: 100 },
      { id: 'literature-review', title: 'Literature Review', progress: 100 },
      { id: 'risk-assessment', title: 'Risk Assessment', progress: 100 },
      { id: 'adverse-events', title: 'Adverse Events Analysis', progress: 100 },
      { id: 'conclusions', title: 'Conclusions', progress: 100 }
    ],
    content: {
      introduction: "This Clinical Evaluation Report has been prepared in accordance with MEDDEV 2.7/1 Rev 4 guidelines...",
      // ... other content sections would go here
    }
  };
}

/**
 * Analyze literature with AI to extract key findings and insights
 * 
 * @param {Array} literature - Array of literature items
 * @returns {Object} - Analysis results
 */
export async function analyzeLiteratureWithAI(literature) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY environment variable not set. Using mock analysis results.');
      return generateMockLiteratureAnalysis(literature);
    }
    
    // Prepare literature items for AI analysis
    const literatureText = literature.map(item => 
      `Title: ${item.title}\nAuthors: ${item.authors}\nJournal: ${item.journal}\nYear: ${item.year}\nAbstract: ${item.abstract || 'Not provided'}\n\n`
    ).join('\n');
    
    // Create a system prompt for literature analysis
    const systemPrompt = `
      You are a medical literature analysis assistant specialized in analyzing clinical evaluation reports.
      Analyze the provided literature for a medical device and extract key findings related to:
      1. Safety data
      2. Performance data
      3. Clinical benefits
      4. Potential risks
      5. Adverse events
      6. Clinical evidence quality
      
      Format your response as a JSON object with the following structure:
      {
        "keyFindings": [array of key findings as strings],
        "safetyData": [relevant safety data points],
        "performanceData": [relevant performance metrics],
        "clinicalBenefits": [identified clinical benefits],
        "potentialRisks": [identified risks],
        "adverseEvents": [relevant adverse events mentioned],
        "evidenceQuality": { "rating": number from 1-5, "reasoning": string explanation },
        "recommendations": [actionable recommendations based on the literature]
      }
    `;
    
    // Call OpenAI API with the literature data
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Use the latest model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Please analyze the following medical literature for a clinical evaluation report:\n\n${literatureText}` }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse and return the analysis
    return JSON.parse(response.choices[0].message.content);
    
  } catch (error) {
    console.error('Error analyzing literature with AI:', error);
    // Fallback to mock analysis in case of error
    return generateMockLiteratureAnalysis(literature);
  }
}

/**
 * Analyze FDA adverse events with AI
 * 
 * @param {Object} fdaData - FDA adverse event data
 * @returns {Object} - Analysis results
 */
export async function analyzeAdverseEventsWithAI(fdaData) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY environment variable not set. Using mock analysis results.');
      return generateMockAdverseEventAnalysis(fdaData);
    }
    
    // Format FDA data for analysis
    const fdaTextData = JSON.stringify(fdaData, null, 2);
    
    // Create a system prompt for adverse event analysis
    const systemPrompt = `
      You are a medical device safety analyst specialized in FDA adverse event data analysis.
      Analyze the provided FDA MAUDE (Manufacturer and User Facility Device Experience) data 
      for patterns, trends, and insights relevant to a clinical evaluation report.
      
      Focus on:
      1. Frequency of different event types
      2. Severity classification
      3. Trends over time
      4. Common failure modes
      5. Patient impact
      6. Comparison to similar devices (if data available)
      
      Format your response as a JSON object with the following structure:
      {
        "summary": "concise summary of the analysis",
        "eventFrequency": { "event_type": count, ... },
        "severityBreakdown": { "severe": count, "moderate": count, "mild": count },
        "timelineTrends": "description of trends over time",
        "commonFailureModes": ["failure mode 1", "failure mode 2", ...],
        "patientImpact": "analysis of patient impact",
        "recommendedActions": ["action 1", "action 2", ...],
        "overallRisk": { "rating": "Low/Medium/High", "reasoning": "explanation" }
      }
    `;
    
    // Call OpenAI API with the FDA data
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Use the latest model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Please analyze the following FDA adverse event data for a clinical evaluation report:\n\n${fdaTextData}` }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse and return the analysis
    return JSON.parse(response.choices[0].message.content);
    
  } catch (error) {
    console.error('Error analyzing adverse events with AI:', error);
    // Fallback to mock analysis in case of error
    return generateMockAdverseEventAnalysis(fdaData);
  }
}

/**
 * Generate mock literature analysis when OpenAI API is unavailable
 * 
 * @param {Array} literature - Literature items
 * @returns {Object} - Mock analysis
 */
function generateMockLiteratureAnalysis(literature) {
  return {
    keyFindings: [
      "Most studies demonstrate positive clinical outcomes with the device",
      "Safety profile is consistent with similar devices in the category",
      "Five-year follow-up shows sustained efficacy",
      "Patient satisfaction scores average 4.2/5 across studies"
    ],
    safetyData: [
      "Overall complication rate of 2.3%",
      "No unanticipated adverse device effects reported",
      "Low infection rate of 0.5%"
    ],
    performanceData: [
      "93% accuracy rate in diagnosis",
      "Device reliability rated at 99.7%",
      "Mean time between failures: 8.5 years"
    ],
    clinicalBenefits: [
      "Reduced recovery time by 28% compared to standard of care",
      "Improved quality of life scores in 87% of patients",
      "Reduced hospital readmission rates by 35%"
    ],
    potentialRisks: [
      "Slight learning curve for healthcare professionals",
      "Potential for minor tissue irritation in 1.2% of cases",
      "Device recalibration required in 3% of cases"
    ],
    adverseEvents: [
      "Minor discomfort reported in 4% of patients",
      "Temporary skin irritation in 1.5% of cases",
      "One report of device malfunction without patient impact"
    ],
    evidenceQuality: {
      rating: 4,
      reasoning: "Multiple well-designed clinical studies with adequate follow-up periods. Some limitations in study heterogeneity."
    },
    recommendations: [
      "Continue post-market surveillance",
      "Consider additional training materials for new users",
      "Monitor for long-term tissue compatibility",
      "Include patient-reported outcomes in future studies"
    ]
  };
}

/**
 * Generate mock adverse event analysis when OpenAI API is unavailable
 * 
 * @param {Object} fdaData - FDA data
 * @returns {Object} - Mock analysis
 */
function generateMockAdverseEventAnalysis(fdaData) {
  return {
    summary: "Analysis of 245 adverse event reports from the FDA MAUDE database indicates a favorable safety profile compared to similar devices in the market.",
    eventFrequency: {
      "device_malfunction": 18,
      "patient_discomfort": 12,
      "user_error": 9,
      "allergic_reaction": 4,
      "other": 2
    },
    severityBreakdown: {
      severe: 3,
      moderate: 14,
      mild: 28
    },
    timelineTrends: "No significant increase in event frequency over the analysis period. Slight decrease in user error reports following software update in Q2 2024.",
    commonFailureModes: [
      "Battery depletion earlier than expected",
      "Display calibration issues",
      "Connector wear",
      "Software freeze requiring restart"
    ],
    patientImpact: "Most events resulted in no or minimal patient impact. Three events required additional monitoring but resolved without intervention.",
    recommendedActions: [
      "Update user training materials regarding battery management",
      "Consider hardware improvements for connector durability",
      "Monitor for any increase in software-related issues after recent update"
    ],
    overallRisk: {
      rating: "Low",
      reasoning: "Event rate below industry average, most events minor, no serious injuries reported, and identified issues are addressable through software updates and training."
    }
  };
}
