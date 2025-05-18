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
            // Parse the hash fragment
            const params = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = params.get('access_token');
            
            if (accessToken) {
              console.log("Access token received in callback");
              
              // Get user info with the token
              fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
              })
              .then(response => response.json())
              .then(userInfo => {
                // Prepare user data
                const userData = {
                  id: userInfo.sub,
                  name: userInfo.name,
                  email: userInfo.email,
                  picture: userInfo.picture
                };
                
                // Pass the token and user info back to the opener window
                if (window.opener && !window.opener.closed) {
                  window.opener.handleGoogleAuthCallback({
                    user: userData,
                    access_token: accessToken,
                    token_type: params.get('token_type'),
                    expires_in: params.get('expires_in')
                  });
                }
                
                // Close this popup window
                window.close();
              })
              .catch(error => {
                console.error("Error fetching user info:", error);
                if (window.opener && !window.opener.closed) {
                  window.opener.handleGoogleAuthCallback({ 
                    error: "Failed to fetch user info"
                  });
                }
                window.close();
              });
            } else {
              // No access token in the hash, just pass the fragment
              if (window.opener && !window.opener.closed) {
                window.opener.handleGoogleAuthCallback({ 
                  fragment: window.location.hash.substr(1)
                });
              }
              window.close();
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
            window.close();
          } else {
            // No auth data found
            if (window.opener && !window.opener.closed) {
              window.opener.handleGoogleAuthCallback({ 
                error: "No authentication data received"
              });
            }
            window.close();
          }
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