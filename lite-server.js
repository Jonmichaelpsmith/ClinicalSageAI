// TrialSage Lightweight Server
// This provides core functionality without path-to-regexp issues
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// List available trials
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
      },
      {
        id: 'CT003',
        title: 'NEURO-22 Neurological Response Study',
        status: 'Completed',
        sponsor: 'NeuroGenics Ltd',
        enrollmentTarget: 75,
        currentEnrollment: 75,
        startDate: '2024-11-05'
      }
    ]
  });
});

// Get trial details by ID (fixed version that avoids path-to-regexp issues)
app.get('/api/trial', (req, res) => {
  const id = req.query.id;
  
  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Missing trial ID'
    });
  }
  
  // Demo trial data
  const trialData = {
    id: id,
    title: id === 'CT001' ? 'BTX-331 Phase 1 Safety Study' : 'Trial ' + id,
    status: 'Active',
    phase: 'Phase 1',
    sponsor: 'BioTechX Pharmaceuticals',
    enrollmentTarget: 150,
    currentEnrollment: 87,
    startDate: '2025-01-15',
    completionDate: '2025-09-30',
    description: 'A randomized, double-blind, placebo-controlled study to evaluate the safety, tolerability, and pharmacokinetics of BTX-331 in healthy volunteers.',
    primaryOutcome: 'Safety and tolerability measured by adverse events',
    secondaryOutcomes: [
      'Pharmacokinetic profile',
      'Immunogenicity assessment',
      'Vital sign measurements'
    ],
    inclusionCriteria: [
      'Healthy adults aged 18-55 years',
      'BMI between 18.5-30 kg/m²',
      'No clinically significant medical history'
    ],
    exclusionCriteria: [
      'History of drug allergies',
      'Use of prescription medications within 14 days',
      'Participation in another clinical trial within 30 days'
    ],
    locations: [
      {
        name: 'Medical Research Center',
        city: 'Boston',
        state: 'MA',
        status: 'Recruiting'
      },
      {
        name: 'University Hospital',
        city: 'San Francisco',
        state: 'CA',
        status: 'Active'
      }
    ]
  };
  
  res.json({
    success: true,
    data: trialData
  });
});

// Get CER information (Clinical Evaluation Report)
app.get('/api/cer/reports', (req, res) => {
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
      },
      {
        id: 'CER003',
        deviceName: 'DiabetesAssist Pump',
        manufacturer: 'GlucoSense Medical',
        reportDate: '2025-04-10',
        status: 'Draft',
        riskLevel: 'Moderate',
        reviewers: ['Dr. Robert Thompson']
      }
    ]
  });
});

// Handle 510k submissions
app.get('/api/fda510k/submissions', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'K241234',
        deviceName: 'CardioMonitor X5',
        submissionDate: '2025-02-10',
        status: 'Under Review',
        decisionDate: null,
        productCode: 'DQA',
        applicant: 'MedTech Innovations'
      },
      {
        id: 'K235678',
        deviceName: 'OrthoScan Imaging System',
        submissionDate: '2024-11-15',
        status: 'Substantially Equivalent',
        decisionDate: '2025-03-22',
        productCode: 'LLZ',
        applicant: 'OrthoMed Devices'
      }
    ]
  });
});

// Create simple home page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TrialSage - Regulatory Platform</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        header {
          background: #2c3e50;
          color: white;
          padding: 1rem;
          text-align: center;
        }
        h1 {
          margin-top: 0;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem;
        }
        .card {
          background: #f9f9f9;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .endpoint {
          background: #eef2f7;
          padding: 10px;
          border-radius: 4px;
          font-family: monospace;
          margin: 10px 0;
        }
        .button {
          display: inline-block;
          background: #3498db;
          color: white;
          padding: 10px 15px;
          text-decoration: none;
          border-radius: 4px;
          margin-right: 10px;
        }
      </style>
    </head>
    <body>
      <header>
        <h1>TrialSage™</h1>
        <p>Advanced AI-powered regulatory document management platform</p>
      </header>
      
      <div class="container">
        <div class="card">
          <h2>About TrialSage</h2>
          <p>TrialSage is an advanced AI-powered regulatory document management platform designed to streamline clinical research and 510(k) medical device submission processes through intelligent automation and comprehensive compliance intelligence.</p>
          <p>The platform provides cutting-edge tools for medical device regulatory documentation, featuring advanced AI-driven document intelligence, robust testing infrastructure, and an adaptive workflow management system that proactively addresses complex FDA regulatory challenges.</p>
        </div>
        
        <div class="card">
          <h2>Available API Endpoints</h2>
          <p>The following API endpoints are available for testing:</p>
          
          <div class="endpoint">
            <strong>GET /api/health</strong> - System health check
          </div>
          
          <div class="endpoint">
            <strong>GET /api/trials</strong> - List all clinical trials
          </div>
          
          <div class="endpoint">
            <strong>GET /api/trial?id=CT001</strong> - Get details for a specific trial
          </div>
          
          <div class="endpoint">
            <strong>GET /api/cer/reports</strong> - List Clinical Evaluation Reports
          </div>
          
          <div class="endpoint">
            <strong>GET /api/fda510k/submissions</strong> - List 510(k) submissions
          </div>
        </div>
        
        <div class="card">
          <h2>API Testing</h2>
          <a href="/api/health" class="button">Test Health Endpoint</a>
          <a href="/api/trials" class="button">View Trials</a>
          <a href="/api/cer/reports" class="button">View CER Reports</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`TrialSage server running on port ${PORT}`);
  console.log(`Available at: http://localhost:${PORT}/`);
});