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

// Create a metadata file to store document information
const metadataPath = path.join(uploadDir, 'vault_metadata.json');
if (!fs.existsSync(metadataPath)) {
  fs.writeFileSync(metadataPath, JSON.stringify([]));
}

// Helper function to read metadata
function readMetadata() {
  try {
    if (!fs.existsSync(metadataPath)) {
      return [];
    }
    const data = fs.readFileSync(metadataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading metadata:', error);
    return [];
  }
}

// Helper function to write metadata
function writeMetadata(metadata) {
  try {
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing metadata:', error);
    return false;
  }
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

    // Get filename without version for easier grouping
    const originalName = req.file.originalname;
    const safeName = originalName.replace(/\s+/g, '_');
    const baseName = safeName.replace(/\.[^/.]+$/, ''); // Name without extension
    const ext = path.extname(originalName);
    
    // Extract version from the stored filename (e.g., file_v2.pdf -> 2)
    const versionMatch = req.file.filename.match(/_v(\d+)\.[^/.]+$/);
    const version = versionMatch ? parseInt(versionMatch[1]) : 1;
    
    // Create metadata for the document
    const fileInfo = {
      originalName: originalName,
      baseFilename: baseName + ext, // Store the original name without version suffix
      storedName: req.file.filename,
      version: version,
      isLatestVersion: true, // Mark this as latest version
      uploadTime: new Date().toISOString(),
      moduleLinked: req.body.module || 'Unknown',
      projectId: req.body.projectId || 'Unassigned',
      uploader: req.body.uploader || 'Unknown',
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    };
    
    // Read existing metadata
    const metadata = readMetadata();
    
    // Mark all previous versions of this file as not latest
    metadata.forEach(doc => {
      if (doc.baseFilename === fileInfo.baseFilename && 
          doc.projectId === fileInfo.projectId && 
          doc.moduleLinked === fileInfo.moduleLinked) {
        doc.isLatestVersion = false;
      }
    });
    
    // Add new document metadata
    metadata.push(fileInfo);
    
    // Save updated metadata
    writeMetadata(metadata);

    console.log(`✅ Vault Upload with Versioning: ${baseName}${ext} (v${version})`);

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
    const documents = readMetadata();
    return res.status(200).json({ 
      success: true, 
      documents: documents
    });
  } catch (error) {
    console.error('Error listing documents:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
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