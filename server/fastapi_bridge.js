/**
 * FastAPI Bridge for RESTful and WebSocket Connections
 * 
 * This module provides a robust production connection interface between Express.js 
 * and Python-based FastAPI services, handling both REST and WebSocket endpoints
 * with enterprise-grade error handling, resilience, and logging.
 */

const { createProxyMiddleware } = require('http-proxy-middleware');
const fetch = require('node-fetch');
const http = require('http');
const https = require('https');
const { URL } = require('url');

// Create optimized HTTP/HTTPS agents for connection pooling
const httpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 25,
  timeout: 60000, // 60 second timeout
});

const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 25,
  timeout: 60000, // 60 second timeout
});

/**
 * FastAPI Connection Manager with reconnection and resilience features
 */
class FastApiConnection {
  constructor() {
    this.isConnected = false;
    this.lastConnectAttempt = 0;
    this.connectRetryInterval = 30000; // 30 seconds
    this.apiPort = process.env.FASTAPI_PORT || 8000;
    this.target = `http://localhost:${this.apiPort}`;
    this.healthEndpoint = '/health';
    this.connectAttempts = 0;
    this.maxConnectAttempts = 5;
    this.connectTimeout = 5000; // 5 seconds
  }

  /**
   * Check if FastAPI service is available
   * @returns {Promise<boolean>} True if available, false otherwise
   */
  async checkAvailability() {
    // Don't retry too frequently
    const now = Date.now();
    if (now - this.lastConnectAttempt < this.connectRetryInterval && this.connectAttempts > 0) {
      return this.isConnected;
    }

    this.lastConnectAttempt = now;
    this.connectAttempts++;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.connectTimeout);

      const response = await fetch(`${this.target}${this.healthEndpoint}`, {
        method: 'GET',
        agent: (_parsedURL) => {
          return _parsedURL.protocol === 'https:' ? httpsAgent : httpAgent;
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log(`FastAPI service connection successful at ${this.target}`);
        this.isConnected = true;
        this.connectAttempts = 0;
        return true;
      }

      console.warn(`FastAPI service returned non-OK response: ${response.status}`);
      this.isConnected = false;
      return false;
    } catch (error) {
      console.warn(`FastAPI service connection failed: ${error.message}`);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Create proxy options for http-proxy-middleware
   * @returns {Object} Proxy options
   */
  getProxyOptions() {
    return {
      target: this.target,
      changeOrigin: true,
      ws: true, // Enable WebSocket support
      pathRewrite: {
        '^/api/cer': '/cer',
        '^/api/validation': '',
        '^/api/ind': '',
      },
      logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
      onError: this._handleProxyError.bind(this),
      onProxyReqWs: this._handleWebSocketRequest.bind(this),
      onProxyRes: this._handleProxyResponse.bind(this),
      agent: httpsAgent, // Use connection pooling
      timeout: 30000, // 30 seconds timeout
      proxyTimeout: 30000, // 30 seconds timeout
    };
  }

  /**
   * Handle proxy errors
   * @param {Error} err - The error
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @private
   */
  _handleProxyError(err, req, res) {
    console.error('FastAPI Proxy Error:', err.message);
    this.isConnected = false;

    try {
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'External service temporarily unavailable',
          error_code: 'SERVICE_UNAVAILABLE',
          retry_after: this.connectRetryInterval / 1000, // in seconds
          request_id: req.id || (new Date()).toISOString()
        }));
      }
    } catch (e) {
      console.error('Error sending proxy error response:', e.message);
    }
  }

  /**
   * Handle WebSocket requests
   * @param {Object} proxyReq - Proxy request
   * @param {Object} req - Express request
   * @param {Object} socket - WebSocket socket
   * @private
   */
  _handleWebSocketRequest(proxyReq, req, socket) {
    console.log(`WebSocket connection: ${req.url}`);

    // Set timeout and add error handlers
    socket.setTimeout(60000); // 60 second timeout
    socket.on('error', (err) => {
      console.error('WebSocket error:', err.message);
      this.isConnected = false;
    });
    socket.on('timeout', () => {
      console.error('WebSocket timeout');
      socket.end();
    });
  }

  /**
   * Handle proxy responses
   * @param {Object} proxyRes - Proxy response
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @private
   */
  _handleProxyResponse(proxyRes, req, res) {
    // Add response logging if needed
    if (proxyRes.statusCode >= 400) {
      console.warn(`FastAPI response error: ${req.method} ${req.path} -> ${proxyRes.statusCode}`);
    }

    // Update connection status
    this.isConnected = proxyRes.statusCode < 500;
  }
}

/**
 * Register FastAPI proxy middleware with an Express app
 * @param {Object} app - Express application instance
 * @returns {Object} The proxy middleware
 */
function registerFastapiProxy(app) {
  // Create connection manager
  const fastapiConnection = new FastApiConnection();
  
  console.log(`Setting up FastAPI proxy to ${fastapiConnection.target}`);
  
  // Check connectivity initially
  fastapiConnection.checkAvailability()
    .then(isAvailable => {
      console.log(`Initial FastAPI service availability: ${isAvailable ? 'Available' : 'Unavailable'}`);
    })
    .catch(err => {
      console.error('Error checking FastAPI availability:', err.message);
    });
  
  // Create proxy middleware
  const proxyOptions = fastapiConnection.getProxyOptions();
  const proxy = createProxyMiddleware(proxyOptions);
  
  // Health check endpoint for FastAPI service
  app.get('/api/system/fastapi-health', async (req, res) => {
    const isAvailable = await fastapiConnection.checkAvailability();
    res.json({
      status: isAvailable ? 'ok' : 'degraded',
      service: 'fastapi',
      timestamp: new Date().toISOString(),
      lastAttempt: new Date(fastapiConnection.lastConnectAttempt).toISOString(),
      connectAttempts: fastapiConnection.connectAttempts
    });
  });
  
  // Custom middleware to intercept API requests
  app.use(['/api', '/ws'], async (req, res, next) => {
    // For WebSocket upgrades, always try to proxy
    if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket') {
      return proxy(req, res, next);
    }

    // For REST requests, check availability first
    const isAvailable = await fastapiConnection.checkAvailability();
    
    if (isAvailable) {
      // If service is available, use the proxy
      return proxy(req, res, next);
    } else {
      // If service is unavailable, return a standardized error response
      console.warn(`FastAPI service unavailable for ${req.method} ${req.path}`);
      return res.status(503).json({
        success: false,
        error: 'External service temporarily unavailable',
        error_code: 'SERVICE_UNAVAILABLE',
        retry_after: fastapiConnection.connectRetryInterval / 1000, // in seconds
        request_id: req.id || (new Date()).toISOString()
      });
    }
  });
  
  // Return connection manager and proxy
  return {
    proxy,
    connection: fastapiConnection
  };
}

// Export for CommonJS
module.exports = registerFastapiProxy;