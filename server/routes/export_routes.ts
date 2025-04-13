import express from 'express';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { z } from 'zod';
import { exportService } from '../services/export-service';

const router = express.Router();

// Create directory for exports if it doesn't exist
const EXPORTS_DIR = path.join(process.cwd(), 'exports');
if (!fs.existsSync(EXPORTS_DIR)) {
  fs.mkdirSync(EXPORTS_DIR, { recursive: true });
}

// Create directory for static files if it doesn't exist
const STATIC_DIR = path.join(process.cwd(), 'client', 'public', 'static');
if (!fs.existsSync(STATIC_DIR)) {
  fs.mkdirSync(STATIC_DIR, { recursive: true });
}

// Create archive directory for session-based packet history
const ARCHIVE_DIR = path.join(process.cwd(), 'data');
const ARCHIVE_PATH = path.join(ARCHIVE_DIR, 'summary_packet_history.json');
if (!fs.existsSync(ARCHIVE_DIR)) {
  fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
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
    
    // Create PDF document
    const pdf = new PDFDocument({
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      size: 'A4'
    });
    
    // Pipe to file
    const writeStream = fs.createWriteStream(filePath);
    pdf.pipe(writeStream);
    
    // Add content to PDF
    pdf.font('Helvetica-Bold').fontSize(20)
      .text('Protocol Intelligence Report', { align: 'center' })
      .moveDown();
    
    pdf.font('Helvetica').fontSize(12)
      .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' })
      .moveDown(2);
    
    // Protocol ID and Summary
    pdf.font('Helvetica-Bold').fontSize(16)
      .text('Protocol Summary', { underline: true })
      .moveDown();
    
    // Protocol details
    const protocol = reportData.parsed || {};
    pdf.font('Helvetica-Bold').fontSize(12).text('Protocol ID:');
    pdf.font('Helvetica').fontSize(12).text(protocolId).moveDown(0.5);
    
    pdf.font('Helvetica-Bold').fontSize(12).text('Indication:');
    pdf.font('Helvetica').fontSize(12).text(protocol.indication || 'Not specified').moveDown(0.5);
    
    pdf.font('Helvetica-Bold').fontSize(12).text('Phase:');
    pdf.font('Helvetica').fontSize(12).text(protocol.phase || 'Not specified').moveDown(0.5);
    
    pdf.font('Helvetica-Bold').fontSize(12).text('Sample Size:');
    pdf.font('Helvetica').fontSize(12).text(protocol.sample_size || 'Not specified').moveDown(0.5);
    
    // Success prediction
    pdf.addPage();
    pdf.font('Helvetica-Bold').fontSize(16)
      .text('Success Prediction', { underline: true })
      .moveDown();
    
    const prediction = reportData.prediction || 0;
    const formattedPrediction = (prediction * 100).toFixed(1);
    pdf.font('Helvetica-Bold').fontSize(14)
      .text(`Predicted Success Probability: ${formattedPrediction}%`, { align: 'center' })
      .moveDown(2);
    
    // Strategic insights
    pdf.font('Helvetica-Bold').fontSize(16)
      .text('Strategic Insights', { underline: true })
      .moveDown();
    
    const insights = reportData.strategic_insights || [];
    if (insights.length > 0) {
      insights.forEach((insight, index) => {
        pdf.font('Helvetica').fontSize(12)
          .text(`${index + 1}. ${insight}`)
          .moveDown(0.5);
      });
    } else {
      pdf.font('Helvetica').fontSize(12)
        .text('• Consider adding an adaptive design element to optimize sample size')
        .moveDown(0.5)
        .text('• Similar trials show higher success rates with longer treatment duration')
        .moveDown(0.5)
        .text('• Including quality of life endpoints may strengthen regulatory submission')
        .moveDown(0.5)
        .text('• Consider stratification by baseline severity to reduce variability')
        .moveDown(0.5);
    }
    
    // Benchmarks
    const benchmarks = reportData.benchmarks || {};
    if (Object.keys(benchmarks).length > 0) {
      pdf.addPage();
      pdf.font('Helvetica-Bold').fontSize(16)
        .text('Benchmark Comparison', { underline: true })
        .moveDown();
      
      pdf.font('Helvetica').fontSize(12)
        .text(`Compared against ${benchmarks.total_trials || 'similar'} trials:`)
        .moveDown(0.5);
      
      // Create a simple table for benchmarks
      const startX = 100;
      const startY = pdf.y + 20;
      const rowHeight = 30;
      const colWidth = 150;
      
      pdf.font('Helvetica-Bold').fontSize(12);
      pdf.text('Metric', startX, startY);
      pdf.text('Your Protocol', startX + colWidth, startY);
      pdf.text('Benchmark', startX + colWidth * 2, startY);
      
      pdf.moveTo(startX, startY + 20).lineTo(startX + colWidth * 3, startY + 20).stroke();
      
      let currentY = startY + 30;
      
      // Sample Size row
      pdf.font('Helvetica').fontSize(12);
      pdf.text('Sample Size', startX, currentY);
      pdf.text(protocol.sample_size || 'N/A', startX + colWidth, currentY);
      pdf.text(benchmarks.median_sample_size || 'N/A', startX + colWidth * 2, currentY);
      
      currentY += rowHeight;
      
      // Duration row
      pdf.text('Duration (Weeks)', startX, currentY);
      pdf.text(protocol.duration_weeks || 'N/A', startX + colWidth, currentY);
      pdf.text(benchmarks.median_duration || 'N/A', startX + colWidth * 2, currentY);
      
      currentY += rowHeight;
      
      // Dropout rate row
      pdf.text('Dropout Rate', startX, currentY);
      pdf.text(`${((protocol.dropout_rate || 0) * 100).toFixed(1)}%`, startX + colWidth, currentY);
      pdf.text(`${((benchmarks.average_dropout_rate || 0) * 100).toFixed(1)}%`, startX + colWidth * 2, currentY);
    }
    
    // End PDF
    pdf.end();
    
    // Wait for PDF to be written
    writeStream.on('finish', () => {
      // Calculate download URL
      const downloadUrl = `/exports/${filename}`;
      
      // Return success with download URL
      return res.json({
        success: true,
        download_url: downloadUrl,
        filename: filename
      });
    });
    
    writeStream.on('error', (err) => {
      console.error('Error writing PDF:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error generating PDF file' 
      });
    });
  } catch (error: any) {
    console.error('Error generating report:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to generate report' 
    });
  }
});

