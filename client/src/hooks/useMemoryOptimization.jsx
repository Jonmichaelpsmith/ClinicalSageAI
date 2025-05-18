/**
 * Memory Optimization Hook
 * 
 * This hook provides memory management and optimization capabilities to React components.
 * Used to prevent memory leaks and ensure stable application performance.
 * 
 * CRITICAL STABILITY COMPONENT - DO NOT MODIFY WITHOUT THOROUGH TESTING
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { MEMORY_CONFIG } from '@/config/stabilityConfig';
import memoryManagement from '@/utils/memoryManagement';

/**
 * Main memory optimization hook for React components
 * 
 * @param {Object} options Configuration options
 * @param {string} options.componentName Name of the component (for tracking)
 * @param {number} options.maxCacheItems Maximum cache items to keep
 * @param {Array} options.cleanupDependencies Dependencies that should trigger cache cleanup
 * @param {Function} options.customCleanupFunction Additional cleanup function
 * @returns {Object} Cache functions and memory optimization utilities
 */
export default function useMemoryOptimization({
  componentName = 'UnnamedComponent',
  maxCacheItems = MEMORY_CONFIG.maxCacheItems,
  cleanupDependencies = [],
  customCleanupFunction = null
} = {}) {
  // Create a memory efficient cache
  const { get, set, remove, clear } = memoryManagement.useMemoryEfficientCache(
    componentName,
    maxCacheItems
  );
  
  // Track memory usage
  const [memoryUsage, setMemoryUsage] = useState({
    cacheSize: 0,
    estimatedBytes: 0
  });
  
  // Use ref to track cache data for usage estimation
  const cacheDataRef = useRef(new Map());
  
  // Enhanced set function that also tracks memory usage
  const memoryAwareSet = useCallback((key, value, estimatedSize = null) => {
    set(key, value);
    
    // Update our cache tracking for memory usage estimation
    let size = estimatedSize;
    if (size === null) {
      if (Array.isArray(value)) {
        size = memoryManagement.estimateArrayMemoryUsage(value);
      } else if (typeof value === 'string') {
        size = value.length * 2; // Rough estimate for string memory
      } else if (typeof value === 'object' && value !== null) {
        size = 1000; // Default estimate for objects
      } else {
        size = 8; // Default for primitive values
      }
    }
    
    cacheDataRef.current.set(key, {
      timestamp: Date.now(),
      size
    });
    
    // Update memory usage stats
    updateMemoryUsage();
  }, [set]);
  
  // Enhanced remove function that also updates memory tracking
  const memoryAwareRemove = useCallback((key) => {
    remove(key);
    cacheDataRef.current.delete(key);
    updateMemoryUsage();
  }, [remove]);
  
  // Enhanced clear function that also updates memory tracking
  const memoryAwareClear = useCallback(() => {
    clear();
    cacheDataRef.current.clear();
    updateMemoryUsage();
  }, [clear]);
  
  // Update the memory usage statistics
  const updateMemoryUsage = useCallback(() => {
    const cacheSize = cacheDataRef.current.size;
    let totalBytes = 0;
    
    for (const entry of cacheDataRef.current.values()) {
      totalBytes += entry.size;
    }
    
    setMemoryUsage({
      cacheSize,
      estimatedBytes: totalBytes
    });
  }, []);
  
  // Register for browser visibility events to clear caches when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && cacheDataRef.current.size > 0) {
        // When the tab is not visible, keep only recent items
        const entries = Array.from(cacheDataRef.current.entries());
        const now = Date.now();
        const MAX_AGE_MS = 60000; // 1 minute
        
        const keysToRemove = entries
          .filter(([_, meta]) => now - meta.timestamp > MAX_AGE_MS)
          .map(([key]) => key);
        
        keysToRemove.forEach(key => {
          memoryAwareRemove(key);
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [memoryAwareRemove]);
  
  // Monitor memory usage and clean up when it gets too high
  useEffect(() => {
    const MEMORY_THRESHOLD_BYTES = 50 * 1024 * 1024; // 50MB 
    
    if (memoryUsage.estimatedBytes > MEMORY_THRESHOLD_BYTES) {
      console.warn(`Memory usage for ${componentName} exceeded threshold. Cleaning up...`);
      
      // Keep only the 25% most recent entries
      const entries = Array.from(cacheDataRef.current.entries())
        .sort((a, b) => b[1].timestamp - a[1].timestamp);
      
      const keepCount = Math.ceil(entries.length * 0.25);
      const removeCount = entries.length - keepCount;
      
      for (let i = keepCount; i < entries.length; i++) {
        memoryAwareRemove(entries[i][0]);
      }
      
      console.log(`Cleaned up ${removeCount} cache entries for ${componentName}`);
    }
  }, [memoryUsage.estimatedBytes, componentName, memoryAwareRemove]);
  
  // Clean up on component unmount or when dependencies change
  useEffect(() => {
    return () => {
      memoryAwareClear();
      if (customCleanupFunction) {
        customCleanupFunction();
      }
    };
  }, [memoryAwareClear, customCleanupFunction, ...cleanupDependencies]);
  
  // Protect against memory leaks
  memoryManagement.useMemoryLeakProtection(componentName);
  
  return {
    cache: {
      get,
      set: memoryAwareSet,
      remove: memoryAwareRemove,
      clear: memoryAwareClear
    },
    memoryUsage,
    isCacheFull: memoryUsage.cacheSize >= maxCacheItems
  };
}