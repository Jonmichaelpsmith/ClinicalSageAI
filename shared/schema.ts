import { pgTable, text, serial, timestamp, integer, jsonb, boolean, varchar, uuid, date, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// CSR Reports schema
export const csrReports = pgTable("csr_reports", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  sponsor: text("sponsor").notNull(),
  indication: text("indication").notNull(),
  phase: text("phase").notNull(),
  status: text("status").notNull().default("Completed"),
  date: timestamp("date"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  filePath: text("file_path"),
  nctrialId: text("nctrial_id").unique(),
  studyId: text("study_id"),
  drugName: text("drug_name"),
  region: text("region"),
  uploadDate: timestamp("upload_date").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// CSR Details schema
export const csrDetails = pgTable("csr_details", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").notNull().references(() => csrReports.id),
  studyDesign: text("study_design"),
  primaryObjective: text("primary_objective"),
  studyDescription: text("study_description"),
  inclusionCriteria: text("inclusion_criteria"),
  exclusionCriteria: text("exclusion_criteria"),
  treatmentArms: jsonb("treatment_arms").default([]),
  studyDuration: text("study_duration"),
  endpoints: jsonb("endpoints").default([]),
  results: jsonb("results").default({}),
  safety: jsonb("safety").default({}),
  processed: boolean("processed").default(false),
  processingStatus: text("processing_status").default("pending"),
  sampleSize: integer("sample_size"),
  ageRange: text("age_range"),
  gender: jsonb("gender").default({}),
  statisticalMethods: jsonb("statistical_methods").default([]),
  adverseEvents: jsonb("adverse_events").default([]),
  efficacyResults: jsonb("efficacy_results").default({}),
  saeCount: integer("sae_count"),
  teaeCount: integer("teae_count"),
  completionRate: integer("completion_rate"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Users schema with multi-tenant isolation
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  username: varchar("username", { length: 50 }).unique(),
  password: text("password_hash"), // Only stored for local auth, omitted for SSO
  salt: text("salt"), // For password hashing
  primaryOrganizationId: integer("primary_organization_id").references(() => organizations.id),
  role: text("role").default("user"), // global role: super_admin, admin, user
  status: text("status").default("active"), 
  lastLogin: timestamp("last_login"),
  loginCount: integer("login_count").default(0),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  lockedUntil: timestamp("locked_until"),
  mfaEnabled: boolean("mfa_enabled").default(false),
  mfaMethod: text("mfa_method"), // app, sms, email, etc.
  mfaSecret: text("mfa_secret"), // Encrypted
  requirePasswordChange: boolean("require_password_change").default(false),
  passwordLastChanged: timestamp("password_last_changed"),
  authProvider: text("auth_provider").default("local"), // local, google, okta, azure, etc.
  authProviderId: text("auth_provider_id"), // External ID from auth provider
  preferences: jsonb("preferences").default({}),
  subscribed: boolean("subscribed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at") // Soft delete
});

// Document Types
export const documentTypes = pgTable("vault_document_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  category: varchar("category", { length: 50 }),
  templateId: varchar("template_id", { length: 50 }),
  mimeTypes: jsonb("mime_types").default([]),
});

// Document Folders schema
export const documentFolders = pgTable("vault_document_folders", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  parentId: uuid("parent_id"),  // Reference will be set up in relations
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  path: text("path"),
  isSystem: boolean("is_system").default(false),
});

// Documents schema
export const documents = pgTable("vault_documents_v2", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  typeId: integer("type_id").references(() => documentTypes.id),
  category: varchar("category", { length: 100 }),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  description: text("description"),
  author: varchar("author", { length: 100 }),
  authorId: integer("author_id").references(() => users.id),
  tags: jsonb("tags").default([]),
  folderId: uuid("folder_id"),  // Reference will be set up in relations
  fileName: varchar("file_name", { length: 255 }),
  fileType: varchar("file_type", { length: 50 }),
  fileSize: integer("file_size"),
  filePath: text("file_path"),
  fileUrl: text("file_url"),
  content: jsonb("content"),
  metadata: jsonb("metadata").default({}),
  isLatest: boolean("is_latest").default(true),
  originalId: uuid("original_id"),  // Reference will be set up in relations
  checksum: varchar("checksum", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  modifiedAt: timestamp("modified_at").defaultNow(),
  accessCount: integer("access_count").default(0),
  downloadCount: integer("download_count").default(0),
  reviewStatus: varchar("review_status", { length: 50 }),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  expiresAt: timestamp("expires_at"),
});

// Document shares schema
export const documentShares = pgTable("vault_document_shares", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id").notNull(),  // Reference will be set up in relations
  userId: integer("user_id").references(() => users.id),
  email: varchar("email", { length: 255 }),
  permissionLevel: varchar("permission_level", { length: 20 }).notNull(),
  token: varchar("token", { length: 255 }),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  accessCount: integer("access_count").default(0),
  lastAccessedAt: timestamp("last_accessed_at"),
});

