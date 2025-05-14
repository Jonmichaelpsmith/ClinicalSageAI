/**
 * Unified Workflow Schema
 * 
 * This file defines the database schema for the unified document workflow system
 * that enables cross-module document approvals and tracking.
 */

import { z } from 'zod';
import { pgTable, text, timestamp, boolean, integer, serial, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

/**
 * Available module types in the system
 */
export const moduleTypeEnum = z.enum([
  'med_device',    // Medical Device module
  'cmc_wizard',    // Chemistry, Manufacturing, and Controls module
  'trial_sage',    // Clinical Trial module
  'study_architect', // Study Design module
  'ectd_coauthor'  // eCTD Co-author module
]);

/**
 * Document table for tracking unified documents across modules
 */
export const unifiedDocuments = pgTable('unified_documents', {
  id: serial('id').primaryKey(),
  moduleType: text('module_type').notNull(),
  originalDocumentId: text('original_document_id').notNull(),
  title: text('title').notNull(),
  documentType: text('document_type').notNull(), // 510k, CER, etc.
  metadata: jsonb('metadata').default({}),
  content: jsonb('content'),
  vaultFolderId: integer('vault_folder_id'),
  organizationId: integer('organization_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: integer('created_by').notNull(),
  updatedBy: integer('updated_by').notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
});

/**
 * Workflow templates for different module types
 */
export const workflowTemplates = pgTable('workflow_templates', {
  id: serial('id').primaryKey(),
  moduleType: text('module_type').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  steps: jsonb('steps').notNull(), // Array of step configurations with roles and requirements
  organizationId: integer('organization_id').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: integer('created_by').notNull(),
  updatedBy: integer('updated_by').notNull(),
});

/**
 * Document workflows for tracking approval status
 */
export const documentWorkflows = pgTable('document_workflows', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').notNull(),
  templateId: integer('template_id').notNull(),
  status: text('status').notNull().default('pending'), // pending, in_progress, approved, rejected, review_needed
  metadata: jsonb('metadata').default({}),
  templateName: text('template_name').notNull(),
  templateSteps: jsonb('template_steps').notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: integer('created_by').notNull(),
});

/**
 * Workflow approvals for each step in a workflow
 */
export const workflowApprovals = pgTable('workflow_approvals', {
  id: serial('id').primaryKey(),
  workflowId: integer('workflow_id').notNull(),
  stepIndex: integer('step_index').notNull(),
  stepName: text('step_name'),
  description: text('description'),
  status: text('status').notNull().default('pending'), // pending, approved, rejected
  assignedTo: integer('assigned_to'),
  assignedBy: integer('assigned_by'),
  assignedAt: timestamp('assigned_at'),
  approvedBy: integer('approved_by'),
  approvedAt: timestamp('approved_at'),
  comments: text('comments'),
});

/**
 * Workflow audit log for tracking all actions
 */
export const workflowAuditLog = pgTable('workflow_audit_log', {
  id: serial('id').primaryKey(),
  workflowId: integer('workflow_id').notNull(),
  action: text('action').notNull(), // workflow_created, step_approved, step_rejected, etc.
  userId: integer('user_id').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  details: text('details'),
  metadata: jsonb('metadata'),
});

/**
 * Insert schemas for each table
 */
export const insertUnifiedDocumentSchema = createInsertSchema(unifiedDocuments);
export type InsertUnifiedDocument = z.infer<typeof insertUnifiedDocumentSchema>;
export type UnifiedDocument = typeof unifiedDocuments.$inferSelect;

export const insertWorkflowTemplateSchema = createInsertSchema(workflowTemplates);
export type InsertWorkflowTemplate = z.infer<typeof insertWorkflowTemplateSchema>;
export type WorkflowTemplate = typeof workflowTemplates.$inferSelect;

export const insertDocumentWorkflowSchema = createInsertSchema(documentWorkflows);
export type InsertDocumentWorkflow = z.infer<typeof insertDocumentWorkflowSchema>;
export type DocumentWorkflow = typeof documentWorkflows.$inferSelect;

export const insertWorkflowApprovalSchema = createInsertSchema(workflowApprovals);
export type InsertWorkflowApproval = z.infer<typeof insertWorkflowApprovalSchema>;
export type WorkflowApproval = typeof workflowApprovals.$inferSelect;

export const insertWorkflowAuditLogSchema = createInsertSchema(workflowAuditLog);
export type InsertWorkflowAuditLog = z.infer<typeof insertWorkflowAuditLogSchema>;
export type WorkflowAuditLog = typeof workflowAuditLog.$inferSelect;