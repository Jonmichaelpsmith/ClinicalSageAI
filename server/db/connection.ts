/**
 * Database Connection Module
 * 
 * This module sets up and exports a connection to the PostgreSQL database
 * using Drizzle ORM and postgres-js for better transaction support and
 * type safety than raw pg Pool.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get database connection string from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create a postgres client for basic queries
export const pgClient = postgres(connectionString, {
  max: 10, // Maximum number of connections
  idle_timeout: 30 // Idle connection timeout in seconds
});

// Create a Drizzle ORM instance with the postgres client
export const db = drizzle(pgClient);

// Simple health check function to test the database connection
export async function checkDatabaseConnection() {
  try {
    const result = await pgClient`SELECT 1 as connection_test`;
    return result?.[0]?.connection_test === 1;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}