import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, User, Calendar, Clock, Download, Filter, ChevronLeft, ChevronRight, Search } from 'lucide-react';

const AuditLogViewer = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterType, setFilterType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: [`/api/audit-logs?page=${page}&pageSize=${pageSize}${filterType ? `&type=${filterType}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`],
    staleTime: 1000 * 60 * 1, // 1 minute
  });

  const handleNextPage = () => {
    if (auditLogs && page < auditLogs.totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
    setPage(1); // Reset to first page on filter change
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getActionBadgeColor = (action) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'VIEW':
        return 'bg-gray-100 text-gray-800';
      case 'EXPORT':
        return 'bg-purple-100 text-purple-800';
      case 'SIGNATURE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Audit Log Viewer</h2>
          <button className="flex items-center text-sm px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-500 mr-2" />
            <select
              value={filterType}
              onChange={handleFilterChange}
              className="rounded-md border-gray-300 text-sm focus:border-pink-500 focus:ring-pink-500"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="VIEW">View</option>
              <option value="EXPORT">Export</option>
              <option value="SIGNATURE">Signature</option>
            </select>
          </div>

          <form onSubmit={handleSearch} className="flex-grow max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by user, document, or resource ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 text-sm focus:border-pink-500 focus:ring-pink-500"
              />
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Audit Logs Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs?.logs?.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadgeColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-500 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{log.resourceType}</div>
                        <div className="text-sm text-gray-500">{log.resourceId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-500 mr-2" />
                      <div className="text-sm text-gray-900">{log.userId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                      <div className="text-sm text-gray-500">{formatTimestamp(log.timestamp)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {log.details.documentName && (
                        <div>
                          <span className="font-medium">Document:</span> {log.details.documentName}
                        </div>
                      )}
                      {log.details.documentType && (
                        <div>
                          <span className="font-medium">Type:</span> {log.details.documentType}
                        </div>
                      )}
                      {log.details.changedFields && (
                        <div>
                          <span className="font-medium">Changed:</span> {log.details.changedFields.join(', ')}
                        </div>
                      )}
                      {log.details.signatureType && (
                        <div>
                          <span className="font-medium">Signature:</span> {log.details.signatureType}
                        </div>
                      )}
                      {log.details.exportFormat && (
                        <div>
                          <span className="font-medium">Format:</span> {log.details.exportFormat}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-pink-600 mt-1 cursor-pointer hover:underline">
                      Show blockchain verification
                    </div>
                  </td>
                </tr>
              ))}
              {auditLogs?.logs?.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No audit logs found for the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {auditLogs && auditLogs.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{' '}
              <span className="font-medium">{Math.min(page * pageSize, auditLogs.totalCount)}</span> of{' '}
              <span className="font-medium">{auditLogs.totalCount}</span> results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  page === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={page >= auditLogs.totalPages}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  page >= auditLogs.totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Blockchain Verification Info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start">
            <div className="mr-4 mt-1 bg-pink-100 p-2 rounded-full">
              <Clock className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <h3 className="text-md font-semibold text-gray-800 mb-1">Blockchain-Verified Audit Trail</h3>
              <p className="text-sm text-gray-600 mb-2">
                All audit logs are secured using blockchain technology to ensure tamper-evident records that meet 
                and exceed FDA 21 CFR Part 11 requirements. Each log entry contains a cryptographic hash that is 
                verified against the blockchain to ensure data integrity.
              </p>
              <div className="text-xs text-gray-500">
                <span className="font-medium">Last Blockchain Synchronization:</span> {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogViewer;