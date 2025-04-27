const express = require('express');
const fs = require('fs');
const path = require('path');

// Create Express app
const app = express();
const PORT = 8080;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Route for the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'trialsage.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Click the "Open Website" button in Replit to view the application');
});