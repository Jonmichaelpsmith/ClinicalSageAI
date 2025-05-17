// Import core Node.js modules
const path = require('path');
const fs = require('fs');
const { promises: fsPromises } = fs;
const os = require('os');
const { OpenAI } = require('openai');
const util = require('util');
const crypto = require('crypto');
const stream = require('stream');
const pipeline = util.promisify(stream.pipeline);

// Use Express's built-in middleware for file uploads
const express = require('express');
const bodyParser = require('body-parser');

// Simple console logger
const logger = {
  info: (message, data) => console.log(`[INFO] ${message}`, data || ''),
  warn: (message, data) => console.warn(`[WARN] ${message}`, data || ''),
  error: (message, data) => console.error(`[ERROR] ${message}`, data || '')
};

// File handling utility functions
const createTempUploadDir = async () => {
  const uploadDir = path.join(os.tmpdir(), 'regulatory_uploads');
  try {
    await fsPromises.mkdir(uploadDir, { recursive: true });
    return uploadDir;
  } catch (err) {
    logger.error('Failed to create upload directory', { error: err.message });
    throw err;
  }
};

const generateUniqueFilename = (originalFilename) => {
  const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalFilename);
  return `upload-${uniqueSuffix}${ext}`;
};

const isValidFileType = (filename) => {
  const allowedTypes = ['.pdf', '.docx', '.doc', '.txt'];
  const ext = path.extname(filename).toLowerCase();
  return allowedTypes.includes(ext);
};

// Custom file upload handler using Express
const handleFileUpload = async (req) => {
  // Create upload directory
  const uploadDir = await createTempUploadDir();
  
  // Only parse multipart form data if content type is correct
  if (!req.is('multipart/form-data')) {
    throw new Error('Content type must be multipart/form-data');
  }
  
  // Setup for file processing
  const filesPromise = new Promise((resolve, reject) => {
    const busboy = require('busboy');
    const bb = busboy({ headers: req.headers, limits: { 
      files: 10,
      fileSize: 20 * 1024 * 1024 // 20MB
    }});
    
    const uploadedFiles = [];
    const formFields = {};
    
    // Handle file upload
    bb.on('file', (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      
      // Check if file type is allowed
      if (!isValidFileType(filename)) {
        reject(new Error(`Invalid file type for ${filename}. Only PDF, DOCX, DOC, and TXT files are allowed.`));
        return;
      }
      
      const filepath = path.join(uploadDir, generateUniqueFilename(filename));
      const writeStream = fs.createWriteStream(filepath);
      
      // Save the file
      pipeline(file, writeStream)
        .then(() => {
          uploadedFiles.push({
            originalname: filename,
            encoding,
            mimetype: mimeType,
            path: filepath,
            size: fs.statSync(filepath).size
          });
        })
        .catch(err => {
          logger.error('File upload error', { error: err.message });
          reject(err);
        });
    });
    
    // Handle form fields
    bb.on('field', (name, val) => {
      formFields[name] = val;
    });
    
    // Handle completion
    bb.on('finish', () => {
      resolve({ files: uploadedFiles, fields: formFields });
    });
    
    // Handle errors
    bb.on('error', err => {
      logger.error('Busboy error', { error: err.message });
      reject(err);
    });
    
    // Pass request data to busboy
    req.pipe(bb);
  });
  
  return filesPromise;
};

