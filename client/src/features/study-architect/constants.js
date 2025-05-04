/**
 * Study Architect Constants and Configuration
 * 
 * This file centralizes all configurable aspects of the Study Architect module
 * to make maintenance easier and reduce duplication.
 */

// Component Naming
export const MODULE_NAME = 'Study Architect™';
export const MODULE_DESCRIPTION = 'AI-powered study design with protocol optimization and CSR intelligence';

// UI Configuration
export const DEFAULT_TAB = 'dashboard';

// Session Sample Data (For Demo Only)
export const SAMPLE_SESSION = {
  id: 'session-2025-001',
  name: 'Enzymax Phase 2b Study Design',
  indication: 'Type 2 Diabetes',
  lastUpdated: '2025-04-30',
  users: [
    { id: 1, name: 'Dr. Sarah Johnson', role: 'Principal Investigator' },
    { id: 2, name: 'Dr. Michael Chen', role: 'Medical Monitor' }
  ]
};

// Demo Data
export const ACTIVE_STUDIES = [
  { 
    id: 'study-2025-001', 
    name: 'Phase 2b Efficacy Study - Enzymax Forte', 
    indication: 'Type 2 Diabetes', 
    phase: 'Phase 2b',
    status: 'active', 
    progress: 65, 
    lastUpdated: '2025-04-20',
    tasks: 8,
    completedTasks: 5
  },
  { 
    id: 'study-2025-002', 
    name: 'Dose-Finding Study - Cardiozen', 
    indication: 'Hypertension', 
    phase: 'Phase 1b',
    status: 'active', 
    progress: 42, 
    lastUpdated: '2025-04-22',
    tasks: 12,
    completedTasks: 5
  },
  { 
    id: 'study-2025-003', 
    name: 'Safety Extension - Neuroclear Device', 
    indication: 'Epilepsy', 
    phase: 'Phase 2',
    status: 'planning', 
    progress: 28, 
    lastUpdated: '2025-04-28',
    tasks: 10,
    completedTasks: 3
  }
];

export const CSR_INSIGHTS = [
  { 
    id: 'insight-1', 
    title: 'Adaptive Design Benefits', 
    description: 'Adaptive designs show 28% fewer protocol deviations in T2D studies', 
    impact: 'high',
    confidence: 92
  },
  { 
    id: 'insight-2', 
    title: 'PRO Integration', 
    description: 'PROs as secondary endpoints correlate with 34% higher approval rates', 
    impact: 'high',
    confidence: 88
  },
  { 
    id: 'insight-3', 
    title: 'Biomarker Stratification', 
    description: 'Biomarker-stratified enrollment approaches yield 3.2x greater effect sizes', 
    impact: 'high',
    confidence: 94
  }
];

// Module Stats
export const MODULE_STATS = {
  totalStudies: 12,
  activeStudies: 5,
  csrsAnalyzed: 328,
  successRate: 89,
  newStudiesThisMonth: 3,
  protocolOptimizations: 24
};

// Routes
export const ROUTES = {
  main: '/study-architect',
  clientPortal: '/client-portal/study-architect',
  dashboard: '/client-portal'
};
