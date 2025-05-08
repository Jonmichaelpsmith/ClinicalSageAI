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

// JS File Response Monitoring Middleware
// This middleware monitors JS file requests to detect if they return HTML content
app.use((req, res, next) => {
  // Only monitor GET requests for JavaScript files
  if (req.method !== 'GET' || !req.path.endsWith('.js')) {
    return next();
  }
  
  // Save the original send method
  const originalSend = res.send;
  
  // Override the send method to check response type for JS files
  res.send = function(body) {
    // Check if the response is likely HTML (contains HTML tags) but should be JavaScript
    if (typeof body === 'string' && body.includes('<!DOCTYPE html>') || body.includes('<html')) {
      console.error(`WARNING: JavaScript file ${req.path} is being served with HTML content!`);
      
      // In production, you might want to log this to a monitoring service
      if (process.env.NODE_ENV === 'production') {
        // Example: log to a monitoring service or file
        console.error(`CRITICAL ERROR: JavaScript file ${req.path} returned HTML content in production`);
      }
    }
    
    // Continue with the original send
    return originalSend.call(this, body);
  };
  
  next();
});

app.use(express.json());

// Serve static files from the root directory
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Serve static JavaScript files from various directories with proper MIME types
// This ensures JS files are served with Content-Type: application/javascript
app.use('/js', express.static(path.join(process.cwd(), 'js'), {
  setHeaders: (res, filePath) => {
    if (path.extname(filePath) === '.js') {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));
app.use('/public', express.static(path.join(process.cwd(), 'public'), {
  setHeaders: (res, filePath) => {
    if (path.extname(filePath) === '.js') {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// 2. Register API routes before the catch-all
registerRoutes(app);

// 3. Serve the marketing landing page at the root URL
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

// 4. Alternative marketing page route
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

// Add a catch-all route for SPA client-side routing
// This should come after all other routes but before Vite setup
app.get('*', (req, res, next) => {
  // Skip asset handling for Vite-specific paths
  // This ensures Vite's HMR and other dev-specific routes still work
  if (
    req.path.startsWith('/@vite/') || 
    req.path.startsWith('/@fs/') || 
    req.path.startsWith('/@react-refresh') ||
    req.path.startsWith('/node_modules/')
  ) {
    return next();
  }
  
  // If the request looks like a static asset but wasn't found by express.static,
  // warn but still let Vite try to handle it
  if (/\.(js|css|png|svg|ico|map)$/i.test(req.path)) {
    console.log(`Note: Asset requested: ${req.path}`);
  }
  
  // For all other routes, pass to the next handler (which will be Vite in dev mode)
  next();
});

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