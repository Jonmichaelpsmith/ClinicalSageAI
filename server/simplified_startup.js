/**
 * Simplified Server Startup Script
 * 
 * This is a specialized startup script that focuses only on essential server functionality
 * to improve startup time and reliability.
 */

const express = require('express');
const http = require('http');
const path = require('path');

// Create basic Express app
const app = express();
app.use(express.json());

// Basic logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Simple API endpoint for health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Static file serving for client
if (process.env.NODE_ENV === 'production') {
  // Serve static files from client/dist for production
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  // Serve index.html for any other client routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    } else {
      res.status(404).json({ error: 'API endpoint not found' });
    }
  });
} else {
  // In development, let the original server handle static files
  console.log('Running in development mode - Vite will serve client files');
}

// Start HTTP server
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});