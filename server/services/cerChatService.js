/**
 * CER Chat Service
 *
 * This service handles chat functionality for the CER assistant, providing intelligent
 * responses to user queries about Clinical Evaluation Reports.
 */

import openaiService from './openaiService.js';

/**
 * Process a CER assistant chat message
 *
 * @param {string} message - The user's message
 * @param {Object} context - Optional context about the CER being worked on
 * @returns {Promise<Object>} - The response and suggestions
 */
async function processMessage(message, context = {}) {
  try {
    console.log(`Processing CER chat message: ${message.substring(0, 50)}...`);
    console.log(`Context:`, JSON.stringify(context));
    
    const chatResponse = await openaiService.processChat(message, [], context);
    
    return {
      response: chatResponse.response,
      suggestions: chatResponse.suggestions || []
    };
  } catch (error) {
    console.error('Error in CER chat processing:', error);
    
    return {
      response: "I'm having trouble processing your request. This could be due to a connectivity issue or service limitations. Please try again or contact support if the issue persists.",
      suggestions: [
        "What sections should my CER include?",
        "How do I incorporate FAERS data in my CER?",
        "What's required for EU MDR compliance?"
      ]
    };
  }
}

/**
 * Generate improved compliance content for a CER section
 *
 * @param {string} sectionName - Name of the section to improve
 * @param {string} currentContent - Current content of the section
 * @param {string} standard - The regulatory standard to improve against
 * @returns {Promise<Object>} - The improved content
 */
async function improveCompliance(sectionName, currentContent, standard) {
  try {
    console.log(`Improving compliance for ${sectionName} against ${standard}`);
    
    const improved = await openaiService.improveCompliance(
      sectionName,
      currentContent,
      standard
    );
    
    return {
      section: sectionName,
      standard,
      improvement: improved,
      aiGenerated: true,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error improving compliance for ${sectionName}:`, error);
    
    return {
      section: sectionName,
      standard,
      improvement: "Unable to generate compliance improvements at this time. This may be due to a temporary service limitation.",
      aiGenerated: false,
      error: error.message
    };
  }
}

export default {
  processMessage,
  improveCompliance
};