// Validation schema for summary packet request
const PacketRequestSchema = z.object({
  protocol: z.string(),
  ind25: z.string(),
  ind27: z.string(),
  sap: z.string(),
  risks: z.array(z.string()),
  success_probability: z.number(),
  sample_size: z.number(),
  session_id: z.string()
});

// POST endpoint for generating a summary packet
router.post('/summary-packet', express.json(), async (req, res) => {
  try {
    // Validate request body
    const requestData = PacketRequestSchema.parse(req.body);
    
    // Generate filename for the PDF
    const filename = `summary_packet_${requestData.session_id}.pdf`;
    const filePath = path.join(STATIC_DIR, filename);
    
    // Create PDF document
    const pdf = new PDFDocument();
    const writeStream = fs.createWriteStream(filePath);
    pdf.pipe(writeStream);
    
    // Add content to the PDF
    pdf.font('Helvetica-Bold').fontSize(14)
      .text(`Study Packet (${requestData.session_id})`, { align: 'center' })
      .moveDown();
    
    pdf.font('Helvetica').fontSize(11)
      .text(`Success Probability: ${requestData.success_probability}%`)
      .text(`Sample Size Estimate: ${requestData.sample_size} participants`)
      .moveDown();
    
    // IND Module 2.5
    pdf.font('Helvetica-Bold').fontSize(12)
      .text('IND Module 2.5', { underline: true })
      .moveDown(0.5);
    pdf.font('Helvetica').fontSize(11)
      .text(requestData.ind25)
      .moveDown();
    
    // IND Module 2.7
    pdf.font('Helvetica-Bold').fontSize(12)
      .text('IND Module 2.7', { underline: true })
      .moveDown(0.5);
    pdf.font('Helvetica').fontSize(11)
      .text(requestData.ind27)
      .moveDown();
    
    // SAP Draft
    pdf.font('Helvetica-Bold').fontSize(12)
      .text('SAP Draft', { underline: true })
      .moveDown(0.5);
    pdf.font('Helvetica').fontSize(11)
      .text(requestData.sap)
      .moveDown();
    
    // Key Risk Flags
    pdf.font('Helvetica-Bold').fontSize(12)
      .text('Key Risk Flags', { underline: true })
      .moveDown(0.5);
    pdf.font('Helvetica').fontSize(11);
    
    requestData.risks.forEach(risk => {
      pdf.text(`• ${risk}`);
    });
    
    // Protocol Content Summary
    pdf.addPage();
    pdf.font('Helvetica-Bold').fontSize(12)
      .text('Protocol Content', { underline: true })
      .moveDown(0.5);
    pdf.font('Helvetica').fontSize(11)
      .text(requestData.protocol.substring(0, Math.min(1000, requestData.protocol.length)));
    
    if (requestData.protocol.length > 1000) {
      pdf.text('...(content truncated for brevity)...');
    }
    
    // Finalize the PDF
    pdf.end();
    
    // Wait for PDF to finish writing
    writeStream.on('finish', async () => {
      // Save archive entry
      const archiveEntry = {
        session_id: requestData.session_id,
        filename,
        success_probability: requestData.success_probability,
        sample_size: requestData.sample_size,
        risks: requestData.risks,
        created_at: new Date().toISOString()
      };
      
      try {
        let db: Record<string, any[]> = {};
        
        if (fs.existsSync(ARCHIVE_PATH)) {
          const fileContent = fs.readFileSync(ARCHIVE_PATH, 'utf-8');
          db = JSON.parse(fileContent);
        }
        
        if (!db[requestData.session_id]) {
          db[requestData.session_id] = [];
        }
        
        db[requestData.session_id].push(archiveEntry);
        
        fs.writeFileSync(ARCHIVE_PATH, JSON.stringify(db, null, 2));
      } catch (error) {
        console.error('Archive save error:', error);
      }
      
      res.status(200).json({ 
        success: true,
        pdf_url: `/static/${filename}`
      });
    });
    
    writeStream.on('error', (err) => {
      console.error('Error writing PDF:', err);
      res.status(500).json({ 
        success: false,
        error: 'Failed to generate PDF'
      });
    });
  } catch (error: any) {
    console.error('Summary packet generation error:', error);
    res.status(400).json({ 
      success: false,
      error: error.message || 'Invalid request data'
    });
  }
});

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
  } catch (error: any) {
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
  } catch (error: any) {
    console.error('Download error:', error);
    res.status(500).json({
      error: 'Failed to download export bundle',
      message: error.message || 'Unknown error'
    });
  }
});

export { router as exportRoutes };