/**
 * This module contains functions to manage PostgreSQL Row-Level Security
 * policies for multi-tenant data isolation.
 * 
 * RLS policies are a powerful PostgreSQL feature that enforces access control
 * rules at the database level, ensuring that tenants can only access their own data
 * even if application-level security is bypassed.
 */

import { execute } from './execute';

/**
 * Enable row-level security on a table
 */
export async function enableRls(tableName: string): Promise<void> {
  await execute(`
    ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;
  `);
}

/**
 * Create a tenant isolation policy on a table.
 * This enforces that rows can only be accessed if they belong to the tenant's organization.
 */
export async function createTenantIsolationPolicy(
  tableName: string,
  policyName: string = 'tenant_isolation'
): Promise<void> {
  await execute(`
    CREATE POLICY ${policyName} ON ${tableName}
    USING (organization_id = current_setting('app.current_tenant_id')::integer);
  `);
}

/**
 * Create RLS policies for all common operations (select, insert, update, delete)
 */
export async function createTenantPolicies(tableName: string): Promise<void> {
  // Enable RLS on the table
  await enableRls(tableName);
  
  // Policy for SELECT operations
  await execute(`
    CREATE POLICY tenant_isolation_select ON ${tableName}
    FOR SELECT
    USING (organization_id = current_setting('app.current_tenant_id')::integer);
  `);
  
  // Policy for INSERT operations
  await execute(`
    CREATE POLICY tenant_isolation_insert ON ${tableName}
    FOR INSERT
    WITH CHECK (organization_id = current_setting('app.current_tenant_id')::integer);
  `);
  
  // Policy for UPDATE operations
  await execute(`
    CREATE POLICY tenant_isolation_update ON ${tableName}
    FOR UPDATE
    USING (organization_id = current_setting('app.current_tenant_id')::integer)
    WITH CHECK (organization_id = current_setting('app.current_tenant_id')::integer);
  `);
  
  // Policy for DELETE operations
  await execute(`
    CREATE POLICY tenant_isolation_delete ON ${tableName}
    FOR DELETE
    USING (organization_id = current_setting('app.current_tenant_id')::integer);
  `);
}

/**
 * Set the current tenant ID in the PostgreSQL session.
 * This will be used by RLS policies to filter rows.
 */
export async function setTenantId(tenantId: number): Promise<void> {
  await execute(`
    SET LOCAL app.current_tenant_id = '${tenantId}';
  `);
}

/**
 * Create a database role for a specific tenant
 * This can be used for more sophisticated isolation scenarios
 */
export async function createTenantRole(tenantId: number): Promise<void> {
  const roleName = `tenant_${tenantId}`;
  
  // Check if role already exists
  const roleExists = await checkRoleExists(roleName);
  if (roleExists) {
    return;
  }
  
  await execute(`
    CREATE ROLE ${roleName};
    GRANT USAGE ON SCHEMA public TO ${roleName};
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${roleName};
    ALTER ROLE ${roleName} SET app.current_tenant_id = '${tenantId}';
  `);
}

/**
 * Check if a database role exists
 */
async function checkRoleExists(roleName: string): Promise<boolean> {
  const result = await execute(`
    SELECT 1 FROM pg_roles WHERE rolname = '${roleName}';
  `);
  
  return result.rowCount > 0;
}

/**
 * Create a migration that sets up RLS for all tenant-isolated tables
 */
export async function setupRlsForAllTables(): Promise<void> {
  // List of tables that should have tenant isolation
  const tenantTables = [
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
  
  for (const table of tenantTables) {
    await createTenantPolicies(table);
  }
}

/**
 * Create a function that automatically sets the organization_id
 * field when inserting new rows.
 */
export async function createTenantTriggerFunction(): Promise<void> {
  await execute(`
    CREATE OR REPLACE FUNCTION set_tenant_id_on_insert()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.organization_id = current_setting('app.current_tenant_id')::integer;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
}

/**
 * Add a trigger to a table that automatically sets the organization_id
 * field when inserting new rows.
 */
export async function addTenantTrigger(tableName: string): Promise<void> {
  await execute(`
    CREATE TRIGGER set_tenant_id_before_insert
    BEFORE INSERT ON ${tableName}
    FOR EACH ROW
    EXECUTE FUNCTION set_tenant_id_on_insert();
  `);
}