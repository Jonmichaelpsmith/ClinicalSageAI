import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import googleAuthService from '../services/googleAuthService';
import { Loader2 } from 'lucide-react';

/**
 * Component for handling Google OAuth callback
 * This component will extract tokens from the URL hash fragment
 * and store them in the local authentication service.
 */
const GoogleAuthCallback = () => {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing authentication...');
  const [error, setError] = useState(null);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const processAuthentication = async () => {
      try {
        console.log('Processing Google authentication callback');
        
        // Get the full URL including hash fragment
        const callbackUrl = window.location.href;
        console.log('Callback URL:', callbackUrl);
        
        // Let the auth service handle the callback
        const result = await googleAuthService.handleAuthCallback(callbackUrl);
        
        if (result.success) {
          setStatus('success');
          setMessage('Authentication successful!');
          
          // Wait a moment before redirecting
          setTimeout(() => {
            setLocation('/coauthor/editor');
          }, 1500);
        } else {
          setStatus('error');
          setMessage('Authentication failed');
          setError(result.message || 'Unknown error occurred');
          
          // Wait a moment before redirecting to login
          setTimeout(() => {
            setLocation('/coauthor');
          }, 3000);
        }
      } catch (error) {
        console.error('Error handling authentication callback:', error);
        setStatus('error');
        setMessage('Authentication failed');
        setError(error.message || 'Unknown error occurred');
        
        // Wait a moment before redirecting to login
        setTimeout(() => {
          setLocation('/coauthor');
        }, 3000);
      }
    };

    // Process authentication when component mounts
    processAuthentication();
  }, [setLocation]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          {status === 'processing' && (
            <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
          )}
          
          {status === 'success' && (
            <div className="h-12 w-12 rounded-full bg-green-100 mx-auto flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          
          {status === 'error' && (
            <div className="h-12 w-12 rounded-full bg-red-100 mx-auto flex items-center justify-center">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
          
          <h2 className="mt-4 text-xl font-bold text-gray-900">
            {message}
          </h2>
          
          {status === 'processing' && (
            <p className="mt-2 text-sm text-gray-500">
              Please wait while we authenticate your account...
            </p>
          )}
          
          {status === 'success' && (
            <p className="mt-2 text-sm text-gray-500">
              Redirecting you to the editor...
            </p>
          )}
          
          {status === 'error' && (
            <>
              <p className="mt-2 text-sm text-red-500">
                {error}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Redirecting back to login...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;