const express = require('express');
const templateRoutes = require('./templateRoutes');
const collaborationRoutes = require('./collaborationRoutes');
const logger = require('../utils/logger').createLogger('routes-index');

function registerRoutes(app) {
  // Register template routes
  app.use('/api/templates', templateRoutes);
  logger.info('Template API routes registered');

  // Register collaboration routes
  app.use('/api/collaboration', collaborationRoutes);
  logger.info('Collaboration API routes registered');
  
  return app;
}

module.exports = { registerRoutes };