/**
 * Client Context Bar
 * 
 * This component provides a context bar for CRO users to select and manage client organizations.
 */

import React, { useState, useEffect } from 'react';
import { ChevronDown, Building } from 'lucide-react';
import securityService from '../../services/SecurityService';
import { OrganizationSwitcher } from './OrganizationSwitcher';

export const ClientContextBar = () => {
  const [organizations, setOrganizations] = useState([]);
  const [currentOrganization, setCurrentOrganization] = useState(null);
  const [showSwitcher, setShowSwitcher] = useState(false);
  
  // Get current organization and accessible organizations
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        // Get current organization
        setCurrentOrganization(securityService.currentOrganization);
        
        // Get accessible organizations
        const accessibleOrgs = await securityService.getAccessibleOrganizations();
        setOrganizations(accessibleOrgs);
      } catch (error) {
        console.error('Error loading organizations:', error);
      }
    };
    
    loadOrganizations();
  }, []);
  
  // Handle organization switch
  const handleOrganizationSwitch = async (organization) => {
    try {
      const result = await securityService.switchOrganization(organization.id);
      
      if (result.success) {
        setCurrentOrganization(result.organization);
        setShowSwitcher(false);
      }
    } catch (error) {
      console.error('Error switching organization:', error);
    }
  };
  
  // Toggle organization switcher
  const toggleSwitcher = () => {
    setShowSwitcher(!showSwitcher);
  };
  
  // If current user is not from CRO, don't render
  if (currentOrganization?.type !== 'cro') {
    return null;
  }
  
  return (
    <div className="bg-gray-100 border-b">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building size={16} className="text-gray-500" />
            <span className="text-sm text-gray-700">Client Context:</span>
            
            <div className="relative">
              <button
                className="flex items-center space-x-1 px-2 py-1 text-sm rounded hover:bg-gray-200"
                onClick={toggleSwitcher}
              >
                <span className="font-medium">{currentOrganization?.name || 'Select Client'}</span>
                <ChevronDown size={14} />
              </button>
              
              {showSwitcher && (
                <OrganizationSwitcher
                  organizations={organizations.filter(org => org.id !== currentOrganization?.id)}
                  onSelect={handleOrganizationSwitch}
                  onClose={() => setShowSwitcher(false)}
                  position="bottom-start"
                />
              )}
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            Managing <span className="font-medium">{organizations.length - 1}</span> client organizations
          </div>
        </div>
      </div>
    </div>
  );
};