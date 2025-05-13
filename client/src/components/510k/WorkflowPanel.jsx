import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Beaker, BarChart3, Database, FileText, SearchCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'wouter';
import FDA510kService from '../../services/FDA510kService';

/**
 * 510(k) Workflow Panel
 * 
 * This component provides a unified interface for the 510(k) workflow,
 * including AI tools, workflow steps, and insights.
 */
const WorkflowPanel = ({ projectId, organizationId }) => {
  const [activeTab, setActiveTab] = useState('workflow');
  const [isLoading, setIsLoading] = useState({
    predicateFinder: false,
    contentAssistant: false,
    complianceChecker: false
  });
  const { toast } = useToast();
  const [_, navigate] = useNavigate();

  // Handle predicate finder
  const handlePredicateFinder = async () => {
    setIsLoading({ ...isLoading, predicateFinder: true });
    
    try {
      // Use the service for predictate device search
      const result = await FDA510kService.getPredicateDevices(projectId || "demo-project-id");
      
      toast({
        title: "Predicate Search Complete",
        description: `Found ${result.devices?.length || 0} potential predicate devices`,
      });
      
      // Navigate to predicate analysis tab
      navigate('/client-portal/510k?tab=predicateAnalysis');
    } catch (error) {
      console.error('Error in predicate finder:', error);
      toast({
        title: "Predicate Search Error",
        description: error.message || "Could not complete predicate device search",
        variant: "destructive",
      });
    } finally {
      setIsLoading({ ...isLoading, predicateFinder: false });
    }
  };
  
  // Handle content assistant
  const handleContentAssistant = async () => {
    setIsLoading({ ...isLoading, contentAssistant: true });
    
    try {
      // Use the service for content generation
      await FDA510kService.createDefaultSections(projectId || "demo-project-id", organizationId || 1);
      
      toast({
        title: "Content Generation Started",
        description: "Content assistant is generating section drafts",
      });
      
      // Navigate to document editor
      navigate('/client-portal/510k?tab=documentRecommender');
    } catch (error) {
      console.error('Error in content assistant:', error);
      toast({
        title: "Content Generation Error",
        description: error.message || "Could not generate content",
        variant: "destructive",
      });
    } finally {
      setIsLoading({ ...isLoading, contentAssistant: false });
    }
  };
  
  // Handle compliance check
  const handleComplianceCheck = async () => {
    setIsLoading({ ...isLoading, complianceChecker: true });
    
    try {
      // Use the service for compliance checking
      const result = await FDA510kService.checkCompliance(projectId || "demo-project-id");
      
      toast({
        title: "Compliance Check Complete",
        description: `Found ${result.issues?.length || 0} potential compliance issues`,
      });
      
      // Navigate to compliance checker tab
      navigate('/client-portal/510k?tab=complianceChecker');
    } catch (error) {
      console.error('Error in compliance checker:', error);
      toast({
        title: "Compliance Check Error",
        description: error.message || "Could not complete compliance check",
        variant: "destructive",
      });
    } finally {
      setIsLoading({ ...isLoading, complianceChecker: false });
    }
  };

  return (
    <div className="mb-8">
      <Tabs defaultValue="workflow" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="workflow">
            <FileText className="h-4 w-4 mr-2" />
            Workflow
          </TabsTrigger>
          <TabsTrigger value="ai-tools">
            <Beaker className="h-4 w-4 mr-2" />
            AI Tools
          </TabsTrigger>
          <TabsTrigger value="insights">
            <BarChart3 className="h-4 w-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="workflow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-2">
                <CardTitle className="flex items-center text-blue-700">
                  <Database className="mr-2 h-5 w-5 text-blue-600" />
                  1. Device Intake
                </CardTitle>
                <CardDescription>
                  Upload or enter device metadata to kick off the pipeline.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Provide basic device information or upload existing documentation to jump-start your 510(k) submission.
                </p>
                <Button
                  onClick={() => navigate('/client-portal/510k?tab=deviceProfile')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Upload Device Profile
                </Button>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-green-50 to-white pb-2">
                <CardTitle className="flex items-center text-green-700">
                  <SearchCode className="mr-2 h-5 w-5 text-green-600" />
                  2. Predicate & Literature Discovery
                </CardTitle>
                <CardDescription>
                  Draft predicate list and literature search results.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Automatically discover potential predicate devices and relevant scientific literature for your submission.
                </p>
                <Button
                  onClick={handlePredicateFinder}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isLoading.predicateFinder}
                >
                  {isLoading.predicateFinder ? (
                    <>
                      <span className="animate-spin mr-2">⟳</span>
                      Processing...
                    </>
                  ) : (
                    "Run Predicate Finder"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="ai-tools">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-white pb-2">
                <CardTitle className="flex items-center text-indigo-700">
                  <SearchCode className="mr-2 h-5 w-5 text-indigo-600" />
                  Smart Predicate Finder
                </CardTitle>
                <CardDescription>
                  AI-powered discovery of predicate devices
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Uses advanced machine learning to identify appropriate predicate devices based on your device characteristics.
                </p>
                <Button
                  onClick={handlePredicateFinder}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  disabled={isLoading.predicateFinder}
                >
                  {isLoading.predicateFinder ? "Processing..." : "Run AI Analysis"}
                </Button>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-white pb-2">
                <CardTitle className="flex items-center text-teal-700">
                  <FileText className="mr-2 h-5 w-5 text-teal-600" />
                  510(k) Content Assistant
                </CardTitle>
                <CardDescription>
                  AI writing and content generation
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Generates draft content for all required 510(k) sections based on your device specifications and intended use.
                </p>
                <Button
                  onClick={handleContentAssistant}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  disabled={isLoading.contentAssistant}
                >
                  {isLoading.contentAssistant ? "Processing..." : "Launch Content Assistant"}
                </Button>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-red-50 to-white pb-2">
                <CardTitle className="flex items-center text-red-700">
                  <FileText className="mr-2 h-5 w-5 text-red-600" />
                  Compliance Checker
                </CardTitle>
                <CardDescription>
                  AI validation against FDA requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Analyzes your 510(k) submission for compliance with FDA requirements and guidelines, identifying potential issues.
                </p>
                <Button
                  onClick={handleComplianceCheck}
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={isLoading.complianceChecker}
                >
                  {isLoading.complianceChecker ? "Processing..." : "Check Compliance"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>Submission Insights</CardTitle>
              <CardDescription>
                Analytics and insights for your 510(k) submission process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 italic text-sm mb-4">No insights available yet. Complete more pipeline steps to generate insights.</p>
              <Button onClick={() => setActiveTab('workflow')} variant="outline">
                Return to Workflow
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowPanel;