// CSRIntelligence.jsx - Comprehensive CSR Intelligence Module with dashboards, reports, upload capabilities, and intelligence insights

import React, { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  FileText, 
  BarChart, 
  PieChart,
  UploadCloud, 
  Download, 
  Search, 
  FileSymlink, 
  TrendingUp, 
  Zap, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Activity,
  LineChart,
  BarChart2,
  ExternalLink,
  FileSearch,
  Layers,
  GitCompare
} from 'lucide-react';

// Sample data for demonstration
const recentReports = [
  { id: 'CSR-2023-A109', title: 'Phase 2b Efficacy Study in Metabolic Disease', date: '2023-11-15', status: 'complete', score: 89 },
  { id: 'CSR-2023-B241', title: 'Phase 1 PK/PD Study in Healthy Volunteers', date: '2023-10-22', status: 'complete', score: 92 },
  { id: 'CSR-2023-C187', title: 'Phase 3 Pivotal Trial for Oncology Indication', date: '2023-09-05', status: 'complete', score: 84 },
  { id: 'CSR-2023-D023', title: 'Phase 2a Dose-Finding Study in CNS Disorder', date: '2023-08-17', status: 'complete', score: 78 },
  { id: 'CSR-2023-E305', title: 'Phase 1b Safety Extension Study', date: '2023-07-29', status: 'complete', score: 95 },
];

const insightsData = [
  { category: 'Study Design', count: 321, trend: 'up', recommendation: 'Consider adaptive designs for faster patient accrual' },
  { category: 'Endpoint Selection', count: 187, trend: 'up', recommendation: 'Combine PRO measures with traditional endpoints' },
  { category: 'Sample Size', count: 253, trend: 'down', recommendation: 'Current sample sizes may be over-powered based on recent effect sizes' },
  { category: 'Statistical Methods', count: 145, trend: 'neutral', recommendation: 'Consider Bayesian approaches for rare disease indications' },
  { category: 'Safety Reporting', count: 298, trend: 'up', recommendation: 'Enhanced visual presentations improve reviewer comprehension' },
];

// CSR Intelligence Metrics
const csrMetrics = {
  totalCSRs: 3021,
  analyzedProtocols: 2837,
  regulatorySuccessRate: 94.2,
  averageCompletionTime: 68,
  aiRecommendations: 12503,
};

// Dashboard data for visualizations
const dashboardData = {
  monthlyCounts: [42, 38, 55, 47, 53, 61, 68, 72, 65, 59, 64, 71],
  topTherapeuticAreas: [
    { name: 'Oncology', count: 845 },
    { name: 'Neurology', count: 612 },
    { name: 'Cardiology', count: 594 },
    { name: 'Immunology', count: 487 },
    { name: 'Infectious Disease', count: 412 }
  ],
  phaseDistribution: [
    { phase: 'Phase 1', count: 876 },
    { phase: 'Phase 2', count: 1104 },
    { phase: 'Phase 3', count: 924 },
    { phase: 'Phase 4', count: 117 }
  ]
};

// Chart components (simple mockups)
const BarChartComponent = () => (
  <div className="h-60 flex items-end justify-between space-x-2 border-b border-l relative p-4">
    {dashboardData.monthlyCounts.map((value, idx) => (
      <div 
        key={idx} 
        className="bg-blue-600 w-6 rounded-t"
        style={{ height: `${value * 2}px` }}
        title={`Month ${idx+1}: ${value} reports`}
      />
    ))}
    <div className="absolute bottom-0 left-0 w-full border-t border-gray-200"></div>
    <div className="absolute left-0 bottom-0 h-full border-r border-gray-200"></div>
  </div>
);

