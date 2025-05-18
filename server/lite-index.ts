import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { createServer as createHttpServer } from 'http';
import { setupVite } from './vite';

// Initialize environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());

// Set up Vite for development
setupVite(app);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create HTTP server
const httpServer = createHttpServer(app);

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
});