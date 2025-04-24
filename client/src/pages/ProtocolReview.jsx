import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useToast } from '../hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { 
  FileText, 
  UploadCloud, 
  Check, 
  AlertCircle, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Lightbulb,
  Brain,
  BookOpen,
  Beaker,
  FileCheck,
  ListChecks,
  Heart,
  Clock,
  Users,
  Award,
  Settings,
  HelpCircle,
  Upload,
  Download,
  GraduationCap,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Wrap the component with auth guard for security
import withAuthGuard from '../utils/withAuthGuard';

// Analysis recommendation component
const RecommendationCard = ({ title, category, confidence, description, examples, references }) => {
  const [expanded, setExpanded] = useState(false);
  
  const getConfidenceColor = () => {
    if (confidence >= 90) return "bg-green-100 text-green-800";
    if (confidence >= 70) return "bg-blue-100 text-blue-800";
    return "bg-yellow-100 text-yellow-800";
  };
  
  const getCategoryIcon = () => {
    switch (category) {
      case 'Design':
        return <Settings className="h-4 w-4 mr-1.5" />;
      case 'Endpoints':
        return <TrendingUp className="h-4 w-4 mr-1.5" />;
      case 'Statistical':
        return <BarChart className="h-4 w-4 mr-1.5" />;
      case 'Safety':
        return <Heart className="h-4 w-4 mr-1.5" />;
      case 'Eligibility':
        return <Users className="h-4 w-4 mr-1.5" />;
      case 'Regulatory':
        return <FileCheck className="h-4 w-4 mr-1.5" />;
      case 'Precedent':
        return <BookOpen className="h-4 w-4 mr-1.5" />;
      case 'Academic':
        return <GraduationCap className="h-4 w-4 mr-1.5" />;
      default:
        return <Lightbulb className="h-4 w-4 mr-1.5" />;
    }
  };
  
  return (
    <Card className="mb-4 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
      <CardHeader className="py-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center">
              <div className="flex items-center">
                {getCategoryIcon()}
                <Badge variant="outline" className="mr-2">
                  {category}
                </Badge>
              </div>
              <Badge className={getConfidenceColor()}>
                {confidence}% Confidence
              </Badge>
            </div>
            <CardTitle className="text-lg mt-1.5">{title}</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
            className="text-xs"
          >
            {expanded ? "Show Less" : "Show More"}
            {expanded ? 
              <ChevronUp className="h-4 w-4 ml-1" /> : 
              <ChevronDown className="h-4 w-4 ml-1" />
            }
          </Button>
        </div>
      </CardHeader>
      <CardContent className="py-0">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {description}
        </p>
        
        {expanded && (
          <div className="mt-4 space-y-3">
            {examples.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-1">Examples from successful protocols:</h4>
                <ul className="text-sm space-y-1 pl-5 list-disc">
                  {examples.map((example, i) => (
                    <li key={i} className="text-gray-700 dark:text-gray-300">{example}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {references.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-1">References:</h4>
                <ul className="text-sm space-y-1 pl-5 list-disc">
                  {references.map((ref, i) => (
                    <li key={i} className="text-gray-700 dark:text-gray-300">{ref}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="py-3 flex justify-end space-x-2">
        <Button size="sm" variant="outline" className="text-xs">
          <Download className="h-3.5 w-3.5 mr-1" />
          Save
        </Button>
        <Button size="sm" className="text-xs">
          <Check className="h-3.5 w-3.5 mr-1" />
          Apply
        </Button>
      </CardFooter>
    </Card>
  );
};

// Similar studies component
const SimilarStudyCard = ({ title, sponsor, phase, therapeutic, participants, success, insights }) => {
  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Badge variant="outline">Phase {phase}</Badge>
              <Badge variant="outline">{therapeutic}</Badge>
              {success ? (
                <Badge className="bg-green-100 text-green-800">Successful</Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800">Challenges</Badge>
              )}
            </div>
            <CardTitle className="text-md">{title}</CardTitle>
            <CardDescription>{sponsor}</CardDescription>
          </div>
          <div className="text-sm text-gray-500">
            <Users className="h-4 w-4 inline mr-1" />
            {participants} participants
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm">
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            <strong>Key Insights:</strong>
          </p>
          <ul className="pl-5 list-disc space-y-1">
            {insights.map((insight, i) => (
              <li key={i} className="text-gray-700 dark:text-gray-300">{insight}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-end">
        <Button variant="outline" size="sm" className="text-xs">
          <FileText className="h-3.5 w-3.5 mr-1" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

// Regulatory insight component
const RegulatoryInsightCard = ({ authority, title, relevance, summary, recommendations }) => {
  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center">
              <Badge variant="outline" className="mr-2">{authority}</Badge>
              <Badge className={relevance >= 8 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}>
                {relevance}/10 Relevance
              </Badge>
            </div>
            <CardTitle className="text-md mt-1">{title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
          {summary}
        </p>
        <div className="text-sm">
          <p className="font-medium mb-1">Recommendations:</p>
          <ul className="pl-5 list-disc space-y-1">
            {recommendations.map((rec, i) => (
              <li key={i} className="text-gray-700 dark:text-gray-300">{rec}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-end">
        <Button variant="outline" size="sm" className="text-xs">
          <ExternalLink className="h-3.5 w-3.5 mr-1" />
          View Source
        </Button>
      </CardFooter>
    </Card>
  );
};

// Protocol element component 
const ProtocolElement = ({ title, content, suggestions, score }) => {
  return (
    <Accordion type="single" collapsible className="mb-2">
      <AccordionItem value="item-1" className="border rounded-md">
        <AccordionTrigger className="px-4 py-2 hover:no-underline">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <span className="font-medium">{title}</span>
            </div>
            <div className="flex items-center">
              <span className={`px-2 py-0.5 rounded-full text-xs mr-4 ${
                score >= 85 ? "bg-green-100 text-green-800" :
                score >= 70 ? "bg-blue-100 text-blue-800" : 
                "bg-yellow-100 text-yellow-800"
              }`}>
                {score}% Alignment
              </span>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-3 pt-1">
          <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            <p><strong>Current Content:</strong></p>
            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md mt-1">
              {content}
            </div>
          </div>
          
          {suggestions.length > 0 && (
            <div className="text-sm">
              <p><strong>Suggestions:</strong></p>
              <ul className="pl-5 list-disc space-y-1 mt-1">
                {suggestions.map((suggestion, i) => (
                  <li key={i} className="text-gray-700 dark:text-gray-300">{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

// Main Protocol Review Component
const ProtocolReview = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [fileName, setFileName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Simulated analysis data
  const mockAnalysisResults = {
    overallScore: 78,
    sections: {
      studyDesign: 84,
      endpoints: 72,
      eligibilityCriteria: 80,
      statisticalConsiderations: 76,
      safetyMonitoring: 82,
    },
    elements: [
      {
        title: "Primary Endpoint",
        content: "Change from baseline in HbA1c at Week 26.",
        suggestions: [
          "Consider including additional time points (Week 12, Week 52) to better assess the durability of effect.",
          "Recent successful Phase III studies in this therapeutic area have used a continuous variable with MMRM analysis."
        ],
        score: 72
      },
      {
        title: "Inclusion Criteria",
        content: "Adults aged 18-75 with T2DM and HbA1c 7.0-10.0%.",
        suggestions: [
          "Consider expanding the upper age limit to 80 years, as recent successful studies have included older populations.",
          "The HbA1c range is appropriate and aligns with regulatory expectations."
        ],
        score: 85
      },
      {
        title: "Sample Size Calculation",
        content: "120 subjects per arm to provide 90% power to detect a 0.5% difference in HbA1c.",
        suggestions: [
          "Recent trials with similar endpoints have required larger sample sizes (150-180 per arm) due to higher than expected variability.",
          "Consider increasing sample size by 10-15% to account for regional regulatory requirements that may require subgroup analyses."
        ],
        score: 68
      },
      {
        title: "Safety Monitoring",
        content: "Adverse events, laboratory assessments, and physical examinations at each visit.",
        suggestions: [],
        score: 92
      }
    ],
    recommendations: [
      {
        title: "Consider Adaptive Design Elements",
        category: "Design",
        confidence: 85,
        description: "Based on similar successful studies, incorporating an interim analysis with sample size re-estimation could improve the probability of success while managing resources efficiently.",
        examples: [
          "The ADVANCE-1 study implemented sample size re-estimation after 40% enrollment, which allowed for protocol adjustments that improved ultimate study success.",
          "The DELIVER trial used an adaptive approach that saved approximately 8 months of study time."
        ],
        references: [
          "FDA Guidance on Adaptive Designs for Clinical Trials of Drugs and Biologics (2019)",
          "Chen et al. (2023). Adaptive designs in late-phase diabetes clinical trials: A systematic review."
        ]
      },
      {
        title: "Enhance Endpoint Selection",
        category: "Endpoints",
        confidence: 92,
        description: "Consider adding time-in-range as a secondary endpoint using continuous glucose monitoring data, which aligns with recent regulatory interest and successful submissions.",
        examples: [
          "The SURPASS-4 study included time-in-range as a key secondary endpoint, which provided valuable supportive data for regulatory review.",
          "Studies that included both HbA1c and time-in-range had a 28% higher success rate in recent submissions."
        ],
        references: [
          "FDA CDER/CBER joint guidance on CGM endpoints (2023)",
          "International Consensus on Time in Range (2022)",
          "EMA reflection paper on glucose metrics beyond HbA1c in diabetes clinical trials"
        ]
      },
      {
        title: "Update Statistical Analysis Approach",
        category: "Statistical",
        confidence: 78,
        description: "Recent successful protocols in this therapeutic area have adopted more sophisticated missing data handling approaches. Consider implementing multiple imputation methods rather than LOCF.",
        examples: [
          "The AWARD series of trials successfully implemented reference-based multiple imputation techniques.",
          "The PIONEER trials utilized tipping-point sensitivity analyses to strengthen conclusions."
        ],
        references: [
          "FDA guidance on missing data in clinical trials (2022 update)",
          "National Academy of Sciences report on missing data handling best practices"
        ]
      }
    ],
    similarStudies: [
      {
        title: "Phase III Study of Novel GLP-1/GIP Dual Agonist in T2DM",
        sponsor: "PharmaLeader Inc.",
        phase: "III",
        therapeutic: "Diabetes",
        participants: 1402,
        success: true,
        insights: [
          "Stratification by baseline HbA1c (<8.5%, ≥8.5%) improved analysis power",
          "Extended follow-up period (52 weeks) was critical for safety database",
          "Inclusion of CGM substudy provided supportive data valued by regulators"
        ]
      },
      {
        title: "SGLT2 Inhibitor Renal Outcomes Study",
        sponsor: "Global Therapeutics",
        phase: "III",
        therapeutic: "Diabetes",
        participants: 4736,
        success: true,
        insights: [
          "Event-driven design with composite endpoint improved efficiency",
          "Independent adjudication committee for outcomes strengthened results",
          "Enrichment strategy targeting high-risk patients reduced required sample size"
        ]
      },
      {
        title: "Novel DPP-4 Combination Therapy Trial",
        sponsor: "InnoMed Pharmaceuticals",
        phase: "II",
        therapeutic: "Diabetes",
        participants: 342,
        success: false,
        insights: [
          "Insufficient study duration (16 weeks) failed to demonstrate durability",
          "Eligibility criteria were too restrictive, leading to slow enrollment",
          "Placebo response was higher than expected, reducing treatment difference"
        ]
      }
    ],
    regulatoryInsights: [
      {
        authority: "FDA",
        title: "Recent FDA Feedback on Glycemic Endpoints",
        relevance: 9,
        summary: "Recent FDA communications indicate increased scrutiny on the clinical meaningfulness of HbA1c reductions smaller than 0.5%. Protocols should clearly justify endpoint selection and include additional measures of glycemic control.",
        recommendations: [
          "Include CGM-based metrics as secondary endpoints",
          "Add responder analyses (e.g., % achieving HbA1c <7.0%)",
          "Consider patient-reported outcomes related to glycemic control"
        ]
      },
      {
        authority: "EMA",
        title: "EMA Position on Cardiovascular Outcome Requirements",
        relevance: 7,
        summary: "The EMA has recently emphasized the need for adequate CV safety data even for non-CV focused diabetes medications. This may impact the overall development program requirements.",
        recommendations: [
          "Ensure meta-analysis of CV events is pre-specified in the protocol",
          "Consider including additional CV biomarkers",
          "Address long-term CV monitoring in the development plan"
        ]
      }
    ]
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!fileName) {
      toast({
        title: "No file selected",
        description: "Please select a protocol file to upload.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 150);
    
    // Simulate upload completion
    setTimeout(() => {
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setActiveTab('analyze');
        
        toast({
          title: "Upload Complete",
          description: "Your protocol has been uploaded successfully.",
          variant: "default"
        });
      }, 500);
    }, 3000);
  };

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate analysis process
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      setAnalysisResults(mockAnalysisResults);
      setActiveTab('results');
      
      toast({
        title: "Analysis Complete",
        description: "Your protocol has been analyzed successfully.",
        variant: "default"
      });
    }, 5000);
  };

  const handleGenerateReport = () => {
    toast({
      title: "Generating Report",
      description: "Your comprehensive report is being generated and will be available for download shortly.",
      variant: "default"
    });
    
    // Simulate report generation
    setTimeout(() => {
      toast({
        title: "Report Ready",
        description: "Your report has been generated and is ready to download.",
        variant: "default"
      });
    }, 3000);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Protocol Review & Intelligence</h1>
          <p className="text-gray-600 mt-2">
            Upload and analyze your clinical protocol drafts against our library of past studies, 
            academic best practices, and current regulatory guidelines.
          </p>
        </div>
        
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload" disabled={isUploading}>Upload Protocol</TabsTrigger>
              <TabsTrigger value="analyze" disabled={!fileName || isUploading || isAnalyzing}>Analyze Protocol</TabsTrigger>
              <TabsTrigger value="results" disabled={!analysisComplete}>Review Results</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Your Protocol</CardTitle>
                  <CardDescription>
                    Upload your draft protocol for comprehensive analysis and intelligent recommendations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpload}>
                    <div className="grid w-full gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="protocol-type">Protocol Type</Label>
                        <Select defaultValue="phase2">
                          <SelectTrigger>
                            <SelectValue placeholder="Select protocol type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="phase1">Phase I Protocol</SelectItem>
                            <SelectItem value="phase2">Phase II Protocol</SelectItem>
                            <SelectItem value="phase3">Phase III Protocol</SelectItem>
                            <SelectItem value="phase4">Phase IV Protocol</SelectItem>
                            <SelectItem value="iss">Investigator Sponsored Study</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="therapeutic-area">Therapeutic Area</Label>
                        <Select defaultValue="diabetes">
                          <SelectTrigger>
                            <SelectValue placeholder="Select therapeutic area" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="oncology">Oncology</SelectItem>
                            <SelectItem value="neurology">Neurology</SelectItem>
                            <SelectItem value="cardiology">Cardiology</SelectItem>
                            <SelectItem value="immunology">Immunology</SelectItem>
                            <SelectItem value="infectious">Infectious Disease</SelectItem>
                            <SelectItem value="respiratory">Respiratory</SelectItem>
                            <SelectItem value="diabetes">Diabetes/Metabolic</SelectItem>
                            <SelectItem value="dermatology">Dermatology</SelectItem>
                            <SelectItem value="psychiatry">Psychiatry</SelectItem>
                            <SelectItem value="rare">Rare Disease</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="drug-type">Drug/Treatment Type</Label>
                        <Select defaultValue="small-molecule">
                          <SelectTrigger>
                            <SelectValue placeholder="Select drug type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small-molecule">Small Molecule</SelectItem>
                            <SelectItem value="biologic">Biologic</SelectItem>
                            <SelectItem value="peptide">Peptide</SelectItem>
                            <SelectItem value="gene-therapy">Gene Therapy</SelectItem>
                            <SelectItem value="cell-therapy">Cell Therapy</SelectItem>
                            <SelectItem value="vaccine">Vaccine</SelectItem>
                            <SelectItem value="device">Medical Device</SelectItem>
                            <SelectItem value="combo">Combination Product</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="protocol-file">Protocol Document</Label>
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center justify-center w-full">
                            <label htmlFor="protocol-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                  <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Word or PDF document (Max 25MB)
                                </p>
                                {fileName && (
                                  <p className="mt-2 text-sm text-blue-600">
                                    Selected: {fileName}
                                  </p>
                                )}
                              </div>
                              <input 
                                id="protocol-file" 
                                type="file" 
                                className="hidden" 
                                accept=".doc,.docx,.pdf"
                                onChange={handleFileChange}
                                disabled={isUploading}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      {isUploading && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Uploading...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <Progress value={uploadProgress} className="h-2" />
                        </div>
                      )}
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={handleUpload} disabled={!fileName || isUploading}>
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Protocol
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="analyze" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analyze Protocol</CardTitle>
                  <CardDescription>
                    Customize analysis parameters to get the most relevant recommendations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Protocol File</Label>
                      <div className="flex items-center p-2 border rounded-md bg-gray-50">
                        <FileText className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="text-sm">{fileName}</span>
                        <Button variant="ghost" size="sm" className="ml-auto">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Analysis Scope</Label>
                      <Select defaultValue="comprehensive">
                        <SelectTrigger>
                          <SelectValue placeholder="Select analysis scope" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                          <SelectItem value="regulatory">Regulatory Focus</SelectItem>
                          <SelectItem value="scientific">Scientific & Statistical Focus</SelectItem>
                          <SelectItem value="operational">Operational Feasibility Focus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Reference Timeframe</Label>
                      <Select defaultValue="5years">
                        <SelectTrigger>
                          <SelectValue placeholder="Select reference timeframe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2years">Last 2 Years</SelectItem>
                          <SelectItem value="5years">Last 5 Years</SelectItem>
                          <SelectItem value="10years">Last 10 Years</SelectItem>
                          <SelectItem value="all">All Available Data</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Regulatory Regions</Label>
                      <Select defaultValue="us-eu">
                        <SelectTrigger>
                          <SelectValue placeholder="Select regulatory regions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="us">US (FDA)</SelectItem>
                          <SelectItem value="eu">Europe (EMA)</SelectItem>
                          <SelectItem value="us-eu">US & Europe</SelectItem>
                          <SelectItem value="global">Global (FDA, EMA, PMDA, NMPA)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="md:col-span-2 space-y-2">
                      <Label>Analysis Focus Areas</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="focus-design" className="rounded" defaultChecked />
                          <label htmlFor="focus-design" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Study Design</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="focus-endpoints" className="rounded" defaultChecked />
                          <label htmlFor="focus-endpoints" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Endpoints</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="focus-eligibility" className="rounded" defaultChecked />
                          <label htmlFor="focus-eligibility" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Eligibility Criteria</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="focus-statistics" className="rounded" defaultChecked />
                          <label htmlFor="focus-statistics" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Statistical Considerations</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="focus-safety" className="rounded" defaultChecked />
                          <label htmlFor="focus-safety" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Safety Monitoring</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="focus-operational" className="rounded" defaultChecked />
                          <label htmlFor="focus-operational" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Operational Feasibility</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="focus-regulatory" className="rounded" defaultChecked />
                          <label htmlFor="focus-regulatory" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Regulatory Compliance</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="focus-precedent" className="rounded" defaultChecked />
                          <label htmlFor="focus-precedent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Historical Precedent</label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="additional-notes">Additional Notes or Specific Questions</Label>
                      <Textarea 
                        id="additional-notes" 
                        placeholder="Enter any specific areas of concern or questions you'd like addressed in the analysis..."
                        className="resize-none"
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab('upload')}>Back</Button>
                  <Button 
                    onClick={handleStartAnalysis}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Start Analysis
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="results" className="mt-6">
              {analysisResults && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-xl">Protocol Analysis Results</CardTitle>
                          <CardDescription>
                            Protocol: {fileName}
                          </CardDescription>
                        </div>
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center rounded-full h-16 w-16 bg-blue-50 border-4 border-blue-100">
                            <span className="text-xl font-bold text-blue-700">{analysisResults.overallScore}</span>
                          </div>
                          <div className="text-sm font-medium mt-1">Overall Score</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>Study Design</Label>
                            <span className="text-sm font-medium">{analysisResults.sections.studyDesign}%</span>
                          </div>
                          <Progress value={analysisResults.sections.studyDesign} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>Endpoints</Label>
                            <span className="text-sm font-medium">{analysisResults.sections.endpoints}%</span>
                          </div>
                          <Progress value={analysisResults.sections.endpoints} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>Eligibility Criteria</Label>
                            <span className="text-sm font-medium">{analysisResults.sections.eligibilityCriteria}%</span>
                          </div>
                          <Progress value={analysisResults.sections.eligibilityCriteria} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>Statistical Considerations</Label>
                            <span className="text-sm font-medium">{analysisResults.sections.statisticalConsiderations}%</span>
                          </div>
                          <Progress value={analysisResults.sections.statisticalConsiderations} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>Safety Monitoring</Label>
                            <span className="text-sm font-medium">{analysisResults.sections.safetyMonitoring}%</span>
                          </div>
                          <Progress value={analysisResults.sections.safetyMonitoring} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={handleGenerateReport}>
                          <Download className="h-4 w-4 mr-1" />
                          Download Full Report
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-1" />
                          Share Results
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setLocation('/study-planner')}
                        >
                          <FilePlus className="h-4 w-4 mr-1" />
                          Create Study Plan
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Tabs defaultValue="recommendations">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="recommendations">Key Recommendations</TabsTrigger>
                      <TabsTrigger value="elements">Protocol Elements</TabsTrigger>
                      <TabsTrigger value="similar">Similar Studies</TabsTrigger>
                      <TabsTrigger value="regulatory">Regulatory Insights</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="recommendations" className="mt-4 space-y-4">
                      {analysisResults.recommendations.map((rec, i) => (
                        <RecommendationCard key={i} {...rec} />
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="elements" className="mt-4 space-y-4">
                      <div className="mb-4">
                        <div className="flex items-center">
                          <Search className="h-4 w-4 mr-2 text-gray-400" />
                          <Input 
                            placeholder="Search protocol elements..." 
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      {analysisResults.elements.map((element, i) => (
                        <ProtocolElement key={i} {...element} />
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="similar" className="mt-4 space-y-4">
                      <div className="mb-4">
                        <div className="p-3 bg-blue-50 text-blue-800 rounded-md">
                          <div className="flex items-start">
                            <InfoCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Similar Studies Analysis</p>
                              <p className="text-sm mt-1">
                                The following studies were identified as similar to your protocol based on therapeutic area,
                                phase, intervention type, and study design. Learn from their successes and challenges.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {analysisResults.similarStudies.map((study, i) => (
                        <SimilarStudyCard key={i} {...study} />
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="regulatory" className="mt-4 space-y-4">
                      <div className="mb-4">
                        <div className="p-3 bg-yellow-50 text-yellow-800 rounded-md">
                          <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Regulatory Landscape</p>
                              <p className="text-sm mt-1">
                                These insights are derived from recent regulatory guidance, precedent approvals,
                                and feedback from health authorities that may impact your protocol design.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {analysisResults.regulatoryInsights.map((insight, i) => (
                        <RegulatoryInsightCard key={i} {...insight} />
                      ))}
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default withAuthGuard(ProtocolReview);