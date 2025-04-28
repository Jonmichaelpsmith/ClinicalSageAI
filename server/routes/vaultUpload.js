// /server/routes/vaultUpload.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage with versioning
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_');
    const baseName = safeName.replace(/\.[^/.]+$/, ''); // Remove extension
    const ext = path.extname(file.originalname);

    // Check if a file with baseName already exists
    const existingFiles = fs.readdirSync(uploadDir).filter(f => f.includes(baseName));
    const version = existingFiles.length + 1;

    const newFilename = `${baseName}_v${version}${ext}`;
    cb(null, newFilename);
  }
});

const upload = multer({ storage });

// POST /api/vault/upload
router.post('/upload', upload.single('document'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    // Extract version from the stored filename (e.g., file_v2.pdf -> 2)
    const versionMatch = req.file.filename.match(/_v(\d+)\.[^/.]+$/);
    const version = versionMatch ? parseInt(versionMatch[1]) : 1;
    
    // Create metadata for the document
    const fileInfo = {
      originalName: req.file.originalname,
      storedName: req.file.filename,
      version: version,
      uploadTime: new Date(),
      moduleLinked: req.body.module || 'Unknown',
      projectId: req.body.projectId || 'Unassigned',
      uploader: req.body.uploader || 'Unknown',
      section: req.body.section || null,
      documentType: req.body.documentType || null,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    };

    // Save metadata
    let documents = [];
    const metadataPath = path.join(uploadDir, 'metadata.json');
    if (fs.existsSync(metadataPath)) {
      const metaRaw = fs.readFileSync(metadataPath);
      documents = JSON.parse(metaRaw);
    }
    documents.push(fileInfo);
    fs.writeFileSync(metadataPath, JSON.stringify(documents, null, 2));

    console.log(`✅ Vault Upload with Versioning: ${req.file.originalname} (v${version})`);

    // Respond back
    res.status(200).json({
      success: true,
      file: fileInfo,
    });
  } catch (error) {
    console.error('❌ Vault Upload Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/vault/list
router.get('/list', (req, res) => {
  try {
    console.log('📂 Fetching vault documents with query:', req.query);
    const { module, uploader, projectId, search, documentType } = req.query;
    const metadataFile = path.join(uploadDir, 'metadata.json');

    let documents = [];

    // If metadata file exists, read it
    if (fs.existsSync(metadataFile)) {
      try {
        const metaRaw = fs.readFileSync(metadataFile, 'utf8');
        // Handle empty file case
        if (metaRaw && metaRaw.trim()) {
          documents = JSON.parse(metaRaw);
        }
      } catch (parseError) {
        console.error('❌ Error parsing metadata file:', parseError);
        // Create a new empty metadata file if corrupted
        fs.writeFileSync(metadataFile, JSON.stringify([], null, 2));
      }
    } else {
      // Create the metadata file if it doesn't exist
      fs.writeFileSync(metadataFile, JSON.stringify([], null, 2));
      console.log('ℹ️ Created new metadata file for vault documents');
    }
    
    // Ensure documents is an array
    if (!Array.isArray(documents)) {
      documents = [];
    }
    
    // Extract unique values for filtering dropdowns
    const uniqueModules = [...new Set(documents.map(doc => doc.moduleLinked || 'Unknown'))];
    const uniqueUploaders = [...new Set(documents.map(doc => doc.uploader || 'Unknown'))];
    const uniqueProjects = [...new Set(documents.map(doc => doc.projectId || 'Unassigned'))];
    const uniqueTypes = [...new Set(documents.map(doc => doc.documentType).filter(Boolean))];
    
    // Apply filters if provided
    let filteredDocs = [...documents];
    
    if (module && module !== 'all') {
      filteredDocs = filteredDocs.filter(doc => doc.moduleLinked === module);
    }
    
    if (uploader && uploader !== 'all') {
      filteredDocs = filteredDocs.filter(doc => doc.uploader === uploader);
    }
    
    if (projectId && projectId !== 'all') {
      filteredDocs = filteredDocs.filter(doc => doc.projectId === projectId);
    }
    
    if (documentType && documentType !== 'all') {
      filteredDocs = filteredDocs.filter(doc => doc.documentType === documentType);
    }
    
    // Apply text search if provided
    if (search && search.trim() !== '') {
      const searchTerms = search.toLowerCase().trim().split(/\s+/);
      filteredDocs = filteredDocs.filter(doc => {
        const searchableText = [
          doc.originalName, 
          doc.moduleLinked, 
          doc.projectId, 
          doc.uploader,
          doc.documentType
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchTerms.every(term => searchableText.includes(term));
      });
    }
    
    // Get CTD module mapping for better organization
    const ctdModuleMapping = {
      'Module 1': 'Administrative Information',
      'Module 2': 'CTD Summaries',
      'Module 3': 'Quality',
      'Module 4': 'Nonclinical Study Reports',
      'Module 5': 'Clinical Study Reports'
    };
    
    console.log(`✅ Listing ${filteredDocs.length} documents from Vault (${documents.length} total)`);
    
    return res.status(200).json({ 
      success: true, 
      documents: filteredDocs || [],
      metadata: {
        totalCount: documents.length,
        filteredCount: filteredDocs.length,
        uniqueModules,
        uniqueUploaders,
        uniqueProjects,
        uniqueTypes,
        ctdModuleMapping
      }
    });
  } catch (error) {
    console.error('❌ Error listing documents:', error);
    return res.status(200).json({ 
      success: true, 
      documents: [],
      metadata: {
        totalCount: 0,
        filteredCount: 0,
        uniqueModules: [],
        uniqueUploaders: [],
        uniqueProjects: [],
        uniqueTypes: [],
        ctdModuleMapping: {
          'Module 1': 'Administrative Information',
          'Module 2': 'CTD Summaries',
          'Module 3': 'Quality',
          'Module 4': 'Nonclinical Study Reports',
          'Module 5': 'Clinical Study Reports'
        }
      },
      error: error.message
    });
  }
});

// GET /api/vault/download/:filename
router.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    
    // For download tracking, optionally log download metrics here
    console.log(`✅ Downloading Vault document: ${filename}`);
    
    res.download(filePath);
  } catch (error) {
    console.error('❌ Error downloading document:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;