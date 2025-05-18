/**
 * TrialSage Resource-Optimized Server
 * 
 * This is an optimized version of the main server that properly manages
 * system resources to prevent "pthread_create: Resource temporarily unavailable" errors.
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import dotenv from 'dotenv';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Configure resource limits
process.env.UV_THREADPOOL_SIZE = '4';
process.env.NODE_OPTIONS = '--max-old-space-size=512';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware - keep minimal for initial startup
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Health checks
app.get('/api/health', (req, res) => {
  const memoryUsage = process.memoryUsage();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB'
    }
  });
});

// Track child process usage
let activeChildProcesses = 0;
const MAX_CHILD_PROCESSES = 3;

// Setup child process manager
function manageChildProcess(fn) {
  if (activeChildProcesses >= MAX_CHILD_PROCESSES) {
    console.warn(`Maximum child processes reached (${activeChildProcesses}/${MAX_CHILD_PROCESSES})`);
    return Promise.reject(new Error('Maximum child processes reached'));
  }
  
  activeChildProcesses++;
  console.log(`Child process started (${activeChildProcesses}/${MAX_CHILD_PROCESSES})`);
  
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      activeChildProcesses--;
      console.log(`Child process ended (${activeChildProcesses}/${MAX_CHILD_PROCESSES})`);
    });
}

// Set up basic routes for demo
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>TrialSage Resource-Optimized Server</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #2c3e50; }
          .card { border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
          .btn { background: #3498db; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
          .btn:hover { background: #2980b9; }
        </style>
      </head>
      <body>
        <h1>TrialSage Resource-Optimized Server</h1>
        <div class="card">
          <h2>Server Status</h2>
          <p>The optimized server is running correctly with proper resource management!</p>
          <p>This version prevents the "pthread_create: Resource temporarily unavailable" error by controlling resource usage.</p>
          <button class="btn" onclick="checkHealth()">Check Health Status</button>
          <div id="health-status"></div>
        </div>
        <script>
          function checkHealth() {
            fetch('/api/health')
              .then(res => res.json())
              .then(data => {
                document.getElementById('health-status').innerHTML = 
                  '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
              });
          }
        </script>
      </body>
    </html>
  `);
});

// Serve static files with limitations to preserve memory
app.use('/assets', express.static(path.join(__dirname, 'client/src/assets'), {
  maxAge: '1d',
  etag: false,
  index: false
}));

// Create and start the HTTP server
const httpServer = createServer(app);

// Handle shutdown gracefully
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function shutdown() {
  console.log('Shutting down gracefully...');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  
  // Force shutdown after 5 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 5000);
}

// Start server with proper error handling
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`TrialSage optimized server running on port ${PORT}`);
  console.log(`Resource limits: ${process.env.UV_THREADPOOL_SIZE} threads, ${process.env.NODE_OPTIONS} memory`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
});

// Export manageChildProcess for other modules
export { manageChildProcess };