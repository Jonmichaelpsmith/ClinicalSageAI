/**
 * FastAPI Bridge
 * 
 * This module provides a bridge between the Express.js server and 
 * the FastAPI ingestion API by spawning a FastAPI server in the background
 * and proxying requests to it.
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import http from 'http';

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Constants
const FASTAPI_PORT = 3500; // Use a different port than Express
const FASTAPI_SCRIPT = join(__dirname, 'ingestion_api.py');
const FASTAPI_PREFIX = '/api/ingest';

// Process handle for the FastAPI server
let fastApiProcess = null;

/**
 * Check if the port is in use
 */
async function isPortInUse(port) {
  const execAsync = promisify(exec);
  try {
    const { stdout } = await execAsync(`lsof -i:${port}`);
    return stdout.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Start the FastAPI server
 */
export async function startFastApiServer() {
  // Check if the port is already in use
  const portInUse = await isPortInUse(FASTAPI_PORT);
  if (portInUse) {
    console.warn(`Port ${FASTAPI_PORT} is already in use. FastAPI server may already be running.`);
    return;
  }
  
  // Start the FastAPI server
  console.log(`Starting FastAPI server on port ${FASTAPI_PORT}...`);
  
  try {
    fastApiProcess = spawn('uvicorn', [
      'server.ingestion_api:app',
      '--host', '0.0.0.0',
      '--port', FASTAPI_PORT.toString(),
      '--reload'
    ], {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false
    });
    
    fastApiProcess.stdout.on('data', (data) => {
      console.log(`FastAPI: ${data.toString().trim()}`);
    });
    
    fastApiProcess.stderr.on('data', (data) => {
      console.error(`FastAPI error: ${data.toString().trim()}`);
    });
    
    // Handle process exit
    fastApiProcess.on('exit', (code, signal) => {
      console.log(`FastAPI server exited with code ${code} and signal ${signal}`);
      fastApiProcess = null;
    });
    
    // Wait for the server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`FastAPI server started on port ${FASTAPI_PORT}`);
  } catch (error) {
    console.error('Failed to start FastAPI server:', error);
  }
}

/**
 * Stop the FastAPI server
 */
export function stopFastApiServer() {
  if (fastApiProcess) {
    console.log('Stopping FastAPI server...');
    fastApiProcess.kill();
    fastApiProcess = null;
  }
}

/**
 * Create middleware to proxy requests to the FastAPI server
 */
export function createFastApiProxyMiddleware() {
  return function fastApiProxy(req, res, next) {
    // Only proxy requests to the FastAPI prefix
    if (req.path.startsWith(FASTAPI_PREFIX)) {
      const options = {
        hostname: '127.0.0.1',
        port: FASTAPI_PORT,
        path: req.originalUrl,
        method: req.method,
        headers: req.headers
      };
      
      // Delete host header to avoid conflicts
      delete options.headers.host;
      
      const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      });
      
      proxyReq.on('error', (error) => {
        console.error('Error proxying request to FastAPI:', error);
        if (!res.headersSent) {
          res.status(502).json({
            error: 'Failed to proxy request to FastAPI server',
            message: error.message
          });
        }
      });
      
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        req.pipe(proxyReq, { end: true });
      } else {
        proxyReq.end();
      }
    } else {
      next();
    }
  };
}

export default {
  startFastApiServer,
  stopFastApiServer,
  createFastApiProxyMiddleware
};