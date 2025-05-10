/**
 * Tenant User Management API Routes
 * 
 * Handles user management within a tenant, including
 * invitations, role management, and permissions.
 */
import { Router } from 'express';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { users, organizationUsers } from '../../shared/schema';
import { authMiddleware, requireAdminRole } from '../auth';
import { requireOrganizationContext, validateTenantAccessMiddleware } from '../middleware/tenantContext';
import { createScopedLogger } from '../utils/logger';
import { db } from '../db';
import crypto from 'crypto';

const logger = createScopedLogger('tenant-users-api');
const router = Router();

// Schema for adding a user to a tenant
const addUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(['admin', 'manager', 'member', 'viewer']).default('member'),
  title: z.string().optional(),
  department: z.string().optional(),
  sendInvite: z.boolean().default(true),
  permissions: z.record(z.any()).optional(),
});

// Schema for updating a user's role in a tenant
const updateUserRoleSchema = z.object({
  role: z.enum(['admin', 'manager', 'member', 'viewer']),
  permissions: z.record(z.any()).optional(),
});

// Apply auth middleware to all tenant user routes
router.use(authMiddleware);

/**
 * GET /api/tenant-users
 * Get all users for the current tenant
 * Requires tenant context
 */
router.get('/', requireOrganizationContext, async (req, res) => {
  try {
    // For development, return mock data
    if (process.env.NODE_ENV === 'development') {
      return res.json([
        {
          userId: 1,
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: 'admin',
          title: 'CTO',
          department: 'Engineering',
          status: 'active',
          lastLogin: '2025-05-07T10:32:15Z',
        },
        {
          userId: 2,
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          role: 'manager',
          title: 'Project Manager',
          department: 'Research',
          status: 'active',
          lastLogin: '2025-05-08T16:45:22Z',
        },
        {
          userId: 3,
          name: 'Robert Johnson',
          email: 'robert.johnson@example.com',
          role: 'member',
          title: 'Clinical Researcher',
          department: 'Research',
          status: 'active',
          lastLogin: '2025-05-09T09:12:08Z',
        },
        {
          userId: 4,
          name: 'Emily Davis',
          email: 'emily.davis@example.com',
          role: 'viewer',
          title: 'Regulatory Consultant',
          department: 'Compliance',
          status: 'pending',
          lastLogin: null,
        }
      ]);
    }

    if (!req.tenantId) {
      return res.status(400).json({ error: 'Tenant context required' });
    }

    // Get all users for the tenant
    const tenantUsers = await db
      .select({
        user: users,
        role: organizationUsers.role,
        permissions: organizationUsers.permissions,
      })
      .from(organizationUsers)
      .innerJoin(users, eq(users.id, organizationUsers.userId))
      .where(eq(organizationUsers.organizationId, req.tenantId));

    const formattedUsers = tenantUsers.map(row => ({
      userId: row.user.id,
      name: row.user.name,
      email: row.user.email,
      role: row.role,
      title: row.user.title,
      department: row.user.department,
      status: row.user.status,
      lastLogin: row.user.lastLogin,
      permissions: row.permissions,
    }));

    res.json(formattedUsers);
  } catch (error) {
    logger.error('Error retrieving tenant users', error);
    res.status(500).json({ error: 'Failed to retrieve tenant users' });
  }
});

/**
 * POST /api/tenant-users
 * Add a user to the tenant
 * Requires admin role
 */
