/**
 * OpenAI Service for TrialSage
 * 
 * Provides AI-powered document summarization and analysis capabilities
 * using the OpenAI API.
 */

/**
 * Summarize a document using OpenAI
 * 
 * @param {string} documentId - The ID of the document to summarize
 * @returns {Promise<string>} - The generated summary text
 */
export async function summarizeDocumentAI(documentId) {
  try {
    const response = await fetch('/api/ai/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ documentId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to summarize document');
    }
    
    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error('OpenAI Service Error (summarizeDocumentAI):', error);
    return 'An error occurred while generating the summary. Please try again later.';
  }
}

/**
 * Analyze a document to extract regulatory insights
 * 
 * @param {string} documentId - The ID of the document to analyze
 * @returns {Promise<Object>} - Extracted regulatory insights
 */
export async function extractRegulatoryInsights(documentId) {
  try {
    const response = await fetch('/api/ai/analyze/regulatory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ documentId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze document');
    }
    
    return await response.json();
  } catch (error) {
    console.error('OpenAI Service Error (extractRegulatoryInsights):', error);
    throw error;
  }
}

/**
 * Generate IND-specific document templates
 * 
 * @param {Object} parameters - Template parameters
 * @returns {Promise<Object>} - Generated template content
 */
export async function generateINDTemplate(parameters) {
  try {
    const response = await fetch('/api/ai/generate/ind-template', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parameters),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate template');
    }
    
    return await response.json();
  } catch (error) {
    console.error('OpenAI Service Error (generateINDTemplate):', error);
    throw error;
  }
}