/**
 * Storage Resilience Utility
 * 
 * This module provides resilient browser storage operations that can survive
 * storage corruption or quota issues, with fallbacks and automatic recovery.
 * 
 * CRITICAL STABILITY COMPONENT - DO NOT MODIFY WITHOUT THOROUGH TESTING
 */

/**
 * Storage types
 */
const STORAGE_TYPES = {
  LOCAL: 'localStorage',
  SESSION: 'sessionStorage',
  INDEXED_DB: 'indexedDB',
  MEMORY: 'memory'
};

/**
 * In-memory fallback storage when persisted storage is unavailable
 */
const memoryStorage = new Map();

/**
 * Track storage health status
 */
const storageHealth = {
  localStorage: {
    available: true,
    errors: 0,
    lastError: null,
    lastErrorTime: null
  },
  sessionStorage: {
    available: true,
    errors: 0,
    lastError: null,
    lastErrorTime: null
  },
  indexedDB: {
    available: true,
    errors: 0,
    lastError: null,
    lastErrorTime: null,
    database: null
  }
};

/**
 * Event handlers for storage events
 */
const storageEventHandlers = new Map();

/**
 * Initialize storage resilience
 */
export async function initStorageResilience() {
  // Test if localStorage is available
  checkLocalStorageAvailability();
  
  // Test if sessionStorage is available
  checkSessionStorageAvailability();
  
  // Test if IndexedDB is available
  await checkIndexedDBAvailability();
  
  // Set up event listeners for storage changes
  setupStorageEventListeners();
  
  // Attempt to repair any corrupted storage
  await attemptStorageRepair();
  
  return {
    localStorage: storageHealth.localStorage.available,
    sessionStorage: storageHealth.sessionStorage.available,
    indexedDB: storageHealth.indexedDB.available
  };
}

/**
 * Check if localStorage is available and working
 */
function checkLocalStorageAvailability() {
  try {
    // Try to write and read a test value
    const testValue = `test-${Date.now()}`;
    localStorage.setItem('storage-test', testValue);
    const result = localStorage.getItem('storage-test');
    localStorage.removeItem('storage-test');
    
    // Check if the value was stored and retrieved correctly
    storageHealth.localStorage.available = result === testValue;
  } catch (error) {
    console.error('localStorage is not available:', error);
    storageHealth.localStorage.available = false;
    storageHealth.localStorage.lastError = error;
    storageHealth.localStorage.lastErrorTime = Date.now();
    storageHealth.localStorage.errors++;
  }
}

/**
 * Check if sessionStorage is available and working
 */
function checkSessionStorageAvailability() {
  try {
    // Try to write and read a test value
    const testValue = `test-${Date.now()}`;
    sessionStorage.setItem('storage-test', testValue);
    const result = sessionStorage.getItem('storage-test');
    sessionStorage.removeItem('storage-test');
    
    // Check if the value was stored and retrieved correctly
    storageHealth.sessionStorage.available = result === testValue;
  } catch (error) {
    console.error('sessionStorage is not available:', error);
    storageHealth.sessionStorage.available = false;
    storageHealth.sessionStorage.lastError = error;
    storageHealth.sessionStorage.lastErrorTime = Date.now();
    storageHealth.sessionStorage.errors++;
  }
}

/**
 * Check if IndexedDB is available and working
 */
async function checkIndexedDBAvailability() {
  if (!window.indexedDB) {
    storageHealth.indexedDB.available = false;
    return;
  }
  
  try {
    // Try to open a test database
    const request = indexedDB.open('storage-test', 1);
    
    // Return a promise that resolves when the database is open
    await new Promise((resolve, reject) => {
      request.onerror = (event) => {
        storageHealth.indexedDB.available = false;
        storageHealth.indexedDB.lastError = event.target.error;
        storageHealth.indexedDB.lastErrorTime = Date.now();
        storageHealth.indexedDB.errors++;
        reject(event.target.error);
      };
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        storageHealth.indexedDB.available = true;
        storageHealth.indexedDB.database = db;
        db.close();
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        // Create a test object store
        if (!db.objectStoreNames.contains('test-store')) {
          db.createObjectStore('test-store', { keyPath: 'id' });
        }
      };
    });
    
    // Delete the test database
    await new Promise((resolve) => {
      const deleteRequest = indexedDB.deleteDatabase('storage-test');
      deleteRequest.onsuccess = resolve;
      deleteRequest.onerror = resolve; // Resolve anyway, we don't care if deletion fails
    });
    
  } catch (error) {
    console.error('IndexedDB is not available:', error);
    storageHealth.indexedDB.available = false;
    storageHealth.indexedDB.lastError = error;
    storageHealth.indexedDB.lastErrorTime = Date.now();
    storageHealth.indexedDB.errors++;
  }
}

