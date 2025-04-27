/**
 * Client Context Bar Component
 * 
 * This component provides a persistent bar showing the current organization context
 * and allows switching between accessible organizations.
 */

import React, { useState } from 'react';
import { Building, ChevronDown, Globe } from 'lucide-react';
import { useIntegration } from '../integration/ModuleIntegrationLayer';
import OrganizationSwitcher from './OrganizationSwitcher';

const ClientContextBar = () => {
  const { securityService } = useIntegration();
  const [showOrgSwitcher, setShowOrgSwitcher] = useState(false);
  
  const currentOrg = securityService.currentOrganization;
  
  // Function to handle organization switching
  const handleSwitchOrg = async (orgId) => {
    if (orgId === currentOrg?.id) {
      setShowOrgSwitcher(false);
      return;
    }
    
    try {
      const result = await securityService.switchOrganization(orgId);
      
      if (result.success) {
        setShowOrgSwitcher(false);
        // In a production app, we might reload certain data based on the new organization context
      } else {
        console.error('Failed to switch organization:', result.error);
      }
    } catch (error) {
      console.error('Error switching organization:', error);
    }
  };
  
  // If we don't have an organization context, don't render the bar
  if (!currentOrg) {
    return null;
  }
  
  // Get organization type icon
  const getOrgIcon = (type) => {
    switch (type) {
      case 'cro':
        return <Globe size={16} className="text-blue-500" />;
      default:
        return <Building size={16} className="text-gray-500" />;
    }
  };
  
  return (
    <>
      <div className="bg-gray-100 px-4 py-2 flex items-center justify-between border-b">
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">Organization:</span>
          
          <button
            className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
            onClick={() => setShowOrgSwitcher(true)}
          >
            <div className="flex items-center mr-1">
              {getOrgIcon(currentOrg.type)}
            </div>
            
            <span className="font-medium text-gray-800">{currentOrg.name}</span>
            
            <ChevronDown size={14} className="text-gray-500 ml-1" />
          </button>
        </div>
        
        <div className="text-xs text-gray-500">
          {currentOrg.type.toUpperCase()} • Role: {currentOrg.role.charAt(0).toUpperCase() + currentOrg.role.slice(1)}
        </div>
      </div>
      
      {showOrgSwitcher && (
        <OrganizationSwitcher
          onClose={() => setShowOrgSwitcher(false)}
          onSwitchOrg={handleSwitchOrg}
        />
      )}
    </>
  );
};

export default ClientContextBar;