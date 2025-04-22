import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import preIndRoutes from './routes/preIndRoutes';
import nonclinicalRoutes from './routes/nonclinicalRoutes';
import docuShareRoutes from './routes/docushare.js';
// Import CER routes - work around ESM/CommonJS conflicts
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const apiRouter = require('./api');

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
  
  // Mount DocuShare routes
  app.use('/api', docuShareRoutes);
  
  // Mount the CER API routes
  app.use('/api', apiRouter);
  
  // v11.1 feature endpoints
  
  // Monte Carlo predictor API endpoint
  app.post('/api/predictor/monte-carlo', (req, res) => {
    const { studyData, iterations, confidenceLevel } = req.body;
    
    if (!studyData || !iterations) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }
    
    try {
      // Try to import the Monte Carlo prediction service dynamically
      const monteCarloService = require('./services/aiPredict.js');
      
      if (monteCarloService && typeof monteCarloService.runMonteCarloPrediction === 'function') {
        // Use the service if available
        monteCarloService.runMonteCarloPrediction(studyData, iterations, confidenceLevel)
          .then(result => {
            res.json({
              success: true,
              result
            });
          })
          .catch(error => {
            console.error('Monte Carlo prediction error:', error);
            res.status(500).json({
              success: false,
              message: 'Error running Monte Carlo prediction',
              error: error.message
            });
          });
      } else {
        // Fallback response with indication of missing implementation
        res.json({
          success: true,
          result: {
            message: 'Monte Carlo prediction service not fully implemented',
            fallbackPrediction: {
              median: parseInt(iterations) * 0.65, // Simple deterministic fallback
              confidenceInterval: [
                parseInt(iterations) * 0.45,
                parseInt(iterations) * 0.85
              ],
              probabilityOfSuccess: 0.65,
              studyCompletion: {
                estimatedDays: 120
              }
            }
          }
        });
      }
    } catch (error) {
      console.warn('Monte Carlo service not available:', error.message);
      // Provide a generic response that doesn't expose the missing dependency
      res.json({
        success: true,
        result: {
          message: 'Monte Carlo prediction currently unavailable',
          status: 'unavailable'
        }
      });
    }
  });
  
  // ESG SFTP Push API endpoint
  app.post('/api/esg/push', (req, res) => {
    const { documentId, targetSystem, options } = req.body;
    
    if (!documentId || !targetSystem) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }
    
    try {
      // Try to import the ESG Push service dynamically
      const esgService = require('./services/esgPush.js');
      
      if (esgService && typeof esgService.pushToESGTarget === 'function') {
        // Use the service if available
        esgService.pushToESGTarget(documentId, targetSystem, options)
          .then(result => {
            res.json({
              success: true,
              result
            });
          })
          .catch(error => {
            console.error('ESG push error:', error);
            res.status(500).json({
              success: false,
              message: 'Error during ESG push operation',
              error: error.message
            });
          });
      } else {
        // Fallback response
        res.json({
          success: true,
          result: {
            jobId: 'mock-' + Date.now(),
            status: 'queued',
            message: 'ESG push service not fully implemented'
          }
        });
      }
    } catch (error) {
      console.warn('ESG push service not available:', error.message);
      res.json({
        success: true,
        result: {
          message: 'ESG push service currently unavailable',
          status: 'unavailable'
        }
      });
    }
  });
  
  // RegIntel feed API endpoint
  app.get('/api/regintel/feed', (req, res) => {
    try {
      // Try to import the RegIntel service dynamically
      const regIntelService = require('./services/regIntel.js');
      
      if (regIntelService && typeof regIntelService.getLatestGuidance === 'function') {
        // Use the service if available
        regIntelService.getLatestGuidance()
          .then(result => {
            res.json({
              success: true,
              results: result
            });
          })
          .catch(error => {
            console.error('RegIntel feed error:', error);
            res.status(500).json({
              success: false,
              message: 'Error fetching regulatory intelligence feed',
              error: error.message
            });
          });
      } else {
        // Fallback response with recent guidance
        res.json({
          success: true,
          results: [
            {
              id: 'reg-1',
              title: 'FDA Guidance on Clinical Trial Design for Rare Diseases',
              source: 'FDA',
              publishedDate: '2025-01-15',
              summary: 'New guidance on innovative trial designs for rare disease drug development',
              url: 'https://www.fda.gov/regulatory-information'
            },
            {
              id: 'reg-2',
              title: 'EMA Updates on Decentralized Clinical Trials',
              source: 'EMA',
              publishedDate: '2025-02-01',
              summary: 'Updated framework for implementing and conducting decentralized clinical trials in Europe',
              url: 'https://www.ema.europa.eu/en/regulatory'
            }
          ]
        });
      }
    } catch (error) {
      console.warn('RegIntel service not available:', error.message);
      res.json({
        success: true,
        results: [],
        message: 'Regulatory intelligence feed currently unavailable'
      });
    }
  });
  
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
  
  // IND Wizard 2.0 API Routes
  
  // Get KPI data
  app.get("/api/ind/kpi", (req, res) => {
    res.json({
      ready: 67,
      errors: 3,
      docs: 12
    });
  });
  
  // Get step flags (validation status for each step)
  app.get("/api/ind/flags", (req, res) => {
    res.json([false, true, false, true, false, false, true]);
  });
  
  // Get step data
  app.get("/api/ind/steps/:stepId", (req, res) => {
    const stepId = parseInt(req.params.stepId);
    let completedItems = [];
    
    switch(stepId) {
      case 0:
        completedItems = [
          "Pre-IND Meeting Request Form",
          "Initial Development Strategy"
        ];
        break;
      case 1:
        completedItems = [
          "28-Day Toxicology Study Report"
        ];
        break;
      case 2:
        completedItems = [
          "Drug Substance Specifications",
          "Stability Data Summary"
        ];
        break;
      default:
        completedItems = [];
    }
    
    res.json({
      stepId,
      completedItems,
      status: "in_progress"
    });
  });
  
  // Get documents
  app.get("/api/docs", (req, res) => {
    res.json([
      { id: 1, name: "Toxicology Study 28-Day Rat.pdf", status: "validated", module: "Nonclinical", createdAt: new Date() },
      { id: 2, name: "Phase 1 Protocol.pdf", status: "has_errors", module: "Clinical", createdAt: new Date() },
      { id: 3, name: "CMC Stability Data.pdf", status: "validated", module: "Quality", createdAt: new Date() },
      { id: 4, name: "Investigator's Brochure v2.pdf", status: "validated", module: "Clinical", createdAt: new Date() },
      { id: 5, name: "FDA Form 1571.pdf", status: "has_errors", module: "Administrative", createdAt: new Date() }
    ]);
  });
  
  // Get QC issues list
  app.get("/api/qc/list", (req, res) => {
    res.json([
      { id: 1, documentId: 2, page: 12, severity: "major", message: "Missing primary endpoint definition" },
      { id: 2, documentId: 2, page: 15, severity: "minor", message: "Inconsistent inclusion criteria numbering" },
      { id: 3, documentId: 5, page: 2, severity: "major", message: "Missing investigator credentials" }
    ]);
  });
  
  // Get AI tips
  app.get("/api/ai/tips", (req, res) => {
    const step = parseInt(req.query.step as string) || 0;
    const tipsByStep = [
      // Step 0: Initial Planning
      [
        {
          title: "Complete Pre-IND meeting request",
          description: "Submit the meeting request form at least 60 days before your desired meeting date to discuss your development plan with the FDA."
        },
        {
          title: "Prepare a target product profile (TPP)",
          description: "A well-defined TPP helps align your development program with your therapeutic goals and regulatory strategy."
        },
        {
          title: "Outline your development timeline",
          description: "Map out key milestones from pre-IND through Phase 1 to help manage resources and set realistic expectations."
        }
      ],
      // Step 1: Nonclinical Data
      [
        {
          title: "Include both GLP and non-GLP studies",
          description: "While pivotal toxicology studies should be GLP-compliant, include relevant non-GLP studies to support your overall safety assessment."
        },
        {
          title: "Address dosing rationale clearly",
          description: "Provide strong scientific justification for your first-in-human dosing based on nonclinical findings and safety margins."
        },
        {
          title: "Consider specialized studies based on indication",
          description: "For oncology products, include specialized assessments like genotoxicity or cardiac safety studies that are indication-specific."
        }
      ],
      // Step 2: CMC Data
      [
        {
          title: "Focus on batch consistency",
          description: "Demonstrate consistency between your toxicology, clinical, and stability batches with appropriate analytical testing."
        },
        {
          title: "Include stability data projections",
          description: "Provide stability data and projected shelf-life with justification based on accelerated and real-time testing."
        },
        {
          title: "Detail analytical methods validation status",
          description: "Clearly state the validation status of all analytical methods with a timeline for full validation if not yet complete."
        }
      ],
      // Step 3: Clinical Protocol
      [
        {
          title: "Define clear primary endpoints",
          description: "Ensure your primary endpoints are specific, measurable, and directly related to your study objectives."
        },
        {
          title: "Include robust safety monitoring plan",
          description: "Detail safety monitoring procedures, stopping rules, and the data monitoring committee's role if applicable."
        },
        {
          title: "Address special populations",
          description: "Clearly define inclusion/exclusion criteria with scientific rationale, especially for vulnerable populations."
        }
      ],
      // Step 4: Investigator Brochure
      [
        {
          title: "Summarize key findings concisely",
          description: "Present nonclinical and clinical data in a way that's easily understood by investigators without technical background."
        },
        {
          title: "Highlight potential risks clearly",
          description: "Include a dedicated section on potential risks to subjects with monitoring guidance for investigators."
        },
        {
          title: "Include detailed dosing instructions",
          description: "Provide clear dosing instructions, preparation details, and administration guidance for clinical sites."
        }
      ],
      // Step 5: FDA Forms
      [
        {
          title: "Double-check FDA Form 1571 completeness",
          description: "Ensure all sections are complete and consistent with your submission package, particularly the contents section."
        },
        {
          title: "Verify investigator credentials",
          description: "Confirm all Form 1572s are complete with current CV and medical licenses for each listed investigator."
        },
        {
          title: "Include comprehensive cover letter",
          description: "Your cover letter should succinctly summarize your development program and highlight any special considerations."
        }
      ],
      // Step 6: Final Assembly
      [
        {
          title: "Follow the CTD format structure",
          description: "Organize your submission according to the Common Technical Document (CTD) format for consistency with regulatory expectations."
        },
        {
          title: "Include hyperlinked table of contents",
          description: "Create a detailed, hyperlinked table of contents to help reviewers navigate your submission efficiently."
        },
        {
          title: "Run final QC check on submission",
          description: "Perform a comprehensive quality check for consistency, completeness, and formatting before final submission."
        }
      ]
    ];
    
    res.json({
      tips: tipsByStep[step] || []
    });
  });
  
  // Document upload + AI preview
  app.post("/api/ai/preview", (req, res) => {
    try {
      // In a real implementation, this would analyze the document using AI
      const { fileName } = req.body;
      
      let module = "Unknown";
      let type = "Document";
      let qcStatus = "Needs Review";
      
      if (fileName.toLowerCase().includes("tox")) {
        module = "Module 4: Nonclinical Study Reports";
        type = "Toxicology Report";
      } else if (fileName.toLowerCase().includes("protocol")) {
        module = "Module 5: Clinical Study Reports";
        type = "Clinical Protocol";
      } else if (fileName.toLowerCase().includes("cmc") || fileName.toLowerCase().includes("stabil")) {
        module = "Module 3: Quality";
        type = "CMC Report";
      } else if (fileName.toLowerCase().includes("form")) {
        module = "Module 1: Administrative Information";
        type = "FDA Form";
      }
      
      // Random QC status for demo
      qcStatus = Math.random() > 0.5 ? "Passed" : "Needs Review";
      
      res.json({
        summary: `Document appears to be a ${type.toLowerCase()} with key information highlighted in the first section.`,
        module,
        type,
        qcStatus
      });
    } catch (error) {
      console.error("AI preview error:", error);
      res.status(500).json({ error: "Failed to generate AI preview" });
    }
  });
  
  // Return the HTTP server
  return httpServer;
};