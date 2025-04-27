/**
 * App Header
 * 
 * This component provides the top navigation header for the TrialSage platform.
 */

import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  HelpCircle, 
  Building,
  ChevronDown,
  Search,
  Menu
} from 'lucide-react';
import securityService from '../../services/SecurityService';

const AppHeader = ({ user, organization, onClientContextToggle }) => {
  const [, setLocation] = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await securityService.logout();
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      return;
    }
    
    // In a real app, would navigate to search results
    console.log(`Searching for: ${searchQuery}`);
    setSearchQuery('');
  };
  
  // Toggle profile dropdown
  const toggleProfile = () => {
    setProfileOpen(prev => !prev);
  };
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };
  
  return (
    <header className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => setLocation('/')}
            >
              <div className="bg-primary rounded-full w-8 h-8 flex items-center justify-center text-white font-bold mr-3">
                TS
              </div>
              <span className="font-bold text-xl">TrialSage</span>
            </div>
            
            {/* Organization context button (for CRO master accounts) */}
            {organization && organization.type === 'cro' && (
              <button 
                onClick={onClientContextToggle}
                className="ml-6 flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                <Building size={16} />
                <span>Manage Clients</span>
              </button>
            )}
          </div>
          
          {/* Desktop: Search, Notifications, and Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search form */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              <Search size={16} className="absolute top-3 left-3 text-gray-400" />
            </form>
            
            {/* Notifications */}
            <button 
              className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none relative"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            
            {/* Profile dropdown */}
            <div className="relative">
              <button 
                onClick={toggleProfile}
                className="flex items-center space-x-2 focus:outline-none"
                aria-expanded={profileOpen}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                  {user?.username?.[0]?.toUpperCase() || <User size={16} />}
                </div>
                <div className="text-sm text-left hidden lg:block">
                  <div className="font-medium">{user?.username || 'User'}</div>
                  <div className="text-xs text-gray-500">{user?.email || ''}</div>
                </div>
                <ChevronDown size={16} className={profileOpen ? 'transform rotate-180' : ''} />
              </button>
              
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                  <div className="py-1">
                    <button 
                      onClick={() => {
                        setProfileOpen(false);
                        setLocation('/profile');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <User size={16} className="mr-2" />
                      Profile
                    </button>
                    <button 
                      onClick={() => {
                        setProfileOpen(false);
                        setLocation('/settings');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Settings size={16} className="mr-2" />
                      Settings
                    </button>
                    <button 
                      onClick={() => {
                        setProfileOpen(false);
                        setLocation('/help');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <HelpCircle size={16} className="mr-2" />
                      Help
                    </button>
                    <hr className="my-1" />
                    <button 
                      onClick={() => {
                        setProfileOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile: Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle mobile menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="px-4 py-3">
            <form onSubmit={handleSearch} className="relative mb-3">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              <Search size={16} className="absolute top-3 left-3 text-gray-400" />
            </form>
            
            <div className="space-y-2">
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  setLocation('/profile');
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center rounded"
              >
                <User size={16} className="mr-2" />
                Profile
              </button>
              
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  setLocation('/settings');
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center rounded"
              >
                <Settings size={16} className="mr-2" />
                Settings
              </button>
              
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  setLocation('/help');
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center rounded"
              >
                <HelpCircle size={16} className="mr-2" />
                Help
              </button>
              
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  setLocation('/notifications');
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center rounded"
              >
                <Bell size={16} className="mr-2" />
                Notifications
              </button>
              
              <hr className="my-2" />
              
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center rounded"
              >
                <LogOut size={16} className="mr-2" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default AppHeader;