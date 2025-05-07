import express from 'express';
import dotenv from 'dotenv';
import { createServer as createHttpServer } from 'http';
import registerRoutes from './routes';
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

// Register API routes
registerRoutes(app);

// Add a route to handle the CER v2 page specifically
app.get('/cerv2', (req, res, next) => {
  console.log('Serving CER v2 page directly');
  if (isDev) {
    // Forward to Vite middleware for development
    next();
  } else {
    // For production, serve the index.html
    const indexPath = path.join(process.cwd(), 'dist/public/index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('CER v2 page not available');
    }
  }
});

// Create HTTP server
const httpServer = createHttpServer(app);

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