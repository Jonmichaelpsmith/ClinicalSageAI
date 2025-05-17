/**
 * TrialSage Server Main Entry Point
 * 
 * This file initializes the Express server, sets up middleware,
 * registers routes, and starts the server listening.
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { createServer } from 'http';
import { Server as WebSocketServer } from 'socket.io';
import * as Sentry from '@sentry/node';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import referenceModelRoutes from './routes/reference-model.js';
import esgRoutes from './routes/esgSubmission.js';
import analyticsRoutes from './routes/analytics.js';
import esignRoutes from './routes/esign.js';
import cmcBlueprintRoutes from './routes/cmc-blueprint.js';
import enhancedInspectionRoutes from './routes/enhanced-inspection.js';
import documentVersionRoutes from './routes/document-versions.js';
import indProxyRouter from './routes/ind-proxy.js';
import indFormsRouter from './routes/ind-forms.js';
import healthRoutes from './routes/health.js';
import mashableBiRoutes from './routes/mashable-bi.js';
import prewarmRoutes from './routes/prewarm.js';

// Import our new API routes
import vaultRoutes from './routes/vault.js';
import actionsRoutes from './routes/actions.js';
import testApiRoutes from './routes/test-api.js';
import googleDocsRoutes from './routes/googleDocs.js';
import wordDocRoutes from './routes/wordDocs.js';

// Import middleware
import { verifyJwt } from './middleware/auth.js';
import { ledgerLog } from './middleware/ledgerLog.js';

// Import services
import { initAnalytics } from './services/analyticsService.js';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Sentry if DSN is available
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
  });
  
  // Use Sentry request handler and error handler
  app.use(Sentry.Handlers.requestHandler());
}

// Basic middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// Capture the host for keep-alive self-pinging
app.use((req, res, next) => {
  global.lastRequestHost = req.get('host');
  next();
});
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static('./'));

// Health check and prewarm endpoints for server pre-warming
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Inline test API route - most direct approach
app.get('/api/inline-test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Inline test API is working!',
    timestamp: new Date().toISOString()
  });
});

// Direct inline recent documents endpoint
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

// Direct inline analytics metrics endpoint
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

// Direct API endpoints for testing
app.get('/api/direct/next-actions', (req, res) => {
  const actions = [
    {
      id: 1,
      title: 'Review Protocol Draft',
      description: 'Review draft protocol for BTX-331 Phase 1 study',
      dueDate: '2025-05-05',
      priority: 'high',
      projectId: 'ind-2025-034',
      assignedTo: 'james.wilson'
    },
    {
      id: 2,
      title: 'Complete Safety Narrative',
      description: 'Finalize safety narrative for CSR section 12.3',
      dueDate: '2025-05-08',
      priority: 'medium',
      projectId: 'csr-2024-089',
      assignedTo: 'emily.chen'
    }
  ];
  
  res.status(200).json({
    success: true,
    data: actions
  });
});

app.get('/api/direct/vault/recent-docs', (req, res) => {
  const docs = [
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
    }
  ];
  
  res.status(200).json({
    success: true,
    data: docs
  });
});

app.get('/api/prewarm', (req, res) => {
  res.status(200).send('Server is warm!');
});

// Serve client portal pages
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.sendFile(path.resolve('./login.html'));
});

// Simple authentication middleware to check for tokens
function checkAuth(req, res, next) {
  // Check for token in cookie or authorization header
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  
  // If no token, also check if there's a user cookie (our simplified auth)
  const userCookie = req.cookies?.user;
  
  if (!token && !userCookie) {
    console.log('Auth check failed - redirecting to login');
    return res.redirect('/login');
  }
  
  // If we have a token, we could validate it here
  // For now, we just proceed
  next();
}

// Public client portal (no auth check)
// Check if client-portal.html exists and serve it
app.get('/client-portal', (req, res, next) => {
  const clientPortalPath = path.resolve('./client-portal.html');
  if (fs.existsSync(clientPortalPath)) {
    res.sendFile(clientPortalPath);
  } else {
    console.log('[Routes] Static client-portal.html not found, falling back to React app');
    // This will fall through to React routing via Vite middleware
    next();
  }
});

// Secure client portal (with auth check)
app.get('/client-portal-direct', checkAuth, (req, res) => {
  res.sendFile(path.resolve('./client-portal-direct.html'));
});

// Initialize services
initAnalytics();

// Register routes
app.use('/api/prewarm', prewarmRoutes);  // Add prewarm routes (no JWT needed)
app.use('/api/reference-model', verifyJwt, referenceModelRoutes);
app.use('/api/esg', verifyJwt, esgRoutes);
app.use('/api/analytics', verifyJwt, analyticsRoutes);
app.use('/api/esign', verifyJwt, esignRoutes);
app.use('/api/cmc', verifyJwt, cmcBlueprintRoutes);
app.use('/api/inspection/v2', enhancedInspectionRoutes);
app.use('/api/versions', verifyJwt, documentVersionRoutes);

// IND Wizard API endpoints (skipping JWT verification for now to simplify testing)
app.use('/', indProxyRouter);
app.use('/api/ind', indFormsRouter);

// Health check endpoints
app.use('/api/health', healthRoutes);

// MashableBI analytics routes
app.use('/api/mashable-bi', mashableBiRoutes);

// Our new API routes 
app.use('/api/vault', vaultRoutes);
app.use('/api/next-actions', actionsRoutes);
app.use('/api/google-docs', googleDocsRoutes); // Google Docs API routes
app.use('/api/word-docs', wordDocRoutes); // Word document upload routes
app.use('/api/test', testApiRoutes); // Test API routes for development

// Vault and Analytics routes
const vaultRoutesNew = require('./routes/vault');
const analyticsRoutes = require('./routes/analytics');
app.use('/api', vaultRoutesNew);
app.use('/api', analyticsRoutes);

// CommonJS test routes - Simplified direct API approach
const directApi = require('./direct-api');
app.use('/api/direct', directApi);

// Ledger API
app.get('/api/ledger/:submissionId', verifyJwt, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ind_ledger')
      .select('*')
      .eq('payload->submission_id', req.params.submissionId)
      .order('ts', { ascending: false });
    
    if (error) {
      return res.status(500).json({ message: error.message });
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Handle 404s
app.use((req, res, next) => {
  // Skip API routes and existing routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // For paths that don't match any defined routes
  if (req.method === 'GET' && !req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico)$/)) {
    // Serve React app for client-side routing instead of redirecting
    res.sendFile(path.resolve('./client/public/index.html'));
  } else {
    next();
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  
  // Sentry error handler if available
  if (process.env.SENTRY_DSN) {
    app.use(Sentry.Handlers.errorHandler());
  }
  
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Create HTTP server and WebSocket server
const httpServer = createServer(app);
const io = new WebSocketServer(httpServer, {
  path: '/ws',
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// WebSocket event handlers
io.on('connection', (socket) => {
  console.log('WebSocket client connected:', socket.id);
  
  socket.on('join-submission', (submissionId) => {
    socket.join(`submission-${submissionId}`);
    console.log(`Client ${socket.id} joined submission ${submissionId}`);
  });
  
  socket.on('leave-submission', (submissionId) => {
    socket.leave(`submission-${submissionId}`);
    console.log(`Client ${socket.id} left submission ${submissionId}`);
  });
  
  socket.on('join-blueprint', (blueprintId) => {
    socket.join(`blueprint-${blueprintId}`);
    console.log(`Client ${socket.id} joined blueprint ${blueprintId}`);
  });
  
  socket.on('leave-blueprint', (blueprintId) => {
    socket.leave(`blueprint-${blueprintId}`);
    console.log(`Client ${socket.id} left blueprint ${blueprintId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('WebSocket client disconnected:', socket.id);
  });
});

// Import the keep-alive service 
const ServerKeepAlive = require('./keep-alive.js');

// Serve React app for all other routes (support client-side routing)
app.get('*', (req, res) => {
  // Skip API routes and asset files
  if (req.path.startsWith('/api/') || req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico)$/)) {
    return res.status(404).send('Not found');
  }
  
  res.sendFile(path.resolve('./client/public/index.html'));
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start the keep-alive service to prevent Replit hibernation
  const keepAlive = new ServerKeepAlive({
    interval: 4 * 60 * 1000, // Ping every 4 minutes (Replit hibernates after 5)
    silent: false // Log pings for debugging
  });
  keepAlive.start();
  console.log('Server keep-alive service activated to prevent hibernation');
});