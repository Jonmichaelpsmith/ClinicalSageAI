const { createClient } = require('@supabase/supabase-js');
const db = require('../db');

// Initialize Supabase client with service role key for user verification
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Middleware to verify authentication and set tenant context
 */
async function requireAuth(req, res, next) {
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    // Get user's organization info from our database
    const userOrgResult = await db.query(
      `SELECT uo.org_id, uo.role, o.org_type, o.parent_org_id 
       FROM user_organizations uo 
       JOIN organizations o ON uo.org_id = o.org_id 
       WHERE uo.user_id = $1 AND uo.is_primary = TRUE`, 
      [user.id]
    );
    
    if (userOrgResult.rows.length === 0) {
      return res.status(403).json({ message: 'User not associated with any organization' });
    }
    
    const userOrg = userOrgResult.rows[0];
    
    // Set user and tenant context on the request
    req.user = {
      id: user.id,
      email: user.email,
      orgId: userOrg.org_id,
      role: userOrg.role,
      orgType: userOrg.org_type
    };
    
    // Set tenant context based on organization type
    req.tenantContext = {
      userId: user.id
    };
    
    if (userOrg.org_type === 'CRO') {
      req.tenantContext.croId = userOrg.org_id;
    } else if (userOrg.org_type === 'CLIENT') {
      req.tenantContext.clientId = userOrg.org_id;
      req.tenantContext.croId = userOrg.parent_org_id;
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
}

/**
 * Middleware to check if user has the required role
 */
function authorizeRole(requiredRoles) {
  return (req, res, next) => {
    // requiredRoles can be a single role or an array of roles
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  };
}

/**
 * Middleware to switch tenant context when a CRO user is accessing client data
 */
function switchTenantContext(req, res, next) {
  // Only CRO users can switch context
  if (req.user.orgType !== 'CRO') {
    return res.status(403).json({ message: 'Only CRO users can switch tenant context' });
  }
  
  const clientId = req.params.clientId || req.query.clientId || req.body.clientId;
  
  if (!clientId) {
    return res.status(400).json({ message: 'Client ID is required for context switching' });
  }
  
  // Update tenant context with the specified client
  req.tenantContext = {
    ...req.tenantContext,
    clientId
  };
  
  next();
}

module.exports = {
  requireAuth,
  authorizeRole,
  switchTenantContext
};