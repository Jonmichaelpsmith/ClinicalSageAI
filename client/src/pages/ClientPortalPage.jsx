import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'wouter';

const ClientPortalPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">TrialSage™ Client Portal</h1>
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
        <h2 className="text-2xl font-bold mb-6">Client Portal</h2>

        {/* Client Information */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
          <h3 className="text-lg font-medium mb-4">Client Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Client Name</p>
              <p className="text-base font-medium">BioInnovate Therapeutics</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Account Manager</p>
              <p className="text-base font-medium">Sarah Johnson</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Subscription Plan</p>
              <p className="text-base font-medium">Enterprise</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Next Renewal Date</p>
              <p className="text-base font-medium">June 15, 2025</p>
            </div>
          </div>
        </div>

        {/* Projects */}
        <h3 className="text-xl font-semibold mb-4">Active Projects</h3>
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mb-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">BT-473 IND Application</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  April 25, 2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <a href="#" className="text-pink-600 hover:text-pink-800 mr-4">View</a>
                  <a href="#" className="text-pink-600 hover:text-pink-800">Edit</a>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Phase 1 CSR</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    In Review
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  April 22, 2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <a href="#" className="text-pink-600 hover:text-pink-800 mr-4">View</a>
                  <a href="#" className="text-pink-600 hover:text-pink-800">Edit</a>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Protocol Development</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    Draft
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  April 20, 2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <a href="#" className="text-pink-600 hover:text-pink-800 mr-4">View</a>
                  <a href="#" className="text-pink-600 hover:text-pink-800">Edit</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Recent Notifications */}
        <h3 className="text-xl font-semibold mb-4">Recent Notifications</h3>
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h4 className="font-medium">All Notifications</h4>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="px-6 py-4">
              <p className="text-sm font-medium text-gray-900">New document approved in BT-473 IND Application</p>
              <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm font-medium text-gray-900">Comment added to Phase 1 CSR</p>
              <p className="text-xs text-gray-500 mt-1">Yesterday</p>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm font-medium text-gray-900">Protocol Development deadline approaching</p>
              <p className="text-xs text-gray-500 mt-1">2 days ago</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientPortalPage;