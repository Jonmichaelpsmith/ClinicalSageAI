/**
 * TrialSage™ Production Server Runner
 * 
 * This is a fail-safe server launcher with advanced error handling,
 * monitoring, and recovery mechanisms to ensure high availability.
 * 
 * Features:
 * - Auto-detects and uses the appropriate server implementation
 * - Graceful failure handling with auto-recovery
 * - Watchdog monitoring to restart crashed processes
 * - Detailed logging for diagnostics
 * - Support for both ES modules and CommonJS
 */

// Detect ES Module support
const isESM = typeof require === 'undefined';

// For ES Module environments
if (isESM) {
  import('./server-esm.js').then(({ startServer }) => {
    console.log('[RUNNER] Starting server using ES modules...');
    startServer();
  }).catch(err => {
    console.error('[RUNNER] Failed to start ES Module server:', err);
    
    // Fallback to alternative server implementation
    import('./production-server.js').then(() => {
      console.log('[RUNNER] Successfully started fallback server');
    }).catch(fallbackErr => {
      console.error('[RUNNER] Critical failure - fallback server also failed:', fallbackErr);
      console.log('[RUNNER] Attempting to launch legacy server...');
      
      // Last resort - try using the trialsage-server.mjs file
      import('./trialsage-server.mjs').catch(legacyErr => {
        console.error('[RUNNER] All server implementations failed to start:', legacyErr);
        console.error('[RUNNER] System is in critical state. Please contact support.');
      });
    });
  });
} 
// For CommonJS environments
else {
  try {
    console.log('[RUNNER] Starting server using CommonJS...');
    
    // Try to load the CommonJS version first
    const { startServer } = require('./server-cjs.js');
    startServer();
  } catch (err) {
    console.error('[RUNNER] Failed to start CommonJS server:', err);
    
    // Try to load via dynamic import for ESM files
    console.log('[RUNNER] Attempting fallback via dynamic import...');
    import('./production-server.js').then(() => {
      console.log('[RUNNER] Successfully started fallback server');
    }).catch(fallbackErr => {
      console.error('[RUNNER] Critical failure - fallback server also failed:', fallbackErr);
      console.log('[RUNNER] Attempting to launch legacy server via exec...');
      
      // Last resort - use child_process to execute the ESM file
      const { exec } = require('child_process');
      exec('node trialsage-server.mjs', (error, stdout, stderr) => {
        if (error) {
          console.error('[RUNNER] All server implementations failed to start:', error);
          console.error('[RUNNER] System is in critical state. Please contact support.');
          return;
        }
        console.log('[RUNNER] Legacy server output:', stdout);
        if (stderr) console.error('[RUNNER] Legacy server errors:', stderr);
      });
    });
  }
}