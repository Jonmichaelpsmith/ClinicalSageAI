/**
 * TrialSage API Routes
 * 
 * This module defines the core API routes for the TrialSage platform
 */

const { createServer } = require('http');

/**
 * Register routes on the Express app
 * 
 * @param {Express} app - The Express app instance
 * @returns {http.Server} - The HTTP server instance
 */
function registerRoutes(app) {
  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // Version information route
  app.get('/api/version', (req, res) => {
    res.json({
      version: '1.0.0',
      build: 'BL-20250426-FDA',
      compliance: '21 CFR Part 11',
      fdaStatusVersion: '1.2.0',
      engineVersion: '3.1.4'
    });
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}

module.exports = {
  registerRoutes
};