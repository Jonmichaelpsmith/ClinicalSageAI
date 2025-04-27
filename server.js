// Simple Express server to handle TrialSage app
const express = require('express');
const path = require('path');
const { createServer } = require('http');

// Create Express app
const app = express();

// Middleware for JSON parsing
app.use(express.json());

// Basic logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mock authentication endpoints
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  // Mock authentication - accept any credentials
  res.status(200).json({
    id: 1,
    username: username || 'demo',
    email: `${username || 'demo'}@example.com`,
    firstName: username || 'Demo',
    lastName: 'User',
    role: 'client'
  });
});

app.post('/api/logout', (req, res) => {
  res.status(200).send('Logged out successfully');
});

app.get('/api/user', (req, res) => {
  // Mock authenticated user
  res.status(200).json({
    id: 1,
    username: 'client',
    email: 'client@example.com',
    firstName: 'Client',
    lastName: 'User',
    role: 'client'
  });
});

// Serve static files from client/dist in production
// or let Vite handle it in development
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
  app.use(express.static(path.join(__dirname, 'client/dist')));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, 'client/dist/index.html'));
    } else {
      res.status(404).json({ error: 'API endpoint not found' });
    }
  });
} else {
  // In development, forward to Vite dev server
  console.log('Development mode - client requests will be handled by Vite');
}

// Create and start HTTP server
const PORT = process.env.PORT || 5000;
const server = createServer(app);

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