import { Router } from "express";
import * as ai from "../services/aiUtils.js";
import fs from "fs";
import path from "path";
import pdf from "pdf-parse";

const chat = Router();

// Temporary in-memory document cache for demo purposes
// This will be replaced with proper database storage later
const documentCache = [];

// Helper function to load document text from PDF
async function loadTextFromPdf(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const pdfBuffer = fs.readFileSync(filePath);
    const data = await pdf(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error(`Error loading PDF ${filePath}:`, error);
    return null;
  }
}

// Helper to scan directories for PDFs
function scanPdfsInDirectory(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      return [];
    }
    const files = fs.readdirSync(dirPath);
    return files.filter(file => file.toLowerCase().endsWith('.pdf'));
  } catch (error) {
    console.error("Error scanning PDF directory:", error);
    return [];
  }
}

// POST /api/chat { question, topK }
chat.post("/chat", async (req, res, next) => {
  try {
    const { question } = req.body;

    // Prepare the context with available documents
    let context = "";
    
    // If document cache is empty, load some PDFs to give us context
    if (documentCache.length === 0) {
      // Check attached_assets directory for example PDFs
      const pdfDirectory = path.join(process.cwd(), 'attached_assets');
      const pdfFiles = scanPdfsInDirectory(pdfDirectory);
      
      // Load the first 5 PDFs for context
      for (const file of pdfFiles.slice(0, 5)) {
        const filePath = path.join(pdfDirectory, file);
        const text = await loadTextFromPdf(filePath);
        if (text) {
          documentCache.push({ 
            title: file,
            text: text
          });
        }
      }
    }
    
    // Use cached documents as context
    if (documentCache.length > 0) {
      context = documentCache
        .map(doc => `### ${doc.title}\n${doc.text.slice(0, 4000)}`)
        .join("\n\n");
    } else {
      // Fallback if no documents are available
      context = "No document context available. Please upload PDFs for analysis.";
    }

    // Generate an answer using OpenAI
    const answer = await ai.answerQuestion({ 
      question, 
      context 
    });
    
    res.json({ 
      answer, 
      sources: documentCache.map(d => d.title) 
    });
  } catch (e) { 
    console.error("Error in chat API:", e);
    next(e); 
  }
});

export default chat;