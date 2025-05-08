import express from 'express';
import dotenv from 'dotenv';
import { createServer as createHttpServer } from 'http';
import registerRoutes from './routes_fixed';
import { setupVite } from './vite';

// Load environment variables
dotenv.config();

// Create Express application
const app = express();
const port = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== 'production';

// Middleware
// CORS headers handled manually until cors package is installed
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
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

app.use(express.json());

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
  setupVite(app, httpServer).catch((err) => {
    console.error('Error setting up Vite:', err);
    process.exit(1);
  });
}

// Start server
httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Health check available at http://localhost:${port}/api/health`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});