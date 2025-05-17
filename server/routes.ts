import { Express, Router } from 'express';
import path from 'path';

// Device profile routes are imported separately to avoid duplication

// Document integration routes
import googleDocsRoutes from './routes/googleDocs';
import moduleIntegrationRoutes from './routes/moduleIntegrationRoutes';
import vaultRoutes from './routes/vaultRoutes';
import documentIntelligenceRoutes from './routes/documentIntelligenceRoutes';

// Declare module types to avoid TypeScript errors
declare module './routes/googleDocs' {
  const router: express.Router;
  export default router;
}

declare module './routes/moduleIntegrationRoutes' {
  const router: express.Router;
  export default router;
}

declare module './routes/indWizardAPI.js' {
  const router: express.Router;
  export default router;
}

declare module './routes/cer-final.js' {
  const router: express.Router;
  export default router;
}

declare module './routes/vaultRoutes' {
  const router: express.Router;
  export default router;
}

declare module './routes/documentIntelligenceRoutes' {
  const router: express.Router;
  export default router;
}

declare module './routes/faers-api.js' {
  const router: express.Router;
  export default router;
}

declare module './routes/literature.js' {
  const router: express.Router;
  export default router;
}

declare module './routes/literature-review.js' {
  const router: express.Router;
  export default router;
}

declare module './routes/emergency-fix.js' {
  const router: express.Router;
  export default router;
}

declare module './routes/sota-api.mjs' {
  const router: express.Router;
  export default router;
}

declare module './routes/equivalence-api.mjs' {
  const router: express.Router;
  export default router;
}

declare module './routes/internal-clinical-data.js' {
  const router: express.Router;
  export default router;
}

declare module './routes/cer-ai-analysis.mjs' {
  const router: express.Router;
  export default router;
}

declare module './routes/cer-ai-analysis.js' {
  const router: express.Router;
  export default router;
}

declare module './routes/qmp-api.js' {
  const router: express.Router;
  export default router;
}

declare module './routes/cer-qmp-integration.js' {
  const router: express.Router;
  export default router;
}

declare module './routes/ai-routes.js' {
  const router: express.Router;
  export default router;
}

declare module './routes/auth.js' {
  const router: express.Router;
  export default router;
}

declare module './routes/510k-literature-routes' {
  const router: express.Router;
  export default router;
}

declare module './routes/510k-literature-api.js' {
  const router: express.Router;
  export default router;
}

declare module './routes/510kEstarRoutes' {
  const router: express.Router;
  export default router;
}

declare module './routes/regulatory-ai.js' {
  const router: express.Router;
  export default router;
}

declare module './routes/510k-risk-assessment.js' {
  const router: express.Router;
  export default router;
}

// Import routes after declaring the modules
import indWizardRouter from './routes/indWizardAPI.js';
import cerRouter from './routes/cer-final.js';
import faersRouter from './routes/faers-api.js';
import literatureRouter from './routes/literature.js';
import literatureReviewRouter from './routes/literature-review.js';
import documentRouter from './routes/document-routes';
import vaultRouter from './routes/vault-routes';
import organizationsRouter from './routes/organizations-routes';  // Add organizations router
// Regulatory submissions functionality removed as per client request
import emergencyFixRouter from './routes/emergency-fix.js';
import aiRouter from './routes/ai-routes.js';
import sotaRouter from './routes/sota-api.mjs';
import equivalenceRouter from './routes/equivalence-api.mjs';
import fda510kEquivalenceRouter from './routes/510k-equivalence-api.js';
import sectionRecommenderRouter from './routes/section-recommender.js';
import internalClinicalDataRouter from './routes/internal-clinical-data.js';
import qmpRouter from './routes/qmp-api.js';
import cerQmpIntegrationRouter from './routes/cer-qmp-integration.js';
import authRouter from './routes/auth.js';
import maudRouter from './routes/maud-routes';
import fda510kLiteratureRouter from './routes/510k-literature-routes';
import fda510kLiteratureApiRouter from './routes/510k-literature-api.js';
import fda510kRouter from './routes/fda510k-routes';
import fda510kComplianceRouter from './routes/510k-compliance-routes';
import fda510kEstarRouter from './routes/510kEstarRoutes';
import { router as fda510kApiRouter } from './routes/510k-api-routes';
import regulatoryAiRouter from './routes/regulatory-ai.js';
import fda510kRiskAssessmentRouter from './routes/510k-risk-assessment.js';
// Import existing router or create empty one
import express from 'express';
import * as fs from 'fs';

