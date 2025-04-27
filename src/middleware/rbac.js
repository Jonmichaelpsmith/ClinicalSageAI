import db from '../db.js';

/**
 * Role-Based Access Control Middleware
 * 
 * This middleware authorizes users based on their assigned role for an organization.
 * It checks if the user has at least the specified role for the organization in the request.
 * 
 * @param {string} requiredRole - The minimum role required to access the resource
 * @returns {function} Express middleware function
 */
export function authorizeRole(requiredRole) {
  return async (req, res, next) => {
    try {
      // The organization ID can come from the request params or the query
      const orgId = req.params.orgId || req.query.orgId;
      
      if (!orgId) {
        return res.status(400).json({ message: 'Organization ID required' });
      }

      // Get role hierarchy
      const roles = await db('roles').select('*').orderBy('id', 'asc');
      const roleMap = roles.reduce((map, role) => {
        map[role.name] = role.id;
        return map;
      }, {});
      
      // Check if required role exists
      if (!roleMap[requiredRole]) {
        console.error(`Invalid role specified: ${requiredRole}`);
        return res.status(500).json({ message: 'Invalid role configuration' });
      }
      
      // Get user's role for the organization
      const [userRole] = await db('user_organizations')
        .join('roles', 'roles.id', 'user_organizations.role_id')
        .where({ 
          user_id: req.user.id,
          org_id: orgId
        })
        .select('roles.id', 'roles.name');
      
      if (!userRole) {
        return res.status(403).json({ message: 'Not a member of this organization' });
      }
      
      // Check if user's role is sufficient
      if (userRole.id > roleMap[requiredRole]) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
      
      // User has sufficient permissions
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ message: 'Authorization error' });
    }
  };
}