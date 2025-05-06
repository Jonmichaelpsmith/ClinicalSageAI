import React, { useState, useEffect } from 'react';
import { cerApiService } from '@/services/CerAPIService';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info, CheckCircle, AlertCircle, RefreshCw, FileText } from 'lucide-react';

export default function ComplianceScorePanel({ sections, title = 'Clinical Evaluation Report', onComplianceChange, onStatusChange }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [complianceData, setComplianceData] = useState(null);
  
  // Update parent component with compliance data if callback provided
  useEffect(() => {
    if (complianceData && onComplianceChange) {
      onComplianceChange(complianceData);
      
      // Update status based on score if callback provided
      if (onStatusChange && complianceData.overallScore >= 0.8) {
        onStatusChange('ready-for-review');
      }
    }
  }, [complianceData, onComplianceChange, onStatusChange]);
  
  // Function to run compliance analysis
  const runComplianceAnalysis = async () => {
    if (!sections || sections.length === 0) {
      setError('Please add sections to your report before running compliance analysis');
      return;
    }
    
    try {
      setAnalyzing(true);
      setError(null);
      
      const response = await cerApiService.getComplianceScore({
        sections,
        title,
        standards: ['EU MDR', 'ISO 14155', 'FDA']
      });
      
      setComplianceData(response);
    } catch (err) {
      console.error('Compliance analysis error:', err);
      setError(err.message || 'Failed to analyze compliance');
    } finally {
      setAnalyzing(false);
    }
  };
  
  // Function to export compliance report as PDF
  const handleExportPDF = async () => {
    if (!complianceData) return;
    
    try {
      setExporting(true);
      const blob = await cerApiService.exportCompliancePDF(complianceData);
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'compliance_scorecard.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export PDF error:', err);
      setError(err.message || 'Failed to export compliance report');
    } finally {
      setExporting(false);
    }
  };
  
  // Format percentage for display
  const formatPercent = (value) => `${Math.round(value * 100)}%`;
  
  // MS365 color helpers
  const getScoreColorClass = (score) => {
    if (score >= 0.8) return 'text-[#107C10]';
    if (score >= 0.6) return 'text-[#986F0B]';
    return 'text-[#D83B01]';
  };
  
  const getScoreBgClass = (score) => {
    if (score >= 0.8) return 'bg-[#DFF6DD]';
    if (score >= 0.6) return 'bg-[#FFFCE5]';
    return 'bg-[#FDE7E9]';
  };
  
  const getScoreBorderClass = (score) => {
    if (score >= 0.8) return 'border-[#107C10]';
    if (score >= 0.6) return 'border-[#F2C811]';
    return 'border-[#D83B01]';
  };
  
  return (
    <div className="space-y-4">
      {/* Compliance Analysis Panel */}
      <div className="bg-white p-4 border border-[#E1DFDD] rounded">
        <div className="flex items-center justify-between border-b border-[#E1DFDD] pb-3 mb-3">
          <div>
            <h3 className="text-base font-semibold text-[#323130]">Regulatory Compliance Analysis</h3>
            <p className="text-xs text-[#616161] mt-1">Analyze your report against EU MDR, ISO 14155, and FDA standards</p>
          </div>
          <Button
            onClick={runComplianceAnalysis}
            disabled={analyzing || sections.length === 0}
            className="bg-[#0F6CBD] hover:bg-[#115EA3] text-white"
            size="sm"
          >
            {analyzing ? (
              <>
                <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>Check Compliance</>
            )}
          </Button>
        </div>
        
        {error && (
          <div className="p-3 my-3 bg-[#FDE7E9] border border-[#D83B01] rounded">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-[#D83B01] mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-[#323130]">Analysis Failed</p>
                <p className="text-xs text-[#616161] mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {!complianceData && !analyzing && !error && (
          <div className="p-3 my-3 bg-[#E5F2FF] border border-[#0F6CBD] rounded">
            <div className="flex">
              <Info className="h-5 w-5 text-[#0F6CBD] mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-[#323130]">Regulatory Compliance Check</p>
                <p className="text-xs text-[#616161] mt-1">
                  Click "Check Compliance" to analyze your report against EU MDR, FDA, and ISO 14155 standards.
                  This will evaluate content quality, completeness, and alignment with regulatory requirements.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {analyzing && (
          <div className="space-y-4 my-3">
            <p className="text-sm text-[#616161]">Analyzing regulatory compliance against standards...</p>
            <div className="space-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-24 w-full" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
              </div>
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        )}
        
        {complianceData && (
          <div className="space-y-5">
            {/* Overall Score */}
            <div className="p-4 border border-[#E1DFDD] rounded bg-white">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-[#323130]">Overall Compliance</h4>
                  <p className="text-xs text-[#616161] mt-0.5">Regulatory readiness assessment</p>
                </div>
                <Badge variant="outline" className={`text-xs border px-2 py-0.5 ${getScoreBgClass(complianceData.overallScore)} ${getScoreColorClass(complianceData.overallScore)} ${getScoreBorderClass(complianceData.overallScore)}`}>
                  {complianceData.overallScore >= 0.8 ? 'Compliant' : complianceData.overallScore >= 0.6 ? 'Needs Improvement' : 'Non-compliant'}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-[#616161]">Compliance Score</span>
                    <span className={`text-sm font-semibold ${getScoreColorClass(complianceData.overallScore)}`}>
                      {formatPercent(complianceData.overallScore)}
                    </span>
                  </div>
                  <Progress
                    value={complianceData.overallScore * 100}
                    className={`h-2 ${getScoreBgClass(complianceData.overallScore)}`}
                  />
                </div>
                
                <div className="flex justify-between items-start">
                  <p className="text-xs text-[#616161] flex-grow pr-4">
                    {complianceData.summary || 
                     `This report has an overall compliance score of ${formatPercent(complianceData.overallScore)} against regulatory standards. ${complianceData.overallScore >= 0.8 ? 'The document meets regulatory requirements and is ready for submission.' : complianceData.overallScore >= 0.6 ? 'Some improvements are recommended before submission.' : 'Significant improvements are needed to meet regulatory requirements.'}`}
                  </p>
                  <Button
                    onClick={handleExportPDF}
                    disabled={exporting}
                    variant="outline"
                    size="sm"
                    className="h-8 border-[#0F6CBD] text-[#0F6CBD] text-xs hover:bg-[#EFF6FC]"
                  >
                    {exporting ? (
                      <RefreshCw className="h-3 w-3 mr-1.5 animate-spin" />
                    ) : (
                      <FileText className="h-3 w-3 mr-1.5" />
                    )}
                    <span>{exporting ? 'Exporting...' : 'Export Report'}</span>
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Standards Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(complianceData.standards || {}).map(([standard, data]) => (
                <div key={standard} className="p-4 border border-[#E1DFDD] rounded bg-white">
                  <h4 className="text-sm font-semibold text-[#323130] mb-2">{standard}</h4>
                  <div className="text-xl font-bold text-[#323130] flex items-center gap-2">
                    {formatPercent(data.overallScore)}
                    <Badge variant="outline" className={`text-xs border px-2 py-0.5 ${getScoreBgClass(data.overallScore)} ${getScoreColorClass(data.overallScore)} ${getScoreBorderClass(data.overallScore)}`}>
                      {data.overallScore >= 0.8 ? 'Pass' : data.overallScore >= 0.6 ? 'Needs Work' : 'Non-compliant'}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#616161] mt-1">
                    {Object.keys(data.sectionScores || {}).length} sections analyzed
                  </p>
                </div>
              ))}
            </div>
            
            {/* Section Breakdown by Framework */}
            {Object.entries(complianceData.standards || {}).map(([framework, frameworkData]) => (
              <div key={framework} className="p-4 border border-[#E1DFDD] rounded bg-white">
                <h4 className="text-sm font-semibold text-[#323130] mb-1">{framework} Section Analysis</h4>
                <p className="text-xs text-[#616161] mb-3">Detailed compliance analysis by section</p>
                
                <Accordion type="single" collapsible className="border border-[#E1DFDD] rounded-sm divide-y divide-[#E1DFDD]">
                  {Object.entries(frameworkData.sectionScores || {}).map(([sectionType, score]) => {
                    // Find matching section in generated sections
                    const matchingSection = sections.find(s => s.type === sectionType);
                    if (!matchingSection) return null;
                    
                    return (
                      <AccordionItem value={sectionType} key={sectionType} className="border-0">
                        <AccordionTrigger className="hover:no-underline py-2.5 px-3">
                          <div className="flex items-center justify-between w-full pr-2">
                            <span className="text-sm text-[#323130]">{matchingSection.title}</span>
                            <span className={`${getScoreColorClass(score)} font-medium text-sm`}>
                              {formatPercent(score)}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-3 pt-0">
                          <div className="pt-1">
                            <div className={`p-3 rounded ${getScoreBgClass(score)} border ${getScoreBorderClass(score)}`}>
                              <h5 className="font-medium mb-1.5 text-sm text-[#323130]">Compliance Analysis</h5>
                              <p className="text-xs text-[#616161]">
                                {score >= 0.8 ? 
                                  `This section meets ${framework} requirements and is compliant.` : 
                                  score >= 0.6 ? 
                                  `This section needs some improvements to fully meet ${framework} requirements.` : 
                                  `This section requires significant revisions to meet ${framework} requirements.`}
                              </p>
                              
                              {score < 0.8 && (
                                <div className="mt-2">
                                  <h6 className="text-xs font-medium mb-1 text-[#323130]">Improvement Suggestions:</h6>
                                  <ul className="list-disc list-outside text-xs space-y-1 text-[#616161] ml-3">
                                    {score < 0.6 && (
                                      <li>Add more detailed information specific to {framework} requirements</li>
                                    )}
                                    <li>Enhance content with specific references to {framework} standards</li>
                                    <li>Include more quantitative data and analysis</li>
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}