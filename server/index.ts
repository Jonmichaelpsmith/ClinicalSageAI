import express from 'express';
import dotenv from 'dotenv';
import { createServer as createHttpServer } from 'http';
import registerRoutes from './routes_fixed';
import { setupVite } from './vite';
import { initializePerformanceOptimizations } from './initializers/performanceOptimizer';
import { initializeQualityApi } from './initializers/qualityApiInitializer';
import { tenantContextMiddleware } from './middleware/tenantContext';
import errorHandler from './middleware/errorHandlerMiddleware';
import globalErrorHandler from './utils/globalErrorHandler';

// Load environment variables
dotenv.config();

// Create Express application
const app = express();
const port = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== 'production';

// Create database connection pool
import { Pool } from 'pg';
const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Middleware
// CORS headers handled manually until cors package is installed
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Org-ID, X-Client-ID, X-Module');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Apply JSON parsing middleware
app.use(express.json());

// Apply tenant context middleware for all requests
app.use(tenantContextMiddleware);

// Serve static files from the root directory
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static JavaScript files from various directories with proper MIME types
app.use('/js', express.static(path.join(process.cwd(), 'js'), {
  setHeaders: (res, filePath) => {
    if (path.extname(filePath) === '.js') {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));
app.use('/public', express.static(path.join(process.cwd(), 'public')));

// Register API routes
registerRoutes(app);

// Import and register QMP routes
import qmpRoutes from './routes/qmp.js';
app.use('/api/qmp', qmpRoutes);
console.log('QMP API routes registered');

// Import and register QMP audit trail routes
import qmpAuditRoutes from './routes/qmp-audit.js';
app.use('/api/qmp', qmpAuditRoutes);
console.log('QMP Audit Trail routes registered');

// Import and register Reports API routes
import reportsRoutes from './routes/reports.js';
app.use('/api/reports', reportsRoutes);
console.log('Reports API routes registered');

// Import and register tenant section gating API routes
import tenantSectionGatingRoutes from './routes/tenant-section-gating.js';
app.use('/api/tenant-section-gating', tenantSectionGatingRoutes);
console.log('Tenant Section Gating routes registered');

// Import and register health check routes
import { createHealthCheckRouter } from './routes/healthCheck';
app.use('/api', createHealthCheckRouter(dbPool));

// Import and initialize Quality Management API
import { initializeQualityManagementApi } from './initializers/qualityApiInitializer';
// Use async IIFE to initialize safely
(async () => {
  await initializeQualityManagementApi(app);
  console.log('Quality Management API initialized');
})().catch(err => console.error('Error initializing Quality Management API:', err));

// Serve the marketing landing page at the root URL
app.get('/', (req, res) => {
  console.log('Serving marketing landing page');
  const landingPath = path.join(process.cwd(), 'clean_landing_page.html');
  if (fs.existsSync(landingPath)) {
    res.sendFile(landingPath);
  } else {
    console.error('Marketing landing page not found at:', landingPath);
    res.status(404).send('Marketing landing page not found');
  }
});

// Alternative marketing page route
app.get('/marketing', (req, res) => {
  console.log('Serving marketing page from /marketing route');
  const landingPath = path.join(process.cwd(), 'clean_landing_page.html');
  if (fs.existsSync(landingPath)) {
    res.sendFile(landingPath);
  } else {
    res.status(404).send('Marketing landing page not found');
  }
});

// HIGH PRIORITY - Client Portal route - MUST NOT RETURN 404
// This is now handled by Vite/React router at runtime
// Commenting out to avoid conflicts with React router
/*
app.get('/client-portal', (req, res) => {
  console.log('CRITICAL: Serving Static Client Portal HTML directly');
  // Always prefer the static client portal file first - this is the user's intended file
  const staticClientPortal = path.join(process.cwd(), 'client-portal.html');
  if (fs.existsSync(staticClientPortal)) {
    return res.sendFile(staticClientPortal);
  } else {
    console.error('CRITICAL ERROR: client-portal.html not found at:', staticClientPortal);
    // Last resort: Generate a minimal response instead of a 404
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Client Portal Error</title>
        <meta http-equiv="refresh" content="5;url=/" />
      </head>
      <body>
        <p>Error: Client Portal unavailable. Redirecting to home page in 5 seconds...</p>
      </body>
      </html>
    `);
  }
});
*/

// Create HTTP server
const httpServer = createHttpServer(app);

// Direct access to cerv2 should be handled by Vite for client-side routing
// No special handler needed

// Setup Vite middleware in development mode
if (isDev) {
  // Setup Vite dev middleware
  setupVite(app, httpServer).catch((err) => {
    console.error('Error setting up Vite:', err);
    process.exit(1);
  });
}

// Initialize global error handlers to catch uncaught exceptions
globalErrorHandler.initializeStabilityMeasures();

// Apply the error handler middleware as the last middleware (after all routes)
// This ensures all errors from routes are caught and handled properly
app.use(errorHandler);

// Add a catch-all error route as the absolute last route
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: `Route not found: ${req.method} ${req.path}`,
      status: 404
    }
  });
});

// Start server with error handling
httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Health check available at http://localhost:${port}/api/health`);
  console.log('STABILITY MODE ACTIVE: All error handlers initialized');
  
  // Initialize performance optimizations after server has started
  initializePerformanceOptimizations()
    .catch(err => console.error('Error initializing performance optimizations:', err));
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});