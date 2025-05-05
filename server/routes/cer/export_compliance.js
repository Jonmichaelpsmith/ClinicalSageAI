import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Readable } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generate a compliance PDF report
 * 
 * @param {Object} data - The compliance data to include in the report
 * @param {number} threshold - The threshold percentage for "Ready for Review" status (default: 80)
 * @param {number} flagThreshold - The threshold percentage for flagging sections (default: 70)
 * @returns {Promise<Buffer>} - The PDF as a buffer
 */
export async function generateCompliancePDF(data, threshold = 80, flagThreshold = 70) {
  return new Promise((resolve, reject) => {
    try {
      // Create a PDF document
      const doc = new PDFDocument();
      const buffers = [];
      
      // Collect PDF data chunks
      doc.on('data', buffer => buffers.push(buffer));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));
      
      // Document title
      doc.font('Helvetica-Bold').fontSize(16);
      doc.text('CER Compliance Scorecard', { align: 'center' });
      doc.moveDown(2);
      
      // Overall score
      doc.font('Helvetica').fontSize(12);
      doc.text(`Overall Compliance: ${Math.round(data.overallScore * 100)}%`);
      
      // Status with color coding
      const status = data.overallScore * 100 >= threshold ? "Ready for Review" : "Needs Attention";
      const color = status === "Ready for Review" ? '#008000' : '#C80000';
      
      doc.font('Helvetica-Bold').fillColor(color);
      doc.text(`Status: ${status}`);
      doc.fillColor('black');
      doc.moveDown();
      
      // Check which format of section data we have
      if (data.sectionScores && Array.isArray(data.sectionScores)) {
        // Process sectionScores format
        data.sectionScores.forEach(section => {
          // Highlight low scores below 70%
          const highlight = section.averageScore < 0.7;
          const scorePercentage = Math.round(section.averageScore * 100);
          
          if (highlight) {
            doc.font('Helvetica-Bold').fillColor('#DC3545'); // Bootstrap danger red
            doc.text(`${section.title} ⚠️`);
          } else {
            doc.font('Helvetica-Bold').fillColor('black');
            doc.text(section.title);
          }
          
          doc.font('Helvetica').fillColor('black');
          doc.text(`Score: ${scorePercentage}%`);
          
          // Extract comments from standards if available
          const remarks = [];
          if (section.standards) {
            Object.entries(section.standards).forEach(([standardName, standardData]) => {
              if (standardData.suggestions && Array.isArray(standardData.suggestions)) {
                remarks.push(...standardData.suggestions);
              }
            });
          }
          
          if (remarks.length > 0) {
            doc.font('Helvetica').fontSize(10);
            doc.text('Improvement Suggestions:');
            remarks.slice(0, 3).forEach(remark => { // Limit to 3 remarks to keep PDF readable
              doc.text(`• ${remark}`, { indent: 10 });
            });
          }
          
          doc.moveDown();
        });
      } else if (data.breakdown && Array.isArray(data.breakdown)) {
        // Process older breakdown format
        data.breakdown.forEach(section => {
          // Highlight low scores below 70%
          const highlight = section.score < 70;
          
          if (highlight) {
            doc.font('Helvetica-Bold').fillColor('#DC3545'); // Bootstrap danger red
            doc.text(`${section.section} ⚠️`);
          } else {
            doc.font('Helvetica-Bold').fillColor('black');
            doc.text(section.section);
          }
          
          doc.font('Helvetica').fillColor('black');
          doc.text(`Score: ${section.score}%`);
          doc.text(`Remarks: ${section.comment}`);
          doc.moveDown();
        });
      }
      
      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Express route handler for exporting compliance data as PDF
 */
export function exportComplianceHandler(req, res) {
  const data = req.body.data;
  const threshold = req.body.threshold || 80;
  
  if (!data) {
    return res.status(400).json({ error: 'No data provided.' });
  }
  
  generateCompliancePDF(data, threshold)
    .then(pdfBuffer => {
      // Set PDF response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=compliance_scorecard.pdf');
      res.setHeader('Content-Length', pdfBuffer.length);
      
      // Send PDF buffer
      res.end(pdfBuffer);
    })
    .catch(error => {
      console.error('Error generating compliance PDF:', error);
      res.status(500).json({ error: error.message || 'Failed to generate PDF' });
    });
}
