import { 
  users, type User, type InsertUser,
  csrReports, type CsrReport, type InsertCsrReport,
  csrDetails, type CsrDetails, type InsertCsrDetails 
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // CSR Report methods
  createCsrReport(report: InsertCsrReport): Promise<CsrReport>;
  getCsrReport(id: number): Promise<CsrReport | undefined>;
  getAllCsrReports(): Promise<CsrReport[]>;
  updateCsrReport(id: number, data: Partial<CsrReport>): Promise<CsrReport | undefined>;
  
  // CSR Details methods
  createCsrDetails(details: InsertCsrDetails): Promise<CsrDetails>;
  getCsrDetails(reportId: number): Promise<CsrDetails | undefined>;
  updateCsrDetails(reportId: number, data: Partial<CsrDetails>): Promise<CsrDetails | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // CSR Report methods
  async createCsrReport(report: InsertCsrReport): Promise<CsrReport> {
    const now = new Date();
    const [csrReport] = await db.insert(csrReports).values({
      ...report,
      status: "Processing",
      uploadDate: now,
      date: now.toISOString().split('T')[0],
      summary: ""
    }).returning();
    return csrReport;
  }

  async getCsrReport(id: number): Promise<CsrReport | undefined> {
    const [report] = await db.select().from(csrReports).where(eq(csrReports.id, id));
    return report;
  }

  async getAllCsrReports(): Promise<CsrReport[]> {
    const reports = await db.select().from(csrReports).orderBy(csrReports.uploadDate);
    return reports.reverse(); // Most recent first
  }

  async updateCsrReport(id: number, data: Partial<CsrReport>): Promise<CsrReport | undefined> {
    const [updatedReport] = await db.update(csrReports)
      .set(data)
      .where(eq(csrReports.id, id))
      .returning();
    return updatedReport;
  }

  // CSR Details methods
  async createCsrDetails(details: InsertCsrDetails): Promise<CsrDetails> {
    const [csrDetail] = await db.insert(csrDetails).values(details).returning();
    return csrDetail;
  }

  async getCsrDetails(reportId: number): Promise<CsrDetails | undefined> {
    const [detail] = await db.select()
      .from(csrDetails)
      .where(eq(csrDetails.reportId, reportId));
    return detail;
  }

  async updateCsrDetails(reportId: number, data: Partial<CsrDetails>): Promise<CsrDetails | undefined> {
    const [updatedDetail] = await db.update(csrDetails)
      .set(data)
      .where(eq(csrDetails.reportId, reportId))
      .returning();
    return updatedDetail;
  }
}

// Uncomment to use Memory Storage for development
// export const storage = new MemStorage();

// Use database storage
export const storage = new DatabaseStorage();
