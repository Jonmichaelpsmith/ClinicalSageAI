/**
 * Organization Switcher
 * 
 * This component provides a dropdown to switch between organizations for CRO users.
 */

import React, { useEffect, useRef } from 'react';
import { Building, ChevronRight, Plus, Users } from 'lucide-react';

export const OrganizationSwitcher = ({ 
  organizations, 
  onSelect, 
  onClose,
  position = 'bottom-end' 
}) => {
  const ref = useRef(null);
  
  // Handle click outside to close the switcher
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // Position class based on the position prop
  const getPositionClass = () => {
    switch (position) {
      case 'bottom-start':
        return 'left-0 top-full mt-1';
      case 'bottom-end':
        return 'right-0 top-full mt-1';
      case 'top-start':
        return 'left-0 bottom-full mb-1';
      case 'top-end':
        return 'right-0 bottom-full mb-1';
      default:
        return 'left-0 top-full mt-1';
    }
  };
  
  // Get organization type icon
  const getOrganizationTypeIcon = (type) => {
    switch (type) {
      case 'biotech':
        return <Building size={16} className="text-green-500" />;
      case 'pharma':
        return <Building size={16} className="text-blue-500" />;
      case 'medical_device':
        return <Building size={16} className="text-purple-500" />;
      case 'academic':
        return <Building size={16} className="text-yellow-500" />;
      default:
        return <Building size={16} className="text-gray-500" />;
    }
  };
  
  return (
    <div 
      ref={ref}
      className={`absolute z-10 w-64 bg-white rounded-lg shadow-lg border py-1 ${getPositionClass()}`}
    >
      <div className="px-4 py-2 border-b">
        <h3 className="text-sm font-semibold text-gray-700">Select Client Organization</h3>
      </div>
      
      <div className="max-h-60 overflow-y-auto">
        {organizations.length === 0 ? (
          <div className="px-4 py-2 text-sm text-gray-500 text-center">
            No client organizations available
          </div>
        ) : (
          <div className="py-1">
            {organizations.map((org) => (
              <button
                key={org.id}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                onClick={() => onSelect(org)}
              >
                <span className="mr-2 flex-shrink-0">
                  {getOrganizationTypeIcon(org.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{org.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{org.type}</div>
                </div>
                <ChevronRight size={14} className="text-gray-400 ml-2" />
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="border-t py-1">
        <button
          className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-gray-100 flex items-center"
          onClick={() => {
            // In a real app, navigate to organization creation
            onClose();
          }}
        >
          <Plus size={16} className="mr-2" />
          Add New Client
        </button>
        
        <button
          className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-gray-100 flex items-center"
          onClick={() => {
            // In a real app, navigate to organization management
            onClose();
          }}
        >
          <Users size={16} className="mr-2" />
          Manage Clients
        </button>
      </div>
    </div>
  );
};