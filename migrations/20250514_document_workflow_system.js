/**
 * Document Workflow System Migration
 * 
 * This migration creates the tables for the unified document workflow system.
 */

exports.up = async function(knex) {
  // Create documents table
  await knex.schema.createTable('documents', (table) => {
    table.increments('id').primary();
    table.string('document_type').notNullable();
    table.string('name').notNullable();
    table.string('version').notNullable().defaultTo('1.0');
    table.integer('organization_id').notNullable();
    table.string('status').notNullable().defaultTo('draft');
    table.jsonb('metadata').defaultTo('{}');
    table.string('external_id').notNullable();
    table.integer('created_by').notNullable();
    table.timestamp('created_at').notNullable();
    table.timestamp('updated_at').notNullable();
    
    // Add index for organization_id for faster queries
    table.index('organization_id');
  });
  
  // Create module_references table
  await knex.schema.createTable('module_references', (table) => {
    table.increments('id').primary();
    table.integer('document_id').notNullable()
      .references('id').inTable('documents').onDelete('CASCADE');
    table.string('module_type').notNullable();
    table.string('original_id').notNullable();
    table.string('module_url');
    table.timestamp('created_at').notNullable();
    
    // Add composite index for faster lookups
    table.index(['module_type', 'original_id']);
  });
  
  // Create workflow_templates table
  await knex.schema.createTable('workflow_templates', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('description');
    table.integer('organization_id').notNullable();
    table.string('module_type').notNullable();
    table.boolean('is_default').defaultTo(false);
    table.integer('created_by').notNullable();
    table.timestamp('created_at').notNullable();
    
    // Add composite index for organization and module type
    table.index(['organization_id', 'module_type']);
  });
  
  // Create workflow_template_steps table
  await knex.schema.createTable('workflow_template_steps', (table) => {
    table.increments('id').primary();
    table.integer('template_id').notNullable()
      .references('id').inTable('workflow_templates').onDelete('CASCADE');
    table.string('name').notNullable();
    table.string('description');
    table.integer('order').notNullable();
    table.string('assignee_type').defaultTo('any');
    table.timestamp('created_at').notNullable();
    
    // Add index for template_id and order
    table.index(['template_id', 'order']);
  });
  
  // Create document_workflows table
  await knex.schema.createTable('document_workflows', (table) => {
    table.increments('id').primary();
    table.integer('document_id').notNullable()
      .references('id').inTable('documents').onDelete('CASCADE');
    table.integer('template_id').notNullable()
      .references('id').inTable('workflow_templates');
    table.string('status').notNullable();
    table.integer('started_by').notNullable();
    table.timestamp('started_at').notNullable();
    table.timestamp('completed_at');
    table.jsonb('metadata').defaultTo('{}');
    table.timestamp('updated_at').notNullable();
    
    // Add index for document_id
    table.index('document_id');
    // Add index for status
    table.index('status');
  });
  
  // Create workflow_approvals table
  await knex.schema.createTable('workflow_approvals', (table) => {
    table.increments('id').primary();
    table.integer('workflow_id').notNullable()
      .references('id').inTable('document_workflows').onDelete('CASCADE');
    table.integer('step_id').notNullable()
      .references('id').inTable('workflow_template_steps');
    table.string('status').notNullable();
    table.integer('order').notNullable();
    table.integer('approved_by');
    table.timestamp('approved_at');
    table.integer('rejected_by');
    table.timestamp('rejected_at');
    table.string('comments');
    table.timestamp('created_at').notNullable();
    table.timestamp('updated_at').notNullable();
    
    // Add index for workflow_id and status
    table.index(['workflow_id', 'status']);
    // Add index for order
    table.index(['workflow_id', 'order']);
  });
  
  // Create workflow_audit_logs table
  await knex.schema.createTable('workflow_audit_logs', (table) => {
    table.increments('id').primary();
    table.integer('workflow_id').notNullable()
      .references('id').inTable('document_workflows').onDelete('CASCADE');
    table.string('action').notNullable();
    table.integer('user_id').notNullable();
    table.jsonb('details').defaultTo('{}');
    table.timestamp('created_at').notNullable();
    
    // Add index for workflow_id
    table.index('workflow_id');
  });
};

exports.down = async function(knex) {
  // Drop tables in reverse order
  await knex.schema.dropTableIfExists('workflow_audit_logs');
  await knex.schema.dropTableIfExists('workflow_approvals');
  await knex.schema.dropTableIfExists('document_workflows');
  await knex.schema.dropTableIfExists('workflow_template_steps');
  await knex.schema.dropTableIfExists('workflow_templates');
  await knex.schema.dropTableIfExists('module_references');
  await knex.schema.dropTableIfExists('documents');
};