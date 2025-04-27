/**
 * Server Keep-Alive Module
 * 
 * This module implements a self-pinging mechanism to prevent Replit
 * from hibernating the server due to inactivity.
 */

const https = require('https');
const http = require('http');

class ServerKeepAlive {
  constructor(options = {}) {
    this.interval = options.interval || 5 * 60 * 1000; // Default: 5 minutes
    this.url = options.url || null;
    this.isRunning = false;
    this.timer = null;
    this.log = options.silent ? () => {} : console.log;
  }

  /**
   * Start the keep-alive ping service
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.log('[KeepAlive] Keep-alive service started');
    
    // Do an initial ping
    this.ping();
    
    // Set up the interval
    this.timer = setInterval(() => this.ping(), this.interval);
  }

  /**
   * Stop the keep-alive ping service
   */
  stop() {
    if (!this.isRunning) return;
    
    clearInterval(this.timer);
    this.timer = null;
    this.isRunning = false;
    this.log('[KeepAlive] Keep-alive service stopped');
  }

  /**
   * Perform a ping to keep the server alive
   */
  ping() {
    // If no URL is provided, get our own URL
    const pingUrl = this.url || this.getSelfUrl();
    
    if (!pingUrl) {
      this.log('[KeepAlive] Warning: Unable to determine URL to ping');
      return;
    }
    
    this.log(`[KeepAlive] Pinging ${pingUrl} to keep server awake`);
    
    const isHttps = pingUrl.startsWith('https');
    const client = isHttps ? https : http;
    
    const req = client.get(pingUrl, (res) => {
      const statusCode = res.statusCode;
      this.log(`[KeepAlive] Ping successful: ${statusCode}`);
    });
    
    req.on('error', (err) => {
      this.log(`[KeepAlive] Ping failed: ${err.message}`);
    });
    
    // Set a timeout to avoid hanging
    req.setTimeout(30000, () => {
      req.destroy();
      this.log('[KeepAlive] Ping timed out after 30 seconds');
    });
  }

  /**
   * Attempt to determine the server's own URL
   */
  getSelfUrl() {
    // Try to get the Replit URL from environment variables
    if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
      return `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
    }
    
    // Fallback to a localhost URL if running locally
    return 'http://localhost:5000';
  }
}

module.exports = ServerKeepAlive;