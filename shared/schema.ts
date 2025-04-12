import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  text,
  timestamp,
  date,
  integer,
  boolean,
  real,
  varchar,
  json,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Define users table schema
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }),
  password: text('password').notNull(),
  fullName: text('full_name'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
});

// Define trials table schema
export const trials = pgTable('trials', {
  id: serial('id').primaryKey(),
  trial_id: text('trial_id').unique(),
  nct_id: text('nct_id'),
  csr_id: text('csr_id'),
  title: text('title').notNull(),
  sponsor: text('sponsor').notNull(),
  indication: text('indication').notNull(),
  phase: text('phase').notNull(),
  status: text('status').notNull(),
  start_date: date('start_date'),
  source: text('source').notNull(),
  country: text('country'),
  file_path: text('file_path'),
  file_size: integer('file_size'),
  imported_date: timestamp('imported_date').defaultNow(),
  last_updated: timestamp('last_updated')
});

// CSR Reports table
export const csrReports = pgTable('csr_reports', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  sponsor: text('sponsor').notNull(),
  indication: text('indication').notNull(),
  phase: text('phase').notNull(),
  status: text('status').notNull(),
  date: text('date'),
  uploadDate: timestamp('upload_date').defaultNow(),
  summary: text('summary'),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size'),
  fileType: text('file_type'),
  processedAt: timestamp('processed_at'),
  vectorized: boolean('vectorized').default(false),
  source: text('source').default('manual'),
  hasDetails: boolean('has_details').default(false),
  deletedAt: timestamp('deleted_at')
});

// CSR Details table with extracted structured information
export const csrDetails = pgTable('csr_details', {
  id: serial('id').primaryKey(),
  reportId: integer('report_id').notNull(),
  lastUpdated: timestamp('last_updated'),
  studyDesign: text('study_design'),
  primaryObjective: text('primary_objective'),
  secondaryObjective: text('secondary_objective'),
  studyDescription: text('study_description'),
  inclusionCriteria: text('inclusion_criteria'),
  exclusionCriteria: text('exclusion_criteria'),
  primaryEndpoint: text('primary_endpoint'),
  secondaryEndpoints: text('secondary_endpoints'),
  sampleSize: text('sample_size'),
  populationDescription: text('population_description'),
  armDescription: text('arm_description'),
  statisticalMethods: text('statistical_methods'),
  efficacyResults: text('efficacy_results'),
  safetyResults: text('safety_results'),
  adverseEvents: text('adverse_events'),
  seriousEvents: text('serious_events'),
  dropoutRate: text('dropout_rate'),
  studyLimitations: text('study_limitations'),
  authorsConclusion: text('authors_conclusion'),
  dataQuality: real('data_quality'),
  extractionConfidence: real('extraction_confidence'),
  completionRate: text('completion_rate')
});

// Academic Resources table - for storing uploaded academic papers and references
export const academicResources = pgTable('academic_resources', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  authors: text('authors').notNull(), // JSON string array
  publicationDate: text('publication_date'),
  source: text('source').notNull(),
  resourceType: text('resource_type').notNull(), // 'pdf', 'text', 'xml', 'json'
  summary: text('summary'),
  topics: text('topics'), // JSON string array
  keywords: text('keywords'), // JSON string array
  filePath: text('file_path').notNull(),
  fileSize: integer('file_size'),
  uploadDate: timestamp('upload_date').defaultNow(),
  lastAccessed: timestamp('last_accessed'),
  accessCount: integer('access_count').default(0)
});

// Academic Embeddings table - for storing vector embeddings of academic resources
export const academicEmbeddings = pgTable('academic_embeddings', {
  id: serial('id').primaryKey(),
  resourceId: integer('resource_id').notNull(),
  embedding: text('embedding').notNull(), // JSON numeric array of embedding vectors
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
});

// CSR Segments table - for storing segmented content from clinical study reports with vector embeddings
export const csrSegments = pgTable('csr_segments', {
  id: serial('id').primaryKey(),
  reportId: integer('report_id').notNull(),
  segmentNumber: integer('segment_number').notNull(),
  segmentType: text('segment_type').notNull().default('text'), // text, table, figure, etc.
  content: text('content').notNull(),
  pageNumbers: text('page_numbers'), // Page numbers where this segment appears
  embedding: text('embedding').notNull(), // JSON numeric array of embedding vectors
  extractedEntities: json('extracted_entities'), // Optional JSON with named entities
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
});

// Define the insert schema for users
export const insertUserSchema = createInsertSchema(users, {
  // Add additional validation if needed
}).omit({ id: true, created_at: true, updated_at: true });

