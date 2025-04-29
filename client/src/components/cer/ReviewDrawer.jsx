import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { checkCircle, alertCircle, fileEdit, fileText, clock, checkSquare, xSquare, rotateCcw } from 'lucide-react';
import { handleApiError } from '@/services/errorHandling';

/**
 * CER Review Drawer
 * 
 * This component provides a UI for reviewing Clinical Evaluation Reports (CERs)
 * including:
 * - Viewing job details
 * - Viewing previous review history
 * - Submitting a review (approve, reject, request changes)
 * - Adding review comments
 */
const ReviewDrawer = ({ isOpen, onClose, job, onReviewSubmitted }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [reviewDecision, setReviewDecision] = useState('');
  const [reviewComments, setReviewComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset form when drawer is opened or job changes
  React.useEffect(() => {
    if (isOpen) {
      setReviewDecision('');
      setReviewComments('');
      setActiveTab('details');
    }
  }, [isOpen, job?.job_id]);
  
  const handleSubmit = async () => {
    if (!reviewDecision) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/cer/jobs/${job.job_id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          decision: reviewDecision,
          comments: reviewComments.trim() || null,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to submit review: ${response.statusText}`);
      }
      
      // Call the callback to refresh the list
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      
      // Close the drawer
      onClose();
    } catch (error) {
      handleApiError(error, {
        context: 'CER Review',
        endpoint: `/api/cer/jobs/${job.job_id}/review`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If no job is provided, don't render the drawer
  if (!job) {
    return null;
  }
  
  // Format timestamps for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Render status badge
  const renderStatusBadge = (status) => {
    switch(status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      case 'changes_requested':
        return <Badge className="bg-yellow-500">Changes Requested</Badge>;
      case 'draft':
        return <Badge className="bg-blue-500">Draft</Badge>;
      case 'in-review':
        return <Badge className="bg-purple-500">In Review</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Render decision badge
  const renderDecisionBadge = (decision) => {
    switch(decision) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      case 'changes_requested':
        return <Badge className="bg-yellow-500">Changes Requested</Badge>;
      default:
        return <Badge>{decision}</Badge>;
    }
  };
  
  return (
    <Drawer open={isOpen} onClose={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <fileText className="h-5 w-5" />
            Review CER: {job.job_id}
          </DrawerTitle>
          <DrawerDescription>
            Current Status: {renderStatusBadge(job.status)}
          </DrawerDescription>
        </DrawerHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <fileEdit className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <clock className="h-4 w-4" />
              Review History
            </TabsTrigger>
            <TabsTrigger value="submit" className="flex items-center gap-2">
              <checkSquare className="h-4 w-4" />
              Submit Review
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="py-4">
            <ScrollArea className="h-[40vh]">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Job ID</h4>
                  <p className="text-sm text-muted-foreground">{job.job_id}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Template</h4>
                  <p className="text-sm text-muted-foreground">{job.template_id}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Status</h4>
                  <p className="text-sm">{renderStatusBadge(job.status)}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Progress</h4>
                  <p className="text-sm text-muted-foreground">{job.progress}%</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Created At</h4>
                  <p className="text-sm text-muted-foreground">{formatDate(job.created_at)}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Last Updated</h4>
                  <p className="text-sm text-muted-foreground">{formatDate(job.updated_at)}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">User ID</h4>
                  <p className="text-sm text-muted-foreground">{job.user_id}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Attempts</h4>
                  <p className="text-sm text-muted-foreground">{job.attempts || 0}</p>
                </div>
                
                {job.last_error && (
                  <div>
                    <h4 className="text-sm font-medium mb-1 text-red-500">Last Error</h4>
                    <p className="text-sm text-red-500">{job.last_error}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="history" className="py-4">
            <ScrollArea className="h-[40vh]">
              <div className="space-y-4">
                {job.approvals && job.approvals.length > 0 ? (
                  job.approvals.map(review => (
                    <Card key={review.id} className="mb-4">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">
                              {renderDecisionBadge(review.decision)}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {formatDate(review.created_at)}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Reviewer ID: {review.reviewer_id}
                          </div>
                        </div>
                        
                        {review.comments && (
                          <div className="mt-2 text-sm bg-muted p-3 rounded-md">
                            {review.comments}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center p-6 text-muted-foreground">
                    <clock className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>No review history available</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="submit" className="py-4">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Select Decision</h4>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant={reviewDecision === 'approved' ? 'default' : 'outline'}
                    className={`flex flex-col items-center py-4 ${reviewDecision === 'approved' ? 'bg-green-500 hover:bg-green-600' : ''}`}
                    onClick={() => setReviewDecision('approved')}
                  >
                    <checkCircle className="h-6 w-6 mb-2" />
                    Approve
                  </Button>
                  
                  <Button
                    variant={reviewDecision === 'changes_requested' ? 'default' : 'outline'}
                    className={`flex flex-col items-center py-4 ${reviewDecision === 'changes_requested' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
                    onClick={() => setReviewDecision('changes_requested')}
                  >
                    <rotateCcw className="h-6 w-6 mb-2" />
                    Request Changes
                  </Button>
                  
                  <Button
                    variant={reviewDecision === 'rejected' ? 'default' : 'outline'}
                    className={`flex flex-col items-center py-4 ${reviewDecision === 'rejected' ? 'bg-red-500 hover:bg-red-600' : ''}`}
                    onClick={() => setReviewDecision('rejected')}
                  >
                    <xSquare className="h-6 w-6 mb-2" />
                    Reject
                  </Button>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-3">Review Comments</h4>
                <Textarea
                  placeholder="Add your review comments here..."
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DrawerFooter className="pt-2">
          <Button
            onClick={handleSubmit}
            disabled={!reviewDecision || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ReviewDrawer;