const PieChartComponent = () => (
  <div className="h-60 flex items-center justify-center">
    <svg width="200" height="200" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="80" fill="transparent" stroke="#e2e8f0" strokeWidth="30" />
      <circle 
        cx="100" 
        cy="100" 
        r="80" 
        fill="transparent" 
        stroke="#3b82f6" 
        strokeWidth="30" 
        strokeDasharray={`${2 * Math.PI * 80 * 0.29} ${2 * Math.PI * 80 * 0.71}`}
        transform="rotate(-90) translate(-200 0)"
      />
      <circle 
        cx="100" 
        cy="100" 
        r="80" 
        fill="transparent" 
        stroke="#10b981" 
        strokeWidth="30" 
        strokeDasharray={`${2 * Math.PI * 80 * 0.36} ${2 * Math.PI * 80 * 0.64}`}
        transform="rotate(14) translate(-200 0)"
      />
      <circle 
        cx="100" 
        cy="100" 
        r="80" 
        fill="transparent" 
        stroke="#6366f1" 
        strokeWidth="30" 
        strokeDasharray={`${2 * Math.PI * 80 * 0.31} ${2 * Math.PI * 80 * 0.69}`}
        transform="rotate(144) translate(-200 0)"
      />
      <text x="100" y="100" textAnchor="middle" dominantBaseline="middle" className="text-xs font-medium">Phase Distribution</text>
    </svg>
  </div>
);

const LineChartComponent = () => (
  <div className="h-60 flex items-center justify-center p-4 relative">
    <svg width="100%" height="100%" viewBox="0 0 300 100">
      <polyline
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        points="0,80 25,70 50,75 75,60 100,65 125,55 150,45 175,50 200,30 225,40 250,35 275,25 300,20"
      />
      <line x1="0" y1="100" x2="300" y2="100" stroke="#e2e8f0" strokeWidth="1" />
    </svg>
    <div className="absolute bottom-0 left-0 w-full border-t border-gray-200"></div>
    <div className="absolute left-0 bottom-0 h-full border-r border-gray-200"></div>
  </div>
);

// Mock upload component with progress
const CSRUploadSection = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleUpload = () => {
    setUploading(true);
    setProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          toast({
            title: "Upload Complete",
            description: "Your CSR has been uploaded and is now being processed.",
            variant: "success",
          });
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <UploadCloud className="mr-2 h-5 w-5" />
          Upload CSR for Analysis
        </CardTitle>
        <CardDescription>
          Upload your Clinical Study Report for AI-powered analysis and comparison
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold">Drag &amp; drop your CSR file</h3>
          <p className="mt-1 text-xs text-gray-500">PDF, DOCX, or XML (Max 50MB)</p>
          
          <div className="mt-4">
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>Select File</>
              )}
            </Button>
          </div>
          
          {uploading && (
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
              <p className="mt-2 text-xs text-gray-500">Processing: {progress}%</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t px-6 py-4">
        <div className="text-xs text-gray-500">
          Your CSRs are processed securely and confidentially
        </div>
        <Button variant="ghost" size="sm">
          View Upload History
        </Button>
      </CardFooter>
    </Card>
  );
};

// Protocol Comparison Tool
const ProtocolComparisonTool = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <GitCompare className="mr-2 h-5 w-5" />
          Protocol Comparison
        </CardTitle>
        <CardDescription>
          Compare your protocol against our library of successful study designs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Select your protocol</label>
            <div className="flex mt-1">
              <Input placeholder="No file selected" disabled className="rounded-r-none" />
              <Button className="rounded-l-none">Browse</Button>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Therapeutic area</label>
            <select className="w-full mt-1 rounded-md border border-gray-300 p-2 text-sm">
              <option>Oncology</option>
              <option>Neurology</option>
              <option>Cardiology</option>
              <option>Immunology</option>
              <option>Infectious Disease</option>
              <option>Metabolic Disease</option>
              <option>Respiratory</option>
              <option>Dermatology</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Study phase</label>
            <div className="flex space-x-2 mt-1">
              <Button variant="outline" size="sm" className="flex-1">Phase 1</Button>
              <Button variant="outline" size="sm" className="flex-1 bg-blue-50 border-blue-200">Phase 2</Button>
              <Button variant="outline" size="sm" className="flex-1">Phase 3</Button>
              <Button variant="outline" size="sm" className="flex-1">Phase 4</Button>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Elements to compare</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="flex items-center">
                <input type="checkbox" id="endpoints" className="mr-2" checked readOnly />
                <label htmlFor="endpoints" className="text-sm">Endpoints</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="criteria" className="mr-2" checked readOnly />
                <label htmlFor="criteria" className="text-sm">Eligibility Criteria</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="design" className="mr-2" checked readOnly />
                <label htmlFor="design" className="text-sm">Study Design</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="statistical" className="mr-2" checked readOnly />
                <label htmlFor="statistical" className="text-sm">Statistical Methods</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="sample" className="mr-2" checked readOnly />
                <label htmlFor="sample" className="text-sm">Sample Size</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="procedures" className="mr-2" />
                <label htmlFor="procedures" className="text-sm">Procedures</label>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          <FileSearch className="mr-2 h-4 w-4" />
          Run Intelligent Comparison
        </Button>
      </CardFooter>
    </Card>
  );
};

