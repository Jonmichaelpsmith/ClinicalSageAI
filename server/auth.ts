/**
 * Authentication and Authorization Middleware
 * 
 * This file contains middleware functions for authentication and authorization.
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { users } from '../shared/schema';
import { createScopedLogger } from './utils/logger';
import { db } from './db';

const logger = createScopedLogger('auth');

// Augment Express Request type to include user information
declare global {
  namespace Express {
    interface Request {
      userId?: number;
      userRole?: string;
      userEmail?: string;
      tenantId?: number;
      tenantContext?: {
        organizationId: number;
        userId?: number;
        role?: string;
      };
      db: typeof db;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and sets user information in request
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Attach database to request for consistent access
  req.db = db;
  
  // Get token from request headers
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    // Verify token
    const secret = process.env.JWT_SECRET || 'development-secret-key';
    const decoded: any = jwt.verify(token, secret);
    
    // Set user information in request
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.userEmail = decoded.email;
    
    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    logger.error('Authentication error', error);
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Require admin role middleware
 * Ensures the user has an admin role
 */
export function requireAdminRole(req: Request, res: Response, next: NextFunction) {
  if (!req.userRole || (req.userRole !== 'admin' && req.userRole !== 'super_admin')) {
    return res.status(403).json({ error: 'Admin permissions required' });
  }
  
  next();
}

/**
 * Require super admin role middleware
 * Ensures the user has a super admin role
 */
export function requireSuperAdminRole(req: Request, res: Response, next: NextFunction) {
  if (!req.userRole || req.userRole !== 'super_admin') {
    return res.status(403).json({ error: 'Super admin permissions required' });
  }
  
  next();
}

/**
 * Login function
 * Authenticates user and returns JWT token
 */
export async function login(email: string, password: string) {
  try {
    // Find user by email
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (user.length === 0) {
      throw new Error('User not found');
    }
    
    // In a real application, you would verify the password hash here
    // This is a simplified example
    const passwordIsValid = verifyPassword(password, user[0].passwordHash);
    
    if (!passwordIsValid) {
      throw new Error('Invalid password');
    }
    
    // Get user's role in their default organization
    const role = await getUserRole(user[0].id, user[0].defaultOrganizationId || 0);
    
    // Generate token
    const token = generateToken(user[0].id, role, user[0].email);
    
    return {
      token,
      user: {
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
        role,
      },
    };
  } catch (error) {
    logger.error('Login error', error);
    throw error;
  }
}

/**
 * Get user's role in an organization
 */
async function getUserRole(userId: number, organizationId: number) {
  try {
    // Get user's role in the organization
    const userOrg = await db.execute(`
      SELECT role FROM organization_users
      WHERE user_id = $1 AND organization_id = $2
    `, [userId, organizationId]);
    
    if (userOrg.rowCount === 0) {
      return 'none';
    }
    
    return userOrg.rows[0].role;
  } catch (error) {
    logger.error('Error getting user role', error);
    return 'none';
  }
}

/**
 * Generate JWT token
 */
function generateToken(userId: number, role: string, email: string) {
  const secret = process.env.JWT_SECRET || 'development-secret-key';
  
  return jwt.sign(
    {
      userId,
      role,
      email,
    },
    secret,
    {
      expiresIn: '24h', // Token expires in 24 hours
    }
  );
}

/**
 * Verify password
 * This is a simplified example - in a real application, you would use bcrypt
 */
function verifyPassword(password: string, hash: string) {
  // In a real application, you would use bcrypt.compare or similar
  // This is a simplified example for development
  if (hash.startsWith('temp_')) {
    // Temporary password for new users
    return password === hash.substring(5);
  }
  
  // For development, we'll just compare plaintext
  return password === hash;
}