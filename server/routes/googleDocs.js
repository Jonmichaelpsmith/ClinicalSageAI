/**
 * Google Docs Integration API Routes
 * 
 * Handles authentication, document operations, and VAULT integration
 * for the eCTD Co-Author module.
 */

const express = require('express');
const { google } = require('googleapis');
const router = express.Router();
const axios = require('axios');

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
    
    // Redirect to frontend with tokens - fixed to use the correct callback route
    res.redirect(`/google/auth/callback#access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}&expires_in=${tokens.expiry_date - Date.now()}`);
    
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
 */
router.post('/vault/save', async (req, res) => {
  const { access_token } = req.query;
  const { documentId, vaultFolderId, metadata } = req.body;
  
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
      vaultFolderId: vaultFolderId || 'default',
      size: pdfResponse.data.length,
      format: 'PDF',
      googleDocsId: documentId,
      ...metadata
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
    
    // Simulate eCTD validation
    // In a real implementation, you would run actual validation rules here
    
    const validationResults = {
      documentId,
      title: document.data.title,
      timestamp: new Date().toISOString(),
      moduleType: moduleType || 'unknown',
      status: Math.random() > 0.3 ? 'warning' : Math.random() > 0.5 ? 'error' : 'success',
      issues: []
    };
    
    // Generate some sample validation issues
    if (validationResults.status === 'error') {
      validationResults.issues.push(
        { type: 'error', message: 'Invalid margins detected on pages 2-5', rule: 'eCTD.M2.2.1' },
        { type: 'error', message: 'Unsupported font "Calibri" used', rule: 'eCTD.M2.font.1' },
        { type: 'warning', message: 'Image resolution below recommended 300dpi', rule: 'eCTD.media.1' }
      );
    } else if (validationResults.status === 'warning') {
      validationResults.issues.push(
        { type: 'warning', message: 'Table of contents formatting inconsistent', rule: 'eCTD.M3.TOC.1' },
        { type: 'warning', message: 'References not in recommended format', rule: 'eCTD.reference.format' }
      );
    }
    
    validationResults.issueCount = validationResults.issues.length;
    
    res.json(validationResults);
  } catch (error) {
    console.error('Error validating document:', error);
    res.status(500).json({ error: 'Failed to validate document' });
  }
});

module.exports = router;