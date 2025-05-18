// Simple Express server for your existing application
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const PORT = 3000;

// Basic middleware
app.use(express.json());
app.use(express.static('./public'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString()
  });
});

// API endpoints from your original application
app.get('/api/trials', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'CT001',
        title: 'BTX-331 Phase 1 Safety Study',
        status: 'Active',
        sponsor: 'BioTechX Pharmaceuticals',
        enrollmentTarget: 150,
        currentEnrollment: 87,
        startDate: '2025-01-15'
      },
      {
        id: 'CT002',
        title: 'CIR-507 Treatment Efficacy Trial',
        status: 'Recruiting',
        sponsor: 'CircadiaBio Inc.',
        enrollmentTarget: 200,
        currentEnrollment: 45,
        startDate: '2025-03-10'
      }
    ]
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});