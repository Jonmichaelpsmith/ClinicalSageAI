/**
 * Workflow Template Service
 * 
 * This service handles the management of workflow templates, providing standardized
 * approval processes for different document types across various modules.
 */

import { apiRequest } from '@/lib/queryClient';

/**
 * Get workflow templates for a specific module type
 * 
 * @param {string} moduleType - The type of module (510k, cmc, ectd, study, cer)
 * @param {string} organizationId - The organization ID 
 * @returns {Promise<Array>} - List of available workflow templates
 */
export async function getWorkflowTemplates(moduleType, organizationId) {
  const response = await apiRequest({
    url: `/api/module-integration/templates/${moduleType}`,
    method: 'GET',
    params: { organizationId }
  });
  
  return response;
}

/**
 * Get a specific workflow template by ID
 * 
 * @param {string} templateId - The template ID
 * @returns {Promise<Object>} - The workflow template details
 */
export async function getWorkflowTemplate(templateId) {
  const response = await apiRequest({
    url: `/api/module-integration/templates/${templateId}`,
    method: 'GET'
  });
  
  return response;
}

/**
 * Create a new workflow template
 * 
 * @param {Object} templateData - The template data
 * @param {string} organizationId - The organization ID
 * @param {string} userId - The user ID of the creator
 * @returns {Promise<Object>} - The created workflow template
 */
export async function createWorkflowTemplate(templateData, organizationId, userId) {
  // Prepare the data with required fields
  const data = {
    ...templateData,
    organizationId,
    createdBy: userId
  };
  
  const response = await apiRequest({
    url: '/api/module-integration/templates',
    method: 'POST',
    data
  });
  
  return response;
}

/**
 * Update an existing workflow template
 * 
 * @param {string} templateId - The template ID
 * @param {Object} updateData - The data to update
 * @param {string} userId - The user ID making the update
 * @returns {Promise<Object>} - The updated workflow template
 */
export async function updateWorkflowTemplate(templateId, updateData, userId) {
  const data = {
    ...updateData,
    updatedBy: userId
  };
  
  const response = await apiRequest({
    url: `/api/module-integration/templates/${templateId}`,
    method: 'PATCH',
    data
  });
  
  return response;
}

/**
 * Delete a workflow template
 * 
 * @param {string} templateId - The template ID
 * @returns {Promise<boolean>} - Whether the deletion was successful
 */
export async function deleteWorkflowTemplate(templateId) {
  const response = await apiRequest({
    url: `/api/module-integration/templates/${templateId}`,
    method: 'DELETE'
  });
  
  return response.success;
}

/**
 * Start a workflow for a document using a template
 * 
 * @param {string} documentId - The document ID
 * @param {string} templateId - The template ID
 * @param {string} startedBy - The user ID starting the workflow
 * @param {Object} metadata - Additional metadata for the workflow
 * @returns {Promise<Object>} - The created workflow
 */
export async function startWorkflow(documentId, templateId, startedBy, metadata = {}) {
  const response = await apiRequest({
    url: '/api/module-integration/workflows',
    method: 'POST',
    data: {
      documentId,
      templateId,
      startedBy,
      metadata
    }
  });
  
  return response;
}

/**
 * Approve a workflow step
 * 
 * @param {string} approvalId - The approval ID
 * @param {string} userId - The user ID making the approval
 * @param {string} comments - Optional comments
 * @returns {Promise<Object>} - The updated workflow
 */
export async function approveWorkflowStep(approvalId, userId, comments = '') {
  const response = await apiRequest({
    url: '/api/module-integration/approve-step',
    method: 'POST',
    data: {
      approvalId,
      userId,
      comments
    }
  });
  
  return response;
}

/**
 * Reject a workflow step
 * 
 * @param {string} approvalId - The approval ID
 * @param {string} userId - The user ID making the rejection
 * @param {string} comments - Comments explaining the rejection (required)
 * @returns {Promise<Object>} - The updated workflow
 */
