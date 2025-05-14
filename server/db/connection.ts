/**
 * Database Connection
 * 
 * This file establishes the database connection for the application
 * and exports the client for use in services.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../shared/schema/unified_workflow';

// Create the postgres connection
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/trialsage';
const client = postgres(connectionString);

// Create the drizzle client with the unified workflow schema
export const db = drizzle(client, { schema });

// Export the raw client for transactions
export const pgClient = client;