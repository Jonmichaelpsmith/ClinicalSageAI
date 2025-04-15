/**
 * Comprehensive Clinical Study Report (CSR) Semantic Data Model
 * 
 * This schema implements a standardized data model for Clinical Study Reports
 * based on ICH E3 guidelines "Structure and Content of Clinical Study Reports".
 * 
 * The model ensures consistency across all CSR data and provides a robust
 * foundation for analytics, search, and intelligence features.
 * 
 * Schema encompasses:
 * - Core CSR Metadata
 * - CSR Structure (Sections & Hierarchy)
 * - Study Design & Methodology
 * - Patient Demographics & Disposition
 * - Efficacy & Safety Measures
 * - Analysis Results
 * - Relationships between different CSR entities
 */

import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  varchar,
  timestamp,
  text,
  integer,
  json,
  boolean,
  uuid,
  doublePrecision,
  date,
  jsonb,
  char,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// =========================================================================
// CORE CSR TABLES
// =========================================================================

/**
 * Clinical Study Report (CSR) Primary Table
 * 
 * Contains core metadata about the Clinical Study Report
 */
export const csrReports = pgTable("csr_reports", {
  id: serial("id").primaryKey(),
  csr_id: varchar("csr_id", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 500 }),
  study_id: varchar("study_id", { length: 100 }),
  protocol_id: varchar("protocol_id", { length: 100 }),
  nctrial_id: varchar("nctrial_id", { length: 100 }),
  sponsor: varchar("sponsor", { length: 250 }),
  sponsor_id: integer("sponsor_id"),
  indication: varchar("indication", { length: 250 }),
  therapeutic_area: varchar("therapeutic_area", { length: 250 }),
  phase: varchar("phase", { length: 50 }),
  drug_name: varchar("drug_name", { length: 250 }),
  region: varchar("region", { length: 100 }),
  file_name: varchar("file_name", { length: 500 }),
  file_path: varchar("file_path", { length: 1000 }),
  file_size: integer("file_size"),
  upload_date: timestamp("upload_date").defaultNow(),
  report_date: date("report_date"),
  summary: text("summary"),
  status: varchar("status", { length: 50 }).default("active"),
  source: varchar("source", { length: 100 }).default("manual"),
  processed_at: timestamp("processed_at"),
  vectorized: boolean("vectorized").default(false),
  has_details: boolean("has_details").default(false),
  deleted_at: timestamp("deleted_at"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

/**
 * Detailed CSR Information Table
 * 
 * Contains comprehensive extracted information from the CSR document
 * This extends the basic metadata with detailed content extracted
 * from the full CSR document
 */
export const csrDetails = pgTable("csr_details", {
  id: serial("id").primaryKey(),
  report_id: integer("report_id").notNull().references(() => csrReports.id, { onDelete: "cascade" }),
  
  // Study Design Information
  study_design: text("study_design"),
  study_type: varchar("study_type", { length: 100 }),
  design_features: json("design_features").$type<string[]>(),
  randomization: varchar("randomization", { length: 100 }),
  blinding: varchar("blinding", { length: 100 }),
  control_type: varchar("control_type", { length: 100 }),
  
  // Study Objectives
  primary_objective: text("primary_objective"),
  secondary_objectives: json("secondary_objectives").$type<string[]>(),
  exploratory_objectives: json("exploratory_objectives").$type<string[]>(),
  
  // Study Description & Context
  study_description: text("study_description"),
  inclusion_criteria: text("inclusion_criteria"),
  exclusion_criteria: text("exclusion_criteria"),
  population: text("population"),
  
  // Study Timeline & Duration
  study_start_date: date("study_start_date"),
  study_end_date: date("study_end_date"),
  study_duration: varchar("study_duration", { length: 100 }),
  follow_up_period: varchar("follow_up_period", { length: 100 }),
  
  // Participant Information
  sample_size: integer("sample_size"),
  enrollment_details: json("enrollment_details"),
  age_range: varchar("age_range", { length: 100 }),
  gender_distribution: json("gender_distribution"),
  ethnicity_distribution: json("ethnicity_distribution"),
  
  // Treatment & Intervention
  treatment_arms: jsonb("treatment_arms"),
  intervention_details: jsonb("intervention_details"),
  dosing_regimen: text("dosing_regimen"),
  comparator_details: text("comparator_details"),
  
  // Endpoints & Analysis
  endpoints: jsonb("endpoints"),
  primary_endpoints: json("primary_endpoints").$type<string[]>(),
  secondary_endpoints: json("secondary_endpoints").$type<string[]>(),
  statistical_methods: jsonb("statistical_methods"),
  analysis_population: text("analysis_population"),
  hypothesis: text("hypothesis"),
  
  // Results
  results: jsonb("results"),
  efficacy_results: jsonb("efficacy_results"),
  safety_results: jsonb("safety_results"),
  conclusions: text("conclusions"),
  limitations: text("limitations"),
  
  // Safety Information
  safety: jsonb("safety"),
  adverse_events: jsonb("adverse_events"),
  serious_adverse_events: jsonb("serious_adverse_events"),
  sae_count: integer("sae_count"),
  teae_count: integer("teae_count"),
  
  // Study Completion
  completion_rate: doublePrecision("completion_rate"),
  discontinuation_reasons: json("discontinuation_reasons"),
  
  // Processing Information
  processing_status: varchar("processing_status", { length: 50 }).default("pending"),
  processed: boolean("processed").default(false),
  extraction_date: timestamp("extraction_date").defaultNow(),
  processing_log: json("processing_log"),
  confidence_score: doublePrecision("confidence_score"),
  last_updated: timestamp("last_updated").defaultNow(),
});

/**
 * CSR Document Segments
 * 
 * Stores individual sections of the CSR document
 * Enables fine-grained search and vectorization on specific parts
 */
export const csrSegments = pgTable("csr_segments", {
  id: serial("id").primaryKey(),
  report_id: integer("report_id").notNull().references(() => csrReports.id, { onDelete: "cascade" }),
  section_id: varchar("section_id", { length: 50 }).notNull(),
  section_type: varchar("section_type", { length: 100 }).notNull(),
  section_title: varchar("section_title", { length: 500 }),
  section_number: varchar("section_number", { length: 50 }),
  parent_section_id: varchar("parent_section_id", { length: 50 }),
  content: text("content"),
  page_start: integer("page_start"),
  page_end: integer("page_end"),
  extracted_entities: jsonb("extracted_entities"),
  vector_embedding: json("vector_embedding").$type<number[]>(),
  confidence_score: doublePrecision("confidence_score"),
  created_at: timestamp("created_at").defaultNow(),
});

/**
 * CSR Tables, Figures, and Listings
 * 
 * Stores tables, figures, and listings from the CSR document
 */
export const csrElements = pgTable("csr_elements", {
  id: serial("id").primaryKey(),
  report_id: integer("report_id").notNull().references(() => csrReports.id, { onDelete: "cascade" }),
  segment_id: integer("segment_id").references(() => csrSegments.id, { onDelete: "set null" }),
  element_type: varchar("element_type", { length: 50 }).notNull(), // 'table', 'figure', 'listing'
  element_id: varchar("element_id", { length: 50 }),
  title: text("title"),
  content_text: text("content_text"),
  content_json: jsonb("content_json"),
  page_number: integer("page_number"),
  extracted_data: jsonb("extracted_data"),
  created_at: timestamp("created_at").defaultNow(),
});

// =========================================================================
// THERAPEUTIC AREAS & TRIAL ONTOLOGIES
// =========================================================================

/**
 * Therapeutic Areas
 * 
 * Standardized list of therapeutic areas with hierarchical relationships
 */
export const therapeuticAreas = pgTable("therapeutic_areas", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 250 }).notNull().unique(),
  parent_id: integer("parent_id").references(() => therapeuticAreas.id),
  description: text("description"),
  synonyms: json("synonyms").$type<string[]>(),
  mesh_id: varchar("mesh_id", { length: 100 }),
  created_at: timestamp("created_at").defaultNow(),
});

