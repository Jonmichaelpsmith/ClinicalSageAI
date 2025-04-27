import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'wouter';

const DashboardPage = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-medium">Please log in to access the dashboard</h2>
          <Link href="/login" className="text-pink-600 hover:underline mt-2 inline-block">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">TrialSage™</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Welcome, {user.username}
            </span>
            <button
              onClick={logout}
              className="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* TrialSage Vault */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 bg-red-100 rounded-md flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">TrialSage Vault™</h3>
            <p className="text-gray-600 mb-4">
              Secure document management system with advanced retention and compliance features.
            </p>
            <Link href="/vault" className="text-pink-600 hover:text-pink-700 font-medium">
              Access Vault →
            </Link>
          </div>

          {/* IND Wizard */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 bg-blue-100 rounded-md flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">IND Wizard™</h3>
            <p className="text-gray-600 mb-4">
              Guided IND application preparation with automated document generation.
            </p>
            <Link href="/ind-wizard" className="text-pink-600 hover:text-pink-700 font-medium">
              Access IND Wizard →
            </Link>
          </div>

          {/* CSR Intelligence */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 bg-purple-100 rounded-md flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">CSR Intelligence™</h3>
            <p className="text-gray-600 mb-4">
              AI-powered clinical study report generation with regulatory compliance checks.
            </p>
            <Link href="/csr" className="text-pink-600 hover:text-pink-700 font-medium">
              Access CSR Intelligence →
            </Link>
          </div>
        </div>

        {/* Recent Activity Section */}
        <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h4 className="font-medium">System Updates</h4>
          </div>
          <div className="p-6">
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-1">
                  <svg className="h-3 w-3 text-green-600" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">TrialSage platform updated to version 2.4.0</p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1">
                  <svg className="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">New regulatory templates added to IND Wizard</p>
                  <p className="text-xs text-gray-500 mt-1">Yesterday</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 rounded-full bg-pink-100 flex items-center justify-center mr-3 mt-1">
                  <svg className="h-3 w-3 text-pink-600" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">AI model for document analysis enhanced</p>
                  <p className="text-xs text-gray-500 mt-1">3 days ago</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;