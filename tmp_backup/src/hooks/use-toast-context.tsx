// Toast notification system using SecureToast

import React, { createContext, useContext, ReactNode } from 'react';
import { useToast as useSecureToast } from '../../client/src/components/security/SecureToast';

// Define options type
interface ToastOptions {
  autoClose?: number;
  closeButton?: boolean;
}

// Define the context type
interface ToastContextProps {
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
}

// Create the context
const ToastContext = createContext<ToastContextProps | undefined>(undefined);

// Create a provider component
export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const secureToast = useSecureToast();
  
  // Define the toast functions
  const success = (message: string, options?: ToastOptions) => {
    secureToast.showToast(message, 'success');
  };

  const error = (message: string, options?: ToastOptions) => {
    secureToast.showToast(message, 'error');
  };

  const info = (message: string, options?: ToastOptions) => {
    secureToast.showToast(message, 'info');
  };

  const warning = (message: string, options?: ToastOptions) => {
    secureToast.showToast(message, 'warning');
  };

  return (
    <ToastContext.Provider value={{ success, error, info, warning }}>
      {children}
    </ToastContext.Provider>
  );
};

// Create a custom hook to use the toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Export the WebSocket QC hook
export const useQcWebSocket = () => {
  const toast = useToast();
  const secureToast = useSecureToast();

  React.useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/qc`;
    
    console.log('Connecting to QC WebSocket:', wsUrl);
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (evt) => {
      try {
        const m = JSON.parse(evt.data);
        if (m.status === 'passed') {
          secureToast.showToast(`QC passed – Doc #${m.id}`, 'success');
        } else if (m.status === 'failed') {
          secureToast.showToast(`QC failed – Doc #${m.id}`, 'error');
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };
    
    ws.onopen = () => {
      console.log('QC WebSocket connected');
    };
    
    ws.onerror = (error) => {
      console.error('QC WebSocket error:', error);
    };
    
    return () => {
      ws.close();
    };
  }, [toast, secureToast]);

  return null; // This hook doesn't return anything, just sets up the WebSocket
};