/**
 * Indications
 * 
 * Standardized list of indications linked to therapeutic areas
 */
export const indications = pgTable("indications", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 250 }).notNull().unique(),
  therapeutic_area_id: integer("therapeutic_area_id").references(() => therapeuticAreas.id),
  description: text("description"),
  synonyms: json("synonyms").$type<string[]>(),
  mesh_id: varchar("mesh_id", { length: 100 }),
  created_at: timestamp("created_at").defaultNow(),
});

/**
 * Study Phases
 * 
 * Standardized list of study phases
 */
export const studyPhases = pgTable("study_phases", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow(),
});

// =========================================================================
// ENDPOINT AND OUTCOME MEASURE DICTIONARY
// =========================================================================

/**
 * Endpoint Categories
 * 
 * Standardized categories of clinical trial endpoints
 */
export const endpointCategories = pgTable("endpoint_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 250 }).notNull().unique(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow(),
});

/**
 * Standard Endpoints
 * 
 * Dictionary of standardized endpoints
 */
export const standardEndpoints = pgTable("standard_endpoints", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 250 }).notNull(),
  category_id: integer("category_id").references(() => endpointCategories.id),
  description: text("description"),
  measure_type: varchar("measure_type", { length: 100 }),
  time_frame: varchar("time_frame", { length: 250 }),
  synonyms: json("synonyms").$type<string[]>(),
  therapeutic_areas: json("therapeutic_areas").$type<number[]>(), // Array of therapeutic_area IDs
  frequency: integer("frequency").default(0), // How often this endpoint appears across all CSRs
  created_at: timestamp("created_at").defaultNow(),
});

