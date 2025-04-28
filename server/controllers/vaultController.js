// /server/controllers/vaultController.js

// Dummy recent documents data for now (later connect to database)
const recentDocuments = [
  {
    id: 1,
    name: 'Protocol_BTX331_v2.1.docx',
    type: 'protocol',
    size: '4.2 MB',
    uploadDate: '2025-04-27T15:32:00Z',
    projectId: 'ind-2025-034'
  },
  {
    id: 2,
    name: 'CMC_Module3_draft.pdf',
    type: 'regulatory',
    size: '8.7 MB',
    uploadDate: '2025-04-26T11:45:00Z',
    projectId: 'ind-2025-034'
  },
  {
    id: 3,
    name: 'Safety_Update_Q1_2025.xlsx',
    type: 'safety',
    size: '1.5 MB',
    uploadDate: '2025-04-25T09:12:00Z',
    projectId: 'csr-2024-089'
  },
  {
    id: 4,
    name: 'Investigator_Brochure_v2.pdf',
    type: 'ib',
    size: '12.3 MB',
    uploadDate: '2025-04-24T16:45:00Z',
    projectId: 'protocol-507'
  },
  {
    id: 5,
    name: 'SAE_Report_April_2025.pdf',
    type: 'safety',
    size: '0.8 MB',
    uploadDate: '2025-04-23T14:22:00Z',
    projectId: 'csr-2024-089'
  }
];

// Vault statistics
const vaultStats = {
  totalDocuments: 148,
  totalSize: "2.4 GB",
  securityLevel: "Enhanced",
  lastBackup: "2025-04-27T23:00:00Z"
};

// GET /api/vault/recent-docs
const getRecentDocuments = (req, res) => {
  try {
    // In a real application, we would filter by user ID and permissions
    const userId = req.query.userId || '1';
    const limit = parseInt(req.query.limit) || 3;
    
    const documents = recentDocuments.slice(0, limit);
    
    res.status(200).json({
      success: true,
      data: documents,
      stats: vaultStats
    });
  } catch (error) {
    console.error('Error fetching recent documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent documents',
    });
  }
};

module.exports = {
  getRecentDocuments,
};