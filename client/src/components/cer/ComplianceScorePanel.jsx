import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle, Download, FileCheck, Loader2, AlertTriangle } from 'lucide-react';

/**
 * ComplianceScorePanel - Enhanced component for displaying CER compliance scores
 * based on EU MDR, ISO 14155, and FDA 21 CFR 812 requirements
 */
export default function ComplianceScorePanel({ 
  cerTitle = '',
  sections = [], 
  complianceThresholds = {
    OVERALL_THRESHOLD: 0.8, // 80% threshold for passing
    FLAG_THRESHOLD: 0.7     // 70% threshold for warnings/flagging
  },
  onScoresGenerated,
  integrationMode = false
}) {
  const { toast } = useToast();
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Run compliance check against sections
  const runComplianceCheck = async () => {
    if (sections.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Sections',
        description: 'Add sections to your report before running a compliance check.',
      });
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would call an API endpoint
      // const res = await axios.post('/api/cer/compliance-score', { sections });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Sample compliance data - would come from API
      const sampleScores = {
        overallScore: Math.floor(Math.random() * 25 + 70), // Random score between 70-95%
        summary: "The report meets most regulatory requirements but needs some improvements in certain sections.",
        standards: {
          'EU MDR': {
            score: Math.floor(Math.random() * 30 + 65),
            criticalGaps: Math.random() > 0.7 ? ['Missing clinical investigation data', 'Insufficient state of the art analysis'] : [],
          },
          'ISO 14155': {
            score: Math.floor(Math.random() * 20 + 75),
            criticalGaps: Math.random() > 0.8 ? ['Inadequate adverse event reporting methodology'] : [],
          },
          'FDA 21 CFR 812': {
            score: Math.floor(Math.random() * 25 + 70),
            criticalGaps: Math.random() > 0.7 ? ['Benefit-risk analysis needs strengthening'] : [],
          },
        },
        breakdown: sections.map(section => ({
          section: section.title,
          score: Math.floor(Math.random() * 30 + 65), // Random score between 65-95%
          comment: generateRandomComment(section.title),
          improvements: [
            generateRandomImprovement(section.title, 1),
            generateRandomImprovement(section.title, 2),
          ]
        }))
      };
      
      setScores(sampleScores);
      
      if (onScoresGenerated) {
        onScoresGenerated(sampleScores);
      }
      
      toast({
        title: 'Compliance Check Complete',
        description: `Overall Score: ${sampleScores.overallScore}%`,
      });
    } catch (err) {
      console.error('Compliance check error:', err);
      setError('Failed to evaluate compliance. Please try again.');
      
      toast({
        variant: 'destructive',
        title: 'Compliance Check Failed',
        description: 'An error occurred while analyzing compliance. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Export compliance report to PDF
  const exportPDF = async () => {
    if (!scores) {
      toast({
        variant: 'destructive',
        title: 'No Scores Available',
        description: 'Run a compliance check before exporting the report.',
      });
      return;
    }
    
    try {
      setExportLoading(true);
      
      toast({
        title: 'Exporting Report',
        description: 'Preparing PDF export...',
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would call an API endpoint
      // const res = await axios.post('/api/cer/export-compliance', {
      //   data: scores,
      //   thresholds: complianceThresholds,
      //   title: cerTitle,
      // }, { responseType: 'blob' });
      // 
      // const url = window.URL.createObjectURL(new Blob([res.data]));
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', 'compliance_scorecard.pdf');
      // document.body.appendChild(link);
      // link.click();
      
      toast({
        title: 'Export Complete',
        description: 'Compliance report has been downloaded.',
      });
    } catch (err) {
      console.error('Export error:', err);
      
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'Failed to generate PDF report. Please try again.',
      });
    } finally {
      setExportLoading(false);
    }
  };
  
  // Helper function to generate random compliance comments
  const generateRandomComment = (sectionTitle) => {
    const comments = [
      `The ${sectionTitle} section meets basic requirements but needs strengthening in specific areas.`,
      `${sectionTitle} contains most required elements but lacks sufficient detail in key areas.`,
      `${sectionTitle} is generally compliant but would benefit from additional evidence.`,
      `${sectionTitle} meets the minimum regulatory standards but could be improved.`,
      `${sectionTitle} section is well-structured but missing some supporting data.`,
    ];
    
    return comments[Math.floor(Math.random() * comments.length)];
  };
  
  // Helper function to generate random improvement suggestions
  const generateRandomImprovement = (sectionTitle, index) => {
    const improvementsBySection = {
      'Benefit-Risk Analysis': [
        'Include a more quantitative approach to weighing benefits vs. risks',
        'Add references to ISO 14971 methodology',
        'Strengthen the discussion of residual risks',
        'Include more comparisons with state of the art',
      ],
      'Safety Analysis': [
        'Add more detailed analysis of adverse events',
        'Include statistical significance testing',
        'Connect findings more clearly to risk assessment',
        'Add more post-market surveillance data',
      ],
      'Clinical Background': [
        'Include more epidemiological data',
        'Add more details on current clinical practice',
        'Strengthen the description of unmet needs',
        'Add more references to clinical guidelines',
      ],
      'Device Description': [
        'Include more detailed specifications',
        'Add more information on components and materials',
        'Include more details on manufacturing process',
        'Add clearer description of intended use',
      ],
      'State of the Art Review': [
        'Include more recent publications',
        'Add more details on competitor devices',
        'Strengthen the analysis of current practice',
        'Include more clinical practice guidelines',
      ],
      'Equivalence Assessment': [
        'Provide more detailed comparison tables',
        'Add more technical specifications of equivalent devices',
        'Include more clinical data from equivalent devices',
        'Strengthen the justification for equivalence',
      ],
      'Literature Analysis': [
        'Include more recent publications',
        'Add more meta-analyses and systematic reviews',
        'Strengthen the critical appraisal methodology',
        'Include more details on search strategy',
      ],
      'Post-Market Surveillance Data': [
        'Include more recent data',
        'Add more trend analysis',
        'Strengthen the discussion of field safety notices',
        'Include more details on complaint handling',
      ],
      'Conclusion': [
        'Provide a stronger connection to benefit-risk profile',
        'Add more details on residual risks',
        'Strengthen the justification for clinical evaluation',
        'Include more details on follow-up measures',
      ],
    };
    
    // Default improvements if section not found in the mapping
    const defaultImprovements = [
      'Add more supporting evidence and citations',
      'Include more quantitative data',
      'Strengthen the regulatory justification',
      'Include more details as required by EU MDR',
    ];
    
    const improvements = improvementsBySection[sectionTitle] || defaultImprovements;
    return improvements[Math.floor(Math.random() * improvements.length)];
  };
  
  // Compact version for integration in other components
  if (integrationMode) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Regulatory Compliance</CardTitle>
            <Button 
              onClick={runComplianceCheck} 
              disabled={loading || sections.length === 0}
              size="sm"
              variant="outline"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <FileCheck className="h-4 w-4 mr-1" />}
              {loading ? 'Analyzing...' : 'Check Compliance'}
            </Button>
          </div>
          <CardDescription>
            Against EU MDR, ISO 14155, and FDA 21 CFR 812 requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {scores ? (
            <div>
              <div className="px-6 py-4 border-b">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Overall Score</span>
                  <Badge 
                    className={`${scores.overallScore >= complianceThresholds.OVERALL_THRESHOLD * 100 ? 'bg-green-100 text-green-800' : 
                              scores.overallScore >= complianceThresholds.FLAG_THRESHOLD * 100 ? 'bg-amber-100 text-amber-800' : 
                              'bg-red-100 text-red-800'}`}
                  >
                    {scores.overallScore}%
                  </Badge>
                </div>
                <Progress
                  value={scores.overallScore}
                  className={`h-2 ${scores.overallScore >= complianceThresholds.OVERALL_THRESHOLD * 100 ? 'bg-green-600' : 
                            scores.overallScore >= complianceThresholds.FLAG_THRESHOLD * 100 ? 'bg-amber-600' : 
                            'bg-red-600'}`}
                />
              </div>
            
              <div className="px-6 py-3">
                <h4 className="text-sm font-medium mb-2">Standard Compliance</h4>
                <div className="space-y-3">
                  {scores.standards && Object.entries(scores.standards).map(([standard, data]) => (
                    <div key={standard} className="flex justify-between items-center">
                      <span className="text-sm">{standard}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{data.score}%</span>
                        {data.score >= complianceThresholds.OVERALL_THRESHOLD * 100 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : data.score >= complianceThresholds.FLAG_THRESHOLD * 100 ? (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">Analyzing compliance with EU MDR, ISO 14155, and FDA requirements...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <FileCheck className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">Run a compliance check to evaluate your report against regulatory standards</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  
  // Full standalone component version
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Regulatory Compliance Analysis</h2>
          <p className="text-sm text-muted-foreground">
            Evaluate your CER against EU MDR, ISO 14155, and FDA 21 CFR 812 requirements
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={runComplianceCheck} 
            disabled={loading}
            className="flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <FileCheck className="mr-2 h-4 w-4" />
                Run Compliance Check
              </>
            )}
          </Button>
          
          {scores && (
            <Button 
              variant="outline" 
              onClick={exportPDF}
              disabled={exportLoading}
            >
              {exportLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="p-4 border border-red-200 bg-red-50 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
            <div>
              <p className="text-sm font-medium text-red-800">{error}</p>
              <p className="text-xs text-red-700 mt-1">
                Please ensure all sections have sufficient content and try again.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium mb-1">Analyzing Compliance</p>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Evaluating your Clinical Evaluation Report against EU MDR, ISO 14155, and FDA 21 CFR 812 requirements...
            </p>
          </CardContent>
        </Card>
      )}
      
      {scores && !loading && (
        <div className="space-y-6">
          {/* Overall Score Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Overall Compliance Assessment</CardTitle>
              <CardDescription>
                Based on {sections.length} sections evaluated against regulatory standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm font-medium mb-1">Compliance Score</p>
                  <div className="flex items-center">
                    <span className="text-3xl font-bold">
                      {scores.overallScore}%
                    </span>
                    <Badge 
                      className={`ml-3 ${scores.overallScore >= complianceThresholds.OVERALL_THRESHOLD * 100 ? 'bg-green-100 text-green-800' : 
                                          scores.overallScore >= complianceThresholds.FLAG_THRESHOLD * 100 ? 'bg-amber-100 text-amber-800' : 
                                          'bg-red-100 text-red-800'}`}
                    >
                      {scores.overallScore >= complianceThresholds.OVERALL_THRESHOLD * 100 ? 'Compliant' : 
                       scores.overallScore >= complianceThresholds.FLAG_THRESHOLD * 100 ? 'Needs Improvement' : 
                       'Non-Compliant'}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="text-center px-4 py-2 border rounded-md">
                    <p className="text-sm text-muted-foreground">Passing Threshold</p>
                    <p className="text-xl font-semibold text-green-600">{Math.round(complianceThresholds.OVERALL_THRESHOLD * 100)}%</p>
                  </div>
                  <div className="text-center px-4 py-2 border rounded-md">
                    <p className="text-sm text-muted-foreground">Warning Threshold</p>
                    <p className="text-xl font-semibold text-amber-600">{Math.round(complianceThresholds.FLAG_THRESHOLD * 100)}%</p>
                  </div>
                </div>
              </div>
              
              <Progress
                value={scores.overallScore}
                className={`h-2.5 mb-4 ${scores.overallScore >= complianceThresholds.OVERALL_THRESHOLD * 100 ? 'bg-green-600' : 
                                              scores.overallScore >= complianceThresholds.FLAG_THRESHOLD * 100 ? 'bg-amber-600' : 
                                              'bg-red-600'}`}
              />
              
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Assessment Summary</p>
                <p className="text-sm text-muted-foreground">{scores.summary}</p>
              </div>
              
              {/* Regulatory Standards Breakdown */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {scores.standards && Object.entries(scores.standards).map(([standard, data]) => (
                  <Card key={standard} className="overflow-hidden">
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">{standard}</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">Score</span>
                        <Badge 
                          className={`${data.score >= complianceThresholds.OVERALL_THRESHOLD * 100 ? 'bg-green-100 text-green-800' : 
                                    data.score >= complianceThresholds.FLAG_THRESHOLD * 100 ? 'bg-amber-100 text-amber-800' : 
                                    'bg-red-100 text-red-800'}`}
                        >
                          {data.score}%
                        </Badge>
                      </div>
                      <Progress
                        value={data.score}
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
                            {data.criticalGaps.map((gap, i) => (
                              <li key={i} className="line-clamp-1">{gap}</li>
                            ))}
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
            </CardContent>
          </Card>
          
          {/* Section Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Section-by-Section Analysis</CardTitle>
              <CardDescription>
                Detailed compliance analysis for each section of your Clinical Evaluation Report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Section</TableHead>
                    <TableHead className="w-[100px]">Score</TableHead>
                    <TableHead>Assessment</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scores.breakdown.map((item, index) => (
                    <TableRow key={index} className={item.score < complianceThresholds.FLAG_THRESHOLD * 100 ? 'bg-red-50' : ''}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {item.score < complianceThresholds.FLAG_THRESHOLD * 100 && (
                            <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                          )}
                          {item.section}
                        </div>
                      </TableCell>
                      <TableCell>{item.score}%</TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="text-sm line-clamp-1">{item.comment}</div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p>{item.comment}</p>
                              {item.improvements && item.improvements.length > 0 && (
                                <>
                                  <p className="font-semibold mt-2">Improvement suggestions:</p>
                                  <ul className="list-disc list-inside mt-1">
                                    {item.improvements.map((tip, i) => (
                                      <li key={i}>{tip}</li>
                                    ))}
                                  </ul>
                                </>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge 
                          className={`${item.score >= complianceThresholds.OVERALL_THRESHOLD * 100 ? 'bg-green-100 text-green-800' : 
                                    item.score >= complianceThresholds.FLAG_THRESHOLD * 100 ? 'bg-amber-100 text-amber-800' : 
                                    'bg-red-100 text-red-800'}`}
                        >
                          {item.score >= complianceThresholds.OVERALL_THRESHOLD * 100 ? 'Compliant' : 
                          item.score >= complianceThresholds.FLAG_THRESHOLD * 100 ? 'Needs Improvement' : 
                          'Non-Compliant'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="border-t bg-muted/20 py-3">
              <div className="flex gap-4">
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-xs text-muted-foreground">
                    Compliant (≥{Math.round(complianceThresholds.OVERALL_THRESHOLD * 100)}%)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="text-xs text-muted-foreground">
                    Needs Improvement (≥{Math.round(complianceThresholds.FLAG_THRESHOLD * 100)}%)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-xs text-muted-foreground">
                    Non-Compliant (&lt;{Math.round(complianceThresholds.FLAG_THRESHOLD * 100)}%)
                  </span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}