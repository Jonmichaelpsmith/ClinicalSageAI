import React from 'react';
import { Link } from 'wouter';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-pink-50 p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-pink-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Page Not Found</h2>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link href="/" className="px-6 py-3 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;