/**
 * App Sidebar Component
 * 
 * This component provides the main sidebar navigation for the TrialSage platform.
 * It displays all available modules and allows navigation between them.
 */

import React from 'react';
import { 
  FileText, 
  Database, 
  Layout, 
  BarChart2, 
  Settings, 
  ChevronRight
} from 'lucide-react';

const AppSidebar = ({ modules, activeModule, onModuleChange }) => {
  // Get icon for module
  const getModuleIcon = (moduleId, active = false) => {
    const iconProps = {
      size: 20,
      className: active ? 'text-primary' : 'text-gray-500'
    };
    
    switch (moduleId) {
      case 'ind-wizard':
        return <FileText {...iconProps} />;
      case 'trial-vault':
        return <Database {...iconProps} />;
      case 'csr-intelligence':
        return <FileText {...iconProps} />;
      case 'study-architect':
        return <Layout {...iconProps} />;
      case 'analytics':
        return <BarChart2 {...iconProps} />;
      case 'admin':
        return <Settings {...iconProps} />;
      default:
        return <FileText {...iconProps} />;
    }
  };
  
  return (
    <aside className="w-64 bg-white border-r flex-shrink-0 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-4 border-b flex items-center justify-center">
        <div className="text-2xl font-bold text-pink-600">
          TrialSage™
        </div>
      </div>
      
      {/* Navigation menu */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {modules.map((module) => (
          <button
            key={module.id}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-md transition-colors ${
              activeModule === module.id
                ? 'bg-primary-light text-primary hover:bg-primary-light'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => onModuleChange(module.id)}
          >
            <div className="flex items-center">
              {getModuleIcon(module.id, activeModule === module.id)}
              <span className="ml-3 font-medium">{module.name}</span>
            </div>
            
            <ChevronRight 
              size={16} 
              className={activeModule === module.id ? 'text-primary' : 'text-gray-400'} 
            />
          </button>
        ))}
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          <div>TrialSage™ Platform</div>
          <div className="mt-1">Version 1.0.0</div>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;