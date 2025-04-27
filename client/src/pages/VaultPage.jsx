import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'wouter';

const VaultPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">TrialSage Vault™</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-sm text-gray-700 hover:text-pink-600">
              Dashboard
            </Link>
            <span className="text-sm text-gray-700">
              {user?.username}
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Document Vault</h2>
          <p className="text-gray-600 mb-4">
            Secure document management with advanced retention, approval workflows, and compliance features.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Documents
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by title, keyword, or ID..."
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div className="w-full md:w-48">
              <label htmlFor="doc-type" className="block text-sm font-medium text-gray-700 mb-1">
                Document Type
              </label>
              <select
                id="doc-type"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">All Types</option>
                <option value="protocol">Protocol</option>
                <option value="csr">CSR</option>
                <option value="ib">Investigator's Brochure</option>
                <option value="form">FDA Forms</option>
              </select>
            </div>
            <div className="w-full md:w-48">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="review">In Review</option>
                <option value="approved">Approved</option>
                <option value="published">Published</option>
              </select>
            </div>
            <button className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors">
              Search
            </button>
          </div>
        </div>

        {/* Document Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Document Card 1 */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <svg className="h-6 w-6 text-pink-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium">Protocol</span>
              </div>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Approved</span>
            </div>
            <h3 className="text-lg font-medium mb-2">BT-473 Phase 1 Protocol</h3>
            <p className="text-sm text-gray-600 mb-4">
              First-in-human study to evaluate safety, tolerability, and pharmacokinetics.
            </p>
            <div className="text-xs text-gray-500 mb-4">
              <div className="flex justify-between mb-1">
                <span>Created by: Sarah Johnson</span>
                <span>Ver: 2.1</span>
              </div>
              <div className="flex justify-between">
                <span>Last modified: Apr 25, 2025</span>
                <span>ID: DOC-001</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="text-pink-600 hover:text-pink-800 text-sm font-medium">View</button>
              <button className="text-pink-600 hover:text-pink-800 text-sm font-medium">Edit</button>
              <button className="text-pink-600 hover:text-pink-800 text-sm font-medium">History</button>
            </div>
          </div>

          {/* Document Card 2 */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <svg className="h-6 w-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium">IB</span>
              </div>
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">In Review</span>
            </div>
            <h3 className="text-lg font-medium mb-2">BT-473 Investigator's Brochure</h3>
            <p className="text-sm text-gray-600 mb-4">
              Comprehensive information about the investigational drug product.
            </p>
            <div className="text-xs text-gray-500 mb-4">
              <div className="flex justify-between mb-1">
                <span>Created by: Mark Wilson</span>
                <span>Ver: 1.3</span>
              </div>
              <div className="flex justify-between">
                <span>Last modified: Apr 22, 2025</span>
                <span>ID: DOC-002</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="text-pink-600 hover:text-pink-800 text-sm font-medium">View</button>
              <button className="text-pink-600 hover:text-pink-800 text-sm font-medium">Edit</button>
              <button className="text-pink-600 hover:text-pink-800 text-sm font-medium">History</button>
            </div>
          </div>

          {/* Document Card 3 */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <svg className="h-6 w-6 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
                <span className="font-medium">Form</span>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Draft</span>
            </div>
            <h3 className="text-lg font-medium mb-2">FDA Form 1571</h3>
            <p className="text-sm text-gray-600 mb-4">
              Investigational New Drug Application (IND) cover form.
            </p>
            <div className="text-xs text-gray-500 mb-4">
              <div className="flex justify-between mb-1">
                <span>Created by: John Smith</span>
                <span>Ver: 0.9</span>
              </div>
              <div className="flex justify-between">
                <span>Last modified: Apr 20, 2025</span>
                <span>ID: DOC-003</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="text-pink-600 hover:text-pink-800 text-sm font-medium">View</button>
              <button className="text-pink-600 hover:text-pink-800 text-sm font-medium">Edit</button>
              <button className="text-pink-600 hover:text-pink-800 text-sm font-medium">History</button>
            </div>
          </div>
        </div>

        {/* Document Actions */}
        <div className="flex justify-between items-center mb-8">
          <button className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Upload New Document
          </button>

          <div className="flex space-x-2">
            <button className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
            <button className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Bulk Actions
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VaultPage;