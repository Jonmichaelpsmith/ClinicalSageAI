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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

import { 
  FileText, 
  Download, 
  BarChart3, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  Share2,
  Check,
  FileBarChart
} from 'lucide-react';

const LumenBioReportDemo = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const handleGenerateReport = () => {
    toast({
      title: "Report Generated",
      description: "Comprehensive compliance report has been generated successfully."
    });
  };

  const handleExport = () => {
    toast({
      title: "Report Exported",
      description: "Report has been exported to PDF format."
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Helmet>
        <title>Lumen Biosciences | Compliance Report</title>
      </Helmet>
      
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white">Lumen Biosciences</h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">LB-301 Phase 2 - Gastroenteritis Trial</p>
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
      <div className="flex-1 p-4 overflow-auto">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2 hidden sm:inline-block" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4 mr-2 hidden sm:inline-block" />
              <span>Documents</span>
            </TabsTrigger>
            <TabsTrigger value="guidelines">
              <CheckCircle2 className="h-4 w-4 mr-2 hidden sm:inline-block" />
              <span>Guidelines</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Trial Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Trial Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Trial ID:</span>
                  <span className="font-medium">LB-301</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Product:</span>
                  <span className="font-medium">Spirulina-based Antibody Cocktail</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Phase:</span>
                  <span className="font-medium">Phase 2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Status:</span>
                  <Badge variant="outline">Ongoing</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Subjects:</span>
                  <span className="font-medium">72/120 (60%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Sites:</span>
                  <span className="font-medium">8 active</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Compliance Card */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
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
            
            {/* Guideline Compliance */}
            <Card>
              <CardHeader>
                <CardTitle>Guideline Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium">ICH E6(R2) - Good Clinical Practice</h3>
                    <Badge variant="success">92% Compliant</Badge>
                  </div>
                  <Progress value={92} className="h-2 mb-3" />
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Proper informed consent documentation in place</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <span className="text-amber-800">Minor protocol deviation documentation improvements needed</span>
                    </li>
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium">ICH M4E(R2) - Common Technical Document</h3>
                    <Badge variant="warning">86% Compliant</Badge>
                  </div>
                  <Progress value={86} className="h-2 mb-3" />
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Properly structured clinical overview</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <span className="text-amber-800">Case report forms missing standardized formatting</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Full Compliance Report
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-medium">Interim Clinical Study Report - LB-301</CardTitle>
                    <CardDescription className="text-xs">
                      Last updated: Apr 18, 2025 • Owner: Dr. Sarah Chen
                    </CardDescription>
                  </div>
                  <Badge variant="warning">In Review</Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-1.5" />
                  
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center">
                      <Clock className="h-3.5 w-3.5 text-amber-500 mr-1.5" />
                      Due: May 3, 2025
                    </div>
                    <div className="flex items-center text-amber-600">
                      <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                      3 warnings
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="text-xs w-full">
                  <Eye className="h-3 w-3 mr-1.5" />
                  View Document
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-medium">Investigator's Brochure - Spirulina-based Antibody Cocktail</CardTitle>
                    <CardDescription className="text-xs">
                      Last updated: Apr 5, 2025 • Owner: Dr. James Wilson
                    </CardDescription>
                  </div>
                  <Badge variant="outline">In Progress</Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>62%</span>
                  </div>
                  <Progress value={62} className="h-1.5" />
                  
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center">
                      <Clock className="h-3.5 w-3.5 text-amber-500 mr-1.5" />
                      Due: Apr 30, 2025
                    </div>
                    <div className="flex gap-3">
                      <div className="flex items-center text-red-600">
                        <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                        2 issues
                      </div>
                      <div className="flex items-center text-amber-600">
                        <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                        5 warnings
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="text-xs w-full">
                  <Eye className="h-3 w-3 mr-1.5" />
                  View Document
                </Button>
              </CardFooter>
            </Card>
            
            <Button variant="outline" size="sm" className="w-full mt-2">
              <FileText className="h-4 w-4 mr-2" />
              View All Documents
            </Button>
          </TabsContent>
          
          {/* Guidelines Tab */}
          <TabsContent value="guidelines" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-sm font-medium flex items-center">
                      ICH E6(R3) Good Clinical Practice
                      <Badge variant="outline" className="ml-2 text-xs font-normal">
                        Clinical
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Published: March 15, 2025 • Reference: E6(R3)
                    </CardDescription>
                  </div>
                  <Badge variant="warning">76% Compliant</Badge>
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Updated guidelines for conducting clinical trials with enhanced focus on risk-based approaches, data integrity, and patient safety considerations.
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="text-xs">
                  <Eye className="h-3 w-3 mr-1.5" />
                  View Details
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-sm font-medium flex items-center">
                      ICH M4Q(R2) Quality Module Updates
                      <Badge variant="outline" className="ml-2 text-xs font-normal">
                        Quality
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Published: February 8, 2025 • Reference: M4Q(R2)
                    </CardDescription>
                  </div>
                  <Badge variant="success">92% Compliant</Badge>
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Revision to the Common Technical Document quality module with updated requirements for biologic products and advanced therapy medicinal products.
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="text-xs">
                  <Eye className="h-3 w-3 mr-1.5" />
                  View Details
                </Button>
              </CardFooter>
            </Card>
            
            <Button variant="outline" size="sm" className="w-full mt-2">
              <FileBarChart className="h-4 w-4 mr-2" />
              Run Compliance Check
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LumenBioReportDemo;