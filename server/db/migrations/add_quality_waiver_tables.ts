/**
 * Migration to add quality waiver tables to the database
 * 
 * This migration script adds the quality_waivers and quality_waiver_factors tables
 * to enable quality requirement waiver requests and approvals.
 */
import { getDb } from '../tenantDbHelper';
import { sql } from 'drizzle-orm';
import { createScopedLogger } from '../../utils/logger';

const logger = createScopedLogger('migration:quality-waiver-tables');

export async function addQualityWaiverTables() {
  logger.info('Starting migration to add quality waiver tables');
  
  const db = await getDb();
  if (!db) {
    logger.error('Failed to get database connection');
    throw new Error('Failed to get database connection');
  }
  
  try {
    // Check if quality_waivers table already exists
    const checkWaiversTableSql = sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'quality_waivers'
      );
    `;
    
    const waiversTableExists = await db.execute(checkWaiversTableSql);
    
    if (!waiversTableExists.rows[0]?.exists) {
      logger.info('Creating quality_waivers table');
      
      // Create quality_waivers table
      await db.execute(sql`
        CREATE TABLE quality_waivers (
          id SERIAL PRIMARY KEY,
          organization_id INTEGER NOT NULL REFERENCES organizations(id),
          qmp_id INTEGER NOT NULL REFERENCES quality_management_plans(id),
          section_code TEXT NOT NULL,
          justification TEXT NOT NULL,
          risk_assessment TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          requested_by_id INTEGER NOT NULL REFERENCES users(id),
          requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
          approved_by_id INTEGER REFERENCES users(id),
          approved_at TIMESTAMP,
          rejected_by_id INTEGER REFERENCES users(id),
          rejected_at TIMESTAMP,
          rejection_reason TEXT,
          expires_at TIMESTAMP,
          metadata JSONB,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      
      // Add RLS policy for quality_waivers
      await db.execute(sql`
        ALTER TABLE quality_waivers ENABLE ROW LEVEL SECURITY;
      `);
      
      await db.execute(sql`
        CREATE POLICY quality_waivers_tenant_isolation ON quality_waivers
        USING (organization_id = current_setting('app.current_tenant')::INTEGER);
      `);
      
      // Create index for organization_id
      await db.execute(sql`
        CREATE INDEX idx_quality_waivers_organization_id ON quality_waivers(organization_id);
      `);
      
      // Create index for qmp_id
      await db.execute(sql`
        CREATE INDEX idx_quality_waivers_qmp_id ON quality_waivers(qmp_id);
      `);
      
      // Create composite index for efficient status querying
      await db.execute(sql`
        CREATE INDEX idx_quality_waivers_org_status ON quality_waivers(organization_id, status);
      `);
      
      logger.info('Successfully created quality_waivers table');
    } else {
      logger.info('quality_waivers table already exists, skipping creation');
    }
    
    // Check if quality_waiver_factors table already exists
    const checkFactorsTableSql = sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'quality_waiver_factors'
      );
    `;
    
    const factorsTableExists = await db.execute(checkFactorsTableSql);
    
    if (!factorsTableExists.rows[0]?.exists) {
      logger.info('Creating quality_waiver_factors table');
      
      // Create quality_waiver_factors table
      await db.execute(sql`
        CREATE TABLE quality_waiver_factors (
          id SERIAL PRIMARY KEY,
          waiver_id INTEGER NOT NULL REFERENCES quality_waivers(id) ON DELETE CASCADE,
          factor_id INTEGER NOT NULL REFERENCES ctq_factors(id),
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          CONSTRAINT unique_waiver_factor UNIQUE(waiver_id, factor_id)
        );
      `);
      
      // Add RLS policy for quality_waiver_factors
      await db.execute(sql`
        ALTER TABLE quality_waiver_factors ENABLE ROW LEVEL SECURITY;
      `);
      
      await db.execute(sql`
        CREATE POLICY quality_waiver_factors_tenant_isolation ON quality_waiver_factors
        USING (waiver_id IN (SELECT id FROM quality_waivers WHERE organization_id = current_setting('app.current_tenant')::INTEGER));
      `);
      
      // Create indexes for efficient lookups
      await db.execute(sql`
        CREATE INDEX idx_quality_waiver_factors_waiver_id ON quality_waiver_factors(waiver_id);
      `);
      
      await db.execute(sql`
        CREATE INDEX idx_quality_waiver_factors_factor_id ON quality_waiver_factors(factor_id);
      `);
      
      logger.info('Successfully created quality_waiver_factors table');
    } else {
      logger.info('quality_waiver_factors table already exists, skipping creation');
    }
    
    logger.info('Successfully completed migration to add quality waiver tables');
  } catch (error) {
    logger.error('Failed to execute quality waiver tables migration', { error });
    throw error;
  }
}

// Execute the migration if this script is run directly
if (require.main === module) {
  addQualityWaiverTables()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export default addQualityWaiverTables;