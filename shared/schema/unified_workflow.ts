/**
 * Unified Workflow Schema
 * 
 * This file defines the schema for the unified document workflow system,
 * enabling cross-module document management and approval workflows.
 */

import { pgTable, serial, integer, text, varchar, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Documents table
 * 
 * Stores the unified documents across all modules
 */
export const documents = pgTable('unified_documents', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  documentType: varchar('document_type', { length: 100 }).notNull(),
  organizationId: integer('organization_id').notNull(),
  createdBy: integer('created_by').notNull(),
  vaultFolderId: integer('vault_folder_id'),
  metadata: jsonb('metadata').default({}),
  content: jsonb('content'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Module-specific document references
 * 
 * Links unified documents to their original module-specific documents
 */
export const moduleDocuments = pgTable('module_documents', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').notNull().references(() => documents.id),
  moduleType: varchar('module_type', { length: 50 }).notNull(),
  originalDocumentId: varchar('original_document_id', { length: 255 }).notNull(),
  organizationId: integer('organization_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Workflow templates
 * 
 * Defines templates for document approval workflows
 */
export const workflowTemplates = pgTable('workflow_templates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  moduleType: varchar('module_type', { length: 50 }).notNull(),
  organizationId: integer('organization_id').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  steps: jsonb('steps').notNull().default([]),
  createdBy: integer('created_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Workflows
 * 
 * Instances of approval workflows for documents
 */
export const workflows = pgTable('workflows', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').notNull().references(() => documents.id),
  templateId: integer('template_id').notNull().references(() => workflowTemplates.id),
  status: varchar('status', { length: 50 }).notNull().default('in_progress'),
  startedAt: timestamp('started_at').notNull(),
  startedBy: integer('started_by').notNull(),
  completedAt: timestamp('completed_at'),
  completedBy: integer('completed_by'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Workflow approvals
 * 
 * Individual approval steps for workflows
 */
export const workflowApprovals = pgTable('workflow_approvals', {
  id: serial('id').primaryKey(),
  workflowId: integer('workflow_id').notNull().references(() => workflows.id),
  stepIndex: integer('step_index').notNull(),
  stepName: varchar('step_name', { length: 255 }),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull().default('waiting'),
  assignedTo: integer('assigned_to'),
  approvedBy: integer('approved_by'),
  approvedAt: timestamp('approved_at'),
  comments: text('comments'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Workflow audit logs
 * 
 * Tracks all actions in a workflow
 */
export const workflowAuditLogs = pgTable('workflow_audit_logs', {
  id: serial('id').primaryKey(),
  workflowId: integer('workflow_id').notNull().references(() => workflows.id),
  actionType: varchar('action_type', { length: 100 }).notNull(),
  actionBy: integer('action_by').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  details: text('details'),
});

// Types
export type Document = typeof documents.$inferSelect;
export type DocumentInsert = typeof documents.$inferInsert;
export type ModuleDocument = typeof moduleDocuments.$inferSelect;
export type ModuleDocumentInsert = typeof moduleDocuments.$inferInsert;
export type WorkflowTemplate = typeof workflowTemplates.$inferSelect;
export type WorkflowTemplateInsert = typeof workflowTemplates.$inferInsert;
export type Workflow = typeof workflows.$inferSelect;
export type WorkflowInsert = typeof workflows.$inferInsert;
export type WorkflowApproval = typeof workflowApprovals.$inferSelect;
export type WorkflowApprovalInsert = typeof workflowApprovals.$inferInsert;
export type WorkflowAuditLog = typeof workflowAuditLogs.$inferSelect;
export type WorkflowAuditLogInsert = typeof workflowAuditLogs.$inferInsert;

// Zod schemas for validation
export const insertDocumentSchema = createInsertSchema(documents, {
  metadata: z.record(z.any()).optional(),
  content: z.any().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertModuleDocumentSchema = createInsertSchema(moduleDocuments).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertWorkflowTemplateSchema = createInsertSchema(workflowTemplates, {
  steps: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
      requiredApprovers: z.number().optional(),
    })
  ),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertWorkflowSchema = createInsertSchema(workflows, {
  metadata: z.record(z.any()).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertWorkflowApprovalSchema = createInsertSchema(workflowApprovals).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertWorkflowAuditLogSchema = createInsertSchema(workflowAuditLogs).omit({ 
  id: true 
});