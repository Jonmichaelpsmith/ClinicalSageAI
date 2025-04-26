// server/middleware/validateTenantAccess.js
import * as ds from '../services/docushare.js'; // Docushare service

/**
 * Middleware to validate tenant access to documents
 * 
 * Ensures that users can only access documents that belong to their tenant,
 * which is critical for multi-tenant security in regulated environments.
 */
export function validateTenantAccess() {
  return async (req, res, next) => {
    try {
      const userTenantId = req.user?.tenantId;
      const documentId = req.params.id || req.query.objectId || req.body.documentId;

      if (!documentId) {
        return res.status(400).json({ message: 'Missing document ID' });
      }

      // Skip tenant validation for public documents if specified
      if (req.query.public === 'true') {
        return next();
      }

      // For users without a tenantId, restrict access to public documents only
      if (!userTenantId) {
        const document = await ds.getMetadata(documentId);
        
        if (!document) {
          return res.status(404).json({ message: 'Document not found' });
        }
        
        if (document.public !== true) {
          return res.status(403).json({ message: 'Access denied. Authentication required.' });
        }
        
        return next();
      }

      // Validate tenant ownership for authenticated users
      const document = await ds.getMetadata(documentId);

      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      if (document.tenantId !== userTenantId && !document.public) {
        // Log potential security issue
        console.warn(`Tenant mismatch: User ${req.user?.id} (${userTenantId}) attempted to access document ${documentId} belonging to tenant ${document.tenantId}`);
        
        return res.status(403).json({ message: 'Access denied. Tenant mismatch.' });
      }

      // Access granted
      next();
    } catch (err) {
      console.error('Tenant validation error:', err);
      return res.status(500).json({ message: 'Server error validating tenant access' });
    }
  };
}