// server/routes/vaultRoutes.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
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

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename while preserving the original extension
    const fileExtension = path.extname(file.originalname);
    const storedName = `${uuidv4()}${fileExtension}`;
    cb(null, storedName);
  },
});

// Create the multer upload middleware
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Allow common document formats
    const allowedTypes = [
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', 
      '.ppt', '.pptx', '.txt', '.csv'
    ];
    
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only document files are allowed.'));
    }
  },
});

// Helper function to read metadata
function readMetadata() {
  try {
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

// Route to upload a document
router.post('/upload', upload.single('document'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Create metadata for the document
    const documentMetadata = {
      originalName: req.file.originalname,
      storedName: req.file.filename,
      moduleLinked: req.body.module || 'Unknown',
      projectId: req.body.projectId || 'Unknown',
      uploader: req.body.uploader || 'Anonymous',
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadDate: new Date().toISOString(),
    };

    // Read existing metadata
    const metadata = readMetadata();
    
    // Add new document metadata
    metadata.push(documentMetadata);
    
    // Save updated metadata
    if (writeMetadata(metadata)) {
      return res.status(200).json({ 
        success: true, 
        message: 'Document uploaded successfully',
        file: documentMetadata
      });
    } else {
      return res.status(500).json({ success: false, message: 'Failed to save document metadata' });
    }
  } catch (error) {
    console.error('Error uploading document:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Route specifically for uploading Word documents (DOCX)
router.post('/documents/word', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Ensure file is a DOCX
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (ext !== '.docx') {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Only DOCX files are allowed' });
    }

    const documentMetadata = {
      originalName: req.file.originalname,
      storedName: req.file.filename,
      moduleLinked: req.body.module || 'Unknown',
      projectId: req.body.projectId || 'Unknown',
      uploader: req.body.uploader || 'Anonymous',
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadDate: new Date().toISOString(),
    };

    const metadata = readMetadata();
    metadata.push(documentMetadata);
    if (writeMetadata(metadata)) {
      return res.status(200).json({ success: true, file: documentMetadata });
    }
    return res.status(500).json({ success: false, message: 'Failed to save document metadata' });
  } catch (error) {
    console.error('Error uploading Word document:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Route to list all documents
router.get('/list', (req, res) => {
  try {
    // Set proper headers to prevent issues with JSON parsing
    res.setHeader('Content-Type', 'application/json');
    
    // Read and process metadata
    const metadata = readMetadata();
    
    // Extract metadata for filter UI
    const uniqueModules = [...new Set(metadata.map(doc => doc.moduleLinked || 'Unknown'))];
    const uniqueUploaders = [...new Set(metadata.map(doc => doc.uploader || 'Anonymous'))];
    const uniqueProjects = [...new Set(metadata.map(doc => doc.projectId || 'Unknown'))];
    
    // Return data with successful status
    return res.status(200).json({ 
      success: true, 
      documents: metadata,
      metadata: {
        uniqueModules,
        uniqueUploaders,
        uniqueProjects,
        totalCount: metadata.length
      }
    });
  } catch (error) {
    console.error('Error listing documents:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Route to reset vault data
router.post('/reset', (req, res) => {
  try {
    // Create empty metadata file
    writeMetadata([]);
    
    return res.status(200).json({
      success: true,
      message: 'Vault reset successfully'
    });
  } catch (error) {
    console.error('Error resetting vault:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset vault' });
  }
});

// Fallback GET method for reset
router.get('/reset', (req, res) => {
  try {
    // Create empty metadata file
    writeMetadata([]);
    
    return res.status(200).json({
      success: true,
      message: 'Vault reset successfully via GET method'
    });
  } catch (error) {
    console.error('Error resetting vault:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset vault' });
  }
});

// Route to download a document
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