/**
 * Health Monitor Shared Worker
 * 
 * This worker coordinates health monitoring and recovery across all open tabs
 * of the application. It maintains health status, manages coordinated recoveries,
 * and enables cross-tab communication.
 * 
 * CRITICAL STABILITY COMPONENT - DO NOT MODIFY WITHOUT THOROUGH TESTING
 */

// Store connected ports (one per tab)
const connectedPorts = new Map();

// Health status for all tabs
const tabStatus = new Map();

// Global health status
const healthStatus = {
  maintenanceMode: false,
  maintenanceModeReason: null,
  coordinated: {
    recoveryInProgress: false,
    recoveryLeaderTab: null,
    restartRequested: false,
    restartRequestTime: null
  },
  lastUpdated: Date.now()
};

// Track tab timeouts
const tabTimeouts = new Map();

// TAB TIMEOUT (milliseconds) - how long before a tab is considered inactive
const TAB_TIMEOUT = 30000; // 30 seconds

// Leader tab ID (first tab to connect becomes the leader)
let leaderTabId = null;

/**
 * Handle messages from connected tabs
 */
function handleMessage(event, port) {
  const { type, data } = event.data;
  const tabId = port.__tabId;
  
  switch (type) {
    case 'register':
      // Register a new tab
      registerTab(data.tabId, port, data);
      break;
      
    case 'heartbeat':
      // Update tab status
      updateTabStatus(tabId, data);
      break;
      
    case 'error':
      // Record error from a tab
      recordTabError(tabId, data);
      break;
      
    case 'get_health':
      // Send the latest health status to the requesting tab
      sendHealthStatus(port);
      break;
      
    case 'request_restart':
      // A tab has requested all tabs to restart
      handleRestartRequest(tabId, data.reason);
      break;
      
    case 'enable_maintenance_mode':
      // Enable maintenance mode
      setMaintenanceMode(true, data.reason);
      break;
      
    case 'disable_maintenance_mode':
      // Disable maintenance mode
      setMaintenanceMode(false);
      break;
      
    case 'recovery_complete':
      // A tab has completed recovery
      markTabRecoveryComplete(tabId);
      break;
      
    case 'start_coordinated_recovery':
      // Initiate coordinated recovery
      startCoordinatedRecovery(tabId, data.reason);
      break;
      
    default:
      console.log(`[Health Monitor Worker] Unknown message type: ${type}`);
  }
}

/**
 * Register a new tab
 */
function registerTab(tabId, port, data) {
  console.log(`[Health Monitor Worker] Registering tab: ${tabId}`);
  
  // Store the tab ID on the port
  port.__tabId = tabId;
  
  // Add port to connected ports
  connectedPorts.set(tabId, port);
  
  // Initialize tab status
  tabStatus.set(tabId, {
    status: 'healthy',
    url: data.url,
    registeredAt: Date.now(),
    lastHeartbeat: Date.now(),
    errors: [],
    ...data
  });
  
  // Set a timeout for this tab
  resetTabTimeout(tabId);
  
  // If we don't have a leader tab, make this the leader
  if (!leaderTabId || !connectedPorts.has(leaderTabId)) {
    leaderTabId = tabId;
  }
  
  // Let the tab know it's registered and if it's the leader
  port.postMessage({
    type: 'registered',
    data: {
      tabId,
      isRecoveryLeader: leaderTabId === tabId
    }
  });
  
  // Send the latest health status
  sendHealthStatus(port);
  
  // Broadcast updated tab count to all tabs
  broadcastHealthStatus();
}

/**
 * Update tab status from heartbeat
 */
function updateTabStatus(tabId, data) {
  if (!tabStatus.has(tabId)) {
    // Tab status not found, maybe it was cleaned up
    return;
  }
  
  // Update tab status
  const status = tabStatus.get(tabId);
  tabStatus.set(tabId, {
    ...status,
    ...data,
    lastHeartbeat: Date.now()
  });
  
  // Reset timeout for this tab
  resetTabTimeout(tabId);
}

/**
 * Record an error from a tab
 */
