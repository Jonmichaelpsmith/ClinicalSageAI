/**
 * Document Assembly Service
 * 
 * This service provides document assembly functionality for Clinical Evaluation Reports (CERs),
 * merging content from different sections into a complete document according to
 * MEDDEV 2.7/1 Rev 4 guidelines.
 */

import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Get template content for a specific CER section
 * 
 * @param {string} sectionKey - The section key/identifier
 * @returns {Promise<string>} - The template content
 */
const getTemplateContent = async (sectionKey) => {
  try {
    const templatesDir = path.join(process.cwd(), 'templates', 'cer');
    const templatePath = path.join(templatesDir, `${sectionKey}.html`);
    
    try {
      // Check if template exists
      await fs.access(templatePath);
      const content = await fs.readFile(templatePath, 'utf8');
      return content;
    } catch (e) {
      // If template doesn't exist, use default template
      console.log(`Template for ${sectionKey} not found, using default`);
      return `<section id="${sectionKey}">
        <h2>${sectionKey.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase())}</h2>
        <p>{{${sectionKey}_content}}</p>
      </section>`;
    }
  } catch (error) {
    console.error(`Error loading template for ${sectionKey}:`, error);
    throw error;
  }
};

/**
 * Generate CER document structure based on device class and configurations
 * 
 * @param {Object} deviceProfile - The device profile
 * @returns {Promise<Array>} - Array of section keys in the correct order
 */
const generateDocumentStructure = async (deviceProfile) => {
  const deviceClass = deviceProfile.deviceClass || 'IIa';
  
  // Base structure required for all device classes
  const baseStructure = [
    'executive-summary',
    'device-description',
    'intended-use',
    'regulatory-status',
    'literature-review',
    'clinical-evaluation',
    'risk-benefit-analysis',
    'post-market-surveillance',
    'conclusion',
    'references'
  ];
  
  // Additional sections for higher-risk devices
  if (deviceClass === 'IIb' || deviceClass === 'III') {
    // Insert clinical investigation data section after literature review
    const index = baseStructure.indexOf('literature-review') + 1;
    baseStructure.splice(index, 0, 'clinical-investigation-data');
    
    // Add more rigorous post-market surveillance for class III
    if (deviceClass === 'III') {
      const pmsIndex = baseStructure.indexOf('post-market-surveillance');
      baseStructure.splice(pmsIndex + 1, 0, 'post-market-clinical-follow-up');
    }
  }
  
  return baseStructure;
};

/**
 * Merge content into a template by replacing placeholders
 * 
 * @param {string} template - The template content with placeholders
 * @param {Object} contentMap - Map of placeholder keys to content values
 * @returns {string} - The merged content
 */
const mergeContentIntoTemplate = (template, contentMap) => {
  let mergedContent = template;
  
  // Replace each placeholder with its corresponding content
  Object.entries(contentMap).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    mergedContent = mergedContent.replace(new RegExp(placeholder, 'g'), value);
  });
  
  return mergedContent;
};

/**
 * Assemble a complete CER document from section content
 * 
 * @param {Object} cerData - The CER data including device profile and section content
 * @returns {Promise<Object>} - The assembled document
 */
const assembleCERDocument = async (cerData) => {
  try {
    const { deviceProfile, sections = {} } = cerData;
    
    // Generate the document structure based on device class
    const documentStructure = await generateDocumentStructure(deviceProfile);
    
    // Assemble each section
    const assembledSections = await Promise.all(
      documentStructure.map(async (sectionKey) => {
        const template = await getTemplateContent(sectionKey);
        const sectionContent = sections[sectionKey] || '';
        
        const contentMap = {
          [`${sectionKey}_content`]: sectionContent,
          device_name: deviceProfile.deviceName || 'Unknown Device',
          manufacturer: deviceProfile.manufacturer || 'Unknown Manufacturer',
          device_class: deviceProfile.deviceClass || 'IIa',
        };
        
        return {
          key: sectionKey,
          content: mergeContentIntoTemplate(template, contentMap)
        };
      })
    );
    
    // Generate TOC entries
    const tocEntries = assembledSections.map(section => ({
      key: section.key,
      title: section.key.replace(/-/g, ' ').replace(/^\w|\s\w/g, c => c.toUpperCase())
    }));
    
    // Combine sections into full document
    const fullDocument = assembledSections.map(section => section.content).join('\n\n');
    
    // Build header data for the document
    const headerData = {
      title: `Clinical Evaluation Report - ${deviceProfile.deviceName || 'Unknown Device'}`,
      manufacturer: deviceProfile.manufacturer || 'Unknown Manufacturer',
      device_class: deviceProfile.deviceClass || 'IIa',
      reference_number: deviceProfile.referenceNumber || 'REF-' + Date.now(),
      revision: deviceProfile.revision || '1.0',
      date: new Date().toISOString().split('T')[0]
    };
    
    return {
      headerData,
      tocEntries,
      fullDocument,
      sections: assembledSections
    };
  } catch (error) {
    console.error('Error assembling CER document:', error);
    throw error;
  }
};

/**
 * Generate a complete CER document in HTML format
 * 
 * @param {Object} cerData - The CER data including device profile and section content
 * @returns {Promise<string>} - The assembled document in HTML format
 */
