/**
 * App Header Component
 * 
 * This component provides the main navigation header for the TrialSage platform.
 */

import React from 'react';
import { Link } from 'wouter';
import { 
  Bell, 
  Search, 
  MessageSquare, 
  HelpCircle,
  Settings,
  User
} from 'lucide-react';

const AppHeader = ({ onToggleAIAssistant }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <a className="flex items-center">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">
                  TrialSage™
                </span>
              </a>
            </Link>
          </div>
          
          {/* Search */}
          <div className="flex-1 max-w-xl mx-4 lg:mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full bg-gray-50 border border-gray-300 rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:text-gray-900 focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="Search across platform..."
              />
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-gray-500 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 transform -translate-y-1/3 translate-x-1/3"></span>
            </button>
            
            <button 
              className="text-gray-400 hover:text-gray-500"
              onClick={onToggleAIAssistant}
            >
              <MessageSquare className="h-5 w-5" />
            </button>
            
            <button className="text-gray-400 hover:text-gray-500">
              <HelpCircle className="h-5 w-5" />
            </button>
            
            <button className="text-gray-400 hover:text-gray-500">
              <Settings className="h-5 w-5" />
            </button>
            
            <div className="border-l border-gray-200 h-6 mx-1"></div>
            
            <div className="relative">
              <button className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                  <User className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  Administrator
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;