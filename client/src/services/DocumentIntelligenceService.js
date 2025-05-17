import axios from 'axios';

/**
 * Document Intelligence Service
 * 
 * This service handles all API calls related to document intelligence operations
 * including document processing, data extraction, and model management.
 */
class DocumentIntelligenceService {
  constructor() {
    this.baseURL = '/api/document-intelligence';
  }

  /**
   * Upload and process documents for intelligence analysis
   * 
   * @param {File[]} files Array of document files to process
   * @param {string} regulatoryContext The regulatory context for processing ('510k', 'cer', etc.)
   * @param {Function} progressCallback Optional callback for upload progress updates
   * @returns {Promise<Array>} The processed document metadata
   */
  async processDocuments(files, regulatoryContext, progressCallback = null) {
    const formData = new FormData();
    
    // Add each file to the form data
    files.forEach((file, index) => {
      formData.append('documents', file);
    });
    
    // Add the regulatory context parameter
    formData.append('regulatoryContext', regulatoryContext || '510k');

    // Configure the request with progress tracking
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    
    // Add upload progress tracking if a callback was provided
    if (progressCallback && typeof progressCallback === 'function') {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        progressCallback(percentCompleted);
      };
    }

    try {
      const response = await axios.post(`${this.baseURL}/process`, formData, config);
      return response.data.processedDocuments || [];
    } catch (error) {
      console.error('Error processing documents:', error);
      throw new Error(error.response?.data?.message || 'Failed to process documents');
    }
  }

  /**
   * Extract data from processed documents
   * 
   * @param {Array} processedDocuments Array of processed document metadata
   * @param {string} regulatoryContext The regulatory context for extraction ('510k', 'cer', etc.)
   * @returns {Promise<Object>} The extracted data from the documents
   */
  async extractData(processedDocuments, regulatoryContext) {
    try {
      const response = await axios.post(`${this.baseURL}/extract`, {
        processedDocuments,
        regulatoryContext
      });
      
      return response.data.extractedData || {};
    } catch (error) {
      console.error('Error extracting data from documents:', error);
      throw new Error(error.response?.data?.message || 'Failed to extract data from documents');
    }
  }

  /**
   * Apply extracted data to a device profile
   * 
   * @param {Object} extractedData The data extracted from documents
   * @param {string} deviceProfileId The ID of the device profile to update
   * @returns {Promise<Object>} The updated device profile
   */
  async applyExtractedData(extractedData, deviceProfileId) {
    try {
      const response = await axios.post(`${this.baseURL}/apply`, {
        extractedData,
        deviceProfileId
      });
      
      return response.data.updatedProfile || {};
    } catch (error) {
      console.error('Error applying extracted data:', error);
      throw new Error(error.response?.data?.message || 'Failed to apply extracted data');
    }
  }

  /**
   * Get a list of documents that are compatible with the document intelligence system
   * 
   * @param {string} regulatoryContext The regulatory context ('510k', 'cer', etc.)
   * @returns {Promise<Array>} List of compatible document types
   */
  async getCompatibleDocumentTypes(regulatoryContext) {
    try {
      const response = await axios.get(`${this.baseURL}/document-types`, {
        params: { regulatoryContext }
      });
      
      return response.data.documentTypes || [];
    } catch (error) {
      console.error('Error fetching compatible document types:', error);
      return [
        { id: 'technical', name: 'Technical Documentation', description: 'Technical specifications and engineering documents' },
        { id: 'regulatory', name: 'Regulatory Filings', description: 'Previous regulatory submissions and approvals' },
        { id: 'clinical', name: 'Clinical Studies', description: 'Clinical trial protocols and results' },
        { id: 'quality', name: 'Quality Management', description: 'Quality system documentation and procedures' }
      ];
    }
  }
}

// Export a singleton instance of the service
export const documentIntelligenceService = new DocumentIntelligenceService();