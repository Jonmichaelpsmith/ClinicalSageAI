import React, { useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import { Bell, Sun, Moon, Search } from 'lucide-react';
import { useTheme } from '../hooks/use-theme';

// Import translation function (replace with i18next when properly installed)
const t = text => text;

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New CSR imported: Oncology Phase 3', time: '5 min ago', read: false },
    { id: 2, text: 'Protocol analysis completed', time: '1 hour ago', read: false },
    { id: 3, text: 'IND submission ready for review', time: '3 hours ago', read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
      {/* Sidebar */}
      <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Top Navigation */}
        <header className="h-14 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-6 sticky top-0 z-30">
          {/* Search */}
          <div className="relative w-1/3">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={16} className="text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="search"
              className="w-full pl-10 pr-4 py-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:focus:ring-emerald-600"
              placeholder={t('Search across all data...')}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button 
                className="p-1 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-gray-200 dark:border-slate-700 z-50">
                  <div className="p-3 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">{t('Notifications')}</h3>
                    <button
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300"
                      onClick={markAllAsRead}
                    >
                      {t('Mark all as read')}
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                        {t('No notifications')}
                      </div>
                    ) : (
                      <ul>
                        {notifications.map((notification) => (
                          <li
                            key={notification.id}
                            className={`p-3 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 ${
                              !notification.read ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''
                            }`}
                          >
                            <div className="flex items-start">
                              <div className="flex-1">
                                <p className="text-sm text-gray-800 dark:text-gray-200">{notification.text}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5"></div>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="p-2 border-t border-gray-200 dark:border-slate-700 text-center">
                    <button className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300">
                      {t('View all notifications')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              className="p-1 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}