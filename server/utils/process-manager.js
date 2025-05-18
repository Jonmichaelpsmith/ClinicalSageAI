/**
 * Process Manager
 * 
 * This module provides centralized management for child processes in the TrialSage application.
 * It prevents resource exhaustion by limiting the number of concurrent processes,
 * implementing timeouts, and providing graceful cleanup.
 */

import { spawn, exec } from 'child_process';
import { EventEmitter } from 'events';
import os from 'os';

// Configuration - adjust based on environment constraints
const MAX_CONCURRENT_PROCESSES = Math.max(2, Math.min(os.cpus().length - 1, 3));
const PROCESS_TIMEOUT_MS = 30000; // 30 seconds default timeout
const QUEUE_CHECK_INTERVAL_MS = 500;

class ProcessManager extends EventEmitter {
  constructor() {
    super();
    
    this.activeProcesses = 0;
    this.processRegistry = new Map();
    this.processQueue = [];
    this.processId = 0;
    
    this.checkQueueInterval = setInterval(() => this.processQueue.length > 0 && this.checkQueue(), 
                                        QUEUE_CHECK_INTERVAL_MS);
    
    console.log(`ProcessManager initialized: Max concurrent processes = ${MAX_CONCURRENT_PROCESSES}`);
  }
  
  /**
   * Execute a command with managed resources
   * @param {string} command - Command to execute
   * @param {Object} options - Options for child_process.exec
   * @param {number} [timeout] - Timeout in milliseconds
   * @returns {Promise<{stdout: string, stderr: string}>} - Process output
   */
  async execCommand(command, options = {}, timeout = PROCESS_TIMEOUT_MS) {
    const processId = `exec-${++this.processId}`;
    
    return new Promise((resolve, reject) => {
      this.queueProcess({
        id: processId,
        type: 'exec',
        command,
        execute: () => {
          const childProcess = exec(command, options);
          let stdout = '';
          let stderr = '';
          
          childProcess.stdout?.on('data', (data) => {
            stdout += data;
          });
          
          childProcess.stderr?.on('data', (data) => {
            stderr += data;
          });
          
          const timeoutId = setTimeout(() => {
            this.killProcess(childProcess, processId);
            reject(new Error(`Process timeout after ${timeout}ms: ${command}`));
          }, timeout);
          
          childProcess.on('close', (code) => {
            clearTimeout(timeoutId);
            this.releaseProcess(processId);
            
            if (code === 0) {
              resolve({ stdout, stderr });
            } else {
              reject(new Error(`Process exited with code ${code}: ${stderr}`));
            }
          });
          
          childProcess.on('error', (err) => {
            clearTimeout(timeoutId);
            this.releaseProcess(processId);
            reject(err);
          });
          
          // Register for cleanup
          this.processRegistry.set(processId, {
            process: childProcess,
            timeoutId,
            startTime: Date.now(),
            command
          });
          
          return childProcess;
        }
      });
    });
  }
  
  /**
   * Spawn a command with managed resources
   * @param {string} command - Command to spawn
   * @param {string[]} args - Command arguments
   * @param {Object} options - Options for child_process.spawn
   * @param {number} [timeout] - Timeout in milliseconds
   * @returns {Promise<Object>} - Resolves with child process object when ready
   */
  async spawnProcess(command, args = [], options = {}, timeout = PROCESS_TIMEOUT_MS) {
    const processId = `spawn-${++this.processId}`;
    
    return new Promise((resolve, reject) => {
      this.queueProcess({
        id: processId,
        type: 'spawn',
        command: `${command} ${args.join(' ')}`,
        execute: () => {
          const childProcess = spawn(command, args, options);
          
          const timeoutId = setTimeout(() => {
            this.killProcess(childProcess, processId);
            reject(new Error(`Process timeout after ${timeout}ms: ${command}`));
          }, timeout);
          
          // Handle process events
          childProcess.on('error', (err) => {
            clearTimeout(timeoutId);
            this.releaseProcess(processId);
            reject(err);
          });
          
          // Register process for cleanup
          this.processRegistry.set(processId, {
            process: childProcess,
            timeoutId,
            startTime: Date.now(),
            command: `${command} ${args.join(' ')}`
          });
          
          // Add a method to gracefully release the process when done
          childProcess.releaseResources = () => {
            clearTimeout(timeoutId);
            this.releaseProcess(processId);
          };
          
          // Resolve with the child process instance
          resolve(childProcess);
        }
      });
    });
  }
  
  /**
   * Queue a process for execution
   * @param {Object} processRequest - Process request details
   * @private
   */
  queueProcess(processRequest) {
    if (this.activeProcesses < MAX_CONCURRENT_PROCESSES) {
      this.activeProcesses++;
      processRequest.execute();
    } else {
      console.log(`Process queued: ${processRequest.command} (active: ${this.activeProcesses})`);
      this.processQueue.push(processRequest);
    }
  }
  
  /**
   * Check the process queue and execute next process if possible
   * @private
   */
  checkQueue() {
    if (this.activeProcesses < MAX_CONCURRENT_PROCESSES && this.processQueue.length > 0) {
      const nextProcess = this.processQueue.shift();
      this.activeProcesses++;
      nextProcess.execute();
    }
  }
  
  /**
   * Release a process resource
   * @param {string} processId - Process ID to release
   * @private
   */
  releaseProcess(processId) {
    this.processRegistry.delete(processId);
    this.activeProcesses = Math.max(0, this.activeProcesses - 1);
    this.emit('process-completed', processId);
    this.checkQueue();
  }
  
  /**
   * Kill a running process
   * @param {Object} childProcess - Child process to kill
   * @param {string} processId - Process ID to release
   * @private
   */
  killProcess(childProcess, processId) {
    try {
      childProcess.kill('SIGTERM');
      
      // Force kill after a short delay if still running
      setTimeout(() => {
        try {
          if (childProcess.exitCode === null) {
            childProcess.kill('SIGKILL');
          }
        } catch (e) {
          // Process may already be gone
        }
      }, 1000);
      
      this.releaseProcess(processId);
    } catch (e) {
      console.error(`Error killing process ${processId}:`, e);
    }
  }
  
  /**
   * Get current process status
   * @returns {Object} - Current process status
   */
  getStatus() {
    const running = Array.from(this.processRegistry.entries()).map(([id, info]) => {
      return {
        id,
        command: info.command,
        runningTime: Math.round((Date.now() - info.startTime) / 1000) + 's'
      };
    });
    
    return {
      activeProcesses: this.activeProcesses,
      maxProcesses: MAX_CONCURRENT_PROCESSES,
      queueLength: this.processQueue.length,
      running
    };
  }
  
  /**
   * Clean up resources when shutting down
   */
  cleanup() {
    clearInterval(this.checkQueueInterval);
    
    // Kill all running processes
    for (const [id, info] of this.processRegistry.entries()) {
      try {
        clearTimeout(info.timeoutId);
        info.process.kill('SIGTERM');
      } catch (e) {
        console.error(`Error cleaning up process ${id}:`, e);
      }
    }
    
    this.processRegistry.clear();
    this.processQueue = [];
    this.activeProcesses = 0;
    
    console.log('ProcessManager: All processes cleaned up');
  }
}

// Create and export singleton instance
const processManager = new ProcessManager();

// Handle process shutdown
process.on('exit', () => {
  processManager.cleanup();
});

['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => {
    console.log(`${signal} received, cleaning up processes...`);
    processManager.cleanup();
  });
});

export default processManager;