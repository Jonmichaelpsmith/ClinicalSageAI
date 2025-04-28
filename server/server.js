// /server/server.js

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// API routes
import projectsStatusRoutes from './routes/projectsStatus.js';
// (you can import other API routes like next-actions, vault, analytics here)

app.use('/api/projects', projectsStatusRoutes);
// Example: app.use('/api/next-actions', nextActionsRoutes);

// Serve React frontend
const clientBuildPath = path.join(__dirname, '../client/build');
app.use(express.static(clientBuildPath));

// Serve index.html for all non-API requests
app.get('*', (req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    res.status(404).json({ message: 'API endpoint not found' });
  } else {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});