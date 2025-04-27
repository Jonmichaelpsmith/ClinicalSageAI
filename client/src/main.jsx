import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ToastProvider } from './hooks/use-toast';
import { DatabaseStatusProvider } from './components/providers/database-status-provider';
import App from './App';
import './index.css';

/**
 * Main entry point for the client application
 * 
 * Sets up React Query, toast notifications, and renders the app
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <DatabaseStatusProvider showAlert={false}>
          <App />
        </DatabaseStatusProvider>
      </ToastProvider>
    </QueryClientProvider>
  </React.StrictMode>
);