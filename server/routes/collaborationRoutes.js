const express = require('express');
const router = express.Router();
const logger = require('../utils/logger').createLogger('collaboration-routes');
const { validateCSRF } = require('../middleware/security');

// In-memory message store (for demo - will be replaced with database storage)
let messages = [];
let tasks = [];
let milestones = [];
let approvals = [];

// Audit log for collaboration activity
let auditLog = [];

/**
 * @route GET /api/collaboration/messages
 * @description Get all messages for a project
 */
router.get('/messages', validateCSRF, async (req, res) => {
  try {
    const { projectId, moduleType } = req.query;
    
    if (!projectId || !moduleType) {
      return res.status(400).json({ error: 'Project ID and module type are required' });
    }
    
    // Filter messages by project and module
    const filteredMessages = messages.filter(
      message => message.projectId === projectId && message.moduleType === moduleType
    );
    
    res.json(filteredMessages);
  } catch (error) {
    logger.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch messages' });
  }
});

/**
 * @route POST /api/collaboration/messages
 * @description Add a new message
 */
router.post('/messages', validateCSRF, async (req, res) => {
  try {
    const { projectId, moduleType, content, sender, messageType = 'comment' } = req.body;
    
    if (!projectId || !moduleType || !content || !sender) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newMessage = {
      id: `msg-${Date.now()}`,
      projectId,
      moduleType,
      type: messageType,
      content,
      timestamp: new Date().toISOString(),
      sender
    };
    
    // Add to messages array
    messages.push(newMessage);
    
    // Add to audit log
    auditLog.push({
      action: 'message_created',
      resourceId: newMessage.id,
      resourceType: 'message',
      projectId,
      moduleType,
      userId: sender.id,
      timestamp: new Date().toISOString(),
      metadata: {
        messageType,
        contentLength: content.length
      }
    });
    
    res.status(201).json(newMessage);
  } catch (error) {
    logger.error('Error adding message:', error);
    res.status(500).json({ error: error.message || 'Failed to add message' });
  }
});

/**
 * @route GET /api/collaboration/tasks
 * @description Get all tasks for a project
 */
router.get('/tasks', validateCSRF, async (req, res) => {
  try {
    const { projectId, moduleType } = req.query;
    
    if (!projectId || !moduleType) {
      return res.status(400).json({ error: 'Project ID and module type are required' });
    }
    
    // Filter tasks by project and module
    const filteredTasks = tasks.filter(
      task => task.projectId === projectId && task.moduleType === moduleType
    );
    
    res.json(filteredTasks);
  } catch (error) {
    logger.error('Error fetching tasks:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch tasks' });
  }
});

/**
 * @route POST /api/collaboration/tasks
 * @description Create a new task
 */
router.post('/tasks', validateCSRF, async (req, res) => {
  try {
    const { 
      projectId, 
      moduleType, 
      title, 
      description, 
      assignee, 
      dueDate, 
      priority = 'medium', 
      status = 'pending',
      creator 
    } = req.body;
    
    if (!projectId || !moduleType || !title || !creator) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newTask = {
      id: `task-${Date.now()}`,
      projectId,
      moduleType,
      title,
      description,
      assignee,
      dueDate,
      priority,
      status,
      createdAt: new Date().toISOString(),
      createdBy: creator
    };
    
    // Add to tasks array
    tasks.push(newTask);
    
    // Add to audit log
    auditLog.push({
      action: 'task_created',
      resourceId: newTask.id,
      resourceType: 'task',
      projectId,
      moduleType,
      userId: creator.id,
      timestamp: new Date().toISOString(),
      metadata: {
        title,
        assignee,
        priority,
        status
      }
    });
    
    res.status(201).json(newTask);
  } catch (error) {
    logger.error('Error creating task:', error);
    res.status(500).json({ error: error.message || 'Failed to create task' });
  }
});

/**
 * @route PATCH /api/collaboration/tasks/:id
 * @description Update a task
 */
