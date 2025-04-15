import React, { useState, useEffect } from 'react';
import CERGenerator from '../components/CERGenerator';
import AdvancedDashboard from '../components/AdvancedDashboard';
import NLPQuery from '../components/NLPQuery';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

const EnhancedCERDashboardPage: React.FC = () => {
  const [openAIKeyAvailable, setOpenAIKeyAvailable] = useState<boolean | null>(null);
  const [isCheckingKey, setIsCheckingKey] = useState<boolean>(true);
  const [ndcCodes, setNdcCodes] = useState<string[]>(["0310-0790", "50580-506"]);
  const [activeTab, setActiveTab] = useState<string>("generator");
  const [filteredData, setFilteredData] = useState<any>(null);
  
  const { toast } = useToast();

  // Check if OpenAI API key is available
  useEffect(() => {
    const checkOpenAIKey = async () => {
      try {
        const response = await apiRequest('GET', '/api/check-secrets', {
          secretKeys: ['OPENAI_API_KEY']
        });
        
        if (!response.ok) {
          throw new Error('Failed to check API key status');
        }
        
        const data = await response.json();
        setOpenAIKeyAvailable(data.OPENAI_API_KEY === true);
      } catch (error) {
        console.error('Error checking API key:', error);
        setOpenAIKeyAvailable(false);
        toast({
          title: "Error Checking API Key",
          description: "Could not verify if the OpenAI API key is available.",
          variant: "destructive",
        });
      } finally {
        setIsCheckingKey(false);
      }
    };
    
    checkOpenAIKey();
  }, [toast]);

  // Handle NLP query filter updates
  const handleFilterUpdate = (data: any) => {
    setFilteredData(data);
    
    // Switch to analytics tab to show the filtered data
    if (data && data.filtered) {
      setActiveTab('analytics');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold mb-2">Enhanced CER Intelligence Suite</h1>
          <p className="text-muted-foreground">
            Generate, analyze, and explore Clinical Evaluation Reports with advanced analytics and natural language queries.
          </p>
        </div>
        
        {/* NLP Query for the entire dashboard */}
        <NLPQuery onFilter={handleFilterUpdate} />
        
        {/* Main content tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="generator">CER Generator</TabsTrigger>
            <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
          </TabsList>
          
          {/* CER Generator */}
          <TabsContent value="generator">
            {isCheckingKey ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
              </div>
            ) : !openAIKeyAvailable ? (
              <div className="bg-destructive/10 text-destructive p-6 rounded-lg">
                <h2 className="text-xl font-medium mb-2">OpenAI API Key Not Configured</h2>
                <p>
                  The CER Generator requires an OpenAI API key to function properly. 
                  Please contact your administrator to configure the OpenAI API key for this application.
                </p>
              </div>
            ) : (
              <CERGenerator />
            )}
          </TabsContent>
          
          {/* Advanced Analytics */}
          <TabsContent value="analytics">
            {filteredData && filteredData.filtered && (
              <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
                <h3 className="text-lg font-medium mb-2">Filtered Results</h3>
                <p className="text-sm">{filteredData.message}</p>
                {filteredData.count && (
                  <p className="text-sm mt-1">Showing {filteredData.count} filtered results.</p>
                )}
              </Card>
            )}
            
            <AdvancedDashboard ndcCodes={ndcCodes} />
          </TabsContent>
        </Tabs>
        
        {/* About section */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-800/40 p-6 rounded-lg">
          <h2 className="text-xl font-medium mb-4">About Enhanced CER Intelligence Suite</h2>
          <div className="space-y-4">
            <p>
              The Enhanced CER Intelligence Suite provides a comprehensive set of tools for working with 
              Clinical Evaluation Reports, combining real-time data retrieval, AI-powered generation, 
              and advanced analytics.
            </p>
            <h3 className="text-lg font-medium mt-2">Features:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Generate CERs using real-time data from FDA FAERS database</li>
              <li>Advanced comparative analytics across multiple products</li>
              <li>Trend forecasting and predictive analytics</li>
              <li>Natural language queries for exploring data</li>
              <li>Smart data filtering and visualization</li>
              <li>Save and export reports in multiple formats</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCERDashboardPage;