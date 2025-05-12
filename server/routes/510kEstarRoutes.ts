import { Router } from 'express';
import eSTARPlusBuilder, { DigitalSigner } from '../services/eSTARPlusBuilder';
import path from 'path';
import fs from 'fs';

const router = Router();

/**
 * Build and download an eSTAR Plus package
 * POST /api/fda510k/build-estar-plus/:projectId
 */
router.post('/build-estar-plus/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { autoUpload, includeCoverLetter } = req.body;
    
    console.log(`Building eSTAR package for project ${projectId}`, {
      autoUpload,
      includeCoverLetter
    });
    
    const result = await eSTARPlusBuilder.build(projectId, { 
      includeCoverLetter: includeCoverLetter === true, 
      autoUpload: autoUpload === true
    });
    
    if (autoUpload) {
      // If auto-uploaded, return the ESG status
      res.json({ 
        success: true,
        downloadUrl: null, 
        esgStatus: result.esgStatus 
      });
    } else {
      // Otherwise, download the file
      const fileName = path.basename(result.zipPath);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', 'application/zip');
      
      if (fs.existsSync(result.zipPath)) {
        const fileStream = fs.createReadStream(result.zipPath);
        fileStream.pipe(res);
      } else {
        res.status(404).json({ success: false, error: 'Package file not found' });
      }
    }
  } catch (error) {
    console.error('Error building eSTAR package:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to build eSTAR package'
    });
  }
});

/**
 * Preview an eSTAR Plus package
 * POST /api/fda510k/preview-estar-plus/:projectId
 */
router.post('/preview-estar-plus/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { includeCoverLetter } = req.body;
    
    console.log(`Previewing eSTAR package for project ${projectId}`, {
      includeCoverLetter
    });
    
    const preview = await eSTARPlusBuilder.preview(projectId, { 
      includeCoverLetter: includeCoverLetter === true
    });
    
    res.json({
      success: true,
      ...preview
    });
  } catch (error) {
    console.error('Error previewing eSTAR package:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to preview eSTAR package'
    });
  }
});

/**
 * Verify digital signature on an eSTAR package
 * GET /api/fda510k/verify-signature/:projectId
 */
router.get('/verify-signature/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // In a real implementation, this would get the signature from a stored manifest
    // This is a simplified version that returns a mock response
    
    const result = {
      valid: true,
      message: 'Signature valid',
      signedBy: 'TrialSage eSTAR System',
      signedAt: new Date().toISOString(),
      hashAlgorithm: 'HMAC-SHA256'
    };
    
    res.json({
      success: true,
      verification: result
    });
  } catch (error) {
    console.error('Error verifying signature:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to verify signature'
    });
  }
});

export default router;