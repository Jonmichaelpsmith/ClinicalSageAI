import { Router } from 'express';

// Create a new router for regulatory submission endpoints
const router = Router();

/**
 * Get all regulatory submission projects
 * API: GET /api/regulatory-submissions/projects
 */
router.get('/projects', (req, res) => {
  try {
    // Mock data for regulatory submission projects
    const projects = [
      { 
        id: '1001', 
        name: 'NDA Submission for DRUG-X-500', 
        status: 'in-progress',
        submissionType: 'NDA',
        targetSubmissionDate: '2025-07-30T00:00:00Z',
        createdAt: '2025-03-15T14:22:43Z',
        updatedAt: '2025-05-09T10:15:30Z',
        organizationId: '1',
        clientWorkspaceId: '101',
        owner: 'Jane Smith',
        sequenceNumber: 'SEQ-001',
        regulatory_authority: 'FDA',
        progress: 65,
        modules: {
          m1: { status: 'complete', documents: 12 },
          m2: { status: 'in-progress', documents: 8 },
          m3: { status: 'in-progress', documents: 15 },
          m4: { status: 'not-started', documents: 0 },
          m5: { status: 'not-started', documents: 0 }
        }
      },
      { 
        id: '1002', 
        name: 'MAA for Medical Device XYZ', 
        status: 'planning',
        submissionType: 'MAA',
        targetSubmissionDate: '2025-09-15T00:00:00Z',
        createdAt: '2025-04-10T09:30:22Z',
        updatedAt: '2025-05-08T16:45:12Z',
        organizationId: '1',
        clientWorkspaceId: '102',
        owner: 'Robert Johnson',
        sequenceNumber: 'SEQ-001',
        regulatory_authority: 'EMA',
        progress: 25,
        modules: {
          m1: { status: 'in-progress', documents: 5 },
          m2: { status: 'in-progress', documents: 3 },
          m3: { status: 'not-started', documents: 0 },
          m4: { status: 'not-started', documents: 0 },
          m5: { status: 'not-started', documents: 0 }
        }
      },
      { 
        id: '1003', 
        name: 'Annual Report - DRUG-Z-250', 
        status: 'review',
        submissionType: 'Annual Report',
        targetSubmissionDate: '2025-06-10T00:00:00Z',
        createdAt: '2025-04-25T13:45:10Z',
        updatedAt: '2025-05-07T11:20:18Z',
        organizationId: '2',
        clientWorkspaceId: '201',
        owner: 'Michael Chen',
        sequenceNumber: 'SEQ-005',
        regulatory_authority: 'FDA',
        progress: 85,
        modules: {
          m1: { status: 'complete', documents: 8 },
          m2: { status: 'complete', documents: 6 },
          m3: { status: 'in-progress', documents: 10 },
          m4: { status: 'not-required', documents: 0 },
          m5: { status: 'not-required', documents: 0 }
        }
      }
    ];

    // Filter by organization ID if provided
    const { organizationId } = req.query;
    let filteredProjects = projects;
    
    if (organizationId) {
      filteredProjects = projects.filter(project => project.organizationId === organizationId);
    }

    res.json({
      success: true,
      projects: filteredProjects
    });
  } catch (error) {
    console.error('Error fetching regulatory submission projects:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch regulatory submission projects'
    });
  }
});

/**
 * Get regulatory submission project by ID
 * API: GET /api/regulatory-submissions/projects/:id
 */
