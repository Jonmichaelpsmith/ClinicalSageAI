/**
 * CER PDF Exporter Service
 * 
 * This service handles the generation of Clinical Evaluation Report PDFs
 * in accordance with MEDDEV 2.7/1 Rev 4 format as exemplified by the
 * Arthrosurface Shoulder Arthroplasty Systems CER report.
 * 
 * The service creates properly structured and formatted PDFs with
 * correct headers, footers, sections, and styling.
 */

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { promisify } = require('util');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);

/**
 * Generate a CER PDF in MEDDEV 2.7/1 Rev 4 format
 * 
 * @param {Object} cerData - The CER data to include in the PDF
 * @param {string} cerData.title - The title of the CER
 * @param {Array} cerData.sections - The sections of the CER
 * @param {Object} cerData.deviceInfo - The device information
 * @param {Object} cerData.metadata - Additional metadata
 * @returns {Promise<Buffer>} - The generated PDF as a buffer
 */
async function generateCerPdf(cerData) {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({
        autoFirstPage: false,
        size: 'A4',
        margin: 50,
        info: {
          Title: cerData.title || 'Clinical Evaluation Report',
          Author: cerData.metadata?.author || 'TrialSage AI',
          Subject: 'Clinical Evaluation Report',
          Keywords: 'CER, MEDDEV 2.7/1 Rev 4, Clinical Evaluation, Medical Device',
          CreationDate: new Date(),
          ModDate: new Date()
        }
      });

      // Collect the PDF data in a buffer
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Set up styles
      const styles = {
        title: { size: 18, font: 'Helvetica-Bold' },
        heading1: { size: 16, font: 'Helvetica-Bold' },
        heading2: { size: 14, font: 'Helvetica-Bold' },
        heading3: { size: 12, font: 'Helvetica-Bold' },
        normal: { size: 11, font: 'Helvetica' },
        small: { size: 10, font: 'Helvetica' },
        footer: { size: 8, font: 'Helvetica' },
        tableHeader: { size: 10, font: 'Helvetica-Bold' },
        tableCell: { size: 9, font: 'Helvetica' }
      };

      // Colors
      const colors = {
        primary: '#2E5984',    // Blue
        text: '#333333',       // Dark gray
        lightGray: '#F5F5F5',  // Light gray background
        borders: '#DDDDDD'     // Medium gray for borders
      };

      // Set up a standard document header with page numbers
      const addHeader = (pageNumber) => {
        // Add logo/watermark if confidential
        if (cerData.metadata?.confidential) {
          doc.fontSize(10)
             .font('Helvetica-Oblique')
             .fillColor('#888888')
             .text('CONFIDENTIAL', doc.page.width - 150, 20, { width: 100, align: 'right' });
        }

        // Add document information in header
        doc.font('Helvetica')
           .fontSize(8)
           .fillColor('#666666')
           .text(cerData.title || 'Clinical Evaluation Report', 50, 20, { width: 300 });

        // Add page number
        doc.fontSize(8)
           .text(`Page ${pageNumber}`, doc.page.width - 100, 20, { width: 50, align: 'right' });
      };

      // Set up a standard document footer
      const addFooter = () => {
        const footerText = `${cerData.metadata?.standard || 'MEDDEV 2.7/1 Rev 4'} | ${cerData.deviceInfo?.manufacturer || 'Manufacturer'} | Confidential`;
        
        doc.fontSize(8)
           .font('Helvetica')
           .fillColor('#888888')
           .text(footerText, 50, doc.page.height - 30, { 
             width: doc.page.width - 100,
             align: 'center'
           });
      };

      // Add a new page to the document with standard formatting
      const addStandardPage = (pageNumber) => {
        doc.addPage();
        addHeader(pageNumber);
        addFooter();
        
        // Set default font for content
        doc.font(styles.normal.font)
           .fontSize(styles.normal.size)
           .fillColor(colors.text);
        
        // Return the top y-position after the header (allowing space for the header)
        return 50;
      };

      // Add a standard section heading
      const addSectionHeading = (text, level = 1) => {
        const style = level === 1 ? styles.heading1 : 
                     level === 2 ? styles.heading2 : styles.heading3;
        
        doc.font(style.font)
           .fontSize(style.size)
           .fillColor(colors.primary);
        
        doc.text(text, { paragraphGap: 10 });
        doc.moveDown(0.5);
        
        // Reset to normal style
        doc.font(styles.normal.font)
           .fontSize(styles.normal.size)
           .fillColor(colors.text);
      };

      // Generate cover page
      const generateCoverPage = () => {
        doc.addPage();
        
        // Add company logo/placeholder for logo
        const logoHeight = 40;
        const logoY = 100;
        
        // Draw a placeholder rectangle for logo
        doc.rect(50, logoY, 150, logoHeight)
           .stroke('#DDDDDD');
        
        doc.fontSize(10)
           .fillColor('#888888')
           .text('Company Logo', 85, logoY + 15);
        
        // Title
        const titleY = logoY + logoHeight + 50;
        doc.font(styles.title.font)
           .fontSize(styles.title.size)
           .fillColor(colors.primary)
           .text('CLINICAL EVALUATION REPORT', { align: 'center' });
        
        doc.moveDown(0.5);
        
        // Subtitle - Device name
        doc.font('Helvetica-Bold')
           .fontSize(16)
           .fillColor('#333333')
           .text(cerData.deviceInfo?.name || 'Medical Device', { align: 'center' });
        
        doc.moveDown(2);
        
        // Document information table
        const infoData = [
          ['Document Type:', 'Clinical Evaluation Report'],
          ['Document ID:', cerData.metadata?.documentId || `CER-${Date.now().toString().substring(0, 8)}`],
          ['Version:', cerData.metadata?.version || '1.0.0'],
          ['Date:', cerData.metadata?.generatedAt ? new Date(cerData.metadata.generatedAt).toLocaleDateString() : new Date().toLocaleDateString()],
          ['Manufacturer:', cerData.deviceInfo?.manufacturer || 'Manufacturer Name'],
          ['Regulatory Framework:', cerData.metadata?.standard || 'MEDDEV 2.7/1 Rev 4'],
          ['Status:', cerData.metadata?.reviewStatus || 'Draft']
        ];
        
        // Center the table
        const tableWidth = 350;
        const tableX = (doc.page.width - tableWidth) / 2;
        let tableY = doc.y + 30;
        
        // Draw table
        for (const [label, value] of infoData) {
          doc.font('Helvetica-Bold')
             .fontSize(11)
             .fillColor('#333333')
             .text(label, tableX, tableY, { width: 150, continued: true });
          
          doc.font('Helvetica')
             .text(value, { width: tableWidth - 150 });
          
          tableY += 20;
        }
        
        // Add confidentiality statement
        if (cerData.metadata?.confidential) {
          doc.moveDown(4);
          
          doc.rect(80, doc.y, doc.page.width - 160, 30)
             .fill('#F5F5F5');
          
          doc.font('Helvetica-Bold')
             .fontSize(10)
             .fillColor('#666666')
             .text('CONFIDENTIAL', { align: 'center' });
          
          doc.font('Helvetica')
             .fontSize(9)
             .text('This document contains confidential information. Do not distribute without authorization.', { align: 'center' });
        }
      };

      // Add a table of contents page
      const generateTableOfContents = () => {
        const y = addStandardPage(2);
        
        // Title
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .fillColor(colors.primary)
           .text('TABLE OF CONTENTS', 50, y + 20);
        
        doc.moveDown(1);
        
        // Generate TOC entries from sections
        let tocY = doc.y;
        
        // Standard MEDDEV 2.7/1 Rev 4 sections with page numbers (estimated)
        const tocEntries = [
          { title: '1. Executive Summary', page: 3 },
          { title: '2. Scope of the Clinical Evaluation', page: 4 },
          { title: '3. Device Description and Product Specification', page: 5 },
          { title: '4. Intended Purpose, Intended Patient Population, and Indications', page: 6 },
          { title: '5. Context of the Evaluation and Choice of Clinical Data', page: 7 },
          { title: '6. Literature Search and Literature Review', page: 8 },
          { title: '7. Clinical Experience Data Analysis', page: 9 },
          { title: '8. Risk Analysis and Risk Management Data', page: 10 },
          { title: '9. Post-Market Surveillance Data', page: 11 },
          { title: '10. Equivalence Data and Analysis (if applicable)', page: 12 },
          { title: '11. Overall Assessment of Clinical Data', page: 13 },
          { title: '12. Conclusions', page: 14 },
          { title: 'Appendices', page: 15 }
        ];
        
        // Generate TOC with dot leaders
        for (const entry of tocEntries) {
          const textWidth = doc.widthOfString(entry.title);
          const pageNumWidth = doc.widthOfString(entry.page.toString());
          const dotsWidth = doc.page.width - 100 - textWidth - pageNumWidth;
          
          // Calculate how many dots we need
          const dotChar = '.';
          const dotWidth = doc.widthOfString(dotChar);
          const dotCount = Math.floor(dotsWidth / dotWidth);
          const dots = dotChar.repeat(dotCount);
          
          // Draw the TOC line
          doc.font('Helvetica')
             .fontSize(11)
             .fillColor('#333333')
             .text(entry.title, 50, tocY, { continued: true });
          
          doc.fillColor('#888888')
             .text(dots, { continued: true });
          
          doc.fillColor('#333333')
             .text(entry.page.toString());
          
          tocY += 20;
        }
      };

      // Process sections from the cerData
      const processSections = () => {
        let pageNumber = 3; // Start content on page 3 (after cover and TOC)
        
        // Add the first content page
        let y = addStandardPage(pageNumber);
        
        // Process each section
        for (const [index, section] of (cerData.sections || []).entries()) {
          // Skip if empty section
          if (!section || !section.content) continue;
          
          // Add a new page if we're not on the first section
          if (index > 0) {
            pageNumber++;
            y = addStandardPage(pageNumber);
          }
          
          // Add section title
          addSectionHeading(section.title || `Section ${index + 1}`, 1);
          
          // Process content (convert markdown to PDF content)
          const content = section.content || '';
          
          // Split content into lines and process them
          const lines = content.split('\n');
          
          for (const line of lines) {
            // Check if this is a heading (markdown style)
            if (line.startsWith('# ')) {
              const headingText = line.substring(2).trim();
              addSectionHeading(headingText, 1);
            } else if (line.startsWith('## ')) {
              const headingText = line.substring(3).trim();
              addSectionHeading(headingText, 2);
            } else if (line.startsWith('### ')) {
              const headingText = line.substring(4).trim();
              addSectionHeading(headingText, 3);
            }
            // Process lists, tables, etc. could be added here
            else if (line.trim() !== '') {
              // Regular paragraph text
              doc.font(styles.normal.font)
                 .fontSize(styles.normal.size)
                 .fillColor(colors.text)
                 .text(line.trim(), { paragraphGap: 5, lineGap: 2 });
            } else {
              // Empty line - add some space
              doc.moveDown(0.5);
            }
            
            // Check if we need a new page
            if (doc.y > doc.page.height - 100) {
              pageNumber++;
              y = addStandardPage(pageNumber);
            }
          }
        }
      };

      // Generate appendices if needed
      const generateAppendices = () => {
        if (!(cerData.metadata?.includeAppendices)) return;
        
        // Add a new page for appendices
        const pageNumber = doc.bufferedPageRange().count + 1;
        let y = addStandardPage(pageNumber);
        
        addSectionHeading('Appendices', 1);
        
        // Example appendix content
        doc.text('This section contains supplementary information and data to support the clinical evaluation.');
        doc.moveDown(1);
        
        // List of appendices
        const appendices = [
          'Appendix A: Literature Search Protocol',
          'Appendix B: Literature Search Results',
          'Appendix C: FAERS Data Analysis',
          'Appendix D: Risk Analysis Summary',
          'Appendix E: Post-Market Surveillance Data'
        ];
        
        for (const appendix of appendices) {
          doc.text(`• ${appendix}`);
          doc.moveDown(0.5);
        }
      };

      // Generate the full document
      generateCoverPage();
      generateTableOfContents();
      processSections();
      generateAppendices();

      // Finalize the PDF
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  generateCerPdf
};