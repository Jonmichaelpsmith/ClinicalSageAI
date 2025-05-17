/**
 * Simple API Server for Development Testing
 * 
 * This is a standalone Express server that serves our API endpoints
 * without the complexity of the main application.
 */

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 4000; // Use a different port from main app

// Middleware
app.use(cors());
app.use(express.json());

// Sample document templates
const templates = [
  {
    id: 1,
    title: 'Clinical Overview Template',
    category: 'clinical',
    module: 'Module 2.5',
    lastUpdated: 'May 5, 2025',
    version: '2.3',
    creator: 'Regulatory Team',
    usageCount: 128,
    description:
      'Standard template for creating eCTD-compliant Clinical Overview documents with proper formatting and structure.',
    tags: ['eCTD', 'clinical', 'module 2.5'],
    compliance: 'FDA, EMA, PMDA',
    templateID: '09933',
  },
  {
    id: 2,
    title: 'Module 3 Quality Template',
    category: 'quality',
    module: 'Module 3',
    lastUpdated: 'Apr 23, 2025',
    version: '1.5',
    creator: 'CMC Department',
    usageCount: 87,
    description:
      'Comprehensive template for all Module 3 Chemistry, Manufacturing and Controls sections with pre-defined headings.',
    tags: ['eCTD', 'quality', 'module 3', 'CMC'],
    compliance: 'FDA, EMA, Health Canada',
    templateID: 'QU3002',
  },
  {
    id: 3,
    title: 'NDA Cover Letter Template',
    category: 'administrative',
    module: 'Module 1.1',
    lastUpdated: 'Feb 11, 2025',
    version: '3.1',
    creator: 'Regulatory Affairs',
    usageCount: 215,
    description:
      'Standard format for cover letters to accompany New Drug Application submissions.',
    tags: ['eCTD', 'administrative', 'cover letter', 'NDA'],
    compliance: 'FDA, Health Canada',
    templateID: 'CL1001',
  },
  {
    id: 4,
    title: 'Clinical Study Report Template',
    category: 'clinical',
    module: 'Module 5',
    lastUpdated: 'Mar 17, 2025',
    version: '2.0',
    creator: 'Clinical Team',
    usageCount: 93,
    description:
      'Structured template for creating ICH E3-compliant clinical study reports with all required sections.',
    tags: ['eCTD', 'clinical', 'CSR', 'module 5'],
    compliance: 'ICH, FDA, EMA, PMDA',
    templateID: 'CSR5001',
  },
  {
    id: 5,
    title: 'Nonclinical Overview Template',
    category: 'nonclinical',
    module: 'Module 2.4',
    lastUpdated: 'Jan 24, 2025',
    version: '1.8',
    creator: 'Toxicology Team',
    usageCount: 62,
    description:
      'Template for creating the Nonclinical Overview section with predefined formatting and guidance.',
    tags: ['eCTD', 'nonclinical', 'toxicology', 'module 2.4'],
    compliance: 'FDA, EMA',
    templateID: 'NC2401',
  },
  {
    id: 6,
    title: 'Risk Management Plan Template',
    category: 'clinical',
    module: 'Module 1.8.2',
    lastUpdated: 'Apr 2, 2025',
    version: '3.2',
    creator: 'Pharmacovigilance',
    usageCount: 48,
    description:
      'EMA-compliant Risk Management Plan template with all required sections and formatting.',
    tags: ['eCTD', 'clinical', 'RMP', 'risk management'],
    compliance: 'EMA',
    templateID: 'RMP1001',
  },
];

// Templates endpoint with optional search and category filters
app.get('/api/templates', (req, res) => {
  const { search = '', category } = req.query;

  let results = templates;

  if (category && category !== 'all') {
    results = results.filter((t) => t.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  res.status(200).json({ success: true, templates: results });
});

// Vault documents endpoint
app.get('/api/vault/recent-docs', (req, res) => {
  const recentDocs = [
    {
      id: 1,
      name: 'IND-2025-034-Protocol.docx',
      type: 'Protocol',
      uploadedAt: '2025-04-26',
      uploadedBy: 'Sarah Johnson',
    },
    {
      id: 2,
      name: 'CSR-2024-089-Draft.pdf',
      type: 'CSR Draft',
      uploadedAt: '2025-04-25',
      uploadedBy: 'Mark Wilson',
    },
    {
      id: 3,
      name: 'Investigator_Brochure_v2.pdf',
      type: 'IB',
      uploadedAt: '2025-04-24',
      uploadedBy: 'Emily Chen',
    },
    {
      id: 4,
      name: 'BTX-331-SummaryStats.xlsx',
      type: 'Statistics',
      uploadedAt: '2025-04-23',
      uploadedBy: 'David Lee',
    },
    {
      id: 5,
      name: 'CIR-507-Amendment-Draft.docx',
      type: 'Protocol Amendment',
      uploadedAt: '2025-04-22',
      uploadedBy: 'Jennifer Smith',
    }
  ];
  
  res.status(200).json({
    success: true,
    data: recentDocs
  });
});

// Next actions endpoint
app.get('/api/next-actions', (req, res) => {
  const actions = [
    {
      id: 1,
      title: 'Review Protocol Draft',
      description: 'Review draft protocol for BTX-331 Phase 1 study',
      dueDate: '2025-05-05',
      priority: 'high',
      status: 'pending',
      projectId: 'ind-2025-034',
      assignedTo: 'james.wilson'
    },
    {
      id: 2,
      title: 'Complete Safety Narrative',
      description: 'Finalize safety narrative for CSR section 12.3',
      dueDate: '2025-05-08',
      priority: 'medium',
      status: 'in-progress',
      projectId: 'csr-2024-089',
      assignedTo: 'emily.chen'
    },
    {
      id: 3,
      title: 'IB Risk Assessment Review',
      description: 'Review risk assessment section in Investigator\'s Brochure',
      dueDate: '2025-05-12',
      priority: 'medium',
      status: 'pending',
      projectId: 'protocol-507',
      assignedTo: 'john.davis'
    }
  ];
  
  res.status(200).json({
    success: true,
    data: actions
  });
});

// Analytics metrics endpoint
app.get('/api/analytics/metrics', (req, res) => {
  const analyticsMetrics = {
    submissionsLast90Days: 8,
    avgReviewTimeDays: 32,
    delayRiskPercent: 25,
  };
  
  res.status(200).json({
    success: true,
    data: analyticsMetrics
  });
});

// Projects endpoint
app.get('/api/projects', (req, res) => {
  const projects = [
    {
      id: 'ind-2025-034',
      name: 'BTX-331 IND Application',
      type: 'IND',
      status: 'In Progress',
      dueDate: '2025-06-15',
      progress: 65,
      client: 'Biotech Innovations'
    },
    {
      id: 'csr-2024-089',
      name: 'BX-107 Clinical Study Report',
      type: 'CSR',
      status: 'In Review',
      dueDate: '2025-05-30',
      progress: 85,
      client: 'MediPharm Solutions'
    },
    {
      id: 'protocol-507',
      name: 'CIR-507 Protocol Amendment',
      type: 'Protocol',
      status: 'Draft',
      dueDate: '2025-07-10',
      progress: 25,
      client: 'CliniRx Research'
    }
  ];
  
  res.status(200).json({
    success: true,
    data: projects
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Simple API server running on port ${PORT}`);
});