router.post('/', requireOrganizationContext, requireAdminRole, async (req, res) => {
  try {
    // Validate request body
    const validatedData = addUserSchema.parse(req.body);

    // Mock response for development
    if (process.env.NODE_ENV === 'development') {
      return res.status(201).json({
        userId: 5,
        name: validatedData.name,
        email: validatedData.email,
        role: validatedData.role,
        title: validatedData.title || null,
        department: validatedData.department || null,
        status: 'pending',
        lastLogin: null,
        permissions: validatedData.permissions || {},
      });
    }

    if (!req.tenantId) {
      return res.status(400).json({ error: 'Tenant context required' });
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    let userId;

    // If user doesn't exist, create them
    if (!existingUser.length) {
      // Generate temporary password
      const tempPassword = `temp_${crypto.randomBytes(8).toString('hex')}`;

      // Create user
      const newUser = await db.insert(users).values({
        email: validatedData.email,
        name: validatedData.name,
        passwordHash: tempPassword, // In a real app, this would be hashed
        title: validatedData.title,
        department: validatedData.department,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      userId = newUser[0].id;
    } else {
      userId = existingUser[0].id;

      // Check if user is already a member of the tenant
      const existingMembership = await db
        .select()
        .from(organizationUsers)
        .where(
          and(
            eq(organizationUsers.organizationId, req.tenantId),
            eq(organizationUsers.userId, userId)
          )
        )
        .limit(1);

      if (existingMembership.length) {
        return res.status(409).json({ error: 'User is already a member of this organization' });
      }
    }

    // Add user to tenant
    await db.insert(organizationUsers).values({
      organizationId: req.tenantId,
      userId: userId,
      role: validatedData.role,
      permissions: validatedData.permissions || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // In a real app, you would send an invitation email here
    // if (validatedData.sendInvite) {
    //   sendInvitationEmail(validatedData.email, req.tenantId);
    // }

    // Get the complete user data to return
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    res.status(201).json({
      userId: user[0].id,
      name: user[0].name,
      email: user[0].email,
      role: validatedData.role,
      title: user[0].title,
      department: user[0].department,
      status: user[0].status,
      lastLogin: user[0].lastLogin,
      permissions: validatedData.permissions || {},
    });
  } catch (error) {
    logger.error('Error adding user to tenant', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid user data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to add user to tenant' });
  }
});

/**
 * PATCH /api/tenant-users/:organizationId/:userId
 * Update a user's role in the tenant
 * Requires admin role
 */
router.patch('/:organizationId/:userId', validateTenantAccessMiddleware, requireAdminRole, async (req, res) => {
  const organizationId = parseInt(req.params.organizationId);
  const userId = parseInt(req.params.userId);
  
  try {
    // Validate request body
    const validatedData = updateUserRoleSchema.parse(req.body);

    // Mock response for development
    if (process.env.NODE_ENV === 'development') {
      return res.json({
        userId: userId,
        role: validatedData.role,
        permissions: validatedData.permissions || {},
        organizationId: organizationId,
      });
    }

    // Check if user exists in the tenant
    const existingMembership = await db
      .select()
      .from(organizationUsers)
      .where(
        and(
          eq(organizationUsers.organizationId, organizationId),
          eq(organizationUsers.userId, userId)
        )
      )
      .limit(1);

    if (!existingMembership.length) {
      return res.status(404).json({ error: 'User is not a member of this organization' });
    }

    // Update user role
    const updatedMembership = await db.update(organizationUsers)
      .set({
        role: validatedData.role,
        permissions: validatedData.permissions || existingMembership[0].permissions,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(organizationUsers.organizationId, organizationId),
          eq(organizationUsers.userId, userId)
        )
      )
      .returning();

    res.json({
      userId: userId,
      role: updatedMembership[0].role,
      permissions: updatedMembership[0].permissions,
      organizationId: organizationId,
    });
  } catch (error) {
    logger.error('Error updating user role', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid role data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

/**
 * DELETE /api/tenant-users/:organizationId/:userId
 * Remove a user from the tenant
 * Requires admin role
 */
router.delete('/:organizationId/:userId', validateTenantAccessMiddleware, requireAdminRole, async (req, res) => {
  const organizationId = parseInt(req.params.organizationId);
  const userId = parseInt(req.params.userId);
  
  try {
    // Mock response for development
    if (process.env.NODE_ENV === 'development') {
      return res.status(204).end();
    }

    // Check if user exists in the tenant
    const existingMembership = await db
      .select()
      .from(organizationUsers)
      .where(
        and(
          eq(organizationUsers.organizationId, organizationId),
          eq(organizationUsers.userId, userId)
        )
      )
      .limit(1);

    if (!existingMembership.length) {
      return res.status(404).json({ error: 'User is not a member of this organization' });
    }

    // Remove user from tenant
    await db.delete(organizationUsers)
      .where(
        and(
          eq(organizationUsers.organizationId, organizationId),
          eq(organizationUsers.userId, userId)
        )
      );

    res.status(204).end();
  } catch (error) {
    logger.error('Error removing user from tenant', error);
    res.status(500).json({ error: 'Failed to remove user from tenant' });
  }
});

export default router;