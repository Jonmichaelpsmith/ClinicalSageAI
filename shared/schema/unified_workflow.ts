/**
 * Unified Document Workflow Database Schema
 * 
 * This schema defines the tables and relationships for the unified document workflow system
 * that integrates all module-specific documents into a centralized workflow.
 */

import { pgTable, serial, text, timestamp, integer, json, varchar, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Unified Documents Table
 * 
 * Centralized table for tracking all documents across all modules
 */
export const unifiedDocuments = pgTable('unified_documents', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  documentType: varchar('document_type', { length: 100 }).notNull(),
  organizationId: integer('organization_id').notNull(),
  createdBy: integer('created_by').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  latestVersion: integer('latest_version').default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Document Versions Table
 * 
 * Tracks all versions of each document
 */
export const documentVersions = pgTable('document_versions', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').notNull().references(() => unifiedDocuments.id),
  versionNumber: integer('version_number').notNull(),
  createdBy: integer('created_by').notNull(),
  content: json('content'),
  changeDescription: text('change_description'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

/**
 * Module Documents Table
 * 
 * Links unified documents to their module-specific references
 */
export const moduleDocuments = pgTable('module_documents', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').notNull().references(() => unifiedDocuments.id),
  moduleType: varchar('module_type', { length: 50 }).notNull(), // e.g., 'cer', '510k', 'csr', 'ind'
  originalId: varchar('original_id', { length: 255 }).notNull(), // Original ID in the source module
  organizationId: integer('organization_id').notNull(),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Workflow Templates Table
 * 
 * Defines reusable workflow templates for documents
 */
export const workflowTemplates = pgTable('workflow_templates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  moduleType: varchar('module_type', { length: 50 }).notNull(), // e.g., 'cer', '510k', 'csr', 'ind'
  organizationId: integer('organization_id').notNull(),
  createdBy: integer('created_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Workflow Template Steps Table
 * 
 * Defines the steps in a workflow template
 */
export const workflowTemplateSteps = pgTable('workflow_template_steps', {
  id: serial('id').primaryKey(),
  templateId: integer('template_id').notNull().references(() => workflowTemplates.id),
  stepName: varchar('step_name', { length: 255 }).notNull(),
  stepDescription: text('step_description'),
  stepOrder: integer('step_order').notNull(),
  approvalRole: varchar('approval_role', { length: 100 }).notNull(), // e.g., 'regulatory_reviewer', 'qa_approver'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Document Workflows Table
 * 
 * Tracks active workflows for documents
 */
export const documentWorkflows = pgTable('document_workflows', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').notNull().references(() => unifiedDocuments.id),
  templateId: integer('template_id').notNull().references(() => workflowTemplates.id),
  startedBy: integer('started_by').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('active'), // 'active', 'completed', 'rejected'
  metadata: json('metadata'),
  completedAt: timestamp('completed_at'),
  rejectedAt: timestamp('rejected_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Workflow Approvals Table
 * 
 * Tracks approval steps for workflows
 */
export const workflowApprovals = pgTable('workflow_approvals', {
  id: serial('id').primaryKey(),
  workflowId: integer('workflow_id').notNull().references(() => documentWorkflows.id),
  stepId: integer('step_id').notNull().references(() => workflowTemplateSteps.id),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending', 'approved', 'rejected'
  approvedBy: integer('approved_by'),
  approvedAt: timestamp('approved_at'),
  rejectedBy: integer('rejected_by'),
  rejectedAt: timestamp('rejected_at'),
  comments: text('comments'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Document Audit Logs Table
 * 
 * Tracks all activities on documents
 */
export const documentAuditLogs = pgTable('document_audit_logs', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').notNull().references(() => unifiedDocuments.id),
  userId: integer('user_id').notNull(),
  action: varchar('action', { length: 100 }).notNull(), // e.g., 'create', 'update', 'approve', 'reject'
  details: json('details'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

/**
 * Document Attachments Table
 * 
 * Tracks files attached to documents
 */
export const documentAttachments = pgTable('document_attachments', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').notNull().references(() => unifiedDocuments.id),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileType: varchar('file_type', { length: 100 }).notNull(),
  filePath: varchar('file_path', { length: 1000 }).notNull(),
  fileSize: integer('file_size').notNull(),
  uploadedBy: integer('uploaded_by').notNull(),
  isPublic: boolean('is_public').default(false),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Document Comments Table
 * 
 * Tracks comments on documents
 */
export const documentComments = pgTable('document_comments', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').notNull().references(() => unifiedDocuments.id),
  userId: integer('user_id').notNull(),
  comment: text('comment').notNull(),
  isResolved: boolean('is_resolved').default(false),
  parentId: integer('parent_id').references(() => documentComments.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Document Relationships Table
 * 
 * Defines relationships between documents
 */
export const documentRelationships = pgTable('document_relationships', {
  id: serial('id').primaryKey(),
  sourceDocumentId: integer('source_document_id').notNull().references(() => unifiedDocuments.id),
  targetDocumentId: integer('target_document_id').notNull().references(() => unifiedDocuments.id),
  relationshipType: varchar('relationship_type', { length: 100 }).notNull(), // e.g., 'references', 'includes', 'supersedes'
  metadata: json('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Relations definitions
export const unifiedDocumentsRelations = relations(unifiedDocuments, ({ many }) => ({
  versions: many(documentVersions),
  moduleReferences: many(moduleDocuments),
  workflows: many(documentWorkflows),
  attachments: many(documentAttachments),
  comments: many(documentComments),
  auditLogs: many(documentAuditLogs),
  sourceRelationships: many(documentRelationships, { relationName: 'sourceDocuments' }),
  targetRelationships: many(documentRelationships, { relationName: 'targetDocuments' })
}));

export const documentVersionsRelations = relations(documentVersions, ({ one }) => ({
  document: one(unifiedDocuments, {
    fields: [documentVersions.documentId],
    references: [unifiedDocuments.id]
  })
}));

export const moduleDocumentsRelations = relations(moduleDocuments, ({ one }) => ({
  document: one(unifiedDocuments, {
    fields: [moduleDocuments.documentId],
    references: [unifiedDocuments.id]
  })
}));

export const workflowTemplatesRelations = relations(workflowTemplates, ({ many }) => ({
  steps: many(workflowTemplateSteps),
  workflows: many(documentWorkflows)
}));

export const workflowTemplateStepsRelations = relations(workflowTemplateSteps, ({ one, many }) => ({
  template: one(workflowTemplates, {
    fields: [workflowTemplateSteps.templateId],
    references: [workflowTemplates.id]
  }),
  approvals: many(workflowApprovals)
}));

export const documentWorkflowsRelations = relations(documentWorkflows, ({ one, many }) => ({
  document: one(unifiedDocuments, {
    fields: [documentWorkflows.documentId],
    references: [unifiedDocuments.id]
  }),
  template: one(workflowTemplates, {
    fields: [documentWorkflows.templateId],
    references: [workflowTemplates.id]
  }),
  approvals: many(workflowApprovals)
}));

export const workflowApprovalsRelations = relations(workflowApprovals, ({ one }) => ({
  workflow: one(documentWorkflows, {
    fields: [workflowApprovals.workflowId],
    references: [documentWorkflows.id]
  }),
  step: one(workflowTemplateSteps, {
    fields: [workflowApprovals.stepId],
    references: [workflowTemplateSteps.id]
  })
}));

export const documentAuditLogsRelations = relations(documentAuditLogs, ({ one }) => ({
  document: one(unifiedDocuments, {
    fields: [documentAuditLogs.documentId],
    references: [unifiedDocuments.id]
  })
}));

export const documentAttachmentsRelations = relations(documentAttachments, ({ one }) => ({
  document: one(unifiedDocuments, {
    fields: [documentAttachments.documentId],
    references: [unifiedDocuments.id]
  })
}));

export const documentCommentsRelations = relations(documentComments, ({ one, many }) => ({
  document: one(unifiedDocuments, {
    fields: [documentComments.documentId],
    references: [unifiedDocuments.id]
  }),
  parent: one(documentComments, {
    fields: [documentComments.parentId],
    references: [documentComments.id]
  }),
  replies: many(documentComments, { relationName: 'replies' })
}));

export const documentRelationshipsRelations = relations(documentRelationships, ({ one }) => ({
  sourceDocument: one(unifiedDocuments, {
    fields: [documentRelationships.sourceDocumentId],
    references: [unifiedDocuments.id],
    relationName: 'sourceDocuments'
  }),
  targetDocument: one(unifiedDocuments, {
    fields: [documentRelationships.targetDocumentId],
    references: [unifiedDocuments.id],
    relationName: 'targetDocuments'
  })
}));

// Zod schemas for inserting data
export const insertUnifiedDocumentSchema = createInsertSchema(unifiedDocuments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDocumentVersionSchema = createInsertSchema(documentVersions).omit({ id: true, createdAt: true });
export const insertModuleDocumentSchema = createInsertSchema(moduleDocuments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWorkflowTemplateSchema = createInsertSchema(workflowTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWorkflowTemplateStepSchema = createInsertSchema(workflowTemplateSteps).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDocumentWorkflowSchema = createInsertSchema(documentWorkflows).omit({ id: true, createdAt: true, updatedAt: true, completedAt: true, rejectedAt: true });
export const insertWorkflowApprovalSchema = createInsertSchema(workflowApprovals).omit({ id: true, createdAt: true, updatedAt: true, approvedBy: true, approvedAt: true, rejectedBy: true, rejectedAt: true });
export const insertDocumentAuditLogSchema = createInsertSchema(documentAuditLogs).omit({ id: true, createdAt: true });
export const insertDocumentAttachmentSchema = createInsertSchema(documentAttachments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDocumentCommentSchema = createInsertSchema(documentComments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDocumentRelationshipSchema = createInsertSchema(documentRelationships).omit({ id: true, createdAt: true });

// TypeScript types for inserting data
export type InsertUnifiedDocument = z.infer<typeof insertUnifiedDocumentSchema>;
export type InsertDocumentVersion = z.infer<typeof insertDocumentVersionSchema>;
export type InsertModuleDocument = z.infer<typeof insertModuleDocumentSchema>;
export type InsertWorkflowTemplate = z.infer<typeof insertWorkflowTemplateSchema>;
export type InsertWorkflowTemplateStep = z.infer<typeof insertWorkflowTemplateStepSchema>;
export type InsertDocumentWorkflow = z.infer<typeof insertDocumentWorkflowSchema>;
export type InsertWorkflowApproval = z.infer<typeof insertWorkflowApprovalSchema>;
export type InsertDocumentAuditLog = z.infer<typeof insertDocumentAuditLogSchema>;
export type InsertDocumentAttachment = z.infer<typeof insertDocumentAttachmentSchema>;
export type InsertDocumentComment = z.infer<typeof insertDocumentCommentSchema>;
export type InsertDocumentRelationship = z.infer<typeof insertDocumentRelationshipSchema>;

// TypeScript types for selecting data
export type UnifiedDocument = typeof unifiedDocuments.$inferSelect;
export type DocumentVersion = typeof documentVersions.$inferSelect;
export type ModuleDocument = typeof moduleDocuments.$inferSelect;
export type WorkflowTemplate = typeof workflowTemplates.$inferSelect;
export type WorkflowTemplateStep = typeof workflowTemplateSteps.$inferSelect;
export type DocumentWorkflow = typeof documentWorkflows.$inferSelect;
export type WorkflowApproval = typeof workflowApprovals.$inferSelect;
export type DocumentAuditLog = typeof documentAuditLogs.$inferSelect;
export type DocumentAttachment = typeof documentAttachments.$inferSelect;
export type DocumentComment = typeof documentComments.$inferSelect;
export type DocumentRelationship = typeof documentRelationships.$inferSelect;