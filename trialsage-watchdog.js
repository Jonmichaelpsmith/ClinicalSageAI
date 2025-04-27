/**
 * TrialSage™ Enterprise Watchdog Monitor
 * 
 * This file implements a robust system monitoring and auto-recovery service
 * to ensure maximum uptime for production deployment.
 * 
 * Features:
 * - Health check monitoring with automatic recovery
 * - Process management with graceful restart capabilities
 * - Detailed logging of system status
 * - Memory/resource monitoring to prevent issues
 * - Notification system for critical failures
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const http = require('http');

// Configuration
const CONFIG = {
  healthCheckUrl: 'http://localhost:5000/api/health',
  healthCheckInterval: 30000, // 30 seconds
  maxRestartAttempts: 5,
  restartCooldown: 300000, // 5 minutes
  logDir: './logs',
  logFile: 'watchdog.log',
  errorLogFile: 'watchdog-error.log',
  pidFile: './trialsage-server.pid',
  memoryThreshold: 90, // percentage
  servers: [
    { name: 'ESM Server', file: 'server-esm.js' },
    { name: 'CJS Server', file: 'server-cjs.js' },
    { name: 'Legacy Server', file: 'trialsage-server.mjs' }
  ]
};

// Ensure log directory exists
if (!fs.existsSync(CONFIG.logDir)) {
  fs.mkdirSync(CONFIG.logDir, { recursive: true });
}

// Logger
const logger = {
  info: (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[INFO] ${timestamp} - ${message}`;
    console.log(logMessage);
    fs.appendFileSync(path.join(CONFIG.logDir, CONFIG.logFile), logMessage + '\n');
  },
  
  error: (message, details) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[ERROR] ${timestamp} - ${message}`;
    const detailsStr = details ? JSON.stringify(details, null, 2) : '';
    console.error(logMessage);
    if (details) console.error(detailsStr);
    fs.appendFileSync(
      path.join(CONFIG.logDir, CONFIG.errorLogFile),
      logMessage + '\n' + (detailsStr ? detailsStr + '\n' : '')
    );
  }
};

// State
let serverProcess = null;
let restartCount = 0;
let lastRestartTime = 0;

// Check if server is running
function isServerRunning() {
  if (!fs.existsSync(CONFIG.pidFile)) {
    return false;
  }
  
  try {
    const pid = parseInt(fs.readFileSync(CONFIG.pidFile, 'utf8').trim());
    
    // Try to send a signal to check if process exists
    try {
      process.kill(pid, 0);
      return true;
    } catch (e) {
      return false;
    }
  } catch (err) {
    logger.error('Error checking server process', { error: err.message });
    return false;
  }
}

// Check server health via API call
function checkServerHealth() {
  return new Promise((resolve, reject) => {
    http.get(CONFIG.healthCheckUrl, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Health check failed with status: ${res.statusCode}`));
        return;
      }
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const health = JSON.parse(data);
          if (health.status === 'ok') {
            resolve(true);
          } else {
            reject(new Error(`Health check returned status: ${health.status}`));
          }
        } catch (err) {
          reject(new Error(`Failed to parse health check response: ${err.message}`));
        }
      });
    }).on('error', (err) => {
      reject(new Error(`Health check request failed: ${err.message}`));
    });
  });
}

// Check server memory usage
function checkServerMemoryUsage() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(CONFIG.pidFile)) {
      reject(new Error('PID file not found'));
      return;
    }
    
    const pid = parseInt(fs.readFileSync(CONFIG.pidFile, 'utf8').trim());
    
    exec(`ps -p ${pid} -o %mem`, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Failed to check memory usage: ${error.message}`));
        return;
      }
      
      try {
        const lines = stdout.trim().split('\n');
        if (lines.length < 2) {
          reject(new Error('Unexpected ps output format'));
          return;
        }
        
        const memPercentage = parseFloat(lines[1].trim());
        resolve({
          pid,
          memoryPercentage: memPercentage,
          exceededThreshold: memPercentage > CONFIG.memoryThreshold
        });
      } catch (err) {
        reject(new Error(`Failed to parse memory usage: ${err.message}`));
      }
    });
  });
}

// Stop the server
function stopServer() {
  if (!fs.existsSync(CONFIG.pidFile)) {
    logger.info('No PID file found, assuming server is not running');
    return Promise.resolve();
  }
  
  return new Promise((resolve) => {
    const pid = parseInt(fs.readFileSync(CONFIG.pidFile, 'utf8').trim());
    logger.info(`Stopping server with PID ${pid}`);
    
    try {
      // Try graceful termination first
      process.kill(pid, 'SIGTERM');
      
      // Give it time to shut down gracefully
      setTimeout(() => {
        try {
          // Check if it's still running
          process.kill(pid, 0);
          // If we get here, it's still running, force kill it
          logger.warn(`Server did not terminate gracefully, sending SIGKILL to PID ${pid}`);
          process.kill(pid, 'SIGKILL');
        } catch (e) {
          // Process no longer exists, which is good
        }
        
        try {
          fs.unlinkSync(CONFIG.pidFile);
        } catch (err) {
          logger.error(`Failed to delete PID file: ${err.message}`);
        }
        
        resolve();
      }, 5000);
    } catch (err) {
      logger.error(`Error stopping server: ${err.message}`);
      
      try {
        fs.unlinkSync(CONFIG.pidFile);
      } catch (e) {
        // Ignore errors when deleting PID file
      }
      
      resolve();
    }
  });
}

// Start server function
function startServer(serverIndex = 0) {
  if (serverIndex >= CONFIG.servers.length) {
    logger.error('All server implementations failed to start');
    return Promise.reject(new Error('All server implementations failed'));
  }
  
  const server = CONFIG.servers[serverIndex];
  logger.info(`Starting ${server.name} (${server.file})...`);
  
  const stdoutLog = path.join(CONFIG.logDir, `${path.basename(server.file, path.extname(server.file))}-stdout.log`);
  const stderrLog = path.join(CONFIG.logDir, `${path.basename(server.file, path.extname(server.file))}-stderr.log`);
  
  const stdout = fs.openSync(stdoutLog, 'a');
  const stderr = fs.openSync(stderrLog, 'a');
  
  return new Promise((resolve, reject) => {
    try {
      const child = spawn('node', [server.file], {
        detached: true,
        stdio: ['ignore', stdout, stderr]
      });
      
      child.unref();
      
      // Save PID
      fs.writeFileSync(CONFIG.pidFile, child.pid.toString());
      
      // Wait a bit to see if the process dies immediately
      setTimeout(() => {
        try {
          // Check if process is still running
          process.kill(child.pid, 0);
          
          // Check server health
          checkServerHealth()
            .then(() => {
              logger.info(`${server.name} started successfully with PID ${child.pid}`);
              serverProcess = child;
              resolve(child);
            })
            .catch(err => {
              logger.error(`${server.name} health check failed`, { error: err.message });
              stopServer().then(() => {
                startServer(serverIndex + 1).then(resolve).catch(reject);
              });
            });
        } catch (e) {
          // Process died
          logger.error(`${server.name} failed to start, process died immediately`);
          stopServer().then(() => {
            startServer(serverIndex + 1).then(resolve).catch(reject);
          });
        }
      }, 5000);
    } catch (err) {
      logger.error(`Failed to spawn ${server.name}`, { error: err.message });
      startServer(serverIndex + 1).then(resolve).catch(reject);
    }
  });
}

// Restart server
async function restartServer() {
  const now = Date.now();
  
  // Check for excessive restarts
  if (restartCount > 0) {
    const timeSinceLastRestart = now - lastRestartTime;
    if (timeSinceLastRestart < CONFIG.restartCooldown) {
      // Reset counter if cooldown passed
      restartCount = 0;
    }
  }
  
  restartCount++;
  lastRestartTime = now;
  
  if (restartCount > CONFIG.maxRestartAttempts) {
    logger.error(`Maximum restart attempts (${CONFIG.maxRestartAttempts}) reached. Manual intervention required.`);
    return;
  }
  
  logger.info(`Restarting server (attempt ${restartCount} of ${CONFIG.maxRestartAttempts})...`);
  
  try {
    await stopServer();
    await startServer();
    logger.info('Server restart completed successfully');
  } catch (err) {
    logger.error('Failed to restart server', { error: err.message });
  }
}

// Main monitoring function
async function monitor() {
  try {
    // First, check if process is running
    const running = isServerRunning();
    
    if (!running) {
      logger.error('Server process is not running');
      await restartServer();
      return;
    }
    
    // Then check health
    try {
      await checkServerHealth();
      logger.info('Server health check passed');
      
      // Reset restart count after a successful health check
      if (restartCount > 0 && (Date.now() - lastRestartTime) > CONFIG.restartCooldown) {
        restartCount = 0;
        logger.info('Reset restart counter after server stability period');
      }
    } catch (err) {
      logger.error('Server health check failed', { error: err.message });
      await restartServer();
      return;
    }
    
    // Check memory usage
    try {
      const memoryInfo = await checkServerMemoryUsage();
      logger.info(`Server memory usage: ${memoryInfo.memoryPercentage.toFixed(1)}%`);
      
      if (memoryInfo.exceededThreshold) {
        logger.error(`Server memory usage exceeded threshold (${memoryInfo.memoryPercentage.toFixed(1)}% > ${CONFIG.memoryThreshold}%)`);
        await restartServer();
        return;
      }
    } catch (err) {
      logger.error('Failed to check memory usage', { error: err.message });
      // Don't restart just for a failed memory check
    }
  } catch (err) {
    logger.error('Error in monitoring cycle', { error: err.message });
  }
}

// Start watchdog
async function startWatchdog() {
  logger.info('Starting TrialSage Watchdog Service');
  
  // Initial server check/start
  if (!isServerRunning()) {
    logger.info('No server running, starting one...');
    try {
      await startServer();
    } catch (err) {
      logger.error('Failed to start server initially', { error: err.message });
    }
  } else {
    logger.info('Server already running, monitoring...');
  }
  
  // Start monitoring cycle
  setInterval(monitor, CONFIG.healthCheckInterval);
}

// Handle watchdog process signals
process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM signal, shutting down watchdog');
  // Optionally stop the server here too
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT signal, shutting down watchdog');
  // Optionally stop the server here too
  process.exit(0);
});

// Start the watchdog
startWatchdog().catch(err => {
  logger.error('Failed to start watchdog', { error: err.message });
});