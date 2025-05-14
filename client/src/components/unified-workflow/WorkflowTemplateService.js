/**
 * Workflow Template Service
 * 
 * This service provides functions for creating and managing workflow templates
 * in the unified document workflow system.
 */

/**
 * Create default workflow templates for 510(k) module
 * 
 * @param {number} organizationId Organization ID
 * @param {number} userId User ID
 * @returns {Promise<Array>} Created template(s)
 */
export async function createDefault510kTemplates(organizationId, userId) {
  try {
    const response = await fetch('/api/module-integration/create-default-templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organizationId,
        moduleType: '510k',
        createdBy: userId,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create default templates: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating default 510k templates:', error);
    throw error;
  }
}

/**
 * Create default workflow templates for CER module
 * 
 * @param {number} organizationId Organization ID
 * @param {number} userId User ID
 * @returns {Promise<Array>} Created template(s)
 */
export async function createDefaultCERTemplates(organizationId, userId) {
  try {
    const response = await fetch('/api/module-integration/create-default-templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organizationId,
        moduleType: 'cer',
        createdBy: userId,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create default templates: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating default CER templates:', error);
    throw error;
  }
}

/**
 * Get workflow templates for a module
 * 
 * @param {string} moduleType Module type
 * @param {number} organizationId Organization ID
 * @returns {Promise<Array>} List of workflow templates
 */
export async function getWorkflowTemplates(moduleType, organizationId) {
  try {
    const response = await fetch(`/api/module-integration/workflow-templates/${moduleType}?organizationId=${organizationId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch templates: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching workflow templates:', error);
    throw error;
  }
}

/**
 * Create a new workflow template
 * 
 * @param {Object} templateData Template data
 * @returns {Promise<Object>} Created template
 */
export async function createWorkflowTemplate(templateData) {
  try {
    const response = await fetch('/api/module-integration/create-template', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create template: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating workflow template:', error);
    throw error;
  }
}

/**
 * Get document workflows
 * 
 * @param {number} documentId Document ID
 * @returns {Promise<Array>} List of workflows
 */
export async function getDocumentWorkflows(documentId) {
  try {
    const response = await fetch(`/api/module-integration/document-workflows/${documentId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch workflows: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching document workflows:', error);
    throw error;
  }
}

/**
 * Create a workflow for a document
 * 
 * @param {number} documentId Document ID
 * @param {number} templateId Template ID
 * @param {number} startedBy User ID
 * @param {Object} metadata Optional metadata
 * @returns {Promise<Object>} Created workflow
 */
export async function createDocumentWorkflow(documentId, templateId, startedBy, metadata = {}) {
  try {
    const response = await fetch('/api/module-integration/create-workflow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentId,
        templateId,
        startedBy,
        metadata
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create workflow: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating document workflow:', error);
    throw error;
  }
}

/**
 * Approve a workflow step
 * 
 * @param {number} approvalId Approval ID
 * @param {number} userId User ID
 * @param {string} comments Optional comments
 * @returns {Promise<Object>} Approval result
 */
export async function approveWorkflowStep(approvalId, userId, comments = '') {
  try {
    const response = await fetch('/api/module-integration/approve-step', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        approvalId,
        userId,
        comments
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to approve step: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error approving workflow step:', error);
    throw error;
  }
}

/**
 * Reject a workflow step
 * 
 * @param {number} approvalId Approval ID
 * @param {number} userId User ID
 * @param {string} comments Required comments
 * @returns {Promise<Object>} Rejection result
 */
export async function rejectWorkflowStep(approvalId, userId, comments) {
  if (!comments || comments.trim() === '') {
    throw new Error('Comments are required for rejection');
  }
  
  try {
    const response = await fetch('/api/module-integration/reject-step', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        approvalId,
        userId,
        comments
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to reject step: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error rejecting workflow step:', error);
    throw error;
  }
}