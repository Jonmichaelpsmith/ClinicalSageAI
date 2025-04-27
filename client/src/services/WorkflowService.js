/**
 * Workflow Service
 * 
 * This service manages workflows, tasks, and business processes
 * across the TrialSage platform. It orchestrates complex multi-step
 * processes like IND submissions, document review cycles, etc.
 */

import securityService from './SecurityService';

class WorkflowService {
  constructor() {
    // Workflow templates
    this.workflowTemplates = [
      {
        id: 'workflow-template-001',
        name: 'IND Submission Workflow',
        description: 'Standard workflow for preparing and submitting an IND to the FDA',
        module: 'ind-wizard',
        stages: [
          {
            id: 'stage-001',
            name: 'Document Collection',
            description: 'Collect all required documents for IND submission',
            tasks: [
              { id: 'task-001', name: 'Complete Form FDA 1571', description: 'Complete the IND application cover form' },
              { id: 'task-002', name: 'Prepare Protocol', description: 'Finalize the clinical protocol document' },
              { id: 'task-003', name: 'Prepare Investigator Brochure', description: 'Finalize the investigator brochure' },
              { id: 'task-004', name: 'Prepare CMC Documentation', description: 'Prepare chemistry, manufacturing, and controls documentation' },
              { id: 'task-005', name: 'Prepare Pharmacology/Toxicology Data', description: 'Compile pharmacology and toxicology data' }
            ]
          },
          {
            id: 'stage-002',
            name: 'Internal Review',
            description: 'Internal review and approval of IND documents',
            tasks: [
              { id: 'task-006', name: 'Medical Review', description: 'Medical team review of clinical documents' },
              { id: 'task-007', name: 'Regulatory Review', description: 'Regulatory team review of all documents' },
              { id: 'task-008', name: 'Legal Review', description: 'Legal team review of sensitive documents' },
              { id: 'task-009', name: 'Quality Check', description: 'Final quality check of all documents' }
            ]
          },
          {
            id: 'stage-003',
            name: 'Submission',
            description: 'Submission of the IND to the FDA',
            tasks: [
              { id: 'task-010', name: 'Compile Final Submission', description: 'Compile all documents into the final submission package' },
              { id: 'task-011', name: 'Submit to FDA', description: 'Submit the IND application to the FDA' },
              { id: 'task-012', name: 'Confirmation', description: 'Receive confirmation of submission from the FDA' },
              { id: 'task-013', name: 'Track Review Status', description: 'Track the review status of the IND application' }
            ]
          }
        ]
      },
      {
        id: 'workflow-template-002',
        name: 'CSR Development Workflow',
        description: 'Workflow for developing a Clinical Study Report',
        module: 'csr-intelligence',
        stages: [
          {
            id: 'stage-101',
            name: 'Planning',
            description: 'Planning and setup for CSR development',
            tasks: [
              { id: 'task-101', name: 'Define CSR Team', description: 'Define team members and roles for CSR development' },
              { id: 'task-102', name: 'Create CSR Shell', description: 'Create the CSR shell document based on ICH E3 template' },
              { id: 'task-103', name: 'Data Collection Plan', description: 'Define data collection plan for the CSR' }
            ]
          },
          {
            id: 'stage-102',
            name: 'Content Development',
            description: 'Development of CSR content',
            tasks: [
              { id: 'task-104', name: 'Methods Section', description: 'Draft the methods section of the CSR' },
              { id: 'task-105', name: 'Results Section', description: 'Draft the results section of the CSR' },
              { id: 'task-106', name: 'Discussion Section', description: 'Draft the discussion section of the CSR' },
              { id: 'task-107', name: 'Conclusion Section', description: 'Draft the conclusion section of the CSR' },
              { id: 'task-108', name: 'Appendices', description: 'Prepare all required appendices' }
            ]
          },
          {
            id: 'stage-103',
            name: 'Review & Finalization',
            description: 'Review and finalization of the CSR',
            tasks: [
              { id: 'task-109', name: 'Internal Review', description: 'Conduct internal review of the CSR' },
              { id: 'task-110', name: 'Address Comments', description: 'Address all review comments' },
              { id: 'task-111', name: 'QC Check', description: 'Perform quality control check of the final CSR' },
              { id: 'task-112', name: 'Approval', description: 'Obtain final approval of the CSR' },
              { id: 'task-113', name: 'Archiving', description: 'Archive the final CSR and all supporting documents' }
            ]
          }
        ]
      }
    ];
    
    // Active workflows
    this.activeWorkflows = [
      {
        id: 'workflow-001',
        templateId: 'workflow-template-001',
        name: 'IND Submission - Phase 1 Oncology Study',
        description: 'IND submission for Phase 1 study in oncology',
        module: 'ind-wizard',
        status: 'in-progress',
        progress: 35,
        createdAt: '2024-03-10',
        updatedAt: '2024-03-25',
        currentStage: 'stage-001',
        owner: 'John Smith',
        participants: [
          { id: 'user-001', name: 'John Smith', role: 'owner' },
          { id: 'user-003', name: 'Sarah Johnson', role: 'reviewer' },
          { id: 'user-004', name: 'Michael Lee', role: 'contributor' }
        ],
        stageStatuses: {
          'stage-001': {
            status: 'in-progress',
            startedAt: '2024-03-10',
            completedAt: null,
            tasks: {
              'task-001': { status: 'completed', completedAt: '2024-03-15', assignedTo: 'user-001' },
              'task-002': { status: 'completed', completedAt: '2024-03-20', assignedTo: 'user-004' },
              'task-003': { status: 'in-progress', completedAt: null, assignedTo: 'user-004' },
              'task-004': { status: 'not-started', completedAt: null, assignedTo: 'user-003' },
              'task-005': { status: 'not-started', completedAt: null, assignedTo: null }
            }
          },
          'stage-002': {
            status: 'not-started',
            startedAt: null,
            completedAt: null,
            tasks: {
              'task-006': { status: 'not-started', completedAt: null, assignedTo: null },
              'task-007': { status: 'not-started', completedAt: null, assignedTo: null },
              'task-008': { status: 'not-started', completedAt: null, assignedTo: null },
              'task-009': { status: 'not-started', completedAt: null, assignedTo: null }
            }
          },
          'stage-003': {
            status: 'not-started',
            startedAt: null,
            completedAt: null,
            tasks: {
              'task-010': { status: 'not-started', completedAt: null, assignedTo: null },
              'task-011': { status: 'not-started', completedAt: null, assignedTo: null },
              'task-012': { status: 'not-started', completedAt: null, assignedTo: null },
              'task-013': { status: 'not-started', completedAt: null, assignedTo: null }
            }
          }
        }
      },
      {
        id: 'workflow-002',
        templateId: 'workflow-template-002',
        name: 'CSR - Phase 2 Cardiology Study',
        description: 'CSR development for Phase 2 cardiology study',
        module: 'csr-intelligence',
        status: 'in-progress',
        progress: 60,
        createdAt: '2024-02-15',
        updatedAt: '2024-03-20',
        currentStage: 'stage-102',
        owner: 'Emily Davis',
        participants: [
          { id: 'user-002', name: 'Emily Davis', role: 'owner' },
          { id: 'user-001', name: 'John Smith', role: 'reviewer' },
          { id: 'user-005', name: 'David Wilson', role: 'contributor' }
        ],
        stageStatuses: {
          'stage-101': {
            status: 'completed',
            startedAt: '2024-02-15',
            completedAt: '2024-02-28',
            tasks: {
              'task-101': { status: 'completed', completedAt: '2024-02-20', assignedTo: 'user-002' },
              'task-102': { status: 'completed', completedAt: '2024-02-25', assignedTo: 'user-002' },
              'task-103': { status: 'completed', completedAt: '2024-02-28', assignedTo: 'user-005' }
            }
          },
          'stage-102': {
            status: 'in-progress',
            startedAt: '2024-03-01',
            completedAt: null,
            tasks: {
              'task-104': { status: 'completed', completedAt: '2024-03-10', assignedTo: 'user-002' },
              'task-105': { status: 'completed', completedAt: '2024-03-15', assignedTo: 'user-005' },
              'task-106': { status: 'in-progress', completedAt: null, assignedTo: 'user-005' },
              'task-107': { status: 'not-started', completedAt: null, assignedTo: 'user-002' },
              'task-108': { status: 'in-progress', completedAt: null, assignedTo: 'user-005' }
            }
          },
          'stage-103': {
            status: 'not-started',
            startedAt: null,
            completedAt: null,
            tasks: {
              'task-109': { status: 'not-started', completedAt: null, assignedTo: null },
              'task-110': { status: 'not-started', completedAt: null, assignedTo: null },
              'task-111': { status: 'not-started', completedAt: null, assignedTo: null },
              'task-112': { status: 'not-started', completedAt: null, assignedTo: null },
              'task-113': { status: 'not-started', completedAt: null, assignedTo: null }
            }
          }
        }
      }
    ];
    
    // Workflow history
    this.workflowHistory = [
      {
        id: 'history-001',
        workflowId: 'workflow-001',
        event: 'workflow_created',
        timestamp: '2024-03-10T09:30:00Z',
        user: 'John Smith',
        details: 'Workflow created'
      },
      {
        id: 'history-002',
        workflowId: 'workflow-001',
        event: 'task_completed',
        timestamp: '2024-03-15T14:45:00Z',
        user: 'John Smith',
        details: 'Task "Complete Form FDA 1571" completed'
      },
      {
        id: 'history-003',
        workflowId: 'workflow-001',
        event: 'task_completed',
        timestamp: '2024-03-20T11:15:00Z',
        user: 'Michael Lee',
        details: 'Task "Prepare Protocol" completed'
      },
      {
        id: 'history-004',
        workflowId: 'workflow-001',
        event: 'task_assigned',
        timestamp: '2024-03-20T11:30:00Z',
        user: 'John Smith',
        details: 'Task "Prepare CMC Documentation" assigned to Sarah Johnson'
      }
    ];
  }
  
