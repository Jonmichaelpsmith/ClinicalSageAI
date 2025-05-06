/**
 * CER API Service
 * 
 * Provides utility functions for interacting with the CER Generator API endpoints.
 * Centralizes all API calls related to CER generation, export, FAERS data fetching,
 * and regulatory compliance scoring.
 * 
 * This service integrates with GPT-4o powered endpoints for intelligent document generation
 * and regulatory compliance analysis based on EU MDR, ISO 14155, and FDA guidelines.
 */

// Create a single export object for consistent API access
const cerApiService = {};

/**
 * Fetch FAERS data for a given product
 * @param {string} productName - The name of the product to fetch FAERS data for
 * @returns {Promise<Object>} - The FAERS data for the product
 */
cerApiService.fetchFaersData = async (productName) => {
  try {
    const response = await fetch(`/api/cer/fetch-faers?product=${encodeURIComponent(productName)}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching FAERS data: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in fetchFaersData:', error);
    throw error;
  }
};

/**
 * Generate a CER section based on context
 * @param {Object} params - Parameters for generating the section
 * @param {string} params.sectionType - The type of section to generate
 * @param {string} params.context - The context for the section
 * @param {string} [params.productName] - Optional product name for context
 * @returns {Promise<Object>} - The generated section
 */
cerApiService.generateSection = async ({ sectionType, context, productName }) => {
  try {
    const response = await fetch('/api/cer/generate-section', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        section: sectionType,
        context,
        productName
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error generating section: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in generateSection:', error);
    throw error;
  }
};

// First implementation of exportToPDF and exportToWord removed to fix duplication

/**
 * Download a Blob as a file
 * @param {Blob} blob - The Blob to download
 * @param {string} filename - The name to give the downloaded file
 */
cerApiService.downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Get compliance score for CER sections against regulatory standards
 * @param {Object} params - Parameters for compliance scoring
 * @param {Array} params.sections - The sections to analyze
 * @param {string} params.title - The title of the CER
 * @param {Array} params.standards - Optional array of regulatory standards to check against (defaults to EU MDR, ISO 14155, FDA)
 * @returns {Promise<Object>} - The compliance score results
 */
cerApiService.getComplianceScore = async ({ sections, title, standards = ['EU MDR', 'ISO 14155', 'FDA'] }) => {
  try {
    const response = await fetch('/api/cer/compliance-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sections,
        title,
        standards,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error getting compliance score: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getComplianceScore:', error);
    throw error;
  }
};

/**
 * Export compliance score results as a PDF report
 * @param {Object} data - The compliance score data to include in the report
 * @returns {Promise<Blob>} - The PDF report as a Blob
 */
cerApiService.exportCompliancePDF = async (data) => {
  try {
    const response = await fetch('/api/cer/export-compliance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });
    
    if (!response.ok) {
      throw new Error(`Error exporting compliance PDF: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error in exportCompliancePDF:', error);
    throw error;
  }
};

/**
 * Generate a complete CER using GPT-4o intelligence
 * @param {Object} params - Parameters for generating the full CER
 * @param {Object} params.deviceInfo - Information about the device
 * @param {string} params.deviceInfo.name - The name of the device
 * @param {string} params.deviceInfo.type - The type/classification of the device
 * @param {string} params.deviceInfo.manufacturer - The manufacturer of the device
 * @param {string} params.deviceInfo.intendedUse - The intended use of the device
 * @param {string} params.templateId - The regulatory template to use (eu-mdr, fda-510k, meddev, iso-14155)
 * @param {Array} params.literature - Optional array of literature references
 * @param {Object} params.fdaData - Optional FAERS data
 * @returns {Promise<Object>} - The fully generated CER with all required sections
 */
cerApiService.generateFullCER = async ({ 
  deviceInfo = {}, 
  templateId = 'eu-mdr',
  literature = [],
  fdaData = null
}) => {
  try {
    // Ensure deviceInfo has all required fields
    const enhancedDeviceInfo = {
      name: deviceInfo.name || deviceInfo.deviceName || '',
      type: deviceInfo.type || deviceInfo.deviceType || '',
      manufacturer: deviceInfo.manufacturer || '',
      intendedUse: deviceInfo.intendedUse || ''
    };
    
    console.log('Calling Zero-Click Report generation with:', {
      deviceInfo: enhancedDeviceInfo,
      templateId,
      literatureCount: literature.length,
      hasFdaData: !!fdaData
    });
    
    const response = await fetch('/api/cer/generate-full', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceInfo: enhancedDeviceInfo,
        templateId,
        literature,
        fdaData
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error generating zero-click CER: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in generateFullCER:', error);
    throw error;
  }
};

/**
 * Get AI-generated improvements for a CER section to increase compliance
 * @param {Object} params - Parameters for compliance improvements
 * @param {string} params.section - The type or ID of the section to improve
 * @param {string} params.currentContent - The current content of the section
 * @param {string} params.standard - The regulatory standard to optimize for (EU MDR, ISO 14155, FDA)
 * @returns {Promise<Object>} - The improved section content with recommendations
 */
cerApiService.getComplianceImprovements = async ({ section, currentContent, standard }) => {
  try {
    const response = await fetch('/api/cer/improve-compliance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        section,
        currentContent,
        standard,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error getting compliance improvements: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getComplianceImprovements:', error);
    throw error;
  }
};

/**
 * Get AI assistant response for CER development questions
 * @param {string} query - The user query about CER development
 * @param {Object} context - Optional context about the current CER
 * @returns {Promise<Object>} - The AI assistant response
 */
cerApiService.getAssistantResponse = async (query, context = {}) => {
  try {
    const response = await fetch('/api/cer/assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        context,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error getting AI assistant response: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getAssistantResponse:', error);
    throw error;
  }
};

/**
 * Ask the CER AI Assistant a question and get a contextual response
 * This specialized assistant understands regulatory requirements and can explain CER decisions
 * @param {Object} params - Parameters for the assistant
 * @param {string} params.question - The user's question about CER or regulatory requirements
 * @param {Object} params.context - Optional context including sections, FAERS data, and selected section
 * @returns {Promise<Object>} - The AI assistant response with answer and relevant references
 */
cerApiService.askCerAssistant = async ({ question, context = {} }) => {
  try {
    const response = await fetch('/api/cer/assistant/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: question,
        context: {
          sections: context.sections || [],
          faers: context.faers || [],
          selectedSection: context.selectedSection || null,
          title: context.title || 'Clinical Evaluation Report'
        }
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error getting CER assistant response: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in askCerAssistant:', error);
    throw error;
  }
};

// Second implementation of generateSection removed to fix duplication

/**
 * Get a preview of the CER
 * @param {Object} params - Parameters for the preview
 * @param {string} params.title - The title of the CER
 * @param {Array} params.sections - The sections of the CER
 * @param {Array} params.faers - FAERS data
 * @param {Array} params.comparators - Comparator data
 * @returns {Promise<Object>} - The preview data
 */
cerApiService.getPreview = async ({ title, sections, faers, comparators }) => {
  try {
    const response = await fetch('/api/cer/preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        sections,
        faers,
        comparators,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error generating preview: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getPreview:', error);
    throw error;
  }
};

/**
 * Export the CER as a PDF
 * @param {Object} exportData - The export data
 * @param {string} exportData.title - The title of the CER
 * @param {Array} exportData.sections - The sections of the CER
 * @param {Array} exportData.faers - FAERS data
 * @param {Array} exportData.comparators - Comparator data
 * @returns {Promise<Blob>} - The PDF file as a Blob
 */
cerApiService.exportToPDF = async (exportData) => {
  try {
    const response = await fetch('/api/cer/export-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exportData),
    });
    
    if (!response.ok) {
      throw new Error(`PDF export failed: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error in exportToPDF:', error);
    throw error;
  }
};

/**
 * Export the CER as a Word document
 * @param {Object} exportData - The export data
 * @param {string} exportData.title - The title of the CER
 * @param {Array} exportData.sections - The sections of the CER
 * @param {Array} exportData.faers - FAERS data
 * @param {Array} exportData.comparators - Comparator data
 * @param {string} productName - The name of the product
 * @returns {Promise<void>} - The Word document is downloaded via browser
 */
cerApiService.exportToWord = async (exportData, productName) => {
  try {
    const response = await fetch('/api/cer/export-docx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...exportData,
        productName,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`DOCX export failed: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `cer_${productName.replace(/\s+/g, '_').toLowerCase()}.docx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error in exportToWord:', error);
    throw error;
  }
};

/**
 * Improve a section's content to better comply with a specific regulatory standard
 * @param {Object} params - Parameters for section improvement
 * @param {Object} params.section - The section to improve
 * @param {string} params.standard - The regulatory standard to optimize for
 * @param {string} [params.cerTitle] - Optional CER title for context
 * @returns {Promise<Object>} - The improved section content
 */
cerApiService.improveSectionCompliance = async ({ section, standard, cerTitle }) => {
  try {
    const response = await fetch('/api/cer/improve-section', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        section,
        standard,
        cerTitle: cerTitle || 'Clinical Evaluation Report'
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error improving section compliance: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in improveSectionCompliance:', error);
    throw error;
  }
};

// Export the service object for use in other components
export { cerApiService };
