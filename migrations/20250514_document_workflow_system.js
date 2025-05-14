/**
 * Migration: Create Document Workflow System Tables
 * 
 * This migration sets up the database tables for the unified document workflow
 * system, enabling cross-module document tracking and approvals.
 * 
 * Date: May 14, 2025
 */

const migrationSchema = {
  up: async (db) => {
    console.log('Starting document workflow system migration...');
    
    // Unified Documents table
    await db.schema.createTable('unified_documents')
      .addColumn('id', 'serial', col => col.primaryKey())
      .addColumn('module_type', 'text', col => col.notNull())
      .addColumn('original_document_id', 'text', col => col.notNull())
      .addColumn('title', 'text', col => col.notNull())
      .addColumn('document_type', 'text', col => col.notNull())
      .addColumn('metadata', 'jsonb')
      .addColumn('content', 'jsonb')
      .addColumn('vault_folder_id', 'integer')
      .addColumn('organization_id', 'integer', col => col.notNull())
      .addColumn('created_at', 'timestamp', col => col.defaultTo(db.fn.now()).notNull())
      .addColumn('updated_at', 'timestamp', col => col.defaultTo(db.fn.now()).notNull())
      .addColumn('created_by', 'integer', col => col.notNull())
      .addColumn('updated_by', 'integer', col => col.notNull())
      .addColumn('is_deleted', 'boolean', col => col.defaultTo(false).notNull())
      .execute();
    
    // Create unique index on module+document+organization
    await db.schema.createIndex('module_document_idx')
      .on('unified_documents')
      .columns(['module_type', 'original_document_id', 'organization_id'])
      .unique()
      .execute();
    
    // Workflow Templates table
    await db.schema.createTable('workflow_templates')
      .addColumn('id', 'serial', col => col.primaryKey())
      .addColumn('module_type', 'text', col => col.notNull())
      .addColumn('name', 'text', col => col.notNull())
      .addColumn('description', 'text')
      .addColumn('steps', 'jsonb', col => col.notNull())
      .addColumn('organization_id', 'integer', col => col.notNull())
      .addColumn('is_active', 'boolean', col => col.defaultTo(true).notNull())
      .addColumn('created_at', 'timestamp', col => col.defaultTo(db.fn.now()).notNull())
      .addColumn('updated_at', 'timestamp', col => col.defaultTo(db.fn.now()).notNull())
      .addColumn('created_by', 'integer', col => col.notNull())
      .execute();
    
    // Document Workflows table
    await db.schema.createTable('document_workflows')
      .addColumn('id', 'serial', col => col.primaryKey())
      .addColumn('document_id', 'integer', col => col.notNull().references('unified_documents.id'))
      .addColumn('template_id', 'integer', col => col.notNull().references('workflow_templates.id'))
      .addColumn('status', 'text', col => col.notNull().defaultTo('pending'))
      .addColumn('metadata', 'jsonb')
      .addColumn('created_at', 'timestamp', col => col.defaultTo(db.fn.now()).notNull())
      .addColumn('updated_at', 'timestamp', col => col.defaultTo(db.fn.now()).notNull())
      .addColumn('completed_at', 'timestamp')
      .addColumn('created_by', 'integer', col => col.notNull())
      .addColumn('template_name', 'text')
      .addColumn('template_steps', 'jsonb')
      .execute();
    
    // Workflow Approvals table
    await db.schema.createTable('workflow_approvals')
      .addColumn('id', 'serial', col => col.primaryKey())
      .addColumn('workflow_id', 'integer', col => col.notNull().references('document_workflows.id'))
      .addColumn('step_index', 'integer', col => col.notNull())
      .addColumn('step_name', 'text')
      .addColumn('description', 'text')
      .addColumn('status', 'text', col => col.notNull().defaultTo('pending'))
      .addColumn('assigned_to', 'integer')
      .addColumn('assigned_by', 'integer')
      .addColumn('assigned_at', 'timestamp')
      .addColumn('approved_by', 'integer')
      .addColumn('approved_at', 'timestamp')
      .addColumn('comments', 'text')
      .addColumn('evidence', 'jsonb')
      .execute();
    
    // Create unique index on workflow+step
    await db.schema.createIndex('workflow_step_idx')
      .on('workflow_approvals')
      .columns(['workflow_id', 'step_index'])
      .unique()
      .execute();
    
    // Workflow Audit Log table
    await db.schema.createTable('workflow_audit_log')
      .addColumn('id', 'serial', col => col.primaryKey())
      .addColumn('workflow_id', 'integer', col => col.notNull().references('document_workflows.id'))
      .addColumn('action', 'text', col => col.notNull())
      .addColumn('user_id', 'integer', col => col.notNull())
      .addColumn('timestamp', 'timestamp', col => col.defaultTo(db.fn.now()).notNull())
      .addColumn('details', 'text')
      .addColumn('metadata', 'jsonb')
      .execute();
    
    // Insert default workflow templates
    await db.insert('workflow_templates').values([
      {
        module_type: 'med_device',
        name: 'Standard 510(k) Review',
        description: 'Standard review process for 510(k) documents with regulatory and QA checkpoints',
        steps: JSON.stringify([
          { name: 'Technical Review', description: 'Verification of technical content and claims', role: 'technical_reviewer' },
          { name: 'Regulatory Review', description: 'Regulatory compliance assessment', role: 'regulatory_reviewer' },
          { name: 'QA Approval', description: 'Final quality assurance approval', role: 'qa_approver' }
        ]),
        organization_id: 1,
        created_by: 1
      },
      {
        module_type: 'med_device',
        name: 'CER Approval Workflow',
        description: 'Clinical Evaluation Report review and approval process',
        steps: JSON.stringify([
          { name: 'Clinical Expert Review', description: 'Review by clinical subject matter expert', role: 'clinical_reviewer' },
          { name: 'Regulatory Review', description: 'Compliance with regulatory standards', role: 'regulatory_reviewer' },
          { name: 'QA Approval', description: 'Final quality assurance approval', role: 'qa_approver' },
          { name: 'Executive Signoff', description: 'Executive management approval', role: 'executive_approver' }
        ]),
        organization_id: 1,
        created_by: 1
      },
      {
        module_type: 'cmc_wizard',
        name: 'CMC Document Approval',
        description: 'Chemistry, Manufacturing and Controls document approval workflow',
        steps: JSON.stringify([
          { name: 'Technical Review', description: 'Review of technical specifications', role: 'technical_reviewer' },
          { name: 'Compliance Review', description: 'Regulatory compliance assessment', role: 'compliance_reviewer' },
          { name: 'Quality Approval', description: 'Quality assurance approval', role: 'quality_approver' }
        ]),
        organization_id: 1,
        created_by: 1
      },
      {
        module_type: 'trial_sage',
        name: 'Document Archival Workflow',
        description: 'Process for finalizing and archiving documents',
        steps: JSON.stringify([
          { name: 'Content Review', description: 'Final content review before archival', role: 'content_reviewer' },
          { name: 'Metadata Verification', description: 'Verification of document metadata', role: 'metadata_reviewer' },
          { name: 'Archival Approval', description: 'Final approval for document archival', role: 'archival_approver' }
        ]),
        organization_id: 1,
        created_by: 1
      },
      {
        module_type: 'ectd_coauthor',
        name: 'eCTD Submission Approval',
        description: 'Approval workflow for eCTD submission documents',
        steps: JSON.stringify([
          { name: 'Author Review', description: 'Review by document author', role: 'author' },
          { name: 'Technical Review', description: 'Technical content review', role: 'technical_reviewer' },
          { name: 'Regulatory Review', description: 'Regulatory compliance review', role: 'regulatory_reviewer' },
          { name: 'Publishing Approval', description: 'Final approval before publishing', role: 'publishing_approver' }
        ]),
        organization_id: 1,
        created_by: 1
      },
      {
        module_type: 'study_architect',
        name: 'Study Protocol Approval',
        description: 'Review and approval workflow for study protocols',
        steps: JSON.stringify([
          { name: 'Scientific Review', description: 'Review of scientific methodology', role: 'scientific_reviewer' },
          { name: 'Statistical Review', description: 'Review of statistical methods', role: 'statistical_reviewer' },
          { name: 'Clinical Review', description: 'Clinical aspects review', role: 'clinical_reviewer' },
          { name: 'Ethics Review', description: 'Ethical considerations review', role: 'ethics_reviewer' },
          { name: 'Final Approval', description: 'Final protocol approval', role: 'final_approver' }
        ]),
        organization_id: 1,
        created_by: 1
      }
    ]).execute();
    
    console.log('Document workflow system migration completed successfully.');
  },
  
  down: async (db) => {
    console.log('Rolling back document workflow system migration...');
    
    // Drop tables in reverse order to avoid constraint issues
    await db.schema.dropTable('workflow_audit_log').ifExists().execute();
    await db.schema.dropTable('workflow_approvals').ifExists().execute();
    await db.schema.dropTable('document_workflows').ifExists().execute();
    await db.schema.dropTable('workflow_templates').ifExists().execute();
    await db.schema.dropTable('unified_documents').ifExists().execute();
    
    console.log('Document workflow system rollback completed successfully.');
  }
};

module.exports = migrationSchema;