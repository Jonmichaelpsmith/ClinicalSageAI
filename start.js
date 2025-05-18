// Minimal Express server for TrialSage
const express = require('express');
const app = express();
const PORT = 3000;

// Basic middleware
app.use(express.json());
app.use(express.static('./public'));

// Import your existing direct API routes
const directApiRoutes = require('./server/direct-api');
app.use('/api', directApiRoutes);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`TrialSage running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}/`);
});