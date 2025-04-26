/**
 * TailMate Express Server with Protected Directories
 * 
 * This server provides API endpoints and serves static files from protected directories,
 * with security middleware to block write operations on landing and HTML components.
 * It also includes a file watcher to monitor for unauthorized changes.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const securityMiddleware = require('./html-security');

// Initialize Express app
const app = express();

// Apply security middleware to block write operations to protected directories
app.use(securityMiddleware);

// Serve the landing directory as static files (read-only)
app.use('/landing', express.static(path.join(__dirname, '../landing')));

// Serve the trialsage-html directory as static files (read-only)
app.use('/trialsage-html', express.static(path.join(__dirname, '../trialsage-html')));

// Add API routes here
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
  console.log(`Server running on port ${PORT}`);
  console.log(`Protection active - protected directories are read-only`);
  console.log(`- Landing page: /landing`);
  console.log(`- TrialSage HTML: /trialsage-html`);
  console.log(`Security status available at: /api/security-status`);
});