/**
 * FDA 510(k) Routes
 * 
 * This module provides API routes for FDA 510(k) Automation,
 * including predicate discovery, regulatory pathway analysis,
 * and compliance checking.
 */

import express from 'express';
export const router = express.Router();
import { OpenAI } from 'openai';
import axios from 'axios';

// Initialize OpenAI with environment API key
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Middleware to validate required data
const validateDeviceData = (req, res, next) => {
  const { deviceData } = req.body;
  
  if (!deviceData) {
    return res.status(400).json({
      success: false,
      message: 'Device data is required'
    });
  }
  
  if (!deviceData.deviceName) {
    return res.status(400).json({
      success: false,
      message: 'Device name is required'
    });
  }
  
  next();
};

// Helper to format regulatory pathway response from OpenAI
const formatPathwayResponse = (responseData) => {
  try {
    const pathwayData = typeof responseData === 'string' 
      ? JSON.parse(responseData) 
      : responseData;
    
    return {
      ...pathwayData,
      success: true
    };
  } catch (error) {
    console.error('Error formatting pathway response:', error);
    return {
      recommendation: responseData,
      confidence: 0.7,
      reasoning: "Unable to parse structured data from AI response",
      success: true
    };
  }
};

// Helper to format predicate device response from OpenAI
const formatPredicateResponse = (responseData) => {
  try {
    const predicateData = typeof responseData === 'string' 
      ? JSON.parse(responseData) 
      : responseData;
    
    return {
      ...predicateData,
      success: true
    };
  } catch (error) {
    console.error('Error formatting predicate response:', error);
    return {
      predicateDevices: [],
      literatureReferences: [],
      message: "Unable to parse structured data from AI response",
      success: false
    };
  }
};

// ===========================
// Regulatory Pathway Analysis
// ===========================

