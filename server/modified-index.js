// Modified index file to avoid path-to-regexp errors
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Create Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Import direct API routes
const directApiRoutes = require('./direct-api');

// Register direct API routes
app.use('/api', directApiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Create a simple home page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TrialSage</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        header {
          background: #2c3e50;
          color: white;
          padding: 1rem;
          text-align: center;
        }
        .content {
          padding: 20px;
        }
      </style>
    </head>
    <body>
      <header>
        <h1>TrialSage</h1>
        <p>Advanced Regulatory Document Management Platform</p>
      </header>
      <div class="container">
        <div class="content">
          <h2>Welcome to TrialSage</h2>
          <p>The AI-powered platform for clinical research and regulatory documentation.</p>
          <p>Access API endpoints at: <code>/api/health</code>, <code>/api/test</code>, etc.</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}/`);
});

// Export server for testing
module.exports = server;