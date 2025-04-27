import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  Database, 
  FileText, 
  Layers, 
  Flask, 
  ShieldCheck,
  BookOpenText,
  BarChart3,
  FileQuestion,
  Users
} from 'lucide-react';

const AppSidebar = () => {
  const [location] = useLocation();
  
  const menuItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard 
    },
    { 
      path: '/vault', 
      label: 'Vault', 
      icon: Database,
      tooltip: 'TrialSage Vault™'
    },
    { 
      path: '/csr-intelligence', 
      label: 'CSR Intelligence', 
      icon: FileText,
      tooltip: 'CSR Intelligence™'
    },
    { 
      path: '/study-architect', 
      label: 'Study Architect', 
      icon: Layers,
      tooltip: 'Study Architect™'
    },
    { 
      path: '/ind-wizard', 
      label: 'IND Wizard', 
      icon: Flask,
      tooltip: 'IND Wizard™'
    },
    { 
      path: '/compliance', 
      label: 'ICH Compliance', 
      icon: ShieldCheck,
      tooltip: 'ICH Wiz™' 
    },
    { 
      path: '/cmdr', 
      label: 'Metadata Repository', 
      icon: BookOpenText,
      tooltip: 'Clinical Metadata Repository'
    },
    { 
      path: '/analytics', 
      label: 'Analytics', 
      icon: BarChart3 
    },
  ];
  
  const adminItems = [
    {
      path: '/admin/users',
      label: 'User Management',
      icon: Users
    },
    {
      path: '/admin/help',
      label: 'Help Center',
      icon: FileQuestion
    }
  ];

  const MenuItem = ({ item }) => {
    const isActive = location === item.path || location.startsWith(`${item.path}/`);
    
    return (
      <Link href={item.path}>
        <a 
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
            isActive 
              ? 'text-pink-600 bg-pink-50' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
          title={item.tooltip || item.label}
        >
          <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-pink-500' : 'text-gray-400'}`} />
          <span className="truncate">{item.label}</span>
        </a>
      </Link>
    );
  };

  return (
    <div className="hidden md:flex h-screen bg-white border-r border-gray-200 flex-col w-60 fixed inset-y-0 pt-16">
      <div className="mt-6 flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 space-y-1">
          {menuItems.map((item) => (
            <MenuItem key={item.path} item={item} />
          ))}
        </nav>
        
        {/* Admin section */}
        <div className="px-3 mt-6 mb-3">
          <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Administration
          </h3>
          <div className="mt-2 space-y-1">
            {adminItems.map((item) => (
              <MenuItem key={item.path} item={item} />
            ))}
          </div>
        </div>
      </div>
      
      {/* Environment label - could indicate dev/staging/prod */}
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex-shrink-0 w-full group block">
          <div className="flex items-center">
            <div>
              <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                Environment: <span className="font-bold text-green-600">Production</span>
              </p>
              <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                Version: 2.5.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppSidebar;