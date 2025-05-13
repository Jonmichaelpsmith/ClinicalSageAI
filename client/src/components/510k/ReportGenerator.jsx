import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Download, 
  FileText, 
  FilePlus, 
  Check, 
  Loader2, 
  ChevronDown, 
  ChevronUp,
  BookOpen,
  Clipboard,
  FileCheck,
  File,
  FileCog,
  Printer,
  GitCompare,
  Lightbulb,
  FileCode
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

/**
 * Comprehensive 510(k) submission report generator component
 */
const ReportGenerator = ({
  deviceProfile = {},
  predicates = [],
  literatureReferences = [],
  insightData = [],
  complianceStatus = {},
  onGenerateReport = () => {},
  recentReports = []
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSections, setSelectedSections] = useState({
    deviceSummary: true,
    predicateDevices: true,
    literatureReview: true,
    complianceStatus: true,
    aiInsights: true,
    recommendations: true
  });
  const [reportType, setReportType] = useState('pdf');
  const [showOptions, setShowOptions] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState({
    includeAppendices: true,
    includeMetadata: true,
    detailedCompliance: false,
    includeScreenshots: true,
    generateExecutiveSummary: true
  });
  
  // Handle report generation
  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      
      // Create report options from selected settings
      const reportOptions = {
        sections: selectedSections,
        type: reportType,
        advancedOptions: advancedOptions,
        deviceProfile: deviceProfile,
        predicates: predicates,
        literatureReferences: literatureReferences,
        insightData: insightData,
        complianceStatus: complianceStatus
      };
      
      // Call the provided handler
      await onGenerateReport(reportOptions);
      
      // Reset UI state
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating report:', error);
      setIsGenerating(false);
    }
  };
  
  // Toggle section selection
  const toggleSection = (section) => {
    setSelectedSections({
      ...selectedSections,
      [section]: !selectedSections[section]
    });
  };
  
  // Toggle advanced option
  const toggleAdvancedOption = (option) => {
    setAdvancedOptions({
      ...advancedOptions,
      [option]: !advancedOptions[option]
    });
  };
  
  // Format a date for display
  const formatDate = (date) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get file icon based on file type
  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'docx':
        return <FileCheck className="h-4 w-4" />;
      case 'html':
        return <File className="h-4 w-4" />;
      case 'json':
        return <FileCog className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };
  
  return (
    <Card className="bg-white">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-4 border-b">
        <CardTitle className="text-blue-700 flex items-center">
          <FileText className="mr-2 h-5 w-5 text-blue-600" />
          510(k) Submission Report Generator
        </CardTitle>
        <CardDescription>
          Generate comprehensive reports for your 510(k) submission
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Include Report Sections</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="deviceSummary" 
                checked={selectedSections.deviceSummary}
                onCheckedChange={() => toggleSection('deviceSummary')}
              />
              <div className="grid gap-1.5 leading-none">
                <Label 
                  htmlFor="deviceSummary" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                >
                  <Clipboard className="h-4 w-4 mr-1 text-blue-600" />
                  Device Profile Summary
                </Label>
                <p className="text-xs text-gray-500">
                  Essential information about your device
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="predicateDevices" 
                checked={selectedSections.predicateDevices}
                onCheckedChange={() => toggleSection('predicateDevices')}
              />
              <div className="grid gap-1.5 leading-none">
                <Label 
                  htmlFor="predicateDevices" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                >
                  <GitCompare className="h-4 w-4 mr-1 text-indigo-600" />
                  Predicate Device Analysis
                </Label>
                <p className="text-xs text-gray-500">
                  Comparison with selected predicate devices
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="literatureReview" 
                checked={selectedSections.literatureReview}
                onCheckedChange={() => toggleSection('literatureReview')}
              />
              <div className="grid gap-1.5 leading-none">
                <Label 
                  htmlFor="literatureReview" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                >
                  <BookOpen className="h-4 w-4 mr-1 text-purple-600" />
                  Literature Review
                </Label>
                <p className="text-xs text-gray-500">
                  Scientific literature supporting your submission
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="complianceStatus" 
                checked={selectedSections.complianceStatus}
                onCheckedChange={() => toggleSection('complianceStatus')}
              />
              <div className="grid gap-1.5 leading-none">
                <Label 
                  htmlFor="complianceStatus" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                >
                  <Check className="h-4 w-4 mr-1 text-green-600" />
                  Compliance Status
                </Label>
                <p className="text-xs text-gray-500">
                  Regulatory compliance assessment results
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="aiInsights" 
                checked={selectedSections.aiInsights}
                onCheckedChange={() => toggleSection('aiInsights')}
              />
              <div className="grid gap-1.5 leading-none">
                <Label 
                  htmlFor="aiInsights" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                >
                  <Lightbulb className="h-4 w-4 mr-1 text-amber-600" />
                  AI-Generated Insights
                </Label>
                <p className="text-xs text-gray-500">
                  Intelligence-driven analysis and observations
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="recommendations" 
                checked={selectedSections.recommendations}
                onCheckedChange={() => toggleSection('recommendations')}
              />
              <div className="grid gap-1.5 leading-none">
                <Label 
                  htmlFor="recommendations" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                >
                  <FileText className="h-4 w-4 mr-1 text-teal-600" />
                  Recommendations & Next Steps
                </Label>
                <p className="text-xs text-gray-500">
                  Suggested actions and improvements
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700">Report Format</h3>
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                variant={reportType === 'pdf' ? 'default' : 'outline'}
                size="sm"
                className={reportType === 'pdf' ? 'bg-blue-600' : 'border-gray-200'}
                onClick={() => setReportType('pdf')}
              >
                <FileText className="h-4 w-4 mr-1" />
                PDF
              </Button>
              
              <Button
                type="button"
                variant={reportType === 'docx' ? 'default' : 'outline'}
                size="sm"
                className={reportType === 'docx' ? 'bg-blue-600' : 'border-gray-200'}
                onClick={() => setReportType('docx')}
              >
                <FilePlus className="h-4 w-4 mr-1" />
                DOCX
              </Button>
              
              <Button
                type="button"
                variant={reportType === 'html' ? 'default' : 'outline'}
                size="sm"
                className={reportType === 'html' ? 'bg-blue-600' : 'border-gray-200'}
                onClick={() => setReportType('html')}
              >
                <FileCode className="h-4 w-4 mr-1" />
                HTML
              </Button>
            </div>
          </div>
          
          <Collapsible
            open={showOptions}
            onOpenChange={setShowOptions}
            className="border rounded-md overflow-hidden"
          >
            <CollapsibleTrigger className="flex w-full justify-between items-center p-3 text-sm text-left bg-gray-50 hover:bg-gray-100 focus:outline-none">
              <span className="font-medium text-gray-700">Advanced Options</span>
              {showOptions ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="includeAppendices" 
                    checked={advancedOptions.includeAppendices}
                    onCheckedChange={() => toggleAdvancedOption('includeAppendices')}
                  />
                  <Label 
                    htmlFor="includeAppendices" 
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Include detailed appendices
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="includeMetadata" 
                    checked={advancedOptions.includeMetadata}
                    onCheckedChange={() => toggleAdvancedOption('includeMetadata')}
                  />
                  <Label 
                    htmlFor="includeMetadata" 
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Include metadata and timestamps
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="detailedCompliance" 
                    checked={advancedOptions.detailedCompliance}
                    onCheckedChange={() => toggleAdvancedOption('detailedCompliance')}
                  />
                  <Label 
                    htmlFor="detailedCompliance" 
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Include detailed compliance matrix
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="includeScreenshots" 
                    checked={advancedOptions.includeScreenshots}
                    onCheckedChange={() => toggleAdvancedOption('includeScreenshots')}
                  />
                  <Label 
                    htmlFor="includeScreenshots" 
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Include visualization screenshots
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="generateExecutiveSummary" 
                    checked={advancedOptions.generateExecutiveSummary}
                    onCheckedChange={() => toggleAdvancedOption('generateExecutiveSummary')}
                  />
                  <Label 
                    htmlFor="generateExecutiveSummary" 
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Generate executive summary
                  </Label>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
        
        {recentReports.length > 0 && (
          <>
            <Separator className="my-6" />
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Recently Generated Reports</h3>
              <div className="space-y-2">
                {recentReports.slice(0, 3).map((report, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center p-2 border rounded-md hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      {getFileIcon(report.type)}
                      <span className="ml-2 text-sm text-gray-800">{report.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-gray-500">
                        {formatDate(report.timestamp)}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          // Handle download of existing report
                          if (report.url) {
                            window.open(report.url, '_blank');
                          }
                        }}
                      >
                        <Download className="h-4 w-4 text-gray-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t bg-gray-50 px-6 py-4">
        <Button variant="outline" className="border-gray-200">
          <Printer className="mr-2 h-4 w-4" />
          Print Page
        </Button>
        <Button 
          onClick={handleGenerateReport}
          disabled={isGenerating || Object.values(selectedSections).every(v => !v)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReportGenerator;