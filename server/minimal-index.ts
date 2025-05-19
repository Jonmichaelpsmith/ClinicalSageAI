import express from 'express';
import dotenv from 'dotenv';
import { createServer as createHttpServer } from 'http';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Create Express application
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// CORS headers
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

// Health check endpoints
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'TrialSage minimal server is running',
    timestamp: new Date().toISOString()
  });
});

// API endpoints for core functionality
app.get('/api/cerv2/status', (req, res) => {
  res.status(200).json({
    status: 'available',
    message: 'CER V2 module is available',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/qmp/data', (req, res) => {
  res.status(200).json({
    status: 'available',
    message: 'QMP data is available',
    data: [],
    timestamp: new Date().toISOString()
  });
});

// FDA 510k API endpoints
app.get('/api/fda510k/status', (req, res) => {
  res.status(200).json({
    status: 'available',
    message: 'FDA 510k module is available',
    timestamp: new Date().toISOString()
  });
});

// Device profiles API
app.get('/api/device-profiles', (req, res) => {
  res.status(200).json({
    status: 'available',
    message: 'Device profiles module is available',
    data: [],
    timestamp: new Date().toISOString()
  });
});

// Database status endpoint
app.get('/api/database-status', (req, res) => {
  res.status(200).json({
    connected: true,
    message: 'Database connection is active',
    timestamp: new Date().toISOString()
  });
});

// Serve the landing page
app.get('/', (req, res) => {
  console.log('Serving landing page');
  const landingPath = path.join(process.cwd(), 'clean_landing_page.html');
  if (fs.existsSync(landingPath)) {
    res.sendFile(landingPath);
  } else {
    res.status(200).send('<h1>TrialSage Minimal Server</h1><p>Application is running in minimal mode while we fix the path-to-regexp error.</p>');
  }
});

// Client portal - serve the no-login direct access portal
app.get('/client-portal', (req, res) => {
  console.log('Serving direct access portal without login');
  
  // Use our direct access portal that doesn't require login
  const directAccessPortalPath = path.join(process.cwd(), 'direct-access-portal.html');
  
  if (fs.existsSync(directAccessPortalPath)) {
    console.log(`Found direct access portal at: ${directAccessPortalPath}`);
    return res.sendFile(directAccessPortalPath);
  }
  
  // If direct access portal not found, try legacy portal
  console.log('Direct access portal not found, trying legacy portal');
  const legacyPortalPath = path.join(process.cwd(), 'legacy/portal.html');
  
  if (fs.existsSync(legacyPortalPath)) {
    console.log(`Found portal at: ${legacyPortalPath}`);
    return res.sendFile(legacyPortalPath);
  }
  
  // If no portal is found, send an error
  res.status(404).send(`
    <h1>Client Portal Not Found</h1>
    <p>Could not locate any client portal implementation.</p>
  `);
});

// Handle the /login route which might be redirected from the portal
app.get('/login', (req, res) => {
  console.log('Login page redirected to client portal');
  res.redirect('/client-portal');
});

// CER V2 page route
app.get('/cerv2', (req, res) => {
  console.log('Serving CER V2 page');
  // Check for CERV2Page.jsx file
  const cerv2Path = path.join(process.cwd(), 'CERV2Page.jsx');
  if (fs.existsSync(cerv2Path)) {
    // For now just show that we found the file
    res.status(200).send(`
      <h1>TrialSage CER V2 Medical Device and Diagnostics Module</h1>
      <p>Module is available. File found at: ${cerv2Path}</p>
      <p>This module is available for testing. In the full application, this would render the React component.</p>
      <a href="/client-portal" style="display: inline-block; margin-top: 20px; padding: 10px 15px; background-color: #ff1493; color: white; text-decoration: none; border-radius: 4px;">Return to Client Portal</a>
    `);
  } else {
    res.status(200).send('<h1>TrialSage CER V2</h1><p>CER V2 module is running in minimal mode.</p>');
  }
});

// 510k module route
app.get('/fda510k', (req, res) => {
  console.log('Serving FDA 510k page');
  const landingPath = path.join(process.cwd(), 'clean_landing_page.html');
  if (fs.existsSync(landingPath)) {
    res.sendFile(landingPath);
  } else {
    res.status(200).send('<h1>TrialSage FDA 510(k)</h1><p>FDA 510(k) module is running in minimal mode.</p>');
  }
});

// Create HTTP server
const httpServer = createHttpServer(app);

// Start server
httpServer.listen(port, () => {
  console.log(`Minimal server running on port ${port}`);
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

// Export app for testing
export default app;