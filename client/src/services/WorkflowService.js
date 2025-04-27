/**
 * Workflow Service
 * 
 * This service provides workflow automation capabilities across all TrialSage modules.
 * It enables creation, execution, and monitoring of complex multi-step workflows
 * that span across different modules of the platform.
 */

import regulatoryIntelligenceCore from './RegulatoryIntelligenceCore';
import docuShareService from './DocuShareService';
import securityService from './SecurityService';

const API_BASE = '/api/workflows';

// Workflow statuses
export const WORKFLOW_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

// Task statuses
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
  CANCELLED: 'cancelled'
};

class WorkflowService {
  constructor() {
    this.isInitialized = false;
    this.config = {
      autoAssign: true,
      notifyOnTaskAssignment: true,
      recordEventHistory: true
    };
    this.workflowTemplates = new Map();
    this.workflows = new Map();
    this.tasks = new Map();
    this.userTasks = [];
    this.taskEventListeners = new Map();
    this.workflowEventListeners = new Map();
  }

  /**
   * Initialize Workflow service
   * @param {Object} options - Initialization options
   * @returns {Promise<Object>} - Initialization status
   */
  async initialize(options = {}) {
    if (this.isInitialized) {
      console.log('WorkflowService already initialized');
      return { status: 'already_initialized', config: this.config };
    }
    
    console.log('Initializing WorkflowService...');
    
    try {
      // Update configuration
      this.config = {
        ...this.config,
        ...options
      };
      
      // Initialize workflow templates
      this.initializeWorkflowTemplates();
      
      // In production, would fetch workflow data from API
      // const response = await fetch(`${API_BASE}/init`);
      // const initData = await response.json();
      
      this.isInitialized = true;
      console.log('WorkflowService initialized successfully');
      
      // Initialize user tasks
      await this.refreshUserTasks();
      
      return {
        status: 'success',
        config: this.config
      };
    } catch (error) {
      console.error('Failed to initialize WorkflowService:', error);
      
      return {
        status: 'error',
        error: error.message
      };
    }
  }
  
