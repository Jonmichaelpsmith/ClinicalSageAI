import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { 
  FileText, 
  Clock, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  Filter, 
  Loader, 
  RefreshCw,
  FileSearch
} from 'lucide-react';
import { handleApiError } from '@/services/errorHandling';
import { useToast } from '@/hooks/use-toast';
import ReviewDrawer from './ReviewDrawer';

/**
 * CER History Panel
 * 
 * This component provides a UI for viewing and filtering CER jobs
 * along with the ability to review them.
 */
const CerHistoryPanel = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [isReviewDrawerOpen, setIsReviewDrawerOpen] = useState(false);
  
  const { toast } = useToast();
  
  // Fetch jobs with filters and pagination
  const fetchJobs = async (page = 1) => {
    setIsLoading(true);
    setIsError(false);
    
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      params.append('page', page);
      params.append('limit', pagination.limit);
      
      const response = await fetch(`/api/cer/jobs?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`);
      }
      
      const data = await response.json();
      setJobs(data.data);
      setPagination({
        ...pagination,
        page: data.pagination.page,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      });
    } catch (error) {
      setIsError(true);
      handleApiError(error, {
        context: 'CER History',
        endpoint: '/api/cer/jobs',
        toast
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial fetch and refetch when filters change
  useEffect(() => {
    fetchJobs(1);
  }, [statusFilter]);
  
  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) {
      return;
    }
    fetchJobs(newPage);
  };
  
  // Open review drawer for a job
  const handleReviewClick = async (job) => {
    try {
      // Fetch the full job details including approval history
      const response = await fetch(`/api/cer/jobs/${job.job_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch job details: ${response.statusText}`);
      }
      
      const jobDetails = await response.json();
      setSelectedJob(jobDetails);
      setIsReviewDrawerOpen(true);
    } catch (error) {
      handleApiError(error, {
        context: 'CER Review',
        endpoint: `/api/cer/jobs/${job.job_id}`,
        toast
      });
    }
  };
  
  // Format dates for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Render status badge with appropriate color
  const renderStatusBadge = (status) => {
    switch(status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      case 'changes_requested':
      case 'in-review':
        return <Badge className="bg-yellow-500">In Review</Badge>;
      case 'draft':
        return <Badge className="bg-blue-500">Draft</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Render appropriate icon for job status
  const renderStatusIcon = (status) => {
    switch(status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'changes_requested':
      case 'in-review':
        return <RefreshCw className="h-5 w-5 text-yellow-500" />;
      case 'draft':
        return <FileText className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };
  
  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    const { page, totalPages } = pagination;
    
    // Previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious 
          onClick={() => handlePageChange(page - 1)}
          className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
        />
      </PaginationItem>
    );
    
    // First page
    if (totalPages > 0) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            isActive={page === 1}
            onClick={() => handlePageChange(1)}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Ellipsis if needed
    if (page > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Pages around current
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      if (i === 1 || i === totalPages) continue; // Skip first and last pages as they're rendered separately
      
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={page === i}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Ellipsis if needed
    if (page < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Last page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            isActive={page === totalPages}
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Next button
    items.push(
      <PaginationItem key="next">
        <PaginationNext 
          onClick={() => handlePageChange(page + 1)}
          className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
        />
      </PaginationItem>
    );
    
    return items;
  };
  
  return (
    <>
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <FileSearch className="h-5 w-5" />
            Clinical Evaluation Reports
          </CardTitle>
          <CardDescription>
            View and manage your CER reports
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="all">All Reports</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="in-review">In Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => fetchJobs(pagination.page)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {pagination.total} report{pagination.total !== 1 ? 's' : ''}
            </div>
          </div>
          
          {isError ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
              <h3 className="text-lg font-medium">Failed to load reports</h3>
              <p className="text-sm text-muted-foreground mb-4">
                There was an error loading the CER reports.
              </p>
              <Button onClick={() => fetchJobs(pagination.page)}>
                Try Again
              </Button>
            </div>
          ) : isLoading && jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8">
              <Loader className="h-10 w-10 animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">Loading reports...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No reports found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {statusFilter === 'all' 
                  ? 'There are no CER reports available.' 
                  : `No reports with status "${statusFilter}" found.`}
              </p>
              {statusFilter !== 'all' && (
                <Button variant="outline" onClick={() => setStatusFilter('all')}>
                  View All Reports
                </Button>
              )}
            </div>
          ) : (
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-3">
                {jobs.map((job) => (
                  <Card key={job.job_id} className="border shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {renderStatusIcon(job.status)}
                          </div>
                          <div>
                            <h4 className="font-medium text-base flex items-center gap-2">
                              {job.job_id}
                              {renderStatusBadge(job.status)}
                            </h4>
                            <div className="mt-1 text-sm text-muted-foreground flex flex-col gap-1">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                Created: {formatDate(job.created_at)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                Reviews: {job.approvals_count || 0}
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleReviewClick(job)}
                          size="sm"
                        >
                          Review
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
        
        {jobs.length > 0 && pagination.totalPages > 1 && (
          <CardFooter>
            <Pagination className="w-full flex justify-center">
              <PaginationContent>
                {renderPaginationItems()}
              </PaginationContent>
            </Pagination>
          </CardFooter>
        )}
      </Card>
      
      <ReviewDrawer
        isOpen={isReviewDrawerOpen}
        onClose={() => setIsReviewDrawerOpen(false)}
        job={selectedJob}
        onReviewSubmitted={() => {
          setIsReviewDrawerOpen(false);
          fetchJobs(pagination.page);
        }}
      />
    </>
  );
};

export default CerHistoryPanel;