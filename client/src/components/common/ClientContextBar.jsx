import React, { useState } from 'react';
import { ChevronDown, Building2, Users } from 'lucide-react';
import { useModuleIntegration } from '../integration/ModuleIntegrationLayer';

const ClientContextBar = () => {
  const { data, setClientContext } = useModuleIntegration();
  const [showDropdown, setShowDropdown] = useState(false);

  // Mock client list data
  const clients = [
    { id: 'c1', name: 'BioTech Innovations', type: 'Client' },
    { id: 'c2', name: 'PharmaGen Solutions', type: 'Client' },
    { id: 'c3', name: 'Nova Therapeutics', type: 'Client' },
    { id: 'c4', name: 'CelluCure', type: 'Client' },
    { id: 'c5', name: 'MediCore Systems', type: 'Client' },
  ];

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const selectClient = (clientId) => {
    setClientContext(clientId);
    setShowDropdown(false);
  };

  const getCurrentClient = () => {
    if (!data.clientId) return 'All Clients';
    const client = clients.find(c => c.id === data.clientId);
    return client ? client.name : 'All Clients';
  };

  return (
    <div className="client-context-bar flex items-center justify-between">
      <div className="relative flex items-center">
        <Building2 size={18} className="text-gray-600 mr-2" />
        <span className="text-sm font-medium text-gray-800 mr-2">CRO Master Account</span>
        <span className="text-sm text-gray-400 mx-2">→</span>
        
        <div className="relative">
          <button
            className="flex items-center text-sm font-medium text-gray-800 hover:text-gray-900"
            onClick={toggleDropdown}
          >
            <Users size={18} className="text-gray-600 mr-2" />
            <span>{getCurrentClient()}</span>
            <ChevronDown size={16} className="ml-1 text-gray-500" />
          </button>
          
          {showDropdown && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-10">
              <div className="p-2">
                <div className="mb-2 px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase">
                  Biotech Clients
                </div>
                
                <ul>
                  <li 
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer flex items-center"
                    onClick={() => selectClient(null)}
                  >
                    <span className="w-2 h-2 rounded-full bg-gray-400 mr-2"></span>
                    All Clients
                  </li>
                  
                  {clients.map(client => (
                    <li
                      key={client.id}
                      className={`px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer flex items-center ${
                        data.clientId === client.id ? 'text-pink-600 font-medium' : 'text-gray-700'
                      }`}
                      onClick={() => selectClient(client.id)}
                    >
                      <span className={`w-2 h-2 rounded-full mr-2 ${data.clientId === client.id ? 'bg-pink-600' : 'bg-green-500'}`}></span>
                      {client.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center">
        <div className="text-xs text-gray-500">
          <span className="font-medium">Tenant ID:</span> {data.tenantId || 'default'}
        </div>
      </div>
    </div>
  );
};

export default ClientContextBar;