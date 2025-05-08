import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { users, userSessions } from '../shared/schema';
import { eq, and, isNull } from 'drizzle-orm';
import crypto from 'crypto';

// JWT secret key - in production, this should be stored in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = '24h'; // Token expiry time

// Define token payload interface
interface TokenPayload {
  userId: number;
  email: string;
  organizationId?: number;
  role: string;
  sessionId: string;
}

/**
 * Generate a JWT token for authenticated users
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

/**
 * Hash a password with a salt
 */
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  // Generate a salt if not provided
  const passwordSalt = salt || crypto.randomBytes(16).toString('hex');
  
  // Hash the password with the salt
  const hash = crypto
    .pbkdf2Sync(password, passwordSalt, 1000, 64, 'sha512')
    .toString('hex');
    
  return { hash, salt: passwordSalt };
}

/**
 * Verify a password against a stored hash
 */
export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  const { hash } = hashPassword(password, salt);
  return hash === storedHash;
}

/**
 * Middleware to authenticate API requests
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if path is public
    if (isPublicPath(req.path)) {
      return next();
    }
    
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication token required' });
    }
    
    // Extract token
    const token = authHeader.substring(7);
    
    try {
      // Verify token
      const decoded = verifyToken(token);
      
      // Check if session is valid in the database
      const session = await db.query.userSessions.findFirst({
        where: and(
          eq(userSessions.id, decoded.sessionId),
          isNull(userSessions.revokedAt)
        )
      });
      
      if (!session) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Session has been revoked' });
      }
      
      // Check if user exists and is active
      const user = await db.query.users.findFirst({
        where: and(
          eq(users.id, decoded.userId),
          eq(users.status, 'active')
        )
      });
      
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized', message: 'User account is inactive or not found' });
      }
      
      // Add user and decoded token data to request
      req.user = user;
      req.decodedToken = decoded;
      
      // Update session last activity time
      await db.update(userSessions)
        .set({ lastActive: new Date() })
        .where(eq(userSessions.id, decoded.sessionId));
      
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid authentication token' });
    }
  } catch (error) {
    console.error('Error in auth middleware:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Check if a path is public (doesn't require authentication)
 */
function isPublicPath(path: string): boolean {
  const publicPaths = [
    '/api/health',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/public'
  ];
  
  return publicPaths.some(p => path.startsWith(p));
}

// Extend Express Request interface to include user and token
declare global {
  namespace Express {
    interface Request {
      user?: any;
      decodedToken?: TokenPayload;
    }
  }
}