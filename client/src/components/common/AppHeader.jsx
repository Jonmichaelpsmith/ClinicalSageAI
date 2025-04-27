/**
 * Application Header Component
 * 
 * This component provides the main application header/navigation bar for TrialSage.
 */

import React, { useState } from 'react';
import { 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  HelpCircle, 
  ChevronDown,
  Search,
  Menu,
  X,
  MessageSquare
} from 'lucide-react';
import { useIntegration } from '../integration/ModuleIntegrationLayer';

const AppHeader = ({ onToggleAIAssistant }) => {
  const { securityService } = useIntegration();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const currentUser = securityService.currentUser;
  
  // Toggle user dropdown menu
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    if (showNotifications) setShowNotifications(false);
  };
  
  // Toggle notifications panel
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showUserMenu) setShowUserMenu(false);
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await securityService.logout();
      // In a production app, redirect to login page
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (currentUser && currentUser.firstName && currentUser.lastName) {
      return `${currentUser.firstName[0]}${currentUser.lastName[0]}`;
    }
    return currentUser?.username?.[0]?.toUpperCase() || 'U';
  };
  
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex justify-between items-center px-4 py-3">
        {/* Logo and brand */}
        <div className="flex items-center">
          <div className="md:hidden mr-2">
            <button 
              className="p-1 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none" 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary">TrialSage™</h1>
            <span className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded ml-2">
              Enterprise
            </span>
          </div>
        </div>
        
        {/* Search bar (hidden on mobile) */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-6">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full bg-gray-100 border-transparent pl-10 pr-3 py-2 rounded-md focus:bg-white focus:border-gray-300 focus:ring-0 text-sm"
              placeholder="Search documents, trials, or regulatory guidance..."
            />
          </div>
        </div>
        
        {/* Header actions */}
        <div className="flex items-center space-x-1 md:space-x-3">
          {/* AI Assistant button */}
          <button 
            className="p-2 md:px-3 md:py-1.5 rounded-md bg-primary-light text-primary hover:bg-primary hover:text-white transition-colors flex items-center"
            onClick={onToggleAIAssistant}
          >
            <MessageSquare size={16} className="md:mr-1.5" />
            <span className="hidden md:inline text-sm">AI Assistant</span>
          </button>
          
          {/* Notifications */}
          <div className="relative">
            <button 
              className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative"
              onClick={toggleNotifications}
            >
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10 border">
                <div className="px-4 py-2 border-b">
                  <h3 className="font-medium">Notifications</h3>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-gray-50 border-b">
                    <div className="flex">
                      <div className="bg-blue-100 text-blue-500 p-2 rounded-full mr-3">
                        <User size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">IND Submission Updated</p>
                        <p className="text-xs text-gray-500">John Smith added a comment to your IND submission.</p>
                        <p className="text-xs text-gray-400 mt-1">10 minutes ago</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-4 py-3 hover:bg-gray-50 border-b">
                    <div className="flex">
                      <div className="bg-green-100 text-green-500 p-2 rounded-full mr-3">
                        <Bell size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">CSR Document Approved</p>
                        <p className="text-xs text-gray-500">Your CSR for XYZ-123 has been approved.</p>
                        <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-4 py-3 hover:bg-gray-50">
                    <div className="flex">
                      <div className="bg-purple-100 text-purple-500 p-2 rounded-full mr-3">
                        <HelpCircle size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">FDA Form Update Needed</p>
                        <p className="text-xs text-gray-500">The FDA Form 1571 requires updates before submission.</p>
                        <p className="text-xs text-gray-400 mt-1">2 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="px-4 py-2 border-t text-center">
                  <button className="text-sm text-primary hover:text-primary-dark">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* User profile */}
          <div className="relative">
            <button 
              className="flex items-center text-gray-700 hover:text-gray-900"
              onClick={toggleUserMenu}
            >
              <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center text-sm font-medium">
                {getUserInitials()}
              </div>
              <ChevronDown size={16} className="ml-1 hidden md:block" />
            </button>
            
            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
                <div className="px-4 py-2 border-b">
                  <p className="font-medium text-sm">{currentUser?.firstName} {currentUser?.lastName}</p>
                  <p className="text-xs text-gray-500">{currentUser?.email}</p>
                </div>
                
                <a href="#profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <User size={16} className="mr-2 text-gray-400" />
                  Your Profile
                </a>
                
                <a href="#settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Settings size={16} className="mr-2 text-gray-400" />
                  Settings
                </a>
                
                <a href="#help" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <HelpCircle size={16} className="mr-2 text-gray-400" />
                  Help Center
                </a>
                
                <div className="border-t my-1"></div>
                
                <button 
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile search bar (visible only on mobile) */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full bg-gray-100 border-transparent pl-10 pr-3 py-2 rounded-md focus:bg-white focus:border-gray-300 focus:ring-0 text-sm"
            placeholder="Search..."
          />
        </div>
      </div>
      
      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-t">
          <nav className="px-2 pt-2 pb-4">
            <a href="#profile" className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
              <User size={16} className="mr-3 text-gray-400" />
              Your Profile
            </a>
            
            <a href="#settings" className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
              <Settings size={16} className="mr-3 text-gray-400" />
              Settings
            </a>
            
            <a href="#help" className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
              <HelpCircle size={16} className="mr-3 text-gray-400" />
              Help Center
            </a>
            
            <div className="border-t my-2"></div>
            
            <button 
              className="flex items-center w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-gray-100"
              onClick={handleLogout}
            >
              <LogOut size={16} className="mr-3" />
              Sign Out
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default AppHeader;