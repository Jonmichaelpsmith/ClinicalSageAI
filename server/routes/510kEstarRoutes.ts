import express from 'express';
import path from 'path';
import { eSTARPlusBuilder, DigitalSigner, ESGClient } from '../services/eSTARPlusBuilder';

const estarRouter = express.Router();

/**
 * Preview an eSTAR Plus package
 * POST /api/fda510k/preview-estar-plus/:projectId
 */
estarRouter.post('/preview-estar-plus/:projectId', async (req: express.Request, res: express.Response) => {
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
  } catch (error: unknown) {
    console.error('Error previewing eSTAR package:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to preview eSTAR package';
    res.status(500).json({ 
      success: false, 
      message: errorMessage
    });
  }
});

/**
 * Build and download/upload an eSTAR Plus package
 * POST /api/fda510k/build-estar-plus/:projectId
 */
estarRouter.post('/build-estar-plus/:projectId', async (req: express.Request, res: express.Response) => {
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
      downloadUrl: `/api/fda510k/download/${path.basename(result.zipPath)}`,
      esgStatus: result.esgStatus
    });
  } catch (error: unknown) {
    console.error('Error building eSTAR package:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to build eSTAR package';
    res.status(500).json({ 
      success: false, 
      message: errorMessage
    });
  }
});

/**
 * Verify digital signature on an eSTAR package
 * GET /api/fda510k/verify-signature/:projectId
 */
estarRouter.get('/verify-signature/:projectId', async (req: express.Request, res: express.Response) => {
  const { projectId } = req.params;
  
  try {
    // Generate test manifest for demo
    const manifest = await eSTARPlusBuilder.generateTestManifest(projectId);
    
    // Verify the signature
    const verification = await DigitalSigner.verifySignature(manifest);
    
    res.json({
      success: true,
      verification
    });
  } catch (error: unknown) {
    console.error('Error verifying digital signature:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to verify digital signature';
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
});

/**
 * Create default sections for a 510(k) project
 * POST /api/fda510k/create-default-sections/:projectId
 */
estarRouter.post('/create-default-sections/:projectId', async (req: express.Request, res: express.Response) => {
  const { projectId } = req.params;
  const { organizationId } = req.body;
  
  try {
    // Validate inputs
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
  } catch (error: unknown) {
    console.error('Error creating default sections:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create default sections';
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
});

/**
 * Download an eSTAR package file
 * GET /api/fda510k/download/:filename
 */
estarRouter.get('/download/:filename', async (req: express.Request, res: express.Response) => {
  const { filename } = req.params;
  
  try {
    // Validate filename
    if (!filename) {
      return res.status(400).json({ 
        success: false, 
        message: 'Filename is required' 
      });
    }
    
    // Construct the file path (temp directory for now)
    const filePath = path.join(__dirname, '../../temp', filename);
    
    // Check if file exists
    const fs = await import('fs');
    const fileExists = fs.existsSync(filePath);
    
    if (!fileExists) {
      return res.status(404).json({ 
        success: false,
        message: 'File not found'
      });
    }
    
    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'application/zip');
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error: unknown) {
    console.error('Error downloading file:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to download file';
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
});

/**
 * Validate an eSTAR package against FDA requirements
 * POST /api/fda510k/validate-estar/:projectId
 */
estarRouter.post('/validate-estar/:projectId', async (req: express.Request, res: express.Response) => {
  const { projectId } = req.params;
  const { strictMode = false } = req.body;
  
  try {
    // Validate project ID
    if (!projectId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Project ID is required' 
      });
    }
    
    // Perform eSTAR package validation
    const validationResult = await eSTARPlusBuilder.validatePackage(projectId, strictMode);
    
    res.json({
      success: true,
      validation: validationResult
    });
  } catch (error: unknown) {
    console.error('Error validating eSTAR package:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to validate eSTAR package';
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
});

export default estarRouter;