/**
 * CSR-Endpoint Mapping
 * 
 * Maps CSRs to standardized endpoints
 */
export const csrEndpoints = pgTable("csr_endpoints", {
  id: serial("id").primaryKey(),
  report_id: integer("report_id").notNull().references(() => csrReports.id, { onDelete: "cascade" }),
  endpoint_id: integer("endpoint_id").references(() => standardEndpoints.id),
  endpoint_type: varchar("endpoint_type", { length: 50 }).notNull(), // 'primary', 'secondary', 'exploratory'
  custom_endpoint_name: varchar("custom_endpoint_name", { length: 500 }),
  description: text("description"),
  measure_type: varchar("measure_type", { length: 100 }),
  time_frame: varchar("time_frame", { length: 250 }),
  results: jsonb("results"),
  statistical_significance: boolean("statistical_significance"),
  p_value: doublePrecision("p_value"),
  confidence_interval: varchar("confidence_interval", { length: 100 }),
  created_at: timestamp("created_at").defaultNow(),
});

// =========================================================================
// ANALYTICS & VECTORIZATION
// =========================================================================

/**
 * CSR Vector Embeddings
 * 
 * Stores vector embeddings for semantic search and analysis
 */
export const csrEmbeddings = pgTable("csr_embeddings", {
  id: serial("id").primaryKey(),
  report_id: integer("report_id").notNull().references(() => csrReports.id, { onDelete: "cascade" }),
  segment_id: integer("segment_id").references(() => csrSegments.id),
  embedding_type: varchar("embedding_type", { length: 50 }).notNull(),
  model_name: varchar("model_name", { length: 100 }).notNull(),
  vector_dimension: integer("vector_dimension").notNull(),
  embedding_vector: json("embedding_vector").$type<number[]>().notNull(),
  embedding_text: text("embedding_text"),
  created_at: timestamp("created_at").defaultNow(),
});

/**
 * CSR Search Keywords
 * 
 * Stores extracted keywords and entities for improved search
 */
