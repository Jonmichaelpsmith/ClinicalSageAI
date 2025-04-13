import { db } from "./db";
import { 
  projects, 
  summaryPackets, 
  insightMemories, 
  wisdomTraces, 
  studySessions,
  insertProjectSchema, 
  insertSummaryPacketSchema,
  insertInsightMemorySchema,
  insertWisdomTraceSchema,
  insertStudySessionSchema
} from "@shared/schema";
import { eq, desc, and, or, isNull } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import connectPg from "connect-pg-simple";
import session from "express-session";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Project operations
  createProject(project: typeof insertProjectSchema._type): Promise<{ id: number; project_id: string }>;
  getProject(projectId: string): Promise<any>;
  
  // Summary packet operations
  createSummaryPacket(packet: typeof insertSummaryPacketSchema._type): Promise<any>;
  getSummaryPacket(id: number): Promise<any>;
  getSummaryPacketsByProject(projectId: string): Promise<any[]>;
  getAllSummaryPackets(): Promise<any[]>;
  updateSummaryPacketVersion(id: number, newVersion: number): Promise<void>;
  markPreviousVersionsNotLatest(projectId: string): Promise<void>;
  getSummaryPacketByShareId(shareId: string): Promise<any>;
  updateSummaryPacketAccess(id: number): Promise<void>;
  addTagToSummaryPacket(id: number, tag: string): Promise<void>;
  removeTagFromSummaryPacket(id: number, tag: string): Promise<void>;
  sharePacketWithEmail(id: number, email: string): Promise<void>;
  
  // Study Session operations
  createStudySession(session: typeof insertStudySessionSchema._type): Promise<any>;
  getStudySession(sessionId: string): Promise<any>;
  getStudySessionsByProject(projectId: string): Promise<any[]>;
  getAllStudySessions(): Promise<any[]>;
  updateStudySessionStatus(sessionId: string, status: string): Promise<void>;
  
  // Insight Memory operations
  createInsightMemory(insight: typeof insertInsightMemorySchema._type): Promise<any>;
  getInsightMemory(id: number): Promise<any>;
  getInsightMemoriesByStudySession(sessionId: string): Promise<any[]>;
  getInsightMemoriesByProject(projectId: string): Promise<any[]>;
  updateInsightMemoryStatus(id: number, status: string): Promise<void>;
  
  // Wisdom Trace operations
  createWisdomTrace(trace: typeof insertWisdomTraceSchema._type): Promise<any>;
  getWisdomTrace(id: number): Promise<any>;
  getWisdomTraceByTraceId(traceId: string): Promise<any>;
  getWisdomTracesByStudySession(sessionId: string): Promise<any[]>;
  getWisdomTracesByProject(projectId: string): Promise<any[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Fixed session.SessionStore type issue

  constructor() {
    const PostgresSessionStore = require('connect-pg-simple')(require('express-session'));
    this.sessionStore = new PostgresSessionStore({ 
      conObject: {
        connectionString: process.env.DATABASE_URL
      },
      createTableIfMissing: true
    });
  }

  async createProject(project: typeof insertProjectSchema._type) {
    const projectId = project.project_id || `project_${uuidv4()}`;
    const [newProject] = await db.insert(projects)
      .values({
        ...project,
        project_id: projectId
      })
      .returning({ id: projects.id, project_id: projects.project_id });
    
    return newProject;
  }

  async getProject(projectId: string) {
    const [project] = await db.select()
      .from(projects)
      .where(eq(projects.project_id, projectId));
    
    return project;
  }

  async createSummaryPacket(packet: typeof insertSummaryPacketSchema._type) {
    if (packet.project_id) {
      await this.markPreviousVersionsNotLatest(packet.project_id);
    }
    
    const [newPacket] = await db.insert(summaryPackets)
      .values(packet)
      .returning();
    
    return newPacket;
  }

  async getSummaryPacket(id: number) {
    const [packet] = await db.select()
      .from(summaryPackets)
      .where(eq(summaryPackets.id, id));
    
    return packet;
  }

  async getSummaryPacketsByProject(projectId: string) {
    const packets = await db.select()
      .from(summaryPackets)
      .where(eq(summaryPackets.project_id, projectId))
      .orderBy(desc(summaryPackets.created_at));
    
    return packets;
  }

  async getAllSummaryPackets() {
    const packets = await db.select()
      .from(summaryPackets)
      .orderBy(desc(summaryPackets.created_at));
    
    return packets;
  }

  async updateSummaryPacketVersion(id: number, newVersion: number) {
    await db.update(summaryPackets)
      .set({ version: newVersion })
      .where(eq(summaryPackets.id, id));
  }

  async markPreviousVersionsNotLatest(projectId: string) {
    await db.update(summaryPackets)
      .set({ is_latest: false })
      .where(and(
        eq(summaryPackets.project_id, projectId),
        eq(summaryPackets.is_latest, true)
      ));
  }
  
  async getSummaryPacketByShareId(shareId: string) {
    const [packet] = await db.select()
      .from(summaryPackets)
      .where(eq(summaryPackets.share_id, shareId));
    
    return packet;
  }
  
  async updateSummaryPacketAccess(id: number) {
    await db.update(summaryPackets)
      .set({ 
        access_count: sql`${summaryPackets.access_count} + 1`,
        last_accessed: new Date()
      })
      .where(eq(summaryPackets.id, id));
  }
  
  async addTagToSummaryPacket(id: number, tag: string) {
    // First get the current tags
    const [packet] = await db.select({ tags: summaryPackets.tags })
      .from(summaryPackets)
      .where(eq(summaryPackets.id, id));
    
    if (!packet) return;
    
    // Add the new tag if it doesn't exist
    const currentTags = packet.tags as string[];
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag];
      await db.update(summaryPackets)
        .set({ tags: newTags })
        .where(eq(summaryPackets.id, id));
    }
  }
  
  async removeTagFromSummaryPacket(id: number, tag: string) {
    // First get the current tags
    const [packet] = await db.select({ tags: summaryPackets.tags })
      .from(summaryPackets)
      .where(eq(summaryPackets.id, id));
    
    if (!packet) return;
    
    // Remove the tag
    const currentTags = packet.tags as string[];
    const newTags = currentTags.filter(t => t !== tag);
    await db.update(summaryPackets)
      .set({ tags: newTags })
      .where(eq(summaryPackets.id, id));
  }
  
  async sharePacketWithEmail(id: number, email: string) {
    // First get the current shared_with list
    const [packet] = await db.select({ shared_with: summaryPackets.shared_with })
      .from(summaryPackets)
      .where(eq(summaryPackets.id, id));
    
    if (!packet) return;
    
    // Add the email if it doesn't exist
    const currentSharedWith = packet.shared_with as string[];
    if (!currentSharedWith.includes(email)) {
      const newSharedWith = [...currentSharedWith, email];
      await db.update(summaryPackets)
        .set({ shared_with: newSharedWith })
        .where(eq(summaryPackets.id, id));
    }
  }
}

export const storage = new DatabaseStorage();