// Initialize OpenAI (if API key is available)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Initialize OpenAI extraction prompts
const extractionPrompt = `
You are an AI assistant specialized in extracting structured information from medical device regulatory documents. 
Extract the following fields from the provided document content if available:

1. deviceName: The name of the medical device
2. manufacturer: The company that makes the device
3. manufacturerAddress: The address of the manufacturer
4. contactPerson: The contact person for the device
5. contactEmail: The contact email for the device
6. contactPhone: The contact phone number for the device
7. deviceClass: The FDA device class (I, II, or III)
8. productCode: The FDA product code
9. regulationNumber: The FDA regulation number (format: XXX.XXXX)
10. panel: The FDA medical specialty panel (e.g., CV for Cardiovascular)
11. intendedUse: The intended use of the device
12. indications: The indications for use
13. deviceDescription: Description of the device
14. principlesOfOperation: How the device works
15. keyFeatures: Key features of the device
16. mainComponents: Main components of the device
17. materials: Materials used in the device
18. sterilization: Whether the device is sterile (true/false)
19. sterilizationMethod: Method of sterilization if applicable
20. software: Whether the device contains software (true/false)
21. softwareLevel: Software level of concern (minor, moderate, major)
22. biocompatibility: Whether biocompatibility is applicable (true/false)
23. contactType: Type of body contact (none, external, implant, blood_path)
24. predicateDeviceName: Name of predicate device (if mentioned)
25. predicateManufacturer: Manufacturer of predicate device
26. predicateK510Number: The K number of the predicate device (format: KXXXXXX)
27. previousSubmissions: Whether there are previous submissions (true/false)
28. previousK510Number: The K number of previous submissions
29. marketHistory: Market history information
30. recalls: Whether there are any recalls (true/false)
31. recallDescription: Description of recalls if applicable

For each field, provide:
- The extracted value
- A confidence score between 0 and 1
- The source location in the document (page number if available)

Return the data as a JSON object with the following structure:
{
  "extractedFields": [
    {
      "name": "fieldName",
      "value": "extracted value",
      "confidence": 0.95,
      "source": "document.pdf (page X)",
      "matches": 1
    },
    ...
  ]
}
`;

/**
 * Uploads and processes documents for extraction
 */
const processDocuments = async (req, res) => {
  try {
    // Check for OpenAI API key
    if (!openai) {
      return res.status(500).json({
        error: "OpenAI API key not configured. Document extraction is unavailable."
      });
    }
    
    try {
      // Process file uploads using custom handler
      const { files, fields } = await handleFileUpload(req);
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }
      
      // Get extraction parameters
      const documentType = fields.documentType || 'technical';
      const confidenceThreshold = parseFloat(fields.confidenceThreshold || '0.7');
      
      // Process each document
      logger.info('Processing documents', { 
        count: files.length, 
        documentType, 
        confidenceThreshold 
      });
      
      // Process each file in sequence to avoid memory issues
      const documentContents = [];
      for (const file of files) {
        const content = await extractDocumentContent(file);
        if (content) {
          documentContents.push(content);
        }
      }
      
      if (documentContents.length === 0) {
        return res.status(400).json({ error: 'Could not extract content from any of the uploaded files' });
      }
      
      // Combine all document contents
      const combinedContent = documentContents.join('\n\n====== NEW DOCUMENT ======\n\n');
      
      // Extract structured data using OpenAI
      const extractedData = await extractStructuredData(combinedContent, documentType);
      
      // Filter results based on confidence threshold
      const filteredFields = extractedData.extractedFields.filter(
        field => field.confidence >= confidenceThreshold
      );
      
      // Clean up temporary files after processing
      await cleanupFiles(files);
      
      // Return the extracted data
      return res.status(200).json({
        success: true,
        documentType,
        confidenceThreshold,
        extractedFields: filteredFields,
        totalFieldsExtracted: extractedData.extractedFields.length,
        fieldsAboveThreshold: filteredFields.length
      });
    } catch (processingError) {
      logger.error('Document processing error', { error: processingError.message, stack: processingError.stack });
      
      return res.status(500).json({ 
        error: 'Error processing documents', 
        message: processingError.message 
      });
    }
  } catch (error) {
    logger.error('Document extraction controller error', { error: error.message, stack: error.stack });
    return res.status(500).json({ 
      error: 'Server error in document processing', 
      message: error.message 
    });
  }
};

/**
 * Extract document content based on file type
 */