// Check if file exists
let cerAiAnalysisRouter;
const jsPath = './routes/cer-ai-analysis.js';
const mjsPath = './routes/cer-ai-analysis.mjs';

// Create a temporary router to use if the files don't exist
cerAiAnalysisRouter = express.Router();

// Create a router for basic CER routes (simplified version that doesn't depend on external packages)
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Simple CER routes (temporary until we install dependencies)
router.get('/cer/jobs', (req, res) => {
  // Send back mock data for now (this will be replaced with database integration)
  const mockJobs = [
    {
      job_id: 'JOB-20250429-001',
      status: 'draft',
      progress: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'user-123',
      template_id: 'ICH-E3-FULL',
      approvals_count: 0
    }
  ];
  
  res.json({ 
    data: mockJobs,
    pagination: {
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1
    }
  });
});

router.get('/cer/jobs/:id', (req, res) => {
  const { id } = req.params;
  // Send back mock job details
  res.json({
    job_id: id,
    status: 'draft',
    progress: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'user-123',
    template_id: 'ICH-E3-FULL',
    approvals: []
  });
});

router.post('/cer/jobs/:id/review', (req, res) => {
  // For demo purposes, just acknowledge the review
  res.status(200).json({ message: 'Review recorded' });
});

router.post('/cer/generate-full', (req, res) => {
  // Mock generation response
  res.json({
    job_id: `JOB-${Date.now()}`,
    status: 'pending'
  });
});

router.get('/cer/jobs/:id/status', (req, res) => {
  // Mock status response
  res.json({
    job_id: req.params.id,
    progress: 100,
    status: 'completed'
  });
});

