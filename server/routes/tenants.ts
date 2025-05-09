/**
 * Tenant Management API Routes
 * 
 * Handles tenant provisioning, configuration, and management.
 */
import { Router } from 'express';
import { z } from 'zod';
import { TenantDb } from '../db/tenantDb';
import { requireTenantMiddleware } from '../middleware/tenantContext';
import { authMiddleware, requireAdminRole } from '../auth';
import { organizations, insertOrganizationSchema } from '../../shared/schema';
import { createScopedLogger } from '../utils/logger';
import crypto from 'crypto';

const logger = createScopedLogger('tenant-api');
const router = Router();

// Schema for tenant creation
const createTenantSchema = z.object({
  name: z.string().min(3).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, {
    message: 'Slug can only contain lowercase letters, numbers, and hyphens',
  }),
  domain: z.string().optional(),
  tier: z.enum(['standard', 'professional', 'enterprise']).optional(),
  maxUsers: z.number().int().positive().optional(),
  maxProjects: z.number().int().positive().optional(),
  maxStorage: z.number().int().positive().optional(),
});

// Schema for tenant update
const updateTenantSchema = createTenantSchema.partial();

/**
 * Get all tenants the user has access to
 * Only organization admins and super admins can see multiple tenants
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Check if user is super admin, return all tenants
    if (req.userRole === 'super_admin') {
      const result = await req.db.select().from(organizations);
      return res.json(result);
    }
    
    // Otherwise, get organizations the user belongs to
    const result = await req.db.execute(`
      SELECT o.* 
      FROM organizations o
      JOIN organization_users ou ON o.id = ou.organization_id
      WHERE ou.user_id = $1
    `, [req.userId]);
    
    return res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching tenants', error);
    return res.status(500).json({ error: 'Failed to fetch tenants' });
  }
});

/**
 * Get a specific tenant by ID
 * User must belong to the tenant or be a super admin
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const tenantId = parseInt(req.params.id);
    if (isNaN(tenantId)) {
      return res.status(400).json({ error: 'Invalid tenant ID' });
    }
    
    // Check if user is super admin or belongs to the organization
    if (req.userRole !== 'super_admin') {
      const userTenantCheck = await req.db.execute(`
        SELECT 1 FROM organization_users
        WHERE organization_id = $1 AND user_id = $2
      `, [tenantId, req.userId]);
      
      if (userTenantCheck.rowCount === 0) {
        return res.status(403).json({ error: 'You do not have access to this organization' });
      }
    }
    
    // Get the tenant
    const tenant = await req.db.select().from(organizations).where(eq(organizations.id, tenantId)).limit(1);
    
    if (tenant.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    return res.json(tenant[0]);
  } catch (error) {
    logger.error(`Error fetching tenant ${req.params.id}`, error);
    return res.status(500).json({ error: 'Failed to fetch tenant' });
  }
});

/**
 * Create a new tenant
 * Only super admins can create tenants
 */
router.post('/', authMiddleware, requireAdminRole, async (req, res) => {
  try {
    // Validate request body
    const validationResult = createTenantSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid tenant data', 
        details: validationResult.error.format() 
      });
    }
    
    const tenantData = validationResult.data;
    
    // Check if slug is already taken
    const slugCheck = await req.db.select().from(organizations).where(eq(organizations.slug, tenantData.slug)).limit(1);
    
    if (slugCheck.length > 0) {
      return res.status(400).json({ error: 'Slug is already taken' });
    }
    
    // Generate API key
    const apiKey = crypto.randomBytes(32).toString('hex');
    
    // Create the tenant
    const newTenant = await req.db.insert(organizations).values({
      name: tenantData.name,
      slug: tenantData.slug,
      domain: tenantData.domain,
      tier: tenantData.tier || 'standard',
      apiKey: apiKey,
      maxUsers: tenantData.maxUsers || 5,
      maxProjects: tenantData.maxProjects || 10,
      maxStorage: tenantData.maxStorage || 5,
    }).returning();
    
    // Add the creating user to the organization as an admin
    if (req.userId) {
      await req.db.execute(`
        INSERT INTO organization_users (organization_id, user_id, role)
        VALUES ($1, $2, 'admin')
      `, [newTenant[0].id, req.userId]);
    }
    
    // Return the created tenant
    return res.status(201).json(newTenant[0]);
  } catch (error) {
    logger.error('Error creating tenant', error);
    return res.status(500).json({ error: 'Failed to create tenant' });
  }
});

/**
 * Update a tenant
 * Organization admins can update their own tenant, super admins can update any tenant
 */
