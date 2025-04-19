import express, { Application } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertDocumentSchema, insertDocumentVersionSchema, insertDocumentCommentSchema } from "../shared/schema";
import { z } from "zod";
import WebSocket from 'ws';

// Global socket.io instance to allow emitting from other modules
export let io: any;
// We'll add the IND sequence routes during registration

const router = express.Router();

export async function registerRoutes(app: Application) {
  // Register our router with the app
  app.use(router);
  
  // Register IND sequence routes for FDA submission
  try {
    // Import the ESM-compatible IND sequence routes
    const indSequenceRoutesPath = new URL('./routes/indSequenceRoutes.mjs', import.meta.url);
    const indRoutes = await import(indSequenceRoutesPath.href);
    app.use('/api/ind', indRoutes.default);
    console.log('IND sequence routes registered successfully');
  } catch (error) {
    console.error('Failed to register IND sequence routes:', error);
  }
  
  // Register document QC routes
  try {
    const documentQcRoutes = await import('./routes/document_qc_routes');
    app.use(documentQcRoutes.default);
    console.log('Document QC routes registered successfully');
  } catch (error) {
    console.error('Failed to register document QC routes:', error);
  }
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Set up WebSocket servers
  try {
    // Main WebSocket server
    import('./api/ws/index.js').then((wsModule) => {
      wsModule.initWebSocketServer(httpServer);
      console.log('Main WebSocket server initialized successfully');
    }).catch(err => {
      console.error('Failed to import main WebSocket server module:', err);
    });
    
    // QC WebSocket server for real-time updates
    import('./api/ws/qc.js').then((qcWsModule) => {
      const qcWss = qcWsModule.initQcWebSocketServer(httpServer);
      // Store the WebSocket server in a global variable for access from other modules
      global.qcWebSocketServer = qcWss;
      console.log('QC WebSocket server initialized successfully');
    }).catch(err => {
      console.error('Failed to import QC WebSocket server module:', err);
    });
  } catch (error) {
    console.error('Failed to setup WebSocket servers:', error);
  }
  
  // Register document approval routes
  try {
    // Use dynamic import for ESM compatibility
    import('./routes/document_approval.js').then((documentApproval) => {
      documentApproval.registerRoutes(app);
      console.log('Document approval routes registered successfully');
    }).catch(err => {
      console.error('Failed to import document approval routes:', err);
    });
  } catch (error) {
    console.error('Failed to register document approval routes:', error);
  }
  
  // Register document builder order routes
  try {
    import('./api/documents/builder_order.js').then((builderOrderRoutes) => {
      app.use(builderOrderRoutes.default);
      console.log('Document builder order routes registered successfully');
    }).catch(err => {
      console.error('Failed to import document builder order routes:', err);
    });
  } catch (error) {
    console.error('Failed to register document builder order routes:', error);
  }
  
  // Register document bulk approve routes
  try {
    import('./api/documents/bulk_approve.js').then((bulkApproveRoutes) => {
      app.use(bulkApproveRoutes.default);
      console.log('Document bulk approve routes registered successfully');
    }).catch(err => {
      console.error('Failed to import document bulk approve routes:', err);
    });
  } catch (error) {
    console.error('Failed to register document bulk approve routes:', error);
  }
  
  // Register FastAPI endpoints (region rules, etc.)
  try {
    app.get('/api/ind/region-rules', async (req, res) => {
      const region = req.query.region || 'FDA';
      const modules = req.query.modules ? String(req.query.modules).split(',') : [];
      
      // Use the region_rules module directly in the route handler
      // In production, this would be a FastAPI endpoint
      const missingModules = [];
      
      const regionFolders = {
        'FDA': ['m1', 'm2', 'm3', 'm4', 'm5'],
        'EMA': ['m1', 'm2', 'm3', 'm4', 'm5'],
        'PMDA': ['m1', 'm2', 'm3', 'm4', 'm5', 'jp-annex']
      };
      
      const required = regionFolders[region] || [];
      const moduleSet = new Set(modules);
      
      for (const mod of required) {
        if (!moduleSet.has(mod)) {
          missingModules.push(mod);
        }
      }
      
      res.json({ missing: missingModules });
    });
    
    console.log('Region rules endpoint registered successfully');
  } catch (error) {
    console.error('Failed to register region rules endpoint:', error);
  }
  
  return httpServer;
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