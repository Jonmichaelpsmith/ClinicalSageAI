import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import { Loader2, Bell, Settings, LogOut, FileText, CheckCircle, Clock, Folder, Shield, Braces } from 'lucide-react';

const ClientPortalPage = () => {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    // If not authenticated, redirect to login page
    if (!user) {
      setLocation('/login');
    }
  }, [user, setLocation]);
  
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={40} className="animate-spin text-pink-600" />
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
    logout();
    setLocation('/login');
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
                  title: 'Clinical Study Report v2.4',
                  action: 'approved',
                  user: 'Dr. Sarah Chen',
                  time: '2 hours ago',
                  icon: <CheckCircle size={16} className="text-green-500" />
                },
                {
                  id: 2,
                  type: 'submission',
                  title: 'IND Application - Protocol Amendment',
                  action: 'submitted',
                  user: 'Robert Johnson',
                  time: '4 hours ago',
                  icon: <Folder size={16} className="text-blue-500" />
                },
                {
                  id: 3,
                  type: 'document',
                  title: 'Patient Adverse Event Report',
                  action: 'updated',
                  user: 'You',
                  time: 'Yesterday at 4:30 PM',
                  icon: <FileText size={16} className="text-amber-500" />
                },
                {
                  id: 4,
                  type: 'comment',
                  title: 'Protocol Synopsis Review',
                  action: 'commented',
                  user: 'Lisa Williams',
                  time: 'Yesterday at 10:15 AM',
                  icon: <Folder size={16} className="text-pink-500" />
                },
                {
                  id: 5,
                  type: 'document',
                  title: 'Statistical Analysis Plan',
                  action: 'created',
                  user: 'You',
                  time: 'April 25, 2025',
                  icon: <FileText size={16} className="text-purple-500" />
                }
              ].map(activity => (
                <li key={activity.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      {activity.icon}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">{activity.user}</span> {activity.action} this {activity.type}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-pink-600">About</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-pink-600">Careers</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-pink-600">Contact</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-pink-600">Partners</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Solutions</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-pink-600">TrialSage Vault™</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-pink-600">IND Wizard™</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-pink-600">CSR Intelligence™</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-pink-600">Study Architect™</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-pink-600">Help Center</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-pink-600">Training</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-pink-600">Documentation</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-pink-600">API Reference</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-pink-600">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-pink-600">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-pink-600">Compliance</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-pink-600">21 CFR Part 11</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 border-t border-gray-200 pt-8 flex flex-col items-center justify-between md:flex-row">
            <div className="flex items-center">
              <span className="text-xl font-bold text-pink-600">TrialSage</span>
              <span className="text-xs align-top font-medium text-gray-500">™</span>
            </div>
            <p className="text-sm text-gray-500 mt-4 md:mt-0">
              &copy; {new Date().getFullYear()} Concept2Cures, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClientPortalPage;