// /server/server.js

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
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

// EMERGENCY RESET ENDPOINT - Direct vault reset endpoint
app.post('/api/vault/reset', (req, res) => {
  console.log('🚨 EMERGENCY VAULT RESET: Directly resetting vault metadata');
  try {
    // Find metadata.json in the possible locations
    const locations = [
      path.join(__dirname, '../uploads/metadata.json'),
      path.join(__dirname, '../../uploads/metadata.json'),
      path.join(process.cwd(), 'uploads/metadata.json')
    ];
    
    let metadataPath = null;
    let success = false;
    
    // Try each location
    for (const loc of locations) {
      try {
        // Check if directory exists first
        const dir = path.dirname(loc);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          console.log(`Created directory: ${dir}`);
        }
        
        // Delete existing file if it exists
        if (fs.existsSync(loc)) {
          fs.unlinkSync(loc);
          console.log(`Deleted existing metadata at: ${loc}`);
        }
        
        // Write empty array to file
        fs.writeFileSync(loc, '[]');
        console.log(`Reset metadata at: ${loc}`);
        success = true;
        metadataPath = loc;
        break;
      } catch (err) {
        console.log(`Failed to write to ${loc}: ${err.message}`);
      }
    }
    
    if (success) {
      console.log(`✅ Successfully reset vault metadata to empty array at ${metadataPath}`);
      return res.status(200).json({
        success: true,
        message: 'Vault metadata has been reset to empty array',
        location: metadataPath,
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error('Could not find or create metadata.json in any location');
    }
  } catch (error) {
    console.error('❌ Error in emergency vault reset endpoint:', error);
    return res.status(200).json({
      success: false,
      message: 'Error resetting vault metadata: ' + error.message,
      error: error.stack
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