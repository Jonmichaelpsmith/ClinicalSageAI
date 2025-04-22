/**
 * Mock Data Service
 * 
 * This module provides structured mock data for development and testing when
 * external services like FastAPI are unavailable. All mock data is organized
 * by endpoint and structured to match the actual API response format.
 */

// Common utility to generate dates within a range
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Generate a UUID v4
const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Document collections by module
const DOCUMENTS_BY_MODULE = {
  'ind': [
    {
      id: "doc-1",
      name: "Clinical Study Protocol v1.2",
      moduleContext: "clinical-protocol",
      documentType: "protocol",
      lastModified: randomDate(new Date(2023, 0, 1), new Date()).toISOString(),
      status: "approved",
      version: "1.2",
      author: "Dr. Sarah Johnson",
      url: "https://example.com/doc1.pdf"
    },
    {
      id: "doc-2",
      name: "Investigator's Brochure 2025",
      moduleContext: "investigator-brochure",
      documentType: "brochure",
      lastModified: randomDate(new Date(2023, 0, 1), new Date()).toISOString(),
      status: "in-review",
      version: "3.0",
      author: "Clinical Research Team",
      url: "https://example.com/doc2.pdf"
    },
    {
      id: "doc-3",
      name: "FDA Form 1571",
      moduleContext: "fda-forms",
      documentType: "form",
      lastModified: randomDate(new Date(2023, 0, 1), new Date()).toISOString(),
      status: "pending",
      version: "1.0",
      author: "Regulatory Affairs",
      url: "https://example.com/doc3.pdf"
    },
    {
      id: "doc-4",
      name: "Toxicology Study Report",
      moduleContext: "nonclinical",
      documentType: "report",
      lastModified: randomDate(new Date(2023, 0, 1), new Date()).toISOString(),
      status: "approved",
      version: "2.1",
      author: "Toxicology Team",
      url: "https://example.com/doc4.pdf"
    },
    {
      id: "doc-5",
      name: "CMC Information Package",
      moduleContext: "cmc",
      documentType: "report",
      lastModified: randomDate(new Date(2023, 0, 1), new Date()).toISOString(),
      status: "approved",
      version: "1.3",
      author: "Manufacturing Team",
      url: "https://example.com/doc5.pdf"
    }
  ],
  'csr': [
    {
      id: "csr-1",
      name: "Clinical Study Report - Phase 1",
      moduleContext: "clinical-study-report",
      documentType: "report",
      lastModified: randomDate(new Date(2023, 0, 1), new Date()).toISOString(),
      status: "approved",
      version: "1.0",
      author: "Clinical Research Team",
      url: "https://example.com/csr1.pdf"
    },
    {
      id: "csr-2",
      name: "Clinical Study Report - Appendices",
      moduleContext: "clinical-study-report",
      documentType: "appendix",
      lastModified: randomDate(new Date(2023, 0, 1), new Date()).toISOString(),
      status: "approved",
      version: "1.0",
      author: "Clinical Research Team",
      url: "https://example.com/csr2.pdf"
    }
  ],
  'cer': [
    {
      id: "cer-1",
      name: "Clinical Evaluation Report 2025",
      moduleContext: "clinical-evaluation",
      documentType: "report",
      lastModified: randomDate(new Date(2023, 0, 1), new Date()).toISOString(),
      status: "draft",
      version: "0.9",
      author: "Regulatory Affairs",
      url: "https://example.com/cer1.pdf"
    }
  ]
};

// Pre-IND Data by draft ID
const PRE_IND_DATA = {
  'draft-1': {
    projectName: "ExampleDrug IND Application",
    therapeuticArea: "Oncology",
    projectObjective: "Develop a novel treatment for advanced solid tumors with improved safety profile and efficacy in treatment-resistant patients.",
    targetPreIndMeetingDate: new Date(2025, 5, 15).toISOString(),
    preIndMeetingObjective: "To discuss the proposed Phase 1 study design and nonclinical data package to support IND submission.",
    preIndAgendaTopics: [
      "Review of nonclinical safety data",
      "Discussion of proposed Phase 1 study design",
      "CMC considerations for GMP manufacturing",
      "Discuss pediatric development plan"
    ],
    preIndAttendees: [
      "Dr. Sarah Johnson, Clinical Development Lead",
      "Dr. Michael Chen, Nonclinical Lead",
      "Dr. Rachel Garcia, CMC Lead",
      "Dr. David Lee, Chief Medical Officer"
    ],
    fdaInteractionNotes: "• Are the proposed nonclinical safety studies adequate to support Phase 1 initiation?\n• Does the FDA concur with the proposed starting dose and dose escalation plan?\n• Is the proposed patient population for the Phase 1 study acceptable?\n• Are there specific CMC requirements we should address prior to Phase 2?",
    milestones: [
      {
        id: "1",
        title: "Complete GLP toxicology studies",
        description: "Finalize all required GLP toxicology studies for IND submission.",
        status: "completed",
        dueDate: new Date(2024, 11, 15).toISOString(),
        assignee: "Nonclinical Team"
      },
      {
        id: "2",
        title: "Pre-IND Meeting with FDA",
        description: "Hold Pre-IND meeting to discuss development plan.",
        status: "planned",
        dueDate: new Date(2025, 5, 15).toISOString(),
        assignee: "Regulatory Affairs"
      },
      {
        id: "3",
        title: "Complete GMP Manufacturing",
        description: "Manufacture drug substance and drug product under GMP for clinical use.",
        status: "in-progress",
        dueDate: new Date(2025, 3, 30).toISOString(),
        assignee: "CMC Team"
      },
      {
        id: "4",
        title: "Submit IND Application",
        description: "Submit complete IND application to FDA.",
        status: "planned",
        dueDate: new Date(2025, 7, 1).toISOString(),
        assignee: "Regulatory Affairs"
      },
      {
        id: "5",
        title: "Initiate Phase 1 Study",
        description: "Begin patient enrollment in Phase 1 study.",
        status: "planned",
        dueDate: new Date(2025, 9, 15).toISOString(),
        assignee: "Clinical Operations"
      }
    ]
  },
  'draft-2': {
    projectName: "Second Test Project",
    therapeuticArea: "Neurology",
    projectObjective: "Develop a novel treatment for Alzheimer's disease that targets amyloid plaque formation.",
    targetPreIndMeetingDate: new Date(2025, 8, 10).toISOString(),
    preIndMeetingObjective: "To discuss novel biomarkers and surrogate endpoints for Alzheimer's trials.",
    preIndAgendaTopics: [
      "Novel biomarker validation approach",
      "Surrogate endpoint proposal",
      "Patient selection criteria",
      "Long-term safety monitoring plan"
    ],
    preIndAttendees: [
      "Dr. Jonathan Smith, Biomarker Specialist",
      "Dr. Emily Chen, Clinical Development",
      "Dr. Thomas Brown, Regulatory Strategy"
    ],
    fdaInteractionNotes: "• Would the FDA consider our novel PET imaging biomarker as an acceptable endpoint?\n• What additional validation would be needed for the proposed surrogate markers?\n• Are there special considerations for the geriatric population in our trial design?",
    milestones: [
      {
        id: "1",
        title: "Biomarker Validation Study",
        description: "Complete validation of novel PET imaging biomarker.",
        status: "in-progress",
        dueDate: new Date(2025, 5, 30).toISOString(),
        assignee: "Biomarker Team"
      },
      {
        id: "2",
        title: "Pre-IND Meeting",
        description: "Hold Pre-IND meeting to discuss biomarker strategy.",
        status: "planned",
        dueDate: new Date(2025, 8, 10).toISOString(),
        assignee: "Regulatory Affairs"
      }
    ]
  }
};

