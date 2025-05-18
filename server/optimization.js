/**
 * Server Optimization Module
 * 
 * This module provides optimization functionality for the TrialSage server
 * to prevent resource exhaustion and "pthread_create: Resource temporarily unavailable" errors.
 */

// Track resource usage
const resources = {
  childProcesses: {
    active: 0,
    created: 0,
    maxConcurrent: 4
  },
  memory: {
    readings: []
  },
  server: {
    startTime: Date.now()
  }
};

/**
 * Optimize the Node.js environment for better resource usage
 */
export function optimizeEnvironment() {
  // Set environment variables to limit resource usage
  process.env.UV_THREADPOOL_SIZE = process.env.UV_THREADPOOL_SIZE || '4';
  
  // Configure global error handlers
  process.on('uncaughtException', handleUncaughtError);
  process.on('unhandledRejection', handleUnhandledRejection);
  
  // Start periodic monitoring
  startMonitoring();
  
  return {
    active: true,
    threadpoolSize: process.env.UV_THREADPOOL_SIZE,
    timestamp: new Date().toISOString()
  };
}

/**
 * Handle uncaught errors
 */
function handleUncaughtError(error) {
  console.error('UNCAUGHT EXCEPTION:', error);
  // Avoid crashing the server for non-critical errors
  if (error.code === 'EADDRINUSE' || error.code === 'EACCES') {
    console.error('Critical server error, exiting process');
    process.exit(1);
  }
}

/**
 * Handle unhandled promise rejections
 */
function handleUnhandledRejection(reason, promise) {
  console.error('UNHANDLED REJECTION:', reason);
}

/**
 * Start periodic monitoring of resource usage
 */
function startMonitoring() {
  // Monitor memory usage periodically
  const memoryMonitor = setInterval(() => {
    const memUsage = process.memoryUsage();
    resources.memory.readings.push({
      timestamp: Date.now(),
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    });
    
    // Keep only the last 10 readings
    if (resources.memory.readings.length > 10) {
      resources.memory.readings.shift();
    }
    
    // Check for high memory usage
    const currentUsage = resources.memory.readings[resources.memory.readings.length - 1];
    if (currentUsage.heapUsed > 450) {
      console.warn(`High memory usage detected: ${currentUsage.heapUsed}MB heap used`);
      // Try to trigger garbage collection if available
      if (global.gc) {
        console.log('Triggering garbage collection');
        global.gc();
      }
    }
  }, 60000); // Every minute
  
  // Cleanup on exit
  process.on('exit', () => {
    clearInterval(memoryMonitor);
  });
}

/**
 * Wrapper for child_process spawn/exec to manage resource usage
 * @param {Function} processFn - Function that creates a child process
 * @param {Object} options - Options to pass to the child process
 * @returns {Promise} - The child process
 */
export async function manageChildProcess(processFn, options = {}) {
  // Check if we're at the limit
  if (resources.childProcesses.active >= resources.childProcesses.maxConcurrent) {
    console.log(`Waiting for child process slot (active: ${resources.childProcesses.active})`);
    // Wait for a slot to become available
    await new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (resources.childProcesses.active < resources.childProcesses.maxConcurrent) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 500);
    });
  }
  
  // Track the child process
  resources.childProcesses.active++;
  resources.childProcesses.created++;
  
  // Create the child process
  const childProcess = processFn(options);
  
  // Handle process completion
  const cleanup = () => {
    resources.childProcesses.active = Math.max(0, resources.childProcesses.active - 1);
  };
  
  childProcess.on('exit', cleanup);
  childProcess.on('error', cleanup);
  
  // Add cleanup method to child process
  childProcess.cleanup = cleanup;
  
  return childProcess;
}

/**
 * Get current resource usage statistics
 * @returns {Object} - Current resource usage
 */
export function getResourceUsage() {
  const memUsage = process.memoryUsage();
  const uptime = Math.round((Date.now() - resources.server.startTime) / 1000);
  
  return {
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    },
    childProcesses: {
      active: resources.childProcesses.active,
      created: resources.childProcesses.created,
      maxConcurrent: resources.childProcesses.maxConcurrent
    },
    server: {
      uptime,
      uptimeFormatted: formatUptime(uptime)
    }
  };
}

/**
 * Format uptime in a human-readable format
 * @param {number} seconds - Uptime in seconds
 * @returns {string} - Formatted uptime
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

// Export an optimization middleware that can be used in Express
export function optimizationMiddleware(req, res, next) {
  // Add resource usage to the response headers
  const usage = getResourceUsage();
  res.set('X-Memory-Usage', `${usage.memory.heapUsed}MB`);
  res.set('X-Child-Processes', `${usage.childProcesses.active}/${usage.childProcesses.maxConcurrent}`);
  
  next();
}

// Default export for easy importing
export default {
  optimizeEnvironment,
  manageChildProcess,
  getResourceUsage,
  optimizationMiddleware
};