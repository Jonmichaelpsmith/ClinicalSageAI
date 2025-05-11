import React, { useEffect, useState } from 'react';
import { Redirect } from 'wouter';

/**
 * Google Auth Callback Page
 * 
 * This page handles the OAuth callback from Google and processes the
 * authentication data before passing it back to the opener window.
 */
const GoogleAuthCallback = () => {
  const [message, setMessage] = useState('Processing authentication...');
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Extract tokens from URL hash or query params
    const processAuth = async () => {
      try {
        console.log('Processing Google auth callback');
        
        // Check for token in hash (implicit flow)
        if (window.location.hash) {
          console.log('Found token in hash fragment');
          
          const params = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = params.get('access_token');
          
          if (accessToken) {
            console.log('Access token found, fetching user info');
            
            // Get user info with the token
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            
            if (!userInfoResponse.ok) {
              throw new Error(`Failed to fetch user info: ${userInfoResponse.status}`);
            }
            
            const userInfo = await userInfoResponse.json();
            
            const user = {
              id: userInfo.sub,
              name: userInfo.name,
              email: userInfo.email,
              picture: userInfo.picture
            };
            
            console.log('User info retrieved:', user.email);
            setMessage(`Authentication successful! Signed in as ${user.name}`);
            
            // Pass data back to opener
            if (window.opener && !window.opener.closed) {
              window.opener.handleGoogleAuthCallback({
                user,
                access_token: accessToken,
                token_type: params.get('token_type'),
                expires_in: params.get('expires_in')
              });
              
              // Close this window after a short delay
              setTimeout(() => {
                window.close();
              }, 1000);
            } else {
              setMessage('Authentication successful, but unable to communicate with opener window.');
            }
          } else {
            setError('No access token found in the callback URL.');
          }
        } 
        // Check for code in query (authorization code flow)
        else if (window.location.search && window.location.search.includes('code=')) {
          console.log('Authorization code found, sending to opener');
          
          const params = new URLSearchParams(window.location.search.substring(1));
          const code = params.get('code');
          
          if (code) {
            setMessage('Authorization code received, processing...');
            
            // Pass code to opener
            if (window.opener && !window.opener.closed) {
              window.opener.handleGoogleAuthCallback({ 
                code,
                state: params.get('state')
              });
              
              // Close this window after a short delay
              setTimeout(() => {
                window.close();
              }, 1000);
            } else {
              setError('Unable to communicate with opener window.');
            }
          } else {
            setError('No authorization code found in the callback URL.');
          }
        } 
        // Check for errors
        else if (window.location.search && window.location.search.includes('error=')) {
          const params = new URLSearchParams(window.location.search.substring(1));
          const errorMsg = params.get('error');
          const errorDescription = params.get('error_description');
          
          setError(`Authentication error: ${errorMsg}${errorDescription ? ` - ${errorDescription}` : ''}`);
          
          if (window.opener && !window.opener.closed) {
            window.opener.handleGoogleAuthCallback({ 
              error: errorMsg,
              error_description: errorDescription
            });
            
            // Close this window after a short delay to show the error
            setTimeout(() => {
              window.close();
            }, 3000);
          }
        } 
        // No auth data
        else {
          setError('No authentication data found in the URL.');
        }
      } catch (error) {
        console.error('Error processing auth callback:', error);
        setError(`Error processing authentication: ${error.message}`);
        
        // Pass error to opener
        if (window.opener && !window.opener.closed) {
          window.opener.handleGoogleAuthCallback({ 
            error: error.message
          });
          
          // Close this window after a short delay to show the error
          setTimeout(() => {
            window.close();
          }, 3000);
        }
      }
    };
    
    processAuth();
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Google Authentication</h1>
          
          {!error ? (
            <>
              <div className="animate-pulse mx-auto h-16 w-16 text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500 mt-2">This window will close automatically once the process is complete.</p>
            </>
          ) : (
            <>
              <div className="mx-auto h-16 w-16 text-red-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium">{error}</p>
              <p className="text-sm text-gray-500 mt-2">This window will close automatically in a few seconds.</p>
              <button 
                onClick={() => window.close()} 
                className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Close Window
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;