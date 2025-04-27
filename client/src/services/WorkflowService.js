/**
 * Workflow Service
 * 
 * This service provides cross-module workflow automation and orchestration
 * for the TrialSage platform. It enables seamless business process workflows
 * across all platform modules and ensures consistent workflow management
 * throughout the regulatory lifecycle.
 * 
 * Features:
 * - Cross-module workflow automation
 * - Configurable workflow templates and steps
 * - Dynamic task routing and assignment
 * - Parallel and sequential workflow execution
 * - Approval and review processes
 * - SLA monitoring and alerts
 * - Integration with blockchain for audit trails
 */

import regulatoryIntelligenceCore from './RegulatoryIntelligenceCore';
import docuShareService from './DocuShareService';

const API_BASE = '/api/workflow';

/**
 * Workflow states
 */
export const WORKFLOW_STATES = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  FAILED: 'failed'
};

/**
 * Task states
 */
export const TASK_STATES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
  WAITING: 'waiting'
};

/**
 * Task priority levels
 */
export const TASK_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical'
};

/**
 * Workflow types
 */
export const WORKFLOW_TYPES = {
  DOCUMENT_REVIEW: 'document_review',
  SUBMISSION_PREPARATION: 'submission_preparation',
  PROTOCOL_APPROVAL: 'protocol_approval',
  STUDY_SETUP: 'study_setup',
  REGULATORY_RESPONSE: 'regulatory_response',
  CMC_REVIEW: 'cmc_review',
  CUSTOM: 'custom'
};

/**
 * Trigger types
 */
export const TRIGGER_TYPES = {
  EVENT: 'event',
  SCHEDULE: 'schedule',
  MANUAL: 'manual',
  CONDITION: 'condition',
  API: 'api'
};

class WorkflowService {
  constructor() {
    this.currentUser = null;
    this.activeWorkflows = new Map();
    this.workflowListeners = new Map();
    this.taskListeners = new Map();
    this.lastSyncTimestamp = null;
    this.workflowTemplates = {};
    this.userTasks = [];
    this.moduleIntegrations = {
      'ind-wizard': true,
      'csr-intelligence': true,
      'trial-vault': true,
      'study-architect': true,
      'ich-wiz': true,
      'clinical-metadata': true,
      'analytics': true
    };
  }

