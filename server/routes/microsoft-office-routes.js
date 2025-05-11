/**
 * Microsoft Office Integration Routes
 * 
 * These routes provide integration with Microsoft Office applications,
 * particularly Microsoft Word, for eCTD document authoring and management.
 * 
 * Routes include:
 * - Authentication with Microsoft (token verification, refresh)
 * - Document operations (get, save, create)
 * - Template management
 * - Version control
 * - Integration with DocuShare and other repositories
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { getTenantContext } = require('../middleware/tenantContext');

// Configure multer for file uploads (temporarily storing files)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: function (req, file, cb) {
    // Accept Office documents and PDFs
    const filetypes = /docx|doc|xlsx|xls|pptx|ppt|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only Office documents and PDFs are allowed'));
    }
  }
});

/**
 * Helper function to get Microsoft Graph API access token
 * @param {string} msAccessToken - User's Microsoft access token
 * @returns {Promise<string>} - Microsoft Graph access token
 */
async function getGraphToken(msAccessToken) {
  try {
    // In a real implementation, you might exchange the token or use it directly
    // depending on the authentication flow
    return msAccessToken;
  } catch (error) {
    console.error('Error getting Microsoft Graph token:', error);
    throw error;
  }
}

/**
 * Helper function to verify Microsoft token validity
 * @param {string} token - Microsoft access token
 * @returns {Promise<boolean>} - True if token is valid
 */
async function verifyToken(token) {
  try {
    const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.status === 200;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

// Routes

/**
 * Verify Microsoft authentication token
 */
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }
    
    const isValid = await verifyToken(token);
    
    if (isValid) {
      return res.json({ valid: true });
    } else {
      return res.status(401).json({ valid: false, error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ error: 'Failed to verify token' });
  }
});

/**
 * Get document from Microsoft OneDrive/SharePoint
 */
router.get('/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    const graphToken = await getGraphToken(token);
    
    // Get tenant context for multi-tenant support
    const tenantContext = getTenantContext();
    const organizationId = tenantContext.organizationId;
    
    // In a real implementation, we would fetch the document from Microsoft Graph API
    // For demo purposes, we'll simulate a successful response
    
    // Simulate retrieving document from OneDrive/SharePoint
    const documentData = {
      id: id,
      name: `Document-${id}.docx`,
      webUrl: `https://example.sharepoint.com/documents/${id}`,
      embedUrl: `https://example.com/embed/${id}?auth=${token.substring(0, 10)}...`,
      createdDateTime: new Date().toISOString(),
      lastModifiedDateTime: new Date().toISOString(),
      size: 1024 * 1024 * 2, // 2MB
      organizationId: organizationId || 'default',
      content: 'This is the document content placeholder.'
    };
    
    res.json(documentData);
  } catch (error) {
    console.error('Error getting document:', error);
    res.status(500).json({ error: 'Failed to get document' });
  }
});

/**
 * Create a new document in Microsoft OneDrive/SharePoint
 */
