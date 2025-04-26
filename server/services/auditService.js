/**
 * Audit Service
 * 
 * Provides enterprise-grade audit logging services with compliance features.
 * 
 * Enterprise features include:
 * - Multi-level severity tracking
 * - User and tenant attribution
 * - ISO timestamp conversion
 * - Database persistence
 * - Event categorization
 * - Compliance metadata
 */

// In-memory audit log store for development
// In production, this would be replaced with a database connection
const auditLogs = [];

/**
 * Log an audit event
 * 
 * @param {Object} event - Audit event to log
 * @param {string} event.action - Action that was performed
 * @param {string} event.resource - Resource that was affected
 * @param {string} event.userId - ID of the user who performed the action
 * @param {string} event.tenantId - ID of the tenant for the action
 * @param {string} [event.ipAddress] - IP address of the request
 * @param {string} [event.details] - Additional event details
 * @param {string} [event.severity='info'] - Event severity (low, medium, high)
 * @param {string} [event.category='system'] - Event category
 * @param {Object} [event.metadata] - Additional metadata
 */
function auditLog(event) {
  // Ensure required fields are present
  if (!event.action || !event.resource) {
    console.error('Audit log event missing required fields');
    return;
  }
  
  // Create a complete audit log entry
  const logEntry = {
    id: generateId(),
    action: event.action,
    resource: event.resource,
    userId: event.userId || 'system',
    tenantId: event.tenantId || 'system',
    ipAddress: event.ipAddress || null,
    details: event.details || null,
    severity: event.severity || 'info',
    category: event.category || 'system',
    metadata: event.metadata || {},
    timestamp: event.timestamp || new Date().toISOString(),
    retentionPeriod: calculateRetentionPeriod(event),
    expiresAt: calculateExpirationDate(event)
  };
  
  // Store the log in memory (for development)
  // In production, this would write to a database
  auditLogs.unshift(logEntry);
  
  // Limit in-memory log size
  if (auditLogs.length > 1000) {
    auditLogs.pop();
  }
  
  return logEntry;
}

/**
 * Get audit logs with filtering options
 * 
 * @param {Object} [filters] - Query filters
 * @param {string} [filters.tenantId] - Filter by tenant ID
 * @param {string} [filters.userId] - Filter by user ID
 * @param {string} [filters.action] - Filter by action
 * @param {string} [filters.resource] - Filter by resource
 * @param {string} [filters.severity] - Filter by severity
 * @param {string} [filters.category] - Filter by category
 * @param {string} [filters.startDate] - Filter by start date (ISO string)
 * @param {string} [filters.endDate] - Filter by end date (ISO string)
 * @param {number} [page=1] - Page number
 * @param {number} [pageSize=50] - Page size
 * @returns {Object} Query results with pagination info
 */
function getAuditLogs(filters = {}, page = 1, pageSize = 50) {
  let results = [...auditLogs];
  
  // Apply filters
  if (filters.tenantId) {
    results = results.filter(log => log.tenantId === filters.tenantId);
  }
  
  if (filters.userId) {
    results = results.filter(log => log.userId === filters.userId);
  }
  
  if (filters.action) {
    results = results.filter(log => log.action === filters.action);
  }
  
  if (filters.resource) {
    results = results.filter(log => log.resource.includes(filters.resource));
  }
  
  if (filters.severity) {
    results = results.filter(log => log.severity === filters.severity);
  }
  
  if (filters.category) {
    results = results.filter(log => log.category === filters.category);
  }
  
  if (filters.startDate) {
    const startDate = new Date(filters.startDate);
    results = results.filter(log => new Date(log.timestamp) >= startDate);
  }
  
  if (filters.endDate) {
    const endDate = new Date(filters.endDate);
    results = results.filter(log => new Date(log.timestamp) <= endDate);
  }
  
  // Calculate pagination
  const totalCount = results.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const validPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (validPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);
  
  // Extract the page of results
  const paginatedResults = results.slice(startIndex, endIndex);
  
  return {
    results: paginatedResults,
    pagination: {
      page: validPage,
      pageSize,
      totalCount,
      totalPages,
      hasNextPage: validPage < totalPages,
      hasPreviousPage: validPage > 1
    }
  };
}

/**
 * Get an audit log entry by ID
 * 
 * @param {string} id - Audit log entry ID
 * @returns {Object|null} Audit log entry or null if not found
 */
