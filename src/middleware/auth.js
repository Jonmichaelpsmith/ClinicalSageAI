import { supabaseSrv } from '../utils/supabaseSrv.js';
import db from '../db.js';

/**
 * JWT authentication middleware for TrialSage Vault
 * - Verifies JWT token
 * - Loads user info & organization context
 */
export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // No auth header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token with Supabase
    const { data: { user }, error } = await supabaseSrv.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Get user's organization context
    const userOrg = await db('user_organizations')
      .where({ user_id: user.id })
      .join('organizations', 'user_organizations.org_id', 'organizations.id')
      .select('organizations.id as orgId', 'organizations.name as orgName', 'user_organizations.role')
      .first();
    
    if (!userOrg) {
      return res.status(403).json({ message: 'User not assigned to any organization' });
    }
    
    // Attach user and org context to request
    req.user = {
      id: user.id,
      email: user.email,
      ...userOrg
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};