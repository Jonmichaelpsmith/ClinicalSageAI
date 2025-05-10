/**
 * Application Stability Configuration
 * 
 * This file contains configuration settings that control the application's
 * stability mechanisms. This ensures consistent behavior across all parts
 * of the application.
 * 
 * CRITICAL STABILITY COMPONENT - DO NOT MODIFY WITHOUT THOROUGH TESTING
 */

/**
 * Global stability configuration
 */
export const STABILITY_CONFIG = {
  // Whether to enable stability features (should always be true in production)
  enabled: true,
  
  // Maximum number of automatic recovery attempts before requiring manual intervention
  maxRecoveryAttempts: 3,
  
  // Time between recovery attempts in milliseconds
  recoveryDelayMs: 1000,
  
  // Components requiring specialized stability containers
  criticalComponents: [
    'RegulatorySubmissionsPage',
    'DocumentUploadDialog',
    'SubmissionTreeView',
    'CreateSubmissionDialog'
  ],
  
  // Log errors to localStorage
  logErrors: true,
  
  // Maximum number of errors to keep in local storage
  maxErrorsToStore: 20,
  
  // Auto reload when error count exceeds this threshold within 5 minutes
  errorThresholdToReload: 10,
  
  // Display detailed error information in development
  showDetailedErrors: process.env.NODE_ENV !== 'production'
};

/**
 * Memory management configuration to prevent browser tab crashes
 */
export const MEMORY_CONFIG = {
  // Enable periodic garbage collection hints
  enableGCHints: true,
  
  // Maximum number of items to keep in component caches
  maxCacheItems: 100,
  
  // Clear unused objects from memory every 5 minutes
  memorySweepIntervalMs: 5 * 60 * 1000
};

/**
 * Network request configuration for stability
 */
export const NETWORK_CONFIG = {
  // Default timeout for network requests in milliseconds
  defaultTimeoutMs: 30000,
  
  // Maximum number of retry attempts for failed requests
  maxRetryAttempts: 3,
  
  // Time between retry attempts in milliseconds (exponential backoff)
  retryBackoffMs: 1000,
  
  // Maximum backoff time in milliseconds
  maxBackoffMs: 10000
};

/**
 * Log levels for the application
 */
export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
};

/**
 * Configuration for minimum log level based on environment
 */
export const LOGGING_CONFIG = {
  minLogLevel: process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG,
  persistLogs: true,
  maxPersistedLogs: 1000
};

export default {
  STABILITY_CONFIG,
  MEMORY_CONFIG,
  NETWORK_CONFIG,
  LOG_LEVELS,
  LOGGING_CONFIG
};