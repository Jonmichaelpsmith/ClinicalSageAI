import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { createServer as createHttpServer } from 'http';
// Removing problematic import
// import registerRoutes from './routes_fixed';
import { setupVite } from './vite';
import { initializePerformanceOptimizations } from './initializers/performanceOptimizer';
import { initializeQualityManagementApi } from './initializers/qualityApiInitializer';
import { tenantContextMiddleware } from './middleware/tenantContext';
import errorHandler from './middleware/errorHandlerMiddleware';
import globalErrorHandler from './utils/globalErrorHandler';
import fs from 'fs';
import { initializeDatabase } from './db/initDatabase';
import OpenAI from 'openai';
import multer from 'multer';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';
import qmpRoutes from './routes/qmp.js';
import qmpAuditRoutes from './routes/qmp-audit.js';
import reportsRoutes from './routes/reports.js';
import cerv2ProtectionRoutes from './routes/cerv2-protection.js';
import tenantSectionGatingRoutes from './routes/tenant-section-gating.js';
import moduleIntegrationRoutes from './routes/moduleIntegrationRoutes';
import deviceProfileRoutes from './routes/deviceProfileRoutes';
import { router as estar510kRouter } from './routes/510kEstarRoutes.ts';
import fda510kRoutes from './routes/fda510kRoutes.js';
import { createHealthCheckRouter } from './routes/healthCheck';
import { create510kIndexes, test510kDatabasePerformance } from './utils/database-optimizer.ts';

// Load environment variables
dotenv.config();

// Create Express application
const app = express();
const port = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== 'production';

// Create database connection pool
const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware
// CORS headers handled manually until cors package is installed
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Org-ID, X-Client-ID, X-Module'
  );
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static JavaScript files from various directories with proper MIME types
app.use(
  '/js',
  express.static(path.join(process.cwd(), 'js'), {
    setHeaders: (res, filePath) => {
      if (path.extname(filePath) === '.js') {
        res.setHeader('Content-Type', 'application/javascript');
      }
    },
  })
);
app.use('/public', express.static(path.join(process.cwd(), 'public')));

// Register API routes
// registerRoutes(app);

// Import and register QMP routes
app.use('/api/qmp', qmpRoutes);
console.log('QMP API routes registered');

// Import and register QMP audit trail routes
app.use('/api/qmp', qmpAuditRoutes);
console.log('QMP Audit Trail routes registered');

// Import and register Reports API routes
app.use('/api/reports', reportsRoutes);
console.log('Reports API routes registered');

// Import and register CERV2 protection routes
app.use('/api/cerv2', cerv2ProtectionRoutes);
console.log('CERV2 Protection API routes registered');

// Import and register tenant section gating API routes
app.use('/api/tenant-section-gating', tenantSectionGatingRoutes);
console.log('Tenant Section Gating routes registered');

// Import and register module integration routes
app.use('/api/module-integration', moduleIntegrationRoutes);
console.log('Module Integration routes registered');

// Import and register 510(k) automation routes
// Legacy imports have been removed in favor of the unified API

// Register the new unified device profile routes
app.use('/api/device-profiles', deviceProfileRoutes);
console.log('Unified Device Profile routes registered at /api/device-profiles');

// Legacy device profile routes have been removed
// All device profile operations now use /api/device-profiles

// Import and register 510(k) eSTAR routes directly
app.use('/api/fda510k/estar', estar510kRouter);
console.log('FDA 510(k) eSTAR routes registered at /api/fda510k/estar');

// Import and register FDA 510(k) Routes
app.use('/api/fda510k', fda510kRoutes);
console.log('FDA 510(k) routes registered at /api/fda510k');

// We'll register the regulatory AI routes below with FDA 510(k) routes

// Import and register health check routes
app.use('/api', createHealthCheckRouter(dbPool));

// Import and initialize Quality Management API
// Import database optimizer for 510(k) workflow performance

// Use async IIFE to initialize both QMP API and database optimizations safely
(async () => {
  // Initialize Quality Management API
  await initializeQualityManagementApi(app);
  console.log('Quality Management API initialized');
  
  // Initialize 510(k) database optimizations
  try {
    console.log('Initializing 510(k) database performance optimizations...');
    await create510kIndexes();
    
    // Test database performance after optimization
    const performance = await test510kDatabasePerformance();
    if (performance.success) {
      console.log(`510(k) database optimization complete. Query latency: ${performance.latency}ms`);
    } else {
      console.warn('510(k) database optimization completed with warnings. Performance may be degraded.');
    }
  } catch (dbOptimizeError) {
    console.error('Error initializing 510(k) database optimizations:', dbOptimizeError);
    // Continue server startup despite optimization errors
  }
})().catch(err => console.error('Error during initialization:', err));

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

// Create HTTP server
const httpServer = createHttpServer(app);

// Direct access to cerv2 should be handled by Vite for client-side routing
// No special handler needed

// Setup Vite middleware in development mode
if (isDev) {
  // Setup Vite dev middleware
  setupVite(app, httpServer).catch(err => {
    console.error('Error setting up Vite:', err);
    process.exit(1);
  });
}

// Initialize global error handlers to catch uncaught exceptions
globalErrorHandler.initializeStabilityMeasures();

// Apply the error handler middleware
app.use(errorHandler);

// In production mode, serve static files from the client/dist directory
if (!isDev) {
  const clientDist = path.resolve(__dirname, '../client/dist');
  app.use(express.static(clientDist));
  
  // In production, serve index.html for client-side routes
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({
        error: {
          message: `API route not found: ${req.method} ${req.path}`,
          status: 404,
        },
      });
    }
    
    console.log(`[PROD] Serving index.html for client-side route: ${req.path}`);
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  // In development mode, handle API 404s
  // Vite middleware will handle serving the client app (configured earlier)
  app.use('/api/*', (req, res) => {
    console.log(`[DEV] API route not found: ${req.method} ${req.path}`);
    res.status(404).json({
      error: {
        message: `API route not found: ${req.method} ${req.path}`,
        status: 404,
      },
    });
  });
}

// Start server with error handling
httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Health check available at http://localhost:${port}/api/health`);
  console.log('STABILITY MODE ACTIVE: All error handlers initialized');

  // Initialize performance optimizations after server has started
  initializePerformanceOptimizations().catch(err =>
    console.error('Error initializing performance optimizations:', err)
  );
  
  // Initialize database tables
  initializeDatabase().catch(err =>
    console.error('Error initializing database:', err)
  );
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Export app for testing
export default app;
