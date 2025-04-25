import React, { useState } from 'react';
import { Helmet } from "../lightweight-wrappers.js";
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
    <div className="min-h-screen flex flex-col bg-white">
      <Helmet>
        <title>Lumen Biosciences | Compliance Report</title>
      </Helmet>
      
      {/* Header */}
      <header className="bg-blue-50 border-b border-blue-100 px-4 py-3">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Lumen Biosciences</h1>
            <p className="text-xs md:text-sm text-slate-700">LB-301 Phase 2 - Gastroenteritis Trial</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="text-xs md:text-sm bg-white text-slate-700 border-slate-300">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export
            </Button>
            <Button size="sm" onClick={handleGenerateReport} className="text-xs md:text-sm bg-blue-600 hover:bg-blue-700">
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Report
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto bg-gray-50">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-white border border-gray-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <BarChart3 className="h-4 w-4 mr-2 hidden sm:inline-block" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <FileText className="h-4 w-4 mr-2 hidden sm:inline-block" />
              <span>Documents</span>
            </TabsTrigger>
            <TabsTrigger value="guidelines" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <CheckCircle2 className="h-4 w-4 mr-2 hidden sm:inline-block" />
              <span>Guidelines</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Trial Summary Card */}
            <Card className="bg-white border-gray-200">
              <CardHeader className="bg-white">
                <CardTitle className="text-slate-900">Trial Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Trial ID:</span>
                  <span className="font-medium text-slate-900">LB-301</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Product:</span>
                  <span className="font-medium text-slate-900">Spirulina-based Antibody Cocktail</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Phase:</span>
                  <span className="font-medium text-slate-900">Phase 2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Status:</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Ongoing</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Subjects:</span>
                  <span className="font-medium text-slate-900">72/120 (60%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Sites:</span>
                  <span className="font-medium text-slate-900">8 active</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Compliance Card */}
            <Card className="bg-white border-gray-200">
              <CardHeader className="bg-white">
                <CardTitle className="text-slate-900">Compliance Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-slate-700">Overall Compliance</span>
                    <span className="font-medium text-slate-900">86%</span>
                  </div>
                  <Progress value={86} className="h-2 bg-gray-200" style={{ "--progress-indicator-color": "#3b82f6" }} />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-slate-700">Protocol Adherence</span>
                    <span className="font-medium text-slate-900">92%</span>
                  </div>
                  <Progress value={92} className="h-2 bg-gray-200" style={{ "--progress-indicator-color": "#22c55e" }} />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-slate-700">Documentation</span>
                    <span className="font-medium text-slate-900">78%</span>
                  </div>
                  <Progress value={78} className="h-2 bg-gray-200" style={{ "--progress-indicator-color": "#f59e0b" }} />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-slate-700">Safety Reporting</span>
                    <span className="font-medium text-slate-900">94%</span>
                  </div>
                  <Progress value={94} className="h-2 bg-gray-200" style={{ "--progress-indicator-color": "#22c55e" }} />
                </div>
              </CardContent>
            </Card>
            
            {/* Guideline Compliance */}
            <Card className="bg-white border-gray-200">
              <CardHeader className="bg-white">
                <CardTitle className="text-slate-900">Guideline Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium text-slate-900">ICH E6(R2) - Good Clinical Practice</h3>
                    <Badge className="bg-green-50 text-green-700 border-green-200">92% Compliant</Badge>
                  </div>
                  <Progress value={92} className="h-2 mb-3 bg-gray-200" style={{ "--progress-indicator-color": "#22c55e" }} />
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-slate-900">Proper informed consent documentation in place</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <span className="text-amber-700">Minor protocol deviation documentation improvements needed</span>
                    </li>
                  </ul>
                </div>
                
                <Separator className="bg-gray-200" />
                
                <div>
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium text-slate-900">ICH M4E(R2) - Common Technical Document</h3>
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200">86% Compliant</Badge>
                  </div>
                  <Progress value={86} className="h-2 mb-3 bg-gray-200" style={{ "--progress-indicator-color": "#f59e0b" }} />
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-slate-900">Properly structured clinical overview</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <span className="text-amber-700">Case report forms missing standardized formatting</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="bg-white">
                <Button variant="outline" size="sm" className="w-full bg-white text-blue-600 border-blue-200 hover:bg-blue-50">
                  <Eye className="h-4 w-4 mr-2" />
                  View Full Compliance Report
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card className="bg-white border-gray-200">
              <CardHeader className="bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-medium text-slate-900">Interim Clinical Study Report - LB-301</CardTitle>
                    <CardDescription className="text-xs text-slate-600">
                      Last updated: Apr 18, 2025 • Owner: Dr. Sarah Chen
                    </CardDescription>
                  </div>
                  <Badge className="bg-amber-50 text-amber-700 border-amber-200">In Review</Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Progress</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-1.5 bg-gray-200" style={{ "--progress-indicator-color": "#3b82f6" }} />
                  
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center">
                      <Clock className="h-3.5 w-3.5 text-amber-500 mr-1.5" />
                      <span className="text-slate-700">Due: May 3, 2025</span>
                    </div>
                    <div className="flex items-center text-amber-600">
                      <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                      3 warnings
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 bg-white">
                <Button variant="outline" size="sm" className="text-xs w-full bg-white text-blue-600 border-blue-200 hover:bg-blue-50">
                  <Eye className="h-3 w-3 mr-1.5" />
                  View Document
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-white border-gray-200">
              <CardHeader className="bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-medium text-slate-900">Investigator's Brochure - Spirulina-based Antibody Cocktail</CardTitle>
                    <CardDescription className="text-xs text-slate-600">
                      Last updated: Apr 5, 2025 • Owner: Dr. James Wilson
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Progress</span>
                    <span>62%</span>
                  </div>
                  <Progress value={62} className="h-1.5 bg-gray-200" style={{ "--progress-indicator-color": "#3b82f6" }} />
                  
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center">
                      <Clock className="h-3.5 w-3.5 text-amber-500 mr-1.5" />
                      <span className="text-slate-700">Due: Apr 30, 2025</span>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex items-center text-red-600">
                        <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                        <span className="text-red-600">2 issues</span>
                      </div>
                      <div className="flex items-center text-amber-600">
                        <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                        <span className="text-amber-600">5 warnings</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 bg-white">
                <Button variant="outline" size="sm" className="text-xs w-full bg-white text-blue-600 border-blue-200 hover:bg-blue-50">
                  <Eye className="h-3 w-3 mr-1.5" />
                  View Document
                </Button>
              </CardFooter>
            </Card>
            
            <Button variant="outline" size="sm" className="w-full mt-2 bg-white text-blue-600 border-blue-200 hover:bg-blue-50">
              <FileText className="h-4 w-4 mr-2" />
              View All Documents
            </Button>
          </TabsContent>
          
          {/* Guidelines Tab */}
          <TabsContent value="guidelines" className="space-y-4">
            <Card className="bg-white border-gray-200">
              <CardHeader className="bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-sm font-medium flex items-center text-slate-900">
                      ICH E6(R3) Good Clinical Practice
                      <Badge variant="outline" className="ml-2 text-xs font-normal bg-blue-50 text-blue-700 border-blue-200">
                        Clinical
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-600">
                      Published: March 15, 2025 • Reference: E6(R3)
                    </CardDescription>
                  </div>
                  <Badge className="bg-amber-50 text-amber-700 border-amber-200">76% Compliant</Badge>
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-sm text-slate-700">
                  Updated guidelines for conducting clinical trials with enhanced focus on risk-based approaches, data integrity, and patient safety considerations.
                </p>
              </CardContent>
              <CardFooter className="pt-0 bg-white">
                <Button variant="outline" size="sm" className="text-xs bg-white text-blue-600 border-blue-200 hover:bg-blue-50">
                  <Eye className="h-3 w-3 mr-1.5" />
                  View Details
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-white border-gray-200">
              <CardHeader className="bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-sm font-medium flex items-center text-slate-900">
                      ICH M4Q(R2) Quality Module Updates
                      <Badge variant="outline" className="ml-2 text-xs font-normal bg-blue-50 text-blue-700 border-blue-200">
                        Quality
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-600">
                      Published: February 8, 2025 • Reference: M4Q(R2)
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-50 text-green-700 border-green-200">92% Compliant</Badge>
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-sm text-slate-700">
                  Revision to the Common Technical Document quality module with updated requirements for biologic products and advanced therapy medicinal products.
                </p>
              </CardContent>
              <CardFooter className="pt-0 bg-white">
                <Button variant="outline" size="sm" className="text-xs bg-white text-blue-600 border-blue-200 hover:bg-blue-50">
                  <Eye className="h-3 w-3 mr-1.5" />
                  View Details
                </Button>
              </CardFooter>
            </Card>
            
            <Button variant="outline" size="sm" className="w-full mt-2 bg-white text-blue-600 border-blue-200 hover:bg-blue-50">
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