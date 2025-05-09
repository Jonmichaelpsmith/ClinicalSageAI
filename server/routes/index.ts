/**
 * API Routes Index
 * 
 * This file centralizes all API route registrations.
 */
import { Router } from 'express';
import tenantsRoutes from './tenants';
import tenantConfigRoutes from './tenant-config';
import tenantUsersRoutes from './tenant-users';
import documentRoutes from './document-routes';
import { authMiddleware } from '../auth';

const router = Router();

// Health check route - no auth required
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes - no auth required
router.use('/public', (req, res, next) => {
  // Public endpoints would go here
  next();
});

// Routes that require authentication
router.use('/tenants', tenantsRoutes);
router.use('/tenant-config', tenantConfigRoutes);
router.use('/tenant-users', tenantUsersRoutes);
router.use('/documents', documentRoutes);

// Mount API routes
export function mountApiRoutes(app: any) {
  app.use('/api', router);
  console.log('API routes mounted');
}

export default router;