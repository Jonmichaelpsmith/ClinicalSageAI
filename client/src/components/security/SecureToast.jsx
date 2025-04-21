/**
 * SecureToast Component
 * 
 * A security-enhanced toast notification system that doesn't rely on external dependencies.
 * Features:
 * - XSS protection with input sanitization
 * - Content security validation
 * - Audit logging for security-related notifications
 */

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info, Shield } from 'lucide-react';
import { sanitizeInput } from '../../lib/security';

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  SECURITY: 'security'
};

// Toast context
const SecureToastContext = createContext({
  toast: () => {},
  securityToast: () => {},
  clearAll: () => {}
});

/**
 * Toast data structure
 * @typedef {Object} Toast
 * @property {string} id - Unique ID
 * @property {string} message - Toast message
 * @property {string} type - Toast type ('success', 'error', 'info', 'security')
 * @property {number} duration - Duration in ms
 * @property {Object} [metadata] - Optional security metadata
 */

/**
 * SecureToastProvider Component
 * Provides toast functionality with enhanced security
 */
export function SecureToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Clean up expired toasts
  useEffect(() => {
    if (toasts.length === 0) return;
    
    const timers = toasts.map(toast => {
      return setTimeout(() => {
        setToasts(current => current.filter(t => t.id !== toast.id));
      }, toast.duration);
    });
    
    return () => timers.forEach(timer => clearTimeout(timer));
  }, [toasts]);
  
  /**
   * Add a new toast with security enhancements
   * @param {Object} options - Toast options
   * @param {string} options.message - Toast message
   * @param {string} [options.type='info'] - Toast type
   * @param {number} [options.duration=5000] - Duration in ms
   * @param {Object} [options.metadata] - Security metadata
   */
  const addToast = useCallback((options) => {
    // Handle string input
    if (typeof options === 'string') {
      options = { message: options, type: TOAST_TYPES.SUCCESS };
    }
    
    // Sanitize input to prevent XSS
    const sanitizedMessage = sanitizeInput(options.message);
    
    // Create toast with security enhancements
    const toast = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message: sanitizedMessage,
      type: options.type || TOAST_TYPES.INFO,
      duration: options.duration || 5000,
      metadata: options.metadata || null
    };
    
    // Log security-related toasts for audit trail
    if (toast.type === TOAST_TYPES.SECURITY || toast.metadata?.logSeverity) {
      console.info(
        `Security notification [${new Date().toISOString()}]: ` +
        `${toast.message} | Severity: ${toast.metadata?.logSeverity || 'medium'}`
      );
    }
    
    setToasts(current => [...current, toast]);
  }, []);
  
  /**
   * Security-specific toast with enhanced logging
   * @param {string} message - Toast message
   * @param {string} severity - Severity level ('low', 'medium', 'high', 'critical')
   * @param {number} [duration=8000] - Duration in ms
   */
  const securityToast = useCallback((message, severity = 'medium', duration = 8000) => {
    addToast({
      message,
      type: TOAST_TYPES.SECURITY,
      duration,
      metadata: {
        logSeverity: severity,
        timestamp: new Date().toISOString()
      }
    });
  }, [addToast]);
  
  // Clear all toasts
  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <SecureToastContext.Provider value={{ toast: addToast, securityToast, clearAll }}>
      {children}
      
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <SecureToastItem 
            key={toast.id} 
            toast={toast} 
            onClose={() => setToasts(current => current.filter(t => t.id !== toast.id))}
          />
        ))}
      </div>
    </SecureToastContext.Provider>
  );
}

/**
 * Individual Toast Item Component
 */
function SecureToastItem({ toast, onClose }) {
  // Determine icon based on type
  let Icon;
  let bgColor;
  
  switch(toast.type) {
    case TOAST_TYPES.SUCCESS:
      Icon = CheckCircle;
      bgColor = 'bg-green-600';
      break;
    case TOAST_TYPES.ERROR:
      Icon = AlertTriangle;
      bgColor = 'bg-red-600';
      break;
    case TOAST_TYPES.SECURITY:
      Icon = Shield;
      bgColor = 'bg-purple-700';
      break;
    default:
      Icon = Info;
      bgColor = 'bg-blue-600';
  }
  
  return (
    <div className={`${bgColor} text-white rounded-md shadow-lg py-3 px-4 min-w-[300px] max-w-sm animate-slideIn`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          <Icon size={18} />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{toast.message}</p>
          {toast.metadata?.logSeverity === 'critical' && (
            <p className="mt-1 text-xs font-bold">
              Critical Security Alert
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="ml-4 flex-shrink-0 inline-flex text-white focus:outline-none focus:ring-2 focus:ring-white"
        >
          <span className="sr-only">Close</span>
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Custom hook to use the toast context
export function useSecureToast() {
  const context = useContext(SecureToastContext);
  if (!context) {
    throw new Error('useSecureToast must be used within a SecureToastProvider');
  }
  return context;
}

export default SecureToastProvider;