/**
 * FastAPI Bridge
 * 
 * This module provides a bridge between the Express.js server and 
 * the FastAPI ingestion API by spawning a FastAPI server in the background
 * and proxying requests to it.
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import net from 'net';
import http from 'http';

// FastAPI server process
let fastApiProcess = null;
// FastAPI server port
const FASTAPI_PORT = 3500;
// Path to the FastAPI scripts
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FASTAPI_SCRIPT = path.join(__dirname, 'ingestion_api.py');
const CER_FASTAPI_SCRIPT = path.join(__dirname, 'cer_fastapi.py');

/**
 * Check if the port is in use
 */
async function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => {
        // Port is in use
        resolve(true);
      })
      .once('listening', () => {
        // Port is free
        server.close();
        resolve(false);
      })
      .listen(port);
  });
}

/**
 * Start the FastAPI server
 */
export async function startFastApiServer() {
  // Check if the server is already running
  if (fastApiProcess !== null) {
    console.log('FastAPI server is already running');
    return;
  }

  // Check if the port is in use
  const portInUse = await isPortInUse(FASTAPI_PORT);
  if (portInUse) {
    console.log(`Port ${FASTAPI_PORT} is already in use. Assuming FastAPI server is running.`);
    return;
  }

  // Start the FastAPI ingestion server
  console.log('Starting FastAPI server...');
  fastApiProcess = spawn('python', [FASTAPI_SCRIPT], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
  });
  
  // Also start the FastAPI CER server
  console.log('Starting CER API server...');
  const cerFastApiProcess = spawn('python', [CER_FASTAPI_SCRIPT], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
  });
  
  // Log output from the CER FastAPI server
  cerFastApiProcess.stdout.on('data', (data) => {
    console.log(`CER API: ${data.toString().trim()}`);
  });

  cerFastApiProcess.stderr.on('data', (data) => {
    console.error(`CER API error: ${data.toString().trim()}`);
  });

  // Handle CER server process exit
  cerFastApiProcess.on('close', (code) => {
    console.log(`CER API server exited with code ${code}`);
  });

  // Log output from the FastAPI server
  fastApiProcess.stdout.on('data', (data) => {
    console.log(`FastAPI: ${data.toString().trim()}`);
  });

  fastApiProcess.stderr.on('data', (data) => {
    console.error(`FastAPI error: ${data.toString().trim()}`);
  });

  // Handle process exit
  fastApiProcess.on('close', (code) => {
    console.log(`FastAPI server exited with code ${code}`);
    fastApiProcess = null;
  });

  // Wait for the server to start
  return new Promise((resolve, reject) => {
    let startupTimeout;
    
    const checkServer = async () => {
      try {
        const response = await fetch(`http://localhost:${FASTAPI_PORT}/`);
        if (response.ok) {
          clearTimeout(startupTimeout);
          console.log('FastAPI server started successfully');
          resolve();
        } else {
          throw new Error(`Server responded with status ${response.status}`);
        }
      } catch (error) {
        // Server not yet ready, try again
        setTimeout(checkServer, 500);
      }
    };

    // Set a timeout to fail after 30 seconds
    startupTimeout = setTimeout(() => {
      reject(new Error('FastAPI server failed to start within 30 seconds'));
    }, 30000);

    // Start checking
    checkServer();
  });
}

/**
 * Stop the FastAPI server
 */
export function stopFastApiServer() {
  if (fastApiProcess !== null) {
    console.log('Stopping FastAPI server...');
    
    // Gracefully terminate the process
    fastApiProcess.kill('SIGINT');
    fastApiProcess = null;
    
    console.log('FastAPI server stopped');
  }
}

/**
 * Create middleware to proxy requests to the FastAPI server
 */
export function createFastApiProxyMiddleware() {
  return function(req, res, next) {
    // Handle '/api/ingest', '/api/norm', '/api/narrative', and '/api/cer' routes
    if (!req.path.startsWith('/api/ingest') && 
        !req.path.startsWith('/api/norm') && 
        !req.path.startsWith('/api/narrative') &&
        !req.path.startsWith('/api/cer')) {
      return next();
    }
    
    console.log(`Proxying request to FastAPI: ${req.method} ${req.path}`);
    
    // Options for the proxy request
    const options = {
      hostname: 'localhost',
      port: FASTAPI_PORT,
      path: req.path,
      method: req.method,
      headers: {
        ...req.headers,
        host: `localhost:${FASTAPI_PORT}`
      }
    };
    
    // Create proxy request
    const proxyReq = http.request(options, (proxyRes) => {
      // Copy status code
      res.statusCode = proxyRes.statusCode;
      
      // Copy headers
      Object.keys(proxyRes.headers).forEach(key => {
        res.setHeader(key, proxyRes.headers[key]);
      });
      
      // Pipe the response body
      proxyRes.pipe(res);
    });
    
    // Handle errors
    proxyReq.on('error', (err) => {
      console.error('Proxy error:', err);
      if (!res.headersSent) {
        res.status(502).json({
          error: 'FastAPI server not available',
          message: 'The data ingestion server is unavailable. Please try again later.'
        });
      }
    });
    
    // Pipe request body if present
    if (req.body) {
      proxyReq.write(JSON.stringify(req.body));
    }
    
    // End the request
    proxyReq.end();
  };
}

export default {
  startFastApiServer,
  stopFastApiServer,
  createFastApiProxyMiddleware,
};