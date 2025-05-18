/**
 * Minimal TrialSage Server
 * A simplified version to start the application with minimal dependencies
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(express.json({ limit: '2mb' }));
app.use(express.static('./'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const memUsage = process.memoryUsage();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB'
    }
  });
});

// Sample API endpoint for testing
app.get('/api/trials', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        title: 'Clinical Trial XYZ-123',
        status: 'Active',
        enrollmentTarget: 150,
        currentEnrollment: 87,
        startDate: '2025-01-15',
        primaryCompletion: '2025-08-30'
      },
      {
        id: 2,
        title: 'Phase 2 Study ABC-456',
        status: 'Recruiting',
        enrollmentTarget: 200,
        currentEnrollment: 45,
        startDate: '2025-03-10',
        primaryCompletion: '2025-12-15'
      }
    ]
  });
});

// Serve HTML landing page
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>TrialSage Platform</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #2c3e50; }
          .card { border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
          .btn { background: #3498db; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
          .btn:hover { background: #2980b9; }
        </style>
      </head>
      <body>
        <h1>TrialSage Platform</h1>
        <div class="card">
          <h2>Server Status</h2>
          <p>The minimal server is running correctly!</p>
          <button class="btn" onclick="checkHealth()">Check Health Status</button>
          <div id="health-status"></div>
        </div>
        <div class="card">
          <h2>Sample API</h2>
          <button class="btn" onclick="fetchTrials()">Fetch Sample Trials</button>
          <div id="trials-data"></div>
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
          
          function fetchTrials() {
            fetch('/api/trials')
              .then(res => res.json())
              .then(data => {
                document.getElementById('trials-data').innerHTML = 
                  '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
              });
          }
        </script>
      </body>
    </html>
  `);
});

// Serve client portal page if it exists
app.get('/client-portal', (req, res) => {
  const clientPortalPath = path.join(__dirname, 'client-portal.html');
  if (fs.existsSync(clientPortalPath)) {
    res.sendFile(clientPortalPath);
  } else {
    res.send(`
      <html>
        <head><title>Client Portal</title></head>
        <body>
          <h1>Client Portal</h1>
          <p>This is a placeholder for the client portal.</p>
          <a href="/">Back to Home</a>
        </body>
      </html>
    `);
  }
});

// Fall back to index for all other routes (SPA style)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  res.redirect('/');
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`TrialSage minimal server running on port ${PORT}`);
  console.log(`Available at http://localhost:${PORT}/`);
});