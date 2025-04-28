// /server/controllers/actionsController.js

// Dummy next actions data for now (later connect to database)
const nextActions = [
  {
    id: 1,
    projectId: 'ind-2025-034',
    action: 'Draft CMC Section (Module 3.2)',
    description: 'Complete CMC Module 3.2 for IND-2025-034',
    urgency: 'high',
    dueDate: '2025-05-20',
    link: '/ind-wizard/cmcdoc/3.2',
  },
  {
    id: 2,
    projectId: 'csr-2024-089',
    action: 'Finalize Safety Section in CSR',
    description: 'Complete Safety Section in CSR-2024-089',
    urgency: 'medium',
    dueDate: '2025-05-25',
    link: '/csr-analyzer/safety-section',
  },
  {
    id: 3,
    projectId: 'protocol-507',
    action: 'Upload Final Investigator Brochure',
    description: 'Upload Final Investigator Brochure for Protocol-507',
    urgency: 'high',
    dueDate: '2025-05-22',
    link: '/vault/upload/ib',
  },
  {
    id: 4,
    projectId: 'ind-2025-034',
    action: 'Review Nonclinical Study Reports',
    description: 'Review Nonclinical Study Reports for IND-2025-034',
    urgency: 'medium',
    dueDate: '2025-05-27',
    link: '/ind-wizard/nonclinical',
  },
  {
    id: 5,
    projectId: 'protocol-507',
    action: 'Submit IRB Approval',
    description: 'Submit IRB Approval for Protocol-507',
    urgency: 'high',
    dueDate: '2025-05-18',
    link: '/study-architect/irb-submission',
  }
];

// GET /api/next-actions
const getNextActions = (req, res) => {
  try {
    // In a real application, we would filter by user ID
    const userId = req.query.userId || '1';
    
    // For demo purposes, we're returning all actions
    // In production, this would be filtered by user permissions
    res.status(200).json({
      success: true,
      data: nextActions,
    });
  } catch (error) {
    console.error('Error fetching next actions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch next actions',
    });
  }
};

module.exports = {
  getNextActions,
};