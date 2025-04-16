/**
 * CER Routes Integration
 * 
 * This module integrates the Clinical Evaluation Report (CER) routes with the main Express application.
 */

const cerRoutes = require('./routes/cer-routes');
const fs = require('fs');
const path = require('path');

/**
 * Set up CER routes and ensure that the required directories exist
 * 
 * @param {Express} app Express application
 */
function setupCerRoutes(app) {
  // Ensure required directories exist
  const requiredDirs = [
    path.join(process.cwd(), 'data'),
    path.join(process.cwd(), 'data', 'exports'),
    path.join(process.cwd(), 'data', 'cache')
  ];
  
  for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  // Register the CER routes with the prefix /api/cer
  app.use('/api/cer', cerRoutes);
  
  console.log('Clinical Evaluation Report (CER) routes integrated successfully');
}

module.exports = setupCerRoutes;