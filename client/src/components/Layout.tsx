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
      {/* Single Apple-style navigation bar with backdrop blur */}
      <header className="bg-slate-900/95 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800/80">
        <div className="mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo and brand */}
            <div className="flex items-center">
              <Link href="/">
                <div className="flex items-center cursor-pointer">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-md p-1 mr-2">
                    <div className="w-5 h-5 flex items-center justify-center text-white font-bold text-xs">C2C</div>
                  </div>
                  <div>
                    <span className="text-base font-medium text-white">TrialSage</span>
                    <span className="text-blue-400">™</span>
                    <span className="ml-1 text-xs text-slate-400">by C2C.AI</span>
                  </div>
                </div>
              </Link>
            </div>
            
            {/* Center navigation - Apple style */}
            <nav className="hidden md:flex items-center space-x-8">
              {/* Primary navigation */}
              <div className="relative" ref={modulesMenuRef}>
                <button
                  onClick={() => setModulesMenuOpen(!modulesMenuOpen)}
                  className="flex items-center space-x-1 text-xs font-medium text-slate-300 hover:text-white transition-colors px-3 py-1"
                >
                  <span>Modules</span>
                  <ChevronDown className={`h-3 w-3 text-slate-400 ${modulesMenuOpen ? 'transform rotate-180' : ''}`} />
                </button>
                
                {modulesMenuOpen && (
                  <div className="absolute left-0 mt-1 w-56 rounded-lg overflow-hidden shadow-lg bg-slate-800/95 backdrop-blur-sm z-50 border border-slate-700/50">
                    <div className="py-1">
                      <NavLink 
                        to="/ind-wizard" 
                        onClick={closeMenus}
                        className={`flex items-center px-4 py-1.5 text-xs cursor-pointer ${location === '/ind-wizard' ? 'bg-slate-700/50 text-white' : 'text-slate-300 hover:bg-slate-700/30 hover:text-white'}`}
                      >
                        <FileText className="mr-2 h-3 w-3" />
                        IND Wizard
                      </NavLink>
                      
                      <NavLink 
                        to="/csr-library" 
                        onClick={closeMenus}
                        className={`flex items-center px-4 py-1.5 text-xs cursor-pointer ${location === '/csr-library' ? 'bg-slate-700/50 text-white' : 'text-slate-300 hover:bg-slate-700/30 hover:text-white'}`}
                      >
                        <FileText className="mr-2 h-3 w-3" />
                        CSR Deep Intelligence
                      </NavLink>
                      
                      <NavLink 
                        to="/protocol-optimization" 
                        onClick={closeMenus}
                        className={`flex items-center px-4 py-1.5 text-xs cursor-pointer ${location === '/protocol-optimization' ? 'bg-slate-700/50 text-white' : 'text-slate-300 hover:bg-slate-700/30 hover:text-white'}`}
                      >
                        <FileText className="mr-2 h-3 w-3" />
                        Protocol Optimization
                      </NavLink>
                      
                      <NavLink 
                        to="/study-design" 
                        onClick={closeMenus}
                        className={`flex items-center px-4 py-1.5 text-xs cursor-pointer ${location === '/study-design' ? 'bg-slate-700/50 text-white' : 'text-slate-300 hover:bg-slate-700/30 hover:text-white'}`}
                      >
                        <FileText className="mr-2 h-3 w-3" />
                        Study Design Genie
                      </NavLink>
                      
                      <NavLink 
                        to="/cer-generator" 
                        onClick={closeMenus}
                        className={`flex items-center px-4 py-1.5 text-xs cursor-pointer ${location === '/cer-generator' ? 'bg-slate-700/50 text-white' : 'text-slate-300 hover:bg-slate-700/30 hover:text-white'}`}
                      >
                        <FileText className="mr-2 h-3 w-3" />
                        CER Generator
                      </NavLink>
                      
                      <NavLink 
                        to="/cmc-module" 
                        onClick={closeMenus}
                        className={`flex items-center px-4 py-1.5 text-xs cursor-pointer ${location === '/cmc-module' ? 'bg-slate-700/50 text-white' : 'text-slate-300 hover:bg-slate-700/30 hover:text-white'}`}
                      >
                        <FileText className="mr-2 h-3 w-3" />
                        CMC Insights
                      </NavLink>
                      
                      <NavLink 
                        to="/document-vault" 
                        onClick={closeMenus}
                        className={`flex items-center px-4 py-1.5 text-xs cursor-pointer ${location === '/document-vault' ? 'bg-slate-700/50 text-white' : 'text-slate-300 hover:bg-slate-700/30 hover:text-white'}`}
                      >
                        <Database className="mr-2 h-3 w-3" />
                        TrialSage DM Vault
                      </NavLink>
                      
                      <NavLink 
                        to="/ai-cmc-blueprint" 
                        onClick={closeMenus}
                        className={`flex items-center px-4 py-1.5 text-xs cursor-pointer ${location === '/ai-cmc-blueprint' ? 'bg-slate-700/50 text-white' : 'text-slate-300 hover:bg-slate-700/30 hover:text-white'}`}
                      >
                        <FileText className="mr-2 h-3 w-3" />
                        AI-CMC Blueprint
                      </NavLink>
                      
                      <div className="border-t border-slate-700/50 my-1"></div>
                      
                      <NavLink 
                        to="/versions" 
                        onClick={closeMenus}
                        className={`flex items-center px-4 py-1.5 text-xs cursor-pointer ${location === '/versions' ? 'bg-slate-700/50 text-white' : 'text-slate-300 hover:bg-slate-700/30 hover:text-white'}`}
                      >
                        <FileText className="mr-2 h-3 w-3" />
                        Document Versions
                      </NavLink>
                    </div>
                  </div>
                )}
              </div>
              
              <NavLink 
                to="/ind-wizard"
                onClick={closeMenus}
                className={`px-2 py-1 text-xs font-medium cursor-pointer transition-colors ${
                  location === '/ind-wizard' ? 'text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                IND
              </NavLink>
              
              <NavLink 
                to="/csr-library"
                onClick={closeMenus}
                className={`px-2 py-1 text-xs font-medium cursor-pointer transition-colors ${
                  location === '/csr-library' ? 'text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                CSR
              </NavLink>
              
              <NavLink 
                to="/cer-generator"
                onClick={closeMenus}
                className={`px-2 py-1 text-xs font-medium cursor-pointer transition-colors ${
                  location === '/cer-generator' ? 'text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                CER
              </NavLink>
              
              <NavLink 
                to="/cmc-module"
                onClick={closeMenus}
                className={`px-2 py-1 text-xs font-medium cursor-pointer transition-colors ${
                  location === '/cmc-module' ? 'text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                CMC
              </NavLink>

              <NavLink 
                to="/document-vault"
                onClick={closeMenus}
                className={`px-2 py-1 text-xs font-medium cursor-pointer transition-colors ${
                  location === '/document-vault' ? 'text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                DM Vault
              </NavLink>

              <NavLink 
                to="/versions"
                onClick={closeMenus}
                className={`px-2 py-1 text-xs font-medium cursor-pointer transition-colors ${
                  location === '/versions' ? 'text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Vault View
              </NavLink>
            </nav>
            
            {/* Right side items */}
            <div className="flex items-center space-x-3">
              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-1 text-slate-300 hover:text-white"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
              
              <NavLink 
                to="/ask-lumen"
                onClick={closeMenus}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-3 py-1 text-xs font-medium transition-colors"
              >
                Ask Lumen
              </NavLink>
              
              {/* User Menu - minimal style */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center text-white hover:bg-slate-800 rounded-full p-1"
                >
                  <User className="h-4 w-4" />
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 rounded-lg overflow-hidden shadow-lg bg-slate-800/95 backdrop-blur-sm z-50 border border-slate-700/50">
                    <div className="py-1">
                      <div className="block px-4 py-2 text-xs text-slate-300 border-b border-slate-700/50">
                        Signed in as <span className="font-bold text-white">{userInfo.name}</span>
                      </div>
                      
                      <a href="#settings" className="flex items-center px-4 py-2 text-xs text-slate-300 hover:bg-slate-700/50 hover:text-white">
                        <Settings className="mr-2 h-3 w-3" />
                        Settings
                      </a>
                      
                      <a href="#security" className="flex items-center px-4 py-2 text-xs text-slate-300 hover:bg-slate-700/50 hover:text-white">
                        <Shield className="mr-2 h-3 w-3" />
                        Security
                      </a>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center px-4 py-2 text-xs text-red-400 hover:bg-slate-700/50"
                      >
                        <LogOut className="mr-2 h-3 w-3" />
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