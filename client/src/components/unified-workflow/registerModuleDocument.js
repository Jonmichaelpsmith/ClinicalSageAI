/**
 * Module Document Registration Service
 * 
 * This service provides functions for registering documents from different modules
 * in the unified document workflow system.
 */

/**
 * Register a document from a module in the unified document system
 * 
 * @param {Object} documentData Document data to register
 * @returns {Promise<Object>} The registered document with its module reference
 */
export async function registerModuleDocument(documentData) {
  try {
    const response = await fetch('/api/module-integration/register-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(documentData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to register document: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error registering module document:', error);
    throw error;
  }
}

/**
 * Get a document by its module-specific ID
 * 
 * @param {string} moduleType Module type
 * @param {string} originalId Original document ID in the module
 * @param {number} organizationId Organization ID
 * @returns {Promise<Object>} The document or null if not found
 */
export async function getDocumentByModuleId(moduleType, originalId, organizationId) {
  try {
    const response = await fetch(`/api/module-integration/document/${moduleType}/${originalId}?organizationId=${organizationId}`);
    
    if (response.status === 404) {
      // Document not found is a valid case, not an error
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`Failed to get document: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching document by module ID:', error);
    throw error;
  }
}

/**
 * Get documents for a module
 * 
 * @param {string} moduleType Module type
 * @param {number} organizationId Organization ID
 * @returns {Promise<Array>} List of documents
 */
export async function getModuleDocuments(moduleType, organizationId) {
  try {
    const response = await fetch(`/api/module-integration/documents/${moduleType}?organizationId=${organizationId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get documents: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching module documents:', error);
    throw error;
  }
}

/**
 * Get document counts by type for an organization
 * 
 * @param {number} organizationId Organization ID
 * @returns {Promise<Object>} Map of document types to counts
 */
export async function getDocumentCountByType(organizationId) {
  try {
    const response = await fetch(`/api/module-integration/document-counts?organizationId=${organizationId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get document counts: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching document counts:', error);
    throw error;
  }
}

/**
 * Get documents in review
 * 
 * @param {number} organizationId Organization ID
 * @returns {Promise<Array>} Documents in review
 */
export async function getDocumentsInReview(organizationId) {
  try {
    const response = await fetch(`/api/module-integration/documents-in-review?organizationId=${organizationId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get documents in review: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching documents in review:', error);
    throw error;
  }
}

/**
 * Register a 510(k) document
 * 
 * @param {string} projectId 510(k) project ID
 * @param {string} title Document title
 * @param {string} documentType Document type
 * @param {number} organizationId Organization ID
 * @param {number} userId User ID
 * @param {Object} metadata Additional metadata
 * @returns {Promise<Object>} The registered document
 */
export async function register510kDocument(projectId, title, documentType, organizationId, userId, metadata = {}) {
  return registerModuleDocument({
    title,
    documentType,
    organizationId,
    createdBy: userId,
    status: 'draft',
    latestVersion: 1,
    moduleType: '510k',
    originalId: projectId,
    metadata: {
      ...metadata,
      projectId
    }
  });
}

/**
 * Register a CER document
 * 
 * @param {string} projectId CER project ID
 * @param {string} title Document title
 * @param {string} documentType Document type
 * @param {number} organizationId Organization ID
 * @param {number} userId User ID
 * @param {Object} metadata Additional metadata
 * @returns {Promise<Object>} The registered document
 */
export async function registerCERDocument(projectId, title, documentType, organizationId, userId, metadata = {}) {
  return registerModuleDocument({
    title,
    documentType,
    organizationId,
    createdBy: userId,
    status: 'draft',
    latestVersion: 1,
    moduleType: 'cer',
    originalId: projectId,
    metadata: {
      ...metadata,
      projectId
    }
  });
}

/**
 * Register a CSR document
 * 
 * @param {string} projectId CSR project ID
 * @param {string} title Document title
 * @param {string} documentType Document type
 * @param {number} organizationId Organization ID
 * @param {number} userId User ID
 * @param {Object} metadata Additional metadata
 * @returns {Promise<Object>} The registered document
 */
export async function registerCSRDocument(projectId, title, documentType, organizationId, userId, metadata = {}) {
  return registerModuleDocument({
    title,
    documentType,
    organizationId,
    createdBy: userId,
    status: 'draft',
    latestVersion: 1,
    moduleType: 'csr',
    originalId: projectId,
    metadata: {
      ...metadata,
      projectId
    }
  });
}

/**
 * Compare document versions
 * 
 * @param {number} currentVersionId Current document version ID
 * @param {number} previousVersionId Previous document version ID
 * @returns {Promise<Object>} Comparison result
 */
export async function compareDocumentVersions(currentVersionId, previousVersionId) {
  try {
    const response = await fetch(`/api/module-integration/compare-versions?currentVersionId=${currentVersionId}&previousVersionId=${previousVersionId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to compare versions: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error comparing document versions:', error);
    throw error;
  }
}