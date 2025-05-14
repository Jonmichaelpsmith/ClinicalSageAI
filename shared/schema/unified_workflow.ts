/**
 * Unified Workflow Schema
 * 
 * This file defines the schema for the unified document workflow system.
 */

import { pgTable, serial, text, integer, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

/**
 * Documents table
 * 
 * Central storage for all documents across modules
 */
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  documentType: text('document_type').notNull(),
  name: text('name').notNull(),
  version: text('version').notNull().default('1.0'),
  organizationId: integer('organization_id').notNull(),
  status: text('status').notNull().default('draft'),
  metadata: jsonb('metadata').default({}),
  externalId: text('external_id').notNull(),
  createdBy: integer('created_by').notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull()
});

/**
 * Module References table
 * 
 * Maps documents to their original source modules
 */
export const moduleReferences = pgTable('module_references', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').notNull()
    .references(() => documents.id, { onDelete: 'cascade' }),
  moduleType: text('module_type').notNull(),
  originalId: text('original_id').notNull(),
  moduleUrl: text('module_url'),
  createdAt: timestamp('created_at').notNull()
});

/**
 * Workflow Templates table
 * 
 * Defines reusable workflow templates
 */
export const workflowTemplates = pgTable('workflow_templates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  organizationId: integer('organization_id').notNull(),
  moduleType: text('module_type').notNull(),
  isDefault: boolean('is_default').default(false),
  createdBy: integer('created_by').notNull(),
  createdAt: timestamp('created_at').notNull()
});

/**
 * Workflow Template Steps table
 * 
 * Defines steps within workflow templates
 */
export const workflowTemplateSteps = pgTable('workflow_template_steps', {
  id: serial('id').primaryKey(),
  templateId: integer('template_id').notNull()
    .references(() => workflowTemplates.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  order: integer('order').notNull(),
  assigneeType: text('assignee_type').default('any'),
  createdAt: timestamp('created_at').notNull()
});

/**
 * Document Workflows table
 * 
 * Active workflows for documents
 */
export const documentWorkflows = pgTable('document_workflows', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').notNull()
    .references(() => documents.id, { onDelete: 'cascade' }),
  templateId: integer('template_id').notNull()
    .references(() => workflowTemplates.id),
  status: text('status').notNull(),
  startedBy: integer('started_by').notNull(),
  startedAt: timestamp('started_at').notNull(),
  completedAt: timestamp('completed_at'),
  metadata: jsonb('metadata').default({}),
  updatedAt: timestamp('updated_at').notNull()
});

/**
 * Workflow Approvals table
 * 
 * Approval steps within active workflows
 */
export const workflowApprovals = pgTable('workflow_approvals', {
  id: serial('id').primaryKey(),
  workflowId: integer('workflow_id').notNull()
    .references(() => documentWorkflows.id, { onDelete: 'cascade' }),
  stepId: integer('step_id').notNull()
    .references(() => workflowTemplateSteps.id),
  status: text('status').notNull(),
  order: integer('order').notNull(),
  approvedBy: integer('approved_by'),
  approvedAt: timestamp('approved_at'),
  rejectedBy: integer('rejected_by'),
  rejectedAt: timestamp('rejected_at'),
  comments: text('comments'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull()
});

/**
 * Workflow Audit Logs table
 * 
 * Audit trail for workflow actions
 */
export const workflowAuditLogs = pgTable('workflow_audit_logs', {
  id: serial('id').primaryKey(),
  workflowId: integer('workflow_id').notNull()
    .references(() => documentWorkflows.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  userId: integer('user_id').notNull(),
  details: jsonb('details').default({}),
  createdAt: timestamp('created_at').notNull()
});