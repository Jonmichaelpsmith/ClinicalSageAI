import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Bell, 
  Search, 
  User, 
  Menu, 
  X, 
  ChevronDown,
  LogOut,
  Settings,
  HelpCircle,
  FileText,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AppHeader = () => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Mock notifications data
  const notifications = [
    { id: 1, text: 'CSR review requested by John Smith', time: '1 hour ago', read: false },
    { id: 2, text: 'IND submission deadline approaching', time: '3 hours ago', read: false },
    { id: 3, text: 'New ICH guidance published', time: '1 day ago', read: true },
    { id: 4, text: 'Protocol amendment approved', time: '2 days ago', read: true }
  ];
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Determine active module based on location
  const getActiveModule = () => {
    if (location === '/dashboard') return 'Dashboard';
    if (location.startsWith('/vault')) return 'TrialSage Vault™';
    if (location.startsWith('/csr-intelligence')) return 'CSR Intelligence™';
    if (location.startsWith('/study-architect')) return 'Study Architect™';
    if (location.startsWith('/ind-wizard')) return 'IND Wizard™';
    if (location.startsWith('/compliance')) return 'ICH Wiz™';
    if (location.startsWith('/cmdr')) return 'CMDR';
    if (location.startsWith('/analytics')) return 'Analytics';
    return 'TrialSage™';
  };
  
  return (
    <header className="bg-white border-b border-gray-200 fixed inset-x-0 top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and mobile menu button */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              {/* Mobile menu button */}
              <button 
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 lg:hidden mr-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              {/* Logo */}
              <Link href="/">
                <a className="flex items-center">
                  <span className="text-xl font-bold text-pink-600">TrialSage</span>
                  <span className="text-sm text-gray-600 ml-1 mt-1">™</span>
                </a>
              </Link>
              
              {/* Divider */}
              <div className="mx-4 h-6 border-r border-gray-300 hidden lg:block"></div>
              
              {/* Current module name */}
              <div className="hidden lg:flex items-center">
                <span className="text-lg font-medium text-gray-800">{getActiveModule()}</span>
              </div>
            </div>
          </div>
          
          {/* Search, notifications, and profile */}
          <div className="flex items-center">
            {/* Search button */}
            <button 
              className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search size={20} />
            </button>
            
            {/* Notifications dropdown */}
            <div className="relative ml-3">
              <button 
                className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none relative"
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileOpen(false);
                }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-pink-600 text-white text-xs flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notifications dropdown panel */}
              {notificationsOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100 z-50">
                  <div className="py-3 px-4 flex justify-between items-center">
                    <h2 className="text-sm font-medium text-gray-700">Notifications</h2>
                    {unreadCount > 0 && (
                      <button className="text-xs text-pink-600 hover:text-pink-800">
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-6 px-4 text-center text-gray-500">
                        <p>No notifications</p>
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`py-3 px-4 hover:bg-gray-50 transition-colors ${
                            notification.read ? '' : 'bg-pink-50'
                          }`}
                        >
                          <p className="text-sm text-gray-700">{notification.text}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="py-2 px-4">
                    <Link href="/notifications">
                      <a className="text-sm text-pink-600 hover:text-pink-800 block text-center">
                        View all notifications
                      </a>
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* Profile dropdown */}
            <div className="relative ml-3">
              <button 
                className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none"
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationsOpen(false);
                }}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                    <User size={16} />
                  </div>
                  <ChevronDown size={16} className="ml-1 text-gray-400" />
                </div>
              </button>
              
              {/* Profile dropdown panel */}
              {profileOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="border-b border-gray-100 py-2 px-4">
                    <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                  </div>
                  
                  <Link href="/profile">
                    <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <User size={16} className="mr-2" />
                      Your Profile
                    </a>
                  </Link>
                  
                  <Link href="/settings">
                    <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <Settings size={16} className="mr-2" />
                      Settings
                    </a>
                  </Link>
                  
                  <Link href="/documentation">
                    <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <FileText size={16} className="mr-2" />
                      Documentation
                    </a>
                  </Link>
                  
                  <Link href="/help">
                    <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <HelpCircle size={16} className="mr-2" />
                      Help & Support
                    </a>
                  </Link>
                  
                  {user?.role === 'admin' && (
                    <Link href="/admin/users">
                      <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                        <UserPlus size={16} className="mr-2" />
                        User Management
                      </a>
                    </Link>
                  )}
                  
                  <div className="border-t border-gray-100">
                    <button 
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Search panel */}
      {searchOpen && (
        <div className="absolute inset-0 top-16 bg-white shadow-lg z-40 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Search</h2>
            <button 
              className="p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={() => setSearchOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for studies, documents, CSRs..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
              autoFocus
            />
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Recent Searches</h3>
            <div className="mt-2 space-y-1">
              <button className="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm text-gray-700 w-full text-left">
                Clinical Study Report XYZ-123
              </button>
              <button className="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm text-gray-700 w-full text-left">
                Protocol Amendment
              </button>
              <button className="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm text-gray-700 w-full text-left">
                FDA Form 1572
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/dashboard">
              <a className={`block px-3 py-2 text-base font-medium ${
                location === '/dashboard' 
                  ? 'text-pink-600 bg-pink-50 border-l-4 border-pink-500 pl-2' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}>
                Dashboard
              </a>
            </Link>
            <Link href="/vault">
              <a className={`block px-3 py-2 text-base font-medium ${
                location.startsWith('/vault') 
                  ? 'text-pink-600 bg-pink-50 border-l-4 border-pink-500 pl-2' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}>
                TrialSage Vault™
              </a>
            </Link>
            <Link href="/csr-intelligence">
              <a className={`block px-3 py-2 text-base font-medium ${
                location.startsWith('/csr-intelligence') 
                  ? 'text-pink-600 bg-pink-50 border-l-4 border-pink-500 pl-2' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}>
                CSR Intelligence™
              </a>
            </Link>
            <Link href="/study-architect">
              <a className={`block px-3 py-2 text-base font-medium ${
                location.startsWith('/study-architect') 
                  ? 'text-pink-600 bg-pink-50 border-l-4 border-pink-500 pl-2' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}>
                Study Architect™
              </a>
            </Link>
            <Link href="/ind-wizard">
              <a className={`block px-3 py-2 text-base font-medium ${
                location.startsWith('/ind-wizard') 
                  ? 'text-pink-600 bg-pink-50 border-l-4 border-pink-500 pl-2' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}>
                IND Wizard™
              </a>
            </Link>
            <Link href="/compliance">
              <a className={`block px-3 py-2 text-base font-medium ${
                location.startsWith('/compliance') 
                  ? 'text-pink-600 bg-pink-50 border-l-4 border-pink-500 pl-2' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}>
                ICH Wiz™
              </a>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default AppHeader;