import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import preIndRoutes from './routes/preIndRoutes';
import nonclinicalRoutes from './routes/nonclinicalRoutes';

// Basic WebSocket server implementation
export const setupRoutes = (app: express.Express) => {
  // Create an HTTP server with the Express app
  const httpServer = http.createServer(app);
  
  // Set up WebSocket servers
  // Main WebSocket endpoint
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws',
  });
  
  // QC-specific WebSocket endpoint
  const qcWss = new WebSocketServer({
    server: httpServer,
    path: '/ws/qc',
  });
  
  // WebSocket connection handler implementation with added safety guards
  const setupWebSocketServer = (server: WebSocketServer, name: string) => {
    server.on('connection', (socket: WebSocket, req: http.IncomingMessage) => {
      console.log(`Client connected to ${name} WebSocket from ${req.socket.remoteAddress}`);
      
      // Properly wrap socket interactions in try/catch blocks
      try {
        // Security check - ensure the connection hasn't been closed already (might help with code 1006)
        if (socket.readyState === WebSocket.OPEN) {
          // Send welcome message
          const welcomeMsg = JSON.stringify({ 
            type: 'connection_established', 
            message: `Connected to TrialSage ${name} WebSocket server`,
            timestamp: new Date().toISOString()
          });
          
          socket.send(welcomeMsg);
          console.log(`Sent welcome message to ${name} client`);
          
          // Set up ping/pong mechanism to keep the connection alive
          const pingInterval = setInterval(() => {
            try {
              if (socket.readyState === WebSocket.OPEN) {
                socket.ping(() => {});
                console.log(`Sent ping to ${name} client`);
              } else {
                clearInterval(pingInterval);
                console.log(`Cleared ping interval for ${name} client - socket no longer open`);
              }
            } catch (pingError) {
              console.error(`Error sending ping to ${name} client:`, pingError);
              clearInterval(pingInterval);
            }
          }, 15000); // Send ping every 15 seconds
          
          // Message handler with robust error handling
          socket.on('message', (message) => {
            try {
              // First check if we need to handle a binary message
              let parsedMessage;
              if (Buffer.isBuffer(message)) {
                console.log(`Received binary message from ${name} client`);
                // Handle binary message if needed
                parsedMessage = { type: 'binary', size: message.length };
              } else {
                const rawMessage = message.toString();
                console.log(`Received text message from ${name} client: ${rawMessage}`);
                parsedMessage = JSON.parse(rawMessage);
              }
              
              // Process the message based on type
              if (parsedMessage.type === 'subscribe' && name === 'QC') {
                // Special handling for QC subscriptions
                socket.send(JSON.stringify({
                  type: 'subscription_confirmed',
                  documentIds: parsedMessage.documentIds || [],
                  timestamp: new Date().toISOString()
                }));
              } else {
                // Standard acknowledgment
                socket.send(JSON.stringify({
                  type: 'acknowledgment',
                  receivedAt: new Date().toISOString(),
                  messageType: parsedMessage.type || 'unknown'
                }));
              }
            } catch (msgError) {
              console.error(`Error processing ${name} message:`, msgError);
              // Try to send an error response to the client
              try {
                if (socket.readyState === WebSocket.OPEN) {
                  socket.send(JSON.stringify({
                    type: 'error',
                    message: 'Failed to process message',
                    timestamp: new Date().toISOString()
                  }));
                }
              } catch (responseError) {
                console.error('Failed to send error response:', responseError);
              }
            }
          });
          
          // Pong handler to respond to pings
          socket.on('pong', () => {
            console.log(`Received pong from ${name} client`);
          });
          
          // Proper cleanup on close
          socket.on('close', (code, reason) => {
            console.log(`${name} connection closed with code ${code} and reason: ${reason || 'No reason provided'}`);
            clearInterval(pingInterval);
          });
          
          // Error handler
          socket.on('error', (error) => {
            console.error(`${name} WebSocket error:`, error);
            try {
              socket.close(1011, 'Internal server error');
            } catch (closeError) {
              console.error(`Error closing ${name} socket after error:`, closeError);
            }
            clearInterval(pingInterval);
          });
        } else {
          console.warn(`${name} socket not in OPEN state on connection - immediate state: ${socket.readyState}`);
        }
      } catch (setupError) {
        console.error(`Error setting up ${name} WebSocket connection:`, setupError);
        try {
          if (socket.readyState === WebSocket.OPEN) {
            socket.close(1011, 'Connection setup failed');
          }
        } catch (closeError) {
          console.error(`Error closing ${name} socket after setup failure:`, closeError);
        }
      }
    });
    
    // Handle server-level errors
    server.on('error', (error) => {
      console.error(`${name} WebSocket server error:`, error);
    });
  };
  
  // Set up both WebSocket servers
  setupWebSocketServer(wss, 'Main');
  setupWebSocketServer(qcWss, 'QC');
  
  // Simple API route for health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // REST fallback routes for when WebSockets aren't available
  
  // Recent QC status updates
  app.get('/api/qc/recent-status', (req, res) => {
    // Mock data to simulate QC updates - in a real app, this would come from a database
    res.json([
      // Return an empty array by default - client will handle empty response
      // The WebSocket would deliver these in real-time, but this endpoint serves as a fallback
    ]);
  });
  
  // Document status check endpoint
  app.get('/api/qc/documents/status', (req, res) => {
    const documentIds = req.query.ids ? String(req.query.ids).split(',').map(id => parseInt(id, 10)) : [];
    
    if (!documentIds.length) {
      return res.status(400).json({ error: 'No document IDs provided' });
    }
    
    // Mock response with document statuses
    const statuses = documentIds.map(id => ({
      id,
      status: Math.random() > 0.8 ? 'failed' : 'passed', // Randomly generate statuses for testing
      timestamp: new Date().toISOString(),
      message: Math.random() > 0.8 ? 'Failed validation check' : undefined
    }));
    
    res.json(statuses);
  });
  
  // Mount the IND Wizard routes
  app.use('/api/ind-drafts/:draftId/pre-ind', preIndRoutes);
  app.use('/api/ind-drafts/:draftId/nonclinical', nonclinicalRoutes);
  
  // IND Wizard API endpoints (legacy - will be replaced by the mounted routes)
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
  
  // Save endpoint for IND wizard data (legacy)
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
  
  // Create IND draft endpoint
  app.post('/api/ind-drafts', (req, res) => {
    const { title, userId } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Draft title is required'
      });
    }
    
    // In a production implementation, this would create a new entry in the ind_drafts table
    // For now, return a mock success response with a generated UUID
    const draftId = 'draft-' + Math.random().toString(36).substring(2, 15);
    
    res.status(201).json({
      success: true,
      message: 'IND draft created successfully',
      data: {
        id: draftId,
        title,
        status: 'draft',
        createdAt: new Date().toISOString()
      }
    });
  });
  
  // Get all IND drafts for user
  app.get('/api/ind-drafts', (req, res) => {
    // In a production implementation, this would query the ind_drafts table for the authenticated user
    // For now, return mock data
    res.json({
      success: true,
      data: [
        {
          id: 'draft-1',
          title: 'IND Application for Drug XYZ',
          status: 'draft',
          currentStep: 'pre-ind',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-15T00:00:00.000Z'
        },
        {
          id: 'draft-2',
          title: 'Second IND Application',
          status: 'draft',
          currentStep: 'nonclinical',
          createdAt: '2025-02-01T00:00:00.000Z',
          updatedAt: '2025-02-15T00:00:00.000Z'
        }
      ]
    });
  });
  
  // Return the HTTP server
  return httpServer;
};