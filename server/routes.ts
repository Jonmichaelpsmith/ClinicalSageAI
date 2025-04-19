import express, { Application } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertDocumentSchema, insertDocumentVersionSchema, insertDocumentCommentSchema } from "../shared/schema";
import { z } from "zod";
// Skip IND sequence routes for now until we fix module compatibility
// We'll implement a pure TypeScript version later

const router = express.Router();

export async function registerRoutes(app: Application) {
  // Register our router with the app
  app.use(router);
  
  // Return an HTTP server
  return createServer(app);
}

// Document routes
router.get("/api/documents", async (req, res) => {
  try {
    const documents = await storage.getAllDocuments();
    return res.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return res.status(500).json({ error: "Failed to fetch documents" });
  }
});

router.post("/api/documents", async (req, res) => {
  try {
    // Use a default title if none provided
    const document = insertDocumentSchema.parse({
      title: req.body.title || "Untitled Document",
      author_id: req.body.author_id || 1 // Default author ID for now
    });
    
    const newDocument = await storage.createDocument(document);
    
    // Also create an initial version with empty content
    await storage.createDocumentVersion({
      document_id: newDocument.id,
      content: req.body.content || {}
    });
    
    return res.json(newDocument);
  } catch (error) {
    console.error("Error creating document:", error);
    return res.status(500).json({ error: "Failed to create document" });
  }
});

router.get("/api/documents/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid document ID" });
    }
    
    const document = await storage.getDocument(id);
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }
    
    // Get the latest version content
    const versions = await storage.getDocumentVersions(id);
    const latestVersion = versions.length > 0 ? versions[0] : null;
    
    return res.json({ 
      ...document, 
      content: latestVersion?.content || {}
    });
  } catch (error) {
    console.error(`Error fetching document ${req.params.id}:`, error);
    return res.status(500).json({ error: "Failed to fetch document" });
  }
});

router.put("/api/documents/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid document ID" });
    }
    
    // Validate content exists
    const schema = z.object({
      content: z.any(),
    }).required();
    
    const { content } = schema.parse(req.body);
    
    const result = await storage.updateDocument(id, content);
    return res.json(result);
  } catch (error) {
    console.error(`Error updating document ${req.params.id}:`, error);
    return res.status(500).json({ error: "Failed to update document" });
  }
});

router.get("/api/documents/:id/versions", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid document ID" });
    }
    
    const versions = await storage.getDocumentVersions(id);
    return res.json(versions);
  } catch (error) {
    console.error(`Error fetching versions for document ${req.params.id}:`, error);
    return res.status(500).json({ error: "Failed to fetch document versions" });
  }
});

// Document Comment routes
router.post("/api/documents/:id/comments", async (req, res) => {
  try {
    const document_id = parseInt(req.params.id);
    if (isNaN(document_id)) {
      return res.status(400).json({ error: "Invalid document ID" });
    }
    
    const comment = insertDocumentCommentSchema.parse({
      document_id,
      user_id: req.body.user_id,
      content: req.body.content,
      position: req.body.position
    });
    
    const newComment = await storage.createDocumentComment(comment);
    return res.json(newComment);
  } catch (error) {
    console.error(`Error creating comment for document ${req.params.id}:`, error);
    return res.status(500).json({ error: "Failed to create comment" });
  }
});

router.get("/api/documents/:id/comments", async (req, res) => {
  try {
    const document_id = parseInt(req.params.id);
    if (isNaN(document_id)) {
      return res.status(400).json({ error: "Invalid document ID" });
    }
    
    const comments = await storage.getDocumentComments(document_id);
    return res.json(comments);
  } catch (error) {
    console.error(`Error fetching comments for document ${req.params.id}:`, error);
    return res.status(500).json({ error: "Failed to fetch document comments" });
  }
});

export default router;