import React, { ReactNode, useState } from 'react';
import { TopNavbar } from './TopNavbar';
import { Link, useLocation } from 'wouter';
import { 
  Home, 
  FileText, 
  BarChart2, 
  Database, 
  Beaker, 
  BookOpen, 
  Search, 
  FolderOpen,
  PanelLeft,
  Shield,
  Settings
} from 'lucide-react';

interface AppShellProps {
  children: ReactNode;
}

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location] = useLocation();
  
  const mainNavItems: SidebarItem[] = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: Home 
    },
    { 
      name: 'IND Filings', 
      href: '/ind', 
      icon: FileText 
    },
    { 
      name: 'CSR Analyzer', 
      href: '/CSRAnalyzer', 
      icon: Search 
    },
    { 
      name: 'CER Projects', 
      href: '/cer-projects', 
      icon: FolderOpen 
    },
    { 
      name: 'CER Builder', 
      href: '/cer', 
      icon: BookOpen 
    },
    { 
      name: 'Analytics', 
      href: '/analytics', 
      icon: BarChart2 
    },
    { 
      name: 'CMC Module', 
      href: '/cmc', 
      icon: Beaker 
    },
    { 
      name: 'CoAuthor', 
      href: '/coauthor', 
      icon: PanelLeft 
    },
    { 
      name: 'Reports', 
      href: '/reports', 
      icon: Database 
    }
  ];
  
  // Admin section only shown to admin users
  const adminNavItems: SidebarItem[] = [
    { 
      name: 'Admin Portal', 
      href: '/admin', 
      icon: Shield,
      badge: 'Admin'
    },
    { 
      name: 'Organizations', 
      href: '/admin/organizations', 
      icon: FolderOpen,
      badge: 'Admin'  
    },
    { 
      name: 'System Settings', 
      href: '/admin/settings', 
      icon: Settings,
      badge: 'Admin'  
    }
  ];
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="h-screen flex overflow-hidden bg-white dark:bg-gray-900">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <span className="text-xl font-medium text-gray-900 dark:text-white">TrialSage™</span>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {mainNavItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <a
                      className={`${
                        location === item.href
                          ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                    >
                      <item.icon
                        className={`${
                          location === item.href
                            ? 'text-gray-500 dark:text-gray-300'
                            : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                        } mr-3 flex-shrink-0 h-5 w-5`}
                      />
                      {item.name}
                    </a>
                  </Link>
                ))}
                
                {/* Admin section divider */}
                <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Administration
                  </h3>
                </div>
                
                {/* Admin navigation items */}
                {adminNavItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <a
                      className={`${
                        location === item.href
                          ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                    >
                      <item.icon
                        className={`${
                          location === item.href
                            ? 'text-gray-500 dark:text-gray-300'
                            : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                        } mr-3 flex-shrink-0 h-5 w-5`}
                      />
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto inline-block py-0.5 px-2 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {item.badge}
                        </span>
                      )}
                    </a>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile sidebar */}
      <div 
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } fixed inset-0 flex z-40 md:hidden`} 
        role="dialog" 
        aria-modal="true"
      >
        <div
          className={`${
            sidebarOpen ? 'opacity-100 ease-in-out duration-300' : 'opacity-0'
          } fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity`}
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        ></div>
        
        <div 
          className={`${
            sidebarOpen 
              ? 'translate-x-0 ease-in-out duration-300' 
              : '-translate-x-full'
          } relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white dark:bg-gray-900 transition transform`}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white dark:focus:ring-gray-800"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <svg
                className="h-6 w-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          
          <div className="flex-shrink-0 flex items-center px-4">
            <span className="text-xl font-medium text-gray-900 dark:text-white">TrialSage™</span>
          </div>
          <div className="mt-5 flex-1 h-0 overflow-y-auto">
            <nav className="px-2 space-y-1">
              {mainNavItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a
                    className={`${
                      location === item.href
                        ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`${
                        location === item.href
                          ? 'text-gray-500 dark:text-gray-300'
                          : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                      } mr-4 flex-shrink-0 h-6 w-6`}
                    />
                    {item.name}
                  </a>
                </Link>
              ))}
              
              {/* Admin section divider */}
              <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Administration
                </h3>
              </div>
              
              {/* Admin navigation items */}
              {adminNavItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a
                    className={`${
                      location === item.href
                        ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`${
                        location === item.href
                          ? 'text-gray-500 dark:text-gray-300'
                          : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                      } mr-4 flex-shrink-0 h-6 w-6`}
                    />
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto inline-block py-0.5 px-2 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {item.badge}
                      </span>
                    )}
                  </a>
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <div className="flex-shrink-0 w-14" aria-hidden="true">
          {/* Dummy element to force sidebar to shrink to fit close icon */}
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <TopNavbar 
          toggleSidebar={toggleSidebar} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
        />
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}