import React, { useState } from 'react';
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  User, 
  Clock, 
  AlertTriangle, 
  ShieldCheck,
  RefreshCw,
  Zap,
  CheckCircle
} from 'lucide-react';

/**
 * Audit Log Viewer Component
 * 
 * This component provides a comprehensive view of system audit logs
 * for FDA 21 CFR Part 11 compliance.
 * 
 * Features:
 * - Advanced filtering and search of audit logs
 * - Timeline view of system events
 * - Security event highlighting
 * - Export capabilities for audits and inspections
 * - Blockchain verification integration
 */
export default function AuditLogViewer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('7d');
  const [eventTypes, setEventTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [blockchainVerification, setBlockchainVerification] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Sample audit logs (in a real implementation, these would come from the API)
  const auditLogs = [
    {
      id: 'log-001',
      timestamp: '2025-04-26T10:15:32Z',
      eventType: 'AUTHENTICATION',
      user: 'john.smith',
      details: {
        ip: '192.168.1.100',
        device: 'Chrome/Windows',
        success: true
      },
      blockchainVerified: true
    },
    {
      id: 'log-002',
      timestamp: '2025-04-26T10:16:05Z',
      eventType: 'DOCUMENT_VIEWED',
      user: 'john.smith',
      details: {
        documentId: 'DOC-12458',
        documentTitle: 'Clinical Study Report',
        documentVersion: '2.3'
      },
      blockchainVerified: true
    },
    {
      id: 'log-003',
      timestamp: '2025-04-26T10:18:22Z',
      eventType: 'ELECTRONIC_SIGNATURE_CREATED',
      user: 'john.smith',
      details: {
        documentId: 'DOC-12458',
        documentTitle: 'Clinical Study Report',
        documentVersion: '2.3',
        signatureId: 'SIG-78923',
        meaning: 'APPROVAL'
      },
      blockchainVerified: true
    },
    {
      id: 'log-004',
      timestamp: '2025-04-26T11:05:47Z',
      eventType: 'AUTHENTICATION_FAILED',
      user: 'mary.johnson',
      details: {
        ip: '192.168.1.105',
        device: 'Safari/MacOS',
        reason: 'INVALID_PASSWORD',
        attemptNumber: 1
      },
      blockchainVerified: false
    },
    {
      id: 'log-005',
      timestamp: '2025-04-26T11:06:12Z',
      eventType: 'AUTHENTICATION',
      user: 'mary.johnson',
      details: {
        ip: '192.168.1.105',
        device: 'Safari/MacOS',
        success: true
      },
      blockchainVerified: true
    },
    {
      id: 'log-006',
      timestamp: '2025-04-26T11:10:33Z',
      eventType: 'SYSTEM_CONFIGURATION_CHANGED',
      user: 'admin',
      details: {
        setting: 'PASSWORD_POLICY',
        oldValue: { minLength: 8 },
        newValue: { minLength: 12 }
      },
      blockchainVerified: true
    },
    {
      id: 'log-007',
      timestamp: '2025-04-26T12:42:18Z',
      eventType: 'DATA_INTEGRITY_VERIFIED',
      user: 'system',
      details: {
        documentId: 'DOC-12983',
        verified: false,
        reason: 'HASH_MISMATCH'
      },
      blockchainVerified: true
    },
    {
      id: 'log-008',
      timestamp: '2025-04-26T14:15:26Z',
      eventType: 'USER_ROLE_CHANGED',
      user: 'admin',
      details: {
        targetUser: 'robert.wilson',
        oldRole: 'EDITOR',
        newRole: 'APPROVER'
      },
      blockchainVerified: true
    },
    {
      id: 'log-009',
      timestamp: '2025-04-26T15:22:05Z',
      eventType: 'DOCUMENT_CREATED',
      user: 'sarah.chen',
      details: {
        documentId: 'DOC-13578',
        documentTitle: 'Study Protocol Amendment',
        documentVersion: '1.0'
      },
      blockchainVerified: true
    },
    {
      id: 'log-010',
      timestamp: '2025-04-26T16:05:12Z',
      eventType: 'COMPLIANCE_VALIDATION_COMPLETED',
      user: 'system',
      details: {
        validationId: 'VAL-45623',
        overallScore: 98,
        status: 'COMPLIANT'
      },
      blockchainVerified: true
    }
  ];

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get all unique event types from logs
  const getAllEventTypes = () => {
    const types = new Set();
    auditLogs.forEach(log => types.add(log.eventType));
    return Array.from(types);
  };

  // Get all unique users from logs
  const getAllUsers = () => {
    const userSet = new Set();
    auditLogs.forEach(log => userSet.add(log.user));
    return Array.from(userSet);
  };

  // Toggle event type filter
  const toggleEventType = (eventType) => {
    if (eventTypes.includes(eventType)) {
      setEventTypes(eventTypes.filter(type => type !== eventType));
    } else {
      setEventTypes([...eventTypes, eventType]);
    }
  };

  // Toggle user filter
  const toggleUser = (user) => {
    if (users.includes(user)) {
      setUsers(users.filter(u => u !== user));
    } else {
      setUsers([...users, user]);
    }
  };

  // Handle refresh logs
  const handleRefresh = () => {
    setIsLoading(true);
    // In a real implementation, this would fetch logs from the API
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Handle export logs
  const handleExport = () => {
    // In a real implementation, this would export logs to a file
    alert('Audit logs exported');
  };

  // Filter logs based on search, date range, event types, and users
  const filteredLogs = auditLogs.filter(log => {
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      log.eventType.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
      JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by event type
    const matchesEventType = eventTypes.length === 0 || eventTypes.includes(log.eventType);
    
    // Filter by user
    const matchesUser = users.length === 0 || users.includes(log.user);

    // Filter by blockchain verification
    const matchesBlockchainVerification = !blockchainVerification || log.blockchainVerified;
    
    // Filter by date range
    const logDate = new Date(log.timestamp);
    const now = new Date();
    let matchesDateRange = true;
    
    if (dateRange === '24h') {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      matchesDateRange = logDate >= yesterday;
    } else if (dateRange === '7d') {
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDateRange = logDate >= lastWeek;
    } else if (dateRange === '30d') {
      const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchesDateRange = logDate >= lastMonth;
    }
    
    return matchesSearch && matchesEventType && matchesUser && matchesDateRange && matchesBlockchainVerification;
  });

  // Get event type icon
  const getEventTypeIcon = (eventType) => {
    if (eventType.includes('AUTHENTICATION')) {
      return <User className="h-5 w-5 text-indigo-500" />;
    } else if (eventType.includes('DOCUMENT')) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else if (eventType.includes('ELECTRONIC_SIGNATURE')) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (eventType.includes('SYSTEM')) {
      return <Settings className="h-5 w-5 text-gray-500" />;
    } else if (eventType.includes('DATA_INTEGRITY')) {
      return <Shield className="h-5 w-5 text-purple-500" />;
    } else if (eventType.includes('USER')) {
      return <UserCog className="h-5 w-5 text-orange-500" />;
    } else if (eventType.includes('COMPLIANCE')) {
      return <ShieldCheck className="h-5 w-5 text-teal-500" />;
    } else {
      return <Activity className="h-5 w-5 text-gray-400" />;
    }
  };

  // Get event type badge color
  const getEventTypeBadgeColor = (eventType) => {
    if (eventType.includes('FAILED') || eventType.includes('ERROR')) {
      return 'bg-red-100 text-red-800';
    } else if (eventType.includes('WARNING')) {
      return 'bg-yellow-100 text-yellow-800';
    } else if (eventType.includes('AUTHENTICATION') || eventType.includes('AUTHORIZATION')) {
      return 'bg-indigo-100 text-indigo-800';
    } else if (eventType.includes('DOCUMENT')) {
      return 'bg-blue-100 text-blue-800';
    } else if (eventType.includes('SIGNATURE')) {
      return 'bg-green-100 text-green-800';
    } else if (eventType.includes('SYSTEM')) {
      return 'bg-gray-100 text-gray-800';
    } else if (eventType.includes('DATA')) {
      return 'bg-purple-100 text-purple-800';
    } else if (eventType.includes('USER')) {
      return 'bg-orange-100 text-orange-800';
    } else if (eventType.includes('COMPLIANCE')) {
      return 'bg-teal-100 text-teal-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Activity className="mr-2 h-5 w-5" />
          Audit Log Viewer
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          Comprehensive audit logs for FDA 21 CFR Part 11 compliance
        </p>
      </div>

      {/* Filters */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search audit logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Date Range */}
          <div>
            <label htmlFor="date-range" className="block text-sm font-medium text-gray-700">Date Range</label>
            <select
              id="date-range"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Event Type Dropdown */}
          <div className="relative">
            <label htmlFor="event-type" className="block text-sm font-medium text-gray-700">Event Type</label>
            <select
              id="event-type"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  toggleEventType(e.target.value);
                  e.target.value = "";
                }
              }}
            >
              <option value="">Select Event Type</option>
              {getAllEventTypes().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* User Dropdown */}
          <div className="relative">
            <label htmlFor="user" className="block text-sm font-medium text-gray-700">User</label>
            <select
              id="user"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  toggleUser(e.target.value);
                  e.target.value = "";
                }
              }}
            >
              <option value="">Select User</option>
              {getAllUsers().map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters */}
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {/* Event Type Filters */}
            {eventTypes.map(type => (
              <span
                key={type}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {type}
                <button
                  type="button"
                  className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-500 focus:text-white"
                  onClick={() => toggleEventType(type)}
                >
                  <span className="sr-only">Remove filter for {type}</span>
                  <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                    <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                  </svg>
                </button>
              </span>
            ))}

            {/* User Filters */}
            {users.map(user => (
              <span
                key={user}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                <User className="mr-1 h-3 w-3" />
                {user}
                <button
                  type="button"
                  className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-green-400 hover:bg-green-200 hover:text-green-500 focus:outline-none focus:bg-green-500 focus:text-white"
                  onClick={() => toggleUser(user)}
                >
                  <span className="sr-only">Remove filter for {user}</span>
                  <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                    <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                  </svg>
                </button>
              </span>
            ))}

            {/* Blockchain Verification Filter */}
            <div className="flex items-center">
              <input
                id="blockchain-verification"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={blockchainVerification}
                onChange={() => setBlockchainVerification(!blockchainVerification)}
              />
              <label htmlFor="blockchain-verification" className="ml-2 block text-sm text-gray-700">
                Show only blockchain verified
              </label>
            </div>

            {/* Clear All Filters */}
            {(eventTypes.length > 0 || users.length > 0 || searchTerm || blockchainVerification) && (
              <button
                type="button"
                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => {
                  setEventTypes([]);
                  setUsers([]);
                  setSearchTerm('');
                  setBlockchainVerification(false);
                }}
              >
                Clear all filters
              </button>
            )}
          </div>
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
                Event Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Blockchain
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto" />
                  <p className="mt-2">Loading audit logs...</p>
                </td>
              </tr>
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      {formatDate(log.timestamp)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEventTypeBadgeColor(log.eventType)}`}>
                      {log.eventType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      {log.user}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {Object.entries(log.details).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}:</span> {
                          typeof value === 'object' 
                            ? JSON.stringify(value)
                            : String(value)
                        }
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {log.blockchainVerified ? (
                      <Zap className="h-5 w-5 text-green-500 mx-auto" title="Blockchain verified" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mx-auto" title="Not blockchain verified" />
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  No audit logs found. Try adjusting your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination and Actions */}
      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={filteredLogs.length < 10}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{Math.min(1, filteredLogs.length)}</span> to <span className="font-medium">{Math.min(10, filteredLogs.length)}</span> of{' '}
              <span className="font-medium">{filteredLogs.length}</span> results
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Logs
            </button>
          </div>
        </div>
      </div>

      {/* FDA Compliance Notice */}
      <div className="bg-blue-50 p-4 border-t border-blue-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <ShieldCheck className="h-5 w-5 text-blue-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">FDA 21 CFR Part 11 Compliance</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                These audit logs provide a complete record of all system events in compliance with FDA 21 CFR Part 11.
                Blockchain verification adds an additional layer of security beyond FDA requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}