// /server/routes/regulatory-ai.js

const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');
const { rateLimiter } = require('./rate-limiter');

// Check if OpenAI API key is available
const openaiApiKey = process.env.OPENAI_API_KEY;
const configuration = openaiApiKey
  ? new Configuration({ apiKey: openaiApiKey })
  : null;
const openai = configuration ? new OpenAIApi(configuration) : null;

// Apply rate limiting to all routes
router.use(rateLimiter);

/**
 * Process an AI query using GPT-4
 * POST /api/regulatory-ai/query
 */
router.post('/query', async (req, res) => {
  try {
    const { message, module, context, history } = req.body;

    // Validate inputs
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if OpenAI is available
    if (!openai) {
      console.error('OpenAI API key not configured');
      return res.status(503).json({
        error: 'AI service is not available. Please contact your administrator.',
        response: 'I apologize, but my AI service is currently unavailable. Please try again later or contact your system administrator.',
      });
    }

    // Create system prompt based on the module and context
    let systemPrompt = `You are Lumen Regulatory Affairs AI, a helpful assistant specializing in medical device and pharmaceutical regulatory affairs knowledge.
    
- Focus on providing clear, concise regulatory guidance.
- Reference specific regulations and standards when appropriate.
- Prioritize safety, compliance, and ethical considerations in all responses.
- Do not provide legal advice, only regulatory information and guidance.
- Format responses with markdown to improve readability.`;

    // Add module-specific context to the system prompt
    if (module) {
      systemPrompt += `\n\nYou are currently being asked about the ${module} module.`;
      
      // Add specific guidance based on module
      if (module.toLowerCase().includes('510k')) {
        systemPrompt += `\n\nFor 510(k) submissions:
- Focus on substantial equivalence demonstrations.
- Guide users through predicate device selection.
- Help with device classification and regulatory pathways.
- Provide clarity on FDA expectations for different device types.`;
      } else if (module.toLowerCase().includes('cer')) {
        systemPrompt += `\n\nFor Clinical Evaluation Reports (CER):
- Follow MDR 2017/745 requirements for clinical evaluation.
- Focus on MEDDEV 2.7/1 rev 4 guidelines.
- Help with literature search strategies and equivalence demonstrations.
- Guide users on risk-benefit analysis and gaps in clinical evidence.`;
      }
    }

    // Add any additional context if provided
    if (context && Object.keys(context).length > 0) {
      systemPrompt += `\n\nContext Information:\n${JSON.stringify(context, null, 2)}`;
    }

    // Prepare conversation messages
    const messages = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history
    if (history && Array.isArray(history)) {
      // Only include the most recent 10 messages to stay within context limits
      const recentHistory = history.slice(-10);
      messages.push(...recentHistory);
    }

    // Add the user's current message
    messages.push({ role: 'user', content: message });

    // Call OpenAI API
    console.log('Sending request to OpenAI API...');
    const completion = await openai.createChatCompletion({
      model: "gpt-4-turbo", // Use GPT-4 for best results
      messages: messages,
      temperature: 0.7,
      max_tokens: 2048,
    });

    // Extract the response
    const aiResponse = completion.data.choices[0].message.content;
    console.log('Received response from OpenAI API');

    // Return the AI response
    return res.status(200).json({ response: aiResponse });
  } catch (error) {
    console.error('Error in regulatory AI query:', error);
    
    return res.status(500).json({
      error: 'Failed to process your request',
      response: 'I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.',
    });
  }
});

module.exports = router;