/**
 * CER Routes
 * 
 * This module provides API routes for the Clinical Evaluation Report (CER) generator.
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const dataIntegration = require('../data_integration');

const router = express.Router();

// Constants
const EXPORTS_DIR = path.join(process.cwd(), 'data', 'exports');
const CACHE_DIR = path.join(process.cwd(), 'data', 'cache');

// Ensure directories exist
[EXPORTS_DIR, CACHE_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Generate a CER
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
      dateRange,
      outputFormat
    } = req.body;
    
    // Validate required fields
    if (!productId || !productName) {
      return res.status(400).json({ error: 'Product ID and Product Name are required' });
    }
    
    console.log(`Starting CER generation for ${productName} (${productId})`);
    
    // Step 1: Gather integrated data
    const isDevice = true; // Default to device
    const isDrug = false;
    
    // Check if this is a drug based on NDC format
    if (/^\d{4,5}-\d{3,4}-\d{1,2}$/.test(productId)) {
      console.log(`Detected NDC format: ${productId}, treating as drug`);
      isDevice = false;
      isDrug = true;
    }
    
    // Gather data from all sources
    const integratedData = await dataIntegration.gatherIntegratedData({
      productId,
      productName,
      manufacturer,
      isDevice,
      isDrug,
      dateRangeDays: parseInt(dateRange) || 730
    });
    
    // Step 2: Save integrated data to a temporary file
    const tempDataFile = path.join(CACHE_DIR, `cer_data_${Date.now()}.json`);
    fs.writeFileSync(tempDataFile, JSON.stringify(integratedData, null, 2));
    
    // Step 3: Run the CER generator Python script
    const scriptPath = path.join(process.cwd(), 'server', 'run_cer_generator.py');
    
    // Build command arguments
    const args = [
      `--id "${productId}"`,
      `--name "${productName}"`,
    ];
    
    if (manufacturer) args.push(`--manufacturer "${manufacturer}"`);
    if (deviceDescription) args.push(`--description "${deviceDescription}"`);
    if (intendedPurpose) args.push(`--purpose "${intendedPurpose}"`);
    if (classification) args.push(`--class "${classification}"`);
    if (dateRange) args.push(`--days ${parseInt(dateRange)}`);
    args.push(`--format ${outputFormat || 'pdf'}`);
    
    // Execute the Python script
    const command = `python3 "${scriptPath}" ${args.join(' ')}`;
    console.log(`Executing command: ${command}`);
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr) {
      console.warn('CER Generator Warning:', stderr);
    }
    
    console.log('CER Generator Output:', stdout);
    
    // Step 4: Parse output to get the file path
    const outputFilePath = stdout.match(/Output file: (.+)/)?.[1]?.trim();
    
    if (!outputFilePath || !fs.existsSync(outputFilePath)) {
      throw new Error('CER generation failed: output file not found');
    }
    
    // Step 5: Create response with file URL
    const fileName = path.basename(outputFilePath);
    const fileUrl = `/api/cer/download/${fileName}`;
    
    // Get file size
    const stats = fs.statSync(outputFilePath);
    const fileSizeInBytes = stats.size;
    const fileSizeInKb = fileSizeInBytes / 1024;
    
    // Response
    res.status(201).json({
      success: true,
      message: 'CER generated successfully',
      file: {
        name: fileName,
        size: fileSizeInBytes,
        sizeFormatted: `${fileSizeInKb.toFixed(2)} KB`,
        url: fileUrl,
        format: outputFormat || 'pdf'
      },
      product: {
        id: productId,
        name: productName,
        manufacturer: manufacturer || 'Unknown',
        classification: classification || 'Unspecified'
      },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating CER:', error);
    res.status(500).json({
      error: 'Failed to generate CER',
      details: error.message
    });
  }
});

/**
 * Download a CER file
 * GET /api/cer/download/:filename
 */
router.get('/download/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security check - prevent path traversal
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(EXPORTS_DIR, sanitizedFilename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Determine content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.json') {
      contentType = 'application/json';
    }
    
    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFilename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading CER:', error);
    res.status(500).json({
      error: 'Failed to download CER',
      details: error.message
    });
  }
});

/**
 * List all generated CER files
 * GET /api/cer/list
 */
router.get('/list', (req, res) => {
  try {
    if (!fs.existsSync(EXPORTS_DIR)) {
      return res.json({ files: [] });
    }
    
    const files = fs.readdirSync(EXPORTS_DIR)
      .filter(file => file.endsWith('.pdf') || file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(EXPORTS_DIR, file);
        const stats = fs.statSync(filePath);
        
        return {
          name: file,
          size: stats.size,
          created: stats.mtime,
          url: `/api/cer/download/${file}`
        };
      })
      .sort((a, b) => new Date(b.created) - new Date(a.created));
    
    res.json({ files });
  } catch (error) {
    console.error('Error listing CER files:', error);
    res.status(500).json({
      error: 'Failed to list CER files',
      details: error.message
    });
  }
});

/**
 * Delete a CER file
 * DELETE /api/cer/delete/:filename
 */
router.delete('/delete/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security check - prevent path traversal
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(EXPORTS_DIR, sanitizedFilename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Delete the file
    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      message: 'CER file deleted successfully',
      filename: sanitizedFilename
    });
  } catch (error) {
    console.error('Error deleting CER file:', error);
    res.status(500).json({
      error: 'Failed to delete CER file',
      details: error.message
    });
  }
});

module.exports = router;