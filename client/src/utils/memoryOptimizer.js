
/**
 * Memory Optimizer
 * 
 * This utility provides memory optimization strategies to prevent UI freezes
 * by monitoring memory usage and proactively clearing resources.
 * 
 * CRITICAL STABILITY COMPONENT - DO NOT MODIFY WITHOUT THOROUGH TESTING
 */

// Configuration
const MEMORY_CONFIG = {
  // How often to check memory usage (ms) - increased to reduce frequency
  checkInterval: 30000,
  
  // Memory thresholds (MB) - increased to be less sensitive
  warningThreshold: 250,
  criticalThreshold: 350,
  
  // Performance metrics
  longTaskThreshold: 100, // ms - increased to be less sensitive
  
  // Enable debug logging
  debug: false,
  
  // Disable aggressive optimization to reduce performance impact
  aggressiveOptimization: false,
};

// State
const state = {
  memoryUsage: {
    heapUsed: 0,
    heapTotal: 0,
    percentUsed: 0,
  },
  isOptimizing: false,
  observedLongTasks: 0,
  checkCount: 0,
  lastOptimization: 0,
};

/**
 * Initialize memory optimization
 */
export function initializeMemoryOptimization() {
  console.info('Initializing memory optimization');
  
  // Start periodic memory checks
  setInterval(checkMemory, MEMORY_CONFIG.checkInterval);
  
  // Setup performance observer for long tasks if available
  setupLongTaskObserver();
  
  // Initial memory check
  checkMemory();
  
  return {
    getCurrentMemoryUsage: () => state.memoryUsage,
    forceOptimize: performMemoryOptimization,
  };
}

/**
 * Check current memory usage and optimize if needed
 */
function checkMemory() {
  state.checkCount++;
  
  try {
    updateMemoryUsage();
    
    // Log memory usage periodically
    if (MEMORY_CONFIG.debug && state.checkCount % 6 === 0) {
      console.debug('Memory usage:', state.memoryUsage);
    }
    
    // Check if optimization is needed
    const timeSinceLastOptimization = Date.now() - state.lastOptimization;
    
    if (state.memoryUsage.heapUsed > MEMORY_CONFIG.criticalThreshold * 1024 * 1024) {
      console.warn('Critical memory usage detected, performing optimization');
      performMemoryOptimization();
    } else if (state.memoryUsage.heapUsed > MEMORY_CONFIG.warningThreshold * 1024 * 1024 && 
              timeSinceLastOptimization > 60000 && 
              state.observedLongTasks > 3) {
      console.warn('High memory usage with long tasks detected, performing optimization');
      performMemoryOptimization();
    }
    
    // Reset long task counter periodically
    if (state.checkCount % 30 === 0) {
      state.observedLongTasks = 0;
    }
  } catch (err) {
    console.error('Error in memory check:', err);
  }
}

/**
 * Update memory usage statistics
 */
function updateMemoryUsage() {
  if (window.performance && window.performance.memory) {
    const memory = window.performance.memory;
    state.memoryUsage.heapUsed = memory.usedJSHeapSize;
    state.memoryUsage.heapTotal = memory.totalJSHeapSize;
    state.memoryUsage.percentUsed = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
  } else {
    // Fallback for browsers without memory API
    state.memoryUsage.heapUsed = 0;
    state.memoryUsage.heapTotal = 0;
    state.memoryUsage.percentUsed = 0;
  }
}

/**
 * Perform memory optimization
 */
function performMemoryOptimization() {
  // Prevent concurrent optimizations or running too frequently
  if (state.isOptimizing) return;
  const now = Date.now();
  if (now - state.lastOptimization < 30000) {
    console.info('Skipping optimization - last one performed too recently');
    return;
  }
  
  state.isOptimizing = true;
  state.lastOptimization = now;
  
  try {
    console.info('Performing memory optimization');
    
    // Clear application-specific caches only (less invasive)
    clearApplicationCaches();
    
    // Clear console logs to free memory (simple, effective)
    if (console.clear) {
      console.clear();
    }
    
    // Force garbage collection if available (unlikely in most browsers)
    if (window.gc) {
      try {
        window.gc();
      } catch (e) {
        // Ignore errors
      }
    }
    
    // Only perform aggressive optimizations if enabled and we're experiencing critical issues
    if (MEMORY_CONFIG.aggressiveOptimization && state.observedLongTasks > 5) {
      // Clear image caches
      clearImageCaches();
      
      // Remove non-visible image data
      unloadNonVisibleImages();
      
      // Clear any large objects in memory
      cleanupLargeObjects();
      
      // Last resort - detach event listeners from non-visible components
      cleanupEventListeners();
    }
    
    // Update memory usage after optimization
    setTimeout(() => {
      updateMemoryUsage();
      console.info('Memory optimization complete');
      state.isOptimizing = false;
    }, 500);
  } catch (err) {
    console.error('Error during memory optimization:', err);
    state.isOptimizing = false;
  }
}

/**
 * Clean up event listeners from non-visible components
 */
