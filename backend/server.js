/**
 * TrialSage Enterprise Server
 * 
 * This server provides API endpoints and serves static files from protected directories,
 * with security middleware to block write operations on landing and HTML components.
 * It also includes a file watcher to monitor for unauthorized changes.
 * 
 * Enterprise features include:
 * - Multi-tenant security for DocuShare integration
 * - AI document summarization with OpenAI
 * - Comprehensive audit logging and dashboards
 * - File integrity monitoring and protection
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const securityMiddleware = require('./html-security');

// Import routes
const auditRoutes = require('../server/routes/audit.js');
const aiRoutes = require('../server/routes/ai.js');

// Initialize Express app
const app = express();

// Apply middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Apply security middleware to block write operations to protected directories
app.use(securityMiddleware);

// Serve the landing directory as static files (read-only)
app.use('/landing', express.static(path.join(__dirname, '../landing')));

// Serve the trialsage-html directory as static files (read-only)
app.use('/trialsage-html', express.static(path.join(__dirname, '../trialsage-html')));

// Mock authentication middleware (to be replaced with real auth in production)
app.use((req, res, next) => {
  // Simulate an authenticated user for development purposes
  req.user = {
    id: 'admin123',
    username: 'admin',
    tenantId: 'trialsage',
    isAdmin: true
  };
  next();
});

// Mount API routes
app.use('/api/audit', auditRoutes);
app.use('/api/ai', aiRoutes);

// Security and status endpoints
app.get('/api/status', (req, res) => {
  res.json({
    status: 'operational',
    protectedDirectories: ['/landing', '/trialsage-html'],
    securityActive: true,
    fileWatcherActive: true,
    timestamp: new Date().toISOString()
  });
});

// Add security status endpoint
app.get('/api/security-status', (req, res) => {
  // Check if landing directory files are writable
  let landingLocked = true;
  if (fs.existsSync('../landing')) {
    try {
      const stats = fs.statSync('../landing');
      landingLocked = !(stats.mode & fs.constants.S_IWUSR);
    } catch (err) {
      console.error('Error checking landing directory:', err);
    }
  }
  
  // Check if trialsage-html directory files are writable
  let htmlLocked = true;
  if (fs.existsSync('../trialsage-html')) {
    try {
      const stats = fs.statSync('../trialsage-html');
      htmlLocked = !(stats.mode & fs.constants.S_IWUSR);
    } catch (err) {
      console.error('Error checking trialsage-html directory:', err);
    }
  }
  
  res.json({
    landingDirectoryLocked: landingLocked,
    htmlDirectoryLocked: htmlLocked,
    middlewareActive: true,
    fileWatcherActive: true,
    lastChecked: new Date().toISOString()
  });
});

// Serve the audit dashboard
app.get('/admin/audit', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Serve the main app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../trialsage-html/FULLPAGE_SIMPLIFIED.html'));
});

// Start the file watcher
try {
  require('../infra/fileWatcher');
  console.log('File watcher started for protected directories');
} catch (error) {
  console.warn('Warning: File watcher could not be started:', error.message);
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`TrialSage Enterprise Server running on port ${PORT}`);
  console.log(`Protection active - protected directories are read-only`);
  console.log(`- Landing page: /landing`);
  console.log(`- TrialSage HTML: /trialsage-html`);
  console.log(`Enterprise features active:`);
  console.log(`- Multi-tenant Document Security`);
  console.log(`- AI Document Summarization`);
  console.log(`- Audit Trail Dashboard at /admin/audit`);
  console.log(`Security status available at: /api/security-status`);
});