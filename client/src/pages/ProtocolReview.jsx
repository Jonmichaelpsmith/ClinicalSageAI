import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  RefreshCw, 
  Download, 
  Sparkles, 
  Microscope, 
  ClipboardList, 
  BookOpen, 
  ArrowRight, 
  CheckCircle, 
  BarChart4, 
  XCircle,
  Clock,
  AlertCircle,
  Info,
  Scale,
  Check,
  Plus,
  ChevronRight,
  ArrowUpDown,
  ChevronDown,
  Loader2,
  HelpCircle,
  ShieldCheck,
  Beaker,
  BookMarked
} from 'lucide-react';

// Import the subcomponents we created
import ProtocolBlueprintGenerator from '../components/protocol/ProtocolBlueprintGenerator';
import AdaptiveDesignSimulator from '../components/protocol/AdaptiveDesignSimulator';
import IntelligentEndpointAdvisor from '../components/protocol/IntelligentEndpointAdvisor';
import AdvancedSimulationTools from '../components/protocol/AdvancedSimulationTools';
import StatisticalDesign from '../components/protocol/StatisticalDesign';

/**
 * Protocol Review Page Component
 * 
 * Provides a comprehensive interface for analyzing protocol drafts against
 * CSR libraries, regulatory guidelines, and academic best practices.
 */
