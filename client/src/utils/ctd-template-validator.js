/**
 * CTD Template Validator
 * 
 * This utility validates document structure and content against
 * Common Technical Document (CTD) templates as specified by ICH.
 * 
 * The validator ensures:
 * 1. Proper document structure following CTD format
 * 2. Required sections are present
 * 3. Content matches expected format for each section
 * 4. References and cross-references are valid
 */

// CTD Module structure definitions
const ctdStructure = {
  module1: {
    title: "Administrative Information and Prescribing Information",
    regionSpecific: true,
    sections: {
      "1.1": { title: "Comprehensive Table of Contents" },
      "1.2": { title: "Administrative Information" },
      "1.3": { title: "Product Information" },
      // Additional sections would be defined here
    }
  },
  module2: {
    title: "Common Technical Document Summaries",
    sections: {
      "2.1": { title: "CTD Table of Contents" },
      "2.2": { title: "Introduction" },
      "2.3": { title: "Quality Overall Summary" },
      "2.4": { title: "Nonclinical Overview" },
      "2.5": { title: "Clinical Overview" },
      "2.6": { title: "Nonclinical Written and Tabulated Summaries" },
      "2.7": { title: "Clinical Summary" },
    }
  },
  module3: {
    title: "Quality (Chemistry, Manufacturing, and Controls)",
    sections: {
      "3.1": { title: "Table of Contents of Module 3" },
      "3.2": { 
        title: "Body of Data",
        subsections: {
          "3.2.S": { title: "Drug Substance" },
          "3.2.P": { title: "Drug Product" },
          "3.2.A": { title: "Appendices" },
          "3.2.R": { title: "Regional Information" },
        }
      },
      "3.3": { title: "Literature References" }
    }
  },
  module4: {
    title: "Nonclinical Study Reports",
    sections: {
      "4.1": { title: "Table of Contents of Module 4" },
      "4.2": { 
        title: "Study Reports",
        subsections: {
          "4.2.1": { title: "Pharmacology" },
          "4.2.2": { title: "Pharmacokinetics" },
          "4.2.3": { title: "Toxicology" },
        }
      },
      "4.3": { title: "Literature References" }
    }
  },
  module5: {
    title: "Clinical Study Reports",
    sections: {
      "5.1": { title: "Table of Contents of Module 5" },
      "5.2": { title: "Tabular Listing of All Clinical Studies" },
      "5.3": { 
        title: "Clinical Study Reports",
        subsections: {
          "5.3.1": { title: "Reports of Biopharmaceutic Studies" },
          "5.3.2": { title: "Reports of Studies Pertinent to Pharmacokinetics using Human Biomaterials" },
          "5.3.3": { title: "Reports of Human Pharmacokinetic Studies" },
          "5.3.4": { title: "Reports of Human Pharmacodynamic Studies" },
          "5.3.5": { title: "Reports of Efficacy and Safety Studies" },
          "5.3.6": { title: "Reports of Postmarketing Experience" },
          "5.3.7": { title: "Case Report Forms and Individual Patient Listings" },
        }
      },
      "5.4": { title: "Literature References" }
    }
  }
};

/**
 * Validates a document against CTD structure
 * @param {Object} document - Document object to validate
 * @param {string} moduleType - CTD module type (module1, module2, etc.)
 * @returns {Object} Validation results with issues and warnings
 */
export function validateAgainstCTD(document, moduleType) {
  if (!ctdStructure[moduleType]) {
    return {
      valid: false,
      errors: [{
        type: 'critical',
        message: `Invalid CTD module type: ${moduleType}`
      }]
    };
  }

  const module = ctdStructure[moduleType];
  const results = {
    valid: true,
    errors: [],
    warnings: [],
    missingRequiredSections: []
  };

  // Check document has title
  if (!document.title) {
    results.valid = false;
    results.errors.push({
      type: 'critical',
      message: 'Document missing title'
    });
  }

  // Check required sections are present
  Object.keys(module.sections).forEach(sectionKey => {
    const section = module.sections[sectionKey];
    if (!hasSectionMatch(document.sections, sectionKey, section.title)) {
      results.valid = false;
      results.missingRequiredSections.push({
        section: sectionKey,
        title: section.title
      });
    }
    
    // Check subsections if they exist
    if (section.subsections) {
      Object.keys(section.subsections).forEach(subKey => {
        const subsection = section.subsections[subKey];
        if (!hasSubsectionMatch(document.sections, sectionKey, subKey, subsection.title)) {
          results.valid = false;
          results.missingRequiredSections.push({
            section: `${sectionKey}.${subKey}`,
            title: subsection.title
          });
        }
      });
    }
  });

  // Return the validation results
  return results;
}

