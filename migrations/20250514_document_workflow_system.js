import { sql } from 'drizzle-orm';

/**
 * Unified Document Workflow System Migration
 * 
 * This migration adds the necessary tables to support a unified document workflow
 * system that integrates across different modules.
 */
export async function up(db) {
  // Create module_documents table
  await db.exec(sql`
    CREATE TABLE module_documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      module_type VARCHAR(50) NOT NULL,
      module_document_id VARCHAR(100) NOT NULL,
      metadata JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE (module_type, module_document_id)
    )
  `);

  // Create workflow_templates table
  await db.exec(sql`
    CREATE TABLE workflow_templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      description TEXT,
      module_type VARCHAR(50) NOT NULL,
      steps JSONB NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

  // Create document_workflows table
  await db.exec(sql`
    CREATE TABLE document_workflows (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      workflow_template_id UUID REFERENCES workflow_templates(id),
      status VARCHAR(50) NOT NULL DEFAULT 'draft',
      current_step INTEGER DEFAULT 0,
      started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      completed_at TIMESTAMP WITH TIME ZONE,
      initiated_by INTEGER REFERENCES users(id),
      data JSONB
    )
  `);

  // Create workflow_approvals table
  await db.exec(sql`
    CREATE TABLE workflow_approvals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      workflow_id UUID NOT NULL REFERENCES document_workflows(id) ON DELETE CASCADE,
      step_index INTEGER NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      assigned_role VARCHAR(50) NOT NULL,
      assigned_to INTEGER REFERENCES users(id),
      completed_by INTEGER REFERENCES users(id),
      completed_at TIMESTAMP WITH TIME ZONE,
      comments TEXT,
      signature_data TEXT
    )
  `);

  // Create document_relationships table
  await db.exec(sql`
    CREATE TABLE document_relationships (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      source_document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      target_document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      relationship_type VARCHAR(50) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      data JSONB
    )
  `);

  // Create indexes for better performance
  await db.exec(sql`CREATE INDEX idx_module_documents_document_id ON module_documents(document_id)`);
  await db.exec(sql`CREATE INDEX idx_module_documents_module ON module_documents(module_type, module_document_id)`);
  await db.exec(sql`CREATE INDEX idx_document_workflows_document_id ON document_workflows(document_id)`);
  await db.exec(sql`CREATE INDEX idx_workflow_approvals_workflow_id ON workflow_approvals(workflow_id)`);
  await db.exec(sql`CREATE INDEX idx_workflow_approvals_status ON workflow_approvals(status)`);
  await db.exec(sql`CREATE INDEX idx_document_relationships_source ON document_relationships(source_document_id)`);
  await db.exec(sql`CREATE INDEX idx_document_relationships_target ON document_relationships(target_document_id)`);
}

export async function down(db) {
  // Drop tables in reverse order to respect foreign key constraints
  await db.exec(sql`DROP TABLE IF EXISTS document_relationships`);
  await db.exec(sql`DROP TABLE IF EXISTS workflow_approvals`);
  await db.exec(sql`DROP TABLE IF EXISTS document_workflows`);
  await db.exec(sql`DROP TABLE IF EXISTS workflow_templates`);
  await db.exec(sql`DROP TABLE IF EXISTS module_documents`);
}