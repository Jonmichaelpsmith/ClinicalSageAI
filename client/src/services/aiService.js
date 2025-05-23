/**
 * !!!!! OFFICIAL AI SERVICE FOR eCTD CO-AUTHOR MODULE !!!!!
 * 
 * This service file supports the ONE AND ONLY official implementation 
 * of the eCTD Co-Author Module.
 * 
 * Version: 4.1.0 - May 12, 2025
 * Status: STABLE - DO NOT MODIFY WITHOUT APPROVAL
 * 
 * PROTECTED CODE - This is where previous modifications broke the module.
 * Do not modify without thorough testing. Do not create duplicate implementations.
 * 
 * UPDATES:
 * - Added Content Atom AI Generation & Validation endpoints (Phase 4)
 * - Support for /ai/draft-atom, /ai/suggest, and /ai/validate-atom
 */

// Helper function for API requests
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
      // Try to get detailed error message from response
      let errorDetail = '';
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.message || '';
      } catch (e) {
        // Ignore JSON parsing errors
      }

      throw new Error(`API error (${response.status}): ${errorDetail}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`AI Service Error (${endpoint}):`, error);
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
  // This could be implemented as a custom variation of content-suggestions or a separate endpoint
  return apiRequest('content-suggestions', {
    documentId,
    sectionId: 'summary',
    currentContent: content,
    prompt: `Generate a concise ${audience}-focused summary of this document in approximately ${maxLength} words.`
  });
}

/**
 * Analyze citations and references in document
 * @param {string} documentId - The document identifier
 * @param {string} content - The document content with citations
 * @returns {Promise<Object>} - Citation analysis results
 */
export async function analyzeCitationsAI(documentId, content) {
  // This could be implemented as a custom variation of document-review or a separate endpoint
  return apiRequest('document-review', {
    documentId,
    content,
    reviewFocus: 'citations'
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
  // This would be a custom endpoint, but for now we can simulate it with a general query
  return apiRequest('ask', {
    query: `Find relevant regulatory references, guidelines, and scientific literature related to the following content from sources including ${sources.join(', ')}:\n\n${content.substring(0, 1500)}...`
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

/**
 * Draft a new content atom using AI
 * @param {Object} params - Parameters for atom generation
 * @param {string} params.atomType - Type of atom to generate (narrative, table, figure, etc.)
 * @param {string} params.region - Regulatory region (e.g., 'US', 'EU', 'JP')
 * @param {string} params.module - Document module (e.g., 'm1', 'm2', 'm3')
 * @param {string} params.sectionCode - ICH CTD section code
 * @param {string} params.prompt - User instructions for generation
 * @returns {Promise<Object>} - Generated atom in JSON format
 */
export async function draftAtom(params) {
  return apiRequest('draft-atom', params);
}

/**
 * Get AI suggestions to improve a content atom
 * @param {Object} atom - The current atom JSON
 * @param {string} feedback - Optional user feedback or instructions
 * @returns {Promise<Object>} - Improved atom JSON or HTML
 */
export async function suggestAtomImprovements(atom, feedback = '') {
  return apiRequest('suggest', {
    atom,
    feedback
  });
}

/**
 * Validate a content atom against schema and regulatory guidelines
 * @param {Object} atom - The atom JSON to validate
 * @param {Array<string>} standards - Standards to validate against (e.g., 'ICH', 'FDA')
 * @returns {Promise<Object>} - Validation results with issues and recommendations
 */
export async function validateAtom(atom, standards = ['ICH']) {
  return apiRequest('validate-atom', {
    atom,
    standards
  });
}

export default {
  generateContentSuggestions,
  checkComplianceAI,
  analyzeFormattingAI,
  generateDocumentSummary,
  analyzeCitationsAI,
  askDocumentAI,
  findRelevantReferences,
  reviewDocumentQuality,
  // Phase 4: AI-Enhanced Atom Generation & Validation
  draftAtom,
  suggestAtomImprovements,
  validateAtom
};