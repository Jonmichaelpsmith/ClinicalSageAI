/**
 * Organizations API Routes
 * 
 * Handles fetching, creating, and updating organization data
 * for the multi-tenant system.
 */
import { Router } from 'express';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { organizations, organizationUsers, users, insertOrganizationSchema } from '../../shared/schema';
import { authMiddleware, requireAdminRole } from '../auth';
import { requireTenantMiddleware } from '../middleware/tenantContext';
import { createScopedLogger } from '../utils/logger';
import { getDirectDb } from '../db/directDb';

const logger = createScopedLogger('organizations-api');
const router = Router();

/**
 * Get all organizations a user has access to
 */
router.get('/user-organizations', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get direct connection without tenant context to fetch all organizations for a user
    const { db, execute, close } = await getDirectDb();
    
    try {
      // Query to get organizations the user belongs to
      const result = await execute({
        text: `
          SELECT o.id, o.name, o.slug, o.logo, o.tier, o.status, ou.role
          FROM organizations o
          JOIN organization_users ou ON o.id = ou.organization_id
          WHERE ou.user_id = $1 AND o.status = 'active'
          ORDER BY o.name
        `,
        params: [userId]
      });
      
      return res.json(result.rows);
    } finally {
      await close();
    }
  } catch (error) {
    logger.error('Error fetching user organizations', { error });
    return res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

/**
 * Get details of a specific organization
 */
router.get('/:organizationId', authMiddleware, async (req, res) => {
  try {
    const organizationId = parseInt(req.params.organizationId);
    if (isNaN(organizationId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    // Get direct connection without tenant context
    const { db, execute, close } = await getDirectDb();
    
    try {
      // Check if user belongs to the organization
      const membershipResult = await execute({
        text: `
          SELECT COUNT(*) as count
          FROM organization_users
          WHERE user_id = $1 AND organization_id = $2
        `,
        params: [req.userId, organizationId]
      });

      if (membershipResult.rows[0].count === '0') {
        return res.status(403).json({ error: 'You do not have access to this organization' });
      }

      // Get organization details
      const orgResult = await execute({
        text: `
          SELECT id, name, slug, domain, logo, tier, status, max_users, max_projects, max_storage,
                 created_at, updated_at, settings
          FROM organizations
          WHERE id = $1
        `,
        params: [organizationId]
      });

      if (!orgResult.rows.length) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      // Get user count for this organization
      const userCountResult = await execute({
        text: `
          SELECT COUNT(*) as count
          FROM organization_users
          WHERE organization_id = $1
        `,
        params: [organizationId]
      });

      // Get project count for this organization
      const projectCountResult = await execute({
        text: `
          SELECT COUNT(*) as count
          FROM cer_projects
          WHERE organization_id = $1
        `,
        params: [organizationId]
      });

      // Enhance the organization object with counts
      const organization = {
        ...orgResult.rows[0],
        userCount: parseInt(userCountResult.rows[0].count),
        projectCount: parseInt(projectCountResult.rows[0].count)
      };

      return res.json(organization);
    } finally {
      await close();
    }
  } catch (error) {
    logger.error(`Error fetching organization ${req.params.organizationId}`, { error });
    return res.status(500).json({ error: 'Failed to fetch organization details' });
  }
});

/**
 * Create a new organization (super admin only)
 */
router.post('/', authMiddleware, requireAdminRole('super_admin'), async (req, res) => {
  try {
    // Validate input
    const validatedData = insertOrganizationSchema.parse(req.body);
    
    // Get direct connection without tenant context
    const { db, execute, close } = await getDirectDb();
    
    try {
      // Check if slug is unique
      const slugCheckResult = await execute({
        text: `
          SELECT COUNT(*) as count
          FROM organizations
          WHERE slug = $1
        `,
        params: [validatedData.slug]
      });

      if (slugCheckResult.rows[0].count !== '0') {
        return res.status(400).json({ error: 'Organization slug already exists' });
      }

      // Insert new organization
      const result = await execute({
        text: `
          INSERT INTO organizations (
            name, slug, domain, logo, settings, tier, status, max_users, max_projects, max_storage
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
          ) RETURNING id, name, slug, domain, logo, tier, status, created_at
        `,
        params: [
          validatedData.name,
          validatedData.slug,
          validatedData.domain || null,
          validatedData.logo || null,
          validatedData.settings || {},
          validatedData.tier || 'standard',
          validatedData.status || 'active',
          validatedData.maxUsers || 5,
          validatedData.maxProjects || 10,
          validatedData.maxStorage || 5
        ]
      });

      const newOrganization = result.rows[0];

      // Add the creating user as an admin of the new organization
      await execute({
        text: `
          INSERT INTO organization_users (organization_id, user_id, role)
          VALUES ($1, $2, 'admin')
        `,
        params: [newOrganization.id, req.userId]
      });

      return res.status(201).json(newOrganization);
    } finally {
      await close();
    }
  } catch (error) {
    logger.error('Error creating organization', { error });
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Invalid organization data',
        details: error.errors
      });
    }
    
    return res.status(500).json({ error: 'Failed to create organization' });
  }
});

