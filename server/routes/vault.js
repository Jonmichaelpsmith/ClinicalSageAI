const express = require('express');
const router = express.Router();
const { getRecentDocuments } = require('../controllers/vaultController');

// Get recent documents
router.get('/recent-docs', getRecentDocuments);

// Get document content - handles draft documents specially to avoid client portal redirects
router.get('/documents/:documentId/content', async (req, res) => {
  try {
    const { documentId } = req.params;
    
    // In a production environment, this would retrieve document data from a database
    // For this implementation, we'll return mock data for draft documents
    
    // Mock document content based on document ID pattern
    let documentType = '510k';
    if (documentId.toLowerCase().includes('cer')) {
      documentType = 'cer';
    }
    
    let documentContent = {
      id: documentId,
      type: documentType,
      status: 'draft',
      workflowStep: 2,
      lastModified: new Date().toISOString()
    };
    
    // Add device profile for 510k documents
    if (documentType === '510k') {
      documentContent.deviceProfile = {
        id: documentId,
        deviceName: 'CardioMonitor 2000',
        manufacturer: 'MedTech Innovations',
        productCode: 'DRT',
        deviceClass: 'II',
        intendedUse: 'Continuous monitoring of cardiac rhythm and vital signs in clinical settings',
        description: 'A medical device designed for diagnostic procedures',
        regulatoryClass: 'II',
        status: 'active'
      };
    }
    
    // Return the content directly for loading in CERV2
    res.json(documentContent);
    
  } catch (error) {
    console.error('Error retrieving document content:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving document content'
    });
  }
});

// Open document - handles the redirect logic
router.get('/documents/:documentId/open', async (req, res) => {
  try {
    const { documentId } = req.params;
    
    // Check if this is a draft document
    const isDraft = documentId.includes('draft') || Math.random() > 0.5; // Simulate some documents being drafts
    
    if (isDraft) {
      // For draft documents, return content directly rather than redirecting
      const documentContent = {
        id: documentId,
        status: 'draft',
        content: {
          // Basic document content that will be used in the CERV2 component
          deviceProfile: {
            id: documentId,
            deviceName: 'Draft Device',
            manufacturer: 'Draft Manufacturer',
            productCode: 'DFT',
            deviceClass: 'II',
            intendedUse: 'Draft intended use description',
            description: 'This is a draft document',
            regulatoryClass: 'II',
            status: 'draft'
          },
          workflowStep: 2
        }
      };
      
      res.json(documentContent);
    } else {
      // For non-draft documents, redirect to client portal (simulated)
      res.json({
        redirectUrl: '/client-portal/documents/' + documentId
      });
    }
    
  } catch (error) {
    console.error('Error opening document:', error);
    res.status(500).json({
      success: false,
      message: 'Error opening document'
    });
  }
});

// Get folder structure for document tree
router.get('/structure', async (req, res) => {
  try {
    const rootFolderId = req.query.rootFolderId;
    const maxDepth = parseInt(req.query.maxDepth || '3', 10);
    
    // Return mock folder structure for demonstration
    const folderStructure = {
      folders: [
        {
          id: 'folder-1',
          name: '510(k) Documents',
          type: 'folder',
          children: [
            {
              id: 'folder-1-1',
              name: 'Draft Submissions',
              type: 'folder',
              children: [
                {
                  id: 'doc-510k-draft-1',
                  name: 'CardioMonitor Draft.pdf',
                  type: 'document',
                  format: 'pdf',
                  status: 'draft',
                  updatedAt: new Date().toISOString()
                },
                {
                  id: 'doc-510k-draft-2',
                  name: 'GlucoSense Draft.pdf',
                  type: 'document',
                  format: 'pdf',
                  status: 'draft',
                  updatedAt: new Date().toISOString()
                }
              ]
            },
            {
              id: 'folder-1-2',
              name: 'Completed Submissions',
              type: 'folder',
              children: [
                {
                  id: 'doc-510k-final-1',
                  name: 'CardioMonitor Final.pdf',
                  type: 'document',
                  format: 'pdf',
                  status: 'final',
                  updatedAt: new Date().toISOString()
                }
              ]
            }
          ]
        },
        {
          id: 'folder-2',
          name: 'CER Documents',
          type: 'folder',
          children: [
            {
              id: 'folder-2-1',
              name: 'Draft CERs',
              type: 'folder',
              children: [
                {
                  id: 'doc-cer-draft-1',
                  name: 'CardioMonitor CER Draft.pdf',
                  type: 'document',
                  format: 'pdf',
                  status: 'draft',
                  updatedAt: new Date().toISOString()
                }
              ]
            },
            {
              id: 'folder-2-2',
              name: 'Submitted CERs',
              type: 'folder',
              children: [
                {
                  id: 'doc-cer-final-1',
                  name: 'CardioMonitor CER Final.pdf',
                  type: 'document',
                  format: 'pdf',
                  status: 'final',
                  updatedAt: new Date().toISOString()
                }
              ]
            }
          ]
        }
      ]
    };
    
    res.json(folderStructure);
    
  } catch (error) {
    console.error('Error retrieving folder structure:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving folder structure'
    });
  }
});

module.exports = router;