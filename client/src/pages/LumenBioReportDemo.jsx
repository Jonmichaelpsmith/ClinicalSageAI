import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { SplitPane } from 'react-multi-split-pane';
import { useToast } from '@/hooks/use-toast';

import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

// Icons
import { 
  FileText, 
  Download, 
  Eye, 
  Share2, 
  Printer, 
  Check, 
  AlertTriangle, 
  ExternalLink,
  ArrowRightCircle,
  Clock,
  CheckCircle2,
  BarChart3,
  LineChart,
  Table,
  FileBarChart
} from 'lucide-react';

const GuidelineComplianceCard = ({ guideline, compliance, details }) => {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">{guideline}</CardTitle>
          <Badge variant={compliance >= 90 ? "success" : compliance >= 70 ? "warning" : "destructive"}>
            {compliance}% Compliant
          </Badge>
        </div>
        <CardDescription>
          ICH Guideline Compliance Assessment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Progress 
          value={compliance} 
          className="h-2 mb-4" 
          indicatorClassName={compliance >= 90 ? "bg-green-500" : compliance >= 70 ? "bg-amber-500" : "bg-red-500"}
        />
        <ul className="space-y-2 text-sm">
          {details.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              {item.compliant ? 
                <Check className="h-4 w-4 text-green-500 mt-0.5" /> : 
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
              }
              <span className={item.compliant ? "" : "text-amber-800"}>
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" className="text-xs">
          <Eye className="h-3.5 w-3.5 mr-1.5" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

const DataPoint = ({ label, value, trend, positive = true, icon }) => {
  return (
    <div className="flex flex-col gap-1 bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</span>
        {icon}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-semibold">{value}</span>
        {trend && (
          <div className={`flex items-center text-xs ${positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} mb-0.5`}>
            <ArrowRightCircle className={`h-3 w-3 mr-0.5 ${positive ? 'rotate-45' : 'rotate-135'}`} />
            {trend}
          </div>
        )}
      </div>
    </div>
  );
};

const DocumentStatusCard = ({ 
  title, 
  status, 
  date, 
  owner, 
  dueDate, 
  progress,
  issueCount,
  warningCount
}) => {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base font-medium">{title}</CardTitle>
            <CardDescription className="text-xs">
              Last updated: {date} • Owner: {owner}
            </CardDescription>
          </div>
          <Badge variant={
            status === 'Completed' ? 'success' : 
            status === 'In Review' ? 'warning' : 
            status === 'In Progress' ? 'outline' : 
            'secondary'
          }>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
          
          <div className="flex justify-between text-xs">
            <div className="flex items-center">
              <Clock className="h-3.5 w-3.5 text-amber-500 mr-1.5" />
              Due: {dueDate}
            </div>
            <div className="flex gap-3">
              {issueCount > 0 && (
                <div className="flex items-center text-red-600">
                  <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                  {issueCount} issues
                </div>
              )}
              {warningCount > 0 && (
                <div className="flex items-center text-amber-600">
                  <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                  {warningCount} warnings
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            <Eye className="h-3 w-3 mr-1.5" />
            View
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <Download className="h-3 w-3 mr-1.5" />
            Download
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const GuidelineItem = ({ id, title, date, summary, category, compliance }) => {
  return (
    <Card className="mb-3">
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-sm font-medium flex items-center">
              {title}
              <Badge variant="outline" className="ml-2 text-xs font-normal">
                {category}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Published: {date} • Reference: {id}
            </CardDescription>
          </div>
          <Badge variant={compliance >= 90 ? "success" : compliance >= 70 ? "warning" : "destructive"}>
            {compliance}% Compliant
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-slate-700 dark:text-slate-300">{summary}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button variant="outline" size="sm" className="text-xs">
          <Eye className="h-3 w-3 mr-1.5" />
          View Details
        </Button>
        <Button variant="ghost" size="sm" className="text-xs">
          <ExternalLink className="h-3 w-3 mr-1.5" />
          Official Source
        </Button>
      </CardFooter>
    </Card>
  );
};

const LumenBioReportDemo = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  
  const handleGenerateReport = () => {
    toast({
      title: "Report Generated",
      description: "Comprehensive compliance report has been generated successfully.",
    });
  };
  
  const handleExport = () => {
    toast({
      title: "Report Exported",
      description: "Report has been exported to PDF format.",
    });
  };
  
  const mockGuidelineCompliance = [
    {
      guideline: "ICH E6(R2) - Good Clinical Practice",
      compliance: 92,
      details: [
        { compliant: true, text: "Proper informed consent documentation in place (Section 4.8.1)" },
        { compliant: true, text: "Adequate adverse event reporting procedures (Section 5.17)" },
        { compliant: true, text: "Complete essential document maintenance (Section 8.2)" },
        { compliant: false, text: "Minor improvements needed in protocol deviation documentation (Section 4.5.3)" }
      ]
    },
    {
      guideline: "ICH M4E(R2) - Common Technical Document",
      compliance: 86,
      details: [
        { compliant: true, text: "Properly structured clinical overview (Module 2.5)" },
        { compliant: true, text: "Comprehensive clinical summary provided (Module 2.7)" },
        { compliant: false, text: "Tabulated study data requires additional cross-referencing (Module 5.2)" },
        { compliant: false, text: "Case report forms missing standardized formatting (Module 5.3.7)" }
      ]
    },
    {
      guideline: "ICH E3 - Clinical Study Reports",
      compliance: 78,
      details: [
        { compliant: true, text: "Adequate protocol description included (Section 9)" },
        { compliant: true, text: "Proper presentation of efficacy evaluation (Section 11)" },
        { compliant: false, text: "Statistical methods section requires more detail (Section 9.7)" },
        { compliant: false, text: "Safety evaluation needs enhanced data presentation (Section 12)" },
        { compliant: false, text: "References section incomplete per guidelines (Section 16)" }
      ]
    }
  ];
  
  const mockDocuments = [
    {
      title: "Interim Clinical Study Report - LB-24-001",
      status: "In Review",
      date: "Apr 18, 2025",
      owner: "Dr. Sarah Chen",
      dueDate: "May 3, 2025",
      progress: 85,
      issueCount: 0,
      warningCount: 3
    },
    {
      title: "Protocol Amendment 2 - LB-24-001",
      status: "Completed",
      date: "Apr 10, 2025",
      owner: "Dr. Sarah Chen",
      dueDate: "Apr 15, 2025",
      progress: 100,
      issueCount: 0,
      warningCount: 0
    },
    {
      title: "Investigator's Brochure - Lumizyme",
      status: "In Progress",
      date: "Apr 5, 2025",
      owner: "Dr. James Wilson",
      dueDate: "Apr 30, 2025",
      progress: 62,
      issueCount: 2,
      warningCount: 5
    },
    {
      title: "Statistical Analysis Plan - LB-24-001",
      status: "In Progress",
      date: "Mar 28, 2025",
      owner: "Dr. Anna Lopez",
      dueDate: "Apr 28, 2025",
      progress: 40,
      issueCount: 4,
      warningCount: 2
    }
  ];
  
  const mockGuidelines = [
    {
      id: "E6(R3)",
      title: "ICH E6(R3) Good Clinical Practice",
      date: "March 15, 2025",
      summary: "Updated guidelines for conducting clinical trials with enhanced focus on risk-based approaches, data integrity, and patient safety considerations.",
      category: "Clinical",
      compliance: 76
    },
    {
      id: "M4Q(R2)",
      title: "ICH M4Q(R2) Quality Module Updates",
      date: "February 8, 2025",
      summary: "Revision to the Common Technical Document quality module with updated requirements for biologic products and advanced therapy medicinal products.",
      category: "Quality",
      compliance: 92
    },
    {
      id: "E9(R1)",
      title: "ICH E9(R1) Statistical Principles",
      date: "January 22, 2025",
      summary: "Addendum on estimands and sensitivity analysis in clinical trials, providing framework for handling missing data and treatment modifications.",
      category: "Statistics",
      compliance: 84
    },
    {
      id: "E2D(R1)",
      title: "ICH E2D(R1) Post-Approval Safety Data Management",
      date: "December 5, 2024",
      summary: "Updated guidance on post-approval safety data collection, management and reporting for marketed products with enhanced digital monitoring requirements.",
      category: "Safety",
      compliance: 68
    }
  ];

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Helmet>
        <title>Lumen Biosciences | Compliance Report</title>
      </Helmet>
      
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Lumen Biosciences - Regulatory Compliance Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">LB-24-001 Phase 2 Trial - Lumizyme for IBS Treatment</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleGenerateReport}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>
      </header>
      
      <div className="flex-1 overflow-hidden">
        <SplitPane split="vertical" defaultSizes={[300, 700]}>
          <div className="h-full p-4 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
            <div className="px-2 py-4">
              <h2 className="text-lg font-medium mb-4">Trial Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Trial ID:</span>
                  <span className="font-medium">LB-24-001</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Phase:</span>
                  <span className="font-medium">Phase 2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Status:</span>
                  <Badge variant="outline">Ongoing</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Start Date:</span>
                  <span className="font-medium">Jan 15, 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">End Date:</span>
                  <span className="font-medium">Jul 30, 2025 (Est.)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Subjects:</span>
                  <span className="font-medium">72/120 (60%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Sites:</span>
                  <span className="font-medium">8 active</span>
                </div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="px-2 py-2">
              <h2 className="text-lg font-medium mb-4">Compliance Status</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Overall Compliance</span>
                    <span className="font-medium">86%</span>
                  </div>
                  <Progress value={86} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Protocol Adherence</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Documentation</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Safety Reporting</span>
                    <span className="font-medium">94%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Data Quality</span>
                    <span className="font-medium">82%</span>
                  </div>
                  <Progress value={82} className="h-2" />
                </div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="px-2 py-2">
              <h2 className="text-lg font-medium mb-4">Key Metrics</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Protocol Deviations:</span>
                  <span className="font-medium">8 (2 major, 6 minor)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">SAEs Reported:</span>
                  <span className="font-medium">3 (all resolved)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Query Rate:</span>
                  <span className="font-medium">0.4 per subject</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Data Entry Backlog:</span>
                  <span className="font-medium">3 days (avg)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">ICH Guideline Updates:</span>
                  <span className="font-medium">4 pending review</span>
                </div>
              </div>
            </div>
            
            <div className="mt-auto pt-4">
              <Button variant="outline" className="w-full">
                <Share2 className="h-4 w-4 mr-2" />
                Share Dashboard
              </Button>
            </div>
          </div>
          
          <div className="h-full flex flex-col overflow-auto">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="border-b border-slate-200 dark:border-slate-700 px-6">
                <TabsList className="h-14">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800">
                    <FileText className="h-4 w-4 mr-2" />
                    Documents
                  </TabsTrigger>
                  <TabsTrigger value="guidelines" className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Guidelines
                  </TabsTrigger>
                  <TabsTrigger value="reports" className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800">
                    <FileBarChart className="h-4 w-4 mr-2" />
                    Reports
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="overview" className="flex-1 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <DataPoint 
                    label="Overall Compliance" 
                    value="86%" 
                    trend="+5% vs. last month" 
                    positive={true}
                    icon={<BarChart3 className="h-4 w-4 text-blue-500" />}
                  />
                  <DataPoint 
                    label="Documents Pending Review" 
                    value="7" 
                    trend="-2 from last week" 
                    positive={true}
                    icon={<FileText className="h-4 w-4 text-purple-500" />}
                  />
                  <DataPoint 
                    label="Key Findings" 
                    value="12" 
                    trend="+3 new issues" 
                    positive={false}
                    icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
                  />
                  <DataPoint 
                    label="Upcoming Deadlines" 
                    value="4" 
                    trend="Nearest: 8 days" 
                    positive={true}
                    icon={<Clock className="h-4 w-4 text-slate-500" />}
                  />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Guideline Compliance</h3>
                    <div className="space-y-4">
                      {mockGuidelineCompliance.map((item, index) => (
                        <GuidelineComplianceCard 
                          key={index}
                          guideline={item.guideline}
                          compliance={item.compliance}
                          details={item.details}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Recent Documents</h3>
                    <div className="space-y-4">
                      {mockDocuments.slice(0, 3).map((doc, index) => (
                        <DocumentStatusCard 
                          key={index}
                          title={doc.title}
                          status={doc.status}
                          date={doc.date}
                          owner={doc.owner}
                          dueDate={doc.dueDate}
                          progress={doc.progress}
                          issueCount={doc.issueCount}
                          warningCount={doc.warningCount}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="flex-1 p-6">
                <div className="mb-6 flex justify-between items-center">
                  <h3 className="text-lg font-medium">Document Tracker</h3>
                  <Button size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View All Documents
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {mockDocuments.map((doc, index) => (
                    <DocumentStatusCard 
                      key={index}
                      title={doc.title}
                      status={doc.status}
                      date={doc.date}
                      owner={doc.owner}
                      dueDate={doc.dueDate}
                      progress={doc.progress}
                      issueCount={doc.issueCount}
                      warningCount={doc.warningCount}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="guidelines" className="flex-1 p-6">
                <div className="mb-6 flex justify-between items-center">
                  <h3 className="text-lg font-medium">ICH Guideline Tracker</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Table className="h-4 w-4 mr-2" />
                      View All
                    </Button>
                    <Button size="sm">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Run Compliance Check
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                      Recently Updated Guidelines
                    </h4>
                    <div>
                      {mockGuidelines.map((guideline, index) => (
                        <GuidelineItem 
                          key={index}
                          id={guideline.id}
                          title={guideline.title}
                          date={guideline.date}
                          summary={guideline.summary}
                          category={guideline.category}
                          compliance={guideline.compliance}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="reports" className="flex-1 p-6">
                <div className="mb-6 flex justify-between items-center">
                  <h3 className="text-lg font-medium">Compliance Reports</h3>
                  <Button size="sm">
                    <FileBarChart className="h-4 w-4 mr-2" />
                    Generate New Report
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Monthly Compliance Summary</CardTitle>
                      <CardDescription>April 2025</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Generated:</span>
                          <span>April 22, 2025</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Status:</span>
                          <Badge variant="success">Approved</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Key Findings:</span>
                          <span>3 items</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs">
                          <Eye className="h-3 w-3 mr-1.5" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          <Download className="h-3 w-3 mr-1.5" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          <Printer className="h-3 w-3 mr-1.5" />
                          Print
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">ICH Compliance Audit</CardTitle>
                      <CardDescription>Q1 2025</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Generated:</span>
                          <span>March 31, 2025</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Status:</span>
                          <Badge variant="success">Completed</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Key Findings:</span>
                          <span>7 items</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs">
                          <Eye className="h-3 w-3 mr-1.5" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          <Download className="h-3 w-3 mr-1.5" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          <Printer className="h-3 w-3 mr-1.5" />
                          Print
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </div>
                
                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                  Archived Reports
                </h4>
                
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {[1, 2, 3, 4].map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-slate-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium">
                              {index === 0 ? "Monthly Compliance Report" : 
                               index === 1 ? "ICH E6(R2) Assessment" :
                               index === 2 ? "Protocol Adherence Audit" :
                               "Documentation Quality Review"}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {index === 0 ? "March 2025" : 
                               index === 1 ? "February 2025" :
                               index === 2 ? "January 2025" :
                               "December 2024"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="text-xs h-8 px-2">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-xs h-8 px-2">
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-xs h-8 px-2">
                            <Share2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SplitPane>
      </div>
    </div>
  );
};

export default LumenBioReportDemo;