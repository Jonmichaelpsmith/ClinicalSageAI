import React, { useState, useEffect } from 'react';
import { cleanupModals } from './lib/modalHelpers';

const CleanModalApp = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Cleanup any lingering modal elements when component unmounts
  useEffect(() => {
    return () => {
      cleanupModals();
    };
  }, []);

  // Clean up modals when tab changes
  useEffect(() => {
    cleanupModals();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Regulatory Compliance Platform</h1>
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-800 dark:text-gray-200 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Settings
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`${activeTab === 'overview' 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'} 
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              
              <button
                className={`${activeTab === 'submissions' 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'} 
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('submissions')}
              >
                FDA Submissions
              </button>
              
              <button
                className={`${activeTab === 'quality' 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'} 
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('quality')}
              >
                Quality Management
              </button>
              
              <button
                className={`${activeTab === 'reports' 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'} 
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('reports')}
              >
                Reports
              </button>
            </nav>
          </div>

          <div className="mt-6">
            {activeTab === 'overview' && (
              <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Compliance Overview</h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div className="bg-gray-50 dark:bg-gray-700 overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-300 truncate">Active Submissions</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">4</dd>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-300 truncate">Quality Processes</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">5</dd>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-300 truncate">Compliance Status</dt>
                        <dd className="mt-1 text-3xl font-semibold text-green-600 dark:text-green-400">Compliant</dd>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">FDA Submissions</h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <p className="text-gray-500 dark:text-gray-400">
                    Manage all FDA submission documents and processes.
                    <br />
                    <span className="text-sm text-blue-500 dark:text-blue-400">
                      Any floating elements from the previous tab have been cleaned up by the cleanupModals function.
                    </span>
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'quality' && (
              <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Quality Management</h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <p className="text-gray-500 dark:text-gray-400">
                    Manage quality management system processes and documentation.
                    <br />
                    <span className="text-sm text-blue-500 dark:text-blue-400">
                      The cleanupModals function was called when switching to this tab, removing any floating elements.
                    </span>
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Compliance Reports</h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <p className="text-gray-500 dark:text-gray-400">
                    Generate and view compliance reports for regulatory submissions.
                    <br />
                    <span className="text-sm text-blue-500 dark:text-blue-400">
                      All modal elements have been cleaned up when switching to this tab.
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CleanModalApp;