export const csrKeywords = pgTable("csr_keywords", {
  id: serial("id").primaryKey(),
  report_id: integer("report_id").notNull().references(() => csrReports.id, { onDelete: "cascade" }),
  segment_id: integer("segment_id").references(() => csrSegments.id),
  keyword: varchar("keyword", { length: 250 }).notNull(),
  keyword_type: varchar("keyword_type", { length: 50 }),
  relevance_score: doublePrecision("relevance_score"),
  frequency: integer("frequency").default(1),
  created_at: timestamp("created_at").defaultNow(),
});

// =========================================================================
// RELATIONS
// =========================================================================

export const csrReportsRelations = relations(csrReports, ({ one, many }) => ({
  details: one(csrDetails, {
    fields: [csrReports.id],
    references: [csrDetails.report_id],
  }),
  segments: many(csrSegments),
  elements: many(csrElements),
  endpoints: many(csrEndpoints),
  embeddings: many(csrEmbeddings),
  keywords: many(csrKeywords),
}));

export const csrDetailsRelations = relations(csrDetails, ({ one }) => ({
  report: one(csrReports, {
    fields: [csrDetails.report_id],
    references: [csrReports.id],
  }),
}));

export const csrSegmentsRelations = relations(csrSegments, ({ one, many }) => ({
  report: one(csrReports, {
    fields: [csrSegments.report_id],
    references: [csrReports.id],
  }),
  elements: many(csrElements),
  embeddings: many(csrEmbeddings),
  keywords: many(csrKeywords),
}));

export const csrElementsRelations = relations(csrElements, ({ one }) => ({
  report: one(csrReports, {
    fields: [csrElements.report_id],
    references: [csrReports.id],
  }),
  segment: one(csrSegments, {
    fields: [csrElements.segment_id],
    references: [csrSegments.id],
  }),
}));

export const therapeuticAreasRelations = relations(therapeuticAreas, ({ one, many }) => ({
  parent: one(therapeuticAreas, {
    fields: [therapeuticAreas.parent_id],
    references: [therapeuticAreas.id],
  }),
  children: many(therapeuticAreas),
  indications: many(indications),
}));

export const indicationsRelations = relations(indications, ({ one }) => ({
  therapeuticArea: one(therapeuticAreas, {
    fields: [indications.therapeutic_area_id],
    references: [therapeuticAreas.id],
  }),
}));

export const endpointCategoriesRelations = relations(endpointCategories, ({ many }) => ({
  endpoints: many(standardEndpoints),
}));

export const standardEndpointsRelations = relations(standardEndpoints, ({ one, many }) => ({
  category: one(endpointCategories, {
    fields: [standardEndpoints.category_id],
    references: [endpointCategories.id],
  }),
  csrEndpoints: many(csrEndpoints),
}));

export const csrEndpointsRelations = relations(csrEndpoints, ({ one }) => ({
  report: one(csrReports, {
    fields: [csrEndpoints.report_id],
    references: [csrReports.id],
  }),
  standardEndpoint: one(standardEndpoints, {
    fields: [csrEndpoints.endpoint_id],
    references: [standardEndpoints.id],
  }),
}));

export const csrEmbeddingsRelations = relations(csrEmbeddings, ({ one }) => ({
  report: one(csrReports, {
    fields: [csrEmbeddings.report_id],
    references: [csrReports.id],
  }),
  segment: one(csrSegments, {
    fields: [csrEmbeddings.segment_id],
    references: [csrSegments.id],
  }),
}));

export const csrKeywordsRelations = relations(csrKeywords, ({ one }) => ({
  report: one(csrReports, {
    fields: [csrKeywords.report_id],
    references: [csrReports.id],
  }),
  segment: one(csrSegments, {
    fields: [csrKeywords.segment_id],
    references: [csrSegments.id],
  }),
}));

// =========================================================================
// INSERT SCHEMAS WITH ZOD
// =========================================================================

