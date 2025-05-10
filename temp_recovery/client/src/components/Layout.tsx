import React, { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { LogOut, User, ChevronDown, Settings, Shield, FileText, Database, Home, Menu, X, Search, Grid, LayoutGrid, Package } from 'lucide-react';
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [solutionsMenuOpen, setSolutionsMenuOpen] = useState(false);
  const [modulesMenuOpen, setModulesMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const solutionsMenuRef = React.useRef<HTMLDivElement>(null);
  const modulesMenuRef = React.useRef<HTMLDivElement>(null);
  
  // Apple-style scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Close menus when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (solutionsMenuRef.current && !solutionsMenuRef.current.contains(event.target as Node)) {
        setSolutionsMenuOpen(false);
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
    setSolutionsMenuOpen(false);
    setModulesMenuOpen(false);
    setMobileMenuOpen(false);
  };
  
  // Solutions menu data - links to dedicated module use case pages
  const solutionsData = [
    { 
      name: "IND Wizard™", 
      path: "/ind-wizard-use-case",
      description: "Expedite IND submissions with AI-powered regulatory writing"
    },
    { 
      name: "CSR Intelligence™", 
      path: "/csr-intelligence-use-case",
      description: "Extract insights from clinical study reports to inform study design"
    },
    { 
      name: "Protocol Design™", 
      path: "/protocol-design-use-case",
      description: "Optimize protocol development with precedent-based AI modeling"
    },
    { 
      name: "CMC Insights™", 
      path: "/cmc-insights-use-case",
      description: "Streamline Chemistry, Manufacturing, and Controls documentation"
    },
    { 
      name: "Document Vault™", 
      path: "/document-vault-use-case",
      description: "Secure, 21 CFR Part 11 compliant document management"
    },
    { 
      name: "AI Copilot™", 
      path: "/ai-copilot-use-case",
      description: "Regulatory intelligence assistant with advanced knowledge"
    },
    { 
      name: "CER Generator™", 
      path: "/cer-generator-use-case",
      description: "Automated Clinical Evaluation Report generation for devices"
    }
  ];
  
  // Keep this for backward compatibility with existing code
  const handleNavigate = closeMenus;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Apple-style premium navigation bar with backdrop blur and scroll effects */}
      <header className={`${scrolled ? 'bg-black/80' : 'bg-black/90'} backdrop-blur-md sticky top-0 z-50 transition-all duration-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Apple-style logo */}
            <div className="flex items-center">
              <Link href="/">
                <div className="flex items-center cursor-pointer group">
                  <div className="relative mr-2">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-md p-1.5 relative overflow-hidden">
                      <div className="text-white font-bold text-xs tracking-wide">C2C</div>
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white tracking-tight">TrialSage</span>
                    <span className="text-blue-400 text-xs align-super">™</span>
                  </div>
                </div>
              </Link>
            </div>
            
            {/* Apple-style center navigation with unified categories */}
            <nav className="hidden lg:flex items-center justify-center space-x-6 flex-1 px-12">
              <NavLink 
                to="/"
                onClick={closeMenus}
                className={`px-2 py-1 text-xs font-medium cursor-pointer transition-colors ${
                  location === '/' ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Home
              </NavLink>

              {/* Solutions Dropdown Menu */}
              <div className="relative" ref={solutionsMenuRef}>
                <button
                  onClick={() => setSolutionsMenuOpen(!solutionsMenuOpen)}
                  className={`flex items-center px-2 py-1 text-xs font-medium cursor-pointer transition-colors ${
                    solutionsMenuOpen ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>Solutions</span>
                  <ChevronDown className={`ml-1 h-3 w-3 transition-transform duration-200 ${solutionsMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {solutionsMenuOpen && (
                  <div className="absolute left-0 mt-2 w-80 rounded-lg overflow-hidden shadow-xl bg-black/90 backdrop-blur-lg z-50 border border-gray-800">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-800">
                        <h3 className="text-sm font-medium text-white">TrialSage™ Solutions</h3>
                        <p className="text-xs text-gray-400 mt-1">Enterprise solutions for regulatory excellence</p>
                      </div>
                      
                      <div className="max-h-[450px] overflow-y-auto">
                        {solutionsData.map((solution, index) => (
                          <NavLink
                            key={index}
                            to={solution.path}
                            onClick={closeMenus}
                            className="flex items-start px-4 py-3 text-sm hover:bg-gray-800/50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-white">{solution.name}</div>
                              <div className="text-xs text-gray-400 mt-1">{solution.description}</div>
                            </div>
                          </NavLink>
                        ))}
                      </div>
                      
                      <div className="px-4 py-2 mt-1 border-t border-gray-800">
                        <NavLink
                          to="/all-solutions"
                          onClick={closeMenus}
                          className="flex items-center text-xs font-medium text-blue-400 hover:text-blue-300"
                        >
                          <LayoutGrid className="h-3 w-3 mr-1" />
                          <span>View all solutions</span>
                        </NavLink>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <NavLink 
                to="/ind-wizard"
                onClick={closeMenus}
                className={`px-2 py-1 text-xs font-medium cursor-pointer transition-colors ${
                  location === '/ind-wizard' ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                IND Wizard™
              </NavLink>
              
              <NavLink 
                to="/csr-library"
                onClick={closeMenus}
                className={`px-2 py-1 text-xs font-medium cursor-pointer transition-colors ${
                  location === '/csr-library' ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                CSR Intelligence™
              </NavLink>
              
              <NavLink 
                to="/protocol-optimization"
                onClick={closeMenus}
                className={`px-2 py-1 text-xs font-medium cursor-pointer transition-colors ${
                  location === '/protocol-optimization' ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Protocol Design™
              </NavLink>
              
              <NavLink 
                to="/versions"
                onClick={closeMenus}
                className={`px-2 py-1 text-xs font-medium cursor-pointer transition-colors ${
                  location === '/versions' ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Document Vault™
              </NavLink>

              <NavLink 
                to="/store"
                onClick={closeMenus}
                className={`px-2 py-1 text-xs font-medium cursor-pointer transition-colors ${
                  location === '/store' ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Store
              </NavLink>
            </nav>
            
            {/* Right side items - Apple-style minimal */}
            <div className="flex items-center space-x-4">
              {/* Search - Apple style */}
              <button className="text-gray-400 hover:text-white transition-colors">
                <Search className="h-4 w-4" />
              </button>
              
              {/* Mobile menu button */}
              <div className="lg:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-gray-400 hover:text-white"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Ask Lumen - Premium style */}
              <NavLink 
                to="/ask-lumen"
                onClick={closeMenus}
                className="hidden sm:flex items-center space-x-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span>Ask</span>
                <span className="font-semibold">Lumen</span>
              </NavLink>
              
              {/* User Menu - Apple style */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <User className="h-4 w-4" />
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-lg overflow-hidden shadow-xl bg-black/90 backdrop-blur-lg z-50 border border-gray-800">
                    <div className="py-2 px-4">
                      <div className="flex items-center border-b border-gray-800 pb-2 mb-2">
                        <div className="bg-blue-500 rounded-full h-8 w-8 flex items-center justify-center text-xs font-medium text-white">
                          {userInfo.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-white">{userInfo.name}</div>
                          <div className="text-xs text-gray-400">Enterprise Account</div>
                        </div>
                      </div>
                      
                      <a href="#settings" className="block py-2 text-sm text-gray-400 hover:text-white transition-colors">
                        Account Settings
                      </a>
                      
                      <a href="#security" className="block py-2 text-sm text-gray-400 hover:text-white transition-colors">
                        Security & Privacy
                      </a>
                      
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left py-2 text-sm text-gray-400 hover:text-white transition-colors mt-2 border-t border-gray-800 pt-2"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu - Apple style */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="bg-black/95 backdrop-blur-md py-2 space-y-0 border-b border-gray-800">
            <NavLink 
              to="/"
              onClick={closeMenus}
              className={`block px-6 py-3 text-sm font-medium cursor-pointer transition-colors ${
                location === '/' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Home
            </NavLink>
            
            <NavLink 
              to="/store"
              onClick={closeMenus}
              className={`block px-6 py-3 text-sm font-medium cursor-pointer transition-colors ${
                location === '/store' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Store
            </NavLink>
            
            <NavLink 
              to="/ind-wizard"
              onClick={closeMenus}
              className={`block px-6 py-3 text-sm font-medium cursor-pointer transition-colors ${
                location === '/ind-wizard' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              IND Wizard™
            </NavLink>
            
            <NavLink 
              to="/csr-library"
              onClick={closeMenus}
              className={`block px-6 py-3 text-sm font-medium cursor-pointer transition-colors ${
                location === '/csr-library' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              CSR Intelligence™
            </NavLink>
            
            <NavLink 
              to="/protocol-optimization"
              onClick={closeMenus}
              className={`block px-6 py-3 text-sm font-medium cursor-pointer transition-colors ${
                location === '/protocol-optimization' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Protocol Design™
            </NavLink>
            
            <NavLink 
              to="/cmc-module"
              onClick={closeMenus}
              className={`block px-6 py-3 text-sm font-medium cursor-pointer transition-colors ${
                location === '/cmc-module' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              CMC Insights™
            </NavLink>
            
            <NavLink 
              to="/versions"
              onClick={closeMenus}
              className={`block px-6 py-3 text-sm font-medium cursor-pointer transition-colors ${
                location === '/versions' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Document Vault™
            </NavLink>
            
            <NavLink 
              to="/ask-lumen"
              onClick={closeMenus}
              className="block px-6 py-3 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Ask Lumen
            </NavLink>
          </div>
        </div>
      )}

      <main className="flex-grow">
        {children}
      </main>

      {/* Apple-style minimalist footer */}
      <footer className="bg-black/95 backdrop-blur-md py-6 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-500 flex flex-wrap justify-center gap-x-6 gap-y-2 md:gap-x-8">
              <span>Privacy Policy</span>
              <span>Terms of Use</span>
              <span>Legal</span>
              <span>Site Map</span>
            </div>
            <div className="text-gray-500 flex items-center">
              <Shield className="h-3 w-3 mr-1.5" />
              <span>21 CFR Part 11 Compliant</span>
            </div>
            <div className="text-gray-500">
              © {new Date().getFullYear()} TrialSage™ by C2C.AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;