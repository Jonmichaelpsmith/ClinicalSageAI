/**
 * CER Service
 * Handles CER (Clinical Evaluation Report) generation and management
 * Enhanced with OpenAI-powered workflows for automated analysis and document generation
 */
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY,
});

// CER Section templates with AI prompts
const CER_SECTIONS = {
  deviceDescription: {
    title: 'Device Description',
    aiPrompt: 'Generate a detailed clinical device description based on the following information:',
    requiredFields: ['name', 'type', 'classification', 'intendedUse']
  },
  stateOfTheArt: {
    title: 'State of the Art',
    aiPrompt: 'Generate a comprehensive state of the art analysis for the following medical device:',
    requiredFields: ['deviceType', 'therapeuticArea']
  },
  equivalenceAnalysis: {
    title: 'Equivalence Analysis', 
    aiPrompt: 'Perform a detailed equivalence analysis comparing the subject device with these predicate devices:',
    requiredFields: ['predicateDevices']
  },
  clinicalData: {
    title: 'Clinical Data Analysis',
    aiPrompt: 'Analyze the following clinical data and literature for this medical device:',
    requiredFields: ['literature', 'clinicalStudies']
  },
  riskAnalysis: {
    title: 'Risk-Benefit Analysis',
    aiPrompt: 'Perform a comprehensive risk-benefit analysis based on the following safety data:',
    requiredFields: ['adverseEvents', 'benefits', 'risks']
  },
  postMarketData: {
    title: 'Post-Market Surveillance',
    aiPrompt: 'Analyze post-market surveillance data for the following medical device:',
    requiredFields: ['fdaData', 'pmcfData']
  },
  conclusion: {
    title: 'Conclusion',
    aiPrompt: 'Generate a clinical evaluation report conclusion based on all the following information:',
    requiredFields: ['deviceInfo', 'clinicalFindings', 'riskBenefitRatio']
  }
};

/**
 * Generate a CER for demonstration purposes with enhanced AI features
 * @param {Object} params - Parameters for CER generation
 * @param {Object} params.deviceInfo - Device information
 * @param {Array} params.literature - Literature references
 * @param {Array} params.fdaData - FDA adverse event data
 * @param {string} params.templateId - Template identifier
 * @returns {Object} Generated CER data
 */
export const generateMockCER = async (params) => {
  const { deviceInfo, literature = [], fdaData = [], templateId } = params;
  
  // Generate a unique ID for the report
  const reportId = `CER${Date.now().toString().substring(5)}`;
  
  // Create a CER report structure with enhanced AI-generated content markers
  return {
    id: reportId,
    title: `${deviceInfo.name} - Clinical Evaluation Report`,
    status: 'draft',
    deviceName: deviceInfo.name,
    deviceType: deviceInfo.type,
    manufacturer: deviceInfo.manufacturer,
    templateUsed: templateId,
    generatedAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    pageCount: Math.floor(Math.random() * 30) + 50, // Between 50-80 pages 
    wordCount: Math.floor(Math.random() * 10000) + 20000, // Between 20k-30k words
    sections: 12,
    metadata: {
      includedLiterature: literature.length,
      includedAdverseEvents: fdaData.length,
      aiEnhanced: true,
      automatedWorkflow: true,
      regulatoryFrameworks: ['EU MDR', 'FDA', 'MEDDEV 2.7/1 Rev 4'],
      generationEngine: 'gpt-4o',
      citationCount: literature.length + 5,
      qualityScore: 0.92
    },
    downloadUrl: `/api/cer/report/${reportId}/download`,
    aiWorkflowStatus: 'completed'
  };
};

/**
 * Fetch a CER report by ID
 * @param {string} id - Report ID
 * @returns {Object} CER report data
 */
export const getCERReport = async (id) => {
  // TODO: Replace with database query in production
  return {
    id,
    title: `Enhanced AI CER Report ${id}`,
    status: 'draft',
    aiEnhanced: true,
    sections: [
      { id: 'introduction', title: 'Introduction', status: 'completed', aiGenerated: true, aiConfidence: 0.95 },
      { id: 'deviceDescription', title: 'Device Description', status: 'completed', aiGenerated: true, aiConfidence: 0.92 },
      { id: 'regulatoryContext', title: 'Regulatory Context', status: 'completed', aiGenerated: true, aiConfidence: 0.97 },
      { id: 'methodology', title: 'Methodology', status: 'completed', aiGenerated: true, aiConfidence: 0.94 },
      { id: 'stateOfTheArt', title: 'State of the Art', status: 'completed', aiGenerated: true, aiConfidence: 0.89 },
      { id: 'clinicalData', title: 'Clinical Data Analysis', status: 'completed', aiGenerated: true, aiConfidence: 0.91 },
      { id: 'equivalence', title: 'Equivalence Analysis', status: 'completed', aiGenerated: true, aiConfidence: 0.88 },
      { id: 'riskAnalysis', title: 'Risk-Benefit Analysis', status: 'completed', aiGenerated: true, aiConfidence: 0.93 },
      { id: 'postMarket', title: 'Post-Market Surveillance', status: 'completed', aiGenerated: true, aiConfidence: 0.90 },
      { id: 'conclusion', title: 'Conclusion', status: 'completed', aiGenerated: true, aiConfidence: 0.96 },
      { id: 'references', title: 'References', status: 'completed', aiGenerated: false, aiConfidence: 1.0 },
      { id: 'appendices', title: 'Appendices', status: 'completed', aiGenerated: false, aiConfidence: 1.0 }
    ],
    workflow: {
      status: 'completed',
      steps: [
        { id: 'dataPreparation', name: 'Data Preparation', status: 'completed', completedAt: new Date(Date.now() - 3600000).toISOString() },
        { id: 'aiAnalysis', name: 'AI Analysis', status: 'completed', completedAt: new Date(Date.now() - 2400000).toISOString() },
        { id: 'sectionGeneration', name: 'Section Generation', status: 'completed', completedAt: new Date(Date.now() - 1200000).toISOString() },
        { id: 'qualityCheck', name: 'Quality Check', status: 'completed', completedAt: new Date(Date.now() - 600000).toISOString() },
        { id: 'finalCompilation', name: 'Final Compilation', status: 'completed', completedAt: new Date().toISOString() }
      ]
    }
  };
};

/**
 * Generate a section of the CER using AI
 * @param {string} sectionType - Type of section to generate
 * @param {Object} data - Data required for this section
 * @returns {Promise<string>} The generated section content
 */
