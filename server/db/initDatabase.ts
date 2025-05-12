/**
 * Database Initialization
 * 
 * This module handles database initialization during server startup.
 * It ensures that all required database tables are properly set up.
 */

import { setupLiteratureTables } from './setupLiterature';

/**
 * Initialize all database tables needed for the application
 */
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('Initializing database...');
    
    // Initialize literature tables for enhanced literature discovery
    await setupLiteratureTables();
    
    console.log('Database initialization completed successfully');
  } catch (err: any) {
    console.error('Error initializing database:', err.message);
    throw err;
  }
}