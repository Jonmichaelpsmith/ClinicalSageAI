import React, { useState, useEffect } from 'react';
import { 
  BarChart3, FileText, Download, Calendar, Users, 
  CheckCircle, AlertTriangle, FileBarChart2, FileCheck
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

/**
 * CerComprehensiveReportsPanel Component
 * 
 * This component provides a comprehensive reporting interface for the CER module,
 * displaying various metrics, compliance scores, and generating PDF reports.
 */
const CerComprehensiveReportsPanel = () => {
  const [activeReportType, setActiveReportType] = useState('compliance');
  const [reportTimeframe, setReportTimeframe] = useState('last30days');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportData, setReportData] = useState({
    compliance: {
      overall: 85,
      bySection: [
        { section: 'Device Description', score: 92, status: 'compliant' },
        { section: 'Clinical Evaluation Strategy', score: 78, status: 'minor-issues' },
        { section: 'Literature Review', score: 88, status: 'compliant' },
        { section: 'Risk Assessment', score: 90, status: 'compliant' },
        { section: 'Clinical Data Analysis', score: 75, status: 'minor-issues' },
        { section: 'Post-Market Surveillance', score: 95, status: 'compliant' },
      ]
    },
    activity: {
      totalEdits: 127,
      lastActivityDate: '2025-05-07',
      userActivity: [
        { user: 'John Doe', edits: 45, sections: ['Device Description', 'Literature Review'] },
        { user: 'Jane Smith', edits: 38, sections: ['Risk Assessment', 'Post-Market Surveillance'] },
        { user: 'Robert Johnson', edits: 44, sections: ['Clinical Data Analysis', 'Clinical Evaluation Strategy'] }
      ]
    },
    quality: {
      ctqFactorsCompleted: 18,
      ctqFactorsTotal: 22,
      riskBreakdown: {
        high: { completed: 8, total: 8 },
        medium: { completed: 6, total: 8 },
        low: { completed: 4, total: 6 }
      }
    }
  });

  // Simulated API call to fetch report data
  useEffect(() => {
    // This would be replaced with an actual API call
    console.log(`Fetching ${activeReportType} report data for ${reportTimeframe}`);
    // setReportData(fetchedData) would happen here in a real implementation
  }, [activeReportType, reportTimeframe]);

  const generatePDFReport = async () => {
    setIsGeneratingReport(true);
    
    try {
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Report Generated Successfully",
        description: `Your ${getReportTypeName(activeReportType)} report has been generated and is ready for download.`,
        variant: "success",
      });
      
      // In a real implementation, this would trigger a file download
    } catch (error) {
      toast({
        title: "Report Generation Failed",
        description: error.message || "There was an error generating your report.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const getReportTypeName = (reportType) => {
    const reportTypes = {
      compliance: "Compliance",
      activity: "Activity",
      quality: "Quality Management"
    };
    return reportTypes[reportType] || reportType;
  };

  const getTimeframeName = (timeframe) => {
    const timeframes = {
      last7days: "Last 7 Days",
      last30days: "Last 30 Days",
      last90days: "Last 90 Days",
      allTime: "All Time"
    };
    return timeframes[timeframe] || timeframe;
  };

  const renderComplianceReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Overall Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-4">
              <div className="relative h-24 w-24">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle
                    className="text-gray-200"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-blue-600"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - reportData.compliance.overall / 100)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{reportData.compliance.overall}%</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            {reportData.compliance.overall >= 80 ? (
              <div className="w-full flex items-center text-sm text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>Meets regulatory threshold</span>
              </div>
            ) : (
              <div className="w-full flex items-center text-sm text-amber-600">
                <AlertTriangle className="h-4 w-4 mr-1" />
                <span>Below regulatory threshold</span>
              </div>
            )}
          </CardFooter>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Compliance by Section</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reportData.compliance.bySection.map((section, index) => (
                <div key={index} className="flex flex-col">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{section.section}</span>
                    <span className="font-medium">{section.score}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        section.status === 'compliant' 
                          ? 'bg-green-500' 
                          : section.status === 'minor-issues' 
                            ? 'bg-amber-500' 
                            : 'bg-red-500'
                      }`} 
                      style={{ width: `${section.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Regulatory Frameworks Compliance</CardTitle>
          <CardDescription>Analysis of CER compliance with major regulatory frameworks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">EU MDR 2017/745</h3>
                <span className="text-green-600 bg-green-100 px-2 py-0.5 rounded text-xs">Compliant</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Overall Score:</span>
                <span className="font-medium">92%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Requirements Met:</span>
                <span className="font-medium">54/58</span>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">FDA CFR 21</h3>
                <span className="text-amber-600 bg-amber-100 px-2 py-0.5 rounded text-xs">Needs Review</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Overall Score:</span>
                <span className="font-medium">78%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Requirements Met:</span>
                <span className="font-medium">42/54</span>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">ISO 14155:2020</h3>
                <span className="text-green-600 bg-green-100 px-2 py-0.5 rounded text-xs">Compliant</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Overall Score:</span>
                <span className="font-medium">89%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Requirements Met:</span>
                <span className="font-medium">32/36</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderActivityReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Edits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-4">
              <span className="text-4xl font-bold">{reportData.activity.totalEdits}</span>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <div className="w-full flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Last activity: {reportData.activity.lastActivityDate}</span>
            </div>
          </CardFooter>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">User Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.activity.userActivity.map((user, index) => (
                <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{user.user}</span>
                    <span>{user.edits} edits</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Sections: {user.sections.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderQualityReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">CtQ Factors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-4">
              <div className="relative h-24 w-24">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle
                    className="text-gray-200"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-green-600"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - reportData.quality.ctqFactorsCompleted / reportData.quality.ctqFactorsTotal)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{reportData.quality.ctqFactorsCompleted}/{reportData.quality.ctqFactorsTotal}</div>
                    <div className="text-xs">completed</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <div className="w-full flex items-center text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>
                {Math.round((reportData.quality.ctqFactorsCompleted / reportData.quality.ctqFactorsTotal) * 100)}% completion rate
              </span>
            </div>
          </CardFooter>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">CtQ Completion by Risk Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-red-600">High Risk</span>
                  <span>
                    {reportData.quality.riskBreakdown.high.completed}/{reportData.quality.riskBreakdown.high.total} completed
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full" 
                    style={{ width: `${(reportData.quality.riskBreakdown.high.completed / reportData.quality.riskBreakdown.high.total) * 100}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-amber-600">Medium Risk</span>
                  <span>
                    {reportData.quality.riskBreakdown.medium.completed}/{reportData.quality.riskBreakdown.medium.total} completed
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full" 
                    style={{ width: `${(reportData.quality.riskBreakdown.medium.completed / reportData.quality.riskBreakdown.medium.total) * 100}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-green-600">Low Risk</span>
                  <span>
                    {reportData.quality.riskBreakdown.low.completed}/{reportData.quality.riskBreakdown.low.total} completed
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full" 
                    style={{ width: `${(reportData.quality.riskBreakdown.low.completed / reportData.quality.riskBreakdown.low.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Render the active report based on selection
  const renderActiveReport = () => {
    switch (activeReportType) {
      case 'compliance':
        return renderComplianceReport();
      case 'activity':
        return renderActivityReport();
      case 'quality':
        return renderQualityReport();
      default:
        return <div>Select a report type to view</div>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="p-4 bg-white rounded-lg border">
        <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Comprehensive Reports</h2>
            <p className="text-gray-500">
              Generate detailed reports to monitor compliance, activity, and quality metrics
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              onClick={generatePDFReport}
              disabled={isGeneratingReport}
              className="flex items-center space-x-1"
            >
              <FileText className="h-4 w-4" />
              <span>Generate PDF Report</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={generatePDFReport}
              disabled={isGeneratingReport}
              className="flex items-center space-x-1"
            >
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
          <Tabs 
            defaultValue="compliance" 
            value={activeReportType}
            onValueChange={setActiveReportType}
            className="w-full md:w-auto"
          >
            <TabsList>
              <TabsTrigger value="compliance" className="flex items-center">
                <FileCheck className="h-4 w-4 mr-1" />
                Compliance
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="quality" className="flex items-center">
                <FileBarChart2 className="h-4 w-4 mr-1" />
                Quality
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="w-full md:w-48">
            <Select value={reportTimeframe} onValueChange={setReportTimeframe}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7days">Last 7 Days</SelectItem>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
                <SelectItem value="last90days">Last 90 Days</SelectItem>
                <SelectItem value="allTime">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {renderActiveReport()}
      </div>
    </div>
  );
};

export default CerComprehensiveReportsPanel;