// Analyze regulatory pathway for a device
router.post('/analyze-pathway', validateDeviceData, async (req, res) => {
  const { deviceData, organizationId } = req.body;
  
  try {
    if (!openai) {
      return res.status(503).json({
        success: false,
        message: 'OpenAI API is not available. Please check your API key configuration.'
      });
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an FDA regulatory expert specializing in medical device classifications and 510(k) submissions. 
          Analyze the provided medical device data and determine the most appropriate regulatory pathway.
          Focus on whether a 510(k) submission is appropriate, and if so, what type (Traditional, Abbreviated, or Special).
          Format your response as a JSON object with the following properties:
          - recommendation: The recommended regulatory pathway (e.g., "Traditional 510(k)", "De Novo", "PMA")
          - confidence: A number between 0 and 1 indicating your confidence in this recommendation
          - reasoning: A concise explanation of your reasoning
          - requirements: An array of key requirements for this pathway
          - alternativePaths: An array of possible alternative pathways with brief explanations
          - deviceClass: The likely FDA device class (I, II, or III)
          - productCodeMatch: The most likely product code match
          - estimatedTimeframe: Estimated timeframe for this regulatory process`
        },
        {
          role: "user",
          content: `Analyze this medical device data and recommend the most appropriate FDA regulatory pathway:
          Device Name: ${deviceData.deviceName}
          Intended Use: ${deviceData.indications || 'Not specified'}
          Device Description: ${deviceData.mechanism || 'Not specified'}
          Materials: ${deviceData.materials || 'Not specified'}
          Similar Devices: ${deviceData.similarDevices || 'Not specified'}`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    res.json(formatPathwayResponse(completion.choices[0].message.content));
  } catch (error) {
    console.error('Error analyzing regulatory pathway:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing regulatory pathway',
      error: error.message
    });
  }
});

// ===========================
// Predicate Device Finder
// ===========================

// Find predicate devices based on device characteristics
router.post('/find-predicates', validateDeviceData, async (req, res) => {
  const { deviceData, organizationId, relevanceCriteria } = req.body;
  
  try {
    if (!openai) {
      return res.status(503).json({
        success: false,
        message: 'OpenAI API is not available. Please check your API key configuration.'
      });
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an FDA regulatory expert specializing in medical device substantial equivalence and 510(k) approvals.
          Find potential predicate devices and relevant literature references for the provided medical device.
          Format your response as a JSON object with two main arrays:
          1. predicateDevices: An array of potential predicate devices with these properties:
             - name: The device name
             - manufacturer: The device manufacturer
             - k_number: The FDA K-number (if available)
             - approvalDate: The FDA approval date (if available)
             - relevanceScore: A number between 0 and 1 indicating relevance to the subject device
             - keyDifferences: Major differences from the subject device
             - similarities: Key similarities to the subject device
          2. literatureReferences: An array of relevant scientific literature with these properties:
             - title: The publication title
             - authors: The author names
             - journal: The journal name
             - year: Publication year
             - doi: DOI if available
             - relevanceScore: A number between 0 and 1 indicating relevance
             - keyFindings: Brief summary of relevant findings`
        },
        {
          role: "user",
          content: `Find predicate devices and literature references for this medical device:
          Device Name: ${deviceData.deviceName}
          Intended Use: ${deviceData.indications || 'Not specified'}
          Device Description: ${deviceData.mechanism || 'Not specified'}
          Materials: ${deviceData.materials || 'Not specified'}
          Similar Devices: ${deviceData.similarDevices || 'Not specified'}
          ${relevanceCriteria ? `Relevance Criteria: ${JSON.stringify(relevanceCriteria)}` : ''}`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    res.json(formatPredicateResponse(completion.choices[0].message.content));
  } catch (error) {
    console.error('Error finding predicate devices:', error);
    res.status(500).json({
      success: false,
      message: 'Error finding predicate devices',
      error: error.message
    });
  }
});

// Get comparison of regulatory pathways
router.get('/compare-pathways', async (req, res) => {
  try {
    // Pathway comparison data
    const pathwayComparison = {
      pathways: [
        {
          name: "Traditional 510(k)",
          timeframe: "90-day review",
          dataMostImportant: "Performance data, substantial equivalence to predicate device",
          appropriateFor: "Class II devices with predicates",
          successRate: "High (85-90%)",
          cost: "Medium"
        },
        {
          name: "De Novo",
          timeframe: "150+ days",
          dataMostImportant: "Risk/benefit analysis, performance data",
          appropriateFor: "Novel devices with moderate risk (Class II)",
          successRate: "Medium (70-75%)",
          cost: "High"
        },
        {
          name: "Abbreviated 510(k)",
          timeframe: "90 days (often faster)",
          dataMostImportant: "Conformance to recognized standards",
          appropriateFor: "Devices covered by FDA guidance/standards",
          successRate: "High (85-90%)",
          cost: "Medium-Low"
        },
        {
          name: "Special 510(k)",
          timeframe: "30 days",
          dataMostImportant: "Design control procedures, verification/validation",
          appropriateFor: "Modifications to manufacturer's own device",
          successRate: "Very High (90-95%)",
          cost: "Low"
        },
        {
          name: "Premarket Approval (PMA)",
          timeframe: "180+ days",
          dataMostImportant: "Clinical trial data, safety and efficacy",
          appropriateFor: "High-risk Class III devices",
          successRate: "Medium-Low (60-70%)",
          cost: "Very High"
        }
      ],
      decisionFactors: [
        {
          factor: "Risk Classification",
          description: "Class I (low risk), Class II (moderate risk), Class III (high risk)",
          impact: "Primary determinant of pathway"
        },
        {
          factor: "Novelty",
          description: "Whether the device has predicates on market",
          impact: "Novel devices typically require De Novo or PMA"
        },
        {
          factor: "Standards Conformity",
          description: "Conformance to recognized consensus standards",
          impact: "Enables Abbreviated 510(k) pathway"
        },
        {
          factor: "Modifications",
          description: "Nature and extent of modifications to existing device",
          impact: "Minor modifications to own device may qualify for Special 510(k)"
        },
        {
          factor: "Clinical Data Requirements",
          description: "Extent of clinical evidence needed",
          impact: "PMA requires most extensive clinical data"
        }
      ]
    };
    
    res.json({
      success: true,
      ...pathwayComparison
    });
  } catch (error) {
    console.error('Error fetching pathway comparisons:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pathway comparisons',
      error: error.message
    });
  }
});

