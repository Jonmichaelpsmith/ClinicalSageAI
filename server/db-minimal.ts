/**
 * Minimal Database Connection Module
 * 
 * This module provides a simple PostgreSQL connection for the approval system.
 * A more complete solution would use Drizzle ORM, but this simplified version
 * allows us to get the approval system working without additional dependencies.
 */

import pg from 'pg';
const { Pool } = pg;

// Create a PostgreSQL connection pool
let pool: pg.Pool;

/**
 * Initialize the database connection
 */
export function initDb() {
  if (!pool) {
    // If DATABASE_URL is available, use it, otherwise use separate config params
    if (process.env.DATABASE_URL) {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
    } else {
      pool = new Pool({
        host: process.env.PGHOST || 'localhost',
        port: parseInt(process.env.PGPORT || '5432'),
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || '',
        database: process.env.PGDATABASE || 'postgres',
      });
    }

    // Log successful connection or errors
    pool.on('connect', () => {
      console.log('Connected to PostgreSQL database');
    });

    pool.on('error', (err) => {
      console.error('PostgreSQL connection error:', err);
    });
  }

  return pool;
}

/**
 * Get the database connection pool
 */
export function getPool(): pg.Pool {
  if (!pool) {
    initDb();
  }
  return pool;
}

/**
 * Execute a SQL query
 */
export async function query(text: string, params?: any[]) {
  const pool = getPool();
  try {
    return await pool.query(text, params);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Create a database transaction
 */
export async function transaction<T>(callback: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export default {
  query,
  transaction,
  getPool,
  initDb,
};