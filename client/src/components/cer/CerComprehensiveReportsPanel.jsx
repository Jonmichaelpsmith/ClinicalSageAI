import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import axios from 'axios';
import { 
  BarChart3, 
  FileText, 
  History, 
  Network, 
  Layers,
  Download,
  ClipboardCheck,
  AlertCircle,
  FileBarChart2,
  Users,
  CheckCircle2,
  ListChecks,
  ShieldAlert,
  GanttChart,
  FileCog,
  ArrowDownToLine,
  Printer,
  FileQuestion,
  BookOpen,
  FileSearch,
  Gauge
} from 'lucide-react';

import QmpAuditTrailPanel from './QmpAuditTrailPanel';
import QmpTraceabilityHeatmap from './QmpTraceabilityHeatmap';

/**
 * CER Comprehensive Reports Panel
 * 
 * A central reporting hub providing comprehensive insights and export capabilities 
 * for all aspects of the Clinical Evaluation Report process.
 */
const CerComprehensiveReportsPanel = ({ 
  cerData,
  deviceName,
  manufacturer,
  // QMP Data
  qmpData,
  objectives,
  ctqFactors,
  complianceMetrics,
  // Literature Review Data
  literatureData,
  // Clinical Data
  clinicalData,
  // Regulatory Data
  regulatoryData,
  // Validation data
  validationResults,
  // Risk analysis data
  riskAnalysisData
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('compliance-dashboard');
  const [exportStatus, setExportStatus] = useState({
    inProgress: false,
    type: null,
    progress: 0
  });
  
  // Dashboard metrics calculation
  const dashboardMetrics = useMemo(() => {
    // Calculate overall statistics and metrics
    const overallCompletionScore = Math.round(
      (complianceMetrics?.overallScore || 0)
    );
    
    const literatureReviewStatus = literatureData?.reviewStatus || 'pending';
    const literatureReviewCompletion = literatureData?.completionPercentage || 0;
    
    const riskAnalysisCompletion = riskAnalysisData?.completionPercentage || 0;
    
    const validationIssuesCount = validationResults?.issues?.length || 0;
    const criticalValidationIssues = validationResults?.issues?.filter(i => i.severity === 'critical')?.length || 0;
    
    const regulatoryComplianceScore = regulatoryData?.complianceScore || 0;
    
    return {
      overallCompletionScore,
      literatureReviewStatus,
      literatureReviewCompletion,
      riskAnalysisCompletion,
      validationIssuesCount,
      criticalValidationIssues,
      regulatoryComplianceScore
    };
  }, [complianceMetrics, literatureData, riskAnalysisData, validationResults, regulatoryData]);
  
  // Export all reports combined as a single PDF
  const exportComprehensiveReport = async () => {
    setExportStatus({
      inProgress: true,
      type: 'comprehensive',
      progress: 10
    });
    
    try {
      toast({
        title: "Starting report generation",
        description: "Compiling data from all CER modules...",
      });
      
      // Simulate progress for UI feedback
      const progressInterval = setInterval(() => {
        setExportStatus(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 5, 90)
        }));
      }, 500);
      
      // Request the comprehensive report PDF from the server
      const response = await axios.get('/api/cer/export-comprehensive-report', {
        responseType: 'blob',
        params: {
          deviceName,
          manufacturer,
          includeSections: 'all'
        }
      });
      
      clearInterval(progressInterval);
      setExportStatus(prev => ({
        ...prev,
        progress: 100
      }));
      
      // Create download link for the PDF
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${deviceName.replace(/[^a-z0-9]/gi, '_')}_CER_Comprehensive_Report.pdf`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Comprehensive report exported",
        description: "The PDF has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Error exporting comprehensive report:', error);
      toast({
        title: "Export failed",
        description: "Failed to generate the comprehensive report. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Reset status after a delay to show 100% completion
      setTimeout(() => {
        setExportStatus({
          inProgress: false,
          type: null,
          progress: 0
        });
      }, 1000);
    }
  };
  
  // Export report for a specific section
  const exportSectionReport = async (section) => {
    setExportStatus({
      inProgress: true,
      type: section,
      progress: 10
    });
    
    try {
      toast({
        title: `Starting ${section} report generation`,
        description: "Compiling section data...",
      });
      
      // Simulate progress for UI feedback
      const progressInterval = setInterval(() => {
        setExportStatus(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 8, 90)
        }));
      }, 300);
      
      // Request the section report PDF from the server
      const response = await axios.get(`/api/cer/export-section-report/${section}`, {
        responseType: 'blob',
        params: {
          deviceName,
          manufacturer
        }
      });
      
      clearInterval(progressInterval);
      setExportStatus(prev => ({
        ...prev,
        progress: 100
      }));
      
      // Format the section name for the filename
      const formattedSection = section
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      
      // Create download link for the PDF
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${deviceName.replace(/[^a-z0-9]/gi, '_')}_CER_${formattedSection}_Report.pdf`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: `${formattedSection} report exported`,
        description: "The PDF has been downloaded successfully.",
      });
    } catch (error) {
      console.error(`Error exporting ${section} report:`, error);
      toast({
        title: "Export failed",
        description: `Failed to generate the ${section} report. Please try again.`,
        variant: "destructive",
      });
    } finally {
      // Reset status after a delay to show 100% completion
      setTimeout(() => {
        setExportStatus({
          inProgress: false,
          type: null,
          progress: 0
        });
      }, 1000);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FileBarChart2 className="mr-2 h-6 w-6 text-blue-600" />
            CER Comprehensive Reports
          </h2>
          <p className="text-gray-600 mt-1">
            Generate detailed reports across all Clinical Evaluation Report modules
          </p>
        </div>
        
        <Button 
          onClick={exportComprehensiveReport}
          disabled={exportStatus.inProgress}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {exportStatus.inProgress && exportStatus.type === 'comprehensive' ? (
            <>
              <Printer className="mr-2 h-4 w-4 animate-pulse" />
              Generating Report...
            </>
          ) : (
            <>
              <ArrowDownToLine className="mr-2 h-4 w-4" />
              Export Full CER Report
            </>
          )}
        </Button>
      </div>
      
      {exportStatus.inProgress && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              Generating {exportStatus.type === 'comprehensive' ? 'comprehensive report' : `${exportStatus.type} report`}...
            </span>
            <span className="text-sm text-gray-500">{exportStatus.progress}%</span>
          </div>
          <Progress value={exportStatus.progress} className="h-2" />
        </div>
      )}
      
      <Tabs 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="border-b mb-6">
          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <TabsList className="inline-flex justify-start bg-transparent h-auto p-0 w-auto">
              <TabsTrigger 
                value="compliance-dashboard"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none border-b-2 border-transparent px-4 py-2"
              >
                <Gauge className="h-4 w-4 mr-2" />
                <span>Compliance Dashboard</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="quality-management"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none border-b-2 border-transparent px-4 py-2"
              >
                <ShieldAlert className="h-4 w-4 mr-2" />
                <span>Quality Management</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="literature-review"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none border-b-2 border-transparent px-4 py-2"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                <span>Literature Review</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="clinical-data"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none border-b-2 border-transparent px-4 py-2"
              >
                <FileSearch className="h-4 w-4 mr-2" />
                <span>Clinical Evidence</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="risk-analysis"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none border-b-2 border-transparent px-4 py-2"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>Risk Analysis</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="validation"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none border-b-2 border-transparent px-4 py-2"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                <span>Validation Results</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="regulatory"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none border-b-2 border-transparent px-4 py-2"
              >
                <FileCog className="h-4 w-4 mr-2" />
                <span>Regulatory Traceability</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="approvals"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none border-b-2 border-transparent px-4 py-2"
              >
                <Users className="h-4 w-4 mr-2" />
                <span>Approval Status</span>
              </TabsTrigger>
            </TabsList>
          </ScrollArea>
        </div>
        
        {/* Compliance Dashboard Tab */}
        <TabsContent value="compliance-dashboard" className="mt-0">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center text-gray-800">
                <Gauge className="h-5 w-5 mr-2 text-blue-600" />
                CER Compliance Dashboard
              </h3>
              <p className="text-sm text-gray-600">
                Overview of compliance metrics across all CER modules
              </p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportSectionReport('compliance-dashboard')}
              disabled={exportStatus.inProgress}
            >
              {exportStatus.inProgress && exportStatus.type === 'compliance-dashboard' ? (
                <Printer className="h-4 w-4 mr-1.5 animate-pulse" />
              ) : (
                <Download className="h-4 w-4 mr-1.5" />
              )}
              Export Report
            </Button>
          </div>
          
          {/* Main metrics cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Overall Compliance</p>
                    <h4 className="text-2xl font-bold mt-1">{dashboardMetrics.overallCompletionScore}%</h4>
                  </div>
                  <div className={`p-2 rounded-full ${
                    dashboardMetrics.overallCompletionScore >= 80 ? 'bg-green-100' :
                    dashboardMetrics.overallCompletionScore >= 50 ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    <Gauge className={`h-5 w-5 ${
                      dashboardMetrics.overallCompletionScore >= 80 ? 'text-green-600' :
                      dashboardMetrics.overallCompletionScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`} />
                  </div>
                </div>
                <Progress 
                  value={dashboardMetrics.overallCompletionScore} 
                  className="h-1.5 mt-2"
                  indicatorClassName={
                    dashboardMetrics.overallCompletionScore >= 80 ? 'bg-green-600' :
                    dashboardMetrics.overallCompletionScore >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                  }
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Validation Status</p>
                    <h4 className="text-2xl font-bold mt-1">
                      {dashboardMetrics.criticalValidationIssues > 0 ? (
                        <span className="text-red-600">{dashboardMetrics.validationIssuesCount} Issues</span>
                      ) : dashboardMetrics.validationIssuesCount > 0 ? (
                        <span className="text-yellow-600">{dashboardMetrics.validationIssuesCount} Warnings</span>
                      ) : (
                        <span className="text-green-600">Passed</span>
                      )}
                    </h4>
                  </div>
                  <div className={`p-2 rounded-full ${
                    dashboardMetrics.criticalValidationIssues > 0 ? 'bg-red-100' :
                    dashboardMetrics.validationIssuesCount > 0 ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                    {dashboardMetrics.criticalValidationIssues > 0 ? (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    ) : dashboardMetrics.validationIssuesCount > 0 ? (
                      <FileQuestion className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  <Badge className={
                    dashboardMetrics.criticalValidationIssues > 0 ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                    dashboardMetrics.validationIssuesCount > 0 ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' : 
                    'bg-green-100 text-green-700 hover:bg-green-100'
                  }>
                    {dashboardMetrics.criticalValidationIssues > 0 ? 
                      `${dashboardMetrics.criticalValidationIssues} critical issues` :
                      dashboardMetrics.validationIssuesCount > 0 ?
                      `${dashboardMetrics.validationIssuesCount} non-critical issues` :
                      'All checks passed'
                    }
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Literature Review</p>
                    <h4 className="text-2xl font-bold mt-1">{dashboardMetrics.literatureReviewCompletion}%</h4>
                  </div>
                  <div className={`p-2 rounded-full ${
                    dashboardMetrics.literatureReviewCompletion >= 90 ? 'bg-green-100' :
                    dashboardMetrics.literatureReviewCompletion >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    <BookOpen className={`h-5 w-5 ${
                      dashboardMetrics.literatureReviewCompletion >= 90 ? 'text-green-600' :
                      dashboardMetrics.literatureReviewCompletion >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`} />
                  </div>
                </div>
                <Progress 
                  value={dashboardMetrics.literatureReviewCompletion} 
                  className="h-1.5 mt-2"
                  indicatorClassName={
                    dashboardMetrics.literatureReviewCompletion >= 90 ? 'bg-green-600' :
                    dashboardMetrics.literatureReviewCompletion >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                  }
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Regulatory Compliance</p>
                    <h4 className="text-2xl font-bold mt-1">{dashboardMetrics.regulatoryComplianceScore}%</h4>
                  </div>
                  <div className={`p-2 rounded-full ${
                    dashboardMetrics.regulatoryComplianceScore >= 90 ? 'bg-green-100' :
                    dashboardMetrics.regulatoryComplianceScore >= 70 ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    <FileCog className={`h-5 w-5 ${
                      dashboardMetrics.regulatoryComplianceScore >= 90 ? 'text-green-600' :
                      dashboardMetrics.regulatoryComplianceScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                    }`} />
                  </div>
                </div>
                <Progress 
                  value={dashboardMetrics.regulatoryComplianceScore} 
                  className="h-1.5 mt-2"
                  indicatorClassName={
                    dashboardMetrics.regulatoryComplianceScore >= 90 ? 'bg-green-600' :
                    dashboardMetrics.regulatoryComplianceScore >= 70 ? 'bg-yellow-600' : 'bg-red-600'
                  }
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Section status overview */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="text-base font-semibold mb-4">CER Section Completion Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Example section statuses - these would come from actual data */}
              <div className="bg-white p-3 rounded border">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Device Description</span>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">100%</Badge>
                </div>
                <Progress value={100} className="h-1.5" indicatorClassName="bg-green-600" />
              </div>
              
              <div className="bg-white p-3 rounded border">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Literature Review</span>
                  <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">78%</Badge>
                </div>
                <Progress value={78} className="h-1.5" indicatorClassName="bg-yellow-600" />
              </div>
              
              <div className="bg-white p-3 rounded border">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Clinical Evaluation</span>
                  <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">65%</Badge>
                </div>
                <Progress value={65} className="h-1.5" indicatorClassName="bg-yellow-600" />
              </div>
              
              <div className="bg-white p-3 rounded border">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Post-Market Surveillance</span>
                  <Badge className="bg-red-100 text-red-700 hover:bg-red-100">40%</Badge>
                </div>
                <Progress value={40} className="h-1.5" indicatorClassName="bg-red-600" />
              </div>
              
              <div className="bg-white p-3 rounded border">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Risk Assessment</span>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">90%</Badge>
                </div>
                <Progress value={90} className="h-1.5" indicatorClassName="bg-green-600" />
              </div>
              
              <div className="bg-white p-3 rounded border">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Benefit-Risk Analysis</span>
                  <Badge className="bg-red-100 text-red-700 hover:bg-red-100">35%</Badge>
                </div>
                <Progress value={35} className="h-1.5" indicatorClassName="bg-red-600" />
              </div>
            </div>
          </div>
          
          {/* Critical issues summary */}
          <div className="rounded-lg border mb-6">
            <div className="p-4 border-b bg-gray-50">
              <h4 className="text-base font-semibold flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
                Critical Issues Summary
              </h4>
            </div>
            <div className="p-4">
              {dashboardMetrics.criticalValidationIssues > 0 ? (
                <div className="space-y-3">
                  <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <AlertDescription>
                      Missing required clinical data in the Post-Market Surveillance section
                    </AlertDescription>
                  </Alert>
                  
                  <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <AlertDescription>
                      Benefit-Risk Analysis lacks quantitative evidence
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="flex items-center justify-center py-6 text-gray-500">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
                  <span>No critical issues detected</span>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Quality Management Tab */}
        <TabsContent value="quality-management" className="mt-0">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center text-gray-800">
                <ShieldAlert className="h-5 w-5 mr-2 text-blue-600" />
                Quality Management Reports
              </h3>
              <p className="text-sm text-gray-600">
                Quality plan implementation status, audit trail, and traceability
              </p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportSectionReport('quality-management')}
              disabled={exportStatus.inProgress}
            >
              {exportStatus.inProgress && exportStatus.type === 'quality-management' ? (
                <Printer className="h-4 w-4 mr-1.5 animate-pulse" />
              ) : (
                <Download className="h-4 w-4 mr-1.5" />
              )}
              Export Report
            </Button>
          </div>
          
          <Tabs defaultValue="quality-traceability">
            <TabsList className="w-full grid grid-cols-2 mb-6">
              <TabsTrigger value="quality-traceability">
                <Network className="h-4 w-4 mr-2" />
                Quality Traceability
              </TabsTrigger>
              <TabsTrigger value="audit-trail">
                <History className="h-4 w-4 mr-2" />
                Audit Trail
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="quality-traceability">
              <QmpTraceabilityHeatmap 
                objectives={objectives}
                ctqFactors={ctqFactors}
                complianceMetrics={complianceMetrics}
              />
            </TabsContent>
            
            <TabsContent value="audit-trail">
              <QmpAuditTrailPanel />
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        {/* Literature Review Tab */}
        <TabsContent value="literature-review" className="mt-0">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center text-gray-800">
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                Literature Review Reports
              </h3>
              <p className="text-sm text-gray-600">
                Literature search methodology, results coverage, and summary
              </p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportSectionReport('literature-review')}
              disabled={exportStatus.inProgress}
            >
              {exportStatus.inProgress && exportStatus.type === 'literature-review' ? (
                <Printer className="h-4 w-4 mr-1.5 animate-pulse" />
              ) : (
                <Download className="h-4 w-4 mr-1.5" />
              )}
              Export Report
            </Button>
          </div>
          
          <Card className="mb-6">
            <CardContent className="p-6">
              <h4 className="text-lg font-medium mb-4">Literature Search Methodology</h4>
              <p className="text-sm text-gray-700 mb-4">
                A systematic literature search was conducted according to the requirements of MEDDEV 
                2.7/1 Rev 4 and sections 9 and 10 of the MDR to identify all relevant publications 
                related to the device.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h5 className="font-medium mb-2 text-blue-700">Databases Searched</h5>
                  <ul className="list-disc pl-5 text-sm">
                    <li>PubMed / MEDLINE</li>
                    <li>Embase</li>
                    <li>Cochrane Library</li>
                    <li>Web of Science</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h5 className="font-medium mb-2 text-blue-700">Search Terms</h5>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Device specific terms</li>
                    <li>Type of device terms</li>
                    <li>Clinical application terms</li>
                    <li>Outcome measurement terms</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h5 className="font-medium mb-2 text-blue-700">Inclusion Criteria</h5>
                  <ul className="list-disc pl-5 text-sm">
                    <li>English language studies</li>
                    <li>Human studies</li>
                    <li>Published 2015 - 2025</li>
                    <li>Clinical investigations</li>
                  </ul>
                </div>
              </div>
              
              <h4 className="text-lg font-medium mb-4">Search Results Summary</h4>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Literature Search Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-600">Total records identified:</div>
                          <div className="font-medium">428</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-600">After duplicate removal:</div>
                          <div className="font-medium">315</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-600">Title/abstract screening:</div>
                          <div className="font-medium">87</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-600">Full-text assessment:</div>
                          <div className="font-medium">42</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-600">Included in analysis:</div>
                          <div className="font-medium">24</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex-1">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Evidence Type Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-600">Randomized controlled trials:</div>
                          <div className="font-medium">7</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-600">Prospective cohort studies:</div>
                          <div className="font-medium">9</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-600">Retrospective analyses:</div>
                          <div className="font-medium">5</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-600">Case series/reports:</div>
                          <div className="font-medium">3</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-600">Meta-analyses:</div>
                          <div className="font-medium">0</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Add additional tabs for other sections */}
        
        {/* Risk Analysis Tab */}
        <TabsContent value="risk-analysis" className="mt-0">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center text-gray-800">
                <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
                Risk Analysis Reports
              </h3>
              <p className="text-sm text-gray-600">
                Risk assessment, mitigation strategies, and benefit-risk determination
              </p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportSectionReport('risk-analysis')}
              disabled={exportStatus.inProgress}
            >
              {exportStatus.inProgress && exportStatus.type === 'risk-analysis' ? (
                <Printer className="h-4 w-4 mr-1.5 animate-pulse" />
              ) : (
                <Download className="h-4 w-4 mr-1.5" />
              )}
              Export Report
            </Button>
          </div>
          
          <div className="p-6 rounded-md bg-gray-50 mb-6">
            <p className="text-yellow-700 font-medium flex items-center mb-4">
              <AlertCircle className="h-5 w-5 mr-2" />
              Risk analysis data would be displayed here based on actual CER data
            </p>
            
            <p className="text-sm text-gray-600">
              This section would include a comprehensive risk analysis report covering:
            </p>
            
            <ul className="list-disc pl-5 text-sm mt-2 space-y-1 text-gray-600">
              <li>Identified hazards and potential harms</li>
              <li>Risk assessment methodology</li>
              <li>Risk mitigation strategies</li>
              <li>Residual risk evaluation</li>
              <li>Benefit-risk determination</li>
              <li>Risk management plan implementation status</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CerComprehensiveReportsPanel;