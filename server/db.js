// Database connection setup
import { Pool } from 'pg';
import 'dotenv/config';

// Create a new database pool with the connection string from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Add connection timeout and retry settings
  connectionTimeoutMillis: 10000, // 10 seconds
  idleTimeoutMillis: 30000,      // 30 seconds
  max: 10,                       // Maximum number of clients
  allowExitOnIdle: true          // Allow the pool to exit if idle
});

// Add error handler for the pool
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  // Don't crash the server on connection errors
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

// Function to test database connection
async function testConnection() {
  try {
    const { rows } = await pool.query('SELECT NOW()');
    console.log('[database] Database connection test successful');
    return true;
  } catch (error) {
    console.error('[database] Database connection test failed', {
      error: error.message
    });
    return false;
  }
}

// Test connection on startup
testConnection().catch(err => {
  console.error('[database] Initial connection test failed:', err.message);
});

// Create query function that includes retry logic
const query = (text, params, tenantContext, options = {}) => {
  const { retries = 3, retryDelay = 1000 } = options;
  
  if (tenantContext) {
    return retryOperation(async () => {
      const client = await getClientWithContext(tenantContext);
      try {
        const result = await client.query(text, params);
        return result;
      } finally {
        client.release();
      }
    }, retries, retryDelay);
  } else {
    return retryOperation(async () => {
      return await pool.query(text, params);
    }, retries, retryDelay);
  }
};

// Export database functions
export { 
  pool, 
  getClientWithContext, 
  testConnection, 
  query 
};