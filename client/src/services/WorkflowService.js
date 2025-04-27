/**
 * Workflow Service
 * 
 * This service handles workflow management across all TrialSage modules,
 * including task tracking, assignments, and process templates.
 */

class WorkflowService {
  constructor() {
    this.isInitialized = false;
    this.workflows = new Map();
    this.tasks = new Map();
    this.templates = new Map();
    this.taskAssignments = new Map();
  }
  
  /**
   * Initialize the workflow service
   */
  async initialize() {
    try {
      console.log('Initializing Workflow Service');
      
      // Load workflow templates
      await this.loadWorkflowTemplates();
      
      // Load active workflows
      await this.loadActiveWorkflows();
      
      // Load tasks
      await this.loadTasks();
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing Workflow Service:', error);
      throw error;
    }
  }
  
  /**
   * Load workflow templates
   */
  async loadWorkflowTemplates() {
    try {
      console.log('Loading workflow templates');
      
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate workflow templates
      const mockTemplates = [
        {
          id: 'template-001',
          name: 'IND Submission',
          description: 'Complete workflow for preparing and submitting an IND application',
          moduleId: 'ind-wizard',
          steps: [
            {
              id: 'step-001',
              name: 'Pre-IND Meeting',
              description: 'Schedule and conduct pre-IND meeting with FDA',
              isRequired: true,
              estimatedDuration: 14, // days
              dependsOn: []
            },
            {
              id: 'step-002',
              name: 'Prepare Form 1571',
              description: 'Complete and review FDA Form 1571',
              isRequired: true,
              estimatedDuration: 7, // days
              dependsOn: ['step-001']
            },
            {
              id: 'step-003',
              name: 'Prepare CMC Section',
              description: 'Prepare Chemistry, Manufacturing, and Controls section',
              isRequired: true,
              estimatedDuration: 21, // days
              dependsOn: ['step-001']
            },
            {
              id: 'step-004',
              name: 'Submit IND',
              description: 'Submit final IND application to FDA',
              isRequired: true,
              estimatedDuration: 3, // days
              dependsOn: ['step-002', 'step-003']
            }
          ],
          createdAt: '2024-01-10T10:00:00Z',
          createdBy: 'Admin'
        },
        {
          id: 'template-002',
          name: 'CSR Development',
          description: 'Workflow for developing a Clinical Study Report (CSR)',
          moduleId: 'csr-intelligence',
          steps: [
            {
              id: 'step-001',
              name: 'Gather Study Data',
              description: 'Collect all study data and results',
              isRequired: true,
              estimatedDuration: 14, // days
              dependsOn: []
            },
            {
              id: 'step-002',
              name: 'Draft CSR',
              description: 'Prepare initial draft of CSR',
              isRequired: true,
              estimatedDuration: 30, // days
              dependsOn: ['step-001']
            },
            {
              id: 'step-003',
              name: 'Medical Review',
              description: 'Medical expert review of CSR',
              isRequired: true,
              estimatedDuration: 14, // days
              dependsOn: ['step-002']
            },
            {
              id: 'step-004',
              name: 'QC Review',
              description: 'Quality control review of CSR',
              isRequired: true,
              estimatedDuration: 7, // days
              dependsOn: ['step-003']
            },
            {
              id: 'step-005',
              name: 'Finalize CSR',
              description: 'Finalize CSR for submission',
              isRequired: true,
              estimatedDuration: 7, // days
              dependsOn: ['step-004']
            }
          ],
          createdAt: '2024-02-15T14:30:00Z',
          createdBy: 'Admin'
        }
      ];
      
      // Store templates
      mockTemplates.forEach(template => {
        this.templates.set(template.id, template);
      });
      
      console.log(`Loaded ${mockTemplates.length} workflow templates`);
      return true;
    } catch (error) {
      console.error('Error loading workflow templates:', error);
      throw error;
    }
  }
  
