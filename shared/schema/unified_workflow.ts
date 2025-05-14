/**
 * Unified Workflow Schema
 * 
 * This file defines the database schema for the unified document workflow system
 * that enables cross-module document approvals and tracking.
 */

import { pgTable, text, timestamp, integer, boolean, jsonb, serial, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Available module types in the system
 */
export const moduleTypeEnum = z.enum([
  'med_device',      // Medical Device and Diagnostics module
  'cmc_wizard',      // Chemistry Manufacturing Controls module
  'trial_sage',      // TrialSage Vault module
  'study_architect', // Study Architect module
  'ectd_coauthor'    // eCTD Co-author module
]);

/**
 * Document table for tracking unified documents across modules
 */
export const unifiedDocuments = pgTable('unified_documents', {
  id: serial('id').primaryKey(),
  moduleType: text('module_type').notNull(),
  originalDocumentId: text('original_document_id').notNull(),
  title: text('title').notNull(),
  documentType: text('document_type').notNull(),
  metadata: jsonb('metadata'),
  content: jsonb('content'),
  vaultFolderId: integer('vault_folder_id'),
  organizationId: integer('organization_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: integer('created_by').notNull(),
  updatedBy: integer('updated_by').notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull()
}, (table) => {
  return {
    // Ensure we can't have duplicate documents from the same module
    moduleDocumentIdx: uniqueIndex('module_document_idx').on(
      table.moduleType, 
      table.originalDocumentId,
      table.organizationId
    )
  };
});

/**
 * Workflow templates for different module types
 */
export const workflowTemplates = pgTable('workflow_templates', {
  id: serial('id').primaryKey(),
  moduleType: text('module_type').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  steps: jsonb('steps').notNull(), // Array of steps {name, description, role}
  organizationId: integer('organization_id').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: integer('created_by').notNull()
});

/**
 * Document workflows for tracking approval status
 */
export const documentWorkflows = pgTable('document_workflows', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').notNull().references(() => unifiedDocuments.id),
  templateId: integer('template_id').notNull().references(() => workflowTemplates.id),
  status: text('status').notNull().default('pending'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  createdBy: integer('created_by').notNull(),
  templateName: text('template_name'),
  templateSteps: jsonb('template_steps')
});

/**
 * Workflow approvals for each step in a workflow
 */
export const workflowApprovals = pgTable('workflow_approvals', {
  id: serial('id').primaryKey(),
  workflowId: integer('workflow_id').notNull().references(() => documentWorkflows.id),
  stepIndex: integer('step_index').notNull(),
  stepName: text('step_name'),
  description: text('description'),
  status: text('status').notNull().default('pending'),
  assignedTo: integer('assigned_to'),
  assignedBy: integer('assigned_by'),
  assignedAt: timestamp('assigned_at'),
  approvedBy: integer('approved_by'),
  approvedAt: timestamp('approved_at'),
  comments: text('comments'),
  evidence: jsonb('evidence')
}, (table) => {
  return {
    // Ensure we don't have duplicate approvals for the same step
    workflowStepIdx: uniqueIndex('workflow_step_idx').on(
      table.workflowId, 
      table.stepIndex
    )
  };
});

/**
 * Workflow audit log for tracking all actions
 */
export const workflowAuditLog = pgTable('workflow_audit_log', {
  id: serial('id').primaryKey(),
  workflowId: integer('workflow_id').notNull().references(() => documentWorkflows.id),
  action: text('action').notNull(),
  userId: integer('user_id').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  details: text('details'),
  metadata: jsonb('metadata')
});

/**
 * Insert schemas for each table
 */
export const insertUnifiedDocumentSchema = createInsertSchema(unifiedDocuments)
  .omit({ id: true, createdAt: true, updatedAt: true, isDeleted: true });

export const insertWorkflowTemplateSchema = createInsertSchema(workflowTemplates)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertDocumentWorkflowSchema = createInsertSchema(documentWorkflows)
  .omit({ id: true, createdAt: true, updatedAt: true, completedAt: true });

export const insertWorkflowApprovalSchema = createInsertSchema(workflowApprovals)
  .omit({ id: true, approvedAt: true, assignedAt: true });

export const insertWorkflowAuditLogSchema = createInsertSchema(workflowAuditLog)
  .omit({ id: true, timestamp: true });

/**
 * Helper types
 */
export type UnifiedDocument = typeof unifiedDocuments.$inferSelect;
export type InsertUnifiedDocument = z.infer<typeof insertUnifiedDocumentSchema>;

export type WorkflowTemplate = typeof workflowTemplates.$inferSelect;
export type InsertWorkflowTemplate = z.infer<typeof insertWorkflowTemplateSchema>;

export type DocumentWorkflow = typeof documentWorkflows.$inferSelect;
export type InsertDocumentWorkflow = z.infer<typeof insertDocumentWorkflowSchema>;

export type WorkflowApproval = typeof workflowApprovals.$inferSelect;
export type InsertWorkflowApproval = z.infer<typeof insertWorkflowApprovalSchema>;

export type WorkflowAuditLog = typeof workflowAuditLog.$inferSelect;
export type InsertWorkflowAuditLog = z.infer<typeof insertWorkflowAuditLogSchema>;