/**
 * TrialSage Enhanced Server
 * A server with enhanced features and proper error handling
 */

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

// API endpoint for trials data
app.get('/api/trials', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        title: 'BTX-331 Phase 1 Study',
        status: 'Active',
        enrollmentTarget: 150,
        currentEnrollment: 87,
        startDate: '2025-01-15',
        primaryCompletion: '2025-08-30',
        sponsor: 'BioTechX Pharmaceuticals'
      },
      {
        id: 2,
        title: 'CIR-507 Treatment Efficacy Trial',
        status: 'Recruiting',
        enrollmentTarget: 200,
        currentEnrollment: 45,
        startDate: '2025-03-10',
        primaryCompletion: '2025-12-15',
        sponsor: 'CircadiaBio Inc.'
      },
      {
        id: 3,
        title: 'NVR-221 Safety Evaluation',
        status: 'Active',
        enrollmentTarget: 120,
        currentEnrollment: 98,
        startDate: '2025-03-28',
        primaryCompletion: '2025-09-15',
        sponsor: 'Novara Therapeutics'
      }
    ]
  });
});

// API endpoint for documents
app.get('/api/documents', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: 'BTX-331 Protocol Amendment',
        type: 'Protocol',
        uploadedAt: '2025-05-16T10:23:45Z',
        uploadedBy: 'Sarah Johnson',
        version: '2.1',
        status: 'Pending Approval'
      },
      {
        id: 2,
        name: 'CIR-507 Investigator Brochure',
        type: 'Brochure',
        uploadedAt: '2025-05-14T15:12:30Z',
        uploadedBy: 'Mark Wilson',
        version: '1.0',
        status: 'Approved'
      },
      {
        id: 3,
        name: 'NVR-221 Interim Analysis',
        type: 'Report',
        uploadedAt: '2025-05-10T09:45:18Z',
        uploadedBy: 'Emily Chen',
        version: '1.0',
        status: 'Approved'
      },
      {
        id: 4,
        name: 'BTX-331 Safety Report',
        type: 'Report',
        uploadedAt: '2025-05-08T11:30:00Z',
        uploadedBy: 'David Lee',
        version: '1.1',
        status: 'Approved'
      }
    ]
  });
});

// Home page
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>TrialSage Platform</title>
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; color: #333; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          header { background-color: #fff; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); padding: 15px 0; }
          .header-content { display: flex; justify-content: space-between; align-items: center; padding: 0 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
          .nav { display: flex; gap: 20px; }
          .nav a { text-decoration: none; color: #1e293b; font-weight: 500; }
          .nav a:hover { color: #2563eb; }
          .card { background-color: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); padding: 20px; margin-bottom: 20px; }
          h1, h2 { color: #1e293b; }
          .btn { background-color: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; text-decoration: none; display: inline-block; }
          .btn:hover { background-color: #1d4ed8; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #64748b; }
        </style>
      </head>
      <body>
        <header>
          <div class="header-content">
            <div class="logo">TrialSage™</div>
            <div class="nav">
              <a href="/">Home</a>
              <a href="/client-portal">Client Portal</a>
              <a href="/api/trials">API</a>
            </div>
          </div>
        </header>
        
        <div class="container">
          <div class="card">
            <h1>Welcome to TrialSage Platform</h1>
            <p>TrialSage is an advanced AI-powered regulatory document management platform designed to streamline clinical research and medical device submission processes through intelligent automation.</p>
            <a href="/client-portal" class="btn">View Client Portal</a>
          </div>
          
          <div class="card">
            <h2>Server Status</h2>
            <p>The server is running correctly!</p>
            <button class="btn" onclick="checkHealth()">Check Health Status</button>
            <div id="health-status"></div>
          </div>
          
          <div class="card">
            <h2>Available APIs</h2>
            <ul>
              <li><a href="/api/health">/api/health</a> - Check server health status</li>
              <li><a href="/api/trials">/api/trials</a> - Get trial data</li>
              <li><a href="/api/documents">/api/documents</a> - Get document data</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>© 2025 TrialSage, Inc. All rights reserved.</p>
          </div>
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

// Serve client portal page
app.get('/client-portal', (req, res) => {
  const clientPortalPath = path.join(__dirname, 'client-portal.html');
  if (fs.existsSync(clientPortalPath)) {
    res.sendFile(clientPortalPath);
  } else {
    res.redirect('/');
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Server error occurred',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`TrialSage enhanced server running on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  - Main page: http://localhost:${PORT}/`);
  console.log(`  - Client Portal: http://localhost:${PORT}/client-portal`);
  console.log(`  - API Health: http://localhost:${PORT}/api/health`);
  console.log(`  - API Trials: http://localhost:${PORT}/api/trials`);
  console.log(`  - API Documents: http://localhost:${PORT}/api/documents`);
});