  /**
   * Get workflow templates
   * @param {string} module - Filter by module
   * @returns {Promise<Array>} - Array of workflow templates
   */
  async getWorkflowTemplates(module) {
    console.log(`[Workflow] Getting workflow templates for module: ${module || 'all'}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter by module if provided
    if (module) {
      return this.workflowTemplates.filter(template => template.module === module);
    }
    
    return this.workflowTemplates;
  }
  
  /**
   * Get active workflows
   * @param {object} options - Filter options
   * @returns {Promise<Array>} - Array of active workflows
   */
  async getActiveWorkflows(options = {}) {
    console.log('[Workflow] Getting active workflows with options:', options);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get current organization ID
    const organizationId = securityService.currentOrganization?.id;
    if (!organizationId) {
      throw new Error('No organization selected');
    }
    
    // Filter workflows (in a real implementation, workflows would be filtered by organization)
    let filteredWorkflows = [...this.activeWorkflows];
    
    // Apply module filter if provided
    if (options.module) {
      filteredWorkflows = filteredWorkflows.filter(workflow => 
        workflow.module === options.module
      );
    }
    
    // Apply status filter if provided
    if (options.status) {
      filteredWorkflows = filteredWorkflows.filter(workflow => 
        workflow.status === options.status
      );
    }
    
    // Apply owner filter if provided
    if (options.owner) {
      filteredWorkflows = filteredWorkflows.filter(workflow => 
        workflow.owner === options.owner
      );
    }
    
    return filteredWorkflows;
  }
  
  /**
   * Get a workflow by ID
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<object>} - Workflow details
   */
  async getWorkflow(workflowId) {
    console.log(`[Workflow] Getting workflow: ${workflowId}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Find workflow
    const workflow = this.activeWorkflows.find(w => w.id === workflowId);
    
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }
    
    // Find template for this workflow
    const template = this.workflowTemplates.find(t => t.id === workflow.templateId);
    
    if (!template) {
      throw new Error(`Workflow template not found: ${workflow.templateId}`);
    }
    
    // Return workflow with template data
    return {
      ...workflow,
      template
    };
  }
  
