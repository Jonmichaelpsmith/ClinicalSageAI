/**
 * TrialSage™ ES Module Server Implementation
 * Production-ready server with full ES module compatibility
 */

import express from 'express';
import { createServer } from 'http';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, promises as fs } from 'fs';
import dotenv from 'dotenv';
import session from 'express-session';
import memorystore from 'memorystore';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import multer from 'multer';
import { promisify } from 'util';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';

// Load environment variables
dotenv.config();

// Define __dirname equivalent for ES modules
const __dirname = dirname(fileURLToPath(import.meta.url));

// Logger setup
const LOG_FILE = join(__dirname, 'logs', 'server.log');
const ERROR_LOG_FILE = join(__dirname, 'logs', 'errors.log');

// Ensure log directory exists
await fs.mkdir(join(__dirname, 'logs'), { recursive: true }).catch(() => {});

// Enhanced logger with file output
const logger = {
  error: async (message, details) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[ERROR] ${timestamp} - ${message}`;
    console.error(logMessage);
    
    if (details) {
      console.error(JSON.stringify(details, null, 2));
    }
    
    try {
      await fs.appendFile(
        ERROR_LOG_FILE,
        `${logMessage}\n${details ? JSON.stringify(details, null, 2) + '\n' : ''}`
      );
    } catch (err) {
      console.error('Failed to write to error log file:', err);
    }
  },
  
  warn: async (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[WARN] ${timestamp} - ${message}`;
    console.warn(logMessage);
    
    try {
      await fs.appendFile(LOG_FILE, `${logMessage}\n`);
    } catch (err) {
      console.error('Failed to write to log file:', err);
    }
  },
  
  info: async (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[INFO] ${timestamp} - ${message}`;
    console.log(logMessage);
    
    try {
      await fs.appendFile(LOG_FILE, `${logMessage}\n`);
    } catch (err) {
      console.error('Failed to write to log file:', err);
    }
  },
  
  debug: (message) => {
    if (process.env.DEBUG) {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`);
    }
  }
};

// Global error handlers
process.on('uncaughtException', async (error) => {
  const errorDetails = {
    type: 'UncaughtException',
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    name: error.name
  };
  
  await logger.error('Uncaught Exception occurred', errorDetails);
  
  // Record fatal error but keep the server running if possible
  if (error.message.includes('require is not defined')) {
    await logger.error('ES Module compatibility issue detected', { 
      hint: 'Use import instead of require for ES Module compatibility'
    });
  }
});

process.on('unhandledRejection', async (reason, promise) => {
  const errorDetails = {
    type: 'UnhandledRejection',
    message: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
    timestamp: new Date().toISOString()
  };
  
  await logger.error('Unhandled Promise Rejection', errorDetails);
});

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = join(__dirname, 'uploads');
    fs.mkdir(uploadDir, { recursive: true })
      .then(() => cb(null, uploadDir))
      .catch(err => cb(err));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Create memory store for sessions
const MemoryStore = memorystore(session);

// Authentication utilities
const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) instanceof Buffer
    ? await scryptAsync(password, salt, 64)
    : Buffer.from(await scryptAsync(password, salt, 64));
  return `${buf.toString('hex')}.${salt}`;
}

async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) instanceof Buffer
    ? await scryptAsync(supplied, salt, 64)
    : Buffer.from(await scryptAsync(supplied, salt, 64));
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// In-memory user database (replace with real DB in production)
const users = [
  {
    id: 1,
    username: 'admin',
    // Password: admin123
    password: 'c042f4db1d6f2fcc7d26ba47262bd1c77a187d4b5f2df10d1ce1fbc8efa14f2fb60a5c5939d5cc95a49d842545c29300e9027365619a5bab30ec0d9bfea611bb.1a8932b40ca0cd4e81e60b5f5114d129',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    role: 'admin'
  },
  {
    id: 2,
    username: 'user',
    // Password: user123
    password: '1dd2e8bdeb96f28c7673c7a5496ad21996e8bfe77d04f8c7ef5ec49b8ab064f69f20c962f8b4164f9de4b73d45cbd5b7abdb549e7e5de3dd8c8e5074e199bc02.fdf54c550d99a5f93b915e498bb7289d',
    firstName: 'Demo',
    lastName: 'User',
    email: 'user@example.com',
    role: 'user'
  }
];

