/**
 * DocumentIntelligenceService class
 * 
 * Provides API integration with the document intelligence backend services.
 * This service handles uploading documents, extracting data, and applying
 * the extracted data to device profiles.
 */
class DocumentIntelligenceService {
  /**
   * Upload documents to the server for processing
   * @param {FormData} formData - Form data containing files and metadata
   * @returns {Promise<Object>} - Object containing processed documents
   */
  async uploadDocuments(formData) {
    try {
      const response = await fetch('/api/document-intelligence/upload', {
        method: 'POST',
        body: formData,
        // Don't set content-type header, it will be set automatically with the boundary
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload documents: ${response.status} ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in uploadDocuments:', error);
      throw error;
    }
  }
  
  /**
   * Extract data from processed documents
   * @param {Object} params - Parameters for document extraction
   * @returns {Promise<Object>} - Object containing extracted data
   */
  async extractDocumentData(params) {
    try {
      const response = await fetch('/api/document-intelligence/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to extract document data: ${response.status} ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in extractDocumentData:', error);
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
      const response = await fetch(`/api/document-intelligence/apply/${deviceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ extractedData }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to apply data to device profile: ${response.status} ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in applyDataToDeviceProfile:', error);
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
      
      const response = await fetch(`/api/document-intelligence/search?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to search documents: ${response.status} ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in searchDocuments:', error);
      throw error;
    }
  }
  
  /**
   * Get document type recognition model version
   * @returns {Promise<Object>} - Model version info
   */
  async getModelInfo() {
    try {
      const response = await fetch('/api/document-intelligence/model-info', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get model info: ${response.status} ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in getModelInfo:', error);
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
        
        // Get file names from formData
        const files = formData.getAll('files');
        const fileNames = files.map(file => file.name);
        
        // Generate mock processed documents
        const processedDocuments = fileNames.map((name, index) => ({
          id: `doc-${Date.now()}-${index}`,
          name,
          size: Math.floor(Math.random() * 1000000) + 100000,
          recognizedType: this._getMockDocumentType(name),
          confidence: Math.random() * 0.3 + 0.7, // Between 0.7 and 1.0
          pageCount: Math.floor(Math.random() * 50) + 1,
          processedAt: new Date().toISOString(),
        }));
        
        return {
          success: true,
          processedDocuments,
          message: 'Documents processed successfully',
        };
      },
      
      extractDocumentData: async (params) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // Generate mock extracted data based on document types
        const documentTypes = params.documents.map(doc => doc.recognizedType);
        
        // Generate device data fields based on document types
        const extractedData = this._generateMockExtractedData(documentTypes);
        
        return {
          success: true,
          extractedData,
          message: 'Data extracted successfully',
          confidence: 0.89,
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
    };
  }
  
  /**
   * Helper to determine mock document type from filename
   * @private
   */
  _getMockDocumentType(filename) {
    const lcFilename = filename.toLowerCase();
    
    if (lcFilename.includes('510k') || lcFilename.includes('submission')) {
      return '510(k) Submission';
    } else if (lcFilename.includes('ifu') || lcFilename.includes('instructions')) {
      return 'Instructions for Use';
    } else if (lcFilename.includes('test') || lcFilename.includes('report')) {
      return 'Test Report';
    } else if (lcFilename.includes('technical') || lcFilename.includes('tech file')) {
      return 'Technical File';
    } else if (lcFilename.includes('clinical') || lcFilename.includes('study')) {
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
    
    // Basic device information every document might have
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

// Create and export a singleton instance
export const documentIntelligenceService = new DocumentIntelligenceService();