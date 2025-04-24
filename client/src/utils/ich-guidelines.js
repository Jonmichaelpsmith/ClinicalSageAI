/**
 * ICH Guidelines Reference Module
 * 
 * Provides a structured database of ICH guidelines with their requirements,
 * recommendations, and references to ensure AI output adheres strictly to
 * regulatory standards and prevents hallucination by grounding in official content.
 *
 * Source: https://www.ich.org/page/multidisciplinary-guidelines
 */

export const ichGuidelines = {
  // M4: Organization of the Common Technical Document
  M4: {
    title: "Organization of the Common Technical Document for the Registration of Pharmaceuticals for Human Use",
    sections: {
      M4Q: {
        title: "Quality",
        url: "https://database.ich.org/sites/default/files/M4Q_R1_Guideline.pdf",
        description: "Provides guidance on the content of Module 3 of CTD - Quality (Chemistry, Manufacturing, and Controls).",
        keyRequirements: [
          "Quality Overall Summary (QOS)",
          "Drug Substance information including manufacturing process and controls",
          "Drug Product formulation, manufacturing process, and controls",
          "Analytical validation and justification of specifications",
          "Stability data and conclusions"
        ]
      },
      M4S: {
        title: "Safety",
        url: "https://database.ich.org/sites/default/files/M4S_R2_Guideline.pdf",
        description: "Provides guidance on the content of Module 4 of CTD - Nonclinical Study Reports.",
        keyRequirements: [
          "Nonclinical Overview",
          "Nonclinical Written and Tabulated Summaries",
          "Pharmacology studies",
          "Pharmacokinetic studies",
          "Toxicology studies"
        ]
      },
      M4E: {
        title: "Efficacy",
        url: "https://database.ich.org/sites/default/files/M4E_R2_Guideline.pdf",
        description: "Provides guidance on the content of Module 5 of CTD - Clinical Study Reports.",
        keyRequirements: [
          "Clinical Overview (2.5)",
          "Clinical Summary (2.7)",
          "Reports of Biopharmaceutic Studies",
          "Reports of Clinical Pharmacology Studies",
          "Reports of Efficacy and Safety Studies",
          "Reports of Post-Marketing Experience"
        ]
      },
      M4: {
        title: "Organization of CTD",
        url: "https://database.ich.org/sites/default/files/M4_R4_Organisation.pdf",
        description: "Provides guidance on the organization of the Common Technical Document.",
        keyRequirements: [
          "General principles of CTD organization",
          "Content and structure of the 5 modules",
          "Document pagination and segregation",
          "Format of the CTD"
        ]
      }
    }
  },
  
  // M8: Electronic Common Technical Document (eCTD)
  M8: {
    title: "Electronic Common Technical Document (eCTD)",
    url: "https://www.ich.org/page/ich-electronic-common-technical-document-ectd-v4",
    description: "Defines the electronic format for regulatory submissions.",
    keyRequirements: [
      "XML backbone structure",
      "PDF format for documents",
      "Folder structure and naming conventions",
      "Lifecycle management of documents"
    ]
  },
  
  // M9: Biopharmaceutics Classification System
  M9: {
    title: "Biopharmaceutics Classification System (BCS)-based Biowaivers",
    url: "https://database.ich.org/sites/default/files/M9_Guideline_Step4_2019_1116.pdf",
    description: "Provides recommendations for biowaivers based on the BCS.",
    keyRequirements: [
      "BCS Classification criteria (solubility, permeability)",
      "Dissolution criteria for biowaivers",
      "Excipient considerations",
      "Documentation requirements"
    ]
  },
  
  // M10: Bioanalytical Method Validation
  M10: {
    title: "Bioanalytical Method Validation",
    url: "https://database.ich.org/sites/default/files/M10_Guideline_Step4_2019_1116.pdf",
    description: "Provides guidance on validation of bioanalytical methods.",
    keyRequirements: [
      "Full and partial validation criteria",
      "Selectivity and specificity",
      "Calibration curve requirements",
      "Accuracy, precision, and stability evaluations",
      "Incurred sample reanalysis"
    ]
  },
  
  // M11: Development and Submission of Clinical Electronic Structured Data
  M11: {
    title: "Development and Submission of Clinical Electronic Structured Data",
    description: "Provides guidance on the submission of clinical data in structured electronic format.",
    keyRequirements: [
      "SDTM (Study Data Tabulation Model) data structure",
      "ADaM (Analysis Data Model) requirements",
      "Define.xml specifications",
      "Standardized coding dictionaries (MedDRA, WHO Drug)"
    ]
  },
  
  // M12: Drug Interaction Studies
  M12: {
    title: "Drug Interaction Studies",
    description: "Provides guidance on the design, conduct, and interpretation of drug interaction studies.",
    keyRequirements: [
      "Enzyme and transporter-based interactions",
      "In vitro and in vivo study design considerations",
      "Population pharmacokinetic analysis for drug interactions",
      "Labeling recommendations"
    ]
  },
  
  // M13: Bioequivalence for Immediate-Release Solid Oral Dosage Forms
  M13: {
    title: "Bioequivalence for Immediate-Release Solid Oral Dosage Forms",
    description: "Provides guidance on bioequivalence studies for immediate-release solid oral dosage forms.",
    keyRequirements: [
      "Study design considerations",
      "Subject selection criteria",
      "Bioanalytical methodology",
      "Statistical analysis and criteria for bioequivalence",
      "Reporting requirements"
    ]
  }
};

