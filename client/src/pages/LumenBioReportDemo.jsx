import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
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
          style={{
            '--progress-indicator-color': compliance >= 90 ? '#22c55e' : compliance >= 70 ? '#f59e0b' : '#ef4444'
          }}
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

// Trial Summary Card for Mobile
const TrialSummaryCard = () => {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">Trial Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Trial ID:</span>
            <span className="font-medium">LB-301</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Program:</span>
            <span className="font-medium">Gastroenteritis</span>
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
            <span className="text-slate-500 dark:text-slate-400">Product:</span>
            <span className="font-medium">Spirulina-based Antibody Cocktail</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Start Date:</span>
            <span className="font-medium">Jan 15, 2024</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">End Date:</span>
            <span className="font-medium">Jul 30, 2025 (Est.)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Compliance Metrics Card for Mobile
const ComplianceMetricsCard = () => {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">Compliance Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
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
      title: "Interim Clinical Study Report - LB-301 (Gastroenteritis)",
      status: "In Review",
      date: "Apr 18, 2025",
      owner: "Dr. Sarah Chen",
      dueDate: "May 3, 2025",
      progress: 85,
      issueCount: 0,
      warningCount: 3
    },
    {
      title: "Protocol Amendment 2 - LB-201 (Obesity Program)",
      status: "Completed",
      date: "Apr 10, 2025",
      owner: "Dr. Sarah Chen",
      dueDate: "Apr 15, 2025",
      progress: 100,
      issueCount: 0,
      warningCount: 0
    },
    {
      title: "Investigator's Brochure - Spirulina-based Antibody Cocktail",
      status: "In Progress",
      date: "Apr 5, 2025",
      owner: "Dr. James Wilson",
      dueDate: "Apr 30, 2025",
      progress: 62,
      issueCount: 2,
      warningCount: 5
    },
    {
      title: "Statistical Analysis Plan - LB-301 (Phase 2 Trial)",
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Helmet>
        <title>Lumen Biosciences | Compliance Report</title>
      </Helmet>
      
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white">Lumen Biosciences - Regulatory Dashboard</h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">LB-301 Phase 2 - Spirulina-based Antibody Cocktail</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="text-xs md:text-sm">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export
            </Button>
            <Button size="sm" onClick={handleGenerateReport} className="text-xs md:text-sm">
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Report
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="overview" className="flex-1">
              <BarChart3 className="h-4 w-4 mr-2 hidden md:inline" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex-1">
              <FileText className="h-4 w-4 mr-2 hidden md:inline" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="guidelines" className="flex-1">
              <CheckCircle2 className="h-4 w-4 mr-2 hidden md:inline" />
              Guidelines
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Mobile Summary Cards */}
            <div className="md:hidden">
              <TrialSummaryCard />
              <ComplianceMetricsCard />
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <DataPoint 
                label="Overall Compliance" 
                value="86%" 
                trend="+5% vs. last month" 
                positive={true}
                icon={<BarChart3 className="h-4 w-4 text-blue-500" />}
              />
              <DataPoint 
                label="Documents Pending" 
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
            
            {/* Desktop Layout */}
            <div className="hidden md:grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Trial Summary</h3>
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Trial ID:</span>
                        <span className="font-medium">LB-301</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Program:</span>
                        <span className="font-medium">Gastroenteritis</span>
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
                        <span className="text-slate-500 dark:text-slate-400">Product:</span>
                        <span className="font-medium">Spirulina-based Antibody Cocktail</span>
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
                    </div>
                  </CardContent>
                </Card>
                
                <h3 className="text-lg font-medium mb-4">Compliance Status</h3>
                <Card>
                  <CardContent className="pt-6 space-y-4">
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
                  </CardContent>
                </Card>
              </div>
              
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
            </div>
            
            {/* Mobile Guidelines */}
            <div className="md:hidden mt-6">
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
          </TabsContent>
          
          {/* Documents Tab */}
          <TabsContent value="documents">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-medium">Document Tracker</h3>
              <Button size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
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
          
          {/* Guidelines Tab */}
          <TabsContent value="guidelines">
            <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
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
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                  Recently Updated Guidelines
                </h4>
                <div className="space-y-3">
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
        </Tabs>
      </div>
    </div>
  );
};

export default LumenBioReportDemo;