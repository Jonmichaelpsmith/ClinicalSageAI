/**
 * Emergency Server for TrialSage Platform
 * 
 * This is a standalone Express server that serves our emergency portal
 * to allow direct access to modules when the main application is having issues.
 */
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8080;

// Serve the emergency portal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'ultra_simple_portal.html'));
});

// Serve the public directory statically
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Emergency Portal server running on port ${PORT}`);
  console.log(`Access it at: http://localhost:${PORT}`);
});