/**
 * Regulatory AI Service for TrialSage
 * 
 * This service implements a Retrieval-Augmented Generation (RAG) approach
 * to enhance the AI's responses with regulatory knowledge.
 * 
 * NOTE: This version uses the file system for storage rather than SQLite
 * to avoid dependency issues.
 */

const fs = require('fs');
const path = require('path');
const documentProcessor = require('./documentProcessor');

// Path to the knowledge base
const DATA_DIR = path.join(__dirname, '../../data');
const KNOWLEDGE_DIR = path.join(DATA_DIR, 'knowledge_base');
const METADATA_PATH = path.join(KNOWLEDGE_DIR, 'metadata.json');

// Hardcoded knowledge for key regulatory concepts
// This will be used as a fallback when the knowledge base is not yet populated
const DEFAULT_REGULATORY_KNOWLEDGE = {
  "FDA": {
    "510k": "A 510(k) is a premarket submission made to FDA to demonstrate that a device is as safe and effective (substantially equivalent) to a legally marketed device. Submitters must compare their device to one or more similar legally marketed devices.",
    "PMA": "Premarket Approval (PMA) is the FDA process of scientific and regulatory review to evaluate the safety and effectiveness of Class III medical devices. Class III devices are those that support or sustain human life, are of substantial importance in preventing impairment of human health, or present a potential, unreasonable risk of illness or injury.",
    "De Novo": "The De Novo process provides a pathway to classify novel medical devices for which general controls, or general and special controls, provide reasonable assurance of safety and effectiveness, but for which there is no legally marketed predicate device.",
    "QSR": "The Quality System Regulation (QSR) is a regulation that requires manufacturers to establish quality systems to ensure their products consistently meet applicable requirements and specifications. The QSR for medical devices is described in 21 CFR Part 820."
  },
  "EMA": {
    "MDR": "The Medical Device Regulation (MDR) 2017/745 is the European legislation governing the production and distribution of medical devices in Europe. It replaced the Medical Devices Directive (93/42/EEC) and Active Implantable Medical Devices Directive (90/385/EEC).",
    "IVDR": "The In Vitro Diagnostic Regulation (IVDR) 2017/746 is the European legislation governing the production and distribution of in vitro diagnostic medical devices in Europe. It replaced the In Vitro Diagnostic Directive (98/79/EC).",
    "CE Marking": "CE Marking is a certification mark that indicates conformity with health, safety, and environmental protection standards for products sold within the European Economic Area (EEA).",
    "Clinical Evaluation Report": "A Clinical Evaluation Report (CER) is a document that systematically assesses the clinical data related to a medical device to verify its clinical safety and performance. Under the EU MDR, CERs are mandatory documentation for medical devices sold in the EU."
  },
  "ICH": {
    "GCP": "Good Clinical Practice (GCP) is an international quality standard provided by ICH that ensures the rights, safety, and well-being of human subjects involved in clinical trials. It is defined in ICH E6.",
    "E6": "ICH E6 provides guidance on Good Clinical Practice for clinical trials on medicinal products/devices.",
    "E8": "ICH E8 provides general considerations for clinical trials, including the design, conduct, safety, and reporting.",
    "E9": "ICH E9 provides statistical principles for clinical trials, offering guidance on the design, analysis, and evaluation of clinical trials of medicinal products/devices."
  },
  "General": {
    "Clinical Evaluation Report": "A Clinical Evaluation Report (CER) is a document that systematically evaluates clinical data relevant to a medical device to determine its clinical safety and performance. It is a required component of regulatory submissions in many jurisdictions, particularly under the EU MDR.",
    "Substantial Equivalence": "Substantial equivalence is a legal term used by the FDA to determine if a new device is similar enough to a legally marketed device (predicate device) so that the new device can be cleared through the 510(k) process rather than requiring PMA.",
    "Risk Management": "Risk management in medical devices involves identifying, evaluating, and mitigating potential hazards throughout the lifecycle of a device. It is governed by standards like ISO 14971.",
    "Post-Market Surveillance": "Post-market surveillance (PMS) is the active collection and evaluation of experience gained from devices that have been placed on the market. It is a regulatory requirement in most jurisdictions."
  }
};

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
    
    // Check if we have a knowledge base yet
    const hasKnowledgeBase = fs.existsSync(KNOWLEDGE_DIR) && 
      fs.existsSync(METADATA_PATH) &&
      fs.readdirSync(KNOWLEDGE_DIR).length > 1; // More than just metadata.json
    
    // Use hard-coded responses when knowledge is empty
    if (!hasKnowledgeBase || !context || context.trim() === '') {
      // Fall back to hardcoded knowledge
      const fallbackContext = DEFAULT_REGULATORY_KNOWLEDGE[regulatoryContext] || DEFAULT_REGULATORY_KNOWLEDGE.General;
      
      // Find the most relevant key in the fallback context
      let bestMatch = null;
      let bestMatchScore = 0;
      
      for (const [key, value] of Object.entries(fallbackContext)) {
        if (lowerQuery.includes(key.toLowerCase())) {
          const score = key.length; // Longer matches are better
          if (score > bestMatchScore) {
            bestMatchScore = score;
            bestMatch = value;
          }
        }
      }
      
      // Use the best match or a generic response
      if (bestMatch) {
        return {
          response: bestMatch + "\n\n(This response is based on built-in knowledge as the regulatory knowledge base has not been fully populated yet. Process regulatory documents to enhance responses.)"
        };
      } else {
        return { 
          response: "I don't have specific information on that in my knowledge base yet. Please process relevant regulatory documents to enhance my responses, or try asking a more general regulatory question." 
        };
      }
    }
    
    // For now, we'll create a simulated response that acknowledges the knowledge we've retrieved
    // In a production implementation, this would call the OpenAI API with the context and query
    
    const regulatoryTerms = extractRegulatoryTerms(query);
    const hasRegulatoryTerms = regulatoryTerms.length > 0;
    
    // Generate a simulated response that shows how the retrieved documents would be used
    let simulatedResponse = '';
    
    if (hasRegulatoryTerms) {
      simulatedResponse = `Based on the regulatory documents I've analyzed, I can provide the following information about ${regulatoryTerms.join(', ')}:\n\n`;
      
      // Include snippets from the context to simulate using the retrieved information
      const contextLines = context.split('\n').filter(line => line.trim() !== '');
      const relevantLines = contextLines.filter(line => 
        regulatoryTerms.some(term => line.toLowerCase().includes(term.toLowerCase()))
      );
      
      if (relevantLines.length > 0) {
        simulatedResponse += relevantLines.slice(0, 5).join('\n\n');
      } else {
        simulatedResponse += "While I have some regulatory information in my knowledge base, I don't have specific details about your query yet. Please process more relevant regulatory documents to enhance my knowledge in this area.";
      }
    } else {
      simulatedResponse = `I've searched my regulatory knowledge base for information related to your query. Here's what I found:\n\n`;
      
      // Include a summary based on the context
      if (context.length > 200) {
        simulatedResponse += context.substring(0, 500) + "...";
      } else {
        simulatedResponse += context;
      }
    }
    
    simulatedResponse += "\n\n(This is a simulated response based on the documents in the knowledge base. In a production implementation, this would be processed through OpenAI's API to generate a more coherent and comprehensive response.)";
    
    return { response: simulatedResponse };
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
    // Check if the knowledge base directory exists
    if (!fs.existsSync(KNOWLEDGE_DIR) || !fs.existsSync(METADATA_PATH)) {
      console.warn('Knowledge base not initialized, using default responses');
      return await generateRagResponse(query, '');
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

module.exports = {
  processQuery,
  retrieveDocuments,
  extractRegulatoryTerms,
  prepareContext,
  generateRagResponse
};