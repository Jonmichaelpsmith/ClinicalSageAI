// /server/controllers/actionsController.js

// Dummy next actions for now
const nextActions = [
  {
    taskId: 1,
    projectId: 'ind-2025-034',
    actionDescription: 'Draft CMC Section (Module 3.2)',
    urgency: 'high',
    dueDate: '2025-05-20',
    link: '/ind-wizard/cmcdoc/3.2',
  },
  {
    taskId: 2,
    projectId: 'csr-2024-089',
    actionDescription: 'Finalize Safety Section in CSR',
    urgency: 'medium',
    dueDate: '2025-05-25',
    link: '/csr-analyzer/safety-section',
  },
  {
    taskId: 3,
    projectId: 'protocol-507',
    actionDescription: 'Upload Final Investigator Brochure',
    urgency: 'high',
    dueDate: '2025-05-22',
    link: '/vault/upload/ib',
  },
  {
    taskId: 4,
    projectId: 'ind-2025-034',
    actionDescription: 'Review Preclinical Data Summary',
    urgency: 'low',
    dueDate: '2025-06-05',
    link: '/ind-wizard/preclinical',
  },
  {
    taskId: 5,
    projectId: 'csr-2024-089',
    actionDescription: 'Finalize Statistical Analysis Plan',
    urgency: 'medium',
    dueDate: '2025-05-30',
    link: '/csr-analyzer/stats-plan',
  }
];

// GET /api/next-actions - Get all actions
export const getAllActions = (req, res) => {
  try {
    // Sort by urgency (high first) and then by due date
    const sortedActions = [...nextActions].sort((a, b) => {
      const urgencyOrder = { high: 1, medium: 2, low: 3 };
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
    
    res.status(200).json({
      success: true,
      data: sortedActions,
    });
  } catch (error) {
    console.error('Error fetching next actions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch next actions',
    });
  }
};

// GET /api/next-actions/user/:userId - Get actions for a specific user
export const getActionsByUser = (req, res) => {
  try {
    const { userId } = req.params;
    // In a real app, we would filter by user permissions
    // For now, just return all actions
    
    res.status(200).json({
      success: true,
      data: nextActions,
      userId
    });
  } catch (error) {
    console.error('Error fetching user actions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user actions',
    });
  }
};

// GET /api/next-actions/project/:projectId - Get actions for a specific project
export const getActionsByProject = (req, res) => {
  try {
    const { projectId } = req.params;
    const projectActions = nextActions.filter(action => action.projectId === projectId);
    
    res.status(200).json({
      success: true,
      data: projectActions,
      projectId
    });
  } catch (error) {
    console.error('Error fetching project actions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project actions',
    });
  }
};

// GET /api/next-actions/priority/:level - Get actions by priority level
export const getActionsByPriority = (req, res) => {
  try {
    const { level } = req.params;
    const priorityActions = nextActions.filter(action => action.urgency === level);
    
    res.status(200).json({
      success: true,
      data: priorityActions,
      priorityLevel: level
    });
  } catch (error) {
    console.error('Error fetching priority actions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch priority actions',
    });
  }
};

// POST /api/next-actions - Create a new action
export const createAction = (req, res) => {
  try {
    const newAction = req.body;
    // In a real app, we would validate the action data
    // Then save to database
    
    // For now, just return success with dummy data
    res.status(201).json({
      success: true,
      message: 'Action created successfully',
      data: {
        taskId: nextActions.length + 1,
        ...newAction,
      }
    });
  } catch (error) {
    console.error('Error creating action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create action',
    });
  }
};

// PUT /api/next-actions/:id - Update an existing action
export const updateAction = (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // In a real app, we would check if action exists
    // Then update in database
    
    res.status(200).json({
      success: true,
      message: `Action ${id} updated successfully`,
      data: {
        taskId: parseInt(id),
        ...updates,
      }
    });
  } catch (error) {
    console.error('Error updating action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update action',
    });
  }
};

// DELETE /api/next-actions/:id - Delete an action
export const deleteAction = (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real app, we would check if action exists
    // Then delete from database
    
    res.status(200).json({
      success: true,
      message: `Action ${id} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete action',
    });
  }
};

// PUT /api/next-actions/:id/complete - Mark an action as complete
export const completeAction = (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real app, we would check if action exists
    // Then mark as complete in database
    
    res.status(200).json({
      success: true,
      message: `Action ${id} marked as complete`,
      data: {
        taskId: parseInt(id),
        completed: true,
        completedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error completing action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete action',
    });
  }
};