export async function rejectWorkflowStep(approvalId, userId, comments) {
  if (!comments) {
    throw new Error('Comments are required when rejecting a workflow step');
  }
  
  const response = await apiRequest({
    url: '/api/module-integration/reject-step',
    method: 'POST',
    data: {
      approvalId,
      userId,
      comments
    }
  });
  
  return response;
}

/**
 * Get all active workflows for documents by organization
 * 
 * @param {string} organizationId - The organization ID
 * @returns {Promise<Array>} - List of active workflows
 */
export async function getActiveWorkflows(organizationId) {
  const response = await apiRequest({
    url: '/api/module-integration/active-workflows',
    method: 'GET',
    params: { organizationId }
  });
  
  return response;
}

/**
 * Get all workflows pending approval by a specific user
 * 
 * @param {string} organizationId - The organization ID
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} - List of workflows pending approval
 */
export async function getPendingApprovals(organizationId, userId) {
  const response = await apiRequest({
    url: '/api/module-integration/pending-approvals',
    method: 'GET',
    params: { organizationId, userId }
  });
  
  return response;
}

/**
 * Get workflow history for a document
 * 
 * @param {string} workflowId - The workflow ID
 * @returns {Promise<Array>} - List of workflow history events
 */
export async function getWorkflowHistory(workflowId) {
  const response = await apiRequest({
    url: `/api/module-integration/workflow-history/${workflowId}`,
    method: 'GET'
  });
  
  return response;
}

/**
 * Get predefined workflow templates based on document type and module
 * 
 * @param {string} documentType - The document type 
 * @param {string} moduleType - The module type
 * @returns {Object} - Predefined workflow template
 */
