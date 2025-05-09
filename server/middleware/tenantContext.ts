/**
 * Tenant Context Middleware
 * 
 * This middleware establishes the tenant context for the current request.
 * It supports:
 * 1. Tenant context from the authenticated user's token
 * 2. Tenant context from the request path parameter
 * 3. Tenant context from a request header (API key usage)
 */
import { Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import { organizations } from '../../shared/schema';
import { createScopedLogger } from '../utils/logger';

const logger = createScopedLogger('tenant-context');

/**
 * Middleware to establish the tenant context
 * 
 * This applies the tenant context to the request and sets up the tenant database.
 */
export function tenantContextMiddleware(req: Request, res: Response, next: NextFunction) {
  // If the tenant context is already established, continue to the next middleware
  if (req.tenantId) {
    return next();
  }
  
  // Try to establish tenant context from the request path parameter
  if (req.params.tenantId) {
    const tenantId = parseInt(req.params.tenantId);
    
    if (!isNaN(tenantId)) {
      req.tenantId = tenantId;
      return next();
    }
  }
  
  // Try to establish tenant context from the authenticated user's token
  if (req.userRole && req.userId) {
    // If the user is a super_admin, they may not have a default tenant
    if (req.userRole === 'super_admin') {
      // Super admins can access anything, but we don't set a default tenant
      return next();
    }
    
    // For other roles, try to get their default tenant
    db.execute(`
      SELECT default_organization_id FROM users WHERE id = $1
    `, [req.userId])
      .then(result => {
        if (result.rowCount > 0 && result.rows[0].default_organization_id) {
          req.tenantId = result.rows[0].default_organization_id;
        }
        next();
      })
      .catch(error => {
        logger.error('Error establishing tenant context from user', error);
        next();
      });
    
    return;
  }
  
  // Try to establish tenant context from API key in header
  const apiKey = req.headers['x-api-key'] as string;
  
  if (apiKey) {
    // Look up the tenant by API key
    db.select()
      .from(organizations)
      .where(eq(organizations.apiKey, apiKey))
      .limit(1)
      .then(tenants => {
        if (tenants.length > 0) {
          req.tenantId = tenants[0].id;
          // For API key access, set a service account role
          req.userRole = 'service';
        }
        next();
      })
      .catch(error => {
        logger.error('Error establishing tenant context from API key', error);
        next();
      });
    
    return;
  }
  
  // Continue without tenant context
  // This will be caught by endpoints that require tenant context
  next();
}

/**
 * Middleware to require tenant context
 * 
 * This is used to ensure that endpoints that require tenant context
 * have it established before proceeding.
 */
export function requireTenantMiddleware(req: Request, res: Response, next: NextFunction) {
  // For super_admin users, we don't require tenant context
  if (req.userRole === 'super_admin') {
    return next();
  }
  
  // For other roles, ensure tenant context is established
  if (!req.tenantId) {
    return res.status(400).json({ error: 'Tenant context required' });
  }
  
  next();
}

/**
 * Middleware to validate tenant access
 * 
 * This ensures that the user has access to the specified tenant.
 */
export function validateTenantAccessMiddleware(req: Request, res: Response, next: NextFunction) {
  // If user is a super_admin, they have access to all tenants
  if (req.userRole === 'super_admin') {
    return next();
  }
  
  // If tenant context is not established, continue to the next middleware
  // This may be caught by the requireTenantMiddleware later
  if (!req.tenantId) {
    return next();
  }
  
  // Ensure the user has access to the tenant
  if (!req.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Validate that the user has access to the tenant
  db.execute(`
    SELECT 1 FROM organization_users
    WHERE user_id = $1 AND organization_id = $2
  `, [req.userId, req.tenantId])
    .then(result => {
      if (result.rowCount === 0) {
        return res.status(403).json({ error: 'Access to this tenant is not authorized' });
      }
      
      next();
    })
    .catch(error => {
      logger.error('Error validating tenant access', error);
      res.status(500).json({ error: 'Failed to validate tenant access' });
    });
}