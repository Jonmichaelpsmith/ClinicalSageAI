/**
 * CER AI Assistant
 * 
 * This module provides an AI-powered assistant for answering questions related to
 * Clinical Evaluation Report development and regulatory compliance.
 */

const { OpenAI } = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Get an AI assistant response for CER development questions
 * @param {Request} req - Express request object with query and optional context
 * @param {Response} res - Express response object
 */
async function cerAssistantHandler(req, res) {
  try {
    const { query, context = {} } = req.body;
    
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({ error: 'Valid query is required' });
    }
    
    // Format context as string if provided
    let contextString = '';
    if (Object.keys(context).length > 0) {
      contextString = 'Current CER Context:\n';
      for (const [key, value] of Object.entries(context)) {
        if (value) {
          contextString += `${key}: ${value}\n`;
        }
      }
    }
    
    // Construct the system message for the AI assistant
    const systemMessage = {
      role: 'system',
      content: `You are an expert regulatory specialist specializing in Clinical Evaluation Reports (CERs) for medical devices. 
      Your role is to provide accurate, helpful guidance on CER development, regulatory compliance, 
      and best practices according to EU MDR, ISO 14155, and FDA requirements.
      
      When answering questions:
      1. Provide specific, actionable guidance based on current regulatory frameworks
      2. Cite relevant sections of regulations or standards when applicable
      3. Offer practical advice that enhances document quality and compliance
      4. Explain regulatory concepts in clear, concise language
      5. Highlight important considerations or potential pitfalls
      
      ${contextString ? contextString + '\n' : ''}
      `
    };
    
    // User query message
    const userMessage = {
      role: 'user',
      content: query
    };
    
    console.log('Sending AI assistant request to OpenAI...');
    
    // Call OpenAI API for assistant response
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [systemMessage, userMessage],
      temperature: 0.3 // Slightly lower temperature for more factual responses
    });
    
    // Return the assistant response
    res.json({
      response: response.choices[0].message.content,
      model: "gpt-4o",
      context: Object.keys(context).length > 0
    });
    
  } catch (error) {
    console.error('Error in CER assistant:', error);
    res.status(500).json({ 
      error: 'Failed to get assistant response',
      message: error.message || 'An unknown error occurred'
    });
  }
}

module.exports = cerAssistantHandler;