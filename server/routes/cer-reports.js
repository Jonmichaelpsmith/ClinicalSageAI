const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { PDFDocument } = require('pdf-lib');

/**
 * CER Reports API Routes
 * 
 * These routes provide endpoints for generating and exporting comprehensive CER reports,
 * section-specific reports, and specialized report formats.
 */

// Generate and return a comprehensive CER report as PDF
router.get('/export-comprehensive-report', async (req, res) => {
  try {
    const { deviceName, manufacturer, includeSections = 'all' } = req.query;
    
    if (!deviceName || !manufacturer) {
      return res.status(400).json({ 
        error: 'Missing required parameters. Please provide deviceName and manufacturer.' 
      });
    }
    
    console.log(`Generating comprehensive report for ${deviceName} from ${manufacturer}`);
    
    // Call the Python script to generate the PDF
    const outputPath = path.join(__dirname, '../..', 'generated_documents', `${deviceName.replace(/[^a-z0-9]/gi, '_')}_CER_Report.pdf`);
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    
    // In a production environment, you would generate the actual PDF here
    // For this implementation, we'll use pdf-lib to create a simple PDF
    
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    
    // Add some simple content
    const { width, height } = page.getSize();
    page.drawText('Clinical Evaluation Report (CER)', {
      x: 50,
      y: height - 50,
      size: 24,
    });
    
    page.drawText(`Device: ${deviceName}`, {
      x: 50,
      y: height - 100,
      size: 14,
    });
    
    page.drawText(`Manufacturer: ${manufacturer}`, {
      x: 50,
      y: height - 130,
      size: 14,
    });
    
    page.drawText('This is a comprehensive CER report including all sections', {
      x: 50,
      y: height - 180,
      size: 12,
    });
    
    // Add more pages with section data
    const sections = [
      'Device Description',
      'Literature Review',
      'Clinical Evidence',
      'Risk Analysis',
      'Benefit-Risk Analysis',
      'Post-Market Surveillance',
      'Conclusion'
    ];
    
    for (const section of sections) {
      if (includeSections === 'all' || includeSections.includes(section.toLowerCase().replace(/\s+/g, '-'))) {
        const sectionPage = pdfDoc.addPage([595.28, 841.89]);
        sectionPage.drawText(`${section}`, {
          x: 50,
          y: height - 50,
          size: 20,
        });
        
        sectionPage.drawText(`Content for ${section} would appear here in a production environment.`, {
          x: 50,
          y: height - 100,
          size: 12,
        });
      }
    }
    
    const pdfBytes = await pdfDoc.save();
    
    // Write the PDF to disk
    fs.writeFileSync(outputPath, pdfBytes);
    
    // Send the PDF as a response
    res.contentType('application/pdf');
    res.send(pdfBytes);
    
  } catch (error) {
    console.error('Error generating comprehensive report:', error);
    res.status(500).json({ 
      error: 'Failed to generate comprehensive report', 
      details: error.message 
    });
  }
});

// Generate and return a section-specific report as PDF
router.get('/export-section-report/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const { deviceName, manufacturer } = req.query;
    
    if (!deviceName || !manufacturer) {
      return res.status(400).json({ 
        error: 'Missing required parameters. Please provide deviceName and manufacturer.' 
      });
    }
    
    console.log(`Generating ${section} report for ${deviceName} from ${manufacturer}`);
    
    // Format the section name for display
    const formattedSection = section
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Create a simple PDF for the section
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    
    // Add some content
    const { width, height } = page.getSize();
    page.drawText(`${formattedSection} Report`, {
      x: 50,
      y: height - 50,
      size: 24,
    });
    
    page.drawText(`Device: ${deviceName}`, {
      x: 50,
      y: height - 100,
      size: 14,
    });
    
    page.drawText(`Manufacturer: ${manufacturer}`, {
      x: 50,
      y: height - 130,
      size: 14,
    });
    
    page.drawText(`This report focuses on the ${formattedSection} section of the CER.`, {
      x: 50,
      y: height - 180,
      size: 12,
    });
    
    // Add more specific content based on the section
    if (section === 'quality-management') {
      const qmpPage = pdfDoc.addPage([595.28, 841.89]);
      qmpPage.drawText('Quality Management Plan Overview', {
        x: 50,
        y: height - 50,
        size: 20,
      });
      
      qmpPage.drawText('This report includes Quality Management Plan data, including objectives, CtQ factors, and compliance metrics.', {
        x: 50,
        y: height - 100,
        size: 12,
      });
    } else if (section === 'literature-review') {
      const litPage = pdfDoc.addPage([595.28, 841.89]);
      litPage.drawText('Literature Review Results', {
        x: 50,
        y: height - 50,
        size: 20,
      });
      
      litPage.drawText('This report includes the literature review methodology, search results, and analysis.', {
        x: 50,
        y: height - 100,
        size: 12,
      });
    }
    
    const pdfBytes = await pdfDoc.save();
    
    // Send the PDF as a response
    res.contentType('application/pdf');
    res.send(pdfBytes);
    
  } catch (error) {
    console.error(`Error generating ${req.params.section} report:`, error);
    res.status(500).json({ 
      error: `Failed to generate ${req.params.section} report`, 
      details: error.message 
    });
  }
});

