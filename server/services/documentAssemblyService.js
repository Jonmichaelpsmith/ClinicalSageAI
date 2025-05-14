/**
 * Document Assembly Service
 * 
 * This service handles the assembly of complete CER and 510(k) reports by combining
 * various document sections and applying consistent formatting and validation.
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import axios from 'axios';

// Generate a unique ID (replacement for uuid)
function generateId() {
  return crypto.randomBytes(16).toString('hex');
}

// Configuration
const CONFIG = {
  outputDir: path.join(process.cwd(), 'generated_documents'),
  templateDir: path.join(process.cwd(), 'templates'),
  maxConcurrentAssemblies: 5,
  defaultTimeout: 180000, // 3 minutes
};

// Track active assembly operations
const activeAssemblies = new Map();

/**
 * Initialize document assembly service
 */
async function initialize() {
  try {
    // Ensure output directory exists
    await fs.mkdir(CONFIG.outputDir, { recursive: true });
    console.log(`Document Assembly Service initialized. Output directory: ${CONFIG.outputDir}`);
    return true;
  } catch (error) {
    console.error('Failed to initialize document assembly service:', error);
    return false;
  }
}

/**
 * Assemble a complete CER document from sections and metadata
 * 
 * @param {Object} cerData - The CER data including all sections and metadata
 * @param {Object} options - Assembly options
 * @returns {Promise<Object>} - Assembly result with document paths and status
 */
