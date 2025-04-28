// /server/server.js

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import projectsStatusRoutes from './routes/projectsStatus.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware for JSON
app.use(express.json());

// API Routes
app.use('/api/projects', projectsStatusRoutes);

// Serve React App
const clientBuildPath = path.join(__dirname, '../client/build');
app.use(express.static(clientBuildPath));

// React Router fallback - serve React index.html
app.get('*', (req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    res.status(404).json({ message: 'API endpoint not found' });
  } else {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});