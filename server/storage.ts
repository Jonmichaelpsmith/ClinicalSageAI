import { db } from "./db";
import {
  users,
  learningModules,
  documentTemplates,
  userProgress,
  aiInsights,
  userActivity,
  userMetrics,
  insertUserSchema,
  User,
  InsertLearningModule,
  InsertDocumentTemplate,
  InsertUserProgress,
  InsertAiInsight,
  InsertUserActivity,
  InsertUserMetrics
} from "../shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import * as expressSession from "express-session";

// We'll use a memory store for now to get the app running
const MemoryStore = expressSession.MemoryStore;

export interface IStorage {
  // User operations
  createUser(user: typeof insertUserSchema._type): Promise<any>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  
  // Learning module operations
  getLearningModules(): Promise<any[]>;
  getLearningModuleById(id: number): Promise<any>;
  createLearningModule(data: InsertLearningModule): Promise<any>;
  updateLearningModule(id: number, data: Partial<InsertLearningModule>): Promise<any>;

  // Document template operations
  getDocumentTemplates(): Promise<any[]>;
  getDocumentTemplateById(id: number): Promise<any>;
  createDocumentTemplate(data: InsertDocumentTemplate): Promise<any>;
  updateDocumentTemplate(id: number, data: Partial<InsertDocumentTemplate>): Promise<any>;
  incrementTemplateUseCount(id: number): Promise<any>;
  
  // User progress operations
  getUserProgressByUserId(userId: number): Promise<any[]>;
  createOrUpdateUserProgress(data: InsertUserProgress): Promise<any>;
  
  // AI insights operations
  getAiInsightsByUserId(userId: number): Promise<any[]>;
  createAiInsight(data: InsertAiInsight): Promise<any>;
  markInsightAsRead(id: number): Promise<any>;
  saveOrUnsaveInsight(id: number, isSaved: boolean): Promise<any>;
  
  // User activity operations
  getUserActivityByUserId(userId: number, limit?: number): Promise<any[]>;
  logUserActivity(data: InsertUserActivity): Promise<any>;
  
  // User metrics operations
  getUserMetrics(userId: number): Promise<any>;
  createOrUpdateUserMetrics(userId: number, data: Partial<InsertUserMetrics>): Promise<any>;
  
  // Session store
  sessionStore: any; 
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    // Use a memory store for sessions to get things working
    this.sessionStore = new MemoryStore();
  }
  
  // User operations
  async createUser(user: typeof insertUserSchema._type) {
    const [newUser] = await db.insert(users)
      .values(user)
      .returning();
    
    return newUser;
  }
  
  async getUser(id: number) {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, id));
    
    return user;
  }
  
  async getUserByUsername(username: string) {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.username, username));
    
    return user;
  }
  
  // Learning module operations
  async getLearningModules() {
    return db.select().from(learningModules);
  }

  async getLearningModuleById(id: number) {
    const [module] = await db.select().from(learningModules).where(eq(learningModules.id, id));
    return module;
  }

  async createLearningModule(data: InsertLearningModule) {
    const [module] = await db.insert(learningModules).values(data).returning();
    return module;
  }

  async updateLearningModule(id: number, data: Partial<InsertLearningModule>) {
    const [updatedModule] = await db
      .update(learningModules)
      .set(data)
      .where(eq(learningModules.id, id))
      .returning();
    return updatedModule;
  }

  // Document template operations
  async getDocumentTemplates() {
    return db.select().from(documentTemplates);
  }

  async getDocumentTemplateById(id: number) {
    const [template] = await db.select().from(documentTemplates).where(eq(documentTemplates.id, id));
    return template;
  }

  async createDocumentTemplate(data: InsertDocumentTemplate) {
    const [template] = await db.insert(documentTemplates).values(data).returning();
    return template;
  }

  async updateDocumentTemplate(id: number, data: Partial<InsertDocumentTemplate>) {
    const [updatedTemplate] = await db
      .update(documentTemplates)
      .set(data)
      .where(eq(documentTemplates.id, id))
      .returning();
    return updatedTemplate;
  }

  async incrementTemplateUseCount(id: number) {
    const [updatedTemplate] = await db
      .update(documentTemplates)
      .set({ 
        useCount: sql`${documentTemplates.useCount} + 1`
      })
      .where(eq(documentTemplates.id, id))
      .returning();
    return updatedTemplate;
  }

  // User progress operations
  async getUserProgressByUserId(userId: number) {
    return db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }

  async createOrUpdateUserProgress(data: InsertUserProgress) {
    // Check if progress entry exists
    let existing;
    
    if (data.moduleId) {
      const [progress] = await db
        .select()
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, data.userId),
            eq(userProgress.moduleId, data.moduleId)
          )
        );
      existing = progress;
    } else if (data.templateId) {
      const [progress] = await db
        .select()
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, data.userId),
            eq(userProgress.templateId, data.templateId)
          )
        );
      existing = progress;
    }
    
    if (existing) {
      // Update existing progress
      const [updatedProgress] = await db
        .update(userProgress)
        .set({
          progress: data.progress,
          lastAccessed: new Date(),
          completed: data.completed,
          completedAt: data.completed ? new Date() : existing.completedAt
        })
        .where(eq(userProgress.id, existing.id))
        .returning();
      return updatedProgress;
    } else {
      // Create new progress entry
      const [newProgress] = await db
        .insert(userProgress)
        .values(data)
        .returning();
      return newProgress;
    }
  }

  // AI insights operations
  async getAiInsightsByUserId(userId: number) {
    return db
      .select()
      .from(aiInsights)
      .where(eq(aiInsights.userId, userId))
      .orderBy(desc(aiInsights.createdAt));
  }

  async createAiInsight(data: InsertAiInsight) {
    const [insight] = await db.insert(aiInsights).values(data).returning();
    return insight;
  }

  async markInsightAsRead(id: number) {
    const [updatedInsight] = await db
      .update(aiInsights)
      .set({ isRead: true })
      .where(eq(aiInsights.id, id))
      .returning();
    return updatedInsight;
  }

  async saveOrUnsaveInsight(id: number, isSaved: boolean) {
    const [updatedInsight] = await db
      .update(aiInsights)
      .set({ isSaved: isSaved })
      .where(eq(aiInsights.id, id))
      .returning();
    return updatedInsight;
  }

  // User activity operations
  async getUserActivityByUserId(userId: number, limit = 10) {
    return db
      .select()
      .from(userActivity)
      .where(eq(userActivity.userId, userId))
      .orderBy(desc(userActivity.timestamp))
      .limit(limit);
  }
  
  async logUserActivity(data: InsertUserActivity) {
    const [activity] = await db.insert(userActivity).values(data).returning();
    return activity;
  }

  // User metrics operations
  async getUserMetrics(userId: number) {
    const [metrics] = await db.select().from(userMetrics).where(eq(userMetrics.userId, userId));
    return metrics;
  }

  async createOrUpdateUserMetrics(userId: number, data: Partial<InsertUserMetrics>) {
    const existing = await this.getUserMetrics(userId);
    
    if (existing) {
      const [updatedMetrics] = await db
        .update(userMetrics)
        .set({
          ...data,
          lastUpdated: new Date()
        })
        .where(eq(userMetrics.userId, userId))
        .returning();
      return updatedMetrics;
    } else {
      const [newMetrics] = await db
        .insert(userMetrics)
        .values({
          userId,
          ...data,
          lastUpdated: new Date()
        } as InsertUserMetrics)
        .returning();
      return newMetrics;
    }
  }
}

export const storage = new DatabaseStorage();