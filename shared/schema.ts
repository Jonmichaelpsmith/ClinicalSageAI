/**
 * Shared Database Schema
 * 
 * This file defines the database schema for the application,
 * including all tables, relationships, and types.
 * 
 * Multi-tenant architecture with two levels:
 * 1. Organizations (top-level tenants)
 * 2. ClientWorkspaces (sub-tenants under an organization)
 */
import { relations, InferSelectModel } from 'drizzle-orm';
import { 
  integer, pgTable, serial, text, timestamp, boolean, 
  uuid, json, unique, primaryKey, varchar, pgEnum
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Organizations (Tenants) Table
 * 
 * This is the root table for the multi-tenant system.
 * Each organization represents a separate tenant with isolated data.
 */
export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  domain: text('domain'),
  logo: text('logo'),
  settings: json('settings'),
  apiKey: text('api_key').unique(),
  tier: text('tier').default('standard').notNull(), // standard, professional, enterprise
  status: text('status').default('active').notNull(), // active, inactive, suspended
  maxUsers: integer('max_users').default(5),
  maxProjects: integer('max_projects').default(10),
  maxStorage: integer('max_storage').default(5), // in GB
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Organization Insert Schema
export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Organization Types
export type Organization = InferSelectModel<typeof organizations>;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

/**
 * ClientWorkspaces Table
 * 
 * Represents client workspaces within an organization.
 * For CRO use case: different clients that the CRO works with.
 * For Biotech: could be different divisions or product lines.
 */
export const clientWorkspaces = pgTable('client_workspaces', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  logo: text('logo'),
  status: text('status').default('active').notNull(), // active, inactive, archived
  quotaProjects: integer('quota_projects').default(5), // Project quota for this client
  quotaStorage: integer('quota_storage').default(1), // Storage quota in GB
  contactName: text('contact_name'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  industry: text('industry'),
  settings: json('settings'),
  metadata: json('metadata'),
  createdById: integer('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    uniqueOrgSlug: unique('unique_org_slug').on(table.organizationId, table.slug),
  };
});

// Client Workspace Insert Schema
export const insertClientWorkspaceSchema = createInsertSchema(clientWorkspaces).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Client Workspace Types
export type ClientWorkspace = InferSelectModel<typeof clientWorkspaces>;
export type InsertClientWorkspace = z.infer<typeof insertClientWorkspaceSchema>;

/**
 * Client Access (User-Client Workspace Junction Table)
 * 
 * Maps users to client workspaces with role information.
 * Similar to organizationUsers but for the client workspace level.
 */
export const clientAccess = pgTable('client_access', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  clientWorkspaceId: integer('client_workspace_id').notNull().references(() => clientWorkspaces.id),
  userId: integer('user_id').notNull().references(() => users.id),
  role: text('role').default('viewer').notNull(), // admin, member, viewer
  permissions: json('permissions'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    uniqueUserClient: unique('unique_user_client').on(table.userId, table.clientWorkspaceId),
  };
});

// Client Access Insert Schema
export const insertClientAccessSchema = createInsertSchema(clientAccess).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Client Access Types
export type ClientAccess = InferSelectModel<typeof clientAccess>;
export type InsertClientAccess = z.infer<typeof insertClientAccessSchema>;

/**
 * Users Table
 * 
 * Represents users in the system.
 * Each user belongs to one or more organizations.
 */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  title: text('title'),
  department: text('department'),
  avatar: text('avatar'),
  bio: text('bio'),
  status: text('status').default('active').notNull(), // active, inactive, suspended
  lastLogin: timestamp('last_login'),
  defaultOrganizationId: integer('default_organization_id').references(() => organizations.id),
  preferences: json('preferences'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User Insert Schema
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// User Types
export type User = InferSelectModel<typeof users>;
export type InsertUser = z.infer<typeof insertUserSchema>;

/**
 * Organization Users (Junction Table)
 * 
 * Maps users to organizations with role information.
 */
export const organizationUsers = pgTable('organization_users', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  userId: integer('user_id').notNull().references(() => users.id),
  role: text('role').default('member').notNull(), // admin, manager, member, viewer
  permissions: json('permissions'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    uniqueUserOrg: unique('unique_user_org').on(table.userId, table.organizationId),
  };
});

