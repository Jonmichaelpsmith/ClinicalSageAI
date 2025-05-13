import { Express, Router } from 'express';

// Ignore TypeScript errors for missing declaration files
// @ts-ignore
import indWizardRouter from './routes/indWizardAPI.js';
// @ts-ignore
import cerRouter from './routes/cer-final.js';
// @ts-ignore
import faersRouter from './routes/faers-api.js';
// @ts-ignore
import literatureRouter from './routes/literature.js';
// @ts-ignore
import literatureReviewRouter from './routes/literature-review.js';
// @ts-ignore
import documentRouter from './routes/document-routes.js';
// @ts-ignore
import emergencyFixRouter from './routes/emergency-fix.js';
// @ts-ignore
import sotaRouter from './routes/sota-api.mjs';
// @ts-ignore
import equivalenceRouter from './routes/equivalence-api.mjs';
// @ts-ignore
import internalClinicalDataRouter from './routes/internal-clinical-data.js';
// @ts-ignore
import qmpApiRouter from './routes/qmp-api.js';
// @ts-ignore
import cerQmpIntegrationRouter from './routes/cer-qmp-integration.js';
// @ts-ignore
import { router as googleDocsRoutes } from './routes/googleDocs.js';
// New device profile routes
import deviceProfileRouter from './routes/cerDeviceProfileRoutes';

