/**
 * Document Intelligence Routes
 * 
 * This module defines the routes for document intelligence features,
 * including document upload and structured data extraction.
 */

const express = require('express');
const router = express.Router();
const documentIntelligenceController = require('../controllers/documentIntelligenceController');

/**
 * @route POST /api/document-intelligence/process
 * @description Process uploaded documents to extract structured data
 * @access Private
 */
router.post('/process', documentIntelligenceController.processDocuments);

/**
 * @route POST /api/document-intelligence/extract
 * @description Extract structured data from OCR'd document content
 * @access Private
 */
router.post('/extract', (req, res) => {
  try {
    const { documents, regulatoryContext, confidenceThreshold, extractionMode } = req.body;
    
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ error: 'No documents provided for extraction' });
    }
    
    // Create combined content from OCR'd documents
    const documentContents = documents.map(doc => {
      return `Document: ${doc.name || 'Unnamed'}\n${doc.ocrTextContent || ''}\n`;
    });
    
    const combinedContent = documentContents.join('\n\n====== NEW DOCUMENT ======\n\n');
    
    // Use the existing extraction function from the controller
    // This leverages our integration with OpenAI/GPT-4o
    documentIntelligenceController.extractStructuredData(
      combinedContent, 
      regulatoryContext || 'technical'
    )
    .then(extractedData => {
      // Filter by confidence threshold if provided
      const threshold = confidenceThreshold || 0.6;
      const filteredFields = extractedData.extractedFields.filter(
        field => field.confidence >= threshold
      );
      
      // Calculate overall confidence
      let overallConfidence = 0;
      if (filteredFields.length > 0) {
        overallConfidence = filteredFields.reduce((sum, field) => sum + field.confidence, 0) / filteredFields.length;
      }
      
      // Determine document types based on extracted data
      const documentTypes = [];
      if (regulatoryContext === 'fda_510k') {
        documentTypes.push('FDA 510(k)');
      } else if (regulatoryContext === 'eu_mdr_td') {
        documentTypes.push('EU MDR');
      } else if (regulatoryContext === 'general_reg') {
        documentTypes.push('Regulatory Document');
      }
      
      if (filteredFields.some(f => f.name.toLowerCase().includes('clinical'))) {
        documentTypes.push('Clinical');
      }
      
      if (filteredFields.some(f => f.name.toLowerCase().includes('technical') || 
                               f.name.toLowerCase().includes('specification'))) {
        documentTypes.push('Technical');
      }
      
      return res.status(200).json({
        success: true,
        extractedFields: filteredFields,
        overallConfidence,
        documentTypes: documentTypes.length > 0 ? documentTypes : ['General'],
        totalFieldsExtracted: extractedData.extractedFields.length,
        fieldsAboveThreshold: filteredFields.length
      });
    })
    .catch(error => {
      console.error('Error in document extraction:', error);
      return res.status(500).json({ 
        error: 'Error extracting document data', 
        message: error.message 
      });
    });
  } catch (error) {
    console.error('Document intelligence extraction error:', error);
    return res.status(500).json({ 
      error: 'Server error processing document extraction', 
      message: error.message 
    });
  }
});

/**
 * @route POST /api/document-intelligence/recognize-types
 * @description Recognize document types from OCR'd content
 * @access Private
 */
router.post('/recognize-types', (req, res) => {
  try {
    const { documents } = req.body;
    
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ error: 'No documents provided for recognition' });
    }
    
    // This could be enhanced with a more sophisticated document type recognizer
    // For now, we'll use a simple approach based on content analysis
    const recognizedDocuments = documents.map(doc => {
      let documentType = 'Unknown';
      let confidence = 0.5;
      const content = doc.ocrTextContent || '';
      
      // Simple pattern matching for document type recognition
      if (content.toLowerCase().includes('510(k)') || 
          content.toLowerCase().includes('substantial equivalence')) {
        documentType = 'FDA 510(k)';
        confidence = 0.85;
      } else if (content.toLowerCase().includes('clinical evaluation') || 
                content.toLowerCase().includes('cer')) {
        documentType = 'Clinical Evaluation Report';
        confidence = 0.8;
      } else if (content.toLowerCase().includes('technical file') || 
                content.toLowerCase().includes('technical documentation')) {
        documentType = 'Technical Documentation';
        confidence = 0.82;
      } else if (content.toLowerCase().includes('instruction') && 
                content.toLowerCase().includes('use')) {
        documentType = 'Instructions for Use';
        confidence = 0.9;
      } else if (content.toLowerCase().includes('risk') && 
                content.toLowerCase().includes('management')) {
        documentType = 'Risk Management';
        confidence = 0.88;
      }
      
      return {
        ...doc,
        recognizedType: documentType,
        confidence
      };
    });
    
    return res.status(200).json({
      success: true,
      recognizedDocuments
    });
  } catch (error) {
    console.error('Document type recognition error:', error);
    return res.status(500).json({ 
      error: 'Error recognizing document types', 
      message: error.message 
    });
  }
});

/**
 * @route POST /api/document-intelligence/validate
 * @description Validate extracted fields for regulatory compliance
 * @access Private
 */
router.post('/validate', (req, res) => {
  try {
    const { extractedFields, regulatoryContext } = req.body;
    
    if (!extractedFields || !Array.isArray(extractedFields)) {
      return res.status(400).json({ error: 'No extracted fields provided for validation' });
    }
    
    // Define required fields based on regulatory context
    let requiredFields = ['deviceName', 'manufacturer'];
    
    if (regulatoryContext === 'fda_510k') {
      requiredFields = [
        'deviceName',
        'manufacturer',
        'intendedUse',
        'deviceClass',
        'productCode'
      ];
    } else if (regulatoryContext === 'eu_mdr_td') {
      requiredFields = [
        'deviceName',
        'manufacturer',
        'intendedUse',
        'riskClass',
        'basicUDI'
      ];
    }
    
    // Check for required fields
    const extractedFieldNames = extractedFields.map(f => f.name.toLowerCase());
    const missingFields = requiredFields.filter(field => 
      !extractedFieldNames.includes(field.toLowerCase())
    );
    
    // Check for field validity/quality
    const fieldValidations = extractedFields.map(field => {
      const name = field.name.toLowerCase();
      let isValid = true;
      let validationMessage = 'Field passes validation';
      
      // Simple validation rules
      if (field.confidence < 0.6) {
        isValid = false;
        validationMessage = 'Low confidence score, verification needed';
      } else if (name === 'devicename' && (!field.value || field.value.length < 3)) {
        isValid = false;
        validationMessage = 'Device name is too short or missing';
      } else if (name === 'productcode' && regulatoryContext === 'fda_510k') {
        // Product code format validation for FDA 510(k)
        const pcodeRegex = /^[A-Z]{3}$/;
        if (!pcodeRegex.test(field.value)) {
          isValid = false;
          validationMessage = 'FDA product code should be 3 capital letters';
        }
      }
      
      return {
        name: field.name,
        isValid,
        validationMessage
      };
    });
    
    return res.status(200).json({
      success: true,
      missingRequiredFields: missingFields,
      fieldValidations,
      isCompliant: missingFields.length === 0 && 
                  fieldValidations.every(v => v.isValid)
    });
  } catch (error) {
    console.error('Field validation error:', error);
    return res.status(500).json({ 
      error: 'Error validating extracted fields', 
      message: error.message 
    });
  }
});

module.exports = router;