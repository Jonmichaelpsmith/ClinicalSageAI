import React from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Bell, Settings } from 'lucide-react';

const AppHeader = () => {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  return (
    <header className="bg-black text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <a className="font-bold text-2xl tracking-tight flex items-center">
              <span className="text-pink-500">Trial</span>
              <span>Sage™</span>
            </a>
          </Link>
          <span className="ml-4 text-sm text-pink-300">AI-Powered Regulatory Platform</span>
        </div>

        {user && (
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-800 relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full"></span>
            </button>
            
            <button className="p-2 rounded-full hover:bg-gray-800">
              <Settings size={20} />
            </button>
            
            <div className="flex items-center border-l border-gray-700 pl-4">
              <div className="flex items-center mr-2">
                <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center text-white">
                  <User size={16} />
                </div>
                <div className="ml-2">
                  <span className="text-sm font-semibold">
                    {user?.name || user?.username || 'User'}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-gray-800"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;