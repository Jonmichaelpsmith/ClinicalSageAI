const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Configure paths
const EXPORTS_DIR = path.join(process.cwd(), 'data', 'exports');
// Ensure exports directory exists
if (!fs.existsSync(EXPORTS_DIR)) {
  fs.mkdirSync(EXPORTS_DIR, { recursive: true });
}

/**
 * API endpoint to generate a CER from integrated data
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
      return res.status(400).json({ 
        error: 'Missing required fields: productId and productName are required' 
      });
    }

    // Prepare parameters for Python script
    const args = [
      'server/run_cer_generator.py',
      '--id', productId,
      '--name', productName
    ];

    // Add optional parameters if provided
    if (manufacturer) args.push('--manufacturer', manufacturer);
    if (deviceDescription) args.push('--description', deviceDescription);
    if (intendedPurpose) args.push('--purpose', intendedPurpose);
    if (classification) args.push('--class', classification);
    if (dateRange) args.push('--days', dateRange.toString());
    if (outputFormat) args.push('--format', outputFormat);

    // Spawn Python process
    const pythonProcess = spawn('python', args);
    
    let outputData = '';
    let errorData = '';

    // Collect output data
    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
    });

    // Collect error data
    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    // Handle process completion
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`CER generation process exited with code ${code}`);
        console.error(`Error: ${errorData}`);
        return res.status(500).json({ 
          error: 'Failed to generate CER', 
          details: errorData 
        });
      }

      try {
        // Parse output to get the file path
        const outputLines = outputData.split('\n');
        const filePathLine = outputLines.find(line => line.includes('Output file:'));
        
        if (!filePathLine) {
          return res.status(500).json({ 
            error: 'Could not determine output file path', 
            details: outputData 
          });
        }

        const filePath = filePathLine.split('Output file:')[1].trim();
        const fileName = path.basename(filePath);

        // Return success response with file details
        res.status(200).json({
          success: true,
          message: 'CER generated successfully',
          file: {
            name: fileName,
            path: filePath,
            url: `/api/cer/download/${fileName}`
          }
        });
      } catch (error) {
        console.error('Error parsing output:', error);
        res.status(500).json({ 
          error: 'Error parsing output', 
          details: error.message 
        });
      }
    });
  } catch (error) {
    console.error('Error generating CER:', error);
    res.status(500).json({ 
      error: 'Error generating CER', 
      details: error.message 
    });
  }
});

/**
 * API endpoint to download a generated CER file
 * GET /api/cer/download/:filename
 */
router.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(EXPORTS_DIR, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.json') {
      contentType = 'application/json';
    }

    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ 
      error: 'Error downloading file', 
      details: error.message 
    });
  }
});

/**
 * API endpoint to list all generated CER files
 * GET /api/cer/list
 */
router.get('/list', (req, res) => {
  try {
    // Read exports directory
    const files = fs.readdirSync(EXPORTS_DIR);

    // Filter only CER files
    const cerFiles = files.filter(file => 
      file.startsWith('CER_') && 
      (file.endsWith('.pdf') || file.endsWith('.json'))
    );

    // Get file details
    const fileDetails = cerFiles.map(filename => {
      const filePath = path.join(EXPORTS_DIR, filename);
      const stats = fs.statSync(filePath);
      
      return {
        name: filename,
        size: stats.size,
        created: stats.birthtime,
        url: `/api/cer/download/${filename}`
      };
    });

    // Sort by creation date (newest first)
    fileDetails.sort((a, b) => b.created - a.created);

    res.status(200).json({
      files: fileDetails
    });
  } catch (error) {
    console.error('Error listing CER files:', error);
    res.status(500).json({ 
      error: 'Error listing CER files', 
      details: error.message 
    });
  }
});

/**
 * API endpoint to upload a file to be used as a data source
 * POST /api/cer/upload
 */
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get file details
    const { originalname, path: tempPath, size } = req.file;
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'data', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Move file to permanent location
    const destPath = path.join(uploadsDir, originalname);
    fs.renameSync(tempPath, destPath);

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        name: originalname,
        path: destPath,
        size: size
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ 
      error: 'Error uploading file', 
      details: error.message 
    });
  }
});

module.exports = router;