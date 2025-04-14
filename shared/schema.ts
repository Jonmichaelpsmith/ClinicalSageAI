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
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Table for summary packets
export const summaryPackets = pgTable("summary_packets", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  protocol: text("protocol").notNull(),
  ind25: text("ind25"),
  ind27: text("ind27"),
  sap: text("sap"),
  risks: json("risks").$type<string[]>().notNull().default(sql`'[]'`),
  success_probability: integer("success_probability").notNull(),
  sample_size: integer("sample_size").notNull(),
  version: integer("version").notNull().default(1),
  pdf_path: varchar("pdf_path", { length: 255 }).notNull(),
  is_latest: boolean("is_latest").notNull().default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
  project_id: varchar("project_id", { length: 255 }),
  share_id: uuid("share_id").defaultRandom(),
  tags: json("tags").$type<string[]>().notNull().default(sql`'[]'`),
  shared_with: json("shared_with").$type<string[]>().notNull().default(sql`'[]'`),
  access_count: integer("access_count").notNull().default(0),
  last_accessed: timestamp("last_accessed"),
});

// Table for projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  project_id: varchar("project_id", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const projectsRelations = relations(projects, ({ many }) => ({
  summaryPackets: many(summaryPackets),
}));

export const summaryPacketsRelations = relations(summaryPackets, ({ one }) => ({
  project: one(projects, {
    fields: [summaryPackets.project_id],
    references: [projects.project_id],
  }),
}));

// Zod schemas
export const insertSummaryPacketSchema = createInsertSchema(summaryPackets, {
  risks: z.array(z.string()),
  tags: z.array(z.string()),
  shared_with: z.array(z.string()),
})
.omit({ id: true, created_at: true, last_accessed: true });

export const insertProjectSchema = createInsertSchema(projects)
.omit({ id: true, created_at: true, updated_at: true });

// Insight Memory table
export const insightMemories = pgTable("insight_memories", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  source: varchar("source", { length: 255 }),
  confidence: integer("confidence"),
  category: varchar("category", { length: 50 }),
  impact: varchar("impact", { length: 50 }),
  status: varchar("status", { length: 50 }).notNull().default("Pending Review"),
  tags: json("tags").$type<string[]>().notNull().default(sql`'[]'`),
  created_at: timestamp("created_at").defaultNow().notNull(),
  project_id: varchar("project_id", { length: 255 }),
  session_id: varchar("session_id", { length: 255 }),
  evidence: json("evidence"),
});

// Wisdom Trace table
export const wisdomTraces = pgTable("wisdom_traces", {
  id: serial("id").primaryKey(),
  trace_id: uuid("trace_id").defaultRandom().notNull().unique(),
  query: text("query").notNull(),
  recommendation: text("recommendation").notNull(),
  confidence_score: integer("confidence_score"),
  data_sources: json("data_sources"),
  reasoning_path: json("reasoning_path"),
  evidence_highlights: json("evidence_highlights"),
  alternative_options: json("alternative_options"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  project_id: varchar("project_id", { length: 255 }),
  session_id: varchar("session_id", { length: 255 }),
  user_context: json("user_context"),
});

// Study Session table
export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  session_id: varchar("session_id", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("Active"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  project_id: varchar("project_id", { length: 255 }),
  metadata: json("metadata"),
});

// Extended Relations - updated to merge with existing projectsRelations
export const projectsExtendedRelations = relations(projects, ({ many }) => ({
  summaryPackets: many(summaryPackets),
  insightMemories: many(insightMemories),
  wisdomTraces: many(wisdomTraces),
  studySessions: many(studySessions),
}));

export const studySessionsRelations = relations(studySessions, ({ one, many }) => ({
  project: one(projects, {
    fields: [studySessions.project_id],
    references: [projects.project_id],
  }),
  insightMemories: many(insightMemories),
  wisdomTraces: many(wisdomTraces),
}));

export const insightMemoriesRelations = relations(insightMemories, ({ one }) => ({
  project: one(projects, {
    fields: [insightMemories.project_id],
    references: [projects.project_id],
  }),
  session: one(studySessions, {
    fields: [insightMemories.session_id],
    references: [studySessions.session_id],
  }),
}));

export const wisdomTracesRelations = relations(wisdomTraces, ({ one }) => ({
  project: one(projects, {
    fields: [wisdomTraces.project_id],
    references: [projects.project_id],
  }),
  session: one(studySessions, {
    fields: [wisdomTraces.session_id],
    references: [studySessions.session_id],
  }),
}));

// Additional Zod schemas
export const insertInsightMemorySchema = createInsertSchema(insightMemories, {
  tags: z.array(z.string()),
})
.omit({ id: true, created_at: true });

export const insertWisdomTraceSchema = createInsertSchema(wisdomTraces)
.omit({ id: true, created_at: true });

export const insertStudySessionSchema = createInsertSchema(studySessions)
.omit({ id: true, created_at: true, updated_at: true });

// Protocols table
export const protocols = pgTable("protocols", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  indication: varchar("indication", { length: 100 }).notNull(),
  phase: varchar("phase", { length: 50 }).notNull(),
  primary_endpoints: json("primary_endpoints").$type<string[]>().notNull().default(sql`'[]'`),
  secondary_endpoints: json("secondary_endpoints").$type<string[]>().notNull().default(sql`'[]'`),
  sample_size: integer("sample_size"),
  duration: integer("duration"),
  control_type: varchar("control_type", { length: 100 }),
  blinding: varchar("blinding", { length: 50 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  version: integer("version").notNull().default(1),
  project_id: varchar("project_id", { length: 255 }),
  session_id: varchar("session_id", { length: 255 }),
  validation_status: json("validation_status"),
  pdf_path: varchar("pdf_path", { length: 255 }),
});

// Strategic Reports table
export const strategicReports = pgTable("strategic_reports", {
  id: serial("id").primaryKey(),
  protocol_id: integer("protocol_id").references(() => protocols.id),
  title: varchar("title", { length: 255 }).notNull(),
  indication: varchar("indication", { length: 100 }).notNull(),
  phase: varchar("phase", { length: 50 }).notNull(),
  success_probability: doublePrecision("success_probability").notNull(),
  confidence: doublePrecision("confidence").notNull().default(0.8),
  key_factors: json("key_factors"),
  benchmark_data: json("benchmark_data"),
  endpoint_analysis: json("endpoint_analysis"),
  primary_risks: json("primary_risks"),
  risk_breakdown: json("risk_breakdown"),
  mitigation_strategies: json("mitigation_strategies"),
  competitive_analysis: json("competitive_analysis"),
  strategic_recommendations: json("strategic_recommendations"),
  sample_size: integer("sample_size"),
  duration: integer("duration"),
  control_type: varchar("control_type", { length: 100 }),
  blinding: varchar("blinding", { length: 50 }),
  primary_endpoints: json("primary_endpoints").$type<string[]>().notNull().default(sql`'[]'`),
  pdf_path: varchar("pdf_path", { length: 255 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  project_id: varchar("project_id", { length: 255 }),
  session_id: varchar("session_id", { length: 255 }),
});

// Protocol Relations
export const protocolsRelations = relations(protocols, ({ one, many }) => ({
  project: one(projects, {
    fields: [protocols.project_id],
    references: [projects.project_id],
  }),
  session: one(studySessions, {
    fields: [protocols.session_id],
    references: [studySessions.session_id],
  }),
  strategicReports: many(strategicReports),
}));

// Strategic Report Relations
export const strategicReportsRelations = relations(strategicReports, ({ one }) => ({
  protocol: one(protocols, {
    fields: [strategicReports.protocol_id],
    references: [protocols.id],
  }),
  project: one(projects, {
    fields: [strategicReports.project_id],
    references: [projects.project_id],
  }),
  session: one(studySessions, {
    fields: [strategicReports.session_id],
    references: [studySessions.session_id],
  }),
}));

// Additional Schemas
export const insertProtocolSchema = createInsertSchema(protocols)
  .omit({ id: true, created_at: true, updated_at: true });

export const insertStrategicReportSchema = createInsertSchema(strategicReports)
  .omit({ id: true, created_at: true });

// Updated Projects Relations to include new tables
export const projectsCompleteRelations = relations(projects, ({ many }) => ({
  summaryPackets: many(summaryPackets),
  insightMemories: many(insightMemories),
  wisdomTraces: many(wisdomTraces),
  studySessions: many(studySessions),
  protocols: many(protocols),
  strategicReports: many(strategicReports),
}));

// Update Study Sessions Relations
export const studySessionsCompleteRelations = relations(studySessions, ({ one, many }) => ({
  project: one(projects, {
    fields: [studySessions.project_id],
    references: [projects.project_id],
  }),
  insightMemories: many(insightMemories),
  wisdomTraces: many(wisdomTraces),
  protocols: many(protocols),
  strategicReports: many(strategicReports),
}));

// Types
export type SummaryPacket = typeof summaryPackets.$inferSelect;
export type InsertSummaryPacket = z.infer<typeof insertSummaryPacketSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsightMemory = typeof insightMemories.$inferSelect;
export type InsertInsightMemory = z.infer<typeof insertInsightMemorySchema>;
export type WisdomTrace = typeof wisdomTraces.$inferSelect;
export type InsertWisdomTrace = z.infer<typeof insertWisdomTraceSchema>;
export type StudySession = typeof studySessions.$inferSelect;
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
export type Protocol = typeof protocols.$inferSelect;
export type InsertProtocol = z.infer<typeof insertProtocolSchema>;
export type StrategicReport = typeof strategicReports.$inferSelect;
export type InsertStrategicReport = z.infer<typeof insertStrategicReportSchema>;

// Protocol assessments schema for academic analysis
export const protocolAssessments = pgTable("protocol_assessments", {
  id: varchar("id", { length: 255 }).primaryKey(),
  protocol_data: json("protocol_data").notNull(),
  assessment_results: json("assessment_results").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull()
});

// Protocol assessment feedback schema
export const protocolAssessmentFeedback = pgTable("protocol_assessment_feedback", {
  id: serial("id").primaryKey(),
  assessment_id: varchar("assessment_id", { length: 255 }).notNull().references(() => protocolAssessments.id),
  feedback_text: text("feedback_text").notNull(),
  rating: integer("rating").notNull(),
  areas: json("areas").$type<string[]>().default(sql`'[]'`),
  created_at: timestamp("created_at").defaultNow().notNull()
});

// Schema relations
export const protocolAssessmentsRelations = relations(protocolAssessments, ({ many }) => ({
  feedback: many(protocolAssessmentFeedback)
}));

export const protocolAssessmentFeedbackRelations = relations(protocolAssessmentFeedback, ({ one }) => ({
  assessment: one(protocolAssessments, {
    fields: [protocolAssessmentFeedback.assessment_id],
    references: [protocolAssessments.id]
  })
}));

// Insert schemas
export const insertProtocolAssessmentSchema = createInsertSchema(protocolAssessments);
export const insertProtocolAssessmentFeedbackSchema = createInsertSchema(protocolAssessmentFeedback);

// Types
export type ProtocolAssessment = typeof protocolAssessments.$inferSelect;
export type InsertProtocolAssessment = z.infer<typeof insertProtocolAssessmentSchema>;
export type ProtocolAssessmentFeedback = typeof protocolAssessmentFeedback.$inferSelect;
export type InsertProtocolAssessmentFeedback = z.infer<typeof insertProtocolAssessmentFeedbackSchema>;