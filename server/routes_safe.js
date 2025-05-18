// Safe routes configuration without path-to-regexp issues
import express from 'express';

const router = express.Router();

// Health check endpoint
router.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Trial endpoints
router.get('/api/trials', (req, res) => {
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

// CER endpoints
router.get('/api/cer/reports', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'CER001',
        deviceName: 'CardioMonitor X5',
        manufacturer: 'MedTech Innovations',
        reportDate: '2025-03-15',
        status: 'Completed',
        riskLevel: 'Moderate',
        reviewers: ['Dr. Anna Johnson', 'Dr. Michael Chen']
      },
      {
        id: 'CER002',
        deviceName: 'NeuroPace Stimulator',
        manufacturer: 'NeuroHealth Systems',
        reportDate: '2025-02-22',
        status: 'In Review',
        riskLevel: 'High',
        reviewers: ['Dr. Sarah Wilson', 'Dr. James Rodriguez']
      }
    ]
  });
});

export default router;