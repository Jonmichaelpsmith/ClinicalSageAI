import React, { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { LogOut, User, ChevronDown, Settings, Shield, FileText, Database, Home } from 'lucide-react';
import axiosWithToken from '../utils/axiosWithToken';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axiosWithToken.post('/api/logout');
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  // Get user info from token
  const getUserInfo = () => {
    const token = localStorage.getItem('token');
    if (!token) return { name: 'User' };
    
    try {
      // Simple decode of JWT payload (not for security, just display)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        name: payload.username || 'User',
      };
    } catch (error) {
      return { name: 'User' };
    }
  };

  const userInfo = getUserInfo();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Toast notifications handled by the app-level toast container */}

      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm border-b border-gray-200 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <a className="flex items-center">
                  <img 
                    className="h-8 w-auto" 
                    src="/logo-blue.svg" 
                    alt="TrialSage" 
                  />
                  <span className="ml-2 text-xl font-bold text-blue-800">TrialSage™</span>
                </a>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex space-x-8">
                <Link href="/">
                  <div className={`inline-flex items-center px-1 pt-1 text-sm font-medium cursor-pointer ${
                    location === '/' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                    <Home className="w-4 h-4 mr-1" />
                    Home
                  </div>
                </Link>
                <Link href="/versions">
                  <div className={`inline-flex items-center px-1 pt-1 text-sm font-medium cursor-pointer ${
                    location === '/versions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                    <FileText className="w-4 h-4 mr-1" />
                    Documents
                  </div>
                </Link>
                <Link href="/cmc-module">
                  <div className={`inline-flex items-center px-1 pt-1 text-sm font-medium cursor-pointer ${
                    location === '/cmc-module' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                    <Database className="w-4 h-4 mr-1" />
                    CMC Module
                  </div>
                </Link>
              </nav>
              
              {/* User Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center text-sm font-medium text-gray-700 rounded-full hover:bg-gray-100 focus:outline-none p-2 transition duration-150 ease-in-out"
                >
                  <span className="hidden md:block mr-1">{userInfo.name}</span>
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800">
                    <User className="h-4 w-4" />
                  </div>
                  <ChevronDown className={`ml-1 h-4 w-4 text-gray-400 ${userMenuOpen ? 'transform rotate-180' : ''}`} />
                </button>
                
                {userMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <div className="block px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                        Signed in as <span className="font-bold">{userInfo.name}</span>
                      </div>
                      
                      <a href="#settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </a>
                      
                      <a href="#security" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Shield className="mr-2 h-4 w-4" />
                        Security
                      </a>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
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

      {/* Page Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer - we can add it later if needed */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} TrialSage™ by C2C.AI. All rights reserved.
            </div>
            <div className="text-sm text-gray-500">
              <span className="inline-flex items-center">
                <Shield className="h-3 w-3 mr-1" />
                21 CFR Part 11 Compliant
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;