const ProtocolReview = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [activeResultTab, setActiveResultTab] = useState('overview');
  
  const { toast } = useToast();
  
  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setUploadedFile(file);
        toast({
          title: "File uploaded successfully",
          description: `"${file.name}" has been uploaded and is ready for analysis.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Invalid file format",
          description: "Please upload a PDF or Word document (.doc, .docx).",
          variant: "destructive"
        });
      }
    }
  };
  
  // Start protocol analysis
  const startAnalysis = () => {
    if (!uploadedFile) {
      toast({
        title: "No file uploaded",
        description: "Please upload a protocol document first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.floor(Math.random() * 5) + 1;
      });
    }, 500);
    
    // Simulate analysis completion after 8 seconds
    setTimeout(() => {
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      
      // Generate mock analysis results
      const mockResults = generateMockAnalysisResults();
      
      setTimeout(() => {
        setAnalysisResults(mockResults);
        setIsAnalyzing(false);
        setAnalysisComplete(true);
        setActiveTab('results');
        
        toast({
          title: "Protocol analysis complete",
          description: "Your protocol has been analyzed against our comprehensive database of clinical trials and regulatory guidance.",
          variant: "default"
        });
      }, 500);
    }, 8000);
  };
  
  // Reset the analysis
  const resetAnalysis = () => {
    setUploadedFile(null);
    setIsAnalyzing(false);
    setAnalysisProgress(0);
    setAnalysisComplete(false);
    setAnalysisResults(null);
    setActiveTab('upload');
    
    toast({
      title: "Analysis reset",
      description: "You can now upload a new protocol for analysis.",
      variant: "default"
    });
  };
  
  // Generate mock analysis results
  const generateMockAnalysisResults = () => {
    const alignmentScores = {
      overall: 79,
      primary_endpoint: 85,
      secondary_endpoints: 72,
      inclusion_criteria: 88,
      exclusion_criteria: 93,
      study_population: 75,
      treatment_duration: 65,
      dosing_regimen: 82,
      safety_monitoring: 90,
      statistical_approach: 76
    };
    
    const regulatoryFindings = [
      { 
        category: "Primary Endpoint", 
        description: "The specified primary endpoint is aligned with FDA guidance for this therapeutic area. Consider adding time frame specificity.",
        severity: "minor",
        reference: "FDA Guidance (2022): Clinical Trial Endpoints for this Indication"
      },
      { 
        category: "Sample Size", 
        description: "Sample size calculation lacks justification based on expected effect size. This is commonly cited in FDA Complete Response Letters.",
        severity: "major",
        reference: "ICH E9 Statistical Principles for Clinical Trials, Section 3.5"
      },
      { 
        category: "Exclusion Criteria", 
        description: "Overly restrictive exclusion criteria may limit generalizability of results. Consider revising per ICH E9 R1 guidance.",
        severity: "moderate",
        reference: "ICH E9(R1) Addendum on Estimands and Sensitivity Analysis"
      },
      { 
        category: "Safety Monitoring", 
        description: "Safety monitoring plan meets current expectations for this therapeutic area and phase.",
        severity: "compliant",
        reference: "ICH E6(R2) GCP Guidelines Section 5.18"
      },
      { 
        category: "Statistical Analysis", 
        description: "Multiple testing correction method is not specified for secondary endpoint analyses.",
        severity: "minor",
        reference: "EMA Points to Consider on Multiplicity Issues in Clinical Trials"
      }
    ];
    
    const similarTrials = [
      {
        nctId: "NCT04256473",
        title: "Randomized Phase 2 Study of Intervention X in Population Y",
        sponsor: "Major Pharmaceutical Company",
        phase: "Phase 2",
        status: "Completed",
        enrollment: 230,
        startDate: "2021-03-15",
        completionDate: "2022-08-24",
        primaryEndpoint: "Change from baseline in disease activity score at Week 24",
        designNotes: "Placebo-controlled, 1:1:1 randomization with three dose groups",
        similarityScore: 92
      },
      {
        nctId: "NCT03892864",
        title: "Efficacy and Safety Study of Treatment Z in Patients with Condition Y",
        sponsor: "University Medical Center",
        phase: "Phase 2/3",
        status: "Active, not recruiting",
        enrollment: 310,
        startDate: "2020-11-01",
        completionDate: "2023-04-30",
        primaryEndpoint: "Proportion of subjects achieving clinical response at Week 16",
        designNotes: "Adaptive design with sample size re-estimation",
        similarityScore: 85
      },
      {
        nctId: "NCT02774681",
        title: "A Study to Evaluate Novel Therapy for Indication Y",
        sponsor: "Biotech Inc.",
        phase: "Phase 2",
        status: "Completed",
        enrollment: 184,
        startDate: "2019-06-22",
        completionDate: "2021-09-17",
        primaryEndpoint: "Time to disease progression",
        designNotes: "Event-driven trial with blinded endpoint adjudication committee",
        similarityScore: 78
      }
    ];
    
    const endpoints = [
      {
        name: "Primary Endpoint",
        description: "Change from baseline in Disease Activity Score at Week 24",
        precedent: "Used in 78% of similar trials",
        suggestion: "Well-aligned with regulatory expectations. Consider adding interim assessment at Week 12 to enable early detection of treatment effect.",
        acceptanceRating: "High"
      },
      {
        name: "Secondary Endpoint #1",
        description: "Proportion of subjects achieving clinical remission at Week 24",
        precedent: "Used in 64% of similar trials",
        suggestion: "Consider updating definition of 'clinical remission' to align with latest consensus guidelines published in 2023.",
        acceptanceRating: "Medium"
      },
      {
        name: "Secondary Endpoint #2",
        description: "Quality of life assessment using validated questionnaire",
        precedent: "Used in 82% of similar trials",
        suggestion: "Well-specified and aligned with patient-centered outcomes focus. No changes needed.",
        acceptanceRating: "High"
      },
      {
        name: "Exploratory Endpoint",
        description: "Biomarker response at Week 4, 12, and 24",
        precedent: "Similar approach in 35% of trials",
        suggestion: "Consider upgrading to secondary endpoint given increased regulatory interest in this biomarker as shown in recent approvals.",
        acceptanceRating: "Medium"
      }
    ];
    
    const recommendations = [
      {
        category: "Study Design",
        priority: "high",
        issue: "Sample size justification lacks statistical power calculation details",
        recommendation: "Include detailed power calculation with assumed effect size, variability, and dropout rate assumptions",
        impact: "Prevents potential FDA information requests during review; strengthens statistical validity of the study"
      },
      {
        category: "Primary Endpoint",
        priority: "medium",
        issue: "Time frame for primary endpoint assessment is not clearly specified",
        recommendation: "Clearly define time frame as 'Week 24 ± 3 days' and include handling of missing data",
        impact: "Improves clarity and reduces risk of inconsistent endpoint collection"
      },
      {
        category: "Inclusion/Exclusion",
        priority: "medium",
        issue: "Exclusion criteria may be overly restrictive for generalizability",
        recommendation: "Consider revising criteria #4 and #7 to be less restrictive while maintaining study integrity",
        impact: "Improves study population representativeness and enrollment feasibility"
      },
      {
        category: "Statistical Analysis",
        priority: "high",
        issue: "Multiple testing strategy for secondary endpoints not specified",
        recommendation: "Implement hierarchical testing procedure or Bonferroni correction to control family-wise error rate",
        impact: "Critical for regulatory acceptance of secondary endpoint claims"
      },
      {
        category: "Safety Monitoring",
        priority: "medium",
        issue: "DSMB charter lacks stopping rules detail",
        recommendation: "Define specific statistical triggers for safety concerns requiring study pause or review",
        impact: "Enhances subject protection and provides clarity for decision-making"
      }
    ];
    
    return {
      filename: uploadedFile.name,
      fileSize: uploadedFile.size,
      analyzeDate: new Date().toISOString(),
      alignmentScores,
      regulatoryFindings,
      similarTrials,
      endpoints,
      recommendations
    };
  };
  
  // Render the upload UI
  const renderUploadUI = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Protocol Document</CardTitle>
            <CardDescription>
              Upload your protocol document to analyze against our database of regulatory precedents, 
              similar studies, and best practices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center">
              <Upload className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-1">Upload your protocol document</h3>
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop your document here, or click to browse
              </p>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-500">
                  Accepted formats:
                </p>
                <Badge variant="outline" className="text-xs">PDF</Badge>
                <Badge variant="outline" className="text-xs">DOC</Badge>
                <Badge variant="outline" className="text-xs">DOCX</Badge>
              </div>
              
              <input
                type="file"
                id="protocol-upload"
                className="hidden"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileUpload}
              />
              <label htmlFor="protocol-upload" className="cursor-pointer">
                <Button 
                  className="mt-4" 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('protocol-upload').click();
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose file
                </Button>
              </label>
            </div>
            
            {uploadedFile && (
              <div className="mt-6">
                <div className="flex items-center p-4 bg-blue-50 rounded-md">
                  <FileText className="h-8 w-8 text-blue-500 mr-4" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900">{uploadedFile.name}</h4>
                    <p className="text-sm text-blue-700">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • {uploadedFile.type}
                    </p>
                  </div>
                  <div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setUploadedFile(null);
                        toast({
                          title: "File removed",
                          description: "The uploaded file has been removed.",
                          variant: "default"
                        });
                      }}
                    >
                      Remove
                    </Button>
                    <Button className="ml-2" size="sm" onClick={startAnalysis}>
                      <Microscope className="h-4 w-4 mr-2" />
                      Analyze
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {isAnalyzing && (
              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Analyzing protocol...</span>
                  <span>{analysisProgress}%</span>
                </div>
                <Progress value={analysisProgress} className="h-2" />
                <div className="text-xs text-gray-500 italic">
                  {analysisProgress < 25 ? 'Extracting protocol elements and structure...' : 
                   analysisProgress < 50 ? 'Comparing with similar clinical trials in database...' : 
                   analysisProgress < 75 ? 'Analyzing against regulatory guidance and precedents...' : 
                   'Generating recommendations and insights...'}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-gray-500 flex items-center">
              <ShieldCheck className="h-4 w-4 text-green-500 mr-1" />
              Your documents are analyzed securely and never stored permanently
            </div>
            <Button onClick={startAnalysis} disabled={!uploadedFile || isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Microscope className="mr-2 h-4 w-4" />
                  Analyze Protocol
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Advanced Protocol Design Tools</CardTitle>
            <CardDescription>
              Access AI-powered tools to optimize your protocol design
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-md p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => setActiveTab('blueprint')}>
                <div className="flex items-center mb-3">
                  <Sparkles className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="font-medium">Protocol Blueprint Generator</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Generate a first-draft protocol outline from simple study descriptors like phase, population, and objectives
                </p>
                <Button variant="ghost" size="sm" className="w-full">
                  <ArrowRight className="h-4 w-4 mr-1" />
                  Open Tool
                </Button>
              </div>
              
              <div className="border rounded-md p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => setActiveTab('simulator')}>
                <div className="flex items-center mb-3">
                  <BarChart4 className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="font-medium">Adaptive Design Simulator</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Run simulations on proposed designs to visualize power curves, enrollment timelines, and drop-out impact
                </p>
                <Button variant="ghost" size="sm" className="w-full">
                  <ArrowRight className="h-4 w-4 mr-1" />
                  Open Tool
                </Button>
              </div>
              
              <div className="border rounded-md p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => setActiveTab('endpoints')}>
                <div className="flex items-center mb-3">
                  <ClipboardList className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="font-medium">Intelligent Endpoint Advisor</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Get recommendations for primary & secondary endpoints based on therapeutic area and historical trial data
                </p>
                <Button variant="ghost" size="sm" className="w-full">
                  <ArrowRight className="h-4 w-4 mr-1" />
                  Open Tool
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  // Render the analysis results UI
  const renderResultsUI = () => {
    if (!analysisResults) return null;
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Protocol Analysis Results</CardTitle>
                <CardDescription>
                  Comprehensive analysis of your protocol document against clinical trials database and regulatory guidance
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-blue-100 text-blue-800">
                  {analysisResults.fileSize ? `${(analysisResults.fileSize / 1024 / 1024).toFixed(2)} MB` : 'File size unknown'}
                </Badge>
                <Badge variant="outline">
                  <Clock className="h-3.5 w-3.5 mr-1 text-gray-500" />
                  {new Date(analysisResults.analyzeDate).toLocaleDateString()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeResultTab} onValueChange={setActiveResultTab}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="regulatory">Regulatory Alignment</TabsTrigger>
                <TabsTrigger value="similar">Similar Studies</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-md">
                  <div className="flex items-center mb-3">
                    <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="font-medium">Overall Protocol Assessment</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm font-medium mb-2">Overall Alignment Score</div>
                      <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`absolute top-0 left-0 h-full ${
                            analysisResults.alignmentScores.overall >= 80 ? 'bg-green-500' : 
                            analysisResults.alignmentScores.overall >= 60 ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${analysisResults.alignmentScores.overall}%` }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                          {analysisResults.alignmentScores.overall}% Aligned with Best Practices
                        </div>
                      </div>
                      <p className="text-sm mt-2">
                        This protocol is {analysisResults.alignmentScores.overall >= 80 ? 'well aligned' : 'partially aligned'} with 
                        best practices, similar studies, and regulatory precedents.
                      </p>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium mb-2">Key Areas for Improvement</div>
                      <div className="space-y-1.5">
                        {Object.entries(analysisResults.alignmentScores)
                          .filter(([key]) => key !== 'overall')
                          .sort(([, a], [, b]) => a - b)
                          .slice(0, 3)
                          .map(([key, score]) => (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-sm text-gray-700 capitalize">{key.replace(/_/g, ' ')}</span>
                              <div className="flex items-center">
                                <span className="text-sm mr-2">{score}%</span>
                                <div className="w-20 bg-gray-200 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${
                                      score >= 80 ? 'bg-green-500' : 
                                      score >= 60 ? 'bg-yellow-500' : 
                                      'bg-red-500'
                                    }`}
                                    style={{ width: `${score}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium mt-6">Section Alignment Scores</h3>
                <div className="space-y-3">
                  {Object.entries(analysisResults.alignmentScores)
                    .filter(([key]) => key !== 'overall')
                    .sort(([, a], [, b]) => b - a)
                    .map(([key, score]) => (
                      <div key={key} className="border rounded-md p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                          <Badge 
                            className={
                              score >= 80 ? "bg-green-100 text-green-800" : 
                              score >= 60 ? "bg-yellow-100 text-yellow-800" : 
                              "bg-red-100 text-red-800"
                            }
                          >
                            {score}% Aligned
                          </Badge>
                        </div>
                        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`absolute top-0 left-0 h-full ${
                              score >= 80 ? 'bg-green-500' : 
                              score >= 60 ? 'bg-yellow-500' : 
                              'bg-red-500'
                            }`}
                            style={{ width: `${score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  }
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Protocol Endpoints Assessment</h3>
                  <div className="space-y-4">
                    {analysisResults.endpoints.map((endpoint, index) => (
                      <div key={index} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{endpoint.name}</h4>
                            <p className="text-sm text-gray-700 mt-1">{endpoint.description}</p>
                          </div>
                          <Badge 
                            className={
                              endpoint.acceptanceRating === 'High' ? "bg-green-100 text-green-800" : 
                              endpoint.acceptanceRating === 'Medium' ? "bg-yellow-100 text-yellow-800" : 
                              "bg-red-100 text-red-800"
                            }
                          >
                            {endpoint.acceptanceRating} Acceptance
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          <div className="bg-gray-50 p-2 rounded-md">
                            <span className="text-sm font-medium">Precedent:</span>
                            <span className="text-sm ml-2">{endpoint.precedent}</span>
                          </div>
                          <div className="bg-blue-50 p-2 rounded-md">
                            <span className="text-sm font-medium">Suggestion:</span>
                            <span className="text-sm ml-2">{endpoint.suggestion}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              {/* Regulatory Alignment Tab */}
              <TabsContent value="regulatory" className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="flex items-start">
                    <Scale className="h-5 w-5 text-blue-600 mt-1 mr-2" />
                    <div>
                      <h3 className="font-medium">Regulatory Alignment Analysis</h3>
                      <p className="text-sm text-gray-700 mt-1">
                        This analysis compares your protocol against FDA, EMA, and ICH guidelines 
                        relevant to your therapeutic area and study phase.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {analysisResults.regulatoryFindings.map((finding, index) => (
                    <div 
                      key={index} 
                      className={`border rounded-md p-4 ${
                        finding.severity === 'major' ? 'border-red-200 bg-red-50' : 
                        finding.severity === 'moderate' ? 'border-yellow-200 bg-yellow-50' : 
                        finding.severity === 'minor' ? 'border-blue-200 bg-blue-50' : 
                        'border-green-200 bg-green-50'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="mt-1 mr-3">
                          {finding.severity === 'major' ? (
                            <XCircle className="h-5 w-5 text-red-500" />
                          ) : finding.severity === 'moderate' ? (
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                          ) : finding.severity === 'minor' ? (
                            <Info className="h-5 w-5 text-blue-500" />
                          ) : (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{finding.category}</h4>
                            <Badge 
                              className={
                                finding.severity === 'major' ? "bg-red-100 text-red-800 capitalize" : 
                                finding.severity === 'moderate' ? "bg-yellow-100 text-yellow-800 capitalize" : 
                                finding.severity === 'minor' ? "bg-blue-100 text-blue-800 capitalize" : 
                                "bg-green-100 text-green-800 capitalize"
                              }
                            >
                              {finding.severity}
                            </Badge>
                          </div>
                          <p className="text-sm mt-1">{finding.description}</p>
                          <div className="mt-2 flex items-center">
                            <BookMarked className="h-4 w-4 text-gray-500 mr-1" />
                            <span className="text-xs text-gray-600">{finding.reference}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 border rounded-md">
                  <h3 className="font-medium mb-3">Regulatory Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-red-50 rounded-md">
                      <div className="text-2xl font-bold text-red-600 mb-1">
                        {analysisResults.regulatoryFindings.filter(f => f.severity === 'major').length}
                      </div>
                      <div className="text-sm font-medium">Major Findings</div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-md">
                      <div className="text-2xl font-bold text-yellow-600 mb-1">
                        {analysisResults.regulatoryFindings.filter(f => f.severity === 'moderate').length}
                      </div>
                      <div className="text-sm font-medium">Moderate Findings</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-md">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {analysisResults.regulatoryFindings.filter(f => f.severity === 'minor').length}
                      </div>
                      <div className="text-sm font-medium">Minor Findings</div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Similar Studies Tab */}
              <TabsContent value="similar" className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="flex items-start">
                    <Beaker className="h-5 w-5 text-blue-600 mt-1 mr-2" />
                    <div>
                      <h3 className="font-medium">Similar Studies Analysis</h3>
                      <p className="text-sm text-gray-700 mt-1">
                        Your protocol has been compared to our database of successful clinical trials in the same
                        therapeutic area and phase. Here are the most similar studies to yours.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {analysisResults.similarTrials.map((trial, index) => (
                    <div key={index} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{trial.title}</h4>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <span>{trial.sponsor}</span>
                            <span className="mx-1.5">•</span>
                            <Badge variant="outline">{trial.phase}</Badge>
                            <span className="mx-1.5">•</span>
                            <span>{trial.status}</span>
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          {trial.similarityScore}% Match
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="text-xs text-gray-500 mb-1">Enrollment</div>
                          <div className="text-sm font-medium">{trial.enrollment} subjects</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="text-xs text-gray-500 mb-1">Timeline</div>
                          <div className="text-sm font-medium">
                            {new Date(trial.startDate).toLocaleDateString()} to {' '}
                            {new Date(trial.completionDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="text-xs text-gray-500 mb-1">NCT ID</div>
                          <div className="text-sm font-medium">{trial.nctId}</div>
                        </div>
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        <div className="bg-blue-50 p-3 rounded-md">
                          <div className="text-xs text-gray-600 mb-1">Primary Endpoint</div>
                          <div className="text-sm">{trial.primaryEndpoint}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="text-xs text-gray-600 mb-1">Design Notes</div>
                          <div className="text-sm">{trial.designNotes}</div>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex justify-end">
                        <Button variant="ghost" size="sm">
                          View Full Trial Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              {/* Recommendations Tab */}
              <TabsContent value="recommendations" className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="flex items-start">
                    <Sparkles className="h-5 w-5 text-blue-600 mt-1 mr-2" />
                    <div>
                      <h3 className="font-medium">AI-Generated Recommendations</h3>
                      <p className="text-sm text-gray-700 mt-1">
                        Based on our analysis, here are specific recommendations to improve your protocol's 
                        regulatory alignment, scientific rigor, and operational feasibility.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {analysisResults.recommendations.map((rec, index) => (
                    <div key={index} className="border rounded-md p-4">
                      <div className="flex items-start">
                        <div className="mt-1 mr-3">
                          {rec.priority === 'high' ? (
                            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                              <span className="text-red-600 text-xs font-bold">1</span>
                            </div>
                          ) : rec.priority === 'medium' ? (
                            <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                              <span className="text-yellow-600 text-xs font-bold">2</span>
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 text-xs font-bold">3</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{rec.category}</h4>
                            <Badge 
                              className={
                                rec.priority === 'high' ? "bg-red-100 text-red-800 capitalize" : 
                                rec.priority === 'medium' ? "bg-yellow-100 text-yellow-800 capitalize" : 
                                "bg-blue-100 text-blue-800 capitalize"
                              }
                            >
                              {rec.priority} Priority
                            </Badge>
                          </div>
                          
                          <div className="mt-3 space-y-2">
                            <div className="bg-gray-50 p-2 rounded-md">
                              <span className="text-sm font-medium">Issue:</span>
                              <span className="text-sm ml-2">{rec.issue}</span>
                            </div>
                            <div className="bg-green-50 p-2 rounded-md">
                              <span className="text-sm font-medium">Recommendation:</span>
                              <span className="text-sm ml-2">{rec.recommendation}</span>
                            </div>
                            <div className="bg-blue-50 p-2 rounded-md">
                              <span className="text-sm font-medium">Impact:</span>
                              <span className="text-sm ml-2">{rec.impact}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Recommendations
                  </Button>
                  <Button>
                    <Check className="h-4 w-4 mr-2" />
                    Apply Selected Recommendations
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={resetAnalysis}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Analyze New Protocol
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download Full Report
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };
  
  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Protocol Review & Optimization</h1>
        <p className="text-gray-600">
          AI-powered analysis and optimization tools for clinical study protocols
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload & Analyze
          </TabsTrigger>
          <TabsTrigger value="results" disabled={!analysisComplete}>
            <FileText className="h-4 w-4 mr-2" />
            Analysis Results
          </TabsTrigger>
          <TabsTrigger value="blueprint">
            <Sparkles className="h-4 w-4 mr-2" />
            Blueprint Generator
          </TabsTrigger>
          <TabsTrigger value="simulator">
            <BarChart4 className="h-4 w-4 mr-2" />
            Design Simulator
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          {renderUploadUI()}
        </TabsContent>
        
        <TabsContent value="results">
          {renderResultsUI()}
        </TabsContent>
        
        <TabsContent value="blueprint">
          <ProtocolBlueprintGenerator />
        </TabsContent>
        
        <TabsContent value="simulator">
          <div className="space-y-8">
            <Tabs defaultValue="adaptive" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="adaptive">
                  <Beaker className="h-4 w-4 mr-2" />
                  Adaptive Design
                </TabsTrigger>
                <TabsTrigger value="statistical">
                  <BarChart4 className="h-4 w-4 mr-2" />
                  Statistical Power
                </TabsTrigger>
                <TabsTrigger value="advanced">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Advanced Analysis
                </TabsTrigger>
              </TabsList>
              <TabsContent value="adaptive">
                <AdaptiveDesignSimulator />
              </TabsContent>
              <TabsContent value="statistical">
                <div className="mt-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart4 className="h-5 w-5 text-blue-600" />
                        Monte Carlo Simulation & Power Analysis
                      </CardTitle>
                      <CardDescription>
                        Design your clinical trial with comprehensive statistical power analysis and Monte Carlo simulations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <StatisticalDesign />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="advanced">
                <div className="mt-2">
                  <Card>
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        Advanced Multi-dimensional Analysis
                      </CardTitle>
                      <CardDescription>
                        Optimize your trial design with sophisticated simulations across multiple dimensions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <AdvancedSimulationTools 
                        results={{
                          recommendedN: 250,
                          withDropout: 290,
                          simulationResults: {
                            probabilityOfSuccess: 0.85,
                            meanDifference: 0.45,
                            confidenceInterval: [0.32, 0.58],
                            requiredSampleSize: 250
                          },
                          powerCurve: Array.from({length: 10}, (_, i) => ({
                            sampleSize: 100 + i * 50,
                            power: Math.min(0.99, 0.3 + (i * 0.1))
                          }))
                        }}
                        parameters={{
                          testType: 'superiority',
                          alpha: 0.05,
                          effectSize: 0.45,
                          stdDev: 1.0,
                          margin: 0.2
                        }}
                        simulationSettings={{
                          nSimulations: 5000,
                          endpointType: 'continuous',
                          designType: 'parallel',
                          dropoutRate: 0.15
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            <Card>
              <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookMarked className="h-5 w-5 text-orange-600" />
                  Regulatory Documentation Generation
                </CardTitle>
                <CardDescription>
                  Generate regulatory-ready statistical analysis plan sections based on your design choices
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium">Statistical Analysis Plan</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Generate a comprehensive statistical analysis plan section with methods, models, and handling of missing data.
                      </p>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">ICH E9 Compliant</Badge>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-5 w-5 text-green-600" />
                        <h3 className="font-medium">Sample Size Justification</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Generate a detailed sample size justification with power calculations, assumptions, and sensitivity analyses.
                      </p>
                      <Badge variant="outline" className="bg-green-50 text-green-700">FDA/EMA Ready</Badge>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-5 w-5 text-purple-600" />
                        <h3 className="font-medium">Interim Analysis Plan</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Generate a detailed interim analysis plan with alpha spending function, stopping boundaries, and operational procedures.
                      </p>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">DMC/DSMB Ready</Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <Button className="bg-orange-600 hover:bg-orange-700">
                      <Download className="h-4 w-4 mr-2" />
                      Generate Documentation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="endpoints">
          <div className="space-y-6">
            <IntelligentEndpointAdvisor />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProtocolReview;