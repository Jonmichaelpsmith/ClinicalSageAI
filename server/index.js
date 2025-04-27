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
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static('./'));

// Health check endpoint for server pre-warming
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve client portal pages
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.sendFile(path.resolve('./login.html'));
});

app.get('/client-portal', (req, res) => {
  res.sendFile(path.resolve('./client-portal.html'));
});

// Initialize services
initAnalytics();

// Register routes
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
    res.redirect('/client-portal');
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