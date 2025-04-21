/**
 * Server routes for TrialSage API
 * Includes WebSocket endpoints for real-time updates and notifications
 */
import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { storage } from './storage';
import { insertUserSchema } from '@shared/schema';
import { URL } from 'url';
import openaiService from './services/openaiService';
import { AiRecommendationService } from './services/aiRecommendationService';

// Extend Express types
declare module 'express' {
  interface Express {
    wsPatch?: (httpServer: http.Server) => void;
  }
}

// Extend http.Server with WebSocket broadcast capability
interface ServerWithBroadcaster extends http.Server {
  broadcastQcUpdate: (data: any) => void;
}

export const setupRoutes = (app: express.Express) => {
  // Create an HTTP server with the Express app
  const httpServer = http.createServer(app);
  
  // Initialize variables that will be conditionally set based on available functionality
  let wss: WebSocketServer | undefined;
  let clients: Map<WebSocket, string> = new Map();
  
  // Set up WebSocket server on a specific path that won't conflict with Vite HMR
  // This is critical for Replit compatibility
  console.log('Setting up dedicated WebSocket server for QC updates');
  wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws/qc',
    // Important: For Replit, handle upgrades correctly
    handleProtocols: (protocols) => {
      // Accept the first protocol offered or use 'trialsage-qc-protocol'
      return protocols[0] || 'trialsage-qc-protocol';
    }
  });
  
  // Create a health check interval for the WebSocket server
  const wsHealthCheckInterval = setInterval(() => {
    if (wss && wss.clients.size > 0) {
      console.log(`WebSocket server health: ${wss.clients.size} active connections`);
    }
  }, 60000); // Check every minute
  
  // Debug endpoint to verify WebSocket server status
  app.get('/ws/status', (req, res) => {
    if (wss) {
      res.json({
        status: 'running',
        activeConnections: wss.clients.size,
        path: '/ws/qc',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not_running',
        error: 'WebSocket server not initialized',
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // WebSocket connection handler
  wss.on('connection', (socket: WebSocket, request) => {
    // Get client information for better debugging
    const clientIp = request.socket.remoteAddress || 'unknown';
    const clientUrl = request.url || '/ws/qc';
    const connectionId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    
    console.log(`Client ${connectionId} connected from ${clientIp} to ${clientUrl}`);
    
    let clientRegion = 'FDA'; // Default region
    
    try {
      // Try to parse region from URL if provided
      const url = new URL(clientUrl, 'http://localhost');
      const regionParam = url.searchParams.get('region');
      if (regionParam) {
        clientRegion = regionParam;
        console.log(`Client ${connectionId} region from URL: ${clientRegion}`);
        // Add to region-specific clients map
        clients.set(socket, clientRegion);
      }
    } catch (e) {
      // URL parsing failed, use default region
      console.warn(`Failed to parse client URL: ${e.message}`);
    }
    
    // Setup keepalive ping interval (30 seconds) to prevent Replit from closing idle connections
    // Replit closes connections after 60s of inactivity
    const pingInterval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        // Use a binary ping for efficiency (less bandwidth than JSON)
        socket.ping();
        
        // Also send a structured ping message that the client can process
        try {
          socket.send(JSON.stringify({ 
            type: 'ping',
            connection_id: connectionId,
            timestamp: new Date().toISOString()
          }));
        } catch (error) {
          console.error(`Error sending ping to client ${connectionId}:`, error);
        }
      }
    }, 30000);
    
    // Handle incoming messages (like subscribe/unsubscribe)
    socket.on('message', (message: WebSocket.Data) => {
      try {
        // Handle binary messages (rare)
        if (message instanceof Buffer) {
          console.log(`Received binary message from client ${connectionId}, length: ${message.length} bytes`);
          return;
        }
        
        const data = JSON.parse(message.toString());
        
        // Handle ping/pong messages
        if (data.type === 'pong') {
          // No need to log every pong for normal operation
          return;
        }
        
        // Log message type for debugging
        console.log(`Received message type ${data.type || 'unknown'} from client ${connectionId}`);
        
        // Handle subscription requests
        if (data.action === 'subscribe' && data.region) {
          clientRegion = data.region;
          console.log(`Client ${connectionId} subscribed to ${clientRegion} updates`);
          
          // Store client with region for targeted updates
          clients.set(socket, clientRegion);
          
          // Acknowledge subscription with connection details
          try {
            socket.send(JSON.stringify({
              type: 'subscription_ack',
              connection_id: connectionId,
              region: clientRegion,
              timestamp: new Date().toISOString()
            }));
          } catch (error) {
            console.error(`Error sending subscription ack to client ${connectionId}:`, error);
          }
        }
        
        // Handle QC trigger requests directly
        if (data.action === 'trigger_qc' && data.document_id) {
          // In a production app, this would trigger the actual QC process
          // For now, emit a successful QC event back
          setTimeout(() => {
            try {
              if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                  type: 'qc_update',
                  document_id: data.document_id,
                  status: 'completed',
                  result: 'passed',
                  timestamp: new Date().toISOString()
                }));
              }
            } catch (error) {
              console.error(`Error sending QC update to client ${connectionId}:`, error);
            }
          }, 1500);
        }
      } catch (err) {
        console.error(`Error processing WebSocket message from client ${connectionId}:`, err);
      }
    });
    
    // Handle pong responses to our pings
    socket.on('pong', () => {
      // Connection is still alive, no action needed
    });
    
    // Handle disconnection
    socket.on('close', (code, reason) => {
      console.log(`Client ${connectionId} disconnected, code: ${code}, reason: ${reason || 'unknown'}`);
      clients.delete(socket);
      clearInterval(pingInterval); // Clean up ping interval
    });
    
    // Handle errors
    socket.on('error', (error) => {
      console.error(`WebSocket error for client ${connectionId}:`, error);
      clients.delete(socket);
      clearInterval(pingInterval); // Clean up ping interval
      
      // Try to close the socket if still open
      try {
        if (socket.readyState === WebSocket.OPEN) {
          socket.terminate();
        }
      } catch (closeErr) {
        // Ignore errors during forced close
      }
    });
    
    // Send initial connection message with ID for client tracking
    try {
      socket.send(JSON.stringify({ 
        type: 'connection_established',
        connection_id: connectionId,
        timestamp: new Date().toISOString(),
        region: clientRegion
      }));
    } catch (error) {
      console.error(`Error sending initial message to client ${connectionId}:`, error);
    }
  });
  
  // Create an endpoint for receiving events from Python backend
  app.post('/internal-events', express.json(), (req, res) => {
    const { event, data } = req.body;
    
    // Only process these events if we have our own WebSocket server
    if (wss) {
      // Handle different event types
      if (event === 'qc_status') {
        // Broadcast to all connected clients
        let sentCount = 0;
        wss.clients.forEach((client: WebSocket) => {
          if (client.readyState === WebSocket.OPEN) {
            try {
              client.send(JSON.stringify({
                type: 'qc_status',
                ...data,
                timestamp: new Date().toISOString()
              }));
              sentCount++;
            } catch (error) {
              console.error('Error sending QC status update:', error);
            }
          }
        });
        console.log(`Broadcast QC status to ${sentCount} clients`);
      } 
      else if (event === 'bulk_qc_summary') {
        const region = data.region || 'FDA';
        
        // Send to clients subscribed to this region
        let sentCount = 0;
        clients.forEach((clientRegion: string, client: WebSocket) => {
          if (client.readyState === WebSocket.OPEN && clientRegion === region) {
            try {
              client.send(JSON.stringify({
                type: 'bulk_qc_summary',
                ...data,
                timestamp: new Date().toISOString()
              }));
              sentCount++;
            } catch (error) {
              console.error('Error sending bulk QC summary:', error);
            }
          }
        });
        console.log(`Sent bulk QC summary to ${sentCount} clients for region ${region}`);
      }
      else if (event === 'bulk_qc_error') {
        const region = data.region || 'FDA';
        
        // Send to clients subscribed to this region
        let sentCount = 0;
        clients.forEach((clientRegion: string, client: WebSocket) => {
          if (client.readyState === WebSocket.OPEN && clientRegion === region) {
            try {
              client.send(JSON.stringify({
                type: 'bulk_qc_error',
                ...data,
                timestamp: new Date().toISOString()
              }));
              sentCount++;
            } catch (error) {
              console.error('Error sending bulk QC error:', error);
            }
          }
        });
        console.log(`Sent bulk QC error to ${sentCount} clients for region ${region}`);
      }
    }
    
    // Respond to the event
    res.status(200).json({ 
      success: true,
      processed: Boolean(wss),
      clientCount: wss ? wss.clients.size : 0
    });
  });

  // Special route handler for builder page with direct routing to the frontend
  app.get('/builder', (req, res) => {
    res.redirect('/');
  });
  
  // Direct health check endpoint that won't go through proxy
  app.get('/status/system', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        express: 'running',
        websocket: wss ? 'running' : 'not detected',
        websocketClients: wss ? wss.clients.size : 0
      }
    });
  });
  
  // API routes
  app.get('/api/users/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  });

  app.post('/api/users', async (req, res) => {
    const parseResult = insertUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error });
    }

    const user = await storage.createUser(parseResult.data);
    res.status(201).json(user);
  });

  // AI Co-pilot endpoint
  app.post('/api/cer/ai-copilot', async (req, res) => {
    try {
      const { message, history } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ 
          error: 'OpenAI API integration is not configured', 
          details: 'The OPENAI_API_KEY environment variable is not set' 
        });
      }

      // Generate response from OpenAI
      const response = await openaiService.generateCopilotResponse(message, history || []);
      
      res.json({ response });
    } catch (error) {
      console.error('Error in AI Co-pilot endpoint:', error);
      res.status(500).json({ 
        error: 'Failed to generate AI response',
        details: error.message
      });
    }
  });

  // CER generation endpoint
  app.post('/api/cer/generate', async (req, res) => {
    try {
      const { productName, productType, regulatoryRegion, safetyData } = req.body;
      
      if (!productName || !productType || !regulatoryRegion || !safetyData) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ 
          error: 'OpenAI API integration is not configured', 
          details: 'The OPENAI_API_KEY environment variable is not set' 
        });
      }

      // Generate CER content from OpenAI
      const content = await openaiService.generateCERContent(
        productName,
        productType,
        regulatoryRegion,
        safetyData
      );
      
      res.json({ content });
    } catch (error) {
      console.error('Error in CER generation endpoint:', error);
      res.status(500).json({ 
        error: 'Failed to generate CER content',
        details: error.message
      });
    }
  });
  
  // Initialize the AI recommendation service
  const aiRecommendationService = new AiRecommendationService();
  
  // AI insights endpoint - generate insights for a user
  app.get('/api/learning/insights/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ 
          error: 'OpenAI API integration is not configured', 
          details: 'The OPENAI_API_KEY environment variable is not set' 
        });
      }

      // Get existing insights from the database
      const existingInsights = await storage.getAiInsightsByUserId(userId);
      
      // Only generate new insights if we don't have any recent ones
      // (In a real app, we might have a more sophisticated caching strategy)
      if (existingInsights.length === 0) {
        const insights = await aiRecommendationService.generateAiInsights(userId);
        
        // Store each insight in the database
        for (const insight of insights) {
          await storage.createAiInsight(insight);
        }
        
        // Fetch the complete insights with all fields
        const freshInsights = await storage.getAiInsightsByUserId(userId);
        res.json(freshInsights);
      } else {
        res.json(existingInsights);
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
      res.status(500).json({ 
        error: 'Failed to generate AI insights',
        details: error.message
      });
    }
  });
  
  // Learning path endpoint - get personalized learning path
  app.get('/api/learning/path/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ 
          error: 'OpenAI API integration is not configured', 
          details: 'The OPENAI_API_KEY environment variable is not set' 
        });
      }

      const learningPath = await aiRecommendationService.generatePersonalizedLearningPath(userId);
      res.json(learningPath);
    } catch (error) {
      console.error('Error generating learning path:', error);
      res.status(500).json({ 
        error: 'Failed to generate learning path',
        details: error.message
      });
    }
  });
  
  // Module recommendations - get recommended modules with relevance scores
  app.get('/api/learning/recommended-modules/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ 
          error: 'OpenAI API integration is not configured', 
          details: 'The OPENAI_API_KEY environment variable is not set' 
        });
      }

      // Get all modules first
      const modules = await storage.getLearningModules();
      
      // Score them with the AI service
      const scoredModules = await aiRecommendationService.scoreModuleRelevanceWithAI(userId, modules);
      
      // Sort by relevance score
      const sortedModules = scoredModules.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      res.json(sortedModules);
    } catch (error) {
      console.error('Error getting recommended modules:', error);
      res.status(500).json({ 
        error: 'Failed to get recommended modules',
        details: error.message
      });
    }
  });
  
  // User learning progress tracking
  app.post('/api/learning/progress', async (req, res) => {
    try {
      const { userId, moduleId, templateId, progress, completed } = req.body;
      
      if (!userId || (!moduleId && !templateId)) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      // Update progress in database
      const updatedProgress = await storage.createOrUpdateUserProgress({
        userId,
        moduleId,
        templateId,
        progress,
        completed,
        lastAccessed: new Date(),
        completedAt: completed ? new Date() : null
      });
      
      // If progress is complete, log this activity with more emphasis
      if (completed) {
        await storage.logUserActivity({
          userId,
          activityType: moduleId ? 'module_completion' : 'template_completion',
          resourceId: moduleId || templateId,
          action: 'completed',
          timestamp: new Date(),
          metadata: { progress: 100 }
        });
        
        // Also update user metrics
        const metrics = await storage.getUserMetrics(userId);
        if (metrics) {
          if (moduleId) {
            await storage.createOrUpdateUserMetrics(userId, {
              modulesCompleted: (metrics.modulesCompleted || 0) + 1
            });
          } else if (templateId) {
            await storage.createOrUpdateUserMetrics(userId, {
              templatesCompleted: (metrics.templatesCompleted || 0) + 1
            });
          }
        }
      } else {
        // Log regular progress activity
        await storage.logUserActivity({
          userId,
          activityType: moduleId ? 'module_progress' : 'template_progress',
          resourceId: moduleId || templateId,
          action: 'updated',
          timestamp: new Date(),
          metadata: { progress }
        });
      }
      
      res.json(updatedProgress);
    } catch (error) {
      console.error('Error updating learning progress:', error);
      res.status(500).json({ 
        error: 'Failed to update learning progress',
        details: error.message
      });
    }
  });
  
  // Log user activity
  app.post('/api/user/activity', async (req, res) => {
    try {
      const { userId, activityType, resourceId, action, metadata } = req.body;
      
      if (!userId || !activityType || !action) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      // Log the activity
      const activity = await storage.logUserActivity({
        userId,
        activityType,
        resourceId,
        action, 
        timestamp: new Date(),
        metadata: metadata || {}
      });
      
      res.json(activity);
    } catch (error) {
      console.error('Error logging user activity:', error);
      res.status(500).json({ 
        error: 'Failed to log user activity',
        details: error.message
      });
    }
  });
  
  // Mark insight as read
  app.patch('/api/learning/insights/:insightId/read', async (req, res) => {
    try {
      const insightId = parseInt(req.params.insightId);
      
      if (isNaN(insightId)) {
        return res.status(400).json({ error: 'Invalid insight ID' });
      }

      const updatedInsight = await storage.markInsightAsRead(insightId);
      res.json(updatedInsight);
    } catch (error) {
      console.error('Error marking insight as read:', error);
      res.status(500).json({ 
        error: 'Failed to mark insight as read',
        details: error.message
      });
    }
  });
  
  // Save or unsave insight
  app.patch('/api/learning/insights/:insightId/save', async (req, res) => {
    try {
      const insightId = parseInt(req.params.insightId);
      const { save } = req.body;
      
      if (isNaN(insightId) || save === undefined) {
        return res.status(400).json({ error: 'Invalid parameters' });
      }

      const updatedInsight = await storage.saveOrUnsaveInsight(insightId, save);
      res.json(updatedInsight);
    } catch (error) {
      console.error('Error saving/unsaving insight:', error);
      res.status(500).json({ 
        error: 'Failed to save/unsave insight',
        details: error.message
      });
    }
  });

  // Extend the HTTP server with a method to broadcast QC updates
  const serverWithBroadcaster = Object.assign(httpServer, {
    broadcastQcUpdate: (data: any) => {
      if (wss) {
        const enhancedData = {
          ...data,
          timestamp: new Date().toISOString()
        };
        
        let sentCount = 0;
        wss.clients.forEach((client: WebSocket) => {
          if (client.readyState === WebSocket.OPEN) {
            try {
              client.send(JSON.stringify(enhancedData));
              sentCount++;
            } catch (error) {
              console.error('Error broadcasting QC update:', error);
            }
          }
        });
        
        console.log(`Broadcast QC update to ${sentCount} clients`);
      }
    }
  }) as ServerWithBroadcaster;
  
  // Handle server shutdown to clean up WebSocket resources
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, cleaning up WebSocket server');
    
    // Clear the health check interval
    clearInterval(wsHealthCheckInterval);
    
    if (wss) {
      wss.clients.forEach((client) => {
        try {
          client.terminate();
        } catch (e) {
          // Ignore errors during shutdown
        }
      });
      
      wss.close();
    }
  });
  
  // Return the extended HTTP server
  return serverWithBroadcaster;
};