/**
 * Server routes for TrialSage API
 * Includes WebSocket endpoints for real-time updates and notifications
 */
import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { storage } from './storage';
import { insertUserSchema } from '@shared/schema';

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
  
  // Apply the WebSocket patch from FastAPI bridge if available
  if (app.wsPatch && typeof app.wsPatch === 'function') {
    console.log('Setting up enhanced WebSocket proxy to FastAPI');
    app.wsPatch(httpServer);
  } else {
    console.log('FastAPI WebSocket proxy not available, using fallback WebSocket server');
    // Set up fallback WebSocket server for development/testing
    wss = new WebSocketServer({ server: httpServer, path: '/ws/qc' });
    
    // WebSocket connection handler
    wss.on('connection', (socket: WebSocket) => {
      console.log('Client connected to WebSocket (fallback mode)');
      let clientRegion = 'FDA'; // Default region
      
      // Handle incoming messages (like subscribe/unsubscribe)
      socket.on('message', (message: WebSocket.Data) => {
        try {
          const data = JSON.parse(message.toString());
          
          // Handle subscription requests
          if (data.action === 'subscribe' && data.region) {
            clientRegion = data.region;
            console.log(`Client subscribed to ${clientRegion} updates`);
            
            // Store client with region for targeted updates
            clients.set(socket, clientRegion);
            
            // Acknowledge subscription
            socket.send(JSON.stringify({
              type: 'subscription_ack',
              region: clientRegion
            }));
          }
        } catch (err) {
          console.error('Error processing WebSocket message:', err);
        }
      });
      
      // Handle disconnection
      socket.on('close', () => {
        console.log('Client disconnected from WebSocket');
        clients.delete(socket);
      });
      
      // Keep initial connection alive
      socket.send(JSON.stringify({ type: 'connection_established' }));
    });
  }
  
  // Create an endpoint for receiving events from Python backend
  app.post('/internal-events', express.json(), (req, res) => {
    const { event, data } = req.body;
    
    // Only process these events if we have our own WebSocket server
    if (wss) {
      // Handle different event types
      if (event === 'qc_status') {
        // Broadcast to all connected clients
        wss.clients.forEach((client: WebSocket) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'qc_status',
              ...data
            }));
          }
        });
      } 
      else if (event === 'bulk_qc_summary') {
        const region = data.region || 'FDA';
        
        // Send to clients subscribed to this region
        clients.forEach((clientRegion: string, client: WebSocket) => {
          if (client.readyState === WebSocket.OPEN && clientRegion === region) {
            client.send(JSON.stringify({
              type: 'bulk_qc_summary',
              ...data
            }));
          }
        });
      }
      else if (event === 'bulk_qc_error') {
        const region = data.region || 'FDA';
        
        // Send to clients subscribed to this region
        clients.forEach((clientRegion: string, client: WebSocket) => {
          if (client.readyState === WebSocket.OPEN && clientRegion === region) {
            client.send(JSON.stringify({
              type: 'bulk_qc_error',
              ...data
            }));
          }
        });
      }
    }
    
    // Respond to the event
    res.status(200).json({ success: true });
  });

  // Special route handler for the builder page
  app.get('/builder', (req, res) => {
    res.sendFile('builder.html', { root: './public' });
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

  // Extend the HTTP server with a method to broadcast QC updates
  const serverWithBroadcaster = Object.assign(httpServer, {
    broadcastQcUpdate: (data: any) => {
      if (wss) {
        wss.clients.forEach((client: WebSocket) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      }
    }
  }) as ServerWithBroadcaster;
  
  // Return the extended HTTP server
  return serverWithBroadcaster;
};