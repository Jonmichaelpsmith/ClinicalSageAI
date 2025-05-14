/**
 * Document Assembly Routes
 * 
 * This module provides API routes for assembling CER and 510(k) documents from their
 * component sections, validating them, and making them available for download.
 */

import express from 'express';
import path from 'path';
import documentAssemblyService from '../services/documentAssemblyService.js';

const router = express.Router();

// Initialize the document assembly service
(async () => {
  await documentAssemblyService.initialize();
})();

/**
 * @route POST /api/document-assembly/cer
 * @description Assemble a complete CER document from sections and metadata
 * @access Private
 */
router.post('/cer', async (req, res) => {
  try {
    const { cerData } = req.body;
    
    if (!cerData) {
      return res.status(400).json({
        success: false,
        message: 'CER data is required'
      });
    }
    
    const result = await documentAssemblyService.assembleCERDocument(cerData);
    
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error assembling CER document:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to assemble CER document'
    });
  }
});

/**
 * @route POST /api/document-assembly/510k
 * @description Assemble a 510(k) submission document
 * @access Private
 */
router.post('/510k', async (req, res) => {
  try {
    const { submission510kData } = req.body;
    
    if (!submission510kData) {
      return res.status(400).json({
        success: false,
        message: '510(k) submission data is required'
      });
    }
    
    const result = await documentAssemblyService.assemble510kDocument(submission510kData);
    
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error assembling 510(k) document:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to assemble 510(k) document'
    });
  }
});

/**
 * @route GET /api/document-assembly/status/:assemblyId
 * @description Get the status of a document assembly operation
 * @access Private
 */
router.get('/status/:assemblyId', async (req, res) => {
  try {
    const { assemblyId } = req.params;
    
    if (!assemblyId) {
      return res.status(400).json({
        success: false,
        message: 'Assembly ID is required'
      });
    }
    
    const status = documentAssemblyService.getAssemblyStatus(assemblyId);
    
    if (!status) {
      return res.status(404).json({
        success: false,
        message: 'Assembly not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Error getting assembly status:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get assembly status'
    });
  }
});

/**
 * @route GET /api/document-assembly/list
 * @description List recent document assembly operations
 * @access Private
 */
router.get('/list', async (req, res) => {
  try {
    const { limit = 10, type } = req.query;
    
    const assemblies = documentAssemblyService.listAssemblies({
      limit: parseInt(limit),
      type
    });
    
    return res.status(200).json({
      success: true,
      assemblies
    });
  } catch (error) {
    console.error('Error listing assemblies:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to list assembly operations'
    });
  }
});

/**
 * @route GET /api/document-assembly/download/:assemblyId
 * @description Download an assembled document
 * @access Private
 */
router.get('/download/:assemblyId', async (req, res) => {
  try {
    const { assemblyId } = req.params;
    
    if (!assemblyId) {
      return res.status(400).json({
        success: false,
        message: 'Assembly ID is required'
      });
    }
    
    const status = documentAssemblyService.getAssemblyStatus(assemblyId);
    
    if (!status) {
      return res.status(404).json({
        success: false,
        message: 'Assembly not found'
      });
    }
    
    if (status.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: `Assembly is not ready for download (status: ${status.status})`
      });
    }
    
    if (!status.outputPath) {
      return res.status(500).json({
        success: false,
        message: 'Assembly output path is missing'
      });
    }
    
    // Send the file
    const filename = path.basename(status.outputPath);
    res.download(status.outputPath, filename);
  } catch (error) {
    console.error('Error downloading assembly:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to download assembly'
    });
  }
});

export default router;