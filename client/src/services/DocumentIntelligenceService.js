/**
 * Document Intelligence Service
 * 
 * This service provides functionality for document upload, processing,
 * and structured data extraction from regulatory documents using AI.
 */

/**
 * Process a document to extract structured data
 * @param {FormData} formData - FormData containing document files and metadata
 * @returns {Promise<Object>} The extracted structured data
 */
async function processDocuments(formData) {
  try {
    const response = await fetch('/api/document-intelligence/process', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error processing documents');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Document processing error:', error);
    throw error;
  }
}

/**
 * Map extracted fields to device intake form data
 * @param {Array} extractedFields - Array of extracted field objects
 * @returns {Object} Mapped form data for device intake
 */
function mapExtractedFieldsToFormData(extractedFields) {
  if (!extractedFields || !Array.isArray(extractedFields) || extractedFields.length === 0) {
    return {};
  }
  
  // Create field mapping
  const fieldMapping = {
    // Administrative Information - Section A
    deviceName: 'administrativeInfo.deviceName',
    manufacturer: 'administrativeInfo.manufacturer',
    manufacturerAddress: 'administrativeInfo.manufacturerAddress',
    contactPerson: 'administrativeInfo.contactName',
    contactEmail: 'administrativeInfo.contactEmail',
    contactPhone: 'administrativeInfo.contactPhone',
    
    // Device Information - Section B
    deviceClass: 'deviceInfo.deviceClass',
    productCode: 'deviceInfo.productCode',
    regulationNumber: 'deviceInfo.regulationNumber',
    panel: 'deviceInfo.medicalSpecialtyPanel',
    
    // Device Marketing - Section C 
    intendedUse: 'deviceMarketing.intendedUse',
    indications: 'deviceMarketing.indicationsForUse',
    deviceDescription: 'deviceMarketing.deviceDescription',
    
    // Predicate Devices - Section D
    predicateDeviceName: 'predicateDevice.deviceName',
    predicateManufacturer: 'predicateDevice.manufacturer',
    predicateK510Number: 'predicateDevice.k510Number',
  };
  
  // Initialize result object
  const result = {};
  
  // Process each extracted field
  extractedFields.forEach(field => {
    const mappedPath = fieldMapping[field.name];
    
    if (mappedPath && field.confidence >= 0.7) {
      // Split the path into parts
      const parts = mappedPath.split('.');
      
      // Handle nested paths recursively
      let current = result;
      
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
      
      // Set the value at the final path segment
      current[parts[parts.length - 1]] = field.value;
    }
  });
  
  return result;
}

/**
 * Extract and map document data to device intake form
 * @param {FormData} formData - FormData containing document files and metadata
 * @returns {Promise<Object>} The mapped form data for device intake
 */
async function extractAndMapDocumentData(formData) {
  try {
    const extractionResult = await processDocuments(formData);
    const mappedData = mapExtractedFieldsToFormData(extractionResult.extractedFields);
    
    return {
      ...extractionResult,
      mappedData
    };
  } catch (error) {
    console.error('Error extracting and mapping document data:', error);
    throw error;
  }
}

/**
 * Calculate overall confidence score for extraction
 * @param {Array} extractedFields - Array of extracted field objects
 * @returns {number} Overall confidence score (0-1)
 */
function calculateOverallConfidence(extractedFields) {
  if (!extractedFields || !Array.isArray(extractedFields) || extractedFields.length === 0) {
    return 0;
  }
  
  const totalConfidence = extractedFields.reduce(
    (sum, field) => sum + field.confidence, 
    0
  );
  
  return totalConfidence / extractedFields.length;
}

// Export service functions
export const documentIntelligenceService = {
  processDocuments,
  mapExtractedFieldsToFormData,
  extractAndMapDocumentData,
  calculateOverallConfidence
};