/**
 * Document Intelligence Routes
 * 
 * This module provides API routes for the document intelligence functionality.
 * It handles document uploads, data extraction, and application of extracted
 * data to device profiles.
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { OpenAI } = require('openai');

// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/documents');
    
    // Ensure the directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with original extension
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Filter for accepted file types
const fileFilter = (req, file, cb) => {
  const acceptedTypes = [
    // Documents
    '.pdf', '.docx', '.doc', '.txt', '.rtf',
    // Spreadsheets 
    '.xlsx', '.xls', '.csv',
    // Images
    '.jpg', '.jpeg', '.png', '.gif',
    // XML/JSON
    '.xml', '.json',
    // Archive
    '.zip'
  ];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (acceptedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} is not supported`), false);
  }
};

// Initialize multer with storage and file filter
const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
    files: 10 // Maximum 10 files at once
  }
});

// Initialize OpenAI client if API key is available
let openaiClient;
try {
  if (process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log('OpenAI client initialized for document intelligence');
  } else {
    console.warn('OPENAI_API_KEY not found, document intelligence will use fallback modes');
  }
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
}

/**
 * Upload documents for processing
 * POST /api/document-intelligence/upload
 */
router.post('/upload', upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files || [];
    const regulatoryContext = req.body.regulatoryContext || '510k';
    
    if (!files.length) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    
    console.log(`Received ${files.length} files for processing in context: ${regulatoryContext}`);
    
    // Process uploaded files
    const processedDocuments = await Promise.all(files.map(async (file, index) => {
      // Recognize document type using filename patterns or content analysis
      const documentType = await recognizeDocumentType(file, regulatoryContext);
      
      return {
        id: `doc-${uuidv4()}`,
        name: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        recognizedType: documentType.type,
        confidence: documentType.confidence,
        pageCount: await estimatePageCount(file),
        processedAt: new Date().toISOString(),
      };
    }));
    
    return res.status(200).json({
      success: true,
      processedDocuments,
      message: 'Documents processed successfully'
    });
    
  } catch (error) {
    console.error('Error processing uploaded documents:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process documents'
    });
  }
});

/**
 * Extract data from processed documents
 * POST /api/document-intelligence/extract
 */
router.post('/extract', async (req, res) => {
  try {
    const { documents, regulatoryContext, extractionMode } = req.body;
    
    if (!documents || !Array.isArray(documents) || !documents.length) {
      return res.status(400).json({
        success: false,
        message: 'No documents provided for extraction'
      });
    }
    
    console.log(`Extracting data from ${documents.length} documents in ${regulatoryContext} context`);
    
    // Extract data from documents
    const extractedData = await extractDocumentData(documents, regulatoryContext, extractionMode);
    
    return res.status(200).json({
      success: true,
      extractedData,
      message: 'Data extracted successfully',
      confidence: 0.89, // This would be calculated based on actual extraction confidence
    });
    
  } catch (error) {
    console.error('Error extracting document data:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to extract data from documents'
    });
  }
});

/**
 * Apply extracted data to a device profile
 * POST /api/document-intelligence/apply/:deviceId
 */
router.post('/apply/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { extractedData } = req.body;
    
    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Device ID is required'
      });
    }
    
    if (!extractedData || Object.keys(extractedData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No data provided to apply to device profile'
      });
    }
    
    console.log(`Applying extracted data to device profile: ${deviceId}`);
    
    // Apply extracted data to device profile
    const updatedDevice = await applyDataToDeviceProfile(deviceId, extractedData);
    
    return res.status(200).json({
      success: true,
      deviceId,
      updatedFields: Object.keys(extractedData),
      message: 'Data applied to device profile successfully',
    });
    
  } catch (error) {
    console.error('Error applying data to device profile:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to apply data to device profile'
    });
  }
});

/**
 * Get document type recognition model info
 * GET /api/document-intelligence/model-info
 */
router.get('/model-info', (req, res) => {
  try {
    const modelInfo = {
      documentTypeRecognition: {
        model: 'GPT-4o',
        version: '2025-05-01',
        supportedTypes: [
          '510(k) Submission',
          'Technical File',
          'Instructions for Use',
          'Test Report',
          'Clinical Study'
        ]
      },
      dataExtraction: {
        model: 'GPT-4o',
        version: '2025-05-01',
      }
    };
    
    return res.status(200).json({
      success: true,
      modelInfo
    });
    
  } catch (error) {
    console.error('Error getting model info:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get model info'
    });
  }
});

/**
 * Search for documents in the repository
 * GET /api/document-intelligence/search
 */
