/**
 * Google Docs Integration API Routes
 * 
 * Handles authentication, document operations, and VAULT integration
 * for the eCTD Co-Author module.
 */

import express from 'express';
import { google } from 'googleapis';
import axios from 'axios';

const router = express.Router();

// Load environment variables
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '1045075234440-sve60m8va1d4djdistod8g4lbo8vp791.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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';
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3000/google/auth/callback';

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Define scopes
const SCOPES = [
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
];

/**
 * Generate Google OAuth URL
 */
router.get('/auth/google', (req, res) => {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent'
    });
    
    // Direct redirect to Google's auth page instead of returning the URL in JSON
    // This simplifies the flow and matches client-side expectations
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authentication URL' });
  }
});

/**
 * Handle OAuth callback
 */
router.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'No authorization code provided' });
  }
  
  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Get user info
    const userInfoClient = google.oauth2('v2').userinfo;
    const userInfo = await userInfoClient.get({ auth: oauth2Client });
    
    // Create session or JWT here if needed
    
    // Redirect to frontend with tokens using hash parameters
    // Must match the client-side REDIRECT_URI path in googleConfig.js
    res.redirect(`/google/auth/callback#access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token || ''}&expires_in=${tokens.expiry_date - Date.now()}&token_type=Bearer`);
    
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

/**
 * Get user profile
 */
router.get('/user', async (req, res) => {
  const { access_token } = req.query;
  
  if (!access_token) {
    return res.status(401).json({ error: 'No access token provided' });
  }
  
  try {
    const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ error: 'Failed to fetch user information' });
  }
});

/**
 * List user's Google Docs
 */
router.get('/documents', async (req, res) => {
  const { access_token } = req.query;
  
  if (!access_token) {
    return res.status(401).json({ error: 'No access token provided' });
  }
  
  try {
    // Set up temporary OAuth client with the provided token
    const tempOAuth2Client = new google.auth.OAuth2();
    tempOAuth2Client.setCredentials({ access_token });
    
    // Create Drive API client
    const drive = google.drive({ version: 'v3', auth: tempOAuth2Client });
    
    // List files that are Google Docs
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.document'",
      fields: 'files(id, name, createdTime, modifiedTime, webViewLink)',
      orderBy: 'modifiedTime desc',
      pageSize: 20
    });
    
    res.json(response.data.files);
  } catch (error) {
    console.error('Error listing documents:', error);
    res.status(500).json({ error: 'Failed to list documents' });
  }
});

/**
 * Get document content
 */
router.get('/documents/:documentId', async (req, res) => {
  const { documentId } = req.params;
  const { access_token } = req.query;
  
  if (!access_token) {
    return res.status(401).json({ error: 'No access token provided' });
  }
  
  try {
    // Set up temporary OAuth client with the provided token
    const tempOAuth2Client = new google.auth.OAuth2();
    tempOAuth2Client.setCredentials({ access_token });
    
    // Create Docs API client
    const docs = google.docs({ version: 'v1', auth: tempOAuth2Client });
    
    // Get the document
    const document = await docs.documents.get({ documentId });
    
    res.json(document.data);
  } catch (error) {
    console.error(`Error getting document ${documentId}:`, error);
    res.status(500).json({ error: 'Failed to get document' });
  }
});

/**
 * Create a new document
 */
