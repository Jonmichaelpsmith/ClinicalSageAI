/**
 * Module Document Registration Utility
 * 
 * This utility provides functions to register documents from different modules
 * into the unified workflow system. It handles the mapping of module-specific
 * document structures to the unified document schema.
 */

import { apiRequest } from '@/lib/queryClient';

/**
 * Register a document from any module into the unified workflow system
 * 
 * @param {Object} documentData - Module-specific document data
 * @param {string} moduleType - The type of module (510k, cmc, ectd, study, cer)
 * @param {string} organizationId - The organization ID
 * @param {string} userId - The user ID of the creator
 * @returns {Promise<Object>} - The registered document in unified format
 */
export async function registerModuleDocument(documentData, moduleType, organizationId, userId) {
  // Map the module-specific data to the unified schema
  const unifiedData = mapToUnifiedSchema(documentData, moduleType, organizationId, userId);
  
  // Register the document through the API
  const response = await apiRequest({
    url: '/api/module-integration/register-document',
    method: 'POST',
    data: unifiedData
  });
  
  return response;
}

/**
 * Map module-specific document data to unified document schema
 * 
 * @param {Object} documentData - Module-specific document data
 * @param {string} moduleType - The type of module (510k, cmc, ectd, study, cer)
 * @param {string} organizationId - The organization ID
 * @param {string} userId - The user ID of the creator
 * @returns {Object} - Document data mapped to unified schema
 */
function mapToUnifiedSchema(documentData, moduleType, organizationId, userId) {
  // Common mapping for all modules
  const commonData = {
    organizationId,
    createdBy: userId,
    moduleType,
    originalId: documentData.id?.toString() || documentData._id?.toString(),
    status: documentData.status || 'draft'
  };
  
  // Module-specific mapping
  switch (moduleType) {
    case '510k':
      return {
        ...commonData,
        title: documentData.deviceName || documentData.title || '510(k) Submission',
        documentType: getDocumentTypeFromModule(moduleType, documentData),
        content: {
          deviceName: documentData.deviceName,
          predicateDevice: documentData.predicateDevice,
          indications: documentData.indications,
          deviceClass: documentData.deviceClass,
          regulatoryClass: documentData.regulatoryClass,
          sections: documentData.sections || [],
          ...documentData.content
        },
        metadata: {
          submissionType: documentData.submissionType || 'Traditional',
          manufacturerName: documentData.manufacturerName,
          contactPerson: documentData.contactPerson,
          fdaProductCode: documentData.fdaProductCode,
          regulationNumber: documentData.regulationNumber,
          reviewPanel: documentData.reviewPanel,
          ...documentData.metadata
        }
      };
      
    case 'cer':
      return {
        ...commonData,
        title: documentData.deviceName || documentData.title || 'Clinical Evaluation Report',
        documentType: getDocumentTypeFromModule(moduleType, documentData),
        content: {
          deviceName: documentData.deviceName,
          deviceDescription: documentData.deviceDescription,
          literatureSearch: documentData.literatureSearch,
          clinicalData: documentData.clinicalData,
          riskAnalysis: documentData.riskAnalysis,
          sections: documentData.sections || [],
          ...documentData.content
        },
        metadata: {
          mddClass: documentData.mddClass,
          riskClass: documentData.riskClass,
          cerVersion: documentData.cerVersion,
          standards: documentData.standards,
          equivalentDevices: documentData.equivalentDevices,
          ...documentData.metadata
        }
      };
      
    case 'cmc':
      return {
        ...commonData,
        title: documentData.productName || documentData.title || 'CMC Documentation',
        documentType: getDocumentTypeFromModule(moduleType, documentData),
        content: {
          productName: documentData.productName,
          formulation: documentData.formulation,
          manufacturingProcess: documentData.manufacturingProcess,
          specs: documentData.specs,
          sections: documentData.sections || [],
          ...documentData.content
        },
        metadata: {
          productType: documentData.productType,
          dosageForm: documentData.dosageForm,
          routeOfAdministration: documentData.routeOfAdministration,
          applicationType: documentData.applicationType,
          ...documentData.metadata
        }
      };
      
    case 'ectd':
      return {
        ...commonData,
        title: documentData.submissionTitle || documentData.title || 'eCTD Submission',
        documentType: getDocumentTypeFromModule(moduleType, documentData),
        content: {
          submissionTitle: documentData.submissionTitle,
          sequence: documentData.sequence,
          modules: documentData.modules || {},
          sections: documentData.sections || [],
          ...documentData.content
        },
        metadata: {
          applicationNumber: documentData.applicationNumber,
          submissionType: documentData.submissionType,
          submissionSubtype: documentData.submissionSubtype,
          applicant: documentData.applicant,
          ...documentData.metadata
        }
      };
      
    case 'study':
      return {
        ...commonData,
        title: documentData.studyTitle || documentData.title || 'Clinical Study',
        documentType: getDocumentTypeFromModule(moduleType, documentData),
        content: {
          studyTitle: documentData.studyTitle,
          protocol: documentData.protocol,
          objectives: documentData.objectives,
          endpoints: documentData.endpoints,
          sections: documentData.sections || [],
          ...documentData.content
        },
        metadata: {
          sponsorName: documentData.sponsorName,
          studyPhase: documentData.studyPhase,
          studyType: documentData.studyType,
          studyId: documentData.studyId,
          ...documentData.metadata
        }
      };
      
    default:
      // Generic mapping for other modules
      return {
        ...commonData,
        title: documentData.title || 'Regulatory Document',
        documentType: documentData.documentType || 'general',
        content: documentData.content || {},
        metadata: documentData.metadata || {}
      };
  }
}

