import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import axios from 'axios';

export default function ApprovalsPanel() {
  const [jobs, setJobs] = useState([]);
  const [statusFilter, setStatusFilter] = useState('in-review');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // This would be a real API call in production
      // const res = await axios.get('/api/cer/jobs', { params: { status: statusFilter } });
      // setJobs(res.data.data);
      
      // Mock data for demo
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Different data based on status filter
      if (statusFilter === 'in-review') {
        setJobs([
          { 
            job_id: 'JOB-20250428-001', 
            title: 'Enzymex Forte CER', 
            status: 'in-review', 
            created_at: '2025-04-28T09:15:00Z',
            submitter: 'Michael Chen',
            type: 'EU MDR',
            selected: false
          },
          { 
            job_id: 'JOB-20250428-002', 
            title: 'SI-456 Monitor CER', 
            status: 'in-review', 
            created_at: '2025-04-28T11:30:00Z',
            submitter: 'Sarah Johnson',
            type: 'ISO 14155',
            selected: false
          },
          { 
            job_id: 'JOB-20250428-003', 
            title: 'DiagnoScan X1 CER', 
            status: 'in-review', 
            created_at: '2025-04-28T14:45:00Z',
            submitter: 'John Smith',
            type: 'EU MDR',
            selected: false
          }
        ]);
      } else if (statusFilter === 'pending') {
        setJobs([
          { 
            job_id: 'JOB-20250427-005', 
            title: 'Enzymex Forte Supplemental', 
            status: 'pending', 
            created_at: '2025-04-27T16:20:00Z',
            submitter: 'Michael Chen',
            type: 'EU MDR',
            selected: false
          },
          { 
            job_id: 'JOB-20250427-008', 
            title: 'CardioCare Device CER', 
            status: 'pending', 
            created_at: '2025-04-27T17:15:00Z',
            submitter: 'Sarah Johnson',
            type: 'FDA 510(k)',
            selected: false
          }
        ]);
      } else if (statusFilter === 'approved') {
        setJobs([
          { 
            job_id: 'JOB-20250426-002', 
            title: 'Enzymex Forte CER', 
            status: 'approved', 
            created_at: '2025-04-26T10:15:00Z',
            approved_at: '2025-04-26T14:30:00Z',
            submitter: 'John Smith',
            reviewer: 'Sarah Johnson',
            type: 'EU MDR',
            selected: false
          },
          { 
            job_id: 'JOB-20250425-003', 
            title: 'DiagnoScan X1 CER', 
            status: 'approved', 
            created_at: '2025-04-25T09:30:00Z',
            approved_at: '2025-04-25T11:45:00Z',
            submitter: 'Michael Chen',
            reviewer: 'John Smith',
            type: 'EU MDR',
            selected: false
          }
        ]);
      } else if (statusFilter === 'rejected') {
        setJobs([
          { 
            job_id: 'JOB-20250424-001', 
            title: 'SI-456 Monitor CER', 
            status: 'rejected', 
            created_at: '2025-04-24T15:00:00Z',
            rejected_at: '2025-04-24T16:30:00Z',
            submitter: 'Sarah Johnson',
            reviewer: 'John Smith',
            rejection_reason: 'Incomplete risk analysis section and missing clinical data references',
            type: 'ISO 14155',
            selected: false
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to load approvals', err);
      setError('Failed to load approval requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, [statusFilter]);

  const handleBatchAction = async (action) => {
    const selectedIds = jobs.filter(j => j.selected).map(j => j.job_id);
    if (!selectedIds.length) {
      alert('Please select at least one report to process');
      return;
    }
    
    setLoading(true);
    try {
      // This would be a real API call in production
      // await axios.post('/api/cer/jobs/batch-review', { ids: selectedIds, decision: action });
      
      // Mock success for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Batch ${action} for jobs:`, selectedIds);
      alert(`Successfully ${action === 'approved' ? 'approved' : 'rejected'} ${selectedIds.length} report(s)`);
      fetchJobs();
    } catch (err) {
      console.error('Batch action failed', err);
      setError(`Failed to ${action} selected reports`);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setJobs(jobs.map(j => j.job_id === id ? { ...j, selected: !j.selected } : j));
  };

  const toggleSelectAll = () => {
    const allSelected = jobs.every(j => j.selected);
    setJobs(jobs.map(j => ({ ...j, selected: !allSelected })));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'in-review':
        return <Badge className="bg-blue-100 text-blue-800">In Review</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center p-12">
      <div className="w-full max-w-md">
        <p className="text-center mb-4">Loading approval requests...</p>
        <Progress value={60} className="w-full" />
      </div>
    </div>
  );

  if (error) return (
    <Card>
      <CardContent className="pt-6">
        <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-800">
          <h3 className="font-semibold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
            <h3 className="text-lg font-semibold">Approval Requests</h3>
            <div className="flex gap-2">
              <select 
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="in-review">In Review</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              {(statusFilter === 'in-review' || statusFilter === 'pending') && (
                <>
                  <Button 
                    onClick={() => handleBatchAction('approved')} 
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={loading || !jobs.some(j => j.selected)}
                  >
                    Batch Approve
                  </Button>
                  <Button 
                    onClick={() => handleBatchAction('rejected')} 
                    variant="destructive"
                    disabled={loading || !jobs.some(j => j.selected)}
                  >
                    Batch Reject
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No reports found with status "{statusFilter}"
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {(statusFilter === 'in-review' || statusFilter === 'pending') && (
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={jobs.length > 0 && jobs.every(j => j.selected)} 
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                  )}
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitter</TableHead>
                  {(statusFilter === 'approved' || statusFilter === 'rejected') && (
                    <TableHead>Reviewer</TableHead>
                  )}
                  <TableHead>Submitted</TableHead>
                  {statusFilter === 'rejected' && (
                    <TableHead>Reason</TableHead>
                  )}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map(job => (
                  <TableRow key={job.job_id}>
                    {(statusFilter === 'in-review' || statusFilter === 'pending') && (
                      <TableCell>
                        <Checkbox 
                          checked={job.selected} 
                          onCheckedChange={() => toggleSelect(job.job_id)}
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-mono text-xs">{job.job_id}</TableCell>
                    <TableCell>{job.title}</TableCell>
                    <TableCell>{job.type}</TableCell>
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
                    <TableCell>{job.submitter}</TableCell>
                    {(statusFilter === 'approved' || statusFilter === 'rejected') && (
                      <TableCell>{job.reviewer}</TableCell>
                    )}
                    <TableCell>{new Date(job.created_at).toLocaleString()}</TableCell>
                    {statusFilter === 'rejected' && (
                      <TableCell className="max-w-[200px] truncate" title={job.rejection_reason}>
                        {job.rejection_reason}
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => window.open(`/api/cer/jobs/${job.job_id}/view`, '_blank')}>
                          View
                        </Button>
                        {(statusFilter === 'in-review' || statusFilter === 'pending') && (
                          <>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleBatchAction('approved', [job.job_id])}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => {
                                const reason = prompt('Enter rejection reason:');
                                if (reason) {
                                  handleBatchAction('rejected', [job.job_id], reason);
                                }
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}