  /**
   * Initialize Workflow service
   * @param {Object} options - Initialization options
   * @returns {Promise<Object>} - Initialization status
   */
  async initialize(options = {}) {
    try {
      const response = await fetch(`${API_BASE}/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
      });

      if (!response.ok) {
        throw new Error(`Failed to initialize Workflow service: ${response.statusText}`);
      }

      const initStatus = await response.json();
      this.currentUser = initStatus.currentUser;
      this.lastSyncTimestamp = new Date().toISOString();
      this.workflowTemplates = initStatus.workflowTemplates || {};
      
      // Load user tasks
      if (this.currentUser) {
        this.userTasks = await this.getUserTasks();
      }
      
      // Setup real-time connections if WebSockets available
      if (initStatus.socketEnabled) {
        this._setupRealtimeConnections();
      }
      
      // Initialize other services if needed
      if (options.enableBlockchain !== false) {
        await regulatoryIntelligenceCore.initialize({ enableBlockchain: true });
      }
      
      return initStatus;
    } catch (error) {
      console.error('Error initializing Workflow service:', error);
      throw error;
    }
  }

  /**
   * Setup real-time connections for workflow updates
   * @private
   */
  _setupRealtimeConnections() {
    if (typeof window === 'undefined') return;
    
    // Setup WebSocket for real-time updates
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws-workflow`;
    
    try {
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = () => {
        console.log('Workflow WebSocket connection established');
        this.socket.send(JSON.stringify({
          type: 'authenticate',
          userId: this.currentUser?.id
        }));
      };
      
      this.socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'workflow_update':
            this._handleWorkflowUpdate(message.data);
            break;
          case 'task_update':
            this._handleTaskUpdate(message.data);
            break;
          case 'task_assigned':
            this._handleTaskAssigned(message.data);
            break;
          case 'workflow_completed':
            this._handleWorkflowCompleted(message.data);
            break;
        }
      };
      
      this.socket.onerror = (error) => {
        console.error('Workflow WebSocket error:', error);
      };
      
      this.socket.onclose = () => {
        console.log('Workflow WebSocket connection closed');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this._setupRealtimeConnections(), 5000);
      };
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
    }
  }
  
  /**
   * Handle real-time workflow updates
   * @param {Object} data - Workflow update data
   * @private
   */
  _handleWorkflowUpdate(data) {
    // Update active workflow if tracked
    if (this.activeWorkflows.has(data.workflowId)) {
      const workflow = this.activeWorkflows.get(data.workflowId);
      
      // Update workflow with new data
      Object.assign(workflow, data.updates);
      workflow.lastUpdated = new Date().toISOString();
      
      // Update the cache
      this.activeWorkflows.set(data.workflowId, workflow);
    }
    
    // Notify workflow listeners
    if (this.workflowListeners.has(data.workflowId)) {
      const listeners = this.workflowListeners.get(data.workflowId);
      listeners.forEach(listener => {
        listener(data);
      });
    }
  }
  
  /**
   * Handle real-time task updates
   * @param {Object} data - Task update data
   * @private
   */
  _handleTaskUpdate(data) {
    // Update workflow if tracked
    if (this.activeWorkflows.has(data.workflowId)) {
      const workflow = this.activeWorkflows.get(data.workflowId);
      
      // Find and update the task
      const taskIndex = workflow.tasks.findIndex(t => t.id === data.taskId);
      if (taskIndex >= 0) {
        workflow.tasks[taskIndex] = { ...workflow.tasks[taskIndex], ...data.updates };
        workflow.lastUpdated = new Date().toISOString();
        this.activeWorkflows.set(data.workflowId, workflow);
      }
    }
    
    // Update user tasks if this task belongs to current user
    if (data.assigneeId === this.currentUser?.id) {
      const taskIndex = this.userTasks.findIndex(t => t.id === data.taskId);
      if (taskIndex >= 0) {
        this.userTasks[taskIndex] = { ...this.userTasks[taskIndex], ...data.updates };
      } else if (data.updates.assigneeId === this.currentUser?.id) {
        // New task assigned to user
        this.userTasks.push(data.updates);
      }
    }
    
    // Notify task listeners
    if (this.taskListeners.has(data.taskId)) {
      const listeners = this.taskListeners.get(data.taskId);
      listeners.forEach(listener => {
        listener(data);
      });
    }
  }
  
  /**
   * Handle real-time task assignments
   * @param {Object} data - Task assignment data
   * @private
   */
  _handleTaskAssigned(data) {
    // Add to user tasks if assigned to current user
    if (data.assigneeId === this.currentUser?.id) {
      const existingIndex = this.userTasks.findIndex(t => t.id === data.taskId);
      
      if (existingIndex >= 0) {
        // Update existing task
        this.userTasks[existingIndex] = { ...this.userTasks[existingIndex], ...data.task };
      } else {
        // Add new task
        this.userTasks.push(data.task);
      }
      
      // Sort tasks by priority and due date
      this.userTasks.sort((a, b) => {
        const priorityOrder = { critical: 0, urgent: 1, high: 2, normal: 3, low: 4 };
        const aPriority = priorityOrder[a.priority] || 3;
        const bPriority = priorityOrder[b.priority] || 3;
        
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        
        const aDate = a.dueDate ? new Date(a.dueDate) : new Date(9999, 11, 31);
        const bDate = b.dueDate ? new Date(b.dueDate) : new Date(9999, 11, 31);
        return aDate - bDate;
      });
      
      // Dispatch event for UI notification
      if (typeof window !== 'undefined') {
        const assignmentEvent = new CustomEvent('task-assigned', { detail: data.task });
        window.dispatchEvent(assignmentEvent);
      }
    }
  }
  
  /**
   * Handle real-time workflow completion
   * @param {Object} data - Workflow completion data
   * @private
   */
  _handleWorkflowCompleted(data) {
    // Update workflow if tracked
    if (this.activeWorkflows.has(data.workflowId)) {
      const workflow = this.activeWorkflows.get(data.workflowId);
      workflow.status = WORKFLOW_STATES.COMPLETED;
      workflow.completedAt = data.completedAt;
      workflow.result = data.result;
      workflow.lastUpdated = new Date().toISOString();
      
      this.activeWorkflows.set(data.workflowId, workflow);
    }
    
    // Notify workflow listeners
    if (this.workflowListeners.has(data.workflowId)) {
      const listeners = this.workflowListeners.get(data.workflowId);
      listeners.forEach(listener => {
        listener({
          type: 'workflow_completed',
          workflowId: data.workflowId,
          completedAt: data.completedAt,
          result: data.result
        });
      });
    }
    
    // Dispatch event for UI notification
    if (typeof window !== 'undefined') {
      const completionEvent = new CustomEvent('workflow-completed', { detail: data });
      window.dispatchEvent(completionEvent);
    }
  }

  /**
   * Get workflow by ID
   * @param {string} workflowId - Workflow ID
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Workflow data
   */
  async getWorkflow(workflowId, options = {}) {
    try {
      // Check cache first if not forcing refresh
      if (!options.forceRefresh && this.activeWorkflows.has(workflowId)) {
        return Promise.resolve(this.activeWorkflows.get(workflowId));
      }
      
      const queryParams = new URLSearchParams({
        ...options
      }).toString();

      const response = await fetch(`${API_BASE}/workflows/${workflowId}?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Failed to get workflow: ${response.statusText}`);
      }
      
      const workflow = await response.json();
      
      // Cache workflow
      this.activeWorkflows.set(workflowId, workflow);
      
      // Subscribe to real-time updates if requested
      if (options.subscribe && this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
          type: 'subscribe_workflow',
          workflowId
        }));
      }
      
      return workflow;
    } catch (error) {
      console.error(`Error getting workflow ${workflowId}:`, error);
      throw error;
    }
  }

  /**
   * Get user workflows
   * @param {Object} options - Request options
   * @returns {Promise<Array>} - User workflows
   */
  async getUserWorkflows(options = {}) {
    try {
      const queryParams = new URLSearchParams({
        ...options
      }).toString();

      const response = await fetch(`${API_BASE}/workflows?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Failed to get user workflows: ${response.statusText}`);
      }
      
      const workflows = await response.json();
      
      // Cache workflows
      workflows.forEach(workflow => {
        this.activeWorkflows.set(workflow.id, workflow);
      });
      
      return workflows;
    } catch (error) {
      console.error('Error getting user workflows:', error);
      throw error;
    }
  }

  /**
   * Get user tasks
   * @param {Object} options - Request options
   * @returns {Promise<Array>} - User tasks
   */
  async getUserTasks(options = {}) {
    try {
      const queryParams = new URLSearchParams({
        ...options
      }).toString();

      const response = await fetch(`${API_BASE}/tasks?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Failed to get user tasks: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting user tasks:', error);
      throw error;
    }
  }

  /**
   * Get workflow templates
   * @param {Object} options - Request options
   * @returns {Promise<Array>} - Workflow templates
   */
  async getWorkflowTemplates(options = {}) {
    try {
      const queryParams = new URLSearchParams({
        ...options
      }).toString();

      const response = await fetch(`${API_BASE}/templates?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Failed to get workflow templates: ${response.statusText}`);
      }
      
      const templates = await response.json();
      
      // Cache templates
      templates.forEach(template => {
        this.workflowTemplates[template.id] = template;
      });
      
      return templates;
    } catch (error) {
      console.error('Error getting workflow templates:', error);
      throw error;
    }
  }

  /**
   * Create workflow template
   * @param {Object} template - Template definition
   * @returns {Promise<Object>} - Created template
   */
  async createWorkflowTemplate(template) {
    try {
      const response = await fetch(`${API_BASE}/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(template)
      });

      if (!response.ok) {
        throw new Error(`Failed to create workflow template: ${response.statusText}`);
      }

      const createdTemplate = await response.json();
      
      // Cache template
      this.workflowTemplates[createdTemplate.id] = createdTemplate;
      
      return createdTemplate;
    } catch (error) {
      console.error('Error creating workflow template:', error);
      throw error;
    }
  }

  /**
   * Start workflow from template
   * @param {string} templateId - Template ID
   * @param {Object} context - Workflow context
   * @param {Object} options - Start options
   * @returns {Promise<Object>} - Started workflow
   */
  async startWorkflow(templateId, context, options = {}) {
    try {
      const response = await fetch(`${API_BASE}/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateId,
          context,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to start workflow: ${response.statusText}`);
      }

      const startedWorkflow = await response.json();
      
      // Cache workflow
      this.activeWorkflows.set(startedWorkflow.id, startedWorkflow);
      
      // Create blockchain audit trail if enabled
      if (options.enableBlockchain) {
        try {
          const blockchainResult = await regulatoryIntelligenceCore.createBlockchainAuditTrail(
            'workflow',
            startedWorkflow.id,
            {
              action: 'workflow_started',
              templateId,
              initiatedBy: this.currentUser?.id,
              timestamp: new Date().toISOString()
            }
          );
          
          startedWorkflow.blockchain = blockchainResult;
        } catch (blockchainError) {
          console.error('Error creating blockchain audit trail for workflow:', blockchainError);
        }
      }
      
      return startedWorkflow;
    } catch (error) {
      console.error(`Error starting workflow from template ${templateId}:`, error);
      throw error;
    }
  }

  /**
   * Resume workflow
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<Object>} - Resumed workflow
   */
  async resumeWorkflow(workflowId) {
    try {
      const response = await fetch(`${API_BASE}/workflows/${workflowId}/resume`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Failed to resume workflow: ${response.statusText}`);
      }

      const resumedWorkflow = await response.json();
      
      // Update cache
      this.activeWorkflows.set(workflowId, resumedWorkflow);
      
      return resumedWorkflow;
    } catch (error) {
      console.error(`Error resuming workflow ${workflowId}:`, error);
      throw error;
    }
  }

  /**
   * Pause workflow
   * @param {string} workflowId - Workflow ID
   * @param {string} reason - Pause reason
   * @returns {Promise<Object>} - Paused workflow
   */
  async pauseWorkflow(workflowId, reason = '') {
    try {
      const response = await fetch(`${API_BASE}/workflows/${workflowId}/pause`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error(`Failed to pause workflow: ${response.statusText}`);
      }

      const pausedWorkflow = await response.json();
      
      // Update cache
      this.activeWorkflows.set(workflowId, pausedWorkflow);
      
      return pausedWorkflow;
    } catch (error) {
      console.error(`Error pausing workflow ${workflowId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel workflow
   * @param {string} workflowId - Workflow ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} - Cancelled workflow
   */
  async cancelWorkflow(workflowId, reason = '') {
    try {
      const response = await fetch(`${API_BASE}/workflows/${workflowId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel workflow: ${response.statusText}`);
      }

      const cancelledWorkflow = await response.json();
      
      // Update cache
      this.activeWorkflows.set(workflowId, cancelledWorkflow);
      
      // Create blockchain audit trail
      try {
        await regulatoryIntelligenceCore.createBlockchainAuditTrail(
          'workflow',
          workflowId,
          {
            action: 'workflow_cancelled',
            cancelledBy: this.currentUser?.id,
            reason,
            timestamp: new Date().toISOString()
          }
        );
      } catch (blockchainError) {
        console.error('Error creating blockchain audit trail for cancellation:', blockchainError);
      }
      
      return cancelledWorkflow;
    } catch (error) {
      console.error(`Error cancelling workflow ${workflowId}:`, error);
      throw error;
    }
  }

  /**
   * Complete task
   * @param {string} taskId - Task ID
   * @param {Object} result - Task result
   * @returns {Promise<Object>} - Completed task
   */
  async completeTask(taskId, result = {}) {
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ result })
      });

      if (!response.ok) {
        throw new Error(`Failed to complete task: ${response.statusText}`);
      }

      const completedTask = await response.json();
      
      // Update user tasks
      this.userTasks = this.userTasks.filter(t => t.id !== taskId);
      
      // Create blockchain audit trail
      try {
        await regulatoryIntelligenceCore.createBlockchainAuditTrail(
          'task',
          taskId,
          {
            action: 'task_completed',
            completedBy: this.currentUser?.id,
            timestamp: new Date().toISOString()
          }
        );
      } catch (blockchainError) {
        console.error('Error creating blockchain audit trail for task completion:', blockchainError);
      }
      
      return completedTask;
    } catch (error) {
      console.error(`Error completing task ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Submit document for review
   * @param {string} documentId - Document ID
   * @param {Array} reviewers - Reviewer user IDs
   * @param {Object} options - Review options
   * @returns {Promise<Object>} - Review workflow
   */
  async submitDocumentForReview(documentId, reviewers, options = {}) {
    try {
      // Get document from DocuShare
      const document = await docuShareService.getDocument(documentId);
      
      // Start review workflow
      const workflow = await this.startWorkflow(
        'document_review',
        {
          documentId,
          documentTitle: document.title,
          documentType: document.documentType,
          reviewers,
          dueDate: options.dueDate,
          priority: options.priority || TASK_PRIORITIES.NORMAL,
          instructions: options.instructions
        },
        {
          enableBlockchain: options.enableBlockchain !== false
        }
      );
      
      // Update document status
      await docuShareService.updateDocument(documentId, {
        state: 'review',
        reviewWorkflowId: workflow.id
      });
      
      return workflow;
    } catch (error) {
      console.error(`Error submitting document ${documentId} for review:`, error);
      throw error;
    }
  }

  /**
   * Reassign task
   * @param {string} taskId - Task ID
   * @param {string} assigneeId - New assignee ID
   * @param {string} reason - Reassignment reason
   * @returns {Promise<Object>} - Reassigned task
   */
  async reassignTask(taskId, assigneeId, reason = '') {
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}/reassign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ assigneeId, reason })
      });

      if (!response.ok) {
        throw new Error(`Failed to reassign task: ${response.statusText}`);
      }

      const reassignedTask = await response.json();
      
      // Update user tasks if this task was assigned to current user
      if (this.currentUser) {
        this.userTasks = this.userTasks.filter(t => t.id !== taskId);
      }
      
      return reassignedTask;
    } catch (error) {
      console.error(`Error reassigning task ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Request extension for task
   * @param {string} taskId - Task ID
   * @param {string} newDueDate - New due date
   * @param {string} reason - Extension reason
   * @returns {Promise<Object>} - Updated task
   */
  async requestTaskExtension(taskId, newDueDate, reason = '') {
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}/extension`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newDueDate, reason })
      });

      if (!response.ok) {
        throw new Error(`Failed to request task extension: ${response.statusText}`);
      }

      const updatedTask = await response.json();
      
      // Update task in user tasks
      const taskIndex = this.userTasks.findIndex(t => t.id === taskId);
      if (taskIndex >= 0) {
        this.userTasks[taskIndex] = { ...this.userTasks[taskIndex], ...updatedTask };
      }
      
      return updatedTask;
    } catch (error) {
      console.error(`Error requesting extension for task ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Get workflow history
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<Array>} - Workflow history
   */
  async getWorkflowHistory(workflowId) {
    try {
      const response = await fetch(`${API_BASE}/workflows/${workflowId}/history`);
      if (!response.ok) {
        throw new Error(`Failed to get workflow history: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error getting history for workflow ${workflowId}:`, error);
      throw error;
    }
  }

  /**
   * Add comment to workflow
   * @param {string} workflowId - Workflow ID
   * @param {Object} comment - Comment data
   * @returns {Promise<Object>} - Created comment
   */
  async addWorkflowComment(workflowId, comment) {
    try {
      const response = await fetch(`${API_BASE}/workflows/${workflowId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(comment)
      });

      if (!response.ok) {
        throw new Error(`Failed to add workflow comment: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error adding comment to workflow ${workflowId}:`, error);
      throw error;
    }
  }

  /**
   * Add comment to task
   * @param {string} taskId - Task ID
   * @param {Object} comment - Comment data
   * @returns {Promise<Object>} - Created comment
   */
  async addTaskComment(taskId, comment) {
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(comment)
      });

      if (!response.ok) {
        throw new Error(`Failed to add task comment: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error adding comment to task ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Get cross-module workflow status
   * @param {string} contextType - Context type (e.g., 'document', 'submission', 'project')
   * @param {string} contextId - Context ID
   * @returns {Promise<Object>} - Cross-module workflow status
   */
  async getCrossModuleWorkflowStatus(contextType, contextId) {
    try {
      const response = await fetch(`${API_BASE}/cross-module-status?contextType=${contextType}&contextId=${contextId}`);
      if (!response.ok) {
        throw new Error(`Failed to get cross-module workflow status: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error getting cross-module workflow status for ${contextType}:${contextId}:`, error);
      throw error;
    }
  }

  /**
   * Verify workflow integrity with blockchain
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<Object>} - Verification result
   */
  async verifyWorkflowIntegrity(workflowId) {
    try {
      // Get workflow history
      const history = await this.getWorkflowHistory(workflowId);
      
      // Verify each history event on blockchain
      const verificationResults = await Promise.all(
        history.map(async (event) => {
          try {
            const result = await regulatoryIntelligenceCore.verifyAuditTrail({
              auditHash: event.auditHash
            });
            
            return {
              eventId: event.id,
              timestamp: event.timestamp,
              verified: result.verified,
              blockchainTimestamp: result.timestamp
            };
          } catch (error) {
            return {
              eventId: event.id,
              timestamp: event.timestamp,
              verified: false,
              error: error.message
            };
          }
        })
      );
      
      // Calculate overall verification status
      const allVerified = verificationResults.every(r => r.verified);
      
      return {
        workflowId,
        verified: allVerified,
        events: verificationResults,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error verifying workflow ${workflowId} integrity:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to workflow updates
   * @param {string} workflowId - Workflow ID
   * @param {Function} listener - Update listener
   * @returns {string} - Subscription ID
   */
  subscribeToWorkflowUpdates(workflowId, listener) {
    const subscriptionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    if (!this.workflowListeners.has(workflowId)) {
      this.workflowListeners.set(workflowId, new Map());
    }
    
    this.workflowListeners.get(workflowId).set(subscriptionId, listener);
    
    // Subscribe to real-time updates if available
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'subscribe_workflow',
        workflowId
      }));
    }
    
    return subscriptionId;
  }

  /**
   * Unsubscribe from workflow updates
   * @param {string} workflowId - Workflow ID
   * @param {string} subscriptionId - Subscription ID
   */
  unsubscribeFromWorkflowUpdates(workflowId, subscriptionId) {
    if (this.workflowListeners.has(workflowId)) {
      this.workflowListeners.get(workflowId).delete(subscriptionId);
      
      // If no more listeners, unsubscribe from real-time updates
      if (this.workflowListeners.get(workflowId).size === 0) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.send(JSON.stringify({
            type: 'unsubscribe_workflow',
            workflowId
          }));
        }
      }
    }
  }

  /**
   * Subscribe to task updates
   * @param {string} taskId - Task ID
   * @param {Function} listener - Update listener
   * @returns {string} - Subscription ID
   */
  subscribeToTaskUpdates(taskId, listener) {
    const subscriptionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    if (!this.taskListeners.has(taskId)) {
      this.taskListeners.set(taskId, new Map());
    }
    
    this.taskListeners.get(taskId).set(subscriptionId, listener);
    
    // Subscribe to real-time updates if available
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'subscribe_task',
        taskId
      }));
    }
    
    return subscriptionId;
  }

  /**
   * Unsubscribe from task updates
   * @param {string} taskId - Task ID
   * @param {string} subscriptionId - Subscription ID
   */
  unsubscribeFromTaskUpdates(taskId, subscriptionId) {
    if (this.taskListeners.has(taskId)) {
      this.taskListeners.get(taskId).delete(subscriptionId);
      
      // If no more listeners, unsubscribe from real-time updates
      if (this.taskListeners.get(taskId).size === 0) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.send(JSON.stringify({
            type: 'unsubscribe_task',
            taskId
          }));
        }
      }
    }
  }
}

// Create singleton instance
const workflowService = new WorkflowService();
export default workflowService;