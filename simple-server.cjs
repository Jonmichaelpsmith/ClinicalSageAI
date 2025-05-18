/**
 * Ultra-simple TrialSage Server
 * Bare minimum server with no problematic dependencies
 */

// Use CommonJS to avoid path-to-regexp issues
const express = require('express');
const path = require('path');
const fs = require('fs');

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
          <p>The simplified server is running correctly!</p>
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

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`TrialSage simple server running on port ${PORT}`);
  console.log(`Available at http://localhost:${PORT}/`);
});