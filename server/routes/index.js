const express = require('express');
const templateRoutes = require('./templateRoutes');
const logger = require('../utils/logger').createLogger('routes-index');

function registerRoutes(app) {
  // Register template routes
  app.use('/api/templates', templateRoutes);
  logger.info('Template API routes registered');

  // Add other routes as needed
  
  return app;
}

module.exports = { registerRoutes };