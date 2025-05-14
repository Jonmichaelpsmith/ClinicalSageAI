/**
 * Auth Middleware Adapter
 * 
 * This module provides ES module compatible authentication middleware
 * that wraps the existing CommonJS auth middleware
 */

import { Request, Response, NextFunction } from 'express';

// Import the CommonJS auth middleware
const { authenticateJWT } = require('./auth');

/**
 * Authenticate middleware for Express routes
 * This is a wrapper around authenticateJWT for TypeScript compatibility
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  return authenticateJWT(req, res, next);
};

/**
 * Require role middleware for Express routes
 * This is a wrapper around requireRole for TypeScript compatibility
 */
export const requireRole = (role: string) => {
  const { requireRole: requireRoleJs } = require('./auth');
  return requireRoleJs(role);
};

/**
 * Require permission middleware for Express routes
 * This is a wrapper around requirePermission for TypeScript compatibility
 */
export const requirePermission = (resource: string, action: string) => {
  const { requirePermission: requirePermissionJs } = require('./auth');
  return requirePermissionJs(resource, action);
};

/**
 * Require same organization middleware for Express routes
 * This is a wrapper around requireSameOrganization for TypeScript compatibility
 */
export const requireSameOrganization = (req: Request, res: Response, next: NextFunction) => {
  const { requireSameOrganization: requireSameOrganizationJs } = require('./auth');
  return requireSameOrganizationJs(req, res, next);
};