function cleanupEventListeners() {
  try {
    // Find elements that are far outside viewport
    const elements = document.querySelectorAll('*');
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    for (const el of elements) {
      if (!el || !el.getBoundingClientRect) continue;
      
      const rect = el.getBoundingClientRect();
      // If element is very far from viewport
      if (rect.bottom < -2000 || rect.top > viewportHeight + 2000 ||
          rect.right < -2000 || rect.left > viewportWidth + 2000) {
        
        // Store original handlers if not already stored
        if (!el._originalEventListeners && el._events) {
          el._originalEventListeners = { ...el._events };
          
          // Remove non-essential events
          for (const eventType in el._events) {
            if (!['click', 'submit', 'change'].includes(eventType)) {
              el._events[eventType] = [];
            }
          }
        }
      }
      // Restore event listeners if element is back in view
      else if (el._originalEventListeners) {
        el._events = el._originalEventListeners;
        delete el._originalEventListeners;
      }
    }
  } catch (e) {
    console.error('Error cleaning up event listeners:', e);
  }
}

/**
 * Clean up large objects in memory
 */
function cleanupLargeObjects() {
  try {
    // Clear temporary state in large components
    const componentsToClean = [
      'dataCache', 'tempResults', 'chartData', 
      'oldRenderCache', 'previousSearch', 'resultCache'
    ];
    
    for (const key of componentsToClean) {
      if (window[key] && typeof window[key] === 'object') {
        // If it's an array with more than 1000 items or an object with many properties
        if ((Array.isArray(window[key]) && window[key].length > 1000) || 
            (Object.keys(window[key]).length > 100)) {
          window[key] = Array.isArray(window[key]) ? [] : {};
          console.debug(`Cleaned up large object: ${key}`);
        }
      }
    }
    
    // Find and clean up any React component state cache
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__ && 
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__._renderers) {
      
      const renderers = Object.values(window.__REACT_DEVTOOLS_GLOBAL_HOOK__._renderers);
      for (const renderer of renderers) {
        if (renderer && renderer.findFiberByHostInstance) {
          try {
            // This forces React to potentially clean up some component cache
            renderer.findFiberByHostInstance(document.body);
          } catch (e) {
            // Ignore errors
          }
        }
      }
    }
  } catch (e) {
    console.error('Error cleaning up large objects:', e);
  }
}

/**
 * Clear image caches
 */
function clearImageCaches() {
  // Clear image data in blob URLs
  const blobUrls = Object.keys(window).filter(key => 
    typeof window[key] === 'string' && 
    window[key].startsWith('blob:')
  );
  
  for (const key of blobUrls) {
    try {
      URL.revokeObjectURL(window[key]);
      window[key] = null;
    } catch (e) {
      // Ignore errors
    }
  }
}

/**
 * Clear application-specific caches
 */
function clearApplicationCaches() {
  // App-specific cache clearing
  const cacheNames = [
    'dataCache', 'responseCache', 'queryCache', 
    'documentCache', 'tempData'
  ];
  
  for (const name of cacheNames) {
    if (window[name]) {
      try {
        if (typeof window[name].clear === 'function') {
          window[name].clear();
        } else {
          window[name] = {};
        }
      } catch (e) {
        // Ignore errors
      }
    }
  }
  
  // Clear React Query cache if it exists
  if (window.queryClient && typeof window.queryClient.clear === 'function') {
    window.queryClient.clear();
  }
}

/**
 * Clear unused data structures
 */
function clearUnusedData() {
  // Clear console logs to free memory
  if (console.clear && MEMORY_CONFIG.aggressiveOptimization) {
    console.clear();
  }
  
  // Remove old log entries
  if (console.history && Array.isArray(console.history)) {
    console.history.length = 0;
  }
}

/**
 * Unload images not in viewport to save memory
 */
function unloadNonVisibleImages() {
  try {
    const images = document.querySelectorAll('img');
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    let unloadedCount = 0;
    
    for (const img of images) {
      if (img.complete && img.currentSrc) {
        const rect = img.getBoundingClientRect();
        
        // If image is far outside viewport, free its memory
        if (rect.bottom < -1000 || rect.top > viewportHeight + 1000 ||
            rect.right < -1000 || rect.left > viewportWidth + 1000) {
          
          // Save original source
          if (!img.dataset.originalSrc) {
            img.dataset.originalSrc = img.currentSrc;
          }
          
          // Replace with empty 1x1 transparent gif
          img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
          unloadedCount++;
        } 
        // Restore images that have come into view
        else if (img.dataset.originalSrc && 
                rect.bottom > -200 && rect.top < viewportHeight + 200 &&
                rect.right > -200 && rect.left < viewportWidth + 200) {
          img.src = img.dataset.originalSrc;
          delete img.dataset.originalSrc;
        }
      }
    }
    
    if (unloadedCount > 0 && MEMORY_CONFIG.debug) {
      console.debug(`Unloaded ${unloadedCount} images to save memory`);
    }
  } catch (err) {
    console.error('Error unloading images:', err);
  }
}

/**
 * Setup observer for long tasks
 */
function setupLongTaskObserver() {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          // Log long tasks
          if (entry.duration > MEMORY_CONFIG.longTaskThreshold) {
            state.observedLongTasks++;
            if (MEMORY_CONFIG.debug) {
              console.debug(`Long task detected: ${Math.round(entry.duration)}ms`);
            }
          }
        }
      });
      
      observer.observe({ entryTypes: ['longtask'] });
    } catch (err) {
      console.warn('Long task observer not supported:', err);
    }
  }
}

export default {
  initializeMemoryOptimization,
  getCurrentMemoryUsage: () => state.memoryUsage,
  forceOptimize: performMemoryOptimization
};
