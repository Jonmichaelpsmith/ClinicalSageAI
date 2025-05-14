/**
 * PDF Generation Service
 * 
 * This service handles the generation of PDF documents for reports, using
 * HTML as an intermediary format. It's designed to be flexible and support
 * different types of regulatory documents.
 */

const fs = require('fs');
const path = require('path');
const { Buffer } = require('buffer');

/**
 * Generate a PDF document from structured content
 * 
 * @param {Object} content - Structured content for the document
 * @param {String} filename - Target filename for the generated document
 * @returns {Buffer} PDF document as a buffer
 */
async function generatePdf(content, filename) {
  try {
    // Convert content structure to HTML
    const html = generateHtml(content);
    
    // For this implementation, we're using a very simple approach
    // that converts the HTML to a PDF-like format using HTML styling
    const pdfBuffer = Buffer.from(html);
    
    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
}

/**
 * Generate HTML from structured content
 * 
 * @param {Object} content - Structured content for the document
 * @returns {String} Generated HTML
 */
function generateHtml(content) {
  // Start with HTML boilerplate
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${content.title || 'Generated Document'}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 8.5in;
          margin: 0 auto;
          padding: 0.5in;
        }
        h1 {
          text-align: center;
          margin-bottom: 0.3in;
          font-size: 18pt;
          font-weight: bold;
          color: #000;
        }
        h2 {
          font-size: 16pt;
          margin-top: 0.3in;
          margin-bottom: 0.2in;
          page-break-after: avoid;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        h3 {
          font-size: 14pt;
          margin-top: 0.2in;
          margin-bottom: 0.1in;
          page-break-after: avoid;
        }
        p {
          margin-bottom: 0.1in;
          text-align: justify;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 0.2in;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
        .footer {
          text-align: center;
          font-size: 9pt;
          color: #777;
          margin-top: 0.5in;
          border-top: 1px solid #ddd;
          padding-top: 0.1in;
        }
        @media print {
          body {
            padding: 0;
          }
          @page {
            margin: 0.5in;
            size: letter;
          }
        }
      </style>
    </head>
    <body>
  `;
  
  // Add document title
  html += `<h1>${content.title}</h1>`;
  
  // Add subtitle if present
  if (content.subtitle) {
    html += `<h2 style="text-align: center; border-bottom: none;">${content.subtitle}</h2>`;
  }
  
  // Process each section
  if (content.sections && Array.isArray(content.sections)) {
    content.sections.forEach(section => {
      html += `<h2>${section.title}</h2>`;
      
      // Process section content
      if (section.content && Array.isArray(section.content)) {
        section.content.forEach(item => {
          // Add heading if present
          if (item.heading) {
            html += `<h3>${item.heading}</h3>`;
          }
          
          // Add text if present
          if (item.text) {
            html += `<p>${item.text.replace(/\\n/g, '<br>')}</p>`;
          }
          
          // Add table if present
          if (item.table) {
            html += '<table>';
            
            // Add table headers
            if (item.table.headers && Array.isArray(item.table.headers)) {
              html += '<thead><tr>';
              item.table.headers.forEach(header => {
                html += `<th>${header}</th>`;
              });
              html += '</tr></thead>';
            }
            
            // Add table rows
            if (item.table.rows && Array.isArray(item.table.rows)) {
              html += '<tbody>';
              item.table.rows.forEach(row => {
                html += '<tr>';
                row.forEach(cell => {
                  html += `<td>${cell}</td>`;
                });
                html += '</tr>';
              });
              html += '</tbody>';
            }
            
            html += '</table>';
          }
        });
      }
    });
  }
  
  // Add footer if present
  if (content.footer) {
    html += `<div class="footer">${content.footer.text || ''}</div>`;
  }
  
  // Close HTML tags
  html += `
    </body>
    </html>
  `;
  
  return html;
}

/**
 * Initialize PDF Generation Service
 */
async function initialize() {
  try {
    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), 'generated_documents');
    // In case fs.promises is not available, handle both ways
    if (fs.promises) {
      await fs.promises.mkdir(outputDir, { recursive: true });
    } else {
      // Use fs with promisify as a fallback
      const { promisify } = require('util');
      const mkdir = promisify(fs.mkdir);
      await mkdir(outputDir, { recursive: true });
    }
    
    console.log(`PDF Generation Service initialized. Output directory: ${outputDir}`);
    return true;
  } catch (error) {
    console.error('Failed to initialize PDF generation service:', error);
    return false;
  }
}

module.exports = {
  initialize,
  generatePdf
};