import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Bell, Clock, CheckCircle, FileText, Folder, LogOut, Settings, Shield, Braces } from 'lucide-react';

/**
 * Standalone Client Portal Page
 * This is a simplified version that doesn't rely on the server for authentication
 */
const StandaloneClientPortalPage = () => {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load user from localStorage
    const savedUser = localStorage.getItem('mock_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing saved user:', e);
      }
    }
    setLoading(false);
  }, []);
  
  useEffect(() => {
    // If not authenticated after checking localStorage, redirect to login
    if (!loading && !user) {
      setLocation('/standalone-login');
    }
  }, [user, loading, setLocation]);
  
  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Get user's first name for welcome message
  const firstName = user.firstName || user.username.split(' ')[0] || 'User';
  
  // Get initials for avatar
  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    } else if (user.username) {
      const parts = user.username.split(' ');
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return user.username[0].toUpperCase();
    }
    return 'TS'; // TrialSage default
  };
  
  const handleLogout = () => {
    // Clear user from localStorage
    localStorage.removeItem('mock_user');
    setUser(null);
    // Redirect to login
    setLocation('/standalone-login');
  };
  
  // Current date for last login
  const today = new Date();
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  const formattedDate = today.toLocaleDateString('en-US', options);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center">
              <a href="/" className="flex items-center">
                <span className="text-2xl font-bold text-pink-600">TrialSage</span>
                <span className="text-xs align-top font-medium text-gray-500">™</span>
                <span className="text-sm text-gray-400 ml-2 hidden md:inline-block">Client Portal</span>
              </a>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <nav className="flex space-x-6">
                <a href="#" className="text-sm font-medium text-gray-700 hover:text-pink-600">Dashboard</a>
                <a href="#" className="text-sm font-medium text-gray-700 hover:text-pink-600">Submissions</a>
                <a href="#" className="text-sm font-medium text-gray-700 hover:text-pink-600">Documents</a>
                <a href="#" className="text-sm font-medium text-gray-700 hover:text-pink-600">Analytics</a>
                <a href="#" className="text-sm font-medium text-gray-700 hover:text-pink-600">Support</a>
              </nav>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="flex items-center">
                    <span className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-2">
                      {getInitials()}
                    </span>
                    <span>{user.username}</span>
                    <button 
                      type="button" 
                      onClick={handleLogout} 
                      className="ml-3 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700 flex items-center"
                    >
                      <LogOut size={12} className="mr-1" /> Logout
                    </button>
                  </div>
                </div>
                
                <div className="h-6 w-px bg-gray-300"></div>
                
                <button type="button" className="p-2 rounded-full text-gray-500 hover:text-pink-600 hover:bg-pink-50">
                  <Bell size={20} />
                </button>
                
                <button type="button" className="p-2 rounded-full text-gray-500 hover:text-pink-600 hover:bg-pink-50">
                  <Settings size={20} />
                </button>
              </div>
            </div>
            
            <div className="md:hidden">
              <button type="button" className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-600">
                <span className="sr-only">Open menu</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}</h1>
              <div className="text-sm text-gray-500">
                Last login: {formattedDate}
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">
              Access your TrialSage modules and ongoing submissions below. You have <span className="font-semibold text-pink-600">3 submissions</span> in progress and <span className="font-semibold text-pink-600">2 updates</span> from your team.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-pink-50 rounded-lg p-4 flex items-center">
                <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center text-white mr-4">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Active Documents</div>
                  <div className="text-lg font-semibold">128</div>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white mr-4">
                  <Folder size={20} />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Submissions</div>
                  <div className="text-lg font-semibold">3</div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white mr-4">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Approved Documents</div>
                  <div className="text-lg font-semibold">42</div>
                </div>
              </div>
              
              <div className="bg-amber-50 rounded-lg p-4 flex items-center">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white mr-4">
                  <Clock size={20} />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Awaiting Review</div>
                  <div className="text-lg font-semibold">8</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Module Access Section */}
      <section className="py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your TrialSage Modules</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* TrialSage Vault Module */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 hover:-translate-y-1 transform transition-transform">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center">
                    <Folder className="h-6 w-6 text-pink-600" />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">TrialSage Vault™</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Secure document management with advanced retention, approval workflows, and 21 CFR Part 11 compliance.
                </p>
                
                <div className="mt-6">
                  <button className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none">
                    Access Vault
                  </button>
                </div>
              </div>
            </div>
            
            {/* IND Wizard Module */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 hover:-translate-y-1 transform transition-transform">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-blue-500" />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">IND Wizard™</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Guided IND application preparation with automated document generation and FDA submission tools.
                </p>
                
                <div className="mt-6">
                  <button className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none">
                    Access IND Wizard
                  </button>
                </div>
              </div>
            </div>
            
            {/* CSR Intelligence Module */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 hover:-translate-y-1 transform transition-transform">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                    <Braces className="h-6 w-6 text-purple-500" />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">CSR Intelligence™</h3>
                <p className="text-sm text-gray-500 mb-4">
                  AI-powered clinical study report analysis, extraction, and generation with regulatory compliance checks.
                </p>
                
                <div className="mt-6">
                  <button className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-500 hover:bg-purple-600 focus:outline-none">
                    Access CSR Intelligence
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <a href="#" className="text-sm text-pink-600 hover:text-pink-700 font-medium">
              View All Activity
            </a>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {[
                {
                  id: 1,
                  type: 'document',
                  action: 'uploaded',
                  title: 'Protocol Amendment 3',
                  time: '2 hours ago',
                  user: 'Sarah Johnson'
                },
                {
                  id: 2,
                  type: 'comment',
                  action: 'commented on',
                  title: 'CSR Draft Version 2.1',
                  time: '4 hours ago',
                  user: 'Michael Chen'
                },
                {
                  id: 3,
                  type: 'approval',
                  action: 'approved',
                  title: 'Investigator Brochure',
                  time: 'Yesterday at 3:45 PM',
                  user: 'Dr. Emily Rodriguez'
                },
                {
                  id: 4,
                  type: 'submission',
                  action: 'submitted',
                  title: 'IND Application #235789',
                  time: 'Yesterday at 10:20 AM',
                  user: 'Robert Thompson'
                }
              ].map((activity) => (
                <li key={activity.id} className="py-4 px-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {activity.type === 'document' && (
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <FileText size={16} className="text-blue-600" />
                        </div>
                      )}
                      {activity.type === 'comment' && (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                      )}
                      {activity.type === 'approval' && (
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle size={16} className="text-green-600" />
                        </div>
                      )}
                      {activity.type === 'submission' && (
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        <span className="font-semibold">{activity.user}</span> {activity.action} <a href="#" className="text-blue-600 hover:underline">{activity.title}</a>
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.time}
                      </p>
                    </div>
                    <div>
                      <button className="text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded px-2 py-1">
                        View
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Upcoming Deadlines Section */}
      <section className="py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Deadlines</h2>
            <a href="#" className="text-sm text-pink-600 hover:text-pink-700 font-medium">
              View Calendar
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">This Week</h3>
                
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded bg-red-100 flex items-center justify-center text-red-600 font-bold">
                        <div className="text-center">
                          <div className="text-xs leading-none">APR</div>
                          <div className="text-lg leading-none">29</div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Final CSR Review</p>
                      <p className="text-xs text-gray-500">Due in 2 days</p>
                    </div>
                    <div className="ml-auto">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        High Priority
                      </span>
                    </div>
                  </li>
                  
                  <li className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
                        <div className="text-center">
                          <div className="text-xs leading-none">MAY</div>
                          <div className="text-lg leading-none">01</div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Regulatory Meeting</p>
                      <p className="text-xs text-gray-500">Due in 4 days</p>
                    </div>
                    <div className="ml-auto">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        Medium Priority
                      </span>
                    </div>
                  </li>
                  
                  <li className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        <div className="text-center">
                          <div className="text-xs leading-none">MAY</div>
                          <div className="text-lg leading-none">03</div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Safety Report Submission</p>
                      <p className="text-xs text-gray-500">Due in 6 days</p>
                    </div>
                    <div className="ml-auto">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Regular
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming</h3>
                
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
                        <div className="text-center">
                          <div className="text-xs leading-none">MAY</div>
                          <div className="text-lg leading-none">15</div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Annual Report Due</p>
                      <p className="text-xs text-gray-500">Due in 18 days</p>
                    </div>
                    <div className="ml-auto">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        Medium Priority
                      </span>
                    </div>
                  </li>
                  
                  <li className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded bg-green-100 flex items-center justify-center text-green-600 font-bold">
                        <div className="text-center">
                          <div className="text-xs leading-none">MAY</div>
                          <div className="text-lg leading-none">22</div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Protocol Amendment</p>
                      <p className="text-xs text-gray-500">Due in 25 days</p>
                    </div>
                    <div className="ml-auto">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Low Priority
                      </span>
                    </div>
                  </li>
                  
                  <li className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded bg-red-100 flex items-center justify-center text-red-600 font-bold">
                        <div className="text-center">
                          <div className="text-xs leading-none">JUN</div>
                          <div className="text-lg leading-none">15</div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">FDA Response Deadline</p>
                      <p className="text-xs text-gray-500">Due in 49 days</p>
                    </div>
                    <div className="ml-auto">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        High Priority
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <span className="text-xl font-bold text-pink-600">TrialSage</span>
              <span className="text-xs align-top font-medium text-gray-500">™</span>
              <span className="ml-2 text-sm text-gray-500">© 2025 Concept2Cures, Inc. All rights reserved.</span>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Terms</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Privacy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Support</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StandaloneClientPortalPage;