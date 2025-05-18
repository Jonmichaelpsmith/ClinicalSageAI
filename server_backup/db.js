// Database connection setup
import { Pool } from 'pg';
import 'dotenv/config';
import EventEmitter from 'events';

// Database connection status tracker
export const dbStatus = {
  connected: false,
  lastConnected: null,
  lastError: null,
  connectionAttempts: 0,
  reconnecting: false,
  poolSize: 0,
  events: new EventEmitter()
};

// Create a new database pool with the connection string from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Add connection timeout and retry settings
  connectionTimeoutMillis: 5000,  // 5 seconds (reduced for faster failure detection)
  idleTimeoutMillis: 30000,       // 30 seconds
  max: 10,                        // Maximum number of clients
  allowExitOnIdle: true,          // Allow the pool to exit if idle
  maxUses: 500                    // Maximum number of uses before client is replaced
});

// Add error handler for the pool
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  
  // Update status
  dbStatus.lastError = err;
  dbStatus.connected = false;
  dbStatus.events.emit('error', err);
  
  // Schedule a reconnection test
  if (!dbStatus.reconnecting) {
    scheduleReconnectionTest();
  }
});

// Add connection monitoring
pool.on('connect', (client) => {
  dbStatus.poolSize++;
  dbStatus.events.emit('connect', { poolSize: dbStatus.poolSize });
  
  // Log connection stats periodically
  console.log('[database] Database connection successful', {
    timestamp: new Date().toISOString(),
    poolSize: dbStatus.poolSize
  });
});

pool.on('remove', (client) => {
  dbStatus.poolSize = Math.max(0, dbStatus.poolSize - 1);
  dbStatus.events.emit('remove', { poolSize: dbStatus.poolSize });
});

// Function to set tenant context variables on the database session
const setTenantContext = async (client, tenantContext) => {
  const { userId, croId, clientId } = tenantContext;
  
  // Set session variables for row-level security policies
  const queries = [];
  
  if (userId) {
    queries.push(`SET LOCAL app.current_user_id = '${userId}';`);
  }
  
  if (croId) {
    queries.push(`SET LOCAL app.current_cro_id = '${croId}';`);
  }
  
  if (clientId) {
    queries.push(`SET LOCAL app.current_client_id = '${clientId}';`);
  }
  
  if (queries.length > 0) {
    await client.query(queries.join(' '));
  }
};

// Function to get a database client with tenant context
const getClientWithContext = async (tenantContext) => {
  const client = await pool.connect();
  try {
    await setTenantContext(client, tenantContext);
    return client;
  } catch (error) {
    client.release();
    throw error;
  }
};

// Helper function to retry failed operations
async function retryOperation(operation, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.warn(`Database operation failed (attempt ${attempt}/${maxRetries}): ${error.message}`);
      lastError = error;
      
      // Only wait if we're going to retry
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
        // Increase delay for next attempt (exponential backoff)
        delay = delay * 1.5;
      }
    }
  }
  
  // If we get here, all retries failed
  throw lastError;
}

// Schedule a reconnection test after a failure
function scheduleReconnectionTest(delay = 5000) {
  if (dbStatus.reconnecting) return;
  
  dbStatus.reconnecting = true;
  dbStatus.connectionAttempts++;
  
  console.log(`[database] Scheduling reconnection attempt ${dbStatus.connectionAttempts} in ${delay}ms`);
  
  setTimeout(async () => {
    try {
      const success = await testConnection();
      if (success) {
        dbStatus.reconnecting = false;
        dbStatus.connectionAttempts = 0;
        console.log('[database] Reconnection successful');
      } else {
        // Exponential backoff for reconnection attempts
        const nextDelay = Math.min(30000, delay * 1.5); // Max 30 seconds
        scheduleReconnectionTest(nextDelay);
      }
    } catch (err) {
      console.error('[database] Reconnection attempt failed:', err);
      const nextDelay = Math.min(30000, delay * 1.5); // Max 30 seconds
      scheduleReconnectionTest(nextDelay);
    }
  }, delay);
}

// Function to test database connection with status updates
async function testConnection() {
  try {
    const { rows } = await pool.query('SELECT NOW()');
    
    // Update status
    dbStatus.connected = true;
    dbStatus.lastConnected = new Date();
    dbStatus.lastError = null;
    
    console.log('[database] Database connection successful');
    dbStatus.events.emit('connected');
    
    return true;
  } catch (error) {
    console.error('[database] Database connection test failed', {
      error: error.message
    });
    
    // Update status
    dbStatus.connected = false;
    dbStatus.lastError = error;
    dbStatus.events.emit('error', error);
    
    return false;
  }
}

// Test connection on startup
testConnection().catch(err => {
  console.error('[database] Initial connection test failed:', err.message);
  
  // Schedule a reconnection attempt if initial connection fails
  scheduleReconnectionTest();
});

// Set up periodic connection health checks every 30 seconds
setInterval(async () => {
  if (!dbStatus.connected && !dbStatus.reconnecting) {
    console.log('[database] Running scheduled connection health check');
    try {
      await testConnection();
    } catch (err) {
      // Error already logged in testConnection
    }
  }
}, 30000);

// Create query function that includes retry logic and fallback handling
const query = (text, params, tenantContext, options = {}) => {
  const { 
    retries = 3, 
    retryDelay = 1000, 
    fallbackFn = null,
    isReadOnly = false  // Set to true for SELECT queries that can use fallback data
  } = options;
  
  const executeQuery = async () => {
    try {
      if (tenantContext) {
        const client = await getClientWithContext(tenantContext);
        try {
          const result = await client.query(text, params);
          return result;
        } finally {
          client.release();
        }
      } else {
        return await pool.query(text, params);
      }
    } catch (error) {
      // If this is a read operation and we have a fallback function, use it
      if (isReadOnly && fallbackFn && !dbStatus.connected) {
        console.warn('[database] Using fallback data for query:', text.slice(0, 100));
        return fallbackFn();
      }
      throw error;
    }
  };
  
  return retryOperation(executeQuery, retries, retryDelay);
};

// Helper function to create a fallback response object that mimics pg result
export function createFallbackResult(rows = []) {
  return {
    rows,
    rowCount: rows.length,
    command: 'SELECT',
    oid: null,
    fields: [],
    _fallback: true  // Flag to identify this as fallback data
  };
};

// Export database functions
export { 
  pool, 
  getClientWithContext, 
  testConnection, 
  query 
};