// IND Tips and Analysis
const IND_TIPS = {
  total_documents: 5,
  coverage: 85,
  gaps: {
    "1": {
      module_name: "Administrative Information",
      importance: "critical",
      missing_documents: ["Table of Contents", "Introductory Statement"],
      module_complete: false
    },
    "2": {
      module_name: "CMC Information",
      importance: "critical",
      missing_documents: ["Environmental Assessment"],
      module_complete: false
    }
  },
  suggestions: {
    prioritized_actions: [
      "Complete the Administrative Information module by preparing the Table of Contents and Introductory Statement as these are critical components for navigation and context.",
      "Add the Environmental Assessment to the CMC Information module to address regulatory requirements for environmental impact.",
      "Schedule a quality review of all existing documentation to ensure consistency across modules prior to submission.",
      "Consider a pre-submission meeting with the FDA to address any potential concerns about the CMC strategy.",
      "Prepare a consolidated response plan for potential FDA queries regarding the nonclinical data package."
    ],
    critical_next_steps: [
      {
        module_id: "1",
        module_name: "Administrative Information",
        action: "Complete Module 1 by adding: Table of Contents, Introductory Statement"
      },
      {
        module_id: "2",
        module_name: "CMC Information",
        action: "Complete Module 2 by adding: Environmental Assessment"
      }
    ]
  }
};

// AI suggestions for various contexts
const AI_SUGGESTIONS = {
  "agenda-topics": [
    "Review of Nonclinical Data Summary",
    "Proposed Clinical Protocol Overview (Phase 1)",
    "CMC Update and Stability Data",
    "Specific Questions for FDA Regarding Protocol Design",
    "Pediatric Study Plan Discussion"
  ],
  "fda-questions": [
    "Are the proposed nonclinical safety studies adequate to support Phase 1 initiation?",
    "Does the FDA concur with the proposed starting dose and dose escalation plan?",
    "Is the proposed patient population for the Phase 1 study acceptable?",
    "Are there specific CMC requirements we should address prior to Phase 2?",
    "Given the novel mechanism of action, what additional safety monitoring would be recommended?"
  ],
  "clinical-endpoints": [
    "Overall Survival (OS)",
    "Progression-Free Survival (PFS)",
    "Overall Response Rate (ORR)",
    "Duration of Response (DOR)",
    "Quality of Life (QOL) Metrics"
  ],
  "protocol-suggestions": [
    "Include more detailed exclusion criteria for patients with specific comorbidities",
    "Consider adding an interim analysis for early efficacy signals",
    "Strengthen the statistical plan with power calculations for secondary endpoints",
    "Add more frequent safety assessments in the first cycle",
    "Include biomarker sampling to identify potential responder populations"
  ]
};

// Export all mock data
module.exports = {
  getDocumentsByModule: (moduleId) => DOCUMENTS_BY_MODULE[moduleId] || [],
  getAllDocuments: () => {
    // Flatten all documents from all modules
    return Object.values(DOCUMENTS_BY_MODULE).flat();
  },
  getPreIndData: (draftId) => PRE_IND_DATA[draftId] || PRE_IND_DATA['draft-1'],
  getIndTips: () => IND_TIPS,
  getAiSuggestions: (context) => {
    if (context.includes('agenda')) return AI_SUGGESTIONS['agenda-topics'];
    if (context.includes('question')) return AI_SUGGESTIONS['fda-questions'];
    if (context.includes('endpoint')) return AI_SUGGESTIONS['clinical-endpoints'];
    if (context.includes('protocol')) return AI_SUGGESTIONS['protocol-suggestions'];
    return AI_SUGGESTIONS['agenda-topics']; // default
  },
  // Generic data generator functions
  randomDate,
  uuidv4
};