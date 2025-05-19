import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

// Serve static files
app.use(express.static('./'));

// Main landing page route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'new_landing_page.html'));
});

// Client portal route
app.get('/client-portal', (req, res) => {
  res.sendFile(path.join(__dirname, 'client-portal.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`TrialSage server running on port ${PORT}`);
  console.log(`Visit: http://0.0.0.0:${PORT}/`);
});