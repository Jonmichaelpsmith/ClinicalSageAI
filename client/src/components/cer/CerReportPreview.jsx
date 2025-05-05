import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, AlertCircle, ShieldCheck, FileClock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FaersRiskBadge } from './FaersRiskBadge';
import { FaersDemographicsCharts } from './FaersDemographicsCharts';
import { FaersComparativeChart } from './FaersComparativeChart';

/**
 * CER Report Preview Component
 * 
 * Displays a fully formatted preview of the Clinical Evaluation Report with all sections,
 * FAERS data integration, compliance information, and regulatory formatting
 */
export function CerReportPreview({ 
  previewData, 
  isLoading = false,
  productName = 'Device',
  complianceData = null,
  thresholds = {
    OVERALL_THRESHOLD: 0.8, // 80% threshold for passing
    FLAG_THRESHOLD: 0.7     // 70% threshold for warnings
  }
}) {
  // Function to find section compliance data if available
  const getSectionCompliance = (sectionTitle) => {
    if (!complianceData || !complianceData.sectionScores) return null;
    
    return complianceData.sectionScores.find(section => 
      section.title.toLowerCase() === sectionTitle.toLowerCase());
  };
  
  // Function to determine border color based on compliance score
  const getBorderColorClass = (score) => {
    if (!score && score !== 0) return '';
    if (score >= thresholds.OVERALL_THRESHOLD) return 'border-green-300 border-l-4';
    if (score >= thresholds.FLAG_THRESHOLD) return 'border-amber-300 border-l-4';
    return 'border-red-300 border-l-4';
  };
  
  // Function to get compliance icon
  const getComplianceIcon = (score) => {
    if (!score && score !== 0) return null;
    
    if (score >= thresholds.OVERALL_THRESHOLD) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (score >= thresholds.FLAG_THRESHOLD) {
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    } else {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };
  
  if (isLoading) {
    return <CerReportSkeleton />;
  }
  
  if (!previewData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/20">
        <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No preview available</h3>
        <p className="text-sm text-muted-foreground max-w-md mt-2">
          Generate and add sections to your report using the Section Generator, then switch to Preview.
        </p>
      </div>
    );
  }
  
  const { title, sections, faersData, comparatorData, metadata, generatedAt } = previewData;
  
  return (
    <div className="space-y-6 pb-8">
      {/* Report Header */}
      <div className="border-b pb-6">
        <h1 className="text-2xl font-bold">{title || 'Clinical Evaluation Report'}</h1>
        <div className="flex items-center text-sm text-muted-foreground mt-2">
          <FileClock className="h-4 w-4 mr-2" />
          Generated: {new Date(generatedAt || Date.now()).toLocaleString()}
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="outline" className="bg-blue-50">
            {sections?.length || 0} Sections
          </Badge>
          {metadata?.hasFaersData && (
            <Badge variant="outline" className="bg-green-50">
              FAERS Data Included
            </Badge>
          )}
          {metadata?.hasComparatorData && (
            <Badge variant="outline" className="bg-purple-50">
              Comparative Analysis
            </Badge>
          )}
        </div>
      </div>
      
      {/* Table of Contents */}
      <Card>
        <CardHeader>
          <CardTitle>Table of Contents</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-1 pl-2">
            {sections?.map((section, index) => (
              <li key={section.id || index} className="text-blue-600 hover:underline cursor-pointer">
                {section.title || 'Untitled Section'}
              </li>
            ))}
            {faersData && faersData.length > 0 && (
              <li className="text-blue-600 hover:underline cursor-pointer">
                FDA Adverse Event Analysis
              </li>
            )}
            {comparatorData && comparatorData.length > 0 && (
              <li className="text-blue-600 hover:underline cursor-pointer">
                Comparative Product Analysis
              </li>
            )}
          </ol>
        </CardContent>
      </Card>
      
      {/* Report Sections */}
      {sections?.map((section, index) => {
        const sectionCompliance = getSectionCompliance(section.title || `Section ${index + 1}`);
        const complianceScore = sectionCompliance?.averageScore;
        const complianceBorder = getBorderColorClass(complianceScore);
        const complianceIcon = getComplianceIcon(complianceScore);
        
        // Get compliance suggestions if available
        const complianceTips = sectionCompliance ? 
          Object.entries(sectionCompliance.standards || {}).flatMap(([standardName, data]) => 
            data.suggestions || []).filter(Boolean) : [];
        
        return (
          <Card 
            key={section.id || index} 
            id={`section-${index}`} 
            className={`overflow-hidden ${complianceBorder}`}
          >
            <CardHeader className="bg-muted/30">
              <div className="flex justify-between items-start">
                <CardTitle>{section.title || 'Untitled Section'}</CardTitle>
                <div className="flex items-center gap-2">
                  {complianceScore !== undefined && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1 px-2 py-1 rounded bg-muted/30">
                          {complianceIcon}
                          <span className={`text-sm font-medium ${complianceScore >= 0.8 ? 'text-green-600' : complianceScore >= 0.6 ? 'text-amber-600' : 'text-red-600'}`}>
                            {Math.round(complianceScore * 100)}%
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="w-72 p-3 space-y-2">
                          <p className="font-bold">
                            Compliance Score: {Math.round(complianceScore * 100)}%
                          </p>
                          {complianceScore < 0.7 && (
                            <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded-md">
                              <p className="text-sm font-medium text-red-700 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" /> 
                                Needs Attention
                              </p>
                            </div>
                          )}
                          {complianceTips.length > 0 && (
                            <div className="mt-1">
                              <p className="text-sm font-medium">Suggestions:</p>
                              <ul className="text-xs list-disc list-inside">
                                {complianceTips.slice(0, 3).map((tip, idx) => (
                                  <li key={idx} className="mt-1">{tip}</li>
                                ))}
                                {complianceTips.length > 3 && (
                                  <li className="text-xs mt-1 text-gray-500">+{complianceTips.length - 3} more suggestions</li>
                                )}
                              </ul>
                            </div>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <Badge variant="outline">
                    Section {index + 1}
                  </Badge>
                </div>
              </div>
              {section.description && (
                <CardDescription>{section.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              {complianceScore !== undefined && complianceScore < 0.7 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-red-700">Compliance Issues Detected</p>
                      <p className="text-xs text-red-600 mt-1">
                        This section may not meet regulatory requirements. 
                        {complianceTips.length > 0 && ' See suggestions below:'}
                      </p>
                      {complianceTips.length > 0 && (
                        <ul className="text-xs text-red-600 mt-1 list-disc list-inside">
                          {complianceTips.slice(0, 2).map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div className="prose max-w-none dark:prose-invert">
                {section.content ? (
                  section.content.split('\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">No content available for this section.</p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {/* FAERS Data Section */}
      {faersData && faersData.length > 0 && (
        <Card id="faers-analysis">
          <CardHeader className="bg-muted/30">
            <div className="flex justify-between items-start">
              <CardTitle>FDA Adverse Event Analysis</CardTitle>
              <Badge variant="outline" className="bg-blue-50">
                FAERS Data
              </Badge>
            </div>
            <CardDescription>
              Analysis of adverse event reports from the FDA Adverse Event Reporting System (FAERS)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Safety Assessment</h3>
                  <div className="flex items-center">
                    <FaersRiskBadge 
                      riskLevel={previewData.faersData?.severityAssessment?.toLowerCase() || 'low'} 
                      score={previewData.faersData?.riskScore || 2} 
                    />
                  </div>
                </div>
                
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Report Summary</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Reports</p>
                      <p className="text-xl font-semibold">{previewData.faersData?.totalReports || faersData.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Serious Events</p>
                      <p className="text-xl font-semibold">{previewData.faersData?.seriousEvents?.length || '—'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Most Common Reactions</h3>
                  <div className="flex flex-wrap gap-1">
                    {previewData.faersData?.topReactions?.slice(0, 5).map((reaction, idx) => (
                      <Badge key={idx} variant="secondary">
                        {reaction.term || reaction.event} ({reaction.count})
                      </Badge>
                    )) || (
                      <p className="text-xs text-muted-foreground">No reaction data available</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* FAERS Demographics Charts */}
              {previewData.faersData && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-4">Demographics Analysis</h3>
                  <div className="border rounded-lg p-4">
                    <FaersDemographicsCharts faersData={previewData.faersData} />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Comparator Analysis Section */}
      {comparatorData && comparatorData.length > 0 && (
        <Card id="comparative-analysis">
          <CardHeader className="bg-muted/30">
            <div className="flex justify-between items-start">
              <CardTitle>Comparative Product Analysis</CardTitle>
              <Badge variant="outline" className="bg-purple-50">
                Comparator Data
              </Badge>
            </div>
            <CardDescription>
              Analysis of {comparatorData.length} similar products for comparative safety and performance
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <p>
                This section provides a comparative analysis of {productName} against {comparatorData.length} similar products 
                identified based on pharmacological class, mechanism of action, and therapeutic use.
              </p>
              
              {/* Comparator Chart */}
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-4">Adverse Event Comparison</h3>
                <FaersComparativeChart 
                  productName={productName} 
                  faersData={{ comparators: comparatorData }} 
                />
              </div>
              
              {/* Conclusions */}
              <div className="bg-muted/20 p-4 rounded-lg mt-4">
                <div className="flex items-start">
                  <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium">Safety Profile Assessment</h3>
                    <p className="text-sm mt-1">
                      Based on comparative analysis, {productName} demonstrates a {' '}
                      {previewData.faersData?.comparisonResult?.toLowerCase() || 'favorable'} safety profile 
                      relative to similar products in its class.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Loading skeleton for the CER Report Preview
function CerReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="border-b pb-6">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3 mt-2" />
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
      
      <div className="border rounded-lg p-4">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <Skeleton className="h-6 w-1/3" />
        </div>
        <div className="p-6 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <Skeleton className="h-6 w-1/3" />
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-56 w-full" />
        </div>
      </div>
    </div>
  );
}
