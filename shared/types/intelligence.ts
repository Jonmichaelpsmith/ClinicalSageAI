/**
 * Types for BI & Intelligence features
 */

/**
 * Represents an adverse event with aggregated statistics
 */
export interface AdverseEvent {
  name: string;
  occurrences: number;
  avgFrequency: number;
  frequencySum: number;
}

/**
 * Represents an endpoint with usage statistics
 */
export interface Endpoint {
  name: string;
  occurrences: number;
  primaryUseCount: number;
  secondaryUseCount: number;
}

/**
 * Phase or status count representation
 */
export interface CategoryCount {
  name: string;
  count: number;
}

/**
 * Time-based metric for year-over-year trends
 */
export interface TimeMetric {
  year: number;
  count: number;
}

/**
 * Intelligence summary for a specific indication
 */
export interface IntelligenceSummary {
  indication: string;
  reportCount: number;
  phases: CategoryCount[];
  averageDropoutRate: number;
  topAdverseEvents: AdverseEvent[];
  endpointTrends: Endpoint[];
  analysisDate: string;
}

/**
 * Global KPI dashboard data
 */
export interface KPIDashboard {
  totalTrials: number;
  trialsByIndication: CategoryCount[];
  trialsByPhase: CategoryCount[];
  trialsByStatus: CategoryCount[];
  trialsByTopSponsors: CategoryCount[];
  averageDropoutRate: number;
  completionRate: number;
  timeMetrics: TimeMetric[];
  lastUpdated: string;
}

/**
 * Weekly intelligence brief summary
 */
export interface WeeklyBrief {
  generatedDate: string;
  highlights: string[];
  trendInsights: string[];
  recommendations: string[];
}