/**
 * TrialSage API Routes Index
 * 
 * This module registers all API routes with the Express application:
 * - Blockchain security routes
 * - AI security routes
 * - Security middleware
 * - IND Wizard routes (Protocol Builder, Regulatory Intelligence)
 */

const blockchainRoutes = require('./blockchain');
const aiRoutes = require('./ai');
const rolePrivilegeService = require('../services/role-privilege-service');
import protocolRoutes from './protocol.js';

/**
 * Register all API routes with the Express application
 * 
 * @param {Express} app - Express application
 */
function registerRoutes(app) {
  // Register blockchain routes
  app.use('/api/blockchain', blockchainRoutes);
  
  // Register AI routes
  app.use('/api/ai', aiRoutes);
  
  // Register role and privilege routes
  rolePrivilegeService.setupRolePrivilegeRoutes(app);
  
  // Register IND Wizard protocol routes
  app.use('/api/ind', protocolRoutes);
  
  // Root API status endpoint
  app.get('/api/status', (req, res) => {
    res.json({
      status: 'operational',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      services: [
        { name: 'blockchain', status: 'online' },
        { name: 'ai', status: 'online' },
        { name: 'security', status: 'online' },
      ],
    });
  });
}

module.exports = registerRoutes;