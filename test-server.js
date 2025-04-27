const express = require('express');
const path = require('path');
const app = express();
const port = 3500;

// Serve static files
app.use(express.static(__dirname));

// Route for main application
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'trialsage.html'));
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Test server running on http://0.0.0.0:${port}`);
});