  /**
   * Create a new workflow
   * @param {object} workflowData - Workflow data
   * @returns {Promise<object>} - Created workflow
   */
  async createWorkflow(workflowData) {
    console.log('[Workflow] Creating workflow:', workflowData);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Validate required fields
    if (!workflowData.templateId || !workflowData.name) {
      throw new Error('Template ID and name are required');
    }
    
    // Find template
    const template = this.workflowTemplates.find(t => t.id === workflowData.templateId);
    
    if (!template) {
      throw new Error(`Workflow template not found: ${workflowData.templateId}`);
    }
    
    // Get current user
    const currentUser = securityService.currentUser;
    if (!currentUser) {
      throw new Error('Not authenticated');
    }
    
    // Initialize stage statuses from template
    const stageStatuses = {};
    let firstStageId = null;
    
    template.stages.forEach((stage, index) => {
      if (index === 0) {
        firstStageId = stage.id;
      }
      
      const tasks = {};
      stage.tasks.forEach(task => {
        tasks[task.id] = {
          status: index === 0 ? 'not-started' : 'not-started',
          completedAt: null,
          assignedTo: null
        };
      });
      
      stageStatuses[stage.id] = {
        status: index === 0 ? 'in-progress' : 'not-started',
        startedAt: index === 0 ? new Date().toISOString() : null,
        completedAt: null,
        tasks
      };
    });
    
    // Create new workflow
    const newWorkflow = {
      id: `workflow-${Date.now()}`,
      templateId: workflowData.templateId,
      name: workflowData.name,
      description: workflowData.description || template.description,
      module: template.module,
      status: 'in-progress',
      progress: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      currentStage: firstStageId,
      owner: `${currentUser.firstName} ${currentUser.lastName}`,
      participants: [
        { 
          id: currentUser.id, 
          name: `${currentUser.firstName} ${currentUser.lastName}`, 
          role: 'owner' 
        }
      ],
      stageStatuses
    };
    
    // Add to workflows collection
    this.activeWorkflows.push(newWorkflow);
    
    // Record history event
    this.recordWorkflowEvent(newWorkflow.id, 'workflow_created', 'Workflow created');
    
    return {
      ...newWorkflow,
      template
    };
  }
  
