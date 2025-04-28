// /server/controllers/projectController.js

// Dummy live project data for now (later connect to database)
const projects = [
  {
    projectId: 'ind-2025-034',
    projectName: 'IND-2025-034',
    clientName: 'NeuraTech Biomedical',
    studyType: 'IND',
    phase: 'Pre-IND',
    percentComplete: 65,
    status: 'in_progress',
    missingItems: ['CMC Module 3.2', 'Nonclinical Study Reports'],
    dueDate: '2025-05-20',
  },
  {
    projectId: 'csr-2024-089',
    projectName: 'CSR-2024-089',
    clientName: 'SynaptiCure',
    studyType: 'CSR',
    phase: 'CSR Drafting',
    percentComplete: 100,
    status: 'complete',
    missingItems: [],
    dueDate: '2025-04-30',
  },
  {
    projectId: 'protocol-507',
    projectName: 'Protocol-507',
    clientName: 'GenomaCure',
    studyType: 'CRC',
    phase: 'Startup',
    percentComplete: 42,
    status: 'at_risk',
    missingItems: ['IRB Approval', 'Site Activation'],
    dueDate: '2025-06-10',
  },
];

// GET /api/projects/status
const getProjectsStatus = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error('Error fetching project status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project status',
    });
  }
};

module.exports = {
  getProjectsStatus,
};