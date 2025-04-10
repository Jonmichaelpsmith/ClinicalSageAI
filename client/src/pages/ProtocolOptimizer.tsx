import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input'; 
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import html2pdf from 'html2pdf.js';
import { 
  ArrowRight, 
  FileDown, 
  FileText, 
  Save, 
  Loader2,
  PlusCircle,
  BookCopy
} from 'lucide-react';

export default function ProtocolOptimizer() {
  const [location] = useLocation();
  const dossierId = new URLSearchParams(location.split('?')[1]).get('dossier_id');
  
  const [protocolSummary, setProtocolSummary] = useState<string>('');
  const [studyType, setStudyType] = useState<string>('rct');
  const [includeReferences, setIncludeReferences] = useState<boolean>(true);
  const [useSimilarTrials, setUseSimilarTrials] = useState<boolean>(true);
  const [indication, setIndication] = useState<string>('');
  const [phase, setPhase] = useState<string>('phase3');
  
  const [analyzeLoading, setAnalyzeLoading] = useState<boolean>(false);
  const [generatedContent, setGeneratedContent] = useState<{
    recommendation: string;
    keySuggestions: string[];
    riskFactors: string[];
    matchedCsrInsights: any[];
    suggestedEndpoints: string[];
    suggestedArms: string[];
  } | null>(null);
  
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [savedMessageVisible, setSavedMessageVisible] = useState<boolean>(false);
  const [versionCount, setVersionCount] = useState<number>(0);
  
  const outputRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Generate protocol optimization recommendation
  const analyzeProtocol = async () => {
    if (!protocolSummary.trim()) {
      toast({
        title: "Empty Protocol",
        description: "Please enter a protocol summary or description.",
        variant: "destructive"
      });
      return;
    }
    
    setAnalyzeLoading(true);
    setGeneratedContent(null);
    
    try {
      const response = await apiRequest('POST', '/api/protocol/optimize', {
        protocolSummary,
        studyType,
        includeReferences,
        useSimilarTrials,
        indication,
        phase
      });
      
      if (response.success) {
        setGeneratedContent({
          recommendation: response.recommendation,
          keySuggestions: response.keySuggestions || [],
          riskFactors: response.riskFactors || [],
          matchedCsrInsights: response.matchedCsrInsights || [],
          suggestedEndpoints: response.suggestedEndpoints || [],
          suggestedArms: response.suggestedArms || []
        });
      } else {
        toast({
          title: "Analysis Failed",
          description: response.error || "Failed to analyze protocol. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Protocol analysis error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during analysis.",
        variant: "destructive"
      });
    } finally {
      setAnalyzeLoading(false);
    }
  };

  // Export the recommendation as PDF
  const exportPDF = () => {
    if (!outputRef.current) return;
    
    const content = outputRef.current;
    const opt = {
      margin: 10,
      filename: `protocol_optimization_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' }
    };
    
    // Add TrialSage branding header
    const header = document.createElement('div');
    header.innerHTML = `
      <div style="margin-bottom: 20px; text-align: center;">
        <h1 style="color: #2563eb; margin-bottom: 5px;">TrialSage Protocol Optimization</h1>
        <p style="color: #64748b; margin: 0;">Generated on ${new Date().toLocaleString()}</p>
        <p style="color: #64748b; margin-top: 5px;">Indication: ${indication || 'Not specified'} | Phase: ${phase.replace('phase', 'Phase ') || 'Not specified'}</p>
      </div>
    `;
    
    content.prepend(header);
    
    // Generate PDF
    html2pdf()
      .set(opt)
      .from(content)
      .save()
      .then(() => {
        // Remove the temporary header after PDF generation
        content.removeChild(header);
        
        toast({
          title: "Export Complete",
          description: "Protocol optimization report has been exported as PDF",
        });
      });
  };

  // Save optimization to dossier
  const saveOptimizationToDossier = async () => {
    if (!dossierId || !generatedContent) {
      toast({
        title: "Cannot Save",
        description: dossierId ? "No optimization to save." : "No dossier selected.",
        variant: "destructive"
      });
      return;
    }
    
    setSaveLoading(true);
    
    try {
      const response = await apiRequest('POST', `/api/dossier/${dossierId}/save-optimization`, {
        recommendation: generatedContent.recommendation,
        protocolSummary,
        csr_ids: generatedContent.matchedCsrInsights?.map(csr => csr.id) || []
      });
      
      if (response.saved) {
        setSavedMessageVisible(true);
        setVersionCount(response.version_count || 0);
        
        setTimeout(() => {
          setSavedMessageVisible(false);
        }, 3000);
        
        toast({
          title: "Saved Successfully",
          description: "Optimization saved to dossier.",
        });
      } else {
        toast({
          title: "Save Failed",
          description: response.error || "Failed to save optimization.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred when saving.",
        variant: "destructive"
      });
    } finally {
      setSaveLoading(false);
    }
  };

  // Handle view dossier button click
  const viewDossier = () => {
    if (dossierId) {
      window.location.href = `/dossier/${dossierId}`;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-700 mb-2">Protocol Optimizer</h1>
      <p className="text-gray-600 mb-6">
        Enter your protocol summary and our AI will provide optimization suggestions based on
        successful clinical study reports.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle>Protocol Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dossierId && (
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200 mb-2">
                <p className="text-sm text-blue-700 flex items-center">
                  <BookCopy className="h-4 w-4 mr-2" />
                  Optimization will be saved to Dossier ID: {dossierId.slice(0, 8)}...
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="indication">Indication/Condition</Label>
              <Input 
                id="indication" 
                placeholder="e.g., Type 2 Diabetes, Breast Cancer, etc." 
                value={indication}
                onChange={(e) => setIndication(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phase">Study Phase</Label>
                <Select value={phase} onValueChange={setPhase}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phase1">Phase 1</SelectItem>
                    <SelectItem value="phase2">Phase 2</SelectItem>
                    <SelectItem value="phase3">Phase 3</SelectItem>
                    <SelectItem value="phase4">Phase 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="studyType">Study Design</Label>
                <Select value={studyType} onValueChange={setStudyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select study type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rct">Randomized Controlled Trial</SelectItem>
                    <SelectItem value="observational">Observational Study</SelectItem>
                    <SelectItem value="singleArm">Single Arm Study</SelectItem>
                    <SelectItem value="crossover">Crossover Study</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="protocolSummary">Protocol Summary</Label>
              <Textarea 
                id="protocolSummary" 
                placeholder="Enter your protocol summary or design here..."
                className="min-h-[200px]"
                value={protocolSummary}
                onChange={(e) => setProtocolSummary(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeReferences" 
                checked={includeReferences}
                onCheckedChange={(checked) => setIncludeReferences(checked as boolean)}
              />
              <Label htmlFor="includeReferences">Include references to regulatory guidelines</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="useSimilarTrials" 
                checked={useSimilarTrials}
                onCheckedChange={(checked) => setUseSimilarTrials(checked as boolean)}
              />
              <Label htmlFor="useSimilarTrials">Find and use similar trials</Label>
            </div>
            
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={analyzeLoading}
              onClick={analyzeProtocol}
            >
              {analyzeLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Optimize Protocol
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          {generatedContent ? (
            <>
              <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle>Optimization Results</CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={exportPDF}
                      >
                        <FileDown className="h-4 w-4 mr-2" />
                        Export PDF
                      </Button>
                      
                      {dossierId && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={saveOptimizationToDossier}
                          disabled={saveLoading}
                        >
                          {saveLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save to Dossier
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {savedMessageVisible && (
                    <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded-md text-sm text-green-700 flex items-center">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Saved successfully as version {versionCount}
                      <Button 
                        variant="link" 
                        className="ml-auto text-blue-600 p-0 h-auto" 
                        onClick={viewDossier}
                      >
                        View Dossier
                      </Button>
                    </div>
                  )}
                  
                  <div ref={outputRef}>
                    <Tabs defaultValue="recommendations">
                      <TabsList className="mb-4">
                        <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                        <TabsTrigger value="key-points">Key Points</TabsTrigger>
                        <TabsTrigger value="references">Similar Trials</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="recommendations" className="space-y-4">
                        <div className="whitespace-pre-wrap p-4 border rounded-md bg-white">
                          {generatedContent.recommendation}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="key-points" className="space-y-4">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-md font-semibold mb-2">Suggested Endpoints</h3>
                            <ul className="list-disc pl-5 space-y-1">
                              {generatedContent.suggestedEndpoints?.map((item, i) => (
                                <li key={i} className="text-sm">{item}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h3 className="text-md font-semibold mb-2">Suggested Treatment Arms</h3>
                            <ul className="list-disc pl-5 space-y-1">
                              {generatedContent.suggestedArms?.map((item, i) => (
                                <li key={i} className="text-sm">{item}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h3 className="text-md font-semibold mb-2">Key Suggestions</h3>
                            <ul className="list-disc pl-5 space-y-1">
                              {generatedContent.keySuggestions?.map((item, i) => (
                                <li key={i} className="text-sm">{item}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h3 className="text-md font-semibold text-amber-700 mb-2">Risk Factors</h3>
                            <ul className="list-disc pl-5 space-y-1">
                              {generatedContent.riskFactors?.map((item, i) => (
                                <li key={i} className="text-sm text-amber-700">{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="references" className="space-y-4">
                        <div className="space-y-4">
                          {generatedContent.matchedCsrInsights?.length > 0 ? (
                            generatedContent.matchedCsrInsights.map((csr, i) => (
                              <div key={i} className="p-3 border rounded-md">
                                <h3 className="font-medium">{csr.title}</h3>
                                <p className="text-sm text-gray-600">Phase: {csr.phase} | Indication: {csr.indication}</p>
                                <p className="text-sm mt-2">{csr.insight || 'No specific insights available'}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 italic">No similar trials found</p>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-10 flex flex-col items-center justify-center text-center h-[400px]">
                <FileText className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">No Optimization Results Yet</h3>
                <p className="text-gray-500 mt-2 max-w-md">
                  Enter your protocol details and click "Optimize Protocol" to receive AI-powered recommendations.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}