export default function registerRoutes(app: Express): void {
  // Create a router for basic CER routes
  const router = Router();
  
  // Health check endpoint
  router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // Simple CER routes
  router.get('/cer/jobs', (req, res) => {
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
    res.status(200).json({ message: 'Review recorded' });
  });
  
  router.post('/cer/generate-full', (req, res) => {
    res.json({
      job_id: `JOB-${Date.now()}`,
      status: 'pending'
    });
  });
  
  router.get('/cer/jobs/:id/status', (req, res) => {
    res.json({
      job_id: req.params.id,
      progress: 100,
      status: 'completed'
    });
  });
  
  // API routes
  app.use('/api', router);
  
  // Register IND Wizard API routes
  app.use('/api/ind-wizard', indWizardRouter);
  
  // Register our enhanced CER routes
  app.use('/api/cer', emergencyFixRouter);
  
  // Register FAERS API routes  
  app.use('/api/faers', faersRouter);
  
  // Register Literature API routes
  app.use('/api/literature', literatureRouter);
  
  // Register Literature Review workflow API routes
  app.use('/api/literature', literatureReviewRouter);
  
  // Register Document routes
  app.use('/api/documents', documentRouter);
  
  // Register SOTA API routes
  app.use('/api/cer/sota', sotaRouter);
  
  // Register Equivalence API routes
  app.use('/api/cer/equivalence', equivalenceRouter);
  
  // Register Internal Clinical Data API routes
  app.use('/api/cer/internal-data', internalClinicalDataRouter);
  
  // Register Quality Management Plan API routes
  app.use('/api/qmp-api', qmpApiRouter);
  console.log('QMP API routes registered');
  
  // Register CER-QMP Integration routes 
  app.use('/api/cer/qmp-integration', cerQmpIntegrationRouter);
  console.log('CER-QMP Integration routes registered');
  
  // Register Device Profile API routes
  app.use('/api/cer/device-profile', deviceProfileRouter);
  console.log('Device Profile API routes registered');
  
  // Create a temporary CER AI Analysis router
  const cerAiAnalysisRouter = Router();
  
  // Register enhanced validation endpoints
  cerAiAnalysisRouter.post('/hallucination-detection', (req, res) => {
    const { document } = req.body;
    
    if (!document) {
      return res.status(400).json({ error: 'Document is required' });
    }
    
    console.log(`Processing hallucination detection for document ${document.id || 'unknown'}`);
    
    // Sample response
    const result = {
      hallucinations: [
        {
          text: "The device demonstrated a 97% success rate in clinical trials with over 5,000 patients.",
          location: "section:clinical_evaluation",
          confidence: 0.92,
          details: "No clinical trial with 5,000 patients exists in the literature for this device. The largest study had 342 participants.",
          suggestedCorrection: "The device demonstrated an 84% success rate in the largest clinical trial with 342 patients."
        },
        {
          text: "A 2023 meta-analysis by Johnson et al. confirmed the safety profile across all age groups.",
          location: "section:safety_analysis",
          confidence: 0.87,
          details: "No 2023 meta-analysis by Johnson exists for this device. The most recent meta-analysis was from 2021 by Silva et al.",
          suggestedCorrection: "A 2021 meta-analysis by Silva et al. confirmed the safety profile in adults, though pediatric data remains limited."
        }
      ],
      recommendations: [
        {
          type: "citation_verification",
          message: "Verify all citations against PubMed or other authoritative sources"
        },
        {
          type: "study_size_accuracy",
          message: "Double-check all reported study sizes against original publications"
        }
      ]
    };
    
    res.json(result);
  });
  
  cerAiAnalysisRouter.post('/verify-claim', (req, res) => {
    const { claim } = req.body;
    
    if (!claim) {
      return res.status(400).json({ error: 'Claim is required' });
    }
    
    console.log(`Verifying claim: ${claim.text}`);
    
    // Sample response
    const result = {
      verified: Math.random() > 0.3,
      confidence: 0.7 + (Math.random() * 0.3),
      issue: claim.text.includes('97%') ? "Claim contains numerical inaccuracy" : "Citation not found in literature",
      explanation: "The actual value reported in the literature is different from what's stated",
      suggestedCorrection: claim.text.replace('97%', '84%').replace('5,000', '342'),
      correctInformation: "84% success rate in 342 patients"
    };
    
    res.json(result);
  });
  
  cerAiAnalysisRouter.post('/verify-reference', (req, res) => {
    const { reference } = req.body;
    
    if (!reference) {
      return res.status(400).json({ error: 'Reference is required' });
    }
    
    console.log(`Verifying reference: ${reference.id || reference.text || 'unknown'}`);
    
    // Sample response
    const isValid = Math.random() > 0.2;
    const result = {
      valid: isValid,
      confidence: 0.8 + (Math.random() * 0.2),
      severity: Math.random() > 0.5 ? 'major' : 'minor',
      issue: isValid ? null : "Reference not found in literature database",
      explanation: isValid ? null : "The cited reference could not be verified in PubMed, Scopus, or other academic databases",
      suggestedCorrection: isValid ? null : "Silva et al. (2021) 'Safety and efficacy of the device: a comprehensive analysis', Journal of Medical Devices, 45(3), pp. 322-335."
    };
    
    res.json(result);
  });
  
  cerAiAnalysisRouter.post('/validate-regulatory', (req, res) => {
    const { document, framework } = req.body;
    
    if (!document) {
      return res.status(400).json({ error: 'Document is required' });
    }
    
    if (!framework) {
      return res.status(400).json({ error: 'Regulatory framework is required' });
    }
    
    console.log(`Validating regulatory compliance for document ${document.id || 'unknown'} against ${framework}`);
    
    // Sample response
    const result = {
      issues: [
        {
          type: "missing_section",
          message: "Missing required section: Benefit-Risk Analysis",
          severity: "critical",
          location: "document",
          regulatoryReference: "EU MDR Annex XIV, Part A, Section 1"
        },
        {
          type: "incomplete_section",
          message: "Post-Market Surveillance Plan is incomplete",
          severity: "major",
          location: "section:pms_plan",
          regulatoryReference: "EU MDR Article 83"
        }
      ],
      recommendations: [
        {
          id: "rec-reg-1",
          type: "add_section",
          message: "Add a comprehensive Benefit-Risk Analysis section"
        },
        {
          id: "rec-reg-2",
          type: "update_section",
          message: "Update PMS Plan to include complaint handling procedures"
        }
      ]
    };
    
    res.json(result);
  });
  
  // Register the AI Analysis router
  app.use('/api/cer/ai', cerAiAnalysisRouter);
  console.log('CER AI Analysis routes registered');
  
  // Create a temporary CER Validation router
  const cerValidationRouter = Router();
  
  // Register basic validation endpoint
  cerValidationRouter.post('/documents/:documentId/validate', (req, res) => {
    const { documentId } = req.params;
    const { framework = 'mdr' } = req.body;
    
    console.log(`Validation request for document ${documentId} using ${framework} framework`);
    
    // Sample response
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
  
  // Enhanced validation endpoint
  cerValidationRouter.post('/documents/:documentId/validate-enhanced', (req, res) => {
    const { documentId } = req.params;
    const { framework = 'mdr', sections = [] } = req.body;
    
    console.log(`Enhanced validation request for document ${documentId} using ${framework} framework`);
    
    // Sample response for enhanced validation
    res.json({
      documentId,
      framework,
      timestamp: new Date().toISOString(),
      analysisMode: 'enhanced',
      validationResults: {
        summary: {
          overallScore: 82,
          criticalIssues: 1,
          majorIssues: 2,
          minorIssues: 5,
          recommendations: 7
        },
        hallucinations: [
          {
            text: "The device demonstrated a 97% success rate in clinical trials with over 5,000 patients.",
            location: "section:clinical_evaluation",
            confidence: 0.92,
            details: "No clinical trial with 5,000 patients exists in the literature for this device. The largest study had 342 participants.",
            suggestedCorrection: "The device demonstrated an 84% success rate in the largest clinical trial with 342 patients."
          }
        ]
      }
    });
  });
  
  // Register the validation router
  app.use('/api/cer', cerValidationRouter);
  console.log('CER Validation routes registered');
  
  // Register Google Docs routes
  app.use('/api/google-docs', googleDocsRoutes);
  console.log('Google Docs routes registered');
  
  // Error handler for API routes
  app.use('/api', (err: any, req: any, res: any, next: any) => {
    console.error('API Error:', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
      context: err.context || 'API',
      timestamp: new Date().toISOString()
    });
  });
}