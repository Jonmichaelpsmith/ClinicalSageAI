// Database connection setup
const { Pool } = require('pg');
require('dotenv').config();

// Create a new database pool with the connection string from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
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

module.exports = {
  pool,
  getClientWithContext,
  query: (text, params, tenantContext) => {
    if (tenantContext) {
      return new Promise(async (resolve, reject) => {
        const client = await getClientWithContext(tenantContext);
        try {
          const result = await client.query(text, params);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          client.release();
        }
      });
    } else {
      return pool.query(text, params);
    }
  }
};