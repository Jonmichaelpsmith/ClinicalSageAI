/**
 * Direct Database Connection Helper
 * 
 * This module provides a direct connection to the database without tenant context.
 * It should only be used during initial setup and migrations.
 */
import { createScopedLogger } from '../utils/logger';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

const logger = createScopedLogger('direct-db-helper');

/**
 * Get a direct connection to the database without tenant context
 */
export async function getDirectDb() {
  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    // Create a PostgreSQL client
    const client = postgres(connectionString, { 
      max: 10,
      prepare: false,
    });
    
    // Create a Drizzle database instance
    const db = drizzle(client);
    
    return {
      db,
      client,
      execute: async (query: { text: string, params: any[] }) => {
        try {
          const result = await client.unsafe(query.text, query.params);
          // Convert postgres.js result to a format consistent with node-postgres
          // so that existing code expecting rows property works correctly
          return {
            rows: Array.isArray(result) ? result : [],
            rowCount: Array.isArray(result) ? result.length : 0,
            command: '',
            fields: []
          };
        } catch (error) {
          logger.error('Error executing query', { error });
          throw error;
        }
      },
      close: async () => {
        try {
          await client.end();
        } catch (error) {
          logger.error('Error closing database connection', { error });
        }
      }
    };
  } catch (error) {
    logger.error('Error getting direct database connection', { error });
    throw error;
  }
}

export default getDirectDb;