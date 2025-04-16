/**
 * Integration file for CER routes
 * 
 * This file adds the CER routes to the Express application
 * and ensures directories needed for CER generation are set up.
 */

const fs = require('fs');
const path = require('path');
const cerRoutes = require('./routes/cer-routes');

// Ensure required directories exist
const REQUIRED_DIRS = [
  path.join(process.cwd(), 'data'),
  path.join(process.cwd(), 'data', 'exports'),
  path.join(process.cwd(), 'data', 'uploads'),
  path.join(process.cwd(), 'uploads')
];

function ensureDirectories() {
  REQUIRED_DIRS.forEach(dir => {
    if (!fs.existsSync(dir)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

function setupCerRoutes(app) {
  // Create necessary directories
  ensureDirectories();
  
  // Add CER routes to the Express app
  app.use('/api/cer', cerRoutes);
  
  console.log('CER routes integrated successfully');
}

// Export using CommonJS module.exports
module.exports = setupCerRoutes;