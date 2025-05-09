/**
 * Database Setup Script
 * 
 * This script creates the necessary database tables and indexes for the application.
 * It uses the schema defined in shared/schema.ts to create the tables.
 */
import { createScopedLogger } from '../utils/logger';
import { getDirectDb } from './directDb';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { runAllMigrations } from './migrations';
import * as schema from '../../shared/schema';

const logger = createScopedLogger('database-setup');

/**
 * Create database tables from schema
 */
export async function setupDatabase() {
  try {
    logger.info('Starting database setup');
    
    // Get direct connection to database (no tenant context)
    const dbConnection = await getDirectDb();
    if (!dbConnection) {
      logger.error('Failed to get database connection');
      throw new Error('Failed to get database connection');
    }
    
    const { db, execute, close } = dbConnection;
    
    try {
      // Check if database is empty (organizations table doesn't exist)
      const checkTableSql = {
        text: `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'organizations'
        );`,
        params: []
      };
      
      const tableExists = await execute(checkTableSql);
      
      // Check if the result has rows and whether the first row has a property 'exists'
      // If none of these are available, assume tables don't exist to be safe
      const tablesExist = tableExists && tableExists.rows && 
                         tableExists.rows.length > 0 && 
                         tableExists.rows[0].exists === true;
                         
      if (!tablesExist) {
        logger.info('Database tables do not exist, creating schema');
        
        try {
          // Push the schema to the database
          logger.info('Pushing schema to database');
          await pushSchema(db, execute);
          
          logger.info('Database schema created successfully');
        } catch (error) {
          logger.error('Failed to create database schema', { error });
          throw error;
        }
      } else {
        logger.info('Database tables already exist, skipping schema creation');
      }
      
      // Run custom migrations
      logger.info('Running migrations');
      await runAllMigrations();
      
      logger.info('Database setup completed successfully');
      return true;
    } finally {
      // Always close the database connection
      await close();
    }
  } catch (error) {
    logger.error('Database setup failed', { error });
    throw error;
  }
}

/**
 * Push the schema to the database
 */
async function pushSchema(db: PostgresJsDatabase<any>, execute: (query: any) => Promise<any>) {
  // Drop tables in reverse to handle foreign key constraints
  await execute({
    text: `DO $$ 
    DECLARE
      tablenames text[];
      tname text;
    BEGIN
      tablenames := ARRAY[
        'quality_waiver_factors',
        'quality_waivers',
        'qmp_traceability_matrix',
        'qmp_section_gating',
        'ctq_factors',
        'qmp_audit_trail',
        'quality_management_plans',
        'client_user_permissions',
        'project_milestones',
        'project_activities',
        'project_documents',
        'cer_projects',
        'organization_users',
        'users',
        'organizations'
      ];
      
      FOR tname IN SELECT unnest(tablenames) LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || tname || ' CASCADE';
      END LOOP;
    END $$;`,
    params: []
  });
  
  // Create organizations table
  await execute({
    text: `CREATE TABLE organizations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      domain TEXT,
      logo TEXT,
      settings JSONB,
      api_key TEXT UNIQUE,
      tier TEXT NOT NULL DEFAULT 'standard',
      status TEXT NOT NULL DEFAULT 'active',
      max_users INTEGER DEFAULT 5,
      max_projects INTEGER DEFAULT 10,
      max_storage INTEGER DEFAULT 5,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
    params: []
  });
  
  // Create users table
  await execute({
    text: `CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      title TEXT,
      department TEXT,
      avatar TEXT,
      bio TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      last_login TIMESTAMP,
      default_organization_id INTEGER REFERENCES organizations(id),
      preferences JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
    params: []
  });
  
  // Create organization_users table
  await execute({
    text: `CREATE TABLE organization_users (
      id SERIAL PRIMARY KEY,
      organization_id INTEGER NOT NULL REFERENCES organizations(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      role TEXT NOT NULL DEFAULT 'member',
      permissions JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT unique_user_org UNIQUE(user_id, organization_id)
    );`,
    params: []
  });
  
  // Create quality_management_plans table
  await execute({
    text: `CREATE TABLE quality_management_plans (
      id SERIAL PRIMARY KEY,
      organization_id INTEGER NOT NULL REFERENCES organizations(id),
      name TEXT NOT NULL,
      description TEXT,
      version TEXT NOT NULL DEFAULT '1.0.0',
      status TEXT NOT NULL DEFAULT 'draft',
      approved_by_id INTEGER REFERENCES users(id),
      approved_at TIMESTAMP,
      effective_date TIMESTAMP,
      expiry_date TIMESTAMP,
      review_frequency_days INTEGER DEFAULT 365,
      last_review_date TIMESTAMP,
      next_review_date TIMESTAMP,
      review_reminder_days INTEGER DEFAULT 30,
      created_by_id INTEGER REFERENCES users(id),
      settings JSONB,
      metadata JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
    params: []
  });
  
  // Create cer_projects table
  await execute({
    text: `CREATE TABLE cer_projects (
      id SERIAL PRIMARY KEY,
      organization_id INTEGER NOT NULL REFERENCES organizations(id),
      name TEXT NOT NULL,
      device_name TEXT NOT NULL,
      device_manufacturer TEXT NOT NULL,
      device_type TEXT,
      device_class TEXT,
      regulatory_context TEXT,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      version TEXT DEFAULT '1.0.0',
      created_by_id INTEGER REFERENCES users(id),
      assigned_to_id INTEGER REFERENCES users(id),
      due_date TIMESTAMP,
      start_date TIMESTAMP,
      completion_date TIMESTAMP,
      review_date TIMESTAMP,
      qmp_id INTEGER,
      settings JSONB,
      metadata JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
    params: []
  });
  
  // Create CTQ Factors table
  await execute({
    text: `CREATE TABLE ctq_factors (
      id SERIAL PRIMARY KEY,
      organization_id INTEGER NOT NULL REFERENCES organizations(id),
      qmp_id INTEGER NOT NULL REFERENCES quality_management_plans(id),
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      risk_level TEXT NOT NULL,
      applicable_section TEXT,
      validation_criteria TEXT,
      validation_method TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      requires_evidence_type TEXT,
      requirement_type TEXT NOT NULL DEFAULT 'mandatory',
      failure_action TEXT NOT NULL DEFAULT 'block',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
    params: []
  });
  
  // Create QMP Section Gating table
  await execute({
    text: `CREATE TABLE qmp_section_gating (
      id SERIAL PRIMARY KEY,
      organization_id INTEGER NOT NULL REFERENCES organizations(id),
      qmp_id INTEGER NOT NULL REFERENCES quality_management_plans(id),
      section_key TEXT NOT NULL,
      section_name TEXT NOT NULL,
      required_ctq_factor_ids JSONB NOT NULL,
      minimum_mandatory_completion INTEGER DEFAULT 100,
      minimum_recommended_completion INTEGER DEFAULT 80,
      allow_override BOOLEAN DEFAULT FALSE,
      override_requires_approval BOOLEAN DEFAULT TRUE,
      override_requires_reason BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
    params: []
  });
  
  // Create QMP Audit Trail table
  await execute({
    text: `CREATE TABLE qmp_audit_trail (
      id SERIAL PRIMARY KEY,
      organization_id INTEGER NOT NULL REFERENCES organizations(id),
      qmp_id INTEGER NOT NULL REFERENCES quality_management_plans(id),
      user_id INTEGER REFERENCES users(id),
      action_type TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      description TEXT NOT NULL,
      previous_state JSONB,
      new_state JSONB,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
    params: []
  });
  
  // Create QMP Traceability Matrix table
  await execute({
    text: `CREATE TABLE qmp_traceability_matrix (
      id SERIAL PRIMARY KEY,
      organization_id INTEGER NOT NULL REFERENCES organizations(id),
      qmp_id INTEGER NOT NULL REFERENCES quality_management_plans(id),
      ctq_factor_id INTEGER REFERENCES ctq_factors(id),
      requirement_id TEXT NOT NULL,
      requirement_text TEXT NOT NULL,
      requirement_source TEXT,
      verification_method TEXT,
      implementation_evidence JSONB,
      verification_status TEXT NOT NULL DEFAULT 'pending',
      verified_by_id INTEGER REFERENCES users(id),
      verified_at TIMESTAMP,
      notes TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
    params: []
  });
  
  // Create Project Documents table
  await execute({
    text: `CREATE TABLE project_documents (
      id SERIAL PRIMARY KEY,
      organization_id INTEGER NOT NULL REFERENCES organizations(id),
      project_id INTEGER NOT NULL REFERENCES cer_projects(id),
      vault_document_id UUID,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      category TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      version TEXT DEFAULT '1.0.0',
      file_path TEXT,
      file_size INTEGER,
      mime_type TEXT,
      checksum TEXT,
      uploaded_by_id INTEGER REFERENCES users(id),
      meta_data JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
    params: []
  });
  
  // Create Project Activities table
  await execute({
    text: `CREATE TABLE project_activities (
      id SERIAL PRIMARY KEY,
      organization_id INTEGER NOT NULL REFERENCES organizations(id),
      project_id INTEGER NOT NULL REFERENCES cer_projects(id),
      user_id INTEGER REFERENCES users(id),
      activity_type TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      description TEXT NOT NULL,
      details JSONB,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
    params: []
  });
  
  // Create Project Milestones table
  await execute({
    text: `CREATE TABLE project_milestones (
      id SERIAL PRIMARY KEY,
      organization_id INTEGER NOT NULL REFERENCES organizations(id),
      project_id INTEGER NOT NULL REFERENCES cer_projects(id),
      name TEXT NOT NULL,
      description TEXT,
      due_date TIMESTAMP NOT NULL,
      completed_at TIMESTAMP,
      completed_by_id INTEGER REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'pending',
      priority TEXT NOT NULL DEFAULT 'medium',
      notify_days INTEGER DEFAULT 7,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
    params: []
  });
  
  // Create Client User Permissions table
  await execute({
    text: `CREATE TABLE client_user_permissions (
      id SERIAL PRIMARY KEY,
      organization_id INTEGER NOT NULL REFERENCES organizations(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      project_id INTEGER REFERENCES cer_projects(id),
      permissions JSONB NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT unique_user_project UNIQUE(user_id, project_id)
    );`,
    params: []
  });
  
  // Setup Row Level Security for multi-tenant tables
  
  // Organizations
  await execute({
    text: `ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;`,
    params: []
  });
  
  await execute({
    text: `CREATE POLICY organizations_tenant_isolation ON organizations
    USING (id = current_setting('app.current_tenant', true)::INTEGER);`,
    params: []
  });
  
  // Users (special case - users can be members of multiple organizations)
  await execute({
    text: `ALTER TABLE users ENABLE ROW LEVEL SECURITY;`,
    params: []
  });
  
  await execute({
    text: `CREATE POLICY users_tenant_isolation ON users
    USING (id IN (
      SELECT user_id FROM organization_users
      WHERE organization_id = current_setting('app.current_tenant', true)::INTEGER
    ));`,
    params: []
  });
  
  // Organization Users
  await execute({
    text: `ALTER TABLE organization_users ENABLE ROW LEVEL SECURITY;`,
    params: []
  });
  
  await execute({
    text: `CREATE POLICY organization_users_tenant_isolation ON organization_users
    USING (organization_id = current_setting('app.current_tenant', true)::INTEGER);`,
    params: []
  });
  
  // Create indexes for common query patterns
  await execute({
    text: `CREATE INDEX idx_org_users_org_id ON organization_users(organization_id);`,
    params: []
  });
  
  await execute({
    text: `CREATE INDEX idx_cer_projects_org_id ON cer_projects(organization_id);`,
    params: []
  });
  
  await execute({
    text: `CREATE INDEX idx_qmp_org_id ON quality_management_plans(organization_id);`,
    params: []
  });
  
  await execute({
    text: `CREATE INDEX idx_ctq_factors_org_id ON ctq_factors(organization_id);`,
    params: []
  });
  
  await execute({
    text: `CREATE INDEX idx_ctq_factors_qmp_id ON ctq_factors(qmp_id);`,
    params: []
  });
  
  await execute({
    text: `CREATE INDEX idx_qmp_section_gating_org_id ON qmp_section_gating(organization_id);`,
    params: []
  });
  
  await execute({
    text: `CREATE INDEX idx_qmp_section_gating_qmp_id ON qmp_section_gating(qmp_id);`,
    params: []
  });
  
  logger.info('Basic schema pushed to database successfully');
}

// Run the setup if this script is called directly
if (process.argv[1]?.endsWith('setup.ts')) {
  setupDatabase()
    .then(() => {
      logger.info('Database setup completed');
      process.exit(0);
    })
    .catch(error => {
      logger.error('Database setup failed', { error });
      process.exit(1);
    });
}

export default setupDatabase;