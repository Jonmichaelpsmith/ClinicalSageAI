/**
 * Migration: Document Workflow System
 * Date: May 14, 2025
 * 
 * This migration adds tables for the unified document workflow system.
 */

exports.up = async function(db) {
  console.log('Running workflow system migration (up)');
  
  // Create module_type enum type
  await db.raw(`
    CREATE TYPE module_type AS ENUM (
      'cmc_wizard',
      'ectd_coauthor',
      'med_device',
      'study_architect'
    );
  `);
  
  // Create document_status enum type
  await db.raw(`
    CREATE TYPE document_status AS ENUM (
      'draft',
      'in_review',
      'approved',
      'rejected',
      'archived'
    );
  `);
  
  // Create workflow_status enum type
  await db.raw(`
    CREATE TYPE workflow_status AS ENUM (
      'draft',
      'in_review',
      'approved',
      'rejected',
      'on_hold'
    );
  `);
  
  // Create approval_status enum type
  await db.raw(`
    CREATE TYPE approval_status AS ENUM (
      'pending',
      'in_progress',
      'approved',
      'rejected',
      'skipped'
    );
  `);
  
  // Create unified documents table
  await db.schema.createTable('unified_documents', table => {
    table.increments('id').primary();
    table.integer('organization_id').notNullable();
    table.specificType('module_type', 'module_type').notNullable();
    table.text('original_document_id').notNullable();
    table.text('title').notNullable();
    table.text('document_type').notNullable();
    table.specificType('status', 'document_status').defaultTo('draft');
    table.jsonb('metadata');
    table.jsonb('content');
    table.integer('vault_folder_id');
    table.integer('created_by').notNullable();
    table.integer('updated_by').notNullable();
    table.timestamp('created_at').defaultTo(db.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(db.fn.now()).notNullable();
    
    // Add indexes
    table.index('organization_id');
    table.index(['module_type', 'original_document_id']);
    table.index('status');
  });
  
  // Create workflow templates table
  await db.schema.createTable('workflow_templates', table => {
    table.increments('id').primary();
    table.integer('organization_id').notNullable();
    table.text('name').notNullable();
    table.text('description');
    table.specificType('module_type', 'module_type').notNullable();
    table.jsonb('steps').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.integer('created_by').notNullable();
    table.integer('updated_by').notNullable();
    table.timestamp('created_at').defaultTo(db.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(db.fn.now()).notNullable();
    
    // Add indexes
    table.index('organization_id');
    table.index(['module_type', 'is_active']);
  });
  
  // Create document workflows table
  await db.schema.createTable('document_workflows', table => {
    table.increments('id').primary();
    table.integer('document_id').notNullable()
      .references('id').inTable('unified_documents');
    table.integer('template_id').notNullable()
      .references('id').inTable('workflow_templates');
    table.specificType('status', 'workflow_status').defaultTo('draft');
    table.integer('current_step').defaultTo(0);
    table.jsonb('metadata');
    table.timestamp('started_at').defaultTo(db.fn.now());
    table.timestamp('completed_at');
    table.integer('created_by').notNullable();
    table.integer('updated_by').notNullable();
    table.timestamp('created_at').defaultTo(db.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(db.fn.now()).notNullable();
    
    // Add indexes
    table.index('document_id');
    table.index('status');
  });
  
  // Create workflow approvals table
  await db.schema.createTable('workflow_approvals', table => {
    table.increments('id').primary();
    table.integer('workflow_id').notNullable()
      .references('id').inTable('document_workflows');
    table.integer('step_index').notNullable();
    table.text('assigned_role').notNullable();
    table.integer('assigned_to');
    table.specificType('status', 'approval_status').defaultTo('pending');
    table.text('comments');
    table.integer('completed_by');
    table.timestamp('completed_at');
    table.timestamp('created_at').defaultTo(db.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(db.fn.now()).notNullable();
    
    // Add indexes
    table.index('workflow_id');
    table.index(['workflow_id', 'step_index']);
    table.index('status');
  });
  
  // Create workflow audit trail table
  await db.schema.createTable('workflow_audit_trail', table => {
    table.increments('id').primary();
    table.integer('workflow_id').notNullable()
      .references('id').inTable('document_workflows');
    table.text('action_type').notNullable();
    table.integer('action_by').notNullable();
    table.jsonb('action_details');
    table.timestamp('timestamp').defaultTo(db.fn.now()).notNullable();
    
    // Add indexes
    table.index('workflow_id');
    table.index('action_type');
  });
  
  // Add some default workflow templates if they don't exist
  const templates = [
    {
      organization_id: 1, // Default organization
      name: 'Medical Device Submission Review',
      description: 'Standard review process for 510(k) submissions',
      module_type: 'med_device',
      steps: JSON.stringify([
        {
          role: 'technical_reviewer',
          title: 'Technical Review',
          description: 'Review technical aspects of the submission'
        },
        {
          role: 'regulatory_affairs',
          title: 'Regulatory Review',
          description: 'Review for regulatory compliance'
        },
        {
          role: 'quality_assurance',
          title: 'Quality Assurance',
          description: 'Final quality check before approval'
        }
      ]),
      is_active: true,
      created_by: 1,
      updated_by: 1
    },
    {
      organization_id: 1, // Default organization
      name: 'CER Documentation Review',
      description: 'Standard review process for Clinical Evaluation Reports',
      module_type: 'med_device',
      steps: JSON.stringify([
        {
          role: 'clinical_reviewer',
          title: 'Clinical Data Review',
          description: 'Review clinical data and literature'
        },
        {
          role: 'medical_reviewer',
          title: 'Medical Expert Review',
          description: 'Medical evaluation of clinical claims'
        },
        {
          role: 'regulatory_affairs',
          title: 'Regulatory Review',
          description: 'Review for regulatory compliance'
        },
        {
          role: 'quality_assurance',
          title: 'Quality Assurance',
          description: 'Final quality check before approval'
        }
      ]),
      is_active: true,
      created_by: 1,
      updated_by: 1
    }
  ];
  
  // Insert templates
  for (const template of templates) {
    await db('workflow_templates').insert(template);
  }
  
  console.log('Workflow system migration (up) completed successfully');
};

exports.down = async function(db) {
  console.log('Running workflow system migration (down)');
  
  // Drop tables in reverse order
  await db.schema.dropTableIfExists('workflow_audit_trail');
  await db.schema.dropTableIfExists('workflow_approvals');
  await db.schema.dropTableIfExists('document_workflows');
  await db.schema.dropTableIfExists('unified_documents');
  await db.schema.dropTableIfExists('workflow_templates');
  
  // Drop enum types
  await db.raw('DROP TYPE IF EXISTS approval_status');
  await db.raw('DROP TYPE IF EXISTS workflow_status');
  await db.raw('DROP TYPE IF EXISTS document_status');
  await db.raw('DROP TYPE IF EXISTS module_type');
  
  console.log('Workflow system migration (down) completed successfully');
};