export default function registerRoutes(app: Express): void {
  // API routes
  app.use('/api', router);
  
  // Register IND Wizard API routes
  app.use('/api/ind-wizard', indWizardRouter);
  
  // Register our enhanced CER routes (using emergency-fix for client demo)
  app.use('/api/cer', emergencyFixRouter);
  
  // Register FAERS API routes  
  app.use('/api/faers', faersRouter);

  // Register Literature API routes
  app.use('/api/literature', literatureRouter);
  
  // Register Literature Review workflow API routes
  app.use('/api/literature', literatureReviewRouter);
  
  // Register Document API routes
  app.use('/api/documents', documentRouter);
  
  // Register Vault API routes
  app.use('/api/vault', vaultRouter);
  
  // Register Document Intelligence API routes
  app.use('/api/document-intelligence', documentIntelligenceRoutes);
  
  // Register Organization API routes
  app.use('/api/organizations', organizationsRouter);
  
  // Regulatory Submissions Hub functionality removed as per client request
  // app.use('/api/regulatory-submissions', regulatorySubmissionsRouter);
  
  // Register SOTA API routes (appending to existing CER routes)
  app.use('/api/cer/sota', sotaRouter);
  
  // Register Equivalence API routes
  app.use('/api/cer/equivalence', equivalenceRouter);
  
  // Register 510(k) Equivalence API routes
  app.use('/api/510k', fda510kEquivalenceRouter);
  
  // Register Section Recommender API routes
  app.use('/api/section-recommender', sectionRecommenderRouter);
  
  // Register Internal Clinical Data API routes
  app.use('/api/cer/internal-data', internalClinicalDataRouter);
  
  // Register CER AI Analysis API routes
  app.use('/api/cer/ai', cerAiAnalysisRouter);
  
  // Register QMP API routes
  app.use('/api/qmp-api', qmpRouter);
  
  // Register CER QMP Integration routes
  app.use('/api/cer-qmp-integration', cerQmpIntegrationRouter);
  
  // Register AI Document Intelligence routes
  app.use('/api/ai', aiRouter);
  
  // Register 510(k) Risk Assessment routes
  app.use('/api/510k-risk-assessment', fda510kRiskAssessmentRouter);
  
  // Register Document Vault routes with OCR and AI analysis
  app.use('/api/vault', vaultRoutes);
  
  // Register Google Docs Integration routes
  app.use('/api/google-docs', googleDocsRoutes);
  
  // Register MAUD validation API routes
  app.use('/api/maud', maudRouter);
  
  // Register 510(k) Literature API routes
  app.use('/api/510k/literature', fda510kLiteratureRouter);
  app.use('/api/510k/literature', fda510kLiteratureApiRouter);
  
  // Register 510(k) Pathway and Equivalence API routes
  app.use('/api/fda510k', fda510kRouter);
  app.use('/api/fda510k', fda510kComplianceRouter);
  app.use('/api/fda510k', fda510kEstarRouter);
  app.use('/api/fda510k', fda510kApiRouter);
  
  // Register Regulatory AI Assistant routes
  app.use('/api/regulatory-ai', regulatoryAiRouter);
  
  // Register 510(k) Risk Assessment routes
  app.use('/api/510k', fda510kRiskAssessmentRouter);
  
  // Register Regulatory Knowledge routes
  // @ts-ignore - Module might not have TypeScript definitions
  const regulatoryKnowledgeRouter = require('./routes/regulatory-knowledge');
  app.use('/api/regulatory-knowledge', regulatoryKnowledgeRouter);
  
  // Register Module Integration routes
  app.use('/api/integration', moduleIntegrationRoutes);
  
  // Register Device Profile API routes directly
  const DeviceProfileService = require('./services/DeviceProfileService').default;
  const deviceProfileService = DeviceProfileService.getInstance();
  
  // Add debug logs to see registered routes
  console.log('REGISTERING DEVICE PROFILE ROUTES...');
  console.log('Current app routes:', app._router?.stack?.filter(r => r.route)?.map(r => ({ path: r.route?.path, methods: r.route?.methods })));
  
  // Add a simple test route
  app.get('/api/test', (req, res) => {
    console.log('Test route hit!');
    res.json({ success: true, message: 'Test route works!' });
  });
  
  // Create direct routes for device profiles
  app.post('/api/cer/device-profile', async (req, res) => {
    try {
      console.log('Direct device profile route hit!', req.body);
      const deviceProfileData = req.body;
      
      // Add creation timestamp if not provided
      if (!deviceProfileData.createdAt) {
        deviceProfileData.createdAt = new Date();
      }
      
      const deviceProfile = await deviceProfileService.createDeviceProfile(deviceProfileData);
      
      res.status(201).json(deviceProfile);
    } catch (error) {
      console.error('Error creating device profile:', error);
      res.status(500).json({ 
        error: 'Failed to create device profile',
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      });
    }
  });
  
  // Register Authentication routes
  app.use('/auth', authRouter);
  
  // Create a temporary CER Validation router
  const cerValidationRouter = express.Router();
  
  // Register basic validation endpoint on the temporary router
  cerValidationRouter.post('/documents/:documentId/validate', (req, res) => {
    const { documentId } = req.params;
    const { framework = 'mdr' } = req.body;
    
    console.log(`Validation request for document ${documentId} using ${framework} framework`);
    
    // Simplified validation response
    res.json({
      documentId,
      framework,
      timestamp: new Date().toISOString(),
      validationResults: {
        summary: {
          overallScore: 75,
          criticalIssues: 1,
          majorIssues: 2,
          minorIssues: 3
        },
        sections: []
      }
    });
  });
  
  // Register the validation router
  app.use('/api/cer', cerValidationRouter);
  console.log('Temporary CER validation routes registered');
  
  // Document Vault API Routes
  const vaultRouter = express.Router();
  
  // Get folder structure endpoint
  vaultRouter.get('/structure', (req, res) => {
    try {
      const { rootFolderId, maxDepth, includeFiles, fileTypes } = req.query;
      
      // Initialize folder structure for regulatory documentation
      const folders = [
        {
          id: 'folder-510k',
          name: '510(k) Submission',
          type: 'folder',
          children: [
            { id: 'doc-device', name: 'Device Description.pdf', type: 'document', format: 'pdf' },
            { id: 'doc-intended', name: 'Intended Use.docx', type: 'document', format: 'docx' },
            { id: 'doc-results', name: 'Test Results.pdf', type: 'document', format: 'pdf' }
          ]
        },
        {
          id: 'folder-predicate',
          name: 'Predicate Devices',
          type: 'folder',
          children: [
            { id: 'doc-predA', name: 'Predicate A.pdf', type: 'document', format: 'pdf' },
            { id: 'doc-predB', name: 'Predicate B.pdf', type: 'document', format: 'pdf' },
            { id: 'doc-comparison', name: 'Comparison Table.xlsx', type: 'document', format: 'xlsx' }
          ]
        },
        {
          id: 'folder-regulatory',
          name: 'Regulatory Documents',
          type: 'folder',
          children: [
            { id: 'doc-fda', name: 'FDA Guidelines.pdf', type: 'document', format: 'pdf' },
            { id: 'doc-checklist', name: 'Submission Checklist.docx', type: 'document', format: 'docx' }
          ]
        },
        {
          id: 'folder-estar',
          name: 'eSTAR Documents',
          type: 'folder',
          children: [
            { id: 'doc-estar-template', name: 'eSTAR Template.xlsx', type: 'document', format: 'xlsx' },
            { id: 'doc-estar-guidance', name: 'eSTAR Guidance.pdf', type: 'document', format: 'pdf' }
          ]
        }
      ];
      
      // Return structured response
      res.json({
        folders,
        metadata: {
          totalCount: folders.length,
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (error) {
      console.error('Error getting vault structure:', error);
      res.status(500).json({ error: 'Failed to retrieve folder structure' });
    }
  });
  
  // Get documents listing endpoint
  vaultRouter.get('/documents', (req, res) => {
    try {
      const { page = 1, limit = 20, type, format } = req.query;
      
      // Sample documents list
      const documents = [
        { id: 'doc-device', name: 'Device Description.pdf', type: 'document', format: 'pdf', createdAt: '2025-04-15T14:30:00Z' },
        { id: 'doc-intended', name: 'Intended Use.docx', type: 'document', format: 'docx', createdAt: '2025-04-16T10:15:00Z' },
        { id: 'doc-results', name: 'Test Results.pdf', type: 'document', format: 'pdf', createdAt: '2025-04-17T09:45:00Z' },
        { id: 'doc-predA', name: 'Predicate A.pdf', type: 'document', format: 'pdf', createdAt: '2025-04-18T11:20:00Z' },
        { id: 'doc-predB', name: 'Predicate B.pdf', type: 'document', format: 'pdf', createdAt: '2025-04-19T13:10:00Z' }
      ];
      
      // Filter by type and format if provided
      let filteredDocs = [...documents];
      if (type) {
        filteredDocs = filteredDocs.filter(doc => doc.type === type);
      }
      if (format) {
        filteredDocs = filteredDocs.filter(doc => doc.format === format);
      }
      
      // Apply pagination
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = pageNum * limitNum;
      const paginatedDocs = filteredDocs.slice(startIndex, endIndex);
      
      res.json({
        documents: paginatedDocs,
        pagination: {
          total: filteredDocs.length,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(filteredDocs.length / limitNum)
        }
      });
      
    } catch (error) {
      console.error('Error getting documents:', error);
      res.status(500).json({ error: 'Failed to retrieve documents' });
    }
  });
  
  // Register the vault router
  app.use('/api/vault', vaultRouter);
  console.log('Document vault API routes registered');
  
  // Register module integration routes
  app.use('/api/integration', moduleIntegrationRoutes);
  console.log('Module integration routes registered');
  
  // Error handler for API routes
  app.use('/api', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('API Error:', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
      context: err.context || 'API',
      timestamp: new Date().toISOString()
    });
  });
}