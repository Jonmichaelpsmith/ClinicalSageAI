// server/routes/advisor.js

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// Log that advisor ES Module routes are being loaded
console.log('✅ Advisor ES Module routes loaded successfully');

// Define the path for storing advisor data
const metadataPath = path.join(__dirname, '../../uploads/metadata.json');

// Helper function to get readiness data
function getReadinessData() {
  try {
    // For demo purposes, create a mock readiness object
    // In a real app, this would be dynamically calculated based on actual document status
    const readiness = {
      success: true,
      readinessScore: 65,
      missingSections: [
        "CMC Stability Data",
        "Clinical Study Reports (CSR)",
        "Toxicology Reports",
        "Drug Substance Specs",
        "Drug Product Specs",
        "Pharmacology Reports",
        "Investigator Brochure Updates"
      ],
      riskLevel: "Medium",
      estimatedDelayDays: 49,
      estimatedSubmissionDate: "August 15, 2025",
      playbookUsed: "Fast IND Playbook",
      recommendations: [
        "Upload CMC Stability Data immediately.",
        "Upload Clinical Study Reports (CSR) immediately.",
        "Upload Toxicology Reports immediately.",
        "Upload Drug Substance Specs immediately.",
        "Upload Drug Product Specs immediately."
      ]
    };
    
    return readiness;
  } catch (error) {
    console.error('Error getting readiness data:', error);
    return null;
  }
}

// GET endpoint to check readiness
router.get('/check-readiness', (req, res) => {
  console.log('Processing GET /check-readiness request');
  const readiness = getReadinessData();
  
  if (readiness) {
    res.json(readiness);
  } else {
    res.status(500).json({ success: false, message: 'Failed to retrieve readiness data' });
  }
});

// POST endpoint to check readiness with parameters
router.post('/check-readiness', (req, res) => {
  console.log('Processing POST /check-readiness request with body:', req.body);
  const readiness = getReadinessData();
  
  if (readiness) {
    res.json(readiness);
  } else {
    res.status(500).json({ success: false, message: 'Failed to retrieve readiness data' });
  }
});

// Log available routes
console.log('✅ Advisor routes available:');
console.log('    - GET /check-readiness');
console.log('    - POST /check-readiness');

export default router;