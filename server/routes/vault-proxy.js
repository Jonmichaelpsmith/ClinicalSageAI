import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fork } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Create a proxy middleware for the Vault API
const vaultProxy = createProxyMiddleware({
  target: 'http://localhost:4001', // The internal Vault server port
  changeOrigin: true,
  pathRewrite: {
    '^/api/vault': '/api/vault', // No path rewriting needed
  },
  onError: (err, req, res) => {
    console.error('Vault proxy error:', err);
    res.status(503).json({
      message: 'Vault service unavailable',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  },
  logLevel: 'silent',
});

// Apply the proxy middleware to all /api/vault requests
router.use('/', vaultProxy);

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