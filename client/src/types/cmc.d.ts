/**
 * Type definitions for the CMC Module
 * These types provide strong typing for OpenAI integrations and other CMC module functionality
 */

// OpenAI API response types
export type OpenAIUsage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
};

export type OpenAIErrorResponse = {
  error: string;
  details?: string | string[];
};

// CMC Content Generation
export type CMCSection = {
  id: number;
  title: string;
  section: string;
  status: 'Draft' | 'In Review' | 'Approved' | 'Rejected';
  content: string;
  nextRevision: string;
  feedbackCount: number;
};

export type CMCContentParams = {
  sectionType: string;
  drugDetails?: {
    name: string;
    indication?: string;
    dosageForm?: string;
  };
  currentContent?: string;
  targetRegulations?: string[];
};

export type CMCContentResponse = {
  content: string;
  usage: OpenAIUsage;
};

// Manufacturing Process
export type ManufacturingProcess = {
  title: string;
  description: string;
  status: 'Draft' | 'In Progress' | 'Validated' | 'In Review';
  progress: number;
  linkedRecords: Array<{
    name: string;
    type: 'Validation' | 'Deviation' | 'CAPA' | 'Qualification';
  }>;
};

export type ManufacturingProcessAnalysisParams = {
  processDetails: {
    name: string;
    description: string;
    steps: Array<{
      name: string;
      parameters?: Record<string, any>;
    }>;
  };
};

export type ManufacturingProcessAnalysisResponse = {
  analysis: string;
  optimizationSuggestions: Array<{
    step: string;
    suggestion: string;
    impact: string;
    implementationComplexity: 'Low' | 'Medium' | 'High';
  }>;
  usage: OpenAIUsage;
};

// Risk Analysis
export type RiskAnalysis = {
  title: string;
  severity: number; // 1-5
  probability: number; // 1-5
  impact: string;
  description: string;
  recommendations: string[];
};

export type RiskAnalysisParams = {
  changeType: string;
  currentState: string;
  proposedChange: string;
  productDetails?: Record<string, any>;
};

export type RiskAnalysisResponse = {
  analysis: {
    severity: number;
    probability: number;
    impactAreas: string[];
    summary: string;
  };
  recommendations: string[];
  regulatoryConsiderations: string[];
  usage: OpenAIUsage;
};

// Equipment Image Analysis
export type EquipmentImageAnalysisParams = {
  image: string; // Base64-encoded image
  processDetails?: Record<string, any>;
};

export type EquipmentImageAnalysisResponse = {
  equipment: {
    type: string;
    model?: string;
    components: string[];
  };
  compliance: {
    gmpStatus: string;
    concerns: string[];
  };
  recommendations: string[];
  processingTime: string;
  confidence: number;
};

// Crystalline Structure Visualization
export type CrystallineVisualizationParams = {
  moleculeDetails: {
    name: string;
    formula: string;
    structureType: 'crystalline' | 'amorphous' | 'polymorphic' | 'solvate';
    properties?: string;
  };
  visualizationType?: string;
  resolution?: string;
};

export type CrystallineVisualizationResponse = {
  image: string; // URL to the generated image
  revisedPrompt?: string;
};

// CMC Regulatory Assistant
export type RegulatoryAssistantParams = {
  query: string;
  threadId?: string | null;
  files?: string[];
};

export type RegulatoryAssistantResponse = {
  response: string;
  threadId: string;
  citations?: Array<{
    text: string;
    url?: string;
  }>;
  timestamp: string;
};

// Regulatory Checks
export type RegulatoryCheck = {
  requirement: string;
  status: 'compliant' | 'partial' | 'non-compliant';
  region: string;
  details: string;
};

// Search
export type SemanticSearchParams = {
  query: string;
  filters?: {
    documentType?: string[];
    dateRange?: {
      start?: string;
      end?: string;
    };
    author?: string[];
  };
};

export type SemanticSearchResponse = {
  results: Array<{
    documentId: string;
    documentTitle: string;
    documentType: string;
    relevanceScore: number;
    snippet: string;
    createdAt: string;
    author: string;
  }>;
  totalResults: number;
  processingTimeMs: number;
};