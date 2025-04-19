import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import { 
  BarChart2, 
  Brain, 
  FileText, 
  Home, 
  Search, 
  Settings, 
  Database, 
  Beaker, 
  BarChart, 
  FileSearch, 
  Upload, 
  TrendingUp, 
  Package, 
  Coffee, 
  Bell,
  Microscope,
  Users,
  BookOpen,
  ArrowUpRight
} from 'lucide-react';

// Import translation function (replace with i18next when properly installed)
const t = text => text;

export default function DashboardSidebar({ collapsed, setCollapsed }) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  const isActive = (path) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { 
      title: t('Home'), 
      icon: <Home size={20} />, 
      link: '/dashboard',
      notification: null
    },
    { 
      title: t('CSR Intelligence'), 
      icon: <Database size={20} />, 
      link: '/csr-library',
      notification: null,
      subItems: [
        { title: t('Library Search'), icon: <Search size={18} />, link: '/csr-library/search' },
        { title: t('Upload CSR'), icon: <Upload size={18} />, link: '/csr-library/upload' },
        { title: t('Success Analytics'), icon: <BarChart size={18} />, link: '/csr-library/analytics' }
      ]
    },
    { 
      title: t('Protocol Optimizer'), 
      icon: <Brain size={20} />, 
      link: '/protocol-optimization',
      notification: null,
      subItems: [
        { title: t('Create New'), icon: <FileText size={18} />, link: '/protocol-optimization/new' },
        { title: t('Open Existing'), icon: <FileSearch size={18} />, link: '/protocol-optimization/existing' },
        { title: t('Intelligence Panel'), icon: <BarChart2 size={18} />, link: '/protocol-optimization/intelligence' }
      ]
    },
    { 
      title: t('CER Generator'), 
      icon: <Beaker size={20} />, 
      link: '/cer-dashboard',
      notification: null,
      subItems: [
        { title: t('Create Report'), icon: <FileText size={18} />, link: '/cer-dashboard/create' },
        { title: t('FAERS Monitor'), icon: <Microscope size={18} />, link: '/cer-dashboard/faers' },
        { title: t('Export Options'), icon: <ArrowUpRight size={18} />, link: '/cer-dashboard/export' }
      ]
    },
    { 
      title: t('IND Automation'), 
      icon: <Package size={20} />, 
      link: '/ind-automation',
      notification: 2,
      subItems: [
        { title: t('New Submission'), icon: <FileText size={18} />, link: '/ind-automation/new' },
        { title: t('Module Builder'), icon: <FileSearch size={18} />, link: '/ind-automation/builder' },
        { title: t('eCTD Packager'), icon: <Package size={18} />, link: '/ind-automation/ectd' },
        { title: t('ESG Gateway'), icon: <ArrowUpRight size={18} />, link: '/ind-automation/esg' }
      ]
    },
    { 
      title: t('TrialSage Assistant'), 
      icon: <Coffee size={20} />, 
      link: '/assistant',
      notification: null
    },
    { 
      title: t('KPI Analytics'), 
      icon: <TrendingUp size={20} />, 
      link: '/kpi',
      notification: null,
      subItems: [
        { title: t('Custom Dashboards'), icon: <BarChart2 size={18} />, link: '/kpi/dashboards' },
        { title: t('Data Sources'), icon: <Database size={18} />, link: '/kpi/sources' },
        { title: t('Alert Configuration'), icon: <Bell size={18} />, link: '/kpi/alerts' }
      ]
    },
    { 
      title: t('Knowledge Library'), 
      icon: <BookOpen size={20} />, 
      link: '/academic',
      notification: 3
    }
  ];

  return (
    <div className={`
      h-screen bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 
      fixed left-0 top-0 z-40 transition-all duration-300 flex flex-col
      ${collapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center">
          {!collapsed && <span className="font-bold text-emerald-700 dark:text-emerald-400 text-lg">TrialSage</span>}
          {collapsed && <span className="font-bold text-emerald-700 dark:text-emerald-400 text-lg">TS</span>}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        {!collapsed && (
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-700 flex items-center justify-center text-emerald-800 dark:text-emerald-200 font-bold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="ml-3 overflow-hidden">
              <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                {user?.username || 'User'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email || 'user@example.com'}
              </div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-700 flex items-center justify-center text-emerald-800 dark:text-emerald-200 font-bold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto pt-2">
        <ul className="px-2">
          {navItems.map((item) => (
            <li key={item.title} className="mb-1">
              <Link to={item.link}>
                <a
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-md transition-colors
                    ${isActive(item.link)
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}
                  `}
                >
                  <div className="flex-shrink-0">{item.icon}</div>
                  {!collapsed && (
                    <>
                      <span className="flex-grow truncate">{item.title}</span>
                      {item.notification && (
                        <span className="w-5 h-5 flex items-center justify-center bg-emerald-600 text-white rounded-full text-xs">
                          {item.notification}
                        </span>
                      )}
                    </>
                  )}
                  {collapsed && item.notification && (
                    <span className="w-5 h-5 absolute right-0 top-0 flex items-center justify-center bg-emerald-600 text-white rounded-full text-xs -mt-1 -mr-1">
                      {item.notification}
                    </span>
                  )}
                </a>
              </Link>
              
              {!collapsed && item.subItems && (
                <ul className="ml-8 mt-1 space-y-1">
                  {item.subItems.map((subItem) => (
                    <li key={subItem.title}>
                      <Link to={subItem.link}>
                        <a
                          className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors
                            ${isActive(subItem.link)
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50'}
                          `}
                        >
                          <div className="flex-shrink-0">{subItem.icon}</div>
                          <span className="flex-grow truncate">{subItem.title}</span>
                        </a>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <Link to="/settings">
            <a className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
              <Settings size={20} />
              {!collapsed && <span>{t('Settings')}</span>}
            </a>
          </Link>
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 text-sm"
            >
              {t('Logout')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}