// Intelligence Insights Panel
const IntelligenceInsights = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="mr-2 h-5 w-5" />
          Intelligence Insights
        </CardTitle>
        <CardDescription>
          AI-powered insights derived from analysis of regulatory submissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[290px] pr-4">
          <div className="space-y-4">
            {insightsData.map((insight, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-medium">{insight.category}</h4>
                  <Badge variant={insight.trend === 'up' ? "success" : insight.trend === 'down' ? "destructive" : "outline"}>
                    {insight.trend === 'up' ? '↑' : insight.trend === 'down' ? '↓' : '−'} {insight.count} data points
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{insight.recommendation}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t">
        <Button variant="outline" className="w-full">
          View All Intelligence Insights
        </Button>
      </CardFooter>
    </Card>
  );
};

// Recent Activity Table
const RecentActivity = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-5 w-5" />
          Recent CSR Analysis
        </CardTitle>
        <CardDescription>
          Recently analyzed Clinical Study Reports with quality scores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentReports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.id}</TableCell>
                <TableCell>{report.title}</TableCell>
                <TableCell>{report.date}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <span className={`${report.score >= 90 ? 'text-green-600' : report.score >= 80 ? 'text-blue-600' : 'text-amber-600'} font-medium mr-2`}>
                      {report.score}%
                    </span>
                    <Progress 
                      value={report.score} 
                      className="h-2 w-16" 
                      indicatorClassName={
                        report.score >= 90 ? 'bg-green-600' : 
                        report.score >= 80 ? 'bg-blue-600' : 
                        'bg-amber-600'
                      }
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <FileSearch className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="border-t flex justify-between">
        <div className="text-sm text-gray-500">
          Showing 5 of 243 reports
        </div>
        <Button variant="outline" size="sm">
          View All Reports
        </Button>
      </CardFooter>
    </Card>
  );
};

// Metrics Cards
const MetricsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-500">Total CSRs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{csrMetrics.totalCSRs.toLocaleString()}</div>
          <p className="text-xs text-green-600 mt-1">+124 this month</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-500">Analyzed Protocols</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{csrMetrics.analyzedProtocols.toLocaleString()}</div>
          <p className="text-xs text-green-600 mt-1">+82 this month</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-500">Regulatory Success</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{csrMetrics.regulatorySuccessRate}%</div>
          <p className="text-xs text-green-600 mt-1">+2.1% YoY</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-500">Avg. Completion Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{csrMetrics.averageCompletionTime} days</div>
          <p className="text-xs text-green-600 mt-1">-12 days from baseline</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-500">AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{csrMetrics.aiRecommendations.toLocaleString()}</div>
          <p className="text-xs text-green-600 mt-1">92.7% adoption rate</p>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Dashboard Component
const DashboardTab = () => {
  return (
    <div className="space-y-6">
      <MetricsCards />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart2 className="mr-2 h-5 w-5" />
              Monthly CSR Analysis
            </CardTitle>
            <CardDescription>
              CSR analysis volume over the past 12 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChartComponent />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-2 h-5 w-5" />
              Study Phase Distribution
            </CardTitle>
            <CardDescription>
              CSRs by clinical trial phase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PieChartComponent />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="mr-2 h-5 w-5" />
              Quality Score Trends
            </CardTitle>
            <CardDescription>
              Average CSR quality scores over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LineChartComponent />
          </CardContent>
        </Card>
      </div>
      
      <RecentActivity />
    </div>
  );
};

