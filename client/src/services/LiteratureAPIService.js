/**
 * Literature API Service
 * 
 * This service handles communication with the Literature API endpoints for
 * the CER module's Literature AI component.
 */

/**
 * Search for scientific literature related to a product
 * @param {Object} params - Search parameters
 * @param {string} params.query - Search query
 * @param {string[]} params.sources - Sources to search (pubmed, googleScholar)
 * @param {Object} params.filters - Optional search filters
 * @param {number} params.filters.yearFrom - Start year for publication date filter
 * @param {number} params.filters.yearTo - End year for publication date filter
 * @param {string} params.filters.journalType - Journal type filter
 * @param {number} params.limit - Maximum number of results to return
 * @returns {Promise<Object>} Search results
 */
export const searchLiterature = async ({ query, sources = ['pubmed', 'googleScholar'], filters = {}, limit = 20 }) => {
  try {
    const response = await fetch('/api/literature/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, sources, filters, limit }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to search for literature');
    }

    return await response.json();
  } catch (error) {
    console.error('Literature search error:', error);
    throw error;
  }
};

/**
 * Summarize text content from a scientific paper using GPT-4o
 * @param {Object} params - Summarization parameters
 * @param {string} params.text - Text to summarize (abstract or full text)
 * @param {string} params.context - Optional context to aid summarization (CER title or device info)
 * @param {Object} params.options - Optional summarization options
 * @param {string} params.options.format - Summary format ('bullet', 'paragraph', 'structured')
 * @param {number} params.options.maxLength - Maximum summary length
 * @returns {Promise<Object>} Summarized content
 */
export const summarizePaper = async ({ text, context, options = {} }) => {
  try {
    const response = await fetch('/api/literature/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, context, options }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to summarize paper');
    }

    return await response.json();
  } catch (error) {
    console.error('Paper summarization error:', error);
    throw error;
  }
};

/**
 * Generate formatted citations for scientific papers
 * @param {Object} params - Citation parameters
 * @param {Array} params.papers - Array of paper objects to cite
 * @param {string} params.format - Citation format (vancouverStyle, apa, mla, harvard)
 * @param {boolean} params.numbered - Whether to use numbered citations
 * @returns {Promise<Object>} Generated citations
 */
export const generateCitations = async ({ papers, format = 'vancouverStyle', numbered = true }) => {
  try {
    const response = await fetch('/api/literature/generate-citations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ papers, format, numbered }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate citations');
    }

    return await response.json();
  } catch (error) {
    console.error('Citation generation error:', error);
    throw error;
  }
};

/**
 * Generate a complete literature review section based on selected papers
 * @param {Object} params - Parameters for literature review generation
 * @param {Array} params.papers - Array of selected papers with summaries
 * @param {string} params.context - CER context (device name, indication, etc.)
 * @param {Object} params.options - Generation options
 * @param {string} params.options.focus - Focus area ('safety', 'efficacy', 'both')
 * @param {string} params.options.format - Format ('comprehensive', 'concise')
 * @returns {Promise<Object>} Generated literature review
 */
export const generateLiteratureReview = async ({ papers, context, options = {} }) => {
  try {
    const response = await fetch('/api/literature/generate-review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ papers, context, options }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate literature review');
    }

    return await response.json();
  } catch (error) {
    console.error('Literature review generation error:', error);
    throw error;
  }
};

/**
 * Upload and analyze PDF papers for literature review
 * @param {Object} params - Upload parameters
 * @param {File} params.file - PDF file to upload and analyze
 * @param {string} params.context - CER context (device name, indication, etc.)
 * @returns {Promise<Object>} Analyzed paper data
 */
export const analyzePaperPDF = async ({ file, context }) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('context', context || '');
    
    const response = await fetch('/api/literature/analyze-pdf', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze PDF');
    }

    return await response.json();
  } catch (error) {
    console.error('PDF analysis error:', error);
    throw error;
  }
};
