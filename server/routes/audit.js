/**
 * Audit Trail API Routes
 * 
 * Enterprise-grade audit trail management API with compliance features.
 * 
 * Features include:
 * - Multi-tenant audit trail isolation
 * - Comprehensive filtering options
 * - CSV export for compliance reporting
 * - Retention policy management
 * - Anomaly detection for security events
 */

const express = require('express');
const router = express.Router();
const validateTenantAccess = require('../middleware/validateTenantAccess');
const { 
  getAuditLogs, 
  getAuditLogById, 
  deleteAuditLogs, 
  exportLogsToCSV,
  auditLog
} = require('../services/auditService');

// Apply tenant validation to all audit routes
router.use(validateTenantAccess);

// Additional admin check middleware
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access required for this operation'
    });
  }
  
  next();
}

/**
 * Get audit logs with filtering and pagination
 * GET /api/audit/logs
 */
router.get('/logs', requireAdmin, (req, res) => {
  // Extract query parameters
  const {
    tenantId,
    userId,
    action,
    resource,
    severity,
    category,
    startDate,
    endDate,
    page = '1',
    pageSize = '20'
  } = req.query;
  
  // Create filters object
  const filters = {};
  if (tenantId) filters.tenantId = tenantId;
  if (userId) filters.userId = userId;
  if (action) filters.action = action;
  if (resource) filters.resource = resource;
  if (severity) filters.severity = severity;
  if (category) filters.category = category;
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;
  
  // Non-admin users can only see logs for their own tenant
  if (!req.user.isAdmin || !req.user.hasMultiTenantAccess) {
    filters.tenantId = req.user.tenantId;
  }
  
  // Convert page and pageSize to numbers
  const pageNum = parseInt(page, 10);
  const pageSizeNum = parseInt(pageSize, 10);
  
  // Get logs with pagination
  const result = getAuditLogs(filters, pageNum, pageSizeNum);
  
  // Record this audit search for audit trail
  auditLog({
    action: 'AUDIT_SEARCH',
    resource: '/api/audit/logs',
    userId: req.user.id,
    tenantId: req.user.tenantId,
    ipAddress: req.ip,
    details: `Searched audit logs with filters: ${JSON.stringify(filters)}`,
    severity: 'low',
    category: 'audit'
  });
  
  res.json(result);
});

/**
 * Get audit log by ID
 * GET /api/audit/logs/:id
 */
router.get('/logs/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  
  // Get the log entry
  const logEntry = getAuditLogById(id);
  
  if (!logEntry) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Audit log entry not found'
    });
  }
  
  // Non-admin users can only see logs for their own tenant
  if (!req.user.isAdmin && logEntry.tenantId !== req.user.tenantId) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'You do not have permission to view this audit log entry'
    });
  }
  
  // Record this audit lookup
  auditLog({
    action: 'AUDIT_DETAIL_VIEW',
    resource: `/api/audit/logs/${id}`,
    userId: req.user.id,
    tenantId: req.user.tenantId,
    ipAddress: req.ip,
    details: `Viewed detailed audit log entry with ID: ${id}`,
    severity: 'low',
    category: 'audit'
  });
  
  res.json(logEntry);
});

/**
 * Export audit logs to CSV
 * GET /api/audit/export
 */
