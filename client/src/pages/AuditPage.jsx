import React, { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Filter, Eye, Download } from "lucide-react";

/**
 * Audit Page - Display API audit logs
 */
const AuditPage = () => {
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filter, setFilter] = useState({
    method: '',
    path: '',
    user: '',
    dateFrom: '',
    dateTo: ''
  });

  // Load audit logs
  useEffect(() => {
    const fetchAuditLogs = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/audit/logs');
        const data = await response.json();
        setAuditLogs(data);
        setFilteredLogs(data);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  // Apply filters to audit logs
  useEffect(() => {
    let filtered = [...auditLogs];
    
    if (filter.method) {
      filtered = filtered.filter(log => 
        log.method.toLowerCase().includes(filter.method.toLowerCase())
      );
    }
    
    if (filter.path) {
      filtered = filtered.filter(log => 
        log.path.toLowerCase().includes(filter.path.toLowerCase())
      );
    }
    
    if (filter.user) {
      filtered = filtered.filter(log => 
        (log.userId || '').toLowerCase().includes(filter.user.toLowerCase()) ||
        (log.username || '').toLowerCase().includes(filter.user.toLowerCase())
      );
    }
    
    if (filter.dateFrom) {
      const fromDate = new Date(filter.dateFrom);
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= fromDate;
      });
    }
    
    if (filter.dateTo) {
      const toDate = new Date(filter.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate <= toDate;
      });
    }
    
    setFilteredLogs(filtered);
  }, [filter, auditLogs]);

  // Reset filters
  const resetFilters = () => {
    setFilter({
      method: '',
      path: '',
      user: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  // Download logs
  const downloadAuditLogs = () => {
    const csvContent = [
      // Header
      ['Timestamp', 'Method', 'Path', 'User ID', 'Username', 'IP Address', 'Status', 'Duration (ms)'].join(','),
      // Data rows
      ...filteredLogs.map(log => [
        log.timestamp,
        log.method,
        log.path,
        log.userId || '',
        log.username || '',
        log.ipAddress,
        log.statusCode,
        log.duration
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // View log details
  const viewLogDetails = (log) => {
    alert(JSON.stringify(log, null, 2));
  };

  return (
    <div className="audit-page-container p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Audit Trail</h1>
        <Button
          onClick={downloadAuditLogs}
          disabled={loading || filteredLogs.length === 0}
          className="flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Logs</CardTitle>
          <CardDescription>Search and filter audit trail records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block mb-1 font-medium">HTTP Method</label>
              <select
                className="w-full p-2 border rounded"
                value={filter.method}
                onChange={(e) => setFilter(prev => ({ ...prev, method: e.target.value }))}
              >
                <option value="">All Methods</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-1 font-medium">API Path</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={filter.path}
                onChange={(e) => setFilter(prev => ({ ...prev, path: e.target.value }))}
                placeholder="e.g., /api/projects"
              />
            </div>
            
            <div>
              <label className="block mb-1 font-medium">User ID/Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={filter.user}
                onChange={(e) => setFilter(prev => ({ ...prev, user: e.target.value }))}
                placeholder="User identifier"
              />
            </div>
            
            <div>
              <label className="block mb-1 font-medium">Date From</label>
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={filter.dateFrom}
                onChange={(e) => setFilter(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block mb-1 font-medium">Date To</label>
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={filter.dateTo}
                onChange={(e) => setFilter(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={resetFilters}
              className="flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Audit Log Records</CardTitle>
          <CardDescription>
            {loading ? 'Loading audit records...' : `${filteredLogs.length} records found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="border rounded overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border-b text-left">Timestamp</th>
                    <th className="p-2 border-b text-left">Method</th>
                    <th className="p-2 border-b text-left">Path</th>
                    <th className="p-2 border-b text-left">User</th>
                    <th className="p-2 border-b text-left">IP Address</th>
                    <th className="p-2 border-b text-center">Status</th>
                    <th className="p-2 border-b text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-2 border-b">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="p-2 border-b">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          log.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                          log.method === 'POST' ? 'bg-green-100 text-green-800' :
                          log.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                          log.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.method}
                        </span>
                      </td>
                      <td className="p-2 border-b font-mono text-xs">{log.path}</td>
                      <td className="p-2 border-b">{log.username || log.userId || '-'}</td>
                      <td className="p-2 border-b font-mono text-xs">{log.ipAddress}</td>
                      <td className="p-2 border-b text-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs ${
                          log.statusCode < 300 ? 'bg-green-100 text-green-800' :
                          log.statusCode < 400 ? 'bg-blue-100 text-blue-800' :
                          log.statusCode < 500 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {log.statusCode}
                        </span>
                      </td>
                      <td className="p-2 border-b text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewLogDetails(log)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-8 border rounded bg-gray-50">
              <p className="text-gray-500">No audit logs found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditPage;