/**
 * Unified Workflow Service
 * 
 * This service provides a centralized workflow engine across all TrialSage modules,
 * ensuring consistent process management, task tracking, and approval workflows.
 * It coordinates cross-module activities and maintains workflow state for optimal
 * user experience across the platform.
 */

// Workflow status constants
export const WORKFLOW_STATUS = {
  NOT_STARTED: 'not-started',
  IN_PROGRESS: 'in-progress',
  PENDING_APPROVAL: 'pending-approval',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  ON_HOLD: 'on-hold'
};

// Workflow task priority
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Workflow types
export const WORKFLOW_TYPES = {
  IND_SUBMISSION: 'ind-submission',
  PROTOCOL_DEVELOPMENT: 'protocol-development',
  CSR_PREPARATION: 'csr-preparation',
  CMC_DOCUMENTATION: 'cmc-documentation',
  REGULATORY_SUBMISSION: 'regulatory-submission',
  DOCUMENT_REVIEW: 'document-review',
  DOCUMENT_APPROVAL: 'document-approval',
  CUSTOM: 'custom'
};

class WorkflowService {
  constructor() {
    this.apiBase = '/api/workflows';
    this.workflowListeners = new Map();
    this.activeWorkflows = new Map();
    this.taskListeners = new Map();
  }

