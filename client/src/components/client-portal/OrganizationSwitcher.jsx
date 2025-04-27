/**
 * Organization Switcher Component
 * 
 * This component provides a modal interface for switching between organizations.
 * It's used in the client portal to enable CRO users to switch between different client organizations.
 */

import React, { useState, useEffect } from 'react';
import { X, Search, Building, CheckCircle } from 'lucide-react';
import { useIntegration } from '../integration/ModuleIntegrationLayer';

const OrganizationSwitcher = ({ onClose, onSwitchOrg }) => {
  const { securityService } = useIntegration();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentOrgId, setCurrentOrgId] = useState(securityService.currentOrganization?.id);
  
  // Load organizations on mount
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        setLoading(true);
        const orgs = await securityService.getAccessibleOrganizations();
        setOrganizations(orgs || []);
        setLoading(false);
      } catch (error) {
        console.error('Error loading organizations:', error);
        setLoading(false);
      }
    };
    
    loadOrganizations();
  }, [securityService]);
  
  // Filter organizations based on search query
  const filteredOrganizations = organizations.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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
  
  // Handle organization selection
  const handleOrgSelect = (orgId) => {
    setCurrentOrgId(orgId);
    onSwitchOrg(orgId);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Switch Organization</h2>
          <button 
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Search */}
        <div className="px-6 py-4 border-b">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Organization list */}
        <div className="px-6 py-4 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredOrganizations.length > 0 ? (
            <div className="space-y-2">
              {filteredOrganizations.map(org => (
                <div 
                  key={org.id}
                  className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${
                    org.id === currentOrgId 
                      ? 'bg-primary-light text-primary border border-primary' 
                      : 'hover:bg-gray-100 border border-transparent'
                  }`}
                  onClick={() => handleOrgSelect(org.id)}
                >
                  <div className="flex items-center">
                    <Building size={18} className="mr-3 text-gray-500" />
                    <div>
                      <div className="font-medium">{org.name}</div>
                      <div className="text-xs text-gray-500">
                        {getOrgTypeLabel(org.type)} • Role: {org.role.charAt(0).toUpperCase() + org.role.slice(1)}
                      </div>
                    </div>
                  </div>
                  
                  {org.id === currentOrgId && (
                    <CheckCircle size={18} className="text-primary" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No organizations found matching your search.
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end rounded-b-lg">
          <button
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors mr-3"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
            onClick={() => handleOrgSelect(currentOrgId)}
            disabled={!currentOrgId}
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSwitcher;