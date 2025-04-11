import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Create directory for exports if it doesn't exist
const EXPORTS_DIR = path.join(process.cwd(), 'exports');
if (!fs.existsSync(EXPORTS_DIR)) {
  fs.mkdirSync(EXPORTS_DIR, { recursive: true });
}

// Generate and export a Protocol Intelligence Report
router.post('/intelligence-report', express.json(), async (req, res) => {
  try {
    const reportData = req.body;
    
    if (!reportData || typeof reportData !== 'object') {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid report data is required' 
      });
    }
    
    // Generate a unique filename
    const protocolId = reportData.protocol_id || `TS-${Date.now()}`;
    const filename = `protocol-intelligence-report-${protocolId}-${Date.now()}.pdf`;
    const filePath = path.join(EXPORTS_DIR, filename);
    
    // Simulate PDF generation (in a real implementation we would use PDFKit or similar)
    // This is just to simulate the endpoint behavior for now
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create placeholder PDF file
    fs.writeFileSync(filePath, 'This is a placeholder for the PDF report');
    
    // Calculate download URL
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const downloadUrl = `${baseUrl}/exports/${filename}`;
    
    // Return success with download URL
    return res.json({
      success: true,
      download_url: downloadUrl,
      filename: filename
    });
  } catch (error: any) {
    console.error('Error generating report:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to generate report' 
    });
  }
});

export { router as exportRoutes };