/**
 * Freeze Detection Utility
 * 
 * This module provides utilities to detect and recover from application freezes and hangs.
 * 
 * CRITICAL STABILITY COMPONENT - DO NOT MODIFY WITHOUT THOROUGH TESTING
 */

import { STABILITY_CONFIG } from '@/config/stabilityConfig';

// State for tracking application responsiveness
const freezeState = {
  heartbeatInterval: null,
  lastHeartbeat: Date.now(),
  freezeDetected: false,
  recoveryAttempts: 0,
  criticalComponents: new Map(), // component name -> timestamp
  eventLoopLagMeasurements: [],
  longTasksDetected: 0,
};

/**
 * Initialize freeze detection
 */
export function initFreezeDetection() {
  // Use a web worker if available for more accurate detection
  if (window.Worker) {
    setupWorkerHeartbeat();
  } else {
    setupTimerHeartbeat();
  }
  
  // Monitor event loop lag
  monitorEventLoopLag();
  
  // Monitor long tasks API if available
  if ('PerformanceObserver' in window) {
    monitorLongTasks();
  }
  
  // Monitor for unresponsive UI
  monitorUserInteractions();
}

/**
 * Clean up freeze detection
 */
export function cleanupFreezeDetection() {
  if (freezeState.heartbeatInterval) {
    clearInterval(freezeState.heartbeatInterval);
    freezeState.heartbeatInterval = null;
  }
  
  freezeState.freezeDetected = false;
  freezeState.recoveryAttempts = 0;
}

/**
 * Setup timer-based heartbeat for freeze detection
 */
function setupTimerHeartbeat() {
  // Reset state
  freezeState.lastHeartbeat = Date.now();
  freezeState.freezeDetected = false;
  
  // Check heartbeat every second
  freezeState.heartbeatInterval = setInterval(() => {
    const now = Date.now();
    const elapsed = now - freezeState.lastHeartbeat;
    
    // If more than 5 seconds have passed since last heartbeat, application might be frozen
    if (elapsed > 5000 && !freezeState.freezeDetected) {
      handleFreezeDetected(elapsed);
    }
    
    // Update heartbeat
    freezeState.lastHeartbeat = now;
  }, 1000);
}

/**
 * Setup worker-based heartbeat for more accurate freeze detection
 */
function setupWorkerHeartbeat() {
  try {
    // Create a blob URL for the worker script
    const workerBlob = new Blob([`
      // Send heartbeat every 1 second
      setInterval(() => {
        postMessage('heartbeat');
      }, 1000);
    `], { type: 'application/javascript' });
    
    const workerUrl = URL.createObjectURL(workerBlob);
    const worker = new Worker(workerUrl);
    
    worker.onmessage = (e) => {
      if (e.data === 'heartbeat') {
        const now = Date.now();
        const elapsed = now - freezeState.lastHeartbeat;
        
        // If more than 3 seconds have passed, application might be frozen
        if (elapsed > 3000 && !freezeState.freezeDetected) {
          handleFreezeDetected(elapsed);
        }
        
        // Update heartbeat
        freezeState.lastHeartbeat = now;
      }
    };
    
    // Clean up the blob URL
    URL.revokeObjectURL(workerUrl);
    
    // Cleanup when window is unloaded
    window.addEventListener('beforeunload', () => {
      worker.terminate();
    });
  } catch (error) {
    console.error('Failed to setup worker heartbeat:', error);
    // Fall back to timer-based heartbeat
    setupTimerHeartbeat();
  }
}

/**
 * Monitor event loop lag
 */
function monitorEventLoopLag() {
  let lastCheck = performance.now();
  const expectedInterval = 100; // 100ms intervals
  
  // Start monitoring
  const intervalId = setInterval(() => {
    const now = performance.now();
    const actualInterval = now - lastCheck;
    const lag = actualInterval - expectedInterval;
    
    // Keep last 10 lag measurements for trend analysis
    freezeState.eventLoopLagMeasurements.push(lag);
    if (freezeState.eventLoopLagMeasurements.length > 10) {
      freezeState.eventLoopLagMeasurements.shift();
    }
    
    // If lag is consistently high, the app might be struggling
    if (lag > 500) {
      const averageLag = freezeState.eventLoopLagMeasurements.reduce((sum, val) => sum + val, 0) / 
                        freezeState.eventLoopLagMeasurements.length;
      
      if (averageLag > 200) {
        // Significant lag detected
        handleLagDetected(averageLag);
      }
    }
    
    lastCheck = now;
  }, expectedInterval);
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(intervalId);
  });
}

/**
 * Monitor for long tasks using Performance Observer API
 */
