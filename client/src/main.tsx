// Apply the preload script first, before any imports
import './preload.js';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
// Use our security components
import { SecurityProvider } from './components/security/SecurityProvider';
import { setupCSP } from './lib/security';

// Completely disable strict mode to prevent double rendering
// const StrictModeEnabled = false;

// Initialize Content Security Policy before rendering
if (typeof document !== 'undefined') {
  setupCSP();
  
  // Disable ALL React DevTools to prevent any HMR/debug tools from causing flashing
  // @ts-ignore
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { isDisabled: true };
  
  // Disable Vite's HMR
  // @ts-ignore
  window.HMR_FORCE_DISABLED = true;
}

// Create a react-query client with aggressive caching to prevent refetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: Infinity, // Never consider data stale
      retry: false, // No retries
      suspense: false, // No suspense
    },
  },
});

// Wait for DOM to be fully loaded before rendering
const renderApp = () => {
  const root = ReactDOM.createRoot(document.getElementById('root')!);
  
  // Render without StrictMode to prevent double-rendering
  root.render(
    <QueryClientProvider client={queryClient}>
      <SecurityProvider>
        <App />
      </SecurityProvider>
    </QueryClientProvider>
  );
  
  // Mark the app as loaded after a short delay to ensure the UI is stable
  setTimeout(() => {
    document.body.classList.add('app-loaded');
  }, 500);
};

// Execute immediately if document is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  renderApp();
} else {
  // Otherwise wait for document to load
  window.addEventListener('DOMContentLoaded', renderApp);
}