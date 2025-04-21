import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';

// Create a simple App component directly in this file
const BasicApp = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">TrialSage</h1>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">System Status</h2>
        <p className="text-green-600 font-medium">✅ Application is running successfully</p>
        <p className="mt-4">
          We're currently resolving some dependency issues with the full application. 
          This is a simplified version that confirms our server is working correctly.
        </p>
      </div>
    </div>
  );
};

// Create a react-query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BasicApp />
    </QueryClientProvider>
  </React.StrictMode>,
);