import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Calendar, Clock, Download, AlertTriangle, FileText, Send } from 'lucide-react';

export default function IndSequenceDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [indSerial, setIndSerial] = useState('');
  const [sponsorName, setSponsorName] = useState('');
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  
  // Fetch sequence details
  const sequenceQuery = useQuery({
    queryKey: ['/api/ind/sequence', id],
    enabled: !!id
  });
  
  const sequence = sequenceQuery.data;
  const isSubmitted = sequence?.submission_status === 'submitted';
  const isInProgress = sequence?.submission_status === 'submitted_in_progress';
  
  // Mutation for submitting the sequence to FDA ESG
  const submitMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/ind/sequence/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ind_serial: indSerial, sponsor_name: sponsorName })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit sequence');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Submission Initiated',
        description: 'The sequence has been submitted to the FDA ESG. You can monitor its status on this page.',
        duration: 5000
      });
      setSubmitDialogOpen(false);
      // Refetch sequence data to get updated status
      queryClient.invalidateQueries({ queryKey: ['/api/ind/sequence', id] });
    },
    onError: (error) => {
      toast({
        title: 'Submission Failed',
        description: error.message || 'There was an error submitting the sequence to FDA ESG.',
        variant: 'destructive',
        duration: 5000
      });
    }
  });
  
  // Prepare data for UI
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-gray-100 text-gray-700">Draft</Badge>;
      case 'ready':
        return <Badge variant="outline" className="bg-green-100 text-green-700">Ready</Badge>;
      case 'submitted_in_progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700">Submission in Progress</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="bg-green-100 text-green-700">Submitted to FDA</Badge>;
      case 'invalid':
        return <Badge variant="outline" className="bg-red-100 text-red-700">Invalid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const renderModuleBadge = (path) => {
    if (!path) return null;
    
    if (path.startsWith('m1')) {
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Module 1</Badge>;
    } else if (path.startsWith('m2')) {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Module 2</Badge>;
    } else if (path.startsWith('m3')) {
      return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">Module 3</Badge>;
    } else if (path.startsWith('m4')) {
      return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200">Module 4</Badge>;
    } else if (path.startsWith('m5')) {
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-200">Module 5</Badge>;
    }
    
    return null;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    submitMutation.mutate();
  };
  
  if (sequenceQuery.isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
  if (sequenceQuery.isError) {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center">
              <AlertTriangle className="mr-2" />
              Error Loading Sequence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">
              {sequenceQuery.error.message || 'Unable to load the sequence details. Please try again later.'}
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => sequenceQuery.refetch()} variant="outline">Retry</Button>
            <Link href="/portal/ind">
              <Button variant="ghost" className="ml-2">Return to Sequence List</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            Sequence {sequence.sequence_id}: {sequence.title}
            {isSubmitted && <CheckCircle className="ml-2 text-green-500" size={24} />}
          </h1>
          <div className="flex space-x-4 text-gray-500">
            <div className="flex items-center">
              <Calendar className="mr-1" size={16} />
              <span>Created: {formatDate(sequence.created_at)}</span>
            </div>
            {sequence.updated_at && (
              <div className="flex items-center">
                <Clock className="mr-1" size={16} />
                <span>Updated: {formatDate(sequence.updated_at)}</span>
              </div>
            )}
            <div>
              Status: {renderStatusBadge(sequence.submission_status)}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center" asChild>
            <Link href={`/api/ind/sequence/${id}/download`}>
              <Download className="mr-2" size={16} />
              Download Package
            </Link>
          </Button>
          
          {!isSubmitted && !isInProgress && (
            <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center">
                  <Send className="mr-2" size={16} />
                  Submit to FDA
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Submit Sequence to FDA ESG</DialogTitle>
                    <DialogDescription>
                      Provide the IND serial number and sponsor name to submit this sequence to the FDA Electronic Submissions Gateway.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="ind-serial" className="text-right">
                        IND Serial Number
                      </Label>
                      <Input
                        id="ind-serial"
                        value={indSerial}
                        onChange={(e) => setIndSerial(e.target.value)}
                        placeholder="e.g., 123456"
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="sponsor-name" className="text-right">
                        Sponsor Name
                      </Label>
                      <Input
                        id="sponsor-name"
                        value={sponsorName}
                        onChange={(e) => setSponsorName(e.target.value)}
                        placeholder="e.g., Acme Pharmaceuticals, Inc."
                        className="col-span-3"
                        required
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSubmitDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitMutation.isPending}
                    >
                      {submitMutation.isPending ? 'Submitting...' : 'Submit to FDA'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      {/* Display submissions history if available */}
      {sequence.submissions && sequence.submissions.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Submission History</CardTitle>
            <CardDescription>
              Recent FDA ESG submissions and acknowledgments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sequence.submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="p-4 border rounded-md flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">
                      FDA ESG Tracking #: {submission.tracking_number}
                    </div>
                    <div className="text-sm text-gray-500">
                      Submitted: {formatDate(submission.timestamp)}
                    </div>
                    {submission.message && (
                      <div className="text-sm mt-1">{submission.message}</div>
                    )}
                  </div>
                  <div>
                    {submission.status === 'success' ? (
                      <Badge className="bg-green-100 text-green-700">Success</Badge>
                    ) : submission.status === 'error' ? (
                      <Badge className="bg-red-100 text-red-700">Error</Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2" size={20} />
            Sequence Documents
          </CardTitle>
          <CardDescription>
            Documents included in this eCTD sequence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sequence.documents && sequence.documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 border rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{doc.title}</h3>
                    <p className="text-sm text-gray-500">{doc.path}</p>
                  </div>
                  <div>
                    {renderModuleBadge(doc.path)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            <span className="text-sm text-gray-500">
              {sequence.documents ? sequence.documents.length : 0} documents in sequence
            </span>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" asChild>
              <a href={`/ectd/${sequence.sequence_id}/index.xml`} target="_blank" rel="noopener noreferrer">
                View index.xml
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`/ectd/${sequence.sequence_id}/us-regional.xml`} target="_blank" rel="noopener noreferrer">
                View us-regional.xml
              </a>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}