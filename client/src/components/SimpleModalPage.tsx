import { useState, useEffect } from "react";
import { cleanupModals } from "@/lib/modalHelpers";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Settings, FileText, ClipboardCheck, CheckCircle2 } from "lucide-react";

const SimpleModalPage = () => {
  const [activeTab, setActiveTab] = useState("overview");

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
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <h3 className="font-medium">Active Submissions</h3>
                    </div>
                    <p className="text-2xl font-bold mt-2">4</p>
                  </div>
                  
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <ClipboardCheck className="h-5 w-5 text-blue-500" />
                      <h3 className="font-medium">Quality Processes</h3>
                    </div>
                    <p className="text-2xl font-bold mt-2">5</p>
                  </div>
                  
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <h3 className="font-medium">Compliance Status</h3>
                    </div>
                    <p className="text-2xl font-bold mt-2 text-green-500">
                      Compliant
                    </p>
                  </div>
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
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Manage all FDA submission documents and processes.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="quality">
            <Card>
              <CardHeader>
                <CardTitle>Quality Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Manage quality management system processes and documentation.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Generate and view compliance reports for regulatory submissions.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SimpleModalPage;