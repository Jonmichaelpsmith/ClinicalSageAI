/**
 * Application Sidebar Component
 * 
 * This component provides the main navigation sidebar for the TrialSage platform.
 */

import React from 'react';
import { 
  FileText, 
  Database, 
  BookOpen, 
  FileSymlink, 
  ChartBar, 
  Users, 
  Settings,
  HelpCircle
} from 'lucide-react';

const ModuleIcon = ({ moduleId }) => {
  switch (moduleId) {
    case 'ind-wizard':
      return <FileText className="h-5 w-5" />;
    case 'trial-vault':
      return <Database className="h-5 w-5" />;
    case 'csr-intelligence':
      return <BookOpen className="h-5 w-5" />;
    case 'study-architect':
      return <FileSymlink className="h-5 w-5" />;
    case 'analytics':
      return <ChartBar className="h-5 w-5" />;
    default:
      return <FileText className="h-5 w-5" />;
  }
};

const AppSidebar = ({ modules, activeModule, onModuleChange }) => {
  return (
    <div className="w-64 bg-white border-r hidden md:block overflow-y-auto">
      <div className="flex flex-col h-full">
        {/* Modules section */}
        <div className="p-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Modules
          </h2>
          
          <nav className="space-y-1">
            {modules.map((module) => (
              <button
                key={module.id}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeModule === module.id
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => onModuleChange(module.id)}
                disabled={module.disabled}
              >
                <span className={`mr-3 ${activeModule === module.id ? 'text-white' : 'text-gray-500'}`}>
                  <ModuleIcon moduleId={module.id} />
                </span>
                <span className="flex-1 truncate">{module.name}</span>
              </button>
            ))}
          </nav>
        </div>
        
        {/* Other sections */}
        <div className="p-4 border-t mt-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Administration
          </h2>
          
          <nav className="space-y-1">
            <a 
              href="#users" 
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
            >
              <Users className="h-5 w-5 mr-3 text-gray-500" />
              <span>User Management</span>
            </a>
            
            <a 
              href="#settings" 
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
            >
              <Settings className="h-5 w-5 mr-3 text-gray-500" />
              <span>Settings</span>
            </a>
          </nav>
        </div>
        
        {/* Help section - at the bottom */}
        <div className="mt-auto p-4 border-t">
          <a 
            href="#help" 
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
          >
            <HelpCircle className="h-5 w-5 mr-3 text-gray-500" />
            <span>Help & Support</span>
          </a>
          
          <div className="mt-4 bg-gray-50 rounded-md p-3">
            <p className="text-xs text-gray-600 mb-2">Need assistance?</p>
            <button className="w-full bg-primary text-white text-xs px-3 py-1.5 rounded hover:bg-primary-dark">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppSidebar;