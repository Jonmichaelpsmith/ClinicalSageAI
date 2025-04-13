import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Database, FileJson, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ExportResult {
  total: number;
  exported: number;
  skipped: number;
  errors: number;
  filesInDir: number;
}

export default function AdminPanel() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("database");
  
  // Database to JSON export mutation
  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/csr/export-to-json');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Export Successful",
        description: `Exported ${data.results.exported} new CSR files. Total available: ${data.results.filesInDir}`,
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Export Failed",
        description: error.message || "An error occurred during export",
        variant: "destructive",
      });
    }
  });

  const handleExportToJson = () => {
    toast({
      title: "Starting Export",
      description: "Exporting database CSRs to JSON files. This may take a few minutes...",
    });
    exportMutation.mutate();
  };

  const results = exportMutation.data?.results as ExportResult | undefined;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Admin Panel</CardTitle>
          <CardDescription>
            Administrative tools for managing TrialSage platform data
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="database" value={activeTab} onValueChange={setActiveTab}>
          <CardContent>
            <TabsList className="mb-4">
              <TabsTrigger value="database">
                <Database className="mr-2 h-4 w-4" />
                Database Management
              </TabsTrigger>
              {/* Add more tabs here as needed */}
            </TabsList>
            
            <TabsContent value="database" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileJson className="mr-2 h-5 w-5" />
                    CSR Database to JSON Export
                  </CardTitle>
                  <CardDescription>
                    Export all CSR records from the database to JSON files so they can be loaded by the search service
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">
                    This tool addresses the discrepancy between the number of CSRs in the database (~2,871) 
                    and the number loaded by the search service (~779) by converting all database records to 
                    the required JSON format.
                  </p>
                  
                  {exportMutation.isSuccess && (
                    <Alert className="mb-4 bg-green-50 border-green-200">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <AlertTitle className="text-green-800">Export Complete</AlertTitle>
                      <AlertDescription className="text-green-700">
                        <div className="mt-2">
                          <p><strong>Total CSRs in database:</strong> {results?.total}</p>
                          <p><strong>Newly exported:</strong> {results?.exported}</p>
                          <p><strong>Skipped (already exist):</strong> {results?.skipped}</p>
                          <p><strong>Errors:</strong> {results?.errors}</p>
                          <p className="mt-2"><strong>Total JSON files available:</strong> {results?.filesInDir}</p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {exportMutation.isError && (
                    <Alert className="mb-4 bg-red-50 border-red-200">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <AlertTitle className="text-red-800">Export Failed</AlertTitle>
                      <AlertDescription className="text-red-700">
                        {exportMutation.error instanceof Error ? exportMutation.error.message : 'Unknown error occurred'}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-xs text-muted-foreground">
                    <Badge variant="outline" className="mr-2">
                      Database: 2,871 CSRs
                    </Badge>
                    <Badge variant="outline">
                      Search Service: 779 CSRs
                    </Badge>
                  </div>
                  <Button 
                    onClick={handleExportToJson}
                    disabled={exportMutation.isPending}
                  >
                    {exportMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <FileJson className="mr-2 h-4 w-4" />
                        Export to JSON
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}