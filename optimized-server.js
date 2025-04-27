// Simple Express server for TrialSage with minimal dependencies
const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();

// Basic middleware
app.use(express.json({ limit: '50kb' })); // Add payload size limit
app.use(express.urlencoded({ extended: false, limit: '50kb' }));

// Basic auth sessions using memory storage
const sessions = new Map();

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const requestId = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
  res.locals.requestId = requestId; // Store for error handling
  console.log(`[${timestamp}] ${requestId} ${req.method} ${req.path}`);
  next();
});

// Session middleware
app.use((req, res, next) => {
  const sessionId = req.headers['x-session-id'] || req.query.sessionId;
  if (!sessionId) {
    return next();
  }

  const user = sessions.get(sessionId);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  req.user = user;
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[${res.locals.requestId || 'unknown'}] Error:`, err);
  res.status(500).json({
    error: 'Internal server error',
    requestId: res.locals.requestId || 'unknown'
  });
});

// Create a simple logger
const logger = {
  error: (message, details) => {
    console.error(`[ERROR] ${message}`);
    if (details) {
      console.error(JSON.stringify(details, null, 2));
    }
  },
  warn: (message) => console.warn(`[WARN] ${message}`),
  info: (message) => console.log(`[INFO] ${message}`),
  debug: (message) => console.log(`[DEBUG] ${message}`)
};

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  const errorDetails = {
    type: 'UncaughtException',
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    name: error.name // Added for more context
  };

  // Single, structured log to logger
  logger.error('Uncaught Exception occurred', errorDetails);

  // Structured console output for debugging
  console.error(
    `Uncaught Exception [${errorDetails.timestamp}]:\n` +
    `Name: ${error.name}\n` +
    `Message: ${error.message}\n` +
    `Stack: ${error.stack}`
  );
  
  // We'll keep the server running unless this is a critical error
  // process.exit(1);
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  const errorDetails = {
    type: 'UnhandledRejection',
    message: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : 'No stack trace available',
    timestamp: new Date().toISOString(),
    name: reason instanceof Error ? reason.name : 'NonErrorRejection'
  };

  // Single, structured log to logger
  logger.error('Unhandled Promise Rejection', errorDetails);

  // Structured console output for debugging
  console.error(
    `Unhandled Rejection [${errorDetails.timestamp}]:\n` +
    `Name: ${errorDetails.name}\n` +
    `Message: ${errorDetails.message}\n` +
    `Stack: ${errorDetails.stack}`
  );
});

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mock auth endpoints
app.post('/api/login', (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    const user = {
      id: 1,
      username,
      email: `${username}@example.com`,
      role: 'admin',
      firstName: 'Demo',
      lastName: 'User',
      sessionId
    };

    sessions.set(sessionId, user);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

app.post('/api/logout', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  if (sessionId) {
    sessions.delete(sessionId);
  }
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/user', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.user);
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

// Serve static files
const clientDistPath = path.join(__dirname, 'client/dist');
const clientSrcPath = path.join(__dirname, 'client/src');
const fallbackHtmlPath = path.join(__dirname, 'trialsage-demo.html');

if (fs.existsSync(clientDistPath)) {
  console.log('Serving client from production build (dist)');
  app.use(express.static(clientDistPath));
  
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
} else {
  console.warn('No client build found. Serving standalone demo page.');
  
  // Serve any CSS/JS assets needed by the demo page
  app.use('/demo-assets', express.static(path.join(__dirname, 'demo-assets')));
  
  // Serve the demo HTML file for the root path and client-portal path
  app.get('/', (req, res) => {
    if (fs.existsSync(fallbackHtmlPath)) {
      res.sendFile(fallbackHtmlPath);
    } else {
      res.send(`
        <html>
          <head>
            <title>TrialSage Demo</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .content { background: #f9f9f9; padding: 20px; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>TrialSage™ Demo</h1>
            </div>
            <div class="content">
              <p>This is a minimal TrialSage demo page. The main application could not be loaded.</p>
              <p>API Health Status: <span id="status">Checking...</span></p>
            </div>
            <script>
              fetch('/api/health')
                .then(response => response.json())
                .then(data => {
                  document.getElementById('status').textContent = 'Available';
                  document.getElementById('status').style.color = 'green';
                })
                .catch(err => {
                  document.getElementById('status').textContent = 'Unavailable';
                  document.getElementById('status').style.color = 'red';
                });
            </script>
          </body>
        </html>
      `);
    }
  });
  
  app.get('/client-portal', (req, res) => {
    res.redirect('/');
  });
}

// Start server
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});

// Handle graceful shutdown
const shutdown = () => {
  console.log('Shutdown signal received, closing HTTP server');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);