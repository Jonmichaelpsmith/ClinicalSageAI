/**
 * Not Found Page
 * 
 * This page is displayed when a user navigates to a non-existent route.
 */

import React from 'react';
import { Link } from 'wouter';
import { Home, AlertTriangle } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 mb-6">
          <AlertTriangle size={40} className="text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-lg text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <a className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-primary rounded-md shadow-sm hover:bg-primary-dark">
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </a>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;