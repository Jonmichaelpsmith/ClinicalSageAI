import React from 'react';
import { Link, useLocation } from 'wouter';
import { X, LayoutDashboard, Database, FileText, FlaskConical, BarChartBig, Shield, Book, Settings, HelpCircle } from 'lucide-react';

const AppSidebar = ({ isOpen, onClose }) => {
  const [location] = useLocation();

  const navigationItems = [
    { 
      path: '/dashboard', 
      name: 'Dashboard', 
      icon: <LayoutDashboard size={20} /> 
    },
    { 
      path: '/vault', 
      name: 'TrialSage Vault', 
      icon: <Database size={20} /> 
    },
    { 
      path: '/csr-intelligence', 
      name: 'CSR Intelligence', 
      icon: <FileText size={20} /> 
    },
    { 
      path: '/study-architect', 
      name: 'Study Architect', 
      icon: <FlaskConical size={20} /> 
    },
    { 
      path: '/analytics', 
      name: 'Analytics', 
      icon: <BarChartBig size={20} /> 
    },
  ];

  const secondaryNavigationItems = [
    { 
      path: '/security', 
      name: 'Security & Compliance', 
      icon: <Shield size={20} /> 
    },
    { 
      path: '/documentation', 
      name: 'Documentation', 
      icon: <Book size={20} /> 
    },
    { 
      path: '/settings', 
      name: 'Settings', 
      icon: <Settings size={20} /> 
    },
    { 
      path: '/help', 
      name: 'Help & Support', 
      icon: <HelpCircle size={20} /> 
    },
  ];

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative md:translate-x-0`}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-pink-600 rounded flex items-center justify-center text-white font-bold">
              TS
            </div>
            <h1 className="ml-2 text-xl font-bold">TrialSage</h1>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-gray-500 rounded-md hover:text-gray-700 md:hidden focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location === item.path
                      ? 'bg-pink-50 text-pink-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className={`mr-3 ${location === item.path ? 'text-pink-600' : 'text-gray-500'}`}>
                    {item.icon}
                  </span>
                  {item.name}
                </a>
              </Link>
            ))}
          </nav>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Administration
            </h3>
            <nav className="mt-2 space-y-1">
              {secondaryNavigationItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <a
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location === item.path
                        ? 'bg-pink-50 text-pink-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className={`mr-3 ${location === item.path ? 'text-pink-600' : 'text-gray-500'}`}>
                      {item.icon}
                    </span>
                    {item.name}
                  </a>
                </Link>
              ))}
            </nav>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-600 font-medium">AD</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">admin@trialsage.ai</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;