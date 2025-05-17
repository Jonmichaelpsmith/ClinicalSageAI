import { apiRequest } from "@/lib/queryClient";

/**
 * Service for document intelligence features
 */
class DocumentIntelligenceService {
  /**
   * Upload and process documents for data extraction
   * @param {FormData} formData The form data containing files to be uploaded
   * @returns {Promise<Object>} The processed documents with recognition data
   */
  async uploadDocuments(formData) {
    try {
      const response = await apiRequest("POST", "/api/document-intelligence/upload", formData, {
        headers: {
          // Do not set Content-Type here as it will be automatically set with the FormData boundary
        },
      });
      
      return await response.json();
    } catch (error) {
      console.error("Error uploading documents:", error);
      throw error;
    }
  }
  
  /**
   * Extract data from processed documents
   * @param {Object} params Parameters for extraction
   * @param {Array} params.documents The list of documents to extract data from
   * @param {string} params.regulatoryContext The regulatory context for extraction (e.g., "510k", "mdr")
   * @param {string} params.extractionMode The level of detail for extraction
   * @param {number} params.confidenceThreshold The minimum confidence threshold for extracted data
   * @returns {Promise<Object>} The extracted data
   */
  async extractDocumentData(params) {
    try {
      const response = await apiRequest("POST", "/api/document-intelligence/extract", {
        ...params,
        documents: params.documents.map(doc => ({
          id: doc.id,
          name: doc.name,
          recognizedType: doc.recognizedType,
          confidence: doc.confidence
        }))
      });
      
      return await response.json();
    } catch (error) {
      console.error("Error extracting document data:", error);
      throw error;
    }
  }
  
  /**
   * Apply extracted data to a device profile
   * @param {string} deviceId The ID of the device profile to update
   * @param {Object} extractedData The data extracted from documents
   * @returns {Promise<Object>} The updated device profile
   */
  async applyDataToDeviceProfile(deviceId, extractedData) {
    try {
      const response = await apiRequest("POST", `/api/document-intelligence/apply/${deviceId}`, {
        extractedData
      });
      
      return await response.json();
    } catch (error) {
      console.error("Error applying data to device profile:", error);
      throw error;
    }
  }
  
  /**
   * Get available document types with their schemas
   * @returns {Promise<Array>} List of document types and their schemas
   */
  async getDocumentTypes() {
    try {
      const response = await apiRequest("GET", "/api/document-intelligence/document-types");
      return await response.json();
    } catch (error) {
      console.error("Error getting document types:", error);
      throw error;
    }
  }
  
  /**
   * Get extraction history for a device
   * @param {string} deviceId The device ID to get history for
   * @returns {Promise<Array>} List of extraction records
   */
  async getExtractionHistory(deviceId) {
    try {
      const response = await apiRequest("GET", `/api/document-intelligence/history/${deviceId}`);
      return await response.json();
    } catch (error) {
      console.error("Error getting extraction history:", error);
      throw error;
    }
  }
}

// Create a singleton instance
export const documentIntelligenceService = new DocumentIntelligenceService();