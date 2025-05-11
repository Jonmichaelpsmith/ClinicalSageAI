/**
 * Microsoft Office Integration Routes
 * 
 * This module provides API endpoints for integrating with Microsoft Office 365,
 * specifically focusing on Word integration for the eCTD Co-Author Module.
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch'); // Required for Microsoft Graph client

// Microsoft API configuration
const MS_CONFIG = {
  clientId: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  tenantId: process.env.MICROSOFT_TENANT_ID || 'common',
  redirectUri: `${process.env.APP_URL || 'http://localhost:3000'}/api/microsoft/callback`,
  authority: 'https://login.microsoftonline.com/',
  scopes: [
    'https://graph.microsoft.com/Files.ReadWrite',
    'https://graph.microsoft.com/Sites.ReadWrite.All',
    'offline_access',
    'openid',
    'profile'
  ]
};

// Create Microsoft Graph client
function getAuthenticatedClient(accessToken) {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    }
  });
}

/**
 * Generate authorization URL for Microsoft OAuth flow
 */
router.get('/authorize', (req, res) => {
  try {
    const state = encodeURIComponent(JSON.stringify({
      returnUrl: req.query.returnUrl || '/'
    }));
    
    const authUrl = `${MS_CONFIG.authority}${MS_CONFIG.tenantId}/oauth2/v2.0/authorize?client_id=${MS_CONFIG.clientId}&response_type=code&redirect_uri=${encodeURIComponent(MS_CONFIG.redirectUri)}&scope=${encodeURIComponent(MS_CONFIG.scopes.join(' '))}&response_mode=query&state=${state}`;
    
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating Microsoft authorization URL:', error);
    res.status(500).json({ error: 'Failed to generate authorization URL' });
  }
});

/**
 * Handle OAuth callback from Microsoft
 */
router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code not found' });
    }
    
    // Exchange code for tokens
    const tokenResponse = await axios.post(
      `${MS_CONFIG.authority}${MS_CONFIG.tenantId}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: MS_CONFIG.clientId,
        client_secret: MS_CONFIG.clientSecret,
        code,
        redirect_uri: MS_CONFIG.redirectUri,
        grant_type: 'authorization_code'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    
    // In a production implementation, store tokens securely in database
    // associated with the user's session
    req.session.msAuth = {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + (expires_in * 1000)
    };
    
    // Get user info from Microsoft Graph
    const graphClient = getAuthenticatedClient(access_token);
    const userInfo = await graphClient.api('/me').get();
    
    req.session.msUserInfo = {
      id: userInfo.id,
      displayName: userInfo.displayName,
      email: userInfo.userPrincipalName
    };
    
    // Redirect back to application
    const parsedState = JSON.parse(decodeURIComponent(state));
    res.redirect(parsedState.returnUrl || '/');
  } catch (error) {
    console.error('Error handling Microsoft callback:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

/**
 * Check Microsoft authentication status
 */
router.get('/auth-status', (req, res) => {
  try {
    const msAuth = req.session?.msAuth;
    const msUserInfo = req.session?.msUserInfo;
    
    if (!msAuth || !msAuth.accessToken) {
      return res.json({ isAuthenticated: false });
    }
    
    const isTokenExpired = msAuth.expiresAt < Date.now();
    
    res.json({
      isAuthenticated: !isTokenExpired,
      userInfo: isTokenExpired ? null : msUserInfo,
      needsRefresh: isTokenExpired
    });
  } catch (error) {
    console.error('Error checking authentication status:', error);
    res.status(500).json({ error: 'Failed to check authentication status' });
  }
});

/**
 * Refresh Microsoft access token
 */
router.post('/refresh-token', async (req, res) => {
  try {
    const refreshToken = req.session?.msAuth?.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token available' });
    }
    
    // Exchange refresh token for new access token
    const tokenResponse = await axios.post(
      `${MS_CONFIG.authority}${MS_CONFIG.tenantId}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: MS_CONFIG.clientId,
        client_secret: MS_CONFIG.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    
    // Update tokens in session
    req.session.msAuth = {
      accessToken: access_token,
      refreshToken: refresh_token || refreshToken, // Use new refresh token if provided
      expiresAt: Date.now() + (expires_in * 1000)
    };
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error refreshing Microsoft token:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

/**
 * Sign out from Microsoft
 */
router.post('/sign-out', (req, res) => {
  try {
    // Clear Microsoft authentication data from session
    if (req.session) {
      delete req.session.msAuth;
      delete req.session.msUserInfo;
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error signing out from Microsoft:', error);
    res.status(500).json({ error: 'Failed to sign out' });
  }
});

/**
 * Get Microsoft OneDrive documents
 */
router.get('/documents', async (req, res) => {
  try {
    const accessToken = req.session?.msAuth?.accessToken;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Not authenticated with Microsoft' });
    }
    
    const graphClient = getAuthenticatedClient(accessToken);
    
    // Get documents from OneDrive root
    const response = await graphClient
      .api('/me/drive/root/children')
      .select('id,name,webUrl,createdDateTime,lastModifiedDateTime,file')
      .filter("file ne null")
      .get();
    
    res.json(response.value);
  } catch (error) {
    console.error('Error getting OneDrive documents:', error);
    res.status(500).json({ error: 'Failed to get documents' });
  }
});

/**
 * Get Microsoft Word document embed URL
 */
router.get('/word-embed-url/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const accessToken = req.session?.msAuth?.accessToken;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Not authenticated with Microsoft' });
    }
    
    const graphClient = getAuthenticatedClient(accessToken);
    
    // Get document details
    const document = await graphClient
      .api(`/me/drive/items/${documentId}`)
      .get();
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Generate Word Online edit URL
    // Note: In a production implementation, this would use the WOPI protocol
    // which requires proper integration with Microsoft Office Online Server
    
    // This is a simplified approach using direct Word Online URLs
    const webUrl = document.webUrl;
    const embedUrl = webUrl.replace('view.aspx', 'edit.aspx');
    
    res.json({ embedUrl });
  } catch (error) {
    console.error('Error getting Word embed URL:', error);
    res.status(500).json({ error: 'Failed to get Word embed URL' });
  }
});

