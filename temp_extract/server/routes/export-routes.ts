import { Router } from 'express';
import { exportService } from '../services/export-service';
import fs from 'fs';
import path from 'path';

const router = Router();

/**
 * Generate and return a study bundle as a ZIP archive
 * GET /api/export/study-bundle?study_id=xxx&persona=yyy
 */
router.get('/study-bundle', async (req, res) => {
  try {
    const { study_id, persona } = req.query;
    
    if (!study_id || typeof study_id !== 'string') {
      return res.status(400).json({ error: 'Study ID is required' });
    }
    
    // Create archive file
    const zipPath = await exportService.createSessionArchive(
      study_id,
      typeof persona === 'string' ? persona : undefined
    );
    
    // Return the path for later download
    res.json({
      success: true,
      zipPath: zipPath,
      downloadUrl: `/api/download/study-bundle?study_id=${study_id}`,
      message: "Export bundle created successfully"
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      error: 'Failed to create export bundle',
      message: error.message || 'Unknown error'
    });
  }
});

/**
 * Download a previously generated study bundle
 * GET /api/download/study-bundle?study_id=xxx
 */
router.get('/download/study-bundle', async (req, res) => {
  try {
    const { study_id } = req.query;
    
    if (!study_id || typeof study_id !== 'string') {
      return res.status(400).json({ error: 'Study ID is required' });
    }
    
    // Look up the most recent bundle for this study ID
    const exportDir = process.env.DATA_PATH 
      ? path.join(process.env.DATA_PATH, 'exports')
      : '/mnt/data/lumen_reports_backend/exports';
    
    try {
      const files = fs.readdirSync(exportDir);
      // Find the most recent ZIP file for this study ID
      const zipFiles = files
        .filter(file => file.startsWith(`${study_id}_bundle_`) && file.endsWith('.zip'))
        .sort()
        .reverse();
      
      if (zipFiles.length === 0) {
        return res.status(404).json({ error: 'No export bundle found for this study ID' });
      }
      
      const zipPath = path.join(exportDir, zipFiles[0]);
      
      // Set headers for file download
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename=${zipFiles[0]}`);
      
      // Stream the file to the response
      const fileStream = fs.createReadStream(zipPath);
      fileStream.pipe(res);
    } catch (err) {
      console.error('Error reading export directory:', err);
      return res.status(500).json({ error: 'Failed to access export files' });
    }
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      error: 'Failed to download export bundle',
      message: error.message || 'Unknown error'
    });
  }
});

export default router;