/**
 * Workflow Service
 * 
 * This service provides workflow and task management capabilities across modules
 * in the TrialSage platform, with special support for cross-module workflows.
 */

import { apiRequest } from '../lib/queryClient';
import securityService from './SecurityService';

// Workflow statuses
export const WORKFLOW_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  PAUSED: 'paused',
  CANCELED: 'canceled'
};

// Task statuses
export const TASK_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  BLOCKED: 'blocked',
  SKIPPED: 'skipped'
};

// Task priorities
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

class WorkflowService {
  constructor() {
    this.initialized = false;
    this.workflows = new Map();
    this.workflowTemplates = new Map();
    this.tasks = new Map();
    this.taskTemplates = new Map();
  }

  /**
   * Initialize workflow service
   * @param {Object} options - Initialization options
   * @returns {Promise<boolean>} Success status
   */
  async initialize(options = {}) {
    try {
      // In a real implementation, would initialize storage and connections
      // For now, simulate initialization with demo data
      await this._initializeTemplates();
      await this._initializeActiveWorkflows();
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Workflow service initialization error:', error);
      return false;
    }
  }

  /**
   * Get workflow templates
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of workflow templates
   */
  async getWorkflowTemplates(options = {}) {
    if (!this.initialized) {
      throw new Error('Workflow service not initialized');
    }
    
    // In a real implementation, would fetch from API
    // For now, return demo workflow templates filtered by options
    const templates = Array.from(this.workflowTemplates.values());
    
    // Filter by module if specified
    if (options.module) {
      return templates.filter(template => template.module === options.module);
    }
    
    return templates;
  }

  /**
   * Get active workflows
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of active workflows
   */
  async getActiveWorkflows(options = {}) {
    if (!this.initialized) {
      throw new Error('Workflow service not initialized');
    }
    
    // In a real implementation, would fetch from API
    // For now, return demo workflows filtered by options
    const workflows = Array.from(this.workflows.values());
    
    // Filter by status if specified
    if (options.status) {
      return workflows.filter(workflow => workflow.status === options.status);
    }
    
    // Filter by module if specified
    if (options.module) {
      return workflows.filter(workflow => workflow.module === options.module);
    }
    
    // Filter by user if specified
    if (options.userId) {
      return workflows.filter(workflow => workflow.userId === options.userId);
    }
    
    return workflows;
  }

  /**
   * Start a workflow
   * @param {string} templateId - Workflow template ID
   * @param {Object} context - Workflow context
   * @param {Object} options - Workflow options
   * @returns {Promise<Object>} Started workflow
   */
  async startWorkflow(templateId, context = {}, options = {}) {
    if (!this.initialized) {
      throw new Error('Workflow service not initialized');
    }
    
    // Check if template exists
    if (!this.workflowTemplates.has(templateId)) {
      throw new Error(`Workflow template ${templateId} not found`);
    }
    
    const template = this.workflowTemplates.get(templateId);
    
    // In a real implementation, would call API
    // For now, simulate workflow creation
    const now = new Date().toISOString();
    const workflow = {
      id: `workflow-${Date.now()}`,
      templateId,
      name: template.name,
      description: template.description,
      module: template.module,
      status: WORKFLOW_STATUS.IN_PROGRESS,
      startedAt: now,
      completedAt: null,
      userId: securityService.user?.id || 'system',
      organizationId: securityService.currentOrganization?.id,
      context: {
        ...context,
        sourceModule: context.sourceModule || template.module
      },
      tasks: [],
      ...options
    };
    
    // Create tasks from template
    const tasks = await this._createTasksFromTemplate(template, workflow.id, context);
    workflow.tasks = tasks.map(task => task.id);
    
    // Add workflow to map
    this.workflows.set(workflow.id, workflow);
    
    return workflow;
  }

  /**
   * Get workflow by ID
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<Object>} Workflow
   */
  async getWorkflow(workflowId) {
    if (!this.initialized) {
      throw new Error('Workflow service not initialized');
    }
    
    // Check if workflow exists
    if (!this.workflows.has(workflowId)) {
      throw new Error(`Workflow ${workflowId} not found`);
    }
    
    // In a real implementation, would fetch from API
    // For now, return workflow from map
    return this.workflows.get(workflowId);
  }

