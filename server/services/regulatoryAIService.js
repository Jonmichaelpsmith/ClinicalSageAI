/**
 * Regulatory AI Service for TrialSage
 * 
 * This service implements a Retrieval-Augmented Generation (RAG) approach
 * to enhance the AI's responses with regulatory knowledge.
 * 
 * NOTE: This version uses the file system for storage rather than SQLite
 * to avoid dependency issues.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as documentProcessor from './documentProcessor.js';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the knowledge base
const DATA_DIR = path.join(__dirname, '../../data');
const KNOWLEDGE_DIR = path.join(DATA_DIR, 'knowledge_base');
const METADATA_PATH = path.join(KNOWLEDGE_DIR, 'metadata.json');
const DOCUMENTS_DIR = path.join(KNOWLEDGE_DIR, 'documents');
const JURISDICTIONS_DIR = path.join(KNOWLEDGE_DIR, 'jurisdictions');

// Create directories if they don't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(KNOWLEDGE_DIR)) {
  fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true });
}
if (!fs.existsSync(DOCUMENTS_DIR)) {
  fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
}
if (!fs.existsSync(JURISDICTIONS_DIR)) {
  fs.mkdirSync(JURISDICTIONS_DIR, { recursive: true });
  
  // Create jurisdiction subdirectories
  const jurisdictions = ['FDA', 'EMA', 'ICH', 'WHO', 'PMDA', 'NMPA', 'Health_Canada', 'TGA', 'General'];
  jurisdictions.forEach(jurisdiction => {
    const jurisdictionDir = path.join(JURISDICTIONS_DIR, jurisdiction);
    if (!fs.existsSync(jurisdictionDir)) {
      fs.mkdirSync(jurisdictionDir, { recursive: true });
    }
  });
}

/**
 * Enhanced semantic search to match user queries against knowledge base documents
 * This version uses a file-based approach with keyword matching and ranking
 * @param {string} query - The user's query
 * @param {number} limit - Number of documents to retrieve
 * @returns {Promise<Array>} - Array of relevant documents
 */
async function retrieveDocuments(query, limit = 5) {
  // Extract key regulatory terms to improve search relevance
  const regulatoryTerms = extractRegulatoryTerms(query);
  
  try {
    // Check if the knowledge base directory exists
    if (!fs.existsSync(KNOWLEDGE_DIR)) {
      return [];
    }
    
    // Use the documentProcessor to search the knowledge base
    const results = await documentProcessor.searchKnowledgeBase(
      query, 
      null, // No jurisdiction filter
      null, // No document type filter
      limit
    );
    
    // Sort results by relevance (simple implementation that prioritizes documents
    // that match regulatory terms)
    return results.sort((a, b) => {
      const aContent = a.content?.toLowerCase() || '';
      const bContent = b.content?.toLowerCase() || '';
      let aScore = 0;
      let bScore = 0;
      
      // Score based on matches to regulatory terms
      regulatoryTerms.forEach(term => {
        if (aContent.includes(term.toLowerCase())) {
          aScore += 10; // Higher weight for regulatory term matches
        }
        if (bContent.includes(term.toLowerCase())) {
          bScore += 10; // Higher weight for regulatory term matches
        }
      });
      
      // Also score based on match to the original query
      if (aContent.includes(query.toLowerCase())) {
        aScore += 5;
      }
      if (bContent.includes(query.toLowerCase())) {
        bScore += 5;
      }
      
      // Finally, prioritize shorter documents slightly (they tend to be more focused)
      aScore -= aContent.length / 100000;
      bScore -= bContent.length / 100000;
      
      return bScore - aScore; // Higher score first
    }).slice(0, limit);
  } catch (error) {
    console.error('Error retrieving documents:', error);
    return [];
  }
}

/**
 * Extract regulatory-specific terms from a query
 * @param {string} query - The user's query 
 * @returns {Array<string>} - Array of regulatory terms
 */
