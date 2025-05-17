/**
 * Document Intelligence Service
 * 
 * This service handles all API calls related to document intelligence operations
 * including document processing, data extraction, and model management.
 */
class DocumentIntelligenceService {
  constructor() {
    this.baseUrl = '/api/document-intelligence';
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
    try {
      const formData = new FormData();
      
      // Add each file to the form data
      files.forEach(file => {
        formData.append('documents', file);
      });
      
      // Add regulatory context
      formData.append('regulatoryContext', regulatoryContext);
      
      const xhr = new XMLHttpRequest();
      
      // Return a promise that resolves when the upload is complete
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.open('POST', `${this.baseUrl}/process`, true);
        
        // Set up progress tracking if callback provided
        if (progressCallback) {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.round((event.loaded / event.total) * 100);
              progressCallback(percentComplete);
            }
          };
        }
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            resolve(response.processedDocuments || []);
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
          }
        };
        
        xhr.onerror = () => {
          reject(new Error('Network error occurred during upload'));
        };
        
        xhr.send(formData);
      });
      
      return await uploadPromise;
    } catch (error) {
      console.error('Error processing documents:', error);
      throw error;
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
      const response = await fetch(`${this.baseUrl}/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          processedDocuments,
          regulatoryContext
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Data extraction failed');
      }
      
      const data = await response.json();
      return data.extractedData;
    } catch (error) {
      console.error('Error extracting data:', error);
      throw error;
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
      const response = await fetch(`${this.baseUrl}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          extractedData,
          deviceProfileId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to apply extracted data');
      }
      
      const data = await response.json();
      return data.updatedProfile;
    } catch (error) {
      console.error('Error applying extracted data:', error);
      throw error;
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
      const response = await fetch(
        `${this.baseUrl}/document-types?regulatoryContext=${regulatoryContext}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get document types');
      }
      
      const data = await response.json();
      return data.documentTypes || [];
    } catch (error) {
      console.error('Error getting compatible document types:', error);
      throw error;
    }
  }
}

export const documentIntelligenceService = new DocumentIntelligenceService();