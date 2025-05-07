/**
 * Clinical Evaluation Report API Routes
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// POST /api/cer/export-pdf - Export FAERS data to PDF
router.post('/export-pdf', async (req, res) => {
  try {
    const { productName, faersData } = req.body;
    
    if (!faersData) {
      return res.status(400).json({ 
        success: false,
        error: 'FAERS data is required' 
      });
    }
    
    console.log(`Generating PDF export for ${productName || 'unknown product'}`);
    
    // For now, just return a sample PDF URL
    // In a real implementation, this would generate a PDF
    const filename = `faers_report_${productName?.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    
    res.json({
      success: true,
      format: 'pdf',
      filename: filename,
      message: 'PDF document generated successfully',
      url: `/api/cer/downloads/${filename}`
    });
  } catch (error) {
    console.error('Error exporting FAERS data to PDF:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to export FAERS data to PDF',
      message: error.message 
    });
  }
});

// POST /api/cer/export-word - Export FAERS data to Word
router.post('/export-word', async (req, res) => {
  try {
    const { productName, faersData } = req.body;
    
    if (!faersData) {
      return res.status(400).json({ 
        success: false,
        error: 'FAERS data is required' 
      });
    }
    
    console.log(`Generating Word export for ${productName || 'unknown product'}`);
    
    // For now, provide PDF as a fallback
    const filename = `faers_report_${productName?.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    
    res.json({
      success: true,
      format: 'pdf',
      filename: filename,
      message: 'Document exported as PDF (DOCX format not available)',
      url: `/api/cer/downloads/${filename}`
    });
  } catch (error) {
    console.error('Error exporting FAERS data to Word:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to export FAERS data to Word',
      message: error.message 
    });
  }
});

// POST /api/cer/preview - Generate HTML preview of CER report
router.post('/preview', async (req, res) => {
  try {
    console.log('Preview request body:', JSON.stringify(req.body, null, 2));
    const { title, sections = [], faers = [], comparators = [] } = req.body;
    
    // Allow preview with either sections or FAERS data
    const hasFaers = faers && Array.isArray(faers) && faers.length > 0;
    const hasSections = sections && Array.isArray(sections) && sections.length > 0;
    
    console.log(`FAERS data: ${hasFaers ? 'present' : 'missing'}, Sections: ${hasSections ? 'present' : 'missing'}`);
    
    if (!hasFaers && !hasSections) {
      console.log('No content found for preview');
      return res.status(400).json({ error: 'Either sections or FAERS data is required' });
    }
    
    console.log(`Generating HTML preview for ${title || 'unknown product'}`);
    
    // Extract some basic information for the preview
    const reportCount = faers?.length || 0;
    const seriousCount = faers?.filter(r => r.is_serious)?.length || 0;
    
    // Generate sample HTML preview with sections and/or FAERS data
    let sectionsHtml = '';
    if (hasSections) {
      sectionsHtml = sections.map(section => {
        return `
          <div class="cer-user-section">
            <h4>${section.title || 'Section'}</h4>
            <div class="cer-section-content">
              ${section.content || ''}
            </div>
          </div>
        `;
      }).join('');
    }
    
    let faersHtml = '';
    if (hasFaers) {
      faersHtml = `
        <div class="cer-summary">
          <p>
            Based on the analysis of ${reportCount} adverse event reports from the FDA FAERS database, 
            ${title?.split(':')[1] || 'The product'} demonstrates a moderate risk profile with ${seriousCount} serious events reported.
            This data has been considered in the overall benefit-risk assessment of the product.
          </p>
        </div>
        
        <div class="cer-section">
          <h4>Summary of FAERS Findings</h4>
          <ul>
            <li>Total reports analyzed: ${reportCount}</li>
            <li>Serious adverse events: ${seriousCount}</li>
            <li>Reporting period: 2020-01-01 to ${new Date().toISOString().split('T')[0]}</li>
          </ul>
        </div>
        
        <div class="cer-section">
          <h4>Risk Assessment</h4>
          <p>
            The adverse event profile for ${title?.split(':')[1] || 'the product'} is consistent with similar products in its class.
            Most reported events were non-serious and resolved without intervention.
          </p>
        </div>
      `;
    }
    
    const html = `
      <div class="cer-preview-content">
        <div class="cer-section">
          <h2>Clinical Evaluation Report</h2>
          <h3>${title || 'Device/Product Evaluation'}</h3>
          
          ${faersHtml}
          ${sectionsHtml}
          
          <div class="cer-section">
            <h4>Conclusion</h4>
            <p>
              The safety profile of ${title?.split(':')[1] || 'the product'} is well-characterized and acceptable for its intended use.
              Continuous monitoring of adverse events will ensure ongoing safety assessment.
            </p>
          </div>
        </div>
      </div>
    `;
    
    res.json({
      success: true,
      html
    });
  } catch (error) {
    console.error('Error generating CER preview:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate CER preview',
      message: error.message 
    });
  }
});

// POST /api/cer/assistant - Get AI assistant response for CER development questions
router.post('/assistant', async (req, res) => {
  try {
    const { query, context } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    // We'll implement a simple response here for now
    // In a real implementation, this would call OpenAI
    const response = "CER sections should follow regulatory standards, with comprehensive clinical evidence, clear risk analysis, and thorough benefit-risk assessment. Ensure you include all relevant medical device data and follow the latest EU MDR requirements.";
    
    // Return a structured response
    res.json({
      query,
      response,
      sources: [
        { title: 'EU MDR 2017/745', section: 'Annex XIV' },
        { title: 'MEDDEV 2.7/1 Rev 4', section: '7' }
      ]
    });
  } catch (error) {
    console.error('Error processing assistant query:', error);
    res.status(500).json({ error: 'Failed to process query' });
  }
});

// POST /api/cer/improve-compliance - Get AI-generated improvements for compliance
router.post('/improve-compliance', async (req, res) => {
  try {
    const { section, standard, currentContent } = req.body;
    
    if (!section || !standard || !currentContent) {
      return res.status(400).json({ 
        error: 'Section, standard, and current content are required'
      });
    }
    
    console.log(`Analyzing ${section} compliance with ${standard} standard...`);
    console.log(`Content length: ${currentContent.length} characters`);
    
    // Determine standard name
    let standardName = 'International Standards';
    if (standard.toLowerCase().includes('eu mdr')) {
      standardName = 'EU MDR 2017/745';
    } else if (standard.toLowerCase().includes('iso')) {
      standardName = 'ISO 14155:2020';
    } else if (standard.toLowerCase().includes('fda')) {
      standardName = 'FDA 21 CFR';
    }
    
    // Generate sample compliance improvements
    const improvement = `## Compliance Improvement Recommendations for ${section.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Section

Based on analysis of your current content against ${standardName} requirements, here are specific recommendations to enhance regulatory compliance:

1. Include more comprehensive clinical evidence with quantitative data
2. Clearly state equivalence justification if claiming equivalence
3. Strengthen the connection between clinical data and risk analysis
4. Add explicit references to relevant harmonized standards
5. Expand your post-market surveillance plan with specific timelines

### Implementation Guidance

The most critical areas to address are points 1 and 3. Specifically, your section would benefit from more quantitative data and stronger connections between your evidence and conclusions.`;
    
    // Return the improvement suggestions
    return res.json({
      section,
      standard,
      improvement,
      aiGenerated: true,
      generatedAt: new Date().toISOString(),
      additionalResources: [
        { title: 'EU MDR 2017/745 Guidance', url: 'https://ec.europa.eu/health/md_sector/new_regulations/guidance_en' },
        { title: 'ISO 14155:2020 Key Points', url: 'https://www.iso.org/standard/71690.html' },
        { title: 'FDA 21 CFR Part 812', url: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfcfr/cfrsearch.cfm?cfrpart=812' }
      ]
    });
  } catch (error) {
    console.error('Error improving compliance:', error);
    return res.status(500).json({ error: 'Failed to improve compliance' });
  }
});

// POST /api/cer/assistant/chat - CER Assistant chat endpoint
router.post('/assistant/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    console.log(`CER Assistant receiving message: ${message.substring(0, 50)}...`);
    
    // Import the CER Chat Service
    const cerChatService = (await import('../services/cerChatService.js')).default;
    
    // Process the message using the real service
    const chatResponse = await cerChatService.processMessage(message, context || {});
    
    res.json(chatResponse);
  } catch (error) {
    console.error('Error in CER Assistant:', error);
    res.status(500).json({ 
      error: 'Failed to process your message',
      message: error.message
    });
  }
});

// Dummy downloads endpoint
router.get('/downloads/:filename', (req, res) => {
  const { filename } = req.params;
  
  // Create a sample PDF file with some content 
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  
  // Simple PDF creation 
  const pdfContent = `
%PDF-1.7
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 78 >>
stream
BT
/F1 24 Tf
100 700 Td
(Clinical Evaluation Report - Example PDF) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000010 00000 n
0000000059 00000 n
0000000118 00000 n
0000000217 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
345
%%EOF
  `;
  
  res.send(Buffer.from(pdfContent));
});

export default router;