router.patch('/:id', authMiddleware, requireTenantMiddleware, async (req, res) => {
  try {
    const tenantId = parseInt(req.params.id);
    if (isNaN(tenantId)) {
      return res.status(400).json({ error: 'Invalid tenant ID' });
    }
    
    // Check permissions
    if (req.userRole !== 'super_admin' && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only organization admins can update tenant settings' });
    }
    
    // For regular admins, ensure they're updating their own organization
    if (req.userRole === 'admin' && tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'You can only update your own organization' });
    }
    
    // Validate request body
    const validationResult = updateTenantSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid tenant data', 
        details: validationResult.error.format() 
      });
    }
    
    const updateData = validationResult.data;
    
    // If slug is being updated, check if it's already taken
    if (updateData.slug) {
      const slugCheck = await req.db.select().from(organizations)
        .where(and(
          eq(organizations.slug, updateData.slug),
          ne(organizations.id, tenantId)
        ))
        .limit(1);
      
      if (slugCheck.length > 0) {
        return res.status(400).json({ error: 'Slug is already taken' });
      }
    }
    
    // Update the tenant
    const updatedTenant = await req.db.update(organizations)
      .set(updateData)
      .where(eq(organizations.id, tenantId))
      .returning();
    
    if (updatedTenant.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    // Return the updated tenant
    return res.json(updatedTenant[0]);
  } catch (error) {
    logger.error(`Error updating tenant ${req.params.id}`, error);
    return res.status(500).json({ error: 'Failed to update tenant' });
  }
});

/**
 * Regenerate API key for a tenant
 * Only organization admins and super admins can regenerate API keys
 */
router.post('/:id/regenerate-api-key', authMiddleware, requireTenantMiddleware, async (req, res) => {
  try {
    const tenantId = parseInt(req.params.id);
    if (isNaN(tenantId)) {
      return res.status(400).json({ error: 'Invalid tenant ID' });
    }
    
    // Check permissions
    if (req.userRole !== 'super_admin' && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only organization admins can regenerate API keys' });
    }
    
    // For regular admins, ensure they're updating their own organization
    if (req.userRole === 'admin' && tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'You can only manage your own organization' });
    }
    
    // Generate new API key
    const apiKey = crypto.randomBytes(32).toString('hex');
    
    // Update the tenant
    const updatedTenant = await req.db.update(organizations)
      .set({ apiKey })
      .where(eq(organizations.id, tenantId))
      .returning();
    
    if (updatedTenant.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    // Return the new API key
    return res.json({ apiKey: updatedTenant[0].apiKey });
  } catch (error) {
    logger.error(`Error regenerating API key for tenant ${req.params.id}`, error);
    return res.status(500).json({ error: 'Failed to regenerate API key' });
  }
});

/**
 * Get usage statistics for a tenant
 * Organization admins can view their own stats, super admins can view any tenant's stats
 */
router.get('/:id/usage', authMiddleware, requireTenantMiddleware, async (req, res) => {
  try {
    const tenantId = parseInt(req.params.id);
    if (isNaN(tenantId)) {
      return res.status(400).json({ error: 'Invalid tenant ID' });
    }
    
    // Check permissions
    if (req.userRole !== 'super_admin' && tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'You can only view usage for your own organization' });
    }
    
    // Create tenant DB utility
    const tenantDb = new TenantDb(tenantId);
    
    // Get usage statistics
    const [
      userCount,
      projectCount,
      documentCount,
      storageUsed
    ] = await Promise.all([
      // Count users in the organization
      tenantDb.count('organization_users'),
      
      // Count projects
      tenantDb.count('cer_projects'),
      
      // Count documents
      tenantDb.count('project_documents'),
      
      // Sum storage used (placeholder query - actual implementation depends on how storage is tracked)
      req.db.execute(`
        SELECT COALESCE(SUM(file_size), 0) as total_storage
        FROM project_documents
        WHERE organization_id = $1
      `, [tenantId]).then(result => parseInt(result.rows[0].total_storage || '0', 10) / (1024 * 1024 * 1024)) // Convert to GB
    ]);
    
    // Get tenant limits
    const tenant = await req.db.select()
      .from(organizations)
      .where(eq(organizations.id, tenantId))
      .limit(1);
    
    if (tenant.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    // Return usage statistics
    return res.json({
      users: {
        current: userCount,
        limit: tenant[0].maxUsers,
        percentage: (userCount / tenant[0].maxUsers) * 100
      },
      projects: {
        current: projectCount,
        limit: tenant[0].maxProjects,
        percentage: (projectCount / tenant[0].maxProjects) * 100
      },
      storage: {
        current: storageUsed, // in GB
        limit: tenant[0].maxStorage, // in GB
        percentage: (storageUsed / tenant[0].maxStorage) * 100
      },
      documents: {
        count: documentCount
      }
    });
  } catch (error) {
    logger.error(`Error fetching usage for tenant ${req.params.id}`, error);
    return res.status(500).json({ error: 'Failed to fetch tenant usage statistics' });
  }
});

export default router;