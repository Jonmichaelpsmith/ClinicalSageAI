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
 * Simple vector similarity search using SQL (in a real implementation, 
 * we would use a proper vector database like FAISS or Pinecone)
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
      
      // In a real implementation, we would do semantic search
      // For now, we'll use a simple keyword search
      const keywords = query.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3);
      
      if (keywords.length === 0) {
        resolve([]);
        db.close();
        return;
      }
      
      // Build a query that looks for each keyword in the content
      const conditions = keywords.map(() => 'LOWER(content) LIKE ?').join(' OR ');
      const params = keywords.map(keyword => `%${keyword}%`);
      
      const sql = `
        SELECT id, source, section, content, jurisdiction, tags 
        FROM knowledge_base 
        WHERE ${conditions}
        ORDER BY id DESC
        LIMIT ?
      `;
      params.push(limit);
      
      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Error querying database:', err.message);
          reject(err);
        } else {
          resolve(rows);
        }
        db.close();
      });
    });
  });
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