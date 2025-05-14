/**
 * Workflow Template Service
 * 
 * This service provides functions to manage workflow templates for different modules.
 * It handles caching templates locally to minimize API calls during a session.
 */

import { apiRequest } from '@/lib/queryClient';
import { getWorkflowTemplates } from './registerModuleDocument';

// In-memory template cache
const templateCache = {
  // Structure: { [moduleType]: { templates: Array, lastFetched: timestamp } }
};

// Cache expiration time (15 minutes)
const CACHE_TTL = 15 * 60 * 1000;

/**
 * Get workflow templates for a module type with caching
 * 
 * @param {string} moduleType - The type of module
 * @param {boolean} forceRefresh - Whether to force a refresh from API
 * @returns {Promise<Array>} Available workflow templates
 */
export async function getTemplatesForModule(moduleType, forceRefresh = false) {
  // Check cache first if not forcing refresh
  if (!forceRefresh && 
      templateCache[moduleType] && 
      templateCache[moduleType].templates &&
      (Date.now() - templateCache[moduleType].lastFetched) < CACHE_TTL) {
    return templateCache[moduleType].templates;
  }
  
  // Fetch from API
  try {
    const templates = await getWorkflowTemplates(moduleType);
    
    // Update cache
    templateCache[moduleType] = {
      templates,
      lastFetched: Date.now()
    };
    
    return templates;
  } catch (error) {
    console.error(`Error fetching templates for ${moduleType}:`, error);
    
    // Return cached templates if available (even if expired)
    if (templateCache[moduleType] && templateCache[moduleType].templates) {
      console.log(`Using cached templates for ${moduleType} due to API error`);
      return templateCache[moduleType].templates;
    }
    
    throw error;
  }
}

/**
 * Get a specific template by ID
 * 
 * @param {string} moduleType - The type of module
 * @param {number} templateId - Template ID to find
 * @returns {Promise<Object|null>} The template or null if not found
 */
export async function getTemplateById(moduleType, templateId) {
  try {
    const templates = await getTemplatesForModule(moduleType);
    return templates.find(t => t.id === templateId) || null;
  } catch (error) {
    console.error(`Error fetching template ${templateId}:`, error);
    throw error;
  }
}

/**
 * Get default workflow template for a module type
 * 
 * @param {string} moduleType - The type of module
 * @param {string} documentType - Optional document type to match against template description
 * @returns {Promise<Object|null>} Default template or null if none available
 */
export async function getDefaultTemplate(moduleType, documentType = null) {
  try {
    const templates = await getTemplatesForModule(moduleType);
    
    if (templates.length === 0) {
      return null;
    }
    
    // If document type is provided, try to find a matching template
    if (documentType) {
      const lowerDocType = documentType.toLowerCase();
      
      // First, look for an exact match in name or description
      const exactMatch = templates.find(t => {
        const tName = t.name.toLowerCase();
        const tDesc = (t.description || '').toLowerCase();
        return tName.includes(lowerDocType) || tDesc.includes(lowerDocType);
      });
      
      if (exactMatch) {
        return exactMatch;
      }
    }
    
    // Return the first active template as default
    return templates.find(t => t.isActive) || templates[0];
  } catch (error) {
    console.error(`Error fetching default template for ${moduleType}:`, error);
    throw error;
  }
}