/**
 * Workflow Template Service
 * 
 * This utility provides functions to interact with workflow templates
 * and workflow processes in a unified way across different modules.
 */

/**
 * Get available workflow templates for an organization and module
 * 
 * @param {number} organizationId - The organization ID
 * @param {string} moduleType - The module type (cer, medical_device, cmc, study, ectd, vault)
 * @returns {Promise<Array>} - Array of workflow templates
 */
export async function getWorkflowTemplates(organizationId, moduleType) {
  try {
    if (!organizationId || !moduleType) {
      throw new Error('Missing required parameters for getting workflow templates');
    }
    
    // Call the API to get available workflow templates
    const response = await fetch(`/api/module-integration/workflow-templates?organizationId=${organizationId}&moduleType=${moduleType}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to retrieve workflow templates');
    }
    
    const data = await response.json();
    
    // If no templates are found, return dummy templates for testing purposes
    if (!data || !data.templates || data.templates.length === 0) {
      return getDummyWorkflowTemplates(moduleType);
    }
    
    return data.templates;
    
  } catch (error) {
    console.error('Error getting workflow templates:', error);
    // Return dummy templates for testing purposes
    return getDummyWorkflowTemplates(moduleType);
  }
}

/**
 * Get a specific workflow template by ID
 * 
 * @param {string|number} templateId - The template ID
 * @returns {Promise<Object>} - The workflow template
 */
export async function getWorkflowTemplateById(templateId) {
  try {
    if (!templateId) {
      throw new Error('Template ID is required');
    }
    
    // Call the API to get the template
    const response = await fetch(`/api/module-integration/workflow-template/${templateId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to retrieve workflow template');
    }
    
    const data = await response.json();
    return data.template;
    
  } catch (error) {
    console.error('Error getting workflow template by ID:', error);
    throw error;
  }
}

/**
 * Create a new workflow template
 * 
 * @param {number} organizationId - The organization ID
 * @param {string} moduleType - The module type
 * @param {Object} templateData - The template data
 * @returns {Promise<Object>} - The created workflow template
 */
export async function createWorkflowTemplate(organizationId, moduleType, templateData) {
  try {
    if (!organizationId || !moduleType || !templateData) {
      throw new Error('Missing required parameters for creating workflow template');
    }
    
    // Ensure the template data has required fields
    const template = {
      name: templateData.name || 'New Workflow Template',
      description: templateData.description || '',
      ...templateData
    };
    
    // Call the API to create the template
    const response = await fetch('/api/module-integration/create-workflow-template', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        organizationId,
        moduleType,
        template
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create workflow template');
    }
    
    const data = await response.json();
    return data.template;
    
  } catch (error) {
    console.error('Error creating workflow template:', error);
    throw error;
  }
}

/**
 * Update an existing workflow template
 * 
 * @param {string|number} templateId - The template ID
 * @param {Object} updates - The updates to apply
 * @returns {Promise<Object>} - The updated workflow template
 */
export async function updateWorkflowTemplate(templateId, updates) {
  try {
    if (!templateId || !updates) {
      throw new Error('Missing required parameters for updating workflow template');
    }
    
    // Call the API to update the template
    const response = await fetch(`/api/module-integration/update-workflow-template/${templateId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        updates
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update workflow template');
    }
    
    const data = await response.json();
    return data.template;
    
  } catch (error) {
    console.error('Error updating workflow template:', error);
    throw error;
  }
}

/**
 * Delete a workflow template
 * 
 * @param {string|number} templateId - The template ID
 * @returns {Promise<boolean>} - Success indicator
 */
export async function deleteWorkflowTemplate(templateId) {
  try {
    if (!templateId) {
      throw new Error('Template ID is required');
    }
    
    // Call the API to delete the template
    const response = await fetch(`/api/module-integration/delete-workflow-template/${templateId}`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete workflow template');
    }
    
    return true;
    
  } catch (error) {
    console.error('Error deleting workflow template:', error);
    throw error;
  }
}

/**
 * Get workflow templates specifically for document approvals
 * 
 * @param {number} organizationId - The organization ID
 * @param {string} documentType - The document type
 * @returns {Promise<Array>} - Array of approval workflow templates
 */
export async function getApprovalWorkflowTemplates(organizationId, documentType) {
  try {
    if (!organizationId || !documentType) {
      throw new Error('Missing required parameters for getting approval workflow templates');
    }
    
    // Call the API to get approval workflow templates
    const response = await fetch(`/api/module-integration/approval-workflow-templates?organizationId=${organizationId}&documentType=${documentType}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to retrieve approval workflow templates');
    }
    
    const data = await response.json();
    
    // If no templates are found, return dummy templates for testing
    if (!data || !data.templates || data.templates.length === 0) {
      return getDummyApprovalWorkflowTemplates(documentType);
    }
    
    return data.templates;
    
  } catch (error) {
    console.error('Error getting approval workflow templates:', error);
    // Return dummy templates for testing
    return getDummyApprovalWorkflowTemplates(documentType);
  }
}

// Helper function to get dummy workflow templates for testing
function getDummyWorkflowTemplates(moduleType) {
  const standardTemplates = [
    {
      id: 'standard',
      name: 'Standard Review Process',
      description: 'Standard document review and approval process with sequential approvals.',
      stages: [
        { name: 'Initial Review', role: 'author', status: 'active' },
        { name: 'Technical Review', role: 'technical_reviewer', status: 'pending' },
        { name: 'Quality Review', role: 'quality_reviewer', status: 'pending' },
        { name: 'Final Approval', role: 'approver', status: 'pending' }
      ]
    },
    {
      id: 'expedited',
      name: 'Expedited Review Process',
      description: 'Expedited review process for time-sensitive documents with parallel reviews.',
      stages: [
        { name: 'Initial Review', role: 'author', status: 'active' },
        { name: 'Combined Review', role: 'combined_reviewer', status: 'pending' },
        { name: 'Final Approval', role: 'approver', status: 'pending' }
      ]
    }
  ];
  
  // Add module-specific templates
  switch (moduleType) {
    case 'medical_device':
      return [
        ...standardTemplates,
        {
          id: '510k-special',
          name: '510(k) Full Review Process',
          description: 'Comprehensive review process for 510(k) submissions with regulatory focus.',
          stages: [
            { name: 'Document Preparation', role: 'author', status: 'active' },
            { name: 'Technical Review', role: 'technical_reviewer', status: 'pending' },
            { name: 'Regulatory Review', role: 'regulatory_reviewer', status: 'pending' },
            { name: 'Quality Review', role: 'quality_reviewer', status: 'pending' },
            { name: 'Final Approval', role: 'approver', status: 'pending' }
          ]
        }
      ];
    case 'cer':
      return [
        ...standardTemplates,
        {
          id: 'cer-extended',
          name: 'Extended CER Review Process',
          description: 'Extended review process for clinical evaluation reports with clinical validation.',
          stages: [
            { name: 'Document Preparation', role: 'author', status: 'active' },
            { name: 'Clinical Review', role: 'clinical_reviewer', status: 'pending' },
            { name: 'Technical Review', role: 'technical_reviewer', status: 'pending' },
            { name: 'Quality Review', role: 'quality_reviewer', status: 'pending' },
            { name: 'Final Approval', role: 'approver', status: 'pending' }
          ]
        }
      ];
    default:
      return standardTemplates;
  }
}

// Helper function to get dummy approval workflow templates for testing
function getDummyApprovalWorkflowTemplates(documentType) {
  return [
    {
      id: 'sequential',
      name: 'Sequential Approval',
      description: 'Approvals happen in a specific sequence',
      approvalSteps: [
        { role: 'author', order: 1 },
        { role: 'reviewer', order: 2 },
        { role: 'approver', order: 3 }
      ]
    },
    {
      id: 'parallel',
      name: 'Parallel Approval',
      description: 'Approvals can happen simultaneously',
      approvalSteps: [
        { role: 'author', order: 1 },
        { role: 'reviewer', order: 2, parallel: true },
        { role: 'approver', order: 3 }
      ]
    }
  ];
}

/**
 * Get active workflows for an organization and user
 * 
 * @param {number} organizationId - The organization ID
 * @param {number} userId - The user ID
 * @param {string} moduleType - Optional module type filter
 * @returns {Promise<Array>} - Array of active workflows
 */
export async function getActiveWorkflows(organizationId, userId, moduleType = null) {
  try {
    if (!organizationId || !userId) {
      throw new Error('Missing required parameters for getting active workflows');
    }
    
    let url = `/api/module-integration/active-workflows?organizationId=${organizationId}&userId=${userId}`;
    if (moduleType) {
      url += `&moduleType=${moduleType}`;
    }
    
    // Call the API to get active workflows
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to retrieve active workflows');
    }
    
    const data = await response.json();
    
    // If no workflows are found, return empty array or dummy data for testing
    if (!data || !data.workflows || data.workflows.length === 0) {
      return getDummyActiveWorkflows(moduleType);
    }
    
    return data.workflows;
    
  } catch (error) {
    console.error('Error getting active workflows:', error);
    // Return dummy data for testing
    return getDummyActiveWorkflows(moduleType);
  }
}

