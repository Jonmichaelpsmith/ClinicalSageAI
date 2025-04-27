// Production-ready TrialSage ES Module server
import express from 'express';
import { createServer } from 'http';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readFileSync } from 'fs';
import session from 'express-session';
import memorystore from 'memorystore';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import dotenv from 'dotenv';
import multer from 'multer';

// Load environment variables
dotenv.config();

// Define __dirname equivalent for ES modules
const __dirname = dirname(fileURLToPath(import.meta.url));

// Create a memory store for sessions
const MemoryStore = memorystore(session);

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Configure logging
const logger = {
  error: (message, details) => {
    console.error(`[ERROR] ${message}`);
    if (details) console.error(JSON.stringify(details, null, 2));
  },
  warn: (message) => console.warn(`[WARN] ${message}`),
  info: (message) => console.log(`[INFO] ${message}`),
  debug: (message) => console.log(`[DEBUG] ${message}`)
};

// Global error handlers
process.on('uncaughtException', (error) => {
  const errorDetails = {
    type: 'UncaughtException',
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    name: error.name
  };
  logger.error('Uncaught Exception occurred', errorDetails);
});

process.on('unhandledRejection', (reason, promise) => {
  const errorDetails = {
    type: 'UnhandledRejection',
    message: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
    timestamp: new Date().toISOString()
  };
  logger.error('Unhandled Promise Rejection', errorDetails);
});

// Express app setup
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

// In-memory user database for demo (replace with real DB in production)
const users = [
  {
    id: 1,
    username: 'demo',
    password: 'demo123',
    firstName: 'Demo',
    lastName: 'User',
    email: 'demo@example.com',
    role: 'admin'
  },
  {
    id: 2,
    username: 'user',
    password: 'user123',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    role: 'user'
  }
];

// Passport local strategy
passport.use(new LocalStrategy(
  (username, password, done) => {
    const user = users.find(u => u.username === username);
    if (!user) {
      return done(null, false, { message: 'Incorrect username' });
    }
    if (user.password !== password) {
      return done(null, false, { message: 'Incorrect password' });
    }
    return done(null, user);
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
  logger.info(`${requestId} ${req.method} ${req.path}`);
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
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
      return res.json(safeUser);
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
    res.send(`
      <html>
        <head>
          <title>TrialSage</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
            .error { color: red; }
          </style>
        </head>
        <body>
          <h1>TrialSage - Error</h1>
          <p class="error">The application could not be loaded. Please contact support.</p>
          <p>API Health: <span id="health">Checking...</span></p>
          <script>
            fetch('/api/health')
              .then(response => response.json())
              .then(data => {
                document.getElementById('health').textContent = 'OK';
                document.getElementById('health').style.color = 'green';
              })
              .catch(err => {
                document.getElementById('health').textContent = 'Unavailable';
                document.getElementById('health').style.color = 'red';
              });
          </script>
        </body>
      </html>
    `);
  }
});

// Start server
const PORT = process.env.PORT || 5000;
const server = createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  logger.info(`TrialSage server running on http://localhost:${PORT}`);
});

// Handle graceful shutdown
const shutdown = () => {
  logger.info('SIGTERM/SIGINT received, shutting down server');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);