// Organization User Insert Schema
export const insertOrganizationUserSchema = createInsertSchema(organizationUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Organization User Types
export type OrganizationUser = InferSelectModel<typeof organizationUsers>;
export type InsertOrganizationUser = z.infer<typeof insertOrganizationUserSchema>;

/**
 * CER Projects Table
 * 
 * Stores CER (Clinical Evaluation Report) projects.
 * Each project belongs to an organization (tenant).
 */
export const cerProjects = pgTable('cer_projects', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  clientWorkspaceId: integer('client_workspace_id').references(() => clientWorkspaces.id),
  name: text('name').notNull(),
  deviceName: text('device_name').notNull(),
  deviceManufacturer: text('device_manufacturer').notNull(),
  deviceType: text('device_type'),
  deviceClass: text('device_class'),
  regulatoryContext: text('regulatory_context'), // MDR, IVDR, FDA, etc.
  description: text('description'),
  status: text('status').default('draft').notNull(), // draft, in-progress, review, approved, published
  version: text('version').default('1.0.0'),
  createdById: integer('created_by_id').references(() => users.id),
  assignedToId: integer('assigned_to_id').references(() => users.id),
  dueDate: timestamp('due_date'),
  startDate: timestamp('start_date'),
  completionDate: timestamp('completion_date'),
  reviewDate: timestamp('review_date'),
  qmpId: integer('qmp_id'), // Reference to Quality Management Plan
  settings: json('settings'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// CER Project Insert Schema
export const insertCerProjectSchema = createInsertSchema(cerProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// CER Project Types
export type CerProject = InferSelectModel<typeof cerProjects>;
export type InsertCerProject = z.infer<typeof insertCerProjectSchema>;

/**
 * Project Documents Table
 * 
 * Stores document references for CER projects with VAULT integration hooks.
 */
export const projectDocuments = pgTable('project_documents', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  projectId: integer('project_id').notNull().references(() => cerProjects.id),
  vaultDocumentId: uuid('vault_document_id'), // Reference to document in VAULT
  name: text('name').notNull(),
  type: text('type').notNull(), // protocol, report, publication, etc.
  category: text('category'), // literature, clinical-investigation, post-market, etc.
  status: text('status').default('draft').notNull(), // draft, in-review, approved, published
  version: text('version').default('1.0.0'),
  filePath: text('file_path'),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'),
  checksum: text('checksum'),
  uploadedById: integer('uploaded_by_id').references(() => users.id),
  metaData: json('meta_data'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Project Document Insert Schema
export const insertProjectDocumentSchema = createInsertSchema(projectDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Project Document Types
export type ProjectDocument = InferSelectModel<typeof projectDocuments>;
export type InsertProjectDocument = z.infer<typeof insertProjectDocumentSchema>;

/**
 * Project Activities Table
 * 
 * Tracks activities and changes within a CER project for audit trail purposes.
 */
export const projectActivities = pgTable('project_activities', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  projectId: integer('project_id').notNull().references(() => cerProjects.id),
  userId: integer('user_id').references(() => users.id),
  activityType: text('activity_type').notNull(), // create, update, delete, review, approve, etc.
  entityType: text('entity_type').notNull(), // project, document, section, etc.
  entityId: text('entity_id').notNull(), // ID of the entity affected
  description: text('description').notNull(),
  details: json('details'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Project Activity Insert Schema
export const insertProjectActivitySchema = createInsertSchema(projectActivities).omit({
  id: true,
  createdAt: true
});

// Project Activity Types
export type ProjectActivity = InferSelectModel<typeof projectActivities>;
export type InsertProjectActivity = z.infer<typeof insertProjectActivitySchema>;

/**
 * Project Milestones Table
 * 
 * Tracks important milestones and deadlines for CER projects.
 */
export const projectMilestones = pgTable('project_milestones', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  projectId: integer('project_id').notNull().references(() => cerProjects.id),
  name: text('name').notNull(),
  description: text('description'),
  dueDate: timestamp('due_date').notNull(),
  completedAt: timestamp('completed_at'),
  completedById: integer('completed_by_id').references(() => users.id),
  status: text('status').default('pending').notNull(), // pending, in-progress, completed, missed
  priority: text('priority').default('medium').notNull(), // low, medium, high, critical
  notifyDays: integer('notify_days').default(7), // Days before due date to send notification
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Project Milestone Insert Schema
export const insertProjectMilestoneSchema = createInsertSchema(projectMilestones).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Project Milestone Types
export type ProjectMilestone = InferSelectModel<typeof projectMilestones>;
export type InsertProjectMilestone = z.infer<typeof insertProjectMilestoneSchema>;

/**
 * Client User Permissions Table
 * 
 * Defines fine-grained permissions for users on specific projects.
 */
export const clientUserPermissions = pgTable('client_user_permissions', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  userId: integer('user_id').notNull().references(() => users.id),
  projectId: integer('project_id').references(() => cerProjects.id),
  // If projectId is null, permissions apply to all projects in the organization
  permissions: json('permissions').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    uniqueUserProject: unique('unique_user_project').on(table.userId, table.projectId),
  };
});

// Client User Permission Insert Schema
export const insertClientUserPermissionSchema = createInsertSchema(clientUserPermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Client User Permission Types
export type ClientUserPermission = InferSelectModel<typeof clientUserPermissions>;
export type InsertClientUserPermission = z.infer<typeof insertClientUserPermissionSchema>;

// Define table relationships
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(organizationUsers),
  cerProjects: many(cerProjects),
  projects: many(projects),
  clientWorkspaces: many(clientWorkspaces),
  projectTemplates: many(projectTemplates),
}));

export const usersRelations = relations(users, ({ many }) => ({
  organizations: many(organizationUsers),
  permissions: many(clientUserPermissions),
  clientAccess: many(clientAccess),
}));

export const cerProjectsRelations = relations(cerProjects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [cerProjects.organizationId],
    references: [organizations.id],
  }),
  clientWorkspace: one(clientWorkspaces, {
    fields: [cerProjects.clientWorkspaceId],
    references: [clientWorkspaces.id],
  }),
  documents: many(projectDocuments),
  activities: many(projectActivities),
  milestones: many(projectMilestones),
  approvals: many(cerApprovals),
}));

export const projectDocumentsRelations = relations(projectDocuments, ({ one }) => ({
  project: one(cerProjects, {
    fields: [projectDocuments.projectId],
    references: [cerProjects.id],
  }),
  organization: one(organizations, {
    fields: [projectDocuments.organizationId],
    references: [organizations.id],
  }),
}));

export const projectActivitiesRelations = relations(projectActivities, ({ one }) => ({
  project: one(cerProjects, {
    fields: [projectActivities.projectId],
    references: [cerProjects.id],
  }),
  organization: one(organizations, {
    fields: [projectActivities.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [projectActivities.userId],
    references: [users.id],
  }),
}));

/**
 * CER Approvals Table
 * 
 * Tracks approval workflow for CER documents and sections.
 */
export const cerApprovals = pgTable('cer_approvals', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  projectId: integer('project_id').notNull().references(() => cerProjects.id),
  documentId: integer('document_id').references(() => projectDocuments.id),
  sectionKey: text('section_key'),
  approvalType: text('approval_type').notNull(), // document, section, project
  status: text('status').default('pending').notNull(), // pending, approved, rejected
  requestedById: integer('requested_by_id').references(() => users.id),
  requestedAt: timestamp('requested_at').defaultNow().notNull(),
  approvedById: integer('approved_by_id').references(() => users.id),
  approvedAt: timestamp('approved_at'),
  rejectedById: integer('rejected_by_id').references(() => users.id),
  rejectedAt: timestamp('rejected_at'),
  comments: text('comments'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// CER Approval Insert Schema
export const insertCerApprovalSchema = createInsertSchema(cerApprovals).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// CER Approval Types
export type CerApproval = InferSelectModel<typeof cerApprovals>;
export type InsertCerApproval = z.infer<typeof insertCerApprovalSchema>;

/**
 * CER Documents Table
 * 
 * Represents documents associated with CER projects.
 */
export const cerDocuments = pgTable('cer_documents', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  cerProjectId: integer('cer_project_id').notNull().references(() => cerProjects.id),
  documentType: text('document_type').notNull(),
  title: text('title').notNull(),
  version: text('version').notNull(),
  status: text('status').notNull(),
  content: json('content'),
  metadata: json('metadata'),
  createdById: integer('created_by_id').references(() => users.id),
  updatedById: integer('updated_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// CER Document Insert Schema
export const insertCerDocumentSchema = createInsertSchema(cerDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// CER Document Types
export type CerDocument = InferSelectModel<typeof cerDocuments>;
export type InsertCerDocument = z.infer<typeof insertCerDocumentSchema>;

// CER Approvals Relations
export const cerApprovalsRelations = relations(cerApprovals, ({ one }) => ({
  organization: one(organizations, {
    fields: [cerApprovals.organizationId],
    references: [organizations.id],
  }),
  project: one(cerProjects, {
    fields: [cerApprovals.projectId],
    references: [cerProjects.id],
  }),
  document: one(cerDocuments, {
    fields: [cerApprovals.documentId],
    references: [cerDocuments.id],
  }),
  requestedBy: one(users, {
    fields: [cerApprovals.requestedById],
    references: [users.id],
  }),
  approvedBy: one(users, {
    fields: [cerApprovals.approvedById],
    references: [users.id],
  }),
  rejectedBy: one(users, {
    fields: [cerApprovals.rejectedById],
    references: [users.id],
  }),
}));

/**
 * Quality Management Plans Table
 * 
 * Stores quality management plans with tenant context.
 * Each QMP is associated with an organization and optionally a CER project.
 */
export const qualityManagementPlans = pgTable('quality_management_plans', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  clientWorkspaceId: integer('client_workspace_id').references(() => clientWorkspaces.id),
  name: text('name').notNull(),
  description: text('description'),
  version: text('version').default('1.0.0').notNull(),
  status: text('status').default('draft').notNull(), // draft, active, retired
  approvedById: integer('approved_by_id').references(() => users.id),
  approvedAt: timestamp('approved_at'),
  effectiveDate: timestamp('effective_date'),
  expiryDate: timestamp('expiry_date'),
  reviewFrequencyDays: integer('review_frequency_days').default(365),
  lastReviewDate: timestamp('last_review_date'),
  nextReviewDate: timestamp('next_review_date'),
  reviewReminderDays: integer('review_reminder_days').default(30),
  createdById: integer('created_by_id').references(() => users.id),
  settings: json('settings'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// QMP Insert Schema
export const insertQualityManagementPlanSchema = createInsertSchema(qualityManagementPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// QMP Types
export type QualityManagementPlan = InferSelectModel<typeof qualityManagementPlans>;
export type InsertQualityManagementPlan = z.infer<typeof insertQualityManagementPlanSchema>;

/**
 * QMP Audit Trail Table
 * 
 * Tracks changes to quality management plans for compliance and audit purposes.
 */
export const qmpAuditTrail = pgTable('qmp_audit_trail', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  qmpId: integer('qmp_id').notNull().references(() => qualityManagementPlans.id),
  userId: integer('user_id').references(() => users.id),
  actionType: text('action_type').notNull(), // create, update, approve, review, retire
  entityType: text('entity_type').notNull(), // qmp, ctq_factor, section_gate, etc.
  entityId: text('entity_id').notNull(),
  description: text('description').notNull(),
  previousState: json('previous_state'),
  newState: json('new_state'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// QMP Audit Trail Insert Schema
export const insertQmpAuditTrailSchema = createInsertSchema(qmpAuditTrail).omit({
  id: true,
  createdAt: true
});

// QMP Audit Trail Types
export type QmpAuditTrail = InferSelectModel<typeof qmpAuditTrail>;
export type InsertQmpAuditTrail = z.infer<typeof insertQmpAuditTrailSchema>;

/**
 * CTQ (Critical-to-Quality) Factors Table
 * 
 * Stores critical quality factors with risk-based categorization.
 */
export const ctqFactors = pgTable('ctq_factors', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  qmpId: integer('qmp_id').notNull().references(() => qualityManagementPlans.id),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(), // safety, efficacy, regulatory, clinical, etc.
  riskLevel: text('risk_level').notNull(), // high, medium, low
  applicableSection: text('applicable_section'), // benefit-risk, safety, equivalence, etc.
  validationCriteria: text('validation_criteria'),
  validationMethod: text('validation_method'),
  status: text('status').default('active').notNull(), // active, inactive
  requiresEvidenceType: text('requires_evidence_type'), // document, data, attestation, etc.
  requirementType: text('requirement_type').default('mandatory').notNull(), // mandatory, recommended, optional
  failureAction: text('failure_action').default('block').notNull(), // block, warning, notify
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// CTQ Factor Insert Schema
export const insertCtqFactorSchema = createInsertSchema(ctqFactors).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// CTQ Factor Types
export type CtqFactor = InferSelectModel<typeof ctqFactors>;
export type InsertCtqFactor = z.infer<typeof insertCtqFactorSchema>;

/**
 * QMP Section Gating Table
 * 
 * Controls which CTQ factors are required for each CER section.
 */
export const qmpSectionGating = pgTable('qmp_section_gating', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  qmpId: integer('qmp_id').notNull().references(() => qualityManagementPlans.id),
  sectionKey: text('section_key').notNull(), // benefit-risk, safety, equivalence, etc.
  sectionName: text('section_name').notNull(),
  requiredCtqFactorIds: json('required_ctq_factor_ids').notNull(), // Array of CTQ factor IDs
  minimumMandatoryCompletion: integer('minimum_mandatory_completion').default(100), // Percentage
  minimumRecommendedCompletion: integer('minimum_recommended_completion').default(80), // Percentage
  allowOverride: boolean('allow_override').default(false),
  overrideRequiresApproval: boolean('override_requires_approval').default(true),
  overrideRequiresReason: boolean('override_requires_reason').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// QMP Section Gating Insert Schema
export const insertQmpSectionGatingSchema = createInsertSchema(qmpSectionGating).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// QMP Section Gating Types
export type QmpSectionGating = InferSelectModel<typeof qmpSectionGating>;
export type InsertQmpSectionGating = z.infer<typeof insertQmpSectionGatingSchema>;

/**
 * QMP Traceability Matrix Table
 * 
 * Maps quality requirements to implementation evidence for traceability.
 */
export const qmpTraceabilityMatrix = pgTable('qmp_traceability_matrix', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  qmpId: integer('qmp_id').notNull().references(() => qualityManagementPlans.id),
  ctqFactorId: integer('ctq_factor_id').references(() => ctqFactors.id),
  requirementId: text('requirement_id').notNull(), // Unique ID for the requirement
  requirementText: text('requirement_text').notNull(),
  requirementSource: text('requirement_source'), // Regulation, standard, guidance, etc.
  verificationMethod: text('verification_method'), // Review, test, inspection, analysis
  implementationEvidence: json('implementation_evidence'), // References to documents, data, etc.
  verificationStatus: text('verification_status').default('pending').notNull(), // pending, verified, failed
  verifiedById: integer('verified_by_id').references(() => users.id),
  verifiedAt: timestamp('verified_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// QMP Traceability Matrix Insert Schema
export const insertQmpTraceabilityMatrixSchema = createInsertSchema(qmpTraceabilityMatrix).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// QMP Traceability Matrix Types
export type QmpTraceabilityMatrix = InferSelectModel<typeof qmpTraceabilityMatrix>;
export type InsertQmpTraceabilityMatrix = z.infer<typeof insertQmpTraceabilityMatrixSchema>;

// Additional relations for QMP tables
export const qualityManagementPlansRelations = relations(qualityManagementPlans, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [qualityManagementPlans.organizationId],
    references: [organizations.id],
  }),
  clientWorkspace: one(clientWorkspaces, {
    fields: [qualityManagementPlans.clientWorkspaceId],
    references: [clientWorkspaces.id],
  }),
  ctqFactors: many(ctqFactors),
  sectionGating: many(qmpSectionGating),
  auditTrail: many(qmpAuditTrail),
  traceabilityMatrix: many(qmpTraceabilityMatrix),
}));

export const ctqFactorsRelations = relations(ctqFactors, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [ctqFactors.organizationId],
    references: [organizations.id],
  }),
  qmp: one(qualityManagementPlans, {
    fields: [ctqFactors.qmpId],
    references: [qualityManagementPlans.id],
  }),
  traceabilityItems: many(qmpTraceabilityMatrix),
}));

// Update CER Projects relations to include QMP reference
export const cerProjectsQmpRelation = relations(cerProjects, ({ one }) => ({
  qmp: one(qualityManagementPlans, {
    fields: [cerProjects.qmpId],
    references: [qualityManagementPlans.id],
  }),
}));

/**
 * Document Folder Table
 * 
 * Represents a folder in the document management system.
 */
export const documentFolders = pgTable('document_folders', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  description: text('description'),
  parentId: integer('parent_id').references(() => documentFolders.id),
  path: text('path'),
  createdById: integer('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Document Folder Insert Schema
export const insertDocumentFolderSchema = createInsertSchema(documentFolders).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Document Folder Types
export type DocumentFolder = InferSelectModel<typeof documentFolders>;
export type InsertDocumentFolder = z.infer<typeof insertDocumentFolderSchema>;

/**
 * Documents Table
 * 
 * Represents a document in the system.
 */
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  folderId: integer('folder_id').references(() => documentFolders.id),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // report, protocol, publication, etc.
  status: text('status').default('draft').notNull(), // draft, review, approved, published
  version: text('version').default('1.0.0'),
  fileName: text('file_name'),
  fileType: text('file_type'),
  fileSize: integer('file_size'),
  filePath: text('file_path'),
  content: json('content'),
  metadata: json('metadata'),
  tags: text('tags').array(),
  createdById: integer('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Document Insert Schema
export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Document Types
export type Document = InferSelectModel<typeof documents>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

/**
 * Document Templates Table
 *
 * Stores reusable templates for document generation.
 */
export const documentTemplates = pgTable('document_templates', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  moduleSection: text('module_section').notNull(),
  description: text('description'),
  structure: json('structure'),
  domains: text('domains').array(),
  recommendedFor: text('recommended_for').array(),
  useCount: integer('use_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Document Template Insert Schema
export const insertDocumentTemplateSchema = createInsertSchema(documentTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Document Template Types
export type DocumentTemplate = InferSelectModel<typeof documentTemplates>;
export type InsertDocumentTemplate = z.infer<typeof insertDocumentTemplateSchema>;

/**
 * Projects Table
 * 
 * Core project entity that spans across all modules.
 * This is the central project record that can be linked to module-specific data.
 */
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  clientWorkspaceId: integer('client_workspace_id').notNull().references(() => clientWorkspaces.id),
  name: text('name').notNull(),
  code: text('code'), // Project code or identifier
  description: text('description'),
  status: text('status').default('planning').notNull(), // planning, active, on-hold, completed, archived
  priority: text('priority').default('medium').notNull(), // low, medium, high, critical
  type: text('type').notNull(), // research, clinical, regulatory, commercial, etc.
  startDate: timestamp('start_date'),
  targetEndDate: timestamp('target_end_date'),
  actualEndDate: timestamp('actual_end_date'),
  progress: integer('progress').default(0), // 0-100 percentage
  budget: integer('budget'),
  budgetCurrency: text('budget_currency').default('USD'),
  budgetStatus: text('budget_status').default('within-budget'), // within-budget, at-risk, over-budget
  createdById: integer('created_by_id').references(() => users.id),
  ownerId: integer('owner_id').references(() => users.id),
  sponsors: text('sponsors').array(), // List of sponsor IDs or names
  tags: text('tags').array(),
  criticalToQualityFactors: json('critical_to_quality_factors'), // CtQ factors array
  riskLevel: text('risk_level').default('medium'), // low, medium, high
  riskAssessment: json('risk_assessment'),
  qualityTargets: json('quality_targets'),
  moduleReferences: json('module_references'), // References to specific module instances
  settings: json('settings'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Project Insert Schema
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Project Types
export type Project = InferSelectModel<typeof projects>;
export type InsertProject = z.infer<typeof insertProjectSchema>;

/**
 * Project Modules Table
 * 
 * Associates projects with specific module instances.
 * Maps the central project to module-specific projects (CER, IND, etc.)
 */
export const projectModules = pgTable('project_modules', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => projects.id),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  clientWorkspaceId: integer('client_workspace_id').notNull().references(() => clientWorkspaces.id),
  moduleType: text('module_type').notNull(), // cer, ind, cmc, csr, vault, etc.
  moduleInstanceId: integer('module_instance_id').notNull(), // ID in the module's specific table
  status: text('status').default('active').notNull(), // active, inactive, completed
  settings: json('settings'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    uniqueProjectModule: unique('unique_project_module').on(
      table.projectId, table.moduleType, table.moduleInstanceId
    ),
  };
});

// Project Module Insert Schema
export const insertProjectModuleSchema = createInsertSchema(projectModules).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Project Module Types
export type ProjectModule = InferSelectModel<typeof projectModules>;
export type InsertProjectModule = z.infer<typeof insertProjectModuleSchema>;

/**
 * Project Workflow Stages Table
 * 
 * Defines workflow stages for projects with CtQ integration.
 */
export const projectWorkflowStages = pgTable('project_workflow_stages', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  projectId: integer('project_id').notNull().references(() => projects.id),
  name: text('name').notNull(),
  description: text('description'),
  order: integer('order').notNull(),
  status: text('status').default('pending').notNull(), // pending, in-progress, completed, blocked
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  dueDate: timestamp('due_date'),
  criticalToQualityFactors: json('critical_to_quality_factors'), // Stage-specific CtQ factors
  completionCriteria: json('completion_criteria'),
  autoAdvance: boolean('auto_advance').default(false),
  assignees: text('assignees').array(), // User IDs assigned to this stage
  reviewers: text('reviewers').array(), // User IDs who must review/approve
  approvalStatus: text('approval_status').default('not-started'), // not-started, pending, approved, rejected
  settings: json('settings'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Project Workflow Stage Insert Schema
export const insertProjectWorkflowStageSchema = createInsertSchema(projectWorkflowStages).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Project Workflow Stage Types
export type ProjectWorkflowStage = InferSelectModel<typeof projectWorkflowStages>;
export type InsertProjectWorkflowStage = z.infer<typeof insertProjectWorkflowStageSchema>;

/**
 * Project Tasks Table
 * 
 * Tasks associated with projects that span across modules.
 */
export const projectTasks = pgTable('project_tasks', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  projectId: integer('project_id').notNull().references(() => projects.id),
  workflowStageId: integer('workflow_stage_id').references(() => projectWorkflowStages.id),
  parentTaskId: integer('parent_task_id').references(() => projectTasks.id),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').default('todo').notNull(), // todo, in-progress, review, done, blocked
  priority: text('priority').default('medium').notNull(), // low, medium, high, urgent
  moduleType: text('module_type'), // If task is specific to a module
  assigneeId: integer('assignee_id').references(() => users.id),
  reviewerId: integer('reviewer_id').references(() => users.id),
  estimatedHours: integer('estimated_hours'),
  actualHours: integer('actual_hours'),
  startDate: timestamp('start_date'),
  dueDate: timestamp('due_date'),
  completedAt: timestamp('completed_at'),
  completedById: integer('completed_by_id').references(() => users.id),
  blockedReason: text('blocked_reason'),
  criticalToQuality: boolean('critical_to_quality').default(false),
  qualityMetrics: json('quality_metrics'),
  dependsOn: text('depends_on').array(), // IDs of tasks this depends on
  settings: json('settings'),
  metadata: json('metadata'),
  createdById: integer('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Project Task Insert Schema
export const insertProjectTaskSchema = createInsertSchema(projectTasks).omit({
  id: true, 
  createdAt: true,
  updatedAt: true
});

// Project Task Types
export type ProjectTask = InferSelectModel<typeof projectTasks>;
export type InsertProjectTask = z.infer<typeof insertProjectTaskSchema>;

/**
 * Project Templates Table
 * 
 * Templates for creating standardized projects with predefined workflows.
 */
export const projectTemplates = pgTable('project_templates', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  description: text('description'),
  projectType: text('project_type').notNull(), // research, clinical, regulatory, etc.
  moduleTypes: text('module_types').array(), // List of modules this template is for
  industryFocus: text('industry_focus').array(), // MedDevice, Biotech, Pharma, etc.
  version: text('version').default('1.0.0'),
  status: text('status').default('active').notNull(), // draft, active, archived
  workflowStages: json('workflow_stages'), // Predefined workflow stages
  tasks: json('tasks'), // Predefined task templates
  criticalToQualityFactors: json('critical_to_quality_factors'), // Default CtQ factors
  regulatoryFramework: text('regulatory_framework').array(), // MDR, IVDR, FDA, etc.
  settings: json('settings'),
  metadata: json('metadata'),
  createdById: integer('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Project Template Insert Schema
export const insertProjectTemplateSchema = createInsertSchema(projectTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Project Template Types
export type ProjectTemplate = InferSelectModel<typeof projectTemplates>;
export type InsertProjectTemplate = z.infer<typeof insertProjectTemplateSchema>;

// Define relationships for the new project tables
export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  clientWorkspace: one(clientWorkspaces, {
    fields: [projects.clientWorkspaceId],
    references: [clientWorkspaces.id],
  }),
  modules: many(projectModules),
  workflowStages: many(projectWorkflowStages),
  tasks: many(projectTasks),
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [projects.createdById],
    references: [users.id],
  }),
}));

export const projectModulesRelations = relations(projectModules, ({ one }) => ({
  project: one(projects, {
    fields: [projectModules.projectId],
    references: [projects.id],
  }),
  organization: one(organizations, {
    fields: [projectModules.organizationId],
    references: [organizations.id],
  }),
  clientWorkspace: one(clientWorkspaces, {
    fields: [projectModules.clientWorkspaceId],
    references: [clientWorkspaces.id],
  }),
}));

export const projectWorkflowStagesRelations = relations(projectWorkflowStages, ({ one, many }) => ({
  project: one(projects, {
    fields: [projectWorkflowStages.projectId],
    references: [projects.id],
  }),
  organization: one(organizations, {
    fields: [projectWorkflowStages.organizationId],
    references: [organizations.id],
  }),
  tasks: many(projectTasks, { relationName: 'stageTasks' }),
}));

export const projectTasksRelations = relations(projectTasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [projectTasks.projectId],
    references: [projects.id],
  }),
  organization: one(organizations, {
    fields: [projectTasks.organizationId],
    references: [organizations.id],
  }),
  workflowStage: one(projectWorkflowStages, {
    fields: [projectTasks.workflowStageId],
    references: [projectWorkflowStages.id],
    relationName: 'stageTasks',
  }),
  parentTask: one(projectTasks, {
    fields: [projectTasks.parentTaskId],
    references: [projectTasks.id],
  }),
  subtasks: many(projectTasks, { relationName: 'taskSubtasks' }),
  assignee: one(users, {
    fields: [projectTasks.assigneeId],
    references: [users.id],
  }),
  completer: one(users, {
    fields: [projectTasks.completedById],
    references: [users.id],
  }),
}));

/**
 * Regulatory Submissions Hub - Unified IND/eCTD Module
 * 
 * The following tables implement the unified regulatory submissions system
 * that combines IND and eCTD functionality in a single framework.
 */

/**
 * FDA 510(k) Submissions Module
 * 
 * Tables for managing FDA 510(k) submissions, device profiles,
 * predicate devices, and eSTAR packages.
 */

// 510(k) Project Status
export const fda510kStatusEnum = pgEnum('fda510k_status', [
  'draft', 'inReview', 'approved', 'submitted', 'cleared', 'notCleared'
]);

// 510(k) Section Status
export const fda510kSectionStatusEnum = pgEnum('fda510k_section_status', [
  'notStarted', 'inProgress', 'completed', 'approved'
]);

// 510(k) Project Table
export const fda510kProjects = pgTable('fda510k_projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  clientWorkspaceId: integer('client_workspace_id').references(() => clientWorkspaces.id),
  name: text('name').notNull(),
  deviceName: text('device_name').notNull(),
  deviceClass: text('device_class').notNull(),
  productCode: text('product_code'),
  regulationNumber: text('regulation_number'),
  submissionType: text('submission_type').default('Traditional'),
  status: fda510kStatusEnum('status').default('draft'),
  description: text('description'),
  createdById: integer('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  submittedAt: timestamp('submitted_at'),
  metadata: json('metadata').$type<Record<string, any>>()
});

// 510(k) Sections Table
export const fda510kSections = pgTable('fda510k_sections', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  projectId: uuid('project_id').notNull().references(() => fda510kProjects.id),
  name: text('name').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: fda510kSectionStatusEnum('status').default('notStarted'),
  sectionKey: text('section_key').notNull(),
  filePathDOCX: text('file_path_docx'),
  filePathPDF: text('file_path_pdf'),
  content: text('content'),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  metadata: json('metadata').$type<Record<string, any>>()
});

// 510(k) Predicate Devices Table
export const fda510kPredicateDevices = pgTable('fda510k_predicate_devices', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  projectId: uuid('project_id').notNull().references(() => fda510kProjects.id),
  deviceName: text('device_name').notNull(),
  manufacturer: text('manufacturer').notNull(),
  k510Number: text('k510_number'),
  productCode: text('product_code'),
  decisionDate: timestamp('decision_date'),
  primaryPredicate: boolean('primary_predicate').default(false),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  metadata: json('metadata').$type<Record<string, any>>()
});

// 510(k) Relations
export const fda510kProjectsRelations = relations(fda510kProjects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [fda510kProjects.organizationId],
    references: [organizations.id],
  }),
  clientWorkspace: one(clientWorkspaces, {
    fields: [fda510kProjects.clientWorkspaceId],
    references: [clientWorkspaces.id],
  }),
  creator: one(users, {
    fields: [fda510kProjects.createdById],
    references: [users.id],
  }),
  sections: many(fda510kSections),
  predicateDevices: many(fda510kPredicateDevices),
}));

export const fda510kSectionsRelations = relations(fda510kSections, ({ one }) => ({
  organization: one(organizations, {
    fields: [fda510kSections.organizationId],
    references: [organizations.id],
  }),
  project: one(fda510kProjects, {
    fields: [fda510kSections.projectId],
    references: [fda510kProjects.id],
  }),
}));

export const fda510kPredicateDevicesRelations = relations(fda510kPredicateDevices, ({ one }) => ({
  organization: one(organizations, {
    fields: [fda510kPredicateDevices.organizationId],
    references: [organizations.id],
  }),
  project: one(fda510kProjects, {
    fields: [fda510kPredicateDevices.projectId],
    references: [fda510kProjects.id],
  }),
}));

// Export types for FDA 510(k) tables
export type FDA510kProject = typeof fda510kProjects.$inferSelect;
export type FDA510kSection = typeof fda510kSections.$inferSelect;
export type FDA510kPredicateDevice = typeof fda510kPredicateDevices.$inferSelect;

// Insert schemas for FDA 510(k) tables
export const insertFDA510kProjectSchema = createInsertSchema(fda510kProjects)
  .omit({ id: true, createdAt: true, updatedAt: true, submittedAt: true });

export const insertFDA510kSectionSchema = createInsertSchema(fda510kSections)
  .omit({ id: true, createdAt: true, updatedAt: true, completedAt: true });

export const insertFDA510kPredicateDeviceSchema = createInsertSchema(fda510kPredicateDevices)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Insert types for FDA 510(k) tables
export type InsertFDA510kProject = z.infer<typeof insertFDA510kProjectSchema>;
export type InsertFDA510kSection = z.infer<typeof insertFDA510kSectionSchema>;
export type InsertFDA510kPredicateDevice = z.infer<typeof insertFDA510kPredicateDeviceSchema>;

// Enums for Regulatory Submissions
export const submissionTypeEnum = pgEnum('submission_type', [
  'IND', 'eCTD', 'NDA', 'BLA', 'ANDA', 'DMF'
]);

export const submissionStatusEnum = pgEnum('submission_status', [
  'active', 'archived', 'submitted'
]);

export const sequenceStatusEnum = pgEnum('sequence_status', [
  'draft', 'review', 'approved', 'submitted'
]);

export const moduleStatusEnum = pgEnum('module_status', [
  'incomplete', 'inProgress', 'complete'
]);

export const documentStatusEnum = pgEnum('document_status', [
  'draft', 'final', 'uploaded', 'locked'
]);

export const validationSeverityEnum = pgEnum('validation_severity', [
  'info', 'warning', 'error'
]);

/**
 * Submission Projects Table
 * 
 * Top-level table for regulatory submissions (IND/eCTD)
 */
export const submissionProjects = pgTable('submission_projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  clientWorkspaceId: integer('client_workspace_id').notNull().references(() => clientWorkspaces.id),
  name: varchar('name', { length: 255 }).notNull(),
  submissionType: submissionTypeEnum('submission_type').notNull(),
  status: submissionStatusEnum('submission_status').notNull().default('active'),
  fda21CfrPart11Enabled: boolean('fda_21_cfr_part_11_enabled').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  createdById: integer('created_by_id').notNull().references(() => users.id),
  lastModifiedById: integer('last_modified_by_id').notNull().references(() => users.id),
});

/**
 * Submission Sequences Table
 * 
 * Represents submission sequences (versions) within a submission project
 */
export const submissionSequences = pgTable('submission_sequences', {
  id: uuid('id').primaryKey().defaultRandom(),
  submissionProjectId: uuid('submission_project_id').notNull().references(() => submissionProjects.id, { onDelete: 'cascade' }),
  sequenceNumber: varchar('sequence_number', { length: 10 }).notNull(),
  description: text('description'),
  status: sequenceStatusEnum('status').notNull().default('draft'),
  submissionDate: timestamp('submission_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    seqNumberIndex: unique('idx_seq_project_number').on(
      table.submissionProjectId, 
      table.sequenceNumber
    )
  };
});

/**
 * Document Modules Table
 * 
 * Represents modules within the CTD structure (e.g., Module 1, Module 2, etc.)
 */
export const documentModules = pgTable('document_modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  submissionSequenceId: uuid('submission_sequence_id').notNull().references(() => submissionSequences.id, { onDelete: 'cascade' }),
  moduleType: varchar('module_type', { length: 50 }).notNull(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  status: moduleStatusEnum('status').notNull().default('incomplete'),
  compiledDocumentId: uuid('compiled_document_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Document Granules Table
 * 
 * Represents individual document components within modules
 */
export const documentGranules = pgTable('document_granules', {
  id: uuid('id').primaryKey().defaultRandom(),
  moduleId: uuid('module_id').notNull().references(() => documentModules.id, { onDelete: 'cascade' }),
  sequenceId: uuid('sequence_id').notNull().references(() => submissionSequences.id, { onDelete: 'cascade' }),
  path: varchar('path', { length: 1000 }).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  documentType: varchar('document_type', { length: 50 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  status: documentStatusEnum('status').notNull().default('draft'),
  isActive: boolean('is_active').notNull().default(true),
  isAppendix: boolean('is_appendix').notNull().default(false),
  currentVersionId: uuid('current_version_id'),
  metadataJson: json('metadata_json'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastModifiedById: integer('last_modified_by_id').notNull().references(() => users.id),
});

/**
 * Document Versions Table
 * 
 * Tracks versions of document granules
 */
export const documentVersions = pgTable('document_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  granuleId: uuid('granule_id').notNull().references(() => documentGranules.id, { onDelete: 'cascade' }),
  versionNumber: integer('version_number').notNull(),
  documentBlobId: uuid('document_blob_id').notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  status: documentStatusEnum('status').notNull().default('draft'),
  comment: text('comment'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdById: integer('created_by_id').notNull().references(() => users.id),
}, (table) => {
  return {
    versionIndex: unique('idx_granule_version_number').on(
      table.granuleId, 
      table.versionNumber
    )
  };
});

/**
 * Document Blobs Table
 * 
 * Stores actual document content (or references to external storage)
 */
export const documentBlobs = pgTable('document_blobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  vaultDocumentId: uuid('vault_document_id'), // Reference to VAULT for actual storage
  contentHash: varchar('content_hash', { length: 64 }).notNull(),
  size: integer('size').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * Compiled Documents Table
 * 
 * Tracks compiled document modules
 */
export const compiledDocuments = pgTable('compiled_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  moduleId: uuid('module_id').notNull().references(() => documentModules.id, { onDelete: 'cascade' }),
  compiledBlobId: uuid('compiled_blob_id').notNull().references(() => documentBlobs.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('compiling'),
  atomizedAt: timestamp('atomized_at'),
  componentsJson: json('components_json').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdById: integer('created_by_id').notNull().references(() => users.id),
});

/**
 * Validation Results Table
 * 
 * Stores validation issues for regulatory submissions
 */
export const validationResults = pgTable('validation_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  submissionSequenceId: uuid('submission_sequence_id').notNull().references(() => submissionSequences.id, { onDelete: 'cascade' }),
  moduleId: uuid('module_id').references(() => documentModules.id, { onDelete: 'cascade' }),
  granuleId: uuid('granule_id').references(() => documentGranules.id, { onDelete: 'cascade' }),
  validationType: varchar('validation_type', { length: 50 }).notNull(),
  severity: validationSeverityEnum('severity').notNull(),
  message: text('message').notNull(),
  locationPath: varchar('location_path', { length: 1000 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * Submission Events Table
 * 
 * Tracks all events for audit trail purposes
 */
export const submissionEvents = pgTable('submission_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  submissionProjectId: uuid('submission_project_id').notNull().references(() => submissionProjects.id, { onDelete: 'cascade' }),
  sequenceId: uuid('sequence_id').references(() => submissionSequences.id, { onDelete: 'cascade' }),
  moduleId: uuid('module_id').references(() => documentModules.id, { onDelete: 'cascade' }),
  granuleId: uuid('granule_id').references(() => documentGranules.id, { onDelete: 'cascade' }),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  details: json('details'),
  userId: integer('user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * Feature Toggles Table
 * 
 * Controls access to new features during migration
 */
export const featureToggles = pgTable('feature_toggles', {
  id: uuid('id').primaryKey().defaultRandom(),
  featureKey: varchar('feature_key', { length: 100 }).notNull().unique(),
  description: text('description'),
  enabled: boolean('enabled').notNull().default(false),
  enabledForOrganizationIds: json('enabled_for_organization_ids').default([]),
  enabledForClientWorkspaceIds: json('enabled_for_client_workspace_ids').default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Insert schemas for validation
export const insertSubmissionProjectSchema = createInsertSchema(submissionProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertSubmissionSequenceSchema = createInsertSchema(submissionSequences).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertDocumentModuleSchema = createInsertSchema(documentModules).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertDocumentGranuleSchema = createInsertSchema(documentGranules).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Type definitions
export type SubmissionProjectInsert = z.infer<typeof insertSubmissionProjectSchema>;
export type SubmissionProjectSelect = typeof submissionProjects.$inferSelect;

export type SubmissionSequenceInsert = z.infer<typeof insertSubmissionSequenceSchema>;
export type SubmissionSequenceSelect = typeof submissionSequences.$inferSelect;

export type DocumentModuleInsert = z.infer<typeof insertDocumentModuleSchema>;
export type DocumentModuleSelect = typeof documentModules.$inferSelect;

export type DocumentGranuleInsert = z.infer<typeof insertDocumentGranuleSchema>;
export type DocumentGranuleSelect = typeof documentGranules.$inferSelect;

// Relationships
export const submissionProjectsRelations = relations(submissionProjects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [submissionProjects.organizationId],
    references: [organizations.id],
  }),
  clientWorkspace: one(clientWorkspaces, {
    fields: [submissionProjects.clientWorkspaceId],
    references: [clientWorkspaces.id],
  }),
  sequences: many(submissionSequences),
  createdBy: one(users, {
    fields: [submissionProjects.createdById],
    references: [users.id],
  }),
  lastModifiedBy: one(users, {
    fields: [submissionProjects.lastModifiedById],
    references: [users.id],
  }),
}));

export const submissionSequencesRelations = relations(submissionSequences, ({ one, many }) => ({
  project: one(submissionProjects, {
    fields: [submissionSequences.submissionProjectId],
    references: [submissionProjects.id],
  }),
  modules: many(documentModules),
  granules: many(documentGranules),
  validationResults: many(validationResults),
}));

export const documentModulesRelations = relations(documentModules, ({ one, many }) => ({
  sequence: one(submissionSequences, {
    fields: [documentModules.submissionSequenceId],
    references: [submissionSequences.id],
  }),
  granules: many(documentGranules),
  compiledDocument: one(compiledDocuments, {
    fields: [documentModules.compiledDocumentId],
    references: [compiledDocuments.id],
  }),
}));

export const documentGranulesRelations = relations(documentGranules, ({ one, many }) => ({
  module: one(documentModules, {
    fields: [documentGranules.moduleId],
    references: [documentModules.id],
  }),
  sequence: one(submissionSequences, {
    fields: [documentGranules.sequenceId],
    references: [submissionSequences.id],
  }),
  versions: many(documentVersions),
  currentVersion: one(documentVersions, {
    fields: [documentGranules.currentVersionId],
    references: [documentVersions.id],
  }),
  lastModifiedBy: one(users, {
    fields: [documentGranules.lastModifiedById],
    references: [users.id],
  }),
}));

export const documentVersionsRelations = relations(documentVersions, ({ one }) => ({
  granule: one(documentGranules, {
    fields: [documentVersions.granuleId],
    references: [documentGranules.id],
  }),
  documentBlob: one(documentBlobs, {
    fields: [documentVersions.documentBlobId],
    references: [documentBlobs.id],
  }),
  createdBy: one(users, {
    fields: [documentVersions.createdById],
    references: [users.id],
  }),
}));

/**
 * Conversation Logs Table
 *
 * Stores chat messages exchanged within a project for auditing.
 */
export const conversationLogs = pgTable('conversation_logs', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id),
  userId: integer('user_id').references(() => users.id),
  message: text('message').notNull(),
  role: text('role').notNull(), // user, assistant, system
  moduleType: text('module_type'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Conversation Log Insert Schema
export const insertConversationLogSchema = createInsertSchema(conversationLogs).omit({
  id: true,
  timestamp: true,
});

// Conversation Log Types
export type ConversationLog = InferSelectModel<typeof conversationLogs>;
export type InsertConversationLog = z.infer<typeof insertConversationLogSchema>;
