import { storage } from './storage';
import { User, InsertUser } from '@shared/schema';
import { scrypt, randomBytes, timingSafeEqual, createHmac } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// Make sure JWT_SECRET is available
const JWT_SECRET = process.env.JWT_SECRET || 'default-development-secret-do-not-use-in-production';

/**
 * Hash a password for storage
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

/**
 * Compare a supplied password with a stored hashed password
 */
export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

/**
 * Generate a simple token for a user
 * Note: This is a simplified implementation for development purposes only
 */
export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  };
  
  // Convert payload to base64
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
  
  // Create a signature using HMAC
  const signature = createHmac('sha256', JWT_SECRET)
    .update(payloadBase64)
    .digest('base64');
  
  return `${payloadBase64}.${signature}`;
}

/**
 * Verify a token and extract the user ID
 * Note: This is a simplified implementation for development purposes only
 */
export function verifyToken(token: string): { userId: number } | null {
  try {
    // Split the token into payload and signature
    const [payloadBase64, receivedSignature] = token.split('.');
    
    // Verify the signature
    const expectedSignature = createHmac('sha256', JWT_SECRET)
      .update(payloadBase64)
      .digest('base64');
    
    if (receivedSignature !== expectedSignature) {
      return null;
    }
    
    // Decode the payload
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
    
    // Check if token is expired
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return { userId: payload.id };
  } catch (err) {
    console.error('Token verification error:', err);
    return null;
  }
}

/**
 * Register a new user
 */
export async function registerUser(userData: InsertUser): Promise<{ user: User; token: string }> {
  // Check if username already exists
  const existingUser = await storage.getUserByUsername(userData.username);
  if (existingUser) {
    throw new Error('Username already exists');
  }
  
  // Hash the password
  const hashedPassword = await hashPassword(userData.password);
  
  // Create the user with hashed password
  const user = await storage.createUser({
    ...userData,
    password: hashedPassword
  });
  
  // Generate a token
  const token = generateToken(user);
  
  return { user, token };
}

/**
 * Login a user
 */
export async function loginUser(username: string, password: string): Promise<{ user: User; token: string }> {
  // Find the user by username
  const user = await storage.getUserByUsername(username);
  if (!user) {
    throw new Error('Invalid username or password');
  }
  
  // Compare passwords
  const isPasswordValid = await comparePasswords(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid username or password');
  }
  
  // Generate a token
  const token = generateToken(user);
  
  return { user, token };
}

/**
 * Get user from token
 */
export async function getUserFromToken(token: string): Promise<User | null> {
  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }
  
  const user = await storage.getUser(payload.userId);
  return user || null;
}