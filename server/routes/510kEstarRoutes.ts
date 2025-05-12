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
    // Retrieve latest manifest for the project
    // This is a mock implementation - in production, you would fetch the actual manifest
    const manifest = await eSTARPlusBuilder.getMockManifest(projectId);
    
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

export default router;