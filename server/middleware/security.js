/**
 * TrialSage Security Middleware
 * 
 * This middleware implements comprehensive security controls for TrialSage,
 * including FDA 21 CFR Part 11 compliance, blockchain verification, and
 * advanced audit logging capabilities.
 */

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const blockchainService = require('../services/blockchain-service');

// Audit log state (in-memory, would be persisted in production)
const auditLogs = [];

/**
 * Authenticate request
 * 
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
function authenticateRequest(req, res, next) {
  // In a real implementation, this would authenticate the request
  // For this example, we'll simulate authentication
  
  // Set user information on request
  if (!req.user) {
    req.user = {
      id: 'system',
      username: 'system',
      roles: ['SYSTEM']
    };
  }
  
  // Log authentication
  auditLog('AUTHENTICATION', {
    userId: req.user.id,
    username: req.user.username,
    roles: req.user.roles,
    ip: req.ip,
    path: req.path,
    method: req.method
  });
  
  next();
}

/**
 * Authorize request
 * 
 * @param {Array<string>} requiredRoles - Required roles for access
 * @returns {Function} - Express middleware
 */
function authorizeRequest(requiredRoles) {
  return (req, res, next) => {
    // In a real implementation, this would check user roles against required roles
    // For this example, we'll simulate authorization
    
    const userRoles = req.user?.roles || [];
    const authorized = !requiredRoles || requiredRoles.some(role => userRoles.includes(role));
    
    // Log authorization
    auditLog('AUTHORIZATION', {
      userId: req.user?.id,
      username: req.user?.username,
      roles: userRoles,
      requiredRoles,
      authorized,
      path: req.path,
      method: req.method
    });
    
    if (!authorized) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this resource'
      });
    }
    
    next();
  };
}

/**
 * Log audit event
 * 
 * @param {string} eventType - Audit event type
 * @param {Object} details - Audit event details
 * @returns {Object} - Audit event
 */
function auditLog(eventType, details) {
  try {
    // Create audit event
    const eventId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const auditEvent = {
      eventId,
      eventType,
      timestamp,
      details
    };
    
    // Add to audit logs
    auditLogs.push(auditEvent);
    
    // Log to console for debugging
    console.log(`[AUDIT] ${eventType} - ${JSON.stringify(details)}`);
    
    // Record critical events on blockchain
    if (isCriticalEvent(eventType)) {
      recordOnBlockchain(eventType, auditEvent);
    }
    
    return auditEvent;
  } catch (error) {
    console.error('Error creating audit log:', error);
    return null;
  }
}

/**
 * Check if event is critical (requires blockchain verification)
 * 
 * @param {string} eventType - Event type
 * @returns {boolean} - Whether event is critical
 */
function isCriticalEvent(eventType) {
  const criticalEvents = [
    'ELECTRONIC_SIGNATURE_CREATED',
    'ELECTRONIC_SIGNATURE_VERIFIED',
    'ELECTRONIC_SIGNATURE_FAILED',
    'DOCUMENT_CREATED',
    'DOCUMENT_MODIFIED',
    'DOCUMENT_DELETED',
    'SECURITY_VIOLATION',
    'AUTHENTICATION_FAILED',
    'USER_CREATED',
    'USER_MODIFIED',
    'USER_DELETED',
    'ROLE_MODIFIED',
    'COMPLIANCE_VALIDATION_COMPLETED',
    'VALIDATION_COMPLETED',
    'SYSTEM_CONFIGURATION_CHANGED'
  ];
  
  return criticalEvents.includes(eventType);
}

/**
 * Record audit event on blockchain
 * 
 * @param {string} eventType - Event type
 * @param {Object} auditEvent - Audit event
 */
async function recordOnBlockchain(eventType, auditEvent) {
  try {
    // Create event hash
    const eventHash = crypto.createHash('sha256')
      .update(JSON.stringify(auditEvent))
      .digest('hex');
    
    // Record on blockchain
    await blockchainService.recordAuditEventOnBlockchain(eventType, {
      eventId: auditEvent.eventId,
      timestamp: auditEvent.timestamp,
      eventType: auditEvent.eventType,
      eventHash
    });
    
    console.log(`[BLOCKCHAIN] Recorded audit event ${auditEvent.eventId} on blockchain`);
  } catch (error) {
    console.error('Error recording audit event on blockchain:', error);
  }
}

/**
 * Get audit logs
 * 
 * @param {Object} options - Query options
 * @returns {Object} - Audit logs
 */