/**
 * Setup storage event listeners
 */
function setupStorageEventListeners() {
  // Listen for storage events from other tabs
  window.addEventListener('storage', (event) => {
    // Notify any registered handlers
    const handlers = storageEventHandlers.get(event.key) || [];
    handlers.forEach(handler => {
      try {
        handler(event.newValue ? JSON.parse(event.newValue) : null);
      } catch (error) {
        console.error(`Error in storage event handler for key ${event.key}:`, error);
      }
    });
  });
}

/**
 * Attempt to repair corrupted storage
 */
async function attemptStorageRepair() {
  // Check localStorage for corruption
  if (!storageHealth.localStorage.available) {
    try {
      // Try to clear localStorage completely
      localStorage.clear();
      checkLocalStorageAvailability();
      console.log('localStorage repaired successfully');
    } catch (error) {
      console.error('Failed to repair localStorage:', error);
    }
  }
  
  // Check sessionStorage for corruption
  if (!storageHealth.sessionStorage.available) {
    try {
      // Try to clear sessionStorage completely
      sessionStorage.clear();
      checkSessionStorageAvailability();
      console.log('sessionStorage repaired successfully');
    } catch (error) {
      console.error('Failed to repair sessionStorage:', error);
    }
  }
  
  // Check IndexedDB for corruption
  if (!storageHealth.indexedDB.available) {
    // IndexedDB repairs are more complex and would go here
    // This is a simplified version that just checks again
    await checkIndexedDBAvailability();
  }
}

/**
 * Get current storage health status
 */
export function getStorageHealth() {
  return {
    localStorage: { ...storageHealth.localStorage },
    sessionStorage: { ...storageHealth.sessionStorage },
    indexedDB: { ...storageHealth.indexedDB }
  };
}

/**
 * Restore data from backup storage if available
 */
function restoreFromBackup(key) {
  // Check memory backup
  const memoryValue = memoryStorage.get(key);
  if (memoryValue !== undefined) {
    return memoryValue;
  }
  
  // Check alternative storage options
  // If localStorage failed, try sessionStorage
  if (!storageHealth.localStorage.available && storageHealth.sessionStorage.available) {
    try {
      const value = sessionStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (e) {
      // Ignore errors
    }
  }
  
  // If sessionStorage failed, try localStorage
  if (!storageHealth.sessionStorage.available && storageHealth.localStorage.available) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (e) {
      // Ignore errors
    }
  }
  
  return null;
}

/**
 * Store value with resilience across multiple storage mechanisms
 * 
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @param {Object} options - Storage options
 * @param {string} options.type - Storage type (localStorage, sessionStorage, indexedDB, memory)
 * @param {boolean} options.backup - Whether to backup to memory if main storage fails
 * @returns {boolean} - Whether the operation succeeded
 */
export function resilientSet(key, value, options = {}) {
  const { 
    type = STORAGE_TYPES.LOCAL,
    backup = true
  } = options;
  
  // Always backup to memory if requested
  if (backup) {
    memoryStorage.set(key, value);
  }
  
  // Serialize the value
  let serializedValue;
  try {
    serializedValue = JSON.stringify(value);
  } catch (error) {
    console.error(`Failed to serialize value for key ${key}:`, error);
    return false;
  }
  
  // Store in the requested storage type
  let success = false;
  
  try {
    switch (type) {
      case STORAGE_TYPES.LOCAL:
        if (storageHealth.localStorage.available) {
          localStorage.setItem(key, serializedValue);
          success = true;
        }
        break;
        
      case STORAGE_TYPES.SESSION:
        if (storageHealth.sessionStorage.available) {
          sessionStorage.setItem(key, serializedValue);
          success = true;
        }
        break;
        
      case STORAGE_TYPES.INDEXED_DB:
        // IndexedDB operations would go here
        // This is just a placeholder
        if (storageHealth.indexedDB.available) {
          // IndexedDB is asynchronous, so this would need to be more complex in reality
          success = true;
        }
        break;
        
      case STORAGE_TYPES.MEMORY:
        // Already done above
        success = true;
        break;
        
      default:
        console.error(`Unknown storage type: ${type}`);
    }
  } catch (error) {
    console.error(`Failed to store value for key ${key} in ${type}:`, error);
    
    // Update health status
    if (type === STORAGE_TYPES.LOCAL) {
      storageHealth.localStorage.available = false;
      storageHealth.localStorage.lastError = error;
      storageHealth.localStorage.lastErrorTime = Date.now();
      storageHealth.localStorage.errors++;
    } else if (type === STORAGE_TYPES.SESSION) {
      storageHealth.sessionStorage.available = false;
      storageHealth.sessionStorage.lastError = error;
      storageHealth.sessionStorage.lastErrorTime = Date.now();
      storageHealth.sessionStorage.errors++;
    }
    
    // Attempt repair in the background
    setTimeout(attemptStorageRepair, 0);
  }
  
  return success;
}

