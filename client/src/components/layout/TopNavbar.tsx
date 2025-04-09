import React from "react";
import { useLocation } from "wouter";
import { Menu, Search, Bell, HelpCircle } from "lucide-react";

interface TopNavbarProps {
  toggleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function TopNavbar({ toggleSidebar, searchQuery, setSearchQuery }: TopNavbarProps) {
  const [location] = useLocation();
  
  const getPageTitle = () => {
    switch (location) {
      case '/':
        return 'Dashboard';
      case '/reports':
        return 'CSR Reports';
      case '/upload':
        return 'Upload CSR';
      case '/analytics':
        return 'Analytics';
      default:
        return 'TrialSage';
    }
  };
  
  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button 
              onClick={toggleSidebar} 
              className="p-2 rounded-md text-slate-500 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Section title based on active tab */}
            <h2 className="text-xl font-semibold text-slate-800 ml-4 lg:ml-0">
              {getPageTitle()}
            </h2>
          </div>
          
          <div className="flex items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search CSRs..." 
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-md text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            
            {/* Notification Bell */}
            <button className="ml-4 p-2 text-slate-500 rounded-full hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary relative">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            
            {/* Help Button */}
            <button className="ml-2 p-2 text-slate-500 rounded-full hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary">
              <HelpCircle className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
