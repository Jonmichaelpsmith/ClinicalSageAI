/**
 * Migration: Create Document Workflow System Tables
 * 
 * This migration sets up the database tables for the unified document workflow
 * system, enabling cross-module document tracking and approvals.
 * 
 * Date: May 14, 2025
 */

const { sql } = require('drizzle-orm');

/**
 * Perform the migration
 * @param {*} db The database connection
 */
async function up(db) {
  console.log('Creating unified document workflow tables...');

  // Create unified_documents table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS unified_documents (
      id SERIAL PRIMARY KEY,
      module_type TEXT NOT NULL,
      original_document_id TEXT NOT NULL,
      title TEXT NOT NULL,
      document_type TEXT NOT NULL,
      metadata JSONB DEFAULT '{}',
      content JSONB,
      vault_folder_id INTEGER,
      organization_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      created_by INTEGER NOT NULL,
      updated_by INTEGER NOT NULL,
      is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
      
      UNIQUE(module_type, original_document_id, organization_id)
    )
  `);
  console.log('Created unified_documents table');
  
  // Create workflow_templates table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS workflow_templates (
      id SERIAL PRIMARY KEY,
      module_type TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      steps JSONB NOT NULL,
      organization_id INTEGER NOT NULL,
      is_active BOOLEAN DEFAULT TRUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      created_by INTEGER NOT NULL,
      updated_by INTEGER NOT NULL,
      
      UNIQUE(name, organization_id)
    )
  `);
  console.log('Created workflow_templates table');
  
  // Create document_workflows table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS document_workflows (
      id SERIAL PRIMARY KEY,
      document_id INTEGER NOT NULL REFERENCES unified_documents(id),
      template_id INTEGER NOT NULL REFERENCES workflow_templates(id),
      status TEXT NOT NULL DEFAULT 'pending',
      metadata JSONB DEFAULT '{}',
      template_name TEXT NOT NULL,
      template_steps JSONB NOT NULL,
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      completed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      created_by INTEGER NOT NULL
    )
  `);
  console.log('Created document_workflows table');
  
  // Create workflow_approvals table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS workflow_approvals (
      id SERIAL PRIMARY KEY,
      workflow_id INTEGER NOT NULL REFERENCES document_workflows(id),
      step_index INTEGER NOT NULL,
      step_name TEXT,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      assigned_to INTEGER,
      assigned_by INTEGER,
      assigned_at TIMESTAMP,
      approved_by INTEGER,
      approved_at TIMESTAMP,
      comments TEXT,
      
      UNIQUE(workflow_id, step_index)
    )
  `);
  console.log('Created workflow_approvals table');
  
  // Create workflow_audit_log table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS workflow_audit_log (
      id SERIAL PRIMARY KEY,
      workflow_id INTEGER NOT NULL REFERENCES document_workflows(id),
      action TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      details TEXT,
      metadata JSONB
    )
  `);
  console.log('Created workflow_audit_log table');
  
  // Create indexes for better performance
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_unified_documents_module_type ON unified_documents(module_type)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_unified_documents_organization_id ON unified_documents(organization_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_unified_documents_document_type ON unified_documents(document_type)`);
  
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_workflow_templates_module_type ON workflow_templates(module_type)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_workflow_templates_organization_id ON workflow_templates(organization_id)`);
  
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_document_workflows_document_id ON document_workflows(document_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_document_workflows_status ON document_workflows(status)`);
  
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_workflow_approvals_workflow_id ON workflow_approvals(workflow_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_workflow_approvals_status ON workflow_approvals(status)`);
  
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_workflow_audit_log_workflow_id ON workflow_audit_log(workflow_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_workflow_audit_log_action ON workflow_audit_log(action)`);
  
  console.log('Created indexes for unified document workflow tables');
  
  // Create a default workflow template for the Medical Device module for 510k documents
  await db.execute(sql`
    INSERT INTO workflow_templates (
      module_type,
      name,
      description,
      steps,
      organization_id,
      created_by,
      updated_by
    ) 
    VALUES (
      'med_device',
      '510k Review Workflow',
      'Standard workflow for review and approval of 510k submissions',
      '[
        {
          "name": "Initial Technical Review",
          "description": "Technical review of the 510k submission content",
          "role": "technical_reviewer",
          "required_fields": ["device_description", "intended_use", "predicate_comparison"]
        },
        {
          "name": "Regulatory Review",
          "description": "Regulatory compliance review",
          "role": "regulatory_specialist",
          "required_fields": ["regulatory_standards", "compliance_checklist"]
        },
        {
          "name": "Quality Assurance",
          "description": "Final QA check before submission",
          "role": "qa_specialist",
          "required_fields": ["qa_checklist", "final_validation"]
        },
        {
          "name": "Final Approval",
          "description": "Management sign-off for submission",
          "role": "manager",
          "required_fields": ["approval_signature"]
        }
      ]',
      1,
      1,
      1
    )
    ON CONFLICT (name, organization_id) DO NOTHING
  `);
  
  // Create a default workflow template for the Medical Device module for CER documents
  await db.execute(sql`
    INSERT INTO workflow_templates (
      module_type,
      name,
      description,
      steps,
      organization_id,
      created_by,
      updated_by
    ) 
    VALUES (
      'med_device',
      'CER Review Workflow',
      'Standard workflow for review and approval of Clinical Evaluation Reports',
      '[
        {
          "name": "Clinical Data Review",
          "description": "Review of clinical data and literature",
          "role": "clinical_specialist",
          "required_fields": ["literature_review", "clinical_data_analysis"]
        },
        {
          "name": "Technical Review",
          "description": "Technical review of the device specification",
          "role": "technical_reviewer",
          "required_fields": ["device_specification", "technical_review_checklist"]
        },
        {
          "name": "Medical Review",
          "description": "Medical review by qualified medical professional",
          "role": "medical_reviewer",
          "required_fields": ["medical_opinion", "risk_assessment"]
        },
        {
          "name": "Regulatory Review",
          "description": "Regulatory compliance review",
          "role": "regulatory_specialist",
          "required_fields": ["regulatory_compliance", "standards_checklist"]
        },
        {
          "name": "Final Approval",
          "description": "Management sign-off for CER",
          "role": "manager",
          "required_fields": ["approval_signature"]
        }
      ]',
      1,
      1,
      1
    )
    ON CONFLICT (name, organization_id) DO NOTHING
  `);
  
  console.log('Added default workflow templates for Medical Device module');
  
  console.log('Document workflow system tables created successfully');
}

/**
 * Rollback the migration
 * @param {*} db The database connection
 */
async function down(db) {
  console.log('Rolling back unified document workflow tables...');
  
  // Drop tables in reverse order of dependencies
  await db.execute(sql`DROP TABLE IF EXISTS workflow_audit_log`);
  await db.execute(sql`DROP TABLE IF EXISTS workflow_approvals`);
  await db.execute(sql`DROP TABLE IF EXISTS document_workflows`);
  await db.execute(sql`DROP TABLE IF EXISTS workflow_templates`);
  await db.execute(sql`DROP TABLE IF EXISTS unified_documents`);
  
  console.log('Rolled back document workflow system tables');
}

module.exports = { up, down };