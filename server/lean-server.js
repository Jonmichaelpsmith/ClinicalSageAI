/**
 * Ultra-lightweight server for memory-constrained environments
 * This addresses the "pthread_create: Resource temporarily unavailable" error
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app with minimal middleware
const app = express();
const PORT = process.env.PORT || 5000;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Basic static file serving for development
app.use(express.static(path.join(__dirname, '../client')));

// Simple catch-all route to serve the main client app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Create HTTP server
const server = createServer(app);

// Start the server with minimal resources
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Lightweight server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
  console.log(`Application available at http://localhost:${PORT}/`);
});