import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import axios from 'axios';

const ClientPortalLanding = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Log that the ClientPortalLanding component has mounted
    console.log('ClientPortalLanding component mounted');
    
    // Initialize the client portal
    const initializePortal = async () => {
      try {
        setLoading(true);
        // Any initialization logic can go here
        setLoading(false);
      } catch (err) {
        console.error('Error initializing portal:', err);
        setError('Failed to load client portal');
        setLoading(false);
      }
    };

    initializePortal();
    
    // Update console log for tracking
    console.log('All module access links updated to point to /client-portal');
  }, []);

  // This component will render the portal interface
  // The actual content is being loaded via the server's client-portal route
  // which serves the HTML directly
  
  return (
    <div className="min-h-screen">
      {loading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPortalLanding;