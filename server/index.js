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

// Serve static files - prioritize public folder for React app
app.use(express.static('public'));

// Serve legacy static files for backwards compatibility
app.use(express.static('./'));

// Set up Vite dev server integration for React frontend
if (process.env.NODE_ENV === 'development') {
  const { createServer: createViteServer } = require('vite');
  
  (async () => {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
        root: './'
      });
      
      // Use Vite's connect middleware
      app.use(vite.middlewares);
      
      console.log('Vite development server middleware attached');
    } catch (err) {
      console.error('Error setting up Vite:', err);
    }
  })();
}

// API endpoints are under /api
// All other routes should fall through to React app

// Legacy endpoints - will be fully migrated to React app
app.get('/login', (req, res) => {
  res.sendFile(path.resolve('./public/index.html'));
});

app.get('/client-portal', (req, res) => {
  res.sendFile(path.resolve('./public/index.html'));
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

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

// Serve React app for any non-API routes (SPA catch-all)
app.get('/dashboard/*', (req, res) => {
  res.sendFile(path.resolve('./public/index.html'));
});

app.get('/programs/*', (req, res) => {
  res.sendFile(path.resolve('./public/index.html'));
});

app.get('/studies/*', (req, res) => {
  res.sendFile(path.resolve('./public/index.html'));
});

app.get('/analytics*', (req, res) => {
  res.sendFile(path.resolve('./public/index.html'));
});

app.get('/admin/*', (req, res) => {
  res.sendFile(path.resolve('./public/index.html'));
});

// Root route - redirect to dashboard if not already handled
app.get('/', (req, res) => {
  res.sendFile(path.resolve('./public/index.html'));
});

// Universal fallback for SPA
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // For all other routes, serve the React app
  res.sendFile(path.resolve('./public/index.html'));
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

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});