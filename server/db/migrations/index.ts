/**
 * Database Migrations Manager
 * 
 * This module provides a centralized way to manage and run all database migrations.
 * New migrations should be imported here and added to the migrations array.
 */
import { createScopedLogger } from '../../utils/logger';
import addQualityWaiverTables from './add_quality_waiver_tables';

const logger = createScopedLogger('migrations-manager');

// List of all available migrations in order
const migrations = [
  { name: 'Add Quality Waiver Tables', fn: addQualityWaiverTables },
];

/**
 * Run all database migrations in order
 */
export async function runAllMigrations() {
  logger.info('Starting database migrations');
  
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

export default runAllMigrations;