async function generateSectionWithAI(sectionType, data) {
  try {
    const section = CER_SECTIONS[sectionType];
    if (!section) {
      throw new Error(`Unknown section type: ${sectionType}`);
    }
    
    // Check if all required fields are present
    const missingFields = section.requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields for ${sectionType}: ${missingFields.join(', ')}`);
    }
    
    // Format prompt for GPT
    const fullPrompt = `${section.aiPrompt}\n\n${JSON.stringify(data, null, 2)}\n\nGenerate a comprehensive, detailed, and regulatory-compliant ${section.title} section for a Clinical Evaluation Report. Use professional medical language, cite all sources, and follow EU MDR structure requirements.`;
    
    // Make request to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a medical device regulatory expert specializing in Clinical Evaluation Reports. You write detailed, scientifically accurate, and regulatory-compliant content following EU MDR requirements."
        },
        {
          role: "user",
          content: fullPrompt
        }
      ],
      temperature: 0.2, // Low temperature for more consistent, factual output
      max_tokens: 4000
    });
    
    return {
      content: response.choices[0].message.content,
      title: section.title,
      confidenceScore: 0.92, // In a real implementation, this would be calculated based on model confidence
      wordCount: response.choices[0].message.content.split(/\s+/).length,
      citationCount: (response.choices[0].message.content.match(/\[\d+\]/g) || []).length
    };
  } catch (error) {
    console.error(`Error generating section ${sectionType} with AI:`, error);
    // For demo purposes, return a fallback section
    return {
      content: `This section would contain AI-generated content about ${sectionType} in a real implementation.`,
      title: CER_SECTIONS[sectionType]?.title || sectionType,
      confidenceScore: 0.5,
      wordCount: 100,
      citationCount: 5,
      error: error.message
    };
  }
}

/**
 * Analyze clinical literature using AI
 * @param {Array} literature - Array of literature references
 * @returns {Promise<Object>} Analysis results
 */
async function analyzeLiteratureWithAI(literature) {
  try {
    // In production, this would make an actual call to OpenAI
    // For the demo, we'll simulate an analysis result
    return {
      relevantStudies: literature.length,
      keyFindings: [
        "Demonstrated safety profile consistent with equivalent devices",
        "Efficacy metrics meet or exceed current state of the art",
        "No significant unexpected adverse events reported"
      ],
      evidenceLevel: "Moderate",
      confidenceInterval: "95%",
      recommendation: "Sufficient clinical evidence to support claims"
    };
  } catch (error) {
    console.error('Error analyzing literature with AI:', error);
    return {
      error: error.message,
      relevantStudies: 0,
      keyFindings: [],
      evidenceLevel: "Unknown",
      recommendation: "Analysis failed"
    };
  }
}

/**
 * Analyze FDA adverse event data using AI
 * @param {Array} fdaData - FDA adverse event data
 * @returns {Promise<Object>} Analysis results
 */
async function analyzeAdverseEventsWithAI(fdaData) {
  try {
    // In production, this would make an actual call to OpenAI
    // For the demo, we'll simulate an analysis result
    return {
      totalEvents: fdaData.length,
      severityDistribution: {
        minor: Math.floor(fdaData.length * 0.7),
        moderate: Math.floor(fdaData.length * 0.2),
        severe: Math.floor(fdaData.length * 0.1)
      },
      commonEvents: [
        "Local tissue irritation",
        "Minor redness at application site",
        "Temporary discomfort during use"
      ],
      rareEvents: [
        "Allergic reaction",
        "Device malfunction"
      ],
      comparisonToPredicate: "Favorable safety profile compared to predicates"
    };
  } catch (error) {
    console.error('Error analyzing adverse events with AI:', error);
    return {
      error: error.message,
      totalEvents: 0,
      severityDistribution: {},
      commonEvents: [],
      rareEvents: []
    };
  }
}

/**
 * Generate a full CER report using AI assistance and automated workflows
 * @param {Object} params - Generation parameters
 * @returns {Promise<Object>} Generated report data
 */
export const generateFullCER = async (params) => {
  try {
    const { deviceInfo, literature = [], fdaData = [], templateId } = params;
    
    // Generate a unique ID for the report
    const reportId = `CER${Date.now().toString().substring(5)}`;
    
    // Start a background workflow to generate the CER sections
    // This would be implemented with a job queue in production
    const workflowId = `WF-${reportId}`;
    
    // For the demo, start a simulated workflow
    simulateWorkflow(workflowId, params);
    
    // Return immediate response with workflow ID
    return {
      id: reportId,
      workflowId,
      title: `${deviceInfo.name} - Clinical Evaluation Report`,
      status: 'processing',
      deviceName: deviceInfo.name,
      deviceType: deviceInfo.type,
      manufacturer: deviceInfo.manufacturer,
      templateUsed: templateId,
      generatedAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      estimatedCompletionTime: new Date(Date.now() + 1000 * 60 * 5).toISOString(), // 5 minutes from now
      workflow: {
        status: 'running',
        progress: 0.05,
        currentStep: 'dataPreparation',
        steps: [
          { id: 'dataPreparation', name: 'Data Preparation', status: 'running', startedAt: new Date().toISOString() },
          { id: 'aiAnalysis', name: 'AI Analysis', status: 'pending' },
          { id: 'sectionGeneration', name: 'Section Generation', status: 'pending' },
          { id: 'qualityCheck', name: 'Quality Check', status: 'pending' },
          { id: 'finalCompilation', name: 'Final Compilation', status: 'pending' }
        ]
      }
    };
  } catch (error) {
    console.error('Error starting CER generation workflow:', error);
    throw error;
  }
};

/**
 * Simulate a CER generation workflow (for demo purposes)
 * In production, this would be a full async workflow using Bull queue or similar
 * @param {string} workflowId - Workflow identifier
 * @param {Object} params - Generation parameters
 */
function simulateWorkflow(workflowId, params) {
  // In a real implementation, this would update a database
  console.log(`Started CER generation workflow: ${workflowId}`);
  
  // Immediately return to not block the response
  // In a real implementation this would be a background job
  setTimeout(() => {
    console.log(`CER workflow ${workflowId} completed successfully`);
  }, 5000); // Simulate 5 second completion for demo
}