function getAuditLogById(id) {
  return auditLogs.find(log => log.id === id) || null;
}

/**
 * Delete audit logs matching the given filters
 * 
 * @param {Object} filters - Deletion filters
 * @param {string} [filters.tenantId] - Filter by tenant ID
 * @param {string} [filters.olderThan] - Delete logs older than date (ISO string)
 * @param {string} [filters.category] - Filter by category
 * @param {string} [filters.severity] - Filter by severity
 * @returns {number} Number of logs deleted
 */
function deleteAuditLogs(filters) {
  const initialCount = auditLogs.length;
  
  // Ensure at least one filter is provided to prevent accidental deletion
  if (!filters || Object.keys(filters).length === 0) {
    return 0;
  }
  
  // Apply deletion filters
  let deleteIndices = [];
  
  auditLogs.forEach((log, index) => {
    let shouldDelete = true;
    
    if (filters.tenantId && log.tenantId !== filters.tenantId) {
      shouldDelete = false;
    }
    
    if (filters.olderThan && new Date(log.timestamp) >= new Date(filters.olderThan)) {
      shouldDelete = false;
    }
    
    if (filters.category && log.category !== filters.category) {
      shouldDelete = false;
    }
    
    if (filters.severity && log.severity !== filters.severity) {
      shouldDelete = false;
    }
    
    if (shouldDelete) {
      deleteIndices.push(index);
    }
  });
  
  // Delete in reverse order to maintain indices
  for (let i = deleteIndices.length - 1; i >= 0; i--) {
    auditLogs.splice(deleteIndices[i], 1);
  }
  
  return initialCount - auditLogs.length;
}

/**
 * Generate a unique ID for an audit log entry
 * 
 * @returns {string} Unique ID
 */
function generateId() {
  return 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Calculate the retention period for an audit log entry
 * 
 * @param {Object} event - Audit event
 * @returns {string} Retention period
 */
function calculateRetentionPeriod(event) {
  // Default to 1 year retention
  let period = '1year';
  
  // Apply retention rules based on event characteristics
  if (event.severity === 'high') {
    // High severity events kept for 7 years (regulatory compliance)
    period = '7years';
  } else if (event.action.includes('DELETE') || event.action.includes('REMOVE')) {
    // Deletion events kept for 3 years
    period = '3years';
  } else if (event.action.includes('AUTH') || event.action.includes('LOGIN')) {
    // Authentication events kept for 2 years
    period = '2years';
  }
  
  return period;
}

/**
 * Calculate the expiration date for an audit log entry
 * 
 * @param {Object} event - Audit event
 * @returns {string} ISO date string for expiration
 */
function calculateExpirationDate(event) {
  const now = new Date();
  const expirationDate = new Date(now);
  
  const period = calculateRetentionPeriod(event);
  
  // Apply the retention period
  switch (period) {
    case '7years':
      expirationDate.setFullYear(now.getFullYear() + 7);
      break;
    case '3years':
      expirationDate.setFullYear(now.getFullYear() + 3);
      break;
    case '2years':
      expirationDate.setFullYear(now.getFullYear() + 2);
      break;
    case '1year':
    default:
      expirationDate.setFullYear(now.getFullYear() + 1);
      break;
  }
  
  return expirationDate.toISOString();
}

/**
 * Export CSV of audit logs
 * 
 * @param {Array} logs - Audit logs to export
 * @returns {string} CSV content
 */
function exportLogsToCSV(logs) {
  if (!logs || logs.length === 0) {
    return 'No data to export';
  }
  
  // Define CSV columns
  const columns = [
    'id',
    'timestamp',
    'action',
    'resource',
    'userId',
    'tenantId',
    'ipAddress',
    'details',
    'severity',
    'category'
  ];
  
  // Create CSV header row
  let csv = columns.join(',') + '\n';
  
  // Add data rows
  logs.forEach(log => {
    const row = columns.map(column => {
      let value = log[column] || '';
      
      // Escape value if it contains commas, quotes, or newlines
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      
      return value;
    });
    
    csv += row.join(',') + '\n';
  });
  
  return csv;
}

module.exports = {
  auditLog,
  getAuditLogs,
  getAuditLogById,
  deleteAuditLogs,
  exportLogsToCSV
};