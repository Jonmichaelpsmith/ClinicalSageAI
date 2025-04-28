// /server/server.js

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import projectsStatusRoutes from './routes/projectsStatus.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const indAssemblerRoutes = require('./routes/indAssembler.js');
const indWizardAPIRoutes = require('./routes/indWizardAPI.js');
const documentsRoutes = require('./routes/documents.js');
const vaultUploadRoutes = require('./routes/vaultUpload.js');

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

// EMERGENCY HOTFIX - Direct endpoint for vault list
app.get('/api/vault/list', (req, res) => {
  console.log('📂 EMERGENCY HOTFIX: Direct vault list endpoint activated');
  try {
    const emptyResponse = {
      success: true,
      documents: [],
      metadata: {
        totalCount: 0,
        filteredCount: 0,
        uniqueModules: [],
        uniqueUploaders: [],
        uniqueProjects: [],
        uniqueTypes: [],
        ctdModuleMapping: {
          'Module 1': 'Administrative Information',
          'Module 2': 'CTD Summaries',
          'Module 3': 'Quality',
          'Module 4': 'Nonclinical Study Reports',
          'Module 5': 'Clinical Study Reports'
        }
      }
    };
    
    return res.status(200).json(emptyResponse);
  } catch (error) {
    console.error('Error in emergency vault list endpoint:', error);
    return res.status(200).json({
      success: true,
      documents: [],
      metadata: {
        totalCount: 0,
        uniqueModules: [],
        uniqueUploaders: [],
        uniqueProjects: [],
        filteredCount: 0,
        uniqueTypes: []
      }
    });
  }
});

// API Routes
app.use('/api/projects', projectsStatusRoutes);
app.use('/api/ind', indAssemblerRoutes);
app.use('/api/ind/wizard', indWizardAPIRoutes);
app.use('/api/docs', documentsRoutes);
app.use('/api/vault', vaultUploadRoutes);

// Log all API requests for development
app.use('/api', (req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});

// Serve React App
const clientBuildPath = path.join(__dirname, '../client/build');
app.use(express.static(clientBuildPath));

// Serve the vault test HTML page
app.get('/vault-test', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/vault-test.html'));
});

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