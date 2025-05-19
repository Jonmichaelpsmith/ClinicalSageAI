// TrialSage Server - CommonJS format
const express = require('express');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(express.json());
app.use(express.static('./public'));

// Simple middleware to log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0'
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

// CER endpoints
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
      }
    ]
  });
});

// 510k submission endpoints
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

// 510k predicate device search
app.get('/api/fda510k/predicates', (req, res) => {
  const searchTerm = req.query.search || '';
  
  const predicates = [
    {
      predicateId: 'K123456',
      kNumber: 'K123456',
      deviceName: `${searchTerm} Monitor Pro`,
      decisionDate: '2022-08-15',
      productCode: 'DPS',
      applicant: 'MedTech Inc.',
      deviceClass: 'II'
    },
    {
      predicateId: 'K789012',
      kNumber: 'K789012',
      deviceName: `CardioTech ${searchTerm} System`,
      decisionDate: '2021-04-22',
      productCode: 'DPS',
      applicant: 'CardioTech',
      deviceClass: 'II'
    }
  ];
  
  res.json({ 
    predicates,
    searchQuery: searchTerm
  });
});

// Next actions endpoint from your original code
app.get('/api/next-actions', (req, res) => {
  const actions = [
    {
      id: 1,
      title: 'Review Protocol Draft',
      description: 'Review draft protocol for BTX-331 Phase 1 study',
      dueDate: '2025-05-05',
      priority: 'high',
      status: 'pending',
      projectId: 'ind-2025-034',
      assignedTo: 'james.wilson'
    },
    {
      id: 2,
      title: 'Complete Safety Narrative',
      description: 'Finalize safety narrative for CSR section 12.3',
      dueDate: '2025-05-08',
      priority: 'medium',
      status: 'in-progress',
      projectId: 'csr-2024-089',
      assignedTo: 'emily.chen'
    },
    {
      id: 3,
      title: 'IB Risk Assessment Review',
      description: 'Review risk assessment section in Investigator\'s Brochure',
      dueDate: '2025-05-12',
      priority: 'medium',
      status: 'pending',
      projectId: 'protocol-507',
      assignedTo: 'john.davis'
    }
  ];
  
  res.json({
    success: true,
    data: actions
  });
});

// Projects endpoint from your original code
app.get('/api/projects', (req, res) => {
  const projects = [
    {
      id: 'ind-2025-034',
      name: 'BTX-331 IND Application',
      type: 'IND',
      status: 'In Progress',
      dueDate: '2025-06-15',
      progress: 65,
      client: 'Biotech Innovations'
    },
    {
      id: 'csr-2024-089',
      name: 'BX-107 Clinical Study Report',
      type: 'CSR',
      status: 'In Review',
      dueDate: '2025-05-30',
      progress: 85,
      client: 'MediPharm Solutions'
    },
    {
      id: 'protocol-507',
      name: 'CIR-507 Protocol Amendment',
      type: 'Protocol',
      status: 'Draft',
      dueDate: '2025-07-10',
      progress: 25,
      client: 'CliniRx Research'
    }
  ];
  
  res.json({
    success: true,
    data: projects
  });
});

