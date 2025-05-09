/**
 * Tenant Caching System
 * 
 * This module implements a caching layer for tenant-specific data
 * to reduce database load and improve performance.
 */
import { createScopedLogger } from '../utils/logger';
 
const logger = createScopedLogger('tenant-cache');

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

// Cache storage organized by tenant and entity type
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface CacheStore {
  [tenantId: string]: {
    [entityType: string]: {
      [entityId: string]: CacheEntry<any>;
    };
  };
}

// In-memory cache
const cache: CacheStore = {};

/**
 * Get data from cache
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
  const tenantKey = String(tenantId);
  const entityKey = String(entityId);
  const now = Date.now();
  
  try {
    // Check if cache entry exists
    if (cache[tenantKey]?.[entityType]?.[entityKey]) {
      const entry = cache[tenantKey][entityType][entityKey];
      
      // Check if cache entry is still valid
      if (now - entry.timestamp < CACHE_EXPIRATION) {
        logger.debug('Cache hit', { tenantId, entityType, entityId });
        return entry.data as T;
      } else {
        // Cache expired, delete entry
        delete cache[tenantKey][entityType][entityKey];
        logger.debug('Cache expired', { tenantId, entityType, entityId });
      }
    }
    
    // Cache miss
    return null;
  } catch (error) {
    logger.error('Error retrieving from cache', { error, tenantId, entityType, entityId });
    return null;
  }
}

/**
 * Store data in cache
 * @param tenantId Tenant/organization ID
 * @param entityType Type of entity (e.g., 'ctqFactors', 'qmpRules')
 * @param entityId Entity ID or 'collection' for lists
 * @param data Data to cache
 */
export function storeInCache<T>(
  tenantId: number | string, 
  entityType: string, 
  entityId: string | number, 
  data: T
): void {
  const tenantKey = String(tenantId);
  const entityKey = String(entityId);
  
  try {
    // Initialize cache structure if needed
    if (!cache[tenantKey]) {
      cache[tenantKey] = {};
    }
    
    if (!cache[tenantKey][entityType]) {
      cache[tenantKey][entityType] = {};
    }
    
    // Store data with timestamp
    cache[tenantKey][entityType][entityKey] = {
      data,
      timestamp: Date.now()
    };
    
    logger.debug('Stored in cache', { tenantId, entityType, entityId });
  } catch (error) {
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
  const tenantKey = String(tenantId);
  
  try {
    // If entityId is provided, invalidate specific entry
    if (entityId !== undefined) {
      const entityKey = String(entityId);
      
      if (cache[tenantKey]?.[entityType]?.[entityKey]) {
        delete cache[tenantKey][entityType][entityKey];
        logger.debug('Invalidated specific cache entry', { tenantId, entityType, entityId });
      }
    } 
    // Otherwise, invalidate all entries of this entity type
    else if (cache[tenantKey]?.[entityType]) {
      delete cache[tenantKey][entityType];
      logger.debug('Invalidated entity type cache', { tenantId, entityType });
    }
  } catch (error) {
    logger.error('Error invalidating cache', { error, tenantId, entityType, entityId });
  }
}

/**
 * Invalidate all cache entries for a tenant
 * @param tenantId Tenant/organization ID
 */
export function invalidateTenantCache(tenantId: number | string): void {
  const tenantKey = String(tenantId);
  
  try {
    if (cache[tenantKey]) {
      delete cache[tenantKey];
      logger.debug('Invalidated tenant cache', { tenantId });
    }
  } catch (error) {
    logger.error('Error invalidating tenant cache', { error, tenantId });
  }
}

/**
 * Clear expired cache entries (can be run periodically)
 */
export function clearExpiredCache(): void {
  const now = Date.now();
  
  try {
    // Iterate through all cache entries and remove expired ones
    Object.keys(cache).forEach(tenantKey => {
      const tenant = cache[tenantKey];
      
      Object.keys(tenant).forEach(entityType => {
        const entities = tenant[entityType];
        
        Object.keys(entities).forEach(entityKey => {
          const entry = entities[entityKey];
          
          if (now - entry.timestamp >= CACHE_EXPIRATION) {
            delete entities[entityKey];
          }
        });
        
        // Clean up empty entity types
        if (Object.keys(entities).length === 0) {
          delete tenant[entityType];
        }
      });
      
      // Clean up empty tenants
      if (Object.keys(tenant).length === 0) {
        delete cache[tenantKey];
      }
    });
    
    logger.debug('Cleared expired cache entries');
  } catch (error) {
    logger.error('Error clearing expired cache', { error });
  }
}

// Set up periodic cache cleanup
setInterval(clearExpiredCache, CACHE_EXPIRATION);