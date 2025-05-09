import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Very simple app component with no dependencies
const SimpleApp = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">TrialSage Platform</h1>
      <p className="mb-4">
        This is a simplified version of the application while we resolve component issues.
      </p>
      <div className="p-4 border rounded bg-gray-100">
        <h2 className="text-xl font-semibold mb-2">Application Status</h2>
        <p>Backend API server: Running</p>
        <p>Frontend application: Basic rendering</p>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SimpleApp />
  </React.StrictMode>
);