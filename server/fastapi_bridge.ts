/**
 * Simplified FastAPI Bridge (No External Dependencies)
 * 
 * A simplified version of the FastAPI bridge that doesn't rely on external
 * dependencies like http-proxy-middleware. It uses the native http module
 * to proxy requests to the FastAPI backend.
 */

import express from 'express';
import http from 'http';
import { URL } from 'url';

/**
 * Register FastAPI proxy middleware with an Express app
 * @param {express.Application} app - Express application instance
 * @returns {void}
 */
export default function registerFastapiProxy(app: express.Application): void {
  const apiPort = process.env.PORT || 8000;
  const apiHost = 'localhost';
  const target = `http://${apiHost}:${apiPort}`;
  
  console.log(`Setting up FastAPI proxy to ${target}`);
  
  // Create a middleware to proxy HTTP requests
  app.use(['/api', '/ws'], (req, res, next) => {
    // Skip non-FastAPI routes
    if (!req.url || (!req.url.startsWith('/api') && !req.url.startsWith('/ws'))) {
      return next();
    }
    
    let targetPath = req.url;
    
    // Path rewriting
    if (targetPath.startsWith('/api/cer')) {
      targetPath = targetPath.replace('/api/cer', '/cer');
    } else if (targetPath.startsWith('/api/validation')) {
      targetPath = targetPath.replace('/api/validation', '');
    } else if (targetPath.startsWith('/api/ind')) {
      targetPath = targetPath.replace('/api/ind', '');
    }
    
    // Create proxy request options
    const options: http.RequestOptions = {
      hostname: apiHost,
      port: apiPort,
      path: targetPath,
      method: req.method,
      headers: { ...req.headers }
    };
    
    // Remove headers that might cause issues
    delete options.headers.host;
    delete options.headers.connection;
    
    try {
      // Create the proxy request
      const proxyReq = http.request(options, (proxyRes) => {
        // Copy status code and headers to the response
        res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
        
        // Pipe the FastAPI response to our response
        proxyRes.pipe(res, { end: true });
      });
      
      // Handle proxy request errors
      proxyReq.on('error', (err) => {
        console.error('FastAPI proxy error:', err.message);
        
        if (!res.headersSent) {
          res.status(502).json({
            success: false,
            error: 'FastAPI service unreachable',
            detail: err.message
          });
        }
      });
      
      // Pipe the request body to the proxy request
      req.pipe(proxyReq, { end: true });
      
    } catch (err) {
      console.error('Failed to proxy request:', err);
      
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Proxy error',
          detail: err instanceof Error ? err.message : String(err)
        });
      }
    }
  });
  
  // Handle WebSocket upgrade events at the server level
  // This must be set up with the HTTP server instance after app.listen()
  const originalListen = app.listen;
  
  app.listen = function(...args: any[]) {
    const server = originalListen.apply(this, args);
    
    server.on('upgrade', (req, socket, head) => {
      if (!req.url || !req.url.startsWith('/ws')) return;
      
      console.log(`WebSocket upgrade request: ${req.url}`);
      
      try {
        // Parse the URL
        const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const targetPath = parsedUrl.pathname + parsedUrl.search;
        
        console.log(`Proxying WebSocket to: ${apiHost}:${apiPort}${targetPath}`);
        
        // Create headers for the upgrade request to the API server
        const headers: http.OutgoingHttpHeaders = {
          'Connection': 'Upgrade',
          'Upgrade': 'websocket',
        };
        
        // Copy all relevant headers
        Object.keys(req.headers).forEach(key => {
          const lowerKey = key.toLowerCase();
          if (lowerKey !== 'host' && lowerKey !== 'connection' && lowerKey !== 'upgrade') {
            headers[key] = req.headers[key];
          }
        });
        
        // Always include the critical WebSocket headers
        ['sec-websocket-key', 'sec-websocket-version', 'sec-websocket-protocol', 'sec-websocket-extensions']
          .forEach(key => {
            if (req.headers[key]) {
              headers[key] = req.headers[key];
            }
          });
        
        // Create the upgrade request options
        const options: http.RequestOptions = {
          hostname: apiHost,
          port: apiPort,
          path: targetPath,
          method: 'GET',
          headers
        };
        
        // Create proxy request
        const proxyReq = http.request(options);
        
        proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
          // Generate the upgrade response
          const responseHeaders = [
            'HTTP/1.1 101 Switching Protocols',
            'Connection: Upgrade',
            'Upgrade: websocket'
          ];
          
          // Include the WebSocket accept header
          if (proxyRes.headers['sec-websocket-accept']) {
            responseHeaders.push(`Sec-WebSocket-Accept: ${proxyRes.headers['sec-websocket-accept']}`);
          }
          
          // Add optional headers
          ['sec-websocket-protocol', 'sec-websocket-extensions'].forEach(key => {
            if (proxyRes.headers[key]) {
              responseHeaders.push(`${key.split('-').map(part => 
                part.charAt(0).toUpperCase() + part.slice(1)).join('-')}: ${proxyRes.headers[key]}`);
            }
          });
          
          // Send the upgrade response
          socket.write(responseHeaders.join('\r\n') + '\r\n\r\n');
          
          // Connect the sockets
          proxySocket.pipe(socket);
          socket.pipe(proxySocket);
          
          // Handle socket events
          proxySocket.on('error', (err) => {
            console.error('Proxy WebSocket error:', err.message);
            socket.end();
          });
          
          socket.on('error', (err) => {
            console.error('Client WebSocket error:', err.message);
            proxySocket.end();
          });
          
          const onClose = () => {
            proxySocket.end();
            socket.end();
          };
          
          proxySocket.on('close', onClose);
          socket.on('close', onClose);
        });
        
        proxyReq.on('error', (err) => {
          console.error('WebSocket proxy error:', err.message);
          socket.end();
        });
        
        proxyReq.end();
        
      } catch (err) {
        console.error('WebSocket proxy setup error:', err);
        socket.end();
      }
    });
    
    return server;
  };
}