/**
 * Get pending approvals for a user
 * 
 * @param {number} organizationId - The organization ID
 * @param {number} userId - The user ID
 * @param {string} moduleType - Optional module type filter
 * @returns {Promise<Array>} - Array of pending approvals
 */
export async function getPendingApprovals(organizationId, userId, moduleType = null) {
  try {
    if (!organizationId || !userId) {
      throw new Error('Missing required parameters for getting pending approvals');
    }
    
    let url = `/api/module-integration/pending-approvals?organizationId=${organizationId}&userId=${userId}`;
    if (moduleType) {
      url += `&moduleType=${moduleType}`;
    }
    
    // Call the API to get pending approvals
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to retrieve pending approvals');
    }
    
    const data = await response.json();
    
    // If no approvals are found, return empty array or dummy data for testing
    if (!data || !data.approvals || data.approvals.length === 0) {
      return getDummyPendingApprovals(moduleType);
    }
    
    return data.approvals;
    
  } catch (error) {
    console.error('Error getting pending approvals:', error);
    // Return dummy data for testing
    return getDummyPendingApprovals(moduleType);
  }
}

/**
 * Get workflow history for a document
 * 
 * @param {number|string} documentId - The document ID
 * @returns {Promise<Array>} - Array of workflow history entries
 */
