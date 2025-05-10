import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "./schema";

// Export a reusable function to connect to the DB from any part of the application
export const connect = () => {
  // Configure WebSocket constructor for Neon serverless
  neonConfig.webSocketConstructor = ws;
  
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  
  // Create pool and Drizzle client
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  
  return { pool, db };
};

// Export a pre-connected DB instance for direct imports
export const { pool, db } = connect();
