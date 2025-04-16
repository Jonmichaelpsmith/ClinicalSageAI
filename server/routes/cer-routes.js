/**
 * CER Routes
 * 
 * API routes for the Clinical Evaluation Report generator
 */

import { Router } from 'express';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

// Convert callbacks to Promises
const execPromise = promisify(exec);
const fsExists = promisify(fs.exists);
const fsReaddir = promisify(fs.readdir);
const fsStat = promisify(fs.stat);
const fsReadFile = promisify(fs.readFile);

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import data integration functionality
import dataIntegration from '../data_integration.js';

// Constants
const EXPORTS_DIR = path.join(__dirname, '..', '..', 'data', 'exports');
const CACHE_DIR = path.join(__dirname, '..', '..', 'data', 'cache');

// Ensure directories exist
[EXPORTS_DIR, CACHE_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Create router
const router = Router();

/**
 * Generate a CER (Clinical Evaluation Report)
 * 
 * POST /api/cer/generate
 */
router.post('/generate', async (req, res) => {
  try {
    const {
      productId,
      productName,
      manufacturer,
      deviceDescription,
      intendedPurpose,
      classification,
      dateRangeDays = 730, // Default to 2 years
      format = 'pdf' // 'pdf' or 'json'
    } = req.body;
    
    // Validate required fields
    if (!productId || !productName) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Product ID and name are required'
      });
    }
    
    // Build parameters for the CER generator script
    const scriptPath = path.join(__dirname, '..', 'run_cer_generator.py');
    const args = [
      `--id "${productId}"`,
      `--name "${productName}"`
    ];
    
    // Add optional parameters if provided
    if (manufacturer) args.push(`--manufacturer "${manufacturer}"`);
    if (deviceDescription) args.push(`--description "${deviceDescription}"`);
    if (intendedPurpose) args.push(`--purpose "${intendedPurpose}"`);
    if (classification) args.push(`--class "${classification}"`);
    
    // Add date range and format
    args.push(`--days ${dateRangeDays}`);
    args.push(`--format ${format}`);
    
    // Execute the CER generator script
    const command = `python3 "${scriptPath}" ${args.join(' ')}`;
    console.log(`Executing CER generator: ${command}`);
    
    const { stdout, stderr } = await execPromise(command);
    
    // Check for errors in stderr
    if (stderr && stderr.includes('Error')) {
      console.error('CER Generator Error:', stderr);
      return res.status(500).json({
        error: 'CER generation failed',
        message: stderr
      });
    }
    
    // Extract output file path from stdout
    const outputFilePath = stdout.match(/Output file: (.+)/)?.[1]?.trim();
    
    if (!outputFilePath || !(await fsExists(outputFilePath))) {
      return res.status(500).json({
        error: 'CER generation failed',
        message: 'Output file not found'
      });
    }
    
    // Get file info
    const stats = await fsStat(outputFilePath);
    
    // Return success response with file path
    res.json({
      success: true,
      message: 'CER generated successfully',
      filePath: outputFilePath,
      fileName: path.basename(outputFilePath),
      fileSize: stats.size,
      format: format,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating CER:', error);
    res.status(500).json({
      error: 'CER generation failed',
      message: error.message
    });
  }
});

/**
 * Get generated CER report file
 * 
 * GET /api/cer/report/:filename
 */
router.get('/report/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    
    // Validate filename to prevent directory traversal attacks
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({
        error: 'Invalid filename',
        message: 'Filename contains invalid characters'
      });
    }
    
    const filePath = path.join(EXPORTS_DIR, filename);
    
    // Check if file exists
    if (!(await fsExists(filePath))) {
      return res.status(404).json({
        error: 'File not found',
        message: 'The requested report file does not exist'
      });
    }
    
    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType;
    
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.json':
        contentType = 'application/json';
        break;
      default:
        contentType = 'application/octet-stream';
    }
    
    // Set content type header
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    
    // Send the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error serving CER report file:', error);
    res.status(500).json({
      error: 'Error serving file',
      message: error.message
    });
  }
});

/**
 * List all generated CER reports
 * 
 * GET /api/cer/reports
 */
router.get('/reports', async (req, res) => {
  try {
    // Create exports directory if it doesn't exist
    if (!(await fsExists(EXPORTS_DIR))) {
      await fs.promises.mkdir(EXPORTS_DIR, { recursive: true });
      return res.json({ reports: [] }); // Return empty array if directory was just created
    }
    
    // Read directory contents
    const files = await fsReaddir(EXPORTS_DIR);
    
    // Filter for CER report files and gather metadata
    const reports = await Promise.all(
      files
        .filter(file => file.startsWith('CER_') && (file.endsWith('.pdf') || file.endsWith('.json')))
        .map(async file => {
          // Get file stats
          const filePath = path.join(EXPORTS_DIR, file);
          const stats = await fsStat(filePath);
          
          // Extract product info from filename
          // Format is typically CER_ProductName_ProductID_Timestamp
          const parts = file.split('_');
          const isJson = file.endsWith('.json');
          
          let productInfo = { name: 'Unknown', id: 'Unknown' };
          
          if (parts.length >= 3) {
            // Remove 'CER' and the timestamp + extension part
            const nameAndId = parts.slice(1, -1).join('_');
            
            // Try to extract product name and ID
            const product = { 
              name: nameAndId.split('_').slice(0, -1).join('_') || 'Unknown',
              id: nameAndId.split('_').slice(-1)[0] || 'Unknown'
            };
            
            productInfo = product;
          }
          
          return {
            filename: file,
            url: `/api/cer/report/${file}`,
            product: productInfo,
            size: stats.size,
            format: isJson ? 'json' : 'pdf',
            created: stats.ctime
          };
        })
    );
    
    // Sort by creation time (most recent first)
    reports.sort((a, b) => new Date(b.created) - new Date(a.created));
    
    res.json({ reports });
  } catch (error) {
    console.error('Error listing CER reports:', error);
    res.status(500).json({
      error: 'Error listing reports',
      message: error.message
    });
  }
});

/**
 * Get regulatory data for a product without generating a full CER
 * 
 * GET /api/cer/data
 */
router.post('/data', async (req, res) => {
  try {
    const {
      productId,
      productName,
      manufacturer,
      isDevice = true,
      isDrug = false,
      dateRangeDays = 730 // Default to 2 years
    } = req.body;
    
    // Validate required fields
    if (!productId && !productName) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Product ID or name is required'
      });
    }
    
    // Gather integrated data
    const integratedData = await dataIntegration.gatherIntegratedData({
      productId,
      productName,
      manufacturer,
      isDevice,
      isDrug,
      dateRangeDays
    });
    
    // Calculate risk level and generate recommendations
    const riskLevel = dataIntegration.calculateRiskLevel(integratedData.integratedData);
    const recommendations = dataIntegration.generateSafetyRecommendations(integratedData.integratedData);
    
    // Return the data
    res.json({
      success: true,
      data: integratedData,
      riskLevel,
      recommendations,
      queriedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error gathering regulatory data:', error);
    res.status(500).json({
      error: 'Error gathering regulatory data',
      message: error.message
    });
  }
});

export default router;