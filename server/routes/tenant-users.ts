/**
 * Tenant User Management API Routes
 * 
 * Handles user management within a tenant, including
 * invitations, role management, and permissions.
 */
import { Router } from 'express';
import { z } from 'zod';
import { eq, and, sql } from 'drizzle-orm';
import { users, organizationUsers, clientUserPermissions } from '../../shared/schema';
import { authMiddleware, requireAdminRole } from '../auth';
import { requireTenantMiddleware } from '../middleware/tenantContext';
import { TenantDb } from '../db/tenantDb';
import { createScopedLogger } from '../utils/logger';
import { randomBytes } from 'crypto';

const logger = createScopedLogger('tenant-users-api');
const router = Router();

// Schema for adding a user to a tenant
const addUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'manager', 'member', 'viewer']).default('member'),
  permissions: z.record(z.any()).optional(),
  sendInvite: z.boolean().default(true)
});

// Schema for updating a user's role in a tenant
const updateUserRoleSchema = z.object({
  role: z.enum(['admin', 'manager', 'member', 'viewer']),
  permissions: z.record(z.any()).optional()
});

// Schema for specific project permissions
const projectPermissionsSchema = z.object({
  projectId: z.number().int().positive(),
  permissions: z.object({
    view: z.boolean().default(true),
    edit: z.boolean().default(false),
    delete: z.boolean().default(false),
    approve: z.boolean().default(false),
    manageUsers: z.boolean().default(false),
    export: z.boolean().default(false),
    publish: z.boolean().default(false)
  })
});

/**
 * Get all users in a tenant
 * Organization admins and managers can view users in their own tenant
 */
router.get('/:tenantId/users', authMiddleware, requireTenantMiddleware, async (req, res) => {
  try {
    const tenantId = parseInt(req.params.tenantId);
    if (isNaN(tenantId)) {
      return res.status(400).json({ error: 'Invalid tenant ID' });
    }
    
    // Check permissions
    if (req.userRole !== 'super_admin' && tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'You can only view users in your own organization' });
    }
    
    if (req.userRole !== 'super_admin' && req.userRole !== 'admin' && req.userRole !== 'manager') {
      return res.status(403).json({ error: 'Insufficient permissions to view organization users' });
    }
    
    // Get users in the organization
    const result = await req.db.execute(`
      SELECT u.id, u.name, u.email, u.title, u.department, u.avatar, u.status,
             ou.role, ou.created_at as joined_at
      FROM users u
      JOIN organization_users ou ON u.id = ou.user_id
      WHERE ou.organization_id = $1
      ORDER BY ou.role, u.name
    `, [tenantId]);
    
    return res.json(result.rows);
  } catch (error) {
    logger.error(`Error fetching users for tenant ${req.params.tenantId}`, error);
    return res.status(500).json({ error: 'Failed to fetch tenant users' });
  }
});

/**
 * Add a user to a tenant
 * Only organization admins and super admins can add users
 */
router.post('/:tenantId/users', authMiddleware, requireTenantMiddleware, async (req, res) => {
  try {
    const tenantId = parseInt(req.params.tenantId);
    if (isNaN(tenantId)) {
      return res.status(400).json({ error: 'Invalid tenant ID' });
    }
    
    // Check permissions
    if (req.userRole !== 'super_admin' && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only organization admins can add users' });
    }
    
    // For regular admins, ensure they're managing their own organization
    if (req.userRole === 'admin' && tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'You can only add users to your own organization' });
    }
    
    // Validate request body
    const validationResult = addUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid user data', 
        details: validationResult.error.format() 
      });
    }
    
    const userData = validationResult.data;
    
    // Check user count limit
    const tenantDb = new TenantDb(tenantId);
    const userCount = await tenantDb.count('organization_users');
    
    // Get the tenant to check limits
    const tenant = await req.db.select()
      .from('organizations')
      .where(eq('organizations.id', tenantId))
      .limit(1);
    
    if (tenant.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    if (userCount >= tenant[0].maxUsers) {
      return res.status(400).json({ 
        error: 'User limit reached', 
        message: `Your organization has reached the maximum of ${tenant[0].maxUsers} users. Please upgrade your plan or remove users before adding more.`
      });
    }
    
    // Check if user exists
    let user = await req.db.select()
      .from(users)
      .where(eq(users.email, userData.email))
      .limit(1);
    
    let userId;
    
    if (user.length === 0) {
      // User doesn't exist, create a new user
      // Generate a temporary password
      const tempPassword = randomBytes(8).toString('hex');
      
      // Create the user with a temporary password hash
      // In a real system, you would use a proper password hashing function
      const newUser = await req.db.insert(users).values({
        email: userData.email,
        name: userData.email.split('@')[0], // Default name from email
        passwordHash: `temp_${tempPassword}`, // Temporary password, will be reset on first login
        status: 'invited'
      }).returning();
      
      userId = newUser[0].id;
      
      // If sendInvite is true, send an invitation email (placeholder for email sending logic)
      if (userData.sendInvite) {
        logger.info(`Sending invitation email to ${userData.email} for tenant ${tenantId}`);
        // In a real system, you would send an email here
      }
    } else {
      userId = user[0].id;
      
      // Check if user is already in the organization
      const userOrgCheck = await req.db.select()
        .from(organizationUsers)
        .where(and(
          eq(organizationUsers.userId, userId),
          eq(organizationUsers.organizationId, tenantId)
        ))
        .limit(1);
      
      if (userOrgCheck.length > 0) {
        return res.status(400).json({ error: 'User is already a member of this organization' });
      }
    }
    
    // Add user to the organization
    const orgUser = await req.db.insert(organizationUsers).values({
      organizationId: tenantId,
      userId: userId,
      role: userData.role,
      permissions: userData.permissions || {}
    }).returning();
    
    // Return the created organization user
    return res.status(201).json(orgUser[0]);
  } catch (error) {
    logger.error(`Error adding user to tenant ${req.params.tenantId}`, error);
    return res.status(500).json({ error: 'Failed to add user to tenant' });
  }
});

