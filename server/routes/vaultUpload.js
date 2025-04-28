// /server/routes/vaultUpload.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create a metadata file to store document information
const metadataPath = path.join(uploadsDir, 'vault_metadata.json');
if (!fs.existsSync(metadataPath)) {
  fs.writeFileSync(metadataPath, JSON.stringify([]));
}

// Set up basic storage with versioning support
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // We'll generate the filename after checking for existing versions
    // For now, use a temporary name that we'll rename after version check
    const tempName = `temp-${Date.now()}-${file.originalname}`;
    cb(null, tempName);
  },
});

const upload = multer({ storage });

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

// Helper function to check if document already exists (by name and project)
function findExistingDocumentVersions(metadata, originalName, projectId, moduleLinked) {
  return metadata.filter(doc => 
    doc.baseFilename === originalName && 
    doc.projectId === projectId &&
    doc.moduleLinked === moduleLinked
  );
}

// Helper to get the base filename (remove version suffix if present)
function getBaseFilename(filename) {
  // Remove version suffix like "v1", "v2", etc.
  return filename.replace(/_v\d+(\.\w+)$/, '$1');
}

// Helper to generate versioned filename
function generateVersionedFilename(baseFilename, version) {
  const extension = path.extname(baseFilename);
  const nameWithoutExtension = baseFilename.slice(0, -extension.length);
  return `${nameWithoutExtension}_v${version}${extension}`;
}

// POST /api/vault/upload
router.post('/upload', upload.single('document'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    // Read existing metadata
    const metadata = readMetadata();
    
    // Get the base filename (without version number)
    const originalName = req.file.originalname;
    const baseFilename = getBaseFilename(originalName);
    const projectId = req.body.projectId || 'Unassigned';
    const moduleLinked = req.body.module || 'Unknown';
    
    // Check if this document already exists (same name, same project)
    const existingVersions = findExistingDocumentVersions(metadata, baseFilename, projectId, moduleLinked);
    
    // Determine version number
    let version = 1;
    if (existingVersions.length > 0) {
      // Find highest version number
      const highestVersion = Math.max(...existingVersions.map(doc => doc.version || 0));
      version = highestVersion + 1;
    }
    
    // Generate versioned filename
    const versionedFilename = generateVersionedFilename(baseFilename, version);
    
    // Rename the temp file to versioned filename
    const tempPath = path.join(uploadsDir, req.file.filename);
    const newPath = path.join(uploadsDir, versionedFilename);
    fs.renameSync(tempPath, newPath);
    
    // Create metadata for the document
    const fileInfo = {
      originalName: versionedFilename,
      baseFilename: baseFilename,
      storedName: versionedFilename,
      version: version,
      isLatestVersion: true, // Mark this as latest version
      uploadTime: new Date().toISOString(),
      moduleLinked: moduleLinked,
      projectId: projectId,
      uploader: req.body.uploader || 'Unknown',
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    };
    
    // Mark all previous versions as not latest
    if (existingVersions.length > 0) {
      metadata.forEach(doc => {
        if (doc.baseFilename === baseFilename && 
            doc.projectId === projectId && 
            doc.moduleLinked === moduleLinked) {
          doc.isLatestVersion = false;
        }
      });
    }

    console.log(`✅ New Vault Upload: ${baseFilename} (v${version})`);

    // Add new document metadata
    metadata.push(fileInfo);
    
    // Save updated metadata
    writeMetadata(metadata);

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
    const filePath = path.join(uploadsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    
    res.download(filePath);
  } catch (error) {
    console.error('Error downloading document:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;