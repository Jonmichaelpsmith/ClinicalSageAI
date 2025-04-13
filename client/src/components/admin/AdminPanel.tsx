import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Database, 
  FileJson, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  FileText,
  Download,
  Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Progress } from "@/components/ui/progress";

export default function AdminPanel() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("data-management");
  
  // Database to JSON export mutation
  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/csr/export-to-json");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Export Successful",
          description: `Exported ${data.results.exported} CSRs to JSON files. 
                       Total files now available: ${data.results.filesInDir}`,
          variant: "default",
        });
      } else {
        toast({
          title: "Export Failed",
          description: data.message || "Failed to export CSRs to JSON",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Export Failed",
        description: error.message || "An error occurred during CSR export",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Administration Panel</h1>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="data-management">Data Management</TabsTrigger>
          <TabsTrigger value="system-status">System Status</TabsTrigger>
          <TabsTrigger value="user-management">User Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="data-management">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  CSR Database Management
                </CardTitle>
                <CardDescription>
                  Manage the Clinical Study Report database and search service
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Import/Export Status</AlertTitle>
                  <AlertDescription>
                    The search service loads CSRs from JSON files. Currently, there are more 
                    records in the database than JSON files available to the search service.
                  </AlertDescription>
                </Alert>
                
                <div className="grid gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Database to JSON Export</span>
                      <span className="text-xs text-muted-foreground">Critical for Search</span>
                    </div>
                    <Button 
                      onClick={() => exportMutation.mutate()} 
                      disabled={exportMutation.isPending}
                      className="w-full"
                    >
                      {exportMutation.isPending ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <FileJson className="h-4 w-4 mr-2" />
                          Export Database CSRs to JSON
                        </>
                      )}
                    </Button>
                    {exportMutation.isPending && (
                      <Progress value={45} className="h-2 mt-2" />
                    )}
                    {exportMutation.isSuccess && (
                      <div className="flex items-center text-xs text-green-600 mt-1">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Export completed successfully
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Import CSRs</span>
                      <span className="text-xs text-muted-foreground">Add New Studies</span>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Import CSR Batch
                    </Button>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Export Dataset</span>
                      <span className="text-xs text-muted-foreground">For Analytics</span>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Export Full Dataset
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-2">
                <div className="text-xs text-muted-foreground">
                  <strong>Note:</strong> The CSR search service loads data from JSON files in the 
                  data/processed_csrs directory. Regular exports ensure all database records are 
                  available for search.
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Content Management
                </CardTitle>
                <CardDescription>
                  Manage content, uploads, and documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription className="text-sm">
                      Content management features will be available in future updates
                    </AlertDescription>
                  </Alert>
                  
                  <Button variant="outline" className="w-full" disabled>
                    Manage Uploads
                  </Button>
                  
                  <Button variant="outline" className="w-full" disabled>
                    PDF Document Library
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="system-status">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Monitor system performance and resource usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription className="text-sm">
                  System monitoring features will be available in future updates
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="user-management">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users, roles, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription className="text-sm">
                  User management features will be available in future updates
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}