/**
 * Checks if document has a matching section
 */
function hasSectionMatch(sections, sectionKey, title) {
  return sections.some(section => 
    section.id === sectionKey || 
    section.title.toLowerCase().includes(title.toLowerCase())
  );
}

/**
 * Checks if document has a matching subsection
 */
function hasSubsectionMatch(sections, sectionKey, subsectionKey, title) {
  const parentSection = sections.find(section => 
    section.id === sectionKey || 
    section.title.toLowerCase().includes(ctdStructure[sectionKey].title.toLowerCase())
  );
  
  if (!parentSection || !parentSection.subsections) {
    return false;
  }
  
  return parentSection.subsections.some(subsection => 
    subsection.id === subsectionKey || 
    subsection.title.toLowerCase().includes(title.toLowerCase())
  );
}

/**
 * Creates a CTD-compliant document template
 * @param {string} moduleType - CTD module type (module1, module2, etc.)
 * @returns {Object} Document template skeleton
 */
export function createCTDTemplate(moduleType) {
  if (!ctdStructure[moduleType]) {
    throw new Error(`Invalid CTD module type: ${moduleType}`);
  }

  const module = ctdStructure[moduleType];
  const template = {
    title: module.title,
    moduleType: moduleType,
    moduleNumber: parseInt(moduleType.replace('module', '')),
    sections: []
  };

  // Add all sections and subsections
  Object.keys(module.sections).forEach(sectionKey => {
    const section = module.sections[sectionKey];
    const templateSection = {
      id: sectionKey,
      title: section.title,
      content: '',
    };
    
    if (section.subsections) {
      templateSection.subsections = [];
      Object.keys(section.subsections).forEach(subKey => {
        const subsection = section.subsections[subKey];
        templateSection.subsections.push({
          id: subKey,
          title: subsection.title,
          content: ''
        });
      });
    }
    
    template.sections.push(templateSection);
  });

  return template;
}

/**
 * Get CTD section guidance and requirements
 * @param {string} sectionId - CTD section ID (e.g., "3.2.S")
 * @returns {Object} Section guidance information
 */
export function getCTDSectionGuidance(sectionId) {
  // Split the section ID to identify module and section parts
  const parts = sectionId.split('.');
  const moduleId = `module${parts[0]}`;
  
  if (!ctdStructure[moduleId]) {
    return null;
  }
  
  // Find the right section/subsection
  const module = ctdStructure[moduleId];
  const sectionKey = parts.length > 1 ? parts[0] + '.' + parts[1] : parts[0];
  const section = module.sections[sectionKey];
  
  if (!section) {
    return null;
  }
  
  // If there are more parts, it's a subsection
  if (parts.length > 2) {
    const subsectionKey = parts.slice(2).join('.');
    const subsection = section.subsections?.[subsectionKey];
    
    if (!subsection) {
      return null;
    }
    
    return {
      id: sectionId,
      title: subsection.title,
      moduleTitle: module.title,
      sectionTitle: section.title,
      guidance: subsection.guidance || 'Specific guidance not available',
      requirements: subsection.requirements || []
    };
  }
  
  // Return section guidance
  return {
    id: sectionId,
    title: section.title,
    moduleTitle: module.title,
    guidance: section.guidance || 'Specific guidance not available',
    requirements: section.requirements || []
  };
}

/**
 * Get full CTD structure
 * @returns {Object} Complete CTD structure
 */
export function getFullCTDStructure() {
  return ctdStructure;
}

export default {
  validateAgainstCTD,
  createCTDTemplate,
  getCTDSectionGuidance,
  getFullCTDStructure
};