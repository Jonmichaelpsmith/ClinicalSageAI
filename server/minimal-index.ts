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

// Client portal route
app.get('/client-portal', (req, res) => {
  console.log('Serving client portal');
  const landingPath = path.join(process.cwd(), 'clean_landing_page.html');
  if (fs.existsSync(landingPath)) {
    res.sendFile(landingPath);
  } else {
    res.status(200).send('<h1>TrialSage Client Portal</h1><p>Client portal is running in minimal mode while we fix the path-to-regexp error.</p>');
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