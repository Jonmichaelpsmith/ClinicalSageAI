/**
 * Tenant Caching System
 * 
 * This module implements a caching layer for tenant-specific data
 * to reduce database load and improve performance.
 */
import { createScopedLogger } from '../utils/logger';
 
const logger = createScopedLogger('tenant-cache');

// Configuration
const DEFAULT_CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE_PER_TENANT = 10000; // Maximum entries per tenant
const CLEANUP_INTERVAL = 60 * 1000; // Run cleanup every minute
const CRITICAL_CACHE_SIZES = {
  small: 100,    // Up to 100 entries
  medium: 1000,  // Up to 1000 entries
  large: 5000,   // Up to 5000 entries
  xlarge: 10000  // Up to 10000 entries
};

// Cache statistics for monitoring
const cacheStats = {
  hits: 0,
  misses: 0,
  expired: 0,
  totalItems: 0,
  evictions: 0,
  errors: 0,
  lastCleanupTime: Date.now()
};

// Cache storage organized by tenant and entity type
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  size: number; // Approximate size estimation
  priority: number; // Higher number = higher priority (less likely to be evicted)
}

interface EntityTypeStore {
  [entityId: string]: CacheEntry<any>;
}

interface TenantStore {
  [entityType: string]: EntityTypeStore;
  _meta?: {
    totalSize: number; // Total number of entries for this tenant
  };
}

interface CacheStore {
  [tenantId: string]: TenantStore;
}

// In-memory cache
const cache: CacheStore = {};

/**
 * Estimate the size of an object in bytes
 * This is a simple approximation
 */
function estimateObjectSize(obj: any): number {
  try {
    const jsonString = JSON.stringify(obj);
    return jsonString ? jsonString.length * 2 : 0; // UTF-16 uses 2 bytes per character
  } catch (error) {
    // If the object can't be stringified, use a conservative estimate
    return 1000;
  }
}

/**
 * Check if cache is available and ready
 */
function isCacheAvailable(): boolean {
  try {
    // Simple check to ensure cache object exists
    return typeof cache === 'object';
  } catch (error) {
    logger.error('Cache availability check failed', { error });
    return false;
  }
}

/**
 * Get data from cache with health checks and statistics
 * @param tenantId Tenant/organization ID
 * @param entityType Type of entity (e.g., 'ctqFactors', 'qmpRules')
 * @param entityId Entity ID or 'collection' for lists
 * @returns Cached data or null if not found or expired
 */
export function getFromCache<T>(
  tenantId: number | string, 
  entityType: string, 
  entityId: string | number
): T | null {
  if (!isCacheAvailable()) {
    logger.error('Cache is not available');
    return null;
  }

  if (tenantId === undefined || entityType === undefined || entityId === undefined) {
    logger.error('Invalid cache parameters', { tenantId, entityType, entityId });
    cacheStats.errors++;
    return null;
  }
  
  const tenantKey = String(tenantId);
  const entityKey = String(entityId);
  const now = Date.now();
  
  try {
    // Check if cache entry exists
    if (cache[tenantKey]?.[entityType]?.[entityKey]) {
      const entry = cache[tenantKey][entityType][entityKey];
      
      // Check if cache entry is still valid
      if (now - entry.timestamp < DEFAULT_CACHE_EXPIRATION) {
        // Update priority on access to implement LFU (Least Frequently Used) policy
        entry.priority++;
        
        // Update stats
        cacheStats.hits++;
        
        logger.debug('Cache hit', { tenantId, entityType, entityId });
        return entry.data as T;
      } else {
        // Cache expired, delete entry
        delete cache[tenantKey][entityType][entityKey];
        
        // Update stats
        cacheStats.expired++;
        cacheStats.totalItems--;
        if (cache[tenantKey]._meta && cache[tenantKey]._meta.totalSize > 0) {
          cache[tenantKey]._meta.totalSize--;
        }
        
        logger.debug('Cache expired', { tenantId, entityType, entityId });
      }
    }
    
    // Cache miss
    cacheStats.misses++;
    return null;
  } catch (error) {
    cacheStats.errors++;
    logger.error('Error retrieving from cache', { error, tenantId, entityType, entityId });
    return null;
  }
}

