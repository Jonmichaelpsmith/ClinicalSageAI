import React from 'react';
import { X } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

/**
 * Toast component that displays a single notification
 */
const Toast = ({ toast, onDismiss }) => {
  const { id, title, description, variant } = toast;
  
  const variantStyles = {
    default: 'bg-white border-gray-200 text-gray-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    destructive: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };
  
  const baseStyles = 'rounded-lg shadow-md border p-4 flex justify-between items-start transition-all';
  const combinedStyles = `${baseStyles} ${variantStyles[variant] || variantStyles.default}`;
  
  return (
    <div className={combinedStyles} role="alert">
      <div className="flex-1 mr-2">
        {title && <h3 className="font-semibold text-sm">{title}</h3>}
        {description && <div className="text-sm mt-1">{description}</div>}
      </div>
      <button 
        onClick={() => onDismiss(id)} 
        className="text-gray-400 hover:text-gray-600"
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
};

/**
 * Toaster component that manages and displays notifications
 */
export const Toaster = () => {
  const { toasts, dismiss } = useToast();
  
  if (toasts.length === 0) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-auto">
      {toasts.map(toast => (
        <Toast 
          key={toast.id} 
          toast={toast} 
          onDismiss={dismiss} 
        />
      ))}
    </div>
  );
};