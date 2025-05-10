/**
 * Health Monitor Shared Worker
 * 
 * This shared worker monitors application health across multiple tabs,
 * enabling coordinated recovery actions and cross-tab communication.
 * 
 * CRITICAL STABILITY COMPONENT - DO NOT MODIFY WITHOUT THOROUGH TESTING
 */

// Health status for all connected tabs
const tabHealth = new Map();

// Connected ports (tabs)
const connectedPorts = new Map();

// Timestamp of last health check
let lastHealthCheck = Date.now();

// Application global state
const appState = {
  restartRequested: false,
  restartRequestTime: null,
  coordinatedRecoveryInProgress: false,
  recoveryLeaderTab: null,
  globalErrors: [],
  maintenanceMode: false
};

/**
 * Handle messages from connected tabs
 */
function handleMessage(message, port) {
  const portId = connectedPorts.get(port);
  
  switch (message.type) {
    case 'register':
      // Register a new tab
      registerTab(message.data, port);
      break;
      
    case 'heartbeat':
      // Update tab health status
      updateTabHealth(portId, message.data);
      break;
      
    case 'error':
      // Record an error
      recordError(portId, message.data);
      break;
      
    case 'request_restart':
      // Request a coordinated restart
      requestRestart(portId, message.data);
      break;
      
    case 'recovery_complete':
      // Mark recovery as complete for a tab
      markRecoveryComplete(portId);
      break;
      
    case 'get_health':
      // Send back health status
      sendHealthStatus(port);
      break;
      
    case 'enable_maintenance_mode':
      // Enable maintenance mode
      setMaintenanceMode(true, message.data?.reason);
      break;
      
    case 'disable_maintenance_mode':
      // Disable maintenance mode
      setMaintenanceMode(false);
      break;
      
    default:
      console.warn(`Unknown message type: ${message.type}`);
  }
}

/**
 * Register a new tab
 */
