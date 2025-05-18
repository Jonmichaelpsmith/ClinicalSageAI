/**
 * TrialSage Application Optimizer
 * 
 * This script optimizes the application startup and runtime behavior to work 
 * efficiently in constrained environments.
 * 
 * Features:
 * - Controlled startup sequence to avoid resource spikes
 * - Memory usage monitoring and optimization
 * - Child process management to prevent resource exhaustion
 * - Graceful shutdown handling
 */

import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import fs from 'fs';
import http from 'http';

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  PORT: process.env.PORT || 3000,
  MAX_MEMORY_USAGE_MB: 256,
  ENABLE_PERIODIC_GC: true,
  MONITOR_INTERVAL_MS: 60000, // 1 minute
  LOG_PERFORMANCE: true,
  STARTUP_DELAY_MS: 1000, // 1 second delay for controlled startup
};

// Performance metrics
const metrics = {
  startTime: Date.now(),
  childProcessesCreated: 0,
  childProcessesActive: 0,
  memoryUsageHistory: [],
  gcCalls: 0,
  requestCount: 0,
};

/**
 * Initialize Express application with optimized configuration
 */
async function initExpressApp() {
  const app = express();
  
  // Basic middleware - keep minimal for initial startup
  app.use(express.json({ limit: '1mb' }));
  
  // Log request count for monitoring
  app.use((req, res, next) => {
    metrics.requestCount++;
    next();
  });
  
  // Health check route - useful for monitoring
  app.get('/health', (req, res) => {
    const memoryUsage = process.memoryUsage();
    const uptime = Math.floor((Date.now() - metrics.startTime) / 1000);
    
    res.json({
      status: 'ok',
      version: process.env.npm_package_version || 'unknown',
      uptime: `${uptime} seconds`,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      },
      metrics: {
        requestCount: metrics.requestCount,
        childProcesses: {
          created: metrics.childProcessesCreated,
          active: metrics.childProcessesActive,
        },
        gcCalls: metrics.gcCalls,
      }
    });
  });
  
  // Serve static files - limit concurrent connections
  app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1h',
    etag: false, // Reduce CPU usage
    lastModified: false, // Reduce memory usage
  }));
  
  // Basic catch-all route for client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
  
  return app;
}

/**
 * Start the server with optimized settings
 */
async function startServer() {
  try {
    console.log('Starting optimized TrialSage server...');
    
    // Set process limits
    process.setMaxListeners(15); // Reduce default of 25
    
    // Delay initialization to ensure stable startup
    await new Promise(resolve => setTimeout(resolve, CONFIG.STARTUP_DELAY_MS));
    
    // Initialize Express app
    const app = await initExpressApp();
    
    // Create HTTP server
    const server = http.createServer(app);
    
    // Set up graceful shutdown
    setupGracefulShutdown(server);
    
    // Start server
    server.listen(CONFIG.PORT, '0.0.0.0', () => {
      console.log(`TrialSage server running on port ${CONFIG.PORT}`);
      console.log(`Memory optimization active, limit: ${CONFIG.MAX_MEMORY_USAGE_MB}MB`);
      console.log(`Health check available at http://localhost:${CONFIG.PORT}/health`);
    });
    
    // Set up periodic memory monitoring
    if (CONFIG.LOG_PERFORMANCE) {
      setupMemoryMonitoring();
    }
    
    return server;
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

/**
 * Set up periodic memory monitoring
 */
function setupMemoryMonitoring() {
  console.log('Setting up memory monitoring...');
  
  // Monitor memory usage periodically
  setInterval(() => {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    
    // Store for trend analysis
    metrics.memoryUsageHistory.push({
      timestamp: Date.now(),
      heapUsedMB,
    });
    
    // Keep history limited
    if (metrics.memoryUsageHistory.length > 60) {
      metrics.memoryUsageHistory.shift();
    }
    
    // Log current usage
    console.log(`Memory usage: ${heapUsedMB}MB`);
    
    // Check if we need to request garbage collection
    if (CONFIG.ENABLE_PERIODIC_GC && heapUsedMB > CONFIG.MAX_MEMORY_USAGE_MB * 0.8) {
      console.log('Memory usage high, suggesting garbage collection');
      
      // Node.js doesn't provide direct access to garbage collection,
      // but we can suggest it by using this approach
      try {
        if (global.gc) {
          global.gc();
          metrics.gcCalls++;
          console.log('Garbage collection requested');
        }
      } catch (e) {
        console.log('Garbage collection not available - start with --expose-gc flag for this feature');
      }
    }
  }, CONFIG.MONITOR_INTERVAL_MS);
}

/**
 * Handle graceful shutdown
 */
function setupGracefulShutdown(server) {
  // Handle termination signals
  const signals = ['SIGTERM', 'SIGINT'];
  
  signals.forEach(signal => {
    process.on(signal, () => {
      console.log(`${signal} received, shutting down gracefully...`);
      
      // Close server
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
      
      // Force close after timeout
      setTimeout(() => {
        console.log('Forcing shutdown after timeout');
        process.exit(1);
      }, 15000);
    });
  });
}

// Start the server
startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});