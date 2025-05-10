const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate a structured Clinical Evaluation Report using OpenAI
 */
async function generateCER(deviceData, clinicalData, literatureData, templateSettings) {
  try {
    // First, analyze the clinical data for key findings
    const clinicalAnalysis = await analyzeClinicalData(clinicalData);
    
    // Generate a literature review
    const literatureReview = await generateLiteratureReview(literatureData, deviceData);
    
    // Generate a risk assessment
    const riskAssessment = await generateRiskAssessment(deviceData, clinicalData);
    
    // Generate the full CER combining all components
    const cerContent = await generateFullCER(
      deviceData,
      clinicalAnalysis,
      literatureReview,
      riskAssessment,
      templateSettings
    );
    
    return {
      deviceData,
      templateSettings,
      clinicalAnalysis,
      literatureReview,
      riskAssessment,
      cerContent
    };
  } catch (error) {
    console.error('Error generating CER:', error);
    throw new Error(`CER generation failed: ${error.message}`);
  }
}

/**
 * Analyze clinical data to extract key findings
 */
async function analyzeClinicalData(clinicalData) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert medical device clinical data analyst. Analyze the provided clinical data 
            and extract key findings, patterns, and insights relevant to a Clinical Evaluation Report. 
            Structure your analysis into clear sections with specific findings.`
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Analyze clinical data for a medical device",
            clinicalData
          })
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing clinical data:', error);
    throw new Error(`Clinical data analysis failed: ${error.message}`);
  }
}

/**
 * Generate a literature review based on provided references
 */
async function generateLiteratureReview(literatureData, deviceData) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert medical literature reviewer. Generate a comprehensive 
            literature review for a Clinical Evaluation Report based on the provided literature references.
            Focus on methodology, outcomes, and relevance to the device being evaluated.`
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Generate a literature review for a medical device CER",
            deviceData,
            literatureData
          })
        }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error generating literature review:', error);
    throw new Error(`Literature review generation failed: ${error.message}`);
  }
}

/**
 * Generate a risk assessment for the device
 */
async function generateRiskAssessment(deviceData, clinicalData) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert medical device risk assessor. Generate a comprehensive 
            risk assessment for a Clinical Evaluation Report based on the provided device and clinical data.
            Include risk identification, classification, mitigation strategies, and benefit-risk analysis.`
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Generate a risk assessment for a medical device CER",
            deviceData,
            clinicalData
          })
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error generating risk assessment:', error);
    throw new Error(`Risk assessment generation failed: ${error.message}`);
  }
}

/**
 * Generate the complete CER combining all components
 */
async function generateFullCER(deviceData, clinicalAnalysis, literatureReview, riskAssessment, templateSettings) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert medical device regulatory writer. Generate a complete 
            Clinical Evaluation Report combining the provided components. Follow EU MDR guidelines
            and ensure the document meets regulatory standards. Apply the specified template settings.`
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Generate a complete Clinical Evaluation Report",
            deviceData,
            clinicalAnalysis,
            literatureReview,
            riskAssessment,
            templateSettings
          })
        }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error generating full CER:', error);
    throw new Error(`Full CER generation failed: ${error.message}`);
  }
}

/**
 * Generate a PDF version of the CER
 */