/**
 * Update a user's role in a tenant
 * Only organization admins and super admins can update roles
 */
router.patch('/:tenantId/users/:userId', authMiddleware, requireTenantMiddleware, async (req, res) => {
  try {
    const tenantId = parseInt(req.params.tenantId);
    const userId = parseInt(req.params.userId);
    
    if (isNaN(tenantId) || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid tenant ID or user ID' });
    }
    
    // Check permissions
    if (req.userRole !== 'super_admin' && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only organization admins can update user roles' });
    }
    
    // For regular admins, ensure they're managing their own organization
    if (req.userRole === 'admin' && tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'You can only manage users in your own organization' });
    }
    
    // Validate request body
    const validationResult = updateUserRoleSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid user data', 
        details: validationResult.error.format() 
      });
    }
    
    const userData = validationResult.data;
    
    // Check if user exists in the organization
    const userOrgCheck = await req.db.select()
      .from(organizationUsers)
      .where(and(
        eq(organizationUsers.userId, userId),
        eq(organizationUsers.organizationId, tenantId)
      ))
      .limit(1);
    
    if (userOrgCheck.length === 0) {
      return res.status(404).json({ error: 'User is not a member of this organization' });
    }
    
    // Prevent admins from demoting themselves if they're the last admin
    if (req.userId === userId && userData.role !== 'admin' && userOrgCheck[0].role === 'admin') {
      // Check if there are other admins
      const adminCount = await req.db.select({ count: sql<number>`count(*)` })
        .from(organizationUsers)
        .where(and(
          eq(organizationUsers.organizationId, tenantId),
          eq(organizationUsers.role, 'admin')
        ));
      
      if (adminCount[0].count <= 1) {
        return res.status(400).json({ error: 'Cannot demote yourself as you are the last admin of the organization' });
      }
    }
    
    // Update user role
    const updatedOrgUser = await req.db.update(organizationUsers)
      .set({
        role: userData.role,
        permissions: userData.permissions || userOrgCheck[0].permissions || {},
        updatedAt: new Date()
      })
      .where(and(
        eq(organizationUsers.userId, userId),
        eq(organizationUsers.organizationId, tenantId)
      ))
      .returning();
    
    // Return the updated organization user
    return res.json(updatedOrgUser[0]);
  } catch (error) {
    logger.error(`Error updating user ${req.params.userId} in tenant ${req.params.tenantId}`, error);
    return res.status(500).json({ error: 'Failed to update user role' });
  }
});

/**
 * Remove a user from a tenant
 * Only organization admins and super admins can remove users
 */
router.delete('/:tenantId/users/:userId', authMiddleware, requireTenantMiddleware, async (req, res) => {
  try {
    const tenantId = parseInt(req.params.tenantId);
    const userId = parseInt(req.params.userId);
    
    if (isNaN(tenantId) || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid tenant ID or user ID' });
    }
    
    // Check permissions
    if (req.userRole !== 'super_admin' && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only organization admins can remove users' });
    }
    
    // For regular admins, ensure they're managing their own organization
    if (req.userRole === 'admin' && tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'You can only manage users in your own organization' });
    }
    
    // Prevent admins from removing themselves if they're the last admin
    if (req.userId === userId) {
      // Check if there are other admins
      const adminCount = await req.db.select({ count: sql<number>`count(*)` })
        .from(organizationUsers)
        .where(and(
          eq(organizationUsers.organizationId, tenantId),
          eq(organizationUsers.role, 'admin')
        ));
      
      // Also check if this user is an admin
      const userRole = await req.db.select()
        .from(organizationUsers)
        .where(and(
          eq(organizationUsers.userId, userId),
          eq(organizationUsers.organizationId, tenantId)
        ))
        .limit(1);
      
      if (adminCount[0].count <= 1 && userRole.length > 0 && userRole[0].role === 'admin') {
        return res.status(400).json({ error: 'Cannot remove yourself as you are the last admin of the organization' });
      }
    }
    
    // Delete user from the organization
    await req.db.delete(organizationUsers)
      .where(and(
        eq(organizationUsers.userId, userId),
        eq(organizationUsers.organizationId, tenantId)
      ));
    
    // Also delete any project-specific permissions
    await req.db.delete(clientUserPermissions)
      .where(and(
        eq(clientUserPermissions.userId, userId),
        eq(clientUserPermissions.organizationId, tenantId)
      ));
    
    return res.status(204).end();
  } catch (error) {
    logger.error(`Error removing user ${req.params.userId} from tenant ${req.params.tenantId}`, error);
    return res.status(500).json({ error: 'Failed to remove user from tenant' });
  }
});