// ===========================
// Compliance Checking
// ===========================

// Run compliance check on a device profile
router.post('/compliance-check', validateDeviceData, async (req, res) => {
  const { deviceData, organizationId } = req.body;
  
  try {
    if (!openai) {
      return res.status(503).json({
        success: false,
        message: 'OpenAI API is not available. Please check your API key configuration.'
      });
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an FDA regulatory compliance expert specializing in medical device 510(k) submissions.
          Analyze the provided medical device data and identify potential compliance issues or gaps.
          Format your response as a JSON object with the following structure:
          {
            "overallAssessment": "A brief overall assessment of the submission's completeness",
            "complianceScore": A number between 0 and 100 representing overall compliance,
            "issues": [
              {
                "category": "Category of the issue (e.g., 'Technical Documentation', 'Safety Testing', 'Labeling')",
                "description": "Description of the issue",
                "severity": "critical"|"major"|"minor"|"info",
                "recommendation": "Recommendation to address the issue",
                "section": "The eSTAR section where this issue would appear"
              }
            ],
            "requiredDocuments": ["List of required documents that appear to be missing"],
            "nextSteps": ["Prioritized list of recommended next steps"]
          }`
        },
        {
          role: "user",
          content: `Analyze this medical device data for 510(k) compliance issues:
          Device Name: ${deviceData.deviceName}
          Intended Use: ${deviceData.indications || 'Not specified'}
          Device Description: ${deviceData.mechanism || 'Not specified'}
          Materials: ${deviceData.materials || 'Not specified'}
          Class: ${deviceData.deviceClass || 'Not specified'}
          Product Code: ${deviceData.productCode || 'Not specified'}`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const complianceData = JSON.parse(completion.choices[0].message.content);
    
    res.json({
      success: true,
      ...complianceData
    });
  } catch (error) {
    console.error('Error running compliance check:', error);
    res.status(500).json({
      success: false,
      message: 'Error running compliance check',
      error: error.message
    });
  }
});

// Get compliance check for a project
router.get('/compliance-check/:projectId', async (req, res) => {
  const { projectId } = req.params;
  
  try {
    // In a real implementation, we would fetch the project data here
    // For now, return demo compliance check results
    
    const complianceResults = {
      overallAssessment: "The submission appears to be about 85% complete with several areas requiring attention before submission.",
      complianceScore: 85,
      issues: [
        {
          category: "Technical Documentation",
          description: "Performance testing data is incomplete. Missing specific test protocols for electrical safety.",
          severity: "major",
          recommendation: "Complete IEC 60601-1 testing and include full test reports.",
          section: "Section 18.2 - Performance Testing"
        },
        {
          category: "Substantial Equivalence",
          description: "The comparison table with predicate device lacks sufficient detail on technological characteristics.",
          severity: "major",
          recommendation: "Expand the comparison table to include detailed technical specifications side by side.",
          section: "Section 12.4 - Comparison Table"
        },
        {
          category: "Labeling",
          description: "Proposed labeling lacks adequate instructions for use regarding cleaning and sterilization.",
          severity: "critical",
          recommendation: "Update the labeling to include detailed cleaning and sterilization instructions.",
          section: "Section 15.1 - Proposed Labeling"
        },
        {
          category: "Biocompatibility",
          description: "Biocompatibility assessment incomplete for patient-contacting materials.",
          severity: "critical",
          recommendation: "Complete ISO 10993 testing for all patient-contacting materials.",
          section: "Section 16.3 - Biocompatibility"
        },
        {
          category: "Software Documentation",
          description: "Software documentation is present but lacks detailed verification and validation protocols.",
          severity: "minor",
          recommendation: "Enhance software V&V documentation following FDA guidance.",
          section: "Section 17.1 - Software Documentation"
        },
        {
          category: "Risk Analysis",
          description: "Risk analysis lacks mitigations for identified software-related risks.",
          severity: "major",
          recommendation: "Update risk analysis with comprehensive mitigations for all identified risks.",
          section: "Section 19.2 - Risk Analysis"
        },
        {
          category: "Cybersecurity",
          description: "Lacks thorough cybersecurity risk assessment for wireless features.",
          severity: "minor",
          recommendation: "Include comprehensive cybersecurity assessment following FDA guidance.",
          section: "Section 20.1 - Cybersecurity"
        },
        {
          category: "Administrative",
          description: "FDA Form 3514 appears to have incomplete entries.",
          severity: "info",
          recommendation: "Complete all fields in FDA Form 3514.",
          section: "Section 1.2 - Administrative Forms"
        }
      ],
      requiredDocuments: [
        "Complete IEC 60601-1 test reports",
        "Complete ISO 10993 biocompatibility test reports",
        "Enhanced software V&V documentation",
        "Updated risk analysis with mitigations"
      ],
      nextSteps: [
        "Address critical biocompatibility testing gaps",
        "Complete labeling with cleaning/sterilization instructions",
        "Enhance substantial equivalence comparison table",
        "Complete electrical safety testing",
        "Update risk analysis documentation"
      ]
    };
    
    res.json({
      success: true,
      projectId,
      ...complianceResults
    });
  } catch (error) {
    console.error('Error fetching compliance check:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching compliance check',
      error: error.message
    });
  }
});

// ===========================
// 510(k) Requirements
// ===========================

// Get 510(k) requirements for a device class
router.get('/requirements/:deviceClass', async (req, res) => {
  const { deviceClass } = req.params;
  
  try {
    // Device class requirements
    const requirementsData = {
      I: {
        requirements: [
          {
            id: "req-1-1",
            name: "Device Description",
            description: "Basic description of the device, including materials and principles of operation",
            required: true,
            complexity: "low"
          },
          {
            id: "req-1-2",
            name: "Intended Use",
            description: "Statement of intended use and indications for use",
            required: true,
            complexity: "low"
          },
          {
            id: "req-1-3",
            name: "510(k) Summary",
            description: "Summary of safety and effectiveness information and basis for equivalence",
            required: true,
            complexity: "low"
          },
          {
            id: "req-1-4",
            name: "Labeling",
            description: "Proposed labeling, including instructions for use",
            required: true,
            complexity: "medium"
          },
          {
            id: "req-1-5",
            name: "General Controls Compliance",
            description: "Documentation of compliance with general controls",
            required: true,
            complexity: "low"
          }
        ],
        exemptionEligibility: "Many Class I devices are exempt from 510(k) requirements",
        commonPathway: "Most Class I devices that require 510(k) use Traditional 510(k) pathway",
        averageTimeline: "90 days for FDA review (non-exempt devices)"
      },
      II: {
        requirements: [
          {
            id: "req-2-1",
            name: "Device Description",
            description: "Detailed description of the device, including materials, specifications, and principles of operation",
            required: true,
            complexity: "medium"
          },
          {
            id: "req-2-2",
            name: "Intended Use",
            description: "Detailed statement of intended use and indications for use",
            required: true,
            complexity: "medium"
          },
          {
            id: "req-2-3",
            name: "Substantial Equivalence",
            description: "Documentation of substantial equivalence to a legally marketed device",
            required: true,
            complexity: "high"
          },
          {
            id: "req-2-4",
            name: "Performance Testing",
            description: "Bench, animal, and/or clinical performance testing as appropriate",
            required: true,
            complexity: "high"
          },
          {
            id: "req-2-5",
            name: "Technological Characteristics",
            description: "Comparison of technological characteristics with predicate device",
            required: true,
            complexity: "high"
          },
          {
            id: "req-2-6",
            name: "Software Documentation",
            description: "Software verification and validation documentation (if applicable)",
            required: "conditional",
            complexity: "high"
          },
          {
            id: "req-2-7",
            name: "Biocompatibility",
            description: "Biocompatibility testing for patient-contacting materials",
            required: "conditional",
            complexity: "high"
          },
          {
            id: "req-2-8",
            name: "Sterilization",
            description: "Sterilization validation (if applicable)",
            required: "conditional",
            complexity: "high"
          },
          {
            id: "req-2-9",
            name: "Electrical Safety",
            description: "Electrical safety testing (if applicable)",
            required: "conditional",
            complexity: "high"
          },
          {
            id: "req-2-10",
            name: "Electromagnetic Compatibility",
            description: "EMC testing (if applicable)",
            required: "conditional",
            complexity: "high"
          },
          {
            id: "req-2-11",
            name: "Risk Analysis",
            description: "Risk analysis and mitigations",
            required: true,
            complexity: "high"
          },
          {
            id: "req-2-12",
            name: "Labeling",
            description: "Proposed labeling, including instructions for use",
            required: true,
            complexity: "medium"
          },
          {
            id: "req-2-13",
            name: "Special Controls Compliance",
            description: "Documentation of compliance with applicable special controls",
            required: true,
            complexity: "high"
          }
        ],
        exemptionEligibility: "Some Class II devices are exempt, but most require 510(k)",
        commonPathway: "Traditional, Abbreviated, or Special 510(k) pathways available depending on circumstances",
        averageTimeline: "90-180 days for FDA review depending on complexity"
      },
      III: {
        requirements: [
          {
            id: "req-3-1",
            name: "Device Description",
            description: "Comprehensive description of the device, including materials, specifications, and principles of operation",
            required: true,
            complexity: "high"
          },
          {
            id: "req-3-2",
            name: "Intended Use",
            description: "Detailed statement of intended use and indications for use",
            required: true,
            complexity: "high"
          },
          {
            id: "req-3-3",
            name: "Substantial Equivalence",
            description: "Documentation of substantial equivalence to a legally marketed device",
            required: true,
            complexity: "very high"
          },
          {
            id: "req-3-4",
            name: "Clinical Data",
            description: "Clinical trial data demonstrating safety and effectiveness",
            required: true,
            complexity: "very high"
          },
          {
            id: "req-3-5",
            name: "Performance Testing",
            description: "Comprehensive bench, animal, and clinical performance testing",
            required: true,
            complexity: "very high"
          },
          {
            id: "req-3-6",
            name: "Technological Characteristics",
            description: "Detailed comparison of technological characteristics with predicate device",
            required: true,
            complexity: "very high"
          },
          {
            id: "req-3-7",
            name: "Software Documentation",
            description: "Comprehensive software verification and validation documentation (if applicable)",
            required: "conditional",
            complexity: "very high"
          },
          {
            id: "req-3-8",
            name: "Biocompatibility",
            description: "Comprehensive biocompatibility testing for patient-contacting materials",
            required: "conditional",
            complexity: "very high"
          },
          {
            id: "req-3-9",
            name: "Sterilization",
            description: "Comprehensive sterilization validation (if applicable)",
            required: "conditional",
            complexity: "very high"
          },
          {
            id: "req-3-10",
            name: "Manufacturing Information",
            description: "Detailed manufacturing information including quality system documentation",
            required: true,
            complexity: "very high"
          },
          {
            id: "req-3-11",
            name: "Risk Analysis",
            description: "Comprehensive risk analysis and mitigations",
            required: true,
            complexity: "very high"
          },
          {
            id: "req-3-12",
            name: "Labeling",
            description: "Comprehensive proposed labeling, including instructions for use",
            required: true,
            complexity: "high"
          }
        ],
        exemptionEligibility: "Class III devices typically require PMA, not 510(k)",
        commonPathway: "PMA is the standard pathway, though some Class III devices may be eligible for 510(k)",
        averageTimeline: "180+ days for FDA review"
      }
    };
    
    if (!requirementsData[deviceClass]) {
      return res.status(404).json({
        success: false,
        message: `Requirements for device class '${deviceClass}' not found`
      });
    }
    
    res.json({
      success: true,
      deviceClass,
      ...requirementsData[deviceClass]
    });
  } catch (error) {
    console.error('Error fetching requirements:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching requirements',
      error: error.message
    });
  }
});

// ===========================
// eSTAR Package Assembly
// ===========================

// Generate XML structure for eSTAR package
router.post('/generate-xml/:projectId', async (req, res) => {
  const { projectId } = req.params;
  
  try {
    // In a real implementation, we would generate the XML structure here
    // For now, return demo XML structure
    
    const xmlStructure = {
      rootElement: "estar_submission",
      sections: [
        {
          id: "admin_section",
          name: "Administrative Information",
          required: true,
          complete: true,
          children: [
            {
              id: "contact_info",
              name: "Contact Information",
              required: true,
              complete: true
            },
            {
              id: "submission_type",
              name: "Submission Type",
              required: true,
              complete: true
            }
          ]
        },
        {
          id: "device_description",
          name: "Device Description",
          required: true,
          complete: true,
          children: [
            {
              id: "intended_use",
              name: "Intended Use",
              required: true,
              complete: true
            },
            {
              id: "device_characteristics",
              name: "Device Characteristics",
              required: true,
              complete: true
            }
          ]
        },
        {
          id: "substantial_equivalence",
          name: "Substantial Equivalence",
          required: true,
          complete: false,
          children: [
            {
              id: "predicate_devices",
              name: "Predicate Devices",
              required: true,
              complete: true
            },
            {
              id: "comparison_table",
              name: "Comparison Table",
              required: true,
              complete: false
            }
          ]
        },
        {
          id: "performance_testing",
          name: "Performance Testing",
          required: true,
          complete: false,
          children: [
            {
              id: "bench_testing",
              name: "Bench Testing",
              required: true,
              complete: false
            },
            {
              id: "biocompatibility",
              name: "Biocompatibility",
              required: true,
              complete: false
            }
          ]
        },
        {
          id: "labeling",
          name: "Labeling",
          required: true,
          complete: false,
          children: [
            {
              id: "proposed_labeling",
              name: "Proposed Labeling",
              required: true,
              complete: false
            },
            {
              id: "instructions_for_use",
              name: "Instructions for Use",
              required: true,
              complete: false
            }
          ]
        }
      ]
    };
    
    res.json({
      success: true,
      projectId,
      xmlStructure
    });
  } catch (error) {
    console.error('Error generating XML structure:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating XML structure',
      error: error.message
    });
  }
});

// Validate eSTAR package
router.post('/validate-package/:projectId', async (req, res) => {
  const { projectId } = req.params;
  
  try {
    // In a real implementation, we would validate the package here
    // For now, return demo validation results
    
    const validationResults = {
      valid: true,
      issues: [
        {
          severity: "critical",
          message: "Substantial equivalence comparison table is incomplete",
          section: "Section 12.4 - Comparison Table"
        },
        {
          severity: "warning",
          message: "Biocompatibility testing data may be insufficient",
          section: "Section 16.3 - Biocompatibility"
        },
        {
          severity: "info",
          message: "Consider adding more detail to the device description",
          section: "Section 11.2 - Device Description"
        }
      ]
    };
    
    res.json({
      success: true,
      projectId,
      ...validationResults
    });
  } catch (error) {
    console.error('Error validating package:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating package',
      error: error.message
    });
  }
});

// Get project documents for eSTAR package
router.get('/project-documents/:projectId', async (req, res) => {
  const { projectId } = req.params;
  
  try {
    // In a real implementation, we would fetch the project documents here
    // For now, return demo project documents
    
    const projectDocuments = [
      {
        id: "doc1",
        name: "Device Description",
        type: "PDF",
        size: "2.3 MB",
        required: true,
        selected: true,
        status: "complete"
      },
      {
        id: "doc2",
        name: "Substantial Equivalence Statement",
        type: "DOCX",
        size: "1.1 MB",
        required: true,
        selected: true,
        status: "complete"
      },
      {
        id: "doc3",
        name: "Performance Testing Data",
        type: "PDF",
        size: "4.7 MB",
        required: true,
        selected: true,
        status: "in_progress"
      },
      {
        id: "doc4",
        name: "Software Documentation",
        type: "PDF",
        size: "3.2 MB",
        required: false,
        selected: false,
        status: "not_started"
      },
      {
        id: "doc5",
        name: "Biocompatibility Reports",
        type: "PDF",
        size: "5.6 MB",
        required: true,
        selected: true,
        status: "in_progress"
      },
      {
        id: "doc6",
        name: "Sterilization Validation",
        type: "PDF",
        size: "2.8 MB",
        required: true,
        selected: true,
        status: "complete"
      },
      {
        id: "doc7",
        name: "Shelf Life Studies",
        type: "XLSX",
        size: "1.4 MB",
        required: false,
        selected: true,
        status: "complete"
      },
      {
        id: "doc8",
        name: "Electrical Safety Testing",
        type: "PDF",
        size: "3.7 MB",
        required: true,
        selected: true,
        status: "complete"
      }
    ];
    
    res.json({
      success: true,
      projectId,
      documents: projectDocuments
    });
  } catch (error) {
    console.error('Error fetching project documents:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project documents',
      error: error.message
    });
  }
});

// Update document selection for eSTAR package
router.post('/update-document-selection/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const { documentIds } = req.body;
  
  try {
    // In a real implementation, we would update the document selection here
    
    res.json({
      success: true,
      projectId,
      message: `Document selection updated successfully with ${documentIds.length} documents`,
      documentIds
    });
  } catch (error) {
    console.error('Error updating document selection:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating document selection',
      error: error.message
    });
  }
});

// Generate cover letter for eSTAR package
router.post('/generate-cover-letter/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const additionalInfo = req.body;
  
  try {
    if (!openai) {
      return res.status(503).json({
        success: false,
        message: 'OpenAI API is not available. Please check your API key configuration.'
      });
    }
    
    // In a real implementation, we would fetch the project data here
    const projectData = {
      deviceName: "GlucoTrack Continuous Glucose Monitor",
      manufacturer: "TrialSage Medical Devices, Inc.",
      productCode: "NBW",
      address: "123 Medical Drive, Boston, MA 02115",
      contactName: "Dr. Jane Smith",
      contactTitle: "Regulatory Affairs Director",
      contactPhone: "(555) 123-4567",
      contactEmail: "j.smith@trialsage.example.com"
    };
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an FDA regulatory expert specializing in 510(k) submissions.
          Generate a professional cover letter for an eSTAR 510(k) submission based on the provided information.
          The letter should follow FDA formatting guidelines and include all required elements of a 510(k) cover letter.`
        },
        {
          role: "user",
          content: `Generate a cover letter for this 510(k) submission:
          Device Name: ${projectData.deviceName}
          Manufacturer: ${projectData.manufacturer}
          Product Code: ${projectData.productCode}
          Address: ${projectData.address}
          Contact Name: ${projectData.contactName}
          Contact Title: ${projectData.contactTitle}
          Contact Phone: ${projectData.contactPhone}
          Contact Email: ${projectData.contactEmail}
          ${additionalInfo ? `Additional Information: ${JSON.stringify(additionalInfo)}` : ''}`
        }
      ]
    });
    
    const coverLetterText = completion.choices[0].message.content;
    
    res.json({
      success: true,
      projectId,
      coverLetterText,
      coverLetterHtml: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${coverLetterText.replace(/\n/g, '<br>')}</div>`
    });
  } catch (error) {
    console.error('Error generating cover letter:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating cover letter',
      error: error.message
    });
  }
});

// Build final eSTAR package
router.post('/build-final-package/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const { includeCoverLetter, includeDigitalSignature } = req.body;
  
  try {
    // In a real implementation, we would build the final package here
    // For now, simulate a delay and return a demo result
    setTimeout(() => {
      const packageData = {
        packageId: 'estar-pkg-' + Math.random().toString(36).substring(2, 10),
        fileName: 'eSTAR_Package_' + new Date().toISOString().split('T')[0] + '.xml',
        size: '24.3 MB',
        sections: 15,
        documents: 23,
        downloadUrl: '#',
        buildTimestamp: new Date().toISOString(),
        includedCoverLetter: includeCoverLetter,
        includedDigitalSignature: includeDigitalSignature
      };
      
      res.json({
        success: true,
        projectId,
        ...packageData
      });
    }, 2000);
  } catch (error) {
    console.error('Error building final package:', error);
    res.status(500).json({
      success: false,
      message: 'Error building final package',
      error: error.message
    });
  }
});

// Export as both default and named export to support different import styles
export default router;