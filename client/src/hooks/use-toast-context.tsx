import React, { createContext, useContext, ReactNode } from 'react';
import { toast, ToastContainer, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  // Define the toast functions
  const success = (message: string, options?: ToastOptions) => {
    toast.success(message, options);
  };

  const error = (message: string, options?: ToastOptions) => {
    toast.error(message, options);
  };

  const info = (message: string, options?: ToastOptions) => {
    toast.info(message, options);
  };

  const warning = (message: string, options?: ToastOptions) => {
    toast.warning(message, options);
  };

  return (
    <ToastContext.Provider value={{ success, error, info, warning }}>
      {children}
      <ToastContainer
        position="bottom-right"
        newestOnTop
        theme="colored"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="rounded shadow-sm"
      />
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

  React.useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/qc`;
    
    console.log('Connecting to QC WebSocket:', wsUrl);
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (evt) => {
      try {
        const m = JSON.parse(evt.data);
        if (m.status === 'passed') {
          toast.success(`QC passed – Doc #${m.id}`);
        } else if (m.status === 'failed') {
          toast.error(`QC failed – Doc #${m.id}`);
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
  }, [toast]);

  return null; // This hook doesn't return anything, just sets up the WebSocket
};