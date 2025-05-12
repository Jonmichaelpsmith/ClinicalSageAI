/**
 * eCTD Validation Service
 * 
 * This service provides comprehensive validation for eCTD documents
 * according to regulatory standards and guidelines.
 * 
 * Features:
 * - Module-specific validation rules
 * - Content structure validation
 * - Regulatory compliance checks
 * - eCTD formatting requirements
 * - Cross-reference validation
 */

import * as openaiService from './openaiService';

// eCTD Validation Rules by Module
const MODULE_VALIDATION_RULES = {
  // Module 1: Administrative Information
  module1: {
    requiredSections: [
      'cover_letter',
      'forms',
      'labeling',
      'patent_information',
      'references'
    ],
    contentRequirements: {
      cover_letter: [
        'Must include submission type',
        'Must include application number',
        'Must reference previous communications',
        'Must be signed by authorized person'
      ],
      forms: [
        'Must include completed FDA Form 356h',
        'Must include financial disclosure forms'
      ],
      labeling: [
        'Must follow PLR format if applicable',
        'Must include SPL file',
        'Must have proper formatting for package insert'
      ]
    },
    formatRequirements: {
      headings: ['Must use prescribed headings exactly as they appear in guidance'],
      fonts: ['Should use Times New Roman or Arial, 12pt'],
      margins: ['Margins should be at least 0.5 inches on all sides'],
      pagination: ['Page numbers should be included in footer']
    }
  },
  
  // Module 2: Summaries
  module2: {
    requiredSections: [
      'table_of_contents',
      'introduction',
      'quality_overall_summary',
      'nonclinical_overview',
      'clinical_overview',
      'nonclinical_summary',
      'clinical_summary'
    ],
    contentRequirements: {
      clinical_overview: [
        'Must include benefit-risk assessment',
        'Must include overview of biopharmaceutics',
        'Must include overview of clinical pharmacology',
        'Must include overview of efficacy',
        'Must include overview of safety',
        'Must include discussion of study results and references to detailed information'
      ],
      quality_overall_summary: [
        'Must include introduction',
        'Must include drug substance summary',
        'Must include drug product summary',
        'Must include reference standards',
        'Must include container closure details',
        'Must include stability information'
      ]
    },
    formatRequirements: {
      headings: ['Must use CTD headings as specified in ICH M4 guidance'],
      pageLimit: ['Clinical overview should not exceed 30 pages'],
      tables: ['Tables must have proper headers and be properly referenced']
    }
  },
  
  // Module 3: Quality
  module3: {
    requiredSections: [
      'table_of_contents',
      'body_of_data',
      'literature_references'
    ],
    contentRequirements: {
      body_of_data: [
        'Must include drug substance information',
        'Must include drug product information',
        'Must include appendices (facilities, equipment, novel excipients)',
        'Must include regional information'
      ]
    },
    formatRequirements: {
      tables: ['Stability data must be presented in standard tables'],
      figures: ['Process flow diagrams must be clearly labeled'],
      references: ['References must follow standard format']
    }
  },
  
  // Module 4: Nonclinical Study Reports
  module4: {
    requiredSections: [
      'table_of_contents',
      'study_reports',
      'literature_references'
    ],
    contentRequirements: {
      study_reports: [
        'Must include pharmacology studies',
        'Must include pharmacokinetic studies',
        'Must include toxicology studies'
      ]
    },
    formatRequirements: {
      study_format: ['Studies must follow format specified in ICH M4S guidance'],
      references: ['References must follow standard format']
    }
  },
  
  // Module 5: Clinical Study Reports
  module5: {
    requiredSections: [
      'table_of_contents',
      'tabular_listing_of_studies',
      'clinical_study_reports',
      'literature_references'
    ],
    contentRequirements: {
      clinical_study_reports: [
        'Must include biopharmaceutic studies',
        'Must include clinical pharmacology studies',
        'Must include clinical efficacy studies',
        'Must include clinical safety studies',
        'Must include references to published studies',
        'Must include case report forms if applicable'
      ]
    },
    formatRequirements: {
      study_format: ['Clinical study reports must follow ICH E3 guidance'],
      case_report_forms: ['CRFs must be properly anonymized'],
      references: ['References must follow standard format']
    }
  }
};

// Common eCTD validation rules that apply to all modules
const COMMON_VALIDATION_RULES = {
  document_structure: [
    'Documents must have proper titles that reflect content',
    'Documents must have proper headings and subheadings',
    'Documents must have a table of contents for documents > 5 pages',
    'Documents must have consistent pagination',
    'Documents must have consistent header/footer information'
  ],
  formatting: [
    'Font size should be 10-12pt for body text',
    'Line spacing should be 1.0-1.5',
    'Margins should be at least 0.5 inches',
    'PDF files must be properly bookmarked',
    'PDF files must have proper metadata',
    'PDF files must not have security settings enabled'
  ],
  content: [
    'No promotional language should be used',
    'Acronyms must be defined at first use',
    'Information should be presented factually and objectively',
    'Claims must be supported by data',
    'Data must be presented accurately'
  ],
  cross_references: [
    'References to other documents must be accurate',
    'References must include section numbers and titles',
    'Cross-references should use hyperlinks where possible'
  ]
};

// Document section CTD mapping
const CTD_SECTION_MAPPING = {
  // Module 1 sections
  'cover_letter': '1.0',
  'forms': '1.1',
  'labeling': '1.14',
  'patent_information': '1.3.5.2',
  'references': '1.4.4',
  
  // Module 2 sections
  'table_of_contents_m2': '2.1',
  'introduction_m2': '2.2',
  'quality_overall_summary': '2.3',
  'nonclinical_overview': '2.4',
  'clinical_overview': '2.5',
  'nonclinical_summary': '2.6',
  'clinical_summary': '2.7',
  
  // Module 3 sections
  'table_of_contents_m3': '3.1',
  'drug_substance': '3.2.S',
  'drug_product': '3.2.P',
  'appendices': '3.3',
  'regional_information': '3.4',
  
  // Module 4 sections
  'table_of_contents_m4': '4.1',
  'study_reports_pharm': '4.2.1',
  'study_reports_pk': '4.2.2',
  'study_reports_tox': '4.2.3',
  'literature_references_m4': '4.3',
  
  // Module 5 sections
  'table_of_contents_m5': '5.1',
  'tabular_listing': '5.2',
  'study_reports_biopharm': '5.3.1',
  'study_reports_clinical_pharm': '5.3.3',
  'study_reports_efficacy': '5.3.5',
  'study_reports_safety': '5.3.6',
  'literature_references_m5': '5.4'
};

/**
 * Validate document content against eCTD requirements
 * @param {string} documentContent - Document content to validate
 * @param {string} moduleType - Module type (module1, module2, etc.)
 * @param {string} section - Specific section within the module
 * @returns {Promise<Object>} Validation results
 */
export async function validateDocument(documentContent, moduleType, section) {
  // Map the module and section to CTD section number
  const ctdSection = mapToCtdSection(moduleType, section);
  
  // Get validation rules for this module type
  const moduleRules = MODULE_VALIDATION_RULES[moduleType] || {};
  
  // Combine with common validation rules
  const allRules = {
    ...COMMON_VALIDATION_RULES,
    ...moduleRules
  };
  
  // Initialize validation results
  const validationResults = {
    moduleType,
    section,
    ctdSection,
    timestamp: new Date().toISOString(),
    overallResult: 'pending',
    issues: [],
    suggestions: []
  };
  
  try {
    // Perform basic structural validation
    const structuralIssues = validateStructure(documentContent, moduleType, section);
    validationResults.issues.push(...structuralIssues);
    
    // Perform content-specific validation
    const contentIssues = validateContent(documentContent, moduleType, section);
    validationResults.issues.push(...contentIssues);
    
    // Perform regulatory compliance validation
    const complianceIssues = await validateRegulatoryCompliance(documentContent, moduleType, section);
    validationResults.issues.push(...complianceIssues);
    
    // Determine overall result
    const criticalIssues = validationResults.issues.filter(issue => issue.severity === 'critical');
    const majorIssues = validationResults.issues.filter(issue => issue.severity === 'major');
    
    if (criticalIssues.length > 0) {
      validationResults.overallResult = 'failed';
    } else if (majorIssues.length > 0) {
      validationResults.overallResult = 'warning';
    } else {
      validationResults.overallResult = 'passed';
    }
    
    // Generate suggestions for improvements
    validationResults.suggestions = generateSuggestions(validationResults.issues, moduleType, section);
    
  } catch (error) {
    console.error('Error validating document:', error);
    validationResults.overallResult = 'error';
    validationResults.issues.push({
      id: 'validation-error',
      message: 'An error occurred during validation',
      details: error.message,
      severity: 'critical',
      location: 'general'
    });
  }
  
  return validationResults;
}

