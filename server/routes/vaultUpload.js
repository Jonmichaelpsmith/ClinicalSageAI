// /server/routes/vaultUpload.js

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Create metadata file path (used throughout the file)
const metadataPath = path.join(uploadDir, 'metadata.json');
console.log('📄 Vault Metadata configured at:', metadataPath);

// Create metadata.json if it doesn't exist
if (!fs.existsSync(metadataPath)) {
  console.log('📄 Creating empty metadata.json file for vault documents');
  fs.writeFileSync(metadataPath, '[]', { encoding: 'utf8' });
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

// ENDPOINT: POST /api/vault/upload
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
    if (fs.existsSync(metadataPath)) {
      try {
        const metaRaw = fs.readFileSync(metadataPath, 'utf8');
        if (metaRaw && metaRaw.trim().length > 0) {
          documents = JSON.parse(metaRaw);
        }
      } catch (err) {
        console.error('Error parsing metadata, starting fresh:', err);
      }
    }
    
    // Ensure documents is always an array
    if (!Array.isArray(documents)) {
      documents = [];
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

// ENDPOINT: GET /api/vault/list
router.get('/list', (req, res) => {
  console.log('📂 Handling GET request to /api/vault/list');
  
  try {
    // If metadata.json doesn't exist yet, respond with empty array
    if (!fs.existsSync(metadataPath)) {
      console.log('📄 metadata.json does not exist yet, returning empty array');
      return res.status(200).json({ success: true, documents: [] });
    }

    // Read the file
    const metaRaw = fs.readFileSync(metadataPath, { encoding: 'utf8' });
    console.log(`📄 Read metadata.json file (${metaRaw.length} bytes)`);

    // Handle empty or corrupted file
    let documents = [];
    if (metaRaw && metaRaw.trim().length > 0) {
      try {
        documents = JSON.parse(metaRaw);
        console.log(`📄 Successfully parsed JSON with ${documents.length} documents`);
      } catch (parseErr) {
        console.error('❌ Error parsing metadata JSON:', parseErr);
        // Return empty documents array on parse error
      }
    } else {
      console.log('📄 Empty metadata file, returning empty documents array');
    }

    // Ensure documents is always an array
    if (!Array.isArray(documents)) {
      console.log('📄 Documents is not an array, resetting to empty array');
      documents = [];
    }

    console.log(`✅ Successfully returning ${documents.length} documents`);
    return res.status(200).json({ success: true, documents });
  } catch (error) {
    console.error('❌ Error listing Vault documents:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ENDPOINT: GET /api/vault/reset
router.get('/reset', (req, res) => {
  try {
    console.log('🚨 EMERGENCY VAULT RESET: Resetting vault metadata to clean empty array');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Reset metadata.json to an empty array
    fs.writeFileSync(metadataPath, '[]', { encoding: 'utf8' });
    console.log('✅ Reset metadata.json to empty array');
    
    return res.status(200).json({
      success: true,
      message: 'Vault metadata has been reset to empty array',
      path: metadataPath,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error resetting vault metadata:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during vault reset',
      error: error.message
    });
  }
});

// ENDPOINT: POST /api/vault/reset
router.post('/reset', (req, res) => {
  try {
    console.log('🚨 EMERGENCY VAULT RESET (POST): Resetting vault metadata via POST');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // If metadata.json exists, delete it
    if (fs.existsSync(metadataPath)) {
      fs.unlinkSync(metadataPath);
      console.log('✅ Deleted existing metadata.json');
    }

    // Recreate fresh empty metadata.json
    fs.writeFileSync(metadataPath, '[]', { encoding: 'utf8' });
    console.log('✅ Created fresh empty metadata.json');
    
    return res.status(200).json({ 
      success: true, 
      message: 'Vault metadata reset to empty array.',
      path: metadataPath,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error resetting Vault metadata:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Vault reset failed.',
      error: error.message
    });
  }
});

// ENDPOINT: GET /api/vault/download/:filename
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

export default router;