  /**
   * Initialize workflow templates
   */
  initializeWorkflowTemplates() {
    // Define standard workflow templates
    const templates = [
      {
        id: 'protocol-review',
        name: 'Protocol Review',
        description: 'Review a clinical protocol document',
        moduleOrigin: 'study-architect',
        applicableModules: ['study-architect', 'trial-vault', 'ind-wizard'],
        steps: [
          {
            id: 'review-request',
            name: 'Review Request',
            type: 'form',
            assigneeRoles: ['regulatory_specialist'],
            requiredFields: ['protocol', 'reviewType', 'dueDate']
          },
          {
            id: 'technical-review',
            name: 'Technical Review',
            type: 'review',
            assigneeRoles: ['medical_writer', 'regulatory_specialist'],
            dependencies: ['review-request'],
            requiredFields: ['comments', 'status']
          },
          {
            id: 'regulatory-review',
            name: 'Regulatory Review',
            type: 'review',
            assigneeRoles: ['regulatory_specialist'],
            dependencies: ['technical-review'],
            requiredFields: ['regulatoryAssessment', 'status']
          },
          {
            id: 'final-approval',
            name: 'Final Approval',
            type: 'approval',
            assigneeRoles: ['approver'],
            dependencies: ['regulatory-review'],
            requiredFields: ['approvalStatus', 'comments']
          }
        ],
        outputs: {
          documentType: 'reviewed_protocol',
          targetModule: 'trial-vault'
        }
      },
      {
        id: 'ind-submission',
        name: 'IND Submission',
        description: 'Prepare and submit an IND application',
        moduleOrigin: 'ind-wizard',
        applicableModules: ['ind-wizard', 'trial-vault', 'csr-intelligence'],
        steps: [
          {
            id: 'initiate-submission',
            name: 'Initiate Submission',
            type: 'form',
            assigneeRoles: ['regulatory_specialist'],
            requiredFields: ['productName', 'indType', 'targetSubmissionDate']
          },
          {
            id: 'prepare-cmc',
            name: 'Prepare CMC Section',
            type: 'document',
            assigneeRoles: ['regulatory_specialist'],
            dependencies: ['initiate-submission'],
            requiredFields: ['cmcDocument', 'status']
          },
          {
            id: 'prepare-nonclinical',
            name: 'Prepare Nonclinical Section',
            type: 'document',
            assigneeRoles: ['regulatory_specialist'],
            dependencies: ['initiate-submission'],
            requiredFields: ['nonclinicalDocument', 'status']
          },
          {
            id: 'prepare-clinical',
            name: 'Prepare Clinical Section',
            type: 'document',
            assigneeRoles: ['medical_writer', 'clinical_researcher'],
            dependencies: ['initiate-submission'],
            requiredFields: ['clinicalDocument', 'status']
          },
          {
            id: 'review-submission',
            name: 'Review Submission',
            type: 'review',
            assigneeRoles: ['regulatory_specialist'],
            dependencies: ['prepare-cmc', 'prepare-nonclinical', 'prepare-clinical'],
            requiredFields: ['reviewComments', 'status']
          },
          {
            id: 'final-approval',
            name: 'Final Approval',
            type: 'approval',
            assigneeRoles: ['approver'],
            dependencies: ['review-submission'],
            requiredFields: ['approvalStatus', 'comments']
          },
          {
            id: 'submit-to-fda',
            name: 'Submit to FDA',
            type: 'submission',
            assigneeRoles: ['regulatory_specialist'],
            dependencies: ['final-approval'],
            requiredFields: ['submissionDate', 'trackingNumber', 'status']
          }
        ],
        outputs: {
          documentType: 'ind_submission',
          targetModule: 'trial-vault'
        }
      },
      {
        id: 'csr-development',
        name: 'CSR Development',
        description: 'Develop a Clinical Study Report',
        moduleOrigin: 'csr-intelligence',
        applicableModules: ['csr-intelligence', 'trial-vault'],
        steps: [
          {
            id: 'initiate-csr',
            name: 'Initiate CSR',
            type: 'form',
            assigneeRoles: ['medical_writer'],
            requiredFields: ['studyId', 'templateType', 'dueDate']
          },
          {
            id: 'data-collection',
            name: 'Data Collection',
            type: 'data',
            assigneeRoles: ['data_manager'],
            dependencies: ['initiate-csr'],
            requiredFields: ['dataSource', 'status']
          },
          {
            id: 'draft-development',
            name: 'Draft Development',
            type: 'document',
            assigneeRoles: ['medical_writer'],
            dependencies: ['data-collection'],
            requiredFields: ['draftDocument', 'status']
          },
          {
            id: 'medical-review',
            name: 'Medical Review',
            type: 'review',
            assigneeRoles: ['clinical_researcher'],
            dependencies: ['draft-development'],
            requiredFields: ['medicalComments', 'status']
          },
          {
            id: 'statistical-review',
            name: 'Statistical Review',
            type: 'review',
            assigneeRoles: ['statistician'],
            dependencies: ['draft-development'],
            requiredFields: ['statisticalComments', 'status']
          },
          {
            id: 'final-draft',
            name: 'Final Draft',
            type: 'document',
            assigneeRoles: ['medical_writer'],
            dependencies: ['medical-review', 'statistical-review'],
            requiredFields: ['finalDocument', 'status']
          },
          {
            id: 'final-approval',
            name: 'Final Approval',
            type: 'approval',
            assigneeRoles: ['approver'],
            dependencies: ['final-draft'],
            requiredFields: ['approvalStatus', 'comments']
          }
        ],
        outputs: {
          documentType: 'clinical_study_report',
          targetModule: 'trial-vault'
        }
      }
    ];
    
    // Store templates
    templates.forEach(template => {
      this.workflowTemplates.set(template.id, template);
    });
  }
  
  /**
   * Refresh user tasks
   * @param {string} userId - User ID (optional, defaults to current user)
   * @returns {Promise<Array>} - User tasks
   */
  async refreshUserTasks(userId = null) {
    try {
      const currentUserId = userId || securityService.currentUser?.id;
      
      if (!currentUserId) {
        this.userTasks = [];
        return [];
      }
      
      // In production, would fetch from API
      // const response = await fetch(`${API_BASE}/tasks/user/${currentUserId}`);
      // const tasks = await response.json();
      
      // For now, filter tasks from cache
      const userTasks = Array.from(this.tasks.values())
        .filter(task => 
          task.assignee === currentUserId || 
          task.assigneeRoles?.some(role => securityService.hasRole(role))
        )
        .filter(task => 
          task.status === TASK_STATUS.PENDING || 
          task.status === TASK_STATUS.IN_PROGRESS
        );
      
      this.userTasks = userTasks;
      return userTasks;
    } catch (error) {
      console.error(`Error refreshing user tasks:`, error);
      return [];
    }
  }
  