/**
 * Validate document structure
 * @private
 */
function validateStructure(documentContent, moduleType, section) {
  const issues = [];
  
  // Check for table of contents in long documents
  if (documentContent.length > 5000 && !documentContent.includes('Table of Contents') && !documentContent.includes('Contents')) {
    issues.push({
      id: 'missing-toc',
      message: 'Missing table of contents in document',
      details: 'Documents longer than 5 pages should include a table of contents',
      severity: 'minor',
      location: 'document'
    });
  }
  
  // Check for proper headings (simplified check)
  const headingMatch = documentContent.match(/^#+\s.+/gm);
  if (!headingMatch || headingMatch.length < 3) {
    issues.push({
      id: 'insufficient-headings',
      message: 'Insufficient or improperly formatted headings',
      details: 'Document should include properly formatted headings and subheadings',
      severity: 'minor',
      location: 'document'
    });
  }
  
  // Check for consistent pagination markers
  if (!documentContent.includes('Page') && !documentContent.includes('page')) {
    issues.push({
      id: 'missing-pagination',
      message: 'Missing pagination',
      details: 'Document should include page numbers in consistent format',
      severity: 'minor',
      location: 'document'
    });
  }
  
  return issues;
}

/**
 * Validate document content
 * @private
 */
function validateContent(documentContent, moduleType, section) {
  const issues = [];
  
  // Get content requirements for this module and section
  const moduleRules = MODULE_VALIDATION_RULES[moduleType] || {};
  const contentRequirements = moduleRules.contentRequirements?.[section] || [];
  
  // Check each content requirement
  contentRequirements.forEach(requirement => {
    // Extract key terms from the requirement
    const terms = requirement
      .toLowerCase()
      .replace(/must include |must have |must |should include |should have |should /, '')
      .split(' ')
      .filter(term => term.length > 4);
    
    // Check if the document content contains these terms
    const missingTerms = terms.filter(term => !documentContent.toLowerCase().includes(term));
    
    if (missingTerms.length > terms.length / 2) {
      issues.push({
        id: `missing-${section}-content`,
        message: `Potentially missing required content: ${requirement}`,
        details: `Content check detected potential missing information: ${missingTerms.join(', ')}`,
        severity: 'major',
        location: section
      });
    }
  });
  
  // Check for promotional language
  const promotionalTerms = [
    'best', 'superior', 'excellent', 'optimal', 'outstanding', 'remarkable', 
    'exceptional', 'leading', 'unrivalled', 'unparalleled', 'premier'
  ];
  
  const foundPromotionalTerms = promotionalTerms.filter(term => 
    documentContent.toLowerCase().includes(` ${term} `)
  );
  
  if (foundPromotionalTerms.length > 0) {
    issues.push({
      id: 'promotional-language',
      message: 'Potential promotional language detected',
      details: `Promotional terms detected: ${foundPromotionalTerms.join(', ')}. Regulatory submissions should use objective language.`,
      severity: 'major',
      location: 'document'
    });
  }
  
  return issues;
}

/**
 * Validate regulatory compliance
 * @private
 */
async function validateRegulatoryCompliance(documentContent, moduleType, section) {
  const issues = [];
  
  // Check required sections for this module
  const moduleRules = MODULE_VALIDATION_RULES[moduleType] || {};
  const requiredSections = moduleRules.requiredSections || [];
  
  // Simple check for whether required section names are mentioned
  requiredSections.forEach(requiredSection => {
    // Skip the current section itself
    if (requiredSection === section) return;
    
    // Format section name for searching (replace underscores with spaces)
    const sectionName = requiredSection.replace(/_/g, ' ');
    
    // Check if the section is mentioned
    if (!documentContent.toLowerCase().includes(sectionName.toLowerCase())) {
      issues.push({
        id: `missing-reference-${requiredSection}`,
        message: `Missing reference to ${sectionName}`,
        details: `Document should reference the ${sectionName} section for completeness`,
        severity: 'minor',
        location: 'cross-references'
      });
    }
  });
  
  // Use AI to identify regulatory compliance issues if OpenAI is available
  try {
    if (typeof openaiService.analyzeRegulatoryCompliance === 'function') {
      const aiResults = await openaiService.analyzeRegulatoryCompliance(documentContent, moduleType, section);
      
      if (aiResults && aiResults.issues && Array.isArray(aiResults.issues)) {
        issues.push(...aiResults.issues);
      }
    }
  } catch (error) {
    console.error('Error using AI for compliance validation:', error);
    // Do not add an issue - AI validation is supplementary
  }
  
  return issues;
}

/**
 * Generate improvement suggestions
 * @private
 */
function generateSuggestions(issues, moduleType, section) {
  const suggestions = [];
  
  // Group issues by type
  const issuesByType = issues.reduce((groups, issue) => {
    const type = issue.id.split('-')[0];
    if (!groups[type]) groups[type] = [];
    groups[type].push(issue);
    return groups;
  }, {});
  
  // Generate suggestions based on issue types
  if (issuesByType.missing) {
    suggestions.push({
      id: 'add-missing-content',
      title: 'Add missing content',
      description: 'Add the missing required content sections and information.',
      priority: 'high'
    });
  }
  
  if (issuesByType.insufficient) {
    suggestions.push({
      id: 'improve-structure',
      title: 'Improve document structure',
      description: 'Add proper headings, subheadings, and improve overall document organization.',
      priority: 'medium'
    });
  }
  
  if (issuesByType.promotional) {
    suggestions.push({
      id: 'remove-promotional-language',
      title: 'Remove promotional language',
      description: 'Replace promotional terms with objective, factual language appropriate for regulatory submissions.',
      priority: 'high'
    });
  }
  
  return suggestions;
}

/**
 * Map module type and section to CTD section number
 * @private
 */
function mapToCtdSection(moduleType, section) {
  // If section is directly mapped, return it
  if (CTD_SECTION_MAPPING[section]) {
    return CTD_SECTION_MAPPING[section];
  }
  
  // Try to map based on module type
  const moduleNumber = moduleType.replace('module', '');
  return `${moduleNumber}.x`;
}

/**
 * Get the validation rules for a specific module
 * @param {string} moduleType - Module type (module1, module2, etc.)
 * @returns {Object} Module validation rules
 */
export function getModuleValidationRules(moduleType) {
  return MODULE_VALIDATION_RULES[moduleType] || {};
}

/**
 * Get the common validation rules
 * @returns {Object} Common validation rules
 */
export function getCommonValidationRules() {
  return COMMON_VALIDATION_RULES;
}

/**
 * Get CTD section mapping
 * @returns {Object} CTD section mapping
 */
export function getCtdSectionMapping() {
  return CTD_SECTION_MAPPING;
}

/**
 * Get the summary of document validation statistics
 * @param {string} documentContent - Document content to analyze
 * @param {string} moduleType - Module type (module1, module2, etc.)
 * @returns {Object} Validation statistics
 */
export function getValidationSummary(documentContent, moduleType) {
  const wordCount = documentContent.trim().split(/\s+/).length;
  const sentenceCount = documentContent.trim().split(/[.!?]+\s/).length;
  const paragraphCount = documentContent.trim().split(/\n\s*\n/).length;
  
  // Get module-specific requirements
  const moduleRules = MODULE_VALIDATION_RULES[moduleType] || {};
  
  // Recommended word count ranges by module
  const wordCountRanges = {
    module1: { min: 500, max: 2000 },
    module2: { min: 3000, max: 10000 },
    module3: { min: 5000, max: 20000 },
    module4: { min: 2000, max: 8000 },
    module5: { min: 5000, max: 15000 }
  };
  
  const recommendedRange = wordCountRanges[moduleType] || { min: 1000, max: 5000 };
  
  // Check if word count is within recommended range
  const wordCountStatus = 
    wordCount < recommendedRange.min ? 'too_short' :
    wordCount > recommendedRange.max ? 'too_long' :
    'optimal';
  
  return {
    wordCount,
    sentenceCount,
    paragraphCount,
    wordCountStatus,
    recommendedWordCount: recommendedRange,
    requiredSections: moduleRules.requiredSections || [],
    timestamp: new Date().toISOString()
  };
}

/**
 * Validate cross-references between sections
 * @param {Object} document - Document object with all sections
 * @returns {Array} Cross-reference validation issues
 */
export function validateCrossReferences(document) {
  const issues = [];
  
  // This would require a structured document object with sections
  // For now, return placeholder
  issues.push({
    id: 'cross-reference-check',
    message: 'Cross-reference validation requires structured document',
    details: 'Document is not structured in a way that allows cross-reference validation',
    severity: 'info',
    location: 'document'
  });
  
  return issues;
}