function getAuditLogs(options = {}) {
  try {
    // Parse options
    const limit = options.limit || 100;
    const skip = options.skip || 0;
    const eventType = options.eventType;
    const userId = options.userId;
    const startDate = options.startDate ? new Date(options.startDate) : null;
    const endDate = options.endDate ? new Date(options.endDate) : null;
    
    // Filter logs
    let filteredLogs = [...auditLogs];
    
    if (eventType) {
      filteredLogs = filteredLogs.filter(log => log.eventType === eventType);
    }
    
    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.details.userId === userId);
    }
    
    if (startDate) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= startDate);
    }
    
    if (endDate) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= endDate);
    }
    
    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Apply pagination
    const paginatedLogs = filteredLogs.slice(skip, skip + limit);
    
    // Count security events
    const securityEvents = auditLogs.filter(log => 
      log.eventType.includes('SECURITY') || 
      log.eventType.includes('AUTHENTICATION') || 
      log.eventType.includes('AUTHORIZATION')
    ).length;
    
    return {
      totalEvents: auditLogs.length,
      filteredEvents: filteredLogs.length,
      securityEvents,
      events: paginatedLogs
    };
  } catch (error) {
    console.error('Error getting audit logs:', error);
    throw new Error(`Failed to get audit logs: ${error.message}`);
  }
}

/**
 * Verify document integrity middleware
 * 
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
async function verifyDocumentIntegrity(req, res, next) {
  try {
    // Only verify for specific routes
    if (!req.path.startsWith('/api/documents/')) {
      return next();
    }
    
    // Extract document ID from path
    const documentId = req.path.split('/')[3];
    
    if (!documentId) {
      return next();
    }
    
    // Verify document integrity
    try {
      const verificationResult = await blockchainService.verifyDocumentIntegrity({
        id: documentId
      });
      
      // Log verification
      auditLog('DOCUMENT_INTEGRITY_VERIFIED', {
        documentId,
        verified: verificationResult.verified,
        userId: req.user?.id
      });
      
      // Set verification result on request
      req.documentIntegrity = verificationResult;
    } catch (error) {
      // Log verification error
      auditLog('DOCUMENT_INTEGRITY_VERIFICATION_FAILED', {
        documentId,
        error: error.message,
        userId: req.user?.id
      });
      
      // Set verification error on request
      req.documentIntegrity = {
        verified: false,
        error: error.message
      };
    }
    
    next();
  } catch (error) {
    console.error('Error in document integrity middleware:', error);
    next();
  }
}

/**
 * Register security middleware routes
 * 
 * @param {Express} app - Express app
 */
function registerSecurityRoutes(app) {
  // Get audit logs
  app.get('/api/security/audit-logs', (req, res) => {
    try {
      const options = {
        limit: parseInt(req.query.limit) || 100,
        skip: parseInt(req.query.skip) || 0,
        eventType: req.query.eventType,
        userId: req.query.userId,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };
      
      const logs = getAuditLogs(options);
      
      res.json(logs);
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });
  
  // Get security statistics
  app.get('/api/security/statistics', (req, res) => {
    try {
      // Get blockchain statistics
      const blockchainStats = blockchainService.getBlockchainStatistics();
      
      // Count security events
      const securityEvents = auditLogs.filter(log => 
        log.eventType.includes('SECURITY') || 
        log.eventType.includes('AUTHENTICATION') || 
        log.eventType.includes('AUTHORIZATION')
      ).length;
      
      // Count failed authentications
      const failedAuthentications = auditLogs.filter(log => 
        log.eventType === 'AUTHENTICATION_FAILED'
      ).length;
      
      // Count blocked requests
      const blockedRequests = auditLogs.filter(log => 
        log.eventType === 'AUTHORIZATION' && !log.details.authorized
      ).length;
      
      res.json({
        totalEvents: auditLogs.length,
        securityEvents,
        failedAuthentications,
        blockedRequests,
        blockchain: blockchainStats
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });
}

/**
 * Initialize security middleware
 * 
 * @param {Express} app - Express app
 */
function initializeSecurityMiddleware(app) {
  // Add security middleware to all routes
  app.use(authenticateRequest);
  
  // Add document integrity verification middleware
  app.use(verifyDocumentIntegrity);
  
  // Register security routes
  registerSecurityRoutes(app);
  
  console.log('Security middleware initialized');
}

module.exports = {
  authenticateRequest,
  authorizeRequest,
  auditLog,
  getAuditLogs,
  verifyDocumentIntegrity,
  initializeSecurityMiddleware,
  registerSecurityRoutes
};