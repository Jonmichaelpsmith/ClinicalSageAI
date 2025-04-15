/**
 * CSR Semantic Model Migration Script
 * 
 * This script executes the migration of existing CSR data to the new semantic model.
 * 1. It runs the SQL migration to create the tables
 * 2. It migrates data from existing sources to the new schema
 * 
 * Usage:
 *   npm run tsx scripts/run-csr-migration.ts
 */

import { promises as fs } from 'fs';
import path from 'path';
import { migrateToSemanticModel } from '../server/csr-schema-migrator';
import { pool, db } from '../server/db';

const MIGRATION_FILE_PATH = path.join(__dirname, '../migrations/0002_csr_semantic_model.sql');

async function main() {
  console.log('====================================================================');
  console.log(' CSR Semantic Data Model Migration');
  console.log('====================================================================');
  console.log('\nThis script will migrate your CSR data to the new semantic model.\n');
  
  try {
    // 1. Run the SQL migration
    console.log('STEP 1: Creating database schema...');
    const migrationSql = await fs.readFile(MIGRATION_FILE_PATH, 'utf-8');
    await pool.query(migrationSql);
    console.log('✅ Database schema created successfully');
    
    // 2. Migrate data
    console.log('\nSTEP 2: Migrating data to new schema...');
    const result = await migrateToSemanticModel();
    if (result) {
      console.log('✅ Data migration completed successfully');
    } else {
      console.log('⚠️ Data migration completed with warnings');
    }
    
    console.log('\n====================================================================');
    console.log(' Migration Complete');
    console.log('====================================================================');
    console.log('\nYour CSR data has been migrated to the new semantic model.\n');
    console.log('To use the new schema in your code, import from shared/csr-schema.ts instead of shared/schema.ts');
    
  } catch (error) {
    console.error('Error during migration:', error);
    console.log('\n❌ Migration failed. Please check the logs for details.');
  } finally {
    // Close database connections
    await pool.end();
    process.exit(0);
  }
}

// Run the script
main().catch(console.error);