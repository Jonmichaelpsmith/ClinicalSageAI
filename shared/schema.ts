import { pgTable, serial, text, integer, timestamp, boolean, varchar, pgEnum, json } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';

// Enums
export const phaseEnum = pgEnum('phase', [
  'Phase 1',
  'Phase 2',
  'Phase 3',
  'Phase 4',
  'Not Applicable'
]);

export const statusEnum = pgEnum('status', [
  'draft',
  'in_progress',
  'completed',
  'archived',
  'published'
]);

// Users
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  email: text('email'),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// CSR Reports
export const csrReports = pgTable('csr_reports', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  sponsor: text('sponsor'),
  indication: text('indication'),
  phase: phaseEnum('phase'),
  fileName: text('file_name'),
  fileSize: integer('file_size'),
  uploadDate: timestamp('upload_date').defaultNow(),
  summary: text('summary'),
  status: statusEnum('status').default('draft'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// CSR Details
export const csrDetails = pgTable('csr_details', {
  id: serial('id').primaryKey(),
  reportId: integer('report_id').references(() => csrReports.id),
  studyDesign: text('study_design'),
  primaryObjective: text('primary_objective'),
  secondaryObjectives: text('secondary_objectives').array(),
  studyDescription: text('study_description'),
  inclusionCriteria: text('inclusion_criteria').array(),
  exclusionCriteria: text('exclusion_criteria').array(),
  endpoints: text('endpoints').array(),
  treatmentArms: text('treatment_arms').array(),
  population: text('population'),
  results: json('results'),
  safety: json('safety'),
  limitations: text('limitations'),
  conclusions: text('conclusions'),
  processed: boolean('processed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// CSR Segments
export const csrSegments = pgTable('csr_segments', {
  id: serial('id').primaryKey(),
  reportId: integer('report_id').references(() => csrReports.id),
  sectionTitle: text('section_title'),
  sectionNumber: text('section_number'),
  content: text('content'),
  pageNumber: integer('page_number'),
  createdAt: timestamp('created_at').defaultNow()
});

// Projects
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  project_id: text('project_id').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  created_by: text('created_by'),
  status: statusEnum('status').default('in_progress'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

// Summary Packets
export const summaryPackets = pgTable('summary_packets', {
  id: serial('id').primaryKey(),
  project_id: text('project_id').references(() => projects.project_id),
  title: text('title').notNull(),
  summary: text('summary'),
  content: json('content'),
  tags: text('tags').array().default([]),
  version: integer('version').default(1),
  is_latest: boolean('is_latest').default(true),
  share_id: text('share_id'),
  shared_with: text('shared_with').array().default([]),
  access_count: integer('access_count').default(0),
  last_accessed: timestamp('last_accessed'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

// Study Sessions
export const studySessions = pgTable('study_sessions', {
  id: serial('id').primaryKey(),
  session_id: text('session_id').notNull().unique(),
  project_id: text('project_id').references(() => projects.project_id),
  title: text('title').notNull(),
  description: text('description'),
  status: statusEnum('status').default('in_progress'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

// Insight Memories
export const insightMemories = pgTable('insight_memories', {
  id: serial('id').primaryKey(),
  project_id: text('project_id').references(() => projects.project_id),
  session_id: text('session_id').references(() => studySessions.session_id),
  insight: text('insight').notNull(),
  source: text('source'),
  context: text('context'),
  status: statusEnum('status').default('draft'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

// Wisdom Traces
export const wisdomTraces = pgTable('wisdom_traces', {
  id: serial('id').primaryKey(),
  trace_id: text('trace_id').notNull().unique(),
  project_id: text('project_id').references(() => projects.project_id),
  session_id: text('session_id').references(() => studySessions.session_id),
  content: text('content').notNull(),
  source_type: text('source_type'),
  source_id: text('source_id'),
  context: json('context'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

// Clinical Evaluation Reports
export const clinicalEvaluationReports = pgTable('clinical_evaluation_reports', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  device_name: text('device_name'),
  manufacturer: text('manufacturer'),
  version: text('version'),
  date: timestamp('date').defaultNow(),
  author: text('author'),
  reviewers: text('reviewers').array(),
  summary: text('summary'),
  status: statusEnum('status').default('draft'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

// Strategic Reports
export const strategicReports = pgTable('strategic_reports', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  recommendations: text('recommendations').array(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

// Protocols
export const protocols = pgTable('protocols', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  protocol_id: text('protocol_id').notNull().unique(),
  sponsor: text('sponsor'),
  indication: text('indication'),
  phase: phaseEnum('phase'),
  content: json('content'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

// Protocol Assessments
export const protocolAssessments = pgTable('protocol_assessments', {
  id: serial('id').primaryKey(),
  protocol_id: text('protocol_id').references(() => protocols.protocol_id),
  assessment_id: text('assessment_id').notNull().unique(),
  similar_csr_ids: integer('similar_csr_ids').array(),
  score: integer('score'),
  recommendations: json('recommendations'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

// Protocol Assessment Feedback
export const protocolAssessmentFeedback = pgTable('protocol_assessment_feedback', {
  id: serial('id').primaryKey(),
  assessment_id: text('assessment_id').references(() => protocolAssessments.assessment_id),
  user_id: integer('user_id').references(() => users.id),
  feedback: text('feedback').notNull(),
  rating: integer('rating'),
  created_at: timestamp('created_at').defaultNow()
});

// Academic Sources
export const academicSources = pgTable('academic_sources', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  authors: text('authors').array(),
  publication: text('publication'),
  year: integer('year'),
  doi: text('doi'),
  url: text('url'),
  abstract: text('abstract'),
  full_text: text('full_text'),
  created_at: timestamp('created_at').defaultNow()
});

// Create Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCsrReportSchema = createInsertSchema(csrReports).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCsrDetailsSchema = createInsertSchema(csrDetails).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCsrSegmentSchema = createInsertSchema(csrSegments).omit({ id: true, createdAt: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, created_at: true, updated_at: true });
export const insertSummaryPacketSchema = createInsertSchema(summaryPackets).omit({ id: true, created_at: true, updated_at: true });
export const insertStudySessionSchema = createInsertSchema(studySessions).omit({ id: true, created_at: true, updated_at: true });
export const insertInsightMemorySchema = createInsertSchema(insightMemories).omit({ id: true, created_at: true, updated_at: true });
export const insertWisdomTraceSchema = createInsertSchema(wisdomTraces).omit({ id: true, created_at: true, updated_at: true });
export const insertClinicalEvaluationReportSchema = createInsertSchema(clinicalEvaluationReports).omit({ id: true, created_at: true, updated_at: true });
export const insertStrategicReportSchema = createInsertSchema(strategicReports).omit({ id: true, created_at: true, updated_at: true });
export const insertProtocolSchema = createInsertSchema(protocols).omit({ id: true, created_at: true, updated_at: true });
export const insertProtocolAssessmentSchema = createInsertSchema(protocolAssessments).omit({ id: true, created_at: true, updated_at: true });
export const insertProtocolAssessmentFeedbackSchema = createInsertSchema(protocolAssessmentFeedback).omit({ id: true, created_at: true });
export const insertAcademicSourceSchema = createInsertSchema(academicSources).omit({ id: true, created_at: true });

// Type definitions for use with TypeScript
export type User = InferSelectModel<typeof users>;
export type InsertUser = InferInsertModel<typeof users>;

export type CsrReport = InferSelectModel<typeof csrReports>;
export type InsertCsrReport = InferInsertModel<typeof csrReports>;

export type CsrDetails = InferSelectModel<typeof csrDetails>;
export type InsertCsrDetails = InferInsertModel<typeof csrDetails>;

export type CsrSegment = InferSelectModel<typeof csrSegments>;
export type InsertCsrSegment = InferInsertModel<typeof csrSegments>;

export type Project = InferSelectModel<typeof projects>;
export type InsertProject = InferInsertModel<typeof projects>;

export type SummaryPacket = InferSelectModel<typeof summaryPackets>;
export type InsertSummaryPacket = InferInsertModel<typeof summaryPackets>;

export type StudySession = InferSelectModel<typeof studySessions>;
export type InsertStudySession = InferInsertModel<typeof studySessions>;

export type InsightMemory = InferSelectModel<typeof insightMemories>;
export type InsertInsightMemory = InferInsertModel<typeof insightMemories>;

export type WisdomTrace = InferSelectModel<typeof wisdomTraces>;
export type InsertWisdomTrace = InferInsertModel<typeof wisdomTraces>;

export type ClinicalEvaluationReport = InferSelectModel<typeof clinicalEvaluationReports>;
export type InsertClinicalEvaluationReport = InferInsertModel<typeof clinicalEvaluationReports>;

export type StrategicReport = InferSelectModel<typeof strategicReports>;
export type InsertStrategicReport = InferInsertModel<typeof strategicReports>;

export type Protocol = InferSelectModel<typeof protocols>;
export type InsertProtocol = InferInsertModel<typeof protocols>;

export type ProtocolAssessment = InferSelectModel<typeof protocolAssessments>;
export type InsertProtocolAssessment = InferInsertModel<typeof protocolAssessments>;

export type ProtocolAssessmentFeedback = InferSelectModel<typeof protocolAssessmentFeedback>;
export type InsertProtocolAssessmentFeedback = InferInsertModel<typeof protocolAssessmentFeedback>;

export type AcademicSource = InferSelectModel<typeof academicSources>;
export type InsertAcademicSource = InferInsertModel<typeof academicSources>;