/**
 * Determine the document type based on module and document data
 * 
 * @param {string} moduleType - The type of module
 * @param {Object} documentData - Module-specific document data
 * @returns {string} - Document type identifier
 */
function getDocumentTypeFromModule(moduleType, documentData) {
  switch (moduleType) {
    case '510k':
      return documentData.documentType || documentData.submissionType?.toLowerCase() || '510k_submission';
      
    case 'cer':
      return documentData.documentType || documentData.cerType?.toLowerCase() || 'clinical_evaluation_report';
      
    case 'cmc':
      return documentData.documentType || documentData.cmcType?.toLowerCase() || 'cmc_documentation';
      
    case 'ectd':
      return documentData.documentType || `ectd_module_${documentData.module || 'unknown'}`;
      
    case 'study':
      return documentData.documentType || documentData.studyType?.toLowerCase() || 'clinical_study';
      
    default:
      return documentData.documentType || 'regulatory_document';
  }
}

/**
 * Update an existing document in the unified system
 * 
 * @param {string} documentId - The unified document ID
 * @param {Object} updateData - The data to update
 * @param {string} userId - The user ID making the change
 * @returns {Promise<Object>} - The updated document
 */
export async function updateModuleDocument(documentId, updateData, userId) {
  const response = await apiRequest({
    url: `/api/module-integration/documents/${documentId}`,
    method: 'PATCH',
    data: {
      ...updateData,
      updatedBy: userId
    }
  });
  
  return response;
}

/**
 * Get document details from the unified system
 * 
 * @param {string} documentId - The unified document ID
 * @returns {Promise<Object>} - The document details
 */
export async function getModuleDocument(documentId) {
  const response = await apiRequest({
    url: `/api/module-integration/document/${documentId}`,
    method: 'GET'
  });
  
  return response;
}

/**
 * Check if a module-specific document has already been registered in the unified system
 * 
 * @param {string} moduleType - The type of module
 * @param {string} originalId - The original document ID in the module
 * @param {string} organizationId - The organization ID
 * @returns {Promise<boolean>} - Whether the document exists in the unified system
 */
export async function isDocumentRegistered(moduleType, originalId, organizationId) {
  const response = await apiRequest({
    url: '/api/module-integration/document-exists',
    method: 'GET',
    params: {
      moduleType,
      originalId,
      organizationId
    }
  });
  
  return response.exists;
}