// Document audit log
export const documentAuditLogs = pgTable("vault_document_audit_logs", {
  id: serial("id").primaryKey(),
  documentId: uuid("document_id"),  // Reference will be set up in relations
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 50 }).notNull(),
  details: jsonb("details"),
  timestamp: timestamp("timestamp").defaultNow(),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
});

// CER (Clinical Evaluation Report) schema
export const cerReports = pgTable("cer_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  deviceName: text("device_name").notNull(),
  deviceType: text("device_type").notNull(),
  manufacturer: text("manufacturer").notNull(),
  version: varchar("version", { length: 20 }).default("1.0.0"),
  status: varchar("status", { length: 20 }).default("draft"),
  regulatoryFramework: varchar("regulatory_framework", { length: 50 }).default("EU MDR"),
  intendedUse: text("intended_use"),
  classification: varchar("classification", { length: 50 }),
  uniiCode: varchar("unii_code", { length: 50 }),
  atcCode: varchar("atc_code", { length: 50 }),
  gmdnCode: varchar("gmdn_code", { length: 50 }),
  mechanismOfAction: text("mechanism_of_action"),
  templateId: varchar("template_id", { length: 50 }).default("eu-mdr"),
  complianceScore: jsonb("compliance_score").default({}),
  authorId: integer("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  publishedAt: timestamp("published_at"),
  reviewStatus: varchar("review_status", { length: 50 }),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  documentId: uuid("document_id").references(() => documents.id),
});

// CER Sections schema
export const cerSections = pgTable("cer_sections", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").notNull().references(() => cerReports.id),
  title: text("title").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  content: text("content"),
  aiGenerated: boolean("ai_generated").default(true),
  wordCount: integer("word_count"),
  order: integer("order").notNull(),
  status: varchar("status", { length: 20 }).default("draft"),
  complianceScore: jsonb("compliance_score").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastReviewed: timestamp("last_reviewed"),
  metadata: jsonb("metadata").default({}),
});

