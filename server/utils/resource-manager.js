/**
 * Resource Manager for Node.js Applications
 * 
 * This utility provides resource management capabilities for Node.js applications
 * running in constrained environments. It helps prevent "pthread_create: Resource temporarily unavailable"
 * errors by controlling the number of concurrent child processes and heavy operations.
 */

import { EventEmitter } from 'events';
import os from 'os';

// Configure resource limits based on environment
const MAX_CONCURRENT_PROCESSES = Math.max(2, Math.min(os.cpus().length - 1, 4));
const PROCESS_TIMEOUT_MS = 60000; // 60 seconds timeout for stuck processes

class ResourceManager extends EventEmitter {
  constructor() {
    super();
    this.activeProcesses = 0;
    this.queue = [];
    this.processMap = new Map(); // Track processes by id
    
    // Log configuration on startup
    console.log(`Resource Manager initialized with max ${MAX_CONCURRENT_PROCESSES} concurrent processes`);
  }

  /**
   * Request a process slot
   * @param {string} operationId - Unique identifier for the operation
   * @param {string} operationType - Type of operation (for logging)
   * @returns {Promise<boolean>} - Resolves to true when a slot is available
   */
  async requestProcessSlot(operationId, operationType = 'generic') {
    return new Promise((resolve) => {
      const request = { 
        operationId, 
        operationType, 
        timestamp: Date.now(),
        resolve
      };
      
      if (this.activeProcesses < MAX_CONCURRENT_PROCESSES) {
        this._allocateSlot(request);
      } else {
        console.log(`Resource limit reached (${this.activeProcesses}/${MAX_CONCURRENT_PROCESSES}). Queuing ${operationType} operation.`);
        this.queue.push(request);
      }
    });
  }

  /**
   * Release a process slot
   * @param {string} operationId - ID of the operation that's completing
   */
  releaseProcessSlot(operationId) {
    if (this.processMap.has(operationId)) {
      this.processMap.delete(operationId);
      this.activeProcesses--;
      
      // Process next item in queue if any
      if (this.queue.length > 0) {
        const nextRequest = this.queue.shift();
        this._allocateSlot(nextRequest);
      }
      
      this.emit('slot-released', operationId);
    }
  }

  /**
   * Get current resource utilization
   * @returns {Object} - Resource utilization stats
   */
  getUtilization() {
    return {
      activeProcesses: this.activeProcesses,
      maxProcesses: MAX_CONCURRENT_PROCESSES,
      queueLength: this.queue.length,
      utilizationPercent: (this.activeProcesses / MAX_CONCURRENT_PROCESSES) * 100,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
  }

  /**
   * Allocate a process slot to the request
   * @param {Object} request - The process request
   * @private
   */
  _allocateSlot(request) {
    this.activeProcesses++;
    this.processMap.set(request.operationId, {
      ...request,
      timeoutId: setTimeout(() => {
        console.warn(`Operation ${request.operationId} (${request.operationType}) timed out after ${PROCESS_TIMEOUT_MS}ms`);
        this.releaseProcessSlot(request.operationId);
      }, PROCESS_TIMEOUT_MS)
    });
    
    request.resolve(true);
  }
  
  /**
   * Check the health of the resource manager
   * @returns {Object} - Health status
   */
  healthCheck() {
    const longRunningProcesses = Array.from(this.processMap.entries())
      .filter(([, proc]) => (Date.now() - proc.timestamp) > (PROCESS_TIMEOUT_MS / 2))
      .map(([id, proc]) => ({
        id,
        type: proc.operationType,
        runningTime: Math.round((Date.now() - proc.timestamp) / 1000) + 's'
      }));
      
    return {
      healthy: this.activeProcesses <= MAX_CONCURRENT_PROCESSES,
      utilization: this.getUtilization(),
      longRunningProcesses,
      queuedOperations: this.queue.length
    };
  }
}

// Export singleton instance
export const resourceManager = new ResourceManager();

// Helper for safe spawn/exec operations
export const withResourceManagement = async (operationId, operationType, callback) => {
  try {
    await resourceManager.requestProcessSlot(operationId, operationType);
    return await callback();
  } finally {
    resourceManager.releaseProcessSlot(operationId);
  }
};

export default resourceManager;