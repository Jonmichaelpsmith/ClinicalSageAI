import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  FileText, 
  Brain, 
  PieChart, 
  FlaskConical, 
  Lightbulb, 
  Upload, 
  AlertCircle, 
  X 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

const ProtocolDesigner = () => {
  const { toast } = useToast();
  const [indication, setIndication] = useState("");
  const [phase, setPhase] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [generatedProtocol, setGeneratedProtocol] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("design");
  
  // Protocol upload states
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handler for opening upload dialog
  const handleUploadClick = () => {
    setShowUploadDialog(true);
  };

  // Handler for file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  // Handler for reading file content
  const readFileContent = () => {
    if (!uploadedFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setUploadedProtocolContent(content);
    };
    reader.readAsText(uploadedFile);
  };

  // Handler for analyzing uploaded protocol
  const handleAnalyzeProtocol = async () => {
    if (!uploadedFile) {
      toast({
        title: "No file uploaded",
        description: "Please select a PDF protocol file first.",
        variant: "destructive",
      });
      return;
    }

    // Make sure the file is a PDF
    if (uploadedFile.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF document.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', uploadedFile);

      // Send the file to our new protocol analysis endpoint
      const response = await fetch('/api/protocol/analyze-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Unknown error occurred');
      }

      setAnalysisResults(data);
      setIsAnalyzing(false);
      
      toast({
        title: "Protocol analyzed successfully",
        description: `Analysis complete for ${uploadedFile.name}`,
      });
    } catch (error) {
      console.error('Protocol analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "There was an error analyzing your protocol. Please try again.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  };

  // Handler for using analysis results to create a new protocol
  const handleUseAnalysisResults = () => {
    if (!analysisResults) return;
    
    // Extract values from analysis results
    const { indication, phase, primaryEndpoint } = analysisResults.extractedInfo;
    
    // Set form values
    setIndication(indication);
    setPhase(phase);
    setEndpoint(primaryEndpoint);
    
    // Close the dialog
    setShowUploadDialog(false);
    
    // Show toast notification
    toast({
      title: "Protocol data imported",
      description: "The protocol information has been successfully imported for enhancement.",
    });
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      // Placeholder for actual API call
      setGeneratedProtocol({
        title: `${indication} Phase ${phase} Clinical Trial Protocol`,
        sections: [
          {
            sectionName: "Study Design",
            content: "This is a multi-center, randomized, double-blind, placebo-controlled study.",
            precedent: "Based on 3 similar FDA-approved studies from 2023.",
            regulatoryGuidance: "Aligns with ICH E6(R2) and FDA guidance for industry."
          },
          {
            sectionName: "Study Objectives",
            content: "The primary objective is to evaluate the efficacy and safety of the investigational product in patients with " + indication + ".",
            precedent: "Objective formulation follows structure of recent approvals in this indication.",
            regulatoryGuidance: "Includes all elements expected by regulatory authorities."
          },
          {
            sectionName: "Inclusion Criteria",
            content: "1. Adult patients aged 18 years or older\n2. Confirmed diagnosis of " + indication + "\n3. Ability to provide informed consent\n4. ECOG performance status ≤ 2\n5. Adequate organ function",
            precedent: "Criteria aligned with 5 recent successful Phase " + phase + " trials.",
            regulatoryGuidance: "Covers key safety and eligibility requirements."
          },
          {
            sectionName: "Exclusion Criteria",
            content: "1. History of hypersensitivity to similar compounds\n2. Participation in another clinical trial within 30 days\n3. Presence of significant comorbidities\n4. Pregnant or breastfeeding women\n5. Inadequate bone marrow function",
            precedent: "Standard safety exclusions for this therapeutic area.",
            regulatoryGuidance: "Includes all standard safety precautions."
          },
          {
            sectionName: endpoint ? "Primary Endpoint: " + endpoint : "Primary Endpoint",
            content: endpoint ? 
              `Change from baseline in ${endpoint} at Week 24.` :
              "Change from baseline in disease activity measures at Week 24.",
            precedent: "This endpoint has been used in 7 approved products in this space.",
            regulatoryGuidance: "Clinically meaningful endpoint accepted by both FDA and EMA."
          }
        ],
        designElements: {
          studyType: "Interventional",
          allocation: "Randomized",
          blinding: "Double-blind",
          controlType: "Placebo-controlled",
          trialDesign: "Parallel group",
          statisticalApproach: "Superiority design",
          sampleSizeEstimate: "240 subjects (1:1 randomization)"
        },
        validationSummary: {
          criticalIssues: 0,
          highIssues: 0,
          mediumIssues: 1,
          warningIssues: 2,
          lowIssues: 3
        }
      });
      setIsGenerating(false);
      setActiveTab("preview");
    }, 2000);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Protocol Designer</h1>
            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">AI-Powered</Badge>
          </div>
          <p className="text-gray-500 mt-1">Design evidence-based protocols from 1,900+ precedent studies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleUploadClick}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Protocol
          </Button>
          <Button variant="outline" size="sm">
            <Brain className="h-4 w-4 mr-2" />
            Study Design Tutorial
          </Button>
        </div>
      </div>

      <Separator className="mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Design Your Protocol</CardTitle>
                <FlaskConical className="h-5 w-5 text-blue-500" />
              </div>
              <CardDescription>
                Create a protocol document based on real-world precedent.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium">Therapeutic Area / Indication</label>
                  <Input 
                    placeholder="e.g., Type 2 Diabetes, Alzheimer's" 
                    value={indication}
                    onChange={(e) => setIndication(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Study Phase</label>
                  <Select onValueChange={setPhase}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select phase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Phase 1</SelectItem>
                      <SelectItem value="1/2">Phase 1/2</SelectItem>
                      <SelectItem value="2">Phase 2</SelectItem>
                      <SelectItem value="2/3">Phase 2/3</SelectItem>
                      <SelectItem value="3">Phase 3</SelectItem>
                      <SelectItem value="4">Phase 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Primary Endpoint (Optional)</label>
                  <Input 
                    placeholder="e.g., HbA1c, ADAS-Cog, PFS" 
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Additional Design Requirements</label>
                  <Textarea 
                    placeholder="Special population, biomarker strategy, adaptive design elements..."
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    className="mt-1.5 min-h-[100px]"
                  />
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex gap-2 items-center text-blue-700 font-medium mb-2">
                    <Lightbulb className="h-4 w-4" />
                    <span>Why This Matters</span>
                  </div>
                  <p className="text-sm text-blue-600">
                    The study design forms the scientific blueprint of your trial, while the protocol implements that design with detailed procedures and rationale.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gray-50 rounded-b-lg">
              <Button 
                onClick={handleGenerate} 
                disabled={!indication || !phase || isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? "Generating..." : "Generate Full Protocol"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2">
          {generatedProtocol ? (
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{generatedProtocol.title}</CardTitle>
                    <CardDescription className="mt-1">
                      AI-generated protocol based on evidence from similar trials
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium">
                    <CheckCircle className="h-3.5 w-3.5" />
                    FDA/EMA Precedent Aligned
                  </div>
                </div>
              </CardHeader>
              <div className="px-6">
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4 w-full grid grid-cols-3">
                    <TabsTrigger value="design">Study Design</TabsTrigger>
                    <TabsTrigger value="preview">Protocol Preview</TabsTrigger>
                    <TabsTrigger value="download">Export Options</TabsTrigger>
                  </TabsList>
                  <TabsContent value="design">
                    <div className="bg-blue-50 rounded-xl p-4 mb-5">
                      <h3 className="text-md font-semibold text-blue-800 mb-3">Clinical Study Design Elements</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(generatedProtocol.designElements).map(([key, value]) => (
                          <div key={key} className="bg-white rounded-lg p-3 shadow-sm">
                            <div className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                            <div className="font-medium">{value as React.ReactNode}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <h3 className="text-md font-semibold mb-3">Validation Summary</h3>
                      <div className="grid grid-cols-5 gap-2">
                        <div className="bg-red-50 rounded-lg p-2 text-center">
                          <div className="text-red-600 font-bold text-xl">{generatedProtocol.validationSummary.criticalIssues}</div>
                          <div className="text-xs text-red-800">Critical</div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-2 text-center">
                          <div className="text-orange-600 font-bold text-xl">{generatedProtocol.validationSummary.highIssues}</div>
                          <div className="text-xs text-orange-800">High</div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-2 text-center">
                          <div className="text-yellow-600 font-bold text-xl">{generatedProtocol.validationSummary.mediumIssues}</div>
                          <div className="text-xs text-yellow-800">Medium</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-2 text-center">
                          <div className="text-blue-600 font-bold text-xl">{generatedProtocol.validationSummary.warningIssues}</div>
                          <div className="text-xs text-blue-800">Warning</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <div className="text-gray-600 font-bold text-xl">{generatedProtocol.validationSummary.lowIssues}</div>
                          <div className="text-xs text-gray-800">Low</div>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full mt-2" onClick={() => setActiveTab("preview")}>
                      View Full Protocol
                    </Button>
                  </TabsContent>
                  <TabsContent value="preview">
                    <div className="space-y-5">
                      {generatedProtocol.sections.map((section: any, index: number) => (
                        <div key={index} className="border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 p-3 border-b">
                            <h3 className="text-md font-semibold">{section.sectionName}</h3>
                          </div>
                          <div className="p-4">
                            <p className="whitespace-pre-line text-gray-800">{section.content}</p>

                            <div className="mt-4 pt-3 border-t grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="bg-green-50 rounded p-2 text-sm">
                                <span className="text-green-800 font-medium block mb-1">Precedent:</span>
                                <span className="text-green-700">{section.precedent}</span>
                              </div>
                              <div className="bg-blue-50 rounded p-2 text-sm">
                                <span className="text-blue-800 font-medium block mb-1">Regulatory Alignment:</span>
                                <span className="text-blue-700">{section.regulatoryGuidance}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="download">
                    <div className="space-y-5">
                      <p className="text-gray-600">Download your protocol in the following formats:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <Button variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100">
                          <FileText className="h-4 w-4 mr-2" />
                          Download as PDF
                        </Button>
                        <Button variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                          <FileText className="h-4 w-4 mr-2" />
                          Download as Word
                        </Button>
                        <Button variant="outline" className="border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100">
                          <FileText className="h-4 w-4 mr-2" />
                          Download as Text
                        </Button>
                      </div>

                      <div className="mt-6 border rounded-lg p-4 bg-amber-50">
                        <h3 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                          <PieChart className="h-4 w-4" />
                          Protocol Performance Projection
                        </h3>
                        <p className="text-amber-700 text-sm mb-3">
                          Based on similar historical studies, we project the following outcomes:
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-white rounded p-2 shadow-sm">
                            <div className="text-xs text-gray-500 mb-1">Est. Enrollment Rate</div>
                            <div className="font-medium">5-7 subjects/site/month</div>
                          </div>
                          <div className="bg-white rounded p-2 shadow-sm">
                            <div className="text-xs text-gray-500 mb-1">Est. Screen Failure</div>
                            <div className="font-medium">25-30%</div>
                          </div>
                          <div className="bg-white rounded p-2 shadow-sm">
                            <div className="text-xs text-gray-500 mb-1">Est. Dropout Rate</div>
                            <div className="font-medium">15-20%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              <CardFooter className="flex justify-between mt-4 pt-4 border-t">
                <Button variant="outline">
                  Edit Protocol
                </Button>
                <Button>
                  Finalize Protocol
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="shadow-sm border-gray-200 h-full">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Protocol Preview</CardTitle>
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <CardDescription>
                  Your AI-generated protocol will appear here
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col items-center justify-center py-12">
                <div className="text-center max-w-md mx-auto">
                  <div className="bg-blue-100 h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Create Your Evidence-Based Protocol</h3>
                  <p className="text-gray-500 mb-6">
                    Fill in the form and generate a protocol that incorporates clinical study design elements backed by real-world regulatory precedent.
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium mb-1 text-gray-700">Study Design</p>
                      <p className="text-gray-500">The scientific architecture of your clinical trial</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium mb-1 text-gray-700">Protocol Document</p>
                      <p className="text-gray-500">The complete instructions to execute that design</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Protocol Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Upload Existing Protocol
            </DialogTitle>
            <DialogDescription>
              Upload your existing protocol to analyze and improve using our AI-powered recommendations.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {!uploadedFile ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept=".txt,.doc,.docx,.pdf" 
                  onChange={handleFileChange}
                />
                <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium mb-2">Drag & drop your protocol file or click to browse</h3>
                <p className="text-gray-500 mb-2">
                  Supported formats: .txt, .doc, .docx, .pdf
                </p>
                <Button variant="outline" className="mt-2">Select File</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-500">{Math.round(uploadedFile.size / 1024)} KB</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-400 hover:text-red-600"
                    onClick={() => {
                      setUploadedFile(null);
                      setUploadedProtocolContent("");
                      setAnalysisResults(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {!uploadedProtocolContent ? (
                  <div className="text-center">
                    <Button onClick={readFileContent}>Extract Protocol Content</Button>
                  </div>
                ) : !analysisResults ? (
                  <div className="space-y-4">
                    <Textarea 
                      className="min-h-[200px]" 
                      value={uploadedProtocolContent} 
                      onChange={(e) => setUploadedProtocolContent(e.target.value)}
                      placeholder="Protocol content will appear here..."
                    />
                    <div className="flex justify-center">
                      <Button 
                        onClick={handleAnalyzeProtocol} 
                        disabled={isAnalyzing}
                        className="gap-2"
                      >
                        {isAnalyzing && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
                        {isAnalyzing ? "Analyzing..." : "Analyze Protocol"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-md font-medium mb-3">Extracted Protocol Information</h3>
                        <div className="space-y-2">
                          {Object.entries(analysisResults.extractedInfo).map(([key, value]) => (
                            <div key={key} className="bg-gray-50 p-3 rounded-lg">
                              <div className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                              <div className="font-medium">{value as string}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-md font-medium mb-3">Protocol Evaluation</h3>
                        <div className="space-y-3">
                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="text-green-800 font-medium mb-2">Strengths</div>
                            <ul className="list-disc pl-5 space-y-1">
                              {analysisResults.evaluation.strengths.map((strength: string, index: number) => (
                                <li key={index} className="text-sm text-green-700">{strength}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="bg-amber-50 p-3 rounded-lg">
                            <div className="text-amber-800 font-medium mb-2">Improvement Areas</div>
                            <ul className="list-disc pl-5 space-y-1">
                              {analysisResults.evaluation.improvements.map((improvement: string, index: number) => (
                                <li key={index} className="text-sm text-amber-700">{improvement}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-md font-medium mb-3">Alignment Scoring</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-blue-800 font-medium mb-1">Regulatory Alignment</div>
                          <div className="mt-1">
                            <Progress value={analysisResults.evaluation.regulatoryAlignment} className="h-2" />
                            <div className="flex justify-between text-xs mt-1">
                              <span className="text-gray-500">Score</span>
                              <span className="font-medium text-blue-800">{analysisResults.evaluation.regulatoryAlignment}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-indigo-50 p-3 rounded-lg">
                          <div className="text-indigo-800 font-medium mb-1">Precedent Matching</div>
                          <div className="mt-1">
                            <Progress value={analysisResults.evaluation.precedentMatching} className="h-2" />
                            <div className="flex justify-between text-xs mt-1">
                              <span className="text-gray-500">Score</span>
                              <span className="font-medium text-indigo-800">{analysisResults.evaluation.precedentMatching}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-md font-medium mb-3">Similar Precedent Trials</h3>
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="py-2 px-3 text-left font-medium text-gray-700">Trial ID</th>
                              <th className="py-2 px-3 text-left font-medium text-gray-700">Title</th>
                              <th className="py-2 px-3 text-left font-medium text-gray-700">Sponsor</th>
                              <th className="py-2 px-3 text-left font-medium text-gray-700">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analysisResults.evaluation.similarTrials.map((trial: any, index: number) => (
                              <tr key={index} className="border-t border-gray-200">
                                <td className="py-2 px-3 font-medium text-blue-600">{trial.id}</td>
                                <td className="py-2 px-3">{trial.title}</td>
                                <td className="py-2 px-3">{trial.sponsor}</td>
                                <td className="py-2 px-3 text-gray-500">{trial.date}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            {analysisResults && (
              <Button onClick={handleUseAnalysisResults}>
                Use Analysis Results
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProtocolDesigner;