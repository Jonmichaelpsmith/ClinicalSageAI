/**
 * TrialSage Vault Server Starter
 * 
 * This script starts the standalone Vault server on port 4000.
 * Run with: node start-vault-server.js
 */

import('./server/vault-server.js').catch(err => {
  console.error('Failed to start the Vault server:', err);
  process.exit(1);
});