function recordTabError(tabId, data) {
  if (!tabStatus.has(tabId)) {
    // Tab status not found, maybe it was cleaned up
    return;
  }
  
  // Get current status
  const status = tabStatus.get(tabId);
  
  // Add error to the tab's error log
  const errors = status.errors || [];
  errors.push({
    message: data.message,
    stack: data.stack,
    severity: data.severity,
    timestamp: data.timestamp || Date.now()
  });
  
  // Keep only the latest 10 errors
  if (errors.length > 10) {
    errors.shift();
  }
  
  // Update tab status
  tabStatus.set(tabId, {
    ...status,
    status: data.severity === 'critical' ? 'error' : status.status,
    errors
  });
  
  // If this is a critical error, maybe start recovery
  if (data.severity === 'critical' && !healthStatus.coordinated.recoveryInProgress) {
    // If this tab is the leader, start coordinated recovery
    if (tabId === leaderTabId) {
      startCoordinatedRecovery(tabId, 'critical_error_in_leader');
    } else {
      // Otherwise let the leader know about the critical error
      const leaderPort = connectedPorts.get(leaderTabId);
      if (leaderPort) {
        leaderPort.postMessage({
          type: 'tab_critical_error',
          data: {
            tabId,
            error: data
          }
        });
      }
    }
  }
  
  // Broadcast updated status to all tabs
  broadcastHealthStatus();
}

/**
 * Reset the timeout for a tab
 */
function resetTabTimeout(tabId) {
  // Clear any existing timeout
  if (tabTimeouts.has(tabId)) {
    clearTimeout(tabTimeouts.get(tabId));
  }
  
  // Set a new timeout
  const timeout = setTimeout(() => {
    // Tab has timed out
    handleTabTimeout(tabId);
  }, TAB_TIMEOUT);
  
  // Store the timeout
  tabTimeouts.set(tabId, timeout);
}

/**
 * Handle a tab timing out
 */
function handleTabTimeout(tabId) {
  // Remove the tab
  removeTab(tabId, 'timeout');
}

/**
 * Remove a tab
 */
function removeTab(tabId, reason) {
  // Log the removal
  console.log(`[Health Monitor Worker] Removing tab: ${tabId} (reason: ${reason})`);
  
  // Remove from connected ports
  connectedPorts.delete(tabId);
  
  // Remove from tab status
  tabStatus.delete(tabId);
  
  // Clear timeout
  if (tabTimeouts.has(tabId)) {
    clearTimeout(tabTimeouts.get(tabId));
    tabTimeouts.delete(tabId);
  }
  
  // If this was the leader tab, elect a new leader
  if (tabId === leaderTabId) {
    electNewLeader();
  }
  
  // Broadcast updated tab count to all tabs
  broadcastHealthStatus();
}

/**
 * Elect a new leader tab
 */
function electNewLeader() {
  if (connectedPorts.size === 0) {
    // No tabs connected
    leaderTabId = null;
    return;
  }
  
  // Get the first tab ID
  leaderTabId = Array.from(connectedPorts.keys())[0];
  
  // Notify the new leader
  const leaderPort = connectedPorts.get(leaderTabId);
  if (leaderPort) {
    leaderPort.postMessage({
      type: 'recovery_leader_changed',
      data: {
        leaderTabId,
        reason: 'previous_leader_disconnected'
      }
    });
  }
  
  // Notify all tabs about the new leader
  connectedPorts.forEach((port, tabId) => {
    if (tabId !== leaderTabId) {
      port.postMessage({
        type: 'recovery_leader_changed',
        data: {
          leaderTabId,
          reason: 'previous_leader_disconnected'
        }
      });
    }
  });
}

/**
 * Send health status to a tab
 */
function sendHealthStatus(port) {
  // Calculate tab count
  const tabCount = connectedPorts.size;
  
  // Send health status
  port.postMessage({
    type: 'health_status',
    data: {
      tabCount,
      maintenanceMode: healthStatus.maintenanceMode,
      maintenanceModeReason: healthStatus.maintenanceModeReason,
      coordinated: healthStatus.coordinated,
      timestamp: Date.now()
    }
  });
}

