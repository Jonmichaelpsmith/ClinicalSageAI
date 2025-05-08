/**
 * Internal Clinical Data API
 * 
 * Provides endpoints for managing internal clinical evidence as required by EU MDR,
 * including clinical investigation summaries, PMS reports, registry data, and complaint trends.
 * This module supports the critical regulatory requirement to include ALL available clinical
 * evidence in CERs, not just literature.
 * 
 * Version: 1.0.0
 * Last Updated: May 8, 2025
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';
import openaiService from '../services/openaiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../../uploads/internal-clinical-data');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with original extension
    const uniqueId = uuidv4();
    const originalExt = path.extname(file.originalname);
    cb(null, `${uniqueId}${originalExt}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: function (req, file, cb) {
    // Allow common document and data formats
    const allowedFileTypes = [
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', 
      '.csv', '.txt', '.json', '.xml', '.zip'
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedFileTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only document and data files are allowed.'));
    }
  }
});

const router = express.Router();

// In-memory database for development (replace with actual DB in production)
let internalData = {
  investigations: [],
  pmsReports: [],
  registryData: [],
  complaints: []
};

// Mapping of clinical data types to JSON field locations in CER
const cerFieldMapping = {
  investigations: 'sections.clinicalInvestigations',
  pmsReports: 'sections.postMarketData',
  registryData: 'sections.registryEvidence',
  complaints: 'sections.vigilanceData'
};

/**
 * GET /api/cer/internal-data
 * Retrieve all internal clinical data
 */
router.get('/', (req, res) => {
  try {
    logger.info('Retrieved internal clinical data', { 
      module: 'internal-clinical-data',
      count: Object.values(internalData).flat().length
    });
    
    res.json(internalData);
  } catch (error) {
    logger.error('Error retrieving internal clinical data', {
      module: 'internal-clinical-data',
      error: error.message
    });
    
    res.status(500).json({
      error: 'Failed to retrieve internal clinical data',
      message: error.message
    });
  }
});

/**
 * POST /api/cer/internal-data/upload
 * Upload internal clinical data files with metadata
 */
router.post('/upload', upload.array('files', 10), async (req, res) => {
  try {
    const { category, reportType, studyDesign, dataType, timeframe, sampleSize, summary, author, department, documentId } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded'
      });
    }

    if (!category || !Object.keys(internalData).includes(category)) {
      return res.status(400).json({
        error: 'Invalid or missing category'
      });
    }

    // Process each uploaded file
    const processedFiles = [];
    for (const file of files) {
      // Extract text from file if possible (PDF, DOCX, etc.)
      let extractedText = "";
      try {
        // Basic text extraction (expand in production with proper document parsing libraries)
        if (file.mimetype === 'application/pdf') {
          // In real implementation, use pdf parsing library here
          extractedText = "PDF text extraction placeholder";
        } else if (file.mimetype.includes('word')) {
          // In real implementation, use docx parsing library here
          extractedText = "Word document text extraction placeholder";
        }
      } catch (extractError) {
        logger.warn('Failed to extract text from document', {
          module: 'internal-clinical-data',
          filename: file.originalname,
          error: extractError.message
        });
      }

      // Generate AI summary if OpenAI API key is available and summary is not provided
      let aiGeneratedSummary = null;
      if (process.env.OPENAI_API_KEY && (!summary || summary.trim() === '') && extractedText) {
        try {
          const prompt = `
You are an expert in medical device clinical evaluations and regulatory documentation.

Please analyze the following text extracted from a ${reportType} related to a medical device and generate a concise summary (about 200 words) that would be appropriate for inclusion in a Clinical Evaluation Report under EU MDR requirements.

Focus on:
1. Key safety and performance findings
2. Methodology used
3. Clinical significance of the results
4. Any adverse events or complications reported
5. Relevance to the overall clinical evaluation

Text from document:
${extractedText.substring(0, 3000)}
`;

          const response = await openaiService.generateText({
            prompt,
            maxTokens: 500,
            temperature: 0.3
          });

          aiGeneratedSummary = response.text;
          
          logger.info('Generated AI summary for internal clinical data', {
            module: 'internal-clinical-data',
            filename: file.originalname,
            summaryLength: aiGeneratedSummary.length
          });
        } catch (aiError) {
          logger.warn('Failed to generate AI summary', {
            module: 'internal-clinical-data',
            error: aiError.message
          });
        }
      }

      // Create file record
      const fileRecord = {
        id: uuidv4(),
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date().toISOString(),
        metadata: {
          reportType,
          studyDesign,
          dataType,
          timeframe,
          sampleSize,
          summary: summary || aiGeneratedSummary || 'No summary available',
          author,
          department,
          documentId
        },
        extractedText: extractedText || null,
        processingStatus: 'completed'
      };

      // Add to appropriate category
      internalData[category].push(fileRecord);
      processedFiles.push(fileRecord);
    }

    logger.info('Uploaded internal clinical data files', {
      module: 'internal-clinical-data',
      category,
      count: files.length
    });

    res.status(201).json({
      message: 'Files uploaded successfully',
      files: processedFiles.map(file => ({
        id: file.id,
        name: file.originalName,
        category,
        uploadedAt: file.uploadedAt,
        metadata: file.metadata
      })),
      fileId: processedFiles[0].id // Return the first file ID for convenience
    });
  } catch (error) {
    logger.error('Error uploading internal clinical data', {
      module: 'internal-clinical-data',
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Failed to upload internal clinical data',
      message: error.message
    });
  }
});

