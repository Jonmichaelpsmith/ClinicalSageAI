import React, { useState, useEffect, useCallback, useContext } from 'react';

// Create toast context
const ToastContext = React.createContext();

// Custom hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Simple toast styles added inline to avoid CSS dependency
const toastStyles = {
  container: {
    position: 'fixed',
    top: '1rem',
    right: '1rem',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    maxWidth: '100%',
    width: '320px',
  },
  toast: {
    padding: '1rem',
    borderRadius: '0.375rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    animation: 'slideIn 0.3s ease-out forwards',
    color: 'white',
    fontWeight: 500
  },
  info: {
    backgroundColor: '#3b82f6',
  },
  success: {
    backgroundColor: '#10b981',
  },
  error: {
    backgroundColor: '#ef4444',
  },
  warning: {
    backgroundColor: '#f59e0b',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1rem',
    marginLeft: '0.5rem'
  }
};

// Toast Provider component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Function to add a toast
  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    if (duration !== Infinity) {
      setTimeout(() => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
      }, duration);
    }
    
    return id;
  }, []);

  // Function to remove a toast
  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Helper functions for different toast types
  const success = useCallback((message, options) => 
    showToast(message, 'success', options?.duration), [showToast]);
  
  const error = useCallback((message, options) => 
    showToast(message, 'error', options?.duration), [showToast]);
  
  const info = useCallback((message, options) => 
    showToast(message, 'info', options?.duration), [showToast]);
  
  const warning = useCallback((message, options) => 
    showToast(message, 'warning', options?.duration), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast, success, error, info, warning }}>
      {children}
      <div style={toastStyles.container}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              ...toastStyles.toast,
              ...toastStyles[toast.type]
            }}
          >
            <span>{toast.message}</span>
            <button 
              style={toastStyles.closeButton}
              onClick={() => removeToast(toast.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;