/**
 * Resource Limiter
 * 
 * This module helps prevent resource exhaustion in Node.js applications by:
 * 1. Limiting concurrent child processes
 * 2. Managing memory usage
 * 3. Scheduling heavy operations
 * 4. Providing graceful degradation when resources are scarce
 */

import EventEmitter from 'events';
import os from 'os';

// Configuration constants
const MAX_CONCURRENT_TASKS = Math.max(2, Math.min(os.cpus().length - 1, 4));
const MEMORY_THRESHOLD = 0.8; // 80% of max heap
const TASK_TIMEOUT_MS = 30000; // 30 seconds
const CHECK_INTERVAL_MS = 2000; // Check queue every 2 seconds

/**
 * Resource Limiter manages system resources to prevent exhaustion
 */
class ResourceLimiter extends EventEmitter {
  constructor() {
    super();
    
    // Internal state
    this.activeTasks = 0;
    this.taskQueue = [];
    this.taskMap = new Map();
    this.nextTaskId = 1;
    
    // Start queue processor
    this.queueInterval = setInterval(() => this.processQueue(), CHECK_INTERVAL_MS);
    
    // Log initialization
    console.log(`ResourceLimiter initialized: Max concurrent tasks = ${MAX_CONCURRENT_TASKS}`);
  }
  
  /**
   * Check if the system is under heavy load
   * @returns {boolean} True if the system is under heavy load
   */
  isUnderHeavyLoad() {
    const memoryUsage = process.memoryUsage();
    const heapUsedPercent = memoryUsage.heapUsed / memoryUsage.heapTotal;
    
    return heapUsedPercent > MEMORY_THRESHOLD || this.activeTasks >= MAX_CONCURRENT_TASKS;
  }
  
  /**
   * Run a task with resource limits
   * @param {Function} taskFn - Function to run
   * @param {string} [taskName='anonymous'] - Name of the task for logging
   * @param {number} [timeout=TASK_TIMEOUT_MS] - Timeout in milliseconds
   * @returns {Promise<any>} Result of the task
   */
  async runTask(taskFn, taskName = 'anonymous', timeout = TASK_TIMEOUT_MS) {
    const taskId = `task-${this.nextTaskId++}`;
    
    return new Promise((resolve, reject) => {
      const taskRequest = {
        id: taskId,
        name: taskName,
        execute: async () => {
          try {
            const result = await taskFn();
            this.completeTask(taskId);
            resolve(result);
          } catch (error) {
            this.completeTask(taskId);
            reject(error);
          }
        },
        timeout,
        resolve,
        reject,
        queueTime: Date.now()
      };
      
      if (this.activeTasks < MAX_CONCURRENT_TASKS) {
        this.startTask(taskRequest);
      } else {
        console.log(`Task ${taskName} (${taskId}) queued, ${this.taskQueue.length} tasks waiting`);
        this.taskQueue.push(taskRequest);
      }
    });
  }
  
  /**
   * Start a task and set up its timeout
   * @param {Object} task - Task object
   * @private
   */
  startTask(task) {
    this.activeTasks++;
    
    // Set up timeout
    const timeoutId = setTimeout(() => {
      console.warn(`Task ${task.name} (${task.id}) timed out after ${task.timeout}ms`);
      this.completeTask(task.id);
      task.reject(new Error(`Task ${task.name} timed out after ${task.timeout}ms`));
    }, task.timeout);
    
    // Store task info
    this.taskMap.set(task.id, {
      ...task,
      timeoutId,
      startTime: Date.now()
    });
    
    // Execute the task
    task.execute();
  }
  
  /**
   * Complete a task and process next queued task
   * @param {string} taskId - ID of the task to complete
   * @private
   */
  completeTask(taskId) {
    const taskInfo = this.taskMap.get(taskId);
    
    if (taskInfo) {
      // Clear timeout if it exists
      if (taskInfo.timeoutId) {
        clearTimeout(taskInfo.timeoutId);
      }
      
      // Remove from tracking
      this.taskMap.delete(taskId);
      this.activeTasks = Math.max(0, this.activeTasks - 1);
      
      // Log completion time if it was a long-running task
      const executionTime = Date.now() - taskInfo.startTime;
      if (executionTime > 5000) {
        console.log(`Task ${taskInfo.name} completed in ${executionTime}ms`);
      }
      
      // Emit event for monitoring
      this.emit('task-completed', {
        id: taskId,
        name: taskInfo.name,
        queueTime: taskInfo.queueTime ? Date.now() - taskInfo.queueTime : 0,
        executionTime
      });
    }
  }
  
  /**
   * Process the task queue
   * @private
   */
  processQueue() {
    while (this.activeTasks < MAX_CONCURRENT_TASKS && this.taskQueue.length > 0) {
      const nextTask = this.taskQueue.shift();
      this.startTask(nextTask);
    }
  }
  
  /**
   * Get current resource utilization statistics
   * @returns {Object} Resource utilization stats
   */
  getStats() {
    const memoryUsage = process.memoryUsage();
    
    return {
      activeTasks: this.activeTasks,
      queuedTasks: this.taskQueue.length,
      maxTasks: MAX_CONCURRENT_TASKS,
      memoryUsage: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsedPercent: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
      },
      runningTasks: Array.from(this.taskMap.entries()).map(([id, info]) => ({
        id,
        name: info.name,
        runningTime: Math.round((Date.now() - info.startTime) / 1000) + 's'
      }))
    };
  }
  
  /**
   * Clean up resources
   */
  cleanup() {
    clearInterval(this.queueInterval);
    
    // Clear all timeouts
    for (const [id, info] of this.taskMap.entries()) {
      if (info.timeoutId) {
        clearTimeout(info.timeoutId);
      }
    }
    
    this.taskMap.clear();
    this.taskQueue = [];
    this.activeTasks = 0;
    
    console.log('ResourceLimiter: Resources cleaned up');
  }
}

// Create and export singleton instance
const resourceLimiter = new ResourceLimiter();

// Cleanup on process exit
process.on('exit', () => {
  resourceLimiter.cleanup();
});

// Graceful shutdown on termination signals
['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => {
    console.log(`${signal} received, cleaning up resources...`);
    resourceLimiter.cleanup();
  });
});

export default resourceLimiter;