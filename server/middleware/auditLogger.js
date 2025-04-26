// server/middleware/auditLogger.js
import { saveAuditLog } from '../services/auditService.js';

/**
 * Audit action middleware for TrialSage
 * 
 * Logs user actions throughout the application for security,
 * compliance, and traceability, recording IP, user, and tenant information.
 * 
 * @param {string} actionType - Type of action being audited (Upload, Download, etc)
 * @param {string} description - Description of the action
 * @returns {Function} Express middleware function
 */
export function auditAction(actionType, description) {
  return async (req, res, next) => {
    try {
      // Create audit log entry with all relevant information
      const entry = {
        user: req.user?.id || 'anonymous',
        username: req.user?.username || 'Anonymous User',
        email: req.user?.email || '',
        tenantId: req.user?.tenantId || 'public',
        actionType: actionType,
        description: description,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        timestamp: new Date(),
        resourceId: req.params.id || req.query.objectId || req.body.documentId || null,
        resourceType: actionType.includes('Document') ? 'document' : 
                      actionType.includes('AI') ? 'ai' : 
                      actionType.includes('Template') ? 'template' : 'system',
        success: true,  // Default to true, can be updated later in the response
        metadata: {}    // Can be populated with additional details
      };

      // Save audit log to database
      await saveAuditLog(entry);
      
      // Attach audit entry to the request so it can be updated in route handlers
      req.auditEntry = entry;
    } catch (err) {
      // Log error but don't block request processing
      console.error('Audit logging failed:', err);
    }
    
    next();
  };
}