const generateCERDocument = async (cerData) => {
  try {
    const assembled = await assembleCERDocument(cerData);
    
    // Load the main document template
    const documentTemplatePath = path.join(process.cwd(), 'templates', 'cer', 'document.html');
    let documentTemplate;
    
    try {
      documentTemplate = await fs.readFile(documentTemplatePath, 'utf8');
    } catch (e) {
      console.log('Main document template not found, using default');
      documentTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>{{title}}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 2cm; }
    .header { text-align: center; margin-bottom: 2cm; }
    .toc { margin-bottom: 2cm; }
    .section { margin-bottom: 1cm; }
    h1 { font-size: 24pt; }
    h2 { font-size: 18pt; border-bottom: 1px solid #ccc; }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{title}}</h1>
    <p>Manufacturer: {{manufacturer}}</p>
    <p>Device Class: {{device_class}}</p>
    <p>Reference: {{reference_number}}</p>
    <p>Revision: {{revision}}</p>
    <p>Date: {{date}}</p>
  </div>
  
  <div class="toc">
    <h2>Table of Contents</h2>
    <ul>
      {{toc_items}}
    </ul>
  </div>
  
  <div class="content">
    {{content}}
  </div>
</body>
</html>`;
    }
    
    // Generate TOC HTML
    const tocItemsHtml = assembled.tocEntries.map((entry, index) => 
      `<li><a href="#${entry.key}">${index + 1}. ${entry.title}</a></li>`
    ).join('\n');
    
    // Merge content into main template
    const contentMap = {
      title: assembled.headerData.title,
      manufacturer: assembled.headerData.manufacturer,
      device_class: assembled.headerData.device_class,
      reference_number: assembled.headerData.reference_number,
      revision: assembled.headerData.revision,
      date: assembled.headerData.date,
      toc_items: tocItemsHtml,
      content: assembled.fullDocument
    };
    
    return mergeContentIntoTemplate(documentTemplate, contentMap);
  } catch (error) {
    console.error('Error generating CER document:', error);
    throw error;
  }
};

/**
 * Enhance the assembled CER with AI review and refinement
 * 
 * @param {string} cerDocument - The assembled CER document
 * @param {Object} deviceProfile - The device profile
 * @returns {Promise<string>} - The enhanced document
 */
const enhanceCERWithAI = async (cerDocument, deviceProfile) => {
  try {
    console.log('Enhancing CER document with AI...');
    
    // If OpenAI API key is not available, return the document as is
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not available, skipping AI enhancement');
      return cerDocument;
    }
    
    const prompt = `
You are a medical device regulatory expert specializing in Clinical Evaluation Reports (CERs). 
Review and enhance the following CER document for a ${deviceProfile.deviceClass || 'IIa'} 
class device named "${deviceProfile.deviceName || 'medical device'}" according to 
MEDDEV 2.7/1 Rev 4 guidelines.

Improve the document by:
1. Ensuring consistent formatting and style
2. Checking for regulatory compliance
3. Enhancing clarity and precision of language
4. Ensuring appropriate references and citations
5. Maintaining the HTML structure

Here is the CER document HTML:
${cerDocument}

Return the enhanced HTML document with your improvements.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // The newest OpenAI model
      messages: [
        {
          role: "system", 
          content: "You are a medical device regulatory expert specializing in Clinical Evaluation Reports. Your task is to review and enhance CER documents according to MEDDEV 2.7/1 Rev 4 guidelines while preserving the original HTML structure."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
    });
    
    const enhancedDocument = completion.choices[0].message.content;
    return enhancedDocument;
  } catch (error) {
    console.error('Error enhancing CER with AI:', error);
    // Return original document if enhancement fails
    return cerDocument;
  }
};

/**
 * Generate and save a CER document
 * 
 * @param {Object} cerData - The CER data
 * @param {boolean} enhance - Whether to enhance the document with AI
 * @returns {Promise<Object>} - The result of the operation
 */
const generateAndSaveCER = async (cerData, enhance = true) => {
  try {
    // Generate the basic document
    const cerDocument = await generateCERDocument(cerData);
    
    // Enhance with AI if requested
    const finalDocument = enhance 
      ? await enhanceCERWithAI(cerDocument, cerData.deviceProfile)
      : cerDocument;
    
    // Create a timestamp-based filename
    const timestamp = Date.now();
    const deviceName = cerData.deviceProfile.deviceName || 'device';
    const sanitizedDeviceName = deviceName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `cer_${sanitizedDeviceName}_${timestamp}.html`;
    
    // Save to the generated_documents directory
    const outputDir = path.join(process.cwd(), 'generated_documents');
    
    // Ensure directory exists
    try {
      await fs.access(outputDir);
    } catch (e) {
      await fs.mkdir(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, filename);
    await fs.writeFile(outputPath, finalDocument, 'utf8');
    
    return {
      success: true,
      filename,
      path: outputPath,
      documentSize: finalDocument.length,
      enhanced: enhance
    };
  } catch (error) {
    console.error('Error generating and saving CER:', error);
    throw error;
  }
};

export {
  assembleCERDocument,
  generateCERDocument,
  enhanceCERWithAI,
  generateAndSaveCER
};