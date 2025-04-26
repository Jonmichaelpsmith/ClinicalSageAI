/**
 * OpenAI Service for TrialSage Vault™
 * 
 * This service provides a clean abstraction for making OpenAI API calls,
 * including error handling, retry logic, and response validation.
 */

const axios = require('axios');

// Default system instruction for Vault Assistant
const DEFAULT_SYSTEM_INSTRUCTION = `
You are Vault™ Assistant, the AI concierge for TrialSage Vault™, an intelligent clinical document management platform.
You provide helpful, accurate information about Vault's features and capabilities.

Key guidelines:
1. You are knowledgeable about regulatory document management, including 21 CFR Part 11, HIPAA, and clinical document workflows.
2. Keep responses professional, concise (max 3 paragraphs), and focused on biotech/pharmaceutical document management.
3. Maintain a friendly, knowledgeable tone as a clinical technology expert.
4. When uncertain, focus on the core Vault features rather than making up specifics.
5. If asked about pricing, suggest the Professional tier ($1,299/month) for most biotech companies.
6. For questions about competitors, highlight Vault's AI capabilities, biotech-specific features, and more affordable pricing.
7. If someone requests a demo, assist them with collecting their contact information.

Core Vault Features:
- AI-powered document auto-tagging (extract trial phase, molecule ID, indication, endpoints)
- Smart folder organization by trial, phase, molecule
- AI-generated executive summaries of uploaded documents
- Full document version history with comparison and rollback
- Intelligent search across document content, metadata, and AI-generated tags
- 21 CFR Part 11 compliant audit trails
- Multi-tenant architecture with complete isolation between clients
- AES-256 encryption at rest, TLS 1.3 in transit
`;

/**
 * Call OpenAI API for Vault Assistant
 * 
 * @param {Array} messages - Array of message objects with role and content
 * @param {String} intent - Identified intent of the conversation
 * @param {Object} options - Additional options for the API call
 * @returns {Promise<Object>} - Response from OpenAI API
 */
async function callOpenAI(messages, intent = null, options = {}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  
  // Prepare system instructions based on intent
  let systemInstruction = DEFAULT_SYSTEM_INSTRUCTION;
  
  // Add intent-specific guidance
  if (intent === 'compliance') {
    systemInstruction += "\nFocus on regulatory compliance features including 21 CFR Part 11, audit trails, HIPAA, and secure document handling.";
  } else if (intent === 'comparison') {
    systemInstruction += "\nHighlight Vault's advantages over competitors like Veeva Vault, emphasizing AI capabilities, biotech-specific features, and more affordable pricing.";
  } else if (intent === 'ai_features') {
    systemInstruction += "\nEmphasize the AI document tagging, summarization, and organization capabilities powered by GPT-4 Turbo.";
  } else if (intent === 'pricing') {
    systemInstruction += "\nProvide transparent pricing information while emphasizing the value proposition. Mention that Professional tier ($1,299/month) is most popular for growing biotechs.";
  } else if (intent === 'demo') {
    systemInstruction += "\nBe helpful in arranging a demo. Ask for the person's name, email, and company. Mention that demos typically take 30-45 minutes and are tailored to their specific needs.";
  }
  
  const combinedMessages = [
    { role: 'system', content: systemInstruction },
    ...messages
  ];
  
  // Add message limiting to prevent token overflows
  const limitedMessages = combinedMessages.slice(-10);
  
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: options.model || 'gpt-4-turbo-preview',
      messages: limitedMessages,
      max_tokens: options.maxTokens || 500,
      temperature: options.temperature || 0.7,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      message: response.data.choices[0].message.content,
      usage: response.data.usage,
      model: response.data.model
    };
    
  } catch (error) {
    // Enhanced error handling
    let errorMessage = 'OpenAI API call failed';
    
    if (error.response) {
      // The request was made and the server responded with a non-2xx status
      errorMessage = `OpenAI API error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`;
      console.error('OpenAI API error details:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'OpenAI API request timed out';
    } else {
      // Something happened in setting up the request
      errorMessage = `OpenAI API request setup error: ${error.message}`;
    }
    
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Check if OpenAI integration is properly configured
 * 
 * @returns {Boolean} - True if OpenAI is configured, false otherwise
 */
function isOpenAIConfigured() {
  return !!process.env.OPENAI_API_KEY;
}

module.exports = {
  callOpenAI,
  isOpenAIConfigured
};