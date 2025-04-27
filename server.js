import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./'));

// Add specific routes
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'clean_landing_page.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(join(__dirname, 'login.html'));
});

app.get('/client-portal', (req, res) => {
  res.sendFile(join(__dirname, 'client-portal.html'));
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
  console.log(`Server running on port ${PORT}`);
  console.log(`Client Portal available at: http://localhost:${PORT}/client-portal`);
  console.log(`Login page available at: http://localhost:${PORT}/login`);
});