async function generateCERPDF(cerData) {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Add metadata
    pdfDoc.setTitle(`Clinical Evaluation Report - ${cerData.deviceData.deviceName}`);
    pdfDoc.setAuthor('TrialSage AI');
    pdfDoc.setSubject('Clinical Evaluation Report');
    pdfDoc.setKeywords(['CER', 'Clinical Evaluation', 'Medical Device', 'Regulatory']);
    pdfDoc.setCreator('TrialSage AI CER Generator');
    pdfDoc.setProducer('TrialSage AI');
    
    // Get the standard font
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Add a cover page
    const coverPage = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = coverPage.getSize();
    
    // Add title
    coverPage.drawText('CLINICAL EVALUATION REPORT', {
      x: 150,
      y: height - 200,
      size: 24,
      font: helveticaBold,
      color: rgb(0, 0.3, 0.6)
    });
    
    // Add device name
    coverPage.drawText(`${cerData.deviceData.deviceName}`, {
      x: 150,
      y: height - 250,
      size: 18,
      font: helveticaBold
    });
    
    // Add manufacturer
    coverPage.drawText(`Manufacturer: ${cerData.deviceData.manufacturer || 'Not specified'}`, {
      x: 150,
      y: height - 280,
      size: 12,
      font: helveticaFont
    });
    
    // Add date
    coverPage.drawText(`Date: ${new Date().toLocaleDateString()}`, {
      x: 150,
      y: height - 300,
      size: 12,
      font: helveticaFont
    });
    
    // Add version
    coverPage.drawText(`Version: ${cerData.templateSettings.version || '1.0.0'}`, {
      x: 150,
      y: height - 320,
      size: 12,
      font: helveticaFont
    });
    
    // Add table of contents page
    const tocPage = pdfDoc.addPage([595.28, 841.89]);
    
    tocPage.drawText('TABLE OF CONTENTS', {
      x: 50,
      y: height - 50,
      size: 16,
      font: helveticaBold,
      color: rgb(0, 0.3, 0.6)
    });
    
    // Mock table of contents
    const tocItems = [
      { title: '1. Executive Summary', page: 3 },
      { title: '2. Device Description', page: 4 },
      { title: '3. Literature Review', page: 6 },
      { title: '4. Clinical Data Analysis', page: 10 },
      { title: '5. Risk Assessment', page: 15 },
      { title: '6. Conclusions', page: 20 },
      { title: '7. Appendices', page: 22 }
    ];
    
    tocItems.forEach((item, index) => {
      tocPage.drawText(item.title, {
        x: 50,
        y: height - 100 - (index * 20),
        size: 12,
        font: helveticaFont
      });
      
      tocPage.drawText(item.page.toString(), {
        x: 500,
        y: height - 100 - (index * 20),
        size: 12,
        font: helveticaFont
      });
      
      tocPage.drawLine({
        start: { x: 50, y: height - 102 - (index * 20) },
        end: { x: 500, y: height - 102 - (index * 20) },
        thickness: 0.5,
        color: rgb(0.9, 0.9, 0.9)
      });
    });
    
    // Add executive summary
    const summaryPage = pdfDoc.addPage([595.28, 841.89]);
    
    summaryPage.drawText('1. EXECUTIVE SUMMARY', {
      x: 50,
      y: height - 50,
      size: 16,
      font: helveticaBold,
      color: rgb(0, 0.3, 0.6)
    });
    
    // Extract the executive summary from our CER content
    let executiveSummary = "This is a placeholder for the executive summary. In a real implementation, this would contain detailed content from the AI-generated CER including key findings, methodology, and conclusions about the safety and performance of the device.";
    
    if (cerData.cerContent && cerData.cerContent.executiveSummary) {
      executiveSummary = cerData.cerContent.executiveSummary;
    }
    
    // Format and draw the executive summary text
    // This is a very basic text rendering - in a real app we'd use proper text layout
    const lines = wrapText(executiveSummary, 70);
    lines.forEach((line, index) => {
      const y = height - 100 - (index * 14);
      if (y > 50) { // Basic page overflow prevention
        summaryPage.drawText(line, {
          x: 50,
          y,
          size: 10,
          font: helveticaFont
        });
      }
    });
    
    // Add page numbers
    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const page = pdfDoc.getPage(i);
      page.drawText(`Page ${i + 1} of ${pdfDoc.getPageCount()}`, {
        x: 250,
        y: 30,
        size: 10,
        font: helveticaFont
      });
    }
    
    // In a real implementation, we would add all the sections here
    // with proper formatting, styles, headers, footers, etc.
    
    // Serialize to bytes
    const pdfBytes = await pdfDoc.save();
    
    // Save the PDF to a temporary file
    const tempFilePath = path.join(__dirname, '../../temp', `cer-${Date.now()}.pdf`);
    const tempDir = path.dirname(tempFilePath);
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    fs.writeFileSync(tempFilePath, pdfBytes);
    
    return {
      filePath: tempFilePath,
      fileName: `CER-${cerData.deviceData.deviceName.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`
    };
  } catch (error) {
    console.error('Error generating CER PDF:', error);
    throw new Error(`CER PDF generation failed: ${error.message}`);
  }
}

/**
 * Helper function to wrap text for PDF rendering
 */
function wrapText(text, maxCharsPerLine) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

/**
 * Extract text from a PDF document for analysis
 */
async function extractTextFromPDF(pdfPath) {
  return new Promise((resolve, reject) => {
    // In a real implementation, we would extract text using a PDF library
    // For demo purposes, we're returning a mock extraction
    resolve('This is placeholder text from a PDF document. In a real implementation, this would be actual text extracted from the PDF file.');
  });
}

module.exports = {
  generateCER,
  analyzeClinicalData,
  generateLiteratureReview,
  generateRiskAssessment,
  generateFullCER,
  generateCERPDF,
  extractTextFromPDF
};