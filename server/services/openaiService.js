/**
 * OpenAI Service
 * 
 * Provides centralized access to OpenAI API for text generation and processing.
 * Used by various modules in the application to generate regulatory content,
 * analyze documents, and process clinical data.
 */

import OpenAI from 'openai';
import logger from '../utils/logger.js';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate text using OpenAI API
 * 
 * @param {Object} options - Text generation options
 * @param {string} options.prompt - The prompt to generate text from
 * @param {number} [options.maxTokens=1000] - Maximum number of tokens to generate
 * @param {number} [options.temperature=0.7] - Randomness of the generation (0-1)
 * @param {string} [options.model="gpt-4o"] - Model to use for generation
 * @returns {Promise<Object>} The generated text and metadata
 */
async function generateText({ prompt, maxTokens = 1000, temperature = 0.7, model = "gpt-4o" }) {
  try {
    logger.info('Generating text with OpenAI', {
      module: 'openai-service',
      model,
      promptLength: prompt.length,
      maxTokens
    });

    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are a medical device regulatory expert specializing in clinical evaluations, regulatory documentation, and EU MDR compliance."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature,
      max_tokens: maxTokens
    });

    logger.info('Text generation completed', {
      module: 'openai-service',
      responseLength: response.choices[0].message.content.length
    });

    return {
      text: response.choices[0].message.content,
      model: response.model,
      usage: response.usage,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Error generating text with OpenAI', {
      module: 'openai-service',
      error: error.message,
      stack: error.stack
    });
    
    throw new Error(`Failed to generate text: ${error.message}`);
  }
}

/**
 * Analyze clinical data using OpenAI API
 * 
 * @param {Object} options - Analysis options
 * @param {string} options.text - The clinical data text to analyze
 * @param {string} options.dataType - Type of clinical data (e.g., 'investigation', 'pms', 'registry')
 * @param {string} [options.task='summarize'] - Analysis task (summarize, extract, evaluate)
 * @param {number} [options.maxTokens=1500] - Maximum tokens for the analysis
 * @returns {Promise<Object>} The analysis results
 */
async function analyzeClinicalData({ text, dataType, task = 'summarize', maxTokens = 1500 }) {
  try {
    logger.info('Analyzing clinical data with OpenAI', {
      module: 'openai-service',
      dataType,
      task,
      textLength: text.length
    });

    // Limit text to avoid excessive token usage (roughly 3000 tokens)
    const limitedText = text.substring(0, 12000);

    // Build prompt based on task
    let prompt = '';
    let systemPrompt = "You are a medical device regulatory expert specializing in clinical evaluations and EU MDR compliance.";

    if (task === 'summarize') {
      prompt = `
Please summarize the following ${dataType} data for inclusion in a Clinical Evaluation Report:

${limitedText}

Provide a concise summary (around 250 words) that includes:
1. Key safety and performance findings
2. Sample size and population (if mentioned)
3. Notable adverse events or complications
4. Overall significance for the device's clinical evaluation

Focus on objective findings and use language appropriate for regulatory documentation.
`;
    } else if (task === 'extract') {
      prompt = `
Please extract the following key information from this ${dataType} data:

${limitedText}

Extract and structure the following elements:
1. Primary endpoints and results
2. Safety events (list with frequencies if available)
3. Patient demographics
4. Study limitations
5. Key conclusions

Format the response as structured data with clear headings.
`;
    } else if (task === 'evaluate') {
      prompt = `
Please evaluate the quality and regulatory relevance of the following ${dataType} data:

${limitedText}

Provide an evaluation that covers:
1. Methodological quality (study design, sample size, follow-up)
2. Relevance to EU MDR requirements
3. Strengths and limitations as clinical evidence
4. Potential gaps that should be addressed
5. Overall assessment of the evidence value

Your evaluation should be objective, balanced, and suitable for regulatory documentation.
`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: maxTokens
    });

    logger.info('Clinical data analysis completed', {
      module: 'openai-service',
      responseLength: response.choices[0].message.content.length,
      task
    });

    return {
      result: response.choices[0].message.content,
      model: response.model,
      usage: response.usage,
      task,
      dataType,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Error analyzing clinical data with OpenAI', {
      module: 'openai-service',
      error: error.message,
      stack: error.stack,
      task,
      dataType
    });
    
    throw new Error(`Failed to analyze clinical data: ${error.message}`);
  }
}

/**
 * Generate CER narrative section incorporating internal clinical data
 * 
 * @param {Object} options - Narrative generation options
 * @param {Object} options.deviceInfo - Information about the device
 * @param {Object} options.internalData - Internal clinical data categories
 * @param {Array} options.literatureData - Literature data
 * @param {Object} [options.faersData] - FAERS adverse event data
 * @returns {Promise<Object>} The generated narrative
 */
