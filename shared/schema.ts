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