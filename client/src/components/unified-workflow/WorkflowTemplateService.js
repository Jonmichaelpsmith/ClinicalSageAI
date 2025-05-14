/**
 * Workflow Template Service
 * 
 * This service provides functions for managing workflow templates
 * and implementing caching to reduce API calls.
 */

import { apiRequest } from '@/lib/queryClient';

// Template cache by module type and organization ID
const templateCache = new Map();

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Get workflow templates for a specific module type
 * 
 * @param {string} moduleType - The module type (med_device, cmc_wizard, etc.)
 * @param {number} organizationId - Organization ID
 * @param {boolean} skipCache - Whether to skip the cache and force a refresh
 * @returns {Promise<Array>} List of workflow templates
 */
export const getWorkflowTemplates = async (moduleType, organizationId, skipCache = false) => {
  const cacheKey = `${moduleType}:${organizationId}`;
  
  // Check cache first if not skipping
  if (!skipCache && templateCache.has(cacheKey)) {
    const cachedData = templateCache.get(cacheKey);
    
    // If cache is still valid, return cached data
    if (Date.now() < cachedData.expiresAt) {
      return cachedData.templates;
    }
    
    // If cache expired, remove it
    templateCache.delete(cacheKey);
  }
  
  try {
    // Fetch templates from API
    const response = await apiRequest(`/api/module-integration/workflow-templates/${moduleType}?organizationId=${organizationId}`);
    
    if (response.success && response.data) {
      // Cache the templates with expiration
      templateCache.set(cacheKey, {
        templates: response.data,
        expiresAt: Date.now() + CACHE_TTL
      });
      
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching workflow templates for ${moduleType}:`, error);
    return [];
  }
};

/**
 * Clear the workflow template cache for a specific module type
 * or all module types if none specified
 * 
 * @param {string} moduleType - Optional module type to clear cache for
 * @param {number} organizationId - Optional organization ID
 */
export const clearTemplateCache = (moduleType = null, organizationId = null) => {
  if (moduleType && organizationId) {
    // Clear cache for specific module type and organization
    const cacheKey = `${moduleType}:${organizationId}`;
    templateCache.delete(cacheKey);
  } else if (moduleType) {
    // Clear cache for all organizations of a specific module type
    for (const cacheKey of templateCache.keys()) {
      if (cacheKey.startsWith(`${moduleType}:`)) {
        templateCache.delete(cacheKey);
      }
    }
  } else {
    // Clear all cache
    templateCache.clear();
  }
};

/**
 * Find a template by name for a specific module type
 * 
 * @param {string} moduleType - The module type
 * @param {number} organizationId - Organization ID
 * @param {string} templateName - Template name to find
 * @returns {Promise<Object|null>} The found template or null
 */
export const findTemplateByName = async (moduleType, organizationId, templateName) => {
  try {
    const templates = await getWorkflowTemplates(moduleType, organizationId);
    
    return templates.find(template => 
      template.name.toLowerCase() === templateName.toLowerCase()
    ) || null;
  } catch (error) {
    console.error(`Error finding template "${templateName}" for ${moduleType}:`, error);
    return null;
  }
};

/**
 * Get a default template for a document type in a specific module
 * 
 * @param {string} moduleType - The module type
 * @param {number} organizationId - Organization ID
 * @param {string} documentType - The document type (e.g., '510k', 'CER')
 * @returns {Promise<Object|null>} The default template or null
 */
export const getDefaultTemplateForDocumentType = async (moduleType, organizationId, documentType) => {
  try {
    // Get all templates for the module
    const templates = await getWorkflowTemplates(moduleType, organizationId);
    
    // Find a template containing the document type in its name
    const docTypeFormatted = documentType.toUpperCase();
    
    // First, look for templates with exact format match (e.g., "510k Review Workflow")
    const exactMatch = templates.find(template => 
      template.name.toUpperCase().includes(docTypeFormatted) && 
      template.name.includes('Workflow')
    );
    
    if (exactMatch) {
      return exactMatch;
    }
    
    // Next, look for any template with the document type in the name
    const partialMatch = templates.find(template => 
      template.name.toUpperCase().includes(docTypeFormatted)
    );
    
    if (partialMatch) {
      return partialMatch;
    }
    
    // If no specific template found, return the first active template
    const firstActive = templates.find(template => template.isActive);
    
    return firstActive || null;
  } catch (error) {
    console.error(`Error finding default template for ${documentType} in ${moduleType}:`, error);
    return null;
  }
};