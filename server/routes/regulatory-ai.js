// /server/routes/regulatory-ai.js

const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');
const { rateLimiter } = require('./rate-limiter');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../../uploads/ai-assistant');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to limit file types
const fileFilter = (req, file, cb) => {
  // Accept common document formats
  const allowedFileTypes = [
    '.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx',
    '.ppt', '.pptx', '.csv', '.md', '.json', '.xml'
  ];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('File type not supported. Supported types: ' + allowedFileTypes.join(', ')));
  }
};

// Configure multer middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
    files: 5 // Limit to 5 files per upload
  },
  fileFilter: fileFilter
});

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

/**
 * File upload endpoint for AI analysis
 * POST /api/regulatory-ai/upload
 */
router.post('/upload', upload.array('files', 5), async (req, res) => {
  try {
    // Get uploaded files
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files were uploaded' });
    }
    
    // Get module and context from form data
    const module = req.body.module || '';
    let context = {};
    
    try {
      if (req.body.context) {
        context = JSON.parse(req.body.context);
      }
    } catch (error) {
      console.error('Error parsing context:', error);
    }
    
    // Check if OpenAI is available
    if (!openai) {
      console.error('OpenAI API key not configured');
      
      // Clean up uploaded files
      files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
      
      return res.status(503).json({
        error: 'AI service is not available. Please contact your administrator.',
        response: 'I apologize, but my AI service is currently unavailable. Please try again later or contact your system administrator.',
      });
    }
    
    // Create system prompt for file analysis
    let systemPrompt = `You are Lumen Regulatory Affairs AI, a helpful assistant specializing in medical device and pharmaceutical regulatory affairs knowledge.
    
- Focus on providing clear, concise regulatory guidance based on the uploaded documents.
- Reference specific regulations and standards when appropriate.
- Provide a comprehensive analysis of the uploaded files.
- Extract key regulatory insights and implications.
- Format responses with markdown to improve readability.`;
    
    // Add module-specific context to the system prompt
    if (module) {
      systemPrompt += `\n\nYou are analyzing documents related to the ${module} module.`;
      
      // Add specific guidance based on module
      if (module.toLowerCase().includes('510k')) {
        systemPrompt += `\n\nFor 510(k) submissions:
- Focus on substantial equivalence indicators in these documents.
- Identify potential predicate device information.
- Extract device classification data if present.
- Note any regulatory pathway indicators.`;
      } else if (module.toLowerCase().includes('cer')) {
        systemPrompt += `\n\nFor Clinical Evaluation Reports (CER):
- Identify clinical data useful for MDR 2017/745 compliance.
- Extract information relevant to MEDDEV 2.7/1 rev 4 guidelines.
- Identify clinical evidence strengths and gaps.
- Look for risk-benefit information.`;
      }
    }
    
    // Add any additional context if provided
    if (context && Object.keys(context).length > 0) {
      systemPrompt += `\n\nContext Information:\n${JSON.stringify(context, null, 2)}`;
    }
    
    // Add summary of files
    systemPrompt += '\n\nThe user has uploaded the following files for analysis:';
    files.forEach(file => {
      systemPrompt += `\n- ${file.originalname} (${file.mimetype}, ${(file.size / 1024).toFixed(1)} KB)`;
    });
    
    // Prepare messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Please analyze these documents and provide regulatory insights.' }
    ];
    
    // Here we would typically process the files and extract their content
    // For simplicity, we'll just analyze the file names and types for now
    // In a production environment, you'd add document parsing logic here
    
    // Send to OpenAI for analysis
    console.log('Sending document analysis request to OpenAI API...');
    const completion = await openai.createChatCompletion({
      model: "gpt-4-turbo",
      messages: messages,
      temperature: 0.7,
      max_tokens: 2048,
    });
    
    // Extract the response
    const aiResponse = completion.data.choices[0].message.content;
    console.log('Received document analysis from OpenAI API');
    
    // Return the AI response
    return res.status(200).json({ 
      response: aiResponse,
      files: files.map(file => ({
        name: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        path: file.path
      }))
    });
    
  } catch (error) {
    console.error('Error processing file upload:', error);
    
    return res.status(500).json({
      error: 'Failed to process your files',
      response: 'I apologize, but I encountered an error processing your uploaded files. Please try again or contact support if the issue persists.',
    });
  }
});

module.exports = router;