router.get('/projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock data for project details based on ID
    const projects = {
      '1001': { 
        id: '1001', 
        name: 'NDA Submission for DRUG-X-500', 
        status: 'in-progress',
        submissionType: 'NDA',
        targetSubmissionDate: '2025-07-30T00:00:00Z',
        createdAt: '2025-03-15T14:22:43Z',
        updatedAt: '2025-05-09T10:15:30Z',
        organizationId: '1',
        clientWorkspaceId: '101',
        owner: 'Jane Smith',
        sequenceNumber: 'SEQ-001',
        regulatory_authority: 'FDA',
        progress: 65,
        modules: {
          m1: { status: 'complete', documents: 12 },
          m2: { status: 'in-progress', documents: 8 },
          m3: { status: 'in-progress', documents: 15 },
          m4: { status: 'not-started', documents: 0 },
          m5: { status: 'not-started', documents: 0 }
        },
        timeline: [
          { date: '2025-03-15T14:22:43Z', event: 'Project created' },
          { date: '2025-04-02T09:30:00Z', event: 'Module 1 completed' },
          { date: '2025-04-25T15:45:22Z', event: 'Module 2 started' },
          { date: '2025-05-09T10:15:30Z', event: 'Module 3 started' }
        ],
        team: [
          { id: 'user-101', name: 'Jane Smith', role: 'Project Manager' },
          { id: 'user-102', name: 'Alex Johnson', role: 'Regulatory Affairs Director' },
          { id: 'user-103', name: 'Maria Garcia', role: 'Medical Writer' },
          { id: 'user-104', name: 'David Kim', role: 'Biostatistician' }
        ]
      },
      '1002': { 
        id: '1002', 
        name: 'MAA for Medical Device XYZ', 
        status: 'planning',
        submissionType: 'MAA',
        targetSubmissionDate: '2025-09-15T00:00:00Z',
        createdAt: '2025-04-10T09:30:22Z',
        updatedAt: '2025-05-08T16:45:12Z',
        organizationId: '1',
        clientWorkspaceId: '102',
        owner: 'Robert Johnson',
        sequenceNumber: 'SEQ-001',
        regulatory_authority: 'EMA',
        progress: 25,
        modules: {
          m1: { status: 'in-progress', documents: 5 },
          m2: { status: 'in-progress', documents: 3 },
          m3: { status: 'not-started', documents: 0 },
          m4: { status: 'not-started', documents: 0 },
          m5: { status: 'not-started', documents: 0 }
        },
        timeline: [
          { date: '2025-04-10T09:30:22Z', event: 'Project created' },
          { date: '2025-04-25T11:00:00Z', event: 'Module 1 started' },
          { date: '2025-05-05T13:20:45Z', event: 'Module 2 started' }
        ],
        team: [
          { id: 'user-201', name: 'Robert Johnson', role: 'Project Manager' },
          { id: 'user-202', name: 'Emily Wilson', role: 'Technical Writer' },
          { id: 'user-203', name: 'James Taylor', role: 'Quality Assurance' }
        ]
      },
      '1003': { 
        id: '1003', 
        name: 'Annual Report - DRUG-Z-250', 
        status: 'review',
        submissionType: 'Annual Report',
        targetSubmissionDate: '2025-06-10T00:00:00Z',
        createdAt: '2025-04-25T13:45:10Z',
        updatedAt: '2025-05-07T11:20:18Z',
        organizationId: '2',
        clientWorkspaceId: '201',
        owner: 'Michael Chen',
        sequenceNumber: 'SEQ-005',
        regulatory_authority: 'FDA',
        progress: 85,
        modules: {
          m1: { status: 'complete', documents: 8 },
          m2: { status: 'complete', documents: 6 },
          m3: { status: 'in-progress', documents: 10 },
          m4: { status: 'not-required', documents: 0 },
          m5: { status: 'not-required', documents: 0 }
        },
        timeline: [
          { date: '2025-04-25T13:45:10Z', event: 'Project created' },
          { date: '2025-04-30T10:00:00Z', event: 'Module 1 completed' },
          { date: '2025-05-03T14:30:45Z', event: 'Module 2 completed' },
          { date: '2025-05-07T11:20:18Z', event: 'Module 3 started' }
        ],
        team: [
          { id: 'user-301', name: 'Michael Chen', role: 'Project Manager' },
          { id: 'user-302', name: 'Sarah Brown', role: 'Regulatory Affairs Specialist' },
          { id: 'user-303', name: 'Thomas Lee', role: 'Clinical Research Associate' }
        ]
      }
    };
    
    // Check if the requested project exists
    if (projects[id]) {
      res.json({
        success: true,
        project: projects[id]
      });
    } else {
      res.status(404).json({
        success: false,
        error: `Project with ID ${id} not found`
      });
    }
  } catch (error) {
    console.error(`Error fetching regulatory submission project ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch regulatory submission project details'
    });
  }
});

/**
 * Get all sequences for a regulatory submission project
 * API: GET /api/regulatory-submissions/projects/:id/sequences
 */
router.get('/projects/:id/sequences', (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock data for project sequences
    const projectSequences = {
      '1001': [
        {
          id: 'seq-1001-1',
          sequenceNumber: 'SEQ-001',
          submissionDate: '2025-04-15T00:00:00Z',
          status: 'submitted',
          description: 'Initial submission',
          documentCount: 25,
          submissionType: 'original',
          submittedBy: 'Jane Smith'
        },
        {
          id: 'seq-1001-2',
          sequenceNumber: 'SEQ-002',
          submissionDate: '2025-05-20T00:00:00Z',
          status: 'in-preparation',
          description: 'Response to information request',
          documentCount: 8,
          submissionType: 'amendment',
          submittedBy: null
        }
      ],
      '1002': [
        {
          id: 'seq-1002-1',
          sequenceNumber: 'SEQ-001',
          submissionDate: '2025-05-30T00:00:00Z',
          status: 'in-preparation',
          description: 'Initial submission',
          documentCount: 15,
          submissionType: 'original',
          submittedBy: null
        }
      ],
      '1003': [
        {
          id: 'seq-1003-1',
          sequenceNumber: 'SEQ-001',
          submissionDate: '2024-06-15T00:00:00Z',
          status: 'submitted',
          description: 'Initial submission',
          documentCount: 20,
          submissionType: 'original',
          submittedBy: 'Michael Chen'
        },
        {
          id: 'seq-1003-2',
          sequenceNumber: 'SEQ-002',
          submissionDate: '2024-09-10T00:00:00Z',
          status: 'submitted',
          description: 'Response to deficiency letter',
          documentCount: 12,
          submissionType: 'amendment',
          submittedBy: 'Michael Chen'
        },
        {
          id: 'seq-1003-3',
          sequenceNumber: 'SEQ-003',
          submissionDate: '2024-12-05T00:00:00Z',
          status: 'submitted',
          description: 'Stability update',
          documentCount: 8,
          submissionType: 'amendment',
          submittedBy: 'Sarah Brown'
        },
        {
          id: 'seq-1003-4',
          sequenceNumber: 'SEQ-004',
          submissionDate: '2025-03-20T00:00:00Z',
          status: 'submitted',
          description: 'Annual report - previous period',
          documentCount: 18,
          submissionType: 'report',
          submittedBy: 'Sarah Brown'
        },
        {
          id: 'seq-1003-5',
          sequenceNumber: 'SEQ-005',
          submissionDate: '2025-06-10T00:00:00Z',
          status: 'in-preparation',
          description: 'Annual report - current period',
          documentCount: 14,
          submissionType: 'report',
          submittedBy: null
        }
      ]
    };
    
    // Check if the requested project has sequences
    if (projectSequences[id]) {
      res.json({
        success: true,
        sequences: projectSequences[id]
      });
    } else {
      res.json({
        success: true,
        sequences: []
      });
    }
  } catch (error) {
    console.error(`Error fetching sequences for project ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project sequences'
    });
  }
});

