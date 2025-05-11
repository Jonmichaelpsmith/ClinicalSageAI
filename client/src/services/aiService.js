/**
 * AI Service for TrialSage eCTD Co-Author Module
 * Provides integration with OpenAI services for document intelligence features
 */

// Base API request function with error handling
async function apiRequest(endpoint, data) {
  try {
    const response = await fetch(`/api/ai/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error(`AI Service error (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Generate content suggestions for a specific document section
 * @param {string} documentId - The document identifier
 * @param {string} sectionId - The section identifier
 * @param {string} currentContent - The current content of the section
 * @param {string} prompt - Additional context or instructions
 * @returns {Promise<Object>} - Suggestion data
 */
export async function generateContentSuggestions(documentId, sectionId, currentContent, prompt = '') {
  return apiRequest('content-suggestions', {
    documentId,
    sectionId, 
    currentContent,
    prompt
  });
}

/**
 * Check document content for compliance with regulatory standards
 * @param {string} documentId - The document identifier
 * @param {string} content - The document content to check
 * @param {Array<string>} standards - Regulatory standards to check against (e.g., 'FDA', 'EMA', 'ICH')
 * @returns {Promise<Object>} - Compliance check results
 */
export async function checkComplianceAI(documentId, content, standards = ['ICH', 'FDA', 'EMA']) {
  return apiRequest('compliance-check', {
    documentId,
    content,
    standards
  });
}

/**
 * Analyze document formatting and provide formatting suggestions
 * @param {string} documentId - The document identifier
 * @param {string} content - The document content to analyze
 * @param {string} documentType - The type of document (e.g., 'clinicalOverview', 'coverLetter')
 * @returns {Promise<Object>} - Formatting suggestions
 */
export async function analyzeFormattingAI(documentId, content, documentType) {
  return apiRequest('format-analysis', {
    documentId,
    content,
    documentType
  });
}

/**
 * Generate document summaries for different audiences/purposes
 * @param {string} documentId - The document identifier
 * @param {string} content - The document content to summarize
 * @param {string} audience - Target audience (e.g., 'regulatory', 'scientific', 'executive')
 * @param {number} maxLength - Maximum length of summary in words
 * @returns {Promise<Object>} - Generated summary
 */
export async function generateDocumentSummary(documentId, content, audience = 'regulatory', maxLength = 500) {
  return apiRequest('document-summary', {
    documentId,
    content,
    audience,
    maxLength
  });
}

/**
 * Analyze citations and references in document
 * @param {string} documentId - The document identifier
 * @param {string} content - The document content with citations
 * @returns {Promise<Object>} - Citation analysis results
 */
export async function analyzeCitationsAI(documentId, content) {
  return apiRequest('citation-analysis', {
    documentId,
    content
  });
}

/**
 * Generate contextual responses to user queries about regulatory documents
 * @param {string} query - The user's query
 * @param {string} documentId - Optional document context
 * @param {string} sectionId - Optional section context
 * @returns {Promise<Object>} - AI response to query
 */
export async function askDocumentAI(query, documentId = null, sectionId = null) {
  return apiRequest('ask', {
    query,
    documentId,
    sectionId
  });
}

/**
 * Search for relevant regulatory references based on document content
 * @param {string} content - The document content to find references for
 * @param {Array<string>} sources - Sources to search (e.g., 'pubmed', 'regulatory', 'guidelines')
 * @returns {Promise<Object>} - Related references
 */
export async function findRelevantReferences(content, sources = ['pubmed', 'regulatory', 'guidelines']) {
  return apiRequest('find-references', {
    content,
    sources
  });
}

/**
 * Review document for consistency, gaps, and quality issues
 * @param {string} documentId - The document identifier
 * @param {string} content - The document content to review
 * @returns {Promise<Object>} - Comprehensive review results
 */
export async function reviewDocumentQuality(documentId, content) {
  return apiRequest('document-review', {
    documentId,
    content
  });
}