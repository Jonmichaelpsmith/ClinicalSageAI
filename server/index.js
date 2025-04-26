/**
 * TrialSage Server
 * 
 * This is the main entry point for the TrialSage server,
 * which provides comprehensive FDA 21 CFR Part 11 compliance
 * for regulatory submissions.
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { registerRoutes } = require('./routes');
const path = require('path');

// Create Express app
const app = express();

// Add middleware
app.use(cors());
app.use(bodyParser.json());

// Register routes
const httpServer = registerRoutes(app);

// Serve static files from the client build directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Set up port
const PORT = process.env.PORT || 5000;

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`FDA 21 CFR Part 11 compliance services initialized`);
});

// Handle unhandled exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled promise rejection:', reason);
});

module.exports = app;