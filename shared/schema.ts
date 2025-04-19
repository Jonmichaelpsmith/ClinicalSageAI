/* stub for @shared/schema – replace with actual Zod/Yup schema */
export const UserSchema = {};
export const csrReports = {};
export const csrDetails = {};
export const trials = {};
export const csrSegments = {};
export const reports = {};
export const reportDetails = {};
export const csr_reports = {};
export const csr_details = {};
export const strategicReports = {};
export const protocols = {};
export const protocolAssessments = {};
export const protocolAssessmentFeedback = {};
export const academicSources = {};
export const summaryPackets = {};
export const projects = {};
export const insightMemories = {};
export const wisdomTraces = {};
export const studySessions = {};
export const clinicalEvaluationReports = {};

// Types
export type User = {
  id: number;
  username: string;
  password: string;
  email?: string;
  name?: string;
};

export type InsertUser = Omit<User, 'id'>;

export type CsrReport = {
  id: number;
  title: string;
  sponsor?: string;
  indication?: string;
  phase?: string;
};

export type CsrDetails = {
  id: number;
  reportId: number;
};

export type AcademicDocument = {
  id: number;
  title: string;
};

export type InsertCsrReport = Omit<CsrReport, 'id'>;
export type InsertCsrDetails = Omit<CsrDetails, 'id'>;
export type InsertStrategicReport = {
  title: string;
};

export type CsrSegment = {
  id: number;
  reportId: number;
};

export type InsertCsrSegment = Omit<CsrSegment, 'id'>;

export type IntelligenceSummary = {
  id: number;
};

export type WeeklyBrief = {
  id: number;
};
