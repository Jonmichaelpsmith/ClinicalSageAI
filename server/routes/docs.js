/**
 * DocuShare API Routes
 * 
 * Enterprise-grade document management API that integrates with DocuShare.
 * 
 * Features include:
 * - Multi-tenant document isolation
 * - Folder organization and browsing
 * - Version control and document locking
 * - Document movement between folders
 * - Document metadata and trial tracking
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const validateTenantAccess = require('../middleware/validateTenantAccess');
const { auditLog } = require('../services/auditService');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'doc-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// Apply tenant validation to all document routes
router.use(validateTenantAccess);

/**
 * Get documents list with optional filtering
 * GET /api/docs/list
 */
router.get('/list', (req, res) => {
  const { folder, studyId, indId, trialPhase, module, documentType, trialId, molecule } = req.query;
  const tenantId = req.validatedTenantId;
  
  // For development purposes, return test documents
  // In production, this would query the document database
  const testDocuments = generateTestDocuments(tenantId, folder);
  
  // Log document listing
  auditLog({
    action: 'DOCUMENT_LIST',
    resource: '/api/docs/list',
    userId: req.user.id,
    tenantId: tenantId,
    ipAddress: req.ip,
    details: `Listed documents in folder: ${folder || 'root'}`,
    severity: 'low',
    category: 'document'
  });
  
  res.json(testDocuments);
});

/**
 * Get folders list
 * GET /api/docs/folders
 */
router.get('/folders', (req, res) => {
  const { parentPath } = req.query;
  const tenantId = req.validatedTenantId;
  
  // For development purposes, return test folders
  // In production, this would query the folder database
  const testFolders = generateTestFolders(tenantId, parentPath);
  
  // Log folder listing
  auditLog({
    action: 'FOLDER_LIST',
    resource: '/api/docs/folders',
    userId: req.user.id,
    tenantId: tenantId,
    ipAddress: req.ip,
    details: `Listed folders in parent: ${parentPath || 'root'}`,
    severity: 'low',
    category: 'document'
  });
  
  res.json(testFolders);
});

/**
 * Create a new folder
 * POST /api/docs/folders
 */