function registerTab(data, port) {
  const tabId = data.tabId || `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Store the port for this tab
  connectedPorts.set(port, tabId);
  
  // Initialize health status for this tab
  tabHealth.set(tabId, {
    tabId,
    url: data.url || 'unknown',
    lastHeartbeat: Date.now(),
    status: 'healthy',
    errors: [],
    memoryUsage: data.memoryUsage || null,
    networkStatus: data.networkStatus || { isOnline: true },
    recoveryAttempts: 0,
    startTime: Date.now()
  });
  
  // Set up event listener for when the port disconnects
  port.addEventListener('close', () => {
    tabHealth.delete(tabId);
    connectedPorts.delete(port);
    console.log(`Tab ${tabId} disconnected. ${connectedPorts.size} tabs remaining.`);
  });
  
  // Send initial status to the new tab
  sendMessage(port, {
    type: 'registered',
    data: {
      tabId,
      maintenanceMode: appState.maintenanceMode,
      tabCount: tabHealth.size,
      isRecoveryLeader: appState.recoveryLeaderTab === tabId
    }
  });
  
  console.log(`Tab ${tabId} registered. ${tabHealth.size} tabs connected.`);
}

/**
 * Update tab health status
 */
function updateTabHealth(tabId, data) {
  if (!tabHealth.has(tabId)) {
    return;
  }
  
  const tab = tabHealth.get(tabId);
  
  // Update health information
  tab.lastHeartbeat = Date.now();
  tab.status = data.status || tab.status;
  tab.url = data.url || tab.url;
  tab.memoryUsage = data.memoryUsage || tab.memoryUsage;
  tab.networkStatus = data.networkStatus || tab.networkStatus;
  
  tabHealth.set(tabId, tab);
}

/**
 * Record an error for a tab
 */
function recordError(tabId, errorData) {
  if (!tabHealth.has(tabId)) {
    return;
  }
  
  const tab = tabHealth.get(tabId);
  
  // Add the error with a timestamp
  const error = {
    ...errorData,
    timestamp: Date.now(),
    tabId
  };
  
  tab.errors.push(error);
  
  // Keep only the last 10 errors
  if (tab.errors.length > 10) {
    tab.errors.shift();
  }
  
  // Add to global errors if it's a critical error
  if (errorData.severity === 'critical') {
    appState.globalErrors.push(error);
    
    // Keep only the last 50 global errors
    if (appState.globalErrors.length > 50) {
      appState.globalErrors.shift();
    }
    
    // Check if we need to trigger a coordinated recovery
    checkForCoordinatedRecovery(error);
  }
  
  tabHealth.set(tabId, tab);
}

/**
 * Check if we need to trigger a coordinated recovery
 */
function checkForCoordinatedRecovery(latestError) {
  // Don't trigger recovery if one is already in progress
  if (appState.coordinatedRecoveryInProgress) {
    return;
  }
  
  // Check for error patterns that would require a coordinated recovery
  const now = Date.now();
  const recentErrors = appState.globalErrors.filter(e => now - e.timestamp < 60000); // Last minute
  
  // If we have multiple critical errors in a short time across tabs
  if (recentErrors.length >= 3) {
    // Check if they're from different tabs
    const tabsWithErrors = new Set(recentErrors.map(e => e.tabId));
    
    if (tabsWithErrors.size >= 2) {
      // This indicates a systemic issue affecting multiple tabs
      startCoordinatedRecovery('multiple_critical_errors');
    }
  }
  
  // Check for specific error types that always trigger recovery
  if (latestError && 
      (latestError.message?.includes('memory') || 
       latestError.message?.includes('storage quota'))) {
    startCoordinatedRecovery('memory_issue');
  }
}

/**
 * Start a coordinated recovery process
 */
function startCoordinatedRecovery(reason) {
  // Don't start if already in progress
  if (appState.coordinatedRecoveryInProgress) {
    return;
  }
  
  console.warn(`Starting coordinated recovery due to: ${reason}`);
  
  appState.coordinatedRecoveryInProgress = true;
  
  // Select a tab to lead the recovery (preferably the oldest/most stable one)
  selectRecoveryLeader();
  
  // Notify all tabs
  broadcastMessage({
    type: 'start_coordinated_recovery',
    data: {
      reason,
      leaderTabId: appState.recoveryLeaderTab,
      timestamp: Date.now()
    }
  });
}

/**
 * Select a tab to lead the recovery process
 */
function selectRecoveryLeader() {
  if (tabHealth.size === 0) {
    appState.recoveryLeaderTab = null;
    return;
  }
  
  // Find the oldest tab that's still healthy
  const now = Date.now();
  let oldestTab = null;
  let oldestTime = Infinity;
  
  for (const [tabId, tab] of tabHealth.entries()) {
    // Skip tabs that haven't sent a heartbeat recently
    if (now - tab.lastHeartbeat > 10000) {
      continue;
    }
    
    // Skip tabs with too many errors
    if (tab.errors.length > 5) {
      continue;
    }
    
    if (tab.startTime < oldestTime) {
      oldestTime = tab.startTime;
      oldestTab = tabId;
    }
  }
  
  // If we couldn't find a suitable tab, use any tab
  if (!oldestTab && tabHealth.size > 0) {
    oldestTab = Array.from(tabHealth.keys())[0];
  }
  
  appState.recoveryLeaderTab = oldestTab;
}

/**
 * Request a restart
 */
function requestRestart(tabId, data) {
  // Record the restart request
  appState.restartRequested = true;
  appState.restartRequestTime = Date.now();
  
  // Broadcast to all tabs
  broadcastMessage({
    type: 'restart_requested',
    data: {
      tabId,
      reason: data?.reason || 'unknown',
      timestamp: Date.now()
    }
  });
}

/**
 * Mark recovery as complete for a tab
 */
function markRecoveryComplete(tabId) {
  if (!tabHealth.has(tabId)) {
    return;
  }
  
  // If this is the recovery leader, end the recovery process
  if (tabId === appState.recoveryLeaderTab) {
    appState.coordinatedRecoveryInProgress = false;
    
    // Broadcast to all tabs
    broadcastMessage({
      type: 'recovery_complete',
      data: {
        timestamp: Date.now()
      }
    });
  }
}

/**
 * Send health status to a tab
 */
function sendHealthStatus(port) {
  const healthStatus = {
    tabCount: tabHealth.size,
    maintenanceMode: appState.maintenanceMode,
    coordinated: {
      recoveryInProgress: appState.coordinatedRecoveryInProgress,
      recoveryLeaderTab: appState.recoveryLeaderTab,
      restartRequested: appState.restartRequested,
      restartRequestTime: appState.restartRequestTime,
    },
    globalErrors: appState.globalErrors.slice(-5), // Send last 5 global errors
    timestamp: Date.now()
  };
  
  sendMessage(port, {
    type: 'health_status',
    data: healthStatus
  });
}

/**
 * Set maintenance mode
 */
function setMaintenanceMode(enabled, reason) {
  appState.maintenanceMode = enabled;
  
  // Broadcast to all tabs
  broadcastMessage({
    type: 'maintenance_mode_changed',
    data: {
      enabled,
      reason,
      timestamp: Date.now()
    }
  });
}

/**
 * Send a message to a specific port
 */
function sendMessage(port, message) {
  try {
    port.postMessage(message);
  } catch (error) {
    console.error('Error sending message to port:', error);
  }
}

/**
 * Broadcast a message to all connected tabs
 */
function broadcastMessage(message) {
  for (const port of connectedPorts.keys()) {
    sendMessage(port, message);
  }
}

/**
 * Check for stale tabs
 */
function checkStaleTabs() {
  const now = Date.now();
  
  for (const [tabId, tab] of tabHealth.entries()) {
    // If the tab hasn't sent a heartbeat in 15 seconds, consider it stale
    if (now - tab.lastHeartbeat > 15000) {
      // If this was the recovery leader, choose a new one
      if (tabId === appState.recoveryLeaderTab) {
        selectRecoveryLeader();
        
        // Notify all tabs of the new leader
        if (appState.coordinatedRecoveryInProgress) {
          broadcastMessage({
            type: 'recovery_leader_changed',
            data: {
              leaderTabId: appState.recoveryLeaderTab,
              timestamp: Date.now()
            }
          });
        }
      }
      
      // Remove the stale tab
      tabHealth.delete(tabId);
    }
  }
}

/**
 * Perform regular health check
 */
function performHealthCheck() {
  lastHealthCheck = Date.now();
  
  // Check for stale tabs
  checkStaleTabs();
  
  // If there are no tabs, reset the app state
  if (tabHealth.size === 0) {
    appState.coordinatedRecoveryInProgress = false;
    appState.recoveryLeaderTab = null;
  }
  
  // End recovery process if it's been active too long
  if (appState.coordinatedRecoveryInProgress) {
    // If recovery has been in progress for more than 5 minutes, force-end it
    const recoveryStartTime = appState.globalErrors
      .filter(e => e.timestamp > Date.now() - 300000)
      .sort((a, b) => a.timestamp - b.timestamp)[0]?.timestamp;
      
    if (recoveryStartTime && Date.now() - recoveryStartTime > 300000) {
      console.warn('Force-ending coordinated recovery after timeout');
      appState.coordinatedRecoveryInProgress = false;
      
      // Broadcast to all tabs
      broadcastMessage({
        type: 'recovery_timeout',
        data: {
          timestamp: Date.now()
        }
      });
    }
  }
}

// Set up event handlers for incoming connections
self.addEventListener('connect', (e) => {
  const port = e.ports[0];
  port.addEventListener('message', (event) => {
    handleMessage(event.data, port);
  });
  port.start();
});

// Set up periodic health checks
setInterval(performHealthCheck, 5000); // Every 5 seconds

console.log('Health monitor shared worker initialized');