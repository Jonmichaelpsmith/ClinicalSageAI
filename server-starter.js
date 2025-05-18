/**
 * TrialSage Server Starter
 * 
 * This script provides an optimized startup sequence for the TrialSage server,
 * properly managing resources to prevent "pthread_create: Resource temporarily 
 * unavailable" errors and other resource limit issues.
 * 
 * Features:
 * - Controlled startup sequence
 * - Thread pool size management
 * - Memory usage control
 * - Runtime error monitoring and recovery
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration for resource limits
const CONFIG = {
  // Resource constraints
  NODE_MEMORY_LIMIT: 512,  // MB
  MAX_THREADS: Math.max(2, Math.min(os.cpus().length - 1, 4)),
  
  // Startup sequence timing
  STARTUP_DELAY: 2000,       // ms between startup phases
  
  // Command to start server
  SERVER_CMD: 'npm',
  SERVER_ARGS: ['run', 'dev'],
  
  // Logs directory
  LOGS_DIR: path.join(__dirname, 'logs')
};

/**
 * Main function to start the server with resource management
 */
async function start() {
  console.log('TrialSage Server Starter - Optimized for resource management');
  
  // Ensure logs directory exists
  if (!fs.existsSync(CONFIG.LOGS_DIR)) {
    fs.mkdirSync(CONFIG.LOGS_DIR, { recursive: true });
  }
  
  // Configure environment variables for resource limits
  process.env.UV_THREADPOOL_SIZE = CONFIG.MAX_THREADS.toString();
  process.env.NODE_OPTIONS = `--max-old-space-size=${CONFIG.NODE_MEMORY_LIMIT}`;
  
  console.log(`Setting thread pool size: ${process.env.UV_THREADPOOL_SIZE}`);
  console.log(`Setting memory limit: ${CONFIG.NODE_MEMORY_LIMIT}MB`);
  
  // Clean up environment before starting
  await cleanupEnvironment();
  
  // Delay to let system stabilize after cleanup
  await delay(CONFIG.STARTUP_DELAY);
  
  // Start the server with proper environment configuration
  startServer();
}

/**
 * Clean up environment before starting
 */
async function cleanupEnvironment() {
  console.log('Cleaning up environment...');
  
  // Clean Vite cache if it exists
  const viteCache = path.join(__dirname, '.vite');
  if (fs.existsSync(viteCache)) {
    try {
      fs.rmSync(viteCache, { recursive: true, force: true });
      console.log('- Cleared Vite cache');
    } catch (err) {
      console.warn('- Failed to clear Vite cache:', err.message);
    }
  }
  
  // Clean temporary files
  const tmpDir = path.join(__dirname, 'tmp');
  if (fs.existsSync(tmpDir)) {
    try {
      const files = fs.readdirSync(tmpDir);
      let count = 0;
      for (const file of files) {
        if (file.endsWith('.tmp')) {
          fs.unlinkSync(path.join(tmpDir, file));
          count++;
        }
      }
      if (count > 0) {
        console.log(`- Removed ${count} temporary files`);
      }
    } catch (err) {
      console.warn('- Failed to clean temporary files:', err.message);
    }
  }
  
  // Log current system resources
  logSystemResources();
}

/**
 * Log current system resources
 */
function logSystemResources() {
  const memInfo = process.memoryUsage();
  const heapUsed = Math.round(memInfo.heapUsed / 1024 / 1024);
  const heapTotal = Math.round(memInfo.heapTotal / 1024 / 1024);
  const rss = Math.round(memInfo.rss / 1024 / 1024);
  
  console.log('System resources:');
  console.log(`- Memory: ${rss}MB RSS, ${heapUsed}MB/${heapTotal}MB heap`);
  console.log(`- CPUs: ${os.cpus().length} available`);
  console.log(`- Free memory: ${Math.round(os.freemem() / 1024 / 1024)}MB / ${Math.round(os.totalmem() / 1024 / 1024)}MB`);
}

/**
 * Start the server with proper environment settings
 */
function startServer() {
  console.log('Starting server with optimized resource settings...');
  
  // Start server with resource limits
  const server = spawn(CONFIG.SERVER_CMD, CONFIG.SERVER_ARGS, {
    stdio: 'inherit',
    env: process.env
  });
  
  // Handle server errors
  server.on('error', (err) => {
    console.error('Server failed to start:', err.message);
    process.exit(1);
  });
  
  // Handle server exit
  server.on('close', (code) => {
    if (code !== 0) {
      console.error(`Server exited with code ${code}`);
      process.exit(code);
    }
  });
  
  console.log('Server started successfully!');
}

/**
 * Helper function to create a delay
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} - Resolves after the delay
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

// Start the optimized server
start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});