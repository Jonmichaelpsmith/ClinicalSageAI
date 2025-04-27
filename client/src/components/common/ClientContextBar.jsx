/**
 * Client Context Bar Component
 * 
 * This component provides context for the current client and organization
 * across the platform, allowing quick switching between organizations.
 */

import React, { useState } from 'react';
import { ChevronDown, Building } from 'lucide-react';
import { useIntegration } from '../integration/ModuleIntegrationLayer';

const ClientContextBar = () => {
  const { securityService } = useIntegration();
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  
  // Sample organizations (in a real app, would come from the API)
  const organizations = [
    { id: 'org-001', name: 'Acme Pharmaceuticals', role: 'Administrator' },
    { id: 'org-002', name: 'Biotech Solutions', role: 'Editor' },
    { id: 'org-003', name: 'ClinMed CRO', role: 'Viewer' }
  ];
  
  // Get the current organization
  const currentOrg = organizations[0];
  
  // Toggle organization dropdown
  const toggleOrgDropdown = () => {
    setShowOrgDropdown(!showOrgDropdown);
  };
  
  // Close dropdown when clicking outside
  const handleClickOutside = (e) => {
    if (!e.target.closest('#org-selector')) {
      setShowOrgDropdown(false);
    }
  };
  
  // Add click outside listener
  React.useEffect(() => {
    if (showOrgDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOrgDropdown]);
  
  // Handle organization selection
  const selectOrganization = (org) => {
    // In a real app, this would update the current organization in context
    console.log('Selected organization:', org);
    setShowOrgDropdown(false);
  };
  
  return (
    <div className="bg-gray-100 border-b border-gray-200 py-2 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="relative" id="org-selector">
          <button
            onClick={toggleOrgDropdown}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
          >
            <Building className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-sm">{currentOrg.name}</span>
            <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showOrgDropdown ? 'transform rotate-180' : ''}`} />
          </button>
          
          {/* Organization dropdown */}
          {showOrgDropdown && (
            <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-40">
              <div className="p-3 border-b border-gray-100">
                <h3 className="font-medium text-sm text-gray-700">Switch Organization</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => selectOrganization(org)}
                    className={`w-full text-left px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 ${
                      org.id === currentOrg.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                      {org.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-900">{org.name}</div>
                      <div className="text-xs text-gray-500">Role: {org.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-xs text-gray-500">Status: <span className="text-green-600 font-medium">Connected</span></span>
          <span className="text-xs text-gray-500">Version: 2.5.1</span>
        </div>
      </div>
    </div>
  );
};

export default ClientContextBar;