async function assembleCERDocument(cerData, options = {}) {
  const assemblyId = generateId();
  const startTime = Date.now();
  
  try {
    // Validate inputs
    if (!cerData || !cerData.deviceProfile) {
      throw new Error('CER data or device profile missing');
    }
    
    // Get device information
    const { deviceName, manufacturer } = cerData.deviceProfile;
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const outputFilename = `CER_${deviceName || 'Device'}_${timestamp}.html`;
    const outputPath = path.join(CONFIG.outputDir, outputFilename);
    
    // Track assembly operation
    activeAssemblies.set(assemblyId, {
      id: assemblyId,
      type: 'cer',
      status: 'in_progress',
      startTime,
      deviceName,
      outputPath,
    });
    
    // Collect all sections
    const sections = cerData.sections || [];
    
    // Create HTML document structure
    let documentHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Clinical Evaluation Report - ${deviceName || 'Medical Device'}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.5;
            color: #333;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            color: #2563eb;
            text-align: center;
            margin-bottom: 30px;
          }
          h2 {
            color: #1d4ed8;
            margin-top: 40px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 8px;
          }
          h3 {
            color: #1e40af;
            margin-top: 25px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            border: 1px solid #e5e7eb;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #f3f4f6;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          .section {
            margin-bottom: 30px;
          }
          .metadata {
            font-size: 12px;
            color: #6b7280;
          }
          .toc {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 40px;
          }
          .toc ul {
            list-style-type: none;
          }
          .toc a {
            text-decoration: none;
            color: #2563eb;
          }
          .toc a:hover {
            text-decoration: underline;
          }
          .references {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          .references ol {
            padding-left: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Clinical Evaluation Report</h1>
          <p><strong>${deviceName || 'Medical Device'}</strong>${manufacturer ? ' - ' + manufacturer : ''}</p>
          <p>Generated: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="toc" id="table-of-contents">
          <h2>Table of Contents</h2>
          <ul>
            <li><a href="#overview">1. Device Overview</a></li>
            ${sections.map((section, index) => 
              `<li><a href="#section-${index+2}">${index+2}. ${section.title || 'Untitled Section'}</a></li>`
            ).join('\n')}
            <li><a href="#conclusion">Conclusion</a></li>
          </ul>
        </div>
        
        <div class="section" id="overview">
          <h2>1. Device Overview</h2>
          <table>
            <tr>
              <th>Device Name</th>
              <td>${deviceName || 'Not Specified'}</td>
            </tr>
            <tr>
              <th>Manufacturer</th>
              <td>${cerData.deviceProfile.manufacturer || 'Not Specified'}</td>
            </tr>
            <tr>
              <th>Device Class</th>
              <td>${cerData.deviceProfile.deviceClass || 'Not Specified'}</td>
            </tr>
            <tr>
              <th>Intended Use</th>
              <td>${cerData.deviceProfile.intendedUse || 'Not Specified'}</td>
            </tr>
            <tr>
              <th>Device Description</th>
              <td>${cerData.deviceProfile.deviceDescription || 'Not Specified'}</td>
            </tr>
          </table>
        </div>
    `;
    
    // Add each section content
    sections.forEach((section, index) => {
      const sectionNumber = index + 2; // Start numbering from 2 (after overview)
      
      documentHtml += `
        <div class="section" id="section-${sectionNumber}">
          <h2>${sectionNumber}. ${section.title || 'Untitled Section'}</h2>
          ${section.content || ''}
          ${section.metadata ? `
            <div class="metadata">
              <p>Last updated: ${new Date(section.metadata.updatedAt || section.metadata.createdAt || Date.now()).toLocaleDateString()}</p>
            </div>
          ` : ''}
        </div>
      `;
    });
    
    // Add conclusion section
    documentHtml += `
        <div class="section" id="conclusion">
          <h2>Conclusion</h2>
          ${cerData.conclusion || '<p>Based on the clinical evaluation conducted, the device meets applicable requirements.</p>'}
        </div>
        
        <div class="footer">
          <p>This document was generated on ${new Date().toLocaleDateString()} by TrialSage Clinical Evaluation Report System.</p>
        </div>
      </body>
      </html>
    `;
    
    // Write to file
    await fs.writeFile(outputPath, documentHtml);
    
    // Update assembly status
    activeAssemblies.set(assemblyId, {
      ...activeAssemblies.get(assemblyId),
      status: 'completed',
      endTime: Date.now(),
      outputPath,
    });
    
    return {
      success: true,
      assemblyId,
      documentPath: outputPath,
      documentUrl: `/generated_documents/${outputFilename}`,
      documentName: outputFilename,
      executionTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Error assembling CER document:', error);
    
    // Update assembly status
    if (activeAssemblies.has(assemblyId)) {
      activeAssemblies.set(assemblyId, {
        ...activeAssemblies.get(assemblyId),
        status: 'failed',
        endTime: Date.now(),
        error: error.message,
      });
    }
    
    throw error;
  }
}

/**
 * Assemble a 510(k) submission document
 * 
 * @param {Object} submission510kData - The 510(k) submission data
 * @param {Object} options - Assembly options
 * @returns {Promise<Object>} - Assembly result with document paths and status
 */
async function assemble510kDocument(submission510kData, options = {}) {
  const assemblyId = uuidv4();
  const startTime = Date.now();
  
  try {
    // Validate inputs
    if (!submission510kData || !submission510kData.deviceProfile) {
      throw new Error('510(k) submission data or device profile missing');
    }
    
    // Get device information
    const { deviceName, manufacturer } = submission510kData.deviceProfile;
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const outputFilename = `510k_${deviceName || 'Device'}_${timestamp}.html`;
    const outputPath = path.join(CONFIG.outputDir, outputFilename);
    
    // Track assembly operation
    activeAssemblies.set(assemblyId, {
      id: assemblyId,
      type: '510k',
      status: 'in_progress',
      startTime,
      deviceName,
      outputPath,
    });
    
    // Collect all sections
    const sections = submission510kData.sections || [];
    
    // Create HTML document structure
    let documentHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>510(k) Submission - ${deviceName || 'Medical Device'}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.5;
            color: #333;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            color: #2563eb;
            text-align: center;
            margin-bottom: 30px;
          }
          h2 {
            color: #1d4ed8;
            margin-top: 40px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 8px;
          }
          h3 {
            color: #1e40af;
            margin-top: 25px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            border: 1px solid #e5e7eb;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #f3f4f6;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          .section {
            margin-bottom: 30px;
          }
          .metadata {
            font-size: 12px;
            color: #6b7280;
          }
          .toc {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 40px;
          }
          .toc ul {
            list-style-type: none;
          }
          .toc a {
            text-decoration: none;
            color: #2563eb;
          }
          .toc a:hover {
            text-decoration: underline;
          }
          .predicate-comparison {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>510(k) Premarket Notification</h1>
          <p><strong>${deviceName || 'Medical Device'}</strong>${manufacturer ? ' - ' + manufacturer : ''}</p>
          <p>Generated: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="toc" id="table-of-contents">
          <h2>Table of Contents</h2>
          <ul>
            <li><a href="#administrative">1. Administrative Information</a></li>
            <li><a href="#device-description">2. Device Description</a></li>
            <li><a href="#substantial-equivalence">3. Substantial Equivalence</a></li>
            ${sections.map((section, index) => 
              `<li><a href="#section-${index+4}">${index+4}. ${section.title || 'Untitled Section'}</a></li>`
            ).join('\n')}
            <li><a href="#conclusion">Conclusion</a></li>
          </ul>
        </div>
        
        <div class="section" id="administrative">
          <h2>1. Administrative Information</h2>
          <table>
            <tr>
              <th>Device Trade Name</th>
              <td>${deviceName || 'Not Specified'}</td>
            </tr>
            <tr>
              <th>Manufacturer</th>
              <td>${submission510kData.deviceProfile.manufacturer || 'Not Specified'}</td>
            </tr>
            <tr>
              <th>Common Name</th>
              <td>${submission510kData.deviceProfile.commonName || 'Not Specified'}</td>
            </tr>
            <tr>
              <th>Classification Name</th>
              <td>${submission510kData.deviceProfile.classificationName || 'Not Specified'}</td>
            </tr>
            <tr>
              <th>Device Class</th>
              <td>${submission510kData.deviceProfile.deviceClass || 'Not Specified'}</td>
            </tr>
            <tr>
              <th>Product Code</th>
              <td>${submission510kData.deviceProfile.productCode || 'Not Specified'}</td>
            </tr>
            <tr>
              <th>Regulation Number</th>
              <td>${submission510kData.deviceProfile.regulationNumber || 'Not Specified'}</td>
            </tr>
          </table>
        </div>
        
        <div class="section" id="device-description">
          <h2>2. Device Description</h2>
          <h3>Intended Use</h3>
          <p>${submission510kData.deviceProfile.intendedUse || 'Not Specified'}</p>
          
          <h3>Device Description</h3>
          <p>${submission510kData.deviceProfile.deviceDescription || 'Not Specified'}</p>
          
          <h3>Technological Characteristics</h3>
          <p>${submission510kData.deviceProfile.technicalSpecifications || 'Not Specified'}</p>
        </div>
        
        <div class="section" id="substantial-equivalence">
          <h2>3. Substantial Equivalence</h2>
          ${submission510kData.predicateComparison?.html || '<p>No predicate device comparison available.</p>'}
        </div>
    `;
    
    // Add each section content
    sections.forEach((section, index) => {
      const sectionNumber = index + 4; // Start numbering from 4 (after administrative, description, and equivalence)
      
      documentHtml += `
        <div class="section" id="section-${sectionNumber}">
          <h2>${sectionNumber}. ${section.title || 'Untitled Section'}</h2>
          ${section.content || ''}
          ${section.metadata ? `
            <div class="metadata">
              <p>Last updated: ${new Date(section.metadata.updatedAt || section.metadata.createdAt || Date.now()).toLocaleDateString()}</p>
            </div>
          ` : ''}
        </div>
      `;
    });
    
    // Add conclusion section
    documentHtml += `
        <div class="section" id="conclusion">
          <h2>Conclusion</h2>
          ${submission510kData.conclusion || '<p>Based on the information presented in this submission, the subject device is substantially equivalent to the predicate device(s).</p>'}
        </div>
        
        <div class="footer">
          <p>This document was generated on ${new Date().toLocaleDateString()} by TrialSage 510(k) Submission System.</p>
        </div>
      </body>
      </html>
    `;
    
    // Write to file
    await fs.writeFile(outputPath, documentHtml);
    
    // Update assembly status
    activeAssemblies.set(assemblyId, {
      ...activeAssemblies.get(assemblyId),
      status: 'completed',
      endTime: Date.now(),
      outputPath,
    });
    
    return {
      success: true,
      assemblyId,
      documentPath: outputPath,
      documentUrl: `/generated_documents/${outputFilename}`,
      documentName: outputFilename,
      executionTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Error assembling 510(k) document:', error);
    
    // Update assembly status
    if (activeAssemblies.has(assemblyId)) {
      activeAssemblies.set(assemblyId, {
        ...activeAssemblies.get(assemblyId),
        status: 'failed',
        endTime: Date.now(),
        error: error.message,
      });
    }
    
    throw error;
  }
}

/**
 * Get assembly status
 * 
 * @param {string} assemblyId - The assembly ID to check
 * @returns {Object|null} - Assembly status or null if not found
 */
function getAssemblyStatus(assemblyId) {
  return activeAssemblies.get(assemblyId) || null;
}

/**
 * List recent assembly operations
 * 
 * @param {Object} options - List options
 * @param {number} options.limit - Number of assemblies to return (default: 10)
 * @param {string} options.type - Filter by document type (cer, 510k)
 * @returns {Array} - Array of assembly operations
 */
function listAssemblies(options = {}) {
  const { limit = 10, type } = options;
  
  let assemblies = Array.from(activeAssemblies.values());
  
  // Apply type filter if specified
  if (type) {
    assemblies = assemblies.filter(assembly => assembly.type === type);
  }
  
  // Sort by start time (most recent first)
  assemblies.sort((a, b) => b.startTime - a.startTime);
  
  // Apply limit
  return assemblies.slice(0, limit);
}

export default {
  initialize,
  assembleCERDocument,
  assemble510kDocument,
  getAssemblyStatus,
  listAssemblies,
};