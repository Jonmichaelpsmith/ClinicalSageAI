import OpenAI from 'openai';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Service for interacting with OpenAI APIs to power CER generation features
 */

/**
 * Generate a summary of literature for a given medical device
 * @param {string} deviceName - Name of the medical device
 * @param {string} context - Additional context about the device
 * @returns {Promise<string>} - AI-generated literature summary
 */
async function generateLiteratureSummary(deviceName, context = '') {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert medical device regulatory specialist. Generate a comprehensive literature summary for a Clinical Evaluation Report (CER) about ${deviceName}. 
          Focus on recent clinical studies, safety data, and performance metrics. Include citations in proper format. 
          Ensure the summary meets EU MDR requirements for literature evidence.`
        },
        {
          role: "user",
          content: `Generate a literature summary for ${deviceName}. ${context}`
        }
      ],
      max_tokens: 2000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating literature summary:", error);
    throw new Error(`Failed to generate literature summary: ${error.message}`);
  }
}

/**
 * Generate a risk assessment for a medical device based on FAERS data
 * @param {string} deviceName - Name of the medical device
 * @param {Object} faersData - FAERS data for analysis
 * @returns {Promise<Object>} - AI-generated risk assessment
 */
async function generateRiskAssessment(deviceName, faersData = {}) {
  try {
    // Prepare FAERS data context or use placeholder if not available
    const faersContext = Object.keys(faersData).length > 0 
      ? JSON.stringify(faersData)
      : "No FAERS data available. Generate a simulated risk assessment based on typical device class risks.";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert medical device safety analyst. Generate a detailed risk assessment for a Clinical Evaluation Report about ${deviceName}. 
          Analyze the FAERS data provided to identify safety signals, adverse event patterns, and risk mitigation recommendations. 
          Format the response as a JSON object with these keys: overallRiskScore (number 1-10), safetySignals (array), recommendations (array), and summaryText (string).`
        },
        {
          role: "user",
          content: `Generate a comprehensive risk assessment for ${deviceName} based on this FAERS data: ${faersContext}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating risk assessment:", error);
    throw new Error(`Failed to generate risk assessment: ${error.message}`);
  }
}

/**
 * Generate a complete CER section based on the specified section type
 * @param {string} sectionType - Type of CER section to generate (executive-summary, state-of-art, etc)
 * @param {string} deviceName - Name of the medical device
 * @param {string} context - Additional context for generation
 * @returns {Promise<string>} - AI-generated CER section content
 */
async function generateCERSection(sectionType, deviceName, context = '') {
  // Define section-specific prompts
  const sectionPrompts = {
    'executive-summary': `Generate an executive summary for a Clinical Evaluation Report for ${deviceName}. 
      This should provide a concise overview of the device's clinical evaluation, including key findings, risk-benefit assessment, and regulatory conclusion.`,
    'state-of-art': `Generate a comprehensive State of the Art section for a Clinical Evaluation Report for ${deviceName}. 
      This should describe current clinical practices, alternative devices/treatments, and how this device compares to existing solutions. 
      Include references to medical standards and guidelines.`,
    'risk-benefit': `Generate a detailed Risk-Benefit Analysis section for a Clinical Evaluation Report for ${deviceName}. 
      This should weigh all identified risks against clinical benefits, provide quantitative assessments where possible, and justify the overall conclusion.`,
    'safety-profile': `Generate a Safety Profile section for a Clinical Evaluation Report for ${deviceName}. 
      This should analyze all known adverse events, safety signals from post-market surveillance, and compare safety metrics with similar devices. 
      Include severity and frequency categorizations.`,
    'literature-review': `Generate a Literature Review section for a Clinical Evaluation Report for ${deviceName}. 
      This should summarize relevant clinical literature, critically appraise key studies, and draw conclusions about the device's performance based on published evidence. 
      Include proper citations.`,
    'pms-summary': `Generate a Post-Market Surveillance Summary for a Clinical Evaluation Report for ${deviceName}. 
      This should analyze real-world performance data, complaint records, and ongoing monitoring activities. 
      Identify trends, emerging risks, and areas for improvement.`,
    'recommendations': `Generate a Recommendations section for a Clinical Evaluation Report for ${deviceName}. 
      This should provide specific actions to enhance safety, performance monitoring, label updates, and clinical follow-up measures.`,
  };

  try {
    const prompt = sectionPrompts[sectionType] || `Generate a ${sectionType} section for a Clinical Evaluation Report for ${deviceName}.`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert medical device regulatory writer specializing in Clinical Evaluation Reports that comply with EU MDR requirements.`
        },
        {
          role: "user",
          content: `${prompt} ${context}`
        }
      ],
      max_tokens: 2500,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error(`Error generating ${sectionType} section:`, error);
    throw new Error(`Failed to generate ${sectionType} section: ${error.message}`);
  }
}

/**
 * Perform compliance analysis against regulatory standards
 * @param {string} cerText - The full text of the CER to analyze
 * @param {string} standard - The regulatory standard to check against (EU_MDR, ISO_14155, FDA)
 * @returns {Promise<Object>} - Compliance analysis results
 */
async function analyzeCompliance(cerText, standard = 'EU_MDR') {
  try {
    const standardsPrompts = {
      'EU_MDR': 'Analyze this CER section against EU MDR Annex XIV requirements. Identify any gaps, non-compliant language, or missing elements.',
      'ISO_14155': 'Analyze this CER section against ISO 14155 requirements for clinical evidence. Identify any non-compliant approaches or missing methodological elements.',
      'FDA': 'Analyze this CER section against FDA 21 CFR 812 requirements for medical device clinical evidence. Identify any gaps or non-compliant approaches.'
    };

    const prompt = standardsPrompts[standard] || standardsPrompts['EU_MDR'];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert regulatory compliance analyst for medical devices. 
          Analyze the provided CER text and output a JSON object with compliance scores and specific issues.
          Include these fields: overallScore (0-100), compliantElements (array), nonCompliantElements (array), 
          missingElements (array), and recommendedChanges (array).`
        },
        {
          role: "user",
          content: `${prompt}\n\nCER TEXT: ${cerText.substring(0, 15000)}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error analyzing compliance:", error);
    throw new Error(`Failed to analyze compliance: ${error.message}`);
  }
}

/**
 * Answer a question about a CER using context from the document
 * @param {string} question - The user's question about the CER
 * @param {string} cerContext - Relevant sections from the CER
 * @returns {Promise<string>} - AI-generated answer
 */
async function answerCERQuestion(question, cerContext = '') {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert medical device regulatory consultant specializing in Clinical Evaluation Reports. 
          Answer questions about CERs using the provided context. 
          If the context doesn't contain the answer, explain what information would be needed to properly answer the question.`
        },
        {
          role: "user",
          content: `Based on this CER context: ${cerContext}\n\nQuestion: ${question}`
        }
      ],
      max_tokens: 1000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error answering CER question:", error);
    throw new Error(`Failed to answer question: ${error.message}`);
  }
}

/**
 * Auto-populate metadata from a device name
 * @param {string} deviceName - Name of the medical device
 * @returns {Promise<Object>} - Device metadata
 */
async function autoPopulateMetadata(deviceName) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert medical device regulatory database. 
          Based on the device name, infer the most likely metadata for a Clinical Evaluation Report. 
          Return a JSON object with the following fields: deviceClass, intendedPurpose, regulatoryPathway, harmonizedStandards, and riskClass.`
        },
        {
          role: "user",
          content: `Auto-populate metadata for this medical device: ${deviceName}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error auto-populating metadata:", error);
    throw new Error(`Failed to auto-populate metadata: ${error.message}`);
  }
}

// Export the service functions
export {
  generateLiteratureSummary,
  generateRiskAssessment,
  generateCERSection,
  analyzeCompliance,
  answerCERQuestion,
  autoPopulateMetadata
};