async function extractDocumentContent(file) {
  const filePath = file.path;
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  try {
    let content = '';
    
    // Extract content based on file type
    if (fileExt === '.pdf') {
      content = await extractPdfContent(filePath);
    } else if (fileExt === '.docx' || fileExt === '.doc') {
      content = await extractDocxContent(filePath);
    } else if (fileExt === '.txt') {
      content = await fsPromises.readFile(filePath, 'utf-8');
    } else {
      throw new Error(`Unsupported file type: ${fileExt}`);
    }
    
    // Format the content
    return `File: ${file.originalname}\nContent:\n${content}`;
  } catch (error) {
    logger.error('Error extracting document content', { 
      filePath, 
      fileType: fileExt, 
      error: error.message 
    });
    
    return null;
  }
}

// Helper to extract content from PDF files
async function extractPdfContent(filePath) {
  try {
    // Use a simple child process to extract text using pdftotext (if available)
    const { exec } = require('child_process');
    const execPromise = util.promisify(exec);
    
    try {
      const { stdout } = await execPromise(`pdftotext "${filePath}" -`);
      return stdout;
    } catch (cmdError) {
      // If pdftotext is not available, provide a simpler response
      logger.warn('pdftotext command failed, using fallback', { error: cmdError.message });
      return `[PDF content extraction requires additional tools. PDF metadata extracted: ${path.basename(filePath)}]`;
    }
  } catch (error) {
    logger.error('PDF extraction error', { error: error.message });
    return `[Error extracting PDF content: ${error.message}]`;
  }
}

// Helper to extract content from DOCX files
async function extractDocxContent(filePath) {
  try {
    // Use simple text extraction
    const { exec } = require('child_process');
    const execPromise = util.promisify(exec);
    
    try {
      // Try using catdoc if available
      const { stdout } = await execPromise(`catdoc "${filePath}"`);
      return stdout;
    } catch (cmdError) {
      // If catdoc is not available, provide a simpler response
      logger.warn('catdoc command failed, using fallback', { error: cmdError.message });
      return `[DOCX content extraction requires additional tools. Document metadata extracted: ${path.basename(filePath)}]`;
    }
  } catch (error) {
    logger.error('DOCX extraction error', { error: error.message });
    return `[Error extracting DOCX content: ${error.message}]`;
  }
}

/**
 * Extract structured data from document content using OpenAI
 */
async function extractStructuredData(content, documentType) {
  try {
    // If content is very large, truncate it (OpenAI has token limits)
    let processedContent = content;
    const maxContentLength = 100000; // About 25k tokens
    
    if (content.length > maxContentLength) {
      logger.warn('Content too large, truncating', { 
        originalSize: content.length, 
        truncatedSize: maxContentLength 
      });
      processedContent = content.substring(0, maxContentLength) + "\n\n[CONTENT TRUNCATED DUE TO SIZE]";
    }
    
    // Build messages for OpenAI
    const messages = [
      { role: "system", content: extractionPrompt },
      { role: "user", content: `Document Type: ${documentType}\n\nDocument Content:\n${processedContent}` }
    ];
    
    // Make API call to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Use the newest model for best extraction results
      messages,
      temperature: 0.1, // Low temperature for more precise extraction
      response_format: { type: "json_object" }, // Ensure JSON response
      max_tokens: 4000 // Limit response size
    });
    
    // Extract and parse the response
    const responseContent = response.choices[0].message.content;
    const parsedData = JSON.parse(responseContent);
    
    logger.info('Structured data extraction complete', { 
      fieldsExtracted: parsedData.extractedFields?.length || 0
    });
    
    return parsedData;
  } catch (error) {
    logger.error('Error in OpenAI extraction', { error: error.message, stack: error.stack });
    throw new Error(`Error extracting structured data: ${error.message}`);
  }
}

/**
 * Clean up temporary files after processing
 */
async function cleanupFiles(files) {
  for (const file of files) {
    try {
      await fsPromises.unlink(file.path);
    } catch (err) {
      logger.warn('Error deleting temporary file', { path: file.path, error: err.message });
    }
  }
}

module.exports = {
  processDocuments
};