// Express app setup
export async function startServer() {
  const app = express();
  
  // Basic middleware
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: false, limit: '50mb' }));
  
  // Session middleware
  const sessionConfig = {
    store: new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET || 'trialsage-secure-session-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };
  
  app.use(session(sessionConfig));
  
  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Passport local strategy
  passport.use(new LocalStrategy(
    async (username, password, done) => {
      try {
        const user = users.find(u => u.username === username);
        if (!user) {
          return done(null, false, { message: 'Incorrect username' });
        }
        
        const isPasswordValid = await comparePasswords(password, user.password);
        if (!isPasswordValid) {
          return done(null, false, { message: 'Incorrect password' });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));
  
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser((id, done) => {
    const user = users.find(u => u.id === id);
    done(null, user);
  });
  
  // Request logging middleware
  app.use((req, res, next) => {
    const requestId = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    res.locals.requestId = requestId;
    logger.info(`Request ${requestId} - ${req.method} ${req.path}`);
    next();
  });
  
  // Error handling middleware
  app.use((err, req, res, next) => {
    logger.error('Express error', {
      requestId: res.locals.requestId,
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({
      error: 'Internal server error',
      requestId: res.locals.requestId
    });
  });
  
  // API routes
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      serverType: 'ESM',
      version: '2.0.0'
    });
  });
  
  // Authentication routes
  app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ error: info.message || 'Authentication failed' });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Create a safe user object without password
        const safeUser = { ...user };
        delete safeUser.password;
        
        return res.json({ user: safeUser, token: 'mock-token-for-testing-' + Date.now() });
      });
    })(req, res, next);
  });
  
  app.post('/api/logout', (req, res) => {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.json({ message: 'Logged out successfully' });
    });
  });
  
  app.get('/api/user', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Create a safe user object without password
    const safeUser = { ...req.user };
    delete safeUser.password;
    
    res.json(safeUser);
  });
  
  // IND wizard routes
  app.get('/api/ind/wizard/templates', (req, res) => {
    res.json([
      { id: 1, name: 'Basic IND Template', description: 'Standard IND application template' },
      { id: 2, name: 'Expedited Review Template', description: 'For expedited review process' },
      { id: 3, name: 'Advanced Template', description: 'Comprehensive IND application template' }
    ]);
  });
  
  app.get('/api/ind/wizard/sections', (req, res) => {
    res.json([
      { id: 1, name: 'Cover Letter', required: true },
      { id: 2, name: 'Form FDA 1571', required: true },
      { id: 3, name: 'Table of Contents', required: true },
      { id: 4, name: 'Introductory Statement', required: true },
      { id: 5, name: 'General Investigational Plan', required: true },
      { id: 6, name: 'Investigator\'s Brochure', required: true },
      { id: 7, name: 'Clinical Protocol', required: true },
      { id: 8, name: 'Chemistry, Manufacturing, and Control Information', required: true },
      { id: 9, name: 'Pharmacology and Toxicology Information', required: true },
      { id: 10, name: 'Previous Human Experience', required: false },
      { id: 11, name: 'Additional Information', required: false }
    ]);
  });
  
  // File upload handling for document management
  app.post('/api/documents/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Return information about the uploaded file
    res.json({
      message: 'File uploaded successfully',
      file: {
        originalname: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size
      }
    });
  });
  
  // Serve static files
  const clientDistPath = join(__dirname, 'client/dist');
  app.use(express.static(clientDistPath));
  
  // Create fallback HTML for SPA
  const fallbackHtml = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>TrialSage</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background: linear-gradient(to bottom, white, #fcf1f6);
          min-height: 100vh;
        }
        .container {
          max-width: 800px;
          margin: 40px auto;
          padding: 20px;
          text-align: center;
        }
        .error {
          color: red;
          margin: 20px 0;
        }
        .logo {
          font-weight: bold;
          font-size: 24px;
          color: #db2777;
        }
        .card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-top: 40px;
        }
        .btn {
          display: inline-block;
          background-color: #db2777;
          color: white;
          padding: 10px 16px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          transition: background-color 0.2s;
          border: none;
          cursor: pointer;
          margin-top: 15px;
        }
        .btn:hover {
          background-color: #be185d;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">TrialSage™</div>
        <div class="card">
          <h1>Welcome to TrialSage</h1>
          <p>The SPA client is being initialized...</p>
          <div id="status">Checking server status...</div>
          <button class="btn" onclick="window.location.reload()">Reload Page</button>
        </div>
      </div>
      <script>
        // Check server health
        fetch('/api/health')
          .then(response => response.json())
          .then(data => {
            document.getElementById('status').innerHTML = 
              '<div style="color: green; margin: 10px 0;">Server is running properly</div>' +
              '<div>API Status: ' + data.status + '</div>' +
              '<div>Server Type: ' + data.serverType + '</div>' +
              '<div>Version: ' + data.version + '</div>';
          })
          .catch(err => {
            document.getElementById('status').innerHTML = 
              '<div class="error">Server connection issue</div>' +
              '<div>Error: ' + err.message + '</div>';
          });
      </script>
    </body>
  </html>
  `;
  
  // All other routes serve the index.html file (for SPA routing)
  app.get('*', (req, res) => {
    // If the path starts with /api and wasn't handled by the API routes, return a 404
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // Otherwise serve the SPA's index.html
    const indexPath = join(clientDistPath, 'index.html');
    if (existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      // If we can't find the index.html file, serve a basic fallback
      res.send(fallbackHtml);
    }
  });
  
  // Start server
  const PORT = process.env.PORT || 5000;
  const server = createServer(app);
  
  server.listen(PORT, '0.0.0.0', () => {
    logger.info(`TrialSage ESM server running on http://localhost:${PORT}`);
  });
  
  // Handle graceful shutdown
  const shutdown = () => {
    logger.info('SIGTERM/SIGINT received, shutting down server');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
    
    // Force close after 10s if graceful shutdown fails
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };
  
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  
  return server;
}