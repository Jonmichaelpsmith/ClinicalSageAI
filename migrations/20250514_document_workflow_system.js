/**
 * Migration for the Unified Document Workflow System
 * 
 * This migration creates tables for the unified document workflow system:
 * - unified_documents: Central document repository
 * - module_documents: Links to module-specific documents
 * - workflow_templates: Templates for document approval workflows
 * - workflows: Workflow instances
 * - workflow_approvals: Approval steps
 * - workflow_audit_logs: Audit trail
 */

const { sql } = require('drizzle-orm');

module.exports = async function (db) {
  // Create the unified_documents table
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS unified_documents (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      document_type VARCHAR(100) NOT NULL,
      organization_id INTEGER NOT NULL,
      created_by INTEGER NOT NULL,
      vault_folder_id INTEGER,
      metadata JSONB DEFAULT '{}',
      content JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  // Create the module_documents table
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS module_documents (
      id SERIAL PRIMARY KEY,
      document_id INTEGER NOT NULL REFERENCES unified_documents(id),
      module_type VARCHAR(50) NOT NULL,
      original_document_id VARCHAR(255) NOT NULL,
      organization_id INTEGER NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  // Create the workflow_templates table
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS workflow_templates (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      module_type VARCHAR(50) NOT NULL,
      organization_id INTEGER NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      steps JSONB NOT NULL DEFAULT '[]',
      created_by INTEGER NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  // Create the workflows table
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS workflows (
      id SERIAL PRIMARY KEY,
      document_id INTEGER NOT NULL REFERENCES unified_documents(id),
      template_id INTEGER NOT NULL REFERENCES workflow_templates(id),
      status VARCHAR(50) NOT NULL DEFAULT 'in_progress',
      started_at TIMESTAMP NOT NULL,
      started_by INTEGER NOT NULL,
      completed_at TIMESTAMP,
      completed_by INTEGER,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  // Create the workflow_approvals table
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS workflow_approvals (
      id SERIAL PRIMARY KEY,
      workflow_id INTEGER NOT NULL REFERENCES workflows(id),
      step_index INTEGER NOT NULL,
      step_name VARCHAR(255),
      description TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'waiting',
      assigned_to INTEGER,
      approved_by INTEGER,
      approved_at TIMESTAMP,
      comments TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  // Create the workflow_audit_logs table
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS workflow_audit_logs (
      id SERIAL PRIMARY KEY,
      workflow_id INTEGER NOT NULL REFERENCES workflows(id),
      action_type VARCHAR(100) NOT NULL,
      action_by INTEGER NOT NULL,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
      details TEXT
    )
  `);

  // Create indexes for performance
  
  // Index for organization lookup in documents
  await db.run(sql`
    CREATE INDEX IF NOT EXISTS idx_unified_documents_organization 
    ON unified_documents(organization_id)
  `);
  
  // Index for module document lookups
  await db.run(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_module_documents_unique 
    ON module_documents(module_type, original_document_id, organization_id)
  `);
  
  // Index for workflow template lookups
  await db.run(sql`
    CREATE INDEX IF NOT EXISTS idx_workflow_templates_module 
    ON workflow_templates(module_type, organization_id)
  `);
  
  // Index for document workflow lookups
  await db.run(sql`
    CREATE INDEX IF NOT EXISTS idx_workflows_document 
    ON workflows(document_id)
  `);
  
  // Index for workflow approval lookups
  await db.run(sql`
    CREATE INDEX IF NOT EXISTS idx_workflow_approvals_workflow 
    ON workflow_approvals(workflow_id)
  `);
  
  // Index for workflow audit lookups
  await db.run(sql`
    CREATE INDEX IF NOT EXISTS idx_workflow_audit_logs_workflow 
    ON workflow_audit_logs(workflow_id)
  `);
  
  // Create a function to update timestamp automatically
  await db.run(sql`
    CREATE OR REPLACE FUNCTION update_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
       NEW.updated_at = NOW();
       RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);
  
  // Create triggers to auto-update timestamps
  await db.run(sql`
    CREATE TRIGGER update_unified_documents_timestamp
    BEFORE UPDATE ON unified_documents
    FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
  `);
  
  await db.run(sql`
    CREATE TRIGGER update_module_documents_timestamp
    BEFORE UPDATE ON module_documents
    FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
  `);
  
  await db.run(sql`
    CREATE TRIGGER update_workflow_templates_timestamp
    BEFORE UPDATE ON workflow_templates
    FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
  `);
  
  await db.run(sql`
    CREATE TRIGGER update_workflows_timestamp
    BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
  `);
  
  await db.run(sql`
    CREATE TRIGGER update_workflow_approvals_timestamp
    BEFORE UPDATE ON workflow_approvals
    FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
  `);

  console.log('Unified document workflow system migration completed successfully');
};