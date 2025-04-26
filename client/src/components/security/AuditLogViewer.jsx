import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, Search, Filter, Download, Eye, FileText, Trash, Edit, UserPlus, Login, Lock, Shield } from 'lucide-react';
import { apiRequest } from '../../lib/queryClient';
import { format } from 'date-fns';

/**
 * Audit Log Viewer Component
 * 
 * Displays and filters security audit logs for user activities:
 * - Authentication events
 * - Document access
 * - Security setting changes
 * - Admin actions
 */
export default function AuditLogViewer({ userId, documentId }) {
  // State
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    eventType: '',
    searchTerm: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Generate the appropriate query key based on provided props
  const queryKey = documentId 
    ? [`/api/security/document-logs/${documentId}`] 
    : [`/api/security/audit-logs/${userId}`];

  // Fetch audit logs
  const { 
    data: auditData, 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      // Add filters if present
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.eventType) queryParams.append('eventType', filters.eventType);
      
      // Add pagination
      queryParams.append('limit', pageSize);
      queryParams.append('offset', (currentPage - 1) * pageSize);
      
      const endpoint = documentId 
        ? `/api/security/document-logs/${documentId}?${queryParams}` 
        : `/api/security/audit-logs/${userId}?${queryParams}`;
      
      const res = await apiRequest("GET", endpoint);
      return res.json();
    },
    refetchOnWindowFocus: false,
  });

  // Refetch when filters or pagination changes
  useEffect(() => {
    refetch();
  }, [filters, currentPage, pageSize, refetch]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  // Apply filters
  const applyFilters = (e) => {
    e.preventDefault();
    refetch();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      eventType: '',
      searchTerm: '',
    });
    setCurrentPage(1);
  };

  // Pagination controls
  const totalPages = auditData?.total ? Math.ceil(auditData.total / pageSize) : 0;

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Helper function to get icon based on event type
  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'LOGIN_SUCCESS':
      case 'LOGIN_FAILED':
      case 'LOGOUT':
        return <Login className="h-4 w-4 text-blue-500" />;
      case 'PASSWORD_CHANGED':
      case 'MFA_ENABLED':
      case 'MFA_DISABLED':
        return <Lock className="h-4 w-4 text-yellow-500" />;
      case 'DOCUMENT_VIEW':
        return <Eye className="h-4 w-4 text-green-500" />;
      case 'DOCUMENT_DOWNLOAD':
        return <Download className="h-4 w-4 text-purple-500" />;
      case 'DOCUMENT_EDIT':
        return <Edit className="h-4 w-4 text-orange-500" />;
      case 'DOCUMENT_DELETE':
        return <Trash className="h-4 w-4 text-red-500" />;
      case 'DOCUMENT_SHARE':
        return <UserPlus className="h-4 w-4 text-indigo-500" />;
      case 'DOCUMENT_UPLOAD':
        return <FileText className="h-4 w-4 text-cyan-500" />;
      case 'SECURITY_SETTINGS_UPDATED':
      case 'SECURITY_SETTINGS_ACCESSED':
        return <Shield className="h-4 w-4 text-hotpink-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  // Helper function to get human-readable event description
  const getEventDescription = (log) => {
    switch (log.eventType) {
      case 'LOGIN_SUCCESS':
        return 'Successful login';
      case 'LOGIN_FAILED':
        return 'Failed login attempt';
      case 'LOGOUT':
        return 'User logged out';
      case 'PASSWORD_CHANGED':
        return 'Password changed';
      case 'MFA_ENABLED':
        return 'Multi-factor authentication enabled';
      case 'MFA_DISABLED':
        return 'Multi-factor authentication disabled';
      case 'DOCUMENT_VIEW':
        return `Viewed document ${log.details?.documentId || ''}`;
      case 'DOCUMENT_DOWNLOAD':
        return `Downloaded document ${log.details?.documentId || ''}`;
      case 'DOCUMENT_EDIT':
        return `Edited document ${log.details?.documentId || ''}`;
      case 'DOCUMENT_DELETE':
        return `Deleted document ${log.details?.documentId || ''}`;
      case 'DOCUMENT_SHARE':
        return `Shared document ${log.details?.documentId || ''}`;
      case 'DOCUMENT_UPLOAD':
        return `Uploaded document ${log.details?.documentId || ''}`;
      case 'SECURITY_SETTINGS_UPDATED':
        return 'Updated security settings';
      case 'SECURITY_SETTINGS_ACCESSED':
        return 'Accessed security settings';
      default:
        return log.eventType.replace(/_/g, ' ').toLowerCase();
    }
  };

  // Export logs to CSV
  const exportLogsToCSV = () => {
    if (!auditData?.logs?.length) return;
    
    // Prepare CSV header
    const headers = ['Timestamp', 'Event Type', 'Description', 'IP Address', 'User Agent'];
    
    // Prepare CSV rows
    const rows = auditData.logs.map(log => [
      log.timestamp,
      log.eventType,
      getEventDescription(log),
      log.ipAddress,
      log.userAgent
    ]);
    
    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Event type options
  const eventTypeOptions = [
    { value: '', label: 'All Events' },
    { value: 'LOGIN_SUCCESS', label: 'Login Success' },
    { value: 'LOGIN_FAILED', label: 'Login Failed' },
    { value: 'LOGOUT', label: 'Logout' },
    { value: 'PASSWORD_CHANGED', label: 'Password Changed' },
    { value: 'MFA_ENABLED', label: 'MFA Enabled' },
    { value: 'MFA_DISABLED', label: 'MFA Disabled' },
    { value: 'DOCUMENT_VIEW', label: 'Document View' },
    { value: 'DOCUMENT_DOWNLOAD', label: 'Document Download' },
    { value: 'DOCUMENT_EDIT', label: 'Document Edit' },
    { value: 'DOCUMENT_DELETE', label: 'Document Delete' },
    { value: 'DOCUMENT_SHARE', label: 'Document Share' },
    { value: 'DOCUMENT_UPLOAD', label: 'Document Upload' },
    { value: 'SECURITY_SETTINGS_UPDATED', label: 'Security Settings Updated' },
    { value: 'SECURITY_SETTINGS_ACCESSED', label: 'Security Settings Accessed' },
  ];

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-hotpink-500 border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
        <h3 className="text-lg font-semibold mb-2">Error Loading Audit Logs</h3>
        <p>{error.message || "An error occurred while loading audit logs."}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-hotpink-700 flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            {documentId ? 'Document Access Logs' : 'Security Audit Logs'}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {documentId 
              ? 'Track who accessed this document and when' 
              : 'Review security events and user activities'
            }
          </p>
        </div>
        <button
          onClick={exportLogsToCSV}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink-500"
        >
          <Download className="h-4 w-4 mr-1" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <form onSubmit={applyFilters} className="mb-6 bg-gray-50 p-4 rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm text-gray-700 mb-1 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-hotpink-500 focus:border-hotpink-500 sm:text-sm"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm text-gray-700 mb-1 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-hotpink-500 focus:border-hotpink-500 sm:text-sm"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
          
          <div>
            <label htmlFor="eventType" className="block text-sm text-gray-700 mb-1 flex items-center">
              <Filter className="h-4 w-4 mr-1" />
              Event Type
            </label>
            <select
              id="eventType"
              name="eventType"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-hotpink-500 focus:border-hotpink-500 sm:text-sm rounded-md"
              value={filters.eventType}
              onChange={handleFilterChange}
            >
              {eventTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="searchTerm" className="block text-sm text-gray-700 mb-1 flex items-center">
              <Search className="h-4 w-4 mr-1" />
              Search
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="text"
                id="searchTerm"
                name="searchTerm"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-hotpink-500 focus:border-hotpink-500 sm:text-sm"
                placeholder="Search logs..."
                value={filters.searchTerm}
                onChange={handleFilterChange}
              />
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink-500"
          >
            Reset
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-hotpink-600 hover:bg-hotpink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink-500"
          >
            Apply Filters
          </button>
        </div>
      </form>

      {/* Logs Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP Address
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {auditData?.logs?.length ? (
              auditData.logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getEventIcon(log.eventType)}
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {log.eventType.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getEventDescription(log)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {format(new Date(log.timestamp), 'MMM d, yyyy')}
                      <Clock className="h-4 w-4 mx-1 text-gray-400" />
                      {format(new Date(log.timestamp), 'h:mm a')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.ipAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      type="button"
                      className="text-hotpink-600 hover:text-hotpink-800 hover:underline"
                      onClick={() => {
                        // Show details in modal or tooltip
                        alert(JSON.stringify(log.details || {}, null, 2));
                      }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  No audit logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {auditData?.logs?.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, auditData.total)}
                </span>{' '}
                of <span className="font-medium">{auditData.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">First</span>
                  <span className="h-5 w-5 flex justify-center items-center">«</span>
                </button>
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <span className="h-5 w-5 flex justify-center items-center">‹</span>
                </button>
                
                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  // Calculate page number to show
                  let pageNum;
                  if (totalPages <= 5) {
                    // Show all pages if 5 or fewer
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    // Show first 5 pages
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    // Show last 5 pages
                    pageNum = totalPages - 4 + i;
                  } else {
                    // Show current page and surrounding pages
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        currentPage === pageNum
                          ? 'bg-hotpink-50 border-hotpink-500 text-hotpink-600 z-10'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      } text-sm font-medium`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <span className="h-5 w-5 flex justify-center items-center">›</span>
                </button>
                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Last</span>
                  <span className="h-5 w-5 flex justify-center items-center">»</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}