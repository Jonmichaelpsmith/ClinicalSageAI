/**
 * CER Routes Integration
 * 
 * This module integrates the CER generator API routes with the Express server.
 */

import cerRoutes from './routes/cer-routes.js';

/**
 * Register CER routes with the Express application
 * 
 * @param {Express} app The Express application instance
 */
export function registerCerRoutes(app) {
  // Mount CER routes under /api/cer
  app.use('/api/cer', cerRoutes);
  
  console.log('CER API routes registered');
  
  // Add a health check endpoint for the CER API
  app.get('/api/cer/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'LumenTrialGuide.AI CER Generator',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });
}

export default {
  registerCerRoutes
};