async function generateCerNarrative({ deviceInfo, internalData, literatureData, faersData }) {
  try {
    logger.info('Generating CER narrative with OpenAI', {
      module: 'openai-service',
      device: deviceInfo.deviceName,
      internalDataCategories: Object.keys(internalData).filter(k => internalData[k]?.length > 0),
      literatureCount: literatureData?.length || 0
    });

    // Prepare data summary
    const internalDataSummary = {};
    for (const [category, data] of Object.entries(internalData)) {
      if (data && data.length > 0) {
        internalDataSummary[category] = data.map(item => ({
          title: item.originalName || item.name,
          documentId: item.metadata?.documentId,
          summary: item.metadata?.summary?.substring(0, 250) || "No summary available.",
          timeframe: item.metadata?.timeframe,
          sampleSize: item.metadata?.sampleSize
        }));
      }
    }

    // Prepare literature summary
    const literatureSummary = (literatureData || []).slice(0, 10).map(item => ({
      title: item.title,
      authors: item.authors,
      journal: item.journal,
      year: item.year,
      summary: item.abstract?.substring(0, 250) || "No abstract available."
    }));

    // Prepare FAERS summary
    const faersSummary = faersData ? {
      totalReports: faersData.totalReports || 0,
      seriousEvents: faersData.seriousEvents || [],
      commonEvents: faersData.commonEvents || []
    } : null;

    // Build prompt for narrative generation
    const prompt = `
You are a medical device regulatory expert tasked with writing a comprehensive clinical evaluation section for a Clinical Evaluation Report (CER) that follows EU MDR requirements. Your task is to integrate both internal clinical data and literature evidence into a cohesive narrative.

DEVICE INFORMATION:
- Name: ${deviceInfo.deviceName || 'Medical device'}
- Manufacturer: ${deviceInfo.manufacturer || 'Not specified'}
- Type: ${deviceInfo.deviceType || 'Not specified'}
- Classification: ${deviceInfo.classificationEU || 'Not specified'}
- Intended Use: ${deviceInfo.intendedUse || 'Not specified'}

INTERNAL CLINICAL DATA:
${Object.keys(internalDataSummary).length === 0 
  ? "No internal clinical data available." 
  : Object.entries(internalDataSummary).map(([category, items]) => `
${category.toUpperCase()}:
${items.map(item => `- ${item.title} (${item.timeframe || 'No timeframe'}): ${item.summary}`).join('\n')}
`).join('\n')}

LITERATURE EVIDENCE:
${literatureSummary.length === 0 
  ? "No literature evidence available." 
  : literatureSummary.map(item => `- ${item.title} (${item.authors}, ${item.year}): ${item.summary}`).join('\n')}

${faersSummary ? `
FAERS DATA:
- Total Reports: ${faersSummary.totalReports}
- Serious Events: ${faersSummary.seriousEvents.slice(0, 5).join(', ')}
- Common Events: ${faersSummary.commonEvents.slice(0, 5).join(', ')}
` : ''}

Please generate a comprehensive clinical evaluation narrative (approximately 1000-1500 words) that:

1. Synthesizes all available clinical evidence, with special emphasis on integrating internal clinical data alongside literature
2. Follows the format required by MEDDEV 2.7/1 Rev 4 for Section 7 of a CER
3. Addresses both safety and performance of the device
4. Provides a critical analysis of the strength and limitations of the evidence
5. Discusses any trends or patterns observed across different data sources
6. Maintains compliance with EU MDR Article 61 requirements
7. Presents a clear, evidence-based conclusion about the overall clinical evaluation

The narrative should be written in a formal, objective style appropriate for regulatory documentation. It should demonstrate a comprehensive clinical evaluation that considers ALL available clinical evidence as required by EU MDR.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a medical device regulatory expert specializing in clinical evaluations and EU MDR compliance."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 2500
    });

    logger.info('CER narrative generation completed', {
      module: 'openai-service',
      responseLength: response.choices[0].message.content.length
    });

    return {
      narrative: response.choices[0].message.content,
      model: response.model,
      usage: response.usage,
      timestamp: new Date().toISOString(),
      dataSourcesUsed: {
        internalData: Object.keys(internalDataSummary),
        literature: literatureSummary.length > 0,
        faers: !!faersSummary
      }
    };
  } catch (error) {
    logger.error('Error generating CER narrative with OpenAI', {
      module: 'openai-service',
      error: error.message,
      stack: error.stack
    });
    
    throw new Error(`Failed to generate CER narrative: ${error.message}`);
  }
}

export default {
  generateText,
  analyzeClinicalData,
  generateCerNarrative
};