export function getPredefinedTemplate(documentType, moduleType) {
  // 510(k) templates
  if (moduleType === '510k') {
    switch (documentType) {
      case 'traditional':
        return {
          name: 'Traditional 510(k) Workflow',
          description: 'Standard workflow for Traditional 510(k) submissions',
          moduleType: '510k',
          documentTypes: ['traditional'],
          defaultForTypes: ['traditional'],
          steps: [
            {
              name: 'Initial Review',
              description: 'First level technical review',
              order: 1,
              approverType: 'role',
              approverIds: ['regulatory_specialist'],
              requiredActions: ['review', 'comment']
            },
            {
              name: 'Quality Check',
              description: 'Quality control verification',
              order: 2,
              approverType: 'role',
              approverIds: ['quality_specialist'],
              requiredActions: ['verify', 'comment']
            },
            {
              name: 'Regulatory Review',
              description: 'Regulatory compliance check',
              order: 3,
              approverType: 'role',
              approverIds: ['regulatory_affairs'],
              requiredActions: ['review', 'approve', 'comment']
            },
            {
              name: 'Final Approval',
              description: 'Senior leadership approval',
              order: 4,
              approverType: 'role',
              approverIds: ['director', 'vp_regulatory'],
              requiredActions: ['approve', 'comment']
            }
          ]
        };
        
      case 'abbreviated':
        return {
          name: 'Abbreviated 510(k) Workflow',
          description: 'Streamlined workflow for Abbreviated 510(k) submissions',
          moduleType: '510k',
          documentTypes: ['abbreviated'],
          defaultForTypes: ['abbreviated'],
          steps: [
            {
              name: 'Technical Review',
              description: 'Technical content review',
              order: 1,
              approverType: 'role',
              approverIds: ['regulatory_specialist'],
              requiredActions: ['review', 'comment']
            },
            {
              name: 'Standards Compliance',
              description: 'Verification of standards compliance',
              order: 2,
              approverType: 'role',
              approverIds: ['compliance_specialist'],
              requiredActions: ['verify', 'comment']
            },
            {
              name: 'Final Approval',
              description: 'Final regulatory approval',
              order: 3,
              approverType: 'role',
              approverIds: ['regulatory_affairs'],
              requiredActions: ['approve', 'comment']
            }
          ]
        };
        
      case 'special':
        return {
          name: 'Special 510(k) Workflow',
          description: 'Expedited workflow for Special 510(k) submissions',
          moduleType: '510k',
          documentTypes: ['special'],
          defaultForTypes: ['special'],
          steps: [
            {
              name: 'Modification Review',
              description: 'Review of device modifications',
              order: 1,
              approverType: 'role',
              approverIds: ['regulatory_specialist'],
              requiredActions: ['review', 'comment']
            },
            {
              name: 'Verification and Validation',
              description: 'V&V documentation review',
              order: 2,
              approverType: 'role',
              approverIds: ['verification_specialist'],
              requiredActions: ['verify', 'comment']
            },
            {
              name: 'Final Approval',
              description: 'Final regulatory approval',
              order: 3,
              approverType: 'role',
              approverIds: ['regulatory_affairs'],
              requiredActions: ['approve', 'comment']
            }
          ]
        };
    }
  }
  
  // CER templates
  if (moduleType === 'cer') {
    switch (documentType) {
      case 'clinical_evaluation_report':
        return {
          name: 'CER Review Workflow',
          description: 'Standard workflow for Clinical Evaluation Reports',
          moduleType: 'cer',
          documentTypes: ['clinical_evaluation_report'],
          defaultForTypes: ['clinical_evaluation_report'],
          steps: [
            {
              name: 'Clinical Review',
              description: 'Clinical data evaluation',
              order: 1,
              approverType: 'role',
              approverIds: ['clinical_specialist'],
              requiredActions: ['review', 'comment']
            },
            {
              name: 'Literature Review',
              description: 'Review of literature analysis',
              order: 2,
              approverType: 'role',
              approverIds: ['medical_writer'],
              requiredActions: ['review', 'comment']
            },
            {
              name: 'Medical Expert Review',
              description: 'Expert medical opinion',
              order: 3,
              approverType: 'role',
              approverIds: ['medical_expert'],
              requiredActions: ['validate', 'comment']
            },
            {
              name: 'Regulatory Approval',
              description: 'Regulatory compliance check',
              order: 4,
              approverType: 'role',
              approverIds: ['regulatory_affairs'],
              requiredActions: ['approve', 'comment']
            }
          ]
        };
        
      case 'post_market_surveillance':
        return {
          name: 'PMS Report Workflow',
          description: 'Workflow for Post-Market Surveillance Reports',
          moduleType: 'cer',
          documentTypes: ['post_market_surveillance'],
          defaultForTypes: ['post_market_surveillance'],
          steps: [
            {
              name: 'Data Analysis',
              description: 'Analysis of surveillance data',
              order: 1,
              approverType: 'role',
              approverIds: ['pms_specialist'],
              requiredActions: ['analyze', 'comment']
            },
            {
              name: 'Safety Review',
              description: 'Review of safety implications',
              order: 2,
              approverType: 'role',
              approverIds: ['safety_officer'],
              requiredActions: ['review', 'comment']
            },
            {
              name: 'Final Approval',
              description: 'Management approval',
              order: 3,
              approverType: 'role',
              approverIds: ['quality_manager'],
              requiredActions: ['approve', 'comment']
            }
          ]
        };
    }
  }
  
  // Default template for any document type
  return {
    name: `Standard ${moduleType.toUpperCase()} Workflow`,
    description: `Default workflow for ${moduleType} documents`,
    moduleType,
    documentTypes: [documentType],
    defaultForTypes: [documentType],
    steps: [
      {
        name: 'Initial Review',
        description: 'First level review',
        order: 1,
        approverType: 'role',
        approverIds: ['reviewer'],
        requiredActions: ['review', 'comment']
      },
      {
        name: 'Quality Check',
        description: 'QC verification',
        order: 2,
        approverType: 'role',
        approverIds: ['qc_specialist'],
        requiredActions: ['verify', 'comment']
      },
      {
        name: 'Final Approval',
        description: 'Senior approval',
        order: 3,
        approverType: 'role',
        approverIds: ['manager', 'senior_reviewer'],
        requiredActions: ['approve', 'comment']
      }
    ]
  };
}