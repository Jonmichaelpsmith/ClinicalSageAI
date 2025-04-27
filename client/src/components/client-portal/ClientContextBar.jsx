/**
 * Client Context Bar
 * 
 * This component displays current client context and allows for organization switching.
 * It's used in the unified platform to indicate which client/organization is currently active.
 */

import React, { useState, useEffect } from 'react';
import { ChevronDown, Building, Users, Clock } from 'lucide-react';
import { useIntegration } from '../integration/ModuleIntegrationLayer';
import OrganizationSwitcher from './OrganizationSwitcher';

const ClientContextBar = () => {
  const { securityService } = useIntegration();
  const [currentOrg, setCurrentOrg] = useState(null);
  const [showOrgSwitcher, setShowOrgSwitcher] = useState(false);
  const [lastActivity, setLastActivity] = useState(new Date());
  
  // Get current organization on mount
  useEffect(() => {
    setCurrentOrg(securityService.currentOrganization);
    
    // Update last activity every minute
    const timer = setInterval(() => {
      setLastActivity(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, [securityService]);
  
  // Format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };
  
  // Get organization type label
  const getOrgTypeLabel = (type) => {
    switch (type) {
      case 'cro':
        return 'CRO';
      case 'biotech':
        return 'Biotech';
      case 'pharma':
        return 'Pharma';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  return (
    <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between text-sm">
      <div className="flex items-center">
        {currentOrg && (
          <>
            <button 
              className="flex items-center space-x-2 hover:bg-gray-700 px-3 py-1 rounded-md"
              onClick={() => setShowOrgSwitcher(true)}
            >
              <Building size={16} />
              <span className="font-medium">{currentOrg.name}</span>
              <span className="bg-gray-600 text-xs px-2 py-0.5 rounded">
                {getOrgTypeLabel(currentOrg.type)}
              </span>
              <ChevronDown size={14} />
            </button>
            
            <div className="mx-4 h-4 border-l border-gray-600"></div>
            
            <div className="flex items-center space-x-2">
              <Users size={16} className="text-gray-400" />
              <span>Viewing as <span className="font-medium">Administrator</span></span>
            </div>
          </>
        )}
      </div>
      
      <div className="flex items-center text-gray-400">
        <Clock size={14} className="mr-1" />
        <span>Last Activity: {formatTimeAgo(lastActivity)}</span>
      </div>
      
      {/* Organization Switcher Modal */}
      {showOrgSwitcher && (
        <OrganizationSwitcher 
          onClose={() => setShowOrgSwitcher(false)}
          onSwitchOrg={(orgId) => {
            securityService.switchOrganization(orgId).then(() => {
              setCurrentOrg(securityService.currentOrganization);
              setShowOrgSwitcher(false);
            });
          }}
        />
      )}
    </div>
  );
};

export default ClientContextBar;