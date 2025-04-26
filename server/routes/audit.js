// server/routes/audit.js
import express from 'express';
import { listAuditLogs, exportAuditLogsToCSV, bulkDeleteAuditLogs, ensureAuditLogTable } from '../services/auditService.js';
import { auditAction } from '../middleware/auditLogger.js';

const router = express.Router();

// Ensure the audit log table exists
ensureAuditLogTable().catch(err => {
  console.error('Failed to create audit log table:', err);
});

/**
 * List audit logs with optional filtering and pagination
 * 
 * This endpoint is tenant-scoped for security, ensuring each
 * tenant can only access their own audit data.
 */
router.get('/', async (req, res) => {
  try {
    // Get tenant ID from authenticated user (multi-tenant security)
    const tenantId = req.user?.tenantId;
    
    // For admin-only routes, require authentication and tenant ID
    if (!tenantId) {
      return res.status(401).json({ 
        message: 'Unauthorized. Authentication required.'
      });
    }
    
    // Parse query parameters for filtering and pagination
    const filters = {
      userId: req.query.userId || undefined,
      actionType: req.query.actionType || undefined,
      resourceType: req.query.resourceType || undefined,
      resourceId: req.query.resourceId || undefined,
      startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
      // Special filter for anomalies
      anomaliesOnly: req.query.anomaliesOnly === 'true'
    };
    
    // Parse pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    
    // Fetch logs with tenant-scoped security
    const result = await listAuditLogs(tenantId, filters, page, limit);
    
    res.json(result);
  } catch (error) {
    console.error('Audit log fetch error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch audit logs',
      error: error.message
    });
  }
});

/**
 * Export audit logs to CSV with optional filtering
 * 
 * This endpoint is tenant-scoped for security, ensuring each
 * tenant can only export their own audit data.
 */
router.get('/export', async (req, res) => {
  try {
    // Get tenant ID from authenticated user (multi-tenant security)
    const tenantId = req.user?.tenantId;
    
    // For admin-only routes, require authentication and tenant ID
    if (!tenantId) {
      return res.status(401).json({ 
        message: 'Unauthorized. Authentication required.'
      });
    }
    
    // Parse query parameters for filtering
    const filters = {
      userId: req.query.userId || undefined,
      actionType: req.query.actionType || undefined,
      resourceType: req.query.resourceType || undefined,
      resourceId: req.query.resourceId || undefined,
      startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
      anomaliesOnly: req.query.anomaliesOnly === 'true'
    };
    
    // Generate CSV content with tenant-scoped security
    const csvContent = await exportAuditLogsToCSV(tenantId, filters);
    
    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit_logs.csv');
    
    // Send the CSV content
    res.send(csvContent);
  } catch (error) {
    console.error('Audit log export error:', error);
    res.status(500).json({ 
      message: 'Failed to export audit logs',
      error: error.message
    });
  }
});

/**
 * Bulk delete audit logs based on filters
 * 
 * This endpoint is tenant-scoped for security and requires admin privileges.
 */
router.post('/bulk-delete',
  auditAction('BulkDeleteLogs', 'Admin bulk deleted audit logs'),
  async (req, res) => {
    try {
      // Get tenant ID from authenticated user (multi-tenant security)
      const tenantId = req.user?.tenantId;
      
      // For admin-only routes, require authentication, tenant ID, and admin role
      if (!tenantId) {
        return res.status(401).json({ 
          message: 'Unauthorized. Authentication required.'
        });
      }
      
      // Check for admin role (optional - depends on your user schema)
      if (req.user?.role !== 'admin' && !req.user?.isAdmin) {
        return res.status(403).json({
          message: 'Forbidden. Admin privileges required for bulk delete operations.'
        });
      }
      
      // Parse filters from request body
      const { 
        userId, 
        actionType, 
        startDate, 
        endDate, 
        reason
      } = req.body;
      
      // Require a reason for the bulk delete (for audit trail)
      if (!reason) {
        return res.status(400).json({
          message: 'Reason for bulk delete is required for audit purposes.'
        });
      }
      
      // Perform bulk delete with tenant-scoped security
      const result = await bulkDeleteAuditLogs(tenantId, {
        userId,
        actionType,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      });
      
      // Add the bulk delete operation to the audit log metadata
      if (req.auditEntry) {
        req.auditEntry.metadata = {
          ...req.auditEntry.metadata,
          reason,
          deletedCount: result.deletedCount,
          filters: { userId, actionType, startDate, endDate }
        };
      }
      
      // Return success response
      res.json({
        message: 'Audit logs deleted successfully',
        deletedCount: result.deletedCount
      });
    } catch (error) {
      console.error('Bulk delete error:', error);
      res.status(500).json({ 
        message: 'Failed to delete audit logs',
        error: error.message
      });
    }
  }
);

export default router;