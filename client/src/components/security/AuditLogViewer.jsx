import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '../../hooks/use-toast';

const AuditLogViewer = () => {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    userId: '',
    action: '',
    resourceType: ''
  });
  
  // Fetch audit logs
  const fetchAuditLogs = async () => {
    const queryParams = new URLSearchParams({
      page,
      pageSize,
      ...(filter.startDate && { startDate: filter.startDate }),
      ...(filter.endDate && { endDate: filter.endDate }),
      ...(filter.userId && { userId: filter.userId }),
      ...(filter.action && { action: filter.action }),
      ...(filter.resourceType && { resourceType: filter.resourceType })
    });
    
    const response = await fetch(`/api/audit-logs?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch audit logs');
    }
    
    return response.json();
  };
  
  const { 
    data: auditLogsData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['/api/audit-logs', page, pageSize, filter],
    queryFn: fetchAuditLogs
  });
  
  // Handle verify integrity
  const handleVerifyIntegrity = async (auditRecord) => {
    try {
      const response = await fetch(`/api/fda-compliance/audit/verify/${auditRecord.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to verify audit record integrity');
      }
      
      const result = await response.json();
      
      if (result.verified) {
        toast.success('Audit record integrity verified', {
          title: 'Verification Successful'
        });
      } else {
        toast.error('Audit record integrity verification failed', {
          title: 'Verification Failed'
        });
      }
    } catch (error) {
      toast.error(`Error verifying audit record: ${error.message}`, {
        title: 'Verification Error'
      });
    }
  };
  
  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle apply filters
  const handleApplyFilters = () => {
    setPage(1); // Reset to first page
    refetch();
  };
  
  // Handle clear filters
  const handleClearFilters = () => {
    setFilter({
      startDate: '',
      endDate: '',
      userId: '',
      action: '',
      resourceType: ''
    });
    setPage(1);
    refetch();
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Get action badge class
  const getActionBadgeClass = (action) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'VIEW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };
  
  // Mock audit logs for UI display
  // In a real implementation, this would come from the API
  const mockAuditLogs = [
    {
      id: 'AUDIT-1681234567-123',
      userId: 'john.smith',
      action: 'CREATE',
      resourceType: 'DOCUMENT',
      resourceId: 'DOC-001',
      timestamp: '2025-04-26T09:15:23.456Z',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      details: {
        documentName: 'Clinical Study Report',
        documentType: 'CSR'
      },
      hash: 'f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8'
    },
    {
      id: 'AUDIT-1681234789-456',
      userId: 'jane.doe',
      action: 'UPDATE',
      resourceType: 'DOCUMENT',
      resourceId: 'DOC-001',
      timestamp: '2025-04-26T10:30:45.789Z',
      ipAddress: '192.168.1.2',
      userAgent: 'Mozilla/5.0',
      details: {
        documentName: 'Clinical Study Report',
        documentType: 'CSR',
        changedFields: ['status', 'version']
      },
      hash: 'a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b'
    },
    {
      id: 'AUDIT-1681235012-789',
      userId: 'robert.johnson',
      action: 'SIGNATURE',
      resourceType: 'DOCUMENT',
      resourceId: 'DOC-001',
      timestamp: '2025-04-26T11:45:12.345Z',
      ipAddress: '192.168.1.3',
      userAgent: 'Mozilla/5.0',
      details: {
        documentName: 'Clinical Study Report',
        documentType: 'CSR',
        signatureType: 'APPROVAL',
        signatureId: 'SIG-001'
      },
      hash: 'b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c'
    },
    {
      id: 'AUDIT-1681236234-012',
      userId: 'susan.williams',
      action: 'VIEW',
      resourceType: 'DOCUMENT',
      resourceId: 'DOC-001',
      timestamp: '2025-04-26T12:30:34.567Z',
      ipAddress: '192.168.1.4',
      userAgent: 'Mozilla/5.0',
      details: {
        documentName: 'Clinical Study Report',
        documentType: 'CSR'
      },
      hash: 'c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d'
    },
    {
      id: 'AUDIT-1681237456-345',
      userId: 'john.smith',
      action: 'EXPORT',
      resourceType: 'DOCUMENT',
      resourceId: 'DOC-001',
      timestamp: '2025-04-26T13:15:56.789Z',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      details: {
        documentName: 'Clinical Study Report',
        documentType: 'CSR',
        exportFormat: 'PDF'
      },
      hash: 'd1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e'
    }
  ];
  
  // Use mock data for display purpose
  // In a real implementation, use the actual data from the API
  const auditLogs = mockAuditLogs;
  
  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Audit Log</h2>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Audit Log</h2>
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">Failed to load audit logs</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Audit Log</h2>
      
      {/* Filters */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filter.startDate}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filter.endDate}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <input
              type="text"
              name="userId"
              value={filter.userId}
              onChange={handleFilterChange}
              placeholder="e.g., john.smith"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              name="action"
              value={filter.action}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="VIEW">View</option>
              <option value="SIGNATURE">Signature</option>
              <option value="EXPORT">Export</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
            <select
              name="resourceType"
              value={filter.resourceType}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
            >
              <option value="">All Types</option>
              <option value="DOCUMENT">Document</option>
              <option value="SIGNATURE">Signature</option>
              <option value="USER">User</option>
              <option value="SYSTEM">System</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Clear Filters
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
          >
            Apply Filters
          </button>
        </div>
      </div>
      
      {/* Audit Log Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resource
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP Address
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatTimestamp(log.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {log.userId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${getActionBadgeClass(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{log.resourceType}</div>
                  <div className="text-xs">{log.resourceId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.ipAddress}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <button
                    onClick={() => handleVerifyIntegrity(log)}
                    className="text-pink-600 hover:text-pink-900"
                  >
                    Verify Integrity
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div>
          <span className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{auditLogs.length}</span> of{' '}
            <span className="font-medium">{auditLogs.length}</span> results
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 rounded-md bg-pink-600 text-white">{page}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={auditLogs.length < pageSize}
            className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      
      {/* Blockchain Information */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h3 className="text-md font-semibold text-blue-800 mb-2">Enhanced Audit Trail Security</h3>
        <p className="text-sm text-blue-700">
          All audit records are secured using SHA-256 cryptographic hashing and backed up to a permissioned blockchain for enhanced security and tamper-evidence. Each record can be independently verified for integrity.
        </p>
      </div>
    </div>
  );
};

export default AuditLogViewer;