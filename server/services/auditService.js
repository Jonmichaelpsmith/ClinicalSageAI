// server/services/auditService.js
import { Pool } from 'pg';

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

/**
 * Save an audit log entry to the database
 * 
 * @param {Object} entry - The audit log entry to save
 * @returns {Promise<Object>} - The saved audit log entry
 */
export async function saveAuditLog(entry) {
  const client = await pool.connect();
  
  try {
    // Insert the audit entry into the database
    const query = `
      INSERT INTO audit_logs(
        user_id, username, email, tenant_id, action_type, description,
        ip_address, user_agent, resource_id, resource_type, success, metadata, timestamp
      )
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    
    // Convert entry fields to match database column names
    const values = [
      entry.user,
      entry.username,
      entry.email || null,
      entry.tenantId,
      entry.actionType,
      entry.description,
      entry.ipAddress,
      entry.userAgent,
      entry.resourceId,
      entry.resourceType,
      entry.success,
      JSON.stringify(entry.metadata || {}),
      entry.timestamp
    ];
    
    const result = await client.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error saving audit log:', error);
    // Still return the original entry even if database save fails
    return entry;
  } finally {
    client.release();
  }
}

/**
 * List audit logs with optional filtering and pagination
 * 
 * @param {string} tenantId - Tenant ID to filter by (for multi-tenant security)
 * @param {Object} filters - Optional filters
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of logs per page
 * @returns {Promise<Object>} - Paginated audit logs with total count
 */
export async function listAuditLogs(tenantId, filters = {}, page = 1, limit = 100) {
  const client = await pool.connect();
  
  try {
    // Build the WHERE clause based on filters
    let whereClause = 'tenant_id = $1';
    const queryParams = [tenantId];
    let paramCount = 1;
    
    // Add filters if provided
    if (filters.userId) {
      paramCount++;
      whereClause += ` AND user_id = $${paramCount}`;
      queryParams.push(filters.userId);
    }
    
    if (filters.actionType) {
      paramCount++;
      whereClause += ` AND action_type = $${paramCount}`;
      queryParams.push(filters.actionType);
    }
    
    if (filters.resourceType) {
      paramCount++;
      whereClause += ` AND resource_type = $${paramCount}`;
      queryParams.push(filters.resourceType);
    }
    
    if (filters.resourceId) {
      paramCount++;
      whereClause += ` AND resource_id = $${paramCount}`;
      queryParams.push(filters.resourceId);
    }
    
    if (filters.startDate) {
      paramCount++;
      whereClause += ` AND timestamp >= $${paramCount}`;
      queryParams.push(filters.startDate);
    }
    
    if (filters.endDate) {
      paramCount++;
      whereClause += ` AND timestamp <= $${paramCount}`;
      queryParams.push(filters.endDate);
    }
    
    // Special filter for anomalies
    if (filters.anomaliesOnly) {
      whereClause += ` AND (
        action_type = 'Delete' OR 
        action_type = 'BulkDelete' OR 
        success = false OR 
        description ILIKE '%error%' OR 
        description ILIKE '%fail%' OR 
        description ILIKE '%denied%'
      )`;
    }
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Query to get total count
    const countQuery = `SELECT COUNT(*) FROM audit_logs WHERE ${whereClause}`;
    const countResult = await client.query(countQuery, queryParams);
    const totalLogs = parseInt(countResult.rows[0].count);
    
    // Query to get paginated audit logs
    const query = `
      SELECT * FROM audit_logs
      WHERE ${whereClause}
      ORDER BY timestamp DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    
    // Add pagination parameters
    queryParams.push(limit, offset);
    
    const result = await client.query(query, queryParams);
    
    // Transform database column names to camelCase for client
    const logs = result.rows.map(row => ({
      id: row.id,
      user: row.user_id,
      username: row.username,
      email: row.email,
      tenantId: row.tenant_id,
      actionType: row.action_type,
      description: row.description,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      resourceId: row.resource_id,
      resourceType: row.resource_type,
      success: row.success,
      metadata: row.metadata || {},
      timestamp: row.timestamp
    }));
    
    return {
      logs,
      pagination: {
        total: totalLogs,
        page,
        limit,
        pages: Math.ceil(totalLogs / limit)
      }
    };
  } catch (error) {
    console.error('Error listing audit logs:', error);
    return {
      logs: [],
      pagination: { total: 0, page, limit, pages: 0 }
    };
  } finally {
    client.release();
  }
}

/**
 * Bulk delete audit logs based on filters
 * 
 * @param {string} tenantId - Tenant ID to filter by (for multi-tenant security)
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>} - Result with count of deleted logs
 */
