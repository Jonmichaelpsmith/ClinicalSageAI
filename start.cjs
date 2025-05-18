// Minimal Express server for TrialSage (CommonJS version)
const express = require('express');
const app = express();
const PORT = 3000;

// Basic middleware
app.use(express.json());
app.use(express.static('./public'));

// Import your direct API routes
const directApiRoutes = require('./server/direct-api');
app.use('/api', directApiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`TrialSage running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}/`);
});