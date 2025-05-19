/**
 * TrialSage Fixed Server
 * This server restores your original client portal and all modules.
 */
const express = require('express');
const path = require('path');
const fs = require('fs');

// Create Express application
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve the landing page
app.get('/', (req, res) => {
  console.log('Serving landing page');
  const landingPagePath = path.join(process.cwd(), 'clean_landing_page.html');
  if (fs.existsSync(landingPagePath)) {
    res.sendFile(landingPagePath);
  } else {
    res.status(404).send('Landing page not found');
  }
});

// Redirect /login to client portal
app.get('/login', (req, res) => {
  console.log('Login page redirected to client portal');
  res.redirect('/client-portal');
});

// Serve the client portal
app.get('/client-portal', (req, res) => {
  console.log('Serving client portal');
  const portalPath = path.join(process.cwd(), 'legacy/portal.html');
  
  if (fs.existsSync(portalPath)) {
    console.log('Found client portal at:', portalPath);
    res.sendFile(portalPath);
  } else {
    res.status(404).send('Client portal not found');
  }
});

// Serve the CERV2 page
app.get('/cerv2', (req, res) => {
  console.log('Serving CERV2 module');
  const cerv2Path = path.join(process.cwd(), 'CERV2Page.jsx');
  
  if (fs.existsSync(cerv2Path)) {
    res.header('Content-Type', 'application/javascript');
    res.sendFile(cerv2Path);
  } else {
    res.status(404).send('CERV2 module not found');
  }
});

// Handle 510k module 
app.get('/fda510k', (req, res) => {
  console.log('Serving 510k module');
  const module510kPath = path.join(process.cwd(), 'may14_complete_restore/About510kDialog.jsx');
  
  if (fs.existsSync(module510kPath)) {
    res.header('Content-Type', 'application/javascript');
    res.sendFile(module510kPath);
  } else {
    res.status(404).send('510k module not found');
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'TrialSage server is running',
    timestamp: new Date().toISOString()
  });
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`TrialSage server running on port ${port}`);
  console.log(`Health check available at http://localhost:${port}/api/health`);
});