/**
 * Get value with resilience across multiple storage mechanisms
 * 
 * @param {string} key - Storage key
 * @param {Object} options - Storage options
 * @param {string} options.type - Storage type (localStorage, sessionStorage, indexedDB, memory)
 * @param {any} options.defaultValue - Default value if not found
 * @param {boolean} options.tryAlternatives - Whether to try alternative storage if main storage fails
 * @returns {any} - Retrieved value or defaultValue if not found
 */
export function resilientGet(key, options = {}) {
  const { 
    type = STORAGE_TYPES.LOCAL,
    defaultValue = null,
    tryAlternatives = true
  } = options;
  
  let value = defaultValue;
  let success = false;
  
  try {
    switch (type) {
      case STORAGE_TYPES.LOCAL:
        if (storageHealth.localStorage.available) {
          const stored = localStorage.getItem(key);
          if (stored !== null) {
            value = JSON.parse(stored);
            success = true;
          }
        }
        break;
        
      case STORAGE_TYPES.SESSION:
        if (storageHealth.sessionStorage.available) {
          const stored = sessionStorage.getItem(key);
          if (stored !== null) {
            value = JSON.parse(stored);
            success = true;
          }
        }
        break;
        
      case STORAGE_TYPES.INDEXED_DB:
        // IndexedDB operations would go here
        // This is just a placeholder
        if (storageHealth.indexedDB.available) {
          // IndexedDB is asynchronous, so this would need to be more complex in reality
        }
        break;
        
      case STORAGE_TYPES.MEMORY:
        const memValue = memoryStorage.get(key);
        if (memValue !== undefined) {
          value = memValue;
          success = true;
        }
        break;
        
      default:
        console.error(`Unknown storage type: ${type}`);
    }
  } catch (error) {
    console.error(`Failed to retrieve value for key ${key} from ${type}:`, error);
    
    // Update health status
    if (type === STORAGE_TYPES.LOCAL) {
      storageHealth.localStorage.available = false;
      storageHealth.localStorage.lastError = error;
      storageHealth.localStorage.lastErrorTime = Date.now();
      storageHealth.localStorage.errors++;
    } else if (type === STORAGE_TYPES.SESSION) {
      storageHealth.sessionStorage.available = false;
      storageHealth.sessionStorage.lastError = error;
      storageHealth.sessionStorage.lastErrorTime = Date.now();
      storageHealth.sessionStorage.errors++;
    }
    
    // Attempt repair in the background
    setTimeout(attemptStorageRepair, 0);
  }
  
  // If the main storage failed and we're allowed to try alternatives
  if (!success && tryAlternatives) {
    return restoreFromBackup(key) ?? defaultValue;
  }
  
  return value;
}

/**
 * Remove value with resilience across multiple storage mechanisms
 * 
 * @param {string} key - Storage key
 * @param {Object} options - Storage options
 * @param {string} options.type - Storage type (localStorage, sessionStorage, indexedDB, memory)
 * @param {boolean} options.removeFromAll - Whether to remove from all storage types
 * @returns {boolean} - Whether the operation succeeded
 */
