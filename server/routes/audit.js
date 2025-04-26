// server/routes/audit.js
import express from 'express';
import { listAuditLogs, exportAuditLogsToCSV } from '../services/auditService.js';

const router = express.Router();

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
      endDate: req.query.endDate ? new Date(req.query.endDate) : undefined
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
      endDate: req.query.endDate ? new Date(req.query.endDate) : undefined
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

export default router;