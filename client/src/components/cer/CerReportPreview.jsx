import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, CheckCircle, FileText, Info, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * CerReportPreview - Component for displaying a preview of the Clinical Evaluation Report
 */
export default function CerReportPreview({ 
  isLoading = false,
  previewData = {},
  productName = 'Medical Device',
  complianceData = null,
  complianceThresholds = {
    OVERALL_THRESHOLD: 0.8, // 80% threshold for passing
    FLAG_THRESHOLD: 0.7     // 70% threshold for warnings/flagging
  }
}) {
  const { title, sections = [], faersData, comparatorData = [], generatedAt, metadata = {} } = previewData;
  
  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };
  
  // Get section compliance status
  const getSectionComplianceStatus = (sectionTitle) => {
    if (!complianceData || !complianceData.sectionScores) return null;
    
    const sectionScore = complianceData.sectionScores.find(s => 
      s.title.toLowerCase() === sectionTitle.toLowerCase()
    );
    
    if (!sectionScore) return null;
    
    if (sectionScore.averageScore >= complianceThresholds.OVERALL_THRESHOLD) {
      return { status: 'compliant', score: sectionScore.averageScore };
    } else if (sectionScore.averageScore >= complianceThresholds.FLAG_THRESHOLD) {
      return { status: 'warning', score: sectionScore.averageScore };
    } else {
      return { status: 'non-compliant', score: sectionScore.averageScore };
    }
  };
  
  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-3/5" />
          <Skeleton className="h-8 w-24" />
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-6 w-2/5" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }
  
  // If no sections, show empty state
  if (sections.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <Info className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-lg font-medium mb-2">No Report Sections Yet</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          Use the Section Generator to create content for your Clinical Evaluation Report, or import FAERS data to automatically generate safety sections.
        </p>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Start with a Template
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold">{title || 'Clinical Evaluation Report'}</h2>
          <p className="text-sm text-muted-foreground">
            Report Preview • {formatDate(generatedAt)} • {sections.length} sections
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Report Content Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>EU MDR Clinical Evaluation Report</CardTitle>
          <CardDescription>
            {productName} • Generated {formatDate(generatedAt)}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs defaultValue="content">
            <div className="border-b px-6">
              <TabsList className="border-b-0">
                <TabsTrigger value="content" className="p-3">Content Preview</TabsTrigger>
                <TabsTrigger value="structure" className="p-3">Document Structure</TabsTrigger>
                {complianceData && (
                  <TabsTrigger value="compliance" className="p-3">
                    Compliance
                    <Badge 
                      className={`ml-2 ${complianceData.overallScore >= complianceThresholds.OVERALL_THRESHOLD ? 'bg-green-100 text-green-800' : 
                                      complianceData.overallScore >= complianceThresholds.FLAG_THRESHOLD ? 'bg-amber-100 text-amber-800' : 
                                      'bg-red-100 text-red-800'}`}
                    >
                      {Math.round(complianceData.overallScore * 100)}%
                    </Badge>
                  </TabsTrigger>
                )}
              </TabsList>
            </div>
            
            <TabsContent value="content" className="p-0">
              <ScrollArea className="h-[500px] p-6">
                <div className="max-w-3xl mx-auto space-y-8">
                  <div className="text-center py-4">
                    <h1 className="text-2xl font-bold mb-1">{title || 'Clinical Evaluation Report'}</h1>
                    <p className="text-muted-foreground">For: {productName}</p>
                    <p className="text-sm text-muted-foreground mt-2">Generated: {formatDate(generatedAt)}</p>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <p><strong>Document ID:</strong> CER-{Date.now().toString().slice(-6)}</p>
                    <p><strong>Version:</strong> 1.0</p>
                    <p><strong>Status:</strong> Draft</p>
                  </div>
                  
                  {/* Table of Contents */}
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Table of Contents</h2>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      {sections.map((section, index) => (
                        <li key={section.id || index} className="pl-2">
                          {section.title}
                          
                          {/* If we have compliance data, show status */}
                          {getSectionComplianceStatus(section.title) && (
                            <span className="ml-2">
                              {getSectionComplianceStatus(section.title).status === 'compliant' ? (
                                <CheckCircle className="inline h-3 w-3 text-green-500" />
                              ) : getSectionComplianceStatus(section.title).status === 'warning' ? (
                                <AlertTriangle className="inline h-3 w-3 text-amber-500" />
                              ) : (
                                <AlertTriangle className="inline h-3 w-3 text-red-500" />
                              )}
                            </span>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                  
                  {/* Section Content */}
                  {sections.map((section, index) => {
                    const complianceStatus = getSectionComplianceStatus(section.title);
                    
                    return (
                      <div key={section.id || index} className="pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h2 className="text-lg font-semibold border-b pb-1">
                            {index + 1}. {section.title}
                          </h2>
                          
                          {complianceStatus && (
                            <Badge 
                              className={`${complianceStatus.status === 'compliant' ? 'bg-green-100 text-green-800' : 
                                        complianceStatus.status === 'warning' ? 'bg-amber-100 text-amber-800' : 
                                        'bg-red-100 text-red-800'}`}
                            >
                              {Math.round(complianceStatus.score * 100)}% Compliant
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-sm space-y-2 prose prose-sm max-w-none">
                          {section.content.split('\n').map((paragraph, idx) => (
                            <p key={idx}>{paragraph}</p>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="structure" className="p-0">
              <ScrollArea className="h-[500px] p-6">
                <div className="max-w-3xl mx-auto">
                  <div className="space-y-4">
                    <h3 className="font-medium">Document Structure</h3>
                    <p className="text-sm text-muted-foreground">
                      This Clinical Evaluation Report follows the structure defined in MEDDEV 2.7/1 Rev. 4 and EU MDR Annex XIV.
                    </p>
                    
                    <div className="space-y-4">
                      {sections.map((section, index) => (
                        <Card key={section.id || index}>
                          <CardHeader className="py-3">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-base">{index + 1}. {section.title}</CardTitle>
                              <Badge variant="outline">{section.type || 'Section'}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="py-2">
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {section.content.split('\n')[0]}
                            </div>
                          </CardContent>
                          <CardFooter className="py-2 text-xs text-muted-foreground border-t bg-muted/20">
                            Added: {formatDate(section.dateAdded)}
                            {section.source && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Source: {section.source}
                              </Badge>
                            )}
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
            
            {complianceData && (
              <TabsContent value="compliance" className="p-0">
                <ScrollArea className="h-[500px] p-6">
                  <div className="max-w-3xl mx-auto space-y-6">
                    <div className="text-center py-4">
                      <h3 className="text-lg font-semibold">Regulatory Compliance Analysis</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Based on EU MDR, ISO 14155, and FDA 21 CFR 812 requirements
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-md bg-muted/10">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-medium">Overall Compliance Score</span>
                        <span className="font-semibold text-lg">
                          {Math.round(complianceData.overallScore * 100)}%
                        </span>
                      </div>
                      
                      <Progress
                        value={complianceData.overallScore * 100}
                        className={`h-2 ${complianceData.overallScore >= complianceThresholds.OVERALL_THRESHOLD ? 'bg-green-600' : 
                                        complianceData.overallScore >= complianceThresholds.FLAG_THRESHOLD ? 'bg-amber-600' : 
                                        'bg-red-600'}`}
                      />
                      
                      <div className="text-sm mt-2 space-y-1">
                        <p><strong>Assessment:</strong> {complianceData.summary}</p>
                        
                        <div className="flex gap-4 mt-2">
                          <Badge variant="outline" className="bg-green-50 text-green-800">
                            Pass: ≥{Math.round(complianceThresholds.OVERALL_THRESHOLD * 100)}%
                          </Badge>
                          <Badge variant="outline" className="bg-amber-50 text-amber-800">
                            Warning: ≥{Math.round(complianceThresholds.FLAG_THRESHOLD * 100)}%
                          </Badge>
                          <Badge variant="outline" className="bg-red-50 text-red-800">
                            Fail: &lt;{Math.round(complianceThresholds.FLAG_THRESHOLD * 100)}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {complianceData.standards && Object.entries(complianceData.standards).map(([standard, data]) => (
                        <Card key={standard}>
                          <CardHeader className="py-3">
                            <CardTitle className="text-base">{standard}</CardTitle>
                          </CardHeader>
                          <CardContent className="py-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">Score</span>
                              <Badge 
                                className={`${data.score >= complianceThresholds.OVERALL_THRESHOLD ? 'bg-green-100 text-green-800' : 
                                          data.score >= complianceThresholds.FLAG_THRESHOLD ? 'bg-amber-100 text-amber-800' : 
                                          'bg-red-100 text-red-800'}`}
                              >
                                {Math.round(data.score * 100)}%
                              </Badge>
                            </div>
                            <Progress
                              value={data.score * 100}
                              className="h-1.5"
                            />
                          </CardContent>
                          <CardFooter className="py-2 text-xs border-t">
                            {data.criticalGaps?.length > 0 ? (
                              <div className="w-full">
                                <p className="font-medium flex items-center text-amber-800">
                                  <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
                                  Critical Gaps: {data.criticalGaps.length}
                                </p>
                                <ul className="list-disc list-inside mt-1 text-amber-700">
                                  {data.criticalGaps.slice(0, 2).map((gap, i) => (
                                    <li key={i} className="line-clamp-1">{gap}</li>
                                  ))}
                                  {data.criticalGaps.length > 2 && (
                                    <li>+ {data.criticalGaps.length - 2} more</li>
                                  )}
                                </ul>
                              </div>
                            ) : (
                              <div className="text-green-700 flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                No critical issues found
                              </div>
                            )}
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}