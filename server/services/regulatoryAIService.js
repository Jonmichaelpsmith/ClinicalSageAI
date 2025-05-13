/**
 * Regulatory AI Service for TrialSage
 * 
 * This service implements a Retrieval-Augmented Generation (RAG) approach
 * to enhance the AI's responses with regulatory knowledge.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { OpenAI } = require('openai');
require('dotenv').config();

// Database setup
const DB_PATH = path.join(__dirname, '../../data/knowledge_base.db');

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Enhanced semantic search to match user queries against knowledge base documents
 * This version uses a more sophisticated keyword matching with ranking
 * @param {string} query - The user's query
 * @param {number} limit - Number of documents to retrieve
 * @returns {Promise<Array>} - Array of relevant documents
 */
async function retrieveDocuments(query, limit = 5) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        reject(err);
        return;
      }
      
      // Extract and clean keywords from the query
      const rawQuery = query.toLowerCase().trim();
      
      // Identify regulatory jurisdictions in the query
      const jurisdictions = [
        {term: 'fda', jurisdiction: 'USA'}, 
        {term: 'ema', jurisdiction: 'EU'}, 
        {term: 'eu mdr', jurisdiction: 'EU'},
        {term: 'mdr', jurisdiction: 'EU'},
        {term: 'eudamed', jurisdiction: 'EU'},
        {term: 'pmda', jurisdiction: 'Japan'},
        {term: 'japan', jurisdiction: 'Japan'},
        {term: 'nmpa', jurisdiction: 'China'},
        {term: 'china', jurisdiction: 'China'},
        {term: 'health canada', jurisdiction: 'Canada'},
        {term: 'canada', jurisdiction: 'Canada'},
        {term: 'tga', jurisdiction: 'Australia'},
        {term: 'australia', jurisdiction: 'Australia'},
        {term: 'ich', jurisdiction: 'Global'}
      ];
      
      // Check if any jurisdiction terms are in the query
      let targetJurisdiction = null;
      for (const j of jurisdictions) {
        if (rawQuery.includes(j.term)) {
          targetJurisdiction = j.jurisdiction;
          break;
        }
      }
      
      // Process keywords for the search
      const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 
                         'as', 'into', 'like', 'through', 'after', 'over', 'between', 'out', 'against', 'during', 'without'];
      
      // Get all keywords
      const allKeywords = rawQuery
        .replace(/[^\w\s]/g, ' ')  // Replace punctuation with spaces
        .split(/\s+/)              // Split on whitespace
        .filter(word => word.length > 2 && !stopWords.includes(word)); // Remove stop words and short words
      
      // If no useful keywords, return empty
      if (allKeywords.length === 0) {
        resolve([]);
        db.close();
        return;
      }
      
      // Extract specialized regulatory terms
      const regulatoryTerms = extractRegulatoryTerms(rawQuery);
      
      // Prepare SQL
      let sql = `
        SELECT id, source, section, content, jurisdiction, tags,
               (`;
      
      // Create a scoring formula - each keyword match adds points
      const scoreClauses = allKeywords.map(keyword => 
        `(CASE WHEN LOWER(content) LIKE '%${keyword}%' THEN 5 ELSE 0 END) + ` + 
        `(CASE WHEN LOWER(source) LIKE '%${keyword}%' THEN 10 ELSE 0 END) + ` +
        `(CASE WHEN LOWER(section) LIKE '%${keyword}%' THEN 8 ELSE 0 END)`
      );
      
      // Add bonuses for regulatory term matches
      const regulatoryScoreClauses = regulatoryTerms.map(term => 
        `(CASE WHEN LOWER(content) LIKE '%${term}%' THEN 15 ELSE 0 END) + ` +
        `(CASE WHEN LOWER(source) LIKE '%${term}%' THEN 20 ELSE 0 END) + ` +
        `(CASE WHEN LOWER(tags) LIKE '%${term}%' THEN 15 ELSE 0 END)`
      );
      
      // Combine all scoring clauses
      const allScoreClauses = [...scoreClauses, ...regulatoryScoreClauses];
      sql += allScoreClauses.join(' + ');
      sql += `) AS relevance_score `;
      
      // FROM and WHERE clauses
      sql += `FROM knowledge_base WHERE `;
      
      // Base condition - at least one keyword must match
      const keywordConditions = allKeywords.map(keyword => 
        `LOWER(content) LIKE '%${keyword}%' OR LOWER(source) LIKE '%${keyword}%' OR LOWER(section) LIKE '%${keyword}%' OR LOWER(tags) LIKE '%${keyword}%'`
      );
      sql += `(${keywordConditions.join(' OR ')})`;
      
      // Add jurisdiction filter if detected
      if (targetJurisdiction) {
        sql += ` AND (jurisdiction = '${targetJurisdiction}' OR jurisdiction = 'Global')`;
      }
      
      // Order by relevance score and limit results
      sql += ` ORDER BY relevance_score DESC LIMIT ${limit}`;
      
      // Execute query
      db.all(sql, [], (err, rows) => {
        if (err) {
          console.error('Error in similarity search:', err.message);
          reject(err);
        } else {
          // Log the top match for debugging
          if (rows.length > 0) {
            console.log(`Top match for "${query}": ${rows[0].source} (Score: ${rows[0].relevance_score})`);
          }
          resolve(rows);
        }
        db.close();
      });
    });
  });
}

/**
 * Extract regulatory-specific terms from a query
 * @param {string} query - The user's query 
 * @returns {Array<string>} - Array of regulatory terms
 */
function extractRegulatoryTerms(query) {
  // Key regulatory terminology to detect
  const termDictionary = [
    // Submission types
    '510k', 'pma', 'de novo', 'hde', 'ide', 'ind', 'nda', 'anda', 'bla',
    'premarket', 'post-market', 'postmarket', 'special', 'traditional', 'abbreviated',
    
    // Regulatory frameworks
    'mdr', 'ivdr', 'gcp', 'gmp', 'qsr', 'iso 13485', 'iso 14971', 'meddev',
    
    // ICH Guidelines
    'ich e1', 'ich e2', 'ich e3', 'ich e4', 'ich e5', 'ich e6', 'ich e7', 'ich e8',
    'ich e9', 'ich e10', 'ich e11', 'ich e12', 'ich e14', 'ich e15', 'ich e16', 
    'ich e17', 'ich e18', 'ich e19', 'ich e20',
    
    // Clinical content
    'clinical evaluation', 'clinical trial', 'clinical data', 'clinical evidence',
    'cer', 'clinical evaluation report', 'pmcf', 'safety', 'efficacy',
    'substantial equivalence', 'predicate', 'device classification',
    
    // Technical terminology
    'technical file', 'technical documentation', 'declaration of conformity',
    'essential requirements', 'udigspr', 'notified body', 'competent authority'
  ];
  
  // Check for each term in the query
  const foundTerms = [];
  const lowerQuery = query.toLowerCase();
  
  for (const term of termDictionary) {
    if (lowerQuery.includes(term.toLowerCase())) {
      foundTerms.push(term);
    }
  }
  
  return foundTerms;
}

/**
 * Prepare context from retrieved documents
 * @param {Array} documents - The retrieved documents
 * @returns {string} - Formatted context for the AI
 */
function prepareContext(documents) {
  if (!documents || documents.length === 0) {
    return "No relevant regulatory documents found.";
  }
  
  return documents.map(doc => {
    const source = doc.source ? `Source: ${doc.source}` : '';
    const section = doc.section ? `Section: ${doc.section}` : '';
    const jurisdiction = doc.jurisdiction ? `Jurisdiction: ${doc.jurisdiction}` : '';
    
    return `
${source} ${section} ${jurisdiction}
---
${doc.content.substring(0, 1000)}
---
    `;
  }).join('\n\n');
}

/**
 * Generate a response using the OpenAI API with RAG
 * @param {string} query - The user's query
 * @param {string} context - The context from RAG
 * @returns {Promise<Object>} - The AI response
 */
async function generateRagResponse(query, context = '') {
  try {
    const documents = await retrieveDocuments(query);
    const enrichedContext = prepareContext(documents);
    
    const systemPrompt = `
You are LUMEN, a global expert in Regulatory Affairs for biotech, medical devices, pharmaceuticals, and CROs. 
You have in-depth knowledge of regulations from FDA, EMA, PMDA, NMPA, Health Canada, TGA and other global 
regulatory authorities, as well as ICH guidelines (especially efficacy guidelines E1-E20).

When answering questions, prioritize information from the provided context. If the context contains relevant information, 
use it to formulate your answer and ALWAYS cite the specific source document and section.

If the context does not contain sufficient information to answer the question fully, you may use your general knowledge 
about regulatory affairs, but clearly indicate when you're doing so.

Always structure your responses in a clear, professional manner with appropriate headings and bullet points where helpful.

If you cannot answer a question with confidence, acknowledge the limitations of your knowledge and suggest seeking 
advice from a qualified regulatory professional.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Context information from regulatory documents:\n\n${enrichedContext}\n\nUser question: ${query}` }
      ],
      temperature: 0.2,
      max_tokens: 2000
    });
    
    return {
      response: response.choices[0].message.content,
      sourceDocuments: documents.map(doc => ({
        source: doc.source,
        section: doc.section,
        jurisdiction: doc.jurisdiction
      }))
    };
  } catch (error) {
    console.error('Error generating RAG response:', error);
    
    // Fallback to hardcoded responses (as we've already implemented)
    return {
      response: `I apologize, but I encountered an error retrieving regulatory information. Please try again with a more specific question about regulatory affairs.`,
      error: error.message
    };
  }
}

module.exports = {
  retrieveDocuments,
  generateRagResponse
};