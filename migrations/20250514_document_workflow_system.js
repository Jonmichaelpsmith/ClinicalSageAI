/**
 * Unified Document Workflow System Migration
 * 
 * This migration adds the necessary tables to support a unified document workflow
 * system that integrates across different modules.
 */

export async function up(db) {
  console.log('Starting document workflow system migration...');

  try {
    // Create Module Documents Table
    await db.schema.createTable('module_documents', (table) => {
      table.uuid('id').primary().defaultTo(db.fn.uuid());
      table.integer('document_id').notNull().references('documents.id').onDelete('cascade');
      table.string('module_type', 50).notNull();
      table.string('module_document_id', 100).notNull();
      table.jsonb('metadata');
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
      
      // Add unique constraint on module_type + module_document_id
      table.unique(['module_type', 'module_document_id']);
      
      // Add index on document_id for faster lookups
      table.index('document_id');
    });
    
    console.log('Created module_documents table');

    // Create Workflow Templates Table
    await db.schema.createTable('workflow_templates', (table) => {
      table.uuid('id').primary().defaultTo(db.fn.uuid());
      table.string('name', 100).notNull();
      table.text('description');
      table.string('module_type', 50).notNull();
      table.jsonb('steps').notNull();
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
      
      // Add index on module_type and is_active for faster lookups
      table.index(['module_type', 'is_active']);
    });
    
    console.log('Created workflow_templates table');

    // Create Document Workflows Table
    await db.schema.createTable('document_workflows', (table) => {
      table.uuid('id').primary().defaultTo(db.fn.uuid());
      table.integer('document_id').notNull().references('documents.id').onDelete('cascade');
      table.uuid('workflow_template_id').references('workflow_templates.id');
      table.string('status', 50).notNull().defaultTo('draft');
      table.integer('current_step').defaultTo(0);
      table.timestamp('started_at').defaultTo(db.fn.now());
      table.timestamp('completed_at');
      table.integer('initiated_by').references('users.id');
      table.jsonb('data');
      
      // Add index on document_id and status for faster lookups
      table.index(['document_id', 'status']);
    });
    
    console.log('Created document_workflows table');

    // Create Workflow Approvals Table
    await db.schema.createTable('workflow_approvals', (table) => {
      table.uuid('id').primary().defaultTo(db.fn.uuid());
      table.uuid('workflow_id').notNull().references('document_workflows.id').onDelete('cascade');
      table.integer('step_index').notNull();
      table.string('status', 50).notNull().defaultTo('pending');
      table.string('assigned_role', 50).notNull();
      table.integer('assigned_to').references('users.id');
      table.integer('completed_by').references('users.id');
      table.timestamp('completed_at');
      table.text('comments');
      table.text('signature_data');
      
      // Add index on workflow_id and step_index for faster lookups
      table.index(['workflow_id', 'step_index']);
      
      // Add index on assigned_to for faster lookups
      table.index('assigned_to');
    });
    
    console.log('Created workflow_approvals table');

    // Create Document Relationships Table
    await db.schema.createTable('document_relationships', (table) => {
      table.uuid('id').primary().defaultTo(db.fn.uuid());
      table.integer('source_document_id').notNull().references('documents.id').onDelete('cascade');
      table.integer('target_document_id').notNull().references('documents.id').onDelete('cascade');
      table.string('relationship_type', 50).notNull();
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.jsonb('data');
      
      // Add index on source_document_id and target_document_id for faster lookups
      table.index(['source_document_id', 'target_document_id']);
      
      // Add index on relationship_type for faster lookups
      table.index('relationship_type');
    });
    
    console.log('Created document_relationships table');

    console.log('Document workflow system migration completed successfully');
  } catch (error) {
    console.error('Error during document workflow system migration:', error);
    throw error;
  }
}

export async function down(db) {
  console.log('Reverting document workflow system migration...');
  
  try {
    // Drop tables in reverse order to avoid foreign key constraint errors
    await db.schema.dropTableIfExists('document_relationships');
    console.log('Dropped document_relationships table');
    
    await db.schema.dropTableIfExists('workflow_approvals');
    console.log('Dropped workflow_approvals table');
    
    await db.schema.dropTableIfExists('document_workflows');
    console.log('Dropped document_workflows table');
    
    await db.schema.dropTableIfExists('workflow_templates');
    console.log('Dropped workflow_templates table');
    
    await db.schema.dropTableIfExists('module_documents');
    console.log('Dropped module_documents table');
    
    console.log('Document workflow system migration reverted successfully');
  } catch (error) {
    console.error('Error during reverting document workflow system migration:', error);
    throw error;
  }
}