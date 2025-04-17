const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Create a temporary directory for JSON files if it doesn't exist
const tempDir = path.join(process.cwd(), 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

/**
 * Generate a CER report for a given NDC code
 */
router.get('/api/cer/:ndc_code', async (req, res) => {
  try {
    const { ndc_code } = req.params;
    console.log(`Generating CER for NDC code: ${ndc_code}`);
    
    // Generate a unique file name for this request
    const requestId = Date.now().toString();
    const outputFile = path.join(tempDir, `cer_report_${requestId}.json`);
    
    // Run the Python process to generate the CER
    const pythonProcess = spawn('python3', [
      path.join(process.cwd(), 'server', 'cer_api.py'),
      '--ndc_code', ndc_code,
      '--output', outputFile
    ]);
    
    let pythonError = '';
    
    pythonProcess.stderr.on('data', (data) => {
      pythonError += data.toString();
      console.error(`Python CER Generation Error: ${data}`);
    });
    
    // Wait for the Python process to complete
    const exitCode = await new Promise((resolve) => {
      pythonProcess.on('close', (code) => {
        resolve(code);
      });
    });
    
    if (exitCode === 0 && fs.existsSync(outputFile)) {
      // Read the generated report
      const reportData = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
      
      // Clean up the temporary file
      fs.unlinkSync(outputFile);
      
      // Return the report data
      return res.json(reportData);
    } else {
      throw new Error(`CER generation failed with exit code ${exitCode}: ${pythonError}`);
    }
  } catch (error) {
    console.error('Error generating CER report:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while generating the CER report'
    });
  }
});

module.exports = router;