// CSR Reports insert schema
export const insertCsrReportSchema = createInsertSchema(csrReports)
  .omit({ id: true, created_at: true, updated_at: true, processed_at: true, deleted_at: true });

// CSR Details insert schema
export const insertCsrDetailSchema = createInsertSchema(csrDetails)
  .omit({ id: true, extraction_date: true, last_updated: true });

// CSR Segments insert schema
export const insertCsrSegmentSchema = createInsertSchema(csrSegments)
  .omit({ id: true, created_at: true });

// CSR Elements insert schema
export const insertCsrElementSchema = createInsertSchema(csrElements)
  .omit({ id: true, created_at: true });

// Therapeutic Areas insert schema
export const insertTherapeuticAreaSchema = createInsertSchema(therapeuticAreas)
  .omit({ id: true, created_at: true });

// Indications insert schema
export const insertIndicationSchema = createInsertSchema(indications)
  .omit({ id: true, created_at: true });

// Study Phases insert schema
export const insertStudyPhaseSchema = createInsertSchema(studyPhases)
  .omit({ id: true, created_at: true });

// Endpoint Categories insert schema
export const insertEndpointCategorySchema = createInsertSchema(endpointCategories)
  .omit({ id: true, created_at: true });

// Standard Endpoints insert schema
export const insertStandardEndpointSchema = createInsertSchema(standardEndpoints)
  .omit({ id: true, created_at: true });

// CSR Endpoints insert schema
export const insertCsrEndpointSchema = createInsertSchema(csrEndpoints)
  .omit({ id: true, created_at: true });

// CSR Embeddings insert schema
export const insertCsrEmbeddingSchema = createInsertSchema(csrEmbeddings)
  .omit({ id: true, created_at: true });

// CSR Keywords insert schema
export const insertCsrKeywordSchema = createInsertSchema(csrKeywords)
  .omit({ id: true, created_at: true });

// =========================================================================
// TYPE DEFINITIONS
// =========================================================================

// Define TypeScript types from schema
export type CsrReport = typeof csrReports.$inferSelect;
export type InsertCsrReport = z.infer<typeof insertCsrReportSchema>;

export type CsrDetail = typeof csrDetails.$inferSelect;
export type InsertCsrDetail = z.infer<typeof insertCsrDetailSchema>;

export type CsrSegment = typeof csrSegments.$inferSelect;
export type InsertCsrSegment = z.infer<typeof insertCsrSegmentSchema>;

export type CsrElement = typeof csrElements.$inferSelect;
export type InsertCsrElement = z.infer<typeof insertCsrElementSchema>;

export type TherapeuticArea = typeof therapeuticAreas.$inferSelect;
export type InsertTherapeuticArea = z.infer<typeof insertTherapeuticAreaSchema>;

export type Indication = typeof indications.$inferSelect;
export type InsertIndication = z.infer<typeof insertIndicationSchema>;

export type StudyPhase = typeof studyPhases.$inferSelect;
export type InsertStudyPhase = z.infer<typeof insertStudyPhaseSchema>;

export type EndpointCategory = typeof endpointCategories.$inferSelect;
export type InsertEndpointCategory = z.infer<typeof insertEndpointCategorySchema>;

export type StandardEndpoint = typeof standardEndpoints.$inferSelect;
export type InsertStandardEndpoint = z.infer<typeof insertStandardEndpointSchema>;

export type CsrEndpoint = typeof csrEndpoints.$inferSelect;
export type InsertCsrEndpoint = z.infer<typeof insertCsrEndpointSchema>;

export type CsrEmbedding = typeof csrEmbeddings.$inferSelect;
export type InsertCsrEmbedding = z.infer<typeof insertCsrEmbeddingSchema>;

export type CsrKeyword = typeof csrKeywords.$inferSelect;
export type InsertCsrKeyword = z.infer<typeof insertCsrKeywordSchema>;