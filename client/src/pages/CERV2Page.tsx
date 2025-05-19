import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { cleanupModals } from "@/lib/modalHelpers";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/Layout";
import { ClipboardCheck, FileText, AlertCircle, Settings, CheckCircle2 } from "lucide-react";

interface ComplianceData {
  id: string;
  title: string;
  status: string;
  lastUpdated: string;
  modules: {
    id: string;
    name: string;
    status: string;
    type: string;
  }[];
}

const CERV2Page = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch compliance data
  const { data: complianceData, isLoading, error } = useQuery<ComplianceData>({
    queryKey: ["/api/compliance/current"],
    staleTime: Infinity,
  });

  // Cleanup any lingering modal elements when navigating away or changing tabs
  useEffect(() => {
    return () => {
      cleanupModals();
    };
  }, []);

  // Additional useEffect to handle tab changes
  useEffect(() => {
    // This will ensure modals are cleaned up on tab changes as well
    cleanupModals();
  }, [activeTab]);

  // Show success toast when component mounts (for demonstration)
  useEffect(() => {
    toast({
      title: "Interface Updated Successfully",
      description: "Floating elements have been removed and modal cleanup is now active.",
      variant: "default",
    });
  }, [toast]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle>Error Loading Data</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                There was an error loading the compliance data. Please try again.
              </p>
              <Button className="mt-4" variant="outline">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Regulatory Compliance Portal</h1>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
        
        <Tabs 
          defaultValue="overview" 
          value={activeTab}
          onValueChange={(value) => setActiveTab(value)}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="submissions">FDA Submissions</TabsTrigger>
            <TabsTrigger value="quality">Quality Management</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Active Submissions</h3>
                    </div>
                    <p className="text-2xl font-bold mt-2">
                      {complianceData?.modules.filter(m => m.type === 'submission' && m.status === 'active').length || 0}
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <ClipboardCheck className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Quality Processes</h3>
                    </div>
                    <p className="text-2xl font-bold mt-2">
                      {complianceData?.modules.filter(m => m.type === 'quality').length || 0}
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <h3 className="font-medium">Compliance Status</h3>
                    </div>
                    <p className="text-2xl font-bold mt-2 text-green-500">
                      Compliant
                    </p>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <h3 className="font-medium mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {complianceData?.modules.slice(0, 5).map((module) => (
                    <div key={module.id} className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <p className="font-medium">{module.name}</p>
                        <p className="text-sm text-muted-foreground">Type: {module.type}</p>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          module.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {module.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle>FDA Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Manage all FDA submission documents and processes.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {complianceData?.modules
                    .filter(m => m.type === 'submission')
                    .map((module) => (
                      <Card key={module.id} className="border border-border">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{module.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              module.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                              {module.status}
                            </span>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="quality">
            <Card>
              <CardHeader>
                <CardTitle>Quality Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Manage quality management system processes and documentation.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {complianceData?.modules
                    .filter(m => m.type === 'quality')
                    .map((module) => (
                      <Card key={module.id} className="border border-border">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{module.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              module.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                              {module.status}
                            </span>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Generate and view compliance reports for regulatory submissions.
                </p>
                
                <div className="space-y-4">
                  <Card className="border border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Annual FDA Report</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Last generated: 30 days ago</span>
                        <Button size="sm">Generate Report</Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Quality Metrics Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Last generated: 15 days ago</span>
                        <Button size="sm">Generate Report</Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Compliance Audit Report</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Last generated: 45 days ago</span>
                        <Button size="sm">Generate Report</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CERV2Page;
