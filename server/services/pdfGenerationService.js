/**
 * PDF Generation Service
 * 
 * This service provides functionality to convert HTML documents to PDF
 * format, suitable for FDA 510(k) submissions and other regulatory documents.
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Configuration
const CONFIG = {
  outputDir: path.join(process.cwd(), 'generated_documents'),
  exampleDir: path.join(process.cwd(), 'attached_assets/example_reports'),
  tempDir: path.join(process.cwd(), 'temp'),
};

/**
 * Initialize PDF generation service
 */
async function initialize() {
  try {
    // Ensure output directory exists
    await fs.mkdir(CONFIG.outputDir, { recursive: true });
    await fs.mkdir(CONFIG.tempDir, { recursive: true });
    
    console.log(`PDF Generation Service initialized. Output directory: ${CONFIG.outputDir}`);
    return true;
  } catch (error) {
    console.error('Failed to initialize PDF generation service:', error);
    return false;
  }
}

/**
 * Generate a PDF for a 510(k) submission (simplified HTML version)
 * 
 * @param {string} htmlFilePath - Path to the HTML file
 * @param {Object} deviceProfile - The device profile information
 * @returns {Promise<string>} - Path to the HTML file with PDF formatting
 */
async function generate510kPdf(htmlFilePath, deviceProfile) {
  try {
    console.log(`Generating 510(k) document for ${deviceProfile.deviceName}...`);
    
    // Create timestamp for unique filename
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const outputFilename = `510k_${deviceProfile.deviceName.replace(/\s+/g, '_')}_${timestamp}.html`;
    const outputPath = path.join(CONFIG.outputDir, outputFilename);
    
    // Read the original HTML
    const originalHtml = await fs.readFile(htmlFilePath, 'utf8');
    
    // Add print-specific CSS for PDF formatting
    const printReadyHtml = originalHtml.replace('</head>',
      `<style>
        @media print {
          @page {
            size: Letter;
            margin: 1in;
          }
          body {
            font-family: "Times New Roman", Times, serif;
            font-size: 12pt;
            line-height: 1.5;
          }
          h1 {
            font-size: 14pt;
            font-weight: bold;
            margin-top: 24pt;
            margin-bottom: 12pt;
          }
          h2 {
            font-size: 12pt;
            font-weight: bold;
            margin-top: 12pt;
            margin-bottom: 6pt;
          }
          .page-break {
            page-break-before: always;
          }
          /* Print header and footer */
          @top-right {
            content: "${deviceProfile.deviceName} 510(k) Submission";
            font-size: 9pt;
          }
          @bottom-center {
            content: "Page " counter(page) " of " counter(pages);
            font-size: 9pt;
          }
        }
        /* Add a note at the top of the HTML version */
        .print-note {
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 15px;
          margin-bottom: 20px;
          display: block;
        }
        @media print {
          .print-note {
            display: none;
          }
        }
      </style>
      </head>`
    );
    
    // Add a print instruction note
    const htmlWithNote = printReadyHtml.replace('<body>', 
      `<body>
      <div class="print-note">
        <h3>FDA 510(k) Submission Document</h3>
        <p>This document is formatted for FDA submission. For a properly formatted PDF:</p>
        <ol>
          <li>Use your browser's print function (Ctrl+P or Cmd+P)</li>
          <li>Select "Save as PDF" as the destination</li>
          <li>Ensure "Letter" page size is selected</li>
          <li>Set margins to 1 inch on all sides</li>
          <li>Enable "Background graphics" option if available</li>
          <li>Click "Save" to generate the PDF</li>
        </ol>
      </div>`
    );
    
    // Write the print-ready HTML to the output file
    await fs.writeFile(outputPath, htmlWithNote);
    
    console.log(`Print-ready 510(k) document saved to: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('Error generating 510(k) document:', error);
    throw error;
  }
}

/**
 * Generate a PDF-ready HTML for a CER document
 * 
 * @param {string} htmlFilePath - Path to the HTML file
 * @param {Object} deviceProfile - The device profile information 
 * @returns {Promise<string>} - Path to generated HTML with PDF formatting
 */
async function generateCerPdf(htmlFilePath, deviceProfile) {
  try {
    console.log(`Generating CER document for ${deviceProfile.deviceName}...`);
    
    // Create timestamp for unique filename
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const outputFilename = `CER_${deviceProfile.deviceName.replace(/\s+/g, '_')}_${timestamp}.html`;
    const outputPath = path.join(CONFIG.outputDir, outputFilename);
    
    // Read the original HTML
    const originalHtml = await fs.readFile(htmlFilePath, 'utf8');
    
    // Add print-specific CSS for PDF formatting
    const printReadyHtml = originalHtml.replace('</head>',
      `<style>
        @media print {
          @page {
            size: A4;
            margin: 2cm;
          }
          body {
            font-family: "Arial", sans-serif;
            font-size: 11pt;
            line-height: 1.5;
          }
          h1 {
            font-size: 14pt;
            font-weight: bold;
            margin-top: 24pt;
            margin-bottom: 12pt;
          }
          h2 {
            font-size: 12pt;
            font-weight: bold;
            margin-top: 12pt;
            margin-bottom: 6pt;
          }
          .page-break {
            page-break-before: always;
          }
          /* Print header and footer */
          @top-right {
            content: "${deviceProfile.deviceName} Clinical Evaluation Report";
            font-size: 9pt;
          }
          @bottom-center {
            content: "Page " counter(page) " of " counter(pages);
            font-size: 9pt;
          }
        }
        /* Add a note at the top of the HTML version */
        .print-note {
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 15px;
          margin-bottom: 20px;
          display: block;
        }
        @media print {
          .print-note {
            display: none;
          }
        }
      </style>
      </head>`
    );
    
    // Add a print instruction note
    const htmlWithNote = printReadyHtml.replace('<body>', 
      `<body>
      <div class="print-note">
        <h3>Clinical Evaluation Report Document</h3>
        <p>This document is formatted according to MEDDEV 2.7/1 guidelines. For a properly formatted PDF:</p>
        <ol>
          <li>Use your browser's print function (Ctrl+P or Cmd+P)</li>
          <li>Select "Save as PDF" as the destination</li>
          <li>Ensure "A4" page size is selected</li>
          <li>Set margins to 2cm on all sides</li>
          <li>Enable "Background graphics" option if available</li>
          <li>Click "Save" to generate the PDF</li>
        </ol>
      </div>`
    );
    
    // Write the print-ready HTML to the output file
    await fs.writeFile(outputPath, htmlWithNote);
    
    console.log(`Print-ready CER document saved to: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('Error generating CER document:', error);
    throw error;
  }
}

/**
 * Generate an example 510(k) PDF
 * 
 * @returns {Promise<string>} - Path to the example report
 */
async function generateExample510kPdf() {
  try {
    console.log('Generating example 510(k) PDF...');
    
    // Example device profile
    const exampleDeviceProfile = {
      deviceName: "CardioFlow X1 Cardiac Monitor",
      manufacturer: "MedTech Innovations, Inc.",
    };
    
    // Create simple but FDA-compliant HTML
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>510(k) Submission - ${exampleDeviceProfile.deviceName}</title>
  <style>
    body {
      font-family: "Times New Roman", Times, serif;
      font-size: 12pt;
      line-height: 1.5;
      margin: 1in;
    }
    h1 {
      font-size: 14pt;
      font-weight: bold;
      margin-top: 24pt;
      margin-bottom: 12pt;
      text-align: center;
    }
    h2 {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 12pt;
      margin-bottom: 6pt;
    }
    h3 {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 12pt;
      margin-bottom: 6pt;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12pt;
      margin-bottom: 12pt;
    }
    th, td {
      border: 1px solid black;
      padding: 6pt;
      text-align: left;
      vertical-align: top;
    }
    th {
      background-color: #f2f2f2;
    }
    .center {
      text-align: center;
    }
    .title-page {
      margin-top: 3in;
      text-align: center;
    }
    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>
  <div class="title-page">
    <h1 style="font-size: 16pt;">PREMARKET NOTIFICATION</h1>
    <h1 style="font-size: 16pt;">510(k) SUBMISSION</h1>
    <h1 style="font-size: 16pt;">${exampleDeviceProfile.deviceName}</h1>
    <p>Submitted by: ${exampleDeviceProfile.manufacturer}</p>
    <p>Date: ${new Date().toLocaleDateString()}</p>
  </div>
  
  <div class="page-break">
    <h1>Administrative Information</h1>
    <table>
      <tr>
        <th style="width: 30%;">Field</th>
        <th style="width: 70%;">Information</th>
      </tr>
      <tr>
        <td>Device Trade Name</td>
        <td>CardioFlow X1 Cardiac Monitor</td>
      </tr>
      <tr>
        <td>Manufacturer</td>
        <td>MedTech Innovations, Inc.</td>
      </tr>
      <tr>
        <td>Common Name</td>
        <td>Cardiac Monitor</td>
      </tr>
      <tr>
        <td>Classification Name</td>
        <td>Monitor, Cardiac (including Cardiotachometer and Rate Alarm)</td>
      </tr>
      <tr>
        <td>Device Class</td>
        <td>II</td>
      </tr>
      <tr>
        <td>Product Code</td>
        <td>DRT</td>
      </tr>
      <tr>
        <td>Regulation Number</td>
        <td>870.2300</td>
      </tr>
    </table>
  </div>
  
  <div class="page-break">
    <h1>Device Description</h1>
    <h2>Intended Use</h2>
    <p>The CardioFlow X1 Cardiac Monitor is intended for continuous monitoring of cardiac output and cardiac rhythm in adult patients in clinical and hospital environments.</p>
    
    <h2>Device Description</h2>
    <p>The CardioFlow X1 is a portable cardiac monitor that utilizes advanced sensor technology to provide continuous, real-time monitoring of cardiac output, rhythm, and associated physiological parameters. The device features a high-resolution touch display, wireless connectivity, and is designed for use in various clinical settings.</p>
    
    <h2>Technical Specifications</h2>
    <p>Dimensions: 8.5" x 5.2" x 1.3", Weight: 320g, Display: 7" touch-screen LCD, Battery: Rechargeable lithium-ion (12 hours operation), Connectivity: Bluetooth 5.0, Wi-Fi (802.11 a/b/g/n), Data storage: 72 hours of continuous recording</p>
  </div>
  
  <div class="page-break">
    <h1>Substantial Equivalence</h1>
    <p>The following section presents a comparison between the subject device and the legally marketed predicate device to demonstrate substantial equivalence.</p>
    
    <h2>Predicate Device</h2>
    <p>Primary Predicate: CardioSense PRO (K123456)</p>
    
    <table>
      <tr>
        <th>Feature</th>
        <th>CardioFlow X1 (Subject Device)</th>
        <th>CardioSense PRO (Predicate)</th>
        <th>Comparison</th>
      </tr>
      <tr>
        <td><strong>Intended Use</strong></td>
        <td>Continuous monitoring of cardiac output and cardiac rhythm in adult patients in clinical and hospital environments</td>
        <td>Continuous monitoring of cardiac output and cardiac rhythm in adult patients in clinical and hospital environments</td>
        <td>Same</td>
      </tr>
      <tr>
        <td><strong>Device Classification</strong></td>
        <td>Class II</td>
        <td>Class II</td>
        <td>Same</td>
      </tr>
      <tr>
        <td><strong>Product Code</strong></td>
        <td>DRT</td>
        <td>DRT</td>
        <td>Same</td>
      </tr>
      <tr>
        <td><strong>Measurement Technology</strong></td>
        <td>Impedance cardiography with advanced algorithm</td>
        <td>Impedance cardiography</td>
        <td>Similar, with enhanced algorithm</td>
      </tr>
    </table>
    
    <h2>Substantial Equivalence Analysis</h2>
    <p>The CardioFlow X1 has the same intended use, patient population, and fundamental technology as the predicate device CardioSense PRO. The differences between the subject and predicate devices do not raise new questions of safety or effectiveness.</p>
  </div>
  
  <div class="page-break">
    <h1>Performance Testing</h1>
    <h2>Bench Testing</h2>
    <p>The CardioFlow X1 Cardiac Monitor underwent comprehensive bench testing to validate its performance against established industry standards and predicate devices. The following tests were conducted:</p>
    <ul>
      <li>Electrical safety testing according to IEC 60601-1</li>
      <li>Electromagnetic compatibility testing according to IEC 60601-1-2</li>
      <li>Accuracy testing for cardiac output measurement</li>
      <li>Alarm system functionality testing</li>
      <li>Battery performance and longevity testing</li>
      <li>Mechanical integrity and durability testing</li>
    </ul>
    <p>All test results demonstrated that the CardioFlow X1 meets or exceeds the established performance criteria and is substantially equivalent to legally marketed predicate devices.</p>
  </div>
  
  <div class="page-break">
    <h1>Conclusion</h1>
    <p>Based on the comparison of intended use, technological characteristics, performance data, and overall evaluation, the subject device is substantially equivalent to the legally marketed predicate device. The subject device does not raise new questions of safety or effectiveness and performs as well as or better than the predicate device.</p>
    <p>The data presented in this submission demonstrate that the CardioFlow X1 Cardiac Monitor is as safe and effective as the predicate device and is substantially equivalent to the CardioSense PRO (K123456) for its intended use.</p>
  </div>
</body>
</html>`;

    // Write HTML to temp file
    const htmlFilePath = path.join(CONFIG.tempDir, 'example_510k.html');
    await fs.writeFile(htmlFilePath, htmlContent);
    
    // Generate PDF
    const pdfPath = await generate510kPdf(htmlFilePath, exampleDeviceProfile);
    
    // Save a copy to example directory
    const exampleFilename = 'Example_510k_Submission.html';
    const examplePath = path.join(CONFIG.exampleDir, exampleFilename);
    await fs.copyFile(htmlFilePath, examplePath);
    
    console.log(`Example 510(k) report generated and saved to: ${pdfPath}`);
    return pdfPath;
  } catch (error) {
    console.error('Error generating example 510(k) PDF:', error);
    throw error;
  }
}

export default {
  initialize,
  generate510kPdf,
  generateCerPdf,
  generateExample510kPdf,
};