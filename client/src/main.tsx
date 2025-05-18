import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './lib/queryClient';
import './index.css';
import App from './App';
import ErrorBoundary from './ErrorBoundary';
import { DialogContextProvider } from './contexts/DialogContext';

// Render the app with React 18 createRoot API - using the main App component
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <DialogContextProvider>
          <App />
        </DialogContextProvider>
        {/* Toast notifications will be added back when dependencies are fixed */}
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);