/**
 * App Header
 * 
 * This component provides the header for the TrialSage platform.
 */

import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Menu, Search, User, Bell, LogOut, Settings, ChevronDown } from 'lucide-react';
import securityService from '../../services/SecurityService';

const AppHeader = ({ toggleSidebar }) => {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const currentUser = securityService.currentUser;
  const currentOrganization = securityService.currentOrganization;
  
  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      // In a real implementation, navigate to search results
      console.log(`Searching for: ${searchQuery}`);
      // For now, just clear the search
      setSearchQuery('');
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await securityService.logout();
      setLocation('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  // Toggle profile menu
  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };
  
  return (
    <header className="bg-white border-b sticky top-0 z-20">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left section with menu toggle and logo */}
        <div className="flex items-center">
          <button
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
          
          <div className="ml-4 flex items-center" onClick={() => setLocation('/')} style={{ cursor: 'pointer' }}>
            <span className="text-xl font-bold text-primary">TrialSage</span>
            <span className="text-xs align-top -mt-1">™</span>
          </div>
        </div>
        
        {/* Center section with search */}
        <div className="hidden md:block flex-1 mx-10">
          <form onSubmit={handleSearchSubmit} className="max-w-lg mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                placeholder="Search documents, trials, or regulatory guidance..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>
        
        {/* Right section with user info */}
        <div className="flex items-center space-x-3">
          <button
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none md:hidden"
            onClick={handleSearchSubmit}
            aria-label="Search"
          >
            <Search size={20} />
          </button>
          
          {/* Organization label (visible on larger screens) */}
          {currentOrganization && (
            <div className="hidden md:block">
              <div className="text-xs text-gray-500">Organization</div>
              <div className="text-sm font-medium">{currentOrganization.name}</div>
            </div>
          )}
          
          {/* User profile */}
          <div className="relative">
            <button
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 focus:outline-none"
              onClick={toggleProfileMenu}
            >
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                {currentUser ? 
                  currentUser.firstName.charAt(0) + currentUser.lastName.charAt(0) : 
                  <User size={16} />
                }
              </div>
              <div className="hidden md:block text-left">
                {currentUser && (
                  <>
                    <div className="text-sm font-medium">{currentUser.firstName} {currentUser.lastName}</div>
                    <div className="text-xs text-gray-500">{currentUser.role}</div>
                  </>
                )}
              </div>
              <ChevronDown size={16} className="hidden md:block text-gray-400" />
            </button>
            
            {/* Profile dropdown menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-1 z-50">
                {currentUser && (
                  <div className="px-4 py-2 border-b">
                    <div className="text-sm font-medium">{currentUser.firstName} {currentUser.lastName}</div>
                    <div className="text-xs text-gray-500">{currentUser.email}</div>
                  </div>
                )}
                
                <div className="py-1">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setLocation('/profile');
                    }}
                  >
                    <User size={16} className="mr-2" />
                    Profile
                  </button>
                  
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setLocation('/settings');
                    }}
                  >
                    <Settings size={16} className="mr-2" />
                    Settings
                  </button>
                </div>
                
                <div className="py-1 border-t">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
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
    </header>
  );
};

export default AppHeader;