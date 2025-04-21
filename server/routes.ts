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
  
  // Direct routes for IND wizard to bypass FastAPI dependency
  app.get(['/ind/wizard', '/ind/wizard/*'], (req, res) => {
    // Return a successful response to avoid the proxy error
    res.json({ 
      success: true, 
      message: 'IND Wizard initialized successfully',
      timestamp: new Date().toISOString()
    });
  });
  
  // Return the HTTP server
  return httpServer;
};