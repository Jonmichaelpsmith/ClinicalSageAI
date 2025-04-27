import express, { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { insertUserSchema, insertProjectSchema, insertDocumentSchema } from '@shared/schema';
import { z } from 'zod';
import { createServer } from 'http';
import { scrypt, randomBytes, timingSafeEqual, createHmac } from 'crypto';
import { promisify } from 'util';

// Create a server
const app = express();
app.use(express.json());

// Crypto utilities
const scryptAsync = promisify(scrypt);
const JWT_SECRET = process.env.JWT_SECRET || 'default-development-secret-do-not-use-in-production';

/**
 * Hash a password for storage
 */
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

/**
 * Compare a supplied password with a stored hashed password
 */
async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

/**
 * Generate a simple token for a user
 */
function generateToken(user: any): string {
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
 */
function verifyToken(token: string): { userId: number } | null {
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
async function registerUser(userData: any): Promise<{ user: any; token: string }> {
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
async function loginUser(username: string, password: string): Promise<{ user: any; token: string }> {
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

// Authentication middleware
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  
  const user = await storage.getUser(payload.userId);
  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }
  
  // Add user to request object
  (req as any).user = user;
  next();
};

// Error handler middleware
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  
  if (err instanceof z.ZodError) {
    return res.status(400).json({ 
      message: 'Validation error', 
      errors: err.errors 
    });
  }
  
  res.status(500).json({ message: err.message || 'Internal server error' });
};

// Auth routes
app.post('/api/register', async (req, res, next) => {
  try {
    const userData = insertUserSchema.parse(req.body);
    const { user, token } = await registerUser(userData);
    
    // Omit password from response
    const { password, ...userWithoutPassword } = user;
    
    res.status(201).json({ user: userWithoutPassword, token });
  } catch (err) {
    next(err);
  }
});

app.post('/api/login', async (req, res, next) => {
  try {
    // Validate request
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    const { user, token } = await loginUser(username, password);
    
    // Omit password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(200).json({ user: userWithoutPassword, token });
  } catch (err) {
    next(err);
  }
});

app.get('/api/user', authenticate, async (req, res) => {
  const user = (req as any).user;
  
  // Omit password from response
  const { password, ...userWithoutPassword } = user;
  
  res.json(userWithoutPassword);
});

// Project routes
app.get('/api/projects', authenticate, async (req, res, next) => {
  try {
    const user = (req as any).user;
    const projects = await storage.getProjects(user.id);
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

app.get('/api/projects/:id', authenticate, async (req, res, next) => {
  try {
    const user = (req as any).user;
    const projectId = parseInt(req.params.id);
    
    const project = await storage.getProject(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user owns the project
    if (project.userId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(project);
  } catch (err) {
    next(err);
  }
});

app.post('/api/projects', authenticate, async (req, res, next) => {
  try {
    const user = (req as any).user;
    const projectData = insertProjectSchema.parse(req.body);
    
    // Override any provided userId with authenticated user's ID
    const project = await storage.createProject({
      ...projectData,
      userId: user.id
    });
    
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
});

app.patch('/api/projects/:id', authenticate, async (req, res, next) => {
  try {
    const user = (req as any).user;
    const projectId = parseInt(req.params.id);
    
    const project = await storage.getProject(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user owns the project
    if (project.userId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Prevent changing userId
    const { userId, ...updatableFields } = req.body;
    
    const updatedProject = await storage.updateProject(projectId, updatableFields);
    res.json(updatedProject);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/projects/:id', authenticate, async (req, res, next) => {
  try {
    const user = (req as any).user;
    const projectId = parseInt(req.params.id);
    
    const project = await storage.getProject(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user owns the project
    if (project.userId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await storage.deleteProject(projectId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Document routes
app.get('/api/projects/:projectId/documents', authenticate, async (req, res, next) => {
  try {
    const user = (req as any).user;
    const projectId = parseInt(req.params.projectId);
    
    const project = await storage.getProject(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user owns the project
    if (project.userId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const documents = await storage.getDocuments(projectId);
    res.json(documents);
  } catch (err) {
    next(err);
  }
});

app.post('/api/projects/:projectId/documents', authenticate, async (req, res, next) => {
  try {
    const user = (req as any).user;
    const projectId = parseInt(req.params.projectId);
    
    const project = await storage.getProject(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user owns the project
    if (project.userId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const documentData = insertDocumentSchema.parse(req.body);
    
    // Override any provided projectId with the one from the URL
    const document = await storage.createDocument({
      ...documentData,
      projectId
    });
    
    res.status(201).json(document);
  } catch (err) {
    next(err);
  }
});

app.get('/api/documents/:id', authenticate, async (req, res, next) => {
  try {
    const user = (req as any).user;
    const documentId = parseInt(req.params.id);
    
    const document = await storage.getDocument(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if user owns the project that contains the document
    const project = await storage.getProject(document.projectId);
    if (!project || project.userId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(document);
  } catch (err) {
    next(err);
  }
});

app.patch('/api/documents/:id', authenticate, async (req, res, next) => {
  try {
    const user = (req as any).user;
    const documentId = parseInt(req.params.id);
    
    const document = await storage.getDocument(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if user owns the project that contains the document
    const project = await storage.getProject(document.projectId);
    if (!project || project.userId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Prevent changing projectId
    const { projectId, ...updatableFields } = req.body;
    
    const updatedDocument = await storage.updateDocument(documentId, updatableFields);
    res.json(updatedDocument);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/documents/:id', authenticate, async (req, res, next) => {
  try {
    const user = (req as any).user;
    const documentId = parseInt(req.params.id);
    
    const document = await storage.getDocument(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if user owns the project that contains the document
    const project = await storage.getProject(document.projectId);
    if (!project || project.userId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await storage.deleteDocument(documentId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Add the error handler middleware at the end
app.use(errorHandler);

// Setup routes function for compatibility with server/index.ts
export function setupRoutes(expressApp) {
  // If expressApp is provided, we attach our routes to it
  if (expressApp && expressApp !== app) {
    // Copy all routes and middleware from our app to the provided expressApp
    expressApp._router.stack = expressApp._router.stack.concat(
      app._router.stack.filter(middleware => 
        middleware.route || middleware.name === 'expressInit' || middleware.name === 'query'
      )
    );
  }
  
  // Return a server instance that can be used by index.ts
  const { createServer } = require('http');
  return createServer(expressApp || app);
}

// Also export the app directly for simpler imports
export { app };