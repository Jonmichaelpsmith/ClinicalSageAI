const express = require('express');
const router = express.Router();

// Merged Imports: Keeping necessary parts from both branches
const { db } = require('../db'); // From codex branch, for /logs GET route
// const { conversationLogs } = require('../../shared/schema'); // Schema not directly used in the final merged routes below, can be kept if needed elsewhere
const logger = require('../utils/logger').createLogger('collaboration-routes'); // From main branch
const { validateCSRF } = require('../middleware/security'); // From main branch

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
 * This version is from the 'main' branch, which includes CSRF validation and audit logging.
 * The database insertion logic from the 'codex' branch for conversation_logs 
 * would need to be integrated here if both in-memory and DB storage are desired for messages.
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
    
    // Add to in-memory messages array
    messages.push(newMessage);
    
    // Add to audit log
    auditLog.push({
      action: 'message_created',
      resourceId: newMessage.id,
      resourceType: 'message',
      projectId,
      moduleType,
      userId: sender.id, // Assuming sender has an id property
      timestamp: new Date().toISOString(),
      metadata: {
        messageType,
        contentLength: content.length
      }
    });

    // Optional: If database logging for messages is also required (from the codex branch intent)
    // try {
    //   await db.query(
    //     'INSERT INTO conversation_logs (project_id, user_id, module_type, message, role, timestamp) VALUES ($1, $2, $3, $4, $5, $6)',
    //     [newMessage.projectId, newMessage.sender.id, newMessage.moduleType, newMessage.content, newMessage.sender.role || 'user', newMessage.timestamp]
    //   );
    //   logger.info('Conversation log saved to database for message:', newMessage.id);
    // } catch (dbError) {
    //   logger.error('Failed to save conversation log to database for message:', newMessage.id, dbError);
    //   // Decide if this should be a critical error or just a warning
    // }
    
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
      return res.status(400).json({ error: 'Missing required fields (projectId, moduleType, title, creator)' });
    }
    
    const newTask = {
      id: `task-${Date.now()}`,
      projectId,
      moduleType,
      title,
      description,
      assignee, // Can be null or an object/ID
      dueDate,  // Can be null
      priority,
      status,
      createdAt: new Date().toISOString(),
      createdBy: creator // Assuming creator is an object with an id, e.g., { id: 'userId', name: 'User Name'}
    };
    
    tasks.push(newTask);
    
    auditLog.push({
      action: 'task_created',
      resourceId: newTask.id,
      resourceType: 'task',
      projectId,
      moduleType,
      userId: creator.id, // Assuming creator has an id
      timestamp: new Date().toISOString(),
      metadata: {
        title,
        assignee: assignee ? (assignee.id || assignee) : null, // Log assignee ID or the object itself
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
    const { status, assignee, priority, dueDate, updatedBy } = req.body; // updatedBy is crucial for audit
    
    if (!updatedBy || !updatedBy.id) {
        return res.status(400).json({ error: 'updatedBy field with an id is required for audit.' });
    }

    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const originalTask = { ...tasks[taskIndex] };
    
    const updatedTask = {
      ...originalTask,
      status: status !== undefined ? status : originalTask.status,
      assignee: assignee !== undefined ? assignee : originalTask.assignee,
      priority: priority !== undefined ? priority : originalTask.priority,
      dueDate: dueDate !== undefined ? dueDate : originalTask.dueDate,
      updatedAt: new Date().toISOString(),
      updatedBy 
    };
    
    tasks[taskIndex] = updatedTask;
    
    auditLog.push({
      action: 'task_updated',
      resourceId: updatedTask.id,
      resourceType: 'task',
      projectId: updatedTask.projectId,
      moduleType: updatedTask.moduleType,
      userId: updatedBy.id,
      timestamp: new Date().toISOString(),
      metadata: {
        changes: { // Log what actually changed
          status: status !== undefined && status !== originalTask.status ? { from: originalTask.status, to: status } : undefined,
          assignee: assignee !== undefined && assignee !== originalTask.assignee ? { from: originalTask.assignee, to: assignee } : undefined,
          priority: priority !== undefined && priority !== originalTask.priority ? { from: originalTask.priority, to: priority } : undefined,
          dueDate: dueDate !== undefined && dueDate !== originalTask.dueDate ? { from: originalTask.dueDate, to: dueDate } : undefined
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
      status = 'active', // Default status
      creator 
    } = req.body;
    
    if (!projectId || !moduleType || !title || !creator) {
      return res.status(400).json({ error: 'Missing required fields (projectId, moduleType, title, creator)' });
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
    
    milestones.push(newMilestone);
    
    auditLog.push({
      action: 'milestone_created',
      resourceId: newMilestone.id,
      resourceType: 'milestone',
      projectId,
      moduleType,
      userId: creator.id, // Assuming creator has an id
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
    const { status, dueDate, updatedBy } = req.body; // updatedBy is crucial
    
    if (!updatedBy || !updatedBy.id) {
        return res.status(400).json({ error: 'updatedBy field with an id is required for audit.' });
    }

    const milestoneIndex = milestones.findIndex(milestone => milestone.id === id);
    
    if (milestoneIndex === -1) {
      return res.status(404).json({ error: 'Milestone not found' });
    }
    
    const originalMilestone = { ...milestones[milestoneIndex] };
    
    const updatedMilestone = {
      ...originalMilestone,
      status: status !== undefined ? status : originalMilestone.status,
      dueDate: dueDate !== undefined ? dueDate : originalMilestone.dueDate,
      updatedAt: new Date().toISOString(),
      updatedBy
    };
    
    milestones[milestoneIndex] = updatedMilestone;
    
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
          status: status !== undefined && status !== originalMilestone.status ? { from: originalMilestone.status, to: status } : undefined,
          dueDate: dueDate !== undefined && dueDate !== originalMilestone.dueDate ? { from: originalMilestone.dueDate, to: dueDate } : undefined
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
      documentId, // ID of the document/item needing approval
      type = 'Document Approval', // Type of approval
      approvers, // Array of user IDs or user objects
      requester 
    } = req.body;
    
    if (!projectId || !moduleType || !title || !requester || !approvers || !Array.isArray(approvers) || approvers.length === 0) {
      return res.status(400).json({ error: 'Missing required fields (projectId, moduleType, title, requester, approvers array)' });
    }
    
    const newApproval = {
      id: `approval-${Date.now()}`,
      projectId,
      moduleType,
      title,
      description,
      documentId,
      type,
      status: 'pending', // Initial status
      approvers: approvers.map(appr => ({ userId: appr.id || appr, status: 'pending', comment: null })), // Store approver status
      requestedBy: requester,
      requestedAt: new Date().toISOString()
    };
    
    approvals.push(newApproval);
    
    auditLog.push({
      action: 'approval_requested',
      resourceId: newApproval.id,
      resourceType: 'approval',
      projectId,
      moduleType,
      userId: requester.id, // Assuming requester has an id
      timestamp: new Date().toISOString(),
      metadata: {
        title,
        type,
        documentId,
        approvers: approvers.map(appr => appr.id || appr) // Log IDs of approvers
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
 * @description Update an approval request (e.g., approve/reject by an approver)
 */
router.patch('/approvals/:id', validateCSRF, async (req, res) => {
  try {
    const { id } = req.params; // Approval ID
    const { status, comment, approver } = req.body; // 'approved' or 'rejected', comment, and the approver object {id, name}
    
    if (!status || !approver || !approver.id || (status !== 'approved' && status !== 'rejected')) {
      return res.status(400).json({ error: 'Missing required fields (status: "approved"|"rejected", approver object with id)' });
    }

    const approvalIndex = approvals.findIndex(approval => approval.id === id);
    
    if (approvalIndex === -1) {
      return res.status(404).json({ error: 'Approval request not found' });
    }
    
    const originalApproval = { ...approvals[approvalIndex] };
    const updatedApproval = JSON.parse(JSON.stringify(originalApproval)); // Deep copy

    let individualApproverUpdated = false;
    updatedApproval.approvers = updatedApproval.approvers.map(appr => {
        if (appr.userId === approver.id && appr.status === 'pending') {
            appr.status = status;
            appr.comment = comment || null;
            appr.actionTimestamp = new Date().toISOString();
            individualApproverUpdated = true;
        }
        return appr;
    });

    if (!individualApproverUpdated) {
        return res.status(403).json({ error: `Approver ${approver.id} not pending or not found in this request.`});
    }

    // Update overall status if all have approved or if one rejects
    const allApproved = updatedApproval.approvers.every(appr => appr.status === 'approved');
    const anyRejected = updatedApproval.approvers.some(appr => appr.status === 'rejected');

    if (anyRejected) {
        updatedApproval.status = 'rejected';
    } else if (allApproved) {
        updatedApproval.status = 'approved';
    }
    // else it remains 'pending' if some are still pending and none rejected

    updatedApproval.updatedAt = new Date().toISOString(); // General update timestamp for the request
        
    approvals[approvalIndex] = updatedApproval;
    
    auditLog.push({
      action: `approval_action_${status}`, // e.g., approval_action_approved
      resourceId: updatedApproval.id,
      resourceType: 'approval',
      projectId: updatedApproval.projectId,
      moduleType: updatedApproval.moduleType,
      userId: approver.id, // The user who took the action
      timestamp: new Date().toISOString(),
      metadata: {
        individualAction: status, // 'approved' or 'rejected'
        overallStatus: updatedApproval.status,
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
    const { projectId, moduleType, resourceType, userId, startDate, endDate, page = 1, pageSize = 20 } = req.query;
    
    let filteredLogs = [...auditLog]; // Start with a copy of all logs
    
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
      // Ensure comparison includes the whole end day if time is not specified
      end.setHours(23, 59, 59, 999); 
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= end);
    }
    
    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Pagination
    const limit = parseInt(pageSize, 10);
    const currentPage = parseInt(page, 10);
    const offset = (currentPage - 1) * limit;
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);
    const totalCount = filteredLogs.length;

    res.json({
        logs: paginatedLogs,
        totalCount,
        page: currentPage,
        pageSize: limit,
        totalPages: Math.ceil(totalCount / limit)
    });

  } catch (error) {
    logger.error('Error fetching audit logs:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch audit logs' });
  }
});

// Retrieve conversation logs with pagination (from codex branch, using 'db')
router.get('/logs', validateCSRF, async (req, res) => { // Added validateCSRF from main branch pattern
  const { projectId, moduleType, page = 1, pageSize = 20 } = req.query;

  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (projectId) {
    params.push(projectId);
    conditions.push(`project_id = $${paramIndex++}`);
  }

  if (moduleType) {
    params.push(moduleType);
    conditions.push(`module_type = $${paramIndex++}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const limit = parseInt(pageSize, 10);
  const offset = (parseInt(page, 10) - 1) * limit;

  try {
    const countQuery = `SELECT COUNT(*) FROM conversation_logs ${whereClause}`;
    logger.debug('Conversation logs count query:', countQuery, params.slice(0, paramIndex -1)); // Log query and params for count
    const countRes = await db.query(countQuery, params.slice(0, paramIndex -1)); // Params for count query shouldn't include limit/offset

    const queryParamsForLogs = [...params.slice(0, paramIndex -1), limit, offset];
    const logsQuery = `SELECT * FROM conversation_logs ${whereClause} ORDER BY timestamp DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    logger.debug('Conversation logs data query:', logsQuery, queryParamsForLogs); // Log query and params for data
    const logsRes = await db.query(logsQuery, queryParamsForLogs);

    const total = parseInt(countRes.rows[0].count, 10);

    res.json({
      logs: logsRes.rows,
      totalCount: total,
      page: parseInt(page, 10),
      pageSize: limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    logger.error('Failed to retrieve conversation logs from DB', err); // Use logger
    res.status(500).json({ message: 'Error retrieving logs from database' });
  }
});

module.exports = router;
