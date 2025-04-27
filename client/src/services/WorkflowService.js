/**
 * Workflow Service
 * 
 * This service provides workflow management capabilities across modules in the TrialSage platform.
 */

class WorkflowService {
  constructor() {
    this.initialized = false;
    this.active = false;
    this.workflows = [];
    this.workflowSubscriptions = [];
    this.workflowTasks = [];
    this.status = 'initializing';
    this.workflowEngineStatus = 'disconnected';
    this.connectionError = null;
  }
  
  // Initialize Workflow service
  async initialize() {
    try {
      console.log('[Workflow] Initializing Workflow service...');
      
      // In a real implementation, this would connect to a workflow engine
      // For now, simulated with a delay
      await new Promise(resolve => setTimeout(resolve, 700));
      
      this.initialized = true;
      this.active = true;
      this.status = 'active';
      this.workflowEngineStatus = 'connected';
      
      console.log('[Workflow] Workflow service initialized successfully');
      
      // Initialize demo workflows for testing
      this.initializeDemoWorkflows();
      
      return true;
    } catch (error) {
      console.error('[Workflow] Initialization error:', error);
      this.status = 'error';
      this.connectionError = error;
      throw error;
    }
  }
  
  // Initialize demo workflows
  initializeDemoWorkflows() {
    // Define workflow types
    const WORKFLOW_TYPES = {
      IND_SUBMISSION: 'ind_submission',
      CSR_PREPARATION: 'csr_preparation',
      PROTOCOL_REVIEW: 'protocol_review',
      STUDY_STARTUP: 'study_startup',
      REGULATORY_RESPONSE: 'regulatory_response'
    };
    
    // Define workflow statuses
    const WORKFLOW_STATUSES = {
      DRAFT: 'draft',
      IN_PROGRESS: 'in_progress',
      PENDING_REVIEW: 'pending_review',
      COMPLETE: 'complete',
      CANCELLED: 'cancelled'
    };
    
    // Define task statuses
    const TASK_STATUSES = {
      NOT_STARTED: 'not_started',
      IN_PROGRESS: 'in_progress',
      PENDING_REVIEW: 'pending_review',
      COMPLETE: 'complete',
      BLOCKED: 'blocked'
    };
    
    // Demo workflows
    const demoWorkflows = [
      {
        id: 'wf-1',
        name: 'BTX-331 IND Submission',
        type: WORKFLOW_TYPES.IND_SUBMISSION,
        description: 'Preparation and submission of IND for BTX-331',
        status: WORKFLOW_STATUSES.IN_PROGRESS,
        progress: 65,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
        createdBy: 'user-123',
        organizationId: 'org-456',
        moduleId: 'ind-wizard',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'wf-2',
        name: 'BX-107 Phase II CSR',
        type: WORKFLOW_TYPES.CSR_PREPARATION,
        description: 'Preparation of Clinical Study Report for BX-107 Phase II study',
        status: WORKFLOW_STATUSES.PENDING_REVIEW,
        progress: 90,
        startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        createdBy: 'user-456',
        organizationId: 'org-456',
        moduleId: 'csr-intelligence',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'wf-3',
        name: 'NRX-405 Protocol Review',
        type: WORKFLOW_TYPES.PROTOCOL_REVIEW,
        description: 'Review and finalization of NRX-405 study protocol',
        status: WORKFLOW_STATUSES.COMPLETE,
        progress: 100,
        startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        completedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'user-789',
        organizationId: 'org-456',
        moduleId: 'study-architect',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    // Demo tasks for workflows
    const demoTasks = [
      // Tasks for BTX-331 IND Submission
      {
        id: 'task-1',
        workflowId: 'wf-1',
        name: 'Prepare Initial Application',
        description: 'Complete FDA Form 1571 and related documentation',
        status: TASK_STATUSES.COMPLETE,
        order: 1,
        assignedTo: 'user-123',
        dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
        completedDate: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(), // 17 days ago
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'task-2',
        workflowId: 'wf-1',
        name: 'Compile CMC Documentation',
        description: 'Prepare Chemistry, Manufacturing, and Controls documentation',
        status: TASK_STATUSES.COMPLETE,
        order: 2,
        assignedTo: 'user-456',
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        completedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'task-3',
        workflowId: 'wf-1',
        name: 'Draft Clinical Protocol',
        description: 'Develop detailed clinical protocol for the study',
        status: TASK_STATUSES.COMPLETE,
        order: 3,
        assignedTo: 'user-789',
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'task-4',
        workflowId: 'wf-1',
        name: 'Prepare Investigator Brochure',
        description: 'Compile comprehensive investigator brochure',
        status: TASK_STATUSES.IN_PROGRESS,
        order: 4,
        assignedTo: 'user-123',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'task-5',
        workflowId: 'wf-1',
        name: 'Regulatory Review',
        description: 'Complete regulatory review of all IND components',
        status: TASK_STATUSES.NOT_STARTED,
        order: 5,
        assignedTo: 'user-456',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'task-6',
        workflowId: 'wf-1',
        name: 'Submit to FDA',
        description: 'Final submission of IND package to FDA',
        status: TASK_STATUSES.NOT_STARTED,
        order: 6,
        assignedTo: 'user-123',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      
      // Tasks for BX-107 Phase II CSR
      {
        id: 'task-7',
        workflowId: 'wf-2',
        name: 'Data Analysis',
        description: 'Statistical analysis of clinical trial data',
        status: TASK_STATUSES.COMPLETE,
        order: 1,
        assignedTo: 'user-789',
        dueDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
        completedDate: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString(), // 27 days ago
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'task-8',
        workflowId: 'wf-2',
        name: 'Methods Section',
        description: 'Draft methods section of CSR',
        status: TASK_STATUSES.COMPLETE,
        order: 2,
        assignedTo: 'user-123',
        dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
        completedDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(), // 22 days ago
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'task-9',
        workflowId: 'wf-2',
        name: 'Results Section',
        description: 'Draft results section of CSR',
        status: TASK_STATUSES.COMPLETE,
        order: 3,
        assignedTo: 'user-456',
        dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
        completedDate: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(), // 17 days ago
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'task-10',
        workflowId: 'wf-2',
        name: 'Discussion Section',
        description: 'Draft discussion section of CSR',
        status: TASK_STATUSES.COMPLETE,
        order: 4,
        assignedTo: 'user-789',
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        completedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'task-11',
        workflowId: 'wf-2',
        name: 'Appendices',
        description: 'Compile appendices for CSR',
        status: TASK_STATUSES.COMPLETE,
        order: 5,
        assignedTo: 'user-123',
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'task-12',
        workflowId: 'wf-2',
        name: 'QC Review',
        description: 'Quality control review of complete CSR',
        status: TASK_STATUSES.PENDING_REVIEW,
        order: 6,
        assignedTo: 'user-456',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      
      // Tasks for NRX-405 Protocol Review
      {
        id: 'task-13',
        workflowId: 'wf-3',
        name: 'Initial Draft Review',
        description: 'Review initial draft of the protocol',
        status: TASK_STATUSES.COMPLETE,
        order: 1,
        assignedTo: 'user-123',
        dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
        completedDate: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(), // 17 days ago
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'task-14',
        workflowId: 'wf-3',
        name: 'Statistical Review',
        description: 'Statistical review of protocol design and endpoints',
        status: TASK_STATUSES.COMPLETE,
        order: 2,
        assignedTo: 'user-789',
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        completedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'task-15',
        workflowId: 'wf-3',
        name: 'Medical Review',
        description: 'Medical review of protocol safety considerations',
        status: TASK_STATUSES.COMPLETE,
        order: 3,
        assignedTo: 'user-456',
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'task-16',
        workflowId: 'wf-3',
        name: 'Final Approval',
        description: 'Final approval of the protocol',
        status: TASK_STATUSES.COMPLETE,
        order: 4,
        assignedTo: 'user-123',
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        completedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    // Set demo data
    this.workflows = demoWorkflows;
    this.workflowTasks = demoTasks;
  }
  
  // Create a new workflow
  async createWorkflow(workflowData) {
    if (!this.initialized || !this.active) {
      throw new Error('Workflow service not initialized or inactive');
    }
    
    try {
      console.log('[Workflow] Creating new workflow...');
      
      if (!workflowData.name) {
        throw new Error('Workflow name is required');
      }
      
      if (!workflowData.type) {
        throw new Error('Workflow type is required');
      }
      
      const workflowId = `wf-${Date.now()}`;
      
      const newWorkflow = {
        id: workflowId,
        name: workflowData.name,
        type: workflowData.type,
        description: workflowData.description || '',
        status: workflowData.status || 'draft',
        progress: workflowData.progress || 0,
        startDate: workflowData.startDate || new Date().toISOString(),
        dueDate: workflowData.dueDate || null,
        createdBy: workflowData.user?.id || 'unknown',
        organizationId: workflowData.organization?.id || 'unknown',
        moduleId: workflowData.moduleId || 'unknown',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add the new workflow to the list
      this.workflows.push(newWorkflow);
      
      // Create initial tasks if provided
      if (workflowData.tasks && Array.isArray(workflowData.tasks)) {
        for (let i = 0; i < workflowData.tasks.length; i++) {
          const taskData = workflowData.tasks[i];
          
          await this.createTask({
            workflowId,
            name: taskData.name,
            description: taskData.description || '',
            status: taskData.status || 'not_started',
            order: i + 1,
            assignedTo: taskData.assignedTo || workflowData.user?.id || 'unknown',
            dueDate: taskData.dueDate || null
          });
        }
      }
      
      // Notify subscribers of the new workflow
      this.notifyWorkflowSubscribers({
        type: 'workflow_created',
        workflow: newWorkflow
      });
      
      console.log(`[Workflow] Workflow created successfully: ${workflowId}`);
      
      return newWorkflow;
    } catch (error) {
      console.error('[Workflow] Error creating workflow:', error);
      throw error;
    }
  }
  
  // Get a workflow by ID
  async getWorkflow(workflowId) {
    if (!this.initialized || !this.active) {
      throw new Error('Workflow service not initialized or inactive');
    }
    
    try {
      console.log(`[Workflow] Getting workflow: ${workflowId}...`);
      
      const workflow = this.workflows.find(w => w.id === workflowId);
      
      if (!workflow) {
        throw new Error(`Workflow not found: ${workflowId}`);
      }
      
      return workflow;
    } catch (error) {
      console.error('[Workflow] Error getting workflow:', error);
      throw error;
    }
  }
  
  // Get workflows by module
  async getWorkflowsByModule(moduleId, filters = {}) {
    if (!this.initialized || !this.active) {
      throw new Error('Workflow service not initialized or inactive');
    }
    
    try {
      console.log(`[Workflow] Getting workflows for module: ${moduleId}...`);
      
      let filteredWorkflows = this.workflows.filter(w => w.moduleId === moduleId);
      
      // Apply additional filters
      if (filters.status) {
        filteredWorkflows = filteredWorkflows.filter(w => w.status === filters.status);
      }
      
      if (filters.type) {
        filteredWorkflows = filteredWorkflows.filter(w => w.type === filters.type);
      }
      
      if (filters.createdBy) {
        filteredWorkflows = filteredWorkflows.filter(w => w.createdBy === filters.createdBy);
      }
      
      // Sort by created date (newest first)
      filteredWorkflows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      console.log(`[Workflow] Found ${filteredWorkflows.length} workflows for module: ${moduleId}`);
      
      return filteredWorkflows;
    } catch (error) {
      console.error('[Workflow] Error getting workflows by module:', error);
      throw error;
    }
  }
  
  // Update a workflow
  async updateWorkflow(workflowId, updates) {
    if (!this.initialized || !this.active) {
      throw new Error('Workflow service not initialized or inactive');
    }
    
    try {
      console.log(`[Workflow] Updating workflow: ${workflowId}...`);
      
      const workflowIndex = this.workflows.findIndex(w => w.id === workflowId);
      
      if (workflowIndex === -1) {
        throw new Error(`Workflow not found: ${workflowId}`);
      }
      
      // Update the workflow
      const updatedWorkflow = {
        ...this.workflows[workflowIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // Update in the list
      this.workflows[workflowIndex] = updatedWorkflow;
      
      // Notify subscribers
      this.notifyWorkflowSubscribers({
        type: 'workflow_updated',
        workflow: updatedWorkflow
      });
      
      console.log(`[Workflow] Workflow updated successfully: ${workflowId}`);
      
      return updatedWorkflow;
    } catch (error) {
      console.error('[Workflow] Error updating workflow:', error);
      throw error;
    }
  }
  
  // Delete a workflow
  async deleteWorkflow(workflowId) {
    if (!this.initialized || !this.active) {
      throw new Error('Workflow service not initialized or inactive');
    }
    
    try {
      console.log(`[Workflow] Deleting workflow: ${workflowId}...`);
      
      const workflowIndex = this.workflows.findIndex(w => w.id === workflowId);
      
      if (workflowIndex === -1) {
        throw new Error(`Workflow not found: ${workflowId}`);
      }
      
      // Get the workflow to notify subscribers
      const deletedWorkflow = this.workflows[workflowIndex];
      
      // Remove from the list
      this.workflows.splice(workflowIndex, 1);
      
      // Delete associated tasks
      this.workflowTasks = this.workflowTasks.filter(task => task.workflowId !== workflowId);
      
      // Notify subscribers
      this.notifyWorkflowSubscribers({
        type: 'workflow_deleted',
        workflow: deletedWorkflow
      });
      
      console.log(`[Workflow] Workflow deleted successfully: ${workflowId}`);
      
      return { success: true, workflowId };
    } catch (error) {
      console.error('[Workflow] Error deleting workflow:', error);
      throw error;
    }
  }
  
  // Create a task for a workflow
  async createTask(taskData) {
    if (!this.initialized || !this.active) {
      throw new Error('Workflow service not initialized or inactive');
    }
    
    try {
      console.log(`[Workflow] Creating task for workflow: ${taskData.workflowId}...`);
      
      if (!taskData.workflowId) {
        throw new Error('Workflow ID is required');
      }
      
      if (!taskData.name) {
        throw new Error('Task name is required');
      }
      
      // Check if workflow exists
      const workflow = this.workflows.find(w => w.id === taskData.workflowId);
      
      if (!workflow) {
        throw new Error(`Workflow not found: ${taskData.workflowId}`);
      }
      
      const taskId = `task-${Date.now()}`;
      
      const newTask = {
        id: taskId,
        workflowId: taskData.workflowId,
        name: taskData.name,
        description: taskData.description || '',
        status: taskData.status || 'not_started',
        order: taskData.order || this.workflowTasks.filter(t => t.workflowId === taskData.workflowId).length + 1,
        assignedTo: taskData.assignedTo || '',
        dueDate: taskData.dueDate || null,
        createdAt: new Date().toISOString()
      };
      
      // Add the new task to the list
      this.workflowTasks.push(newTask);
      
      // Update workflow progress
      this.updateWorkflowProgress(taskData.workflowId);
      
      // Notify subscribers
      this.notifyWorkflowSubscribers({
        type: 'task_created',
        task: newTask,
        workflowId: taskData.workflowId
      });
      
      console.log(`[Workflow] Task created successfully: ${taskId}`);
      
      return newTask;
    } catch (error) {
      console.error('[Workflow] Error creating task:', error);
      throw error;
    }
  }
  
  // Get tasks for a workflow
  async getWorkflowTasks(workflowId) {
    if (!this.initialized || !this.active) {
      throw new Error('Workflow service not initialized or inactive');
    }
    
    try {
      console.log(`[Workflow] Getting tasks for workflow: ${workflowId}...`);
      
      const tasks = this.workflowTasks.filter(task => task.workflowId === workflowId);
      
      // Sort by order
      tasks.sort((a, b) => a.order - b.order);
      
      return tasks;
    } catch (error) {
      console.error('[Workflow] Error getting workflow tasks:', error);
      throw error;
    }
  }
  
  // Update a task
  async updateTask(taskId, updates) {
    if (!this.initialized || !this.active) {
      throw new Error('Workflow service not initialized or inactive');
    }
    
    try {
      console.log(`[Workflow] Updating task: ${taskId}...`);
      
      const taskIndex = this.workflowTasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) {
        throw new Error(`Task not found: ${taskId}`);
      }
      
      // Add completed date if status is changing to complete
      if (updates.status === 'complete' && this.workflowTasks[taskIndex].status !== 'complete') {
        updates.completedDate = new Date().toISOString();
      }
      
      // Update the task
      const updatedTask = {
        ...this.workflowTasks[taskIndex],
        ...updates
      };
      
      // Update in the list
      this.workflowTasks[taskIndex] = updatedTask;
      
      // Update workflow progress
      this.updateWorkflowProgress(updatedTask.workflowId);
      
      // Notify subscribers
      this.notifyWorkflowSubscribers({
        type: 'task_updated',
        task: updatedTask,
        workflowId: updatedTask.workflowId
      });
      
      console.log(`[Workflow] Task updated successfully: ${taskId}`);
      
      return updatedTask;
    } catch (error) {
      console.error('[Workflow] Error updating task:', error);
      throw error;
    }
  }
  
  // Delete a task
  async deleteTask(taskId) {
    if (!this.initialized || !this.active) {
      throw new Error('Workflow service not initialized or inactive');
    }
    
    try {
      console.log(`[Workflow] Deleting task: ${taskId}...`);
      
      const taskIndex = this.workflowTasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) {
        throw new Error(`Task not found: ${taskId}`);
      }
      
      // Get the task and workflow ID to notify subscribers
      const deletedTask = this.workflowTasks[taskIndex];
      const workflowId = deletedTask.workflowId;
      
      // Remove from the list
      this.workflowTasks.splice(taskIndex, 1);
      
      // Update workflow progress
      this.updateWorkflowProgress(workflowId);
      
      // Notify subscribers
      this.notifyWorkflowSubscribers({
        type: 'task_deleted',
        task: deletedTask,
        workflowId
      });
      
      console.log(`[Workflow] Task deleted successfully: ${taskId}`);
      
      return { success: true, taskId };
    } catch (error) {
      console.error('[Workflow] Error deleting task:', error);
      throw error;
    }
  }
  
  // Update workflow progress based on tasks
  updateWorkflowProgress(workflowId) {
    // Find the workflow
    const workflowIndex = this.workflows.findIndex(w => w.id === workflowId);
    
    if (workflowIndex === -1) {
      console.error(`[Workflow] Cannot update progress: Workflow not found: ${workflowId}`);
      return false;
    }
    
    // Get tasks for this workflow
    const workflowTasks = this.workflowTasks.filter(task => task.workflowId === workflowId);
    
    // If no tasks, progress is 0
    if (workflowTasks.length === 0) {
      this.workflows[workflowIndex].progress = 0;
      return true;
    }
    
    // Count completed tasks
    const completedTasks = workflowTasks.filter(task => task.status === 'complete');
    
    // Calculate progress percentage
    const progress = Math.round((completedTasks.length / workflowTasks.length) * 100);
    
    // Update workflow
    this.workflows[workflowIndex].progress = progress;
    
    // If all tasks are complete, update workflow status
    if (progress === 100 && this.workflows[workflowIndex].status !== 'complete') {
      this.workflows[workflowIndex].status = 'complete';
      this.workflows[workflowIndex].completedDate = new Date().toISOString();
      
      // Notify subscribers of completion
      this.notifyWorkflowSubscribers({
        type: 'workflow_completed',
        workflow: this.workflows[workflowIndex]
      });
    }
    
    return true;
  }
  
  // Subscribe to workflow events
  subscribeToWorkflows(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    
    const subscriptionId = `sub-${Date.now()}`;
    
    this.workflowSubscriptions.push({
      id: subscriptionId,
      callback
    });
    
    console.log(`[Workflow] New workflow subscription: ${subscriptionId}`);
    
    // Return subscription object with unsubscribe method
    return {
      id: subscriptionId,
      unsubscribe: () => {
        this.workflowSubscriptions = this.workflowSubscriptions.filter(sub => sub.id !== subscriptionId);
        console.log(`[Workflow] Unsubscribed from workflows: ${subscriptionId}`);
      }
    };
  }
  
  // Notify workflow subscribers
  notifyWorkflowSubscribers(event) {
    // Notify each subscriber
    this.workflowSubscriptions.forEach(subscription => {
      try {
        subscription.callback(event);
      } catch (error) {
        console.error(`[Workflow] Error notifying subscriber ${subscription.id}:`, error);
      }
    });
  }
  
  // Get recent workflows
  async getRecentWorkflows(limit = 10) {
    if (!this.initialized || !this.active) {
      throw new Error('Workflow service not initialized or inactive');
    }
    
    try {
      console.log(`[Workflow] Getting recent workflows (limit: ${limit})...`);
      
      // Sort by updated date (newest first)
      const sortedWorkflows = [...this.workflows]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, limit);
      
      return sortedWorkflows;
    } catch (error) {
      console.error('[Workflow] Error getting recent workflows:', error);
      throw error;
    }
  }
  
  // Get the service status
  getStatus() {
    return {
      initialized: this.initialized,
      active: this.active,
      status: this.status,
      workflowEngineStatus: this.workflowEngineStatus,
      error: this.connectionError,
      workflowCount: this.workflows.length,
      taskCount: this.workflowTasks.length,
      subscriptionCount: this.workflowSubscriptions.length
    };
  }
  
  // Disconnect from Workflow service
  disconnect() {
    if (this.active) {
      console.log('[Workflow] Disconnecting Workflow service...');
      
      this.active = false;
      this.status = 'disconnected';
      this.workflowEngineStatus = 'disconnected';
      
      console.log('[Workflow] Workflow service disconnected');
    }
    
    return true;
  }
}

// Export as singleton instance
const workflowService = new WorkflowService();
export default workflowService;