  /**
   * Load active workflows
   */
  async loadActiveWorkflows() {
    try {
      console.log('Loading active workflows');
      
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate active workflows
      const mockWorkflows = [
        {
          id: 'workflow-001',
          name: 'IND Submission - Project XYZ',
          templateId: 'template-001',
          status: 'In Progress',
          progress: 0.5, // 50% complete
          startDate: '2024-03-01T09:00:00Z',
          targetCompletionDate: '2024-05-15T17:00:00Z',
          actualCompletionDate: null,
          createdBy: 'John Smith',
          assignees: ['John Smith', 'Jane Doe', 'Robert Chen'],
          currentSteps: ['step-002', 'step-003'], // Currently active steps
          completedSteps: ['step-001'], // Completed steps
          projectId: 'project-xyz',
          moduleId: 'ind-wizard'
        },
        {
          id: 'workflow-002',
          name: 'CSR for Clinical Trial ABC-123',
          templateId: 'template-002',
          status: 'Not Started',
          progress: 0, // 0% complete
          startDate: '2024-04-15T09:00:00Z', // Future start date
          targetCompletionDate: '2024-06-30T17:00:00Z',
          actualCompletionDate: null,
          createdBy: 'Jane Doe',
          assignees: ['Jane Doe', 'Robert Chen', 'Alice Wong'],
          currentSteps: [], // No active steps yet
          completedSteps: [], // No completed steps yet
          projectId: 'project-abc',
          moduleId: 'csr-intelligence'
        }
      ];
      
      // Store workflows
      mockWorkflows.forEach(workflow => {
        this.workflows.set(workflow.id, workflow);
      });
      
      console.log(`Loaded ${mockWorkflows.length} active workflows`);
      return true;
    } catch (error) {
      console.error('Error loading active workflows:', error);
      throw error;
    }
  }
  
  /**
   * Load tasks
   */
  async loadTasks() {
    try {
      console.log('Loading tasks');
      
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate tasks
      const mockTasks = [
        {
          id: 'task-001',
          workflowId: 'workflow-001',
          stepId: 'step-002',
          name: 'Complete FDA Form 1571',
          description: 'Fill out and review the FDA Form 1571 for IND submission',
          status: 'In Progress',
          priority: 'High',
          assignedTo: 'John Smith',
          assignedBy: 'Jane Doe',
          assignedAt: '2024-03-15T10:00:00Z',
          dueDate: '2024-03-25T17:00:00Z',
          completedAt: null,
          comments: [
            {
              id: 'comment-001',
              text: 'Please ensure all investigator information is accurate',
              createdBy: 'Jane Doe',
              createdAt: '2024-03-16T11:30:00Z'
            }
          ]
        },
        {
          id: 'task-002',
          workflowId: 'workflow-001',
          stepId: 'step-003',
          name: 'Prepare CMC Documentation',
          description: 'Compile all Chemistry, Manufacturing, and Controls documentation',
          status: 'In Progress',
          priority: 'High',
          assignedTo: 'Robert Chen',
          assignedBy: 'Jane Doe',
          assignedAt: '2024-03-15T10:15:00Z',
          dueDate: '2024-04-05T17:00:00Z',
          completedAt: null,
          comments: []
        },
        {
          id: 'task-003',
          workflowId: 'workflow-001',
          stepId: 'step-001',
          name: 'Pre-IND Meeting Preparation',
          description: 'Prepare materials for Pre-IND meeting with FDA',
          status: 'Completed',
          priority: 'High',
          assignedTo: 'Jane Doe',
          assignedBy: 'Jane Doe',
          assignedAt: '2024-03-01T10:00:00Z',
          dueDate: '2024-03-10T17:00:00Z',
          completedAt: '2024-03-08T15:45:00Z',
          comments: [
            {
              id: 'comment-002',
              text: 'Meeting successful, received positive feedback from FDA',
              createdBy: 'Jane Doe',
              createdAt: '2024-03-08T16:00:00Z'
            }
          ]
        }
      ];
      
      // Store tasks
      mockTasks.forEach(task => {
        this.tasks.set(task.id, task);
        
        // Update task assignments
        const assignee = task.assignedTo;
        if (!this.taskAssignments.has(assignee)) {
          this.taskAssignments.set(assignee, []);
        }
        this.taskAssignments.get(assignee).push(task.id);
      });
      
      console.log(`Loaded ${mockTasks.length} tasks`);
      return true;
    } catch (error) {
      console.error('Error loading tasks:', error);
      throw error;
    }
  }
  
  /**
   * Get all workflow templates
   */
  getWorkflowTemplates() {
    if (!this.isInitialized) {
      throw new Error('Workflow Service not initialized');
    }
    
    return Array.from(this.templates.values());
  }
  
  /**
   * Get workflow template by ID
   */
  getWorkflowTemplate(templateId) {
    if (!this.isInitialized) {
      throw new Error('Workflow Service not initialized');
    }
    
    return this.templates.get(templateId);
  }
  
  /**
   * Get workflow templates for a specific module
   */
  getWorkflowTemplatesByModule(moduleId) {
    if (!this.isInitialized) {
      throw new Error('Workflow Service not initialized');
    }
    
    return this.getWorkflowTemplates().filter(template => template.moduleId === moduleId);
  }
  