/**
 * Returns specified ICH guideline information
 * @param {string} guidelineId - ICH guideline ID (e.g., "M4", "M10")
 * @returns {Object} Guideline information or null if not found
 */
export function getGuideline(guidelineId) {
  return ichGuidelines[guidelineId] || null;
}

/**
 * Returns section from an ICH guideline
 * @param {string} guidelineId - ICH guideline ID (e.g., "M4")
 * @param {string} sectionId - Section ID (e.g., "M4Q")
 * @returns {Object} Section information or null if not found
 */
export function getGuidelineSection(guidelineId, sectionId) {
  const guideline = ichGuidelines[guidelineId];
  if (!guideline || !guideline.sections) {
    return null;
  }
  return guideline.sections[sectionId] || null;
}

/**
 * Maps CTD section to relevant ICH guidelines
 * @param {string} ctdSection - CTD section ID (e.g., "3.2.S", "5.3.1")
 * @returns {Array} Array of relevant ICH guidelines
 */
export function mapCTDToGuidelines(ctdSection) {
  // Extract module number from CTD section
  const moduleNumber = parseInt(ctdSection.split('.')[0]);
  
  // Map modules to relevant ICH guidelines
  const relevantGuidelines = [];
  
  switch(moduleNumber) {
    case 2:
      // Module 2 (CTD Summaries)
      relevantGuidelines.push(ichGuidelines.M4);
      break;
    case 3:
      // Module 3 (Quality)
      relevantGuidelines.push(ichGuidelines.M4.sections.M4Q);
      // If pharmaceutical development section (3.2.P.2)
      if (ctdSection.startsWith("3.2.P.2")) {
        relevantGuidelines.push(ichGuidelines.M9); // BCS-based biowaivers
      }
      break;
    case 4:
      // Module 4 (Nonclinical)
      relevantGuidelines.push(ichGuidelines.M4.sections.M4S);
      // If toxicokinetics section
      if (ctdSection.startsWith("4.2.2")) {
        relevantGuidelines.push(ichGuidelines.M10); // Bioanalytical method validation
        relevantGuidelines.push(ichGuidelines.M12); // Drug interaction studies
      }
      break;
    case 5:
      // Module 5 (Clinical)
      relevantGuidelines.push(ichGuidelines.M4.sections.M4E);
      // If biopharmaceutic studies section
      if (ctdSection.startsWith("5.3.1")) {
        relevantGuidelines.push(ichGuidelines.M9); // BCS-based biowaivers
        relevantGuidelines.push(ichGuidelines.M13); // Bioequivalence
      }
      // If clinical pharmacology studies (PK/PD)
      if (ctdSection.startsWith("5.3.3") || ctdSection.startsWith("5.3.4")) {
        relevantGuidelines.push(ichGuidelines.M10); // Bioanalytical method validation
        relevantGuidelines.push(ichGuidelines.M12); // Drug interaction studies
      }
      // If data listings or datasets
      if (ctdSection.startsWith("5.3.7")) {
        relevantGuidelines.push(ichGuidelines.M11); // Clinical electronic structured data
      }
      break;
    default:
      break;
  }
  
  // Always relevant for electronic submissions
  relevantGuidelines.push(ichGuidelines.M8);
  
  return relevantGuidelines;
}

/**
 * Validates content against relevant ICH guidelines
 * @param {string} ctdSection - CTD section ID (e.g., "3.2.S", "5.3.1")
 * @param {Object} content - Content to validate
 * @returns {Object} Validation results
 */
export function validateContentAgainstGuidelines(ctdSection, content) {
  const guidelines = mapCTDToGuidelines(ctdSection);
  const results = {
    valid: true,
    warnings: [],
    recommendations: []
  };
  
  // Implement guidelines-specific validation logic
  guidelines.forEach(guideline => {
    if (!guideline) return;
    
    // Check if content addresses key requirements
    if (guideline.keyRequirements) {
      guideline.keyRequirements.forEach(requirement => {
        // Simple check: see if requirement keywords are mentioned
        const keywords = requirement.toLowerCase().split(' ');
        const contentLower = JSON.stringify(content).toLowerCase();
        
        const missingKeywords = keywords.filter(keyword => 
          keyword.length > 4 && !contentLower.includes(keyword)
        );
        
        if (missingKeywords.length > keywords.length / 2) {
          results.warnings.push({
            guideline: guideline.title,
            requirement: requirement,
            message: `Content may not adequately address: ${requirement}`
          });
        }
      });
    }
  });
  
  // If there are warnings, mark as potentially invalid
  if (results.warnings.length > 0) {
    results.valid = false;
  }
  
  return results;
}

export default {
  guidelines: ichGuidelines,
  getGuideline,
  getGuidelineSection,
  mapCTDToGuidelines,
  validateContentAgainstGuidelines
};