/**
 * Manage cache size by evicting least important entries
 */
function manageTenantsCache(tenantKey: string): void {
  try {
    if (!cache[tenantKey]) return;
    
    const tenantCache = cache[tenantKey];
    
    // If under limit, no need to evict
    if (tenantCache.totalSize <= MAX_CACHE_SIZE_PER_TENANT) {
      return;
    }
    
    logger.info('Cache eviction needed for tenant', { 
      tenantId: tenantKey,
      currentSize: tenantCache.totalSize, 
      limit: MAX_CACHE_SIZE_PER_TENANT 
    });
    
    // Collect all entries for sorting by priority
    const allEntries: {
      entityType: string;
      entityKey: string;
      entry: CacheEntry<any>;
    }[] = [];
    
    Object.keys(tenantCache).forEach(entityType => {
      if (entityType === 'totalSize') return;
      
      const entities = tenantCache[entityType];
      
      Object.keys(entities).forEach(entityKey => {
        allEntries.push({
          entityType,
          entityKey,
          entry: entities[entityKey]
        });
      });
    });
    
    // Sort by priority (ascending) and timestamp (oldest first)
    allEntries.sort((a, b) => {
      // First compare by priority
      const priorityDiff = a.entry.priority - b.entry.priority;
      if (priorityDiff !== 0) return priorityDiff;
      
      // If same priority, compare by age (older = more likely to evict)
      return a.entry.timestamp - b.entry.timestamp;
    });
    
    // Calculate how many entries to remove
    const entriesToRemove = Math.min(
      Math.ceil(tenantCache.totalSize * 0.2), // Remove up to 20% of entries
      tenantCache.totalSize - MAX_CACHE_SIZE_PER_TENANT + 100 // Leave some buffer
    );
    
    // Remove entries
    for (let i = 0; i < entriesToRemove && i < allEntries.length; i++) {
      const { entityType, entityKey } = allEntries[i];
      
      delete tenantCache[entityType][entityKey];
      tenantCache.totalSize--;
      cacheStats.evictions++;
      
      // Clean up empty entity types
      if (Object.keys(tenantCache[entityType]).length === 0) {
        delete tenantCache[entityType];
      }
    }
    
    logger.info('Cache eviction completed', { 
      tenantId: tenantKey, 
      entriesRemoved: entriesToRemove,
      newSize: tenantCache.totalSize
    });
  } catch (error) {
    logger.error('Error managing tenant cache size', { error, tenantKey });
  }
}

/**
 * Store data in cache with size management and error handling
 * @param tenantId Tenant/organization ID
 * @param entityType Type of entity (e.g., 'ctqFactors', 'qmpRules')
 * @param entityId Entity ID or 'collection' for lists
 * @param data Data to cache
 * @param priority Optional priority level (higher = more important)
 */
export function storeInCache<T>(
  tenantId: number | string, 
  entityType: string, 
  entityId: string | number, 
  data: T,
  priority: number = 1
): void {
  if (!isCacheAvailable()) {
    logger.error('Cache is not available');
    return;
  }

  if (tenantId === undefined || entityType === undefined || entityId === undefined || data === undefined) {
    logger.error('Invalid cache parameters for storing', { tenantId, entityType, entityId });
    cacheStats.errors++;
    return;
  }

  // Don't cache null or undefined values
  if (data === null || data === undefined) {
    logger.debug('Skipping cache of null/undefined data', { tenantId, entityType, entityId });
    return;
  }
  
  const tenantKey = String(tenantId);
  const entityKey = String(entityId);
  
  try {
    // Initialize cache structure if needed
    if (!cache[tenantKey]) {
      cache[tenantKey] = { totalSize: 0 };
    }
    
    if (!cache[tenantKey][entityType]) {
      cache[tenantKey][entityType] = {};
    }
    
    // Check if we're updating an existing entry
    const isUpdate = !!cache[tenantKey][entityType][entityKey];
    
    // Calculate approximate size
    const size = estimateObjectSize(data);
    
    // Store data with timestamp
    cache[tenantKey][entityType][entityKey] = {
      data,
      timestamp: Date.now(),
      size,
      priority
    };
    
    // Update tenant size counter if this is a new entry
    if (!isUpdate) {
      cache[tenantKey].totalSize = (cache[tenantKey].totalSize || 0) + 1;
      cacheStats.totalItems++;
    }
    
    // Check if we need to evict some entries
    manageTenantsCache(tenantKey);
    
    logger.debug('Stored in cache', { tenantId, entityType, entityId, size });
  } catch (error) {
    cacheStats.errors++;
    logger.error('Error storing in cache', { error, tenantId, entityType, entityId });
  }
}

