/**
 * App Sidebar Component
 * 
 * This component provides the main navigation sidebar for the TrialSage platform,
 * allowing users to switch between different modules.
 */

import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  HomeIcon,
  FileInput, 
  FileText, 
  Database, 
  FileSymlink,
  BarChart3,
  Settings,
  Users,
  Briefcase,
  HelpCircle
} from 'lucide-react';

const AppSidebar = ({ activeModule }) => {
  const [location, setLocation] = useLocation();
  
  // Navigation items configuration
  const navItems = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      path: '/', 
      icon: HomeIcon,
      description: 'Overview and quick access'
    },
    { 
      id: 'ind-wizard', 
      name: 'IND Wizard™', 
      path: '/ind-wizard', 
      icon: FileInput,
      description: 'IND application preparation'
    },
    { 
      id: 'csr-intelligence', 
      name: 'CSR Intelligence™', 
      path: '/csr-intelligence', 
      icon: FileText,
      description: 'Clinical study report automation'
    },
    { 
      id: 'trial-vault', 
      name: 'TrialSage Vault™', 
      path: '/trial-vault', 
      icon: Database,
      description: 'Document management & verification'
    },
    { 
      id: 'study-architect', 
      name: 'Study Architect™', 
      path: '/study-architect', 
      icon: FileSymlink,
      description: 'Protocol development & optimization'
    },
    { 
      id: 'analytics', 
      name: 'Analytics', 
      path: '/analytics', 
      icon: BarChart3,
      description: 'Regulatory insights & reporting'
    }
  ];
  
  // Administrative items
  const adminItems = [
    { 
      id: 'settings', 
      name: 'Settings', 
      path: '/settings', 
      icon: Settings 
    },
    { 
      id: 'users', 
      name: 'Users & Roles', 
      path: '/users', 
      icon: Users 
    },
    { 
      id: 'clients', 
      name: 'Client Management', 
      path: '/clients', 
      icon: Briefcase 
    }
  ];
  
  // Check if a path is active
  const isActive = (path) => {
    if (path === '/') {
      return location === '/';
    }
    return location.startsWith(path);
  };
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-3 space-y-1">
          {/* Main Navigation */}
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.path}
                onClick={() => {}}
              >
                <a
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive(item.path)
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive(item.path)
                        ? 'text-white'
                        : 'text-gray-500 group-hover:text-gray-500'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </a>
              </Link>
            ))}
          </div>
          
          {/* Divider */}
          <div className="my-4 border-t border-gray-200"></div>
          
          {/* Admin Navigation */}
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Administration
            </p>
            {adminItems.map((item) => (
              <Link
                key={item.id}
                href={item.path}
                onClick={() => {}}
              >
                <a
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive(item.path)
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive(item.path)
                        ? 'text-white'
                        : 'text-gray-500 group-hover:text-gray-500'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </a>
              </Link>
            ))}
          </div>
        </nav>
      </div>
      
      {/* Help & Support */}
      <div className="p-4 border-t border-gray-200">
        <Link href="/help">
          <a className="flex items-center text-sm text-gray-700 hover:text-primary">
            <HelpCircle className="h-5 w-5 mr-2 text-gray-500" />
            Help & Support
          </a>
        </Link>
      </div>
    </aside>
  );
};

export default AppSidebar;