function monitorLongTasks() {
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Long task detected (over 50ms)
        if (entry.entryType === 'longtask') {
          freezeState.longTasksDetected++;
          
          // If we're seeing a lot of long tasks in a short period,
          // the application might be struggling
          if (freezeState.longTasksDetected > 5) {
            handleLongTasksDetected(entry.duration);
            freezeState.longTasksDetected = 0;
          }
        }
      }
    });
    
    observer.observe({ entryTypes: ['longtask'] });
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      observer.disconnect();
    });
  } catch (error) {
    console.error('Long Tasks API not supported:', error);
  }
}

/**
 * Monitor for unresponsive UI by tracking user interactions
 */
function monitorUserInteractions() {
  let lastInteraction = Date.now();
  let pendingInteractions = 0;
  
  // Track user interactions
  const trackInteraction = () => {
    lastInteraction = Date.now();
    pendingInteractions++;
    
    // Schedule a check to see if UI responded within reasonable time
    setTimeout(() => {
      pendingInteractions--;
      
      const now = Date.now();
      const elapsed = now - lastInteraction;
      
      // If no other interactions happened and we're still processing
      // this one after a long time, UI might be frozen
      if (pendingInteractions === 0 && elapsed > 1000) {
        handleUIFreeze(elapsed);
      }
    }, 100);
  };
  
  // Listen for user interactions
  const interactionEvents = ['click', 'touchstart', 'keydown', 'mousemove'];
  interactionEvents.forEach(event => {
    window.addEventListener(event, trackInteraction, { passive: true });
  });
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    interactionEvents.forEach(event => {
      window.removeEventListener(event, trackInteraction);
    });
  });
}

/**
 * Register a critical component for monitoring
 * 
 * @param {string} componentName - Name of the component
 */
export function registerCriticalComponent(componentName) {
  freezeState.criticalComponents.set(componentName, Date.now());
}

/**
 * Unregister a critical component
 * 
 * @param {string} componentName - Name of the component
 */
export function unregisterCriticalComponent(componentName) {
  freezeState.criticalComponents.delete(componentName);
}

/**
 * Update a critical component's timestamp
 * 
 * @param {string} componentName - Name of the component
 */
export function updateCriticalComponent(componentName) {
  if (freezeState.criticalComponents.has(componentName)) {
    freezeState.criticalComponents.set(componentName, Date.now());
  }
}

/**
 * Handle freeze detection
 */
function handleFreezeDetected(frozenDuration) {
  console.warn(`⚠️ Application freeze detected! App was unresponsive for ${Math.round(frozenDuration)}ms`);
  freezeState.freezeDetected = true;
  
  // Log the frozen state for diagnostics
  logFreezeState(frozenDuration, 'app_freeze');
  
  // Attempt recovery
  if (freezeState.recoveryAttempts < STABILITY_CONFIG.maxRecoveryAttempts) {
    freezeState.recoveryAttempts++;
    attemptRecovery();
  } else {
    // If we've tried multiple times and it's still freezing, recommend a refresh
    suggestRefresh();
  }
}

/**
 * Handle event loop lag detection
 */
function handleLagDetected(averageLag) {
  console.warn(`⚠️ Application lag detected! Event loop delayed by ${Math.round(averageLag)}ms`);
  
  // Log the lag state for diagnostics
  logFreezeState(averageLag, 'event_loop_lag');
  
  // Check if any critical components have been unresponsive
  checkCriticalComponents();
  
  // Attempt to free up resources
  if (freezeState.recoveryAttempts < STABILITY_CONFIG.maxRecoveryAttempts) {
    freezeState.recoveryAttempts++;
    attemptGarbageCollection();
  }
}

/**
 * Handle long tasks detection
 */
function handleLongTasksDetected(duration) {
  console.warn(`⚠️ Multiple long tasks detected! Last task duration: ${Math.round(duration)}ms`);
  
  // Log the long tasks for diagnostics
  logFreezeState(duration, 'long_tasks');
}

/**
 * Handle UI freeze detection
 */
function handleUIFreeze(duration) {
  console.warn(`⚠️ UI freeze detected! Interface was unresponsive for ${Math.round(duration)}ms`);
  
  // Log the UI freeze for diagnostics
  logFreezeState(duration, 'ui_freeze');
  
  // Check if any critical components have been unresponsive
  checkCriticalComponents();
}

/**
 * Check if any critical components have been unresponsive
 */
function checkCriticalComponents() {
  const now = Date.now();
  const COMPONENT_TIMEOUT = 5000; // 5 seconds
  
  let unresponsiveComponents = [];
  
  for (const [componentName, lastUpdate] of freezeState.criticalComponents.entries()) {
    const elapsed = now - lastUpdate;
    
    if (elapsed > COMPONENT_TIMEOUT) {
      unresponsiveComponents.push({
        name: componentName,
        elapsed
      });
    }
  }
  
  if (unresponsiveComponents.length > 0) {
    console.warn('⚠️ Unresponsive critical components detected:', unresponsiveComponents);
    
    // If the regulatory module is frozen, it's a known issue area
    const hasRegulatoryModule = unresponsiveComponents.some(c => 
      c.name.includes('Regulatory') || c.name.includes('Document')
    );
    
    if (hasRegulatoryModule) {
      console.warn('⚠️ Regulatory module appears to be frozen. This is a known stability issue area.');
      // Could attempt specialized recovery here
    }
  }
}

