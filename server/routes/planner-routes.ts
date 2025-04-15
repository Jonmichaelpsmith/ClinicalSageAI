import { Router, Request, Response } from "express";
import { generateIndSection, buildINDModuleDraft } from "../../agents/openai/trialsage_assistant";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const router = Router();

/**
 * Generate an IND summary based on protocol
 */
router.post("/api/planner/generate-ind", async (req: Request, res: Response) => {
  try {
    const { protocol, sessionId, csrContext } = req.body;
    
    if (!protocol) {
      return res.status(400).json({
        success: false,
        message: "Protocol text is required"
      });
    }
    
    // Use CSR context for enhanced generation if available
    let enhancedContent = "";
    
    if (csrContext) {
      // Extract key information from CSR context for template
      const molecule = csrContext.drugName || "";
      const moa = csrContext.moa || "";
      const primaryEndpoint = csrContext.primary_endpoint || "";
      const designRationale = csrContext.design_rationale || "";
      const statisticalModel = csrContext.primary_model || "";
      
      // Build enhanced IND content using CSR precedent
      enhancedContent = `This trial protocol was developed based on CSR precedent involving ${molecule}, a ${moa}. `;
      
      if (primaryEndpoint) {
        enhancedContent += `The primary endpoint utilized is ${primaryEndpoint}, which aligns with regulatory precedent. `;
      }
      
      if (designRationale) {
        enhancedContent += `The design rationale includes: ${designRationale}. `;
      }
      
      if (statisticalModel) {
        enhancedContent += `Statistical modeling is based on ${statisticalModel}.`;
      }
    }
    
    // Get the IND content using built-in functions
    let indContent;
    try {
      // First try using the csrContext's indication if available
      if (csrContext && csrContext.indication) {
        const response = await buildINDModuleDraft(
          "Clinical Protocol", 
          csrContext.indication,
          csrContext?.moa || "",
          []
        );
        indContent = response.content;
      } else {
        // Fall back to direct protocol analysis
        const response = await generateIndSection(
          sessionId || "adhoc",
          "Clinical Protocol",
          protocol
        );
        indContent = response.content;
      }
      
      // Prepend enhanced content from CSR if available
      if (enhancedContent) {
        indContent = enhancedContent + "\n\n" + indContent;
      }
      
      return res.json({
        success: true,
        content: indContent
      });
    } catch (error) {
      console.error("Error generating IND summary:", error);
      
      // Simple fallback if all AI methods fail
      return res.json({
        success: true,
        content: "## Investigational New Drug (IND) Summary\n\n" +
                "This document summarizes the key elements of the protocol for regulatory submission as part of an IND application.\n\n" +
                "### Protocol Overview\n\n" + 
                (protocol.substring(0, 500) + "...") +
                "\n\n(Error generating complete IND summary. Please try again later.)"
      });
    }
  } catch (error) {
    console.error("Error in generate-ind endpoint:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred"
    });
  }
});

/**
 * Generate a SAP (Statistical Analysis Plan) based on protocol
 */
router.post("/api/planner/generate-sap", async (req: Request, res: Response) => {
  try {
    const { protocol, sessionId, csrContext } = req.body;
    
    if (!protocol) {
      return res.status(400).json({
        success: false,
        message: "Protocol text is required"
      });
    }
    
    // Use the generateIndSection function with SAP-specific prompt
    try {
      const response = await generateIndSection(
        sessionId || "adhoc",
        "Statistical Analysis Plan",
        `Protocol: ${protocol}\n${csrContext ? `CSR context: ${JSON.stringify(csrContext)}` : ""}`
      );
      
      return res.json({
        success: true,
        content: response.content
      });
    } catch (error) {
      console.error("Error generating SAP:", error);
      
      // Simple fallback if AI method fails
      return res.json({
        success: true,
        content: "# Statistical Analysis Plan\n\n" +
                "This document outlines the statistical methods for analyzing the data collected in the clinical trial.\n\n" +
                "## Overview\n\n" + 
                (protocol.substring(0, 300) + "...") +
                "\n\n(Error generating complete SAP. Please try again later.)"
      });
    }
  } catch (error) {
    console.error("Error in generate-sap endpoint:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred"
    });
  }
});

/**
 * Generate a protocol summary based on protocol
 */
router.post("/api/planner/generate-summary", async (req: Request, res: Response) => {
  try {
    const { protocol, sessionId, csrContext } = req.body;
    
    if (!protocol) {
      return res.status(400).json({
        success: false,
        message: "Protocol text is required"
      });
    }
    
    // Use the generateIndSection function with summary-specific prompt
    try {
      const response = await generateIndSection(
        sessionId || "adhoc",
        "Protocol Summary",
        `Protocol: ${protocol}\n${csrContext ? `CSR context: ${JSON.stringify(csrContext)}` : ""}`
      );
      
      return res.json({
        success: true,
        content: response.content
      });
    } catch (error) {
      console.error("Error generating protocol summary:", error);
      
      // Simple fallback if AI method fails
      return res.json({
        success: true,
        content: "# Protocol Summary\n\n" +
                "This document provides a high-level overview of the clinical trial protocol.\n\n" +
                "## Overview\n\n" + 
                (protocol.substring(0, 300) + "...") +
                "\n\n(Error generating complete summary. Please try again later.)"
      });
    }
  } catch (error) {
    console.error("Error in generate-summary endpoint:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred"
    });
  }
});

/**
 * Export generated document to PDF
 */
router.post("/api/planner/export-sap", async (req: Request, res: Response) => {
  exportToPDF(req, res, "SAP");
});

router.post("/api/planner/export-ind", async (req: Request, res: Response) => {
  exportToPDF(req, res, "IND");
});

router.post("/api/planner/export-summary", async (req: Request, res: Response) => {
  exportToPDF(req, res, "Summary");
});

/**
 * Helper function to export content to PDF
 */
async function exportToPDF(req: Request, res: Response, type: string) {
  try {
    const { content, sessionId, metadata } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content is required"
      });
    }
    
    // Create a text file as a simple fallback
    // In a real implementation, this would use a PDF generation library
    const exportsDir = path.join(process.cwd(), 'data/exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    
    const outputFileName = `${type.toLowerCase()}_${sessionId || uuidv4()}.txt`;
    const outputPath = path.join(exportsDir, outputFileName);
    
    // Write content to file
    const metadataString = metadata ? 
      `\n\nMetadata: ${JSON.stringify(metadata, null, 2)}` : "";
    fs.writeFileSync(outputPath, content + metadataString);
    
    // Send the file as the response
    res.sendFile(outputPath);
  } catch (error) {
    console.error(`Error exporting ${type} to PDF:`, error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred"
    });
  }
}

export default router;