/**
 * TrialSage Emergency Server Starter
 * This bypasses the problematic path-to-regexp issues
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { createServer } = require('http');

// Create Express application
const app = express();
const port = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve static files
app.use('/js', express.static(path.join(process.cwd(), 'js')));
app.use('/public', express.static(path.join(process.cwd(), 'public')));

// Basic API endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'TrialSage API is running',
    timestamp: new Date().toISOString()
  });
});

// Main landing page
app.get('/', (req, res) => {
  const landingPage = path.join(process.cwd(), 'clean_landing_page.html');
  if (fs.existsSync(landingPage)) {
    res.sendFile(landingPage);
  } else {
    res.send('<h1>TrialSage Emergency Server</h1><p>This server is running in emergency mode.</p>');
  }
});

// Client portal
app.get('/client-portal', (req, res) => {
  res.redirect('/');
});

// Start server
const server = createServer(app);
server.listen(port, () => {
  console.log(`Emergency server running on port ${port}`);
  console.log(`Health check available at http://localhost:${port}/api/health`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});