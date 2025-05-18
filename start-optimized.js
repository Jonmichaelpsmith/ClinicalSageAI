/**
 * Resource-Optimized Startup Script for TrialSage
 * 
 * This script provides a controlled startup sequence with proper
 * resource management to prevent the "pthread_create: Resource temporarily unavailable"
 * error. It manages child processes, memory usage, and system resources.
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Configuration
const CONFIG = {
  // Resource constraints
  NODE_MEMORY_LIMIT: '512',  // MB
  MAX_THREADS: Math.max(2, Math.min(os.cpus().length - 1, 4)),
  STARTUP_DELAY: 2000,       // ms between startup phases
  
  // Environment variables to set
  ENV_VARS: {
    UV_THREADPOOL_SIZE: '4',
    NODE_OPTIONS: `--max-old-space-size=${process.env.NODE_MEMORY_LIMIT || '512'}`
  },
  
  // Application settings
  SERVER_CMD: 'npm',
  SERVER_ARGS: ['run', 'dev'],
  
  // File paths
  LOGS_DIR: './logs'
};

/**
 * Set environment variables for resource constraints
 */
function setResourceLimits() {
  console.log('Setting resource limits...');
  
  // Set environment variables
  for (const [key, value] of Object.entries(CONFIG.ENV_VARS)) {
    process.env[key] = value;
    console.log(`  Setting ${key}=${value}`);
  }
  
  // Display current limits
  console.log(`  Process memory limit: ${CONFIG.NODE_MEMORY_LIMIT}MB`);
  console.log(`  Thread pool size: ${process.env.UV_THREADPOOL_SIZE}`);
}

/**
 * Create logs directory if it doesn't exist
 */
function setupLogging() {
  if (!fs.existsSync(CONFIG.LOGS_DIR)) {
    fs.mkdirSync(CONFIG.LOGS_DIR, { recursive: true });
  }
}

/**
 * Clean up unnecessary processes and resources before starting
 */
async function cleanupEnvironment() {
  console.log('Cleaning up environment...');
  
  // Check if toast dependency is installed
  if (fs.existsSync('./node_modules/react-toastify')) {
    console.log('  react-toastify found, this may cause memory issues');
  } else {
    console.log('  react-toastify not found (good!)');
  }
  
  // Clear Vite cache if it exists
  const viteCache = './.vite';
  if (fs.existsSync(viteCache)) {
    try {
      fs.rmSync(viteCache, { recursive: true, force: true });
      console.log('  Cleared Vite cache');
    } catch (err) {
      console.error('  Failed to clear Vite cache:', err.message);
    }
  } else {
    console.log('  Vite cache not found or already cleared');
  }
}

/**
 * Check current system resources
 */
function checkSystemResources() {
  const memInfo = process.memoryUsage();
  const heapUsed = Math.round(memInfo.heapUsed / 1024 / 1024);
  const heapTotal = Math.round(memInfo.heapTotal / 1024 / 1024);
  const rss = Math.round(memInfo.rss / 1024 / 1024);
  
  console.log('System resources:');
  console.log(`  Memory: ${rss}MB RSS, ${heapUsed}MB/${heapTotal}MB heap`);
  console.log(`  Available CPUs: ${os.cpus().length}`);
  console.log(`  Free memory: ${Math.round(os.freemem() / 1024 / 1024)}MB / ${Math.round(os.totalmem() / 1024 / 1024)}MB`);
}

/**
 * Start the application with controlled resource usage
 */
async function startApplication() {
  console.log('Starting application...');
  
  // Start server with resource limits
  const server = spawn(CONFIG.SERVER_CMD, CONFIG.SERVER_ARGS, {
    stdio: 'inherit',
    env: process.env
  });
  
  // Handle server lifecycle events
  server.on('error', (err) => {
    console.error('Server error:', err.message);
    process.exit(1);
  });
  
  server.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
    process.exit(code);
  });
  
  // Log successful startup
  console.log('Application started successfully!');
  console.log('Press Ctrl+C to stop');
}

/**
 * Main startup sequence
 */
async function startup() {
  console.log('TrialSage optimized startup sequence initiated...');
  
  // Phase 1: Set resource limits
  setResourceLimits();
  
  // Phase 2: Setup logging
  setupLogging();
  
  // Short delay to allow system to stabilize
  await new Promise(resolve => setTimeout(resolve, CONFIG.STARTUP_DELAY));
  
  // Phase 3: Environment cleanup
  await cleanupEnvironment();
  
  // Short delay to allow cleanup to complete
  await new Promise(resolve => setTimeout(resolve, CONFIG.STARTUP_DELAY));
  
  // Phase 4: Check current system resources
  checkSystemResources();
  
  // Phase 5: Start application
  await startApplication();
}

// Catch any unhandled errors
process.on('uncaughtException', (err) => {
  console.error('Unhandled exception:', err);
  process.exit(1);
});

// Start the optimized sequence
startup().catch(err => {
  console.error('Startup failed:', err);
  process.exit(1);
});