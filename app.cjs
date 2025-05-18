// Simple express server to get basic functionality working
const express = require('express');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(express.json());
app.use(express.static('./'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple trial data endpoint
app.get('/api/trials', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        title: 'BTX-331 Phase 1 Study',
        status: 'Active',
        sponsor: 'BioTechX Pharmaceuticals',
        enrollmentTarget: 150,
        currentEnrollment: 87,
        startDate: '2025-01-15'
      },
      {
        id: 2,
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
  console.log(`Available at: http://localhost:${PORT}/`);
});