/**
 * GET /api/cer/internal-data/:id
 * Retrieve a specific internal clinical data file
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Search for the file across all categories
    let file = null;
    for (const category of Object.keys(internalData)) {
      const found = internalData[category].find(f => f.id === id);
      if (found) {
        file = found;
        break;
      }
    }

    if (!file) {
      return res.status(404).json({
        error: 'Internal clinical data file not found'
      });
    }

    res.json(file);
  } catch (error) {
    logger.error('Error retrieving internal clinical data file', {
      module: 'internal-clinical-data',
      error: error.message,
      fileId: req.params.id
    });

    res.status(500).json({
      error: 'Failed to retrieve internal clinical data file',
      message: error.message
    });
  }
});

/**
 * DELETE /api/cer/internal-data/:id
 * Delete a specific internal clinical data file
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Search for the file across all categories
    let fileCategory = null;
    let fileIndex = -1;
    let filePath = null;

    for (const category of Object.keys(internalData)) {
      const index = internalData[category].findIndex(f => f.id === id);
      if (index !== -1) {
        fileCategory = category;
        fileIndex = index;
        filePath = internalData[category][index].path;
        break;
      }
    }

    if (fileCategory === null || fileIndex === -1) {
      return res.status(404).json({
        error: 'Internal clinical data file not found'
      });
    }

    // Remove from array
    internalData[fileCategory].splice(fileIndex, 1);

    // Delete the physical file if it exists
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    logger.info('Deleted internal clinical data file', {
      module: 'internal-clinical-data',
      fileId: id,
      category: fileCategory
    });

    res.json({
      message: 'Internal clinical data file deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting internal clinical data file', {
      module: 'internal-clinical-data',
      error: error.message,
      fileId: req.params.id
    });

    res.status(500).json({
      error: 'Failed to delete internal clinical data file',
      message: error.message
    });
  }
});

/**
 * GET /api/cer/internal-data/category/:category
 * Retrieve all internal clinical data for a specific category
 */
router.get('/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    
    if (!Object.keys(internalData).includes(category)) {
      return res.status(400).json({
        error: 'Invalid category'
      });
    }

    logger.info('Retrieved internal clinical data by category', {
      module: 'internal-clinical-data',
      category,
      count: internalData[category].length
    });

    res.json(internalData[category]);
  } catch (error) {
    logger.error('Error retrieving internal clinical data by category', {
      module: 'internal-clinical-data',
      error: error.message,
      category: req.params.category
    });

    res.status(500).json({
      error: 'Failed to retrieve internal clinical data by category',
      message: error.message
    });
  }
});