  /**
   * Get all active workflows
   */
  getActiveWorkflows() {
    if (!this.isInitialized) {
      throw new Error('Workflow Service not initialized');
    }
    
    return Array.from(this.workflows.values());
  }
  
  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId) {
    if (!this.isInitialized) {
      throw new Error('Workflow Service not initialized');
    }
    
    return this.workflows.get(workflowId);
  }
  
  /**
   * Get workflows by module
   */
  getWorkflowsByModule(moduleId) {
    if (!this.isInitialized) {
      throw new Error('Workflow Service not initialized');
    }
    
    return this.getActiveWorkflows().filter(workflow => workflow.moduleId === moduleId);
  }
  
  /**
   * Get all tasks
   */
  getAllTasks() {
    if (!this.isInitialized) {
      throw new Error('Workflow Service not initialized');
    }
    
    return Array.from(this.tasks.values());
  }
  
  /**
   * Get task by ID
   */
  getTask(taskId) {
    if (!this.isInitialized) {
      throw new Error('Workflow Service not initialized');
    }
    
    return this.tasks.get(taskId);
  }
  
  /**
   * Get tasks for a specific workflow
   */
  getTasksByWorkflow(workflowId) {
    if (!this.isInitialized) {
      throw new Error('Workflow Service not initialized');
    }
    
    return this.getAllTasks().filter(task => task.workflowId === workflowId);
  }
  
  /**
   * Get tasks assigned to a specific user
   */
  getTasksByAssignee(username) {
    if (!this.isInitialized) {
      throw new Error('Workflow Service not initialized');
    }
    
    const taskIds = this.taskAssignments.get(username) || [];
    return taskIds.map(id => this.tasks.get(id)).filter(Boolean);
  }
  
  /**
   * Create a new workflow from a template
   */
  async createWorkflow(workflowData) {
    if (!this.isInitialized) {
      throw new Error('Workflow Service not initialized');
    }
    
    try {
      console.log('Creating workflow from template:', workflowData.templateId);
      
      const template = this.templates.get(workflowData.templateId);
      
      if (!template) {
        throw new Error(`Template not found: ${workflowData.templateId}`);
      }
      
      // Simulate creation delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Create workflow
      const workflow = {
        id: `workflow-${Date.now()}`,
        templateId: workflowData.templateId,
        name: workflowData.name,
        status: 'Not Started',
        progress: 0,
        startDate: workflowData.startDate || new Date().toISOString(),
        targetCompletionDate: workflowData.targetCompletionDate,
        actualCompletionDate: null,
        createdBy: workflowData.createdBy,
        assignees: workflowData.assignees || [],
        currentSteps: [],
        completedSteps: [],
        projectId: workflowData.projectId,
        moduleId: template.moduleId,
        createdAt: new Date().toISOString()
      };
      
      // Store workflow
      this.workflows.set(workflow.id, workflow);
      
      console.log('Workflow created successfully:', workflow.id);
      return workflow;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  }
  
  /**
   * Start a workflow
   */
  async startWorkflow(workflowId) {
    if (!this.isInitialized) {
      throw new Error('Workflow Service not initialized');
    }
    
    try {
      console.log('Starting workflow:', workflowId);
      
      const workflow = this.workflows.get(workflowId);
      
      if (!workflow) {
        throw new Error(`Workflow not found: ${workflowId}`);
      }
      
      // Simulate start delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get template
      const template = this.templates.get(workflow.templateId);
      
      if (!template) {
        throw new Error(`Template not found: ${workflow.templateId}`);
      }
      
      // Get initial steps (those without dependencies)
      const initialSteps = template.steps.filter(step => step.dependsOn.length === 0);
      
      // Update workflow status
      const updatedWorkflow = {
        ...workflow,
        status: 'In Progress',
        startDate: new Date().toISOString(),
        currentSteps: initialSteps.map(step => step.id)
      };
      
      this.workflows.set(workflowId, updatedWorkflow);
      
      // Create tasks for initial steps
      for (const step of initialSteps) {
        // Create a task for the step
        const assignee = workflow.assignees.length > 0 ? workflow.assignees[0] : null;
        
        if (assignee) {
          const task = {
            id: `task-${Date.now()}-${step.id}`,
            workflowId,
            stepId: step.id,
            name: step.name,
            description: step.description,
            status: 'Not Started',
            priority: 'Medium',
            assignedTo: assignee,
            assignedBy: workflow.createdBy,
            assignedAt: new Date().toISOString(),
            dueDate: null, // Would calculate based on step duration
            completedAt: null,
            comments: []
          };
          
          this.tasks.set(task.id, task);
          
          // Update task assignments
          if (!this.taskAssignments.has(assignee)) {
            this.taskAssignments.set(assignee, []);
          }
          this.taskAssignments.get(assignee).push(task.id);
        }
      }
      
      console.log('Workflow started successfully:', workflowId);
      return updatedWorkflow;
    } catch (error) {
      console.error('Error starting workflow:', error);
      throw error;
    }
  }
  
  /**
   * Update task status
   */
  async updateTaskStatus(taskId, statusData) {
    if (!this.isInitialized) {
      throw new Error('Workflow Service not initialized');
    }
    
    try {
      console.log('Updating task status:', taskId);
      
      const task = this.tasks.get(taskId);
      
      if (!task) {
        throw new Error(`Task not found: ${taskId}`);
      }
      
      // Simulate update delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update task
      const updatedTask = {
        ...task,
        status: statusData.status,
        completedAt: statusData.status === 'Completed' ? new Date().toISOString() : task.completedAt
      };
      
      this.tasks.set(taskId, updatedTask);
      
      // If task is completed, update workflow progress
      if (statusData.status === 'Completed') {
        const workflow = this.workflows.get(task.workflowId);
        
        if (workflow) {
          const workflowTasks = this.getTasksByWorkflow(task.workflowId);
          const completedTasks = workflowTasks.filter(t => t.status === 'Completed');
          const progress = workflowTasks.length > 0 ? completedTasks.length / workflowTasks.length : 0;
          
          const updatedWorkflow = {
            ...workflow,
            progress,
            completedSteps: [...workflow.completedSteps, task.stepId],
            currentSteps: workflow.currentSteps.filter(id => id !== task.stepId)
          };
          
          // Check if all steps are completed
          if (updatedWorkflow.progress >= 1) {
            updatedWorkflow.status = 'Completed';
            updatedWorkflow.actualCompletionDate = new Date().toISOString();
          }
          
          this.workflows.set(workflow.id, updatedWorkflow);
        }
      }
      
      console.log('Task status updated successfully:', taskId);
      return updatedTask;
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }
  
  /**
   * Add a comment to a task
   */
  async addTaskComment(taskId, commentData) {
    if (!this.isInitialized) {
      throw new Error('Workflow Service not initialized');
    }
    
    try {
      console.log('Adding comment to task:', taskId);
      
      const task = this.tasks.get(taskId);
      
      if (!task) {
        throw new Error(`Task not found: ${taskId}`);
      }
      
      // Simulate comment addition delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Create comment
      const comment = {
        id: `comment-${Date.now()}`,
        text: commentData.text,
        createdBy: commentData.createdBy,
        createdAt: new Date().toISOString()
      };
      
      // Update task with new comment
      const updatedTask = {
        ...task,
        comments: [...task.comments, comment]
      };
      
      this.tasks.set(taskId, updatedTask);
      
      console.log('Comment added successfully to task:', taskId);
      return comment;
    } catch (error) {
      console.error('Error adding comment to task:', error);
      throw error;
    }
  }
  
  /**
   * Reassign a task
   */
  async reassignTask(taskId, reassignData) {
    if (!this.isInitialized) {
      throw new Error('Workflow Service not initialized');
    }
    
    try {
      console.log('Reassigning task:', taskId);
      
      const task = this.tasks.get(taskId);
      
      if (!task) {
        throw new Error(`Task not found: ${taskId}`);
      }
      
      // Simulate reassignment delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update task assignments
      if (task.assignedTo) {
        const currentAssigneeTaskIds = this.taskAssignments.get(task.assignedTo) || [];
        const updatedTaskIds = currentAssigneeTaskIds.filter(id => id !== taskId);
        this.taskAssignments.set(task.assignedTo, updatedTaskIds);
      }
      
      // Update task with new assignee
      const updatedTask = {
        ...task,
        assignedTo: reassignData.assignedTo,
        assignedBy: reassignData.assignedBy,
        assignedAt: new Date().toISOString()
      };
      
      this.tasks.set(taskId, updatedTask);
      
      // Add task to new assignee's list
      if (!this.taskAssignments.has(reassignData.assignedTo)) {
        this.taskAssignments.set(reassignData.assignedTo, []);
      }
      this.taskAssignments.get(reassignData.assignedTo).push(taskId);
      
      console.log('Task reassigned successfully:', taskId);
      return updatedTask;
    } catch (error) {
      console.error('Error reassigning task:', error);
      throw error;
    }
  }
  
  /**
   * Clean up resources
   */
  cleanup() {
    this.isInitialized = false;
    console.log('Workflow Service cleaned up');
  }
}

export default WorkflowService;