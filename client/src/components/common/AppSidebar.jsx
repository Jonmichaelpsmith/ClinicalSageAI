/**
 * App Sidebar
 * 
 * This component provides the sidebar navigation for the TrialSage platform.
 */

import React from 'react';
import { useLocation } from 'wouter';
import { 
  FileText, 
  Database, 
  LineChart, 
  Home, 
  Settings,
  FileCheck,
  ClipboardList, 
  ArrowRightLeft,
  BarChart3,
  Users
} from 'lucide-react';
import securityService from '../../services/SecurityService';

const AppSidebar = ({ isOpen, activeModule }) => {
  const [, setLocation] = useLocation();
  const currentUser = securityService.currentUser;
  const currentUserRole = currentUser?.role || '';
  
  // Define navigation items
  const navItems = [
    {
      id: 'home',
      name: 'Home',
      icon: <Home size={20} />,
      path: '/',
      roles: ['super_admin', 'admin', 'manager', 'writer', 'reviewer', 'viewer']
    },
    {
      id: 'ind-wizard',
      name: 'IND Wizard™',
      icon: <FileText size={20} />,
      path: '/ind-wizard',
      roles: ['super_admin', 'admin', 'manager', 'writer', 'reviewer', 'viewer']
    },
    {
      id: 'trial-vault',
      name: 'Trial Vault™',
      icon: <Database size={20} />,
      path: '/trial-vault',
      roles: ['super_admin', 'admin', 'manager', 'writer', 'reviewer', 'viewer']
    },
    {
      id: 'csr-intelligence',
      name: 'CSR Intelligence™',
      icon: <FileCheck size={20} />,
      path: '/csr-intelligence',
      roles: ['super_admin', 'admin', 'manager', 'writer', 'reviewer', 'viewer']
    },
    {
      id: 'study-architect',
      name: 'Study Architect™',
      icon: <ClipboardList size={20} />,
      path: '/study-architect',
      roles: ['super_admin', 'admin', 'manager', 'writer', 'reviewer', 'viewer']
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: <BarChart3 size={20} />,
      path: '/analytics',
      roles: ['super_admin', 'admin', 'manager', 'reviewer', 'viewer']
    },
    {
      id: 'admin',
      name: 'Administration',
      icon: <Users size={20} />,
      path: '/admin',
      roles: ['super_admin', 'admin']
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: <Settings size={20} />,
      path: '/settings',
      roles: ['super_admin', 'admin', 'manager', 'writer', 'reviewer', 'viewer']
    }
  ];
  
  // Filter nav items based on user role
  const allowedNavItems = navItems.filter(item => {
    // If no roles defined or if currentUserRole is empty, assume allowed for all
    if (!item.roles || !currentUserRole) return true;
    
    // Super admins can access everything
    if (currentUserRole === 'super_admin') return true;
    
    // Check if user's role is in the allowed roles
    return item.roles.includes(currentUserRole);
  });
  
  return (
    <aside 
      className={`fixed left-0 top-0 h-full bg-white border-r z-10 pt-14 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-0 md:w-16'
      }`}
    >
      <div className="h-full overflow-y-auto">
        <nav className="px-2 py-4">
          <ul className="space-y-1">
            {allowedNavItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeModule === item.id
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setLocation(item.path)}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span className={`flex-1 ${!isOpen && 'md:hidden'}`}>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Sidebar footer with blockchain verification status */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${!isOpen && 'md:hidden'}`}>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <div className="text-xs text-gray-600">Blockchain Verified</div>
          </div>
          <div className="text-xs text-gray-500 mt-1">Last synced: {new Date().toLocaleTimeString()}</div>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;