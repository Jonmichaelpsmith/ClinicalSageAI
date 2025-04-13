import { Request, Response, Router } from 'express';
import fs from 'fs';
import path from 'path';

const reportsManifestRoutes = Router();
const REPORTS_ROOT_DIR = 'lumen_reports_backend/static/example_reports';

/**
 * Get the root report index with all personas
 */
reportsManifestRoutes.get('/personas', async (_req: Request, res: Response) => {
  try {
    const indexPath = path.join(REPORTS_ROOT_DIR, 'report_index.json');
    
    if (!fs.existsSync(indexPath)) {
      return res.status(404).json({
        success: false,
        message: 'Report index not found'
      });
    }
    
    const reportIndex = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    res.json(reportIndex);
  } catch (error: any) {
    console.error('Error fetching report personas:', error);
    res.status(500).json({
      success: false,
      message: `Error fetching report personas: ${error.message}`
    });
  }
});

/**
 * Get manifest for a specific persona
 */
reportsManifestRoutes.get('/persona/:personaId', async (req: Request, res: Response) => {
  try {
    const { personaId } = req.params;
    const manifestPath = path.join(REPORTS_ROOT_DIR, personaId, 'manifest.json');
    
    if (!fs.existsSync(manifestPath)) {
      return res.status(404).json({
        success: false,
        message: `Manifest for ${personaId} not found`
      });
    }
    
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    res.json(manifest);
  } catch (error: any) {
    console.error(`Error fetching persona manifest:`, error);
    res.status(500).json({
      success: false,
      message: `Error fetching persona manifest: ${error.message}`
    });
  }
});

export default reportsManifestRoutes;