function extractRegulatoryTerms(query) {
  const terms = [];
  const lowerQuery = query.toLowerCase();
  
  // Regulatory authorities
  const authorities = [
    'fda', 'ema', 'pmda', 'nmpa', 'health canada', 'tga', 'ich', 'who', 'iso', 'imdrf', 'mhra'
  ];
  
  // Regulatory frameworks and key terms
  const regulatoryFrameworks = [
    '510k', '510(k)', 'pma', 'de novo', 'qsr', 'mdr', 'ivdr', 'ce mark', 
    'clinical evaluation report', 'cer', 'substantial equivalence', 'predicate',
    'risk management', 'post-market surveillance', 'pms', 'clinical trial', 
    'ich e6', 'ich e8', 'ich e9', 'gcp', 'medical device'
  ];
  
  // Check for authorities in the query
  authorities.forEach(auth => {
    if (lowerQuery.includes(auth)) {
      terms.push(auth);
    }
  });
  
  // Check for regulatory frameworks and key terms
  regulatoryFrameworks.forEach(framework => {
    if (lowerQuery.includes(framework)) {
      terms.push(framework);
    }
  });
  
  return terms;
}

/**
 * RBM knowledge base - specialized content about Risk-Based Monitoring
 * This information is derived from FDA's guidelines on bioresearch monitoring inspections
 */
const rbmKnowledgeBase = {
  definition: `Risk-Based Monitoring (RBM) is a strategic approach to clinical trial oversight that focuses monitoring activities on the areas of highest risk to data quality and participant safety. Instead of traditional 100% source data verification, RBM uses risk assessment, centralized data review, and targeted on-site visits to enhance monitoring efficiency while maintaining or improving study quality.`,
  
  keyPrinciples: [
    "Focus monitoring efforts on critical data and processes that impact participant safety and data integrity",
    "Use risk assessment to identify key risk indicators and determine monitoring strategy",
    "Implement centralized monitoring to review data remotely in real-time",
    "Perform targeted site visits based on risk indicators rather than routine schedules",
    "Establish quality tolerance limits for critical data and processes",
    "Document the rationale for the monitoring approach in the monitoring plan"
  ],
  
  components: {
    riskAssessment: "Systematic evaluation of trial-specific risks to participant safety and data integrity, including identification of critical data and processes.",
    monitoringPlan: "Study-specific document that outlines the monitoring strategy, including timing, methods, and responsibilities.",
    centralizedMonitoring: "Remote review of aggregated data to identify trends, patterns, and outliers across sites.",
    onSiteMonitoring: "Targeted visits to investigational sites based on risk indicators, focusing on critical activities.",
    qualityToleranceLimits: "Predefined thresholds for critical data and processes that trigger additional monitoring or action when exceeded."
  },
  
  benefits: [
    "More efficient use of monitoring resources",
    "Earlier detection of issues through real-time data review",
    "Reduced burden on investigational sites",
    "Focus on highest-impact areas for data quality and participant safety",
    "Potential cost savings compared to traditional 100% monitoring"
  ],
  
  regulatoryBackground: {
    fda: "FDA guidance on Risk-Based Monitoring encourages innovative approaches to improve trial quality and efficiency, aligning with BIMO (Bioresearch Monitoring) inspection processes.",
    ema: "EMA's Reflection Paper promotes risk-proportionate approaches to clinical trial monitoring, focusing on critical processes and data.",
    ich: "ICH GCP E6(R2) includes provisions for risk-based approaches to monitoring, emphasizing quality by design principles."
  },
  
  implementation: {
    steps: [
      "Identify critical data and processes",
      "Conduct risk assessment",
      "Develop monitoring plan based on risk assessment",
      "Define key risk indicators and quality tolerance limits",
      "Implement centralized monitoring capabilities",
      "Train team on risk-based approach",
      "Execute monitoring according to plan",
      "Adapt monitoring strategy as risks evolve"
    ],
    challenges: [
      "Determining appropriate risk indicators",
      "Establishing meaningful quality tolerance limits",
      "Integrating multiple data sources for centralized monitoring",
      "Ensuring proper documentation of risk-based decisions",
      "Training monitors on new methodologies",
      "Managing the transition from traditional approaches"
    ]
  },
  
  bimoInspections: {
    focus: "FDA's Bioresearch Monitoring Program (BIMO) inspections assess compliance with regulations and adherence to monitoring plans. For trials using RBM, inspectors evaluate whether the monitoring approach was appropriate for the risks identified and whether the sponsor implemented the monitoring plan effectively.",
    documentation: "Sponsors should maintain documentation of risk assessments, monitoring plans, centralized monitoring activities, site visit reports, and actions taken in response to identified issues.",
    commonFindings: [
      "Inadequate risk assessment",
      "Failure to implement monitoring plan as described",
      "Insufficient documentation of monitoring activities",
      "Lack of follow-up on identified issues",
      "Inappropriate quality tolerance limits",
      "Inadequate oversight of CROs or vendors"
    ]
  }
};

