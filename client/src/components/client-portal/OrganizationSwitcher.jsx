/**
 * Organization Switcher
 * 
 * This component provides an interface for CRO users to quickly switch
 * between different client organizations in a multi-tenant environment.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Building, ChevronDown, Search, Check, X, AlertTriangle } from 'lucide-react';
import securityService from '../../services/SecurityService';

const OrganizationSwitcher = ({ onSwitch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [filteredOrgs, setFilteredOrgs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentOrg, setCurrentOrg] = useState(null);
  const dropdownRef = useRef(null);
  
  // Load organizations on mount
  useEffect(() => {
    const loadOrganizations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get current organization
        const current = securityService.currentOrganization;
        setCurrentOrg(current);
        
        // Get child organizations
        const childOrgs = await securityService.getChildOrganizations();
        setOrganizations(childOrgs);
        setFilteredOrgs(childOrgs);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading organizations:', err);
        setError('Failed to load organizations');
        setLoading(false);
      }
    };
    
    loadOrganizations();
  }, []);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Filter organizations based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOrgs(organizations);
      return;
    }
    
    const filtered = organizations.filter(org => 
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredOrgs(filtered);
  }, [searchQuery, organizations]);
  
  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      setSearchQuery('');
      setFilteredOrgs(organizations);
    }
  };
  
  // Handle organization selection
  const handleOrgSelection = async (org) => {
    setLoading(true);
    setError(null);
    
    try {
      // Skip if already on the selected org
      if (org.id === currentOrg?.id) {
        setIsOpen(false);
        return;
      }
      
      // Switch organization
      const result = await securityService.switchOrganization(org.id);
      
      if (result.success) {
        setCurrentOrg(result.organization);
        
        // Call onSwitch callback if provided
        if (onSwitch) {
          onSwitch(result.organization);
        }
        
        // Refresh page to update context
        window.location.reload();
      } else {
        setError(result.error || 'Failed to switch organization');
      }
    } catch (err) {
      console.error('Error switching organization:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };
  
  // No organizations to switch between
  if (organizations.length === 0 && !loading) {
    return null;
  }
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown trigger button */}
      <button
        onClick={toggleDropdown}
        disabled={loading}
        className="flex items-center space-x-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Building size={16} />
        <span className="font-medium">{currentOrg?.name || 'Organization'}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border rounded-lg shadow-lg z-50">
          {/* Search */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search organizations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                autoFocus
              />
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="px-3 py-2 text-sm text-red-600 bg-red-50 border-b flex items-center">
              <AlertTriangle size={14} className="mr-1 flex-shrink-0" />
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-auto"
              >
                <X size={14} className="text-gray-500" />
              </button>
            </div>
          )}
          
          {/* Organization list */}
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="inline-block animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                Loading...
              </div>
            ) : filteredOrgs.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No organizations found
              </div>
            ) : (
              <div className="py-1">
                {filteredOrgs.map(org => (
                  <button
                    key={org.id}
                    onClick={() => handleOrgSelection(org)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-medium">{org.name}</span>
                      <div className="text-xs text-gray-500 capitalize">{org.type}</div>
                    </div>
                    
                    {org.id === currentOrg?.id && (
                      <Check size={16} className="text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {organizations.length > 0 && (
            <div className="px-3 py-2 text-xs text-gray-500 border-t">
              {organizations.length} organization{organizations.length !== 1 ? 's' : ''} available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrganizationSwitcher;