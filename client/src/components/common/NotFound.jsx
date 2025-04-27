import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-pink-600 mb-6">404</h1>
        <h2 className="text-2xl font-semibold mb-3">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <a className="hot-pink-btn flex items-center justify-center gap-2">
              <Home size={18} />
              Go to home
            </a>
          </Link>
          <button 
            onClick={() => window.history.back()} 
            className="flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft size={18} />
            Go back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;