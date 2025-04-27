import React, { useState } from 'react';
import { ChevronDown, Building, Users } from 'lucide-react';

const ClientContextBar = () => {
  const [clientName, setClientName] = useState('Concept2Cures Biotech');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Mock client list for dropdown
  const clients = [
    { id: 1, name: 'Concept2Cures Biotech', type: 'biotech' },
    { id: 2, name: 'BioPharma Solutions', type: 'pharma' },
    { id: 3, name: 'MedTech Innovations', type: 'medtech' },
    { id: 4, name: 'NextGen Therapeutics', type: 'biotech' },
  ];
  
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const selectClient = (client) => {
    setClientName(client.name);
    setIsDropdownOpen(false);
  };

  return (
    <div className="bg-gray-100 border-b border-gray-200">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-2 text-sm font-medium px-3 py-1 rounded-md hover:bg-gray-200"
            >
              <Building size={16} className="text-pink-600" />
              <span>{clientName}</span>
              <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute mt-1 w-60 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <ul className="py-1">
                  {clients.map((client) => (
                    <li key={client.id}>
                      <button
                        onClick={() => selectClient(client)}
                        className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        {client.type === 'biotech' ? (
                          <Building size={16} className="mr-2 text-pink-600" />
                        ) : (
                          <Users size={16} className="mr-2 text-blue-600" />
                        )}
                        {client.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Projects:</span>
            <select className="bg-white border border-gray-300 rounded px-2 py-1 text-xs">
              <option>All Projects</option>
              <option>IND-2023-458</option>
              <option>ICH-Q12-Impl</option>
              <option>CTD Module 2</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientContextBar;