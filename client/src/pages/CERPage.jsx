import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  ChevronLeft, Share, FileText, BarChart4, Download, RefreshCw, Database,
  Search, BookOpen, Check, AlertTriangle, Zap, LayoutDashboard, Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import ComplianceScorePanel from '../components/cer/ComplianceScorePanel';
import ComplianceRadarChart from '../components/cer/ComplianceRadarChart';
import FaersSafetySignalAnalysis from '../components/cer/FaersSafetySignalAnalysis';
import LiteratureSearchPanel from '../components/cer/LiteratureSearchPanel';

export default function CERPage() {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [complianceScores, setComplianceScores] = useState(null);
  const { toast } = useToast();
  
  // Sample state for the FDA FAERS integration
  const [faersData, setFaersData] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [reportSections, setReportSections] = useState({
    deviceDescription: { status: 'not-started', progress: 0 },
    clinicalData: { status: 'not-started', progress: 0 },
    riskAnalysis: { status: 'not-started', progress: 0 },
    literatureReview: { status: 'not-started', progress: 0 },
    postMarketData: { status: 'not-started', progress: 0 },
    benefitRiskProfile: { status: 'not-started', progress: 0 },
    conclusion: { status: 'not-started', progress: 0 }
  });
  
  // Literature review state
  const [literatureData, setLiteratureData] = useState(null);
  
  // Compliance threshold settings
  const complianceThresholds = {
    OVERALL_THRESHOLD: 0.80, // 80% threshold for passing
    FLAG_THRESHOLD: 0.70     // 70% threshold for warnings/flagging
  };
  
  // Handle compliance scores generation
  const handleComplianceScoresGenerated = (scores) => {
    setComplianceScores(scores);
    toast({
      title: "Compliance analysis complete",
      description: `Overall score: ${scores.overallScore}%. ${scores.overallScore >= 70 ? 'Report meets minimum requirements.' : 'Critical issues detected.'}`
    });
    
    // Update the report sections statuses based on compliance scores
    const updatedSections = { ...reportSections };
    Object.keys(updatedSections).forEach(key => {
      // Random section progress for demo, in real app would be tied to compliance scores
      const progress = Math.floor(Math.random() * 100);
      updatedSections[key] = {
        status: progress === 0 ? 'not-started' : progress < 100 ? 'in-progress' : 'complete',
        progress
      };
    });
    setReportSections(updatedSections);
  };
  
  // Generate PDF report
  const generatePdfReport = () => {
    setIsGeneratingPdf(true);
    toast({
      title: "Generating PDF report",
      description: "Your report is being prepared. This may take a few moments."
    });
    
    // Simulating PDF generation delay
    setTimeout(() => {
      setIsGeneratingPdf(false);
      toast({
        title: "PDF Report Ready",
        description: "Your Clinical Evaluation Report has been generated successfully.",
        variant: "success"
      });
    }, 3000);
  };
  
  // Query FDA FAERS data
  const queryFaersData = () => {
    toast({
      title: "Querying FDA FAERS Database",
      description: "Searching for adverse events related to CardioStent XR..."
    });
    
    // Simulate API call to FDA FAERS
    setTimeout(() => {
      // Mock FAERS data
      const mockData = {
        productName: "CardioStent XR",
        totalReports: 42,
        severeEvents: 8,
        moderateEvents: 17,
        mildEvents: 17,
        mostCommonEvents: [
          { name: "Local inflammation", count: 12 },
          { name: "Minor bleeding", count: 10 },
          { name: "Mild discomfort", count: 8 }
        ]
      };
      
      setFaersData(mockData);
      toast({
        title: "FAERS Data Retrieved",
        description: `Found ${mockData.totalReports} adverse event reports for CardioStent XR.`,
        variant: "success"
      });
      
      // Update post market data section progress
      const updatedSections = { ...reportSections };
      updatedSections.postMarketData = { status: 'in-progress', progress: 65 };
      setReportSections(updatedSections);
    }, 2000);
  };
  
  // Helper function to get status text/color
  const getStatusDisplay = (status) => {
    switch(status) {
      case 'complete':
        return { text: 'Complete', color: 'text-green-600' };
      case 'in-progress':
        return { text: 'In Progress', color: 'text-amber-600' };
      case 'not-started':
      default:
        return { text: 'Not Started', color: 'text-gray-500' };
    }
  };
  
  // Auto-initialize the report on first render
  useEffect(() => {
    toast({
      title: "CER Auto-Initialization",
      description: "AI is analyzing device information and initializing your report..."
    });
    
    // Simulate AI initialization
    setTimeout(() => {
      toast({
        title: "CER Initialized",
        description: "Device information detected: CardioStent XR (Class III). Report structure created.",
        variant: "success"
      });
      
      // Update device description section progress
      const updatedSections = { ...reportSections };
      updatedSections.deviceDescription = { status: 'in-progress', progress: 40 };
      setReportSections(updatedSections);
    }, 2500);
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header - exactly matching screenshot */}
      <header className="bg-blue-900 text-white py-4">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <button 
                className="text-white flex items-center" 
                onClick={() => setLocation('/client-portal')}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="text-sm">Back</span>
              </button>
              
              <div className="grid grid-cols-4 gap-8">
                <div>
                  <div className="text-xs text-gray-300">Device Name</div>
                  <div className="text-sm font-medium">CardioStent XR</div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-300">Manufacturer</div>
                  <div className="text-sm font-medium">MedDevice Technologies Inc.</div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-300">Product Code</div>
                  <div className="text-sm font-medium">MDT-CS-221</div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-300">Report Status</div>
                  <div className="flex items-center">
                    <Badge className="bg-amber-500 text-xs font-normal hover:bg-amber-600 rounded">In Progress</Badge>
                    <Badge className="ml-2 bg-white text-blue-800 text-xs font-normal hover:bg-gray-100 rounded">v1.0</Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-blue-800 text-xs h-7 rounded">
                Save
              </Button>
              
              <Button variant="ghost" size="sm" className="text-white hover:bg-blue-800 text-xs h-7 rounded">
                <Share className="h-3.5 w-3.5 mr-1" />
                Share
              </Button>
              
              <div className="border-l border-blue-700 h-5 mx-2"></div>
              
              <span className="text-xs mr-1">FDA Submission Ready</span>
              <div className="h-3 w-3 rounded-full bg-amber-500"></div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation Tabs */}
      <div className="border-b bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="tabs-header-container">
            <TabsList className="bg-transparent h-10 justify-start border-b-0 p-0">
              <TabsTrigger 
                value="overview" 
                className={`px-4 py-3 text-sm font-medium rounded-none data-[state=active]:border-b-2 data-[state=active]:shadow-none data-[state=active]:bg-white data-[state=active]:border-blue-600 data-[state=active]:text-blue-600`}
              >
                <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="builder" 
                className={`px-4 py-3 text-sm font-medium rounded-none data-[state=active]:border-b-2 data-[state=active]:shadow-none data-[state=active]:bg-white data-[state=active]:border-blue-600 data-[state=active]:text-blue-600`}
              >
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                Report Builder
              </TabsTrigger>
              <TabsTrigger 
                value="literature" 
                className={`px-4 py-3 text-sm font-medium rounded-none data-[state=active]:border-b-2 data-[state=active]:shadow-none data-[state=active]:bg-white data-[state=active]:border-blue-600 data-[state=active]:text-blue-600`}
              >
                <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                Literature AI
              </TabsTrigger>
              <TabsTrigger 
                value="faers" 
                className={`px-4 py-3 text-sm font-medium rounded-none data-[state=active]:border-b-2 data-[state=active]:shadow-none data-[state=active]:bg-white data-[state=active]:border-blue-600 data-[state=active]:text-blue-600`}
              >
                <Database className="h-3.5 w-3.5 mr-1.5" />
                FAERS Analysis
                {faersData && (
                  <Badge className="ml-2 bg-amber-100 text-amber-800 text-xs">
                    {faersData.totalReports}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="compliance" 
                className={`px-4 py-3 text-sm font-medium rounded-none data-[state=active]:border-b-2 data-[state=active]:shadow-none data-[state=active]:bg-white data-[state=active]:border-blue-600 data-[state=active]:text-blue-600`}
              >
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Compliance
                {complianceScores && (
                  <Badge 
                    className={`ml-2 text-xs ${complianceScores.overallScore >= complianceThresholds.OVERALL_THRESHOLD * 100 ? 'bg-green-100 text-green-800' : 
                                  complianceScores.overallScore >= complianceThresholds.FLAG_THRESHOLD * 100 ? 'bg-amber-100 text-amber-800' : 
                                  'bg-red-100 text-red-800'}`}
                  >
                    {complianceScores.overallScore}%
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="export" 
                className={`px-4 py-3 text-sm font-medium rounded-none data-[state=active]:border-b-2 data-[state=active]:shadow-none data-[state=active]:bg-white data-[state=active]:border-blue-600 data-[state=active]:text-blue-600`}
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Export & Submit
              </TabsTrigger>
              <TabsTrigger 
                value="vault" 
                className={`px-4 py-3 text-sm font-medium rounded-none data-[state=active]:border-b-2 data-[state=active]:shadow-none data-[state=active]:bg-white data-[state=active]:border-blue-600 data-[state=active]:text-blue-600`}
              >
                <Archive className="h-3.5 w-3.5 mr-1.5" />
                VAULT
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold mb-1">Clinical Evaluation Report: CardioStent XR</h1>
              <div className="flex items-center text-xs text-gray-500">
                <div className="flex items-center mr-3">
                  <span className="mr-1">Last updated:</span>
                  <span>2025-05-06</span>
                </div>
                <div className="flex items-center mr-3">
                  <span className="mr-1">Author:</span>
                  <span>Dr. Elizabeth Chen</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-1">MedDevice Technologies, Inc.</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <select className="border text-xs rounded px-2 py-1 pr-6 bg-white">
                <option>Version 1.0 (Current Draft)</option>
                <option>Version 0.9 (Review)</option>
                <option>Version 0.8 (Initial Draft)</option>
              </select>
              
              <Button 
                size="sm" 
                className="text-xs h-7 rounded"
                onClick={generatePdfReport}
                disabled={isGeneratingPdf}
              >
                <FileText className="h-3.5 w-3.5 mr-1" />
                {isGeneratingPdf ? "Generating..." : "View Full Report"}
              </Button>
            </div>
          </div>
          
          <div>
            <TabsContent value="overview">
              <div className="grid grid-cols-3 gap-6">
                {/* Report Summary Card */}
                <div className="col-span-1">
                  <div className="bg-white border rounded shadow-sm">
                    <div className="border-b px-4 py-2 bg-gray-50 text-sm font-medium">
                      <div className="flex items-center">
                        <FileText className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                        Report Summary
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500">Device</div>
                          <div className="text-sm">CardioStent XR</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Product Code</div>
                          <div className="text-sm">MDT-CS-221</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Version</div>
                          <div className="text-sm">v1.0</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Status</div>
                          <div className="text-sm">In Progress</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Report Date</div>
                          <div className="text-sm">2025-05-06</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Last Updated</div>
                          <div className="text-sm">2025-05-06</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Compliance Overview */}
                  <div className="bg-white border rounded shadow-sm mt-6">
                    <div className="border-b px-4 py-2 bg-gray-50 text-sm font-medium">
                      <div className="flex items-center">
                        <BarChart4 className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                        Compliance Overview
                      </div>
                    </div>
                    <div className="p-4">
                      {complianceScores ? (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-medium">Overall Score</span>
                            <Badge 
                              className={`${complianceScores.overallScore >= complianceThresholds.OVERALL_THRESHOLD * 100 ? 'bg-green-100 text-green-800' : 
                                        complianceScores.overallScore >= complianceThresholds.FLAG_THRESHOLD * 100 ? 'bg-amber-100 text-amber-800' : 
                                        'bg-red-100 text-red-800'} text-xs`}
                            >
                              {complianceScores.overallScore}%
                            </Badge>
                          </div>
                          
                          <ComplianceRadarChart 
                            data={Object.values(complianceScores.standards).map(standard => ({
                              name: standard.name,
                              score: standard.score
                            }))}
                            thresholdValue={complianceThresholds.FLAG_THRESHOLD * 100}
                            enableLegend={false}
                          />
                          
                          <div className="mt-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="w-full text-xs h-7"
                              onClick={() => setActiveTab('compliance')}
                            >
                              View Full Assessment
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-4 text-center">
                          <p className="text-xs text-gray-500 mb-3">
                            No compliance assessment has been generated yet.
                          </p>
                          <Button 
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => setActiveTab('compliance')}
                          >
                            Generate Assessment
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Key Statistics Card */}
                <div className="col-span-2">
                  <div className="bg-white border rounded shadow-sm">
                    <div className="border-b px-4 py-2 bg-gray-50 text-sm font-medium flex justify-between items-center">
                      <div className="flex items-center">
                        <BarChart4 className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                        Key Statistics
                      </div>
                      <Button variant="outline" size="sm" className="h-6 text-xs px-2 py-0">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Refresh
                      </Button>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="border rounded-md p-3">
                          <div className="text-xs text-gray-500">Sections</div>
                          <div className="text-2xl font-bold">{Object.keys(reportSections).length}</div>
                          <div className="text-xs text-gray-500">Total report sections</div>
                        </div>
                        
                        <div className="border rounded-md p-3">
                          <div className="text-xs text-gray-500">Compliance</div>
                          <div className="text-2xl font-bold">{complianceScores ? `${complianceScores.overallScore}%` : 'N/A'}</div>
                          <div className="text-xs text-gray-500">Overall score</div>
                        </div>
                        
                        <div className="border rounded-md p-3">
                          <div className="text-xs text-gray-500">Critical Gaps</div>
                          <div className="text-2xl font-bold">{complianceScores ? complianceScores.criticalIssues || 0 : 'N/A'}</div>
                          <div className="text-xs text-gray-500">Issues to address</div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xs font-medium mb-2">Progress Tracker</h3>
                        <div className="space-y-3">
                          {Object.entries(reportSections).map(([key, section]) => {
                            const { text, color } = getStatusDisplay(section.status);
                            return (
                              <div key={key}>
                                <div className="flex justify-between text-xs mb-1">
                                  <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                                  <span className={color}>{text}</span>
                                </div>
                                <Progress value={section.progress} className="h-1" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* FDA FAERS Integration */}
                  <div className="bg-white border rounded shadow-sm mt-6">
                    <div className="border-b px-4 py-2 bg-gray-50 text-sm font-medium flex justify-between items-center">
                      <div className="flex items-center">
                        <Database className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                        FDA FAERS Analysis
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-6 text-xs px-2 py-0"
                        onClick={queryFaersData}
                      >
                        Query FAERS Data
                      </Button>
                    </div>
                    <div className="p-4">
                      {faersData ? (
                        <div>
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="border rounded-md p-3 bg-gray-50">
                              <div className="text-xs text-gray-500">Total Reports</div>
                              <div className="text-xl font-bold">{faersData.totalReports}</div>
                              <div className="text-xs text-gray-500">Adverse events</div>
                            </div>
                            <div className="border rounded-md p-3 bg-red-50">
                              <div className="text-xs text-gray-600">Severe Events</div>
                              <div className="text-xl font-bold text-red-700">{faersData.severeEvents}</div>
                              <div className="text-xs text-gray-600">High severity</div>
                            </div>
                            <div className="border rounded-md p-3 bg-amber-50">
                              <div className="text-xs text-gray-600">Moderate Events</div>
                              <div className="text-xl font-bold text-amber-700">{faersData.moderateEvents}</div>
                              <div className="text-xs text-gray-600">Medium severity</div>
                            </div>
                          </div>
                          
                          <div className="border-t pt-3 mt-3">
                            <h4 className="text-xs font-medium mb-2">Most Common Events</h4>
                            <div className="space-y-2">
                              {faersData.mostCommonEvents.map((event, idx) => (
                                <div key={idx} className="flex justify-between text-xs">
                                  <span>{event.name}</span>
                                  <span className="font-medium">{event.count} reports</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="mt-3 text-xs text-right">
                            <Button 
                              variant="link" 
                              className="h-auto p-0 text-xs"
                              onClick={() => setActiveTab('faers')}
                            >
                              View Complete FAERS Report
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <p className="text-xs text-gray-500 mb-2">
                            Query the FDA Adverse Event Reporting System to obtain safety data for CardioStent XR
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="builder">
              <div className="bg-white p-6 rounded border shadow-sm">
                <h2 className="text-lg font-medium mb-4">Report Builder</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Create and edit sections of your Clinical Evaluation Report using AI assistance.
                </p>
                
                <div className="grid grid-cols-2 gap-6 mb-6">
                  {/* AI Auto-Generation Panel */}
                  <Card className="p-4 border bg-blue-50">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-medium flex items-center">  
                        <Zap className="h-4 w-4 text-blue-600 mr-1.5" />
                        AI Auto-Generate Sections
                      </h3>
                      <Badge className="bg-blue-100 text-blue-800">Recommended</Badge>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-4">
                      Let AI analyze your device data and auto-generate complete report sections that follow regulatory guidelines.
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs">Device Description</span>
                        <Button size="sm" className="h-6 text-xs px-2">Generate</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs">Clinical Evaluation</span>
                        <Button size="sm" className="h-6 text-xs px-2">Generate</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs">Risk Analysis</span>
                        <Button size="sm" className="h-6 text-xs px-2">Generate</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs">Benefit-Risk Determination</span>
                        <Button size="sm" className="h-6 text-xs px-2">Generate</Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button className="w-full text-xs">
                        <Zap className="h-4 w-4 mr-1.5" />
                        Auto-Generate Complete Report
                      </Button>
                    </div>
                  </Card>
                  
                  {/* Report Template Selection */}
                  <Card className="p-4 border">
                    <h3 className="text-sm font-medium mb-4">Report Templates & Structure</h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="border rounded p-2 flex justify-between items-center hover:bg-gray-50 cursor-pointer">
                        <div>
                          <h4 className="text-xs font-medium">EU MDR Template</h4>
                          <p className="text-xs text-gray-500">Compliant with MDCG 2020-1 and Annex XIV</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Selected</Badge>
                      </div>
                      
                      <div className="border rounded p-2 flex justify-between items-center hover:bg-gray-50 cursor-pointer">
                        <div>
                          <h4 className="text-xs font-medium">FDA 510(k) Template</h4>
                          <p className="text-xs text-gray-500">Optimized for FDA submission pathway</p>
                        </div>
                        <Button variant="outline" size="sm" className="h-6 text-xs px-2">Select</Button>
                      </div>
                      
                      <div className="border rounded p-2 flex justify-between items-center hover:bg-gray-50 cursor-pointer">
                        <div>
                          <h4 className="text-xs font-medium">ISO 14155 Template</h4>
                          <p className="text-xs text-gray-500">Clinical investigation focus</p>
                        </div>
                        <Button variant="outline" size="sm" className="h-6 text-xs px-2">Select</Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button variant="outline" className="w-full text-xs">
                        <FileText className="h-4 w-4 mr-1.5" />
                        Create Custom Template
                      </Button>
                    </div>
                  </Card>
                </div>
                
                <h3 className="text-sm font-medium mt-6 mb-3">Available Section Templates</h3>
                <div className="grid grid-cols-4 gap-4">
                  {/* Section templates */}
                  <Card className="p-4 border hover:shadow-md transition cursor-pointer">
                    <h3 className="font-medium text-sm mb-1">Device Description</h3>
                    <p className="text-xs text-gray-500 mb-2">Technical specifications and features</p>
                    <Button size="sm" className="w-full text-xs h-7">Add Section</Button>
                  </Card>
                  <Card className="p-4 border hover:shadow-md transition cursor-pointer">
                    <h3 className="font-medium text-sm mb-1">Clinical Data Analysis</h3>
                    <p className="text-xs text-gray-500 mb-2">Summary of clinical investigation data</p>
                    <Button size="sm" className="w-full text-xs h-7">Add Section</Button>
                  </Card>
                  <Card className="p-4 border hover:shadow-md transition cursor-pointer">
                    <h3 className="font-medium text-sm mb-1">Risk Assessment</h3>
                    <p className="text-xs text-gray-500 mb-2">Clinical risks and mitigation</p>
                    <Button size="sm" className="w-full text-xs h-7">Add Section</Button>
                  </Card>
                  <Card className="p-4 border hover:shadow-md transition cursor-pointer">
                    <h3 className="font-medium text-sm mb-1">Conclusion</h3>
                    <p className="text-xs text-gray-500 mb-2">Final assessment and recommendations</p>
                    <Button size="sm" className="w-full text-xs h-7">Add Section</Button>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="literature">
              <LiteratureSearchPanel />
            </TabsContent>
            
            <TabsContent value="faers">
              <FaersSafetySignalAnalysis />
            </TabsContent>
            
            <TabsContent value="compliance">
              <div className="bg-white p-6 rounded border shadow-sm">
                <ComplianceScorePanel 
                  onScoresGenerated={handleComplianceScoresGenerated}
                  thresholds={complianceThresholds}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="vault">
              <div className="bg-white p-6 rounded border shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">VAULT Document Manager</h2>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="text-xs h-7">
                      <svg className="h-3.5 w-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      Import Document
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs h-7">
                      <svg className="h-3.5 w-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                      Export All
                    </Button>
                  </div>
                </div>
                
                <div className="bg-gray-50 border rounded-md p-3 mb-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="h-4 w-4 text-blue-600 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span className="font-medium">Connected to TrialSage VAULT™</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                  </div>
                  <p className="mt-2 text-gray-600">All documents are automatically synchronized with the centralized VAULT document repository.</p>
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full divide-y divide-gray-200 text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left font-medium text-gray-500">Document Name</th>
                        <th scope="col" className="px-3 py-2 text-left font-medium text-gray-500">Type</th>
                        <th scope="col" className="px-3 py-2 text-left font-medium text-gray-500">Version</th>
                        <th scope="col" className="px-3 py-2 text-left font-medium text-gray-500">Last Modified</th>
                        <th scope="col" className="px-3 py-2 text-left font-medium text-gray-500">Status</th>
                        <th scope="col" className="px-3 py-2 text-right font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <svg className="h-4 w-4 text-blue-600 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <span className="font-medium">CardioStent XR - Product Specification</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">Technical Document</td>
                        <td className="px-3 py-2 whitespace-nowrap">v2.3</td>
                        <td className="px-3 py-2 whitespace-nowrap">2025-04-28</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <Badge className="bg-green-100 text-green-800 text-xs">Approved</Badge>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right space-x-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                            </svg>
                          </Button>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <svg className="h-4 w-4 text-blue-600 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <span className="font-medium">PhaseII-001 Clinical Study Report</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">CSR</td>
                        <td className="px-3 py-2 whitespace-nowrap">v1.0</td>
                        <td className="px-3 py-2 whitespace-nowrap">2025-05-01</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <Badge className="bg-blue-100 text-blue-800 text-xs">In Review</Badge>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right space-x-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                            </svg>
                          </Button>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <svg className="h-4 w-4 text-blue-600 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <span className="font-medium">FDA Response Letter - Pre-Submission Meeting</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">Regulatory</td>
                        <td className="px-3 py-2 whitespace-nowrap">v1.0</td>
                        <td className="px-3 py-2 whitespace-nowrap">2025-04-22</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <Badge className="bg-green-100 text-green-800 text-xs">Final</Badge>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right space-x-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                            </svg>
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="export">
              <div className="bg-white p-6 rounded border shadow-sm">
                <h2 className="text-lg font-medium mb-4">Export & Submission</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Generate submission-ready documentation for regulatory authorities.
                </p>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-2">PDF Export</h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Generate a formatted PDF document of your Clinical Evaluation Report.
                    </p>
                    <Button 
                      className="w-full text-xs h-8"
                      onClick={generatePdfReport}
                      disabled={isGeneratingPdf}
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      {isGeneratingPdf ? "Generating PDF..." : "Generate PDF Report"}
                    </Button>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-2">Regulatory Submission</h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Prepare your report for submission to regulatory authorities.
                    </p>
                    <Button variant="outline" className="w-full text-xs h-8">
                      <svg className="h-3.5 w-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                      </svg>
                      Prepare for Submission
                    </Button>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-2">Export in Word Format</h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Generate a Microsoft Word document with fully editable content.
                    </p>
                    <Button variant="outline" className="w-full text-xs h-8">
                      <FileText className="h-3.5 w-3.5 mr-1.5" />
                      Export as Word Document
                    </Button>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-2">EUDAMED Export</h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Prepare data for European Database on Medical Devices submission.
                    </p>
                    <Button variant="outline" className="w-full text-xs h-8">
                      <svg className="h-3.5 w-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path>
                      </svg>
                      Prepare EUDAMED Data
                    </Button>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-3">Regulatory Submission Options</h3>
                  
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-500">Regulatory Body</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-500">Submission Type</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-500">Format</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-2">FDA (US)</td>
                          <td className="px-4 py-2">510(k)</td>
                          <td className="px-4 py-2">eSTAR</td>
                          <td className="px-4 py-2">
                            <Button size="sm" className="h-6 text-xs px-2">Prepare</Button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">EU Notified Body</td>
                          <td className="px-4 py-2">CE Mark</td>
                          <td className="px-4 py-2">Technical File</td>
                          <td className="px-4 py-2">
                            <Button size="sm" className="h-6 text-xs px-2 bg-blue-600">Prepare</Button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">Health Canada</td>
                          <td className="px-4 py-2">Medical Device License</td>
                          <td className="px-4 py-2">MDALL</td>
                          <td className="px-4 py-2">
                            <Button size="sm" className="h-6 text-xs px-2" variant="outline">Prepare</Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
              </div>
            </TabsContent>
          </div>
        </div>
      </main>
    </div>
  );
}