/**
 * Broadcast health status to all tabs
 */
function broadcastHealthStatus() {
  // Calculate tab count
  const tabCount = connectedPorts.size;
  
  // Update last updated timestamp
  healthStatus.lastUpdated = Date.now();
  
  // Broadcast to all tabs
  connectedPorts.forEach((port) => {
    port.postMessage({
      type: 'health_status',
      data: {
        tabCount,
        maintenanceMode: healthStatus.maintenanceMode,
        maintenanceModeReason: healthStatus.maintenanceModeReason,
        coordinated: healthStatus.coordinated,
        timestamp: healthStatus.lastUpdated
      }
    });
  });
}

/**
 * Set maintenance mode
 */
function setMaintenanceMode(enabled, reason = null) {
  healthStatus.maintenanceMode = enabled;
  healthStatus.maintenanceModeReason = reason;
  
  // Broadcast to all tabs
  connectedPorts.forEach((port) => {
    port.postMessage({
      type: 'maintenance_mode_changed',
      data: {
        enabled,
        reason,
        timestamp: Date.now()
      }
    });
  });
  
  // Broadcast updated status
  broadcastHealthStatus();
}

/**
 * Start coordinated recovery
 */
function startCoordinatedRecovery(leaderTabId, reason) {
  // Only allow one recovery at a time
  if (healthStatus.coordinated.recoveryInProgress) {
    return;
  }
  
  console.log(`[Health Monitor Worker] Starting coordinated recovery (leader: ${leaderTabId}, reason: ${reason})`);
  
  // Update health status
  healthStatus.coordinated.recoveryInProgress = true;
  healthStatus.coordinated.recoveryLeaderTab = leaderTabId;
  
  // Broadcast to all tabs
  connectedPorts.forEach((port, tabId) => {
    port.postMessage({
      type: 'start_coordinated_recovery',
      data: {
        leaderTabId,
        reason,
        timestamp: Date.now()
      }
    });
  });
  
  // Broadcast updated status
  broadcastHealthStatus();
}

/**
 * Mark a tab as having completed recovery
 */
function markTabRecoveryComplete(tabId) {
  // If this is the leader tab, end the coordinated recovery
  if (tabId === healthStatus.coordinated.recoveryLeaderTab) {
    // End the recovery
    healthStatus.coordinated.recoveryInProgress = false;
    healthStatus.coordinated.recoveryLeaderTab = null;
    
    // Broadcast updated status
    broadcastHealthStatus();
  }
}

/**
 * Handle a restart request from a tab
 */
function handleRestartRequest(tabId, reason) {
  console.log(`[Health Monitor Worker] Restart requested by tab ${tabId} (reason: ${reason})`);
  
  // Set restart requested flag
  healthStatus.coordinated.restartRequested = true;
  healthStatus.coordinated.restartRequestTime = Date.now();
  
  // Broadcast to all tabs
  connectedPorts.forEach((port, id) => {
    port.postMessage({
      type: 'restart_requested',
      data: {
        tabId,
        reason,
        timestamp: Date.now()
      }
    });
  });
  
  // Broadcast updated status
  broadcastHealthStatus();
}

/**
 * Initialize the worker
 */
function initialize() {
  console.log('[Health Monitor Worker] Initializing health monitor shared worker');
  
  // Listen for connections
  self.addEventListener('connect', (event) => {
    const port = event.ports[0];
    
    // Listen for messages from this port
    port.addEventListener('message', (event) => {
      try {
        handleMessage(event, port);
      } catch (error) {
        console.error('[Health Monitor Worker] Error handling message:', error);
      }
    });
    
    // Start the port
    port.start();
  });
  
  // Set up periodic cleanup
  setInterval(() => {
    // Check for inactive tabs
    const now = Date.now();
    
    // Get tabs that haven't sent a heartbeat in a while
    tabStatus.forEach((status, tabId) => {
      if (now - status.lastHeartbeat > TAB_TIMEOUT) {
        // Tab has timed out
        handleTabTimeout(tabId);
      }
    });
  }, 10000); // Check every 10 seconds
}

// Initialize the worker
initialize();