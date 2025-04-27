import knex from 'knex';
import 'dotenv/config';
import pg from 'pg';

// Configure Postgres SSL
const pgConfig = process.env.NODE_ENV === 'production' 
  ? {
      ssl: { 
        rejectUnauthorized: false 
      }
    }
  : {};

console.log('Connecting to database with URL:', process.env.DATABASE_URL ? 'URL present' : 'URL missing');

// Create PostgreSQL connection with better error handling
const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ...pgConfig
  },
  pool: { 
    min: 0, 
    max: 7,
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 30000,
    idleTimeoutMillis: 600000
  },
  acquireConnectionTimeout: 30000
});

// Log successful database connection
const testConnection = async () => {
  try {
    await db.raw('SELECT 1');
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection test failed', error);
    return false;
  }
};

// For use in asynchronous contexts
export const dbReady = testConnection();

export default db;