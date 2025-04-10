import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Download, Copy, ArrowRight, FileText, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2pdf from 'html2pdf.js';

export default function ProtocolOptimizer() {
  const [summary, setSummary] = useState('');
  const [indication, setIndication] = useState('');
  const [phase, setPhase] = useState('');
  const [csrIds, setCsrIds] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [keySuggestions, setKeySuggestions] = useState<string[]>([]);
  const [riskFactors, setRiskFactors] = useState<string[]>([]);
  const [matchedCsrInsights, setMatchedCsrInsights] = useState<{csrId: string, relevance: string}[]>([]);
  const [suggestedEndpoints, setSuggestedEndpoints] = useState<string[]>([]);
  const [suggestedArms, setSuggestedArms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [location] = useLocation();
  const { toast } = useToast();
  
  // Parse CSR IDs from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const csrIdsParam = params.get('csr_ids');
    
    if (csrIdsParam) {
      setCsrIds(csrIdsParam);
      toast({
        title: "CSR IDs Loaded",
        description: "CSR IDs have been loaded from your dossier.",
      });
    }
  }, [location, toast]);

  const handleSubmit = async () => {
    if (!summary) {
      toast({
        title: "Missing Information",
        description: "Please provide a protocol summary.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest('POST', '/api/protocol-optimizer', {
        summary,
        indication,
        phase,
        topCsrIds: csrIds ? csrIds.split(',').map(id => id.trim()) : undefined
      });

      if (response.success) {
        setRecommendation(response.recommendation || '');
        setKeySuggestions(response.keySuggestions || []);
        setRiskFactors(response.riskFactors || []);
        setMatchedCsrInsights(response.matchedCsrInsights || []);
        setSuggestedEndpoints(response.suggestedEndpoints || []);
        setSuggestedArms(response.suggestedArms || []);

        toast({
          title: "Protocol Analysis Complete",
          description: "Your protocol has been analyzed with AI and historical CSR data."
        });
      } else {
        toast({
          title: "Analysis Failed",
          description: "Failed to analyze the protocol. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while analyzing the protocol.",
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(recommendation);
    toast({
      title: "Copied to clipboard",
      description: "Recommendation has been copied to clipboard."
    });
  };

  const exportToPdf = () => {
    const element = document.getElementById('recommendation-content');
    if (!element) return;
    
    // Add current date to PDF
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Create a timestamp for the filename
    const timestamp = now.toISOString().replace(/[:.]/g, '-').substring(0, 19);
    
    const opt = {
      margin: 1,
      filename: `protocol-optimization-report-${timestamp}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    // Add report metadata
    const footer = document.createElement('div');
    footer.className = 'pdf-footer';
    footer.innerHTML = `
      <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #64748b;">
        <p>Generated on ${dateStr} • TrialSage Protocol Optimizer</p>
        ${csrIds ? `<p>Referenced CSR IDs: ${csrIds}</p>` : ''}
        <p>This report is generated based on AI analysis of historical clinical study reports. Professional clinical judgment is required for implementation.</p>
      </div>
    `;
    
    // Temporarily append footer to the content for PDF generation
    const originalElement = element.cloneNode(true);
    element.appendChild(footer);

    html2pdf().set(opt).from(element).save().then(() => {
      // Restore original element (remove footer)
      element.innerHTML = originalElement.innerHTML;
      
      toast({
        title: "PDF Export Complete",
        description: "Your protocol optimization report has been exported as PDF."
      });
    });
  };

  // Save optimization to dossier
  const saveOptimizationToDossier = async () => {
    if (!recommendation || !dossierId) {
      toast({
        title: "Cannot Save",
        description: "Please generate a recommendation first or ensure you're viewing from a dossier.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await apiRequest('POST', `/api/dossier/${dossierId}/save-optimization`, {
        summary,
        csr_ids: csrIds ? csrIds.split(',').map(id => id.trim()) : [],
        recommendation
      });
      
      if (response.saved) {
        toast({
          title: "Optimization Saved",
          description: `Saved to dossier with ${response.version_count} versions total.`,
        });
      } else {
        throw new Error(response.error || "Failed to save optimization");
      }
    } catch (error) {
      console.error("Error saving optimization:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save optimization to dossier.",
        variant: "destructive",
      });
    }
  };
  
  // Get the dossierId from URL if available
  const getDossierId = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('dossier_id');
  };
  
  const dossierId = getDossierId();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Protocol Optimizer</h1>
          <p className="text-muted-foreground">
            Enhance your clinical trial design with AI-powered insights from historical CSR data.
          </p>
        </div>
        {dossierId && (
          <Link to={`/dossier/${dossierId}`} className="flex items-center text-sm text-blue-600 hover:text-blue-800">
            <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
            Back to Dossier
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Protocol Information</CardTitle>
            <CardDescription>
              Enter your draft protocol details to receive optimization suggestions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Protocol Summary</label>
              <Textarea 
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Describe your trial design, endpoints, inclusion/exclusion criteria..."
                rows={6}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Indication</label>
                <Input 
                  value={indication}
                  onChange={(e) => setIndication(e.target.value)}
                  placeholder="e.g., Breast Cancer"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Phase</label>
                <Input 
                  value={phase}
                  onChange={(e) => setPhase(e.target.value)}
                  placeholder="e.g., Phase 2"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Reference CSR IDs (Optional)</label>
              <Input 
                value={csrIds}
                onChange={(e) => setCsrIds(e.target.value)}
                placeholder="Enter CSR IDs (comma-separated)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Include specific CSR IDs for more targeted recommendations.
              </p>
            </div>
            
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !summary} 
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Protocol...
                </>
              ) : (
                <>
                  Optimize Protocol
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {recommendation ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Optimization Results</CardTitle>
                <CardDescription>
                  AI-powered recommendations based on historical CSR data
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button size="sm" variant="outline" onClick={exportToPdf}>
                  <Download className="h-4 w-4 mr-1" />
                  Export PDF
                </Button>
                {dossierId && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                    onClick={saveOptimizationToDossier}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Save to Dossier
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="structured" className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="structured">Structured View</TabsTrigger>
                  <TabsTrigger value="full">Full Analysis</TabsTrigger>
                </TabsList>
                <TabsContent value="structured" className="space-y-4">
                  <div id="recommendation-content" className="p-6 border rounded-md space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="text-4xl font-bold text-blue-600 mr-3">TS</div>
                        <div>
                          <h2 className="text-lg font-semibold">TrialSage</h2>
                          <p className="text-xs text-muted-foreground">Protocol Optimizer</p>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-bold">Optimization Report</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-center border-t border-b py-4 my-4">
                      <h2 className="text-xl font-bold">Protocol Optimization Report</h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        Based on analysis of historical clinical study reports
                      </p>
                      <div className="flex justify-center space-x-4 text-sm">
                        {indication && (
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {indication}
                          </span>
                        )}
                        {phase && (
                          <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
                            {phase}
                          </span>
                        )}
                        {csrIds && (
                          <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">
                            {csrIds.split(',').length} CSR References
                          </span>
                        )}
                      </div>
                    </div>

                    {keySuggestions.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-blue-800 border-b pb-1 mb-2">
                          Key Design Suggestions
                        </h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {keySuggestions.map((suggestion, idx) => (
                            <li key={idx}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {riskFactors.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-red-800 border-b pb-1 mb-2">
                          Risk Factors
                        </h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {riskFactors.map((risk, idx) => (
                            <li key={idx}>{risk}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {matchedCsrInsights.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-purple-800 border-b pb-1 mb-2">
                          Matched CSR Insights
                        </h3>
                        <ul className="space-y-2">
                          {matchedCsrInsights.map((insight, idx) => (
                            <li key={idx} className="flex">
                              <span className="font-medium mr-2">{insight.csrId}:</span>
                              <span>{insight.relevance}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {suggestedEndpoints.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-green-800 border-b pb-1 mb-2">
                          Suggested Endpoints
                        </h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {suggestedEndpoints.map((endpoint, idx) => (
                            <li key={idx}>{endpoint}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {suggestedArms.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-amber-800 border-b pb-1 mb-2">
                          Suggested Trial Arms
                        </h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {suggestedArms.map((arm, idx) => (
                            <li key={idx}>{arm}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="full">
                  <div className="p-4 border rounded-md">
                    <pre className="whitespace-pre-wrap text-sm">
                      {recommendation}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Optimization Results</CardTitle>
              <CardDescription>
                Submit your protocol to see AI-powered recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[200px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p>Protocol analysis results will appear here</p>
                <p className="text-sm mt-2">
                  The AI will analyze your protocol and provide suggestions based on historical CSR data
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}