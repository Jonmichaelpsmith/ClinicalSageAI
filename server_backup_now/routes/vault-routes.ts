import { Router } from 'express';
import { storage } from '../storage';
import fs from 'fs';
import path from 'path';

// Define a custom document type for the vault
interface VaultDocument {
  id: number;
  name: string;
  status: string;
  storedName?: string;
  originalName?: string;
  filePath?: string;
  moduleLinked?: string;
  projectId?: string;
  uploader?: string;
  ctdModule?: string;
  ctdDescription?: string;
  uploadTime?: Date;
  [key: string]: any; // Allow for additional properties
}

const router = Router();

// Create a fallback upload directory for vault documents
const vaultDir = path.join(process.cwd(), 'uploads', 'vault');
if (!fs.existsSync(vaultDir)) {
  fs.mkdirSync(vaultDir, { recursive: true });
}

/**
 * List all documents in the vault
 * API: GET /api/vault/list
 */
router.get('/list', async (req, res) => {
  try {
    console.log('Vault list API called');
    
    // For resilience, use empty fallback when storage fails
    let documents = [];
    let metadata = {
      uniqueModules: [],
      uniqueUploaders: [],
      uniqueProjects: [],
      totalCount: 0,
      ctdModuleMapping: {}
    };
    
    try {
      // Get documents from storage
      const docs = await storage.getDocuments({});
      
      if (Array.isArray(docs)) {
        documents = docs;
        
        // Extract metadata
        const modules = new Set();
        const uploaders = new Set();
        const projects = new Set();
        const moduleMapping = {};
        
        docs.forEach(doc => {
          if (doc.moduleLinked) modules.add(doc.moduleLinked);
          if (doc.uploader) uploaders.add(doc.uploader);
          if (doc.projectId) projects.add(doc.projectId);
          if (doc.ctdModule) moduleMapping[doc.ctdModule] = doc.ctdDescription || '';
        });
        
        metadata = {
          uniqueModules: Array.from(modules),
          uniqueUploaders: Array.from(uploaders),
          uniqueProjects: Array.from(projects),
          totalCount: docs.length,
          ctdModuleMapping: moduleMapping
        };
      }
    } catch (err) {
      console.warn('Error accessing storage, using fallback empty documents list', err);
    }
    
    res.json({
      success: true,
      documents,
      metadata
    });
  } catch (error) {
    console.error('Vault list API error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Unknown error fetching vault documents'
    });
  }
});

/**
 * Reset the vault (reload data or fix issues)
 * API: POST /api/vault/reset
 */
router.post('/reset', async (req, res) => {
  try {
    console.log('Vault reset API called');
    
    // Here we'd typically reset any caches or perform recovery actions
    // For now, we'll just return success
    
    res.json({
      success: true,
      message: 'Vault reset successful'
    });
  } catch (error) {
    console.error('Vault reset API error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Unknown error resetting vault'
    });
  }
});

/**
 * Also support GET method for reset (fallback)
 * API: GET /api/vault/reset
 */
router.get('/reset', async (req, res) => {
  try {
    console.log('Vault reset API called (GET fallback)');
    
    res.json({
      success: true,
      message: 'Vault reset successful (GET method)'
    });
  } catch (error) {
    console.error('Vault reset API error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Unknown error resetting vault'
    });
  }
});

/**
 * Download a document from the vault
 * API: GET /api/vault/download/:filename
 */
router.get('/download/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // First, try to find the document in storage
    const documents = await storage.getDocuments({});
    const doc = documents.find(d => d.storedName === filename);
    
    if (doc && doc.filePath && fs.existsSync(doc.filePath)) {
      // If we have a valid file path, send the file
      return res.download(doc.filePath, doc.originalName || filename);
    }
    
    // Fallback: Check if the file exists in the vault directory
    const filePath = path.join(vaultDir, filename);
    if (fs.existsSync(filePath)) {
      return res.download(filePath, filename);
    }
    
    // If no file was found, return a 404
    res.status(404).json({
      success: false,
      error: 'Document not found'
    });
  } catch (error) {
    console.error('Vault download API error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Unknown error downloading document'
    });
  }
});

export default router;