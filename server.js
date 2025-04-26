const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('./'));

// Add specific routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'clean_landing_page.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/client-portal', (req, res) => {
  res.sendFile(path.join(__dirname, 'client-portal.html'));
});

// Handle 404s
app.use((req, res) => {
  res.status(404).send('Page not found');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});