router.post('/documents', async (req, res) => {
  try {
    const { name, isTemplate } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    const graphToken = await getGraphToken(token);
    
    // Get tenant context for multi-tenant support
    const tenantContext = getTenantContext();
    const organizationId = tenantContext.organizationId;
    
    // In a real implementation, we would create a document using Microsoft Graph API
    // For demo purposes, we'll simulate a successful response
    
    // Generate a mock document ID
    const documentId = `doc-${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    
    // Simulate creating document in OneDrive/SharePoint
    const documentData = {
      id: documentId,
      name: name || 'Untitled Document.docx',
      webUrl: `https://example.sharepoint.com/documents/${documentId}`,
      embedUrl: `https://example.com/embed/${documentId}?auth=${token.substring(0, 10)}...`,
      createdDateTime: new Date().toISOString(),
      lastModifiedDateTime: new Date().toISOString(),
      size: 0,
      organizationId: organizationId || 'default',
      isTemplate: isTemplate || false
    };
    
    res.json(documentData);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

/**
 * Update document content
 */
router.put('/documents/:id/content', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }
    
    if (!content) {
      return res.status(400).json({ error: 'No content provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const graphToken = await getGraphToken(token);
    
    // Get tenant context for multi-tenant support
    const tenantContext = getTenantContext();
    const organizationId = tenantContext.organizationId;
    
    // In a real implementation, we would update the document using Microsoft Graph API
    // For demo purposes, we'll simulate a successful response
    
    res.json({
      id: id,
      updated: true,
      lastModifiedDateTime: new Date().toISOString(),
      organizationId: organizationId || 'default'
    });
  } catch (error) {
    console.error('Error updating document content:', error);
    res.status(500).json({ error: 'Failed to update document content' });
  }
});

/**
 * Upload document to Microsoft OneDrive/SharePoint
 */
router.post('/documents/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Clean up temporary file
      fs.unlinkSync(req.file.path);
      return res.status(401).json({ error: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    const graphToken = await getGraphToken(token);
    
    // Get tenant context for multi-tenant support
    const tenantContext = getTenantContext();
    const organizationId = tenantContext.organizationId;
    
    // In a real implementation, we would upload to OneDrive/SharePoint using Microsoft Graph API
    // For demo purposes, we'll simulate a successful upload
    
    // Generate a mock document ID
    const documentId = `doc-${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    
    // Simulate uploading file to OneDrive/SharePoint
    const documentData = {
      id: documentId,
      name: req.file.originalname,
      webUrl: `https://example.sharepoint.com/documents/${documentId}`,
      embedUrl: `https://example.com/embed/${documentId}?auth=${token.substring(0, 10)}...`,
      createdDateTime: new Date().toISOString(),
      lastModifiedDateTime: new Date().toISOString(),
      size: req.file.size,
      organizationId: organizationId || 'default'
    };
    
    // Clean up temporary file
    fs.unlinkSync(req.file.path);
    
    res.json(documentData);
  } catch (error) {
    console.error('Error uploading document:', error);
    
    // Clean up temporary file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting temporary file:', unlinkError);
      }
    }
    
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

/**
 * List available document templates
 */
router.get('/templates', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    const graphToken = await getGraphToken(token);
    
    // Get tenant context for multi-tenant support
    const tenantContext = getTenantContext();
    const organizationId = tenantContext.organizationId;
    
    // In a real implementation, we would fetch templates from a database or SharePoint
    // For demo purposes, we'll return mock templates
    
    const templates = [
      {
        id: 'ind-template',
        name: 'IND Application Template',
        description: 'FDA IND application structure',
        createdDateTime: '2025-04-01T12:00:00Z',
        lastModifiedDateTime: '2025-05-01T15:30:00Z',
        organizationId: organizationId || 'default',
        documentId: 'template-ind-123'
      },
      {
        id: 'cmc-template',
        name: 'CMC Module Template',
        description: 'Chemistry, Manufacturing and Controls',
        createdDateTime: '2025-04-15T09:45:00Z',
        lastModifiedDateTime: '2025-05-05T14:20:00Z',
        organizationId: organizationId || 'default',
        documentId: 'template-cmc-456'
      },
      {
        id: 'protocol-template',
        name: 'Clinical Protocol Template',
        description: 'Standard clinical trial protocol',
        createdDateTime: '2025-03-20T11:15:00Z',
        lastModifiedDateTime: '2025-05-03T16:40:00Z',
        organizationId: organizationId || 'default',
        documentId: 'template-protocol-789'
      }
    ];
    
    res.json(templates);
  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

/**
 * Get document version history
 */
router.get('/documents/:id/versions', async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    const graphToken = await getGraphToken(token);
    
    // Get tenant context for multi-tenant support
    const tenantContext = getTenantContext();
    const organizationId = tenantContext.organizationId;
    
    // In a real implementation, we would fetch version history from OneDrive/SharePoint
    // For demo purposes, we'll return mock version history
    
    const versions = [
      {
        id: `${id}-v1`,
        versionNumber: '1.0',
        lastModifiedBy: {
          user: {
            displayName: 'John Doe',
            email: 'john.doe@example.com'
          }
        },
        lastModifiedDateTime: '2025-05-01T10:30:00Z',
        size: 1024 * 512
      },
      {
        id: `${id}-v2`,
        versionNumber: '2.0',
        lastModifiedBy: {
          user: {
            displayName: 'Jane Smith',
            email: 'jane.smith@example.com'
          }
        },
        lastModifiedDateTime: '2025-05-05T14:45:00Z',
        size: 1024 * 768
      },
      {
        id: `${id}-v3`,
        versionNumber: '3.0',
        lastModifiedBy: {
          user: {
            displayName: 'John Doe',
            email: 'john.doe@example.com'
          }
        },
        lastModifiedDateTime: '2025-05-10T09:15:00Z',
        size: 1024 * 1024
      }
    ];
    
    res.json(versions);
  } catch (error) {
    console.error('Error getting version history:', error);
    res.status(500).json({ error: 'Failed to get version history' });
  }
});

/**
 * Create a new document version
 */
router.post('/documents/:id/versions', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, comment } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }
    
    if (!content) {
      return res.status(400).json({ error: 'No content provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const graphToken = await getGraphToken(token);
    
    // Get tenant context for multi-tenant support
    const tenantContext = getTenantContext();
    const organizationId = tenantContext.organizationId;
    
    // In a real implementation, we would create a new version in OneDrive/SharePoint
    // For demo purposes, we'll simulate a successful response
    
    const newVersion = {
      id: `${id}-v${Date.now()}`,
      versionNumber: '4.0',
      comment: comment || '',
      lastModifiedBy: {
        user: {
          displayName: 'Current User',
          email: 'current.user@example.com'
        }
      },
      lastModifiedDateTime: new Date().toISOString(),
      size: content.length || 1024 * 1024
    };
    
    res.json(newVersion);
  } catch (error) {
    console.error('Error creating version:', error);
    res.status(500).json({ error: 'Failed to create version' });
  }
});

module.exports = router;