/**
 * Document Intelligence Service
 * 
 * This service handles the processing and extraction of structured data
 * from regulatory documents using advanced AI techniques.
 */

class DocumentIntelligenceService {
  /**
   * Extract structured data from regulatory documents
   * 
   * @param {Array} files - Array of File objects to process
   * @param {Object} options - Configuration options for extraction
   * @param {string} options.documentType - Type of document being processed (e.g., '510k', 'technical')
   * @param {number} options.confidenceThreshold - Confidence threshold for extraction (0.0-1.0)
   * @param {Function} options.onProgress - Optional callback for progress updates
   * @returns {Promise<Array>} - Array of extracted fields with confidence scores
   */
  async extractDataFromDocuments(files, options = {}) {
    try {
      const {
        documentType = 'technical',
        confidenceThreshold = 0.7,
        onProgress = null
      } = options;
      
      // Create form data for file upload
      const formData = new FormData();
      
      // Add each file to the form data
      files.forEach(file => {
        formData.append('files', file);
      });
      
      // Add extraction options to form data
      formData.append('documentType', documentType);
      formData.append('confidenceThreshold', confidenceThreshold.toString());
      
      // If we're in development mode without the backend API,
      // simulate progress and return example data
      if (process.env.NODE_ENV === 'development' && !process.env.USE_REAL_API) {
        await this._simulateProgress(onProgress, { 
          files, 
          documentType 
        });
        
        return this._generateExampleResults(documentType, confidenceThreshold);
      }
      
      // Send progress update for API call starting
      if (onProgress) {
        onProgress({
          phase: 'uploading',
          progress: 0,
          message: 'Uploading documents...'
        });
      }
      
      // Upload files to the API
      const response = await fetch('/api/document-intelligence/extract', {
        method: 'POST',
        body: formData,
        // No need to set Content-Type header as the browser will set it for us with boundary
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error processing documents');
      }
      
      // Send progress update for processing
      if (onProgress) {
        onProgress({
          phase: 'analyzing',
          progress: 0.5,
          message: 'Analyzing documents...'
        });
      }
      
      // Get the results from the API
      const result = await response.json();
      
      // Send final progress update
      if (onProgress) {
        onProgress({
          phase: 'complete',
          progress: 1.0,
          message: 'Analysis complete!'
        });
      }
      
      return result.extractedFields || [];
    } catch (error) {
      console.error('Document extraction error:', error);
      throw error;
    }
  }
  
  /**
   * Process document data and map extracted fields to form fields
   * 
   * @param {Array} extractedFields - Array of extracted fields with confidence scores
   * @returns {Object} - Mapped object ready to be applied to a form
   */
  mapExtractedFieldsToFormData(extractedFields) {
    const formData = {};
    
    // If no extracted fields, return empty object
    if (!extractedFields || !Array.isArray(extractedFields) || extractedFields.length === 0) {
      return formData;
    }
    
    // Map each extracted field to the corresponding form field
    extractedFields.forEach(field => {
      const { name, value } = field;
      
      // Convert boolean string values to actual booleans
      if (value === 'true' || value === 'false') {
        formData[name] = value === 'true';
      } 
      // Special case for deviceClass to ensure it's formatted correctly (Roman numerals)
      else if (name === 'deviceClass') {
        // Normalize device class to Roman numerals (I, II, or III)
        const classValue = value.toString().trim().toUpperCase();
        if (classValue.includes('1') || classValue.includes('I')) {
          formData[name] = 'I';
        } else if (classValue.includes('2') || classValue.includes('II')) {
          formData[name] = 'II';
        } else if (classValue.includes('3') || classValue.includes('III')) {
          formData[name] = 'III';
        } else {
          // If we can't determine the class, don't set it
          formData[name] = '';
        }
      }
      // Handle panel field normalization (convert to proper code format)
      else if (name === 'panel') {
        formData[name] = this._normalizePanelValue(value);
      } 
      // All other fields are used as-is
      else {
        formData[name] = value;
      }
    });
    
    return formData;
  }
  
  /**
   * Helper method to normalize panel values to their proper code format
   * @private
   */
  _normalizePanelValue(panelValue) {
    const panelMapping = {
      // Map panel full names to their codes
      'anesthesiology': 'AN',
      'cardiovascular': 'CV',
      'dental': 'DE',
      'ear nose and throat': 'EN',
      'gastroenterology and urology': 'GU',
      'general hospital': 'HO',
      'general and plastic surgery': 'SU',
      'hematology': 'HE',
      'immunology': 'IM',
      'microbiology': 'MI',
      'neurology': 'NE',
      'obstetrics and gynecology': 'OB',
      'ophthalmology': 'OP',
      'orthopedic': 'OR',
      'pathology': 'PA',
      'physical medicine': 'PM',
      'radiology': 'RA',
      'toxicology': 'TX'
    };
    
    // Convert to lowercase for comparison
    const lowerPanelValue = panelValue.toString().toLowerCase().trim();
    
    // Check if the value is a direct match to a panel code
    if (lowerPanelValue.length === 2) {
      const upperPanelValue = lowerPanelValue.toUpperCase();
      const validPanelCodes = Object.values(panelMapping);
      if (validPanelCodes.includes(upperPanelValue)) {
        return upperPanelValue;
      }
    }
    
    // Try to match the panel name
    for (const [name, code] of Object.entries(panelMapping)) {
      if (lowerPanelValue.includes(name)) {
        return code;
      }
    }
    
    // Return the original value if no match found
    return panelValue;
  }
  
  /**
   * Helper method to simulate asynchronous progress
   * @private
   */
  async _simulateProgress(progressCallback, options = {}) {
    if (!progressCallback) return;
    
    // Simulate uploading phase
    progressCallback({
      phase: 'uploading',
      progress: 0,
      message: 'Uploading documents...'
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    progressCallback({
      phase: 'uploading',
      progress: 0.3,
      message: 'Uploading documents...'
    });
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    progressCallback({
      phase: 'uploading',
      progress: 0.7,
      message: 'Uploading documents...'
    });
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Simulate processing phase
    progressCallback({
      phase: 'analyzing',
      progress: 0.8,
      message: 'Analyzing documents...'
    });
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate completion
    progressCallback({
      phase: 'complete',
      progress: 1.0,
      message: 'Analysis complete!'
    });
  }
  
  /**
   * Generate example extraction results for demonstration
   * In a real implementation, this would be replaced with actual backend results
   * @private
   */
  _generateExampleResults(documentType, confidenceThreshold) {
    // Simulate different results based on document type
    const baseResults = [
      { name: 'deviceName', value: 'AccuScan MRI Contrast System', confidence: 0.96, source: 'document.pdf (p.1)' },
      { name: 'manufacturer', value: 'MediTech Imaging, Inc.', confidence: 0.95, source: 'document.pdf (p.1)' },
      { name: 'manufacturerAddress', value: '123 Innovation Dr, Burlington, MA 01803', confidence: 0.90, source: 'document.pdf (p.1)' },
      { name: 'contactPerson', value: 'Dr. Sarah Johnson', confidence: 0.92, source: 'document.pdf (p.2)' },
      { name: 'contactEmail', value: 'sjohnson@meditechimaging.com', confidence: 0.89, source: 'document.pdf (p.2)' },
      { name: 'contactPhone', value: '(555) 123-4567', confidence: 0.94, source: 'document.pdf (p.2)' },
      { name: 'deviceClass', value: 'II', confidence: 0.97, source: 'document.pdf (p.3)' },
      { name: 'productCode', value: 'LNH', confidence: 0.85, source: 'document.pdf (p.3)' },
      { name: 'regulationNumber', value: '892.1610', confidence: 0.88, source: 'document.pdf (p.3)' },
      { name: 'panel', value: 'RA', confidence: 0.91, source: 'document.pdf (p.3)' },
      { name: 'intendedUse', value: 'For diagnostic imaging enhancement during MRI procedures', confidence: 0.93, source: 'document.pdf (p.4)' },
      { name: 'indications', value: 'Indicated for patients requiring enhanced MRI visualization of central nervous system and abdominal regions', confidence: 0.87, source: 'document.pdf (p.4)' },
      { name: 'predicateDeviceName', value: 'MagVision Contrast Delivery', confidence: 0.78, source: 'document.pdf (p.8)' },
      { name: 'predicateManufacturer', value: 'ImagingSolutions Medical', confidence: 0.75, source: 'document.pdf (p.8)' },
      { name: 'predicateK510Number', value: 'K123456', confidence: 0.82, source: 'document.pdf (p.8)' },
    ];
    
    // Add more technical details for technical documents
    if (documentType === 'technical') {
      baseResults.push(
        { name: 'deviceDescription', value: 'Automated contrast delivery system with digital control interface', confidence: 0.91, source: 'document.pdf (p.5)' },
        { name: 'principlesOfOperation', value: 'Microprocessor-controlled pump system with safety pressure monitoring', confidence: 0.89, source: 'document.pdf (p.6)' },
        { name: 'keyFeatures', value: 'Dual-syringe capability, flow rate 0.1-10ml/sec, pressure limit sensing', confidence: 0.87, source: 'document.pdf (p.6)' },
        { name: 'mainComponents', value: 'Drive unit, control panel, syringes, patient tubing set', confidence: 0.92, source: 'document.pdf (p.5)' },
        { name: 'materials', value: 'Medical grade polymer housing, borosilicate glass syringes', confidence: 0.86, source: 'document.pdf (p.7)' },
        { name: 'sterilization', value: 'true', confidence: 0.95, source: 'document.pdf (p.7)' },
        { name: 'sterilizationMethod', value: 'Ethylene oxide for fluid path components', confidence: 0.93, source: 'document.pdf (p.7)' },
        { name: 'software', value: 'true', confidence: 0.97, source: 'document.pdf (p.9)' },
        { name: 'softwareLevel', value: 'moderate', confidence: 0.84, source: 'document.pdf (p.9)' }
      );
    }
    
    // Add more clinical/safety details for clinical documents
    if (documentType === '510k' || documentType === 'clinical') {
      baseResults.push(
        { name: 'biocompatibility', value: 'true', confidence: 0.93, source: 'document.pdf (p.12)' },
        { name: 'contactType', value: 'blood_path', confidence: 0.91, source: 'document.pdf (p.12)' },
        { name: 'previousSubmissions', value: 'true', confidence: 0.88, source: 'document.pdf (p.15)' },
        { name: 'previousK510Number', value: 'K987654', confidence: 0.83, source: 'document.pdf (p.15)' },
        { name: 'marketHistory', value: 'Previous generation device has been marketed since 2018 with no significant adverse events', confidence: 0.79, source: 'document.pdf (p.16)' },
        { name: 'recalls', value: 'false', confidence: 0.94, source: 'document.pdf (p.16)' }
      );
    }
    
    // Filter results based on confidence threshold
    return baseResults.filter(result => result.confidence >= confidenceThreshold);
  }
}

export const documentIntelligenceService = new DocumentIntelligenceService();