router.get('/export', requireAdmin, (req, res) => {
  // Extract query parameters (same as /logs endpoint)
  const {
    tenantId,
    userId,
    action,
    resource,
    severity,
    category,
    startDate,
    endDate
  } = req.query;
  
  // Create filters object
  const filters = {};
  if (tenantId) filters.tenantId = tenantId;
  if (userId) filters.userId = userId;
  if (action) filters.action = action;
  if (resource) filters.resource = resource;
  if (severity) filters.severity = severity;
  if (category) filters.category = category;
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;
  
  // Non-admin users can only export logs for their own tenant
  if (!req.user.isAdmin || !req.user.hasMultiTenantAccess) {
    filters.tenantId = req.user.tenantId;
  }
  
  // Get all logs matching the filters (no pagination for export)
  const result = getAuditLogs(filters, 1, Number.MAX_SAFE_INTEGER);
  
  // Generate CSV content
  const csvContent = exportLogsToCSV(result.results);
  
  // Record this audit export
  auditLog({
    action: 'AUDIT_EXPORT',
    resource: '/api/audit/export',
    userId: req.user.id,
    tenantId: req.user.tenantId,
    ipAddress: req.ip,
    details: `Exported audit logs to CSV with filters: ${JSON.stringify(filters)}`,
    severity: 'medium',
    category: 'audit'
  });
  
  // Set response headers
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="audit_logs_${new Date().toISOString().split('T')[0]}.csv"`);
  
  // Send CSV content
  res.send(csvContent);
});

/**
 * Delete audit logs by filter criteria
 * DELETE /api/audit/logs
 */
router.delete('/logs', requireAdmin, (req, res) => {
  // Ensure this is only available to administrators
  if (!req.user.isAdmin) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Only administrators can delete audit logs'
    });
  }
  
  // Extract filter criteria from request body
  const { tenantId, olderThan, category, severity } = req.body;
  
  // Create deletion filters
  const filters = {};
  if (tenantId) filters.tenantId = tenantId;
  if (olderThan) filters.olderThan = olderThan;
  if (category) filters.category = category;
  if (severity) filters.severity = severity;
  
  // Prevent accidental deletion of all logs
  if (Object.keys(filters).length === 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'At least one deletion filter is required to prevent accidental deletion of all logs'
    });
  }
  
  // Record this deletion action before performing it
  auditLog({
    action: 'AUDIT_LOG_DELETE',
    resource: '/api/audit/logs',
    userId: req.user.id,
    tenantId: req.user.tenantId,
    ipAddress: req.ip,
    details: `Deleted audit logs with filters: ${JSON.stringify(filters)}`,
    severity: 'high',
    category: 'audit'
  });
  
  // Perform the deletion
  const deletedCount = deleteAuditLogs(filters);
  
  res.json({
    success: true,
    deletedCount,
    filters
  });
});

/**
 * Get audit log statistics
 * GET /api/audit/stats
 */
router.get('/stats', requireAdmin, (req, res) => {
  // Extract tenant filter
  const { tenantId } = req.query;
  
  // Create filters for statistics
  const filters = {};
  if (tenantId) filters.tenantId = tenantId;
  
  // Non-admin users can only see stats for their own tenant
  if (!req.user.isAdmin || !req.user.hasMultiTenantAccess) {
    filters.tenantId = req.user.tenantId;
  }
  
  // Get all logs matching the filters
  const result = getAuditLogs(filters, 1, Number.MAX_SAFE_INTEGER);
  const logs = result.results;
  
  // Calculate statistics
  const stats = {
    totalCount: logs.length,
    bySeverity: {
      low: logs.filter(log => log.severity === 'low').length,
      medium: logs.filter(log => log.severity === 'medium').length,
      high: logs.filter(log => log.severity === 'high').length
    },
    byCategory: {},
    byAction: {},
    byDay: {},
    anomalies: detectAnomalies(logs)
  };
  
  // Calculate category statistics
  logs.forEach(log => {
    // Categories
    const category = log.category || 'uncategorized';
    if (!stats.byCategory[category]) {
      stats.byCategory[category] = 0;
    }
    stats.byCategory[category]++;
    
    // Actions
    const action = log.action || 'unknown';
    if (!stats.byAction[action]) {
      stats.byAction[action] = 0;
    }
    stats.byAction[action]++;
    
    // Days
    const day = log.timestamp.split('T')[0];
    if (!stats.byDay[day]) {
      stats.byDay[day] = 0;
    }
    stats.byDay[day]++;
  });
  
  // Record this stats view
  auditLog({
    action: 'AUDIT_STATS_VIEW',
    resource: '/api/audit/stats',
    userId: req.user.id,
    tenantId: req.user.tenantId,
    ipAddress: req.ip,
    details: `Viewed audit log statistics with filters: ${JSON.stringify(filters)}`,
    severity: 'low',
    category: 'audit'
  });
  
  res.json(stats);
});

/**
 * Simple anomaly detection for demonstration purposes
 * In a real system, this would use more sophisticated algorithms
 */
function detectAnomalies(logs) {
  const anomalies = [];
  const highSeverityThreshold = 5; // Threshold for high severity events
  const userActionMap = new Map(); // Map of user IDs to action counts
  const ipActionMap = new Map(); // Map of IP addresses to action counts
  
  // Count high severity events by user
  const highSeverityByUser = new Map();
  
  // Count actions by user
  logs.forEach(log => {
    // Track high severity events
    if (log.severity === 'high') {
      const count = highSeverityByUser.get(log.userId) || 0;
      highSeverityByUser.set(log.userId, count + 1);
    }
    
    // Track actions by user
    if (!userActionMap.has(log.userId)) {
      userActionMap.set(log.userId, new Map());
    }
    const userActions = userActionMap.get(log.userId);
    const actionCount = userActions.get(log.action) || 0;
    userActions.set(log.action, actionCount + 1);
    
    // Track actions by IP
    if (log.ipAddress) {
      if (!ipActionMap.has(log.ipAddress)) {
        ipActionMap.set(log.ipAddress, new Map());
      }
      const ipActions = ipActionMap.get(log.ipAddress);
      const ipActionCount = ipActions.get(log.action) || 0;
      ipActions.set(log.action, ipActionCount + 1);
    }
  });
  
  // Check for users with many high severity events
  highSeverityByUser.forEach((count, userId) => {
    if (count >= highSeverityThreshold) {
      anomalies.push({
        type: 'high_severity_activity',
        userId,
        count,
        description: `User ${userId} has ${count} high severity events`
      });
    }
  });
  
  // Detect unusual access patterns
  ipActionMap.forEach((actionMap, ipAddress) => {
    let totalActions = 0;
    actionMap.forEach(count => totalActions += count);
    
    // Check for high volumes of access from a single IP
    if (totalActions > 50) {
      anomalies.push({
        type: 'high_volume_ip',
        ipAddress,
        count: totalActions,
        description: `IP address ${ipAddress} has unusually high activity (${totalActions} actions)`
      });
    }
    
    // Check for high volumes of login attempts
    const loginAttempts = actionMap.get('AUTH_LOGIN') || 0;
    if (loginAttempts > 10) {
      anomalies.push({
        type: 'multiple_login_attempts',
        ipAddress,
        count: loginAttempts,
        description: `IP address ${ipAddress} has multiple login attempts (${loginAttempts})`
      });
    }
  });
  
  return anomalies;
}

module.exports = router;