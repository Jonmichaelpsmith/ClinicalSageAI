// server/routes/documents.js

import express from 'express';
const router = express.Router();

// Get document list
router.get('/list', (req, res) => {
  try {
    const { projectId, type } = req.query;
    
    // Log the request
    console.log(`Fetching documents for project ${projectId || 'all'}, type: ${type || 'all'}`);
    
    // Sample documents data
    const documents = [
      {
        id: 'doc-001',
        name: 'Form FDA 1571',
        type: 'FDA Form',
        category: 'Administrative',
        status: 'draft',
        uploadedBy: 'John Smith',
        uploadDate: '2025-03-15T10:30:00Z',
        fileSize: 450223,
        fileType: 'application/pdf',
        url: '/documents/fda-1571.pdf'
      },
      {
        id: 'doc-002',
        name: 'Investigator Brochure',
        type: 'IND',
        category: 'Clinical',
        status: 'approved',
        uploadedBy: 'Sarah Johnson',
        uploadDate: '2025-03-20T14:45:00Z',
        fileSize: 2503442,
        fileType: 'application/pdf',
        url: '/documents/investigator-brochure.pdf'
      },
      {
        id: 'doc-003',
        name: 'Protocol Synopsis',
        type: 'Clinical',
        category: 'Protocol',
        status: 'in_review',
        uploadedBy: 'Robert Thompson',
        uploadDate: '2025-04-05T09:15:00Z',
        fileSize: 1205431,
        fileType: 'application/pdf',
        url: '/documents/protocol-synopsis.pdf'
      },
      {
        id: 'doc-004',
        name: 'CMC Summary',
        type: 'CMC',
        category: 'Chemistry',
        status: 'approved',
        uploadedBy: 'Jennifer Lee',
        uploadDate: '2025-04-10T11:20:00Z',
        fileSize: 3421789,
        fileType: 'application/pdf',
        url: '/documents/cmc-summary.pdf'
      },
      {
        id: 'doc-005',
        name: 'Cover Letter',
        type: 'Administrative',
        category: 'Submission',
        status: 'draft',
        uploadedBy: 'Michael Brown',
        uploadDate: '2025-04-15T16:00:00Z',
        fileSize: 325678,
        fileType: 'application/pdf',
        url: '/documents/cover-letter.pdf'
      }
    ];
    
    // Filter by project if specified
    let filteredDocs = documents;
    if (projectId) {
      // In a real implementation, filter documents by projectId
    }
    
    // Filter by type if specified
    if (type) {
      filteredDocs = filteredDocs.filter(doc => doc.type === type || doc.category === type);
    }
    
    return res.json(filteredDocs);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Upload document
router.post('/upload', (req, res) => {
  try {
    const { fileName, fileType, projectId, documentType, category } = req.body;
    
    // In a production environment, this would handle the file upload
    console.log(`Uploading document: ${fileName} for project ${projectId}`);
    
    // Generate a sample document object
    const document = {
      id: `doc-${Date.now()}`,
      name: fileName,
      type: documentType,
      category: category,
      status: 'uploaded',
      uploadedBy: 'Current User',
      uploadDate: new Date().toISOString(),
      fileSize: Math.floor(Math.random() * 5000000) + 100000, // Random file size
      fileType: fileType,
      url: `/documents/${fileName.toLowerCase().replace(/\s+/g, '-')}`
    };
    
    return res.json({ success: true, document });
  } catch (error) {
    console.error('Error uploading document:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Get document details
router.get('/:documentId', (req, res) => {
  try {
    const { documentId } = req.params;
    
    // In a production environment, fetch the document from a database
    console.log(`Fetching document ${documentId}`);
    
    // Sample document data
    const document = {
      id: documentId,
      name: 'Sample Document',
      type: 'IND',
      category: 'Administrative',
      status: 'approved',
      uploadedBy: 'John Smith',
      uploadDate: '2025-04-01T10:30:00Z',
      fileSize: 1205431,
      fileType: 'application/pdf',
      url: `/documents/${documentId}.pdf`,
      versions: [
        {
          version: 1,
          uploadDate: '2025-03-15T10:30:00Z',
          status: 'superseded',
          uploadedBy: 'John Smith'
        },
        {
          version: 2,
          uploadDate: '2025-04-01T10:30:00Z',
          status: 'current',
          uploadedBy: 'John Smith'
        }
      ]
    };
    
    return res.json(document);
  } catch (error) {
    console.error(`Error fetching document ${req.params.documentId}:`, error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Delete document
router.delete('/:documentId', (req, res) => {
  try {
    const { documentId } = req.params;
    
    // In a production environment, delete the document from storage
    console.log(`Deleting document ${documentId}`);
    
    return res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error(`Error deleting document ${req.params.documentId}:`, error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;