router.patch('/tasks/:id', validateCSRF, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignee, priority, dueDate, updatedBy } = req.body;
    
    // Find the task
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const originalTask = { ...tasks[taskIndex] };
    
    // Update the task
    const updatedTask = {
      ...originalTask,
      status: status || originalTask.status,
      assignee: assignee || originalTask.assignee,
      priority: priority || originalTask.priority,
      dueDate: dueDate || originalTask.dueDate,
      updatedAt: new Date().toISOString(),
      updatedBy
    };
    
    // Replace the task in the array
    tasks[taskIndex] = updatedTask;
    
    // Add to audit log
    auditLog.push({
      action: 'task_updated',
      resourceId: updatedTask.id,
      resourceType: 'task',
      projectId: updatedTask.projectId,
      moduleType: updatedTask.moduleType,
      userId: updatedBy.id,
      timestamp: new Date().toISOString(),
      metadata: {
        changes: {
          status: status !== originalTask.status ? { from: originalTask.status, to: status } : undefined,
          assignee: assignee !== originalTask.assignee ? { from: originalTask.assignee, to: assignee } : undefined,
          priority: priority !== originalTask.priority ? { from: originalTask.priority, to: priority } : undefined,
          dueDate: dueDate !== originalTask.dueDate ? { from: originalTask.dueDate, to: dueDate } : undefined
        }
      }
    });
    
    res.json(updatedTask);
  } catch (error) {
    logger.error('Error updating task:', error);
    res.status(500).json({ error: error.message || 'Failed to update task' });
  }
});

/**
 * @route GET /api/collaboration/milestones
 * @description Get all milestones for a project
 */
router.get('/milestones', validateCSRF, async (req, res) => {
  try {
    const { projectId, moduleType } = req.query;
    
    if (!projectId || !moduleType) {
      return res.status(400).json({ error: 'Project ID and module type are required' });
    }
    
    // Filter milestones by project and module
    const filteredMilestones = milestones.filter(
      milestone => milestone.projectId === projectId && milestone.moduleType === moduleType
    );
    
    res.json(filteredMilestones);
  } catch (error) {
    logger.error('Error fetching milestones:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch milestones' });
  }
});

/**
 * @route POST /api/collaboration/milestones
 * @description Create a new milestone
 */
router.post('/milestones', validateCSRF, async (req, res) => {
  try {
    const { 
      projectId, 
      moduleType, 
      title, 
      description, 
      dueDate, 
      status = 'active',
      creator 
    } = req.body;
    
    if (!projectId || !moduleType || !title || !creator) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newMilestone = {
      id: `milestone-${Date.now()}`,
      projectId,
      moduleType,
      title,
      description,
      dueDate,
      status,
      createdAt: new Date().toISOString(),
      createdBy: creator
    };
    
    // Add to milestones array
    milestones.push(newMilestone);
    
    // Add to audit log
    auditLog.push({
      action: 'milestone_created',
      resourceId: newMilestone.id,
      resourceType: 'milestone',
      projectId,
      moduleType,
      userId: creator.id,
      timestamp: new Date().toISOString(),
      metadata: {
        title,
        dueDate,
        status
      }
    });
    
    res.status(201).json(newMilestone);
  } catch (error) {
    logger.error('Error creating milestone:', error);
    res.status(500).json({ error: error.message || 'Failed to create milestone' });
  }
});

/**
 * @route PATCH /api/collaboration/milestones/:id
 * @description Update a milestone
 */
router.patch('/milestones/:id', validateCSRF, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, dueDate, updatedBy } = req.body;
    
    // Find the milestone
    const milestoneIndex = milestones.findIndex(milestone => milestone.id === id);
    
    if (milestoneIndex === -1) {
      return res.status(404).json({ error: 'Milestone not found' });
    }
    
    const originalMilestone = { ...milestones[milestoneIndex] };
    
    // Update the milestone
    const updatedMilestone = {
      ...originalMilestone,
      status: status || originalMilestone.status,
      dueDate: dueDate || originalMilestone.dueDate,
      updatedAt: new Date().toISOString(),
      updatedBy
    };
    
    // Replace the milestone in the array
    milestones[milestoneIndex] = updatedMilestone;
    
    // Add to audit log
    auditLog.push({
      action: 'milestone_updated',
      resourceId: updatedMilestone.id,
      resourceType: 'milestone',
      projectId: updatedMilestone.projectId,
      moduleType: updatedMilestone.moduleType,
      userId: updatedBy.id,
      timestamp: new Date().toISOString(),
      metadata: {
        changes: {
          status: status !== originalMilestone.status ? { from: originalMilestone.status, to: status } : undefined,
          dueDate: dueDate !== originalMilestone.dueDate ? { from: originalMilestone.dueDate, to: dueDate } : undefined
        }
      }
    });
    
    res.json(updatedMilestone);
  } catch (error) {
    logger.error('Error updating milestone:', error);
    res.status(500).json({ error: error.message || 'Failed to update milestone' });
  }
});

