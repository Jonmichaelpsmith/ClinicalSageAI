import React, { useState } from 'react';

const VaultQuickAccess = () => {
  // Sample documents (in a real app these would come from an API)
  const [documents] = useState([
    {
      id: 'doc-1',
      title: 'Enzyvant BLA Protocol v2.3',
      type: 'Protocol',
      date: '2025-04-15',
      status: 'Final'
    },
    {
      id: 'doc-2',
      title: 'Merck FDA Response Letter',
      type: 'Correspondence',
      date: '2025-04-20',
      status: 'Draft'
    },
    {
      id: 'doc-3',
      title: 'Axogen CMC Chemistry Data',
      type: 'Report',
      date: '2025-04-18',
      status: 'Final'
    },
    {
      id: 'doc-4',
      title: 'Novartis IND Form 1571',
      type: 'Form',
      date: '2025-04-22',
      status: 'In Review'
    }
  ]);

  return (
    <div>
      <div className="space-y-3">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div>
              <div className="font-medium text-sm text-gray-900 truncate max-w-xs">{doc.title}</div>
              <div className="flex space-x-2 text-xs text-gray-500">
                <span>{doc.type}</span>
                <span>•</span>
                <span>{formatDate(doc.date)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(doc.status)}`}>
                {doc.status}
              </span>
              <button className="p-1 text-indigo-600 hover:text-indigo-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="p-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm hover:bg-indigo-100 transition flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload
        </button>
        <button className="p-2 bg-gray-50 text-gray-700 rounded-lg text-sm hover:bg-gray-100 transition flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search
        </button>
      </div>
    </div>
  );
};

// Helper function to get appropriate status color
const getStatusColor = (status) => {
  switch (status) {
    case 'Final':
      return 'bg-green-100 text-green-800';
    case 'Draft':
      return 'bg-yellow-100 text-yellow-800';
    case 'In Review':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Format date to be more readable
const formatDate = (dateString) => {
  const options = { month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export default VaultQuickAccess;