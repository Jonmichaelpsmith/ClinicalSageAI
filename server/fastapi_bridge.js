/**
 * FastAPI Bridge for CER Generator
 * 
 * This module provides a connection between the Express.js server and Python-based
 * FastAPI services for advanced data processing tasks.
 */

import axios from 'axios';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// Default FastAPI server location
const FASTAPI_SERVER = process.env.FASTAPI_SERVER || `http://localhost:${process.env.FASTAPI_PORT || '8083'}`;

// Flag to track if FastAPI server is running
let isServerRunning = false;

/**
 * Start the FastAPI server if not already running
 */
async function ensureFastApiServer() {
  if (isServerRunning) {
    return true;
  }

  try {
    // Try to check if the server is already running
    try {
      const response = await axios.get(`${FASTAPI_SERVER}/health`);
      if (response.status === 200) {
        console.log('FastAPI server is already running');
        isServerRunning = true;
        return true;
      }
    } catch (error) {
      // Server is not running, we'll start it
    }

    // Paths are relative to the project root
    const fastApiScriptPath = path.join('server', 'cer_fastapi_simplified.py');
    
    // Ensure the script exists
    if (!fs.existsSync(fastApiScriptPath)) {
      console.error(`FastAPI script not found at ${fastApiScriptPath}`);
      return false;
    }

    // Start the FastAPI server as a child process with environment variables
    const fastApiProcess = spawn('python3', [fastApiScriptPath], {
      env: { ...process.env, FASTAPI_PORT: process.env.FASTAPI_PORT || '8083' }
    });
    
    fastApiProcess.stdout.on('data', (data) => {
      console.log(`FastAPI: ${data.toString()}`);
      if (data.toString().includes('Application startup complete')) {
        isServerRunning = true;
      }
    });
    
    fastApiProcess.stderr.on('data', (data) => {
      console.error(`FastAPI error: ${data.toString()}`);
    });
    
    fastApiProcess.on('close', (code) => {
      console.log(`FastAPI server exited with code ${code}`);
      isServerRunning = false;
    });
    
    // Give the server a moment to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verify the server is running
    try {
      const response = await axios.get(`${FASTAPI_SERVER}/health`);
      if (response.status === 200) {
        console.log('FastAPI server started successfully');
        isServerRunning = true;
        return true;
      }
    } catch (error) {
      console.error('Failed to verify FastAPI server is running:', error.message);
      return false;
    }
    
    return isServerRunning;

  } catch (error) {
    console.error('Error ensuring FastAPI server is running:', error);
    return false;
  }
}

/**
 * Call a FastAPI endpoint with auto-retry if server not running
 * @param {string} endpoint - API endpoint path (e.g., '/cer/generate')
 * @param {string} method - HTTP method ('get', 'post', etc.)
 * @param {object} data - Request data for POST/PUT methods
 * @param {object} options - Additional axios options
 * @returns {Promise<object>} - Response data
 */
