import React, { useState, useEffect } from 'react';
import { 
  FileText, Clock, User, ArrowUp, ArrowDown, 
  ChevronDown, ChevronUp, Filter, Search, Calendar 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

/**
 * QMP Audit Trail Panel Component
 * 
 * This component displays a comprehensive audit trail for the Quality Management Plan,
 * allowing users to track all changes made over time with robust filtering capabilities.
 */
const QmpAuditTrailPanel = ({ deviceName, manufacturer }) => {
  // Filter and sort states
  const [filterType, setFilterType] = useState('all');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('last30days');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Mock audit trail data - would come from API in production
  const [auditEntries, setAuditEntries] = useState([
    {
      id: 1,
      timestamp: '2025-05-08T14:32:00Z',
      user: 'John Smith',
      action: 'created',
      component: 'QMP',
      section: 'Objectives',
      details: 'Initial creation of quality management objectives',
      changes: {
        before: null,
        after: 'Defined 3 primary quality objectives for clinical evaluation'
      }
    },
    {
      id: 2,
      timestamp: '2025-05-08T15:10:00Z',
      user: 'Sarah Johnson',
      action: 'updated',
      component: 'QMP',
      section: 'Critical-to-Quality Factors',
      details: 'Added risk factors for clinical data evaluation',
      changes: {
        before: '2 CtQ factors defined',
        after: '5 CtQ factors defined with risk categories'
      }
    },
    {
      id: 3,
      timestamp: '2025-05-07T09:45:00Z',
      user: 'Maria Garcia',
      action: 'updated',
      component: 'QMP',
      section: 'Gating Criteria',
      details: 'Modified quality gates for benefit-risk analysis',
      changes: {
        before: 'Section requires 3 evidence sources',
        after: 'Section requires 5 evidence sources and statistical justification'
      }
    },
    {
      id: 4,
      timestamp: '2025-05-06T11:20:00Z',
      user: 'Robert Lee',
      action: 'updated',
      component: 'QMP',
      section: 'Risk Management',
      details: 'Added verification steps for clinical data collection',
      changes: {
        before: 'Basic verification process',
        after: 'Enhanced verification with 3-level review process'
      }
    },
    {
      id: 5,
      timestamp: '2025-05-05T16:15:00Z',
      user: 'Jennifer Williams',
      action: 'approved',
      component: 'QMP',
      section: 'Complete QMP',
      details: 'Formal approval of QMP version 1.0',
      changes: {
        before: 'Draft status',
        after: 'Approved status'
      }
    },
    {
      id: 6,
      timestamp: '2025-05-04T10:30:00Z',
      user: 'Thomas Brown',
      action: 'created',
      component: 'QMP',
      section: 'Data Integrity',
      details: 'Initial data integrity controls for clinical evaluation',
      changes: {
        before: null,
        after: 'Established data integrity protocols for clinical evidence'
      }
    },
    {
      id: 7,
      timestamp: '2025-05-03T14:05:00Z',
      user: 'Sarah Johnson',
      action: 'updated',
      component: 'QMP',
      section: 'Quality Controls',
      details: 'Enhanced verification requirements for literature data',
      changes: {
        before: 'Single verification step',
        after: 'Triple verification with expertise requirements'
      }
    }
  ]);
  
  // Filter and sort the audit entries
  const filteredEntries = auditEntries
    .filter(entry => {
      // Filter by type
      if (filterType !== 'all' && entry.action !== filterType) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm && !entry.details.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !entry.section.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !entry.user.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filter by date range
      const entryDate = new Date(entry.timestamp);
      const now = new Date();
      
      if (dateRange === 'last7days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        if (entryDate < sevenDaysAgo) {
          return false;
        }
      } else if (dateRange === 'last30days') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        if (entryDate < thirtyDaysAgo) {
          return false;
        }
      } else if (dateRange === 'last90days') {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(now.getDate() - 90);
        if (entryDate < ninetyDaysAgo) {
          return false;
        }
      }
      
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });
  
  // Format the timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }) + ' at ' + date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  // Get appropriate icon for action type
  const getActionIcon = (action) => {
    switch (action) {
      case 'created':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Created</Badge>;
      case 'updated':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Updated</Badge>;
      case 'deleted':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Deleted</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Approved</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-md shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold">Quality Management Plan Audit Trail</h2>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="h-4 w-4 mr-1" />
              Filters
              {showAdvancedFilters ? 
                <ChevronUp className="h-4 w-4 ml-1" /> : 
                <ChevronDown className="h-4 w-4 ml-1" />
              }
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => console.log('Export audit trail')}>
              <FileText className="h-4 w-4 mr-1" />
              Export
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}
            >
              {sortDirection === 'desc' ? 
                <ArrowDown className="h-4 w-4 mr-1" /> : 
                <ArrowUp className="h-4 w-4 mr-1" />
              }
              {sortDirection === 'desc' ? 'Newest First' : 'Oldest First'}
            </Button>
          </div>
        </div>
        
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-md">
            <div>
              <label className="block text-sm font-medium mb-1">Action Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="updated">Updated</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="last90days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search audit trail..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          {filteredEntries.length > 0 ? (
            filteredEntries.map(entry => (
              <Card key={entry.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                  <div className="flex flex-col">
                    <CardTitle className="text-md font-medium">
                      {entry.section}
                    </CardTitle>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1 inline" />
                      {formatTimestamp(entry.timestamp)}
                    </div>
                  </div>
                  {getActionIcon(entry.action)}
                </CardHeader>
                
                <CardContent className="p-4 pt-2">
                  <div className="flex items-center mb-2">
                    <User className="h-4 w-4 mr-1 text-gray-500" />
                    <span className="text-sm font-medium">{entry.user}</span>
                  </div>
                  
                  <div className="text-sm">{entry.details}</div>
                  
                  {entry.changes && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      {entry.changes.before && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Previous: </span>
                          {entry.changes.before}
                        </div>
                      )}
                      {entry.changes.after && (
                        <div className="text-sm text-blue-600">
                          <span className="font-medium">Changed to: </span>
                          {entry.changes.after}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">No matching audit entries found</p>
              <p className="text-sm">Try adjusting your filters to see more results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QmpAuditTrailPanel;