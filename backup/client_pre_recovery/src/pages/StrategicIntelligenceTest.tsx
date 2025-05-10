import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const StrategicIntelligenceTest = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('executive');

  useEffect(() => {
    const fetchSampleReport = async () => {
      try {
        setLoading(true);
        const response = await apiRequest('GET', '/api/strategy/sample-report');
        const data = await response.json();
        if (data.success && data.report) {
          setReport(data.report);
        } else {
          setError('Failed to load sample report');
        }
      } catch (err) {
        setError('Error fetching report: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchSampleReport();
  }, []);

  const downloadAsPDF = async () => {
    if (!report) return;
    
    try {
      setLoading(true);
      const response = await apiRequest('POST', '/api/strategy/export-pdf', {
        reportData: report,
        notifyOptions: {
          notify: false
        }
      });
      
      const data = await response.json();
      if (data.success && data.downloadUrl) {
        // Open the PDF in a new tab
        window.open(data.downloadUrl, '_blank');
      } else {
        setError('Failed to generate PDF');
      }
    } catch (err) {
      setError('Error generating PDF: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const downloadAsMarkdown = async () => {
    if (!report) return;
    
    try {
      setLoading(true);
      const response = await apiRequest('POST', '/api/strategy/export-markdown', {
        reportData: report
      });
      
      const data = await response.json();
      if (data.success && data.markdown) {
        // Create a blob and download it
        const blob = new Blob([data.markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.fileName || 'strategic-report.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        setError('Failed to generate Markdown');
      }
    } catch (err) {
      setError('Error generating Markdown: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !report) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-2">Loading Strategic Intelligence Report...</span>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Strategic Intelligence Report</h1>
          <p className="text-muted-foreground mt-1">
            {report?.metadata?.indication} | {report?.metadata?.phase} | ID: {report?.metadata?.protocolId}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadAsPDF} disabled={loading}>
            {loading ? 'Processing...' : 'Export as PDF'}
          </Button>
          <Button onClick={downloadAsMarkdown} variant="outline" disabled={loading}>
            Export as Markdown
          </Button>
        </div>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <Tabs defaultValue="executive" value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid grid-cols-7 mb-6">
          <TabsTrigger value="executive">Executive Summary</TabsTrigger>
          <TabsTrigger value="historical">Historical Benchmarking</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoint Analysis</TabsTrigger>
          <TabsTrigger value="risks">Risk Prediction</TabsTrigger>
          <TabsTrigger value="competitive">Competitive Landscape</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="design">Protocol Design</TabsTrigger>
        </TabsList>

        <TabsContent value="executive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
              <CardDescription>
                Key findings and strategic recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Overview</h3>
                  <p>{report?.executiveSummary?.overview}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium">Key Findings</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {report?.executiveSummary?.keyFindings?.map((finding: string, index: number) => (
                      <li key={index}>{finding}</li>
                    ))}
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium">Strategic Recommendations</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {report?.executiveSummary?.strategicRecommendations?.map((rec: string, index: number) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Decision Matrix</CardTitle>
              <CardDescription>
                Strategic assessment of key decision factors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Risk Assessment</h4>
                  <p className="text-xl font-bold">{report?.executiveSummary?.decisionMatrix?.riskAssessment}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Time to Market</h4>
                  <p className="text-xl font-bold">{report?.executiveSummary?.decisionMatrix?.timeToMarket}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Competitive Position</h4>
                  <p className="text-xl font-bold">{report?.executiveSummary?.decisionMatrix?.competitivePosition}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Regulatory Outlook</h4>
                  <p className="text-xl font-bold">{report?.executiveSummary?.decisionMatrix?.regulatoryOutlook}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historical Benchmarking</CardTitle>
              <CardDescription>
                Analysis based on historical trial data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Matching Criteria</h3>
                  <div className="bg-muted p-4 rounded-lg mt-2">
                    <p><strong>Indication:</strong> {report?.historicalBenchmarking?.matchingCriteria?.indication}</p>
                    <p><strong>Phase:</strong> {report?.historicalBenchmarking?.matchingCriteria?.phase}</p>
                    {report?.historicalBenchmarking?.matchingCriteria?.additionalFilters?.length > 0 && (
                      <p><strong>Additional Filters:</strong> {report?.historicalBenchmarking?.matchingCriteria?.additionalFilters.join(', ')}</p>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium">Relevant Precedents</h3>
                  <div className="overflow-x-auto mt-2">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 text-left">CSR ID</th>
                          <th className="p-2 text-left">Title</th>
                          <th className="p-2 text-left">Sponsor</th>
                          <th className="p-2 text-left">Phase</th>
                          <th className="p-2 text-left">Sample Size</th>
                          <th className="p-2 text-left">Outcome</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report?.historicalBenchmarking?.relevantPrecedents?.map((precedent: any, index: number) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                            <td className="p-2">{precedent.csrId}</td>
                            <td className="p-2">{precedent.title}</td>
                            <td className="p-2">{precedent.sponsor}</td>
                            <td className="p-2">{precedent.phase}</td>
                            <td className="p-2">{precedent.sampleSize}</td>
                            <td className="p-2">{precedent.outcome}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium">Benchmark Metrics</h3>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Median Sample Size</h4>
                      <p className="text-xl font-bold">{report?.historicalBenchmarking?.benchmarkMetrics?.medianSampleSize}</p>
                      <p className="text-sm text-muted-foreground">Range: {report?.historicalBenchmarking?.benchmarkMetrics?.sampleSizeRange}</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Median Duration</h4>
                      <p className="text-xl font-bold">{report?.historicalBenchmarking?.benchmarkMetrics?.medianDuration}</p>
                      <p className="text-sm text-muted-foreground">Range: {report?.historicalBenchmarking?.benchmarkMetrics?.durationRange}</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Success Rate</h4>
                      <p className="text-xl font-bold">{report?.historicalBenchmarking?.benchmarkMetrics?.successRate}%</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Average Dropout Rate</h4>
                      <p className="text-xl font-bold">{report?.historicalBenchmarking?.benchmarkMetrics?.averageDropoutRate}%</p>
                    </div>
                  </div>
                  
                  {report?.historicalBenchmarking?.benchmarkMetrics?.commonRegulatoryChallenges?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Common Regulatory Challenges</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {report?.historicalBenchmarking?.benchmarkMetrics?.commonRegulatoryChallenges?.map((challenge: string, index: number) => (
                          <li key={index}>{challenge}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Endpoint Benchmarking</CardTitle>
              <CardDescription>
                Analysis of endpoint selection and historical performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Primary Endpoints Analysis</h3>
                  {report?.endpointBenchmarking?.primaryEndpoints?.map((endpoint: any, index: number) => (
                    <div key={index} className="bg-muted p-4 rounded-lg mt-4">
                      <h4 className="font-medium text-primary">{endpoint.name}</h4>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <p><strong>Usage Frequency:</strong> {endpoint.frequencyScore}/100</p>
                          <p><strong>Success Rate:</strong> {endpoint.successRate}%</p>
                        </div>
                        <div>
                          <p><strong>Time to Result:</strong> {endpoint.timeToResult}</p>
                          <p><strong>Regulatory Acceptance:</strong> {endpoint.regulatoryAcceptance}</p>
                        </div>
                      </div>
                      
                      {endpoint.predecessorUse?.length > 0 && (
                        <div className="mt-3">
                          <h5 className="font-medium text-sm">Examples from Prior Studies:</h5>
                          <ul className="list-disc pl-5">
                            {endpoint.predecessorUse.map((example: any, i: number) => (
                              <li key={i} className="text-sm">
                                <strong>{example.csrId}:</strong> {example.specificDefinition} - Outcome: {example.outcome}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium">Secondary Endpoints Analysis</h3>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {report?.endpointBenchmarking?.secondaryEndpoints?.map((endpoint: any, index: number) => (
                      <div key={index} className="bg-muted p-4 rounded-lg">
                        <h4 className="font-medium text-primary">{endpoint.name}</h4>
                        <div className="mt-2 space-y-1">
                          <p><strong>Usage Frequency:</strong> {endpoint.frequencyScore}/100</p>
                          <p><strong>Success Rate:</strong> {endpoint.successRate}%</p>
                          <p><strong>Correlation with Primary:</strong> {endpoint.correlationWithPrimary}</p>
                          <p><strong>Regulatory Value:</strong> {endpoint.regulatoryValue}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium">Endpoint Recommendations</h3>
                  {report?.endpointBenchmarking?.endpointRecommendations?.map((rec: any, index: number) => (
                    <div key={index} className="bg-muted p-4 rounded-lg mt-2">
                      <p className="font-medium">{index + 1}. {rec.recommendation}</p>
                      <div className="mt-2 text-sm">
                        <p><strong>Confidence:</strong> {rec.confidence}</p>
                        <p><strong>Rationale:</strong> {rec.rationale}</p>
                        <p><strong>Supporting Evidence:</strong> {rec.supportingEvidence}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks">
          <Card>
            <CardHeader>
              <CardTitle>Design Risk Prediction</CardTitle>
              <CardDescription>
                Risk analysis and mitigation strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted p-4 rounded-lg flex items-center">
                  <div className="mr-4">
                    <div className="text-3xl font-bold">{report?.designRiskPrediction?.overallRiskScore}/100</div>
                    <div className="text-sm">Overall Risk Score</div>
                  </div>
                  <div className="flex-1 h-4 bg-muted-foreground/20 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        report?.designRiskPrediction?.overallRiskScore < 30 
                          ? 'bg-green-500' 
                          : report?.designRiskPrediction?.overallRiskScore < 60 
                            ? 'bg-yellow-500' 
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${report?.designRiskPrediction?.overallRiskScore}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Risk Categories</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 text-left">Category</th>
                          <th className="p-2 text-left">Risk Score</th>
                          <th className="p-2 text-left">Key Factors</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report?.designRiskPrediction?.riskCategories?.map((category: any, index: number) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                            <td className="p-2 font-medium">{category.category}</td>
                            <td className="p-2">
                              <div className="flex items-center">
                                <span className="mr-2">{category.score}/100</span>
                                <div className="w-16 h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${
                                      category.score < 30 ? 'bg-green-500' : 
                                      category.score < 60 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${category.score}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="p-2">
                              <ul className="list-disc pl-5">
                                {category.keyFactors?.map((factor: string, i: number) => (
                                  <li key={i}>{factor}</li>
                                ))}
                              </ul>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Sample Size Sensitivity</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <p><strong>Recommended Sample Size:</strong> {report?.designRiskPrediction?.sensitivityAnalysis?.sampleSizeSensitivity?.recommendedSampleSize}</p>
                    
                    {report?.designRiskPrediction?.sensitivityAnalysis?.sampleSizeSensitivity?.powerAnalysisDetails && (
                      <div className="mt-3">
                        <h4 className="font-medium">Power Analysis Details:</h4>
                        <ul className="list-disc pl-5 mt-1">
                          <li><strong>Effect Size:</strong> {report?.designRiskPrediction?.sensitivityAnalysis?.sampleSizeSensitivity?.powerAnalysisDetails?.effect}</li>
                          <li><strong>Power:</strong> {report?.designRiskPrediction?.sensitivityAnalysis?.sampleSizeSensitivity?.powerAnalysisDetails?.power}</li>
                          <li><strong>Alpha:</strong> {report?.designRiskPrediction?.sensitivityAnalysis?.sampleSizeSensitivity?.powerAnalysisDetails?.alpha}</li>
                        </ul>
                      </div>
                    )}
                    
                    {report?.designRiskPrediction?.sensitivityAnalysis?.sampleSizeSensitivity?.scenarioAnalysis?.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium">Scenario Analysis:</h4>
                        <div className="overflow-x-auto mt-2">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-muted">
                                <th className="p-2 text-left">Scenario</th>
                                <th className="p-2 text-left">Sample Size</th>
                                <th className="p-2 text-left">Power</th>
                                <th className="p-2 text-left">Recommendation</th>
                              </tr>
                            </thead>
                            <tbody>
                              {report?.designRiskPrediction?.sensitivityAnalysis?.sampleSizeSensitivity?.scenarioAnalysis?.map((scenario: any, i: number) => (
                                <tr key={i} className={i % 2 === 0 ? 'bg-muted/50' : ''}>
                                  <td className="p-2">{scenario.scenario}</td>
                                  <td className="p-2">{scenario.sampleSize}</td>
                                  <td className="p-2">{scenario.power}</td>
                                  <td className="p-2">{scenario.recommendation}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Dropout Risk Analysis</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <p><strong>Predicted Dropout Rate:</strong> {report?.designRiskPrediction?.sensitivityAnalysis?.dropoutRiskAnalysis?.predictedDropoutRate}%</p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <h4 className="font-medium">Risk Factors:</h4>
                        <ul className="list-disc pl-5 mt-1">
                          {report?.designRiskPrediction?.sensitivityAnalysis?.dropoutRiskAnalysis?.factors?.map((factor: string, i: number) => (
                            <li key={i}>{factor}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium">Recommendations:</h4>
                        <ul className="list-disc pl-5 mt-1">
                          {report?.designRiskPrediction?.sensitivityAnalysis?.dropoutRiskAnalysis?.recommendations?.map((rec: string, i: number) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitive">
          <Card>
            <CardHeader>
              <CardTitle>Competitive Landscape</CardTitle>
              <CardDescription>
                Market positioning and competitor analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Market Overview</h3>
                  <p className="mt-2">{report?.competitiveLandscape?.marketOverview}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Key Competitors</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 text-left">Competitor</th>
                          <th className="p-2 text-left">Phase</th>
                          <th className="p-2 text-left">Time to Market</th>
                          <th className="p-2 text-left">Threat Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report?.competitiveLandscape?.keyCompetitors?.map((competitor: any, index: number) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                            <td className="p-2 font-medium">{competitor.name}</td>
                            <td className="p-2">{competitor.phase}</td>
                            <td className="p-2">{competitor.timeToMarket}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                competitor.threatLevel === 'High' ? 'bg-red-100 text-red-800' :
                                competitor.threatLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {competitor.threatLevel}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium">SWOT Analysis</h3>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">Strengths</h4>
                      <ul className="list-disc pl-5">
                        {report?.competitiveLandscape?.comparativeAnalysis?.strengthsVsCompetitors?.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2">Weaknesses</h4>
                      <ul className="list-disc pl-5">
                        {report?.competitiveLandscape?.comparativeAnalysis?.weaknessesVsCompetitors?.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Opportunities</h4>
                      <ul className="list-disc pl-5">
                        {report?.competitiveLandscape?.comparativeAnalysis?.opportunitiesVsCompetitors?.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-2">Threats</h4>
                      <ul className="list-disc pl-5">
                        {report?.competitiveLandscape?.comparativeAnalysis?.threatsVsCompetitors?.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium">Strategic Positioning</h3>
                  <div className="bg-muted p-4 rounded-lg mt-2">
                    <p>{report?.competitiveLandscape?.strategicPositioning?.recommendedPositioning}</p>
                    
                    <div className="mt-4">
                      <h4 className="font-medium">Key Differentiators:</h4>
                      <ul className="list-disc pl-5 mt-1">
                        {report?.competitiveLandscape?.strategicPositioning?.keyDifferentiators?.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Strategic Recommendations</CardTitle>
              <CardDescription>
                Comprehensive recommendations based on data analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Design Recommendations</h3>
                  {report?.aiRecommendations?.designRecommendations?.map((rec: any, index: number) => (
                    <div key={index} className="bg-muted p-4 rounded-lg mt-2">
                      <h4 className="font-medium text-primary">{index + 1}. {rec.area}: {rec.recommendation}</h4>
                      
                      <div className="mt-2 grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium">Confidence</p>
                          <p className={`${
                            rec.confidence === 'High' ? 'text-green-600' :
                            rec.confidence === 'Medium' ? 'text-yellow-600' :
                            'text-red-600'
                          } font-medium`}>{rec.confidence}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Expected Impact</p>
                          <p>{rec.impact}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Supporting Evidence</p>
                          <p>{rec.evidence}</p>
                        </div>
                      </div>
                      
                      {rec.implementationNotes && (
                        <div className="mt-3 text-sm italic">
                          <p><strong>Implementation Notes:</strong> {rec.implementationNotes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Risk Mitigation Strategy</h3>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium">Key Risks:</h4>
                    <ul className="list-disc pl-5 mt-1">
                      {report?.aiRecommendations?.riskMitigationStrategy?.keyRisks?.map((risk: string, i: number) => (
                        <li key={i}>{risk}</li>
                      ))}
                    </ul>
                    
                    {report?.aiRecommendations?.riskMitigationStrategy?.mitigationPlan?.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium">Mitigation Plan:</h4>
                        <table className="w-full mt-2 border-collapse">
                          <thead>
                            <tr className="bg-muted-foreground/10">
                              <th className="p-2 text-left">Risk</th>
                              <th className="p-2 text-left">Mitigation Strategy</th>
                              <th className="p-2 text-left">Contingency Plan</th>
                            </tr>
                          </thead>
                          <tbody>
                            {report?.aiRecommendations?.riskMitigationStrategy?.mitigationPlan?.map((plan: any, i: number) => (
                              <tr key={i} className={i % 2 === 0 ? 'bg-muted-foreground/5' : ''}>
                                <td className="p-2">{plan.risk}</td>
                                <td className="p-2">{plan.mitigationStrategy}</td>
                                <td className="p-2">{plan.contingencyPlan}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Regulatory Strategy</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium">Key Regulatory Challenges:</h4>
                    <ul className="list-disc pl-5 mt-1">
                      {report?.aiRecommendations?.regulatoryStrategy?.keyRegulatoryChallenges?.map((challenge: string, i: number) => (
                        <li key={i}>{challenge}</li>
                      ))}
                    </ul>
                    
                    <div className="mt-4">
                      <h4 className="font-medium">Recommended Approach:</h4>
                      <p className="mt-1">{report?.aiRecommendations?.regulatoryStrategy?.recommendedApproach}</p>
                    </div>
                    
                    {report?.aiRecommendations?.regulatoryStrategy?.precedentJustifications?.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium">Precedent Justifications:</h4>
                        <ul className="list-disc pl-5 mt-1">
                          {report?.aiRecommendations?.regulatoryStrategy?.precedentJustifications?.map((precedent: string, i: number) => (
                            <li key={i}>{precedent}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="design">
          <Card>
            <CardHeader>
              <CardTitle>Protocol Design Summary</CardTitle>
              <CardDescription>
                Comprehensive study design overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Design Structure</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium">Study Details</h4>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <p><strong>Title:</strong> {report?.protocolDesignSummary?.designStructure?.title}</p>
                        <p><strong>Population:</strong> {report?.protocolDesignSummary?.designStructure?.population}</p>
                        <p><strong>Study Design:</strong> {report?.protocolDesignSummary?.designStructure?.studyDesign}</p>
                        <p><strong>Duration:</strong> {report?.protocolDesignSummary?.designStructure?.duration}</p>
                      </div>
                      <div>
                        <p><strong>Primary Objective:</strong> {report?.protocolDesignSummary?.designStructure?.objectives?.primary}</p>
                        <p><strong>Primary Endpoint:</strong> {report?.protocolDesignSummary?.designStructure?.endpoints?.primary}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium">Secondary Objectives:</h4>
                      <ul className="list-disc pl-5 mt-1">
                        {report?.protocolDesignSummary?.designStructure?.objectives?.secondary?.map((obj: string, i: number) => (
                          <li key={i}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium">Secondary Endpoints:</h4>
                      <ul className="list-disc pl-5 mt-1">
                        {report?.protocolDesignSummary?.designStructure?.endpoints?.secondary?.map((endpoint: string, i: number) => (
                          <li key={i}>{endpoint}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium">Study Arms:</h4>
                      <table className="w-full mt-2 border-collapse">
                        <thead>
                          <tr className="bg-muted-foreground/10">
                            <th className="p-2 text-left">Arm</th>
                            <th className="p-2 text-left">Description</th>
                            <th className="p-2 text-left">Size</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report?.protocolDesignSummary?.designStructure?.arms?.map((arm: any, i: number) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-muted-foreground/5' : ''}>
                              <td className="p-2 font-medium">{arm.name}</td>
                              <td className="p-2">{arm.description}</td>
                              <td className="p-2">{arm.size}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium">Key Procedures:</h4>
                      <ul className="list-disc pl-5 mt-1">
                        {report?.protocolDesignSummary?.designStructure?.keyProcedures?.map((proc: string, i: number) => (
                          <li key={i}>{proc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Statistical Approach</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium">Primary Analysis</h4>
                        <p className="mt-1">{report?.protocolDesignSummary?.statisticalApproach?.primaryAnalysis}</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Power Calculations</h4>
                        <p className="mt-1">{report?.protocolDesignSummary?.statisticalApproach?.powerCalculations}</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Interim Analyses</h4>
                        <p className="mt-1">{report?.protocolDesignSummary?.statisticalApproach?.interimAnalyses}</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Multiplicity Concerns</h4>
                        <p className="mt-1">{report?.protocolDesignSummary?.statisticalApproach?.multiplicityConcerns}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Operational Considerations</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium">Expected Challenges</h4>
                      <ul className="list-disc pl-5 mt-1">
                        {report?.protocolDesignSummary?.operationalConsiderations?.expectedChallenges?.map((challenge: string, i: number) => (
                          <li key={i}>{challenge}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium">Mitigation Strategies</h4>
                      <ul className="list-disc pl-5 mt-1">
                        {report?.protocolDesignSummary?.operationalConsiderations?.mitigationStrategies?.map((strategy: string, i: number) => (
                          <li key={i}>{strategy}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium">Timeline Considerations</h4>
                      <ul className="list-disc pl-5 mt-1">
                        {report?.protocolDesignSummary?.operationalConsiderations?.timelineConsiderations?.map((timeline: string, i: number) => (
                          <li key={i}>{timeline}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium">Budget Implications</h4>
                      <ul className="list-disc pl-5 mt-1">
                        {report?.protocolDesignSummary?.operationalConsiderations?.budgetImplications?.map((budget: string, i: number) => (
                          <li key={i}>{budget}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-center text-muted-foreground mt-8 py-2 text-sm border-t">
        <p>TrialSage Strategic Intelligence Engine - Generated on {report?.metadata?.generatedDate}</p>
      </div>
    </div>
  );
};

export default StrategicIntelligenceTest;