  /**
   * Get a workflow by ID
   * @param {string} workflowId - The workflow ID
   * @returns {Promise<Object>} - The workflow data
   */
  async getWorkflow(workflowId) {
    try {
      const response = await fetch(`${this.apiBase}/${workflowId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch workflow: ${response.statusText}`);
      }
      
      const workflow = await response.json();
      this.activeWorkflows.set(workflowId, workflow);
      return workflow;
    } catch (error) {
      console.error('Error fetching workflow:', error);
      throw error;
    }
  }

  /**
   * Get workflows by project
   * @param {string} projectId - The project ID
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} - List of workflows
   */
  async getWorkflowsByProject(projectId, options = {}) {
    const queryParams = new URLSearchParams({
      projectId,
      ...options
    }).toString();

    try {
      const response = await fetch(`${this.apiBase}?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch project workflows: ${response.statusText}`);
      }
      
      const workflows = await response.json();
      workflows.forEach(workflow => {
        this.activeWorkflows.set(workflow.id, workflow);
      });
      
      return workflows;
    } catch (error) {
      console.error('Error fetching project workflows:', error);
      throw error;
    }
  }

  /**
   * Create a new workflow
   * @param {Object} workflowConfig - Workflow configuration
   * @returns {Promise<Object>} - The created workflow
   */
  async createWorkflow(workflowConfig) {
    try {
      const response = await fetch(this.apiBase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workflowConfig)
      });

      if (!response.ok) {
        throw new Error(`Failed to create workflow: ${response.statusText}`);
      }

      const workflow = await response.json();
      this.activeWorkflows.set(workflow.id, workflow);
      this._notifyWorkflowListeners('create', workflow);
      return workflow;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  }

  /**
   * Update a workflow
   * @param {string} workflowId - The workflow ID
   * @param {Object} updates - The updates to apply
   * @returns {Promise<Object>} - The updated workflow
   */
  async updateWorkflow(workflowId, updates) {
    try {
      const response = await fetch(`${this.apiBase}/${workflowId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update workflow: ${response.statusText}`);
      }

      const workflow = await response.json();
      this.activeWorkflows.set(workflowId, workflow);
      this._notifyWorkflowListeners('update', workflow);
      return workflow;
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw error;
    }
  }

  /**
   * Start a workflow
   * @param {string} workflowId - The workflow ID
   * @returns {Promise<Object>} - The started workflow
   */
  async startWorkflow(workflowId) {
    try {
      const response = await fetch(`${this.apiBase}/${workflowId}/start`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Failed to start workflow: ${response.statusText}`);
      }

      const workflow = await response.json();
      this.activeWorkflows.set(workflowId, workflow);
      this._notifyWorkflowListeners('start', workflow);
      return workflow;
    } catch (error) {
      console.error('Error starting workflow:', error);
      throw error;
    }
  }

  /**
   * Complete a workflow
   * @param {string} workflowId - The workflow ID
   * @param {Object} completionData - Data to submit with completion
   * @returns {Promise<Object>} - The completed workflow
   */
  async completeWorkflow(workflowId, completionData = {}) {
    try {
      const response = await fetch(`${this.apiBase}/${workflowId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(completionData)
      });

      if (!response.ok) {
        throw new Error(`Failed to complete workflow: ${response.statusText}`);
      }

      const workflow = await response.json();
      this.activeWorkflows.set(workflowId, workflow);
      this._notifyWorkflowListeners('complete', workflow);
      return workflow;
    } catch (error) {
      console.error('Error completing workflow:', error);
      throw error;
    }
  }

  /**
   * Cancel a workflow
   * @param {string} workflowId - The workflow ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} - The cancelled workflow
   */
  async cancelWorkflow(workflowId, reason = '') {
    try {
      const response = await fetch(`${this.apiBase}/${workflowId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel workflow: ${response.statusText}`);
      }

      const workflow = await response.json();
      this.activeWorkflows.set(workflowId, workflow);
      this._notifyWorkflowListeners('cancel', workflow);
      return workflow;
    } catch (error) {
      console.error('Error cancelling workflow:', error);
      throw error;
    }
  }

  /**
   * Get workflow tasks
   * @param {string} workflowId - The workflow ID
   * @returns {Promise<Array>} - List of workflow tasks
   */
  async getWorkflowTasks(workflowId) {
    try {
      const response = await fetch(`${this.apiBase}/${workflowId}/tasks`);
      if (!response.ok) {
        throw new Error(`Failed to fetch workflow tasks: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching workflow tasks:', error);
      throw error;
    }
  }

  /**
   * Create a workflow task
   * @param {string} workflowId - The workflow ID
   * @param {Object} taskData - Task data
   * @returns {Promise<Object>} - The created task
   */
  async createTask(workflowId, taskData) {
    try {
      const response = await fetch(`${this.apiBase}/${workflowId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create task: ${response.statusText}`);
      }

      const task = await response.json();
      this._notifyTaskListeners('create', workflowId, task);
      return task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Update a workflow task
   * @param {string} workflowId - The workflow ID
   * @param {string} taskId - The task ID
   * @param {Object} updates - The updates to apply
   * @returns {Promise<Object>} - The updated task
   */
  async updateTask(workflowId, taskId, updates) {
    try {
      const response = await fetch(`${this.apiBase}/${workflowId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.statusText}`);
      }

      const task = await response.json();
      this._notifyTaskListeners('update', workflowId, task);
      return task;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Complete a workflow task
   * @param {string} workflowId - The workflow ID
   * @param {string} taskId - The task ID
   * @param {Object} completionData - Data to submit with completion
   * @returns {Promise<Object>} - The completed task
   */
  async completeTask(workflowId, taskId, completionData = {}) {
    try {
      const response = await fetch(`${this.apiBase}/${workflowId}/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(completionData)
      });

      if (!response.ok) {
        throw new Error(`Failed to complete task: ${response.statusText}`);
      }

      const task = await response.json();
      this._notifyTaskListeners('complete', workflowId, task);
      
      // If this task may have changed the workflow state, refresh the workflow
      this.getWorkflow(workflowId).catch(error => {
        console.error('Error refreshing workflow after task completion:', error);
      });
      
      return task;
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  }

  /**
   * Assign a task to a user
   * @param {string} workflowId - The workflow ID
   * @param {string} taskId - The task ID
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} - The assigned task
   */
  async assignTask(workflowId, taskId, userId) {
    try {
      const response = await fetch(`${this.apiBase}/${workflowId}/tasks/${taskId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error(`Failed to assign task: ${response.statusText}`);
      }

      const task = await response.json();
      this._notifyTaskListeners('assign', workflowId, task);
      return task;
    } catch (error) {
      console.error('Error assigning task:', error);
      throw error;
    }
  }

  /**
   * Get workflow history
   * @param {string} workflowId - The workflow ID
   * @returns {Promise<Array>} - List of workflow history events
   */
  async getWorkflowHistory(workflowId) {
    try {
      const response = await fetch(`${this.apiBase}/${workflowId}/history`);
      if (!response.ok) {
        throw new Error(`Failed to fetch workflow history: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching workflow history:', error);
      throw error;
    }
  }

  /**
   * Get workflow templates
   * @param {string} category - Template category
   * @returns {Promise<Array>} - List of workflow templates
   */
  async getWorkflowTemplates(category) {
    const queryParams = category ? `?category=${category}` : '';
    
    try {
      const response = await fetch(`${this.apiBase}/templates${queryParams}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch workflow templates: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching workflow templates:', error);
      throw error;
    }
  }

  /**
   * Create workflow from template
   * @param {string} templateId - The template ID
   * @param {Object} workflowData - Initial workflow data
   * @returns {Promise<Object>} - The created workflow
   */
  async createFromTemplate(templateId, workflowData) {
    try {
      const response = await fetch(`${this.apiBase}/templates/${templateId}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workflowData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create workflow from template: ${response.statusText}`);
      }

      const workflow = await response.json();
      this.activeWorkflows.set(workflow.id, workflow);
      this._notifyWorkflowListeners('create', workflow);
      return workflow;
    } catch (error) {
      console.error('Error creating workflow from template:', error);
      throw error;
    }
  }

  /**
   * Get user's assigned tasks
   * @param {string} userId - The user ID
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} - List of assigned tasks
   */
  async getUserTasks(userId, options = {}) {
    const queryParams = new URLSearchParams({
      userId,
      ...options
    }).toString();

    try {
      const response = await fetch(`${this.apiBase}/tasks/assigned?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch user tasks: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      throw error;
    }
  }

  /**
   * Get cross-module workflow status
   * @param {string} projectId - The project ID
   * @returns {Promise<Object>} - Cross-module workflow status
   */
  async getCrossModuleStatus(projectId) {
    try {
      const response = await fetch(`${this.apiBase}/status/cross-module/${projectId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch cross-module status: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching cross-module status:', error);
      throw error;
    }
  }

  /**
   * Start approval process for a document
   * @param {string} documentId - The document ID
   * @param {Object} approvalConfig - Approval process configuration
   * @returns {Promise<Object>} - The created approval workflow
   */
  async startApprovalProcess(documentId, approvalConfig) {
    try {
      const response = await fetch(`${this.apiBase}/approvals/documents/${documentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(approvalConfig)
      });

      if (!response.ok) {
        throw new Error(`Failed to start approval process: ${response.statusText}`);
      }

      const workflow = await response.json();
      this.activeWorkflows.set(workflow.id, workflow);
      this._notifyWorkflowListeners('create', workflow);
      return workflow;
    } catch (error) {
      console.error('Error starting approval process:', error);
      throw error;
    }
  }

  /**
   * Review a document in approval workflow
   * @param {string} workflowId - The workflow ID
   * @param {string} reviewerId - The reviewer ID
   * @param {Object} reviewData - The review data
   * @returns {Promise<Object>} - The updated workflow
   */
  async reviewDocument(workflowId, reviewerId, reviewData) {
    try {
      const response = await fetch(`${this.apiBase}/${workflowId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reviewerId,
          ...reviewData
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to submit review: ${response.statusText}`);
      }

      const workflow = await response.json();
      this.activeWorkflows.set(workflowId, workflow);
      this._notifyWorkflowListeners('update', workflow);
      return workflow;
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  }

  /**
   * Subscribe to workflow events
   * @param {string} eventType - The event type (create, update, start, complete, cancel)
   * @param {Function} callback - The callback function
   * @returns {string} - Subscription ID for unsubscribing
   */
  subscribeToWorkflowEvents(eventType, callback) {
    const subscriptionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    if (!this.workflowListeners.has(eventType)) {
      this.workflowListeners.set(eventType, new Map());
    }
    
    this.workflowListeners.get(eventType).set(subscriptionId, callback);
    return subscriptionId;
  }

  /**
   * Unsubscribe from workflow events
   * @param {string} eventType - The event type
   * @param {string} subscriptionId - The subscription ID
   */
  unsubscribeFromWorkflowEvents(eventType, subscriptionId) {
    if (this.workflowListeners.has(eventType)) {
      this.workflowListeners.get(eventType).delete(subscriptionId);
    }
  }

  /**
   * Subscribe to task events
   * @param {string} eventType - The event type (create, update, complete, assign)
   * @param {string} workflowId - The workflow ID
   * @param {Function} callback - The callback function
   * @returns {string} - Subscription ID for unsubscribing
   */
  subscribeToTaskEvents(eventType, workflowId, callback) {
    const key = `${workflowId}:${eventType}`;
    const subscriptionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    if (!this.taskListeners.has(key)) {
      this.taskListeners.set(key, new Map());
    }
    
    this.taskListeners.get(key).set(subscriptionId, callback);
    return subscriptionId;
  }

  /**
   * Unsubscribe from task events
   * @param {string} eventType - The event type
   * @param {string} workflowId - The workflow ID
   * @param {string} subscriptionId - The subscription ID
   */
  unsubscribeFromTaskEvents(eventType, workflowId, subscriptionId) {
    const key = `${workflowId}:${eventType}`;
    if (this.taskListeners.has(key)) {
      this.taskListeners.get(key).delete(subscriptionId);
    }
  }

  /**
   * Notify workflow event listeners
   * @param {string} eventType - The event type
   * @param {Object} workflow - The workflow data
   * @private
   */
  _notifyWorkflowListeners(eventType, workflow) {
    if (this.workflowListeners.has(eventType)) {
      this.workflowListeners.get(eventType).forEach(callback => {
        try {
          callback(workflow);
        } catch (error) {
          console.error(`Error in workflow ${eventType} listener:`, error);
        }
      });
    }
  }

  /**
   * Notify task event listeners
   * @param {string} eventType - The event type
   * @param {string} workflowId - The workflow ID
   * @param {Object} task - The task data
   * @private
   */
  _notifyTaskListeners(eventType, workflowId, task) {
    const key = `${workflowId}:${eventType}`;
    if (this.taskListeners.has(key)) {
      this.taskListeners.get(key).forEach(callback => {
        try {
          callback(task);
        } catch (error) {
          console.error(`Error in task ${eventType} listener:`, error);
        }
      });
    }
  }
}

// Create singleton instance
const workflowService = new WorkflowService();
export default workflowService;