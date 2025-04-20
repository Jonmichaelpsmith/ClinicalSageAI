/**
 * Enhanced FastAPI Bridge with WebSocket Support
 * 
 * Uses Express routing to forward requests to the FastAPI backend.
 * Includes WebSocket proxy support for real-time updates.
 */

import express from 'express';
import http from 'http';
import { Server as HttpServer } from 'http';
import WebSocket from 'ws';
import { URL } from 'url';

/**
 * Register FastAPI proxy with an Express app and set up WebSocket proxy
 * @param {express.Application} app - Express application instance
 * @returns {void}
 */
export default function registerFastapiProxy(app: express.Application): void {
  const apiPort = 8000; // FastAPI is running on port 8000
  const apiHost = 'localhost';
  
  console.log(`Setting up FastAPI proxy to http://${apiHost}:${apiPort}`);
  
  // Simple proxy middleware for API routes
  app.use('/api', (req, res) => {
    const options = {
      hostname: apiHost,
      port: apiPort,
      path: req.url.replace(/^\/api/, ''),
      method: req.method,
      headers: {
        ...req.headers,
        host: `${apiHost}:${apiPort}`
      }
    };
    
    console.log(`Proxying ${req.method} ${req.url} to FastAPI`);
    
    const proxyReq = http.request(options, (proxyRes) => {
      res.statusCode = proxyRes.statusCode || 500;
      
      // Copy headers from the FastAPI response
      Object.keys(proxyRes.headers).forEach((key) => {
        res.setHeader(key, proxyRes.headers[key] || '');
      });
      
      // Pipe the response from FastAPI to the client
      proxyRes.pipe(res);
    });
    
    // Handle proxy request errors
    proxyReq.on('error', (err) => {
      console.error('API Proxy Error:', err);
      if (!res.headersSent) {
        res.status(502).json({
          success: false,
          error: 'FastAPI service unreachable',
          detail: err.message
        });
      }
    });
    
    // Pipe the request body from the client to FastAPI
    req.pipe(proxyReq);
  });
  
  // WebSocket status check endpoint
  app.get('/ws-status', (req, res) => {
    res.json({ 
      status: 'ok',
      message: 'WebSocket proxy service is running'
    });
  });
  
  // Function to set up WebSocket proxy
  app.wsPatch = (httpServer: HttpServer) => {
    // Create a WebSocket server for the '/ws' route
    const wsServer = new WebSocket.Server({ 
      noServer: true, 
      path: '/ws',
    });
    
    console.log('Setting up WebSocket proxy server on /ws path');
    
    // Handle HTTP server upgrade events for WebSocket connections
    httpServer.on('upgrade', (request, socket, head) => {
      const pathname = new URL(request.url as string, 
        `http://${request.headers.host || 'localhost'}`).pathname;
      
      // Only handle upgrades on our WebSocket path
      if (pathname.startsWith('/ws')) {
        console.log(`WebSocket connection requested on ${pathname}`);
        
        wsServer.handleUpgrade(request, socket, head, (ws) => {
          // Create a connection to the FastAPI WebSocket server
          const fastApiWs = new WebSocket(`ws://${apiHost}:${apiPort}${pathname}`);
          
          console.log(`Proxying WebSocket connection to ws://${apiHost}:${apiPort}${pathname}`);
          
          // Handle FastAPI WebSocket connection
          fastApiWs.on('open', () => {
            console.log('Connected to FastAPI WebSocket server');
            
            // Forward messages from client to FastAPI
            ws.on('message', (message) => {
              console.log('Forwarding client message to FastAPI');
              fastApiWs.send(message.toString());
            });
            
            // Forward messages from FastAPI to client
            fastApiWs.on('message', (message) => {
              console.log('Forwarding FastAPI message to client');
              ws.send(message.toString());
            });
            
            // Handle client close
            ws.on('close', () => {
              console.log('Client disconnected from WebSocket');
              fastApiWs.close();
            });
            
            // Handle FastAPI close
            fastApiWs.on('close', () => {
              console.log('FastAPI WebSocket connection closed');
              ws.close();
            });
            
            // Handle errors
            ws.on('error', (err) => {
              console.error('Client WebSocket error:', err);
              fastApiWs.close();
            });
            
            fastApiWs.on('error', (err) => {
              console.error('FastAPI WebSocket error:', err);
              ws.close();
            });
            
            // Emit connection event
            wsServer.emit('connection', ws, request);
            console.log('Client connected to WebSocket');
          });
          
          // Handle connection errors
          fastApiWs.on('error', (err) => {
            console.error('Error connecting to FastAPI WebSocket:', err);
            ws.close();
          });
        });
      }
    });
  };
}