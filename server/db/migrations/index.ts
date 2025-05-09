/**
 * Database Migrations Manager
 * 
 * This module provides a centralized way to manage and run all database migrations.
 * New migrations should be imported here and added to the migrations array.
 */
import { createScopedLogger } from '../../utils/logger';
import { getDirectDb } from '../directDb';
import addQualityWaiverTables from './add_quality_waiver_tables';

const logger = createScopedLogger('migrations-manager');

// List of all available migrations in order
const migrations = [
  { name: 'Add Quality Waiver Tables', fn: addQualityWaiverTables },
];

/**
 * Check if database tables exist
 */
async function checkDatabaseExists() {
  try {
    const dbConnection = await getDirectDb();
    if (!dbConnection) {
      logger.error('Failed to get database connection');
      return false;
    }
    
    const { execute, close } = dbConnection;
    
    try {
      // Check if organizations table exists (basic check)
      const query = {
        text: `SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'organizations'
        );`,
        params: []
      };
      const result = await execute(query);
      
      return result?.rows?.[0]?.exists || false;
    } finally {
      await close();
    }
  } catch (error) {
    logger.error('Error checking database existence', { error });
    return false;
  }
}

/**
 * Run all database migrations in order
 */
export async function runAllMigrations() {
  logger.info('Starting database migrations');
  
  // Check if database exists
  const databaseExists = await checkDatabaseExists();
  if (!databaseExists) {
    logger.info('Database tables do not exist yet, skipping migrations');
    return;
  }
  
  for (const migration of migrations) {
    try {
      logger.info(`Running migration: ${migration.name}`);
      await migration.fn();
      logger.info(`Successfully completed migration: ${migration.name}`);
    } catch (error) {
      logger.error(`Failed to run migration: ${migration.name}`, { error });
      throw error;
    }
  }
  
  logger.info('All database migrations completed successfully');
}

// Check if this module is being run directly
if (process.argv[1]?.endsWith('index.ts')) {
  runAllMigrations()
    .then(() => {
      console.log('All migrations completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration process failed:', error);
      process.exit(1);
    });
}

export default runAllMigrations;