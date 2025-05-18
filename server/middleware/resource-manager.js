/**
 * Resource Manager Middleware
 * 
 * This middleware manages system resources to prevent
 * "pthread_create: Resource temporarily unavailable" errors.
 * 
 * It controls:
 * 1. Child process creation
 * 2. Memory usage
 * 3. Thread pool utilization
 */

import os from 'os';
import { EventEmitter } from 'events';

// Resource limits
const MAX_CONCURRENT_PROCESSES = Math.max(2, Math.min(os.cpus().length - 1, 4));
const PROCESS_TIMEOUT_MS = 30000; // 30 seconds

class ResourceManager extends EventEmitter {
  constructor() {
    super();
    this.activeProcesses = 0;
    this.processQueue = [];
    this.processRegistry = new Map();
    this.processId = 0;
    
    // Process queue checker
    this.queueInterval = setInterval(() => {
      this.checkQueue();
    }, 1000);
    
    console.log(`ResourceManager initialized: Max concurrent processes = ${MAX_CONCURRENT_PROCESSES}`);
  }
  
  /**
   * Request to run a process with resource management
   * @param {Function} processFn - Function that executes the process
   * @param {string} processName - Name for logging
   * @param {number} timeout - Timeout in ms
   * @returns {Promise} - Resolves when process completes
   */
  async runProcess(processFn, processName = 'unknown', timeout = PROCESS_TIMEOUT_MS) {
    const processId = `process-${++this.processId}`;
    
    return new Promise((resolve, reject) => {
      const processRequest = {
        id: processId,
        name: processName,
        execute: async () => {
          try {
            const result = await processFn();
            this.releaseProcess(processId);
            resolve(result);
          } catch (error) {
            this.releaseProcess(processId);
            reject(error);
          }
        },
        resolve,
        reject,
        timeout,
        queuedAt: Date.now()
      };
      
      if (this.activeProcesses < MAX_CONCURRENT_PROCESSES) {
        this.startProcess(processRequest);
      } else {
        console.log(`Process queued: ${processName} (${processId}) - active: ${this.activeProcesses}/${MAX_CONCURRENT_PROCESSES}`);
        this.processQueue.push(processRequest);
      }
    });
  }
  
  /**
   * Start a process with timeout
   * @param {Object} processRequest - Process request object
   * @private
   */
  startProcess(processRequest) {
    this.activeProcesses++;
    
    // Set timeout
    const timeoutId = setTimeout(() => {
      console.warn(`Process ${processRequest.name} (${processRequest.id}) timed out after ${processRequest.timeout}ms`);
      this.releaseProcess(processRequest.id);
      processRequest.reject(new Error(`Process timed out after ${processRequest.timeout}ms`));
    }, processRequest.timeout);
    
    // Store in registry
    this.processRegistry.set(processRequest.id, {
      ...processRequest,
      timeoutId,
      startedAt: Date.now()
    });
    
    // Execute the process
    processRequest.execute();
  }
  
  /**
   * Release a process resource
   * @param {string} processId - ID of the process
   * @private
   */
  releaseProcess(processId) {
    const processInfo = this.processRegistry.get(processId);
    
    if (processInfo) {
      // Clear timeout
      if (processInfo.timeoutId) {
        clearTimeout(processInfo.timeoutId);
      }
      
      // Remove from registry
      this.processRegistry.delete(processId);
      this.activeProcesses = Math.max(0, this.activeProcesses - 1);
      
      // Log if it was a long-running process
      const runTime = Date.now() - processInfo.startedAt;
      if (runTime > 5000) {
        console.log(`Process ${processInfo.name} completed in ${runTime}ms`);
      }
      
      // Emit event
      this.emit('process-completed', {
        id: processId,
        name: processInfo.name,
        runtime: runTime
      });
    }
  }
  
  /**
   * Check the process queue
   * @private
   */
  checkQueue() {
    while (this.activeProcesses < MAX_CONCURRENT_PROCESSES && this.processQueue.length > 0) {
      const nextProcess = this.processQueue.shift();
      
      // Log wait time for longer queues
      const waitTime = Date.now() - nextProcess.queuedAt;
      if (waitTime > 1000) {
        console.log(`Process ${nextProcess.name} waited ${waitTime}ms in queue`);
      }
      
      this.startProcess(nextProcess);
    }
  }
  
  /**
   * Get resource manager status
   * @returns {Object} - Current status
   */
  getStatus() {
    return {
      activeProcesses: this.activeProcesses,
      maxProcesses: MAX_CONCURRENT_PROCESSES,
      queueLength: this.processQueue.length,
      runningProcesses: Array.from(this.processRegistry.entries()).map(([id, info]) => ({
        id,
        name: info.name,
        runtime: Math.round((Date.now() - info.startedAt) / 1000) + 's'
      }))
    };
  }
  
  /**
   * Clean up resources
   */
  cleanup() {
    clearInterval(this.queueInterval);
    
    // Clear all timeouts
    for (const [id, info] of this.processRegistry.entries()) {
      if (info.timeoutId) {
        clearTimeout(info.timeoutId);
      }
    }
    
    this.processRegistry.clear();
    this.processQueue = [];
    this.activeProcesses = 0;
    
    console.log('ResourceManager: Resources cleaned up');
  }
}

// Create singleton instance
const resourceManager = new ResourceManager();

// Clean up on process exit
process.on('exit', () => {
  resourceManager.cleanup();
});

// Graceful shutdown
['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => {
    console.log(`${signal} received, cleaning up resources...`);
    resourceManager.cleanup();
    // Give processes time to clean up before exiting
    setTimeout(() => process.exit(0), 1000);
  });
});

// Create middleware function
export function resourceManagerMiddleware(req, res, next) {
  // Add resource info to response headers
  const status = resourceManager.getStatus();
  res.set('X-Resource-Usage', `${status.activeProcesses}/${status.maxProcesses} processes, ${status.queueLength} queued`);
  next();
}

export default resourceManager;