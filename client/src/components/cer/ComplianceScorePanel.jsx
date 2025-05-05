import React, { useState, useEffect } from 'react';
import { getComplianceScore, exportCompliancePDF } from '../../services/CerAPIService';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Info, CheckCircle, XCircle, RefreshCw, Download, FileText } from 'lucide-react';

export default function ComplianceScorePanel({ sections, title = 'Clinical Evaluation Report', onComplianceChange, onStatusChange }) {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [complianceData, setComplianceData] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  
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
      
      const response = await getComplianceScore({
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
      const blob = await exportCompliancePDF(complianceData);
      
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
  
  // Get score color based on value
  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Get badge color based on score
  const getBadgeVariant = (score) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
    return 'destructive';
  };
  
  // Format percentage for display
  const formatPercent = (value) => `${Math.round(value * 100)}%`;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Regulatory Compliance Scorecard</h2>
        <button
          onClick={runComplianceAnalysis}
          disabled={analyzing || sections.length === 0}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:bg-blue-300"
        >
          {analyzing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>Check Compliance</>
          )}
        </button>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Analysis Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {!complianceData && !analyzing && !error && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Regulatory Compliance Check</AlertTitle>
          <AlertDescription>
            Click "Check Compliance" to analyze your report against EU MDR, FDA, and ISO 14155 regulatory standards.
            This will evaluate each section for content quality, completeness, and alignment with regulatory requirements.
          </AlertDescription>
        </Alert>
      )}
      
      {analyzing && (
        <div className="space-y-4">
          <p>Analyzing regulatory compliance against EU MDR, FDA, and ISO 14155 standards...</p>
          <div className="space-y-2">
            <Skeleton className="h-[28px] w-full" />
            <Skeleton className="h-[100px] w-full" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-[120px]" />
              <Skeleton className="h-[120px]" />
              <Skeleton className="h-[120px]" />
            </div>
            <Skeleton className="h-[180px] w-full" />
          </div>
        </div>
      )}
      
      {complianceData && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Overall Compliance</CardTitle>
              <CardDescription>Regulatory readiness assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Compliance Score</span>
                    <span className={`text-sm font-bold ${getScoreColor(complianceData.overallScore)}`}>
                      {formatPercent(complianceData.overallScore)}
                    </span>
                  </div>
                  <Progress
                    value={complianceData.overallScore * 100}
                    className="h-2"
                  />
                </div>
                <div className="flex justify-between items-start">
                  <p className="text-sm flex-grow mr-4">{complianceData.summary}</p>
                  <button
                    onClick={handleExportPDF}
                    disabled={exporting}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    {exporting ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    <span>{exporting ? 'Exporting...' : 'Export PDF'}</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Standards Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(complianceData.standards || {}).map(([standard, data]) => (
              <Card key={standard}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{standard}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2 flex items-center gap-2">
                    {formatPercent(data.score)}
                    <Badge variant={getBadgeVariant(data.score)} className="text-xs">
                      {data.score >= 0.8 ? 'Pass' : data.score >= 0.6 ? 'Needs Improvement' : 'Non-compliant'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {data.criticalGaps?.length ? 
                      `${data.criticalGaps.length} critical issues identified` : 
                      'No critical issues found'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Section Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Section Compliance Breakdown</CardTitle>
              <CardDescription>Detailed analysis by section</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                {complianceData.sectionScores?.map((section) => (
                  <AccordionItem value={section.id} key={section.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <span>{section.title}</span>
                        <span className={`${getScoreColor(section.averageScore)} font-semibold`}>
                          {formatPercent(section.averageScore)}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        {/* Standards breakdown for this section */}
                        <div className="grid grid-cols-1 gap-4">
                          {Object.entries(section.standards || {}).map(([standard, data]) => (
                            <div key={standard} className="border rounded-md p-3">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">{standard}</h4>
                                <Badge variant={getBadgeVariant(data.score)}>
                                  {formatPercent(data.score)}
                                </Badge>
                              </div>
                              <p className="text-sm mb-2">{data.feedback}</p>
                              {data.suggestions?.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium mb-1">Suggestions:</h5>
                                  <ul className="list-disc list-inside text-sm space-y-1">
                                    {data.suggestions.map((suggestion, idx) => (
                                      <li key={idx}>{suggestion}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
