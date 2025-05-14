/**
 * Database Connection
 * 
 * This file establishes the database connection for the application
 * and exports the client for use in services.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../shared/schema/unified_workflow';

// Connection string is from the DATABASE_URL environment variable
const connectionString = process.env.DATABASE_URL || '';

// Create the Postgres client
export const pgClient = postgres(connectionString, {
  max: 10, // Maximum number of connections
  idle_timeout: 30, // Idle connection timeout in seconds
  prepare: false, // Disable prepared statements for wider compatibility
});

// Create the Drizzle ORM client
export const db = drizzle(pgClient, { schema });