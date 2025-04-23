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
      <header className="bg-slate-800 text-white border-b border-slate-700 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <div className="flex items-center cursor-pointer">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-1.5 mr-2">
                    <div className="w-6 h-6 flex items-center justify-center text-white font-bold text-sm">C2C</div>
                  </div>
                  <div>
                    <span className="text-xl font-semibold text-white">TrialSage</span>
                    <span className="text-blue-400">™</span>
                    <span className="ml-1 text-sm text-slate-400">by C2C.AI</span>
                  </div>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex space-x-4">
                <Link href="/ind-wizard">
                  <div className={`inline-flex items-center px-3 py-2 text-sm font-medium cursor-pointer ${
                    location === '/ind-wizard' ? 'text-white border-b-2 border-blue-400' : 'text-slate-300 hover:text-white'
                  }`}>
                    IND Wizard
                  </div>
                </Link>
                <Link href="/csr-library">
                  <div className={`inline-flex items-center px-3 py-2 text-sm font-medium cursor-pointer ${
                    location === '/csr-library' ? 'text-white border-b-2 border-blue-400' : 'text-slate-300 hover:text-white'
                  }`}>
                    CSR Library
                  </div>
                </Link>
                <Link href="/cer-generator">
                  <div className={`inline-flex items-center px-3 py-2 text-sm font-medium cursor-pointer ${
                    location === '/cer-generator' ? 'text-white border-b-2 border-blue-400' : 'text-slate-300 hover:text-white'
                  }`}>
                    CER Generator
                  </div>
                </Link>
                <Link href="/cmc-module">
                  <div className={`inline-flex items-center px-3 py-2 text-sm font-medium cursor-pointer ${
                    location === '/cmc-module' ? 'text-white border-b-2 border-blue-400' : 'text-slate-300 hover:text-white'
                  }`}>
                    CMC Module
                  </div>
                </Link>
                <Link href="/versions">
                  <div className={`inline-flex items-center px-3 py-2 text-sm font-medium cursor-pointer ${
                    location === '/versions' ? 'text-white border-b-2 border-blue-400' : 'text-slate-300 hover:text-white'
                  }`}>
                    Versions
                  </div>
                </Link>
              </nav>
              
              <Link href="/ask-lumen">
                <div className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-4 py-2 text-sm font-medium cursor-pointer flex items-center">
                  Ask Lumen
                </div>
              </Link>
              
              {/* User Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center text-sm font-medium text-white rounded-full hover:bg-slate-700 focus:outline-none p-2 transition duration-150 ease-in-out"
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-700 text-white">
                    <User className="h-4 w-4" />
                  </div>
                  <ChevronDown className={`ml-1 h-4 w-4 text-slate-400 ${userMenuOpen ? 'transform rotate-180' : ''}`} />
                </button>
                
                {userMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-slate-800 ring-1 ring-slate-700 ring-opacity-5 z-50">
                    <div className="py-1">
                      <div className="block px-4 py-2 text-sm text-slate-300 border-b border-slate-700">
                        Signed in as <span className="font-bold text-white">{userInfo.name}</span>
                      </div>
                      
                      <a href="#settings" className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </a>
                      
                      <a href="#security" className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white">
                        <Shield className="mr-2 h-4 w-4" />
                        Security
                      </a>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300"
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

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-400">
              © {new Date().getFullYear()} TrialSage™ by C2C.AI. All rights reserved.
            </div>
            <div className="text-sm text-slate-400">
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