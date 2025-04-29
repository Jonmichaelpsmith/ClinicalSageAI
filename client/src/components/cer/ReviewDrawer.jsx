import React, { useState } from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, CheckCircle, XCircle, MessageSquare, History, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleApiError } from '@/services/errorHandling';

/**
 * Review Drawer Component
 * 
 * This component displays a drawer with detailed information about a CER job
 * and provides controls for reviewing and approving/rejecting it.
 */
const ReviewDrawer = ({ isOpen, onClose, job, onReviewSubmitted }) => {
  const [activeTab, setActiveTab] = useState("details");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Format dates for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Submit approval decision
  const handleSubmitReview = async (decision) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/cer/reviews`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          job_id: job.job_id,
          decision,
          comment
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to submit review: ${response.statusText}`);
      }
      
      toast({
        title: "Review submitted",
        description: `Your ${decision} has been recorded.`,
      });
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      handleApiError(error, {
        context: 'CER Review',
        endpoint: '/api/cer/reviews',
        toast
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Download PDF report
  const handleDownloadPDF = async () => {
    if (!job || !job.pdf_url) {
      toast({
        title: "Download failed",
        description: "PDF report is not available.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      window.open(job.pdf_url, '_blank');
    } catch (error) {
      toast({
        title: "Download failed",
        description: error.message,
        variant: "destructive",
      });
    }
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
  
  if (!job) {
    return null;
  }
  
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Clinical Evaluation Report
          </DrawerTitle>
          <DrawerDescription>
            <div className="flex items-center gap-2 mt-1">
              ID: {job.job_id} {renderStatusBadge(job.status)}
            </div>
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="history">Review History</TabsTrigger>
              <TabsTrigger value="preview">Preview PDF</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Report Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-1">Created</h4>
                      <p className="text-sm text-muted-foreground">{formatDate(job.created_at)}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Updated</h4>
                      <p className="text-sm text-muted-foreground">{formatDate(job.updated_at)}</p>
                    </div>
                    {job.meta && (
                      <>
                        <div>
                          <h4 className="font-medium text-sm mb-1">Product</h4>
                          <p className="text-sm text-muted-foreground">{job.meta.product_name || 'N/A'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-1">Manufacturer</h4>
                          <p className="text-sm text-muted-foreground">{job.meta.manufacturer || 'N/A'}</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-6">
                <h3 className="font-medium mb-2">Your Review</h3>
                <Textarea
                  placeholder="Add your comments here..."
                  className="min-h-[100px]"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                
                <div className="flex items-center gap-3 mt-4">
                  <Button 
                    variant="success" 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleSubmitReview('approved')}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={() => handleSubmitReview('rejected')}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Reject
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Review History</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    {job.review_history && job.review_history.length > 0 ? (
                      <div className="space-y-4">
                        {job.review_history.map((review, index) => (
                          <Card key={index} className="border shadow-sm">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-2">
                                <History className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{review.reviewer_name || 'Anonymous'}</span>
                                    {renderStatusBadge(review.decision)}
                                    <span className="text-xs text-muted-foreground">
                                      {formatDate(review.created_at)}
                                    </span>
                                  </div>
                                  {review.comment && (
                                    <div className="mt-2 text-sm text-muted-foreground">
                                      <MessageSquare className="h-3.5 w-3.5 inline-block mr-1" />
                                      {review.comment}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No review history available</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preview" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>PDF Preview</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleDownloadPDF}
                      disabled={!job.pdf_url}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {job.pdf_url ? (
                    <div className="border rounded-md overflow-hidden h-[500px] bg-slate-50">
                      <iframe
                        src={job.pdf_url}
                        title="CER PDF Preview"
                        className="w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center">
                      <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">PDF Not Available</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        The PDF report for this CER is not available for preview.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <DrawerFooter>
          <Button onClick={onClose}>Close</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ReviewDrawer;