/**
 * Client Context Bar
 * 
 * This component provides a context bar for CRO users to switch between biotech client contexts
 * in a multi-tenant environment.
 */

import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Building, Users, Check, Search } from 'lucide-react';
import securityService from '../../services/SecurityService';

const ClientContextBar = ({ organization, onClose }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  
  // Load child organizations on mount
  useEffect(() => {
    const loadClients = async () => {
      try {
        if (!organization) {
          setLoading(false);
          return;
        }
        
        const childOrgs = await securityService.getChildOrganizations();
        setClients(childOrgs);
        setLoading(false);
      } catch (error) {
        console.error('Error loading client organizations:', error);
        setLoading(false);
      }
    };
    
    loadClients();
  }, [organization]);
  
  // Handle client switch
  const handleClientSwitch = async (clientOrg) => {
    try {
      await securityService.switchOrganization(clientOrg.id);
      window.location.reload(); // In a real app, would use more elegant approach
    } catch (error) {
      console.error(`Error switching to client ${clientOrg.id}:`, error);
    }
  };
  
  // Filter clients based on search query
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (!organization) {
    return null;
  }
  
  // If this organization has no child organizations, don't show the bar
  if (clients.length === 0 && !loading) {
    return null;
  }
  
  return (
    <div className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building className="text-primary" size={20} />
            <span className="font-medium">
              {organization.name}
            </span>
            {organization.type === 'cro' && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                CRO
              </span>
            )}
          </div>
          
          <div className="flex items-center">
            {loading ? (
              <div className="text-sm text-gray-500">Loading clients...</div>
            ) : clients.length > 0 ? (
              <div className="relative">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center space-x-1 text-sm bg-gray-50 hover:bg-gray-100 py-1 px-3 rounded border"
                >
                  <Users size={16} />
                  <span>{clients.length} Client{clients.length !== 1 ? 's' : ''}</span>
                  <ChevronDown size={16} className={expanded ? 'transform rotate-180' : ''} />
                </button>
                
                {expanded && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border rounded-lg shadow-lg z-10">
                    <div className="p-3 border-b">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search clients..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                        <Search size={14} className="absolute top-2.5 left-2.5 text-gray-400" />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {filteredClients.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No clients found
                        </div>
                      ) : (
                        filteredClients.map(client => (
                          <button
                            key={client.id}
                            onClick={() => handleClientSwitch(client)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between"
                          >
                            <div>
                              <div className="font-medium">{client.name}</div>
                              <div className="text-xs text-gray-500">
                                {client.type === 'biotech' ? 'Biotech Client' : client.type}
                              </div>
                            </div>
                            {client.id === organization.id && (
                              <Check size={16} className="text-primary" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
            
            <button
              onClick={onClose}
              className="ml-4 p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close client context bar"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientContextBar;