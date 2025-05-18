/**
 * Process Service
 * 
 * This service provides a centralized way to manage child processes
 * in the TrialSage application. It prevents resource exhaustion by
 * properly controlling how many concurrent processes can run.
 */

import { spawn, exec } from 'child_process';
import resourceManager from '../middleware/resource-manager.js';

/**
 * Safely execute a command with resource management
 * @param {string} command - Command to execute
 * @param {Object} options - Options for child_process.exec
 * @returns {Promise<{stdout: string, stderr: string}>} - Execution results
 */
export async function executeCommand(command, options = {}) {
  const processName = `exec: ${command.substring(0, 40)}${command.length > 40 ? '...' : ''}`;
  
  return resourceManager.runProcess(() => {
    return new Promise((resolve, reject) => {
      const childProcess = exec(command, options, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }, processName);
}

/**
 * Safely spawn a process with resource management
 * @param {string} command - Command to spawn
 * @param {Array} args - Command arguments
 * @param {Object} options - Options for child_process.spawn
 * @returns {Promise<Object>} - Child process with managed resources
 */
export async function spawnProcess(command, args = [], options = {}) {
  const processName = `spawn: ${command} ${args.join(' ').substring(0, 30)}`;
  
  return resourceManager.runProcess(() => {
    return new Promise((resolve, reject) => {
      try {
        const childProcess = spawn(command, args, {
          ...options,
          stdio: options.stdio || 'pipe'
        });
        
        // Handle errors
        childProcess.on('error', (error) => {
          reject(error);
        });
        
        // Resolve with the child process
        resolve(childProcess);
      } catch (error) {
        reject(error);
      }
    });
  }, processName);
}

/**
 * Execute a Python script with resource management
 * @param {string} scriptPath - Path to Python script
 * @param {Array} args - Script arguments
 * @param {Object} options - Extra options
 * @returns {Promise<{exitCode: number, stdout: string, stderr: string}>} - Execution results
 */
export async function executePythonScript(scriptPath, args = [], options = {}) {
  const scriptName = scriptPath.split('/').pop();
  const processName = `python: ${scriptName}`;
  
  return resourceManager.runProcess(() => {
    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';
      
      try {
        const pythonProcess = spawn('python3', [scriptPath, ...args], {
          ...options,
          stdio: 'pipe'
        });
        
        // Collect stdout
        pythonProcess.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        
        // Collect stderr
        pythonProcess.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        // Handle completion
        pythonProcess.on('close', (exitCode) => {
          resolve({ exitCode, stdout, stderr });
        });
        
        // Handle errors
        pythonProcess.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }, processName);
}

/**
 * Get current process resource usage stats
 * @returns {Object} - Current resource usage statistics
 */
export function getProcessStats() {
  const memUsage = process.memoryUsage();
  
  return {
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024)
    },
    processes: resourceManager.getStatus(),
    system: {
      loadAvg: process.resourceUsage(),
      uptime: process.uptime()
    }
  };
}

// Default export for easy importing
export default {
  executeCommand,
  spawnProcess,
  executePythonScript,
  getProcessStats
};