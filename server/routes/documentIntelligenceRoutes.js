/**
 * Document Intelligence Routes
 * 
 * This file defines the API routes for document intelligence functionality,
 * including document processing, data extraction, and profile integration.
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Create router
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'document-intelligence');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const ext = path.extname(file.originalname);
    const id = uuidv4();
    cb(null, `${id}${ext}`);
  }
});

// File filter for acceptable document types
const fileFilter = (req, file, cb) => {
  // Accept common document file types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'image/jpeg',
    'image/png',
    'application/xml',
    'application/json',
    'application/zip'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

// Configure upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  }
});

/**
 * Process documents route
 * Handles document upload and initial processing
 */
router.post('/process', upload.array('documents', 10), async (req, res) => {
  try {
    // Get regulatory context from request
    const regulatoryContext = req.body.regulatoryContext || '510k';
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }
    
    // Mock document processing
    // In a real implementation, this would connect to OCR and document analysis services
    const processedDocuments = req.files.map(file => {
      // Get file metadata
      const { filename, originalname, size, mimetype } = file;
      const filepath = path.join('uploads', 'document-intelligence', filename);
      
      // Detect document type based on filename and context
      let recognizedType = 'Unknown Document';
      const filenameLower = originalname.toLowerCase();
      
      if (regulatoryContext === '510k') {
        if (filenameLower.includes('510') || filenameLower.includes('k')) {
          recognizedType = '510k Submission';
        } else if (filenameLower.includes('predicate')) {
          recognizedType = 'Predicate Device';
        } else if (filenameLower.includes('test') || filenameLower.includes('study')) {
          recognizedType = 'Test Report';
        } else if (filenameLower.includes('spec') || filenameLower.includes('technical')) {
          recognizedType = 'Technical Specifications';
        }
      } else if (regulatoryContext === 'cer') {
        if (filenameLower.includes('cer')) {
          recognizedType = 'Clinical Evaluation Report';
        } else if (filenameLower.includes('clinical')) {
          recognizedType = 'Clinical Study';
        } else if (filenameLower.includes('literature')) {
          recognizedType = 'Literature Review';
        } else if (filenameLower.includes('post') || filenameLower.includes('market')) {
          recognizedType = 'Post-Market Data';
        }
      }
      
      // Default document types based on file extension
      if (recognizedType === 'Unknown Document') {
        const ext = path.extname(filenameLower);
        if (ext === '.pdf') recognizedType = 'PDF Document';
        else if (ext === '.docx' || ext === '.doc') recognizedType = 'Word Document';
        else if (ext === '.xlsx' || ext === '.xls') recognizedType = 'Excel Spreadsheet';
        else if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') recognizedType = 'Image';
      }
      
      // Return processed document metadata
      return {
        id: path.parse(filename).name, // Use filename without extension as ID
        name: originalname,
        size,
        type: mimetype,
        path: filepath,
        recognizedType,
        status: 'processed'
      };
    });

    // Send response
    res.json({
      success: true,
      message: `Successfully processed ${processedDocuments.length} documents`,
      processedDocuments
    });
  } catch (error) {
    console.error('Error processing documents:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing documents'
    });
  }
});

/**
 * Extract data from documents route
 * Performs detailed analysis and data extraction on processed documents
 */