  /**
   * Get workflow templates
   * @param {Object} options - Query options
   * @returns {Array} - Workflow templates
   */
  getWorkflowTemplates(options = {}) {
    let templates = Array.from(this.workflowTemplates.values());
    
    // Filter by module origin
    if (options.moduleOrigin) {
      templates = templates.filter(t => t.moduleOrigin === options.moduleOrigin);
    }
    
    // Filter by applicable module
    if (options.applicableModule) {
      templates = templates.filter(t => t.applicableModules.includes(options.applicableModule));
    }
    
    return templates;
  }
  
  /**
   * Get workflow template by ID
   * @param {string} templateId - Template ID
   * @returns {Object|null} - Workflow template or null if not found
   */
  getWorkflowTemplate(templateId) {
    return this.workflowTemplates.get(templateId) || null;
  }
  
  /**
   * Start workflow
   * @param {string} templateId - Workflow template ID
   * @param {Object} context - Workflow context
   * @param {Object} options - Workflow options
   * @returns {Promise<Object>} - Started workflow
   */
  async startWorkflow(templateId, context = {}, options = {}) {
    if (!this.isInitialized) {
      console.warn('WorkflowService not initialized. Initializing now...');
      await this.initialize();
    }
    
    try {
      // Get workflow template
      const template = this.workflowTemplates.get(templateId);
      if (!template) {
        throw new Error(`Workflow template not found: ${templateId}`);
      }
      
      // Create workflow
      const workflowId = `wf-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const workflow = {
        id: workflowId,
        templateId,
        name: options.name || template.name,
        description: options.description || template.description,
        status: WORKFLOW_STATUS.PENDING,
        context,
        createdAt: new Date().toISOString(),
        startedAt: null,
        completedAt: null,
        initiatedBy: options.userId || securityService.currentUser?.id,
        sourceModule: context.sourceModule || template.moduleOrigin,
        tasks: [],
        history: []
      };
      
      // Store workflow
      this.workflows.set(workflowId, workflow);
      
      // Create initial tasks
      const initialTasks = template.steps
        .filter(step => !step.dependencies || step.dependencies.length === 0)
        .map(step => this.createTask(step, workflowId, context, options));
      
      // Store tasks and update workflow
      initialTasks.forEach(task => {
        this.tasks.set(task.id, task);
        workflow.tasks.push(task.id);
      });
      
      // Update workflow status
      workflow.status = WORKFLOW_STATUS.IN_PROGRESS;
      workflow.startedAt = new Date().toISOString();
      
      // Add history event
      this.addWorkflowHistoryEvent(workflowId, {
        type: 'workflow_started',
        timestamp: workflow.startedAt,
        user: workflow.initiatedBy,
        details: {
          templateId,
          initialTasks: initialTasks.map(t => t.id)
        }
      });
      
      // Auto-assign tasks if enabled
      if (this.config.autoAssign) {
        initialTasks.forEach(task => {
          this.autoAssignTask(task);
        });
      }
      
      // Notify about new tasks
      if (this.config.notifyOnTaskAssignment) {
        initialTasks.forEach(task => {
          if (task.assignee) {
            this.notifyTaskAssignment(task);
          }
        });
      }
      
      // In production, would persist to API
      // const response = await fetch(`${API_BASE}/workflows`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(workflow)
      // });
      // const result = await response.json();
      
      // Refresh user tasks
      await this.refreshUserTasks();
      
      // Emit workflow started event
      this.emitWorkflowEvent('workflow_started', workflow);
      
      return workflow;
    } catch (error) {
      console.error(`Error starting workflow ${templateId}:`, error);
      throw error;
    }
  }
  
  /**
   * Create task from workflow step
   * @param {Object} step - Workflow step
   * @param {string} workflowId - Workflow ID
   * @param {Object} context - Workflow context
   * @param {Object} options - Task options
   * @returns {Object} - Created task
   */
  createTask(step, workflowId, context = {}, options = {}) {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const task = {
      id: taskId,
      workflowId,
      stepId: step.id,
      name: step.name,
      type: step.type,
      status: TASK_STATUS.PENDING,
      assigneeRoles: step.assigneeRoles,
      assignee: null,
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      data: {},
      context,
      requiredFields: step.requiredFields || [],
      dependencies: step.dependencies || [],
      history: []
    };
    
    // Add history event
    this.addTaskHistoryEvent(taskId, {
      type: 'task_created',
      timestamp: task.createdAt,
      details: {
        stepId: step.id,
        workflowId
      }
    });
    
    return task;
  }
  
  /**
   * Auto-assign task to appropriate user
   * @param {Object} task - Task to assign
   * @returns {Object} - Updated task
   */
  autoAssignTask(task) {
    // In a real implementation, this would use a sophisticated algorithm
    // to determine the best user to assign the task to based on role,
    // workload, expertise, etc.
    
    // For now, just use current user if they have the required role
    const currentUser = securityService.currentUser;
    
    if (currentUser && task.assigneeRoles) {
      const hasRequiredRole = task.assigneeRoles.some(role => 
        securityService.hasRole(role)
      );
      
      if (hasRequiredRole) {
        // Assign to current user
        return this.assignTask(task.id, currentUser.id);
      }
    }
    
    // Could not auto-assign
    return task;
  }
  
  /**
   * Assign task to user
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID
   * @returns {Object} - Updated task
   */
  assignTask(taskId, userId) {
    const task = this.tasks.get(taskId);
    
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }
    
    // Update task
    task.assignee = userId;
    this.tasks.set(taskId, task);
    
    // Add history event
    this.addTaskHistoryEvent(taskId, {
      type: 'task_assigned',
      timestamp: new Date().toISOString(),
      user: userId,
      details: {
        assignee: userId
      }
    });
    
    // Notify about assignment
    if (this.config.notifyOnTaskAssignment) {
      this.notifyTaskAssignment(task);
    }
    
    // Refresh user tasks
    this.refreshUserTasks();
    
    // Emit task assigned event
    this.emitTaskEvent('task_assigned', task);
    
    return task;
  }
  
  /**
   * Notify user about task assignment
   * @param {Object} task - Assigned task
   */
  notifyTaskAssignment(task) {
    if (!task.assignee) {
      return;
    }
    
    // In a real implementation, this might send an email, push notification, etc.
    // For now, just dispatch a custom event
    const taskAssignedEvent = new CustomEvent('task-assigned', {
      detail: {
        id: task.id,
        name: task.name,
        workflowId: task.workflowId,
        assignee: task.assignee
      }
    });
    
    window.dispatchEvent(taskAssignedEvent);
  }
  
  /**
   * Start task
   * @param {string} taskId - Task ID
   * @param {Object} options - Start options
   * @returns {Promise<Object>} - Updated task
   */
  async startTask(taskId, options = {}) {
    try {
      const task = this.tasks.get(taskId);
      
      if (!task) {
        throw new Error(`Task not found: ${taskId}`);
      }
      
      // Check assignee
      const userId = options.userId || securityService.currentUser?.id;
      
      if (task.assignee && task.assignee !== userId) {
        throw new Error(`Task is assigned to another user: ${task.assignee}`);
      }
      
      // Check status
      if (task.status !== TASK_STATUS.PENDING) {
        throw new Error(`Cannot start task with status: ${task.status}`);
      }
      
      // Check dependencies
      const workflow = this.workflows.get(task.workflowId);
      
      if (!workflow) {
        throw new Error(`Workflow not found: ${task.workflowId}`);
      }
      
      if (task.dependencies && task.dependencies.length > 0) {
        const dependencyTasks = task.dependencies.map(depStepId => {
          const depTaskId = workflow.tasks.find(id => {
            const t = this.tasks.get(id);
            return t && t.stepId === depStepId;
          });
          
          return depTaskId ? this.tasks.get(depTaskId) : null;
        }).filter(t => t !== null);
        
        const incompleteDepTasks = dependencyTasks.filter(
          t => t.status !== TASK_STATUS.COMPLETED && 
               t.status !== TASK_STATUS.SKIPPED
        );
        
        if (incompleteDepTasks.length > 0) {
          const incompleteTaskNames = incompleteDepTasks.map(t => t.name).join(', ');
          throw new Error(`Dependencies not completed: ${incompleteTaskNames}`);
        }
      }
      
      // Update task
      task.status = TASK_STATUS.IN_PROGRESS;
      task.startedAt = new Date().toISOString();
      
      if (!task.assignee) {
        task.assignee = userId;
      }
      
      this.tasks.set(taskId, task);
      
      // Add history event
      this.addTaskHistoryEvent(taskId, {
        type: 'task_started',
        timestamp: task.startedAt,
        user: userId,
        details: {}
      });
      
      // In production, would update via API
      // const response = await fetch(`${API_BASE}/tasks/${taskId}/start`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ userId })
      // });
      // const result = await response.json();
      
      // Emit task started event
      this.emitTaskEvent('task_started', task);
      
      return task;
    } catch (error) {
      console.error(`Error starting task ${taskId}:`, error);
      throw error;
    }
  }
  
  /**
   * Complete task
   * @param {string} taskId - Task ID
   * @param {Object} data - Task completion data
   * @param {Object} options - Completion options
   * @returns {Promise<Object>} - Updated task and any newly activated tasks
   */
  async completeTask(taskId, data = {}, options = {}) {
    try {
      const task = this.tasks.get(taskId);
      
      if (!task) {
        throw new Error(`Task not found: ${taskId}`);
      }
      
      // Check assignee
      const userId = options.userId || securityService.currentUser?.id;
      
      if (task.assignee && task.assignee !== userId) {
        throw new Error(`Task is assigned to another user: ${task.assignee}`);
      }
      
      // Check status
      if (task.status !== TASK_STATUS.IN_PROGRESS && task.status !== TASK_STATUS.PENDING) {
        throw new Error(`Cannot complete task with status: ${task.status}`);
      }
      
      // Check required fields
      if (task.requiredFields && task.requiredFields.length > 0) {
        const missingFields = task.requiredFields.filter(field => !(field in data));
        
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
      }
      
      // Update task
      task.status = TASK_STATUS.COMPLETED;
      task.completedAt = new Date().toISOString();
      task.data = {
        ...task.data,
        ...data
      };
      
      if (!task.assignee) {
        task.assignee = userId;
      }
      
      this.tasks.set(taskId, task);
      
      // Add history event
      this.addTaskHistoryEvent(taskId, {
        type: 'task_completed',
        timestamp: task.completedAt,
        user: userId,
        details: {
          data: JSON.stringify(data)
        }
      });
      
      // Get workflow
      const workflow = this.workflows.get(task.workflowId);
      
      if (!workflow) {
        throw new Error(`Workflow not found: ${task.workflowId}`);
      }
      
      // Find the step that was completed
      const template = this.workflowTemplates.get(workflow.templateId);
      const completedStep = template.steps.find(s => s.id === task.stepId);
      
      if (!completedStep) {
        throw new Error(`Step not found: ${task.stepId}`);
      }
      
      // Find steps that depend on this step
      const nextSteps = template.steps.filter(step => 
        step.dependencies && 
        step.dependencies.includes(completedStep.id)
      );
      
      // Check if these steps can be activated
      const activatedTasks = [];
      
      for (const nextStep of nextSteps) {
        // Check if all dependencies are completed
        const allDependenciesCompleted = nextStep.dependencies.every(depStepId => {
          const depTaskId = workflow.tasks.find(id => {
            const t = this.tasks.get(id);
            return t && t.stepId === depStepId;
          });
          
          if (!depTaskId) {
            return false;
          }
          
          const depTask = this.tasks.get(depTaskId);
          return depTask.status === TASK_STATUS.COMPLETED || depTask.status === TASK_STATUS.SKIPPED;
        });
        
        if (allDependenciesCompleted) {
          // Check if task already exists
          const existingTaskId = workflow.tasks.find(id => {
            const t = this.tasks.get(id);
            return t && t.stepId === nextStep.id;
          });
          
          if (!existingTaskId) {
            // Create new task
            const newTask = this.createTask(nextStep, workflow.id, workflow.context, options);
            this.tasks.set(newTask.id, newTask);
            workflow.tasks.push(newTask.id);
            activatedTasks.push(newTask);
            
            // Auto-assign if enabled
            if (this.config.autoAssign) {
              this.autoAssignTask(newTask);
            }
            
            // Notify about new task
            if (this.config.notifyOnTaskAssignment && newTask.assignee) {
              this.notifyTaskAssignment(newTask);
            }
          }
        }
      }
      
      // Check if workflow is completed
      const allWorkflowTasksCompleted = workflow.tasks.every(taskId => {
        const t = this.tasks.get(taskId);
        return t.status === TASK_STATUS.COMPLETED || 
               t.status === TASK_STATUS.SKIPPED ||
               t.status === TASK_STATUS.CANCELLED;
      });
      
      if (allWorkflowTasksCompleted) {
        // Complete workflow
        workflow.status = WORKFLOW_STATUS.COMPLETED;
        workflow.completedAt = new Date().toISOString();
        
        // Add history event
        this.addWorkflowHistoryEvent(workflow.id, {
          type: 'workflow_completed',
          timestamp: workflow.completedAt,
          user: userId,
          details: {}
        });
        
        // Process workflow outputs
        if (template.outputs) {
          this.processWorkflowOutputs(workflow, template.outputs);
        }
        
        // Emit workflow completed event
        this.emitWorkflowEvent('workflow_completed', workflow);
      }
      
      // In production, would update via API
      // const response = await fetch(`${API_BASE}/tasks/${taskId}/complete`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ userId, data })
      // });
      // const result = await response.json();
      
      // Refresh user tasks
      await this.refreshUserTasks();
      
      // Emit task completed event
      this.emitTaskEvent('task_completed', task);
      
      return {
        task,
        activatedTasks,
        workflowCompleted: allWorkflowTasksCompleted
      };
    } catch (error) {
      console.error(`Error completing task ${taskId}:`, error);
      throw error;
    }
  }
  
  /**
   * Process workflow outputs
   * @param {Object} workflow - Completed workflow
   * @param {Object} outputs - Workflow output configuration
   */
  async processWorkflowOutputs(workflow, outputs) {
    try {
      // This would perform actions based on the workflow outputs
      // such as creating documents, updating records, etc.
      
      // For example, if the output is a document, create it in the target module
      if (outputs.documentType && outputs.targetModule) {
        // Collect data from completed tasks
        const taskData = workflow.tasks
          .map(taskId => this.tasks.get(taskId))
          .filter(task => task.status === TASK_STATUS.COMPLETED)
          .reduce((data, task) => ({ ...data, [task.stepId]: task.data }), {});
        
        console.log(`Would create ${outputs.documentType} in ${outputs.targetModule} from workflow ${workflow.id}`);
        
        // If target module is Trial Vault, create a collection
        if (outputs.targetModule === 'trial-vault' && docuShareService.isInitialized) {
          const collectionName = `${workflow.name} - ${new Date().toLocaleDateString()}`;
          
          try {
            const collection = await docuShareService.createCollection(
              collectionName,
              outputs.targetModule,
              {
                description: `Output from workflow: ${workflow.id}`,
                tags: [outputs.documentType, 'workflow-output', workflow.templateId]
              }
            );
            
            console.log(`Created document collection ${collection.id} for workflow outputs`);
          } catch (collectionError) {
            console.warn('Failed to create document collection for workflow outputs:', collectionError);
          }
        }
      }
    } catch (error) {
      console.error(`Error processing workflow outputs for ${workflow.id}:`, error);
    }
  }
  
  /**
   * Get workflow by ID
   * @param {string} workflowId - Workflow ID
   * @returns {Object|null} - Workflow or null if not found
   */
  getWorkflow(workflowId) {
    return this.workflows.get(workflowId) || null;
  }
  
  /**
   * Get workflow tasks
   * @param {string} workflowId - Workflow ID
   * @returns {Array} - Workflow tasks
   */
  getWorkflowTasks(workflowId) {
    const workflow = this.workflows.get(workflowId);
    
    if (!workflow) {
      return [];
    }
    
    return workflow.tasks
      .map(taskId => this.tasks.get(taskId))
      .filter(task => task !== undefined);
  }
  
  /**
   * Get task by ID
   * @param {string} taskId - Task ID
   * @returns {Object|null} - Task or null if not found
   */
  getTask(taskId) {
    return this.tasks.get(taskId) || null;
  }
  
  /**
   * Add workflow history event
   * @param {string} workflowId - Workflow ID
   * @param {Object} event - History event
   */
  addWorkflowHistoryEvent(workflowId, event) {
    if (!this.config.recordEventHistory) {
      return;
    }
    
    const workflow = this.workflows.get(workflowId);
    
    if (!workflow) {
      return;
    }
    
    workflow.history.push(event);
  }
  
  /**
   * Add task history event
   * @param {string} taskId - Task ID
   * @param {Object} event - History event
   */
  addTaskHistoryEvent(taskId, event) {
    if (!this.config.recordEventHistory) {
      return;
    }
    
    const task = this.tasks.get(taskId);
    
    if (!task) {
      return;
    }
    
    task.history.push(event);
  }
  
  /**
   * Register task event listener
   * @param {string} eventType - Event type
   * @param {Function} callback - Event callback
   * @returns {string} - Listener ID
   */
  onTaskEvent(eventType, callback) {
    const listenerId = `listener-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    if (!this.taskEventListeners.has(eventType)) {
      this.taskEventListeners.set(eventType, new Map());
    }
    
    this.taskEventListeners.get(eventType).set(listenerId, callback);
    
    return listenerId;
  }
  
  /**
   * Remove task event listener
   * @param {string} eventType - Event type
   * @param {string} listenerId - Listener ID
   * @returns {boolean} - Whether listener was removed
   */
  offTaskEvent(eventType, listenerId) {
    if (!this.taskEventListeners.has(eventType)) {
      return false;
    }
    
    return this.taskEventListeners.get(eventType).delete(listenerId);
  }
  
  /**
   * Emit task event
   * @param {string} eventType - Event type
   * @param {Object} task - Task object
   */
  emitTaskEvent(eventType, task) {
    if (!this.taskEventListeners.has(eventType)) {
      return;
    }
    
    this.taskEventListeners.get(eventType).forEach(callback => {
      try {
        callback(task);
      } catch (error) {
        console.error(`Error in task event listener for ${eventType}:`, error);
      }
    });
  }
  
  /**
   * Register workflow event listener
   * @param {string} eventType - Event type
   * @param {Function} callback - Event callback
   * @returns {string} - Listener ID
   */
  onWorkflowEvent(eventType, callback) {
    const listenerId = `listener-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    if (!this.workflowEventListeners.has(eventType)) {
      this.workflowEventListeners.set(eventType, new Map());
    }
    
    this.workflowEventListeners.get(eventType).set(listenerId, callback);
    
    return listenerId;
  }
  
  /**
   * Remove workflow event listener
   * @param {string} eventType - Event type
   * @param {string} listenerId - Listener ID
   * @returns {boolean} - Whether listener was removed
   */
  offWorkflowEvent(eventType, listenerId) {
    if (!this.workflowEventListeners.has(eventType)) {
      return false;
    }
    
    return this.workflowEventListeners.get(eventType).delete(listenerId);
  }
  
  /**
   * Emit workflow event
   * @param {string} eventType - Event type
   * @param {Object} workflow - Workflow object
   */
  emitWorkflowEvent(eventType, workflow) {
    if (!this.workflowEventListeners.has(eventType)) {
      return;
    }
    
    this.workflowEventListeners.get(eventType).forEach(callback => {
      try {
        callback(workflow);
      } catch (error) {
        console.error(`Error in workflow event listener for ${eventType}:`, error);
      }
    });
    
    // For workflow_completed, also dispatch a DOM event
    if (eventType === 'workflow_completed') {
      const workflowCompletedEvent = new CustomEvent('workflow-completed', {
        detail: {
          id: workflow.id,
          name: workflow.name,
          templateId: workflow.templateId
        }
      });
      
      window.dispatchEvent(workflowCompletedEvent);
    }
  }
}

// Create singleton instance
const workflowService = new WorkflowService();
export default workflowService;