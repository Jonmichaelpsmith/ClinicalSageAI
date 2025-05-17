/**
 * DocumentIntelligenceService class
 * 
 * Provides API integration with the document intelligence backend services.
 * This service handles uploading documents, extracting data, and applying
 * the extracted data to device profiles.
 */
class DocumentIntelligenceService {
  /**
   * Base URL for document intelligence API
   * @private
   */
  _baseUrl = '/api/document-intelligence';

  /**
   * Upload documents to the server for processing
   * @param {FormData} formData - Form data containing files and metadata
   * @returns {Promise<Object>} - Object containing processed documents
   */
  async uploadDocuments(formData) {
    try {
      const response = await fetch(`${this._baseUrl}/upload`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header as browser will set it with boundary for multipart/form-data
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload documents');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading documents:', error);
      throw error;
    }
  }

  /**
   * Extract data from processed documents
   * @param {Object} params - Parameters for document extraction
   * @param {Array} params.documents - Processed documents to extract data from
   * @param {string} params.regulatoryContext - Regulatory context (510k, mdr, etc.)
   * @param {string} params.extractionMode - Extraction mode (basic, comprehensive, etc.)
   * @returns {Promise<Object>} - Object containing extracted data
   */
  async extractDocumentData(params) {
    try {
      const response = await fetch(`${this._baseUrl}/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to extract document data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error extracting document data:', error);
      throw error;
    }
  }

  /**
   * Apply extracted data to a device profile
   * @param {string} deviceId - ID of the device profile
   * @param {Object} extractedData - Data extracted from documents
   * @returns {Promise<Object>} - Updated device profile
   */
  async applyDataToDeviceProfile(deviceId, extractedData) {
    try {
      const response = await fetch(`${this._baseUrl}/apply/${deviceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ extractedData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to apply data to device profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error applying data to device profile:', error);
      throw error;
    }
  }

  /**
   * Search for documents in the repository
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} - Search results
   */
  async searchDocuments(searchParams) {
    try {
      const queryParams = new URLSearchParams(searchParams);
      
      const response = await fetch(`${this._baseUrl}/search?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to search documents');
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  }

  /**
   * Get document type recognition model version
   * @returns {Promise<Object>} - Model version info
   */
  async getModelInfo() {
    try {
      const response = await fetch(`${this._baseUrl}/model-info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get model info');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting model info:', error);
      throw error;
    }
  }

  /**
   * Mock implementation for development
   * This creates simulated responses for testing the UI
   * @returns {Object} - Mock implementation methods
   */
  getMockImplementation() {
    return {
      uploadDocuments: async (formData) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Get files from FormData
        const files = formData.getAll('files');
        const regulatoryContext = formData.get('regulatoryContext') || '510k';
        
        // Process each file
        const processedDocuments = files.map((file, index) => {
          const docType = this._getMockDocumentType(file.name);
          
          return {
            id: `mock-doc-${index}`,
            name: file.name,
            size: file.size,
            mimetype: file.type,
            recognizedType: docType,
            confidence: Math.random() * 0.4 + 0.6, // Random confidence between 0.6 and 1.0
            pageCount: Math.floor(Math.random() * 50) + 1, // Random page count between 1 and 50
            processedAt: new Date().toISOString(),
          };
        });
        
        return {
          success: true,
          processedDocuments,
          message: 'Documents processed successfully'
        };
      },
      
      extractDocumentData: async ({ documents, regulatoryContext, extractionMode }) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate mock extracted data based on document types
        const documentTypes = documents.map(doc => doc.recognizedType);
        const extractedData = this._generateMockExtractedData(documentTypes);
        
        return {
          success: true,
          extractedData,
          message: 'Data extracted successfully',
          confidence: 0.87,
        };
      },
      
      applyDataToDeviceProfile: async (deviceId, extractedData) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          success: true,
          deviceId,
          updatedFields: Object.keys(extractedData),
          message: 'Data applied to device profile successfully',
        };
      },
      
      searchDocuments: async (searchParams) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        return {
          success: true,
          results: [],
          totalCount: 0,
          page: searchParams.page || 1,
          limit: searchParams.limit || 10,
        };
      },
      
      getModelInfo: async () => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
          success: true,
          modelInfo: {
            documentTypeRecognition: {
              model: 'GPT-4o',
              version: '2025-05-01',
              supportedTypes: [
                '510(k) Submission',
                'Technical File',
                'Instructions for Use',
                'Test Report',
                'Clinical Study'
              ]
            },
            dataExtraction: {
              model: 'GPT-4o',
              version: '2025-05-01',
            }
          }
        };
      }
    };
  }

  /**
   * Helper to determine mock document type from filename
   * @private
   */
  _getMockDocumentType(filename) {
    filename = filename.toLowerCase();
    
    if (filename.includes('510k') || filename.includes('submission')) {
      return '510(k) Submission';
    } else if (filename.includes('ifu') || filename.includes('instructions')) {
      return 'Instructions for Use';
    } else if (filename.includes('test') || filename.includes('report')) {
      return 'Test Report';
    } else if (filename.includes('technical') || filename.includes('tech file')) {
      return 'Technical File';
    } else if (filename.includes('clinical') || filename.includes('study')) {
      return 'Clinical Study';
    } else {
      return 'Unknown';
    }
  }

  /**
   * Generate mock extracted data based on document types
   * @private
   */
  _generateMockExtractedData(documentTypes) {
    const extractedData = {};
    
    // Basic device information that might be in any document
    extractedData.deviceName = 'Cardiovascular Monitoring System';
    extractedData.manufacturer = 'MedTech Innovations';
    
    // Add additional fields based on document types
    if (documentTypes.includes('510(k) Submission')) {
      extractedData.modelNumber = 'CVS-2000';
      extractedData.deviceType = 'Cardiovascular';
      extractedData.deviceClass = 'II';
      extractedData.regulatoryClass = 'II';
      extractedData.productCode = 'DRT';
      extractedData.regulationNumber = '870.2300';
    }
    
    if (documentTypes.includes('Technical File')) {
      extractedData.specifications = 'Wireless monitoring, 48-hour battery life, IP67 rated';
      extractedData.dimensions = '120mm x 80mm x 15mm';
      extractedData.materials = 'Medical-grade silicone, biocompatible plastics';
      extractedData.sterilization = 'EtO sterilization validated';
    }
    
    if (documentTypes.includes('Instructions for Use') || documentTypes.includes('Clinical Study')) {
      extractedData.intendedUse = 'Continuous monitoring of cardiac rhythm and vital signs in clinical settings';
      extractedData.indications = 'For patients requiring continuous cardiac monitoring in hospital environments';
      extractedData.contraindications = 'Not for use in MRI environments';
      extractedData.warnings = 'Device contains small parts, keep away from children';
    }
    
    return extractedData;
  }
}

export const documentIntelligenceService = new DocumentIntelligenceService();