router.post('/extract', async (req, res) => {
  try {
    const { processedDocuments, regulatoryContext } = req.body;
    
    if (!processedDocuments || !Array.isArray(processedDocuments) || processedDocuments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No processed documents provided'
      });
    }
    
    // Mock data extraction based on document types
    // In a real implementation, this would use OCR, NLP, and AI services
    
    // Identify document types for specialized extraction
    const docTypes = processedDocuments.map(doc => doc.recognizedType);
    const hasTechnicalDoc = docTypes.some(type => 
      type.includes('Technical') || type.includes('Specification'));
    const has510kDoc = docTypes.some(type => 
      type.includes('510k') || type.includes('Submission'));
    const hasStudyDoc = docTypes.some(type => 
      type.includes('Study') || type.includes('Clinical'));
    
    // Prepare extracted data object
    let extractedData = {
      deviceName: '',
      manufacturer: '',
      modelNumber: '',
      intendedUse: '',
      deviceClass: '',
      regulatoryStatus: '',
      technicalSpecifications: {},
      predicateDevices: [],
      clinicalData: {},
      extractionTimestamp: new Date().toISOString()
    };
    
    // Populate with contextual mock data
    if (regulatoryContext === '510k') {
      extractedData = {
        ...extractedData,
        deviceName: has510kDoc ? 'Advanced Medical Device XR-5' : 'Sample Medical Device',
        manufacturer: 'MedTech Innovations, Inc.',
        modelNumber: 'XR-5-2025',
        intendedUse: 'For diagnostic use in clinical settings to monitor patient vital signs',
        deviceClass: 'Class II',
        regulatoryStatus: 'Pending 510(k) Clearance',
        predicateDevices: [
          { name: 'XR-4 Monitoring System', manufacturer: 'MedTech Innovations', k_number: 'K220789' }
        ]
      };
    } else if (regulatoryContext === 'cer') {
      extractedData = {
        ...extractedData,
        deviceName: 'Clinical Monitoring System CMS-3',
        manufacturer: 'EuroMed Devices GmbH',
        modelNumber: 'CMS-3-2025',
        intendedUse: 'For continuous monitoring of patient vital signs in clinical settings',
        deviceClass: 'Class IIb',
        regulatoryStatus: 'CE Marked',
        clinicalData: {
          studies: 3,
          totalPatients: 250,
          adverseEvents: 2,
          effectiveness: '97.8%'
        }
      };
    }
    
    // Add technical specifications if technical document is present
    if (hasTechnicalDoc) {
      extractedData.technicalSpecifications = {
        dimensions: '12 x 8 x 3 cm',
        weight: '320g',
        powerSupply: 'Rechargeable Li-ion battery, 3.7V, 5000mAh',
        batteryLife: '12 hours continuous operation',
        display: '5-inch HD touchscreen',
        connectivity: 'Bluetooth 5.0, Wi-Fi 6',
        operatingTemperature: '10°C to 40°C',
        storageTemperature: '-20°C to 60°C',
        waterResistance: 'IPX4 rated',
        certifications: 'ISO 13485, IEC 60601-1'
      };
    }
    
    // Add clinical data if study documents are present
    if (hasStudyDoc) {
      extractedData.clinicalData = {
        ...extractedData.clinicalData,
        studySummary: 'Prospective multi-center study with 250 patients across 5 clinical sites',
        primaryEndpoint: 'Device accuracy compared to standard of care',
        results: 'Demonstrated 97.8% accuracy with 95% confidence interval of (96.2%, 99.1%)',
        adverseEvents: '2 minor adverse events reported, both resolved without intervention',
        conclusion: 'The device demonstrated safety and effectiveness for its intended use'
      };
    }

    // Send response with extracted data
    res.json({
      success: true,
      message: 'Successfully extracted data from documents',
      extractedData
    });
  } catch (error) {
    console.error('Error extracting data:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error extracting data from documents'
    });
  }
});

/**
 * Apply extracted data to a device profile
 */
router.post('/apply', async (req, res) => {
  try {
    const { extractedData, deviceProfileId } = req.body;
    
    if (!extractedData) {
      return res.status(400).json({
        success: false,
        message: 'No extracted data provided'
      });
    }
    
    if (!deviceProfileId) {
      return res.status(400).json({
        success: false,
        message: 'No device profile ID provided'
      });
    }
    
    // Mock profile update
    // In a real implementation, this would update the device profile in the database
    const updatedProfile = {
      id: deviceProfileId,
      ...extractedData,
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: 'Document Intelligence System',
      dataSource: 'Automated Extraction'
    };
    
    // Send response
    res.json({
      success: true,
      message: 'Successfully applied extracted data to device profile',
      updatedProfile
    });
  } catch (error) {
    console.error('Error applying extracted data:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error applying extracted data to device profile'
    });
  }
});

/**
 * Get compatible document types
 */
router.get('/document-types', (req, res) => {
  const { regulatoryContext } = req.query;
  
  let documentTypes = [];
  
  // Return different document types based on regulatory context
  if (regulatoryContext === '510k') {
    documentTypes = [
      { id: '510k', name: '510(k) Submission', description: 'FDA 510(k) submission documents' },
      { id: 'predicate', name: 'Predicate Device', description: 'Information about predicate devices' },
      { id: 'test', name: 'Test Reports', description: 'Performance and safety testing documentation' },
      { id: 'technical', name: 'Technical Documentation', description: 'Device specifications and technical details' }
    ];
  } else if (regulatoryContext === 'cer') {
    documentTypes = [
      { id: 'cer', name: 'Clinical Evaluation Report', description: 'Full or partial CER documents' },
      { id: 'clinical', name: 'Clinical Study', description: 'Clinical study protocols and results' },
      { id: 'literature', name: 'Literature Review', description: 'Scientific literature and publications' },
      { id: 'post-market', name: 'Post-Market Data', description: 'Post-market surveillance data' },
      { id: 'risk', name: 'Risk Analysis', description: 'Risk management documentation' }
    ];
  } else {
    // Default document types for any context
    documentTypes = [
      { id: 'technical', name: 'Technical Documentation', description: 'Technical specifications and engineering documents' },
      { id: 'regulatory', name: 'Regulatory Filings', description: 'Previous regulatory submissions and approvals' },
      { id: 'clinical', name: 'Clinical Studies', description: 'Clinical trial protocols and results' },
      { id: 'quality', name: 'Quality Management', description: 'Quality system documentation and procedures' }
    ];
  }
  
  res.json({
    success: true,
    documentTypes
  });
});

module.exports = router;