  /**
   * Get tasks for a workflow
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<Array>} Array of tasks
   */
  async getWorkflowTasks(workflowId) {
    if (!this.initialized) {
      throw new Error('Workflow service not initialized');
    }
    
    // Check if workflow exists
    if (!this.workflows.has(workflowId)) {
      throw new Error(`Workflow ${workflowId} not found`);
    }
    
    // In a real implementation, would fetch from API
    // For now, filter tasks by workflow ID
    const workflow = this.workflows.get(workflowId);
    
    return Array.from(this.tasks.values())
      .filter(task => workflow.tasks.includes(task.id));
  }

  /**
   * Update task status
   * @param {string} taskId - Task ID
   * @param {string} status - New status
   * @param {Object} result - Task result
   * @returns {Promise<Object>} Updated task
   */
  async updateTaskStatus(taskId, status, result = {}) {
    if (!this.initialized) {
      throw new Error('Workflow service not initialized');
    }
    
    // Check if task exists
    if (!this.tasks.has(taskId)) {
      throw new Error(`Task ${taskId} not found`);
    }
    
    // In a real implementation, would call API
    // For now, update task in map
    const task = this.tasks.get(taskId);
    const now = new Date().toISOString();
    
    // Update task
    const updatedTask = {
      ...task,
      status,
      result,
      updatedAt: now
    };
    
    // If task is completed, set completed date
    if (status === TASK_STATUS.COMPLETED) {
      updatedTask.completedAt = now;
    }
    
    // Update task in map
    this.tasks.set(taskId, updatedTask);
    
    // Check if workflow is complete
    await this._checkWorkflowCompletion(task.workflowId);
    
    return updatedTask;
  }

