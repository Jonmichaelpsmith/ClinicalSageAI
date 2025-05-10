/**
 * Memory Management Utility
 * 
 * This module provides utilities to manage memory usage in the browser
 * to prevent crashes and performance issues.
 * 
 * CRITICAL STABILITY COMPONENT - DO NOT MODIFY WITHOUT THOROUGH TESTING
 */

import { MEMORY_CONFIG } from '@/config/stabilityConfig';

// Cache to store references to component cache clearers
const componentCacheCleaners = new Map();

/**
 * Registers a function that can clear a component's cache
 * 
 * @param {string} componentName - Identifier for the component
 * @param {Function} cleanupFn - Function to call to clear the component's cache
 */
export function registerCacheCleaner(componentName, cleanupFn) {
  componentCacheCleaners.set(componentName, cleanupFn);
}

/**
 * Unregisters a component's cache cleaner when the component unmounts
 * 
 * @param {string} componentName - Identifier for the component
 */
export function unregisterCacheCleaner(componentName) {
  componentCacheCleaners.delete(componentName);
}

/**
 * Clears all component caches to free up memory
 */
export function clearAllComponentCaches() {
  for (const cleanupFn of componentCacheCleaners.values()) {
    try {
      cleanupFn();
    } catch (error) {
      console.error('Error clearing component cache:', error);
    }
  }
}

/**
 * Estimated memory usage based on the array length and type
 * 
 * @param {Array} array - The array to estimate memory for
 * @param {string} type - The type of objects in the array (string, object, etc.)
 * @returns {number} - Estimated memory usage in bytes
 */
export function estimateArrayMemoryUsage(array, type = 'object') {
  if (!array || !Array.isArray(array)) return 0;
  
  const length = array.length;
  let bytesPerItem = 0;
  
  // Rough estimates based on object type
  switch (type) {
    case 'string':
      bytesPerItem = 2 * 16; // Average string size
      break;
    case 'number':
      bytesPerItem = 8;
      break;
    case 'boolean':
      bytesPerItem = 4;
      break;
    case 'date':
      bytesPerItem = 8;
      break;
    case 'object':
    default:
      bytesPerItem = 400; // Average object size estimate
      break;
  }
  
  return length * bytesPerItem;
}

/**
 * Hook to create a memory-efficient cache with automatic cleanup
 * 
 * @param {string} cacheId - Unique identifier for this cache
 * @param {number} maxItems - Maximum items to store in the cache
 * @returns {Object} - Cache management functions
 */
export function useMemoryEfficientCache(cacheId, maxItems = MEMORY_CONFIG.maxCacheItems) {
  const cacheRef = React.useRef(new Map());
  
  // Register a cleanup function to clear this cache if memory gets low
  React.useEffect(() => {
    const cleanup = () => {
      // Keep only the most recently used 75% of items when cleanup is triggered
      const cache = cacheRef.current;
      const itemsToKeep = Math.floor(maxItems * 0.75);
      
      if (cache.size > itemsToKeep) {
        // Create array of [key, timestamp] pairs
        const entries = Array.from(cache.entries())
          .map(([key, data]) => [key, data.timestamp])
          .sort((a, b) => b[1] - a[1]); // Sort by timestamp descending
        
        // Delete older entries
        for (let i = itemsToKeep; i < entries.length; i++) {
          cache.delete(entries[i][0]);
        }
      }
    };
    
    registerCacheCleaner(cacheId, cleanup);
    
    return () => {
      unregisterCacheCleaner(cacheId);
    };
  }, [cacheId, maxItems]);
  
  const get = (key) => {
    const cache = cacheRef.current;
    const entry = cache.get(key);
    
    if (entry) {
      // Update timestamp on access
      entry.timestamp = Date.now();
      return entry.value;
    }
    
    return undefined;
  };
  
  const set = (key, value) => {
    const cache = cacheRef.current;
    
    // If we're at max capacity, remove oldest item
    if (cache.size >= maxItems) {
      let oldestKey = null;
      let oldestTime = Infinity;
      
      // Find the oldest entry
      for (const [k, data] of cache.entries()) {
        if (data.timestamp < oldestTime) {
          oldestTime = data.timestamp;
          oldestKey = k;
        }
      }
      
      if (oldestKey) {
        cache.delete(oldestKey);
      }
    }
    
    // Add new entry
    cache.set(key, {
      value,
      timestamp: Date.now()
    });
  };
  
  const remove = (key) => {
    cacheRef.current.delete(key);
  };
  
  const clear = () => {
    cacheRef.current.clear();
  };
  
  return { get, set, remove, clear };
}

/**
 * Schedule periodic memory cleanup
 */
export function setupMemoryMonitoring() {
  // Set up periodic memory sweeps
  if (MEMORY_CONFIG.enableGCHints) {
    const interval = setInterval(() => {
      // Clear obsolete caches
      clearAllComponentCaches();
      
      // Remove any large objects from memory
      try {
        // Hint to the browser that it's a good time to run GC
        if (window.gc) {
          window.gc();
        }
        
        // Force image cache clearing (can help prevent memory leaks)
        const images = document.querySelectorAll('img');
        images.forEach(img => {
          if (!isElementInViewport(img)) {
            img.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
          }
        });
      } catch (e) {
        console.error('Memory sweep error:', e);
      }
    }, MEMORY_CONFIG.memorySweepIntervalMs);

    // Clean up when the app is closed/navigated away
    window.addEventListener('beforeunload', () => {
      clearInterval(interval);
      clearAllComponentCaches();
    });
  }
}

/**
 * Helper to check if an element is currently visible in the viewport
 */
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Monitor for memory leaks in React components
 */
export function useMemoryLeakProtection(componentName) {
  React.useEffect(() => {
    // Count of component instances
    const countRef = React.useRef(0);
    countRef.current++;
    
    // Check for too many instances of the same component type
    if (countRef.current > 100) {
      console.warn(`Possible memory leak: ${componentName} has ${countRef.current} instances`);
    }
    
    return () => {
      countRef.current--;
    };
  }, [componentName]);
}

export default {
  registerCacheCleaner,
  unregisterCacheCleaner,
  clearAllComponentCaches,
  estimateArrayMemoryUsage,
  useMemoryEfficientCache,
  setupMemoryMonitoring,
  useMemoryLeakProtection
};