import React from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const [_, navigate] = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-lg flex flex-col items-center text-center">
        <h1 className="text-9xl font-bold tracking-tight text-pink-600">404</h1>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
          Page Not Found
        </h2>
        <p className="mt-6 text-base leading-7 text-gray-600">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 rounded-md bg-pink-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-pink-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600"
          >
            <ArrowLeft size={16} />
            Go back home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;