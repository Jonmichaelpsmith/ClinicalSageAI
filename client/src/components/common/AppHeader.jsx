/**
 * App Header Component
 * 
 * This component provides the main application header with navigation,
 * search, user profile, and notifications.
 */

import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Settings,
  User,
  HelpCircle,
  ChevronDown,
  LogOut,
  MessageSquare
} from 'lucide-react';
import { useIntegration } from '../integration/ModuleIntegrationLayer';

const AppHeader = ({ onToggleAIAssistant }) => {
  const { securityService, logout } = useIntegration();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const currentUser = securityService.currentUser;
  
  // Toggle profile menu
  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
    if (showNotifications) {
      setShowNotifications(false);
    }
  };
  
  // Toggle notifications
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showProfileMenu) {
      setShowProfileMenu(false);
    }
  };
  
  // Handle search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Handle search logic
    console.log('Search query:', searchQuery);
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to login will happen via effect in integration layer
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser) return '';
    
    const firstInitial = currentUser.firstName?.[0] || '';
    const lastInitial = currentUser.lastName?.[0] || '';
    
    return (firstInitial + lastInitial).toUpperCase();
  };
  
  // Format user display name
  const getUserDisplayName = () => {
    if (!currentUser) return '';
    
    return `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.username;
  };
  
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and title */}
          <div className="flex items-center flex-shrink-0">
            <div className="font-bold text-2xl text-primary">TrialSage™</div>
          </div>
          
          {/* Search bar */}
          <div className="flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full bg-gray-100 border-transparent pl-10 pr-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                  placeholder="Search documents, trials, or regulatory guidance..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </form>
          </div>
          
          {/* Right navigation */}
          <div className="flex items-center space-x-4">
            {/* AI Assistant Button */}
            <button
              onClick={onToggleAIAssistant}
              className="relative p-2 text-gray-500 hover:text-primary focus:outline-none focus:text-primary"
              aria-label="AI Assistant"
            >
              <MessageSquare className="h-5 w-5" />
            </button>
            
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={toggleNotifications}
                className="relative p-2 text-gray-500 hover:text-primary focus:outline-none focus:text-primary"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500"></span>
              </button>
              
              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="font-medium">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200 hover:bg-gray-50">
                      <p className="text-sm font-medium">Document verification completed</p>
                      <p className="text-xs text-gray-500 mt-1">Protocol XYZ-123-001 has been verified.</p>
                      <p className="text-xs text-gray-400 mt-2">10 minutes ago</p>
                    </div>
                    <div className="p-4 border-b border-gray-200 hover:bg-gray-50">
                      <p className="text-sm font-medium">CSR ready for review</p>
                      <p className="text-xs text-gray-500 mt-1">Study ABC-456 CSR is ready for your review.</p>
                      <p className="text-xs text-gray-400 mt-2">2 hours ago</p>
                    </div>
                    <div className="p-4 hover:bg-gray-50">
                      <p className="text-sm font-medium">Task assigned</p>
                      <p className="text-xs text-gray-500 mt-1">You have been assigned to review the IND application.</p>
                      <p className="text-xs text-gray-400 mt-2">Yesterday</p>
                    </div>
                  </div>
                  <div className="p-3 border-t border-gray-200 text-center">
                    <button className="text-sm text-primary hover:text-primary-dark">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Settings */}
            <button
              className="p-2 text-gray-500 hover:text-primary focus:outline-none focus:text-primary"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
            
            {/* Help */}
            <button
              className="p-2 text-gray-500 hover:text-primary focus:outline-none focus:text-primary"
              aria-label="Help"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
            
            {/* User profile */}
            <div className="relative">
              <button
                onClick={toggleProfileMenu}
                className="flex items-center space-x-2 focus:outline-none"
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                  {getUserInitials()}
                </div>
                <div className="hidden md:flex md:items-center">
                  <span className="text-sm font-medium text-gray-700 mr-1">{getUserDisplayName()}</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </div>
              </button>
              
              {/* Profile dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      Profile
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Settings className="h-4 w-4 mr-2 text-gray-500" />
                      Settings
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2 text-gray-500" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;