/**
 * Invalidate specific cache entry
 * @param tenantId Tenant/organization ID
 * @param entityType Type of entity (e.g., 'ctqFactors', 'qmpRules')
 * @param entityId Entity ID or 'collection' for lists
 */
export function invalidateCache(
  tenantId: number | string, 
  entityType: string, 
  entityId?: string | number
): void {
  if (!isCacheAvailable()) {
    logger.error('Cache is not available');
    return;
  }

  if (tenantId === undefined || entityType === undefined) {
    logger.error('Invalid cache parameters for invalidation', { tenantId, entityType, entityId });
    cacheStats.errors++;
    return;
  }
  
  const tenantKey = String(tenantId);
  
  try {
    // If entityId is provided, invalidate specific entry
    if (entityId !== undefined) {
      const entityKey = String(entityId);
      
      if (cache[tenantKey]?.[entityType]?.[entityKey]) {
        delete cache[tenantKey][entityType][entityKey];
        
        // Update stats
        if (cache[tenantKey].totalSize > 0) {
          cache[tenantKey].totalSize--;
        }
        cacheStats.totalItems--;
        
        logger.debug('Invalidated specific cache entry', { tenantId, entityType, entityId });
      }
      
      // Clean up empty entity types
      if (cache[tenantKey]?.[entityType] && 
          Object.keys(cache[tenantKey][entityType]).length === 0) {
        delete cache[tenantKey][entityType];
      }
    } 
    // Otherwise, invalidate all entries of this entity type
    else if (cache[tenantKey]?.[entityType]) {
      // Count the entries we're about to delete
      const entriesToRemove = Object.keys(cache[tenantKey][entityType]).length;
      
      // Update stats
      if (cache[tenantKey].totalSize >= entriesToRemove) {
        cache[tenantKey].totalSize -= entriesToRemove;
      } else {
        cache[tenantKey].totalSize = 0;
      }
      cacheStats.totalItems -= entriesToRemove;
      
      // Delete the entity type
      delete cache[tenantKey][entityType];
      logger.debug('Invalidated entity type cache', { 
        tenantId, 
        entityType, 
        entriesRemoved: entriesToRemove 
      });
    }
    
    // Clean up empty tenants
    if (cache[tenantKey] && 
        Object.keys(cache[tenantKey]).length <= 1 && 
        cache[tenantKey].totalSize === 0) {
      delete cache[tenantKey];
    }
  } catch (error) {
    cacheStats.errors++;
    logger.error('Error invalidating cache', { error, tenantId, entityType, entityId });
  }
}

/**
 * Invalidate all cache entries for a tenant
 * @param tenantId Tenant/organization ID
 */
export function invalidateTenantCache(tenantId: number | string): void {
  if (!isCacheAvailable()) {
    logger.error('Cache is not available');
    return;
  }

  if (tenantId === undefined) {
    logger.error('Invalid tenant ID for cache invalidation', { tenantId });
    cacheStats.errors++;
    return;
  }
  
  const tenantKey = String(tenantId);
  
  try {
    if (cache[tenantKey]) {
      // Count entries
      let entriesRemoved = cache[tenantKey].totalSize || 0;
      
      // Update stats
      cacheStats.totalItems -= entriesRemoved;
      
      // Delete tenant entries
      delete cache[tenantKey];
      logger.debug('Invalidated tenant cache', { tenantId, entriesRemoved });
    }
  } catch (error) {
    cacheStats.errors++;
    logger.error('Error invalidating tenant cache', { error, tenantId });
  }
}