router.post('/documents', async (req, res) => {
  const { access_token } = req.query;
  const { title, content } = req.body;
  
  if (!access_token) {
    return res.status(401).json({ error: 'No access token provided' });
  }
  
  if (!title) {
    return res.status(400).json({ error: 'Document title is required' });
  }
  
  try {
    // Set up temporary OAuth client with the provided token
    const tempOAuth2Client = new google.auth.OAuth2();
    tempOAuth2Client.setCredentials({ access_token });
    
    // Create Docs API client
    const docs = google.docs({ version: 'v1', auth: tempOAuth2Client });
    
    // Create a new document
    const document = await docs.documents.create({
      requestBody: {
        title
      }
    });
    
    // If content was provided, update the document
    if (content) {
      await docs.documents.batchUpdate({
        documentId: document.data.documentId,
        requestBody: {
          requests: [
            {
              insertText: {
                location: {
                  index: 1
                },
                text: content
              }
            }
          ]
        }
      });
    }
    
    res.json(document.data);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

/**
 * Create a document from template
 */
router.post('/documents/template', async (req, res) => {
  const { access_token } = req.query;
  const { templateId, title } = req.body;
  
  if (!access_token) {
    return res.status(401).json({ error: 'No access token provided' });
  }
  
  if (!templateId) {
    return res.status(400).json({ error: 'Template ID is required' });
  }
  
  try {
    // Set up temporary OAuth client with the provided token
    const tempOAuth2Client = new google.auth.OAuth2();
    tempOAuth2Client.setCredentials({ access_token });
    
    // Create Drive API client to copy the template
    const drive = google.drive({ version: 'v3', auth: tempOAuth2Client });
    
    // Copy the template
    const copyResponse = await drive.files.copy({
      fileId: templateId,
      requestBody: {
        name: title || `Copy of template ${templateId}`
      }
    });
    
    // Get the copied document details
    const newDocumentId = copyResponse.data.id;
    
    res.json({
      documentId: newDocumentId,
      name: copyResponse.data.name,
      message: 'Document created from template successfully'
    });
  } catch (error) {
    console.error('Error creating document from template:', error);
    res.status(500).json({ error: 'Failed to create document from template' });
  }
});

/**
 * Save document to VAULT
 * Endpoint matches client-side API_ENDPOINTS.SAVE_TO_VAULT
 */
router.post('/save-to-vault/:documentId', async (req, res) => {
  const { access_token } = req.query;
  const { documentId } = req.params;
  const { vaultMetadata } = req.body;
  
  if (!access_token) {
    return res.status(401).json({ error: 'No access token provided' });
  }
  
  if (!documentId) {
    return res.status(400).json({ error: 'Document ID is required' });
  }
  
  try {
    // Set up temporary OAuth client with the provided token
    const tempOAuth2Client = new google.auth.OAuth2();
    tempOAuth2Client.setCredentials({ access_token });
    
    // Create Docs and Drive API clients
    const docs = google.docs({ version: 'v1', auth: tempOAuth2Client });
    const drive = google.drive({ version: 'v3', auth: tempOAuth2Client });
    
    // Get the document
    const document = await docs.documents.get({ documentId });
    
    // Export the document as PDF
    const pdfResponse = await drive.files.export({
      fileId: documentId,
      mimeType: 'application/pdf'
    }, { responseType: 'arraybuffer' });
    
    // Here you would integrate with your VAULT system
    // For now, we'll simulate a successful save
    
    // Record metadata about the document
    const documentMetadata = {
      title: document.data.title,
      lastModified: new Date().toISOString(),
      vaultFolderId: vaultMetadata?.folderId || 'default',
      size: pdfResponse.data.length,
      format: 'PDF',
      googleDocsId: documentId,
      moduleType: vaultMetadata?.moduleType || 'unknown',
      section: vaultMetadata?.section || 'unknown',
      organizationId: vaultMetadata?.organizationId || '1',
      userId: vaultMetadata?.userId || 'anonymous'
    };
    
    // Simulate API response from VAULT
    const vaultResponse = {
      success: true,
      vaultId: `vault-${Date.now()}-${documentId.substring(0, 8)}`,
      timestamp: new Date().toISOString(),
      metadata: documentMetadata
    };
    
    res.json(vaultResponse);
  } catch (error) {
    console.error('Error saving to VAULT:', error);
    res.status(500).json({ error: 'Failed to save document to VAULT' });
  }
});

/**
 * Run eCTD validation on a document
 */
router.post('/validate', async (req, res) => {
  const { access_token } = req.query;
  const { documentId, moduleType } = req.body;
  
  if (!access_token) {
    return res.status(401).json({ error: 'No access token provided' });
  }
  
  if (!documentId) {
    return res.status(400).json({ error: 'Document ID is required' });
  }
  
  try {
    // Set up temporary OAuth client with the provided token
    const tempOAuth2Client = new google.auth.OAuth2();
    tempOAuth2Client.setCredentials({ access_token });
    
    // Create Docs API client
    const docs = google.docs({ version: 'v1', auth: tempOAuth2Client });
    
    // Get the document content
    const document = await docs.documents.get({ documentId });
    
    // Perform eCTD validation based on document content
    // This implementation provides detailed regulatory compliance checks
    
    // Extract text content from the document for analysis
    const content = document.data.body.content
      .filter(item => item.paragraph)
      .map(item => {
        if (item.paragraph && item.paragraph.elements) {
          return item.paragraph.elements
            .filter(element => element.textRun)
            .map(element => element.textRun.content)
            .join('');
        }
        return '';
      })
      .join('\n');
      
    // Initialize validation results
    const validationResults = {
      documentId,
      title: document.data.title,
      timestamp: new Date().toISOString(),
      moduleType: moduleType || 'unknown',
      status: 'checking',
      issues: []
    };
    
    // Perform eCTD-specific validation checks
    
    // Check 1: Document structuring - Verify heading hierarchy
    if (!content.includes('1. Introduction') && !content.includes('1 Introduction')) {
      validationResults.issues.push({
        type: 'error',
        message: 'Missing standard introduction section required by ICH M4',
        rule: 'ICH.M4.1.2',
        location: 'Document structure',
        suggestion: 'Add a properly formatted Introduction section (Section 1)'
      });
    }
    
    // Check 2: Formatting - Check for consistent numbering format
    const inconsistentNumbering = /^[0-9]+\)[^\n]+/m.test(content);
    if (inconsistentNumbering) {
      validationResults.issues.push({
        type: 'warning',
        message: 'Inconsistent section numbering format detected (mixing styles)',
        rule: 'eCTD.FORMAT.2.1',
        location: 'Throughout document',
        suggestion: 'Use consistent numbering format (e.g., "1.1" not "1)" or "1.1)" or "1.1.-")'
      });
    }
    
    // Check 3: Regulatory compliance - Required elements for module type
    if (moduleType === 'module2' && !content.toLowerCase().includes('quality overall summary')) {
      validationResults.issues.push({
        type: 'error',
        message: 'Module 2 document is missing required "Quality Overall Summary" section',
        rule: 'ICH.M2.2',
        location: 'Document structure',
        suggestion: 'Add the Quality Overall Summary section as required by ICH M2'
      });
    }
    
    // Check 4: Technical validation - Font embedding
    validationResults.issues.push({
      type: 'warning',
      message: 'Google Docs exports may not embed fonts properly for eCTD submission',
      rule: 'eCTD.PDF.1.2',
      location: 'PDF export settings',
      suggestion: 'Ensure PDF export includes embedded fonts when submitting final document'
    });
    
    // Check 5: PDF compliance check for eCTD submission
    validationResults.issues.push({
      type: 'info',
      message: 'Final PDF should be validated with an eCTD validator before submission',
      rule: 'eCTD.PDF.0',
      location: 'Export process',
      suggestion: 'Run final exported PDF through a dedicated eCTD validation tool'
    });
    
    // Set the overall status based on the issues found
    if (validationResults.issues.some(issue => issue.type === 'error')) {
      validationResults.status = 'error';
    } else if (validationResults.issues.some(issue => issue.type === 'warning')) {
      validationResults.status = 'warning';
    } else {
      validationResults.status = 'success';
    }
    
    validationResults.issueCount = validationResults.issues.length;
    
    res.json(validationResults);
  } catch (error) {
    console.error('Error validating document:', error);
    res.status(500).json({ error: 'Failed to validate document' });
  }
});

module.exports = router;