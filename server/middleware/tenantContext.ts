/**
 * Tenant Context Middleware
 * 
 * This middleware extracts the tenant ID from the request
 * and sets it in the request context for downstream handlers.
 */
import { Request, Response, NextFunction } from 'express';
import { createScopedLogger } from '../utils/logger';

const logger = createScopedLogger('tenant-context');

// Augment Express Request type to include tenant information
declare global {
  namespace Express {
    interface Request {
      tenantId?: number;
      tenantSlug?: string;
      userRole?: string;
    }
  }
}

/**
 * Extract tenant ID from request headers, cookies, or JWT token
 * and add it to the request object
 */
export function tenantContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // First check for X-Tenant-ID header (most common in API requests)
    let tenantId = req.headers['x-tenant-id'] as string;
    
    // Then check for tenant in JWT token if not in headers
    // (assuming auth middleware sets user object with tenant info)
    if (!tenantId && (req as any).user?.tenantId) {
      tenantId = (req as any).user.tenantId.toString();
    }
    
    // Then check for tenant in URL parameters
    if (!tenantId && req.params.tenantId) {
      tenantId = req.params.tenantId;
    }
    
    // Finally check for tenant in query parameters
    if (!tenantId && req.query.tenantId) {
      tenantId = req.query.tenantId as string;
    }
    
    // Validate and set tenant ID if found
    if (tenantId) {
      const parsedTenantId = parseInt(tenantId, 10);
      
      if (!isNaN(parsedTenantId)) {
        req.tenantId = parsedTenantId;
        logger.debug(`Tenant ID set to ${parsedTenantId}`);
        
        // Get tenant slug and user role from user object if available
        if ((req as any).user) {
          req.tenantSlug = (req as any).user.tenantSlug;
          req.userRole = (req as any).user.role;
        }
      } else {
        logger.warn(`Invalid tenant ID: ${tenantId}`);
      }
    } else {
      logger.warn('No tenant ID found in request');
    }
    
    next();
  } catch (error) {
    logger.error('Error in tenant context middleware', error);
    next(error);
  }
}

/**
 * Middleware to require a valid tenant ID
 * Will return 400 if no tenant ID is found
 */
export function requireTenantMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.tenantId) {
    logger.warn('Tenant ID required but not found in request');
    return res.status(400).json({
      error: 'Tenant ID is required',
      message: 'Please provide a valid organization ID'
    });
  }
  
  next();
}