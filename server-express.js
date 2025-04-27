import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Use PORT environment variable for deployment compatibility
// Default to port 5000 for Replit workflow compatibility
const port = process.env.PORT || 5000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname)); // Serve all files in the root directory
app.use(express.json());

// Health check endpoint for deployment platforms
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Route for main application
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'enhanced_landing_page.html'));
});

// Client portal route
app.get('/client-portal', (req, res) => {
  res.sendFile(path.join(__dirname, 'enhanced_study_modules.html'));
});

// Admin portal route
app.get('/admin-portal', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-portal.html'));
});

// Drug development lifecycle route
app.get('/drug-development', (req, res) => {
  res.sendFile(path.join(__dirname, 'drug_development_lifecycle_enhanced.html'));
});

// Login API
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    res.json({ 
      success: true, 
      user: { 
        name: 'Administrator',
        role: 'admin',
        email: 'admin@trialsage.com'
      } 
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid username or password' 
    });
  }
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`TrialSage server running on http://0.0.0.0:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('Open the Webview or Open Website button in Replit to view the app');
});