// Main CSR Intelligence Component
export default function CSRIntelligence() {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">CSR Intelligence Center</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive CSR analytics and intelligence platform
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Analysis
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start New CSR Analysis</DialogTitle>
                  <DialogDescription>
                    Upload a new Clinical Study Report for comprehensive analysis and benchmarking.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Analysis Name</label>
                    <Input placeholder="Enter a descriptive name..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Analysis Type</label>
                    <select className="w-full rounded-md border border-gray-300 p-2 text-sm">
                      <option>Full CSR Analysis</option>
                      <option>Protocol Benchmarking</option>
                      <option>Regulatory Compliance Check</option>
                      <option>Statistical Methods Review</option>
                      <option>Endpoint Analysis</option>
                    </select>
                  </div>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <UploadCloud className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Drag &amp; drop or click to upload</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Start Analysis</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Tabs defaultValue="dashboard" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">
              <BarChart className="mr-2 h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="mr-2 h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="upload">
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload & Compare
            </TabsTrigger>
            <TabsTrigger value="insights">
              <Zap className="mr-2 h-4 w-4" />
              Intelligence
            </TabsTrigger>
            <TabsTrigger value="library">
              <Layers className="mr-2 h-4 w-4" />
              Protocol Library
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-6">
            <DashboardTab />
          </TabsContent>
          
          <TabsContent value="reports">
            <div className="space-y-6">
              <div className="flex justify-between">
                <div className="flex gap-4 w-1/2">
                  <Input placeholder="Search reports..." />
                  <Button variant="outline">
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </Button>
                </div>
                <div className="flex gap-2">
                  <select className="rounded-md border border-gray-300 p-2 text-sm">
                    <option>All Therapeutic Areas</option>
                    <option>Oncology</option>
                    <option>Neurology</option>
                    <option>Cardiology</option>
                    <option>Immunology</option>
                  </select>
                  <select className="rounded-md border border-gray-300 p-2 text-sm">
                    <option>All Phases</option>
                    <option>Phase 1</option>
                    <option>Phase 2</option>
                    <option>Phase 3</option>
                    <option>Phase 4</option>
                  </select>
                  <Button variant="outline" size="sm">
                    <FileSymlink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Therapeutic Area</TableHead>
                        <TableHead>Phase</TableHead>
                        <TableHead>Date Added</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...recentReports, ...recentReports].slice(0, 8).map((report, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{report.id}</TableCell>
                          <TableCell>{report.title}</TableCell>
                          <TableCell>
                            {['Oncology', 'Neurology', 'Cardiology', 'Metabolic', 'Immunology'][idx % 5]}
                          </TableCell>
                          <TableCell>
                            {['Phase 1', 'Phase 2', 'Phase 3', 'Phase 2b', 'Phase 1b'][idx % 5]}
                          </TableCell>
                          <TableCell>{report.date}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className={`${report.score >= 90 ? 'text-green-600' : report.score >= 80 ? 'text-blue-600' : 'text-amber-600'} font-medium mr-2`}>
                                {report.score}%
                              </span>
                              <Progress 
                                value={report.score} 
                                className="h-2 w-16" 
                                indicatorClassName={
                                  report.score >= 90 ? 'bg-green-600' : 
                                  report.score >= 80 ? 'bg-blue-600' : 
                                  'bg-amber-600'
                                }
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={report.status === 'complete' ? 'success' : 'outline'}>
                              {report.status === 'complete' ? (
                                <CheckCircle className="mr-1 h-3 w-3" />
                              ) : (
                                <Clock className="mr-1 h-3 w-3" />
                              )}
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <FileSearch className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Download</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="border-t flex justify-between py-4">
                  <div className="text-sm text-gray-500">
                    Showing 8 of 243 reports
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" disabled>Previous</Button>
                    <Button variant="outline" size="sm">Next</Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="upload">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CSRUploadSection />
              <ProtocolComparisonTool />
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Recent Analyses & Comparisons</h3>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Similarity Score</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Protocol-2023-Oncology-Phase2</TableCell>
                        <TableCell>Protocol Comparison</TableCell>
                        <TableCell>2023-12-05</TableCell>
                        <TableCell>
                          <Badge variant="success">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Complete
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="text-blue-600 font-medium mr-2">84%</span>
                            <Progress value={84} className="h-2 w-16" />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <FileSearch className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>CSR-Phase3-Cardiovascular</TableCell>
                        <TableCell>CSR Analysis</TableCell>
                        <TableCell>2023-12-01</TableCell>
                        <TableCell>
                          <Badge variant="success">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Complete
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="text-green-600 font-medium mr-2">92%</span>
                            <Progress value={92} className="h-2 w-16" indicatorClassName="bg-green-600" />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <FileSearch className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Protocol-2023-Immunology</TableCell>
                        <TableCell>Protocol Analysis</TableCell>
                        <TableCell>2023-11-28</TableCell>
                        <TableCell>
                          <Badge variant="success">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Complete
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="text-amber-600 font-medium mr-2">76%</span>
                            <Progress value={76} className="h-2 w-16" indicatorClassName="bg-amber-600" />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <FileSearch className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="insights">
            <Alert className="mb-6">
              <AlertTitle className="flex items-center">
                <Zap className="mr-2 h-4 w-4" />
                AI Intelligence Hub
              </AlertTitle>
              <AlertDescription>
                AI-powered insights derived from our database of over 3,000 clinical study reports and protocols. These insights are updated in real-time as new documents are analyzed.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <IntelligenceInsights />
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Trending Insights by Therapeutic Area
                  </CardTitle>
                  <CardDescription>
                    Most significant insights for selected therapeutic areas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="oncology">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="oncology">Oncology</TabsTrigger>
                      <TabsTrigger value="neurology">Neurology</TabsTrigger>
                      <TabsTrigger value="cardiology">Cardiology</TabsTrigger>
                      <TabsTrigger value="immunology">Immunology</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="oncology" className="mt-4">
                      <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">High Confidence</Badge>
                            <div className="ml-auto text-sm text-gray-500">Based on 312 CSRs</div>
                          </div>
                          <h4 className="font-semibold mb-1">Adaptive Trial Designs Show 28% Higher Success Rate</h4>
                          <p className="text-sm text-gray-600">Oncology trials using adaptive designs show significantly higher success rates than traditional fixed designs, especially in Phase 2 studies targeting rare mutations.</p>
                          <div className="mt-3 pt-3 border-t flex justify-between items-center">
                            <div className="text-sm text-gray-500">Updated 2 days ago</div>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Details
                            </Button>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Regulatory Impact</Badge>
                            <div className="ml-auto text-sm text-gray-500">Based on 187 CSRs</div>
                          </div>
                          <h4 className="font-semibold mb-1">Composite Endpoints Require Enhanced Statistical Justification</h4>
                          <p className="text-sm text-gray-600">Recent regulatory feedback shows increasing scrutiny of composite endpoints in oncology trials. Studies with well-justified component selection have 3x higher approval rates.</p>
                          <div className="mt-3 pt-3 border-t flex justify-between items-center">
                            <div className="text-sm text-gray-500">Updated 1 week ago</div>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="neurology" className="mt-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">High Confidence</Badge>
                          <div className="ml-auto text-sm text-gray-500">Based on 245 CSRs</div>
                        </div>
                        <h4 className="font-semibold mb-1">Patient-Reported Outcomes Critical for Neurology Indications</h4>
                        <p className="text-sm text-gray-600">Analysis shows neurological disorder trials with robust PRO measures have 42% higher regulatory success rates, particularly when combined with objective clinical endpoints.</p>
                        <div className="mt-3 pt-3 border-t flex justify-between items-center">
                          <div className="text-sm text-gray-500">Updated 5 days ago</div>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="cardiology">
                      <div className="h-64 flex items-center justify-center">
                        <p className="text-gray-500">Select a therapeutic area to view insights</p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="immunology">
                      <div className="h-64 flex items-center justify-center">
                        <p className="text-gray-500">Select a therapeutic area to view insights</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="border-t">
                  <Button variant="outline" className="w-full">
                    View All Therapeutic Areas
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="library">
            <div className="space-y-6">
              <div className="flex justify-between">
                <div className="flex gap-4 w-1/2">
                  <Input placeholder="Search protocol library..." />
                  <Button variant="outline">
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </Button>
                </div>
                <div className="flex gap-2">
                  <select className="rounded-md border border-gray-300 p-2 text-sm">
                    <option>All Therapeutic Areas</option>
                    <option>Oncology</option>
                    <option>Neurology</option>
                    <option>Cardiology</option>
                    <option>Immunology</option>
                  </select>
                  <select className="rounded-md border border-gray-300 p-2 text-sm">
                    <option>All Phases</option>
                    <option>Phase 1</option>
                    <option>Phase 2</option>
                    <option>Phase 3</option>
                    <option>Phase 4</option>
                  </select>
                  <Button variant="outline" size="sm">
                    <FileSymlink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <Badge>Phase 2</Badge>
                      <Button variant="ghost" size="sm">
                        <FileSearch className="h-4 w-4" />
                      </Button>
                    </div>
                    <h3 className="font-semibold mb-1">Oncology - Solid Tumor Protocol</h3>
                    <p className="text-sm text-gray-600 mb-4">Randomized, double-blind study for advanced solid tumors with novel immunotherapy agent.</p>
                    <div className="text-xs text-gray-500 flex items-center justify-between mt-2">
                      <div>Success Rate: <span className="text-green-600 font-medium">92%</span></div>
                      <div>Adoption Rate: <span className="text-blue-600 font-medium">High</span></div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <Badge>Phase 3</Badge>
                      <Button variant="ghost" size="sm">
                        <FileSearch className="h-4 w-4" />
                      </Button>
                    </div>
                    <h3 className="font-semibold mb-1">Cardiology - Heart Failure Protocol</h3>
                    <p className="text-sm text-gray-600 mb-4">Multicenter trial for chronic heart failure with novel mechanism cardioprotective agent.</p>
                    <div className="text-xs text-gray-500 flex items-center justify-between mt-2">
                      <div>Success Rate: <span className="text-green-600 font-medium">87%</span></div>
                      <div>Adoption Rate: <span className="text-blue-600 font-medium">Medium</span></div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <Badge>Phase 1</Badge>
                      <Button variant="ghost" size="sm">
                        <FileSearch className="h-4 w-4" />
                      </Button>
                    </div>
                    <h3 className="font-semibold mb-1">Neurology - CNS Disorder Protocol</h3>
                    <p className="text-sm text-gray-600 mb-4">Adaptive design study for CNS disorders with novel blood-brain barrier penetrant.</p>
                    <div className="text-xs text-gray-500 flex items-center justify-between mt-2">
                      <div>Success Rate: <span className="text-green-600 font-medium">94%</span></div>
                      <div>Adoption Rate: <span className="text-blue-600 font-medium">Very High</span></div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <Badge>Phase 2b</Badge>
                      <Button variant="ghost" size="sm">
                        <FileSearch className="h-4 w-4" />
                      </Button>
                    </div>
                    <h3 className="font-semibold mb-1">Immunology - Autoimmune Protocol</h3>
                    <p className="text-sm text-gray-600 mb-4">Dose-ranging study for autoimmune conditions with novel immunomodulator approach.</p>
                    <div className="text-xs text-gray-500 flex items-center justify-between mt-2">
                      <div>Success Rate: <span className="text-green-600 font-medium">85%</span></div>
                      <div>Adoption Rate: <span className="text-blue-600 font-medium">Medium</span></div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <Badge>Phase 2/3</Badge>
                      <Button variant="ghost" size="sm">
                        <FileSearch className="h-4 w-4" />
                      </Button>
                    </div>
                    <h3 className="font-semibold mb-1">Metabolic - Diabetes Protocol</h3>
                    <p className="text-sm text-gray-600 mb-4">Seamless Phase 2/3 design for diabetes with novel mechanism glucose regulator.</p>
                    <div className="text-xs text-gray-500 flex items-center justify-between mt-2">
                      <div>Success Rate: <span className="text-green-600 font-medium">91%</span></div>
                      <div>Adoption Rate: <span className="text-blue-600 font-medium">High</span></div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <Badge>Phase 1b</Badge>
                      <Button variant="ghost" size="sm">
                        <FileSearch className="h-4 w-4" />
                      </Button>
                    </div>
                    <h3 className="font-semibold mb-1">Respiratory - Asthma Protocol</h3>
                    <p className="text-sm text-gray-600 mb-4">Multiple ascending dose study for severe asthma with novel anti-inflammatory.</p>
                    <div className="text-xs text-gray-500 flex items-center justify-between mt-2">
                      <div>Success Rate: <span className="text-green-600 font-medium">90%</span></div>
                      <div>Adoption Rate: <span className="text-blue-600 font-medium">High</span></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex justify-center mt-4">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled>Previous</Button>
                  <Button variant="outline" size="sm" className="bg-blue-50">1</Button>
                  <Button variant="outline" size="sm">2</Button>
                  <Button variant="outline" size="sm">3</Button>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </QueryClientProvider>
  );
}