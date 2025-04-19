// AdminEmbeddingPanel.jsx - Component for managing document embeddings
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const AdminEmbeddingPanel = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Query to get embedding status
  const { data: statusData, isLoading: isStatusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ['/api/embeddings/status'],
    onError: (err) => {
      console.error('Failed to fetch embedding status:', err);
      toast({
        title: "Error fetching status",
        description: "Could not retrieve document embedding status.",
        variant: "destructive",
      });
    }
  });

  // Mutation to process changed documents
  const processDocumentsMutation = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      const response = await fetch('/api/embeddings/process-changed', {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error('Failed to process documents');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Processing started",
        description: "Document embedding process has been started in the background.",
        variant: "default",
      });
      setTimeout(() => {
        refetchStatus();
      }, 2000);
    },
    onError: (err) => {
      console.error('Failed to process documents:', err);
      toast({
        title: "Processing failed",
        description: "Failed to start document embedding process.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });

  const handleProcessDocuments = () => {
    processDocumentsMutation.mutate();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Document Embeddings Management</CardTitle>
        <CardDescription>
          Manage vector embeddings for AI-powered document retrieval
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isStatusLoading ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : statusData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <div className="text-sm text-slate-500 dark:text-slate-400">Total Documents</div>
                <div className="text-2xl font-semibold mt-1">{statusData.totalDocuments || 0}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <div className="text-sm text-slate-500 dark:text-slate-400">Embedded Documents</div>
                <div className="text-2xl font-semibold mt-1">{statusData.embeddedDocuments || 0}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <div className="text-sm text-slate-500 dark:text-slate-400">Document Chunks</div>
                <div className="text-2xl font-semibold mt-1">{statusData.totalChunks || 0}</div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <div>
                <div className="font-medium">Processing Status</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {statusData.isProcessing ? (
                    <span className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2 text-amber-500" />
                      Processing documents
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
                      Ready
                    </span>
                  )}
                </div>
              </div>
              <Badge variant={statusData.pendingChanges > 0 ? "destructive" : "outline"}>
                {statusData.pendingChanges || 0} pending changes
              </Badge>
            </div>

            {statusData.lastProcessed && (
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Last processed: {new Date(statusData.lastProcessed).toLocaleString()}
              </div>
            )}

            {statusData.pendingChanges > 0 && (
              <Alert variant="warning" className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertTitle className="text-amber-800 dark:text-amber-300">Changes detected</AlertTitle>
                <AlertDescription className="text-amber-700 dark:text-amber-400">
                  {statusData.pendingChanges} documents have been modified and need to be re-embedded for optimal AI retrieval.
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Could not retrieve embedding status information.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={refetchStatus} disabled={isProcessing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isStatusLoading ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
        <Button 
          onClick={handleProcessDocuments} 
          disabled={isProcessing || (statusData && statusData.isProcessing) || (statusData && statusData.pendingChanges === 0)}
        >
          {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Process Changed Documents
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AdminEmbeddingPanel;