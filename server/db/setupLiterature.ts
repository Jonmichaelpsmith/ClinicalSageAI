/**
 * Literature Entries Database Setup
 * 
 * This script specifically runs the migration to set up the tables needed
 * for the enhanced literature discovery feature.
 */

import path from 'path';
import fs from 'fs';
import { Pool } from 'pg';

// Connection to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Run a migration SQL file
 * 
 * @param {string} filePath - Path to the SQL migration file
 */
async function runMigration(filePath: string): Promise<void> {
  try {
    console.log(`Running migration: ${filePath}`);
    
    // Read the SQL file
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Execute the SQL
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Split the SQL file by semicolons to execute each statement separately
      const statements = sql.split(';').filter(stmt => stmt.trim() !== '');
      
      for (const statement of statements) {
        try {
          await client.query(statement);
          console.log('Statement executed successfully');
        } catch (err: any) {
          console.error('Error executing statement:', err.message);
          console.log('Statement:', statement);
          throw err;
        }
      }
      
      await client.query('COMMIT');
      console.log('Migration completed successfully');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Migration failed, rolled back changes:', err);
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error running migration:', err);
    throw err;
  }
}

export async function setupLiteratureTables(): Promise<void> {
  try {
    console.log('Setting up literature database tables...');
    
    // Path to the literature migration file
    const migrationFile = '20250512_literature_entries.sql';
    const migrationPath = path.join(__dirname, '../../migrations', migrationFile);
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`Migration file does not exist: ${migrationPath}`);
      throw new Error(`Migration file not found: ${migrationFile}`);
    }
    
    await runMigration(migrationPath);
    
    console.log('Literature database tables setup completed');
  } catch (err) {
    console.error('Error setting up literature database tables:', err);
    throw err;
  }
}