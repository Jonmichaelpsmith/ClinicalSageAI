const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the root directory
app.use(express.static('./'));

// Redirect root to the landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../new_landing_page.html'));
});

// Redirect /client-portal to the client portal
app.get('/client-portal', (req, res) => {
  res.sendFile(path.join(__dirname, '../client-portal.html'));
});

// For any other route, check if the file exists
app.get('*', (req, res) => {
  const filePath = path.join(__dirname, '..', req.path);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.redirect('/');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`TrialSage static server running on port ${PORT}`);
  console.log(`Landing page URL: http://0.0.0.0:${PORT}/`);
});