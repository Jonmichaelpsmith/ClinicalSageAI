/**
 * Workflow Template Service
 * 
 * This service provides functions for managing workflow templates in the unified system.
 */

import { apiRequest } from '@/lib/queryClient';

/**
 * Default workflow templates by module type
 * These are used as a starting point when creating new workflow templates
 */
export const DEFAULT_WORKFLOW_TEMPLATES = {
  med_device: {
    name: 'Medical Device Review Process',
    description: 'Standard review process for medical device documents',
    steps: [
      {
        role: 'reviewer',
        title: 'Technical Review',
        description: 'Review technical aspects of the document'
      },
      {
        role: 'regulatory_affairs',
        title: 'Regulatory Review',
        description: 'Review for regulatory compliance'
      },
      {
        role: 'quality_assurance',
        title: 'Quality Assurance',
        description: 'Final quality check before approval'
      }
    ]
  },
  cmc_wizard: {
    name: 'CMC Standard Review',
    description: 'Standard review process for Chemistry, Manufacturing, and Controls documents',
    steps: [
      {
        role: 'formulation_scientist',
        title: 'Formulation Review',
        description: 'Review formulation aspects'
      },
      {
        role: 'analytical_scientist',
        title: 'Analytical Review',
        description: 'Review analytical methods and data'
      },
      {
        role: 'regulatory_affairs',
        title: 'Regulatory Review',
        description: 'Review for regulatory compliance'
      },
      {
        role: 'quality_control',
        title: 'Quality Control',
        description: 'Final quality check before approval'
      }
    ]
  },
  ectd_coauthor: {
    name: 'eCTD Document Review',
    description: 'Review process for eCTD documents',
    steps: [
      {
        role: 'author',
        title: 'Author Review',
        description: 'Final review by the author'
      },
      {
        role: 'regulatory_affairs',
        title: 'Regulatory Review',
        description: 'Review for regulatory compliance'
      },
      {
        role: 'publishing',
        title: 'Publishing Review',
        description: 'Review for eCTD publishing readiness'
      }
    ]
  },
  study_architect: {
    name: 'Clinical Study Document Review',
    description: 'Review process for clinical study documents',
    steps: [
      {
        role: 'clinical_lead',
        title: 'Clinical Review',
        description: 'Review by clinical lead'
      },
      {
        role: 'biostatistician',
        title: 'Statistical Review',
        description: 'Review of statistical aspects'
      },
      {
        role: 'medical_monitor',
        title: 'Medical Monitor Review',
        description: 'Review by medical monitor'
      },
      {
        role: 'regulatory_affairs',
        title: 'Regulatory Review',
        description: 'Review for regulatory compliance'
      }
    ]
  }
};

/**
 * Fetch workflow templates for a specific module type
 * 
 * @param {string} moduleType - Type of module (cmc_wizard, ectd_coauthor, med_device, study_architect)
 * @returns {Promise<Array>} - Array of workflow templates
 */
export async function getWorkflowTemplates(moduleType) {
  try {
    const response = await apiRequest(
      `/api/integration/modules/${moduleType}/templates`,
      { method: 'GET' }
    );
    
    return response.templates || [];
  } catch (error) {
    console.error(`Error fetching workflow templates for ${moduleType}:`, error);
    throw error;
  }
}

/**
 * Create a new workflow template
 * 
 * @param {Object} template - Workflow template details
 * @param {string} template.name - Template name
 * @param {string} template.moduleType - Type of module
 * @param {Array} template.steps - Array of workflow steps
 * @param {string} [template.description] - Optional template description
 * @returns {Promise<Object>} - Created template with ID
 */
export async function createWorkflowTemplate(template) {
  try {
    const response = await apiRequest(
      `/api/integration/templates`,
      {
        method: 'POST',
        body: JSON.stringify(template)
      }
    );
    
    return response;
  } catch (error) {
    console.error('Error creating workflow template:', error);
    throw error;
  }
}

/**
 * Update an existing workflow template
 * 
 * @param {string} templateId - Template ID to update
 * @param {Object} updates - Template updates
 * @param {string} [updates.name] - Updated template name
 * @param {string} [updates.description] - Updated template description
 * @param {Array} [updates.steps] - Updated workflow steps
 * @param {boolean} [updates.isActive] - Updated active status
 * @returns {Promise<Object>} - Updated template
 */
export async function updateWorkflowTemplate(templateId, updates) {
  try {
    const response = await apiRequest(
      `/api/integration/templates/${templateId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updates)
      }
    );
    
    return response;
  } catch (error) {
    console.error(`Error updating workflow template ${templateId}:`, error);
    throw error;
  }
}

/**
 * Delete a workflow template
 * 
 * @param {string} templateId - Template ID to delete
 * @returns {Promise<Object>} - Response
 */
export async function deleteWorkflowTemplate(templateId) {
  try {
    const response = await apiRequest(
      `/api/integration/templates/${templateId}`,
      { method: 'DELETE' }
    );
    
    return response;
  } catch (error) {
    console.error(`Error deleting workflow template ${templateId}:`, error);
    throw error;
  }
}

/**
 * Create default workflow templates for all module types if they don't exist
 * 
 * @returns {Promise<void>}
 */
export async function initializeDefaultWorkflowTemplates() {
  try {
    for (const [moduleType, template] of Object.entries(DEFAULT_WORKFLOW_TEMPLATES)) {
      // Check if templates exist for this module type
      const existingTemplates = await getWorkflowTemplates(moduleType).catch(() => []);
      
      if (existingTemplates.length === 0) {
        // Create default template
        await createWorkflowTemplate({
          ...template,
          moduleType
        });
        
        console.log(`Created default workflow template for ${moduleType}`);
      }
    }
  } catch (error) {
    console.error('Error initializing default workflow templates:', error);
    throw error;
  }
}