export async function bulkDeleteAuditLogs(tenantId, filters = {}) {
  const client = await pool.connect();
  
  try {
    // Build the WHERE clause based on filters (similar to listAuditLogs)
    let whereClause = 'tenant_id = $1';
    const queryParams = [tenantId];
    let paramCount = 1;
    
    // Add filters if provided
    if (filters.userId) {
      paramCount++;
      whereClause += ` AND user_id = $${paramCount}`;
      queryParams.push(filters.userId);
    }
    
    if (filters.actionType) {
      paramCount++;
      whereClause += ` AND action_type = $${paramCount}`;
      queryParams.push(filters.actionType);
    }
    
    if (filters.startDate) {
      paramCount++;
      whereClause += ` AND timestamp >= $${paramCount}`;
      queryParams.push(filters.startDate);
    }
    
    if (filters.endDate) {
      paramCount++;
      whereClause += ` AND timestamp <= $${paramCount}`;
      queryParams.push(filters.endDate);
    }
    
    // Execute the DELETE query
    const query = `DELETE FROM audit_logs WHERE ${whereClause} RETURNING id`;
    const result = await client.query(query, queryParams);
    
    // Return the count of deleted rows
    return {
      deletedCount: result.rowCount
    };
  } catch (error) {
    console.error('Error bulk deleting audit logs:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Create the audit_logs table if it doesn't exist
 */
export async function ensureAuditLogTable() {
  const client = await pool.connect();
  
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        tenant_id VARCHAR(255) NOT NULL,
        action_type VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        ip_address VARCHAR(255) NOT NULL,
        user_agent TEXT,
        resource_id VARCHAR(255),
        resource_type VARCHAR(255),
        success BOOLEAN DEFAULT TRUE,
        metadata JSONB,
        timestamp TIMESTAMP NOT NULL
      )
    `);
    
    // Create indexes for better query performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_tenant_id ON audit_logs(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_action_type ON audit_logs(action_type);
      CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
    `);
    
    console.log('Audit log table and indexes created if they didn\'t exist');
    return true;
  } catch (error) {
    console.error('Error ensuring audit log table exists:', error);
    return false;
  } finally {
    client.release();
  }
}

/**
 * Export audit logs to CSV format for a specific tenant
 * 
 * @param {string} tenantId - Tenant ID to filter by
 * @param {Object} filters - Optional filters
 * @returns {Promise<string>} - CSV formatted audit logs
 */
export async function exportAuditLogsToCSV(tenantId, filters = {}) {
  const client = await pool.connect();
  
  try {
    // Build the WHERE clause based on filters (similar to listAuditLogs)
    let whereClause = 'tenant_id = $1';
    const queryParams = [tenantId];
    let paramCount = 1;
    
    // Add filters if provided (same as in listAuditLogs)
    if (filters.userId) {
      paramCount++;
      whereClause += ` AND user_id = $${paramCount}`;
      queryParams.push(filters.userId);
    }
    
    if (filters.actionType) {
      paramCount++;
      whereClause += ` AND action_type = $${paramCount}`;
      queryParams.push(filters.actionType);
    }
    
    // Add date range if provided
    if (filters.startDate) {
      paramCount++;
      whereClause += ` AND timestamp >= $${paramCount}`;
      queryParams.push(filters.startDate);
    }
    
    if (filters.endDate) {
      paramCount++;
      whereClause += ` AND timestamp <= $${paramCount}`;
      queryParams.push(filters.endDate);
    }
    
    // Special filter for anomalies (same as in listAuditLogs)
    if (filters.anomaliesOnly) {
      whereClause += ` AND (
        action_type = 'Delete' OR 
        action_type = 'BulkDelete' OR 
        success = false OR 
        description ILIKE '%error%' OR 
        description ILIKE '%fail%' OR 
        description ILIKE '%denied%'
      )`;
    }
    
    // Query to get all matching audit logs
    const query = `
      SELECT 
        id, user_id, username, email, tenant_id, action_type, description,
        ip_address, resource_id, resource_type, success, timestamp
      FROM audit_logs
      WHERE ${whereClause}
      ORDER BY timestamp DESC
    `;
    
    const result = await client.query(query, queryParams);
    
    // Generate CSV header
    let csv = 'ID,User ID,Username,Email,Tenant ID,Action Type,Description,IP Address,Resource ID,Resource Type,Success,Timestamp\n';
    
    // Add each row to CSV
    for (const row of result.rows) {
      // Escape values properly for CSV
      const escapeCsv = (value) => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      };
      
      csv += [
        row.id,
        escapeCsv(row.user_id),
        escapeCsv(row.username),
        escapeCsv(row.email),
        escapeCsv(row.tenant_id),
        escapeCsv(row.action_type),
        escapeCsv(row.description),
        escapeCsv(row.ip_address),
        escapeCsv(row.resource_id),
        escapeCsv(row.resource_type),
        row.success,
        row.timestamp
      ].join(',') + '\n';
    }
    
    return csv;
  } catch (error) {
    console.error('Error exporting audit logs to CSV:', error);
    return 'Error,Failed to export audit logs';
  } finally {
    client.release();
  }
}