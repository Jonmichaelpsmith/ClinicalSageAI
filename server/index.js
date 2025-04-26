/**
 * TrialSage Server
 * 
 * Main entry point for the TrialSage backend server.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const vaultAssistantRoutes = require('./routes/vault-assistant');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api/vault-assistant', vaultAssistantRoutes);

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;