  /**
   * Get user tasks
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of tasks
   */
  async getUserTasks(options = {}) {
    if (!this.initialized) {
      throw new Error('Workflow service not initialized');
    }
    
    // In a real implementation, would fetch from API
    // For now, filter tasks by user ID
    const userId = securityService.user?.id || 'system';
    
    let tasks = Array.from(this.tasks.values())
      .filter(task => task.assignedTo === userId);
    
    // Filter by status if specified
    if (options.status) {
      tasks = tasks.filter(task => task.status === options.status);
    }
    
    // Filter by priority if specified
    if (options.priority) {
      tasks = tasks.filter(task => task.priority === options.priority);
    }
    
    // Sort by due date if specified
    if (options.sortBy === 'dueDate') {
      tasks.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    } else if (options.sortBy === 'priority') {
      // Sort by priority if specified
      const priorityOrder = {
        [TASK_PRIORITY.CRITICAL]: 0,
        [TASK_PRIORITY.HIGH]: 1,
        [TASK_PRIORITY.MEDIUM]: 2,
        [TASK_PRIORITY.LOW]: 3
      };
      
      tasks.sort((a, b) => {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    }
    
    return tasks;
  }

  /**
   * Refresh user tasks
   * @returns {Promise<Array>} Array of tasks
   */
  async refreshUserTasks() {
    // Just a wrapper around getUserTasks for React Query
    return this.getUserTasks({
      status: [
        TASK_STATUS.NOT_STARTED,
        TASK_STATUS.IN_PROGRESS,
        TASK_STATUS.BLOCKED
      ]
    });
  }

  /**
   * Initialize workflow templates with demo data
   * @private
   */
  async _initializeTemplates() {
    // Create demo workflow templates
    const workflowTemplates = [
      {
        id: 'workflow-template-1',
        name: 'IND Submission Workflow',
        description: 'End-to-end workflow for preparing and submitting an IND application',
        module: 'ind-wizard',
        steps: [
          {
            name: 'Document Preparation',
            tasks: ['task-template-1', 'task-template-2']
          },
          {
            name: 'Quality Check',
            tasks: ['task-template-3']
          },
          {
            name: 'Submission',
            tasks: ['task-template-4']
          }
        ]
      },
      {
        id: 'workflow-template-2',
        name: 'CSR Generation Workflow',
        description: 'Workflow for generating and reviewing a Clinical Study Report',
        module: 'csr-intelligence',
        steps: [
          {
            name: 'Data Collection',
            tasks: ['task-template-5']
          },
          {
            name: 'Report Generation',
            tasks: ['task-template-6']
          },
          {
            name: 'Review',
            tasks: ['task-template-7']
          }
        ]
      },
      {
        id: 'workflow-template-3',
        name: 'Cross-Module Study Planning',
        description: 'Collaborative workflow spanning multiple modules for study planning',
        module: 'study-architect',
        steps: [
          {
            name: 'Protocol Development',
            tasks: ['task-template-8']
          },
          {
            name: 'Document Sharing',
            tasks: ['task-template-9']
          },
          {
            name: 'Approval',
            tasks: ['task-template-10']
          }
        ]
      }
    ];
    
    // Add workflow templates to map
    workflowTemplates.forEach(template => {
      this.workflowTemplates.set(template.id, template);
    });
    
    // Create demo task templates
    const taskTemplates = [
      {
        id: 'task-template-1',
        name: 'Prepare Protocol',
        description: 'Create and finalize protocol document',
        module: 'ind-wizard',
        estimatedDuration: 'P3D', // 3 days
        priority: TASK_PRIORITY.HIGH
      },
      {
        id: 'task-template-2',
        name: 'Prepare Investigator Brochure',
        description: 'Create and finalize investigator brochure',
        module: 'ind-wizard',
        estimatedDuration: 'P2D', // 2 days
        priority: TASK_PRIORITY.MEDIUM
      },
      {
        id: 'task-template-3',
        name: 'Quality Check Documents',
        description: 'Perform quality check on all IND documents',
        module: 'ind-wizard',
        estimatedDuration: 'P1D', // 1 day
        priority: TASK_PRIORITY.HIGH
      },
      {
        id: 'task-template-4',
        name: 'Submit to FDA',
        description: 'Submit IND application to FDA',
        module: 'ind-wizard',
        estimatedDuration: 'PT4H', // 4 hours
        priority: TASK_PRIORITY.CRITICAL
      },
      {
        id: 'task-template-5',
        name: 'Collect Clinical Data',
        description: 'Collect and organize clinical data for CSR',
        module: 'csr-intelligence',
        estimatedDuration: 'P2D', // 2 days
        priority: TASK_PRIORITY.HIGH
      },
      {
        id: 'task-template-6',
        name: 'Generate CSR Draft',
        description: 'Generate initial CSR draft using AI assistant',
        module: 'csr-intelligence',
        estimatedDuration: 'P1D', // 1 day
        priority: TASK_PRIORITY.HIGH
      },
      {
        id: 'task-template-7',
        name: 'Review CSR',
        description: 'Review and finalize CSR',
        module: 'csr-intelligence',
        estimatedDuration: 'P3D', // 3 days
        priority: TASK_PRIORITY.MEDIUM
      },
      {
        id: 'task-template-8',
        name: 'Develop Study Protocol',
        description: 'Create study protocol document',
        module: 'study-architect',
        estimatedDuration: 'P5D', // 5 days
        priority: TASK_PRIORITY.HIGH
      },
      {
        id: 'task-template-9',
        name: 'Share Documents with Team',
        description: 'Share protocol with IND and CSR teams',
        module: 'study-architect',
        estimatedDuration: 'PT2H', // 2 hours
        priority: TASK_PRIORITY.LOW
      },
      {
        id: 'task-template-10',
        name: 'Get Final Approval',
        description: 'Obtain final approval for study plan',
        module: 'study-architect',
        estimatedDuration: 'P1D', // 1 day
        priority: TASK_PRIORITY.CRITICAL
      }
    ];
    
    // Add task templates to map
    taskTemplates.forEach(template => {
      this.taskTemplates.set(template.id, template);
    });
  }

  /**
   * Initialize active workflows with demo data
   * @private
   */
  async _initializeActiveWorkflows() {
    const now = new Date();
    
    // Create demo workflows
    const workflows = [
      {
        id: 'workflow-1',
        templateId: 'workflow-template-1',
        name: 'BTX-331 IND Submission',
        description: 'IND submission for BTX-331 drug candidate',
        module: 'ind-wizard',
        status: WORKFLOW_STATUS.IN_PROGRESS,
        startedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        completedAt: null,
        userId: 'system',
        organizationId: null,
        context: {
          productName: 'BTX-331',
          indNumber: 'IND123456',
          sourceModule: 'ind-wizard'
        },
        tasks: ['task-1', 'task-2', 'task-3', 'task-4']
      },
      {
        id: 'workflow-2',
        templateId: 'workflow-template-2',
        name: 'BX-107 Phase I CSR',
        description: 'Clinical Study Report for BX-107 Phase I trial',
        module: 'csr-intelligence',
        status: WORKFLOW_STATUS.IN_PROGRESS,
        startedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        completedAt: null,
        userId: 'system',
        organizationId: null,
        context: {
          studyId: 'BX-107-001',
          phase: 'Phase I',
          sourceModule: 'csr-intelligence'
        },
        tasks: ['task-5', 'task-6', 'task-7']
      }
    ];
    
    // Add workflows to map
    workflows.forEach(workflow => {
      this.workflows.set(workflow.id, workflow);
    });
    
    // Create demo tasks
    const tasks = [
      {
        id: 'task-1',
        name: 'Prepare BTX-331 Protocol',
        description: 'Create and finalize protocol document for BTX-331',
        module: 'ind-wizard',
        status: TASK_STATUS.COMPLETED,
        priority: TASK_PRIORITY.HIGH,
        workflowId: 'workflow-1',
        templateId: 'task-template-1',
        assignedTo: 'system',
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        completedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        dueDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
        result: {
          documentId: 'document-1'
        }
      },
      {
        id: 'task-2',
        name: 'Prepare BTX-331 Investigator Brochure',
        description: 'Create and finalize investigator brochure for BTX-331',
        module: 'ind-wizard',
        status: TASK_STATUS.COMPLETED,
        priority: TASK_PRIORITY.MEDIUM,
        workflowId: 'workflow-1',
        templateId: 'task-template-2',
        assignedTo: 'system',
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
        completedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
        dueDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        result: {
          documentId: 'document-2'
        }
      },
      {
        id: 'task-3',
        name: 'Quality Check BTX-331 IND Documents',
        description: 'Perform quality check on all BTX-331 IND documents',
        module: 'ind-wizard',
        status: TASK_STATUS.IN_PROGRESS,
        priority: TASK_PRIORITY.HIGH,
        workflowId: 'workflow-1',
        templateId: 'task-template-3',
        assignedTo: 'system',
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        completedAt: null,
        dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
        result: {}
      },
      {
        id: 'task-4',
        name: 'Submit BTX-331 IND to FDA',
        description: 'Submit BTX-331 IND application to FDA',
        module: 'ind-wizard',
        status: TASK_STATUS.NOT_STARTED,
        priority: TASK_PRIORITY.CRITICAL,
        workflowId: 'workflow-1',
        templateId: 'task-template-4',
        assignedTo: 'system',
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
        updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
        completedAt: null,
        dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        result: {}
      },
      {
        id: 'task-5',
        name: 'Collect BX-107 Clinical Data',
        description: 'Collect and organize clinical data for BX-107 CSR',
        module: 'csr-intelligence',
        status: TASK_STATUS.COMPLETED,
        priority: TASK_PRIORITY.HIGH,
        workflowId: 'workflow-2',
        templateId: 'task-template-5',
        assignedTo: 'system',
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        result: {}
      },
      {
        id: 'task-6',
        name: 'Generate BX-107 CSR Draft',
        description: 'Generate initial BX-107 CSR draft using AI assistant',
        module: 'csr-intelligence',
        status: TASK_STATUS.IN_PROGRESS,
        priority: TASK_PRIORITY.HIGH,
        workflowId: 'workflow-2',
        templateId: 'task-template-6',
        assignedTo: 'system',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        completedAt: null,
        dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
        result: {
          progress: 0.75
        }
      },
      {
        id: 'task-7',
        name: 'Review BX-107 CSR',
        description: 'Review and finalize BX-107 CSR',
        module: 'csr-intelligence',
        status: TASK_STATUS.NOT_STARTED,
        priority: TASK_PRIORITY.MEDIUM,
        workflowId: 'workflow-2',
        templateId: 'task-template-7',
        assignedTo: 'system',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        completedAt: null,
        dueDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days from now
        result: {}
      }
    ];
    
    // Add tasks to map
    tasks.forEach(task => {
      this.tasks.set(task.id, task);
    });
  }

  /**
   * Create tasks from a workflow template
   * @param {Object} template - Workflow template
   * @param {string} workflowId - Workflow ID
   * @param {Object} context - Workflow context
   * @returns {Promise<Array>} Array of created tasks
   * @private
   */
  async _createTasksFromTemplate(template, workflowId, context) {
    const tasks = [];
    const now = new Date().toISOString();
    
    // Flatten tasks from template steps
    const taskTemplateIds = template.steps.flatMap(step => step.tasks);
    
    // Create tasks for each template
    for (const templateId of taskTemplateIds) {
      if (!this.taskTemplates.has(templateId)) {
        console.warn(`Task template ${templateId} not found, skipping`);
        continue;
      }
      
      const taskTemplate = this.taskTemplates.get(templateId);
      
      // Calculate due date based on estimated duration
      let dueDate = null;
      
      if (taskTemplate.estimatedDuration) {
        // Parse ISO 8601 duration
        const duration = taskTemplate.estimatedDuration;
        const daysMatch = duration.match(/P(\d+)D/);
        const hoursMatch = duration.match(/PT(\d+)H/);
        
        const days = daysMatch ? parseInt(daysMatch[1], 10) : 0;
        const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
        
        const totalHours = days * 24 + hours;
        
        dueDate = new Date(new Date().getTime() + totalHours * 60 * 60 * 1000).toISOString();
      }
      
      // Create task
      const task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
        name: taskTemplate.name,
        description: taskTemplate.description,
        module: taskTemplate.module,
        status: TASK_STATUS.NOT_STARTED,
        priority: taskTemplate.priority,
        workflowId,
        templateId,
        assignedTo: securityService.user?.id || 'system',
        createdAt: now,
        updatedAt: now,
        completedAt: null,
        dueDate,
        result: {}
      };
      
      // Add task to map
      this.tasks.set(task.id, task);
      tasks.push(task);
    }
    
    return tasks;
  }

  /**
   * Check if a workflow is complete
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<boolean>} Whether the workflow is complete
   * @private
   */
  async _checkWorkflowCompletion(workflowId) {
    // Check if workflow exists
    if (!this.workflows.has(workflowId)) {
      return false;
    }
    
    const workflow = this.workflows.get(workflowId);
    
    // Skip if workflow is already completed or failed
    if ([WORKFLOW_STATUS.COMPLETED, WORKFLOW_STATUS.FAILED].includes(workflow.status)) {
      return false;
    }
    
    // Get workflow tasks
    const tasks = await this.getWorkflowTasks(workflowId);
    
    // Check if all tasks are completed
    const allCompleted = tasks.every(
      task => task.status === TASK_STATUS.COMPLETED || task.status === TASK_STATUS.SKIPPED
    );
    
    const anyFailed = tasks.some(task => task.status === TASK_STATUS.FAILED);
    
    if (allCompleted || anyFailed) {
      // Update workflow status
      const now = new Date().toISOString();
      const updatedWorkflow = {
        ...workflow,
        status: allCompleted ? WORKFLOW_STATUS.COMPLETED : WORKFLOW_STATUS.FAILED,
        completedAt: now
      };
      
      // Update workflow in map
      this.workflows.set(workflowId, updatedWorkflow);
      
      return true;
    }
    
    return false;
  }
}

const workflowService = new WorkflowService();
export default workflowService;