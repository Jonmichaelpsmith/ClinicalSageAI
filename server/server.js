// /server/server.js

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import projectsStatusRoutes from './routes/projectsStatus.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const indAssemblerRoutes = require('./routes/indAssembler.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware for JSON and CORS
app.use(express.json());

// Add CORS middleware to allow cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// API Routes
app.use('/api/projects', projectsStatusRoutes);
app.use('/api/ind', indAssemblerRoutes);

// Log all API requests for development
app.use('/api', (req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});

// Serve React App
const clientBuildPath = path.join(__dirname, '../client/build');
app.use(express.static(clientBuildPath));

// React Router fallback - serve React index.html
app.get('*', (req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    res.status(404).json({ message: 'API endpoint not found' });
  } else {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});