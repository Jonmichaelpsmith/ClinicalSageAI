import express from "express";
import path from "path";
import fs from "fs";
import { db } from "../db";

const router = express.Router();

/**
 * @route POST /api/intelligence/ingest-csr
 * @description Ingest a CSR document into the intelligence database for study planning
 */
router.post("/ingest-csr", async (req, res) => {
  try {
    const { csr_id, content } = req.body;

    if (!content || typeof content !== "object") {
      return res.status(400).json({ error: "Missing or invalid CSR content" });
    }

    // Generate a unique ID if not provided
    const csrId = csr_id || `csr_${new Date().toISOString().replace(/[:.]/g, "").replace("T", "_")}`;
    
    // Store in intelligence directory
    const intelligenceDir = path.join(process.cwd(), "lumen_reports_backend", "intelligence_db");
    
    // Ensure directory exists
    fs.mkdirSync(intelligenceDir, { recursive: true });
    
    // Write to JSON file
    const csrPath = path.join(intelligenceDir, `${csrId}.json`);
    fs.writeFileSync(csrPath, JSON.stringify(content, null, 2));
    
    // Also store reference in database if applicable
    try {
      // If we have a trial with matching name/ID, create a reference
      if (content.title) {
        // Implementation depends on database schema - this is just a placeholder
        // Save a reference to this CSR in the database for future intelligence operations
      }
    } catch (dbError) {
      console.error("Non-critical DB error:", dbError);
      // Continue even if database reference creation fails
    }
    
    return res.status(200).json({
      status: "indexed",
      csr_id: csrId,
      redirect_route: `/planning?csr_id=${csrId}`
    });
  } catch (error) {
    console.error("CSR Ingestion Error:", error);
    return res.status(500).json({ 
      error: "Failed to process CSR for intelligence",
      message: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

export default router;