import express, { Express } from 'express';
import path from 'path';
import indWizardRouter from './routes/indWizardAPI.js';
import cerRouter from './routes/cer-final.js';  // Using our simplified & fixed CER router
import faersRouter from './routes/faers-api.js';  // Add direct FAERS API router
import literatureRouter from './routes/literature.js';
import literatureReviewRouter from './routes/literature-review.js';  // Add literature review workflow API
import documentRouter from './routes/document-routes';
import emergencyFixRouter from './routes/emergency-fix.js';
import sotaRouter from './routes/sota-api.mjs';
import equivalenceRouter from './routes/equivalence-api.mjs';

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
  
  // Register SOTA API routes (appending to existing CER routes)
  app.use('/api/cer/sota', sotaRouter);
  
  // Register Equivalence API routes
  app.use('/api/cer/equivalence', equivalenceRouter);
  
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