/**
 * AI Backfill Script
 * 
 * This script:
 * 1. Scans all documents in DocuShare
 * 2. For each document, extracts text, creates embeddings, and generates metadata
 * 3. Stores the enriched document data in the database
 * 
 * Can be run as a one-time migration or scheduled via cron
 */

import prisma from "../prisma/client.js";
import * as ds from "../services/docushare.js";
import * as ai from "../services/aiUtils.js";
import pdf from "pdf-parse";
import path from "path";
import fs from "fs-extra";

/**
 * Main backfill function
 * Processes all documents in DocuShare
 */
export async function backfill() {
  console.log("Starting AI backfill process...");
  
  try {
    // Get all documents from DocuShare
    const docs = await ds.list();
    console.log(`Found ${docs.length} documents in DocuShare`);
    
    // Process each document
    for (const doc of docs) {
      try {
        // Skip if already processed
        const exists = await prisma.document.findFirst({ 
          where: { sha256: doc.objectId } 
        });
        
        if (exists) {
          console.log(`Skipping ${doc.displayName} (already processed)`);
          continue;
        }
        
        console.log(`Processing ${doc.displayName}...`);
        
        // Download document
        const buffer = await ds.download(doc.objectId);
        
        // Extract text from PDF
        const text = (await pdf(buffer)).text;
        
        // Process with AI in parallel
        const [embedding, summary, classification] = await Promise.all([
          ai.embed(text), 
          ai.generateDocumentSummary(text), 
          ai.analyzeDocumentType(text, doc.displayName),
        ]);
        
        // Store document metadata
        await prisma.document.create({
          data: {
            name: doc.displayName,
            sha256: doc.objectId,
            summary,
            module: classification.documentType || "unknown",
            subSection: classification.regulatoryContext || "unknown",
            keywords: classification.keywords || [],
            studyId: extractStudyId(doc.displayName),
          },
        });
        
        // Store document for semantic search
        await prisma.study_document.create({
          data: {
            objectId: doc.objectId,
            title: doc.displayName,
            text,
            embedding,
            studyId: extractStudyId(doc.displayName),
          },
        });
        
        console.log(`Successfully processed ${doc.displayName}`);
      } catch (error) {
        console.error(`Error processing document ${doc.displayName}:`, error);
        // Continue with next document
      }
    }
    
    console.log("AI back-fill process completed successfully");
  } catch (error) {
    console.error("Error during AI backfill process:", error);
  }
}

/**
 * Extract study ID from filename if present
 * Uses common patterns like STUDY-123, STU-123, etc.
 */
function extractStudyId(filename) {
  // Common study ID patterns
  const patterns = [
    /STUDY[-_](\w+)/i,
    /STU[-_](\w+)/i,
    /TRIAL[-_](\w+)/i,
    /CT[-_](\w+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = filename.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Helper to embed a single document
 */
export async function embedDocument(objectId) {
  try {
    const doc = await ds.info(objectId);
    const buffer = await ds.download(objectId);
    const text = (await pdf(buffer)).text;
    
    const [embedding, summary, classification] = await Promise.all([
      ai.embed(text), 
      ai.generateDocumentSummary(text), 
      ai.analyzeDocumentType(text, doc.displayName),
    ]);
    
    await prisma.document.upsert({
      where: { sha256: objectId },
      update: {
        summary,
        module: classification.documentType || "unknown",
        subSection: classification.regulatoryContext || "unknown",
        keywords: classification.keywords || [],
      },
      create: {
        name: doc.displayName,
        sha256: objectId,
        summary,
        module: classification.documentType || "unknown",
        subSection: classification.regulatoryContext || "unknown",
        keywords: classification.keywords || [],
        studyId: extractStudyId(doc.displayName),
      },
    });
    
    await prisma.study_document.upsert({
      where: { objectId },
      update: {
        text,
        embedding,
      },
      create: {
        objectId,
        title: doc.displayName,
        text,
        embedding,
        studyId: extractStudyId(doc.displayName),
      },
    });
    
    return true;
  } catch (error) {
    console.error(`Error embedding document ${objectId}:`, error);
    return false;
  }
}

// Run backfill if script is executed directly
if (process.argv[1] === path.resolve(process.cwd(), "scripts/aiBackfill.js")) {
  backfill()
    .then(() => process.exit(0))
    .catch(error => {
      console.error("Fatal error during backfill:", error);
      process.exit(1);
    });
}