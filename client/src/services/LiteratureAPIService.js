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
 * @param {Object} params.filters - Optional search filters
 * @param {number} params.limit - Maximum number of results to return
 * @returns {Promise<Object>} Search results
 */
export const searchLiterature = async ({ query, filters = {}, limit = 20 }) => {
  try {
    const response = await fetch('/api/literature/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, filters, limit }),
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
 * Summarize text content from a scientific paper
 * @param {Object} params - Summarization parameters
 * @param {string} params.text - Text to summarize
 * @param {string} params.context - Optional context to aid summarization
 * @returns {Promise<Object>} Summarized content
 */
export const summarizePaper = async ({ text, context }) => {
  try {
    const response = await fetch('/api/literature/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, context }),
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
 * @returns {Promise<Object>} Generated citations
 */
export const generateCitations = async ({ papers, format = 'vancouverStyle' }) => {
  try {
    const response = await fetch('/api/literature/generate-citations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ papers, format }),
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
