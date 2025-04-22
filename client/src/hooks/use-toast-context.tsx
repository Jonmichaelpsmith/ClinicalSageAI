// Toast notification system using SecureToast

import React, { createContext, useContext, ReactNode } from 'react';
import { useToast as useSecureToast } from '../components/security/SecureToast';

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

// Export the WebSocket QC hook with fallbacks
export const useQcWebSocket = () => {
  const toast = useToast();
  const secureToast = useSecureToast();
  const [connectionAttempted, setConnectionAttempted] = React.useState(false);

  React.useEffect(() => {
    // Only attempt once - if it fails, we'll just operate without WebSockets
    if (connectionAttempted) {
      console.log('WebSocket connection already attempted, running in fallback mode');
      return;
    }

    // Mark that we've attempted connection
    setConnectionAttempted(true);

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws/qc`;
      
      console.log('Connecting to QC WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);
      
      // Add connection timeout
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.log('WebSocket connection timeout');
          try {
            ws.close();
          } catch (err) {
            console.error('Error closing timed out WebSocket:', err);
          }
        }
      }, 5000);
      
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
        clearTimeout(connectionTimeout);
        console.log('QC WebSocket connected');
        
        // Test connection with a ping
        try {
          ws.send(JSON.stringify({
            type: 'ping',
            timestamp: new Date().toISOString()
          }));
        } catch (err) {
          console.error('Error sending initial ping:', err);
        }
      };
      
      ws.onerror = (error) => {
        console.error('QC WebSocket error:', error);
        clearTimeout(connectionTimeout);
      };
      
      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log(`QC WebSocket closed with code ${event.code}`);
        
        // If it was an abnormal closure, log details
        if (event.code !== 1000) {
          console.error(`WebSocket closed abnormally with code ${event.code}: ${event.reason || 'No reason'}`);
        }
      };
      
      return () => {
        clearTimeout(connectionTimeout);
        try {
          if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
            ws.close(1000, "Component unmounted");
          }
        } catch (closeError) {
          console.error('Error closing WebSocket during cleanup:', closeError);
        }
      };
    } catch (initError) {
      console.error('Error initializing WebSocket:', initError);
      // Just continue without WebSocket - the app should still work
    }
  }, [toast, secureToast, connectionAttempted]);

  // Create a polling fallback for QC status updates
  React.useEffect(() => {
    // Only use polling if WebSocket failed
    if (!connectionAttempted) return;
    
    console.log('Setting up QC polling fallback mechanism');
    
    // Poll every 15 seconds for QC status updates
    const pollInterval = setInterval(() => {
      fetch('/api/qc/recent-status')
        .then(res => res.json())
        .then(updates => {
          if (Array.isArray(updates) && updates.length > 0) {
            updates.forEach(update => {
              if (update.status === 'passed') {
                secureToast.showToast(`QC passed – Doc #${update.id}`, 'success');
              } else if (update.status === 'failed') {
                secureToast.showToast(`QC failed – Doc #${update.id}`, 'error');
              }
            });
          }
        })
        .catch(err => {
          console.error('Error polling for QC updates:', err);
        });
    }, 15000);
    
    return () => {
      clearInterval(pollInterval);
    };
  }, [connectionAttempted, secureToast]);

  return null; // This hook doesn't return anything, just sets up the communication channel
};