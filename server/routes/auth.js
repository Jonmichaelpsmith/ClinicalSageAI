/**
 * Authentication Routes for TrialSage
 * 
 * This module handles authentication-related routes, including Google OAuth callbacks.
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const qs = require('querystring');

// Handle Google OAuth callback
router.get('/google/callback', (req, res) => {
  // This route is for server-side OAuth flow
  // In our current implementation, we're using the client-side OAuth flow
  // that directly processes the token in the browser
  
  // Render an HTML page that will close the popup and pass data back to the opener
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Authentication Successful</title>
      <script>
        // The token is in the hash fragment
        window.onload = function() {
          // Check if we have auth data in the URL (implicit flow response)
          if (window.location.hash) {
            // Pass the token back to the opener window
            if (window.opener && !window.opener.closed) {
              window.opener.handleGoogleAuthCallback({ 
                fragment: window.location.hash.substr(1)
              });
            }
          } 
          // Check if we have an authorization code (authorization code flow)
          else if (window.location.search && window.location.search.includes('code=')) {
            // Pass the code back to the opener window
            if (window.opener && !window.opener.closed) {
              window.opener.handleGoogleAuthCallback({ 
                search: window.location.search.substr(1)
              });
            }
          }
          // Close this popup window
          window.close();
        };
      </script>
    </head>
    <body>
      <h2>Authentication Successful</h2>
      <p>This window will close automatically.</p>
    </body>
    </html>
  `);
});

// Exchange authorization code for tokens (server-side flow)
router.post('/google/token', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }
    
    // Exchange the authorization code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', qs.stringify({
      code,
      client_id: process.env.VITE_GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${req.protocol}://${req.get('host')}/auth/google/callback`,
      grant_type: 'authorization_code'
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Get user info with the access token
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenResponse.data.access_token}`
      }
    });
    
    // Return tokens and user info
    res.json({
      tokens: tokenResponse.data,
      user: {
        id: userInfoResponse.data.sub,
        name: userInfoResponse.data.name,
        email: userInfoResponse.data.email,
        picture: userInfoResponse.data.picture
      }
    });
  } catch (error) {
    console.error('Error exchanging token:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to exchange authorization code for tokens',
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;