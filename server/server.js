// /server/server.js

const express = require('express');
const path = require('path');
const app = express();

// Import API Routes
const projectsStatusRoutes = require('./routes/projectsStatus');
// (Later you will import other routes like nextActionsRoutes, vaultRoutes, etc.)

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