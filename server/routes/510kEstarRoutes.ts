import express from 'express';
import path from 'path';
import { eSTARPlusBuilder, DigitalSigner, ESGClient } from '../services/eSTARPlusBuilder';

const router = express.Router();

/**
 * Preview an eSTAR Plus package
 * POST /api/fda510k/preview-estar-plus/:projectId
 */
router.post('/preview-estar-plus/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const { includeCoverLetter = true } = req.body;
  
  try {
    // Validate project ID
    if (!projectId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Project ID is required' 
      });
    }
    
    // Generate preview data
    const previewData = await eSTARPlusBuilder.preview(projectId, {
      includeCoverLetter
    });
    
    res.json({
      success: true,
      files: previewData.files,
      aiComplianceReport: previewData.aiComplianceReport
    });
  } catch (error) {
    console.error('Error previewing eSTAR package:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to preview eSTAR package' 
    });
  }
});

/**
 * Build and download an eSTAR Plus package
 * POST /api/fda510k/build-estar-plus/:projectId
 */
router.post('/build-estar-plus/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const { 
    includeCoverLetter = true,
    autoUpload = false 
  } = req.body;
  
  try {
    // Validate project ID
    if (!projectId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Project ID is required' 
      });
    }
    
    // Build the package
    const result = await eSTARPlusBuilder.build(projectId, {
      includeCoverLetter,
      autoUpload
    });
    
    res.json({
      success: true,
      packagePath: result.zipPath, // Use zipPath as packagePath
      downloadUrl: result.downloadUrl || `/api/fda510k/download/${path.basename(result.zipPath)}`,
      esgStatus: result.esgStatus
    });
  } catch (error) {
    console.error('Error building eSTAR package:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to build eSTAR package' 
    });
  }
});

/**
 * Verify digital signature on an eSTAR package
 * GET /api/fda510k/verify-signature/:projectId
 */
router.get('/verify-signature/:projectId', async (req, res) => {
  const { projectId } = req.params;
  
  try {
    // Generate a test manifest for the project with real data
    const manifest = await eSTARPlusBuilder.generateTestManifest(projectId);
    
    // Verify the signature
    const verification = await DigitalSigner.verifySignature(manifest);
    
    res.json({
      success: true,
      verification
    });
  } catch (error) {
    console.error('Error verifying digital signature:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to verify digital signature' 
    });
  }
});

/**
 * Create default sections for a 510(k) project
 * POST /api/fda510k/create-default-sections/:projectId
 */
router.post('/create-default-sections/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const { organizationId } = req.body;
  
  try {
    // Validate required params
    if (!projectId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Project ID is required' 
      });
    }
    
    if (!organizationId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Organization ID is required' 
      });
    }
    
    // Create default sections
    const sections = await eSTARPlusBuilder.createDefaultSections(projectId, organizationId);
    
    res.json({
      success: true,
      message: `Created ${sections.length} default sections`,
      sections
    });
  } catch (error) {
    console.error('Error creating default sections:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create default sections' 
    });
  }
});

/**
 * Download an eSTAR package file
 * GET /api/fda510k/download/:filename
 */
router.get('/download/:filename', async (req, res) => {
  const { filename } = req.params;
  
  try {
    // Get file path
    const filePath = path.join('/tmp', filename);
    
    // Check if file exists
    if (!require('fs').existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'application/zip');
    
    // Stream the file
    const fileStream = require('fs').createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to download file' 
    });
  }
});

export default router;