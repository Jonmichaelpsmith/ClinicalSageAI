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
  Upload,
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
  const [protocolFile, setProtocolFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  
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
    if (!protocolSummary.trim() && !protocolFile) {
      toast({
        title: "Empty Protocol",
        description: "Please enter a protocol summary or upload a protocol file.",
        variant: "destructive"
      });
      return;
    }
    
    setAnalyzeLoading(true);
    setGeneratedContent(null);
    
    try {
      // Create a FormData object if a file is uploaded
      let payload: any = {
        protocolSummary,
        studyType,
        includeReferences,
        useSimilarTrials: true, // Always set to true to ensure we get all relevant CSRs
        indication,
        phase,
        findAllSimilarCSRs: true, // New flag to find all similar CSRs
        compareTherapeuticArea: true, // Match by therapeutic area
        compareTrialPhase: true // Match by trial phase
      };
      
      let response;
      
      if (protocolFile) {
        // If there's a file, we need to use FormData for multipart/form-data
        const formData = new FormData();
        formData.append('file', protocolFile);
        
        // Add all other parameters to the FormData
        Object.keys(payload).forEach(key => {
          formData.append(key, payload[key]?.toString() || '');
        });
        
        // Use fetch directly for file upload
        const uploadResponse = await fetch('/api/protocol/upload-and-optimize', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error(`File upload failed: ${uploadResponse.statusText}`);
        }
        
        response = await uploadResponse.json();
      } else {
        // Standard JSON request when no file is uploaded
        response = await apiRequest('POST', '/api/protocol/optimize', payload) as ProtocolOptimizationResponse;
      }
      
      if (response.success) {
        setGeneratedContent({
          recommendation: response.recommendation,
          keySuggestions: response.keySuggestions || [],
          riskFactors: response.riskFactors || [],
          matchedCsrInsights: response.matchedCsrInsights || [],
          suggestedEndpoints: response.suggestedEndpoints || [],
          suggestedArms: response.suggestedArms || []
        });
        
        // If we received file content but no summary was manually entered, update the summary field
        if (protocolFile && !protocolSummary.trim() && response.extractedSummary) {
          setProtocolSummary(response.extractedSummary);
        }
        
        toast({
          title: "Analysis Complete",
          description: `Successfully analyzed protocol ${protocolFile ? 'file' : 'summary'} and found ${response.matchedCsrInsights?.length || 0} similar CSRs.`,
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
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          Protocol Optimizer
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Enter your protocol summary and our AI will provide optimization suggestions based on 
          successful clinical study reports.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="overflow-hidden border-0 shadow-lg rounded-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3 border-b">
            <CardTitle className="text-blue-800">Protocol Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
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
            
            <div className="space-y-2">
              <Label htmlFor="protocolFile">Upload Draft Protocol (PDF or DOCX)</Label>
              <div 
                className={`border-2 border-dashed ${uploadedFileName ? 'border-green-200 bg-green-50/50' : 'border-blue-200'} rounded-lg p-6 transition-colors hover:${uploadedFileName ? 'border-green-300' : 'border-blue-300'} hover:${uploadedFileName ? 'bg-green-50/70' : 'bg-blue-50/50'} cursor-pointer`}
                onClick={() => document.getElementById('protocolFile')?.click()}
              >
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  {uploadedFileName ? (
                    <>
                      <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-green-700">
                        {uploadedFileName}
                      </p>
                      <p className="text-xs text-green-600">
                        File selected. Click to change.
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-blue-500" />
                      <p className="text-sm font-medium text-blue-700">
                        Drag and drop your protocol file, or click to browse
                      </p>
                      <p className="text-xs text-slate-500">
                        Upload a PDF or DOCX file of your draft protocol for AI analysis
                      </p>
                    </>
                  )}
                  <input 
                    type="file" 
                    id="protocolFile" 
                    className="hidden" 
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setProtocolFile(file);
                        setUploadedFileName(file.name);
                        toast({
                          title: "File Selected",
                          description: `${file.name} ready for analysis`,
                        });
                      }
                    }}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-2 border-blue-200 text-blue-700"
                    onClick={() => document.getElementById('protocolFile')?.click()}
                  >
                    Select File
                  </Button>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                The AI will extract key details from your protocol and provide optimization suggestions
              </p>
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
              className="w-full text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md py-6 font-medium rounded-xl mt-2"
              disabled={analyzeLoading}
              onClick={analyzeProtocol}
            >
              {analyzeLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing Protocol...
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Optimize Protocol
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          {generatedContent ? (
            <>
              <Card className="overflow-hidden border-0 shadow-lg rounded-xl">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 pb-3 border-b">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-blue-800">Optimization Results</CardTitle>
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={exportPDF}
                        className="bg-white hover:bg-blue-50 transition-colors border-blue-200 text-blue-700 hover:text-blue-800 font-medium"
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
                          className="bg-white hover:bg-green-50 transition-colors border-green-200 text-green-700 hover:text-green-800 font-medium"
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
                <CardContent className="pt-6">
                  {savedMessageVisible && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-800 flex items-center">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      <span className="font-medium">Successfully saved as version {versionCount}</span>
                      <Button 
                        variant="link" 
                        className="ml-auto text-blue-600 hover:text-blue-800 transition-colors p-0 h-auto" 
                        onClick={viewDossier}
                      >
                        View Dossier
                      </Button>
                    </div>
                  )}
                  
                  <div ref={outputRef} className="mt-2">
                    <Tabs defaultValue="recommendations">
                      <TabsList className="mb-4 bg-slate-100 p-1 rounded-lg">
                        <TabsTrigger value="recommendations" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 rounded-md">Recommendations</TabsTrigger>
                        <TabsTrigger value="key-points" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 rounded-md">Key Points</TabsTrigger>
                        <TabsTrigger value="references" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 rounded-md">Similar Trials</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="recommendations" className="space-y-4">
                        <div className="whitespace-pre-wrap p-6 border rounded-xl bg-white shadow-sm">
                          {generatedContent.recommendation}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="key-points" className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                            <h3 className="text-md font-semibold mb-3 text-blue-800 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="m12 16 4-4-4-4"/>
                                <path d="M8 12h8"/>
                              </svg>
                              Suggested Endpoints
                            </h3>
                            <ul className="list-disc pl-5 space-y-2">
                              {generatedContent.suggestedEndpoints?.map((item, i) => (
                                <li key={i} className="text-sm text-blue-700">{item}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                            <h3 className="text-md font-semibold mb-3 text-indigo-800 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                <path d="M4 19h16"/>
                                <path d="M4 15h16"/>
                                <path d="M4 11h16"/>
                                <path d="M4 7h16"/>
                              </svg>
                              Suggested Treatment Arms
                            </h3>
                            <ul className="list-disc pl-5 space-y-2">
                              {generatedContent.suggestedArms?.map((item, i) => (
                                <li key={i} className="text-sm text-indigo-700">{item}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
                            <h3 className="text-md font-semibold mb-3 text-emerald-800 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                <path d="m9 12 2 2 4-4"/>
                                <path d="M12 3c-1.2 0-2.4.6-3 1.7A3.6 3.6 0 0 0 4.6 9c-1 .6-1.7 1.8-1.7 3s.7 2.4 1.7 3c-.3 1.2 0 2.5 1 3.4.8.8 2.1 1.1 3.3.8.6 1 1.8 1.7 3 1.7s2.4-.6 3-1.7c1.2.3 2.5 0 3.4-1 .8-.8 1.1-2.1.8-3.3 1-.6 1.7-1.8 1.7-3s-.7-2.4-1.7-3c.3-1.2 0-2.5-1-3.4-.8-.8-2.1-1.1-3.3-.8A3.6 3.6 0 0 0 12 3z"/>
                              </svg>
                              Key Suggestions
                            </h3>
                            <ul className="list-disc pl-5 space-y-2">
                              {generatedContent.keySuggestions?.map((item, i) => (
                                <li key={i} className="text-sm text-emerald-700">{item}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                            <h3 className="text-md font-semibold mb-3 text-amber-800 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                <line x1="12" y1="9" x2="12" y2="13"/>
                                <line x1="12" y1="17" x2="12.01" y2="17"/>
                              </svg>
                              Risk Factors
                            </h3>
                            <ul className="list-disc pl-5 space-y-2">
                              {generatedContent.riskFactors?.map((item, i) => (
                                <li key={i} className="text-sm text-amber-700">{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="references" className="space-y-4">
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                          <h3 className="text-md font-semibold mb-2 text-blue-800 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                              <circle cx="11" cy="11" r="8"></circle>
                              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            Similar CSRs by Therapeutic Area and Phase
                          </h3>
                          <p className="text-sm text-blue-700">
                            The following CSRs match your protocol's therapeutic area ({indication}) and trial phase ({phase.replace('phase', 'Phase ')})
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          {generatedContent.matchedCsrInsights?.length > 0 ? (
                            generatedContent.matchedCsrInsights.map((csr, i) => (
                              <div key={i} className="p-5 border border-slate-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="font-medium text-blue-800">{csr.title}</h3>
                                <div className="flex flex-wrap items-center gap-2 mt-2 mb-3">
                                  <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                    Phase: {csr.phase}
                                  </span>
                                  <span className="text-xs font-medium px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                                    Indication: {csr.indication}
                                  </span>
                                  {csr.therapeutic_area && (
                                    <span className="text-xs font-medium px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                                      Therapeutic Area: {csr.therapeutic_area}
                                    </span>
                                  )}
                                  {csr.match_score && (
                                    <span className="text-xs font-medium px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                                      Match Score: {csr.match_score}%
                                    </span>
                                  )}
                                </div>
                                
                                <div className="mt-3 border-t border-gray-100 pt-3">
                                  <h4 className="text-sm font-medium text-gray-700 mb-1">Key Findings:</h4>
                                  <p className="text-sm text-slate-600">{csr.insight || 'No specific insights available'}</p>
                                </div>
                                
                                {csr.suggestions && csr.suggestions.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-gray-100">
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Recommendations:</h4>
                                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                      {csr.suggestions.map((suggestion, idx) => (
                                        <li key={idx}>{suggestion}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-10 text-gray-500 italic bg-slate-50 rounded-xl border border-slate-200">
                              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 text-slate-300">
                                <line x1="8" y1="6" x2="21" y2="6"></line>
                                <line x1="8" y1="12" x2="21" y2="12"></line>
                                <line x1="8" y1="18" x2="21" y2="18"></line>
                                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                <line x1="3" y1="18" x2="3.01" y2="18"></line>
                              </svg>
                              <p>No similar trials found</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="overflow-hidden border-0 shadow-lg rounded-xl">
              <CardContent className="p-12 flex flex-col items-center justify-center text-center h-[500px] bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="rounded-full bg-white p-5 shadow-md mb-6">
                  <FileText className="h-12 w-12 text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold text-blue-800 mb-3">No Optimization Results Yet</h3>
                <p className="text-slate-600 mt-2 max-w-md leading-relaxed">
                  Enter your protocol details in the form and click "Optimize Protocol" to receive 
                  AI-powered recommendations and insights based on successful clinical study reports.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3 items-center justify-center">
                  <div className="flex items-center text-indigo-600 font-medium text-sm bg-white rounded-full py-2 px-4 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="m9 12 2 2 4-4"/>
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                    Evidence-based suggestions
                  </div>
                  <div className="flex items-center text-emerald-600 font-medium text-sm bg-white rounded-full py-2 px-4 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M12 2H2v10h10V2Z"/>
                      <path d="M22 12h-10v10h10V12Z"/>
                      <path d="M12 12H2v10h10V12Z"/>
                      <path d="M22 2h-10v10h10V2Z"/>
                    </svg>
                    Similar trial insights
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}