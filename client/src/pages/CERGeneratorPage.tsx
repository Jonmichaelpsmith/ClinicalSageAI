import React, { useEffect, useState } from 'react';
import CERGenerator from '../components/CERGenerator';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const CERGeneratorPage: React.FC = () => {
  const [openAIKeyAvailable, setOpenAIKeyAvailable] = useState<boolean | null>(null);
  const [isCheckingKey, setIsCheckingKey] = useState<boolean>(true);
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

  return (
    <div className="container mx-auto p-6">
      {/* Title set in the parent component */}
      
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold mb-2">CER Generator</h1>
          <p className="text-muted-foreground">
            Generate Clinical Evaluation Reports based on FDA FAERS data by providing an NDC code.
          </p>
        </div>
        
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
        
        <div className="mt-8 bg-gray-50 dark:bg-gray-800/40 p-6 rounded-lg">
          <h2 className="text-xl font-medium mb-4">About CER Generator</h2>
          <div className="space-y-4">
            <p>
              The CER Generator creates detailed Clinical Evaluation Reports using data from the FDA's 
              Adverse Event Reporting System (FAERS) based on a National Drug Code (NDC).
            </p>
            <h3 className="text-lg font-medium mt-2">Features:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Fetches real-time data from FDA FAERS database</li>
              <li>Analyzes adverse events, demographics, and seriousness statistics</li>
              <li>Generates structured reports following MEDDEV 2.7/1 Rev. 4 guidance</li>
              <li>Includes executive summary, safety analysis, and recommendations</li>
              <li>Save reports to the platform for future reference and sharing</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              Note: The CER Generator requires an NDC code to identify the product. 
              You can find NDC codes through the <a href="https://www.accessdata.fda.gov/scripts/cder/NDC/" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                FDA NDC Directory
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CERGeneratorPage;