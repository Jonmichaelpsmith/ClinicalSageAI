// server/routes/regulatory-ai.mjs
import express from 'express';
import OpenAI from 'openai';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../../uploads/ai-assistant');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow PDFs, Word docs, text files, and images
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'text/plain' ||
      file.mimetype.startsWith('image/')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Please upload PDF, Word, text, or image files.'), false);
    }
  }
});

// Rate limiting configuration
const MAX_REQUESTS_PER_WINDOW = 30;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour window
const activeUsers = new Map();

// Rate limiter middleware
const rateLimiter = (req, res, next) => {
  const userId = req.headers['x-user-id'] || req.ip;
  
  // Get or create user record
  const now = Date.now();
  const userRecord = activeUsers.get(userId) || {
    requestCount: 0,
    windowStart: now,
  };
  
  // Reset window if expired
  if (now - userRecord.windowStart > WINDOW_MS) {
    userRecord.requestCount = 0;
    userRecord.windowStart = now;
  }
  
  // Check if rate limit exceeded
  if (userRecord.requestCount >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      errorType: 'rate_limit',
      message: 'You have exceeded the allowed number of requests. Please try again later.',
      retryAfter: Math.ceil((userRecord.windowStart + WINDOW_MS - now) / 1000)
    });
  }
  
  // Increment request count and update record
  userRecord.requestCount += 1;
  activeUsers.set(userId, userRecord);
  
  next();
};

// Initialize OpenAI client when the API key is available
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is missing. Please set the OPENAI_API_KEY environment variable.');
  }
  return new OpenAI({ apiKey });
};

// Health check endpoint
router.get('/health', (req, res) => {
  try {
    // Attempt to initialize OpenAI client to verify API key
    getOpenAIClient();
    
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Regulatory AI service is operational'
    });
  } catch (error) {
    return res.status(503).json({
      status: 'unavailable',
      timestamp: new Date().toISOString(),
      error: error.message,
      message: 'Regulatory AI service is not fully operational'
    });
  }
});

/**
 * Process an AI query using OpenAI GPT-4o
 * POST /api/regulatory-ai/query
 */
router.post('/query', rateLimiter, async (req, res) => {
  try {
    const { query, context = 'general' } = req.body;
    
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({
        error: 'Invalid query',
        errorType: 'validation_error',
        message: 'Please provide a valid query string.'
      });
    }
    
    // Prepare system prompts with context
    let systemPrompt = `You are LUMEN, an AI assistant for regulatory affairs professionals in the medical device and pharmaceutical industry.
      
Today is ${new Date().toLocaleDateString()}.

You specialize in:
- FDA regulations for medical devices and pharmaceuticals
- EU MDR and IVDR requirements
- Clinical Evaluation Reports (CERs)
- 510(k) submissions
- Quality Management Systems
- Regulatory strategy and compliance`;

    // Add context-specific instructions
    if (context === 'cer') {
      systemPrompt += `\n\nYou are currently assisting with a Clinical Evaluation Report (CER). Focus on:
      - EU MDR requirements for CERs
      - MEDDEV 2.7/1 guidance
      - Clinical evaluation processes
      - Literature search and analysis
      - Post-market surveillance requirements`;
    } else if (context === '510k') {
      systemPrompt += `\n\nYou are currently assisting with a 510(k) submission. Focus on:
      - FDA requirements for 510(k) submissions
      - Substantial equivalence evaluations
      - Required testing and documentation
      - Predicate device selection
      - FDA submission processes`;
    } else if (context === 'qms') {
      systemPrompt += `\n\nYou are currently assisting with Quality Management Systems. Focus on:
      - ISO 13485 requirements
      - FDA Quality System Regulation (21 CFR 820)
      - Risk management (ISO 14971)
      - CAPA processes
      - Internal auditing`;
    }
    
    // Include instructions for production behavior
    systemPrompt += `\n\nImportant guidelines:
    - Provide accurate, regulation-based advice
    - Cite specific regulations where applicable
    - If you're uncertain about specific details, acknowledge your limitations
    - Format your responses in a clear, structured manner
    - Do not provide information about non-medical regulatory affairs
    - Refuse to assist with fraudulent, illegal, or unethical requests`;
    
    const openai = getOpenAIClient();
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      max_tokens: 2048,
      temperature: 0.2
    });
    
    if (!response.choices || !response.choices[0] || !response.choices[0].message) {
      throw new Error('Unexpected response format from OpenAI API');
    }
    
    return res.status(200).json({
      response: response.choices[0].message.content,
      model: response.model,
      usage: response.usage
    });
    
  } catch (error) {
    console.error('Error processing AI query:', error);
    
    // Handle different types of errors
    if (error.message.includes('API key')) {
      return res.status(503).json({
        error: 'Service configuration error',
        errorType: 'api_key_error',
        message: 'The AI service is not properly configured. Please contact support.'
      });
    }
    
    if (error.message.includes('OpenAI API')) {
      return res.status(502).json({
        error: 'External API error',
        errorType: 'openai_api_error',
        message: 'There was an error communicating with the AI service. Please try again later.'
      });
    }
    
    return res.status(500).json({
      error: error.message || 'Unknown error',
      errorType: error.type || 'server_error',
      message: 'An unexpected error occurred. Please try again or contact support if the issue persists.'
    });
  }
});

/**
 * File upload endpoint for AI analysis
 * POST /api/regulatory-ai/upload
 */
router.post('/upload', rateLimiter, upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        errorType: 'validation_error',
        message: 'Please upload at least one file for analysis.'
      });
    }
    
    const { query = 'Analyze these regulatory documents and provide a summary.' } = req.body;
    
    // Process files (in production implementation, this would extract text from various file types)
    const filePaths = req.files.map(file => file.path);
    const fileContents = await Promise.all(filePaths.map(async (filePath) => {
      // Basic implementation for text extraction
      // In a real system, you'd use specialized libraries for different file types
      if (filePath.endsWith('.txt')) {
        return fs.readFileSync(filePath, 'utf8');
      } else {
        // For all other file types, just return the file info for now
        return `File: ${path.basename(filePath)} (${fs.statSync(filePath).size} bytes)`;
      }
    }));
    
    // In production, you would use a more sophisticated approach to handle multiple files
    // This simple implementation just concatenates the content
    const combinedContent = fileContents.join('\n\n');
    
    // Prepare system message with context about the files
    const systemPrompt = `You are LUMEN, an AI assistant for regulatory affairs professionals.
      
You are analyzing the following regulatory documents:
${req.files.map(file => `- ${file.originalname} (${file.mimetype})`).join('\n')}

Provide a detailed analysis of the content, focusing on regulatory compliance, required actions, and any potential issues.`;
    
    const openai = getOpenAIClient();
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `${query}\n\nDocument content:\n${combinedContent}` }
      ],
      max_tokens: 2048,
      temperature: 0.2
    });
    
    if (!response.choices || !response.choices[0] || !response.choices[0].message) {
      throw new Error('Unexpected response format from OpenAI API');
    }
    
    return res.status(200).json({
      response: response.choices[0].message.content,
      files: req.files.map(file => ({
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      })),
      model: response.model,
      usage: response.usage
    });
    
  } catch (error) {
    console.error('Error processing file upload:', error);
    
    // Clean up files on error
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (e) {
          console.error(`Failed to delete file ${file.path}:`, e);
        }
      });
    }
    
    return res.status(500).json({
      error: error.message || 'Failed to process your files',
      errorCode: error.code || 'UNKNOWN_ERROR',
      errorType: error.type || 'server_error',
      response: 'I apologize, but I encountered an error processing your uploaded files. The error has been logged for investigation. Please try again or contact support if the issue persists.',
    });
  }
});

export { router };