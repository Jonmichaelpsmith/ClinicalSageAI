/**
 * App Header Component
 * 
 * This component provides the main application header with user controls,
 * notifications, and global actions.
 */

import React, { useState } from 'react';
import { 
  Bell, 
  User, 
  Search, 
  HelpCircle, 
  LogOut, 
  Settings,
  ChevronDown,
  MessageSquare
} from 'lucide-react';
import { useIntegration } from '../integration/ModuleIntegrationLayer';

const AppHeader = ({ onToggleAIAssistant }) => {
  const { securityService } = useIntegration();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const currentUser = securityService.currentUser;
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await securityService.logout();
      // Would typically redirect to login page
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  // Mock notifications (would come from a real service)
  const notifications = [
    {
      id: 'notif-001',
      title: 'IND Form Update',
      message: 'FDA Form 1571 has been updated to v2.0',
      timestamp: '2024-03-20T15:30:00Z',
      read: false,
      type: 'update'
    },
    {
      id: 'notif-002',
      title: 'Document Verified',
      message: 'Protocol v1.2 has been verified on blockchain',
      timestamp: '2024-03-18T09:45:00Z',
      read: true,
      type: 'security'
    },
    {
      id: 'notif-003',
      title: 'Task Assigned',
      message: 'Michael has assigned you "Prepare CMC Documentation"',
      timestamp: '2024-03-15T11:20:00Z',
      read: true,
      type: 'task'
    }
  ];
  
  // Format notification timestamp
  const formatNotificationTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString(undefined, { weekday: 'long' }) + ', ' + 
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ', ' + 
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };
  
  return (
    <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
      {/* Left section - Logo and search */}
      <div className="flex items-center">
        <div className="text-xl font-bold text-pink-600 mr-8">TrialSage™</div>
        
        <div className="relative hidden md:block w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            placeholder="Search..."
          />
        </div>
      </div>
      
      {/* Right section - User controls */}
      <div className="flex items-center space-x-4">
        {/* AI Assistant */}
        <button 
          className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-full transition-colors"
          onClick={onToggleAIAssistant}
          title="AI Assistant"
        >
          <MessageSquare size={20} />
        </button>
        
        {/* Help */}
        <button 
          className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-full transition-colors"
          title="Help"
        >
          <HelpCircle size={20} />
        </button>
        
        {/* Notifications */}
        <div className="relative">
          <button 
            className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              1
            </span>
          </button>
          
          {/* Notifications dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border overflow-hidden z-10">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h3 className="font-semibold">Notifications</h3>
                <button className="text-sm text-primary hover:underline">
                  Mark all as read
                </button>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className={`font-medium ${!notification.read ? 'text-blue-600' : ''}`}>
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {formatNotificationTime(notification.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-gray-500">
                    No notifications
                  </div>
                )}
              </div>
              
              <div className="px-4 py-2 bg-gray-50 text-center">
                <button className="text-sm text-primary hover:underline">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* User account */}
        <div className="relative">
          <button 
            className="flex items-center space-x-2 hover:bg-gray-100 rounded-full transition-colors p-1"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
              <User size={16} />
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium">
                {currentUser?.firstName} {currentUser?.lastName}
              </div>
              <div className="text-xs text-gray-500">
                {currentUser?.role.charAt(0).toUpperCase() + currentUser?.role.slice(1)}
              </div>
            </div>
            <ChevronDown size={14} className="hidden md:block text-gray-400" />
          </button>
          
          {/* User menu dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border overflow-hidden z-10">
              <div className="border-b px-4 py-3">
                <div className="font-medium">
                  {currentUser?.firstName} {currentUser?.lastName}
                </div>
                <div className="text-sm text-gray-500">
                  {currentUser?.email}
                </div>
              </div>
              
              <div className="py-1">
                <button
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                  onClick={() => {}}
                >
                  <User size={16} className="mr-3 text-gray-500" />
                  My Profile
                </button>
                
                <button
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                  onClick={() => {}}
                >
                  <Settings size={16} className="mr-3 text-gray-500" />
                  Account Settings
                </button>
              </div>
              
              <div className="py-1 border-t">
                <button
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                  onClick={handleLogout}
                >
                  <LogOut size={16} className="mr-3 text-gray-500" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;