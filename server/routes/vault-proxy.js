import express from 'express';
import { fork } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Start the Vault server as a child process if not already running
let vaultProcess = null;
const startVaultServer = () => {
  if (vaultProcess) {
    console.log('Vault server already running');
    return;
  }
  
  console.log('Starting Vault server as a child process...');
  try {
    // Path to the vault server script
    const scriptPath = path.resolve(__dirname, '../../start-vault-server.js');
    
    vaultProcess = fork(scriptPath, [], {
      env: { ...process.env, VAULT_PORT: '4001' }, // Use a different port than the standalone server
      stdio: 'inherit',
    });
    
    vaultProcess.on('error', (err) => {
      console.error('Failed to start Vault server:', err);
      vaultProcess = null;
    });
    
    vaultProcess.on('exit', (code, signal) => {
      console.log(`Vault server exited with code ${code} and signal ${signal}`);
      vaultProcess = null;
    });
    
    console.log('Vault server started successfully');
  } catch (error) {
    console.error('Error starting Vault server:', error);
  }
};

// Start the Vault server when this module is loaded
startVaultServer();

// Simple proxy implementation without http-proxy-middleware
router.use('/', (req, res) => {
  const options = {
    hostname: 'localhost',
    port: 4001,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: 'localhost:4001',
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.statusCode = proxyRes.statusCode;
    
    // Copy headers from proxy response
    Object.keys(proxyRes.headers).forEach(key => {
      res.setHeader(key, proxyRes.headers[key]);
    });
    
    // Pipe the proxy response to the original response
    proxyRes.pipe(res);
  });
  
  // Handle proxy errors
  proxyReq.on('error', (err) => {
    console.error('Vault proxy error:', err);
    res.status(503).json({
      message: 'Vault service unavailable',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  });
  
  // If there's a request body, write it to the proxy request
  if (req.body) {
    proxyReq.write(JSON.stringify(req.body));
  }
  
  // Pipe the original request to the proxy request
  req.pipe(proxyReq, { end: true });
});

// Health check endpoint to verify if the Vault server is running
router.get('/health', (req, res) => {
  if (vaultProcess) {
    res.json({
      status: 'ok',
      message: 'Vault server is running',
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      status: 'error',
      message: 'Vault server is not running',
      timestamp: new Date().toISOString(),
    });
  }
});

// Mock token endpoint for testing without the Vault server
router.get('/mock-token', (req, res) => {
  const jwt = require('jsonwebtoken');
  const mockUser = {
    id: '123456',
    role: 'user',
    tenantId: '123456'
  };
  const token = jwt.sign(mockUser, process.env.JWT_SECRET || 'fallback-secret-for-demo', { expiresIn: '1h' });
  res.json({ token });
});

export default router;