/**
 * Document Intelligence Service
 * 
 * This service handles communication with the document intelligence API endpoints
 * and processes document extraction data.
 */

import { apiRequest } from "@/lib/queryClient";

class DocumentIntelligenceService {
  /**
   * Extract data from documents using AI
   * 
   * @param {Object} extractionConfig Configuration for extraction
   * @param {string} extractionConfig.regulatoryContext The regulatory context
   * @param {number} extractionConfig.confidenceThreshold Confidence threshold
   * @param {string} extractionConfig.extractionMode Extraction mode
   * @param {Array} extractionConfig.documents List of documents to extract from
   * @returns {Promise<Object>} Extracted data
   */
  async extractDocumentData(extractionConfig) {
    try {
      const response = await apiRequest(
        "POST", 
        "/api/document-intelligence/extract", 
        extractionConfig
      );
      
      return await response.json();
    } catch (error) {
      console.error("Document extraction error:", error);
      throw new Error("Failed to extract data from documents");
    }
  }

  /**
   * Process OCR'd documents for recognition
   * 
   * @param {Array} documents List of OCR'd documents
   * @returns {Promise<Object>} Document recognition results
   */
  async recognizeDocumentTypes(documents) {
    try {
      const response = await apiRequest(
        "POST", 
        "/api/document-intelligence/recognize-types", 
        { documents }
      );
      
      return await response.json();
    } catch (error) {
      console.error("Document type recognition error:", error);
      throw new Error("Failed to recognize document types");
    }
  }

  /**
   * Validate extracted fields for compliance
   * 
   * @param {Array} extractedFields List of extracted fields
   * @param {string} regulatoryContext The regulatory context
   * @returns {Promise<Object>} Validation results
   */
  async validateExtractedFields(extractedFields, regulatoryContext) {
    try {
      const response = await apiRequest(
        "POST", 
        "/api/document-intelligence/validate", 
        { extractedFields, regulatoryContext }
      );
      
      return await response.json();
    } catch (error) {
      console.error("Field validation error:", error);
      throw new Error("Failed to validate extracted fields");
    }
  }

  /**
   * Map extracted fields to device profile form data
   * 
   * @param {Array} extractedFields List of extracted fields
   * @returns {Object} Mapped device profile data
   */
  mapExtractedFieldsToFormData(extractedFields) {
    // Initialize device profile with empty sections
    const deviceProfile = {
      deviceName: '',
      manufacturer: '',
      modelNumber: '',
      deviceDescription: '',
      intendedUse: '',
      classification: '',
      regulatoryClass: '',
      productCode: '',
      riskLevel: '',
      technicalSpecifications: [],
      materials: [],
      sterilization: {
        isPreSterilized: false,
        method: '',
        details: ''
      },
      biocompatibility: {
        hasTests: false,
        testResults: '',
        materials: []
      }
    };

    // Map extracted fields to device profile properties
    extractedFields.forEach(field => {
      const { name, value, confidence } = field;
      
      // Only use fields with sufficient confidence
      if (confidence < 0.6) return;
      
      // Map based on field name
      switch (name.toLowerCase()) {
        case 'device name':
        case 'devicename':
        case 'device_name':
          deviceProfile.deviceName = value;
          break;
          
        case 'manufacturer':
        case 'manufacturer name':
        case 'company':
          deviceProfile.manufacturer = value;
          break;
          
        case 'model number':
        case 'modelnumber':
        case 'model':
        case 'model_number':
          deviceProfile.modelNumber = value;
          break;
          
        case 'device description':
        case 'devicedescription':
        case 'description':
          deviceProfile.deviceDescription = value;
          break;
          
        case 'intended use':
        case 'intendeduse':
        case 'indication for use':
        case 'indications':
          deviceProfile.intendedUse = value;
          break;
          
        case 'classification':
        case 'device classification':
          deviceProfile.classification = value;
          break;
          
        case 'regulatory class':
        case 'regulatoryclass':
        case 'class':
          deviceProfile.regulatoryClass = value;
          break;
          
        case 'product code':
        case 'productcode':
          deviceProfile.productCode = value;
          break;
          
        case 'risk level':
        case 'risklevel':
        case 'risk':
          deviceProfile.riskLevel = value;
          break;
          
        // Material extraction with potential array handling
        case 'materials':
        case 'material':
        case 'device materials':
          if (Array.isArray(value)) {
            deviceProfile.materials = value;
          } else if (typeof value === 'string') {
            // Split comma separated values into array
            deviceProfile.materials = value.split(',').map(item => item.trim()).filter(Boolean);
          }
          break;
          
        // Technical specs extraction
        case 'technical specifications':
        case 'technicalspecifications':
        case 'specifications':
        case 'specs':
          if (Array.isArray(value)) {
            deviceProfile.technicalSpecifications = value;
          } else if (typeof value === 'string') {
            // Split newlines or commas into array items
            deviceProfile.technicalSpecifications = value
              .split(/[\n,]/)
              .map(item => item.trim())
              .filter(Boolean);
          }
          break;
          
        // Sterilization information
        case 'sterilization method':
        case 'sterilizationmethod':
          deviceProfile.sterilization.method = value;
          deviceProfile.sterilization.isPreSterilized = 
            value && value.toLowerCase() !== 'none' && value.toLowerCase() !== 'n/a';
          break;
          
        // Handle biocompatibility fields
        case 'biocompatibility':
        case 'biocompatibility tests':
          deviceProfile.biocompatibility.hasTests = 
            value && value.toLowerCase() !== 'none' && value.toLowerCase() !== 'n/a';
          deviceProfile.biocompatibility.testResults = value;
          break;
      }
    });

    return deviceProfile;
  }
}

// Export as singleton
export const documentIntelligenceService = new DocumentIntelligenceService();