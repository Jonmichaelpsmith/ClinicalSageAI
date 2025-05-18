// This is a simple Express server that will work with your existing files
// while fixing the path-to-regexp error

const express = require('express');
const path = require('path');
const fs = require('fs');
const { createServer } = require('http');

// Import direct API routes
const directApiRoutes = require('./server/direct-api');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(express.json());
app.use(express.static('./public'));

// API Routes
app.use('/api', directApiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString()
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});