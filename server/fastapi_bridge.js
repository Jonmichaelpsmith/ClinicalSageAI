/**
 * FastAPI Bridge for RESTful and WebSocket Connections
 * 
 * This module provides a unified connection interface between Express.js and
 * Python-based FastAPI services, handling both REST and WebSocket endpoints
 * with proper error handling and reconnection logic.
 */

const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * Register FastAPI proxy middleware with an Express app
 * @param {Object} app - Express application instance
 * @returns {void}
 */
function registerFastapiProxy(app) {
  const apiPort = process.env.PORT || 8000;
  const target = `http://localhost:${apiPort}`;
  
  console.log(`Setting up FastAPI proxy to ${target}`);
  
  // Unified proxy for both API and WebSocket
  const proxyOptions = {
    target,
    changeOrigin: true,
    ws: true, // Enable WebSocket support
    pathRewrite: {
      '^/api/cer': '/cer',      // Rewrite /api/cer to /cer
      '^/api/validation': '',   // Rewrite /api/validation to /
      '^/api/ind': '',          // Rewrite /api/ind to /
    },
    logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    onError(err, req, res) {
      // Handle regular HTTP errors
      console.error('FastAPI proxy error:', err.message);
      try {
        if (!res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: false,
            error: 'FastAPI service unreachable', 
            detail: err.message 
          }));
        }
      } catch (e) {
        console.error('Error sending error response:', e.message);
      }
    },
    onProxyReqWs(proxyReq, req, socket) {
      // Log WebSocket connections
      console.log(`WebSocket connection: ${req.url}`);
      
      // Handle WebSocket errors
      socket.on('error', (err) => {
        console.error('WebSocket error:', err.message);
      });
    }
  };
  
  // Create proxy middleware
  const proxy = createProxyMiddleware(proxyOptions);
  
  // Apply proxy to all API and WebSocket routes
  app.use(['/api', '/ws'], proxy);
  
  return proxy; // Return the proxy instance in case it's needed
}

// Export for CommonJS
module.exports = registerFastapiProxy;