/**
 * Update an organization (organization admin or super admin only)
 */
router.put('/:organizationId', authMiddleware, requireTenantMiddleware, async (req, res) => {
  try {
    const organizationId = parseInt(req.params.organizationId);
    if (isNaN(organizationId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    // Check permissions - must be org admin or super admin
    if (req.userRole !== 'super_admin' && 
        (req.userRole !== 'admin' || req.tenantId !== organizationId)) {
      return res.status(403).json({ error: 'Insufficient permissions to update organization' });
    }

    // Get direct connection without tenant context
    const { db, execute, close } = await getDirectDb();

    // Validate update data (partial schema)
    const updateSchema = insertOrganizationSchema.partial();
    const validatedData = updateSchema.parse(req.body);
    
    try {
      // Check if slug is unique if it's being updated
      if (validatedData.slug) {
        const slugCheckResult = await execute({
          text: `
            SELECT COUNT(*) as count
            FROM organizations
            WHERE slug = $1 AND id != $2
          `,
          params: [validatedData.slug, organizationId]
        });

        if (slugCheckResult.rows[0].count !== '0') {
          return res.status(400).json({ error: 'Organization slug already exists' });
        }
      }

      // Build dynamic update query based on provided fields
      const updateFields = [];
      const updateParams = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(validatedData)) {
        // Convert camelCase to snake_case for database columns
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        updateFields.push(`${dbField} = $${paramIndex}`);
        updateParams.push(value);
        paramIndex++;
      }

      // Add updated_at
      updateFields.push(`updated_at = NOW()`);

      if (updateFields.length === 1) {
        // Only updated_at was added, no real updates
        return res.status(400).json({ error: 'No fields to update were provided' });
      }

      // Add organization ID as the last parameter
      updateParams.push(organizationId);

      // Execute update query
      const result = await execute({
        text: `
          UPDATE organizations
          SET ${updateFields.join(', ')}
          WHERE id = $${paramIndex}
          RETURNING id, name, slug, domain, logo, tier, status, max_users, max_projects, max_storage, created_at, updated_at
        `,
        params: updateParams
      });

      if (!result.rows.length) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      return res.json(result.rows[0]);
    } finally {
      await close();
    }
  } catch (error) {
    logger.error(`Error updating organization ${req.params.organizationId}`, { error });
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Invalid organization data',
        details: error.errors
      });
    }
    
    return res.status(500).json({ error: 'Failed to update organization' });
  }
});

/**
 * Set default organization for a user
 */
router.post('/set-default', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    
    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const parsedOrgId = parseInt(organizationId);
    if (isNaN(parsedOrgId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    // Get direct connection without tenant context
    const { db, execute, close } = await getDirectDb();
    
    try {
      // Check if user belongs to the organization
      const membershipResult = await execute({
        text: `
          SELECT COUNT(*) as count
          FROM organization_users
          WHERE user_id = $1 AND organization_id = $2
        `,
        params: [req.userId, parsedOrgId]
      });

      if (membershipResult.rows[0].count === '0') {
        return res.status(403).json({ error: 'You do not have access to this organization' });
      }

      // Update user's default organization
      await execute({
        text: `
          UPDATE users
          SET default_organization_id = $1, updated_at = NOW()
          WHERE id = $2
        `,
        params: [parsedOrgId, req.userId]
      });

      return res.json({ success: true, message: 'Default organization updated' });
    } finally {
      await close();
    }
  } catch (error) {
    logger.error('Error setting default organization', { error });
    return res.status(500).json({ error: 'Failed to set default organization' });
  }
});

export default router;