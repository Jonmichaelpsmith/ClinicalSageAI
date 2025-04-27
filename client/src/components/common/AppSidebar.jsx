/**
 * App Sidebar
 * 
 * This component provides the sidebar navigation for the TrialSage platform.
 */

import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Clipboard, 
  FileText, 
  BookOpen, 
  Flask, 
  BarChart2, 
  Settings,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { MODULES } from '../integration/ModuleIntegrationLayer';

const AppSidebar = ({ activeModule }) => {
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  // Module navigation items
  const navigationItems = [
    {
      id: MODULES.IND_WIZARD,
      name: 'IND Wizard',
      icon: <FileText size={collapsed ? 24 : 20} />,
      path: `/${MODULES.IND_WIZARD}`
    },
    {
      id: MODULES.TRIAL_VAULT,
      name: 'Trial Vault',
      icon: <Clipboard size={collapsed ? 24 : 20} />,
      path: `/${MODULES.TRIAL_VAULT}`
    },
    {
      id: MODULES.CSR_INTELLIGENCE,
      name: 'CSR Intelligence',
      icon: <BookOpen size={collapsed ? 24 : 20} />,
      path: `/${MODULES.CSR_INTELLIGENCE}`
    },
    {
      id: MODULES.STUDY_ARCHITECT,
      name: 'Study Architect',
      icon: <Flask size={collapsed ? 24 : 20} />,
      path: `/${MODULES.STUDY_ARCHITECT}`
    },
    {
      id: MODULES.ANALYTICS,
      name: 'Analytics',
      icon: <BarChart2 size={collapsed ? 24 : 20} />,
      path: `/${MODULES.ANALYTICS}`
    },
    {
      id: MODULES.ADMIN,
      name: 'Admin',
      icon: <Settings size={collapsed ? 24 : 20} />,
      path: `/${MODULES.ADMIN}`
    }
  ];
  
  // Toggle sidebar collapse
  const toggleCollapse = () => {
    setCollapsed(prev => !prev);
  };
  
  // Navigate to module
  const navigateToModule = (path) => {
    setLocation(path);
  };
  
  return (
    <aside className={`bg-white border-r transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} flex flex-col h-full`}>
      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {navigationItems.map(item => (
            <li key={item.id}>
              <button
                onClick={() => navigateToModule(item.path)}
                className={`w-full flex items-center py-2 px-3 rounded-lg transition-colors ${
                  activeModule === item.id
                    ? 'bg-primary bg-opacity-10 text-primary font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                {!collapsed && <span className="ml-3">{item.name}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Collapse button */}
      <div className="p-4 border-t">
        <button
          onClick={toggleCollapse}
          className="w-full flex items-center justify-center p-2 text-gray-500 hover:text-gray-900 focus:outline-none"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {!collapsed && <span className="ml-2 text-sm">Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;