import { 
  users, type User, type InsertUser,
  csrReports, type CsrReport, type InsertCsrReport,
  csrDetails, type CsrDetails, type InsertCsrDetails 
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private csrReports: Map<number, CsrReport>;
  private csrDetails: Map<number, CsrDetails>;
  private currentUserId: number;
  private currentReportId: number;
  private currentDetailsId: number;

  constructor() {
    this.users = new Map();
    this.csrReports = new Map();
    this.csrDetails = new Map();
    this.currentUserId = 1;
    this.currentReportId = 1;
    this.currentDetailsId = 1;
    
    // Initialize with sample data
    this.initSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // CSR Report methods
  async createCsrReport(report: InsertCsrReport): Promise<CsrReport> {
    const id = this.currentReportId++;
    const now = new Date();
    const csrReport: CsrReport = {
      ...report,
      id,
      status: "Processing",
      uploadDate: now,
      date: now.toISOString().split('T')[0],
      summary: ""
    };
    this.csrReports.set(id, csrReport);
    return csrReport;
  }

  async getCsrReport(id: number): Promise<CsrReport | undefined> {
    return this.csrReports.get(id);
  }

  async getAllCsrReports(): Promise<CsrReport[]> {
    return Array.from(this.csrReports.values()).sort((a, b) => {
      return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    });
  }

  async updateCsrReport(id: number, data: Partial<CsrReport>): Promise<CsrReport | undefined> {
    const report = this.csrReports.get(id);
    if (!report) return undefined;
    
    const updatedReport: CsrReport = { ...report, ...data };
    this.csrReports.set(id, updatedReport);
    return updatedReport;
  }

  // CSR Details methods
  async createCsrDetails(details: InsertCsrDetails): Promise<CsrDetails> {
    const id = this.currentDetailsId++;
    const csrDetail: CsrDetails = { ...details, id };
    this.csrDetails.set(details.reportId, csrDetail);
    return csrDetail;
  }

  async getCsrDetails(reportId: number): Promise<CsrDetails | undefined> {
    return Array.from(this.csrDetails.values()).find(
      (detail) => detail.reportId === reportId
    );
  }

  async updateCsrDetails(reportId: number, data: Partial<CsrDetails>): Promise<CsrDetails | undefined> {
    const detail = await this.getCsrDetails(reportId);
    if (!detail) return undefined;
    
    const updatedDetail: CsrDetails = { ...detail, ...data };
    this.csrDetails.set(reportId, updatedDetail);
    return updatedDetail;
  }

  // Initialize with sample data for development
  private initSampleData() {
    // Sample CSR Reports
    const reports = [
      {
        id: this.currentReportId++,
        title: "Aducanumab Phase 3 Study",
        sponsor: "Biogen",
        indication: "Alzheimer's Disease",
        phase: "Phase 3",
        status: "Processed",
        date: "2023-10-15",
        uploadDate: new Date("2023-11-02"),
        summary: "Phase 3 study evaluating efficacy and safety in early Alzheimer's",
        fileName: "aducanumab_phase3.pdf",
        fileSize: 1024 * 1024 * 2.5, // 2.5 MB
      },
      {
        id: this.currentReportId++,
        title: "Tirzepatide SURPASS-1 Trial",
        sponsor: "Eli Lilly",
        indication: "Diabetes Type 2",
        phase: "Phase 3",
        status: "Processed",
        date: "2022-12-04",
        uploadDate: new Date("2023-10-28"),
        summary: "SURPASS-1 trial for type 2 diabetes treatment",
        fileName: "tirzepatide_surpass1.pdf",
        fileSize: 1024 * 1024 * 3.2, // 3.2 MB
      },
      {
        id: this.currentReportId++,
        title: "Tofersen SOD1-ALS Phase 1/2",
        sponsor: "Biogen",
        indication: "ALS",
        phase: "Phase 1/2",
        status: "Processing",
        date: "2021-06-17",
        uploadDate: new Date("2023-11-05"),
        summary: "",
        fileName: "tofersen_als_phase1_2.pdf",
        fileSize: 1024 * 1024 * 1.8, // 1.8 MB
      }
    ];
    
    for (const report of reports) {
      this.csrReports.set(report.id, report);
    }

    // Add sample CSR details for the first two reports
    const details1: CsrDetails = {
      id: this.currentDetailsId++,
      reportId: 1,
      studyDesign: "Randomized, double-blind, placebo-controlled, parallel-group study",
      primaryObjective: "To evaluate the efficacy of monthly doses of Aducanumab in slowing cognitive and functional impairment",
      studyDescription: "This was a randomized, double-blind, placebo-controlled Phase 3 study evaluating the efficacy and safety of Aducanumab in participants with early Alzheimer's disease.",
      inclusionCriteria: "Male and female participants aged 50-85 years, Clinical diagnosis of mild cognitive impairment (MCI) due to Alzheimer's Disease",
      exclusionCriteria: "Any medical or neurological condition other than Alzheimer's Disease that might be a contributing cause of cognitive impairment",
      treatmentArms: [
        {
          arm: "Arm 1",
          intervention: "Aducanumab Low Dose",
          dosingRegimen: "3 mg/kg IV every 4 weeks",
          participants: 546
        },
        {
          arm: "Arm 2",
          intervention: "Aducanumab High Dose",
          dosingRegimen: "10 mg/kg IV every 4 weeks",
          participants: 547
        },
        {
          arm: "Arm 3",
          intervention: "Placebo",
          dosingRegimen: "Matching placebo IV every 4 weeks",
          participants: 545
        }
      ],
      studyDuration: "Total study duration was approximately 100 weeks",
      endpoints: {
        primary: "Change from baseline in Clinical Dementia Rating-Sum of Boxes (CDR-SB) at Week 78",
        secondary: [
          "Change from baseline in Mini-Mental State Examination (MMSE) score at Week 78",
          "Change from baseline in Alzheimer's Disease Assessment Scale-Cognitive Subscale (ADAS-Cog 13) at Week 78",
          "Change from baseline in Alzheimer's Disease Cooperative Study-Activities of Daily Living Inventory (ADCS-ADL-MCI) at Week 78"
        ]
      },
      results: {
        primaryResults: "The change from baseline in CDR-SB at Week 78 showed a significant treatment effect in favor of Aducanumab high dose compared to placebo (difference: -0.39, p=0.0120).",
        secondaryResults: "The high dose of Aducanumab showed significant treatment effects versus placebo on all secondary clinical endpoints.",
        biomarkerResults: "Aducanumab treatment resulted in dose-dependent reduction in brain amyloid plaque levels as measured by amyloid PET."
      },
      safety: {
        overallSafety: "The overall incidence of adverse events (AEs) was similar across all treatment groups.",
        ariaResults: "ARIA-E (edema) occurred in 34% of participants in the high-dose group and 26% in the low-dose group, compared to 3% in the placebo group.",
        commonAEs: "The most common adverse events were headache, fall, and diarrhea."
      },
      processed: true
    };
    
    const details2: CsrDetails = {
      id: this.currentDetailsId++,
      reportId: 2,
      studyDesign: "Randomized, double-blind, placebo-controlled, parallel-group study",
      primaryObjective: "To evaluate the efficacy and safety of tirzepatide compared with placebo in patients with type 2 diabetes",
      studyDescription: "SURPASS-1 was a 40-week Phase 3 trial that evaluated tirzepatide as a monotherapy for adults with type 2 diabetes.",
      inclusionCriteria: "Adults with type 2 diabetes inadequately controlled with diet and exercise, HbA1c between 7.0% and 10.5%",
      exclusionCriteria: "History of pancreatitis, severe gastroparesis, personal or family history of medullary thyroid carcinoma",
      treatmentArms: [
        {
          arm: "Arm 1",
          intervention: "Tirzepatide 5 mg",
          dosingRegimen: "Once weekly subcutaneous injection",
          participants: 121
        },
        {
          arm: "Arm 2",
          intervention: "Tirzepatide 10 mg",
          dosingRegimen: "Once weekly subcutaneous injection",
          participants: 121
        },
        {
          arm: "Arm 3",
          intervention: "Tirzepatide 15 mg",
          dosingRegimen: "Once weekly subcutaneous injection",
          participants: 120
        },
        {
          arm: "Arm 4",
          intervention: "Placebo",
          dosingRegimen: "Once weekly subcutaneous injection",
          participants: 113
        }
      ],
      studyDuration: "40 weeks with 4-week follow-up period",
      endpoints: {
        primary: "Change from baseline in HbA1c at Week 40",
        secondary: [
          "Change from baseline in body weight at Week 40",
          "Percentage of participants achieving HbA1c <7.0%",
          "Change from baseline in fasting serum glucose"
        ]
      },
      results: {
        primaryResults: "All tirzepatide doses demonstrated superior A1C reductions versus placebo at 40 weeks.",
        secondaryResults: "Tirzepatide led to significant reductions in body weight compared to placebo.",
        biomarkerResults: "Significant improvements in fasting serum glucose levels were observed across all tirzepatide doses."
      },
      safety: {
        overallSafety: "The most common adverse events were gastrointestinal, including nausea, diarrhea, and vomiting.",
        severeEvents: "Low rates of severe hypoglycemia were reported across all treatment groups.",
        discontinuationRates: "Discontinuation rates due to adverse events were 7% to 9% in the tirzepatide groups compared to 3% in the placebo group."
      },
      processed: true
    };
    
    this.csrDetails.set(1, details1);
    this.csrDetails.set(2, details2);
  }
}

export const storage = new MemStorage();
