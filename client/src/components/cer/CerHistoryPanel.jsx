import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import axios from 'axios';

export default function CerHistoryPanel() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        // This would be a real API call in production
        // const res = await axios.get('/api/cer/jobs/history');
        // setJobs(res.data.jobs);
        
        // Mock data for demo
        await new Promise(resolve => setTimeout(resolve, 600));
        setJobs([
          {
            id: 'JOB-20250427-001',
            deviceName: 'Enzymex Forte',
            status: 'completed',
            createdAt: '2025-04-27T08:30:00Z',
            completedAt: '2025-04-27T08:35:00Z',
            createdBy: 'John Smith',
            version: '2.0.0'
          },
          {
            id: 'JOB-20250426-010',
            deviceName: 'Enzymex Forte',
            status: 'completed',
            createdAt: '2025-04-26T14:22:00Z',
            completedAt: '2025-04-26T14:28:00Z',
            createdBy: 'Sarah Johnson',
            version: '1.2.0'
          },
          {
            id: 'JOB-20250425-005',
            deviceName: 'SI-456 Monitor',
            status: 'failed',
            createdAt: '2025-04-25T10:15:00Z',
            completedAt: null,
            createdBy: 'Michael Chen',
            error: 'Template validation error: missing required field "clinical_data"'
          },
          {
            id: 'JOB-20250424-002',
            deviceName: 'Enzymex Forte',
            status: 'completed',
            createdAt: '2025-04-24T16:40:00Z',
            completedAt: '2025-04-24T16:45:00Z',
            createdBy: 'John Smith',
            version: '1.1.0'
          },
          {
            id: 'JOB-20250422-001',
            deviceName: 'Enzymex Forte',
            status: 'completed',
            createdAt: '2025-04-22T14:30:00Z',
            completedAt: '2025-04-22T14:35:00Z',
            createdBy: 'John Smith',
            version: '1.0.0'
          }
        ]);
      } catch (err) {
        console.error('Failed to fetch history', err);
        setError('Failed to load CER generation history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'queued':
        return <Badge className="bg-yellow-100 text-yellow-800">Queued</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const handleDownload = (jobId) => {
    // In a real implementation, this would download the generated PDF
    window.open(`/api/cer/jobs/${jobId}/download`, '_blank');
  };

  const handleViewDetails = (jobId) => {
    // In a real implementation, this would show job details
    console.log('View details for job', jobId);
  };

  if (loading) return (
    <div className="flex justify-center items-center p-12">
      <div className="w-full max-w-md">
        <p className="text-center mb-4">Loading generation history...</p>
        <Progress value={66} className="w-full" />
      </div>
    </div>
  );

  if (error) return (
    <Card>
      <CardContent className="p-6">
        <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-800">
          <h3 className="font-semibold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">CER Generation History</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job ID</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>By</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map(job => (
              <TableRow key={job.id}>
                <TableCell>{job.id}</TableCell>
                <TableCell>{job.deviceName}</TableCell>
                <TableCell>{getStatusBadge(job.status)}</TableCell>
                <TableCell>{new Date(job.createdAt).toLocaleString()}</TableCell>
                <TableCell>{job.createdBy}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {job.status === 'completed' && (
                      <Button size="sm" onClick={() => handleDownload(job.id)}>Download</Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleViewDetails(job.id)}>Details</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}