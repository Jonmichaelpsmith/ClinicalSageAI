/**
 * Enhanced FastAPI Bridge with Simple Proxy and Fallback Handling
 * 
 * Uses Express routing to forward requests to the FastAPI backend.
 * Provides fallback responses when the FastAPI server is unavailable.
 */

import express from 'express';
import http from 'http';
import { Server as HttpServer } from 'http';
import { URL } from 'url';

// Extend Express Application with wsPatch method
declare module 'express' {
  interface Application {
    wsPatch?: (httpServer: HttpServer) => void;
  }
}

/**
 * Register FastAPI proxy with an Express app
 * @param {express.Application} app - Express application instance
 * @returns {void}
 */
export default function registerFastapiProxy(app: express.Application): void {
  const apiPort = 8000; // FastAPI is running on port 8000
  const apiHost = 'localhost';
  
  console.log(`Setting up FastAPI proxy to http://${apiHost}:${apiPort}`);
  
  // Fallback responses for common endpoints when FastAPI is unavailable
  const fallbackResponses: Record<string, any> = {
    '/reports/count': { count: 0, message: 'Fallback response - FastAPI unavailable' },
    '/ind/stats': { total: 0, pending: 0, approved: 0, rejected: 0, message: 'Fallback response - FastAPI unavailable' },
    '/wizard': { message: 'IND Wizard fallback - FastAPI unavailable' },
    '/wizard/nonclinical': { message: 'Nonclinical fallback - FastAPI unavailable' },
    // Add more fallbacks as needed
  };
  
  // Simple proxy middleware for API routes
  app.use(['/api', '/reports'], (req, res, next) => {
    // Simple FastAPI check for direct API routes
    if (req.originalUrl.includes('/api/ind/wizard')) {
      return next();
    }
    // Check if we have a fallback for this path
    const fullPath = req.originalUrl;
    const hasFallback = Object.keys(fallbackResponses).some(path => fullPath.includes(path));
    
    const options = {
      hostname: apiHost,
      port: apiPort,
      path: req.url,
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
        // If we have a fallback for this endpoint, use it
        for (const path in fallbackResponses) {
          if (fullPath.includes(path)) {
            console.log(`Using fallback response for ${fullPath}`);
            return res.json(fallbackResponses[path]);
          }
        }
        
        // No fallback available, return error
        res.status(502).json({
          success: false,
          error: 'FastAPI service unreachable',
          detail: err.message,
          path: fullPath
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
      message: 'WebSocket service is available through the fallback server'
    });
  });
}