/**
 * Check if a query is related to Risk-Based Monitoring (RBM)
 * @param {string} query - The user's query
 * @returns {boolean} - Whether the query is RBM-related
 */
function isRbmQuery(query) {
  if (!query) return false;
  
  const lowerQuery = query.toLowerCase();
  const rbmTerms = [
    'rbm', 
    'risk-based monitoring', 
    'risk based monitoring',
    'bioresearch monitoring',
    'bimo',
    'central monitoring',
    'centralized monitoring',
    'remote monitoring',
    'risk indicators',
    'quality tolerance limit',
    'qtl',
    'critical data',
    'critical process'
  ];
  
  return rbmTerms.some(term => lowerQuery.includes(term));
}

/**
 * Generate a response to an RBM-related query
 * @param {string} query - The user's query
 * @returns {string} - The response
 */
function generateRbmResponse(query) {
  const lowerQuery = query.toLowerCase();
  let response = '';
  
  // Match query to most relevant information
  if (lowerQuery.includes('what is') || lowerQuery.includes('definition')) {
    response = `# Risk-Based Monitoring (RBM)\n\n${rbmKnowledgeBase.definition}\n\n## Key Principles\n\n`;
    rbmKnowledgeBase.keyPrinciples.forEach(principle => {
      response += `- ${principle}\n`;
    });
  } 
  else if (lowerQuery.includes('benefit') || lowerQuery.includes('advantage')) {
    response = `# Benefits of Risk-Based Monitoring\n\n`;
    rbmKnowledgeBase.benefits.forEach(benefit => {
      response += `- ${benefit}\n`;
    });
  }
  else if (lowerQuery.includes('component') || lowerQuery.includes('element') || lowerQuery.includes('part')) {
    response = `# Components of Risk-Based Monitoring\n\n`;
    for (const [component, description] of Object.entries(rbmKnowledgeBase.components)) {
      response += `## ${component.charAt(0).toUpperCase() + component.slice(1)}\n${description}\n\n`;
    }
  }
  else if (lowerQuery.includes('implement') || lowerQuery.includes('how to') || lowerQuery.includes('setup')) {
    response = `# Implementing Risk-Based Monitoring\n\n## Implementation Steps\n\n`;
    rbmKnowledgeBase.implementation.steps.forEach((step, index) => {
      response += `${index + 1}. ${step}\n`;
    });
    response += `\n## Implementation Challenges\n\n`;
    rbmKnowledgeBase.implementation.challenges.forEach(challenge => {
      response += `- ${challenge}\n`;
    });
  }
  else if (lowerQuery.includes('inspect') || lowerQuery.includes('bimo') || lowerQuery.includes('fda')) {
    response = `# FDA BIMO Inspections & Risk-Based Monitoring\n\n${rbmKnowledgeBase.bimoInspections.focus}\n\n## Documentation Requirements\n\n${rbmKnowledgeBase.bimoInspections.documentation}\n\n## Common Inspection Findings\n\n`;
    rbmKnowledgeBase.bimoInspections.commonFindings.forEach(finding => {
      response += `- ${finding}\n`;
    });
  }
  else if (lowerQuery.includes('regulat') || lowerQuery.includes('guidance') || lowerQuery.includes('guideline')) {
    response = `# Regulatory Background for Risk-Based Monitoring\n\n`;
    for (const [authority, guidance] of Object.entries(rbmKnowledgeBase.regulatoryBackground)) {
      response += `## ${authority.toUpperCase()}\n${guidance}\n\n`;
    }
  }
  else {
    // General overview for queries that don't match specific categories
    response = `# Risk-Based Monitoring (RBM) Overview\n\n${rbmKnowledgeBase.definition}\n\n## Key Components\n\n`;
    for (const [component, description] of Object.entries(rbmKnowledgeBase.components)) {
      response += `- **${component.charAt(0).toUpperCase() + component.slice(1)}**: ${description}\n`;
    }
    response += `\n## Benefits\n\n`;
    rbmKnowledgeBase.benefits.forEach(benefit => {
      response += `- ${benefit}\n`;
    });
  }
  
  return response;
}

/**
 * Prepare context from retrieved documents
 * @param {Array} documents - The retrieved documents
 * @returns {string} - Formatted context for the AI
 */
function prepareContext(documents) {
  if (!documents || documents.length === 0) {
    return '';
  }
  
  let context = 'REGULATORY KNOWLEDGE:\n\n';
  
  documents.forEach((doc, index) => {
    context += `[Document ${index + 1}] `;
    
    if (doc.jurisdiction) {
      context += `Jurisdiction: ${doc.jurisdiction}. `;
    }
    
    if (doc.doc_type) {
      context += `Type: ${doc.doc_type}. `;
    }
    
    if (doc.source) {
      context += `Source: ${doc.source}`;
      
      if (doc.section) {
        context += `, Section: ${doc.section}`;
      }
      
      context += '. ';
    }
    
    context += '\n';
    context += doc.content;
    context += '\n\n';
  });
  
  return context;
}

/**
 * Generate a response using the OpenAI API with RAG
 * @param {string} query - The user's query
 * @param {string} context - The context from RAG
 * @returns {Promise<Object>} - The AI response
 */
async function generateRagResponse(query, context = '') {
  try {
    // Extract regulatory context from the query
    let regulatoryContext = 'general';
    
    // Check for specific jurisdictions in the query
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('fda') || lowerQuery.includes('us regulation') || lowerQuery.includes('510k') || lowerQuery.includes('510(k)')) {
      regulatoryContext = 'FDA';
    } else if (lowerQuery.includes('ema') || lowerQuery.includes('eu regulation') || lowerQuery.includes('mdr') || lowerQuery.includes('ivdr')) {
      regulatoryContext = 'EMA';
    } else if (lowerQuery.includes('ich') || lowerQuery.includes('international')) {
      regulatoryContext = 'ICH';
    }
    
    console.log('Using RAG-based response for query: ' + JSON.stringify(query));
    
    // Check if we have a knowledge base yet
    const hasKnowledgeBase = fs.existsSync(KNOWLEDGE_DIR) && 
      fs.existsSync(METADATA_PATH) &&
      fs.readdirSync(KNOWLEDGE_DIR).length > 1; // More than just metadata.json
    
    // If knowledge base is empty, provide clear feedback instead of hardcoded responses
    if (!hasKnowledgeBase || !context || context.trim() === '') {
      console.log('No knowledge base found or empty context, informing user to add documents');
      return { 
        response: "I don't have specific information on that in my knowledge base yet. Please upload regulatory documents using the document processing feature to enhance my responses. I'll analyze the PDFs and use their content to provide more accurate answers to your regulatory questions." 
      };
    }
    
    // For now, we'll create a simulated response that acknowledges the knowledge we've retrieved
    // In a production implementation, this would call the OpenAI API with the context and query
    
    const regulatoryTerms = extractRegulatoryTerms(query);
    const hasRegulatoryTerms = regulatoryTerms.length > 0;
    
    // Generate a response based on retrieved documents
    let responseText = '';
    
    if (hasRegulatoryTerms) {
      responseText = `Based on the regulatory documents I've analyzed, I can provide the following information about ${regulatoryTerms.join(', ')}:\n\n`;
      
      // Include relevant excerpts from the context
      const contextLines = context.split('\n').filter(line => line.trim() !== '');
      const relevantLines = contextLines.filter(line => 
        regulatoryTerms.some(term => line.toLowerCase().includes(term.toLowerCase()))
      );
      
      if (relevantLines.length > 0) {
        responseText += relevantLines.slice(0, 5).join('\n\n');
      } else {
        responseText += "While I have some regulatory information in my knowledge base, I don't have specific details about your query yet. Please upload more relevant regulatory documents to enhance my knowledge in this area.";
      }
    } else {
      responseText = `I've searched my regulatory knowledge base for information related to your query. Here's what I found:\n\n`;
      
      // Include a summary based on the context
      if (context.length > 200) {
        responseText += context.substring(0, 500) + "...";
      } else {
        responseText += context;
      }
    }
    
    return { response: responseText };
  } catch (error) {
    console.error('Error generating response:', error);
    return { 
      response: "I encountered an error while trying to generate a response. Please try again or check the server logs for more information.",
      error: error.message
    };
  }
}

