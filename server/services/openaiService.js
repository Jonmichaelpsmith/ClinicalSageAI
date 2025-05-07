/**
 * OpenAI Service
 *
 * This service handles interactions with the OpenAI API for enhanced document generation,
 * analysis, and AI assistance.
 */
import OpenAI from 'openai';

// Initialize OpenAI client with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate text completion using the OpenAI API
 *
 * @param {string} prompt - The prompt to send to the API
 * @param {Object} options - Additional options for the API call
 * @returns {Promise<string>} - The generated text
 */
async function generateCompletion(prompt, options = {}) {
  try {
    const defaultOptions = {
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      temperature: 0.7,
      max_tokens: 1500,
    };

    console.log(`Generating completion with prompt (first 100 chars): ${prompt.substring(0, 100)}...`);
    
    const response = await openai.chat.completions.create({
      ...defaultOptions,
      ...options,
      messages: [
        { role: "system", content: "You are an expert in regulatory documentation, clinical evaluation reports, and medical device regulations." },
        { role: "user", content: prompt }
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating completion:', error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

/**
 * Generate structured data using the OpenAI API
 *
 * @param {string} prompt - The prompt to send to the API
 * @param {Object} options - Additional options for the API call
 * @returns {Promise<Object>} - The generated structured data
 */
async function generateStructuredData(prompt, options = {}) {
  try {
    const defaultOptions = {
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      temperature: 0.5,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    };

    console.log(`Generating structured data with prompt (first 100 chars): ${prompt.substring(0, 100)}...`);
    
    const response = await openai.chat.completions.create({
      ...defaultOptions,
      ...options,
      messages: [
        { 
          role: "system", 
          content: "You are an expert in regulatory documentation, clinical evaluation reports, and medical device regulations. Always respond with valid JSON data." 
        },
        { role: "user", content: prompt }
      ],
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating structured data:', error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

/**
 * Process a chat message using the OpenAI API
 *
 * @param {string} userMessage - The user's message
 * @param {Array<Object>} history - The chat history
 * @param {Object} context - Additional context for the chat
 * @returns {Promise<Object>} - The chat response
 */
async function processChat(userMessage, history = [], context = {}) {
  try {
    const messages = [
      { 
        role: "system", 
        content: `You are TrialSage CER Assistant, an expert in clinical evaluation reports and regulatory documentation for medical devices.
                 You provide clear, concise guidance on CER development following EU MDR 2017/745, MEDDEV 2.7/1 Rev 4, and FDA guidelines.
                 When responding to questions about regulations, cite specific sections when possible.
                 You use a professional but approachable tone. If you don't know an answer, say so rather than making up information.`
      },
      ...history.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: "user", content: userMessage }
    ];

    if (context.productName) {
      messages[0].content += `\nThe current discussion relates to the product: ${context.productName}.`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Generate follow-up suggestions based on the context and conversation
    const suggestionsPrompt = `Based on this conversation about Clinical Evaluation Reports and the user's question: "${userMessage}", 
                              suggest 3 brief follow-up questions the user might want to ask next. 
                              Return exactly 3 short questions in JSON format with an array called "suggestions".`;

    const suggestionsResponse = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You generate helpful follow-up questions based on user queries about Clinical Evaluation Reports." },
        ...messages,
        { role: "user", content: suggestionsPrompt }
      ],
      temperature: 0.7,
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    let suggestions = ["How should I structure my CER?", "What clinical evidence is required?", "How often should a CER be updated?"];
    try {
      const suggestionsData = JSON.parse(suggestionsResponse.choices[0].message.content);
      if (suggestionsData.suggestions && Array.isArray(suggestionsData.suggestions)) {
        suggestions = suggestionsData.suggestions;
      }
    } catch (e) {
      console.error('Error parsing suggestions:', e);
    }

    return {
      response: response.choices[0].message.content,
      suggestions
    };
  } catch (error) {
    console.error('Error in chat processing:', error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

/**
 * Generate improved section content based on regulatory standards
 *
 * @param {string} sectionName - The name of the section
 * @param {string} currentContent - The current content of the section
 * @param {string} standard - The regulatory standard to improve against
 * @returns {Promise<string>} - The improved content
 */
async function improveCompliance(sectionName, currentContent, standard) {
  try {
    const prompt = `You are a medical device regulatory expert. Analyze and improve the following ${sectionName} section of a Clinical Evaluation Report to ensure it fully complies with ${standard}.

Current content:
${currentContent}

Please provide specific improvements to enhance compliance with ${standard}. Format your response with:
1. A brief assessment of current compliance gaps
2. Specific recommendations for improvement
3. Implementation guidance with examples where applicable`;

    return await generateCompletion(prompt, {
      temperature: 0.4,
      max_tokens: 2000
    });
  } catch (error) {
    console.error(`Error improving compliance for ${sectionName}:`, error);
    throw new Error(`Failed to improve compliance: ${error.message}`);
  }
}

export default {
  generateCompletion,
  generateStructuredData,
  processChat,
  improveCompliance
};