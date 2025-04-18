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
import { eq, desc, and, or, isNull, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import * as expressSession from "express-session";

// We'll use a memory store for now to get the app running
const MemoryStore = expressSession.MemoryStore;

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
  
  // CSR Report operations
  getAllCsrReports(): Promise<any[]>;
  getCsrReport(id: number): Promise<any>;
  getCsrDetails(reportId: number): Promise<any>;
  createCsrReport(reportData: any): Promise<any>;
  updateCsrReport(id: number, reportData: any): Promise<any>;
  createCsrDetails(detailsData: any): Promise<any>;
  
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
  sessionStore: any; // Use any for now to avoid type errors
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    // Use a memory store for sessions to get things working
    this.sessionStore = new MemoryStore();
  }
  
  // CSR Reports methods
  async getAllCsrReports() {
    try {
      // Import csrReports from sage-plus-service to avoid circular dependencies
      const { csrReports } = await import('./sage-plus-service');
      
      // Get all CSR reports ordered by upload date (newest first)
      const reports = await db.select().from(csrReports).orderBy(desc(csrReports.uploadDate));
      
      return reports;
    } catch (error) {
      console.error('Error fetching CSR reports:', error);
      return [];
    }
  }
  
  async getCsrReport(id: number) {
    try {
      const { csrReports } = await import('./sage-plus-service');
      
      const [report] = await db.select()
        .from(csrReports)
        .where(eq(csrReports.id, id));
      
      return report;
    } catch (error) {
      console.error(`Error fetching CSR report with ID ${id}:`, error);
      return null;
    }
  }
  
  async getCsrDetails(reportId: number) {
    try {
      // Using proper parameterized query with placeholders
      const result = await db.query.csrDetails.findFirst({
        where: (fields, { eq }) => eq(fields.reportId, reportId)
      });
      
      if (result) {
        return {
          id: result.id,
          reportId: result.reportId,
          studyDesign: result.studyDesign,
          primaryObjective: result.primaryObjective,
          studyDescription: result.studyDescription,
          inclusionCriteria: result.inclusionCriteria,
          exclusionCriteria: result.exclusionCriteria,
          endpoints: result.endpoints,
          treatmentArms: result.treatmentArms,
          processed: result.processed
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching CSR details for report ID ${reportId}:`, error);
      return null;
    }
  }
  
  async createCsrReport(reportData: any) {
    try {
      const { csrReports } = await import('./sage-plus-service');
      
      const [report] = await db.insert(csrReports)
        .values(reportData)
        .returning();
      
      return report;
    } catch (error) {
      console.error('Error creating CSR report:', error);
      throw error;
    }
  }
  
  async updateCsrReport(id: number, reportData: any) {
    try {
      const { csrReports } = await import('./sage-plus-service');
      
      const [updatedReport] = await db.update(csrReports)
        .set(reportData)
        .where(eq(csrReports.id, id))
        .returning();
      
      return updatedReport;
    } catch (error) {
      console.error(`Error updating CSR report with ID ${id}:`, error);
      throw error;
    }
  }
  
  async createCsrDetails(detailsData: any) {
    try {
      const { csrDetails } = await import('./sage-plus-service');
      
      const [details] = await db.insert(csrDetails)
        .values(detailsData)
        .returning();
      
      return details;
    } catch (error) {
      console.error('Error creating CSR details:', error);
      throw error;
    }
  }
  
  // Implement the missing Study Session methods
  async createStudySession(session: typeof insertStudySessionSchema._type) {
    const [newSession] = await db.insert(studySessions)
      .values(session)
      .returning();
    
    return newSession;
  }
  
  async getStudySession(sessionId: string) {
    const [session] = await db.select()
      .from(studySessions)
      .where(eq(studySessions.session_id, sessionId));
    
    return session;
  }
  
  async getStudySessionsByProject(projectId: string) {
    const sessions = await db.select()
      .from(studySessions)
      .where(eq(studySessions.project_id, projectId))
      .orderBy(desc(studySessions.created_at));
    
    return sessions;
  }
  
  async getAllStudySessions() {
    const sessions = await db.select()
      .from(studySessions)
      .orderBy(desc(studySessions.created_at));
    
    return sessions;
  }
  
  async updateStudySessionStatus(sessionId: string, status: string) {
    await db.update(studySessions)
      .set({ status })
      .where(eq(studySessions.session_id, sessionId));
  }
  
  // Implement the missing Insight Memory methods
  async createInsightMemory(insight: typeof insertInsightMemorySchema._type) {
    const [newInsight] = await db.insert(insightMemories)
      .values(insight)
      .returning();
    
    return newInsight;
  }
  
  async getInsightMemory(id: number) {
    const [insight] = await db.select()
      .from(insightMemories)
      .where(eq(insightMemories.id, id));
    
    return insight;
  }
  
  async getInsightMemoriesByStudySession(sessionId: string) {
    const insights = await db.select()
      .from(insightMemories)
      .where(eq(insightMemories.session_id, sessionId))
      .orderBy(desc(insightMemories.created_at));
    
    return insights;
  }
  
  async getInsightMemoriesByProject(projectId: string) {
    const insights = await db.select()
      .from(insightMemories)
      .where(eq(insightMemories.project_id, projectId))
      .orderBy(desc(insightMemories.created_at));
    
    return insights;
  }
  
  async updateInsightMemoryStatus(id: number, status: string) {
    await db.update(insightMemories)
      .set({ status })
      .where(eq(insightMemories.id, id));
  }
  
  // Implement the missing Wisdom Trace methods
  async createWisdomTrace(trace: typeof insertWisdomTraceSchema._type) {
    const [newTrace] = await db.insert(wisdomTraces)
      .values(trace)
      .returning();
    
    return newTrace;
  }
  
  async getWisdomTrace(id: number) {
    const [trace] = await db.select()
      .from(wisdomTraces)
      .where(eq(wisdomTraces.id, id));
    
    return trace;
  }
  
  async getWisdomTraceByTraceId(traceId: string) {
    const [trace] = await db.select()
      .from(wisdomTraces)
      .where(eq(wisdomTraces.trace_id, traceId));
    
    return trace;
  }
  
  async getWisdomTracesByStudySession(sessionId: string) {
    const traces = await db.select()
      .from(wisdomTraces)
      .where(eq(wisdomTraces.session_id, sessionId))
      .orderBy(desc(wisdomTraces.created_at));
    
    return traces;
  }
  
  async getWisdomTracesByProject(projectId: string) {
    const traces = await db.select()
      .from(wisdomTraces)
      .where(eq(wisdomTraces.project_id, projectId))
      .orderBy(desc(wisdomTraces.created_at));
    
    return traces;
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