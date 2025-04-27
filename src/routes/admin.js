import { Router } from 'express';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth.js';
import { authorizeRole } from '../middleware/rbac.js';
import db from '../db.js';

const router = Router();

/**
 * List all users in an organization
 * GET /api/admin/orgs/:orgId/users
 * 
 * Returns a list of users with their email and role
 * Requires Admin role
 */
router.get('/admin/orgs/:orgId/users', requireAuth, authorizeRole('Admin'), async (req, res) => {
  try {
    const users = await db('user_organizations as uo')
      .join('users as u', 'u.id', 'uo.user_id')
      .join('roles as r', 'r.id', 'uo.role_id')
      .where({ 'uo.org_id': req.params.orgId })
      .select('u.id', 'u.email', 'r.name as role');
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching organization users:', error);
    res.status(500).json({ 
      message: 'Failed to fetch organization users',
      error: error.message
    });
  }
});

/**
 * Invite a user to an organization
 * POST /api/admin/orgs/:orgId/invite
 * 
 * Creates a user if they don't exist and adds them to the organization
 * with the specified role
 * Requires Admin role
 */
router.post('/admin/orgs/:orgId/invite', requireAuth, authorizeRole('Admin'), async (req, res) => {
  const { email, roleId } = req.body;
  
  if (!email || !roleId) {
    return res.status(400).json({ message: 'Email and roleId are required' });
  }
  
  try {
    // Begin transaction
    await db.transaction(async trx => {
      // 1) Create user in users table if not exists
      let user = await trx('users').where({ email }).first();
      
      if (!user) {
        // Generate a UUID for the new user
        const userId = crypto.randomUUID();
        [user] = await trx('users')
          .insert({ id: userId, email })
          .returning('*');
      }
      
      // 2) Check if user is already in the organization
      const existingMapping = await trx('user_organizations')
        .where({ 
          user_id: user.id, 
          org_id: req.params.orgId 
        })
        .first();
      
      if (existingMapping) {
        // Update role if user already exists in org
        await trx('user_organizations')
          .where({ 
            user_id: user.id, 
            org_id: req.params.orgId 
          })
          .update({ role_id: roleId });
      } else {
        // Insert new mapping if user doesn't exist in org
        await trx('user_organizations')
          .insert({ 
            user_id: user.id, 
            org_id: req.params.orgId, 
            role_id: roleId 
          });
      }
      
      // 3) Send email via Supabase invite (implementation omitted)
      // In a real application, you would send an invitation email here
    });
    
    res.status(201).json({ ok: true });
  } catch (error) {
    console.error('Error inviting user:', error);
    res.status(500).json({ 
      message: 'Failed to invite user',
      error: error.message
    });
  }
});

export default router;