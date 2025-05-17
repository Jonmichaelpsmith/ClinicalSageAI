/**
 * Microsoft Copilot Service
 * 
 * This service provides integration with Microsoft Copilot for document-based AI assistance,
 * enabling enhanced writing, editing, and document generation capabilities.
 */

import axios from 'axios';

/**
 * Ask Microsoft Copilot a question or provide a prompt related to document content
 * 
 * @param {string} prompt - The user's question or request
 * @param {Object} options - Additional context options
 * @param {string} options.documentContext - Current document content for context
 * @returns {Promise<Object>} - Copilot response with text and suggestions
 */
export async function askCopilot(prompt, options = {}) {
  try {
    const token = localStorage.getItem('ms_access_token');
    if (!token) {
      throw new Error('Microsoft authentication required');
    }
    
    const response = await axios.post(
      '/api/microsoft-office/copilot/ask',
      {
        prompt,
        documentContext: options.documentContext || '',
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error asking Copilot:', error);
    // Graceful fallback - provide a less capable but functional response
    return { 
      text: "I'm unable to connect to Microsoft Copilot right now. Please try again later or use the AI tools available in the application.",
      suggestions: []
    };
  }
}

/**
 * Get writing suggestions and improvements for the current document content
 * 
 * @param {string} documentContent - The current document content
 * @returns {Promise<Array>} - List of writing suggestions
 */
export async function getWritingSuggestions(documentContent) {
  try {
    const token = localStorage.getItem('ms_access_token');
    if (!token) {
      throw new Error('Microsoft authentication required');
    }
    
    const response = await axios.post(
      '/api/microsoft-office/copilot/suggestions',
      { documentContent },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data.suggestions || [];
  } catch (error) {
    console.error('Error getting writing suggestions:', error);
    // Return empty suggestions array to avoid breaking UI
    return [];
  }
}

/**
 * Generate regulatory document section content based on standards
 * 
 * @param {string} sectionName - Name of the section to generate
 * @param {string} additionalContext - Additional context or requirements
 * @returns {Promise<string>} - Generated section content
 */
export async function generateRegulatorySection(sectionName, additionalContext = '') {
  try {
    const token = localStorage.getItem('ms_access_token');
    if (!token) {
      throw new Error('Microsoft authentication required');
    }
    
    const response = await axios.post(
      '/api/microsoft-office/copilot/regulatory-section',
      {
        sectionName,
        additionalContext
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data.content || '';
  } catch (error) {
    console.error('Error generating regulatory section:', error);
    return `[Unable to generate ${sectionName} section. Please try again later.]`;
  }
}

/**
 * Format document according to regulatory standards
 * 
 * @param {string} documentContent - The current document content
 * @param {string} regulationType - Type of regulatory document
 * @returns {Promise<Object>} - Formatting recommendations and properly formatted content
 */
export async function getFormattingRecommendations(documentContent, regulationType) {
  try {
    const token = localStorage.getItem('ms_access_token');
    if (!token) {
      throw new Error('Microsoft authentication required');
    }
    
    const response = await axios.post(
      '/api/microsoft-office/copilot/format',
      {
        documentContent,
        regulationType
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error getting formatting recommendations:', error);
    return {
      recommendations: [],
      formattedContent: documentContent // Return original content if formatting fails
    };
  }
}

/**
 * Check regulatory compliance of document content
 * 
 * @param {string} documentContent - The current document content
 * @param {string} regulationType - Type of regulatory document
 * @returns {Promise<Object>} - Compliance check results
 */
export async function checkCompliance(documentContent, regulationType) {
  try {
    const token = localStorage.getItem('ms_access_token');
    if (!token) {
      throw new Error('Microsoft authentication required');
    }
    
    const response = await axios.post(
      '/api/microsoft-office/copilot/compliance',
      {
        documentContent,
        regulationType
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error checking compliance:', error);
    return {
      compliant: false,
      issues: [{
        severity: 'error',
        message: 'Unable to check compliance due to service error'
      }]
    };
  }
}
/**
 * Initialize a Microsoft Copilot session for a document
 * @param {string} documentId - Document identifier
 * @returns {Promise<Object>} Session details
 */
export async function initializeCopilot(documentId) {
  try {
    const token = localStorage.getItem('ms_access_token');
    if (!token) {
      throw new Error('Microsoft authentication required');
    }

    const response = await axios.post(
      '/api/microsoft-office/copilot/init',
      { documentId },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error initializing Copilot:', error);
    return { sessionId: `copilot-${Date.now()}`, status: 'offline' };
  }
}

/**
 * Generate document content using Copilot
 * @param {string} prompt - Prompt or instruction for generation
 * @param {string} sessionId - Copilot session identifier
 * @returns {Promise<Object>} Generated content and quality info
 */
export async function generateContent(prompt, sessionId) {
  try {
    const token = localStorage.getItem('ms_access_token');
    if (!token) {
      throw new Error('Microsoft authentication required');
    }

    const response = await axios.post(
      '/api/microsoft-office/copilot/generate',
      { prompt, sessionId },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error generating content:', error);
    return { content: '[Copilot service unavailable]', quality: 'unknown' };
  }
}

/**
 * Analyze a document using Copilot
 * @param {string} documentId - Document identifier
 * @param {string} sessionId - Copilot session identifier
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeDocument(documentId, sessionId) {
  try {
    const token = localStorage.getItem('ms_access_token');
    if (!token) {
      throw new Error('Microsoft authentication required');
    }

    const response = await axios.post(
      '/api/microsoft-office/copilot/analyze',
      { documentId, sessionId },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error analyzing document:', error);
    return {
      readability: { score: 0 },
      clinicalAccuracy: { score: 0 },
      regulatoryCompliance: { score: 0 },
      formattingConsistency: { score: 0 }
    };
  }
}

/**
 * End a Copilot session
 * @param {string} sessionId - Copilot session identifier
 * @returns {Promise<boolean>} Whether the session ended successfully
 */
export async function endCopilotSession(sessionId) {
  try {
    const token = localStorage.getItem('ms_access_token');
    if (!token) {
      throw new Error('Microsoft authentication required');
    }

    await axios.post(
      '/api/microsoft-office/copilot/end',
      { sessionId },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return true;
  } catch (error) {
    console.error('Error ending Copilot session:', error);
    return false;
  }
}
