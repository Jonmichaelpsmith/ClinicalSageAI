const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { promises: fsPromises } = fs;
const os = require('os');
const { OpenAI } = require('openai');
const { PDFLoader } = require('langchain/document_loaders/fs/pdf');
const { DocxLoader } = require('langchain/document_loaders/fs/docx');
const { TextLoader } = require('langchain/document_loaders/fs/text');
const structLog = require('structured-log');
const pLimit = require('p-limit');

// Configure logger
const logger = structLog.configure()
  .writeTo(structLog.sink.console())
  .create();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadDir = path.join(os.tmpdir(), 'regulatory_uploads');
    try {
      await fsPromises.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.docx', '.doc', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max file size
    files: 10 // Maximum 10 files per upload
  }
});

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
    
    // Use multer middleware for file uploads
    const uploadMiddleware = upload.array('files');
    
    uploadMiddleware(req, res, async (err) => {
      if (err) {
        logger.error('File upload error', { error: err.message });
        return res.status(400).json({ error: err.message });
      }
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }
      
      const { documentType = 'technical', confidenceThreshold = 0.7 } = req.body;
      const confidenceValue = parseFloat(confidenceThreshold);
      
      try {
        // Process each document
        logger.info('Processing documents', { 
          count: req.files.length, 
          documentType, 
          confidenceThreshold: confidenceValue 
        });
        
        // Limit concurrent processing
        const limit = pLimit(3);
        
        // Process each file and extract document content
        const documentContentPromises = req.files.map(file => 
          limit(() => extractDocumentContent(file))
        );
        
        const documentContents = await Promise.all(documentContentPromises);
        const validContents = documentContents.filter(content => content);
        
        if (validContents.length === 0) {
          return res.status(400).json({ error: 'Could not extract content from any of the uploaded files' });
        }
        
        // Combine all document contents
        const combinedContent = validContents.join('\n\n====== NEW DOCUMENT ======\n\n');
        
        // Extract structured data using OpenAI
        const extractedData = await extractStructuredData(combinedContent, documentType);
        
        // Filter results based on confidence threshold
        const filteredFields = extractedData.extractedFields.filter(
          field => field.confidence >= confidenceValue
        );
        
        // Clean up temporary files after processing
        await cleanupFiles(req.files);
        
        // Return the extracted data
        return res.status(200).json({
          success: true,
          documentType,
          confidenceThreshold: confidenceValue,
          extractedFields: filteredFields,
          totalFieldsExtracted: extractedData.extractedFields.length,
          fieldsAboveThreshold: filteredFields.length
        });
      } catch (processingError) {
        logger.error('Document processing error', { error: processingError.message, stack: processingError.stack });
        
        // Clean up temporary files in case of error
        await cleanupFiles(req.files);
        
        return res.status(500).json({ 
          error: 'Error processing documents', 
          message: processingError.message 
        });
      }
    });
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
    let loader;
    
    // Select the appropriate loader based on file type
    if (fileExt === '.pdf') {
      loader = new PDFLoader(filePath);
    } else if (fileExt === '.docx' || fileExt === '.doc') {
      loader = new DocxLoader(filePath);
    } else if (fileExt === '.txt') {
      loader = new TextLoader(filePath);
    } else {
      throw new Error(`Unsupported file type: ${fileExt}`);
    }
    
    // Load and parse document
    const docs = await loader.load();
    
    // Extract and return the document content
    return docs.map(doc => {
      // Add file metadata to the content
      const metadata = doc.metadata || {};
      return `File: ${file.originalname}\n${metadata.page ? `Page: ${metadata.page}\n` : ''}Content:\n${doc.pageContent}`;
    }).join('\n\n');
  } catch (error) {
    logger.error('Error extracting document content', { 
      filePath, 
      fileType: fileExt, 
      error: error.message 
    });
    
    return null;
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