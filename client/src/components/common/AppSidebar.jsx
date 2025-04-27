import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, 
  FileText, 
  Database, 
  Layers, 
  Flask, 
  BookOpenText, 
  BarChart3,
  ShieldCheck,
  Settings,
  HelpCircle
} from 'lucide-react';

const AppSidebar = () => {
  const [location] = useLocation();

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: Home, 
      path: '/dashboard',
      active: location === '/dashboard' 
    },
    { 
      id: 'vault', 
      label: 'TrialSage Vault', 
      icon: Database, 
      path: '/vault',
      active: location === '/vault' 
    },
    { 
      id: 'csr', 
      label: 'CSR Intelligence', 
      icon: FileText, 
      path: '/csr-intelligence',
      active: location === '/csr-intelligence' 
    },
    { 
      id: 'architect', 
      label: 'Study Architect', 
      icon: Layers, 
      path: '/study-architect',
      active: location === '/study-architect' 
    },
    { 
      id: 'ind', 
      label: 'IND Wizard', 
      icon: Flask, 
      path: '/ind-wizard',
      active: location === '/ind-wizard' 
    },
    { 
      id: 'compliance', 
      label: 'ICH Wiz', 
      icon: ShieldCheck, 
      path: '/compliance',
      active: location === '/compliance' 
    },
    { 
      id: 'cmdr', 
      label: 'Metadata Repository', 
      icon: BookOpenText, 
      path: '/cmdr',
      active: location === '/cmdr' 
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: BarChart3, 
      path: '/analytics',
      active: location === '/analytics' 
    },
  ];

  return (
    <div className="bg-white border-r border-gray-200 w-64 flex-shrink-0 h-full">
      <div className="py-4">
        <div className="px-4 mb-6">
          <div className="text-xs uppercase text-gray-500 font-semibold tracking-wider">
            Core Modules
          </div>
        </div>

        <nav className="space-y-1 px-2">
          {menuItems.map((item) => (
            <Link key={item.id} href={item.path}>
              <a 
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md group hover:bg-gray-100 ${
                  item.active ? 'bg-pink-50 text-pink-700' : 'text-gray-700'
                }`}
              >
                <item.icon 
                  size={18} 
                  className={`mr-3 flex-shrink-0 ${
                    item.active ? 'text-pink-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} 
                />
                {item.label}
              </a>
            </Link>
          ))}
        </nav>
        
        <div className="px-4 mt-8 mb-2">
          <div className="text-xs uppercase text-gray-500 font-semibold tracking-wider">
            System
          </div>
        </div>
        
        <nav className="space-y-1 px-2">
          <Link href="/settings">
            <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 group">
              <Settings size={18} className="mr-3 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
              Settings
            </a>
          </Link>
          <Link href="/help">
            <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 group">
              <HelpCircle size={18} className="mr-3 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
              Help & Support
            </a>
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default AppSidebar;