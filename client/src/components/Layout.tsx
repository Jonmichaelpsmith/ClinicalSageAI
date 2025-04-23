import React, { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { LogOut, User, ChevronDown, Settings, Shield, FileText, Database, Home, Menu, X } from 'lucide-react';
import axiosWithToken from '../utils/axiosWithToken';

interface LayoutProps {
  children: ReactNode;
}

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * NavLink component to handle navigation consistently
 * This component ensures proper rendering of navigation links with wouter
 */
const NavLink: React.FC<NavLinkProps> = ({ to, children, className, onClick }) => {
  const [location] = useLocation();
  const isActive = location === to;
  
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    }
  };
  
  return (
    <Link href={to}>
      <div 
        onClick={handleClick} 
        className={className}
      >
        {children}
      </div>
    </Link>
  );
};

/**
 * Main Layout component for the TrialSage application
 * Provides responsive navigation with dropdown menus
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [modulesMenuOpen, setModulesMenuOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const modulesMenuRef = React.useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (modulesMenuRef.current && !modulesMenuRef.current.contains(event.target as Node)) {
        setModulesMenuOpen(false);
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
  
  // Handle navigation to avoid React warnings and close menus
  const closeMenus = () => {
    setModulesMenuOpen(false);
    setMobileMenuOpen(false);
  };
  
  // Keep this for backward compatibility with existing code
  const handleNavigate = closeMenus;

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
              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none"
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
              
              {/* Desktop navigation */}
              <div className="hidden md:flex items-center space-x-4">
                {/* Modules dropdown */}
                <div className="relative" ref={modulesMenuRef}>
                  <button
                    onClick={() => setModulesMenuOpen(!modulesMenuOpen)}
                    className="flex items-center space-x-1 text-sm font-medium text-slate-300 hover:text-white transition duration-150 px-3 py-2"
                  >
                    <span>Modules</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 ${modulesMenuOpen ? 'transform rotate-180' : ''}`} />
                  </button>
                  
                  {modulesMenuOpen && (
                    <div className="absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-slate-800 ring-1 ring-slate-700 ring-opacity-5 z-50">
                      <div className="py-1">
                        <NavLink 
                          to="/ind-wizard" 
                          onClick={closeMenus}
                          className={`flex items-center px-4 py-2 text-sm cursor-pointer ${location === '/ind-wizard' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          IND Wizard
                        </NavLink>
                        
                        <NavLink 
                          to="/csr-library" 
                          onClick={closeMenus}
                          className={`flex items-center px-4 py-2 text-sm cursor-pointer ${location === '/csr-library' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          CSR Deep Intelligence
                        </NavLink>
                        
                        <NavLink 
                          to="/protocol-optimization" 
                          onClick={closeMenus}
                          className={`flex items-center px-4 py-2 text-sm cursor-pointer ${location === '/protocol-optimization' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Protocol Optimization & Design
                        </NavLink>
                        
                        <NavLink 
                          to="/study-design" 
                          onClick={closeMenus}
                          className={`flex items-center px-4 py-2 text-sm cursor-pointer ${location === '/study-design' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Study Design Genie
                        </NavLink>
                        
                        <NavLink 
                          to="/cer-generator" 
                          onClick={closeMenus}
                          className={`flex items-center px-4 py-2 text-sm cursor-pointer ${location === '/cer-generator' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          CER Generator
                        </NavLink>
                        
                        <NavLink 
                          to="/cmc-module" 
                          onClick={closeMenus}
                          className={`flex items-center px-4 py-2 text-sm cursor-pointer ${location === '/cmc-module' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          CMC Insights
                        </NavLink>
                        
                        <NavLink 
                          to="/document-vault" 
                          onClick={closeMenus}
                          className={`flex items-center px-4 py-2 text-sm cursor-pointer ${location === '/document-vault' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                        >
                          <Database className="mr-2 h-4 w-4" />
                          TrialSage DM Vault
                        </NavLink>
                        
                        <NavLink 
                          to="/ai-cmc-blueprint" 
                          onClick={closeMenus}
                          className={`flex items-center px-4 py-2 text-sm cursor-pointer ${location === '/ai-cmc-blueprint' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          AI-CMC Blueprint
                        </NavLink>
                        
                        <div className="border-t border-slate-600 my-1"></div>
                        
                        <NavLink 
                          to="/versions" 
                          onClick={closeMenus}
                          className={`flex items-center px-4 py-2 text-sm cursor-pointer ${location === '/versions' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Document Versions
                        </NavLink>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Quick access nav links */}
                <NavLink 
                  to="/ind-wizard"
                  onClick={closeMenus}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium cursor-pointer ${
                    location === '/ind-wizard' ? 'text-white border-b-2 border-blue-400' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  IND
                </NavLink>
                
                <NavLink 
                  to="/csr-library"
                  onClick={closeMenus}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium cursor-pointer ${
                    location === '/csr-library' ? 'text-white border-b-2 border-blue-400' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  CSR
                </NavLink>
                
                <NavLink 
                  to="/cer-generator"
                  onClick={closeMenus}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium cursor-pointer ${
                    location === '/cer-generator' ? 'text-white border-b-2 border-blue-400' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  CER
                </NavLink>
                
                <NavLink 
                  to="/cmc-module"
                  onClick={closeMenus}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium cursor-pointer ${
                    location === '/cmc-module' ? 'text-white border-b-2 border-blue-400' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  CMC
                </NavLink>

                <NavLink 
                  to="/document-vault"
                  onClick={closeMenus}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium cursor-pointer ${
                    location === '/document-vault' ? 'text-white border-b-2 border-blue-400' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  DM Vault
                </NavLink>
              </div>
              
              <NavLink 
                to="/ask-lumen"
                onClick={closeMenus}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-4 py-2 text-sm font-medium cursor-pointer flex items-center"
              >
                Ask Lumen
              </NavLink>
              
              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
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

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="bg-slate-800 py-2 space-y-1">
            <NavLink 
              to="/ind-wizard"
              onClick={closeMenus}
              className={`block px-4 py-2 text-sm cursor-pointer ${location === '/ind-wizard' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
            >
              IND Wizard
            </NavLink>
            
            <NavLink 
              to="/csr-library"
              onClick={closeMenus}
              className={`block px-4 py-2 text-sm cursor-pointer ${location === '/csr-library' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
            >
              CSR Deep Intelligence
            </NavLink>
            
            <NavLink 
              to="/protocol-optimization"
              onClick={closeMenus}
              className={`block px-4 py-2 text-sm cursor-pointer ${location === '/protocol-optimization' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
            >
              Protocol Optimization & Design
            </NavLink>
            
            <NavLink 
              to="/study-design"
              onClick={closeMenus}
              className={`block px-4 py-2 text-sm cursor-pointer ${location === '/study-design' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
            >
              Study Design Genie
            </NavLink>
            
            <NavLink 
              to="/cer-generator"
              onClick={closeMenus}
              className={`block px-4 py-2 text-sm cursor-pointer ${location === '/cer-generator' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
            >
              CER Generator
            </NavLink>
            
            <NavLink 
              to="/cmc-module"
              onClick={closeMenus}
              className={`block px-4 py-2 text-sm cursor-pointer ${location === '/cmc-module' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
            >
              CMC Insights
            </NavLink>
            
            <NavLink 
              to="/document-vault"
              onClick={closeMenus}
              className={`block px-4 py-2 text-sm cursor-pointer ${location === '/document-vault' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
            >
              TrialSage DM Vault
            </NavLink>
            
            <NavLink 
              to="/ai-cmc-blueprint"
              onClick={closeMenus}
              className={`block px-4 py-2 text-sm cursor-pointer ${location === '/ai-cmc-blueprint' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
            >
              AI-CMC Blueprint
            </NavLink>
            
            <div className="border-t border-slate-600 pt-1"></div>
            
            <NavLink 
              to="/versions"
              onClick={closeMenus}
              className={`block px-4 py-2 text-sm cursor-pointer ${location === '/versions' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
            >
              Document Versions
            </NavLink>
            
            <NavLink 
              to="/ask-lumen"
              onClick={closeMenus}
              className="block px-4 py-2 text-sm text-indigo-400 hover:text-indigo-300 hover:bg-slate-700 cursor-pointer"
            >
              Ask Lumen
            </NavLink>
          </div>
        </div>
      )}

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