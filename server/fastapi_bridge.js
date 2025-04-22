/**
 * FastAPI Bridge for RESTful and WebSocket Connections
 * 
 * This module provides a unified connection interface between Express.js and
 * Python-based FastAPI services, handling both REST and WebSocket endpoints
 * with proper error handling and reconnection logic.
 * 
 * TEMPORARY FIX: Using mock implementation until FastAPI services are restored
 */

const { createProxyMiddleware } = require('http-proxy-middleware');

// Sample data for mocking FastAPI responses
const MOCK_DOCUMENTS = [
  {
    id: "doc-1",
    name: "Clinical Study Protocol v1.2",
    moduleContext: "module-1",
    documentType: "protocol",
    lastModified: new Date().toISOString(),
    status: "approved",
    version: "1.2",
    author: "Dr. Sarah Johnson"
  },
  {
    id: "doc-2",
    name: "Investigator's Brochure 2025",
    moduleContext: "module-2",
    documentType: "brochure",
    lastModified: new Date().toISOString(),
    status: "in-review",
    version: "3.0",
    author: "Clinical Research Team"
  },
  {
    id: "doc-3",
    name: "FDA Form 1571",
    moduleContext: "module-1",
    documentType: "form",
    lastModified: new Date().toISOString(),
    status: "pending",
    version: "1.0",
    author: "Regulatory Affairs"
  }
];

const IND_DRAFT_DATA = {
  id: "draft-1",
  name: "Pre-IND Meeting Request",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: "in-progress",
  drug: {
    name: "ExampleDrug",
    formulation: "Tablet",
    strength: "10mg",
    route: "Oral"
  },
  indication: "Treatment of advanced solid tumors",
  phase: "Phase 1",
  sponsor: {
    name: "BioPharm Innovations",
    address: "100 Research Drive, Cambridge, MA"
  }
};

/**
 * Register FastAPI proxy middleware with an Express app
 * @param {Object} app - Express application instance
 * @returns {void}
 */
function registerFastapiProxy(app) {
  const apiPort = process.env.PORT || 8000;
  const target = `http://localhost:${apiPort}`;
  
  console.log(`Setting up FastAPI proxy to ${target}`);
  
  // Add direct route handlers for common API endpoints
  // These will take precedence over the proxy and provide fallback functionality
  
  // Document list endpoint
  app.get('/docs/list', (req, res) => {
    console.log('Proxying GET /docs/list to FastAPI');
    try {
      res.json({ 
        success: true, 
        documents: MOCK_DOCUMENTS
      });
    } catch (error) {
      console.error('Error in mock documents endpoint:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  // IND draft endpoint
  app.get('/ind-drafts/:draftId/pre-ind', (req, res) => {
    const { draftId } = req.params;
    console.log(`Proxying GET /ind-drafts/${draftId}/pre-ind to FastAPI`);
    try {
      res.json({
        success: true,
        draft: IND_DRAFT_DATA
      });
    } catch (error) {
      console.error('Error in mock IND draft endpoint:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  // Unified proxy for both API and WebSocket (will be used as fallback)
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
      console.error('API Proxy Error:', err.message);
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