// /server/server.js

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import projectsStatusRoutes from './routes/projectsStatus.js';
import indAssemblerRoutes from './routes/indAssembler.js';
import indWizardAPIRoutes from './routes/indWizardAPI.js';
import documentsRoutes from './routes/documents.js';
import vaultUploadRoutes from './routes/vaultUpload.js';
import advisorRoutes from './routes/advisor.js'; // ✅ Clean ES module import

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

// Request Logger for API monitoring (moved to top for better visibility)
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/projects', projectsStatusRoutes);
app.use('/api/ind', indAssemblerRoutes);
app.use('/api/ind/wizard', indWizardAPIRoutes);
app.use('/api/docs', documentsRoutes);
app.use('/api/vault', vaultUploadRoutes);

// Check if advisor routes exist
console.log('✅ Loading advisor routes - object check:', Object.keys(advisorRoutes).length > 0 ? 'Routes present' : 'Empty routes object');

app.use('/api/advisor', advisorRoutes);
console.log('✅ Mounted advisor routes at /api/advisor');

// Serve React App
const clientBuildPath = path.join(__dirname, '../client/build');
app.use(express.static(clientBuildPath));

// Serve the vault test HTML page
app.get('/vault-test', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/vault-test.html'));
});

// React Router fallback - serve React index.html
app.get('*', (req, res) => {
  // Only fallback if it's NOT an API route
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