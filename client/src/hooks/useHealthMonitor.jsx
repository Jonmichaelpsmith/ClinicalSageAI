/**
 * Health Monitor Hook
 * 
 * This hook provides access to the health monitor shared worker for
 * cross-tab communication and coordinated recovery.
 * 
 * CRITICAL STABILITY COMPONENT - DO NOT MODIFY WITHOUT THOROUGH TESTING
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook for interacting with the health monitor shared worker
 * 
 * @param {Object} options - Hook configuration
 * @param {Object} options.initialStatus - Initial status to report
 * @param {Function} options.onRecoveryRequest - Callback when recovery is requested
 * @param {Function} options.onMaintenanceModeChange - Callback when maintenance mode changes
 * @returns {Object} - Health monitor utilities and state
 */
export default function useHealthMonitor({
  initialStatus = {},
  onRecoveryRequest = null,
  onMaintenanceModeChange = null
} = {}) {
  // Reference to the shared worker
  const workerRef = useRef(null);
  
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  
  // Tab ID assigned by the worker
  const [tabId, setTabId] = useState(null);
  
  // Health status received from the worker
  const [healthStatus, setHealthStatus] = useState({
    tabCount: 0,
    maintenanceMode: false,
    coordinated: {
      recoveryInProgress: false,
      recoveryLeaderTab: null,
      restartRequested: false,
      restartRequestTime: null
    },
    timestamp: Date.now()
  });
  
  // Whether this tab is the recovery leader
  const [isRecoveryLeader, setIsRecoveryLeader] = useState(false);
  
  // Create or connect to the shared worker
  useEffect(() => {
    let worker = null;
    
    try {
      // Create the worker if supported
      if (typeof SharedWorker !== 'undefined') {
        worker = new SharedWorker('/src/workers/healthMonitor.worker.js', { name: 'health-monitor' });
        
        worker.port.addEventListener('message', handleWorkerMessage);
        worker.port.start();
        
        // Register with the worker
        registerWithWorker(worker.port);
        
        workerRef.current = worker;
        setIsConnected(true);
        
        console.log('Connected to health monitor shared worker');
      } else {
        console.warn('SharedWorker is not supported in this browser. Cross-tab health monitoring disabled.');
      }
    } catch (error) {
      console.error('Failed to connect to health monitor shared worker:', error);
    }
    
    // Clean up when the component unmounts
    return () => {
      if (worker) {
        try {
          worker.port.close();
        } catch (error) {
          console.error('Error closing worker port:', error);
        }
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount
  
  /**
   * Handle messages from the worker
   */
  const handleWorkerMessage = useCallback((event) => {
    const { type, data } = event.data;
    
    switch (type) {
      case 'registered':
        // We've been registered with the worker
        setTabId(data.tabId);
        setIsRecoveryLeader(data.isRecoveryLeader);
        break;
        
      case 'health_status':
        // Update health status
        setHealthStatus(data);
        break;
        
      case 'start_coordinated_recovery':
        // A coordinated recovery has been requested
        setIsRecoveryLeader(data.leaderTabId === tabId);
        
        // If we have a callback for recovery requests, call it
        if (onRecoveryRequest) {
          onRecoveryRequest({
            reason: data.reason,
            isLeader: data.leaderTabId === tabId,
            timestamp: data.timestamp
          });
        }
        break;
        
      case 'recovery_leader_changed':
        // The recovery leader has changed
        setIsRecoveryLeader(data.leaderTabId === tabId);
        break;
        
      case 'maintenance_mode_changed':
        // Maintenance mode has changed
        if (onMaintenanceModeChange) {
          onMaintenanceModeChange({
            enabled: data.enabled,
            reason: data.reason,
            timestamp: data.timestamp
          });
        }
        break;
        
      case 'restart_requested':
        // A restart has been requested
        if (data.tabId !== tabId) {
          console.log(`Restart requested by tab ${data.tabId} for reason: ${data.reason}`);
          
          // If we have a callback for recovery requests, call it
          if (onRecoveryRequest) {
            onRecoveryRequest({
              reason: data.reason,
              isLeader: false,
              isRestart: true,
              timestamp: data.timestamp
            });
          }
        }
        break;
        
      default:
        console.log('Received message from worker:', event.data);
    }
  }, [tabId, onRecoveryRequest, onMaintenanceModeChange]);
  
  /**
   * Register with the worker
   */
  const registerWithWorker = useCallback((port) => {
    const sessionId = localStorage.getItem('health_monitor_tab_id') || uuidv4();
    localStorage.setItem('health_monitor_tab_id', sessionId);
    
    port.postMessage({
      type: 'register',
      data: {
        tabId: sessionId,
        url: window.location.href,
        ...initialStatus
      }
    });
  }, [initialStatus]);
  
  /**
   * Send a heartbeat to the worker
   */
  const sendHeartbeat = useCallback((status = {}) => {
    if (!workerRef.current || !isConnected) {
      return;
    }
    
    try {
      workerRef.current.port.postMessage({
        type: 'heartbeat',
        data: {
          status: 'healthy',
          url: window.location.href,
          timestamp: Date.now(),
          ...status
        }
      });
    } catch (error) {
      console.error('Failed to send heartbeat:', error);
      setIsConnected(false);
    }
  }, [isConnected]);
  
  /**
   * Report an error to the worker
   */
  const reportError = useCallback((error) => {
    if (!workerRef.current || !isConnected) {
      return;
    }
    
    try {
      workerRef.current.port.postMessage({
        type: 'error',
        data: {
          message: error.message || String(error),
          stack: error.stack,
          severity: error.severity || 'medium',
          url: window.location.href,
          timestamp: Date.now()
        }
      });
    } catch (err) {
      console.error('Failed to report error:', err);
    }
  }, [isConnected]);
  
  /**
   * Request a coordinated restart across all tabs
   */
  const requestRestart = useCallback((reason = 'user_requested') => {
    if (!workerRef.current || !isConnected) {
      // If we're not connected to the worker, just reload this tab
      window.location.reload();
      return;
    }
    
    try {
      workerRef.current.port.postMessage({
        type: 'request_restart',
        data: {
          reason,
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.error('Failed to request restart:', error);
      
      // If sending the request fails, just reload this tab
      window.location.reload();
    }
  }, [isConnected]);
  
  /**
   * Enable maintenance mode
   */
  const enableMaintenanceMode = useCallback((reason = 'maintenance') => {
    if (!workerRef.current || !isConnected) {
      return false;
    }
    
    try {
      workerRef.current.port.postMessage({
        type: 'enable_maintenance_mode',
        data: {
          reason,
          timestamp: Date.now()
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to enable maintenance mode:', error);
      return false;
    }
  }, [isConnected]);
  
  /**
   * Disable maintenance mode
   */
  const disableMaintenanceMode = useCallback(() => {
    if (!workerRef.current || !isConnected) {
      return false;
    }
    
    try {
      workerRef.current.port.postMessage({
        type: 'disable_maintenance_mode',
        data: {
          timestamp: Date.now()
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to disable maintenance mode:', error);
      return false;
    }
  }, [isConnected]);
  
  /**
   * Get the latest health status
   */
  const refreshHealthStatus = useCallback(() => {
    if (!workerRef.current || !isConnected) {
      return;
    }
    
    try {
      workerRef.current.port.postMessage({
        type: 'get_health',
        data: {
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.error('Failed to get health status:', error);
    }
  }, [isConnected]);
  
  /**
   * Mark recovery as complete for this tab
   */
  const markRecoveryComplete = useCallback(() => {
    if (!workerRef.current || !isConnected) {
      return;
    }
    
    try {
      workerRef.current.port.postMessage({
        type: 'recovery_complete',
        data: {
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.error('Failed to mark recovery as complete:', error);
    }
  }, [isConnected]);
  
  // Set up periodic heartbeat (every 5 seconds)
  useEffect(() => {
    if (!isConnected) {
      return;
    }
    
    // Send initial heartbeat
    sendHeartbeat();
    
    // Set up interval for heartbeat
    const heartbeatInterval = setInterval(() => {
      // Get current memory usage
      let memoryUsage = null;
      
      try {
        if (window.performance && performance.memory) {
          memoryUsage = {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
          };
        }
      } catch (e) {
        // Some browsers may throw on accessing performance.memory
      }
      
      // Send heartbeat with current status
      sendHeartbeat({
        memoryUsage,
        networkStatus: {
          isOnline: navigator.onLine
        }
      });
    }, 5000);
    
    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [isConnected, sendHeartbeat]);
  
  return {
    // State
    isConnected,
    tabId,
    healthStatus,
    isRecoveryLeader,
    isMaintenanceMode: healthStatus.maintenanceMode,
    tabCount: healthStatus.tabCount,
    
    // API
    sendHeartbeat,
    reportError,
    requestRestart,
    enableMaintenanceMode,
    disableMaintenanceMode,
    refreshHealthStatus,
    markRecoveryComplete
  };
}