router.get('/search', (req, res) => {
  try {
    const { query, documentType, dateRange, limit = 10, page = 1 } = req.query;
    
    // This would be implemented with actual database search
    // For now, return empty results
    return res.status(200).json({
      success: true,
      results: [],
      totalCount: 0,
      page,
      limit,
    });
    
  } catch (error) {
    console.error('Error searching documents:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to search documents'
    });
  }
});

// Helper functions

/**
 * Recognize document type from file
 * @param {Object} file - The uploaded file object
 * @param {string} regulatoryContext - Regulatory context (510k, mdr, etc.)
 * @returns {Promise<Object>} - Recognized document type and confidence
 */
async function recognizeDocumentType(file, regulatoryContext) {
  // In a real implementation, this would use AI to analyze the document content
  // For this prototype, use the filename to guess the document type
  
  const filename = file.originalname.toLowerCase();
  
  // Simple pattern matching for document types
  if (filename.includes('510k') || filename.includes('submission')) {
    return { type: '510(k) Submission', confidence: 0.9 };
  } else if (filename.includes('ifu') || filename.includes('instructions')) {
    return { type: 'Instructions for Use', confidence: 0.85 };
  } else if (filename.includes('test') || filename.includes('report')) {
    return { type: 'Test Report', confidence: 0.8 };
  } else if (filename.includes('technical') || filename.includes('tech file')) {
    return { type: 'Technical File', confidence: 0.85 };
  } else if (filename.includes('clinical') || filename.includes('study')) {
    return { type: 'Clinical Study', confidence: 0.8 };
  } else {
    // If no clear pattern, return a generic type with low confidence
    return { type: 'Unknown', confidence: 0.5 };
  }
}

/**
 * Estimate page count from a file
 * @param {Object} file - The uploaded file object
 * @returns {Promise<number>} - Estimated page count
 */
async function estimatePageCount(file) {
  // In a real implementation, this would analyze the file to determine page count
  // For this prototype, return a random number between 1 and 50
  return Math.floor(Math.random() * 50) + 1;
}

/**
 * Extract data from documents
 * @param {Array} documents - The processed documents
 * @param {string} regulatoryContext - Regulatory context (510k, mdr, etc.)
 * @param {string} extractionMode - Extraction mode (basic, comprehensive, etc.)
 * @returns {Promise<Object>} - Extracted data
 */
async function extractDocumentData(documents, regulatoryContext, extractionMode) {
  // In a real implementation, this would use AI to extract data from the documents
  // For this prototype, return mock data based on document types
  
  const extractedData = {};
  
  // Extract different fields based on document types
  const documentTypes = documents.map(doc => doc.recognizedType);
  
  // Basic device information that might be in any document
  extractedData.deviceName = 'Cardiovascular Monitoring System';
  extractedData.manufacturer = 'MedTech Innovations';
  
  // Add additional fields based on document types
  if (documentTypes.includes('510(k) Submission')) {
    extractedData.modelNumber = 'CVS-2000';
    extractedData.deviceType = 'Cardiovascular';
    extractedData.deviceClass = 'II';
    extractedData.regulatoryClass = 'II';
    extractedData.productCode = 'DRT';
    extractedData.regulationNumber = '870.2300';
  }
  
  if (documentTypes.includes('Technical File')) {
    extractedData.specifications = 'Wireless monitoring, 48-hour battery life, IP67 rated';
    extractedData.dimensions = '120mm x 80mm x 15mm';
    extractedData.materials = 'Medical-grade silicone, biocompatible plastics';
    extractedData.sterilization = 'EtO sterilization validated';
  }
  
  if (documentTypes.includes('Instructions for Use') || documentTypes.includes('Clinical Study')) {
    extractedData.intendedUse = 'Continuous monitoring of cardiac rhythm and vital signs in clinical settings';
    extractedData.indications = 'For patients requiring continuous cardiac monitoring in hospital environments';
    extractedData.contraindications = 'Not for use in MRI environments';
    extractedData.warnings = 'Device contains small parts, keep away from children';
  }
  
  return extractedData;
}

/**
 * Apply extracted data to a device profile
 * @param {string} deviceId - The device ID
 * @param {Object} extractedData - The extracted data
 * @returns {Promise<Object>} - Updated device profile
 */
async function applyDataToDeviceProfile(deviceId, extractedData) {
  // In a real implementation, this would update the device profile in the database
  // For this prototype, just return success
  return { success: true, deviceId, updatedFields: Object.keys(extractedData) };
}

module.exports = router;