/**
 * @route GET /api/collaboration/approvals
 * @description Get all approvals for a project
 */
router.get('/approvals', validateCSRF, async (req, res) => {
  try {
    const { projectId, moduleType } = req.query;
    
    if (!projectId || !moduleType) {
      return res.status(400).json({ error: 'Project ID and module type are required' });
    }
    
    // Filter approvals by project and module
    const filteredApprovals = approvals.filter(
      approval => approval.projectId === projectId && approval.moduleType === moduleType
    );
    
    res.json(filteredApprovals);
  } catch (error) {
    logger.error('Error fetching approvals:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch approvals' });
  }
});

/**
 * @route POST /api/collaboration/approvals
 * @description Create a new approval request
 */
router.post('/approvals', validateCSRF, async (req, res) => {
  try {
    const { 
      projectId, 
      moduleType, 
      title, 
      description, 
      documentId,
      type = 'Document Approval',
      approvers,
      requester 
    } = req.body;
    
    if (!projectId || !moduleType || !title || !requester) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newApproval = {
      id: `approval-${Date.now()}`,
      projectId,
      moduleType,
      title,
      description,
      documentId,
      type,
      status: 'pending',
      approvers,
      requestedBy: requester,
      requestedAt: new Date().toISOString()
    };
    
    // Add to approvals array
    approvals.push(newApproval);
    
    // Add to audit log
    auditLog.push({
      action: 'approval_requested',
      resourceId: newApproval.id,
      resourceType: 'approval',
      projectId,
      moduleType,
      userId: requester.id,
      timestamp: new Date().toISOString(),
      metadata: {
        title,
        type,
        documentId,
        approvers
      }
    });
    
    res.status(201).json(newApproval);
  } catch (error) {
    logger.error('Error creating approval request:', error);
    res.status(500).json({ error: error.message || 'Failed to create approval request' });
  }
});

/**
 * @route PATCH /api/collaboration/approvals/:id
 * @description Update an approval request
 */
router.patch('/approvals/:id', validateCSRF, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment, approver } = req.body;
    
    // Find the approval
    const approvalIndex = approvals.findIndex(approval => approval.id === id);
    
    if (approvalIndex === -1) {
      return res.status(404).json({ error: 'Approval request not found' });
    }
    
    const originalApproval = { ...approvals[approvalIndex] };
    
    // Update the approval
    const updatedApproval = {
      ...originalApproval,
      status: status || originalApproval.status,
      approvedBy: status === 'approved' ? approver : undefined,
      approvedAt: status === 'approved' ? new Date().toISOString() : undefined,
      rejectedBy: status === 'rejected' ? approver : undefined,
      rejectedAt: status === 'rejected' ? new Date().toISOString() : undefined,
      comment
    };
    
    // Replace the approval in the array
    approvals[approvalIndex] = updatedApproval;
    
    // Add to audit log
    auditLog.push({
      action: `approval_${status}`,
      resourceId: updatedApproval.id,
      resourceType: 'approval',
      projectId: updatedApproval.projectId,
      moduleType: updatedApproval.moduleType,
      userId: approver.id,
      timestamp: new Date().toISOString(),
      metadata: {
        status,
        comment
      }
    });
    
    res.json(updatedApproval);
  } catch (error) {
    logger.error('Error updating approval request:', error);
    res.status(500).json({ error: error.message || 'Failed to update approval request' });
  }
});

/**
 * @route GET /api/collaboration/audit
 * @description Get audit logs for collaboration activities
 */
router.get('/audit', validateCSRF, async (req, res) => {
  try {
    const { projectId, moduleType, resourceType, userId, startDate, endDate } = req.query;
    
    let filteredLogs = [...auditLog];
    
    // Apply filters
    if (projectId) {
      filteredLogs = filteredLogs.filter(log => log.projectId === projectId);
    }
    
    if (moduleType) {
      filteredLogs = filteredLogs.filter(log => log.moduleType === moduleType);
    }
    
    if (resourceType) {
      filteredLogs = filteredLogs.filter(log => log.resourceType === resourceType);
    }
    
    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === userId);
    }
    
    if (startDate) {
      const start = new Date(startDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= end);
    }
    
    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json(filteredLogs);
  } catch (error) {
    logger.error('Error fetching audit logs:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch audit logs' });
  }
});

module.exports = router;