// CER FAERS Data schema
export const cerFaersData = pgTable("cer_faers_data", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").notNull().references(() => cerReports.id),
  productName: varchar("product_name", { length: 255 }).notNull(),
  uniiCode: varchar("unii_code", { length: 50 }),
  substanceName: varchar("substance_name", { length: 255 }),
  atcCodes: jsonb("atc_codes").default([]),
  mechanismOfAction: jsonb("mechanism_of_action").default([]),
  pharmacologicalClass: jsonb("pharmacological_class").default([]),
  totalReports: integer("total_reports"),
  seriousReports: integer("serious_reports"),
  riskScore: integer("risk_score"),
  reportDates: jsonb("report_dates").default({}),
  eventsByType: jsonb("events_by_type").default({}),
  comparators: jsonb("comparators").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// CER Literature schema
export const cerLiterature = pgTable("cer_literature", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").notNull().references(() => cerReports.id),
  title: text("title").notNull(),
  authors: text("authors"),
  publication: text("publication"),
  publicationDate: date("publication_date"),
  doi: varchar("doi", { length: 100 }),
  pmid: varchar("pmid", { length: 20 }),
  abstract: text("abstract"),
  fullText: text("full_text"),
  summary: text("summary"),
  relevanceScore: integer("relevance_score"),
  qualityScore: integer("quality_score"),
  outcomesSummary: text("outcomes_summary"),
  adverseEventsSummary: text("adverse_events_summary"),
  methodologySummary: text("methodology_summary"),
  sampleSize: integer("sample_size"),
  studyType: varchar("study_type", { length: 100 }),
  endpoints: jsonb("endpoints").default([]),
  metadata: jsonb("metadata").default({}),
  includedInReport: boolean("included_in_report").default(false),
  aiProcessed: boolean("ai_processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// CER Compliance Checks schema
export const cerComplianceChecks = pgTable("cer_compliance_checks", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").notNull().references(() => cerReports.id),
  standard: varchar("standard", { length: 100 }).notNull(),
  checkDate: timestamp("check_date").defaultNow(),
  overallScore: integer("overall_score"),
  sectionScores: jsonb("section_scores").default({}),
  recommendations: jsonb("recommendations").default([]),
  missingElements: jsonb("missing_elements").default([]),
  warningElements: jsonb("warning_elements").default([]),
  status: varchar("status", { length: 20 }).default("pending"),
  remediationStatus: varchar("remediation_status", { length: 20 }).default("not_started"),
  autoFixesApplied: boolean("auto_fixes_applied").default(false),
  fixesLog: jsonb("fixes_log").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// CER Workflows schema
export const cerWorkflows = pgTable("cer_workflows", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").notNull().references(() => cerReports.id),
  status: varchar("status", { length: 20 }).default("in_progress"),
  currentStep: varchar("current_step", { length: 50 }),
  progress: integer("progress").default(0),
  steps: jsonb("steps").default([]),
  logs: jsonb("logs").default([]),
  metadata: jsonb("metadata").default({}),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  estimatedCompletion: timestamp("estimated_completion"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// CER Export history schema
export const cerExports = pgTable("cer_exports", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").notNull().references(() => cerReports.id),
  exportType: varchar("export_type", { length: 20 }).notNull(), // pdf, docx
  filename: varchar("filename", { length: 255 }).notNull(),
  filePath: text("file_path"),
  fileSize: integer("file_size"),
  exportedAt: timestamp("exported_at").defaultNow(),
  exportedBy: integer("exported_by").references(() => users.id),
  version: varchar("version", { length: 20 }),
  checksum: varchar("checksum", { length: 255 }),
  settings: jsonb("settings").default({}),
  status: varchar("status", { length: 20 }).default("complete"),
});

// Setup relations after all tables are defined
export const documentFoldersRelations = relations(documentFolders, ({ one, many }) => ({
  parentFolder: one(documentFolders, {
    fields: [documentFolders.parentId],
    references: [documentFolders.id],
    relationName: "folder_to_parent",
  }),
  childFolders: many(documentFolders, {
    relationName: "folder_to_parent"
  }),
  documents: many(documents),
  creator: one(users, {
    fields: [documentFolders.createdBy],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  folder: one(documentFolders, {
    fields: [documents.folderId],
    references: [documentFolders.id],
  }),
  originalDocument: one(documents, {
    fields: [documents.originalId],
    references: [documents.id],
    relationName: "document_versions",
  }),
  versions: many(documents, {
    relationName: "document_versions",
  }),
  docType: one(documentTypes, {
    fields: [documents.typeId],
    references: [documentTypes.id],
  }),
  author: one(users, {
    fields: [documents.authorId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [documents.reviewedBy],
    references: [users.id],
  }),
  shares: many(documentShares),
  auditLogs: many(documentAuditLogs),
}));

export const documentSharesRelations = relations(documentShares, ({ one }) => ({
  document: one(documents, {
    fields: [documentShares.documentId],
    references: [documents.id],
  }),
  user: one(users, {
    fields: [documentShares.userId],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [documentShares.createdBy],
    references: [users.id],
  }),
}));

export const documentAuditLogsRelations = relations(documentAuditLogs, ({ one }) => ({
  document: one(documents, {
    fields: [documentAuditLogs.documentId],
    references: [documents.id],
  }),
  user: one(users, {
    fields: [documentAuditLogs.userId],
    references: [users.id],
  }),
}));

// CER Relations
export const cerReportsRelations = relations(cerReports, ({ one, many }) => ({
  document: one(documents, {
    fields: [cerReports.documentId],
    references: [documents.id],
  }),
  author: one(users, {
    fields: [cerReports.authorId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [cerReports.reviewedBy],
    references: [users.id],
  }),
  sections: many(cerSections),
  faersData: many(cerFaersData),
  literatures: many(cerLiterature),
  complianceChecks: many(cerComplianceChecks),
  workflows: many(cerWorkflows),
  exports: many(cerExports),
}));

export const cerSectionsRelations = relations(cerSections, ({ one }) => ({
  report: one(cerReports, {
    fields: [cerSections.reportId],
    references: [cerReports.id],
  }),
}));

export const cerFaersDataRelations = relations(cerFaersData, ({ one }) => ({
  report: one(cerReports, {
    fields: [cerFaersData.reportId],
    references: [cerReports.id],
  }),
}));

export const cerLiteratureRelations = relations(cerLiterature, ({ one }) => ({
  report: one(cerReports, {
    fields: [cerLiterature.reportId],
    references: [cerReports.id],
  }),
}));

export const cerComplianceChecksRelations = relations(cerComplianceChecks, ({ one }) => ({
  report: one(cerReports, {
    fields: [cerComplianceChecks.reportId],
    references: [cerReports.id],
  }),
}));

export const cerWorkflowsRelations = relations(cerWorkflows, ({ one }) => ({
  report: one(cerReports, {
    fields: [cerWorkflows.reportId],
    references: [cerReports.id],
  }),
}));

export const cerExportsRelations = relations(cerExports, ({ one }) => ({
  report: one(cerReports, {
    fields: [cerExports.reportId],
    references: [cerReports.id],
  }),
  exportedByUser: one(users, {
    fields: [cerExports.exportedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertCsrReportSchema = createInsertSchema(csrReports);
export const insertCsrDetailSchema = createInsertSchema(csrDetails);
export const insertUserSchema = createInsertSchema(users, {
  password: z.string().min(8).optional(),
  email: z.string().email(),
  name: z.string().min(1)
}).omit({ passwordLastChanged: true, salt: true, mfaSecret: true });
export const insertDocumentTypeSchema = createInsertSchema(documentTypes, {
  id: z.number().optional(),
});
export const insertDocumentFolderSchema = createInsertSchema(documentFolders, {
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  parentId: z.string().uuid().optional().nullable(),
});
export const insertDocumentSchema = createInsertSchema(documents, {
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  modifiedAt: z.date().optional(),
  originalId: z.string().uuid().optional().nullable(),
  folderId: z.string().uuid().optional().nullable(),
});
export const insertDocumentShareSchema = createInsertSchema(documentShares, {
  id: z.string().uuid().optional(),
  expiresAt: z.date().optional().nullable(),
  lastAccessedAt: z.date().optional().nullable(),
});
export const insertDocumentAuditLogSchema = createInsertSchema(documentAuditLogs, {
  id: z.number().optional(),
  documentId: z.string().uuid().optional().nullable(),
});

// CER Insert Schemas
export const insertCerReportSchema = createInsertSchema(cerReports, {
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  publishedAt: z.date().optional().nullable(),
  reviewedAt: z.date().optional().nullable(),
  reviewedBy: z.number().optional().nullable(),
  authorId: z.number().optional().nullable(),
  documentId: z.string().uuid().optional().nullable(),
});

export const insertCerSectionSchema = createInsertSchema(cerSections, {
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  lastReviewed: z.date().optional().nullable(),
  wordCount: z.number().optional(),
});

export const insertCerFaersDataSchema = createInsertSchema(cerFaersData, {
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const insertCerLiteratureSchema = createInsertSchema(cerLiterature, {
  id: z.string().uuid().optional(),
  publicationDate: z.date().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const insertCerComplianceCheckSchema = createInsertSchema(cerComplianceChecks, {
  id: z.string().uuid().optional(),
  checkDate: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const insertCerWorkflowSchema = createInsertSchema(cerWorkflows, {
  id: z.string().uuid().optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional().nullable(),
  estimatedCompletion: z.date().optional().nullable(),
  lastUpdated: z.date().optional(),
});

export const insertCerExportSchema = createInsertSchema(cerExports, {
  id: z.string().uuid().optional(),
  exportedAt: z.date().optional(),
  exportedBy: z.number().optional().nullable(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type CsrReport = typeof csrReports.$inferSelect;
export type InsertCsrReport = z.infer<typeof insertCsrReportSchema>;
export type CsrDetail = typeof csrDetails.$inferSelect;
export type InsertCsrDetail = z.infer<typeof insertCsrDetailSchema>;

export type DocumentFolder = typeof documentFolders.$inferSelect;
export type InsertDocumentFolder = z.infer<typeof insertDocumentFolderSchema>;
export type DocumentType = typeof documentTypes.$inferSelect;
export type InsertDocumentType = z.infer<typeof insertDocumentTypeSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type DocumentShare = typeof documentShares.$inferSelect;
export type InsertDocumentShare = z.infer<typeof insertDocumentShareSchema>;
export type DocumentAuditLog = typeof documentAuditLogs.$inferSelect;
export type InsertDocumentAuditLog = z.infer<typeof insertDocumentAuditLogSchema>;

// CER Types
export type CerReport = typeof cerReports.$inferSelect;
export type InsertCerReport = z.infer<typeof insertCerReportSchema>;
export type CerSection = typeof cerSections.$inferSelect;
export type InsertCerSection = z.infer<typeof insertCerSectionSchema>;
export type CerFaersData = typeof cerFaersData.$inferSelect;
export type InsertCerFaersData = z.infer<typeof insertCerFaersDataSchema>;
export type CerLiterature = typeof cerLiterature.$inferSelect;
export type InsertCerLiterature = z.infer<typeof insertCerLiteratureSchema>;
export type CerComplianceCheck = typeof cerComplianceChecks.$inferSelect;
export type InsertCerComplianceCheck = z.infer<typeof insertCerComplianceCheckSchema>;
export type CerWorkflow = typeof cerWorkflows.$inferSelect;
export type InsertCerWorkflow = z.infer<typeof insertCerWorkflowSchema>;
export type CerExport = typeof cerExports.$inferSelect;
export type InsertCerExport = z.infer<typeof insertCerExportSchema>;

// ----------------------------------------------------------------------------
// Multi-client CER Project Management Schema
// ----------------------------------------------------------------------------

// Client organizations table (tenants)
export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(), // URL-friendly identifier
  contactName: text('contact_name'),
  contactEmail: text('contact_email'),
  phone: text('phone'),
  address: text('address'),
  logo: text('logo_url'),
  status: text('status').default('active'),
  tier: text('tier').default('standard'), // subscription tier: standard, professional, enterprise
  settings: jsonb('settings'), // JSON blob for tenant-specific settings
  securitySettings: jsonb('security_settings'), // JSON blob for security configuration
  customBranding: jsonb('custom_branding'), // JSON blob for tenant UI customization
  dataRetentionDays: integer('data_retention_days').default(365), // Default to 1 year retention
  maxUsers: integer('max_users').default(10), // Default user limit
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// For backward compatibility - create a view of organizations as clients
export const clients = organizations;

// Organization API keys for service account access
export const organizationApiKeys = pgTable('organization_api_keys', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  name: text('name').notNull(), // Descriptive name for the key
  apiKey: text('api_key').notNull(), // Hashed API key
  scopes: text('scopes').array(), // Array of permission scopes
  lastUsed: timestamp('last_used'),
  expiresAt: timestamp('expires_at'), // Optional expiration
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: integer('created_by'), // User who created the key
  status: text('status').default('active')
});

// CER projects table
export const cerProjects = pgTable('cer_projects', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  clientId: integer('client_id').notNull().references(() => clients.id),
  deviceName: text('device_name').notNull(),
  deviceDescription: text('device_description'),
  deviceClass: text('device_class'),
  status: text('status').notNull().default('draft'),
  progress: integer('progress').default(0),
  regulatoryFrameworks: text('regulatory_frameworks').array(),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  assignedUsers: integer('assigned_users').array(),
  priority: text('priority').default('medium'),
  tags: text('tags').array(),
  templateId: text('template_id')
});

// CER project documents
export const cerProjectDocuments = pgTable('cer_project_documents', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => cerProjects.id),
  cerReportId: uuid('cer_report_id').references(() => cerReports.id),
  documentType: text('document_type').notNull(), // e.g., 'cer', 'literature', 'testing', etc.
  title: text('title').notNull(),
  version: text('version').default('1.0'),
  status: text('status').default('draft'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: integer('created_by').references(() => users.id),
  notes: text('notes'),
  documentId: uuid('document_id').references(() => documents.id),
}, (table) => {
  return {
    projectDocument: unique().on(table.projectId, table.documentType, table.version)
  }
});

// Project activities log
export const projectActivities = pgTable('project_activities', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => cerProjects.id),
  userId: integer('user_id').references(() => users.id),
  activityType: text('activity_type').notNull(), // e.g., 'create', 'update', 'review', etc.
  description: text('description').notNull(),
  metadata: jsonb('metadata').default({}),
  timestamp: timestamp('timestamp').defaultNow()
});

// Project timeline milestones
export const projectMilestones = pgTable('project_milestones', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => cerProjects.id),
  title: text('title').notNull(),
  description: text('description'),
  dueDate: timestamp('due_date'),
  completedDate: timestamp('completed_date'),
  status: text('status').default('pending'),
  assignedTo: integer('assigned_to').references(() => users.id),
  notifyBefore: integer('notify_before'), // days before due date to send notification
  priority: text('priority').default('medium'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Client user permissions
export const clientUserPermissions = pgTable('client_user_permissions', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').notNull().references(() => clients.id),
  userId: integer('user_id').notNull().references(() => users.id),
  permission: text('permission').notNull(), // e.g., 'admin', 'editor', 'viewer'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    userClientPermission: unique().on(table.clientId, table.userId)
  }
});

// Set up relations
export const clientsRelations = relations(clients, ({ many }) => ({
  projects: many(cerProjects),
  permissions: many(clientUserPermissions)
}));

export const cerProjectsRelations = relations(cerProjects, ({ one, many }) => ({
  client: one(clients, {
    fields: [cerProjects.clientId],
    references: [clients.id]
  }),
  documents: many(cerProjectDocuments),
  activities: many(projectActivities),
  milestones: many(projectMilestones)
}));

export const cerProjectDocumentsRelations = relations(cerProjectDocuments, ({ one }) => ({
  project: one(cerProjects, {
    fields: [cerProjectDocuments.projectId],
    references: [cerProjects.id]
  }),
  cerReport: one(cerReports, {
    fields: [cerProjectDocuments.cerReportId],
    references: [cerReports.id]
  }),
  document: one(documents, {
    fields: [cerProjectDocuments.documentId],
    references: [documents.id]
  }),
  creator: one(users, {
    fields: [cerProjectDocuments.createdBy],
    references: [users.id]
  })
}));

export const projectActivitiesRelations = relations(projectActivities, ({ one }) => ({
  project: one(cerProjects, {
    fields: [projectActivities.projectId],
    references: [cerProjects.id]
  }),
  user: one(users, {
    fields: [projectActivities.userId],
    references: [users.id]
  })
}));

export const projectMilestonesRelations = relations(projectMilestones, ({ one }) => ({
  project: one(cerProjects, {
    fields: [projectMilestones.projectId],
    references: [cerProjects.id]
  }),
  assignee: one(users, {
    fields: [projectMilestones.assignedTo],
    references: [users.id]
  })
}));

export const clientUserPermissionsRelations = relations(clientUserPermissions, ({ one }) => ({
  client: one(clients, {
    fields: [clientUserPermissions.clientId],
    references: [clients.id]
  }),
  user: one(users, {
    fields: [clientUserPermissions.userId],
    references: [users.id]
  })
}));

// User organization references to access organizations defined at the top
// These references are used throughout the schema

// User organization membership with role-based access
export const userOrganizations = pgTable('user_organizations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  role: text('role').notNull().default('member'), // admin, editor, member, viewer
  permissions: text('permissions').array(), // Specific permissions within the organization
  invitedBy: integer('invited_by').references(() => users.id),
  invitedAt: timestamp('invited_at').defaultNow(),
  acceptedAt: timestamp('accepted_at'),
  lastActive: timestamp('last_active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  expiresAt: timestamp('expires_at') // Optional expiration for temporary access
}, (table) => {
  return {
    userOrgUnique: unique().on(table.userId, table.organizationId)
  }
});

// Session management
export const userSessions = pgTable('user_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').notNull().references(() => users.id),
  organizationId: integer('organization_id').references(() => organizations.id),
  token: text('token').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  lastActive: timestamp('last_active').defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  revokedAt: timestamp('revoked_at')
});

// Audit log for security events
export const securityAuditLog = pgTable('security_audit_log', {
  id: serial('id').primaryKey(),
  timestamp: timestamp('timestamp').defaultNow(),
  userId: integer('user_id').references(() => users.id),
  organizationId: integer('organization_id').references(() => organizations.id),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  eventType: text('event_type').notNull(), // login, logout, password_change, role_change, etc.
  eventDetails: jsonb('event_details'),
  resourceType: text('resource_type'), // user, document, project, etc.
  resourceId: text('resource_id') // ID of the affected resource
});

// Set up relations for organization & user tables
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(userOrganizations),
  apiKeys: many(organizationApiKeys),
  projects: many(cerProjects)
}));

export const usersRelations = relations(users, ({ many, one }) => ({
  organizations: many(userOrganizations),
  sessions: many(userSessions),
  primaryOrganization: one(organizations, {
    fields: [users.primaryOrganizationId],
    references: [organizations.id]
  })
}));

export const userOrganizationsRelations = relations(userOrganizations, ({ one }) => ({
  user: one(users, {
    fields: [userOrganizations.userId],
    references: [users.id]
  }),
  organization: one(organizations, {
    fields: [userOrganizations.organizationId],
    references: [organizations.id]
  }),
  inviter: one(users, {
    fields: [userOrganizations.invitedBy],
    references: [users.id]
  })
}));

// Create insert schemas for the new tables
export const insertOrganizationSchema = createInsertSchema(organizations);
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = typeof organizations.$inferSelect;

// Enhanced user schema already defined above

export const insertClientSchema = createInsertSchema(clients);
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

export const insertCerProjectSchema = createInsertSchema(cerProjects);
export type InsertCerProject = z.infer<typeof insertCerProjectSchema>;
export type CerProject = typeof cerProjects.$inferSelect;

export const insertCerProjectDocumentSchema = createInsertSchema(cerProjectDocuments);
export type InsertCerProjectDocument = z.infer<typeof insertCerProjectDocumentSchema>;
export type CerProjectDocument = typeof cerProjectDocuments.$inferSelect;

export const insertProjectActivitySchema = createInsertSchema(projectActivities);
export type InsertProjectActivity = z.infer<typeof insertProjectActivitySchema>;
export type ProjectActivity = typeof projectActivities.$inferSelect;

export const insertProjectMilestoneSchema = createInsertSchema(projectMilestones);
export type InsertProjectMilestone = z.infer<typeof insertProjectMilestoneSchema>;
export type ProjectMilestone = typeof projectMilestones.$inferSelect;

export const insertClientUserPermissionSchema = createInsertSchema(clientUserPermissions);
export type InsertClientUserPermission = z.infer<typeof insertClientUserPermissionSchema>;
export type ClientUserPermission = typeof clientUserPermissions.$inferSelect;

// ----------------------------------------------------------------------------
// Quality Management Plan (QMP) Schema with Tenant Isolation
// ----------------------------------------------------------------------------

// QMP main table
export const qualityManagementPlans = pgTable('quality_management_plans', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  title: text('title').notNull(),
  version: text('version').notNull().default('1.0'),
  status: text('status').notNull().default('draft'), // draft, under_review, approved, superseded
  description: text('description'),
  scope: text('scope'),
  objectives: jsonb('objectives'), // Array of quality objectives
  regulatoryFrameworks: text('regulatory_frameworks').array(), // Array of applicable regulatory frameworks
  createdBy: integer('created_by').references(() => users.id),
  reviewedBy: integer('reviewed_by').references(() => users.id),
  approvedBy: integer('approved_by').references(() => users.id),
  approvalDate: timestamp('approval_date'),
  reviewDate: timestamp('review_date'),
  nextReviewDate: timestamp('next_review_date'),
  effectiveDate: timestamp('effective_date'),
  expirationDate: timestamp('expiration_date'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Critical-to-Quality (CtQ) factors with risk categorization
export const ctqFactors = pgTable('ctq_factors', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  planId: integer('plan_id').notNull().references(() => qualityManagementPlans.id),
  name: text('name').notNull(),
  description: text('description'),
  riskLevel: text('risk_level').notNull(), // high, medium, low
  associatedSection: text('associated_section'), // Which CER section this applies to
  objectiveId: text('objective_id'), // Reference to specific objective in the QMP
  rationale: text('rationale'), // Why this factor is important
  verificationType: text('verification_type'), // How this factor is verified
  verificationCriteria: text('verification_criteria'), // Specific criteria for passing
  mitigation: text('mitigation'), // Steps to mitigate risk if not met
  category: text('category'), // Categorization (e.g., data integrity, regulatory compliance)
  isHardGate: boolean('is_hard_gate').default(false), // If true, must be addressed to proceed
  metadata: jsonb('metadata').default({}),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Audit trail for QMP changes
export const qmpAuditTrail = pgTable('qmp_audit_trail', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  planId: integer('plan_id').references(() => qualityManagementPlans.id),
  factorId: integer('factor_id').references(() => ctqFactors.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(), // created, updated, deleted, approved, etc.
  component: text('component').notNull(), // QMP, CtQ factor, objective, etc.
  section: text('section'), // Specific section that was changed
  details: text('details'), // Description of what changed
  changes: jsonb('changes').default({}), // Before/after values
  metadata: jsonb('metadata').default({}),
  timestamp: timestamp('timestamp').defaultNow()
});

// QMP-CER section quality gating
export const qmpSectionGating = pgTable('qmp_section_gating', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  projectId: integer('project_id').notNull().references(() => cerProjects.id),
  cerReportId: uuid('cer_report_id').references(() => cerReports.id),
  sectionId: text('section_id').notNull(), // Section identifier
  sectionName: text('section_name').notNull(), // Human-readable section name
  factors: integer('factors').array(), // Reference to CtQ factors
  status: text('status').default('pending'), // pending, in_progress, passed, failed, waived
  passedFactors: integer('passed_factors').array(), // Factors that are satisfied
  failedFactors: integer('failed_factors').array(), // Factors that failed verification
  gatingDecision: text('gating_decision'), // proceed, block, warning
  verifiedBy: integer('verified_by').references(() => users.id),
  verifiedAt: timestamp('verified_at'),
  waivedBy: integer('waived_by').references(() => users.id),
  waivedAt: timestamp('waived_at'),
  waiveReason: text('waive_reason'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// QMP-CER requirement traceability matrix
export const qmpTraceabilityMatrix = pgTable('qmp_traceability_matrix', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  planId: integer('plan_id').notNull().references(() => qualityManagementPlans.id),
  requirementId: text('requirement_id').notNull(), // Identifier for the requirement
  requirementName: text('requirement_name').notNull(), // Human-readable name
  requirementDescription: text('requirement_description'),
  requirementLevel: text('requirement_level').notNull(), // high, medium, low risk
  sections: jsonb('sections').notNull(), // Map of section IDs to coverage levels (0-3)
  verificationMethod: text('verification_method'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Relations for QMP tables
export const qualityManagementPlansRelations = relations(qualityManagementPlans, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [qualityManagementPlans.organizationId],
    references: [organizations.id]
  }),
  creator: one(users, {
    fields: [qualityManagementPlans.createdBy],
    references: [users.id]
  }),
  reviewer: one(users, {
    fields: [qualityManagementPlans.reviewedBy],
    references: [users.id]
  }),
  approver: one(users, {
    fields: [qualityManagementPlans.approvedBy],
    references: [users.id]
  }),
  factors: many(ctqFactors),
  auditTrail: many(qmpAuditTrail),
  traceability: many(qmpTraceabilityMatrix)
}));

export const ctqFactorsRelations = relations(ctqFactors, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [ctqFactors.organizationId],
    references: [organizations.id]
  }),
  plan: one(qualityManagementPlans, {
    fields: [ctqFactors.planId],
    references: [qualityManagementPlans.id]
  }),
  creator: one(users, {
    fields: [ctqFactors.createdBy],
    references: [users.id]
  }),
  auditTrail: many(qmpAuditTrail)
}));

export const qmpAuditTrailRelations = relations(qmpAuditTrail, ({ one }) => ({
  organization: one(organizations, {
    fields: [qmpAuditTrail.organizationId],
    references: [organizations.id]
  }),
  plan: one(qualityManagementPlans, {
    fields: [qmpAuditTrail.planId],
    references: [qualityManagementPlans.id]
  }),
  factor: one(ctqFactors, {
    fields: [qmpAuditTrail.factorId],
    references: [ctqFactors.id]
  }),
  user: one(users, {
    fields: [qmpAuditTrail.userId],
    references: [users.id]
  })
}));

export const qmpSectionGatingRelations = relations(qmpSectionGating, ({ one }) => ({
  organization: one(organizations, {
    fields: [qmpSectionGating.organizationId],
    references: [organizations.id]
  }),
  project: one(cerProjects, {
    fields: [qmpSectionGating.projectId],
    references: [cerProjects.id]
  }),
  cerReport: one(cerReports, {
    fields: [qmpSectionGating.cerReportId],
    references: [cerReports.id]
  }),
  verifier: one(users, {
    fields: [qmpSectionGating.verifiedBy],
    references: [users.id]
  }),
  waiver: one(users, {
    fields: [qmpSectionGating.waivedBy],
    references: [users.id]
  })
}));

export const qmpTraceabilityMatrixRelations = relations(qmpTraceabilityMatrix, ({ one }) => ({
  organization: one(organizations, {
    fields: [qmpTraceabilityMatrix.organizationId],
    references: [organizations.id]
  }),
  plan: one(qualityManagementPlans, {
    fields: [qmpTraceabilityMatrix.planId],
    references: [qualityManagementPlans.id]
  })
}));

// Create insert schemas for QMP tables
export const insertQualityManagementPlanSchema = createInsertSchema(qualityManagementPlans);
export type InsertQualityManagementPlan = z.infer<typeof insertQualityManagementPlanSchema>;
export type QualityManagementPlan = typeof qualityManagementPlans.$inferSelect;

export const insertCtqFactorSchema = createInsertSchema(ctqFactors);
export type InsertCtqFactor = z.infer<typeof insertCtqFactorSchema>;
export type CtqFactor = typeof ctqFactors.$inferSelect;

export const insertQmpAuditTrailSchema = createInsertSchema(qmpAuditTrail);
export type InsertQmpAuditTrail = z.infer<typeof insertQmpAuditTrailSchema>;
export type QmpAuditTrail = typeof qmpAuditTrail.$inferSelect;

export const insertQmpSectionGatingSchema = createInsertSchema(qmpSectionGating);
export type InsertQmpSectionGating = z.infer<typeof insertQmpSectionGatingSchema>;
export type QmpSectionGating = typeof qmpSectionGating.$inferSelect;

export const insertQmpTraceabilityMatrixSchema = createInsertSchema(qmpTraceabilityMatrix);
export type InsertQmpTraceabilityMatrix = z.infer<typeof insertQmpTraceabilityMatrixSchema>;
export type QmpTraceabilityMatrix = typeof qmpTraceabilityMatrix.$inferSelect;