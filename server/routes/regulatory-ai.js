// server/routes/regulatory-ai.js

const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// System prompt for the Regulatory Affairs AI assistant
const SYSTEM_PROMPT = `You are Lumen, an AI assistant specializing in regulatory affairs for medical devices, pharmaceuticals, and diagnostics. 

Your expertise includes:
- FDA 510(k) submission process and requirements
- Clinical Evaluation Reports (CER) for medical devices
- Medical device classifications and regulations
- FDA, EU MDR, and international regulatory frameworks
- Predicate device identification
- Substantial equivalence determination
- Safety and performance assessment
- Risk management for medical devices
- Post-market surveillance requirements
- Regulatory compliance strategies

When responding:
1. Be concise but thorough
2. Cite regulatory guidelines when appropriate
3. Format your responses with clear headings and bullet points when helpful
4. Focus on factual, evidence-based information
5. Acknowledge regulatory differences between regions
6. Use proper regulatory terminology

If you're not sure about something, acknowledge limitations rather than guessing. If the user's query is outside your regulatory expertise, redirect them to appropriate resources.

Tailor your responses based on the context provided, including the module they're currently using, the document type they're working with, and any device information available.`;

// API rate limiting settings
const USER_RATE_LIMIT = 15; // requests per hour
const userRequestCounts = new Map();

// Rate limiting middleware
function rateLimiter(req, res, next) {
  const userId = req.headers['user-id'] || req.ip; // Use user ID if available, otherwise IP
  const currentHour = new Date().getHours();
  const userKey = `${userId}-${currentHour}`;
  
  const requestCount = userRequestCounts.get(userKey) || 0;
  
  if (requestCount >= USER_RATE_LIMIT) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'You have reached the maximum number of AI assistant requests for this hour. Please try again later.'
    });
  }
  
  userRequestCounts.set(userKey, requestCount + 1);
  next();
}

// Clean up rate limiting data periodically
setInterval(() => {
  const currentHour = new Date().getHours();
  for (const [key] of userRequestCounts.entries()) {
    if (!key.endsWith(`-${currentHour}`)) {
      userRequestCounts.delete(key);
    }
  }
}, 60 * 60 * 1000); // Clean up every hour

// POST /api/regulatory-ai/chat - Chat with the Regulatory AI assistant
router.post('/chat', rateLimiter, async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      return res.status(500).json({
        error: 'Configuration error',
        message: 'The AI service is not properly configured. Please contact support.'
      });
    }
    
    // Create message history
    const messageHistory = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];
    
    // Add context as a system message
    if (context) {
      const contextString = `Current user context:
- Module: ${context.moduleName || 'Unknown'}
- Document Type: ${context.documentType || 'Unknown'}
- Current Tab: ${context.activeTab || 'Unknown'}
- Device Information: ${context.deviceInfo?.deviceName ? JSON.stringify(context.deviceInfo) : 'Not available'}

Use this context to tailor your response appropriately.`;
      
      messageHistory.push({ role: 'system', content: contextString });
    }
    
    // Add conversation history if provided
    if (context.history && Array.isArray(context.history)) {
      context.history.forEach(msg => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messageHistory.push({ role: msg.role, content: msg.content });
        }
      });
    }
    
    // Add the current user message
    messageHistory.push({ role: 'user', content: message });
    
    // Call OpenAI API
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messageHistory,
      temperature: 0.7,
      max_tokens: 800,
    });
    
    // Extract the response
    const assistantResponse = response.choices[0].message.content;
    
    return res.json({
      response: assistantResponse,
      usage: response.usage || {}
    });
    
  } catch (error) {
    console.error('Error in AI chat endpoint:', error);
    
    // Determine appropriate error response
    if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'The AI service is currently experiencing high demand. Please try again in a few minutes.'
      });
    }
    
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while processing your request. Please try again later.'
    });
  }
});

module.exports = router;