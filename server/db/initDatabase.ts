/**
 * Database Initialization Module
 * 
 * This module handles database initialization for all features,
 * including the enhanced literature discovery functionality.
 */

import { Pool } from 'pg';
import setupLiterature from './setupLiterature';

// Initialize database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Initialize all database components and tables
 */
export async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Check database connection
    const client = await pool.connect();
    try {
      await client.query('SELECT NOW()');
      console.log('Database connection successful');
    } finally {
      client.release();
    }
    
    // Initialize literature system if enabled
    if (process.env.ENABLE_LITERATURE_FEATURES !== 'false') {
      console.log('Initializing literature discovery system...');
      const literatureStatus = await setupLiteratureSystem();
      
      if (!literatureStatus.tablesSetup) {
        console.warn('Literature tables could not be set up. Literature features may be limited.');
      }
      
      if (!literatureStatus.pgvectorWorking) {
        console.warn('pgvector extension not working. Semantic search features will be disabled.');
      }
    } else {
      console.log('Literature discovery features are disabled');
    }
    
    console.log('Database initialization complete');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

/**
 * Check if database is healthy and connected
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Close all database connections
 */
export async function closeDatabase(): Promise<void> {
  try {
    await pool.end();
    console.log('Database connections closed');
  } catch (error) {
    console.error('Error closing database connections:', error);
  }
}

// Export the pool for reuse in other modules
export { pool };