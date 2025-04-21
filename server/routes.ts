import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

// Basic WebSocket server implementation
export const setupRoutes = (app: express.Express) => {
  // Create an HTTP server with the Express app
  const httpServer = http.createServer(app);
  
  // Set up WebSocket server
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws',
  });
  
  // WebSocket connection handler
  wss.on('connection', (socket: WebSocket) => {
    console.log('Client connected to WebSocket');
    
    // Handle disconnection
    socket.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
    
    // Send welcome message
    socket.send(JSON.stringify({ 
      type: 'connection_established',
      message: 'Connected to TrialSage WebSocket server',
      timestamp: new Date().toISOString(),
    }));
  });
  
  // Simple API route for health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // IND Wizard API endpoints
  app.get('/api/ind/wizard/data', (req, res) => {
    // Return a mock response for IND wizard data
    res.json({
      id: "draft_ind_1",
      status: "draft",
      sections: {
        preIndData: {
          drugName: "TestDrug",
          indicationName: "TestIndication",
          sponsorInfo: "Test Pharmaceutical Company",
          indNumber: "DRAFT-001",
          targetSubmissionDate: "2025-06-30"
        },
        nonclinicalData: {
          overallNonclinicalSummary: "Comprehensive nonclinical testing demonstrates favorable safety profile",
          studies: [
            {
              id: "1",
              studyIdentifier: "TOX-001",
              studyTitle: "28-Day Repeat Dose Toxicity Study in Rats",
              studyType: "Toxicity",
              species: "Rat",
              model: "Sprague-Dawley",
              routeOfAdministration: "Oral",
              duration: "28 days",
              mainFindings: "No significant adverse effects observed up to 100mg/kg/day",
              glpCompliance: true,
              validationStatus: "validated"
            },
            {
              id: "2",
              studyIdentifier: "ADME-001",
              studyTitle: "Absorption, Distribution, Metabolism and Excretion Study in Dogs",
              studyType: "ADME",
              species: "Dog",
              model: "Beagle",
              routeOfAdministration: "Oral",
              duration: "14 days",
              mainFindings: "Good oral bioavailability, primarily hepatic metabolism",
              glpCompliance: true,
              validationStatus: "validated"
            }
          ]
        }
      },
      lastUpdated: new Date().toISOString()
    });
  });
  
  // Save endpoint for IND wizard data
  app.post('/api/ind/wizard/save', (req, res) => {
    const data = req.body;
    console.log("Saving IND Wizard data (mock):", data);
    // In a real implementation, this would save to a database
    res.json({ 
      success: true, 
      message: "Data saved successfully",
      timestamp: new Date().toISOString()
    });
  });
  
  // Mock endpoint for AI analysis
  app.post('/api/ind/wizard/ai-analysis', (req, res) => {
    const { type, contextData } = req.body;
    
    let response = {
      success: true,
      result: ""
    };
    
    // Provide appropriate mock responses based on the analysis type
    if (type === 'validation') {
      response.result = "Validation assessment: All required nonclinical studies are present for the proposed indication and phase. The toxicology studies meet regulatory expectations for duration and species selection. GLP compliance is appropriately documented.";
    } else if (type === 'gap_analysis') {
      response.result = "Gap analysis: Recommend adding a genotoxicity study (Ames test) and a safety pharmacology study focusing on cardiovascular effects to strengthen the nonclinical package.";
    } else if (type === 'study_parser') {
      response.result = JSON.stringify({
        studyIdentifier: "TOX-" + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
        studyTitle: contextData?.text?.substring(0, 50) || "Parsed Study Title",
        studyType: "Toxicity",
        species: "Rat",
        model: "Sprague-Dawley",
        routeOfAdministration: "Oral",
        duration: "28 days", 
        mainFindings: "Automatically extracted findings from text",
        glpCompliance: true
      });
    }
    
    // Add a delay to simulate AI processing
    setTimeout(() => {
      res.json(response);
    }, 1000);
  });
  
  // Return the HTTP server
  return httpServer;
};