/**
 * Create a new Word document
 */
router.post('/create-document', async (req, res) => {
  try {
    const { name, folderId } = req.body;
    const accessToken = req.session?.msAuth?.accessToken;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Not authenticated with Microsoft' });
    }
    
    const graphClient = getAuthenticatedClient(accessToken);
    
    // Create empty Word document
    const driveItem = {
      name: `${name}.docx`,
      file: {},
      '@microsoft.graph.conflictBehavior': 'rename'
    };
    
    // Create document in OneDrive root or specified folder
    const endpoint = folderId 
      ? `/me/drive/items/${folderId}/children` 
      : '/me/drive/root/children';
    
    const response = await graphClient
      .api(endpoint)
      .post(driveItem);
    
    res.json(response);
  } catch (error) {
    console.error('Error creating Word document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

/**
 * Sync VAULT document with Microsoft Word
 */
router.post('/sync-vault-document', async (req, res) => {
  try {
    const { vaultDocumentId, content, name } = req.body;
    const accessToken = req.session?.msAuth?.accessToken;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Not authenticated with Microsoft' });
    }
    
    // In a production implementation, this would:
    // 1. Retrieve document from VAULT
    // 2. Convert to .docx if needed
    // 3. Upload to OneDrive
    
    // Mock implementation for demo
    res.json({
      microsoftDocumentId: 'ms_' + Date.now(),
      microsoftDocumentUrl: `https://example.sharepoint.com/sites/example/Shared%20Documents/${name}.docx`,
      vaultDocumentId,
      syncedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error syncing VAULT document:', error);
    res.status(500).json({ error: 'Failed to sync document' });
  }
});

/**
 * Check Microsoft Office licenses
 */
router.get('/check-licenses', async (req, res) => {
  try {
    const accessToken = req.session?.msAuth?.accessToken;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Not authenticated with Microsoft' });
    }
    
    const graphClient = getAuthenticatedClient(accessToken);
    
    // Get assigned licenses
    const response = await graphClient
      .api('/me/licenseDetails')
      .get();
    
    // Check for Microsoft 365 licenses that include Word
    const licenses = response.value || [];
    const hasWordLicense = licenses.some(license => {
      // These are common SKU IDs for Microsoft 365 that include Word
      return [
        '5dbe027f-2339-4123-9542-606e4d348a72', // Office 365 E3
        '06ebc4ee-1bb5-47dd-8120-11324bc54e06', // Microsoft 365 E5
        '73d2bdc7-5997-4e00-8b30-b19c304ed493'  // Microsoft 365 Business Standard
      ].includes(license.skuId);
    });
    
    res.json({ hasWordLicense, licenses });
  } catch (error) {
    console.error('Error checking Microsoft licenses:', error);
    res.status(500).json({ error: 'Failed to check licenses' });
  }
});

module.exports = router;