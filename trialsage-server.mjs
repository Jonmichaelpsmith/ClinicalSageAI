// Simple Express server for TrialSage with minimal dependencies (ES Module version)
import express from 'express';
import { createServer } from 'http';
import { join } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

// Define __dirname for ES modules
const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Simple logger implementation
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
    name: error.name
  };

  logger.error('Uncaught Exception occurred', errorDetails);
  console.error(
    `Uncaught Exception [${errorDetails.timestamp}]:\n` +
    `Name: ${error.name}\n` +
    `Message: ${error.message}\n` +
    `Stack: ${error.stack}`
  );
  // process.exit(1); // Uncomment if you want to terminate on uncaught exceptions
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  const errorDetails = {
    type: 'UnhandledRejection',
    message: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
    timestamp: new Date().toISOString(),
    promise: 'Promise object'
  };

  logger.error('Unhandled Promise Rejection', errorDetails);
  console.error(
    `Unhandled Rejection [${errorDetails.timestamp}]:\n` +
    `Message: ${errorDetails.message}\n` +
    (reason instanceof Error ? `Stack: ${reason.stack}` : '')
  );
  // process.exit(1); // Uncomment if you want to terminate on unhandled rejections
});

// Create Express app
const app = express();

// Basic middleware
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));

// Basic auth sessions using memory storage
const sessions = new Map();

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const requestId = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
  res.locals.requestId = requestId;
  logger.info(`${requestId} ${req.method} ${req.path}`);
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
const clientDistPath = join(__dirname, 'client/dist');
const clientSrcPath = join(__dirname, 'client/src');
const fallbackHtmlPath = join(__dirname, 'trialsage-demo.html');