/**
 * Log freeze state for diagnostics
 */
function logFreezeState(duration, type) {
  try {
    // Create a freeze log entry
    const freezeLog = {
      type,
      duration,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      criticalComponents: Array.from(freezeState.criticalComponents.keys()),
      recoveryAttempts: freezeState.recoveryAttempts,
      eventLoopLag: freezeState.eventLoopLagMeasurements,
      longTasks: freezeState.longTasksDetected,
      userAgent: navigator.userAgent
    };
    
    // Store in localStorage for diagnostics
    const existingLogs = JSON.parse(localStorage.getItem('freeze_logs') || '[]');
    existingLogs.push(freezeLog);
    
    // Keep only the last 20 freeze events
    if (existingLogs.length > 20) {
      existingLogs.shift();
    }
    
    localStorage.setItem('freeze_logs', JSON.stringify(existingLogs));
  } catch (e) {
    // Ignore storage errors
  }
}

/**
 * Attempt to recover from a freeze
 */
function attemptRecovery() {
  console.log(`🔄 Recovery attempt ${freezeState.recoveryAttempts}/${STABILITY_CONFIG.maxRecoveryAttempts}`);
  
  // Reset freeze state
  freezeState.freezeDetected = false;
  
  // Try to clean up memory
  attemptGarbageCollection();
  
  // Wait a moment and then check if the app is responsive
  setTimeout(() => {
    if (Date.now() - freezeState.lastHeartbeat < 2000) {
      console.log('✅ Application appears to be responsive again');
    }
  }, 2000);
}

/**
 * Attempt to free up memory by garbage collection hints
 */
function attemptGarbageCollection() {
  try {
    // Clear as many caches as possible
    if (window.memoryManagement && window.memoryManagement.clearAllComponentCaches) {
      window.memoryManagement.clearAllComponentCaches();
    }
    
    // Try to clear image cache
    const images = document.querySelectorAll('img');
    for (let i = 0; i < images.length; i++) {
      if (!isElementInViewport(images[i])) {
        // Replace with a tiny transparent gif to free up memory
        images[i].src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
      }
    }
    
    // Clear CSS animation frames that might be causing layout thrashing
    const animatedElements = document.querySelectorAll('.animated, .animating, [data-animation]');
    for (let i = 0; i < animatedElements.length; i++) {
      animatedElements[i].style.animation = 'none';
      animatedElements[i].style.transition = 'none';
    }
    
    // If the global GC function is available (rare), suggest garbage collection
    if (window.gc) {
      window.gc();
    }
  } catch (error) {
    console.error('Error during garbage collection attempt:', error);
  }
}

/**
 * Check if an element is in the viewport
 */
function isElementInViewport(el) {
  if (!el || !el.getBoundingClientRect) return false;
  
  try {
    const rect = el.getBoundingClientRect();
    
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  } catch (e) {
    return false;
  }
}

/**
 * Suggest a page refresh to the user
 */
function suggestRefresh() {
  try {
    // Show a refresh suggestion dialog
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border: 1px solid #f0f0f0;
      border-radius: 4px;
      padding: 15px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 9999;
      max-width: 300px;
      font-family: system-ui, -apple-system, sans-serif;
    `;
    
    dialog.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <div style="width: 24px; height: 24px; background: #FFEBEE; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
          <span style="color: #F44336; font-weight: bold;">!</span>
        </div>
        <h3 style="margin: 0; font-size: 16px; color: #333;">Application Performance</h3>
      </div>
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
        We've noticed the application is running slower than expected. 
        Refreshing the page may help improve performance.
      </p>
      <div style="display: flex; justify-content: flex-end;">
        <button id="freeze-dismiss" style="background: none; border: none; color: #666; margin-right: 10px; cursor: pointer; font-size: 14px;">Dismiss</button>
        <button id="freeze-refresh" style="background: #0078d4; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 14px;">Refresh Page</button>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Add event listeners
    document.getElementById('freeze-dismiss').addEventListener('click', () => {
      dialog.remove();
    });
    
    document.getElementById('freeze-refresh').addEventListener('click', () => {
      window.location.reload();
    });
    
    // Auto-remove after 30 seconds if ignored
    setTimeout(() => {
      if (document.body.contains(dialog)) {
        dialog.remove();
      }
    }, 30000);
  } catch (error) {
    console.error('Error showing refresh suggestion:', error);
  }
}

export default {
  initFreezeDetection,
  cleanupFreezeDetection,
  registerCriticalComponent,
  unregisterCriticalComponent,
  updateCriticalComponent
};