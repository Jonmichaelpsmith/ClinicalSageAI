// Simple Express server for TrialSage with minimal dependencies 
// This server bypasses the TypeScript server and allows quick testing

const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Basic auth sessions using memory storage
const sessions = new Map();

// Basic logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  console.log(`[${timestamp}] ${requestId} ${req.method} ${req.path}`);
  next();
});

// Session middleware (very basic for testing)
app.use((req, res, next) => {
  const sessionId = req.headers['x-session-id'] || req.query.sessionId;
  if (sessionId && sessions.has(sessionId)) {
    req.user = sessions.get(sessionId);
  }
  next();
});

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mock auth endpoints
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  // In a real app, validate credentials
  
  // For testing, accept any credentials
  const sessionId = Date.now().toString();
  const user = {
    id: 1,
    username: username || 'demo',
    email: `${username || 'demo'}@example.com`,
    role: 'admin',
    firstName: 'Demo',
    lastName: 'User',
    sessionId
  };
  
  sessions.set(sessionId, user);
  res.json(user);
});

app.post('/api/logout', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  if (sessionId) {
    sessions.delete(sessionId);
  }
  res.status(200).send('Logged out successfully');
});

app.get('/api/user', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.user);
});

// IND wizard routes (simplified placeholders)
app.get('/api/ind/wizard/templates', (req, res) => {
  res.json([
    { id: 1, name: 'Basic IND Template', description: 'Standard IND application template' },
    { id: 2, name: 'Expedited Review Template', description: 'For expedited review process' },
    { id: 3, name: 'Advanced Template', description: 'Comprehensive IND application template' }
  ]);
});

app.get('/api/ind/wizard/sections', (req, res) => {
  res.json([
    { id: 1, name: 'Cover Letter', required: true },
    { id: 2, name: 'Form FDA 1571', required: true },
    { id: 3, name: 'Table of Contents', required: true },
    { id: 4, name: 'Introductory Statement', required: true },
    { id: 5, name: 'General Investigational Plan', required: true },
    { id: 6, name: 'Investigator Brochure', required: true },
    { id: 7, name: 'Clinical Protocol', required: true },
    { id: 8, name: 'Chemistry, Manufacturing, and Control Information', required: true },
    { id: 9, name: 'Pharmacology and Toxicology Information', required: true },
    { id: 10, name: 'Previous Human Experience', required: false },
    { id: 11, name: 'Additional Information', required: false }
  ]);
});

// Serve static files for development
// This assumes the client is built separately with Vite
const clientDistPath = path.join(__dirname, 'client/dist');
const clientSrcPath = path.join(__dirname, 'client/src');

// Check if the dist directory exists (production build)
if (fs.existsSync(clientDistPath)) {
  console.log('Serving client from production build (dist)');
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    // API requests shouldn't be handled by this catch-all
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  console.log('No client build found. Make sure to build the client with "npm run build"');
  // Fallback to serving the standalone HTML file
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'trialsage-demo.html'));
  });
}

// Start server
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down server');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});