/**
 * Get all documents for a regulatory submission project
 * API: GET /api/regulatory-submissions/projects/:id/documents
 */
router.get('/projects/:id/documents', (req, res) => {
  try {
    const { id } = req.params;
    
    // Generic document list for all projects with a few variations
    const documents = [];
    
    // Documents for Module 1
    documents.push(
      {
        id: `doc-${id}-m1-1`,
        name: 'Cover Letter',
        module: 'm1',
        section: '1.0',
        status: 'approved',
        version: '1.2',
        lastUpdated: '2025-05-05T14:22:10Z',
        author: 'Jane Smith',
        size: 245789,
        format: 'pdf',
        locked: false
      },
      {
        id: `doc-${id}-m1-2`,
        name: 'Application Form',
        module: 'm1',
        section: '1.2',
        status: 'approved',
        version: '2.0',
        lastUpdated: '2025-05-02T10:15:33Z',
        author: 'Robert Johnson',
        size: 1245678,
        format: 'pdf',
        locked: false
      }
    );
    
    // Documents for Module 2
    documents.push(
      {
        id: `doc-${id}-m2-1`,
        name: 'CTD Overview',
        module: 'm2',
        section: '2.1',
        status: id === '1003' ? 'approved' : 'in-review',
        version: '1.0',
        lastUpdated: '2025-04-28T15:40:22Z',
        author: 'Maria Garcia',
        size: 3456789,
        format: 'docx',
        locked: false
      },
      {
        id: `doc-${id}-m2-2`,
        name: 'Quality Overall Summary',
        module: 'm2',
        section: '2.3',
        status: id === '1003' ? 'approved' : 'draft',
        version: '0.8',
        lastUpdated: '2025-04-25T11:30:45Z',
        author: 'David Kim',
        size: 2789456,
        format: 'docx',
        locked: false
      }
    );
    
    // Documents for Module 3 (only if not project 1002)
    if (id !== '1002') {
      documents.push(
        {
          id: `doc-${id}-m3-1`,
          name: 'Drug Substance',
          module: 'm3',
          section: '3.2.S',
          status: 'draft',
          version: '0.5',
          lastUpdated: '2025-04-20T09:15:30Z',
          author: 'James Taylor',
          size: 4567890,
          format: 'docx',
          locked: false
        },
        {
          id: `doc-${id}-m3-2`,
          name: 'Drug Product',
          module: 'm3',
          section: '3.2.P',
          status: 'draft',
          version: '0.3',
          lastUpdated: '2025-04-18T16:22:10Z',
          author: 'Emily Wilson',
          size: 5678901,
          format: 'docx',
          locked: false
        }
      );
    }
    
    res.json({
      success: true,
      documents
    });
  } catch (error) {
    console.error(`Error fetching documents for project ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project documents'
    });
  }
});

/**
 * Get organization settings for regulatory submissions
 * API: GET /api/organizations/:id/settings
 */
router.get('/organizations/:id/settings', (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock settings based on organization ID
    const settingsData = {
      '1': {
        organizationId: '1',
        submissionSettings: {
          defaultRegulatory: 'FDA',
          applicationFormTemplate: 'FDA-356h',
          requireDoubleReview: true,
          autoGenerateSequenceNumbers: true,
          sequenceNumberFormat: 'SEQ-{YY}{MM}-{000}',
          retentionPeriod: 7, // years
          securityLevel: 'enhanced'
        },
        documentSettings: {
          namingConvention: '{sequence}_{module}_{section}_{name}_{date}',
          allowedFormats: ['pdf', 'docx', 'xlsx'],
          maxFileSize: 100, // MB
          enforceVersionControl: true,
          requiredMetadata: ['author', 'version', 'reviewDate']
        },
        workflowSettings: {
          enforceApprovalWorkflow: true,
          approvalLevels: 2,
          notifyOnStatusChange: true,
          escalateOverdueTasks: true,
          taskEscalationThreshold: 48 // hours
        },
        regulatoryIntelligence: {
          enabled: true,
          autoCheckGuidelines: true,
          alertFrequency: 'weekly',
          trackedAuthorities: ['FDA', 'EMA', 'PMDA', 'Health Canada']
        },
        submissions: {
          ectdValidation: true,
          validateBeforeSubmission: true,
          archiveSubmittedSequences: true,
          generateTransmissionReport: true
        }
      },
      '2': {
        organizationId: '2',
        submissionSettings: {
          defaultRegulatory: 'EMA',
          applicationFormTemplate: 'EU-MAA',
          requireDoubleReview: false,
          autoGenerateSequenceNumbers: true,
          sequenceNumberFormat: '{YYYY}-{MM}-{000}',
          retentionPeriod: 10, // years
          securityLevel: 'standard'
        },
        documentSettings: {
          namingConvention: '{name}_{version}_{date}',
          allowedFormats: ['pdf', 'docx', 'xlsx', 'pptx'],
          maxFileSize: 250, // MB
          enforceVersionControl: true,
          requiredMetadata: ['author', 'version', 'department']
        },
        workflowSettings: {
          enforceApprovalWorkflow: true,
          approvalLevels: 3,
          notifyOnStatusChange: true,
          escalateOverdueTasks: false,
          taskEscalationThreshold: 72 // hours
        },
        regulatoryIntelligence: {
          enabled: true,
          autoCheckGuidelines: true,
          alertFrequency: 'daily',
          trackedAuthorities: ['EMA', 'MHRA', 'Health Canada']
        },
        submissions: {
          ectdValidation: true,
          validateBeforeSubmission: true,
          archiveSubmittedSequences: true,
          generateTransmissionReport: false
        }
      },
      '3': {
        organizationId: '3',
        submissionSettings: {
          defaultRegulatory: 'FDA',
          applicationFormTemplate: 'FDA-510k',
          requireDoubleReview: true,
          autoGenerateSequenceNumbers: false,
          sequenceNumberFormat: '{type}-{YY}{MM}-{000}',
          retentionPeriod: 5, // years
          securityLevel: 'standard'
        },
        documentSettings: {
          namingConvention: '{type}_{name}_{date}',
          allowedFormats: ['pdf', 'docx'],
          maxFileSize: 50, // MB
          enforceVersionControl: false,
          requiredMetadata: ['author', 'deviceCategory']
        },
        workflowSettings: {
          enforceApprovalWorkflow: false,
          approvalLevels: 1,
          notifyOnStatusChange: true,
          escalateOverdueTasks: false,
          taskEscalationThreshold: 0 // disabled
        },
        regulatoryIntelligence: {
          enabled: false,
          autoCheckGuidelines: false,
          alertFrequency: 'never',
          trackedAuthorities: ['FDA']
        },
        submissions: {
          ectdValidation: false,
          validateBeforeSubmission: false,
          archiveSubmittedSequences: true,
          generateTransmissionReport: false
        }
      }
    };
    
    // Check if settings exist for the requested organization
    if (settingsData[id]) {
      res.json({
        success: true,
        settings: settingsData[id]
      });
    } else {
      // Return default settings if the organization doesn't have specific settings
      res.json({
        success: true,
        settings: {
          organizationId: id,
          submissionSettings: {
            defaultRegulatory: 'FDA',
            applicationFormTemplate: 'FDA-356h',
            requireDoubleReview: false,
            autoGenerateSequenceNumbers: true,
            sequenceNumberFormat: 'SEQ-{YY}{MM}-{000}',
            retentionPeriod: 7, // years
            securityLevel: 'standard'
          },
          documentSettings: {
            namingConvention: '{sequence}_{module}_{section}_{name}_{date}',
            allowedFormats: ['pdf', 'docx', 'xlsx'],
            maxFileSize: 100, // MB
            enforceVersionControl: true,
            requiredMetadata: ['author', 'version']
          },
          workflowSettings: {
            enforceApprovalWorkflow: false,
            approvalLevels: 1,
            notifyOnStatusChange: true,
            escalateOverdueTasks: false,
            taskEscalationThreshold: 72 // hours
          },
          regulatoryIntelligence: {
            enabled: false,
            autoCheckGuidelines: false,
            alertFrequency: 'weekly',
            trackedAuthorities: ['FDA']
          },
          submissions: {
            ectdValidation: true,
            validateBeforeSubmission: true,
            archiveSubmittedSequences: true,
            generateTransmissionReport: false
          }
        }
      });
    }
  } catch (error) {
    console.error(`Error fetching regulatory settings for organization ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch organization regulatory settings'
    });
  }
});

export default router;