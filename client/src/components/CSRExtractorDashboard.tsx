import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { FileUp, CheckCircle, AlertCircle, FileText, Database, ArrowRight, Download, Search, Lightbulb, BarChart3, BrainCircuit, Beaker } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export default function CSRExtractorDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [csrId, setCsrId] = useState<string>("");
  const [sponsor, setSponsor] = useState<string>("");
  const [indication, setIndication] = useState<string>("");
  const [phase, setPhase] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<string>("");
  const [processingStage, setProcessingStage] = useState<string>("");
  const [extractionStats, setExtractionStats] = useState<any>(null);
  const [enhancedOptions, setEnhancedOptions] = useState<{
    subgroupAnalysis: boolean;
    endpointSentiment: boolean;
    regulatoryMapping: boolean;
    competitiveAnalysis: boolean;
    sustainabilityMetrics: boolean;
  }>({
    subgroupAnalysis: true,
    endpointSentiment: true,
    regulatoryMapping: true,
    competitiveAnalysis: true,
    sustainabilityMetrics: true
  });
  const [activeTab, setActiveTab] = useState("upload");
  const [recentCsrs, setRecentCsrs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Fetch recent CSRs on component mount
    fetchRecentCsrs();
  }, []);
  
  const fetchRecentCsrs = async () => {
    try {
      const res = await fetch("/api/csr/recent", {
        method: "GET"
      });
      const data = await res.json();
      setRecentCsrs(data.csrs || []);
    } catch (err) {
      console.error("Failed to fetch recent CSRs:", err);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "File required",
        description: "Please select a CSR file to upload",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setProgress(0);
    setStatus("Starting upload...");
    setProcessingStage("upload");
    
    const formData = new FormData();
    formData.append("file", file);
    
    // Add metadata if provided
    if (csrId) formData.append("csrId", csrId);
    if (sponsor) formData.append("sponsor", sponsor);
    if (indication) formData.append("indication", indication);
    if (phase) formData.append("phase", phase);
    
    // Add enhancement options
    Object.entries(enhancedOptions).forEach(([key, value]) => {
      formData.append(`option_${key}`, String(value));
    });

    try {
      // Simulate progress during upload
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) return prev + 5;
          return prev;
        });
      }, 500);
      
      setProcessingStage("extracting");
      setStatus("Extracting CSR data...");
      
      const res = await fetch("/api/csr/upload-enhanced", {
        method: "POST",
        body: formData
      });
      
      clearInterval(progressInterval);
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Upload failed");
      }
      
      const data = await res.json();
      setResult(data);
      setProgress(100);
      setProcessingStage("complete");
      setStatus("✅ CSR successfully processed and mapped");
      
      // Extract stats from result
      if (data.extraction_stats) {
        setExtractionStats(data.extraction_stats);
      }
      
      // Refresh recent CSRs list
      fetchRecentCsrs();
      
      toast({
        title: "Processing complete",
        description: "CSR has been successfully extracted and mapped",
      });
      
      // Switch to results tab
      setActiveTab("results");
    } catch (err) {
      setProgress(0);
      setProcessingStage("");
      setStatus("❌ " + (err instanceof Error ? err.message : "Processing failed"));
      
      toast({
        title: "Processing failed",
        description: err instanceof Error ? err.message : "Failed to process CSR file",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleIngest = async () => {
    if (!result?.mapped_output) {
      toast({
        title: "No data available",
        description: "Please process a CSR file first",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setStatus("Processing for Strategic Protocol Recommendations...");
    
    try {
      // First fetch the mapped content
      const response = await fetch(result.mapped_output);
      const content = await response.json();
      
      // Then ingest it into the intelligence system
      const res = await fetch("/api/intelligence/ingest-csr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content,
          options: enhancedOptions,
          metadata: {
            csrId: csrId || result.csrId,
            sponsor: sponsor || result.sponsor,
            indication: indication || result.indication,
            phase: phase || result.phase
          }
        })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Intelligence integration failed");
      }
      
      const data = await res.json();
      
      if (data?.redirect_route) {
        toast({
          title: "Integration successful",
          description: "Launching Strategic Protocol Recommendations interface",
        });
        
        setStatus("✅ CSR integrated. Launching planning interface...");
        setLocation(data.redirect_route);
      } else {
        setStatus("✅ CSR processed and integrated into the system.");
        
        toast({
          title: "Integration successful",
          description: "CSR has been processed and added to the knowledge base",
        });
      }
    } catch (err) {
      console.error("CSR intelligence ingestion failed:", err);
      setStatus("❌ Intelligence integration failed.");
      
      toast({
        title: "Integration failed",
        description: err instanceof Error ? err.message : "Failed to integrate CSR into the system",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressColor = () => {
    if (progress === 100) return "bg-green-600";
    if (progress > 65) return "bg-blue-600";
    return "bg-blue-500";
  };
  
  const getProgressStepStatus = (stage: string) => {
    const stages = ["upload", "extracting", "mapping", "complete"];
    const currentIndex = stages.indexOf(processingStage);
    const stageIndex = stages.indexOf(stage);
    
    if (stageIndex < currentIndex) return "complete";
    if (stageIndex === currentIndex) return "active";
    return "pending";
  };

  const resetForm = () => {
    setFile(null);
    setCsrId("");
    setSponsor("");
    setIndication("");
    setPhase("");
    setResult(null);
    setProgress(0);
    setStatus("");
    setProcessingStage("");
    setExtractionStats(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    toast({
      title: "Form reset",
      description: "CSR extraction form has been reset",
    });
  };
  
  const selectRecentCsr = (csr: any) => {
    setActiveTab("results");
    setResult({
      csrId: csr.id,
      sponsor: csr.sponsor,
      indication: csr.indication,
      phase: csr.phase,
      mapped_output: csr.mappedOutputUrl || `/api/csr/${csr.id}/mapped-output`,
      extraction_stats: csr.extractionStats || {
        endpoints_extracted: csr.endpointsExtracted || 0,
        subjects_analyzed: csr.subjectsAnalyzed || 0,
        safety_data_points: csr.safetyDataPoints || 0,
        pages_processed: csr.pagesProcessed || 0,
        references_identified: csr.referencesIdentified || 0
      }
    });
    setExtractionStats(csr.extractionStats || {
      endpoints_extracted: csr.endpointsExtracted || 0,
      subjects_analyzed: csr.subjectsAnalyzed || 0,
      safety_data_points: csr.safetyDataPoints || 0,
      pages_processed: csr.pagesProcessed || 0,
      references_identified: csr.referencesIdentified || 0
    });
    setStatus("✅ CSR loaded from database");
    
    toast({
      title: "CSR loaded",
      description: `${csr.title || 'CSR #' + csr.id} has been loaded`,
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            CSR Intelligence Extractor
          </h1>
          <p className="text-muted-foreground">Extract, map, and leverage clinical study reports for strategic protocol recommendations</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-2 py-1 text-xs bg-blue-50">
            <Database className="h-3 w-3 mr-1" />
            779 CSRs Loaded
          </Badge>
          <Badge variant="outline" className="px-2 py-1 text-xs bg-green-50">
            <BrainCircuit className="h-3 w-3 mr-1" />
            SPRA v2.1 Ready
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="upload" className="flex items-center gap-1">
            <FileUp className="h-4 w-4" />
            Upload CSR
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-1">
            <Database className="h-4 w-4" />
            CSR Library
          </TabsTrigger>
          <TabsTrigger value="results" disabled={!result} className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileUp className="h-5 w-5 text-blue-600" />
                  Upload CSR Document
                </CardTitle>
                <CardDescription>
                  Upload a clinical study report to extract structured data for protocol recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${file ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleFileDrop}
                  onDragOver={handleDragOver}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept=".pdf,.docx,.txt" 
                    onChange={(e) => e.target.files && setFile(e.target.files[0])} 
                  />
                  <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <FileUp className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    {file ? file.name : 'Drag & drop your CSR or click to browse'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {file
                      ? `${(file.size / 1024 / 1024).toFixed(2)} MB - ${file.type || 'Unknown file type'}`
                      : 'Supports PDF, DOCX, or TXT files up to 100MB'}
                  </p>
                  
                  {file && (
                    <Badge className="mt-3 bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      File selected
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="csrId">CSR ID or Study Number (Optional)</Label>
                    <Input 
                      id="csrId" 
                      placeholder="e.g., CSR-12345 or NCT0123456" 
                      value={csrId}
                      onChange={(e) => setCsrId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sponsor">Sponsor (Optional)</Label>
                    <Input 
                      id="sponsor" 
                      placeholder="e.g., AstraZeneca, Pfizer, etc." 
                      value={sponsor}
                      onChange={(e) => setSponsor(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="indication">Indication (Optional)</Label>
                    <Input 
                      id="indication" 
                      placeholder="e.g., Obesity, Alzheimer's, etc." 
                      value={indication}
                      onChange={(e) => setIndication(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phase">Phase (Optional)</Label>
                    <Input 
                      id="phase" 
                      placeholder="e.g., Phase 2, Phase 3, etc." 
                      value={phase}
                      onChange={(e) => setPhase(e.target.value)}
                    />
                  </div>
                </div>
                
                {isLoading && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>{processingStage === "complete" ? "Completed" : "Processing..."}</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 w-full" indicatorClassName={getProgressColor()} />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span className={getProgressStepStatus("upload") === "complete" ? "text-green-600" : ""}>Upload</span>
                      <span className={getProgressStepStatus("extracting") === "complete" ? "text-green-600" : (getProgressStepStatus("extracting") === "active" ? "text-blue-600" : "")}>Extraction</span>
                      <span className={getProgressStepStatus("mapping") === "complete" ? "text-green-600" : (getProgressStepStatus("mapping") === "active" ? "text-blue-600" : "")}>Mapping</span>
                      <span className={getProgressStepStatus("complete") === "complete" ? "text-green-600" : (getProgressStepStatus("complete") === "active" ? "text-blue-600" : "")}>Complete</span>
                    </div>
                  </div>
                )}
                
                {status && (
                  <Alert variant={status.includes("❌") ? "destructive" : (status.includes("✅") ? "success" : "default")}>
                    <AlertTitle>Status</AlertTitle>
                    <AlertDescription className="text-sm">{status}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={resetForm} disabled={isLoading}>
                  Reset
                </Button>
                <Button onClick={handleUpload} disabled={!file || isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isLoading ? "Processing..." : "Process CSR Document"}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Enhanced Analysis Options
                </CardTitle>
                <CardDescription className="text-xs">
                  Select additional analyses to perform on the CSR
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="subgroupAnalysis" 
                      checked={enhancedOptions.subgroupAnalysis} 
                      onCheckedChange={(checked) => setEnhancedOptions(prev => ({...prev, subgroupAnalysis: !!checked}))}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="subgroupAnalysis" className="font-medium">Subgroup Analysis</Label>
                      <p className="text-xs text-muted-foreground">Extract demographic-specific outcomes for precision sample sizing</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="endpointSentiment" 
                      checked={enhancedOptions.endpointSentiment} 
                      onCheckedChange={(checked) => setEnhancedOptions(prev => ({...prev, endpointSentiment: !!checked}))}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="endpointSentiment" className="font-medium">Endpoint Sentiment Analysis</Label>
                      <p className="text-xs text-muted-foreground">Analyze effectiveness of endpoints for patient retention</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="regulatoryMapping" 
                      checked={enhancedOptions.regulatoryMapping} 
                      onCheckedChange={(checked) => setEnhancedOptions(prev => ({...prev, regulatoryMapping: !!checked}))}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="regulatoryMapping" className="font-medium">Regulatory Alignment</Label>
                      <p className="text-xs text-muted-foreground">Map to current FDA, EMA, PMDA and HC guidelines</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="competitiveAnalysis" 
                      checked={enhancedOptions.competitiveAnalysis} 
                      onCheckedChange={(checked) => setEnhancedOptions(prev => ({...prev, competitiveAnalysis: !!checked}))}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="competitiveAnalysis" className="font-medium">Competitive Intelligence</Label>
                      <p className="text-xs text-muted-foreground">Compare against competitive landscape in therapeutic area</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="sustainabilityMetrics" 
                      checked={enhancedOptions.sustainabilityMetrics} 
                      onCheckedChange={(checked) => setEnhancedOptions(prev => ({...prev, sustainabilityMetrics: !!checked}))}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="sustainabilityMetrics" className="font-medium">Sustainability Metrics</Label>
                      <p className="text-xs text-muted-foreground">Calculate carbon footprint and sustainability impact</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="rounded-md bg-amber-50 p-3 text-xs text-amber-800">
                  <div className="font-medium flex items-center mb-1">
                    <Beaker className="h-3 w-3 mr-1" />
                    Advanced SPRA Integration
                  </div>
                  <p>All selected analyses will be used by the Strategic Protocol Recommendations Advisor to optimize protocol design.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="library">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                CSR Knowledge Library
              </CardTitle>
              <CardDescription>
                Browse previously processed clinical study reports and their extracted intelligence
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentCsrs.length > 0 ? (
                <div className="divide-y">
                  {recentCsrs.map((csr) => (
                    <div key={csr.id} className="py-3 flex items-center justify-between hover:bg-gray-50 rounded-md px-2 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{csr.title || `CSR #${csr.id}`}</span>
                          <Badge variant="outline" className="text-xs">
                            {csr.phase || "Unknown Phase"}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
                          <span>Sponsor: {csr.sponsor || "Unknown"}</span>
                          <span>Indication: {csr.indication || "Unknown"}</span>
                          <span>Added: {new Date(csr.uploadDate || Date.now()).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="flex items-center gap-1" onClick={() => selectRecentCsr(csr)}>
                        <ArrowRight className="h-3 w-3" />
                        Select
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Database className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                  <h3 className="font-medium text-muted-foreground">No CSRs in Library</h3>
                  <p className="text-sm text-muted-foreground mt-1">Upload your first CSR to begin building your intelligence library</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="results">
          {result ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <Card className="md:col-span-8">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <FileText className="h-5 w-5 text-blue-600" />
                    CSR Data Extraction Results
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {result.csrId && (
                      <Badge variant="outline" className="text-xs">
                        ID: {result.csrId}
                      </Badge>
                    )}
                    {result.sponsor && (
                      <Badge variant="outline" className="text-xs bg-blue-50">
                        Sponsor: {result.sponsor}
                      </Badge>
                    )}
                    {result.indication && (
                      <Badge variant="outline" className="text-xs bg-green-50">
                        Indication: {result.indication}
                      </Badge>
                    )}
                    {result.phase && (
                      <Badge variant="outline" className="text-xs bg-amber-50">
                        Phase: {result.phase}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="mb-4 overflow-auto rounded-md border max-h-96">
                    <div className="bg-muted p-3 sticky top-0 text-sm font-medium">
                      Extracted Data
                    </div>
                    <pre className="text-xs p-3 overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                  
                  <div className="flex flex-col gap-4 mt-6">
                    <h3 className="text-sm font-medium">Extraction Statistics</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <span className="block text-lg font-bold text-blue-700">
                          {extractionStats?.endpoints_extracted || 0}
                        </span>
                        <span className="text-xs text-blue-600">Endpoints Extracted</span>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <span className="block text-lg font-bold text-green-700">
                          {extractionStats?.subjects_analyzed || 0}
                        </span>
                        <span className="text-xs text-green-600">Subjects Analyzed</span>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <span className="block text-lg font-bold text-purple-700">
                          {extractionStats?.safety_data_points || 0}
                        </span>
                        <span className="text-xs text-purple-600">Safety Data Points</span>
                      </div>
                      <div className="bg-amber-50 p-3 rounded-lg">
                        <span className="block text-lg font-bold text-amber-700">
                          {extractionStats?.pages_processed || 0}
                        </span>
                        <span className="text-xs text-amber-600">Pages Processed</span>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <span className="block text-lg font-bold text-red-700">
                          {extractionStats?.references_identified || 0}
                        </span>
                        <span className="text-xs text-red-600">References Identified</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>Data extraction complete and ready for Strategic Protocol Recommendations</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" asChild>
                      <a href={result.mapped_output} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        Download JSON
                      </a>
                    </Button>
                  </div>
                  <Button 
                    onClick={handleIngest}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  >
                    <BrainCircuit className="h-4 w-4" />
                    {isLoading ? "Processing..." : "Integrate with SPRA"}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="md:col-span-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BrainCircuit className="h-4 w-4 text-purple-600" />
                    SPRA Integration
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Strategic Protocol Recommendations Advisor
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2 space-y-4">
                  <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                    <BrainCircuit className="h-4 w-4" />
                    <AlertTitle className="text-xs font-medium">Ready for Integration</AlertTitle>
                    <AlertDescription className="text-xs">
                      This CSR can be integrated with the Strategic Protocol Recommendations Advisor to generate evidence-based protocol designs.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Enhanced Capabilities</h3>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        <div className="rounded-full bg-green-100 h-5 w-5 flex items-center justify-center mt-0.5 flex-shrink-0">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Precision Sample Size Optimization</p>
                          <p className="text-muted-foreground">Stratified power analysis for demographic subgroups</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <div className="rounded-full bg-green-100 h-5 w-5 flex items-center justify-center mt-0.5 flex-shrink-0">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Patient-Centric Endpoint Strategy</p>
                          <p className="text-muted-foreground">CSR sentiment analysis for improved retention</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <div className="rounded-full bg-green-100 h-5 w-5 flex items-center justify-center mt-0.5 flex-shrink-0">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Adaptive Design with Safety Milestones</p>
                          <p className="text-muted-foreground">Temporal analysis with interim checkpoints</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <div className="rounded-full bg-green-100 h-5 w-5 flex items-center justify-center mt-0.5 flex-shrink-0">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Ethical Recruitment Strategy</p>
                          <p className="text-muted-foreground">DEI analysis for improved diversity</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <div className="rounded-full bg-green-100 h-5 w-5 flex items-center justify-center mt-0.5 flex-shrink-0">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Cost-Benefit & Sustainability Analysis</p>
                          <p className="text-muted-foreground">ROI and carbon footprint reduction metrics</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-md bg-purple-50 p-3 text-xs">
                    <div className="font-medium text-purple-800 flex items-center gap-1 mb-1">
                      <Search className="h-3 w-3" />
                      CSR Knowledge Base Impact
                    </div>
                    <p className="text-purple-700">
                      This CSR will join 779 others in the knowledge base, improving recommendation accuracy for future protocols in this therapeutic area.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-muted-foreground">No CSR Results Available</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                Upload a CSR document or select one from the library to view extraction results
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setActiveTab("upload")}
              >
                Go to Upload
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}