if (existsSync(clientDistPath)) {
  logger.info('Serving client from production build (dist)');
  app.use(express.static(clientDistPath));
  
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(join(clientDistPath, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
} else {
  logger.warn('No client build found. Serving standalone demo page.');
  
  // Serve any CSS/JS assets needed by the demo page
  app.use('/demo-assets', express.static(join(__dirname, 'demo-assets')));
  
  // Serve the demo HTML file for the root path and client-portal path
  app.get('/', (req, res) => {
    if (existsSync(fallbackHtmlPath)) {
      res.sendFile(fallbackHtmlPath);
    } else {
      res.send(`
        <html>
          <head>
            <title>TrialSage Demo</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 0; 
                background: linear-gradient(to bottom, white, #fcf1f6);
                min-height: 100vh;
              }
              .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
              }
              .header { 
                background-color: white;
                border-bottom: 1px solid #eaeaea;
                padding: 15px 0;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
              }
              .header-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 20px;
              }
              .logo {
                font-size: 24px;
                font-weight: bold;
                color: #db2777; /* pink-600 */
              }
              .logo span {
                font-size: 10px;
                vertical-align: super;
                color: #666;
              }
              .main-content {
                max-width: 1200px;
                margin: 40px auto;
                padding: 20px;
              }
              .card {
                background: white;
                border-radius: 8px;
                padding: 30px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                margin-bottom: 30px;
              }
              h1 { margin-top: 0; color: #111827; }
              .grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 20px;
                margin-top: 30px;
              }
              .module-card {
                background: white;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                transition: transform 0.2s, box-shadow 0.2s;
                border: 1px solid #eaeaea;
              }
              .module-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 15px rgba(0,0,0,0.1);
              }
              .module-icon {
                width: 50px;
                height: 50px;
                background: #f9fafb;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 15px;
              }
              .icon-vault { background-color: #fee2e2; color: #ef4444; }
              .icon-ind { background-color: #e0f2fe; color: #0ea5e9; }
              .icon-csr { background-color: #f3e8ff; color: #a855f7; }
              .module-title {
                font-weight: 600;
                margin-bottom: 10px;
                color: #111827;
              }
              .module-description {
                color: #6b7280;
                font-size: 14px;
                line-height: 1.5;
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
              .login-form {
                display: none;
                margin-top: 20px;
              }
              .form-group {
                margin-bottom: 15px;
              }
              label {
                display: block;
                margin-bottom: 5px;
                color: #374151;
                font-weight: 500;
              }
              input {
                width: 100%;
                padding: 10px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                box-sizing: border-box;
              }
              .error-message {
                color: #ef4444;
                font-size: 14px;
                margin-top: 5px;
                display: none;
              }
              .auth-section {
                padding: 20px;
                max-width: 400px;
                margin: 0 auto;
              }
              .user-info {
                display: none;
              }
              .nav-links {
                display: flex;
                gap: 20px;
              }
              .nav-link {
                color: #4b5563;
                text-decoration: none;
                font-weight: 500;
              }
              .nav-link:hover {
                color: #db2777;
              }
            </style>
          </head>
          <body>
            <header class="header">
              <div class="header-content">
                <div class="logo">TrialSage<span>™</span></div>
                <div class="nav-links">
                  <a href="#" class="nav-link">Dashboard</a>
                  <a href="#" class="nav-link">Documentation</a>
                  <a href="#" class="nav-link">Support</a>
                </div>
              </div>
            </header>
            
            <div class="container">
              <div class="main-content">
                <div class="card">
                  <h1>Welcome to TrialSage™</h1>
                  <p>Advanced AI-powered regulatory writing platform for global submissions.</p>
                  <div id="auth-card" class="auth-section">
                    <div id="user-info" class="user-info">
                      <p>Logged in as: <span id="username-display"></span></p>
                      <p>Role: <span id="role-display"></span></p>
                      <button id="logout-btn" class="btn">Log Out</button>
                    </div>
                    
                    <div id="login-container">
                      <button id="show-login-btn" class="btn">Login to TrialSage</button>
                      
                      <div id="login-form" class="login-form">
                        <div class="form-group">
                          <label for="username">Username</label>
                          <input type="text" id="username" name="username" placeholder="Enter your username">
                        </div>
                        <div class="form-group">
                          <label for="password">Password</label>
                          <input type="password" id="password" name="password" placeholder="Enter your password">
                        </div>
                        <div id="login-error" class="error-message"></div>
                        <button id="login-btn" class="btn">Login</button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <h2>TrialSage Modules</h2>
                
                <div class="grid">
                  <div class="module-card">
                    <div class="module-icon icon-vault">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                    </div>
                    <div class="module-title">TrialSage Vault™</div>
                    <div class="module-description">
                      Secure document management with advanced retention, approval workflows, and compliance features.
                    </div>
                    <button class="btn">Access Vault</button>
                  </div>
                  
                  <div class="module-card">
                    <div class="module-icon icon-ind">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    </div>
                    <div class="module-title">IND Wizard™</div>
                    <div class="module-description">
                      Guided IND application preparation with automated document generation and FDA submission tools.
                    </div>
                    <button class="btn">Access IND Wizard</button>
                  </div>
                  
                  <div class="module-card">
                    <div class="module-icon icon-csr">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
                    </div>
                    <div class="module-title">CSR Intelligence™</div>
                    <div class="module-description">
                      AI-powered clinical study report analysis, extraction, and generation with regulatory compliance checks.
                    </div>
                    <button class="btn">Access CSR Intelligence</button>
                  </div>
                </div>
                
                <div class="card">
                  <h2>System Status</h2>
                  <p>API Health: <span id="api-status">Checking...</span></p>
                  <p>Database Connection: <span id="db-status">Checking...</span></p>
                </div>
              </div>
            </div>
            
            <script>
              // Check API health
              fetch('/api/health')
                .then(response => response.json())
                .then(data => {
                  document.getElementById('api-status').textContent = 'Available';
                  document.getElementById('api-status').style.color = 'green';
                })
                .catch(err => {
                  document.getElementById('api-status').textContent = 'Unavailable';
                  document.getElementById('api-status').style.color = 'red';
                });
              
              // Database status - simulate check
              setTimeout(() => {
                document.getElementById('db-status').textContent = 'Connected';
                document.getElementById('db-status').style.color = 'green';
              }, 1000);
              
              // Login functionality
              const showLoginBtn = document.getElementById('show-login-btn');
              const loginForm = document.getElementById('login-form');
              const loginBtn = document.getElementById('login-btn');
              const loginError = document.getElementById('login-error');
              const userInfo = document.getElementById('user-info');
              const usernameDisplay = document.getElementById('username-display');
              const roleDisplay = document.getElementById('role-display');
              const logoutBtn = document.getElementById('logout-btn');
              const loginContainer = document.getElementById('login-container');
              
              // Check if already logged in
              const checkLoginStatus = () => {
                const sessionId = localStorage.getItem('sessionId');
                if (sessionId) {
                  fetch('/api/user', {
                    headers: {
                      'x-session-id': sessionId
                    }
                  })
                  .then(response => {
                    if (response.ok) {
                      return response.json();
                    }
                    throw new Error('Authentication failed');
                  })
                  .then(user => {
                    loginContainer.style.display = 'none';
                    userInfo.style.display = 'block';
                    usernameDisplay.textContent = user.username;
                    roleDisplay.textContent = user.role;
                  })
                  .catch(err => {
                    localStorage.removeItem('sessionId');
                    loginContainer.style.display = 'block';
                    userInfo.style.display = 'none';
                  });
                }
              };
              
              // Show login form
              showLoginBtn.addEventListener('click', () => {
                showLoginBtn.style.display = 'none';
                loginForm.style.display = 'block';
              });
              
              // Handle login
              loginBtn.addEventListener('click', () => {
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                
                if (!username || !password) {
                  loginError.textContent = 'Username and password are required';
                  loginError.style.display = 'block';
                  return;
                }
                
                loginError.style.display = 'none';
                
                fetch('/api/login', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ username, password })
                })
                .then(response => {
                  if (response.ok) {
                    return response.json();
                  }
                  throw new Error('Login failed');
                })
                .then(user => {
                  localStorage.setItem('sessionId', user.sessionId);
                  localStorage.setItem('user', JSON.stringify(user));
                  
                  loginForm.style.display = 'none';
                  loginContainer.style.display = 'none';
                  userInfo.style.display = 'block';
                  
                  usernameDisplay.textContent = user.username;
                  roleDisplay.textContent = user.role;
                })
                .catch(err => {
                  loginError.textContent = 'Login failed. Please check your credentials.';
                  loginError.style.display = 'block';
                });
              });
              
              // Handle logout
              logoutBtn.addEventListener('click', () => {
                const sessionId = localStorage.getItem('sessionId');
                
                fetch('/api/logout', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-session-id': sessionId
                  }
                })
                .then(() => {
                  localStorage.removeItem('sessionId');
                  localStorage.removeItem('user');
                  
                  userInfo.style.display = 'none';
                  loginContainer.style.display = 'block';
                  showLoginBtn.style.display = 'block';
                  loginForm.style.display = 'none';
                })
                .catch(err => {
                  console.error('Logout error:', err);
                });
              });
              
              // Check login status on page load
              checkLoginStatus();
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
const server = createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  logger.info(`Express server running on http://localhost:${PORT}`);
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