/**
 * Process a user query and generate an AI response enhanced with regulatory knowledge
 * @param {string} query - The user's query
 * @param {string} contextFilter - Filter context by jurisdiction or category
 * @returns {Promise<Object>} - The AI response
 */
async function processQuery(query, contextFilter = 'general') {
  try {
    // First check if this is an RBM-related query
    if (isRbmQuery(query)) {
      console.log('RBM-related query detected, using specialized RBM knowledge');
      const rbmResponse = generateRbmResponse(query);
      return { 
        response: rbmResponse,
        source: 'rbm-knowledge-base'
      };
    }
    
    // If not an RBM query, proceed with normal knowledge base processing
    // Check if the knowledge base directory exists
    if (!fs.existsSync(KNOWLEDGE_DIR)) {
      console.warn('Knowledge base directory does not exist, initializing empty knowledge base');
      await documentProcessor.initializeDatabase();
      return { 
        response: "I'm setting up my knowledge base for the first time. Please upload regulatory documents to help me provide better answers to your questions." 
      };
    }
    
    // Retrieve relevant documents from the knowledge base
    let documents = [];
    
    try {
      documents = await retrieveDocuments(query, 5);
      
      // Apply context filter if specified
      if (contextFilter && contextFilter !== 'general' && contextFilter !== 'global') {
        // Filter documents by jurisdiction if it matches the context filter
        const jurisdictionFilter = contextFilter.toUpperCase();
        documents = documents.filter(doc => {
          const docJurisdiction = (doc.jurisdiction || '').toUpperCase();
          return docJurisdiction.includes(jurisdictionFilter) || 
                 jurisdictionFilter.includes(docJurisdiction);
        });
      }
    } catch (error) {
      console.warn('Error retrieving documents:', error);
      // Continue with empty documents
    }
    
    // Prepare context from retrieved documents
    const context = prepareContext(documents);
    
    // Generate response using context and query
    return generateRagResponse(query, context);
  } catch (error) {
    console.error('Error processing query:', error);
    return { 
      response: "An error occurred while processing your query. Please try again later.",
      error: error.message
    };
  }
}

// Export functions
export {
  processQuery,
  retrieveDocuments,
  extractRegulatoryTerms,
  prepareContext,
  generateRagResponse
};