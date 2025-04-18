import express from 'express';
import fs from 'fs';
import path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const router = express.Router();

export const exportRoutes = router;

// Function to convert HTML content to plain text
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')  // Remove extra blank lines
    .trim();
}

// Function to format current date as yyyy-mm-dd
function getFormattedDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Export to PDF format
router.post('/pdf', async (req, res) => {
  try {
    const { 
      title, 
      author = 'LumenTrialGuide.AI', 
      content,
      indication, 
      phase,
      csrInsights = [],
      academicReferences = []
    } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Add a page to the document
    const page = pdfDoc.addPage([612, 792]); // Letter size
    
    // Embed the standard fonts
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    
    // Set some properties for text layout
    const fontSize = 12;
    const lineHeight = 18;
    const margin = 50;
    let y = page.getHeight() - margin;
    const width = page.getWidth() - 2 * margin;

    // Draw the title
    page.drawText(title || `Protocol Recommendations for ${indication} Study (${phase})`, {
      x: margin,
      y,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    y -= 30;
    
    // Draw the author and date
    page.drawText(`Author: ${author}`, {
      x: margin,
      y,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    y -= lineHeight;
    
    page.drawText(`Date: ${getFormattedDate()}`, {
      x: margin,
      y,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    y -= lineHeight * 2;
    
    // Draw section: Abstract/Summary
    page.drawText('SUMMARY', {
      x: margin,
      y,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    y -= lineHeight * 1.5;

    // Convert content to plain text if it's HTML
    const plainTextContent = typeof content === 'string' 
      ? stripHtml(content) 
      : JSON.stringify(content, null, 2);
    
    // Split the content into lines that fit the page width
    const lines = [];
    const words = plainTextContent.split(' ');
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);
      
      if (textWidth > width) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    // Draw the content
    for (const line of lines.slice(0, 40)) { // Limit to first 40 lines for now
      page.drawText(line, {
        x: margin,
        y,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
      
      y -= lineHeight;
      
      // If we're running out of space on the page, add a new page
      if (y < margin) {
        const newPage = pdfDoc.addPage([612, 792]);
        y = newPage.getHeight() - margin;
      }
    }
    
    // If we have CSR insights, add them on a new page
    if (csrInsights && csrInsights.length > 0) {
      const insightsPage = pdfDoc.addPage([612, 792]);
      y = insightsPage.getHeight() - margin;
      
      insightsPage.drawText('RELEVANT CLINICAL STUDY REPORTS', {
        x: margin,
        y,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      y -= lineHeight * 1.5;
      
      for (const csr of csrInsights.slice(0, 5)) { // Limit to first 5 CSRs
        insightsPage.drawText(`${csr.title || 'Untitled Study'}`, {
          x: margin,
          y,
          size: fontSize,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
        
        y -= lineHeight;
        
        if (csr.indication) {
          insightsPage.drawText(`Indication: ${csr.indication}`, {
            x: margin + 10,
            y,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
          
          y -= lineHeight;
        }
        
        if (csr.phase) {
          insightsPage.drawText(`Phase: ${csr.phase}`, {
            x: margin + 10,
            y,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
          
          y -= lineHeight;
        }
        
        if (csr.sample_size) {
          insightsPage.drawText(`Sample Size: ${csr.sample_size}`, {
            x: margin + 10,
            y,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
          
          y -= lineHeight;
        }
        
        if (csr.key_learnings) {
          insightsPage.drawText(`Key Learnings:`, {
            x: margin + 10,
            y,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
          
          y -= lineHeight;
          
          for (const learning of (Array.isArray(csr.key_learnings) ? csr.key_learnings : [csr.key_learnings])) {
            insightsPage.drawText(`• ${learning}`, {
              x: margin + 20,
              y,
              size: fontSize,
              font: font,
              color: rgb(0, 0, 0),
            });
            
            y -= lineHeight;
          }
        }
        
        y -= lineHeight;
        
        // Add a new page if needed
        if (y < margin * 3) {
          const newPage = pdfDoc.addPage([612, 792]);
          y = newPage.getHeight() - margin;
        }
      }
    }
    
    // If we have academic references, add them on a new page
    if (academicReferences && academicReferences.length > 0) {
      const refsPage = pdfDoc.addPage([612, 792]);
      y = refsPage.getHeight() - margin;
      
      refsPage.drawText('ACADEMIC REFERENCES', {
        x: margin,
        y,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      y -= lineHeight * 1.5;
      
      for (const ref of academicReferences) {
        // Format in APA style
        const authors = ref.author || 'Unknown Author';
        const year = ref.year || 'n.d.';
        const title = ref.title || 'Untitled';
        const publication = ref.publication || 'Unknown Publication';
        
        const citation = `${authors} (${year}). ${title}. ${publication}.`;
        
        // Split the citation into lines that fit the page width
        const citationLines = [];
        const citationWords = citation.split(' ');
        let currentLine = '';
        
        for (const word of citationWords) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const textWidth = font.widthOfTextAtSize(testLine, fontSize);
          
          if (textWidth > width) {
            citationLines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        
        if (currentLine) {
          citationLines.push(currentLine);
        }
        
        // Draw the citation
        for (let i = 0; i < citationLines.length; i++) {
          const line = citationLines[i];
          const xOffset = i === 0 ? margin : margin + 20; // Indent continuation lines
          
          refsPage.drawText(line, {
            x: xOffset,
            y,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
          
          y -= lineHeight;
        }
        
        y -= lineHeight / 2;
        
        // Add a new page if needed
        if (y < margin * 2) {
          const newPage = pdfDoc.addPage([612, 792]);
          y = newPage.getHeight() - margin;
        }
      }
    }
    
    // Serialize the PDFDocument to bytes
    const pdfBytes = await pdfDoc.save();
    
    // Set appropriate headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(title || 'protocol-recommendations')}.pdf"`);
    
    // Send the PDF as the response
    res.send(Buffer.from(pdfBytes));
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to generate PDF: ${error.message}` 
    });
  }
});

// Export to Word document format (using HTML that can be opened in Word)
router.post('/word', async (req, res) => {
  try {
    const { 
      title, 
      author = 'LumenTrialGuide.AI', 
      content,
      indication, 
      phase,
      csrInsights = [],
      academicReferences = []
    } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    // Create HTML document that Word can open
    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title || `Protocol Recommendations for ${indication} Study (${phase})`}</title>
  <style>
    body { font-family: Calibri, Arial, sans-serif; margin: 1in; }
    h1 { font-size: 18pt; margin-bottom: 0.5em; }
    h2 { font-size: 14pt; margin-top: 1.5em; margin-bottom: 0.5em; }
    p { font-size: 12pt; margin-bottom: 0.5em; }
    .author { font-style: italic; }
    .date { margin-bottom: 2em; }
    .reference { margin-left: 0.5in; text-indent: -0.5in; margin-bottom: 0.5em; }
  </style>
</head>
<body>
  <h1>${title || `Protocol Recommendations for ${indication} Study (${phase})`}</h1>
  <p class="author">Author: ${author}</p>
  <p class="date">Date: ${getFormattedDate()}</p>
  
  <h2>SUMMARY</h2>
  <div>${typeof content === 'string' ? content : JSON.stringify(content, null, 2)}</div>`;

    // Add CSR insights if available
    if (csrInsights && csrInsights.length > 0) {
      html += `
  <h2>RELEVANT CLINICAL STUDY REPORTS</h2>`;
      
      for (const csr of csrInsights.slice(0, 5)) { // Limit to first 5 CSRs
        html += `
  <p><strong>${csr.title || 'Untitled Study'}</strong></p>`;
        
        if (csr.indication) {
          html += `
  <p>Indication: ${csr.indication}</p>`;
        }
        
        if (csr.phase) {
          html += `
  <p>Phase: ${csr.phase}</p>`;
        }
        
        if (csr.sample_size) {
          html += `
  <p>Sample Size: ${csr.sample_size}</p>`;
        }
        
        if (csr.key_learnings) {
          html += `
  <p>Key Learnings:</p>
  <ul>`;
          
          for (const learning of (Array.isArray(csr.key_learnings) ? csr.key_learnings : [csr.key_learnings])) {
            html += `
    <li>${learning}</li>`;
          }
          
          html += `
  </ul>`;
        }
        
        html += `
  <hr>`;
      }
    }
    
    // Add academic references if available
    if (academicReferences && academicReferences.length > 0) {
      html += `
  <h2>ACADEMIC REFERENCES</h2>`;
      
      for (const ref of academicReferences) {
        // Format in APA style
        const authors = ref.author || 'Unknown Author';
        const year = ref.year || 'n.d.';
        const title = ref.title || 'Untitled';
        const publication = ref.publication || 'Unknown Publication';
        
        html += `
  <p class="reference">${authors} (${year}). ${title}. ${publication}.</p>`;
      }
    }
    
    html += `
</body>
</html>`;

    // Set headers for HTML document that Word can open
    res.setHeader('Content-Type', 'application/vnd.ms-word');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(title || 'protocol-recommendations')}.doc"`);
    
    // Send the HTML as the response
    res.send(html);
  } catch (error: any) {
    console.error('Error generating Word document:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to generate Word document: ${error.message}` 
    });
  }
});

// Export to BibTeX format (for academic references)
router.post('/bibtex', async (req, res) => {
  try {
    const { academicReferences = [] } = req.body;

    if (!academicReferences || academicReferences.length === 0) {
      return res.status(400).json({ success: false, message: 'Academic references are required' });
    }

    // Generate BibTeX content
    let bibtex = '';
    
    academicReferences.forEach((ref: any, index: number) => {
      const id = ref.id || `ref${index + 1}`;
      const authors = ref.author || 'Unknown Author';
      const year = ref.year || 'n.d.';
      const title = ref.title || 'Untitled';
      const publication = ref.publication || 'Unknown Publication';
      
      bibtex += `@article{${id},
  author = {${authors}},
  title = {${title}},
  journal = {${publication}},
  year = {${year}},
}\n\n`;
    });
    
    // Set headers for plain text download
    res.setHeader('Content-Type', 'application/x-bibtex');
    res.setHeader('Content-Disposition', 'attachment; filename="references.bib"');
    
    // Send the BibTeX as the response
    res.send(bibtex);
  } catch (error: any) {
    console.error('Error generating BibTeX:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to generate BibTeX: ${error.message}` 
    });
  }
});

// Export to CSV format for data analysis
router.post('/csv', async (req, res) => {
  try {
    const { 
      title,
      indication, 
      phase,
      csrInsights = []
    } = req.body;

    if (!csrInsights || csrInsights.length === 0) {
      return res.status(400).json({ success: false, message: 'CSR insights are required' });
    }

    // Determine all possible columns from the CSR insights
    const columns = new Set<string>();
    csrInsights.forEach((csr: any) => {
      Object.keys(csr).forEach(key => columns.add(key));
    });
    
    // Remove some complex fields that don't export well to CSV
    ['recommendations', 'detailed_insights', 'regulatory_insights', 'key_learnings', 
     'optimization_insights', 'recruitment_insights', 'efficacy_outcomes', 'safety_outcomes'].forEach(key => {
      columns.delete(key);
    });
    
    // Convert columns set to array and sort alphabetically
    const columnArray = Array.from(columns).sort();
    
    // Generate CSV header
    let csv = columnArray.map(col => `"${col}"`).join(',') + '\n';
    
    // Generate CSV rows
    csrInsights.forEach((csr: any) => {
      const row = columnArray.map(col => {
        const value = csr[col];
        
        if (value === null || value === undefined) {
          return '';
        } else if (typeof value === 'string') {
          // Escape quotes and wrap in quotes
          return `"${value.replace(/"/g, '""')}"`;
        } else if (typeof value === 'number' || typeof value === 'boolean') {
          return value.toString();
        } else {
          // For complex objects/arrays, stringify and wrap in quotes
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
      }).join(',');
      
      csv += row + '\n';
    });
    
    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(title || `${indication}_${phase}_csrs`)}.csv"`);
    
    // Send the CSV as the response
    res.send(csv);
  } catch (error: any) {
    console.error('Error generating CSV:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to generate CSV: ${error.message}` 
    });
  }
});

export default router;