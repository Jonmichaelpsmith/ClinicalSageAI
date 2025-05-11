/**
 * Microsoft Copilot Integration Service
 * 
 * This service provides integration with Microsoft Copilot for regulatory document authoring,
 * enabling AI-assisted document creation while maintaining compliance with the
 * Xerox-based Vault Document Management System requirements.
 * 
 * Key features:
 * - Regulatory-focused content generation
 * - Compliance awareness
 * - Integration with TrialSage knowledge base
 * - Document structure recommendations
 */

import { getAccessToken } from './microsoftAuthService';

// Configuration for Copilot service
const COPILOT_CONFIG = {
  apiUrl: '/api/microsoft/copilot',
  regulatoryTemplates: {
    ind: ['protocol', 'cmc', 'nonclinical', 'clinical', 'cover-letter'],
    ctd: ['module1', 'module2', 'module3', 'module4', 'module5'],
    general: ['executive-summary', 'rationale', 'methods', 'results', 'discussion', 'conclusion']
  },
  maxResponseTokens: 2048
};

/**
 * Ask Copilot a question with document context
 * 
 * @param {string} prompt - User prompt
 * @param {Object} options - Additional options
 * @param {string} options.documentContext - Current document content for context
 * @param {string} options.documentType - Document type (ind, ctd, etc.)
 * @param {string} options.regulatoryAuthority - Regulatory authority (FDA, EMA, etc.)
 * @returns {Promise<Object>} - Copilot response
 */
export async function askCopilot(prompt, options = {}) {
  try {
    const accessToken = getAccessToken();
    
    if (!accessToken) {
      throw new Error('Microsoft authentication required');
    }
    
    // Create request with regulatory context
    const response = await fetch(COPILOT_CONFIG.apiUrl + '/ask', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        options: {
          ...options,
          maxTokens: COPILOT_CONFIG.maxResponseTokens,
          temperature: 0.7,
          isRegulatory: true
        }
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to get response from Copilot');
    }
    
    return await response.json();
  } catch (err) {
    console.error('Error asking Copilot:', err);
    throw err;
  }
}

/**
 * Get writing suggestions for regulatory document
 * 
 * @param {string} documentContent - Document content
 * @param {string} documentType - Document type (ind, ctd, etc.)
 * @returns {Promise<Array>} - Array of writing suggestions
 */
export async function getWritingSuggestions(documentContent, documentType = 'general') {
  try {
    const accessToken = getAccessToken();
    
    if (!accessToken) {
      throw new Error('Microsoft authentication required');
    }
    
    // Request suggestions with regulatory focus
    const response = await fetch(COPILOT_CONFIG.apiUrl + '/suggestions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: documentContent,
        documentType,
        suggestionTypes: ['regulatory', 'technical', 'clarity', 'structure']
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to get writing suggestions');
    }
    
    return await response.json();
  } catch (err) {
    console.error('Error getting writing suggestions:', err);
    throw err;
  }
}

/**
 * Generate regulatory document section
 * 
 * @param {string} sectionName - Name of the section
 * @param {string} context - Additional context
 * @param {Object} options - Additional options
 * @param {string} options.documentType - Document type (ind, ctd, etc.)
 * @param {string} options.regulatoryAuthority - Regulatory authority (FDA, EMA, etc.)
 * @param {string} options.moduleSection - CTD module section (e.g. 2.5, 3.2.P)
 * @returns {Promise<string>} - Generated section content
 */
export async function generateRegulatorySection(sectionName, context = '', options = {}) {
  try {
    const accessToken = getAccessToken();
    
    if (!accessToken) {
      throw new Error('Microsoft authentication required');
    }
    
    // Request section generation with regulatory focus
    const response = await fetch(COPILOT_CONFIG.apiUrl + '/generate-section', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sectionName,
        context,
        options: {
          ...options,
          maxTokens: COPILOT_CONFIG.maxResponseTokens * 2,
          temperature: 0.4, // Lower temperature for more consistent regulatory content
          includeHeadings: true,
          includeFormatting: true
        }
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate regulatory section');
    }
    
    const data = await response.json();
    return data.content;
  } catch (err) {
    console.error('Error generating regulatory section:', err);
    throw err;
  }
}

/**
 * Get regulatory compliance suggestions
 * 
 * @param {string} documentContent - Document content
 * @param {Object} options - Additional options
 * @param {string} options.documentType - Document type (ind, ctd, etc.)
 * @param {string} options.regulatoryAuthority - Regulatory authority (FDA, EMA, etc.)
 * @param {string} options.moduleSection - CTD module section (e.g. 2.5, 3.2.P)
 * @returns {Promise<Array>} - Array of compliance suggestions
 */
export async function getComplianceSuggestions(documentContent, options = {}) {
  try {
    const accessToken = getAccessToken();
    
    if (!accessToken) {
      throw new Error('Microsoft authentication required');
    }
    
    // Request compliance suggestions
    const response = await fetch(COPILOT_CONFIG.apiUrl + '/compliance', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: documentContent,
        options: {
          ...options,
          checkAgainstXeroxVaultStandards: true, // Ensure compatibility with Xerox Vault standards
          includeReferences: true,
          includeReasonings: true
        }
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to get compliance suggestions');
    }
    
    return await response.json();
  } catch (err) {
    console.error('Error getting compliance suggestions:', err);
    throw err;
  }
}

/**
 * Get available templates for document type
 * 
 * @param {string} documentType - Document type (ind, ctd, etc.)
 * @returns {Promise<Array>} - Array of available templates
 */
export async function getAvailableTemplates(documentType = 'general') {
  try {
    const accessToken = getAccessToken();
    
    if (!accessToken) {
      throw new Error('Microsoft authentication required');
    }
    
    // Get templates from predefined list or from API
    const templates = COPILOT_CONFIG.regulatoryTemplates[documentType] || 
                      COPILOT_CONFIG.regulatoryTemplates.general;
    
    // Format templates with additional metadata
    return templates.map(templateId => ({
      id: templateId,
      name: formatTemplateName(templateId),
      description: getTemplateDescription(templateId, documentType),
      documentType
    }));
  } catch (err) {
    console.error('Error getting available templates:', err);
    throw err;
  }
}

/**
 * Format template name for display
 * 
 * @param {string} templateId - Template ID
 * @returns {string} - Formatted template name
 */
function formatTemplateName(templateId) {
  // Convert template ID to display name
  return templateId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get template description
 * 
 * @param {string} templateId - Template ID
 * @param {string} documentType - Document type
 * @returns {string} - Template description
 */
function getTemplateDescription(templateId, documentType) {
  // Template descriptions
  const descriptions = {
    'protocol': 'Standard protocol template for IND submissions',
    'cmc': 'Chemistry, Manufacturing, and Controls template',
    'nonclinical': 'Nonclinical safety assessment template',
    'clinical': 'Clinical evaluation template',
    'cover-letter': 'Regulatory submission cover letter template',
    'module1': 'CTD Module 1 - Administrative Information',
    'module2': 'CTD Module 2 - Common Technical Document Summaries',
    'module3': 'CTD Module 3 - Quality Documentation',
    'module4': 'CTD Module 4 - Nonclinical Study Reports',
    'module5': 'CTD Module 5 - Clinical Study Reports',
    'executive-summary': 'Executive summary template',
    'rationale': 'Study rationale template',
    'methods': 'Research methods template',
    'results': 'Study results template',
    'discussion': 'Results discussion template',
    'conclusion': 'Study conclusion template'
  };
  
  return descriptions[templateId] || `Template for ${formatTemplateName(templateId)}`;
}