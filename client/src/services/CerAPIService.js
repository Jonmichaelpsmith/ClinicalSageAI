/**
 * CER API Service
 * 
 * Provides utility functions for interacting with the CER Generator API endpoints.
 * Centralizes all API calls related to CER generation, export, FAERS data fetching,
 * and regulatory compliance scoring.
 */

/**
 * Fetch FAERS data for a given product
 * @param {string} productName - The name of the product to fetch FAERS data for
 * @returns {Promise<Object>} - The FAERS data for the product
 */
export const fetchFaersData = async (productName) => {
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
 * @returns {Promise<Object>} - The generated section
 */
export const generateSection = async ({ sectionType, context }) => {
  try {
    const response = await fetch('/api/cer/generate-section', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sectionType,
        context,
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

/**
 * Export the CER as a PDF
 * @param {Object} cerData - The CER data to export
 * @returns {Promise<Blob>} - The PDF file as a Blob
 */
export const exportToPDF = async (cerData) => {
  try {
    const response = await fetch('/api/cer/export-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cerData),
    });
    
    if (!response.ok) {
      throw new Error(`Error exporting to PDF: ${response.statusText}`);
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
 * @param {Object} cerData - The CER data to export
 * @returns {Promise<Blob>} - The Word document as a Blob
 */
export const exportToWord = async (cerData) => {
  try {
    const response = await fetch('/api/cer/export-docx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cerData),
    });
    
    if (!response.ok) {
      throw new Error(`Error exporting to Word: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error in exportToWord:', error);
    throw error;
  }
};

/**
 * Download a Blob as a file
 * @param {Blob} blob - The Blob to download
 * @param {string} filename - The name to give the downloaded file
 */
export const downloadBlob = (blob, filename) => {
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
export const getComplianceScore = async ({ sections, title, standards = ['EU MDR', 'ISO 14155', 'FDA'] }) => {
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
export const exportCompliancePDF = async (data) => {
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