// Create a homepage that resembles your original application
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
          padding: 0;
          color: #333;
          background-color: #f4f6f8;
        }
        
        header {
          background: linear-gradient(135deg, #2c3e50, #4a6491);
          color: white;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        h1 {
          margin-top: 0;
          font-size: 2.5rem;
          font-weight: 700;
        }
        
        .tagline {
          font-size: 1.2rem;
          opacity: 0.9;
          margin-bottom: 1rem;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .dashboard {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .card {
          background: white;
          border-radius: 10px;
          padding: 25px;
          margin-bottom: 30px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        
        .card h2 {
          margin-top: 0;
          color: #2c3e50;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 10px;
        }
        
        .stat-card {
          text-align: center;
          padding: 20px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }
        
        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          color: #3498db;
          margin: 10px 0;
        }
        
        .stat-label {
          font-size: 1rem;
          color: #7f8c8d;
        }
        
        .button {
          display: inline-block;
          background: #3498db;
          color: white;
          padding: 12px 20px;
          text-decoration: none;
          border-radius: 6px;
          margin-right: 15px;
          font-weight: 600;
          transition: background 0.3s ease;
        }
        
        .button:hover {
          background: #2980b9;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        
        th, td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
        }
        
        th {
          background-color: #f8f9fa;
          font-weight: 600;
          color: #2c3e50;
        }
        
        tr:hover {
          background-color: #f5f5f5;
        }
        
        footer {
          background: #2c3e50;
          color: white;
          text-align: center;
          padding: 2rem;
          margin-top: 2rem;
        }
      </style>
    </head>
    <body>
      <header>
        <h1>TrialSage™</h1>
        <p class="tagline">Advanced AI-powered regulatory document management platform</p>
      </header>
      
      <div class="container">
        <div class="dashboard">
          <div class="stat-card">
            <div class="stat-number">28</div>
            <div class="stat-label">Active Trials</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">12</div>
            <div class="stat-label">CER Reports</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">7</div>
            <div class="stat-label">510(k) Submissions</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">15</div>
            <div class="stat-label">Documents Pending Review</div>
          </div>
        </div>
        
        <div class="card">
          <h2>Recent Clinical Trials</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>Sponsor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>CT001</td>
                <td>BTX-331 Phase 1 Safety Study</td>
                <td>Active</td>
                <td>BioTechX Pharmaceuticals</td>
              </tr>
              <tr>
                <td>CT002</td>
                <td>CIR-507 Treatment Efficacy Trial</td>
                <td>Recruiting</td>
                <td>CircadiaBio Inc.</td>
              </tr>
              <tr>
                <td>CT003</td>
                <td>NEURO-22 Neurological Response Study</td>
                <td>Completed</td>
                <td>NeuroGenics Ltd</td>
              </tr>
            </tbody>
          </table>
          <p style="text-align: right; margin-top: 15px;">
            <a href="/api/trials" class="button">View All Trials</a>
          </p>
        </div>
        
        <div class="card">
          <h2>Recent CER Reports</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Device Name</th>
                <th>Status</th>
                <th>Report Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>CER001</td>
                <td>CardioMonitor X5</td>
                <td>Completed</td>
                <td>2025-03-15</td>
              </tr>
              <tr>
                <td>CER002</td>
                <td>NeuroPace Stimulator</td>
                <td>In Review</td>
                <td>2025-02-22</td>
              </tr>
              <tr>
                <td>CER003</td>
                <td>DiabetesAssist Pump</td>
                <td>Draft</td>
                <td>2025-04-10</td>
              </tr>
            </tbody>
          </table>
          <p style="text-align: right; margin-top: 15px;">
            <a href="/api/cer/reports" class="button">View All Reports</a>
          </p>
        </div>
        
        <div class="card">
          <h2>API Testing</h2>
          <p>The following API endpoints are available for testing:</p>
          <ul>
            <li><a href="/api/health">/api/health</a> - System health check</li>
            <li><a href="/api/trials">/api/trials</a> - List all clinical trials</li>
            <li><a href="/api/cer/reports">/api/cer/reports</a> - List Clinical Evaluation Reports</li>
            <li><a href="/api/fda510k/submissions">/api/fda510k/submissions</a> - List 510(k) submissions</li>
            <li><a href="/api/fda510k/predicates?search=cardiac">/api/fda510k/predicates?search=cardiac</a> - Search predicate devices</li>
            <li><a href="/api/next-actions">/api/next-actions</a> - Get next actions</li>
            <li><a href="/api/projects">/api/projects</a> - Get projects</li>
          </ul>
        </div>
      </div>
      
      <footer>
        <p>&copy; 2025 TrialSage - All rights reserved</p>
      </footer>
      
      <script>
        // Simple client-side script to check server health
        fetch('/api/health')
          .then(response => response.json())
          .then(data => {
            console.log('Server health:', data);
          })
          .catch(error => {
            console.error('Error checking server health:', error);
          });
      </script>
    </body>
    </html>
  `);
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`TrialSage server running on port ${PORT}`);
  console.log(`Available at: http://localhost:${PORT}/`);
});

module.exports = server;