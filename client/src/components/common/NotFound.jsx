import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="text-6xl text-gray-200 font-bold">404</div>
      <h1 className="mt-4 text-2xl font-semibold text-gray-800">Page Not Found</h1>
      <p className="mt-2 text-gray-600">The page you are looking for doesn't exist or has been moved.</p>
      
      <Link href="/">
        <a className="mt-8 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </a>
      </Link>
    </div>
  );
};

export default NotFound;