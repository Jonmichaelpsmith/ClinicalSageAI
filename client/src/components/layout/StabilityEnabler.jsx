
import React, { useEffect, useState } from 'react';
import { initFreezeDetection } from '../../utils/freezeDetection';
import { initializeMemoryOptimization } from '../../utils/memoryOptimizer';
import { initNetworkResilience } from '../../utils/networkResilience';

/**
 * StabilityEnabler Component
 * 
 * Integrates all stability and performance optimizations in one place.
 * This component should be included near the root of your application.
 */
function StabilityEnabler({ children }) {
  const [status, setStatus] = useState({
    initialized: false,
    memoryManagement: false,
    freezeDetection: false,
    networkResilience: false
  });

  useEffect(() => {
    console.log('🛡️ Initializing all stability features...');
    
    // Initialize error tracking
    const errorAnalytics = setupErrorAnalytics();
    
    // Initialize memory management
    const memoryManager = initializeMemoryOptimization();
    setStatus(prev => ({ ...prev, memoryManagement: true }));
    console.log('Memory management initialized');
    
    // Initialize freeze detection
    const freezeDetector = initFreezeDetection();
    setStatus(prev => ({ ...prev, freezeDetection: true }));
    console.log('Freeze detection initialized');
    
    // Initialize network resilience
    const networkManager = initNetworkResilience();
    setStatus(prev => ({ ...prev, networkResilience: true }));
    
    // Initialize storage resilience
    const storageManager = initializeStorageResilience();
    
    // Set up health check interval
    const healthCheckInterval = setInterval(() => {
      // Perform periodic health check
      const memoryUsage = memoryManager.getCurrentMemoryUsage();
      
      // If memory usage is high, trigger optimization
      if (memoryUsage.percentUsed > 70) {
        memoryManager.forceOptimize();
      }
      
      // Clear network cache if it's getting too large
      if (networkManager.getCacheStats().size > networkManager.getCacheStats().maxSize * 0.8) {
        networkManager.clearCache();
      }
    }, 30000);
    
    setStatus(prev => ({ ...prev, initialized: true }));
    console.log('🛡️ Initializing application stability measures...');
    
    return () => {
      // Clean up on unmount
      clearInterval(healthCheckInterval);
    };
  }, []);
  
  /**
   * Setup error analytics
   */
  function setupErrorAnalytics() {
    const sessionId = `session-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    console.log('Error analytics initialized with session ID:', sessionId);
    
    // Global error handler
    window.addEventListener('error', (event) => {
      console.error('Unhandled error:', event.error);
      // You could send this to a logging service
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      // You could send this to a logging service
    });
    
    return { sessionId };
  }
  
  /**
   * Initialize storage resilience
   */
  function initializeStorageResilience() {
    const storageTypes = {
      localStorage: false,
      sessionStorage: false,
      indexedDB: false,
      memory: true // Fallback is always available
    };
    
    // Test localStorage
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      storageTypes.localStorage = true;
    } catch (e) {
      console.warn('localStorage not available, using memory fallback');
    }
    
    // Test sessionStorage
    try {
      sessionStorage.setItem('test', 'test');
      sessionStorage.removeItem('test');
      storageTypes.sessionStorage = true;
    } catch (e) {
      console.warn('sessionStorage not available, using memory fallback');
    }
    
    // Test indexedDB
    try {
      const request = indexedDB.open('test');
      request.onsuccess = () => {
        storageTypes.indexedDB = true;
        request.result.close();
        indexedDB.deleteDatabase('test');
      };
    } catch (e) {
      console.warn('indexedDB not available, using memory fallback');
    }
    
    console.log('Storage resilience initialized:', storageTypes);
    return storageTypes;
  }

  return (
    <React.Fragment>
      {status.initialized && (
        <div style={{ display: 'none' }} data-testid="stability-enabler">
          {/* Hidden component, just used as a marker */}
        </div>
      )}
      {children}
    </React.Fragment>
  );
}

export default StabilityEnabler;
