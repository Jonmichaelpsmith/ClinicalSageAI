
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
  // How often to check memory usage (ms)
  checkInterval: 10000,
  
  // Memory thresholds (MB)
  warningThreshold: 150,
  criticalThreshold: 200,
  
  // Performance metrics
  longTaskThreshold: 50, // ms
  
  // Enable debug logging
  debug: false,
  
  // Enable aggressive optimization
  aggressiveOptimization: true,
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
  if (state.isOptimizing) return;
  
  state.isOptimizing = true;
  state.lastOptimization = Date.now();
  
  try {
    console.info('Performing memory optimization');
    
    // Clear image caches
    clearImageCaches();
    
    // Clear any application-specific caches
    clearApplicationCaches();
    
    // Clear unused data
    clearUnusedData();
    
    // Force garbage collection if available
    if (window.gc) {
      try {
        window.gc();
      } catch (e) {
        // Ignore errors
      }
    }
    
    // Remove non-visible image data
    if (MEMORY_CONFIG.aggressiveOptimization) {
      unloadNonVisibleImages();
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