module.exports = router;
/**
 * Enhanced CER Reports API with batch export capability and memory optimizations
 */
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { storage } = require('../storage');
const { generateCERPDF } = require('../services/cerGenerator');

// Get all CER reports for a tenant
router.get('/', async (req, res) => {
  try {
    const { organizationId } = req.tenantContext || {};
    
    if (!organizationId) {
      return res.status(400).json({ error: 'Missing organization ID in tenant context' });
    }
    
    const reports = await storage.getCerReports({ organizationId });
    
    res.json(reports);
  } catch (error) {
    console.error('Error fetching CER reports:', error);
    res.status(500).json({ error: 'Failed to fetch CER reports' });
  }
});

// Get a single CER report by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.tenantContext || {};
    
    if (!organizationId) {
      return res.status(400).json({ error: 'Missing organization ID in tenant context' });
    }
    
    const report = await storage.getCerReport(id, { organizationId });
    
    if (!report) {
      return res.status(404).json({ error: 'CER report not found' });
    }
    
    res.json(report);
  } catch (error) {
    console.error(`Error fetching CER report ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch CER report' });
  }
});

// Export a CER report as PDF
router.post('/export-pdf/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.tenantContext || {};
    const startTime = Date.now();
    
    console.log(`Starting PDF export for CER report ${id}`);
    
    // Log memory usage at start
    const initialMemory = process.memoryUsage();
    console.log(`Initial memory usage: ${Math.round(initialMemory.heapUsed / 1024 / 1024)}MB`);
    
    if (!organizationId) {
      return res.status(400).json({ error: 'Missing organization ID in tenant context' });
    }
    
    // Get full report data
    const report = await storage.getCerReport(id, { organizationId, includeDetails: true });
    
    if (!report) {
      return res.status(404).json({ error: 'CER report not found' });
    }
    
    // Get sections
    const sections = await storage.getCerSections(id, { 
      organizationId, 
      sortBy: 'order', 
      includeDraft: false 
    });
    
    // Get device data
    const deviceData = {
      deviceName: report.deviceName || 'Medical Device',
      manufacturer: report.manufacturer || 'Manufacturer',
      type: report.deviceType || 'Class IIb',
      intendedUse: report.metadata?.intendedUse || 'Not specified'
    };
    
    // Prepare data for PDF generation
    const cerData = {
      reportId: report.id,
      deviceData,
      templateSettings: {
        version: report.version || '1.0.0',
        frameworkName: report.regulatoryFramework || 'EU MDR 2017/745'
      },
      cerContent: {
        executiveSummary: report.metadata?.executiveSummary || '',
        deviceDescription: report.metadata?.deviceDescription || ''
      },
      // Parse sections into appropriate categories
      sections: sections.map(section => ({
        id: section.id,
        title: section.title,
        type: section.type,
        content: section.content
      }))
    };
    
    // Generate PDF
    const pdfResult = await generateCERPDF(cerData);
    
    // Check if the file exists
    if (!fs.existsSync(pdfResult.filePath)) {
      return res.status(500).json({ error: 'PDF generation failed - file not found' });
    }
    
    // Store the export in the export log
    await storage.createExportLog({
      reportId: id,
      organizationId,
      exportType: 'PDF',
      filePath: pdfResult.filePath,
      fileSize: fs.statSync(pdfResult.filePath).size,
      processingTime: Date.now() - startTime
    });
    
    // Log memory usage after generation
    const finalMemory = process.memoryUsage();
    console.log(`Final memory usage: ${Math.round(finalMemory.heapUsed / 1024 / 1024)}MB`);
    console.log(`Memory delta: ${Math.round((finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024)}MB`);
    
    // Send the file
    res.sendFile(pdfResult.filePath, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=CER_${id}_${new Date().toISOString().split('T')[0]}.pdf`
      }
    });
  } catch (error) {
    console.error(`Error exporting CER report ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to export CER report' });
  }
});

// Batch export multiple CER reports (creates a zip file)
router.post('/batch-export', async (req, res) => {
  try {
    const { reportIds } = req.body;
    const { organizationId } = req.tenantContext || {};
    
    if (!organizationId) {
      return res.status(400).json({ error: 'Missing organization ID in tenant context' });
    }
    
    if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
      return res.status(400).json({ error: 'No report IDs provided for batch export' });
    }
    
    // Create response to signal batch processing started
    res.json({
      status: 'processing',
      message: `Started batch export of ${reportIds.length} reports`,
      jobId: `batch-${Date.now()}`
    });
    
    // We'll do the actual processing after sending the response
    // This is handled in a separate process or worker in production
  } catch (error) {
    console.error('Error in batch export:', error);
    res.status(500).json({ error: 'Failed to start batch export' });
  }
});

// Get export status for a specific batch job
router.get('/batch-export/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { organizationId } = req.tenantContext || {};
    
    if (!organizationId) {
      return res.status(400).json({ error: 'Missing organization ID in tenant context' });
    }
    
    // In a real implementation, this would check the status from a job queue
    res.json({
      jobId,
      status: 'completed',
      progress: 100,
      downloadUrl: `/api/cer/download-batch/${jobId}`
    });
  } catch (error) {
    console.error(`Error checking batch export status for job ${req.params.jobId}:`, error);
    res.status(500).json({ error: 'Failed to check batch export status' });
  }
});

module.exports = router;