/**
 * POST /api/cer/internal-data/process/:id
 * Process a specific internal clinical data file for CER integration
 */
router.post('/process/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Search for the file across all categories
    let file = null;
    let fileCategory = null;

    for (const category of Object.keys(internalData)) {
      const found = internalData[category].find(f => f.id === id);
      if (found) {
        file = found;
        fileCategory = category;
        break;
      }
    }

    if (!file) {
      return res.status(404).json({
        error: 'Internal clinical data file not found'
      });
    }

    // Initialize processing if not already done
    if (file.processingStatus !== 'completed' || !file.processedData) {
      // Process the data for CER integration
      // In production, use actual document parsing and processing
      
      // Simple example processing
      const processedData = {
        id: file.id,
        title: file.originalName,
        category: fileCategory,
        dateExtracted: new Date().toISOString(),
        author: file.metadata.author,
        timeframe: file.metadata.timeframe,
        sampleSize: file.metadata.sampleSize,
        summary: file.metadata.summary,
        dataType: file.metadata.dataType,
        studyDesign: file.metadata.studyDesign,
        documentId: file.metadata.documentId,
        findings: [],
        adverseEvents: [],
        conclusionStatement: "Conclusion would be extracted from the document"
      };

      // Update file record with processed data
      for (const category of Object.keys(internalData)) {
        const index = internalData[category].findIndex(f => f.id === id);
        if (index !== -1) {
          internalData[category][index].processedData = processedData;
          internalData[category][index].processingStatus = 'completed';
          break;
        }
      }

      logger.info('Processed internal clinical data file for CER integration', {
        module: 'internal-clinical-data',
        fileId: id,
        category: fileCategory
      });

      // Return processed data
      res.json({
        message: 'File processed successfully',
        data: processedData
      });
    } else {
      // Return already processed data
      res.json({
        message: 'File already processed',
        data: file.processedData
      });
    }
  } catch (error) {
    logger.error('Error processing internal clinical data file', {
      module: 'internal-clinical-data',
      error: error.message,
      fileId: req.params.id
    });

    res.status(500).json({
      error: 'Failed to process internal clinical data file',
      message: error.message
    });
  }
});

/**
 * GET /api/cer/internal-data/summary
 * Generate a summary of all internal clinical data for CER inclusion
 */
