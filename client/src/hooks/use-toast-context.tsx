// Simplified toast context that doesn't depend on external components

import React, { createContext, useContext, ReactNode, useState } from 'react';
import { cn } from "@/lib/utils";

// Define our own simple toast system to avoid circular dependencies
export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

// Define the context type
interface ToastContextProps {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

// Create the context with default fallback values
const ToastContext = createContext<ToastContextProps>({
  success: (msg) => console.log(`Toast success: ${msg}`),
  error: (msg) => console.log(`Toast error: ${msg}`),
  info: (msg) => console.log(`Toast info: ${msg}`),
  warning: (msg) => console.log(`Toast warning: ${msg}`),
  toasts: [],
  removeToast: () => {}
});

// Create a provider component
export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Generate a unique id
  const generateId = () => Math.random().toString(36).substring(2, 9);
  
  // Add a toast
  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };
  
  // Remove a toast
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  // Define toast functions
  const success = (message: string) => addToast(message, 'success');
  const error = (message: string) => addToast(message, 'error');
  const info = (message: string) => addToast(message, 'info');
  const warning = (message: string) => addToast(message, 'warning');
  
  return (
    <ToastContext.Provider value={{ 
      success, error, info, warning, toasts, removeToast 
    }}>
      {children}
      
      {/* Simple toast container */}
      {toasts.length > 0 && (
        <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className={cn(
                "px-4 py-2 rounded shadow-md min-w-[200px] max-w-[350px] text-white flex justify-between items-center",
                {
                  'bg-green-600': toast.type === 'success',
                  'bg-red-600': toast.type === 'error',
                  'bg-orange-500': toast.type === 'warning',
                  'bg-blue-600': toast.type === 'info',
                }
              )}
            >
              <span>{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="bg-transparent border-0 ml-2 text-white cursor-pointer text-base"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};

// Create a custom hook to use the toast context
export const useToast = () => {
  return useContext(ToastContext);
};

// Simple WebSocket hook that doesn't use complex dependencies
export const useWebSocketStatus = () => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  
  // Effect for checking WebSocket status without actually breaking anything
  React.useEffect(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      console.log('Checking WebSocket status:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setStatus('connected');
      };
      
      ws.onerror = () => {
        console.log('WebSocket error');
        setStatus('error');
      };
      
      ws.onclose = () => {
        console.log('WebSocket closed');
        setStatus('disconnected');
      };
      
      return () => {
        try {
          ws.close();
        } catch (err) {
          console.error('Error closing WebSocket:', err);
        }
      };
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setStatus('error');
    }
  }, []);
  
  return status;
};