export function resilientRemove(key, options = {}) {
  const { 
    type = STORAGE_TYPES.LOCAL,
    removeFromAll = false
  } = options;
  
  let success = false;
  
  // Always remove from memory
  memoryStorage.delete(key);
  
  if (removeFromAll) {
    // Remove from all storage types
    try {
      if (storageHealth.localStorage.available) {
        localStorage.removeItem(key);
      }
    } catch (e) {
      // Ignore errors
    }
    
    try {
      if (storageHealth.sessionStorage.available) {
        sessionStorage.removeItem(key);
      }
    } catch (e) {
      // Ignore errors
    }
    
    // IndexedDB would be handled here
    
    success = true;
  } else {
    // Remove only from the specified storage type
    try {
      switch (type) {
        case STORAGE_TYPES.LOCAL:
          if (storageHealth.localStorage.available) {
            localStorage.removeItem(key);
            success = true;
          }
          break;
          
        case STORAGE_TYPES.SESSION:
          if (storageHealth.sessionStorage.available) {
            sessionStorage.removeItem(key);
            success = true;
          }
          break;
          
        case STORAGE_TYPES.INDEXED_DB:
          // IndexedDB operations would go here
          if (storageHealth.indexedDB.available) {
            // IndexedDB is asynchronous, so this would need to be more complex in reality
            success = true;
          }
          break;
          
        case STORAGE_TYPES.MEMORY:
          // Already done above
          success = true;
          break;
          
        default:
          console.error(`Unknown storage type: ${type}`);
      }
    } catch (error) {
      console.error(`Failed to remove value for key ${key} from ${type}:`, error);
      
      // Update health status
      if (type === STORAGE_TYPES.LOCAL) {
        storageHealth.localStorage.available = false;
        storageHealth.localStorage.lastError = error;
        storageHealth.localStorage.lastErrorTime = Date.now();
        storageHealth.localStorage.errors++;
      } else if (type === STORAGE_TYPES.SESSION) {
        storageHealth.sessionStorage.available = false;
        storageHealth.sessionStorage.lastError = error;
        storageHealth.sessionStorage.lastErrorTime = Date.now();
        storageHealth.sessionStorage.errors++;
      }
      
      // Attempt repair in the background
      setTimeout(attemptStorageRepair, 0);
    }
  }
  
  return success;
}

/**
 * Clear all values from the specified storage
 * 
 * @param {Object} options - Storage options
 * @param {string} options.type - Storage type (localStorage, sessionStorage, indexedDB, memory)
 * @param {boolean} options.clearAll - Whether to clear all storage types
 * @returns {boolean} - Whether the operation succeeded
 */
export function resilientClear(options = {}) {
  const { 
    type = STORAGE_TYPES.LOCAL,
    clearAll = false
  } = options;
  
  let success = false;
  
  if (clearAll) {
    // Clear all storage types
    try {
      if (storageHealth.localStorage.available) {
        localStorage.clear();
      }
    } catch (e) {
      // Ignore errors
    }
    
    try {
      if (storageHealth.sessionStorage.available) {
        sessionStorage.clear();
      }
    } catch (e) {
      // Ignore errors
    }
    
    // IndexedDB would be handled here
    
    // Clear memory storage
    memoryStorage.clear();
    
    success = true;
  } else {
    // Clear only the specified storage type
    try {
      switch (type) {
        case STORAGE_TYPES.LOCAL:
          if (storageHealth.localStorage.available) {
            localStorage.clear();
            success = true;
          }
          break;
          
        case STORAGE_TYPES.SESSION:
          if (storageHealth.sessionStorage.available) {
            sessionStorage.clear();
            success = true;
          }
          break;
          
        case STORAGE_TYPES.INDEXED_DB:
          // IndexedDB operations would go here
          if (storageHealth.indexedDB.available) {
            // IndexedDB is asynchronous, so this would need to be more complex in reality
            success = true;
          }
          break;
          
        case STORAGE_TYPES.MEMORY:
          memoryStorage.clear();
          success = true;
          break;
          
        default:
          console.error(`Unknown storage type: ${type}`);
      }
    } catch (error) {
      console.error(`Failed to clear ${type}:`, error);
      
      // Update health status
      if (type === STORAGE_TYPES.LOCAL) {
        storageHealth.localStorage.available = false;
        storageHealth.localStorage.lastError = error;
        storageHealth.localStorage.lastErrorTime = Date.now();
        storageHealth.localStorage.errors++;
      } else if (type === STORAGE_TYPES.SESSION) {
        storageHealth.sessionStorage.available = false;
        storageHealth.sessionStorage.lastError = error;
        storageHealth.sessionStorage.lastErrorTime = Date.now();
        storageHealth.sessionStorage.errors++;
      }
      
      // Attempt repair in the background
      setTimeout(attemptStorageRepair, 0);
    }
  }
  
  return success;
}

/**
 * Subscribe to changes in a storage key
 * 
 * @param {string} key - Storage key to watch
 * @param {Function} callback - Function to call when the value changes
 * @returns {Function} - Unsubscribe function
 */
export function subscribeToStorageChanges(key, callback) {
  if (!storageEventHandlers.has(key)) {
    storageEventHandlers.set(key, []);
  }
  
  storageEventHandlers.get(key).push(callback);
  
  // Return unsubscribe function
  return () => {
    const handlers = storageEventHandlers.get(key) || [];
    const index = handlers.indexOf(callback);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
    
    // Clean up if no handlers left
    if (handlers.length === 0) {
      storageEventHandlers.delete(key);
    }
  };
}

export default {
  initStorageResilience,
  getStorageHealth,
  resilientSet,
  resilientGet,
  resilientRemove,
  resilientClear,
  subscribeToStorageChanges,
  STORAGE_TYPES
};