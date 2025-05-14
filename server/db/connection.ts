/**
 * Database Connection
 * 
 * This file sets up the connection to the PostgreSQL database
 * and initializes the Drizzle ORM.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as unifiedWorkflowSchema from '../../shared/schema/unified_workflow';

// Use environment variable for database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/trialsage';

// Create a regular client
const client = postgres(connectionString, { max: 10 });

// Create a Drizzle ORM instance
export const db = drizzle(client, {
  schema: {
    ...unifiedWorkflowSchema
  },
  // Setup logger for development
  logger: process.env.NODE_ENV === 'development'
});

// Export schema
export { unifiedWorkflowSchema };