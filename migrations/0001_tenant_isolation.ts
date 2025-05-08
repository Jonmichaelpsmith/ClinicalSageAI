/**
 * Migration: Setup Multi-Tenant Data Isolation
 * 
 * This migration sets up PostgreSQL Row-Level Security (RLS) policies
 * to enforce tenant isolation at the database level.
 */
import { TenantDb, setupRlsForAllTables, createTenantTriggerFunction } from '../server/db';

// Tables that need tenant isolation
const TENANT_TABLES = [
  'quality_management_plans',
  'ctq_factors',
  'qmp_audit_trail',
  'qmp_section_gating',
  'qmp_traceability_matrix',
  'cer_projects',
  'cer_project_documents',
  'project_activities',
  'project_milestones',
  'client_user_permissions',
  'cer_reports',
  'cer_sections',
  'cer_faers_data',
  'cer_literature',
  'cer_compliance_checks',
  'cer_workflows',
  'cer_exports',
  'vault_documents_v2',
  'vault_document_folders',
  'vault_document_shares',
  'vault_document_audit_logs'
];

/**
 * Setup function that will be called when this migration is applied
 */
export async function up() {
  try {
    console.log('Starting tenant isolation migration...');
    
    // Create a function that automatically sets tenant_id
    await createTenantTriggerFunction();
    console.log('Created tenant trigger function');
    
    // Apply RLS policies to all tenant tables
    await setupRlsForAllTables();
    console.log('Applied Row-Level Security policies to all tenant tables');
    
    console.log('Tenant isolation migration completed successfully');
  } catch (error) {
    console.error('Error in tenant isolation migration:', error);
    throw error;
  }
}

/**
 * Teardown function that will be called when this migration is reverted
 */
export async function down() {
  try {
    console.log('Reverting tenant isolation migration...');
    
    // Disable RLS on all tenant tables
    for (const table of TENANT_TABLES) {
      await executeRawQuery(`ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`);
      console.log(`Disabled RLS on ${table}`);
      
      // Drop all policies
      await executeRawQuery(`
        DO $$ 
        DECLARE
          policy_name text;
        BEGIN
          FOR policy_name IN 
            SELECT policyname FROM pg_policies WHERE tablename = '${table}'
          LOOP
            EXECUTE 'DROP POLICY IF EXISTS ' || policy_name || ' ON ${table}';
          END LOOP;
        END $$;
      `);
      console.log(`Dropped all policies on ${table}`);
      
      // Drop tenant trigger if it exists
      await executeRawQuery(`
        DROP TRIGGER IF EXISTS set_tenant_id_before_insert ON ${table};
      `);
      console.log(`Dropped tenant trigger on ${table}`);
    }
    
    // Drop the tenant trigger function
    await executeRawQuery(`
      DROP FUNCTION IF EXISTS set_tenant_id_on_insert();
    `);
    console.log('Dropped tenant trigger function');
    
    console.log('Tenant isolation migration reverted successfully');
  } catch (error) {
    console.error('Error reverting tenant isolation migration:', error);
    throw error;
  }
}

/**
 * Helper function to execute raw SQL
 */
async function executeRawQuery(sql: string) {
  const { query } = await import('../server/db');
  return query(sql);
}