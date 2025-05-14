/**
 * Workflow Template Service
 * 
 * This service provides client-side functionality for workflow template operations,
 * with caching for performance and consistency.
 */

import { apiRequest } from '@/lib/queryClient';

// Template cache to minimize API calls
const templateCache = {
  byModule: {}, // Cached by moduleType and organizationId
  byId: {},     // Cached by templateId
  expiry: {}    // Cache expiry timestamps
};

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Gets workflow templates for an organization and module type
 * 
 * @param {string} moduleType - The module type
 * @param {number} organizationId - The organization ID
 * @param {boolean} forceRefresh - Whether to bypass cache
 * @returns {Promise<Array>} List of workflow templates
 */
export async function getWorkflowTemplates(moduleType, organizationId, forceRefresh = false) {
  const cacheKey = `${moduleType}-${organizationId}`;
  
  // Check cache first
  if (
    !forceRefresh && 
    templateCache.byModule[cacheKey] && 
    templateCache.expiry[cacheKey] > Date.now()
  ) {
    return templateCache.byModule[cacheKey];
  }
  
  // Fetch templates from API
  try {
    const templates = await apiRequest({
      url: `/api/module-integration/workflow-templates?moduleType=${moduleType}&organizationId=${organizationId}`,
      method: 'GET'
    });
    
    // Update cache
    templateCache.byModule[cacheKey] = templates;
    templateCache.expiry[cacheKey] = Date.now() + CACHE_TTL;
    
    // Also cache individual templates
    templates.forEach(template => {
      templateCache.byId[template.id] = template;
      templateCache.expiry[template.id] = Date.now() + CACHE_TTL;
    });
    
    return templates;
  } catch (error) {
    console.error('Error fetching workflow templates:', error);
    throw error;
  }
}

/**
 * Gets a workflow template by ID
 * 
 * @param {number} templateId - The template ID
 * @param {boolean} forceRefresh - Whether to bypass cache
 * @returns {Promise<Object>} The workflow template
 */
export async function getWorkflowTemplateById(templateId, forceRefresh = false) {
  // Check cache first
  if (
    !forceRefresh && 
    templateCache.byId[templateId] && 
    templateCache.expiry[templateId] > Date.now()
  ) {
    return templateCache.byId[templateId];
  }
  
  // Fetch template from API
  try {
    const template = await apiRequest({
      url: `/api/module-integration/workflow-templates/${templateId}`,
      method: 'GET'
    });
    
    // Update cache
    templateCache.byId[template.id] = template;
    templateCache.expiry[template.id] = Date.now() + CACHE_TTL;
    
    return template;
  } catch (error) {
    console.error(`Error fetching workflow template with ID ${templateId}:`, error);
    throw error;
  }
}

/**
 * Creates a new workflow template
 * 
 * @param {Object} templateData - The template data
 * @returns {Promise<Object>} The created template
 */
export async function createWorkflowTemplate(templateData) {
  try {
    const template = await apiRequest({
      url: '/api/module-integration/workflow-templates',
      method: 'POST',
      data: templateData
    });
    
    // Update cache
    const cacheKey = `${template.moduleType}-${template.organizationId}`;
    templateCache.byId[template.id] = template;
    templateCache.expiry[template.id] = Date.now() + CACHE_TTL;
    
    // Invalidate module cache to force refresh on next fetch
    delete templateCache.byModule[cacheKey];
    delete templateCache.expiry[cacheKey];
    
    return template;
  } catch (error) {
    console.error('Error creating workflow template:', error);
    throw error;
  }
}

/**
 * Creates default workflow templates for an organization
 * 
 * @param {number} organizationId - The organization ID
 * @param {number} createdBy - User ID of the creator
 * @returns {Promise<Array>} The created templates
 */
export async function createDefaultWorkflowTemplates(organizationId, createdBy) {
  try {
    const templates = await apiRequest({
      url: '/api/module-integration/workflow-templates/defaults',
      method: 'POST',
      data: { organizationId, createdBy }
    });
    
    // Clear all caches for this organization
    Object.keys(templateCache.byModule).forEach(key => {
      if (key.endsWith(`-${organizationId}`)) {
        delete templateCache.byModule[key];
        delete templateCache.expiry[key];
      }
    });
    
    return templates;
  } catch (error) {
    console.error('Error creating default workflow templates:', error);
    throw error;
  }
}

/**
 * Clears all template caches
 */
export function clearTemplateCache() {
  templateCache.byModule = {};
  templateCache.byId = {};
  templateCache.expiry = {};
}

/**
 * Formats workflow steps for display
 * 
 * @param {Array} steps - The workflow steps
 * @returns {string} Formatted steps text
 */
export function formatWorkflowSteps(steps) {
  if (!steps || !steps.length) {
    return 'No steps defined';
  }
  
  return steps.map((step, index) => 
    `${index + 1}. ${step.name}${step.description ? ` - ${step.description}` : ''}`
  ).join('\n');
}

/**
 * Returns default workflow templates for module types
 * 
 * @param {string} moduleType - The module type
 * @returns {Array} Default templates for the module type
 */
export function getDefaultTemplateStructure(moduleType) {
  const templates = {
    'medical_device': [
      {
        name: '510(k) Standard Review',
        description: 'Standard workflow for 510(k) submission review',
        steps: [
          { name: 'Initial Review', description: 'Technical content review' },
          { name: 'Quality Check', description: 'Formatting and completeness check' },
          { name: 'Regulatory Review', description: 'Compliance with regulations' },
          { name: 'Final Approval', description: 'Final sign-off before submission' }
        ]
      },
      {
        name: 'Expedited Review',
        description: 'Faster review for time-sensitive documents',
        steps: [
          { name: 'Rapid Review', description: 'Combined technical and quality review' },
          { name: 'Final Approval', description: 'Final sign-off' }
        ]
      }
    ],
    'cer': [
      {
        name: 'CER Standard Review',
        description: 'Standard workflow for Clinical Evaluation Report review',
        steps: [
          { name: 'Data Review', description: 'Clinical data validation' },
          { name: 'Medical Writing', description: 'Narrative and structure' },
          { name: 'Quality Check', description: 'Formatting and references' },
          { name: 'Medical Expert Review', description: 'Clinical validity check' },
          { name: 'Final Approval', description: 'Final sign-off for use' }
        ]
      }
    ],
    'cmc': [
      {
        name: 'CMC Section Review',
        description: 'Standard review process for CMC sections',
        steps: [
          { name: 'Technical Review', description: 'Scientific content review' },
          { name: 'QC Review', description: 'Quality control check' },
          { name: 'Regulatory Assessment', description: 'Regulatory compliance check' },
          { name: 'Final Approval', description: 'Sign-off for submission' }
        ]
      }
    ]
  };
  
  return templates[moduleType] || [];
}