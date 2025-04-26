/**
 * TrialSage Server Application
 * 
 * Main server setup with all required routes and middleware
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const vaultAssistantRoutes = require('./routes/vault-assistant');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Set up routes for API endpoints
app.use('/api/vault-assistant', vaultAssistantRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Route for solution pages
app.get('/solutions/vault-workspace', (req, res) => {
  console.log("[App] Serving React vault-workspace.html");
  res.sendFile(path.join(process.cwd(), 'vault-workspace.html'));
});

// Redirect any docushare-sync requests to vault-workspace
app.get('/solutions/docushare-sync', (req, res) => {
  res.redirect('/solutions/vault-workspace');
});

// Fallback route for SPA or static files
app.get('*', (req, res) => {
  // Try to serve static files for paths that may exist
  const filePath = path.join(__dirname, '../public', req.path);
  res.sendFile(filePath, (err) => {
    if (err) {
      // If the file doesn't exist, send the index.html file
      res.sendFile(path.join(__dirname, '../public/index.html'));
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message
  });
});

// Export app for server.js to use
module.exports = app;