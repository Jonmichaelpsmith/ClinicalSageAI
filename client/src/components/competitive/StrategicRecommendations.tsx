import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Beaker, 
  Microscope, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp,
  Download 
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface StrategicRecommendationsProps {
  protocolSummary: string;
  indication?: string;
  phase?: string;
  sponsor?: string;
}

interface StrategicResponseType {
  analysis: {
    rdStrategy: string;
    clinicalDevelopment: string;
    marketStrategy: string;
    fullText: string;
  };
  context: {
    csrReferences: Array<{
      id: number;
      title: string;
      sponsor: string;
      indication: string;
      phase: string;
    }>;
    competitorTrials: Array<{
      id: number;
      title: string;
      sponsor: string;
      indication: string;
      phase: string;
    }>;
  };
}

const StrategicRecommendations: React.FC<StrategicRecommendationsProps> = ({ 
  protocolSummary, 
  indication = '',
  phase = '',
  sponsor = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [strategicResponse, setStrategicResponse] = useState<StrategicResponseType | null>(null);
  const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({
    'rd': false,
    'clinical': false,
    'market': false
  });
  const { toast } = useToast();

  const generateStrategicAnalysis = async () => {
    if (!protocolSummary) {
      toast({
        title: "Missing Information",
        description: "Please provide a protocol summary.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/strategy/analyze", {
        protocolSummary,
        indication,
        phase,
        sponsor
      });

      const data = await response.json();
      
      if (data.success && data.analysisResult) {
        setStrategicResponse(data.analysisResult);
      } else {
        throw new Error(data.message || "Failed to generate strategic analysis");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate strategic analysis",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpandSection = (section: string) => {
    setIsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const exportToPdf = async () => {
    if (!strategicResponse) return;
    
    try {
      setIsLoading(true);
      
      const response = await apiRequest("POST", "/api/strategy/export-pdf", {
        protocolSummary,
        indication,
        phase,
        sponsor,
        report: strategicResponse.analysis.fullText,
        title: `${sponsor || 'Protocol'} Strategic Analysis: ${indication} ${phase}`
      });
      
      const data = await response.json();
      
      if (data.success && data.download_url) {
        // Open download in new tab
        window.open(data.download_url, '_blank');
        
        toast({
          title: "Export Successful",
          description: "Your strategic report PDF has been generated.",
        });
      } else {
        throw new Error(data.message || "Failed to export PDF");
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export report to PDF",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Strategic Intelligence Engine</h2>
          <p className="text-muted-foreground mt-1">
            AI-powered strategic analysis based on real CSR data and competitive landscape
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="default" 
            onClick={generateStrategicAnalysis}
            disabled={isLoading || !protocolSummary}
          >
            {isLoading ? 'Generating...' : 'Generate Strategic Analysis'}
          </Button>
          
          {strategicResponse && (
            <Button variant="outline" onClick={exportToPdf}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          )}
        </div>
      </div>

      {!strategicResponse && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Protocol Summary</CardTitle>
            <CardDescription>
              {protocolSummary ? 
                'Click "Generate Strategic Analysis" to analyze this protocol against real-world data.' :
                'Enter a protocol summary to analyze against real-world data.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {protocolSummary ? (
              <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                {protocolSummary.substring(0, 300)}
                {protocolSummary.length > 300 && '...'}
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  Please enter a protocol summary to generate a strategic analysis.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-center">
              Analyzing protocol against thousands of CSRs and clinical trials...<br />
              This may take a moment.
            </p>
          </CardContent>
        </Card>
      )}

      {strategicResponse && (
        <>
          <Tabs defaultValue="recommendations" className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="recommendations">Strategic Recommendations</TabsTrigger>
              <TabsTrigger value="context">CSR Context</TabsTrigger>
              <TabsTrigger value="competitors">Competitor Trials</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recommendations">
              <div className="space-y-4">
                {/* R&D Strategy Card */}
                <Card>
                  <CardHeader className="cursor-pointer" onClick={() => toggleExpandSection('rd')}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Microscope className="h-5 w-5 mr-2 text-blue-600" />
                        <CardTitle>R&D Strategy</CardTitle>
                      </div>
                      {isExpanded.rd ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </CardHeader>
                  <CardContent className={isExpanded.rd ? "block" : "hidden"}>
                    <div className="whitespace-pre-wrap">
                      {strategicResponse.analysis.rdStrategy}
                    </div>
                  </CardContent>
                </Card>

                {/* Clinical Development Card */}
                <Card>
                  <CardHeader className="cursor-pointer" onClick={() => toggleExpandSection('clinical')}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Beaker className="h-5 w-5 mr-2 text-green-600" />
                        <CardTitle>Clinical Development</CardTitle>
                      </div>
                      {isExpanded.clinical ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </CardHeader>
                  <CardContent className={isExpanded.clinical ? "block" : "hidden"}>
                    <div className="whitespace-pre-wrap">
                      {strategicResponse.analysis.clinicalDevelopment}
                    </div>
                  </CardContent>
                </Card>

                {/* Market Strategy Card */}
                <Card>
                  <CardHeader className="cursor-pointer" onClick={() => toggleExpandSection('market')}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                        <CardTitle>Market Strategy</CardTitle>
                      </div>
                      {isExpanded.market ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </CardHeader>
                  <CardContent className={isExpanded.market ? "block" : "hidden"}>
                    <div className="whitespace-pre-wrap">
                      {strategicResponse.analysis.marketStrategy}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="context">
              <Card>
                <CardHeader>
                  <CardTitle>CSR References</CardTitle>
                  <CardDescription>
                    Data extracted from authentic clinical study reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {strategicResponse.context.csrReferences.map((csr, index) => (
                      <div key={index} className="border rounded-md p-4">
                        <h3 className="font-semibold mb-2">{csr.title}</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex flex-col">
                            <span className="text-muted-foreground">Sponsor:</span>
                            <span>{csr.sponsor}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-muted-foreground">Indication:</span>
                            <span>{csr.indication}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-muted-foreground">Phase:</span>
                            <span>{csr.phase}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-muted-foreground">ID:</span>
                            <span>{csr.id}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {strategicResponse.context.csrReferences.length === 0 && (
                      <Alert>
                        <AlertDescription>
                          No relevant CSR references found for this protocol.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="competitors">
              <Card>
                <CardHeader>
                  <CardTitle>Competitor Trials</CardTitle>
                  <CardDescription>
                    Similar trials in your therapeutic area
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {strategicResponse.context.competitorTrials.map((trial, index) => (
                      <div key={index} className="border rounded-md p-4">
                        <h3 className="font-semibold mb-2">{trial.title}</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex flex-col">
                            <span className="text-muted-foreground">Sponsor:</span>
                            <span>{trial.sponsor}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-muted-foreground">Indication:</span>
                            <span>{trial.indication}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-muted-foreground">Phase:</span>
                            <span>{trial.phase}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-muted-foreground">ID:</span>
                            <span>{trial.id}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {strategicResponse.context.competitorTrials.length === 0 && (
                      <Alert>
                        <AlertDescription>
                          No relevant competitor trials found for this protocol.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default StrategicRecommendations;