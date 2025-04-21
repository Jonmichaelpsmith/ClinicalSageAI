// shared/schema.ts
import { pgTable, serial, integer, text, timestamp, json, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  email: text('email').notNull().unique(),
  fullName: text('full_name').notNull(),
  role: text('role').notNull(),
  company: text('company'),
  domain: text('domain'), // e.g., "Oncology", "Cardiology"
  expertiseLevel: text('expertise_level'), // e.g., "Beginner", "Intermediate", "Advanced"
  interests: json('interests').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Learning modules table
export const learningModules = pgTable('learning_modules', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  content: json('content').notNull(),
  level: text('level').notNull(), // "Beginner", "Intermediate", "Advanced"
  duration: integer('duration').notNull(), // in minutes
  tags: json('tags').$type<string[]>().default([]),
  domains: json('domains').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Document templates table
export const documentTemplates = pgTable('document_templates', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  content: json('content').notNull(),
  tags: json('tags').$type<string[]>().default([]),
  useCount: integer('use_count').default(0),
  domains: json('domains').$type<string[]>().default([]),
  recommendedFor: json('recommended_for').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User learning progress table
export const userProgress = pgTable('user_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  moduleId: integer('module_id').references(() => learningModules.id),
  templateId: integer('template_id').references(() => documentTemplates.id), 
  progress: integer('progress').notNull().default(0), // 0-100%
  lastAccessed: timestamp('last_accessed').defaultNow().notNull(),
  completed: boolean('completed').default(false),
  completedAt: timestamp('completed_at'),
});

// User generated AI insights
export const aiInsights = pgTable('ai_insights', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  source: text('source').notNull(),
  relevanceScore: integer('relevance_score').notNull(), // 0-100
  confidenceScore: integer('confidence_score').notNull(), // 0-100
  tags: json('tags').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  isRead: boolean('is_read').default(false),
  isSaved: boolean('is_saved').default(false),
});

// User activity log
export const userActivity = pgTable('user_activity', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  activityType: text('activity_type').notNull(), // "learning", "document", "template"
  resourceId: integer('resource_id').notNull(), // ID of the module, document, or template
  action: text('action').notNull(), // "view", "create", "update", "complete"
  metadata: json('metadata'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// User performance metrics
export const userMetrics = pgTable('user_metrics', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  completionRate: integer('completion_rate'), // 0-100%
  efficiencyImprovement: integer('efficiency_improvement'), // 0-100%
  documentQualityScore: integer('document_quality_score'), // 0-100
  timeSpent: json('time_spent').$type<{ 
    learning: number, 
    documents: number,
    reviews: number 
  }>(),
  strengths: json('strengths').$type<string[]>().default([]),
  areasForImprovement: json('areas_for_improvement').$type<string[]>().default([]),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});

// Define Zod schemas for insert operations
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertLearningModuleSchema = createInsertSchema(learningModules).omit({ id: true });
export const insertDocumentTemplateSchema = createInsertSchema(documentTemplates).omit({ id: true });
export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ id: true });
export const insertAiInsightSchema = createInsertSchema(aiInsights).omit({ id: true });
export const insertUserActivitySchema = createInsertSchema(userActivity).omit({ id: true });
export const insertUserMetricsSchema = createInsertSchema(userMetrics).omit({ id: true });

// Define TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type LearningModule = typeof learningModules.$inferSelect;
export type InsertLearningModule = z.infer<typeof insertLearningModuleSchema>;

export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type InsertDocumentTemplate = z.infer<typeof insertDocumentTemplateSchema>;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

export type AiInsight = typeof aiInsights.$inferSelect;
export type InsertAiInsight = z.infer<typeof insertAiInsightSchema>;

export type UserActivity = typeof userActivity.$inferSelect;
export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;

export type UserMetrics = typeof userMetrics.$inferSelect;
export type InsertUserMetrics = z.infer<typeof insertUserMetricsSchema>;