// Define the insert schema for trials
export const insertTrialSchema = createInsertSchema(trials, {
  // Add additional validation if needed
}).omit({ id: true, imported_date: true });

// Define insert schema for CSR Reports
export const insertCsrReportSchema = createInsertSchema(csrReports, {
  // Add additional validation if needed
}).omit({ id: true, uploadDate: true, processedAt: true, vectorized: true, hasDetails: true, deletedAt: true });

// Define insert schema for CSR Details
export const insertCsrDetailsSchema = createInsertSchema(csrDetails, {
  // Add additional validation if needed
}).omit({ id: true, lastUpdated: true });

// Define insert schema for Academic Resources
export const insertAcademicResourceSchema = createInsertSchema(academicResources, {
  // Add additional validation if needed
}).omit({ id: true, uploadDate: true, lastAccessed: true, accessCount: true });

// Define insert schema for Academic Embeddings
export const insertAcademicEmbeddingSchema = createInsertSchema(academicEmbeddings, {
  // Add additional validation if needed
}).omit({ id: true, createdAt: true, updatedAt: true });

// Define insert schema for CSR Segments
export const insertCsrSegmentSchema = createInsertSchema(csrSegments, {
  // Add additional validation if needed
}).omit({ id: true, createdAt: true, updatedAt: true });

// Define types based on the schema
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Trial = typeof trials.$inferSelect;
export type InsertTrial = z.infer<typeof insertTrialSchema>;

export type CsrReport = typeof csrReports.$inferSelect;
export type InsertCsrReport = z.infer<typeof insertCsrReportSchema>;

export type CsrDetails = typeof csrDetails.$inferSelect;
export type InsertCsrDetails = z.infer<typeof insertCsrDetailsSchema>;

export type AcademicResource = typeof academicResources.$inferSelect;
export type InsertAcademicResource = z.infer<typeof insertAcademicResourceSchema>;

export type AcademicEmbedding = typeof academicEmbeddings.$inferSelect;
export type InsertAcademicEmbedding = z.infer<typeof insertAcademicEmbeddingSchema>;

export type CsrSegment = typeof csrSegments.$inferSelect;
export type InsertCsrSegment = z.infer<typeof insertCsrSegmentSchema>;

export type StrategicReport = typeof strategicReports.$inferSelect;

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  // Will be extended as additional tables are related to users
}));

export const trialsRelations = relations(trials, ({ many }) => ({
  // Define relations here when needed
}));

export const csrReportsRelations = relations(csrReports, ({ one }) => ({
  details: one(csrDetails, {
    fields: [csrReports.id],
    references: [csrDetails.reportId],
  }),
}));

export const csrDetailsRelations = relations(csrDetails, ({ one }) => ({
  report: one(csrReports, {
    fields: [csrDetails.reportId],
    references: [csrReports.id],
  }),
}));

export const academicResourcesRelations = relations(academicResources, ({ many }) => ({
  embeddings: many(academicEmbeddings),
}));

export const academicEmbeddingsRelations = relations(academicEmbeddings, ({ one }) => ({
  resource: one(academicResources, {
    fields: [academicEmbeddings.resourceId],
    references: [academicResources.id],
  }),
}));

export const csrSegmentsRelations = relations(csrSegments, ({ one }) => ({
  report: one(csrReports, {
    fields: [csrSegments.reportId],
    references: [csrReports.id],
  }),
}));

// Strategic Reports table - for storing generated strategic reports
export const strategicReports = pgTable('strategic_reports', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  protocolId: integer('protocol_id').references(() => trials.id),
  indication: text('indication').notNull(),
  phase: text('phase').notNull(),
  reportType: text('report_type').notNull(),
  content: text('content').notNull(),
  generatedDate: timestamp('generated_date').defaultNow(),
  updatedDate: timestamp('updated_date').defaultNow(),
  userId: integer('user_id').references(() => users.id),
  status: text('status').default('draft'),
  version: text('version').default('1.0'),
});

export const strategicReportsRelations = relations(strategicReports, ({ one }) => ({
  protocol: one(trials, {
    fields: [strategicReports.protocolId],
    references: [trials.id],
  }),
  user: one(users, {
    fields: [strategicReports.userId],
    references: [users.id],
  }),
}));

// Define insert schema for Strategic Reports
export const insertStrategicReportSchema = createInsertSchema(strategicReports, {
  // Add additional validation if needed
}).omit({ id: true, generatedDate: true, updatedDate: true });

export type InsertStrategicReport = z.infer<typeof insertStrategicReportSchema>;