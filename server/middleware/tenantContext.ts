import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { organizations } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '../auth';

// Interface for tenant context that will be added to request
declare global {
  namespace Express {
    interface Request {
      tenantContext?: {
        organizationId: number;
        organizationSlug: string;
        tier: string;
        settings?: any;
      };
    }
  }
}

/**
 * Middleware that extracts tenant context from the request
 * and adds it to the request object for use in downstream handlers
 */
export const tenantContextMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Skip tenant context for public routes
    if (isPublicRoute(req.path)) {
      return next();
    }

    // Option 1: Extract tenant from subdomain (e.g., client1.domain.com)
    const subdomain = extractSubdomain(req);
    
    // Option 2: Extract tenant from custom header
    const tenantHeader = req.headers['x-tenant-id'] as string;
    
    // Option 3: Extract tenant from auth token
    let userOrganizationId: number | undefined;
    const authHeader = req.headers.authorization;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = verifyToken(token);
        userOrganizationId = decoded.organizationId;
      } catch (error) {
        // Token verification failed, continue with other methods
      }
    }
    
    // Option 4: Extract from URL path parameter
    const urlOrgSlug = extractOrgSlugFromUrl(req.path);
    
    // Try to find the organization using the available identifiers
    let organization;
    
    if (subdomain) {
      organization = await db.query.organizations.findFirst({
        where: eq(organizations.slug, subdomain)
      });
    }
    
    if (!organization && tenantHeader) {
      const tenantId = parseInt(tenantHeader, 10);
      if (!isNaN(tenantId)) {
        organization = await db.query.organizations.findFirst({
          where: eq(organizations.id, tenantId)
        });
      } else {
        organization = await db.query.organizations.findFirst({
          where: eq(organizations.slug, tenantHeader)
        });
      }
    }
    
    if (!organization && userOrganizationId) {
      organization = await db.query.organizations.findFirst({
        where: eq(organizations.id, userOrganizationId)
      });
    }
    
    if (!organization && urlOrgSlug) {
      organization = await db.query.organizations.findFirst({
        where: eq(organizations.slug, urlOrgSlug)
      });
    }
    
    if (!organization) {
      return res.status(401).json({
        error: 'Tenant context could not be established',
        message: 'Unable to determine organization for this request'
      });
    }
    
    // Add tenant context to request object
    req.tenantContext = {
      organizationId: organization.id,
      organizationSlug: organization.slug || '',
      tier: organization.tier || 'standard',
      settings: organization.settings
    };
    
    next();
  } catch (error) {
    console.error('Error in tenant context middleware:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to establish tenant context'
    });
  }
};

/**
 * Helper functions
 */

function isPublicRoute(path: string): boolean {
  const publicRoutes = [
    '/api/health',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/public'
  ];
  
  return publicRoutes.some(route => path.startsWith(route));
}

function extractSubdomain(req: Request): string | null {
  // Get host from request (e.g., client1.domain.com)
  const host = req.headers.host;
  if (!host) return null;

  // Split by dots and check if we have a subdomain
  const parts = host.split('.');
  if (parts.length < 3) return null;

  // Return the subdomain
  return parts[0];
}

function extractOrgSlugFromUrl(path: string): string | null {
  // Look for organization slug in URLs like /api/orgs/:slug/...
  const match = path.match(/\/api\/orgs\/([^\/]+)/);
  return match ? match[1] : null;
}