import { Request, Response, Router } from 'express';
import fs from 'fs';
import path from 'path';

const reportsManifestRoutes = Router();
const REPORTS_ROOT_DIR = 'lumen_reports_backend/static/example_reports';
const LAUNCH_CONFIG_PATH = 'attached_assets/launch_config.json';

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

/**
 * Get launch configuration for example reports
 */
reportsManifestRoutes.get('/launch-config', async (_req: Request, res: Response) => {
  try {
    const configPath = path.join(process.cwd(), LAUNCH_CONFIG_PATH);
    
    if (!fs.existsSync(configPath)) {
      return res.status(404).json({
        success: false,
        message: 'Launch configuration not found'
      });
    }
    
    const launchConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    res.json(launchConfig);
  } catch (error: any) {
    console.error('Error fetching launch configuration:', error);
    res.status(500).json({
      success: false,
      message: `Error fetching launch configuration: ${error.message}`
    });
  }
});

/**
 * Get report index for example reports
 */
reportsManifestRoutes.get('/index', async (_req: Request, res: Response) => {
  try {
    const indexPath = path.join(process.cwd(), 'attached_assets', 'report_index.json');
    
    if (!fs.existsSync(indexPath)) {
      console.error(`Report index not found at path: ${indexPath}`);
      return res.status(404).json({
        success: false,
        message: 'Report index not found'
      });
    }
    
    // Read the file contents
    const fileContents = fs.readFileSync(indexPath, 'utf-8');
    console.log(`Got file contents with length: ${fileContents.length}`);
    
    // Parse the JSON
    const reportIndex = JSON.parse(fileContents);
    
    // Send the data directly without wrapping
    res.json(reportIndex);
  } catch (error: any) {
    console.error('Error fetching report index:', error);
    res.status(500).json({
      success: false,
      message: `Error fetching report index: ${error.message}`
    });
  }
});

export default reportsManifestRoutes;