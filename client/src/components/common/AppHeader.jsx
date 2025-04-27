import React from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, Bell, Settings, Search, User } from 'lucide-react';
import { useModuleIntegration } from '../integration/ModuleIntegrationLayer';

const AppHeader = ({ toggleSidebar }) => {
  const [location] = useLocation();
  const { data, blockchainStatus } = useModuleIntegration();

  const getPageTitle = () => {
    switch (location) {
      case '/':
        return 'TrialSage Platform';
      case '/dashboard':
        return 'Dashboard';
      case '/vault':
        return 'TrialSage Vault';
      case '/csr-intelligence':
        return 'CSR Intelligence';
      case '/study-architect':
        return 'Study Architect';
      default:
        return 'TrialSage';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              <Menu size={24} />
            </button>
            
            <div className="ml-4 flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
              
              {blockchainStatus.enabled && (
                <div className="ml-4 blockchain-badge">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                  Blockchain Verified
                </div>
              )}
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="block w-56 pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 block w-2 h-2 rounded-full bg-red-500"></span>
            </button>
            
            <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none">
              <Settings size={20} />
            </button>
            
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-2">{data.userRole}</span>
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User size={16} className="text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;