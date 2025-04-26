const express = require('express');
const path = require('path');
const app = express();
const PORT = 3001; // Using a different port to avoid conflicts

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

// Mock login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  // This is a mock authentication - in a real app, validate credentials against a database
  if (email && password) {
    // Successful login
    res.status(200).json({ success: true, message: 'Login successful' });
  } else {
    // Failed login
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Handle 404s
app.use((req, res) => {
  res.status(404).send('Page not found');
});

app.listen(PORT, () => {
  console.log(`Client Portal Server running on port ${PORT}`);
  console.log(`Client Portal available at: http://localhost:${PORT}/client-portal`);
  console.log(`Login page available at: http://localhost:${PORT}/login`);
});