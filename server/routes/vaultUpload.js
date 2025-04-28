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

// Define metadata path used throughout this file
const metadataPath = path.join(uploadDir, 'metadata.json');

// Create metadata.json if it doesn't exist
if (!fs.existsSync(metadataPath)) {
  console.log('📄 Creating empty metadata.json file for vault documents');
  fs.writeFileSync(metadataPath, JSON.stringify([], null, 2));
}

// Log the paths for debugging
console.log('📂 Vault Upload Directory:', uploadDir);
console.log('📄 Vault Metadata Path:', metadataPath);

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
  const vaultMetadataPath = path.join(uploadDir, 'metadata.json');
  
  try {
    if (!fs.existsSync(vaultMetadataPath)) {
      // If no metadata yet, respond cleanly
      return res.status(200).json({ success: true, documents: [] });
    }

    const metaRaw = fs.readFileSync(vaultMetadataPath, { encoding: 'utf8' });

    // Handle empty or corrupted file gracefully
    let documents = [];
    if (metaRaw.trim().length > 0) {
      documents = JSON.parse(metaRaw);
    }

    return res.status(200).json({ success: true, documents });
  } catch (error) {
    console.error('❌ Error listing Vault documents:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/vault/reset - EMERGENCY HOTFIX ENDPOINT
router.get('/reset', (req, res) => {
  try {
    console.log('🚨 EMERGENCY VAULT RESET: Resetting vault metadata to clean empty array');
    
    // Reset metadata.json to an empty array
    const metadataPath = path.join(uploadDir, 'metadata.json');
    fs.writeFileSync(metadataPath, '[]');
    
    return res.status(200).json({
      success: true,
      message: 'Vault metadata has been reset to empty array',
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

// POST /api/vault/reset
router.post('/reset', (req, res) => {
  try {
    const uploadDir = path.join(__dirname, '../../uploads');
    const metadataPath = path.join(uploadDir, 'metadata.json');

    // If metadata.json exists, delete it
    if (fs.existsSync(metadataPath)) {
      fs.unlinkSync(metadataPath);
    }

    // Recreate fresh empty metadata.json
    fs.writeFileSync(metadataPath, '[]', { encoding: 'utf8' });

    console.log('✅ Vault metadata.json reset successfully.');

    return res.status(200).json({ success: true, message: 'Vault metadata reset to empty array.' });
  } catch (error) {
    console.error('❌ Error resetting Vault metadata:', error);
    return res.status(500).json({ success: false, message: 'Vault reset failed.' });
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