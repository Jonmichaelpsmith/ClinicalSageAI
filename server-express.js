import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Route for main application
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'trialsage.html'));
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
  console.log('Open the Webview or Open Website button in Replit to view the app');
});