/**
 * Database Index Optimizer
 * 
 * This module creates and manages database indexes to optimize tenant query performance.
 * It ensures that all tenant-specific tables have appropriate indexes for organization_id
 * and other frequently queried columns.
 */
import { sql } from 'drizzle-orm';
import { db } from '../db';
import { createScopedLogger } from '../utils/logger';

const logger = createScopedLogger('index-optimizer');

/**
 * Tables that need organization_id indexes for tenant isolation
 */
const TENANT_TABLES = [
  'organizations',
  'users',
  'organization_users',
  'ctq_factors',
  'quality_management_plans',
  'qmp_section_gating',
  'qmp_traceability',
  'cer_projects',
  'cer_documents',
  'cer_approvals'
];

/**
 * Additional column indexes for frequently queried fields
 */
const COLUMN_INDEXES = [
  { table: 'ctq_factors', column: 'section_code' },
  { table: 'ctq_factors', column: 'risk_level' },
  { table: 'ctq_factors', column: 'category' },
  { table: 'qmp_section_gating', column: 'qmp_id' },
  { table: 'qmp_section_gating', column: 'section_code' },
  { table: 'qmp_traceability', column: 'qmp_id' },
  { table: 'cer_projects', column: 'status' },
  { table: 'cer_documents', column: 'cer_project_id' }
];

/**
 * Composite indexes for frequently joined queries
 */
const COMPOSITE_INDEXES = [
  { table: 'qmp_section_gating', columns: ['organization_id', 'qmp_id', 'section_code'] },
  { table: 'ctq_factors', columns: ['organization_id', 'section_code', 'risk_level'] },
  { table: 'qmp_traceability', columns: ['organization_id', 'qmp_id', 'requirement_code'] }
];

/**
 * Check if an index exists
 */
async function indexExists(tableName: string, indexName: string): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT 1 FROM pg_indexes 
      WHERE tablename = ${tableName} 
      AND indexname = ${indexName}
    `);
    
    return result.rows.length > 0;
  } catch (error) {
    logger.error(`Error checking if index exists: ${indexName}`, error);
    return false;
  }
}

/**
 * Create organization_id indexes for all tenant tables
 */
export async function createTenantIndexes(): Promise<void> {
  logger.info('Creating tenant isolation indexes');
  
  for (const tableName of TENANT_TABLES) {
    const indexName = `idx_${tableName}_org_id`;
    
    try {
      if (!(await indexExists(tableName, indexName))) {
        await db.execute(sql`
          CREATE INDEX IF NOT EXISTS ${sql.raw(indexName)} 
          ON ${sql.raw(tableName)} (organization_id)
        `);
        logger.info(`Created index ${indexName} on ${tableName}`);
      } else {
        logger.info(`Index ${indexName} already exists on ${tableName}`);
      }
    } catch (error) {
      logger.error(`Error creating tenant index on ${tableName}`, error);
    }
  }
}

/**
 * Create column-specific indexes
 */
export async function createColumnIndexes(): Promise<void> {
  logger.info('Creating column-specific indexes');
  
  for (const { table, column } of COLUMN_INDEXES) {
    const indexName = `idx_${table}_${column}`;
    
    try {
      if (!(await indexExists(table, indexName))) {
        await db.execute(sql`
          CREATE INDEX IF NOT EXISTS ${sql.raw(indexName)} 
          ON ${sql.raw(table)} (${sql.raw(column)})
        `);
        logger.info(`Created index ${indexName} on ${table}.${column}`);
      } else {
        logger.info(`Index ${indexName} already exists on ${table}.${column}`);
      }
    } catch (error) {
      logger.error(`Error creating column index on ${table}.${column}`, error);
    }
  }
}

/**
 * Create composite indexes for frequent query patterns
 */
export async function createCompositeIndexes(): Promise<void> {
  logger.info('Creating composite indexes');
  
  for (const { table, columns } of COMPOSITE_INDEXES) {
    const columnStr = columns.join('_');
    const indexName = `idx_${table}_${columnStr}`;
    
    try {
      if (!(await indexExists(table, indexName))) {
        const columnList = columns.join(', ');
        await db.execute(sql`
          CREATE INDEX IF NOT EXISTS ${sql.raw(indexName)} 
          ON ${sql.raw(table)} (${sql.raw(columnList)})
        `);
        logger.info(`Created composite index ${indexName} on ${table}`);
      } else {
        logger.info(`Composite index ${indexName} already exists on ${table}`);
      }
    } catch (error) {
      logger.error(`Error creating composite index on ${table}`, error);
    }
  }
}

/**
 * Initialize all database indexes
 */
export async function initializeIndexes(): Promise<void> {
  try {
    await createTenantIndexes();
    await createColumnIndexes();
    await createCompositeIndexes();
    logger.info('Database indexes initialized successfully');
  } catch (error) {
    logger.error('Error initializing database indexes', error);
  }
}