async function callFastApi(endpoint, method = 'get', data = null, options = {}) {
  try {
    // Ensure FastAPI server is running
    const serverReady = await ensureFastApiServer();
    if (!serverReady) {
      throw new Error('Failed to start FastAPI server');
    }
    
    // Prepare request URL and config
    const url = `${FASTAPI_SERVER}${endpoint}`;
    const config = { ...options };
    
    // Make the API call
    let response;
    if (method.toLowerCase() === 'get') {
      response = await axios.get(url, config);
    } else if (method.toLowerCase() === 'post') {
      response = await axios.post(url, data, config);
    } else if (method.toLowerCase() === 'put') {
      response = await axios.put(url, data, config);
    } else if (method.toLowerCase() === 'delete') {
      response = await axios.delete(url, config);
    } else {
      throw new Error(`Unsupported HTTP method: ${method}`);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error calling FastAPI (${endpoint}):`, error.message);
    throw error;
  }
}

/**
 * Generate a CER for a specified NDC code
 * @param {string} ndcCode - The NDC code to generate a report for
 * @returns {Promise<object>} - Generated CER data
 */
async function generateCer(ndcCode) {
  return callFastApi('/cer/generate', 'post', { ndc_code: ndcCode });
}

/**
 * Analyze multiple NDC codes for comparison
 * @param {string[]} ndcCodes - Array of NDC codes to analyze
 * @returns {Promise<object>} - Comparative analysis data
 */
async function analyzeCers(ndcCodes) {
  return callFastApi('/cer/analyze', 'post', { ndc_codes: ndcCodes });
}

/**
 * Generate a PDF report for one or more NDC codes
 * @param {string[]} ndcCodes - Array of NDC codes to include in the report
 * @returns {Promise<Buffer>} - PDF data as a buffer
 */
async function generateCerPdf(ndcCodes) {
  const response = await axios.post(
    `${FASTAPI_SERVER}/cer/export-pdf`,
    { ndc_codes: ndcCodes },
    { responseType: 'arraybuffer' }
  );
  
  return Buffer.from(response.data);
}

// Auto-start the FastAPI server when this module is imported
ensureFastApiServer().then((success) => {
  if (success) {
    console.log('FastAPI server is ready');
  } else {
    console.error('Failed to start FastAPI server');
  }
}).catch(err => {
  console.error('Error in FastAPI server initialization:', err);
});

/**
 * Start FastAPI server programmatically
 * @returns {Promise<boolean>}
 */
function startFastApiServer() {
  return ensureFastApiServer();
}

/**
 * Stop FastAPI server
 * @returns {void}
 */
function stopFastApiServer() {
  console.log('FastAPI server stop requested (stub)');
  // In a real implementation, this would stop the FastAPI server
  // But since we're running it in-process, it will terminate with the Node process
}

/**
 * Create Express middleware to proxy requests to FastAPI and IND Automation
 * @returns {Function} Express middleware function
 */
function createFastApiProxyMiddleware() {
  return function(req, res, next) {
    // Handle streaming endpoints
    if (req.path === '/api/assistant/stream' || req.path === '/api/assistant/stream_with_context') {
      const method = req.method.toLowerCase();
      const url = `${FASTAPI_SERVER}${req.path}`;
      
      // Ensure server is running before proxying
      ensureFastApiServer().then(serverReady => {
        if (!serverReady) {
          return res.status(500).json({ 
            success: false, 
            message: 'FastAPI server not available' 
          });
        }
        
        // Special handling for streaming responses
        req.pipe(
          axios({
            method,
            url,
            data: req.body,
            responseType: 'stream',
            headers: {
              'Content-Type': 'application/json'
            }
          }).then(response => {
            // Set headers and pipe the stream
            res.set(response.headers);
            response.data.pipe(res);
          }).catch(error => {
            console.error(`Error proxying to FastAPI streaming endpoint (${req.path}):`, error.message);
            res.status(500).json({ 
              success: false, 
              message: error.message || 'Failed to process streaming request'
            });
          })
        );
        
        return;
      }).catch(error => {
        console.error(`Error ensuring FastAPI server for streaming (${req.path}):`, error.message);
        res.status(500).json({ 
          success: false, 
          message: 'Failed to start FastAPI server'
        });
      });
    }
    // Proxy assistant retrieval endpoints
    else if (req.path === '/api/assistant/retrieve') {
      callFastApi(req.path, req.method.toLowerCase(), req.body, {
        params: req.query
      })
        .then(result => {
          res.json({ success: true, ...result });
        })
        .catch(error => {
          console.error(`Error proxying to FastAPI (${req.path}):`, error.message);
          res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to process request'
          });
        });
    } 
    // Proxy CER endpoints to the CER FastAPI service
    else if (req.path.startsWith('/api/cer/')) {
      callFastApi(req.path.replace('/api/cer', '/cer'), req.method.toLowerCase(), req.body, {
        params: req.query
      })
        .then(result => {
          res.json({ success: true, ...result });
        })
        .catch(error => {
          console.error(`Error proxying to FastAPI (${req.path}):`, error.message);
          res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to process request'
          });
        });
    } 
    // Proxy validation endpoints to the FastAPI service
    else if (req.path.startsWith('/api/validation/')) {
      console.log(`Proxying validation request: ${req.method} ${req.path}`);
      
      // If it's a download request, handle differently to support binary responses
      if (req.path.includes('/download') || req.path.includes('/bundle')) {
        // Ensure server is running
        ensureFastApiServer().then(serverReady => {
          if (!serverReady) {
            return res.status(500).json({ 
              success: false, 
              message: 'FastAPI server not available' 
            });
          }
          
          // Forward to FastAPI with proper streaming
          const method = req.method.toLowerCase();
          const url = `${FASTAPI_SERVER}${req.path}`;
          
          axios({
            method,
            url,
            data: method === 'post' ? req.body : undefined,
            params: req.query,
            responseType: 'arraybuffer'
          })
            .then(response => {
              // Set content headers
              res.setHeader('Content-Type', response.headers['content-type']);
              if (response.headers['content-disposition']) {
                res.setHeader('Content-Disposition', response.headers['content-disposition']);
              }
              
              // Send binary response
              res.send(response.data);
            })
            .catch(error => {
              console.error(`Error proxying to FastAPI download (${req.path}):`, error.message);
              res.status(500).json({ 
                success: false, 
                message: error.message || 'Failed to download file'
              });
            });
        });
      } else {
        // Regular JSON API requests
        callFastApi(req.path, req.method.toLowerCase(), req.body, {
          params: req.query
        })
          .then(result => {
            res.json({ success: true, ...result });
          })
          .catch(error => {
            console.error(`Error proxying to FastAPI validation (${req.path}):`, error.message);
            res.status(500).json({ 
              success: false, 
              message: error.message || 'Failed to process validation request'
            });
          });
      }
    } 
    // Proxy IND Automation endpoints to the IND Automation service
    else if (req.path.startsWith('/api/ind') || req.path === '/api/projects') {
      // Configure to proxy to IND Automation service
      const IND_AUTOMATION_SERVER = process.env.IND_AUTOMATION_SERVER || 'http://localhost:8082';
      
      // Forward the request
      const method = req.method.toLowerCase();
      const url = `${IND_AUTOMATION_SERVER}${req.path}`;
      
      console.log(`Proxying request to IND Automation: ${method.toUpperCase()} ${url}`);
      
      // Make request to IND Automation
      axios({
        method,
        url,
        data: req.body,
        params: req.query,
        responseType: req.headers.accept === 'application/zip' ? 'arraybuffer' : 'json'
      })
        .then(response => {
          // Set response headers
          Object.keys(response.headers).forEach(key => {
            res.setHeader(key, response.headers[key]);
          });
          
          // Send response
          if (response.headers['content-type'] && response.headers['content-type'].includes('application/zip')) {
            res.send(response.data);
          } else {
            res.json(response.data);
          }
        })
        .catch(error => {
          console.error(`Error proxying to IND Automation (${req.path}):`, error.message);
          
          // Forward error status and response if available
          if (error.response) {
            res.status(error.response.status).json(error.response.data || { 
              success: false, 
              message: error.message || 'IND Automation service error'
            });
          } else {
            res.status(500).json({ 
              success: false, 
              message: error.message || 'Failed to connect to IND Automation service'
            });
          }
        });
    } else {
      // Pass through for other endpoints
      next();
    }
  };
}

export {
  ensureFastApiServer,
  callFastApi,
  generateCer,
  analyzeCers,
  generateCerPdf,
  startFastApiServer,
  stopFastApiServer,
  createFastApiProxyMiddleware
};