  /**
   * Update a workflow
   * @param {string} workflowId - Workflow ID
   * @param {object} updates - Fields to update
   * @returns {Promise<object>} - Updated workflow
   */
  async updateWorkflow(workflowId, updates) {
    console.log(`[Workflow] Updating workflow ${workflowId}:`, updates);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find workflow index
    const workflowIndex = this.activeWorkflows.findIndex(w => w.id === workflowId);
    
    if (workflowIndex === -1) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }
    
    // Update workflow fields
    const updatedWorkflow = {
      ...this.activeWorkflows[workflowIndex],
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    // Replace workflow in collection
    this.activeWorkflows[workflowIndex] = updatedWorkflow;
    
    // Find template for this workflow
    const template = this.workflowTemplates.find(t => t.id === updatedWorkflow.templateId);
    
    return {
      ...updatedWorkflow,
      template
    };
  }
  
  /**
   * Complete a task in a workflow
   * @param {string} workflowId - Workflow ID
   * @param {string} taskId - Task ID
   * @returns {Promise<object>} - Updated workflow
   */
  async completeTask(workflowId, taskId) {
    console.log(`[Workflow] Completing task ${taskId} in workflow ${workflowId}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get workflow
    const workflowIndex = this.activeWorkflows.findIndex(w => w.id === workflowId);
    
    if (workflowIndex === -1) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }
    
    const workflow = this.activeWorkflows[workflowIndex];
    
    // Find the stage containing this task
    let taskStageId = null;
    let taskFound = false;
    
    Object.entries(workflow.stageStatuses).forEach(([stageId, stage]) => {
      if (taskId in stage.tasks) {
        taskStageId = stageId;
        taskFound = true;
      }
    });
    
    if (!taskFound || !taskStageId) {
      throw new Error(`Task not found: ${taskId}`);
    }
    
    // Update task status
    const updatedStageStatuses = { ...workflow.stageStatuses };
    updatedStageStatuses[taskStageId].tasks[taskId] = {
      ...updatedStageStatuses[taskStageId].tasks[taskId],
      status: 'completed',
      completedAt: new Date().toISOString()
    };
    
    // Check if all tasks in the stage are completed
    const allTasksCompleted = Object.values(updatedStageStatuses[taskStageId].tasks)
      .every(task => task.status === 'completed');
    
    // If all tasks are completed, mark the stage as completed
    if (allTasksCompleted) {
      updatedStageStatuses[taskStageId] = {
        ...updatedStageStatuses[taskStageId],
        status: 'completed',
        completedAt: new Date().toISOString()
      };
      
      // Find the next stage
      const template = this.workflowTemplates.find(t => t.id === workflow.templateId);
      if (template) {
        const stageIndex = template.stages.findIndex(stage => stage.id === taskStageId);
        if (stageIndex >= 0 && stageIndex < template.stages.length - 1) {
          const nextStage = template.stages[stageIndex + 1];
          updatedStageStatuses[nextStage.id] = {
            ...updatedStageStatuses[nextStage.id],
            status: 'in-progress',
            startedAt: new Date().toISOString()
          };
          
          // Update current stage
          workflow.currentStage = nextStage.id;
        } else if (stageIndex === template.stages.length - 1) {
          // This was the final stage
          workflow.status = 'completed';
          workflow.progress = 100;
        }
      }
    }
    
    // Calculate progress percentage
    const template = this.workflowTemplates.find(t => t.id === workflow.templateId);
    if (template) {
      let totalTasks = 0;
      let completedTasks = 0;
      
      Object.values(updatedStageStatuses).forEach(stage => {
        Object.values(stage.tasks).forEach(task => {
          totalTasks++;
          if (task.status === 'completed') {
            completedTasks++;
          }
        });
      });
      
      workflow.progress = Math.round((completedTasks / totalTasks) * 100);
    }
    
    // Update workflow
    const updatedWorkflow = {
      ...workflow,
      stageStatuses: updatedStageStatuses,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    // Replace workflow in collection
    this.activeWorkflows[workflowIndex] = updatedWorkflow;
    
    // Record history event
    const taskName = this.getTaskName(workflow.templateId, taskId);
    this.recordWorkflowEvent(
      workflowId, 
      'task_completed', 
      `Task "${taskName}" completed`
    );
    
    return updatedWorkflow;
  }
  
  /**
   * Assign a task to a user
   * @param {string} workflowId - Workflow ID
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID
   * @returns {Promise<object>} - Updated workflow
   */
  async assignTask(workflowId, taskId, userId) {
    console.log(`[Workflow] Assigning task ${taskId} to user ${userId} in workflow ${workflowId}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get workflow
    const workflowIndex = this.activeWorkflows.findIndex(w => w.id === workflowId);
    
    if (workflowIndex === -1) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }
    
    const workflow = this.activeWorkflows[workflowIndex];
    
    // Find the stage containing this task
    let taskStageId = null;
    let taskFound = false;
    
    Object.entries(workflow.stageStatuses).forEach(([stageId, stage]) => {
      if (taskId in stage.tasks) {
        taskStageId = stageId;
        taskFound = true;
      }
    });
    
    if (!taskFound || !taskStageId) {
      throw new Error(`Task not found: ${taskId}`);
    }
    
    // Update task assignment
    const updatedStageStatuses = { ...workflow.stageStatuses };
    updatedStageStatuses[taskStageId].tasks[taskId] = {
      ...updatedStageStatuses[taskStageId].tasks[taskId],
      assignedTo: userId
    };
    
    // Update workflow
    const updatedWorkflow = {
      ...workflow,
      stageStatuses: updatedStageStatuses,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    // Replace workflow in collection
    this.activeWorkflows[workflowIndex] = updatedWorkflow;
    
    // Record history event
    const taskName = this.getTaskName(workflow.templateId, taskId);
    const userName = this.getUserName(userId);
    this.recordWorkflowEvent(
      workflowId, 
      'task_assigned', 
      `Task "${taskName}" assigned to ${userName}`
    );
    
    return updatedWorkflow;
  }
  
  /**
   * Get workflow history
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<Array>} - Array of history events
   */
  async getWorkflowHistory(workflowId) {
    console.log(`[Workflow] Getting history for workflow: ${workflowId}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter history events for this workflow
    const history = this.workflowHistory.filter(event => 
      event.workflowId === workflowId
    );
    
    // Sort by timestamp (newest first)
    history.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return history;
  }
  
  // Helper methods
  
  /**
   * Record a workflow event in the history
   * @param {string} workflowId - Workflow ID
   * @param {string} event - Event type
   * @param {string} details - Event details
   */
  recordWorkflowEvent(workflowId, event, details) {
    // Get current user
    const currentUser = securityService.currentUser;
    const userName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System';
    
    // Create history entry
    const historyEntry = {
      id: `history-${Date.now()}`,
      workflowId,
      event,
      timestamp: new Date().toISOString(),
      user: userName,
      details
    };
    
    // Add to history collection
    this.workflowHistory.push(historyEntry);
  }
  
  /**
   * Get task name from template
   * @param {string} templateId - Template ID
   * @param {string} taskId - Task ID
   * @returns {string} - Task name
   */
  getTaskName(templateId, taskId) {
    // Find template
    const template = this.workflowTemplates.find(t => t.id === templateId);
    if (!template) return 'Unknown Task';
    
    // Find task in template
    for (const stage of template.stages) {
      const task = stage.tasks.find(t => t.id === taskId);
      if (task) return task.name;
    }
    
    return 'Unknown Task';
  }
  
  /**
   * Get user name
   * @param {string} userId - User ID
   * @returns {string} - User name
   */
  getUserName(userId) {
    // In a real implementation, this would look up the user in a user database
    
    // Hardcoded user names for demo
    const users = {
      'user-001': 'John Smith',
      'user-002': 'Emily Davis',
      'user-003': 'Sarah Johnson',
      'user-004': 'Michael Lee',
      'user-005': 'David Wilson'
    };
    
    return users[userId] || 'Unknown User';
  }
}

// Export a singleton instance
const workflowService = new WorkflowService();
export default workflowService;