/**
 * Set project-specific permissions for a user
 */
router.post('/:tenantId/users/:userId/project-permissions', authMiddleware, requireTenantMiddleware, async (req, res) => {
  try {
    const tenantId = parseInt(req.params.tenantId);
    const userId = parseInt(req.params.userId);
    
    if (isNaN(tenantId) || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid tenant ID or user ID' });
    }
    
    // Check permissions
    if (req.userRole !== 'super_admin' && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only organization admins can set project permissions' });
    }
    
    // For regular admins, ensure they're managing their own organization
    if (req.userRole === 'admin' && tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'You can only manage permissions in your own organization' });
    }
    
    // Validate request body
    const validationResult = projectPermissionsSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid permission data', 
        details: validationResult.error.format() 
      });
    }
    
    const permissionData = validationResult.data;
    
    // Check if user exists in the organization
    const userOrgCheck = await req.db.select()
      .from(organizationUsers)
      .where(and(
        eq(organizationUsers.userId, userId),
        eq(organizationUsers.organizationId, tenantId)
      ))
      .limit(1);
    
    if (userOrgCheck.length === 0) {
      return res.status(404).json({ error: 'User is not a member of this organization' });
    }
    
    // Check if project exists and belongs to the organization
    const projectCheck = await req.db.select()
      .from('cer_projects')
      .where(and(
        eq('cer_projects.id', permissionData.projectId),
        eq('cer_projects.organization_id', tenantId)
      ))
      .limit(1);
    
    if (projectCheck.length === 0) {
      return res.status(404).json({ error: 'Project not found or does not belong to this organization' });
    }
    
    // Check if permission already exists
    const existingPermission = await req.db.select()
      .from(clientUserPermissions)
      .where(and(
        eq(clientUserPermissions.userId, userId),
        eq(clientUserPermissions.organizationId, tenantId),
        eq(clientUserPermissions.projectId, permissionData.projectId)
      ))
      .limit(1);
    
    if (existingPermission.length > 0) {
      // Update existing permission
      const updatedPermission = await req.db.update(clientUserPermissions)
        .set({
          permissions: permissionData.permissions,
          updatedAt: new Date()
        })
        .where(eq(clientUserPermissions.id, existingPermission[0].id))
        .returning();
      
      return res.json(updatedPermission[0]);
    } else {
      // Create new permission
      const newPermission = await req.db.insert(clientUserPermissions).values({
        organizationId: tenantId,
        userId: userId,
        projectId: permissionData.projectId,
        permissions: permissionData.permissions
      }).returning();
      
      return res.status(201).json(newPermission[0]);
    }
  } catch (error) {
    logger.error(`Error setting project permissions for user ${req.params.userId} in tenant ${req.params.tenantId}`, error);
    return res.status(500).json({ error: 'Failed to set project permissions' });
  }
});

/**
 * Get project-specific permissions for a user
 */
router.get('/:tenantId/users/:userId/project-permissions', authMiddleware, requireTenantMiddleware, async (req, res) => {
  try {
    const tenantId = parseInt(req.params.tenantId);
    const userId = parseInt(req.params.userId);
    
    if (isNaN(tenantId) || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid tenant ID or user ID' });
    }
    
    // Check permissions - users can view their own permissions, admins can view anyone's
    const isOwnPermissions = req.userId === userId;
    if (!isOwnPermissions && req.userRole !== 'super_admin' && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions to view other users\' permissions' });
    }
    
    // For regular users/admins, ensure they're viewing permissions in their own organization
    if (req.userRole !== 'super_admin' && tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'You can only view permissions in your own organization' });
    }
    
    // Get project permissions for the user
    const permissions = await req.db.select()
      .from(clientUserPermissions)
      .where(and(
        eq(clientUserPermissions.userId, userId),
        eq(clientUserPermissions.organizationId, tenantId)
      ));
    
    return res.json(permissions);
  } catch (error) {
    logger.error(`Error fetching project permissions for user ${req.params.userId} in tenant ${req.params.tenantId}`, error);
    return res.status(500).json({ error: 'Failed to fetch project permissions' });
  }
});

export default router;