router.get('/summary', async (req, res) => {
  try {
    // Generate a comprehensive summary of all internal clinical data
    const categoryCounts = {
      investigations: internalData.investigations.length,
      pmsReports: internalData.pmsReports.length,
      registryData: internalData.registryData.length,
      complaints: internalData.complaints.length
    };

    const totalCount = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);

    // If no data available, return empty summary
    if (totalCount === 0) {
      return res.json({
        summary: {
          totalItems: 0,
          categories: categoryCounts,
          narrative: "No internal clinical data available for CER inclusion."
        }
      });
    }

    // Generate category-specific summaries
    const categorySummaries = {};
    for (const category of Object.keys(internalData)) {
      if (internalData[category].length > 0) {
        categorySummaries[category] = {
          count: internalData[category].length,
          items: internalData[category].map(file => ({
            id: file.id,
            title: file.originalName,
            documentId: file.metadata.documentId,
            timeframe: file.metadata.timeframe,
            summary: file.metadata.summary,
            dataType: file.metadata.dataType
          }))
        };
      }
    }

    // Generate a narrative summary if OpenAI is available
    let narrativeSummary = "Internal clinical data summary. (AI-generated narrative not available)";
    
    if (process.env.OPENAI_API_KEY) {
      try {
        // Prepare data summary for the AI
        const promptData = {
          investigations: internalData.investigations.map(item => ({
            title: item.originalName,
            timeframe: item.metadata.timeframe,
            sampleSize: item.metadata.sampleSize,
            summary: item.metadata.summary?.substring(0, 300) || "No summary available"
          })),
          pmsReports: internalData.pmsReports.map(item => ({
            title: item.originalName,
            timeframe: item.metadata.timeframe,
            summary: item.metadata.summary?.substring(0, 300) || "No summary available"
          })),
          registryData: internalData.registryData.map(item => ({
            title: item.originalName,
            timeframe: item.metadata.timeframe,
            sampleSize: item.metadata.sampleSize,
            summary: item.metadata.summary?.substring(0, 300) || "No summary available"
          })),
          complaints: internalData.complaints.map(item => ({
            title: item.originalName,
            timeframe: item.metadata.timeframe,
            summary: item.metadata.summary?.substring(0, 300) || "No summary available"
          }))
        };

        // Create a concise summary of each category's data
        const investigationsSummary = promptData.investigations.length > 0
          ? promptData.investigations.map(i => `- ${i.title} (${i.timeframe || 'No timeframe'}): ${i.summary.substring(0, 100)}...`).join('\n')
          : "No clinical investigations available.";
          
        const pmsSummary = promptData.pmsReports.length > 0
          ? promptData.pmsReports.map(p => `- ${p.title} (${p.timeframe || 'No timeframe'}): ${p.summary.substring(0, 100)}...`).join('\n')
          : "No PMS reports available.";
          
        const registrySummary = promptData.registryData.length > 0
          ? promptData.registryData.map(r => `- ${r.title} (${r.timeframe || 'No timeframe'}): ${r.summary.substring(0, 100)}...`).join('\n')
          : "No registry data available.";
          
        const complaintsSummary = promptData.complaints.length > 0
          ? promptData.complaints.map(c => `- ${c.title} (${c.timeframe || 'No timeframe'}): ${c.summary.substring(0, 100)}...`).join('\n')
          : "No complaint trend data available.";

        const prompt = `
You are an expert in medical device regulatory documentation and clinical evaluations.

Please generate a comprehensive summary (approximately 500 words) of the following internal clinical data for inclusion in a Clinical Evaluation Report (CER) under EU MDR requirements. The summary should provide an overall assessment of the available internal clinical evidence and its significance for the device's safety and performance evaluation.

CLINICAL INVESTIGATIONS:
${investigationsSummary}

POST-MARKET SURVEILLANCE REPORTS:
${pmsSummary}

REGISTRY DATA:
${registrySummary}

COMPLAINT TRENDS:
${complaintsSummary}

Your summary should:
1. Synthesize the key findings across all categories
2. Highlight any important safety or performance insights
3. Note any trends observed across multiple data sources
4. Comment on the overall strength of the internal clinical evidence
5. Be written in a formal, objective style appropriate for regulatory documentation
6. Include statements about the significance of this data for compliance with EU MDR Article 61

The output will be included directly in the CER as a summary of internal clinical evidence.
`;

        const response = await openaiService.generateText({
          prompt,
          maxTokens: 1000,
          temperature: 0.3
        });

        narrativeSummary = response.text;
        
        logger.info('Generated AI narrative summary for internal clinical data', {
          module: 'internal-clinical-data',
          summaryLength: narrativeSummary.length
        });
      } catch (aiError) {
        logger.warn('Failed to generate AI narrative summary', {
          module: 'internal-clinical-data',
          error: aiError.message
        });
      }
    }

    logger.info('Generated internal clinical data summary', {
      module: 'internal-clinical-data',
      totalCount,
      categories: categoryCounts
    });

    res.json({
      summary: {
        totalItems: totalCount,
        categories: categoryCounts,
        categorySummaries: categorySummaries,
        narrative: narrativeSummary
      }
    });
  } catch (error) {
    logger.error('Error generating internal clinical data summary', {
      module: 'internal-clinical-data',
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Failed to generate internal clinical data summary',
      message: error.message
    });
  }
});

export default router;