import React, { useState } from 'react';
import { ChevronDown, Building, Users, Settings, Search } from 'lucide-react';

const ClientContextBar = () => {
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  
  // Mock client/organization data
  const clients = [
    { id: 1, name: 'Concept2Cures', isActive: true },
    { id: 2, name: 'BioPharma Solutions', isActive: false },
    { id: 3, name: 'NextGen Therapeutics', isActive: false },
    { id: 4, name: 'Global Research LLC', isActive: false },
    { id: 5, name: 'Pharma Innovations', isActive: false }
  ];
  
  // Mock study data for the active client
  const studies = [
    { id: 1, name: 'Study XYZ-123', phase: 'Phase 2', indication: 'Oncology' },
    { id: 2, name: 'Study ABC-456', phase: 'Phase 3', indication: 'Cardiology' },
    { id: 3, name: 'Study DEF-789', phase: 'Phase 1', indication: 'Neurology' }
  ];
  
  const activeClient = clients.find(client => client.isActive);
  
  return (
    <div className="bg-gray-100 border-b border-gray-200 py-2 px-4 md:px-6 flex items-center justify-between">
      {/* Client selector */}
      <div className="relative">
        <button 
          className="flex items-center text-gray-700 hover:text-gray-900 font-medium"
          onClick={() => setClientDropdownOpen(!clientDropdownOpen)}
        >
          <Building size={18} className="mr-2 text-gray-500" />
          <span className="mr-1">{activeClient?.name || 'Select Client'}</span>
          <ChevronDown size={16} className="text-gray-500" />
        </button>
        
        {/* Client dropdown */}
        {clientDropdownOpen && (
          <div className="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg z-20 border border-gray-200">
            <div className="p-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={14} className="text-gray-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="Search clients..." 
                  className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto py-1">
              {clients.map(client => (
                <button 
                  key={client.id} 
                  className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                    client.isActive 
                      ? 'bg-pink-50 text-pink-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    // In a real app, this would update the active client in state/context
                    setClientDropdownOpen(false);
                  }}
                >
                  <Building size={16} className={`mr-3 ${client.isActive ? 'text-pink-500' : 'text-gray-400'}`} />
                  <span>{client.name}</span>
                </button>
              ))}
            </div>
            
            <div className="border-t border-gray-100 py-2 px-4">
              <button className="flex items-center text-gray-700 hover:text-gray-900 text-sm font-medium">
                <Settings size={14} className="mr-2" />
                <span>Manage Clients</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Studies selector */}
      <div className="hidden lg:flex items-center space-x-4 text-sm">
        <div className="flex items-center text-gray-600">
          <Users size={16} className="mr-1" />
          <span>Active Studies:</span>
        </div>
        
        <select className="border-0 bg-transparent text-gray-700 font-medium focus:outline-none focus:ring-0 pl-1 pr-8 py-0">
          <option value="">All Studies</option>
          {studies.map(study => (
            <option key={study.id} value={study.id}>
              {study.name} ({study.phase})
            </option>
          ))}
        </select>
      </div>
      
      {/* Module context information - would be dynamically populated based on the active module */}
      <div className="hidden xl:block">
        <div className="flex items-center text-xs text-gray-500 space-x-4">
          <div className="flex items-center">
            <span className="font-medium mr-1">Regulatory Region:</span>
            <span>FDA (US)</span>
          </div>
          
          <div className="flex items-center">
            <span className="font-medium mr-1">Framework:</span>
            <span>ICH E6(R2)</span>
          </div>
          
          <div className="flex items-center">
            <span className="font-medium mr-1">Application Type:</span>
            <span>IND</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientContextBar;