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
 * Initialize a Zero-Click CER generation process
 * @param {Object} params - Parameters for the CER generation
 * @param {Object} params.deviceInfo - Information about the device (name, manufacturer, type, classification)
 * @param {Array} [params.literature] - Optional array of literature references
 * @param {Object} [params.fdaData] - Optional FDA FAERS data
 * @param {string} [params.templateId] - Optional template ID (meddev, eu-mdr, fda-510k, iso-14155)
 * @returns {Promise<Object>} - The initialized CER report and workflow
 */
cerApiService.initializeZeroClickCER = async ({ deviceInfo, literature, fdaData, templateId = 'meddev' }) => {
  try {
    const response = await fetch('/api/cer/initialize-zero-click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceInfo,
        literature,
        fdaData,
        templateId
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error initializing Zero-Click CER: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in initializeZeroClickCER:', error);
    throw error;
  }
};

/**
 * Fetch FAERS data for a given product
 * @param {string} productName - The name of the product to fetch FAERS data for
 * @returns {Promise<Object>} - The FAERS data for the product
 */
cerApiService.fetchFaersData = async (productName) => {
  try {
    const response = await fetch(`/api/cer/faers/data?productName=${encodeURIComponent(productName)}`);
    
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
 * Fetch and store FAERS data for a specific CER report
 * @param {Object} params - Parameters for fetching FAERS data
 * @param {string} params.productName - The name of the product
 * @param {string} params.cerId - The ID of the CER report
 * @param {boolean} [params.includeComparators=true] - Whether to include comparator products
 * @returns {Promise<Object>} - The processed FAERS data
 */
cerApiService.fetchFaersDataForCER = async ({ productName, cerId, includeComparators = true }) => {
  try {
    const response = await fetch('/api/cer/fetch-faers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productName,
        cerId,
        includeComparators
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching FAERS data for CER: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in fetchFaersDataForCER:', error);
    throw error;
  }
};

/**
 * Fetch workflow status for a CER generation process
 * @param {string} workflowId - The ID of the workflow to check
 * @returns {Promise<Object>} - The workflow status information
 */
cerApiService.getWorkflowStatus = async (workflowId) => {
  try {
    const response = await fetch(`/api/cer/workflows/${workflowId}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching workflow status: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getWorkflowStatus:', error);
    throw error;
  }
};

/**
 * Fetch CER report data
 * @param {string} reportId - The ID of the report to fetch
 * @returns {Promise<Object>} - The CER report data
 */
cerApiService.getCERReport = async (reportId) => {
  try {
    const response = await fetch(`/api/cer/report/${reportId}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching CER report: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getCERReport:', error);
    throw error;
  }
};

/**
 * Fetch all CER reports
 * @param {Object} params - Optional parameters for filtering reports
 * @param {number} [params.limit=20] - Maximum number of reports to return
 * @param {number} [params.offset=0] - Number of reports to skip
 * @param {string} [params.status] - Filter by status (e.g., 'draft', 'final')
 * @param {string} [params.deviceName] - Filter by device name
 * @param {string} [params.search] - Search term for title or content
 * @returns {Promise<Array>} - Array of CER reports
 */
cerApiService.getCERReports = async ({ limit = 20, offset = 0, status, deviceName, search } = {}) => {
  try {
    let url = `/api/cer/reports?limit=${limit}&offset=${offset}`;
    
    if (status) url += `&status=${encodeURIComponent(status)}`;
    if (deviceName) url += `&deviceName=${encodeURIComponent(deviceName)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching CER reports: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getCERReports:', error);
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

/**
 * Export CER to PDF
 * @param {Object} params - Parameters for PDF export
 * @param {string} params.title - The title of the report
 * @param {Array} params.sections - The sections of the report
 * @param {Object} params.deviceInfo - Information about the device
 * @param {Array} [params.faers] - Optional FAERS data to include
 * @param {Array} [params.comparators] - Optional comparator data to include
 * @param {Object} [params.metadata] - Optional metadata for the report
 * @param {string} [params.templateId] - Optional template ID
 * @returns {Promise<Blob>} - The PDF as a Blob
 */
cerApiService.exportToPDF = async ({ title, sections, deviceInfo, faers, comparators, metadata, templateId }) => {
  try {
    const response = await fetch('/api/cer/export-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        sections,
        deviceInfo,
        faers,
        comparators,
        metadata,
        templateId
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error exporting to PDF: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Format the filename
    const sanitizedTitle = title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'clinical_evaluation_report';
    const filename = `${sanitizedTitle}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Download the file
    cerApiService.downloadBlob(blob, filename);
    
    return blob;
  } catch (error) {
    console.error('Error in exportToPDF:', error);
    throw error;
  }
};

/**
 * Export CER to Word document
 * @param {Object} params - Parameters for Word export
 * @param {string} params.title - The title of the report
 * @param {Array} params.sections - The sections of the report
 * @param {Object} params.deviceInfo - Information about the device
 * @param {Array} [params.faers] - Optional FAERS data to include
 * @param {Array} [params.comparators] - Optional comparator data to include
 * @param {Object} [params.metadata] - Optional metadata for the report
 * @param {string} [params.templateId] - Optional template ID
 * @returns {Promise<Blob>} - The Word document as a Blob
 */
cerApiService.exportToWord = async ({ title, sections, deviceInfo, faers, comparators, metadata, templateId }) => {
  try {
    const response = await fetch('/api/cer/export-word', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        sections,
        deviceInfo,
        faers,
        comparators,
        metadata,
        templateId
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error exporting to Word: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Format the filename
    const sanitizedTitle = title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'clinical_evaluation_report';
    const filename = `${sanitizedTitle}_${new Date().toISOString().split('T')[0]}.docx`;
    
    // Download the file
    cerApiService.downloadBlob(blob, filename);
    
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
cerApiService.exportComplianceReport = async (data) => {
  try {
    const response = await fetch('/api/cer/export-compliance-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Error exporting compliance report: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Format the filename
    const sanitizedTitle = data.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'compliance_report';
    const filename = `${sanitizedTitle}_compliance_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Download the file
    cerApiService.downloadBlob(blob, filename);
    
    return blob;
  } catch (error) {
    console.error('Error in exportComplianceReport:', error);
    throw error;
  }
};

/**
 * Improve a section's content to better comply with a specific regulatory standard
 * @param {Object} params - Parameters for section improvement
 * @param {Object} params.section - The section to improve
 * @param {string} params.standard - The regulatory standard to optimize for
 * @param {string} [params.cerTitle] - Optional CER title for context
 * @param {Object} [params.complianceData] - Optional compliance scores for the section
 * @returns {Promise<Object>} - The improved section content including original and improved versions
 */
cerApiService.improveSectionCompliance = async ({ section, standard, cerTitle, complianceData }) => {
  try {
    console.log(`Improving section "${section.title}" for ${standard} compliance`);
    
    const response = await fetch('/api/cer/improve-section', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        section,
        standard,
        complianceData,
        cerTitle: cerTitle || 'Clinical Evaluation Report'
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error improving section compliance: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Received improved section:', data);
    return data;
  } catch (error) {
    console.error('Error in improveSectionCompliance:', error);
    throw error;
  }
};

/**
 * Analyze literature sources with AI
 * @param {Array} literature - Array of literature items to analyze
 * @returns {Promise<Object>} - The analysis results
 */
cerApiService.analyzeLiterature = async (literature) => {
  try {
    const response = await fetch('/api/cer/analyze/literature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        literature
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error analyzing literature: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in analyzeLiterature:', error);
    throw error;
  }
};

/**
 * Analyze FDA adverse event data with AI
 * @param {Object} fdaData - FDA adverse event data to analyze
 * @returns {Promise<Object>} - The analysis results
 */
cerApiService.analyzeAdverseEvents = async (fdaData) => {
  try {
    const response = await fetch('/api/cer/analyze/adverse-events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fdaData
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error analyzing adverse events: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in analyzeAdverseEvents:', error);
    throw error;
  }
};

/**
 * Trigger autonomous data retrieval for a CER report
 * @param {string} reportId - The ID of the CER report
 * @returns {Promise<Object>} - Status of the data retrieval process
 */
cerApiService.retrieveDataForCER = async (reportId) => {
  try {
    const response = await fetch(`/api/cer-data/retrieve/${reportId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error triggering data retrieval: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in retrieveDataForCER:', error);
    throw error;
  }
};

/**
 * Get the status of the data retrieval process for a CER report
 * @param {string} reportId - The ID of the CER report
 * @returns {Promise<Object>} - Status information
 */
cerApiService.getDataRetrievalStatus = async (reportId) => {
  try {
    const response = await fetch(`/api/cer-data/status/${reportId}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching data retrieval status: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getDataRetrievalStatus:', error);
    throw error;
  }
};

/**
 * Search for scientific literature related to a device
 * @param {Object} params - Search parameters
 * @param {string} params.query - Search query
 * @param {Object} params.deviceInfo - Device information for context
 * @param {Object} [params.filters] - Optional filters
 * @param {number} [params.limit] - Maximum results to return
 * @returns {Promise<Object>} - Search results
 */
cerApiService.searchLiterature = async ({ query, deviceInfo, filters, limit }) => {
  try {
    const response = await fetch('/api/cer-data/literature/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        deviceInfo,
        filters,
        limit
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error searching literature: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in searchLiterature:', error);
    throw error;
  }
};

/**
 * Generate a literature review from selected papers
 * @param {Object} params - Parameters
 * @param {Array} params.papers - Array of papers
 * @param {Object} params.context - Context information
 * @param {Object} [params.options] - Generation options
 * @returns {Promise<Object>} - Generated literature review
 */
cerApiService.generateLiteratureReview = async ({ papers, context, options }) => {
  try {
    const response = await fetch('/api/cer-data/literature/generate-review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        papers,
        context,
        options
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error generating literature review: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in generateLiteratureReview:', error);
    throw error;
  }
};

/**
 * Get literature items for a CER report
 * @param {string} reportId - The ID of the CER report
 * @returns {Promise<Object>} - Literature items
 */
cerApiService.getLiteratureForReport = async (reportId) => {
  try {
    const response = await fetch(`/api/cer-data/literature/${reportId}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching literature for report: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getLiteratureForReport:', error);
    throw error;
  }
};

/**
 * Fetch enhanced FAERS data for a product and store it for a CER report
 * @param {Object} params - Parameters
 * @param {string} params.productName - The name of the product
 * @param {string} [params.reportId] - Optional CER report ID
 * @returns {Promise<Object>} - FAERS data
 */
cerApiService.fetchEnhancedFaersData = async ({ productName, reportId }) => {
  try {
    const response = await fetch('/api/cer-data/faers/fetch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productName,
        reportId
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching enhanced FAERS data: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in fetchEnhancedFaersData:', error);
    throw error;
  }
};

/**
 * Get FAERS data for a CER report
 * @param {string} reportId - The ID of the CER report
 * @returns {Promise<Object>} - FAERS data
 */
cerApiService.getFaersDataForReport = async (reportId) => {
  try {
    const response = await fetch(`/api/cer-data/faers/${reportId}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching FAERS data for report: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getFaersDataForReport:', error);
    throw error;
  }
};

// Export the service object for use in other components
/**
 * Save a version of a CER document
 * @param {Object} params - Parameters for version saving
 * @param {string} params.title - The title of the document
 * @param {Array} params.sections - The document sections
 * @param {Object} params.deviceInfo - Information about the device
 * @param {Object} params.metadata - Document metadata
 * @param {string} params.versionNotes - Notes about this version
 * @param {string} params.versionType - Type of version increment (major, minor, patch)
 * @returns {Promise<Object>} - The saved version information
 */
cerApiService.saveVersion = async ({ title, sections, deviceInfo, metadata, versionNotes = '', versionType = 'minor' }) => {
  try {
    const response = await fetch('/api/cer/version/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        sections,
        deviceInfo,
        metadata,
        versionNotes,
        versionType
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error saving version: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in saveVersion:', error);
    throw error;
  }
};

/**
 * Get version history for a CER document
 * @param {string} documentId - ID of the CER document
 * @returns {Promise<Object>} - The version history
 */
cerApiService.getVersionHistory = async (documentId) => {
  try {
    const response = await fetch(`/api/cer/version/${documentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error getting version history: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getVersionHistory:', error);
    throw error;
  }
};

/**
 * Prepare a CER document for regulatory submission
 * @param {Object} params - Parameters for submission preparation
 * @param {string} params.documentId - The document ID
 * @param {string} params.version - The document version
 * @param {string} params.title - The document title
 * @param {Array} params.sections - The document sections
 * @param {Object} params.deviceInfo - Information about the device
 * @param {Object} params.metadata - Document metadata
 * @param {string} params.submissionType - Type of submission (EU MDR, FDA, etc.)
 * @returns {Promise<Object>} - The submission status
 */
cerApiService.prepareSubmission = async ({ documentId, version, title, sections, deviceInfo, metadata, submissionType = 'EU MDR' }) => {
  try {
    const response = await fetch('/api/cer/submission/prepare', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentId,
        version,
        title,
        sections,
        deviceInfo,
        metadata,
        submissionType
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error preparing submission: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in prepareSubmission:', error);
    throw error;
  }
};

export { cerApiService };