/**
 * TrialSage Client Security Module
 * 
 * Provides client-side security features:
 * - Document integrity verification
 * - CSRF token management
 * - Secure storage handling
 * - Client-side encryption for sensitive data
 * - Tenant validation
 */

import { Buffer } from 'buffer';
import { getCookie, setCookie } from './cookies';

// Generate SHA-256 hash for document integrity
export const generateDocumentHash = async (document) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(typeof document === 'string' ? document : JSON.stringify(document));
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Encrypt sensitive data using AES-256-GCM
export const encryptData = async (data, key) => {
  try {
    // Convert key to format usable by WebCrypto API
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    
    // Generate IV (initialization vector)
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the data
    const dataToEncrypt = encoder.encode(typeof data === 'string' ? data : JSON.stringify(data));
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      cryptoKey,
      dataToEncrypt
    );
    
    // Convert to Base64 for transmission
    const encryptedArray = new Uint8Array(encryptedData);
    const ivString = Buffer.from(iv).toString('base64');
    const encryptedString = Buffer.from(encryptedArray).toString('base64');
    
    return {
      encryptedData: encryptedString,
      iv: ivString,
      method: 'AES-256-GCM'
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data: ' + error.message);
  }
};

// Decrypt data that was encrypted with AES-256-GCM
export const decryptData = async (encryptedObj, key) => {
  try {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    // Import the encryption key
    const keyData = encoder.encode(key);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    // Convert from Base64
    const iv = Buffer.from(encryptedObj.iv, 'base64');
    const encryptedData = Buffer.from(encryptedObj.encryptedData, 'base64');
    
    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(iv)
      },
      cryptoKey,
      new Uint8Array(encryptedData)
    );
    
    // Convert back to string
    const decryptedString = decoder.decode(decryptedBuffer);
    
    try {
      // Try to parse as JSON if possible
      return JSON.parse(decryptedString);
    } catch {
      // Return as string if not valid JSON
      return decryptedString;
    }
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data: ' + error.message);
  }
};

// Get CSRF token from cookie
export const getCsrfToken = () => {
  return getCookie('csrfToken');
};

// Add CSRF token to all API requests
export const addCsrfToken = (config) => {
  const token = getCsrfToken();
  
  if (token) {
    if (!config.headers) {
      config.headers = {};
    }
    
    config.headers['X-CSRF-Token'] = token;
  }
  
  return config;
};

// Add tenant identifier to all API requests
export const addTenantId = (config, tenantId) => {
  if (!config.headers) {
    config.headers = {};
  }
  
  config.headers['X-Tenant-ID'] = tenantId;
  
  return config;
};

// Store an item securely in localStorage with encryption
export const secureLocalStorage = {
  getItem: async (key, encryptionKey) => {
    try {
      const item = localStorage.getItem(key);
      
      if (!item) {
        return null;
      }
      
      const parsed = JSON.parse(item);
      
      // If data is encrypted, decrypt it
      if (parsed.encrypted && encryptionKey) {
        return await decryptData(parsed.data, encryptionKey);
      }
      
      // Otherwise return the plain data
      return parsed.data;
    } catch (error) {
      console.error('Error getting item from secure storage:', error);
      return null;
    }
  },
  
  setItem: async (key, value, options = {}) => {
    try {
      const { encrypt = false, encryptionKey = null, ttl = null } = options;
      
      let dataToStore = {
        data: value,
        encrypted: false,
        createdAt: new Date().toISOString()
      };
      
      // Set expiration timestamp if TTL is provided
      if (ttl) {
        dataToStore.expiresAt = new Date(Date.now() + ttl).toISOString();
      }
      
      // Encrypt the data if requested
      if (encrypt && encryptionKey) {
        dataToStore = {
          data: await encryptData(value, encryptionKey),
          encrypted: true,
          createdAt: new Date().toISOString()
        };
        
        if (ttl) {
          dataToStore.expiresAt = new Date(Date.now() + ttl).toISOString();
        }
      }
      
      localStorage.setItem(key, JSON.stringify(dataToStore));
      return true;
    } catch (error) {
      console.error('Error setting item in secure storage:', error);
      return false;
    }
  },
  
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing item from secure storage:', error);
      return false;
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing secure storage:', error);
      return false;
    }
  }
};

// Secure document upload with integrity verification
export const prepareSecureDocumentUpload = async (document, metadata = {}) => {
  // Generate hash for integrity verification
  const hash = await generateDocumentHash(document);
  
  return {
    document,
    hash,
    metadata: {
      ...metadata,
      clientTimestamp: new Date().toISOString(),
      integrityVersion: '1.0'
    }
  };
};

// Security audit logger for client-side events
export const auditLog = (action, details = {}) => {
  // Only log in development or when explicitly enabled
  if (process.env.NODE_ENV !== 'production' || localStorage.getItem('enableAuditLogging') === 'true') {
    console.log(`[SECURITY AUDIT] ${action}`, {
      timestamp: new Date().toISOString(),
      ...details
    });
  }
  
  // If configured, send audit events to server
  if (typeof window !== 'undefined' && window.sendAuditEvent) {
    window.sendAuditEvent(action, details);
  }
};

// Auto-logout timer for security compliance
let inactivityTimer;
export const setupSecurityInactivityMonitor = (logoutCallback, timeoutMs = 30 * 60 * 1000) => {
  const resetTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    
    inactivityTimer = setTimeout(() => {
      auditLog('AUTO_LOGOUT', { reason: 'inactivity', timeoutMs });
      logoutCallback();
    }, timeoutMs);
  };
  
  // Reset timer on user activity
  if (typeof window !== 'undefined') {
    ['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true });
    });
    
    // Initial timer start
    resetTimer();
  }
  
  // Return function to clear listeners when component unmounts
  return () => {
    if (typeof window !== 'undefined') {
      ['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    }
    
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
  };
};