export async function getWorkflowHistory(documentId) {
  try {
    if (!documentId) {
      throw new Error('Document ID is required for getting workflow history');
    }
    
    // Call the API to get workflow history
    const response = await fetch(`/api/module-integration/workflow-history/${documentId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to retrieve workflow history');
    }
    
    const data = await response.json();
    
    // If no history is found, return empty array or dummy data for testing
    if (!data || !data.history || data.history.length === 0) {
      return getDummyWorkflowHistory();
    }
    
    return data.history;
    
  } catch (error) {
    console.error('Error getting workflow history:', error);
    // Return dummy data for testing
    return getDummyWorkflowHistory();
  }
}

/**
 * Approve a workflow step
 * 
 * @param {number|string} workflowStepId - The workflow step ID
 * @param {number} userId - The user ID approving the step
 * @param {string} comments - Optional comments for the approval
 * @returns {Promise<Object>} - Updated workflow data
 */
export async function approveWorkflowStep(workflowStepId, userId, comments = '') {
  try {
    if (!workflowStepId || !userId) {
      throw new Error('Missing required parameters for approving workflow step');
    }
    
    // Call the API to approve the workflow step
    const response = await fetch('/api/module-integration/approve-workflow-step', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workflowStepId,
        userId,
        comments
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to approve workflow step');
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error approving workflow step:', error);
    throw error;
  }
}

/**
 * Reject a workflow step
 * 
 * @param {number|string} workflowStepId - The workflow step ID
 * @param {number} userId - The user ID rejecting the step
 * @param {string} reason - Reason for the rejection
 * @returns {Promise<Object>} - Updated workflow data
 */
export async function rejectWorkflowStep(workflowStepId, userId, reason) {
  try {
    if (!workflowStepId || !userId || !reason) {
      throw new Error('Missing required parameters for rejecting workflow step');
    }
    
    // Call the API to reject the workflow step
    const response = await fetch('/api/module-integration/reject-workflow-step', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workflowStepId,
        userId,
        reason
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to reject workflow step');
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error rejecting workflow step:', error);
    throw error;
  }
}

/**
 * Start a workflow for a document
 * 
 * @param {number|string} documentId - The document ID
 * @param {number|string} workflowTemplateId - The workflow template ID
 * @param {number} userId - The user ID starting the workflow
 * @returns {Promise<Object>} - Started workflow data
 */
export async function startWorkflow(documentId, workflowTemplateId, userId) {
  try {
    if (!documentId || !workflowTemplateId || !userId) {
      throw new Error('Missing required parameters for starting workflow');
    }
    
    // Call the API to start the workflow
    const response = await fetch('/api/module-integration/start-workflow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        documentId,
        workflowTemplateId,
        userId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to start workflow');
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error starting workflow:', error);
    throw error;
  }
}

// Helper function to get dummy active workflows for testing
function getDummyActiveWorkflows(moduleType) {
  const baseWorkflows = [
    {
      id: 'wf-1',
      documentId: 'doc-123',
      documentTitle: 'Standard Regulatory Report',
      moduleType: moduleType || 'cer',
      currentStage: 'Technical Review',
      status: 'in-progress',
      startedAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      nextAction: {
        role: 'technical_reviewer',
        action: 'review'
      }
    },
    {
      id: 'wf-2',
      documentId: 'doc-456',
      documentTitle: 'Annual Update Report',
      moduleType: moduleType || 'cer',
      currentStage: 'Quality Review',
      status: 'in-progress',
      startedAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 43200000).toISOString(),
      nextAction: {
        role: 'quality_reviewer',
        action: 'review'
      }
    }
  ];
  
  // Add module-specific workflows
  if (moduleType === 'medical_device') {
    return [
      ...baseWorkflows,
      {
        id: 'wf-3',
        documentId: 'doc-789',
        documentTitle: '510(k) Submission Draft',
        moduleType: 'medical_device',
        currentStage: 'Regulatory Review',
        status: 'in-progress',
        startedAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        nextAction: {
          role: 'regulatory_reviewer',
          action: 'review'
        }
      }
    ];
  }
  
  return baseWorkflows;
}

// Helper function to get dummy pending approvals for testing
function getDummyPendingApprovals(moduleType) {
  const baseApprovals = [
    {
      id: 'approval-1',
      documentId: 'doc-987',
      documentTitle: 'Clinical Evaluation Report',
      moduleType: 'cer',
      approvalStage: 'Technical Review',
      assignedAt: new Date(Date.now() - 43200000).toISOString(),
      dueBy: new Date(Date.now() + 86400000).toISOString(),
      priority: 'medium'
    },
    {
      id: 'approval-2',
      documentId: 'doc-654',
      documentTitle: 'Post-Market Surveillance Report',
      moduleType: 'cer',
      approvalStage: 'Final Approval',
      assignedAt: new Date(Date.now() - 86400000).toISOString(),
      dueBy: new Date(Date.now() + 43200000).toISOString(),
      priority: 'high'
    }
  ];
  
  // Add module-specific approvals
  if (moduleType === 'medical_device') {
    return [
      ...baseApprovals,
      {
        id: 'approval-3',
        documentId: 'doc-321',
        documentTitle: '510(k) Performance Testing Summary',
        moduleType: 'medical_device',
        approvalStage: 'Regulatory Review',
        assignedAt: new Date(Date.now() - 172800000).toISOString(),
        dueBy: new Date(Date.now() + 86400000).toISOString(),
        priority: 'high'
      }
    ];
  }
  
  return baseApprovals;
}

// Helper function to get dummy workflow history for testing
function getDummyWorkflowHistory() {
  return [
    {
      id: 'history-1',
      documentId: 'doc-123',
      stage: 'Document Creation',
      action: 'created',
      status: 'completed',
      actor: {
        id: 1,
        name: 'John Doe',
        role: 'author'
      },
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      comments: 'Initial document creation'
    },
    {
      id: 'history-2',
      documentId: 'doc-123',
      stage: 'Initial Review',
      action: 'submitted',
      status: 'completed',
      actor: {
        id: 1,
        name: 'John Doe',
        role: 'author'
      },
      timestamp: new Date(Date.now() - 43200000).toISOString(),
      comments: 'Submitted for technical review'
    },
    {
      id: 'history-3',
      documentId: 'doc-123',
      stage: 'Technical Review',
      action: 'in-progress',
      status: 'active',
      actor: {
        id: 2,
        name: 'Jane Smith',
        role: 'technical_reviewer'
      },
      timestamp: new Date(Date.now() - 21600000).toISOString(),
      comments: 'Technical review in progress'
    }
  ];
}