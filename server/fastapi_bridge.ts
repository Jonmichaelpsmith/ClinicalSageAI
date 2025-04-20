/**
 * Simple FastAPI Bridge
 * 
 * Uses Express routing to forward requests to the FastAPI backend.
 * This is a simplified version that doesn't require http-proxy-middleware.
 */

import express from 'express';
import http from 'http';

/**
 * Register FastAPI proxy with an Express app
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
  
  // For now, we'll handle WebSocket connections in a simplified way
  app.get('/ws-status', (req, res) => {
    res.json({ 
      status: 'ok',
      message: 'WebSocket service status endpoint'
    });
  });
}