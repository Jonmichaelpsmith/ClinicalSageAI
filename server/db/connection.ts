/**
 * Database Connection Module
 * 
 * This module provides a centralized connection to the PostgreSQL database
 * using Drizzle ORM. It initializes the connection pool and prepares query
 * builders for all database tables.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as unifiedWorkflowSchema from '../../shared/schema/unified_workflow';

// Initialize connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Adjust pool settings for optimal performance
  max: 10,
  idleTimeoutMillis: 30000
});

// Initialize Drizzle with the connection pool
export const db = drizzle(pool, {
  schema: {
    ...unifiedWorkflowSchema
  }
});

// Export the raw pool for direct access when needed
export const rawPool = pool;

// Register shutdown handlers
process.on('exit', () => {
  console.log('Closing database connection pool');
  pool.end();
});

// Handle unexpected errors to prevent application crashes
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

console.log('Database connection initialized');