/**
 * Clear expired cache entries (can be run periodically)
 */
export function clearExpiredCache(): void {
  if (!isCacheAvailable()) {
    logger.error('Cache is not available for cleanup');
    return;
  }
  
  const now = Date.now();
  let entriesRemoved = 0;
  
  try {
    // Save time of this cleanup
    cacheStats.lastCleanupTime = now;
    
    // Iterate through all cache entries and remove expired ones
    Object.keys(cache).forEach(tenantKey => {
      const tenant = cache[tenantKey];
      
      Object.keys(tenant).forEach(entityType => {
        if (entityType === 'totalSize') return;
        
        const entities = tenant[entityType];
        
        Object.keys(entities).forEach(entityKey => {
          const entry = entities[entityKey];
          
          if (now - entry.timestamp >= DEFAULT_CACHE_EXPIRATION) {
            delete entities[entityKey];
            entriesRemoved++;
            
            // Update tenant size counter
            if (tenant.totalSize > 0) {
              tenant.totalSize--;
            }
          }
        });
        
        // Clean up empty entity types
        if (Object.keys(entities).length === 0) {
          delete tenant[entityType];
        }
      });
      
      // Clean up empty tenants (keeping in mind totalSize is a special property)
      if (Object.keys(tenant).length <= 1 && tenant.totalSize === 0) {
        delete cache[tenantKey];
      }
    });
    
    // Update stats
    cacheStats.expired += entriesRemoved;
    cacheStats.totalItems -= entriesRemoved;
    
    // Log cleanup stats periodically
    if (entriesRemoved > 0) {
      logger.debug('Cleared expired cache entries', { entriesRemoved });
    }
    
    // Log cache statistics periodically (every 10 cleanups)
    if (cacheStats.hits + cacheStats.misses > 0 && 
        (cacheStats.hits + cacheStats.misses) % 100 === 0) {
      logCacheStats();
    }
  } catch (error) {
    cacheStats.errors++;
    logger.error('Error clearing expired cache', { error });
  }
}

/**
 * Calculate cache hit rate
 */
export function getCacheHitRate(): number {
  const totalRequests = cacheStats.hits + cacheStats.misses;
  if (totalRequests === 0) return 0;
  return (cacheStats.hits / totalRequests) * 100;
}

/**
 * Get cache statistics
 */
export function getCacheStats(): typeof cacheStats & { hitRate: number } {
  return {
    ...cacheStats,
    hitRate: getCacheHitRate()
  };
}

/**
 * Log cache statistics
 */
export function logCacheStats(): void {
  const hitRate = getCacheHitRate();
  
  let cacheSize = '';
  if (cacheStats.totalItems <= CRITICAL_CACHE_SIZES.small) {
    cacheSize = 'small';
  } else if (cacheStats.totalItems <= CRITICAL_CACHE_SIZES.medium) {
    cacheSize = 'medium';
  } else if (cacheStats.totalItems <= CRITICAL_CACHE_SIZES.large) {
    cacheSize = 'large';
  } else {
    cacheSize = 'xlarge';
  }
  
  logger.info('Cache statistics', {
    hits: cacheStats.hits,
    misses: cacheStats.misses,
    hitRate: `${hitRate.toFixed(2)}%`,
    totalItems: cacheStats.totalItems,
    evictions: cacheStats.evictions,
    expired: cacheStats.expired,
    errors: cacheStats.errors,
    cacheSize,
    tenants: Object.keys(cache).length
  });
}

/**
 * Reset cache statistics
 */
export function resetCacheStats(): void {
  cacheStats.hits = 0;
  cacheStats.misses = 0;
  cacheStats.expired = 0;
  cacheStats.evictions = 0;
  cacheStats.errors = 0;
  logger.info('Cache statistics reset');
}

// Set up periodic cache cleanup
const cleanupInterval = setInterval(() => {
  try {
    clearExpiredCache();
  } catch (error) {
    logger.error('Uncaught error in cache cleanup interval', { error });
  }
}, CLEANUP_INTERVAL);

// Ensure cleanup interval is properly cleared on process exit
process.on('beforeExit', () => {
  clearInterval(cleanupInterval);
});