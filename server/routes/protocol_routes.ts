import { Router, Request, Response, Express } from 'express';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { protocolOptimizerService } from '../protocol-optimizer-service';
import { protocolAnalyzerService } from '../protocol-analyzer-service';
import { generateSAP } from '../utils/generate_sap_snippet';
import { trialPredictorService } from '../trial-predictor-service';

const router = Router();

// Function to register protocol routes
function registerProtocolRoutes(app: Express): void {
  app.use('/api/protocol', router);
}

// Create temp directory if it doesn't exist
const tempDir = path.join(process.cwd(), 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

/**
 * Full protocol analysis endpoint - parse text and extract structured data
 */
router.post('/full-analyze', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Protocol text is required'
      });
    }
    
    // Use protocol analyzer service to extract structured data
    const parsed = await protocolAnalyzerService.parseProtocolText(text);
    
    res.json(parsed);
    
  } catch (error) {
    console.error('Error analyzing protocol text:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to analyze protocol'
    });
  }
});

/**
 * Risk profile and success prediction endpoint
 */
router.post('/risk-profile', async (req: Request, res: Response) => {
  try {
    const protocolData = req.body;
    
    if (!protocolData) {
      return res.status(400).json({
        success: false,
        message: 'Protocol data is required'
      });
    }
    
    // Get success prediction
    const prediction = await trialPredictorService.predictTrialSuccess(
      protocolData.sample_size,
      protocolData.duration_weeks,
      protocolData.dropout_rate
    );
    
    res.json({
      success_probability: prediction.probability,
      contributing_factors: prediction.featureContributions
    });
    
  } catch (error) {
    console.error('Error generating risk profile:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to generate risk profile'
    });
  }
});

/**
 * Protocol optimization endpoint with detailed recommendations
 */
router.post('/optimize-deep', async (req: Request, res: Response) => {
  try {
    const protocolData = req.body;
    
    if (!protocolData) {
      return res.status(400).json({
        success: false,
        message: 'Protocol data is required'
      });
    }
    
    // Get optimization recommendations
    const optimizationResult = await protocolOptimizerService.getDeepOptimizationRecommendations(
      protocolData,
      {} // Benchmarks will be fetched automatically if not provided
    );
    
    // Extract just the recommendations for the response
    res.json(optimizationResult.recommendations || []);
    
  } catch (error) {
    console.error('Error optimizing protocol:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to optimize protocol'
    });
  }
});

/**
 * Statistical Analysis Plan (SAP) generation endpoint
 */
router.post('/sap/generate', async (req: Request, res: Response) => {
  try {
    const protocolData = req.body;
    
    if (!protocolData) {
      return res.status(400).json({
        success: false,
        message: 'Protocol data is required'
      });
    }
    
    // Generate SAP
    const sap = generateSAP(protocolData);
    
    // Return as plain text
    res.setHeader('Content-Type', 'text/plain');
    res.send(sap);
    
  } catch (error) {
    console.error('Error generating SAP:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to generate SAP'
    });
  }
});

/**
 * Generate and export SAP report as PDF
 */
router.post('/sap/export', async (req: Request, res: Response) => {
  try {
    const { protocol_id, version_id, sap_text, protocol_data } = req.body;
    
    if (!protocol_id || !sap_text) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }
    
    // Create temp files for the Python script
    const sapTextFile = path.join(tempDir, `sap_${protocol_id}_${Date.now()}.txt`);
    fs.writeFileSync(sapTextFile, sap_text);
    
    let protocolDataFile = '';
    if (protocol_data) {
      protocolDataFile = path.join(tempDir, `protocol_${protocol_id}_${Date.now()}.json`);
      fs.writeFileSync(protocolDataFile, JSON.stringify(protocol_data));
    }
    
    // Generate SAP PDF using Python script
    const pythonArgs = [
      'scripts/generate_sap_report.py',
      protocol_id,
      version_id || 'latest',
      sapTextFile
    ];
    
    if (protocolDataFile) {
      pythonArgs.push(protocolDataFile);
    }
    
    const pythonProcess = spawn('python3', pythonArgs);
    
    let resultData = '';
    let errorData = '';
    
    pythonProcess.stdout.on('data', (data) => {
      resultData += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
      console.error(`SAP PDF generation error: ${data}`);
    });
    
    pythonProcess.on('close', (code) => {
      // Clean up temp files
      try {
        fs.unlinkSync(sapTextFile);
        if (protocolDataFile) {
          fs.unlinkSync(protocolDataFile);
        }
      } catch (err) {
        console.error('Error cleaning up temp files:', err);
      }
      
      if (code !== 0) {
        return res.status(500).json({
          success: false,
          message: `SAP PDF generation failed: ${errorData}`
        });
      }
      
      try {
        // The Python script should output the path to the PDF file
        const filePath = resultData.trim();
        const fileName = path.basename(filePath);
        
        res.json({
          success: true,
          download_url: `/download/${fileName}`,
          file_name: fileName
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error parsing PDF generation result'
        });
      }
    });
    
  } catch (error) {
    console.error('Error exporting SAP:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to export SAP'
    });
  }
});

// Export both the router and the registration function
export { router, registerProtocolRoutes };