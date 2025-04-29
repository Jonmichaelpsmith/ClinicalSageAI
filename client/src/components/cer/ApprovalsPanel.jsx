import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Filter, FileText, UserCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function ApprovalsPanel() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Sample approvals data
  const approvals = [
    {
      id: 'apr-001',
      document: 'CER_Enzymex_Forte_v2.0.pdf',
      requestedBy: 'Emily Chen',
      requestedOn: 'April 15, 2025',
      deadline: 'April 22, 2025',
      status: 'pending'
    },
    {
      id: 'apr-002',
      document: 'CER_CardioFlow_v3.1.pdf',
      requestedBy: 'Michael Rodriguez',
      requestedOn: 'April 10, 2025',
      deadline: 'April 17, 2025',
      status: 'approved'
    },
    {
      id: 'apr-003',
      document: 'CER_GlucoGuard_v1.5.pdf',
      requestedBy: 'Sarah Johnson',
      requestedOn: 'April 14, 2025',
      deadline: 'April 21, 2025',
      status: 'pending'
    },
    {
      id: 'apr-004',
      document: 'CER_NeuroStim_v2.3.pdf',
      requestedBy: 'David Kim',
      requestedOn: 'April 08, 2025',
      deadline: 'April 15, 2025',
      status: 'rejected'
    }
  ];
  
  const filteredApprovals = selectedStatus === 'all' 
    ? approvals 
    : approvals.filter(a => a.status === selectedStatus);
  
  const handleItemSelect = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };
  
  const handleSelectAll = () => {
    if (selectedItems.length === filteredApprovals.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredApprovals.map(a => a.id));
    }
  };
  
  const handleBatchAction = (action) => {
    console.log(`Batch ${action} for:`, selectedItems);
    // In a real implementation, this would send a request to the API
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={16} />
            <div className="flex space-x-1">
              <Button
                variant={selectedStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('all')}
              >
                All
              </Button>
              <Button
                variant={selectedStatus === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('pending')}
              >
                Pending
              </Button>
              <Button
                variant={selectedStatus === 'approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('approved')}
              >
                Approved
              </Button>
              <Button
                variant={selectedStatus === 'rejected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('rejected')}
              >
                Rejected
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              disabled={selectedItems.length === 0}
              onClick={() => handleBatchAction('approve')}
              className="gap-1"
            >
              <CheckSquare size={14} />
              Batch Approve
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              disabled={selectedItems.length === 0}
              onClick={() => handleBatchAction('reject')}
              className="gap-1"
            >
              Batch Reject
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">
                    <input 
                      type="checkbox" 
                      checked={selectedItems.length === filteredApprovals.length && filteredApprovals.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="p-2 text-left">Document</th>
                  <th className="p-2 text-left">Requested By</th>
                  <th className="p-2 text-left">Requested On</th>
                  <th className="p-2 text-left">Deadline</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApprovals.map(approval => (
                  <tr key={approval.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <input 
                        type="checkbox" 
                        checked={selectedItems.includes(approval.id)}
                        onChange={() => handleItemSelect(approval.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-2 flex items-center gap-2">
                      <FileText size={16} />
                      {approval.document}
                    </td>
                    <td className="p-2 flex items-center gap-1">
                      <UserCheck size={14} />
                      {approval.requestedBy}
                    </td>
                    <td className="p-2">{approval.requestedOn}</td>
                    <td className="p-2">{approval.deadline}</td>
                    <td className="p-2">
                      <Badge variant={
                        approval.status === 'approved' ? 'success' : 
                        approval.status === 'rejected' ? 'destructive' : 
                        'warning'
                      }>
                        {approval.status}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button size="sm">Review</Button>
                        <Button size="sm" variant="outline">View</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}