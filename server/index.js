/**
 * TrialSage Server
 * 
 * This is the main entry point for the TrialSage server,
 * which provides comprehensive FDA 21 CFR Part 11 compliance
 * for regulatory submissions.
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { registerRoutes } = require('./routes');
const securityMiddleware = require('./middleware/security');
const blockchainService = require('./services/blockchain-service');
const fdaComplianceService = require('./services/fda-compliance-service');
const dataIntegrityService = require('./services/data-integrity-service');
const electronicSignatureService = require('./services/electronic-signature-service');
const validationService = require('./services/validation-service');

// Create Express app
const app = express();

// Add middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize security middleware
securityMiddleware.initializeSecurityMiddleware(app);

// Register routes
const httpServer = registerRoutes(app);

// Register API routes for services
blockchainService.registerBlockchainRoutes(app);
fdaComplianceService.registerComplianceRoutes(app);
dataIntegrityService.registerDataIntegrityRoutes(app);
electronicSignatureService.registerSignatureRoutes(app);
validationService.registerValidationRoutes(app);

// Set up port
const PORT = process.env.PORT || 3000;

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`FDA 21 CFR Part 11 compliance services initialized`);
});

// Handle unhandled exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  securityMiddleware.auditLog('SYSTEM_ERROR', {
    error: error.message,
    stack: error.stack
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled promise rejection:', reason);
  securityMiddleware.auditLog('SYSTEM_ERROR', {
    error: reason.message,
    stack: reason.stack
  });
});

module.exports = app;