router.post('/folders', (req, res) => {
  const { parentPath, folderName } = req.body;
  const tenantId = req.validatedTenantId;
  
  // Validate inputs
  if (!folderName || folderName.trim() === '') {
    return res.status(400).json({
      error: 'Invalid folder name',
      message: 'Folder name cannot be empty'
    });
  }
  
  // Check for invalid characters in folder name
  if (/[\/\\:*?"<>|]/.test(folderName)) {
    return res.status(400).json({
      error: 'Invalid folder name',
      message: 'Folder name contains invalid characters'
    });
  }
  
  // For development purposes, simulate folder creation
  // In production, this would create a folder in the document database
  const createdFolder = {
    id: 'folder_' + Date.now(),
    name: folderName,
    path: parentPath === '/' ? `/${folderName}` : `${parentPath}/${folderName}`,
    createdAt: new Date().toISOString(),
    tenantId: tenantId
  };
  
  // Log folder creation
  auditLog({
    action: 'FOLDER_CREATE',
    resource: '/api/docs/folders',
    userId: req.user.id,
    tenantId: tenantId,
    ipAddress: req.ip,
    details: `Created folder ${folderName} in ${parentPath || 'root'}`,
    severity: 'medium',
    category: 'document'
  });
  
  res.status(201).json(createdFolder);
});

/**
 * Upload a document
 * POST /api/docs/upload
 */
router.post('/upload', upload.single('file'), (req, res) => {
  const tenantId = req.validatedTenantId;
  
  // Ensure a file was uploaded
  if (!req.file) {
    return res.status(400).json({
      error: 'No file uploaded',
      message: 'No file was provided in the request'
    });
  }
  
  // Extract metadata from request
  const folderPath = req.body.folder || '/';
  const metadata = {
    studyId: req.body.studyId,
    indId: req.body.indId,
    trialPhase: req.body.trialPhase,
    module: req.body.module,
    documentType: req.body.documentType,
    status: req.body.status,
    trialId: req.body.trialId,
    molecule: req.body.molecule
  };
  
  // For development purposes, create a test document
  // In production, this would store the file and metadata in a document database
  const uploadedDocument = {
    id: 'doc_' + Date.now(),
    name: req.file.originalname,
    size: req.file.size,
    mimeType: req.file.mimetype,
    path: folderPath,
    fileUrl: `/uploads/${req.file.filename}`,
    viewUrl: `/api/docs/preview/${req.file.filename}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '1.0',
    locked: false,
    metadata: metadata,
    tenantId: tenantId
  };
  
  // Log document upload
  auditLog({
    action: 'DOCUMENT_UPLOAD',
    resource: '/api/docs/upload',
    userId: req.user.id,
    tenantId: tenantId,
    ipAddress: req.ip,
    details: `Uploaded document ${req.file.originalname} to ${folderPath}`,
    severity: 'medium',
    category: 'document',
    metadata: {
      documentId: uploadedDocument.id,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    }
  });
  
  res.status(201).json(uploadedDocument);
});

/**
 * Download a document
 * GET /api/docs/download
 */
router.get('/download', (req, res) => {
  const { objectId } = req.query;
  const tenantId = req.validatedTenantId;
  
  // In a real system, verify document belongs to tenant and retrieve document path
  // For development, use a test file path
  const testFilePath = path.join(__dirname, '../../uploads', 'sample.pdf');
  
  // Check if test file exists, otherwise use a default file
  if (!fs.existsSync(testFilePath)) {
    // For testing, if sample.pdf doesn't exist, find a PDF in attached_assets
    const assetsDir = path.join(__dirname, '../../attached_assets');
    let foundPdf = null;
    
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);
      foundPdf = files.find(file => file.toLowerCase().endsWith('.pdf'));
    }
    
    if (foundPdf) {
      const filePath = path.join(assetsDir, foundPdf);
      
      // Log document download
      auditLog({
        action: 'DOCUMENT_DOWNLOAD',
        resource: '/api/docs/download',
        userId: req.user.id,
        tenantId: tenantId,
        ipAddress: req.ip,
        details: `Downloaded document with ID ${objectId}`,
        severity: 'medium',
        category: 'document'
      });
      
      return res.download(filePath, foundPdf);
    }
    
    // If no PDF found, return error
    return res.status(404).json({
      error: 'Document not found',
      message: 'The requested document could not be found'
    });
  }
  
  // Log document download
  auditLog({
    action: 'DOCUMENT_DOWNLOAD',
    resource: '/api/docs/download',
    userId: req.user.id,
    tenantId: tenantId,
    ipAddress: req.ip,
    details: `Downloaded document with ID ${objectId}`,
    severity: 'medium',
    category: 'document'
  });
  
  res.download(testFilePath, 'sample.pdf');
});

/**
 * Preview a document
 * GET /api/docs/preview/:filename
 */
router.get('/preview/:filename', (req, res) => {
  const { filename } = req.params;
  const tenantId = req.validatedTenantId;
  
  // In a real system, verify document belongs to tenant
  
  // For development, use a test file path
  const testFilePath = path.join(__dirname, '../../uploads', filename);
  
  // Check if test file exists, otherwise use a default file
  if (!fs.existsSync(testFilePath)) {
    // For testing, if specific file doesn't exist, find a PDF in attached_assets
    const assetsDir = path.join(__dirname, '../../attached_assets');
    let foundPdf = null;
    
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);
      foundPdf = files.find(file => file.toLowerCase().endsWith('.pdf'));
    }
    
    if (foundPdf) {
      const filePath = path.join(assetsDir, foundPdf);
      
      // Log document preview
      auditLog({
        action: 'DOCUMENT_PREVIEW',
        resource: '/api/docs/preview',
        userId: req.user.id,
        tenantId: tenantId,
        ipAddress: req.ip,
        details: `Previewed document ${filename}`,
        severity: 'low',
        category: 'document'
      });
      
      res.setHeader('Content-Type', 'application/pdf');
      return fs.createReadStream(filePath).pipe(res);
    }
    
    // If no PDF found, return error
    return res.status(404).json({
      error: 'Document not found',
      message: 'The requested document could not be found'
    });
  }
  
  // Log document preview
  auditLog({
    action: 'DOCUMENT_PREVIEW',
    resource: '/api/docs/preview',
    userId: req.user.id,
    tenantId: tenantId,
    ipAddress: req.ip,
    details: `Previewed document ${filename}`,
    severity: 'low',
    category: 'document'
  });
  
  // Determine content type based on file extension
  const ext = path.extname(filename).toLowerCase();
  let contentType = 'application/octet-stream';
  
  if (ext === '.pdf') {
    contentType = 'application/pdf';
  } else if (ext === '.doc' || ext === '.docx') {
    contentType = 'application/msword';
  } else if (ext === '.xls' || ext === '.xlsx') {
    contentType = 'application/vnd.ms-excel';
  } else if (ext === '.txt') {
    contentType = 'text/plain';
  }
  
  res.setHeader('Content-Type', contentType);
  fs.createReadStream(testFilePath).pipe(res);
});

/**
 * Lock a document
 * POST /api/docs/lock
 */
router.post('/lock', (req, res) => {
  const { documentId } = req.body;
  const tenantId = req.validatedTenantId;
  
  // For development purposes, simulate document locking
  // In production, this would update the document in the database
  
  // Log document locking
  auditLog({
    action: 'DOCUMENT_LOCK',
    resource: '/api/docs/lock',
    userId: req.user.id,
    tenantId: tenantId,
    ipAddress: req.ip,
    details: `Locked document with ID ${documentId}`,
    severity: 'medium',
    category: 'document'
  });
  
  res.json({
    id: documentId,
    locked: true,
    lockedBy: req.user.id,
    lockedAt: new Date().toISOString()
  });
});

/**
 * Unlock a document
 * POST /api/docs/unlock
 */
router.post('/unlock', (req, res) => {
  const { documentId } = req.body;
  const tenantId = req.validatedTenantId;
  
  // For development purposes, simulate document unlocking
  // In production, this would update the document in the database
  
  // Log document unlocking
  auditLog({
    action: 'DOCUMENT_UNLOCK',
    resource: '/api/docs/unlock',
    userId: req.user.id,
    tenantId: tenantId,
    ipAddress: req.ip,
    details: `Unlocked document with ID ${documentId}`,
    severity: 'medium',
    category: 'document'
  });
  
  res.json({
    id: documentId,
    locked: false,
    unlockedBy: req.user.id,
    unlockedAt: new Date().toISOString()
  });
});

/**
 * Move a document
 * POST /api/docs/move
 */
router.post('/move', (req, res) => {
  const { documentId, targetFolder } = req.body;
  const tenantId = req.validatedTenantId;
  
  // Validate inputs
  if (!documentId) {
    return res.status(400).json({
      error: 'Missing document ID',
      message: 'Document ID is required'
    });
  }
  
  if (!targetFolder) {
    return res.status(400).json({
      error: 'Missing target folder',
      message: 'Target folder is required'
    });
  }
  
  // For development purposes, simulate document moving
  // In production, this would update the document in the database
  
  // Log document move
  auditLog({
    action: 'DOCUMENT_MOVE',
    resource: '/api/docs/move',
    userId: req.user.id,
    tenantId: tenantId,
    ipAddress: req.ip,
    details: `Moved document ${documentId} to folder ${targetFolder}`,
    severity: 'medium',
    category: 'document'
  });
  
  res.json({
    id: documentId,
    path: targetFolder,
    movedBy: req.user.id,
    movedAt: new Date().toISOString()
  });
});

/**
 * Delete a document
 * DELETE /api/docs/delete
 */
router.delete('/delete', (req, res) => {
  const { documentId } = req.body;
  const tenantId = req.validatedTenantId;
  
  // Validate inputs
  if (!documentId) {
    return res.status(400).json({
      error: 'Missing document ID',
      message: 'Document ID is required'
    });
  }
  
  // For development purposes, simulate document deletion
  // In production, this would delete the document from the database
  
  // Log document deletion
  auditLog({
    action: 'DOCUMENT_DELETE',
    resource: '/api/docs/delete',
    userId: req.user.id,
    tenantId: tenantId,
    ipAddress: req.ip,
    details: `Deleted document with ID ${documentId}`,
    severity: 'high',
    category: 'document'
  });
  
  res.json({
    id: documentId,
    deleted: true,
    deletedBy: req.user.id,
    deletedAt: new Date().toISOString()
  });
});

/**
 * Get document metadata
 * GET /api/docs/metadata
 */
router.get('/metadata', (req, res) => {
  const { objectId } = req.query;
  const tenantId = req.validatedTenantId;
  
  // For development purposes, return test document metadata
  // In production, this would query the document database
  
  // Log metadata retrieval
  auditLog({
    action: 'DOCUMENT_METADATA',
    resource: '/api/docs/metadata',
    userId: req.user.id,
    tenantId: tenantId,
    ipAddress: req.ip,
    details: `Retrieved metadata for document ${objectId}`,
    severity: 'low',
    category: 'document'
  });
  
  res.json({
    id: objectId,
    name: 'Example Document.pdf',
    size: 1024 * 1024 * 2, // 2MB
    mimeType: 'application/pdf',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date().toISOString(),
    version: '1.2',
    createdBy: 'user123',
    locked: false,
    metadata: {
      studyId: 'STUDY-001',
      indId: 'IND-12345',
      trialPhase: 'Phase 2',
      module: 'Module 3',
      documentType: 'Clinical Study Report',
      status: 'Approved',
      trialId: 'TRIAL-0054',
      molecule: 'MOL-ABC-123'
    },
    tenantId: tenantId
  });
});

/**
 * Get document versions
 * GET /api/docs/versions
 */
router.get('/versions', (req, res) => {
  const { objectId } = req.query;
  const tenantId = req.validatedTenantId;
  
  // For development purposes, return test document versions
  // In production, this would query the document database
  
  // Log versions retrieval
  auditLog({
    action: 'DOCUMENT_VERSIONS',
    resource: '/api/docs/versions',
    userId: req.user.id,
    tenantId: tenantId,
    ipAddress: req.ip,
    details: `Retrieved versions for document ${objectId}`,
    severity: 'low',
    category: 'document'
  });
  
  // Create some test version history
  const now = Date.now();
  const day = 86400000; // 1 day in milliseconds
  
  res.json([
    {
      id: objectId + '_v1.2',
      version: '1.2',
      createdAt: new Date(now).toISOString(),
      createdBy: 'user123',
      comment: 'Updated analysis section',
      current: true
    },
    {
      id: objectId + '_v1.1',
      version: '1.1',
      createdAt: new Date(now - day).toISOString(),
      createdBy: 'user456',
      comment: 'Fixed tables and figures',
      current: false
    },
    {
      id: objectId + '_v1.0',
      version: '1.0',
      createdAt: new Date(now - day * 3).toISOString(),
      createdBy: 'user123',
      comment: 'Initial version',
      current: false
    }
  ]);
});

// Helper functions for test data

/**
 * Generate test documents for development
 */
function generateTestDocuments(tenantId, folderPath = '/') {
  const now = Date.now();
  const day = 86400000; // 1 day in milliseconds
  
  // Basic document types to show in UI
  const docTypes = [
    { name: 'Clinical Study Report.pdf', type: 'pdf', size: 1843120 },
    { name: 'Protocol Amendment.docx', type: 'docx', size: 573922 },
    { name: 'Statistical Analysis Plan.pdf', type: 'pdf', size: 927331 },
    { name: 'Trial-45632 Data Tables.xlsx', type: 'xlsx', size: 651202 },
    { name: 'Molecule-XTZ1091 Summary.pdf', type: 'pdf', size: 421009 },
    { name: 'Laboratory Methods.pdf', type: 'pdf', size: 1201023 },
    { name: 'Subject Dispositon.pdf', type: 'pdf', size: 342567 },
    { name: 'Adverse Events Log.xlsx', type: 'xlsx', size: 892345 },
    { name: 'Investigator Brochure.pdf', type: 'pdf', size: 2341092 },
    { name: 'Trial-ABC123 Final Report.pdf', type: 'pdf', size: 5230145 },
    { name: 'Molecule-RGT443 Chemistry.docx', type: 'docx', size: 459023 },
    { name: 'IRB Approvals.pdf', type: 'pdf', size: 312450 }
  ];
  
  // Create documents with varied timestamps and metadata
  return docTypes.map((doc, index) => {
    // Extract trial ID from filename if present
    let trialId = '';
    const trialMatch = doc.name.match(/Trial-([A-Z0-9]+)/i);
    if (trialMatch) {
      trialId = trialMatch[1];
    }
    
    // Extract molecule from filename if present
    let molecule = '';
    const moleculeMatch = doc.name.match(/Molecule-([A-Z0-9]+)/i);
    if (moleculeMatch) {
      molecule = moleculeMatch[1];
    }
    
    return {
      id: `doc_${tenantId}_${index}`,
      name: doc.name,
      size: doc.size,
      mimeType: getMimeType(doc.type),
      path: folderPath,
      fileUrl: `/api/docs/download?objectId=doc_${tenantId}_${index}`,
      viewUrl: `/api/docs/preview/sample.pdf`,
      createdAt: new Date(now - day * (index % 5)).toISOString(),
      updatedAt: new Date(now - day * (index % 3)).toISOString(),
      version: `1.${index % 3}`,
      locked: index % 7 === 0, // Some documents are locked
      lockedBy: index % 7 === 0 ? 'user456' : null,
      metadata: {
        studyId: `STUDY-${1000 + index}`,
        indId: `IND-${12345 + index}`,
        trialPhase: `Phase ${(index % 3) + 1}`,
        module: `Module ${(index % 5) + 1}`,
        documentType: getDocumentType(doc.name),
        status: getDocumentStatus(index),
        trialId: trialId || `T${10000 + index}`,
        molecule: molecule || `M${1000 + index}`
      },
      tenantId: tenantId
    };
  });
}

/**
 * Generate test folders for development
 */
function generateTestFolders(tenantId, parentPath = '/') {
  // Customize folders based on parent path
  if (parentPath === '/') {
    // Root level folders
    return [
      {
        id: 'folder_1',
        name: 'Regulatory Submissions',
        path: '/Regulatory Submissions',
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        tenantId: tenantId
      },
      {
        id: 'folder_2',
        name: 'Clinical Trial Documents',
        path: '/Clinical Trial Documents',
        createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
        tenantId: tenantId
      },
      {
        id: 'folder_3',
        name: 'Quality Management',
        path: '/Quality Management',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        tenantId: tenantId
      }
    ];
  } else if (parentPath === '/Regulatory Submissions') {
    // Regulatory Submissions subfolders
    return [
      {
        id: 'folder_4',
        name: 'FDA Submissions',
        path: '/Regulatory Submissions/FDA Submissions',
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        tenantId: tenantId
      },
      {
        id: 'folder_5',
        name: 'EMA Submissions',
        path: '/Regulatory Submissions/EMA Submissions',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        tenantId: tenantId
      }
    ];
  } else if (parentPath === '/Clinical Trial Documents') {
    // Clinical Trial Documents subfolders
    return [
      {
        id: 'folder_6',
        name: 'Protocols',
        path: '/Clinical Trial Documents/Protocols',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        tenantId: tenantId
      },
      {
        id: 'folder_7',
        name: 'Clinical Study Reports',
        path: '/Clinical Trial Documents/Clinical Study Reports',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        tenantId: tenantId
      }
    ];
  }
  
  // Default - empty folder
  return [];
}

/**
 * Get MIME type from file extension
 */
function getMimeType(ext) {
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'doc':
    case 'docx':
      return 'application/msword';
    case 'xls':
    case 'xlsx':
      return 'application/vnd.ms-excel';
    case 'txt':
      return 'text/plain';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Determine document type based on filename
 */
function getDocumentType(filename) {
  const lowerName = filename.toLowerCase();
  
  if (lowerName.includes('protocol')) {
    return 'Protocol';
  } else if (lowerName.includes('study report') || lowerName.includes('csr')) {
    return 'Clinical Study Report';
  } else if (lowerName.includes('analysis')) {
    return 'Statistical Analysis';
  } else if (lowerName.includes('brochure')) {
    return 'Investigator Brochure';
  } else if (lowerName.includes('table')) {
    return 'Data Tables';
  } else if (lowerName.includes('summary')) {
    return 'Summary';
  } else if (lowerName.includes('adverse')) {
    return 'Safety Data';
  } else {
    return 'Other';
  }
}

/**
 * Get document status based on index
 */
function getDocumentStatus(index) {
  const statuses = ['Draft', 'In Review', 'Approved', 'Final', 'Archived'];
  return statuses[index % statuses.length];
}

module.exports = router;