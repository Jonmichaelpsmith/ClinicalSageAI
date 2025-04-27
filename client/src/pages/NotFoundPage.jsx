/**
 * Not Found Page
 * 
 * This component is displayed when a user navigates to a non-existent route.
 */

import React from 'react';
import { Link } from 'wouter';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <a className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
              Go to Dashboard
            </a>
          </Link>
          
          <Link href="/auth">
            <a className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
              Sign In
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;