/**
 * Database Migration for Document Workflow System
 * 
 * This migration creates all database tables for the unified document workflow system,
 * enabling cross-module document management and approval workflows.
 */

const { sql } = require('drizzle-orm');

// Export the up and down functions for migration
exports.up = async (db) => {
  console.log('Starting document workflow system migration...');
  
  try {
    // Create unified_documents table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS unified_documents (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        document_type VARCHAR(100) NOT NULL,
        organization_id INTEGER NOT NULL,
        created_by INTEGER NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'draft',
        latest_version INTEGER DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Create document_versions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS document_versions (
        id SERIAL PRIMARY KEY,
        document_id INTEGER NOT NULL REFERENCES unified_documents(id) ON DELETE CASCADE,
        version_number INTEGER NOT NULL,
        created_by INTEGER NOT NULL,
        content JSONB,
        change_description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(document_id, version_number)
      )
    `);
    
    // Create module_documents table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS module_documents (
        id SERIAL PRIMARY KEY,
        document_id INTEGER NOT NULL REFERENCES unified_documents(id) ON DELETE CASCADE,
        module_type VARCHAR(50) NOT NULL,
        original_id VARCHAR(255) NOT NULL,
        organization_id INTEGER NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(module_type, original_id, organization_id)
      )
    `);
    
    // Create workflow_templates table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS workflow_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        module_type VARCHAR(50) NOT NULL,
        organization_id INTEGER NOT NULL,
        created_by INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Create workflow_template_steps table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS workflow_template_steps (
        id SERIAL PRIMARY KEY,
        template_id INTEGER NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
        step_name VARCHAR(255) NOT NULL,
        step_description TEXT,
        step_order INTEGER NOT NULL,
        approval_role VARCHAR(100) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Create document_workflows table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS document_workflows (
        id SERIAL PRIMARY KEY,
        document_id INTEGER NOT NULL REFERENCES unified_documents(id) ON DELETE CASCADE,
        template_id INTEGER NOT NULL REFERENCES workflow_templates(id),
        started_by INTEGER NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        metadata JSONB,
        completed_at TIMESTAMP,
        rejected_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Create workflow_approvals table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS workflow_approvals (
        id SERIAL PRIMARY KEY,
        workflow_id INTEGER NOT NULL REFERENCES document_workflows(id) ON DELETE CASCADE,
        step_id INTEGER NOT NULL REFERENCES workflow_template_steps(id),
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        approved_by INTEGER,
        approved_at TIMESTAMP,
        rejected_by INTEGER,
        rejected_at TIMESTAMP,
        comments TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Create document_audit_logs table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS document_audit_logs (
        id SERIAL PRIMARY KEY,
        document_id INTEGER NOT NULL REFERENCES unified_documents(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL,
        action VARCHAR(100) NOT NULL,
        details JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Create document_attachments table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS document_attachments (
        id SERIAL PRIMARY KEY,
        document_id INTEGER NOT NULL REFERENCES unified_documents(id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(100) NOT NULL,
        file_path VARCHAR(1000) NOT NULL,
        file_size INTEGER NOT NULL,
        uploaded_by INTEGER NOT NULL,
        is_public BOOLEAN DEFAULT FALSE,
        metadata JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Create document_comments table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS document_comments (
        id SERIAL PRIMARY KEY,
        document_id INTEGER NOT NULL REFERENCES unified_documents(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL,
        comment TEXT NOT NULL,
        is_resolved BOOLEAN DEFAULT FALSE,
        parent_id INTEGER REFERENCES document_comments(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Create document_relationships table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS document_relationships (
        id SERIAL PRIMARY KEY,
        source_document_id INTEGER NOT NULL REFERENCES unified_documents(id) ON DELETE CASCADE,
        target_document_id INTEGER NOT NULL REFERENCES unified_documents(id) ON DELETE CASCADE,
        relationship_type VARCHAR(100) NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Create indexes for performance
    // Index for looking up module documents
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_module_documents_module_type_org
      ON module_documents(module_type, organization_id)
    `);
    
    // Index for workflow templates by module and organization
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_workflow_templates_module_org
      ON workflow_templates(module_type, organization_id)
    `);
    
    // Index for active workflows
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_document_workflows_status
      ON document_workflows(status)
    `);
    
    // Index for document status
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_unified_documents_status_org
      ON unified_documents(status, organization_id)
    `);
    
    // Index for workflow approvals by status
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_workflow_approvals_status
      ON workflow_approvals(status)
    `);
    
    console.log('Document workflow system migration completed successfully.');
  } catch (error) {
    console.error('Error executing document workflow system migration:', error);
    throw error;
  }
};

// Down migration to roll back changes
exports.down = async (db) => {
  console.log('Rolling back document workflow system migration...');
  
  try {
    // Drop tables in reverse order to respect foreign key constraints
    await db.execute(sql`DROP TABLE IF EXISTS document_relationships`);
    await db.execute(sql`DROP TABLE IF EXISTS document_comments`);
    await db.execute(sql`DROP TABLE IF EXISTS document_attachments`);
    await db.execute(sql`DROP TABLE IF EXISTS document_audit_logs`);
    await db.execute(sql`DROP TABLE IF EXISTS workflow_approvals`);
    await db.execute(sql`DROP TABLE IF EXISTS document_workflows`);
    await db.execute(sql`DROP TABLE IF EXISTS workflow_template_steps`);
    await db.execute(sql`DROP TABLE IF EXISTS workflow_templates`);
    await db.execute(sql`DROP TABLE IF EXISTS module_documents`);
    await db.execute(sql`DROP TABLE IF EXISTS document_versions`);
    await db.execute(sql`DROP TABLE IF EXISTS unified_documents`);
    
    console.log('Document workflow system migration rolled back successfully.');
  } catch (error) {
    console.error('Error rolling back document workflow system migration:', error);
    throw error;
  }
};