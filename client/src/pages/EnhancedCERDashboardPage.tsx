import React, { useState, useEffect } from "react";
import CERGenerator from "../components/CERGenerator";
import AdvancedDashboard from "../components/AdvancedDashboard";
import NLPQuery from "../components/NLPQuery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  FileBarChart2, 
  AlertCircle, 
  RefreshCw, 
  AlertTriangle, 
  Search, 
  Upload, 
  PlusCircle,
  BookOpen,
  LineChart,
  History,
  FileText,
  BarChart4
} from "lucide-react";

export default function EnhancedCERDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [selectedNdc, setSelectedNdc] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [displayMode, setDisplayMode] = useState<"list" | "grid">("grid");

  // Simulated recent reports
  const recentReports = [
    {
      id: "cer-20250415-001",
      title: "Adalimumab CER Q1 2025",
      date: "April 15, 2025",
      ndcCode: "0074-0243-01",
      progress: 100,
      status: "complete"
    },
    {
      id: "cer-20250413-002",
      title: "Semaglutide Q1 Safety Update",
      date: "April 13, 2025",
      ndcCode: "0169-4173-01",
      progress: 100,
      status: "complete"
    },
    {
      id: "cer-20250410-003",
      title: "Pembrolizumab Annual Update",
      date: "April 10, 2025",
      ndcCode: "0006-3029-02",
      progress: 100,
      status: "complete"
    }
  ];

  // Simulated CER data for dashboard
  const cerDashboardData = {
    totalReportsGenerated: 158,
    activeAlerts: 12,
    processingTasks: 3,
    recentSafetySignals: [
      {
        id: "ss-001",
        product: "Adalimumab",
        description: "Increased reports of injection site reactions in patients over 65",
        severity: "moderate",
        date: "April 10, 2025"
      },
      {
        id: "ss-002",
        product: "Semaglutide",
        description: "Potential interaction with beta blockers requiring investigation",
        severity: "high",
        date: "April 8, 2025"
      },
      {
        id: "ss-003",
        product: "Pembrolizumab",
        description: "New pattern of endocrine-related adverse events at higher doses",
        severity: "moderate",
        date: "April 5, 2025"
      }
    ]
  };
  
  // Simulate progress updates
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setProgressValue(prevValue => {
          const newValue = prevValue + 5;
          if (newValue >= 100) {
            setIsGenerating(false);
            clearInterval(interval);
            return 100;
          }
          return newValue;
        });
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const handleGenerateCER = () => {
    if (!selectedNdc) return;
    
    setIsGenerating(true);
    setProgressValue(0);
  };
  
  const SeverityBadge = ({ severity }: { severity: string }) => {
    const variants = {
      high: { variant: "destructive", icon: <AlertCircle className="h-4 w-4 mr-1" /> },
      moderate: { variant: "warning", icon: <AlertTriangle className="h-4 w-4 mr-1" /> },
      low: { variant: "outline", icon: null }
    };
    
    const { variant, icon } = variants[severity as keyof typeof variants] || variants.low;
    
    return (
      <Badge variant={variant as any} className="flex items-center">
        {icon}
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Enhanced CER Dashboard</h1>
        <p className="text-muted-foreground max-w-3xl">
          Generate, monitor, and analyze Clinical Evaluation Reports (CERs) with advanced analytics and FDA FAERS data integration.
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <FileBarChart2 className="h-4 w-4" />
            <span>CER Generator</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Reports</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart4 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total CERs Generated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cerDashboardData.totalReportsGenerated}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Safety Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cerDashboardData.activeAlerts}</div>
                <p className="text-xs text-muted-foreground">3 require immediate attention</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Processing Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cerDashboardData.processingTasks}</div>
                <p className="text-xs text-muted-foreground">Estimated completion: 45 minutes</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">FDA FAERS Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Daily</div>
                <p className="text-xs text-muted-foreground">Last synced: 2 hours ago</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Safety Signals</CardTitle>
                <CardDescription>
                  Detected patterns requiring review in the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cerDashboardData.recentSafetySignals.map(signal => (
                    <div key={signal.id} className="flex justify-between items-start border-b pb-3">
                      <div>
                        <h4 className="font-medium">{signal.product}</h4>
                        <p className="text-sm text-muted-foreground">{signal.description}</p>
                        <div className="text-xs text-muted-foreground mt-1">{signal.date}</div>
                      </div>
                      <SeverityBadge severity={signal.severity} />
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="outline" size="sm">
                  View All Signals
                </Button>
                <Button size="sm">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh Data
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>
                  Latest generated CERs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentReports.map(report => (
                    <div key={report.id} className="flex flex-col gap-1 border-b pb-2">
                      <div className="font-medium text-sm">{report.title}</div>
                      <div className="text-xs text-muted-foreground">{report.date}</div>
                      <div className="flex justify-between items-center gap-2 mt-1">
                        <div className="text-xs text-muted-foreground">NDC: {report.ndcCode}</div>
                        <Badge variant="outline" className="text-xs">Complete</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  View All Reports
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2" onClick={() => setActiveTab("generator")}>
                  <PlusCircle className="h-6 w-6" />
                  <span className="text-sm">New CER</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                  <Upload className="h-6 w-6" />
                  <span className="text-sm">Import Data</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                  <Search className="h-6 w-6" />
                  <span className="text-sm">Search Reports</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                  <BookOpen className="h-6 w-6" />
                  <span className="text-sm">Documentation</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate New CER</CardTitle>
              <CardDescription>
                Enter an NDC code to generate a comprehensive Clinical Evaluation Report with FDA FAERS data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="ndc-code" className="text-sm font-medium">
                  NDC Code
                </label>
                <div className="flex gap-2">
                  <Input 
                    id="ndc-code" 
                    placeholder="e.g., 0074-0243-01" 
                    value={selectedNdc}
                    onChange={(e) => setSelectedNdc(e.target.value)}
                  />
                  <Button 
                    onClick={handleGenerateCER}
                    disabled={!selectedNdc || isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileBarChart2 className="h-4 w-4 mr-2" />
                        Generate CER
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter a valid National Drug Code (NDC) to fetch data from FDA FAERS
                </p>
              </div>
              
              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Generation progress</span>
                    <span>{progressValue}%</span>
                  </div>
                  <Progress value={progressValue} />
                  <div className="text-xs text-muted-foreground">
                    Fetching data from FDA FAERS and generating report. This may take a few minutes.
                  </div>
                </div>
              )}
              
              {progressValue === 100 && (
                <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
                  <FileBarChart2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertTitle className="text-green-600 dark:text-green-400">Report Generated Successfully</AlertTitle>
                  <AlertDescription className="text-green-600/90 dark:text-green-400/90">
                    Your CER for NDC {selectedNdc} has been generated successfully. You can view or download it below.
                  </AlertDescription>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline">
                      <FileText className="h-4 w-4 mr-1" />
                      View Report
                    </Button>
                    <Button size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download PDF
                    </Button>
                  </div>
                </Alert>
              )}
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-2">Analysis Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <input type="checkbox" id="include-literature" className="mt-1" defaultChecked />
                    <div>
                      <label htmlFor="include-literature" className="text-sm font-medium block">
                        Include Literature Review
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Add automatic analysis of recent medical literature
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <input type="checkbox" id="include-signals" className="mt-1" defaultChecked />
                    <div>
                      <label htmlFor="include-signals" className="text-sm font-medium block">
                        Include Signal Detection
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Automatically identify potential safety signals
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <input type="checkbox" id="include-narrative" className="mt-1" defaultChecked />
                    <div>
                      <label htmlFor="include-narrative" className="text-sm font-medium block">
                        Generate AI Narrative
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Create structured narrative sections based on data
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <input type="checkbox" id="include-trends" className="mt-1" defaultChecked />
                    <div>
                      <label htmlFor="include-trends" className="text-sm font-medium block">
                        Include Trend Analysis
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Compare with historical data to identify patterns
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Generation History</CardTitle>
              <CardDescription>
                Your recent CER generation tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReports.map(report => (
                  <div key={report.id} className="flex justify-between items-center border-b pb-3">
                    <div>
                      <h4 className="font-medium">{report.title}</h4>
                      <div className="text-sm text-muted-foreground">NDC: {report.ndcCode}</div>
                      <div className="text-xs text-muted-foreground mt-1">{report.date}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                <History className="h-4 w-4 mr-1" />
                View Full History
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <PlusCircle className="h-4 w-4 mr-1" />
                New Report
              </Button>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => {
              const report = {
                ...recentReports[i % recentReports.length],
                id: `cer-202504${15-i}-00${i+1}`
              };
              return (
                <Card key={report.id} className="overflow-hidden">
                  <div className="h-32 bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center">
                    <FileBarChart2 className="h-12 w-12 text-white" />
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <Badge>Complete</Badge>
                    </div>
                    <CardDescription>
                      NDC: {report.ndcCode} · Generated: {report.date}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Clinical Evaluation Report with comprehensive analysis of adverse events, 
                      safety signals, and risk-benefit assessment.
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t p-4">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
          
          <div className="flex justify-center">
            <Button variant="outline">Load More Reports</Button>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Adverse Event Trends (2023-2025)</CardTitle>
                <CardDescription>
                  Monthly pattern of reported adverse events by category
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-md">
                <div className="text-center">
                  <LineChart className="h-10 w-10 mx-auto text-slate-400" />
                  <p className="mt-2 text-slate-500 dark:text-slate-400">
                    Interactive trend visualization
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Safety Signal Summary</CardTitle>
                <CardDescription>
                  Detected patterns requiring review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cerDashboardData.recentSafetySignals.map(signal => (
                    <div key={signal.id} className="flex justify-between items-start border-b pb-3">
                      <div>
                        <h4 className="font-medium">{signal.product}</h4>
                        <p className="text-sm text-muted-foreground">{signal.description}</p>
                        <div className="text-xs text-muted-foreground mt-1">{signal.date}</div>
                      </div>
                      <SeverityBadge severity={signal.severity} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Reported Drugs</CardTitle>
                <CardDescription>
                  Products with highest reporting frequency
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-md">
                <div className="text-center">
                  <BarChart4 className="h-10 w-10 mx-auto text-slate-400" />
                  <p className="mt-2 text-slate-500 dark:text-slate-400">
                    Bar chart showing top reported drugs
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Adverse Event Categories</CardTitle>
                <CardDescription>
                  Distribution by MedDRA classification
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-md">
                <div className="text-center">
                  <BarChart4 className="h-10 w-10 mx-auto text-slate-400" />
                  <p className="mt-2 text-slate-500 dark:text-slate-400">
                    Pie chart showing adverse event distribution
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Analysis Tools</CardTitle>
              <CardDescription>
                Advanced analytics capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                  <LineChart className="h-6 w-6" />
                  <span className="text-sm">Custom Analysis</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                  <Search className="h-6 w-6" />
                  <span className="text-sm">Signal Detection</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                  <Download className="h-6 w-6" />
                  <span className="text-sm">Export Analysis</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}