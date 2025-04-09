
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, PieChart, LineChart, Microscope, Pill, Activity, 
  Beaker, Dna, TrendingUp, Search, BrainCircuit, ArrowUpDown, 
  Lightbulb, Users, Flag, FileSymlink, 
  CheckCircle, AlertCircle, BarChart2
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CsrReport } from "@/lib/types";

// Trial comparison card component
function TrialComparisonCard({ isLoading = false }) {
  const [trial1, setTrial1] = useState("");
  const [trial2, setTrial2] = useState("");
  
  const { data: reports } = useQuery({
    queryKey: ['/api/reports'],
  });
  
  const { data: comparison, isLoading: isLoadingComparison } = useQuery({
    queryKey: ['/api/analytics/compare', { trial1, trial2 }],
    enabled: !!trial1 && !!trial2,
  });
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <ArrowUpDown className="h-5 w-5 text-indigo-600 mr-2" />
          Trial Comparison
        </CardTitle>
        <CardDescription>
          Compare efficacy, safety, and outcomes between two clinical trials
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              First Trial
            </label>
            <Select value={trial1} onValueChange={setTrial1}>
              <SelectTrigger>
                <SelectValue placeholder="Select trial" />
              </SelectTrigger>
              <SelectContent>
                {reports?.map((report: CsrReport) => (
                  <SelectItem key={report.id} value={report.id.toString()}>
                    {report.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Second Trial
            </label>
            <Select value={trial2} onValueChange={setTrial2}>
              <SelectTrigger>
                <SelectValue placeholder="Select trial" />
              </SelectTrigger>
              <SelectContent>
                {reports?.map((report: CsrReport) => (
                  <SelectItem key={report.id} value={report.id.toString()}>
                    {report.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button 
          onClick={() => {}} 
          className="w-full mb-4" 
          disabled={!trial1 || !trial2 || trial1 === trial2}
        >
          Compare Trials
        </Button>
        
        {isLoadingComparison ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : comparison ? (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-md">
              <h4 className="font-medium mb-2">Primary Endpoint Comparison</h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-slate-500">Endpoint:</span>
                  <p className="font-medium">{comparison.primaryEndpoint.name}</p>
                </div>
                <div>
                  <span className="text-slate-500">Difference:</span>
                  <p className="font-medium">{comparison.primaryEndpoint.difference}%</p>
                </div>
                <div>
                  <span className="text-slate-500">Significance:</span>
                  <p className="font-medium">{comparison.primaryEndpoint.significance}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-md">
              <h4 className="font-medium mb-2">Safety Profile Comparison</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Adverse Events:</span>
                  <p className="font-medium">Difference: {comparison.safetyComparison.adverseEvents.difference}%</p>
                </div>
                <div>
                  <span className="text-slate-500">Serious Events:</span>
                  <p className="font-medium">Difference: {comparison.safetyComparison.seriousEvents.difference}%</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-md">
              <h4 className="font-medium mb-2">AI Summary</h4>
              <p className="text-sm">{comparison.conclusionSummary}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-slate-500">Select two trials to compare their outcomes and safety profiles</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Predictive Analysis card component
function PredictiveAnalysisCard({ isLoading = false }) {
  const [indication, setIndication] = useState("");
  
  const { data: reports } = useQuery({
    queryKey: ['/api/reports'],
  });
  
  const indications = reports ? Array.from(new Set(reports.map((r: CsrReport) => r.indication))) : [];
  
  const { data: predictive, isLoading: isLoadingPredictive } = useQuery({
    queryKey: ['/api/analytics/predictive', { indication }],
    enabled: !!indication,
  });
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <BrainCircuit className="h-5 w-5 text-indigo-600 mr-2" />
          Predictive Analytics
        </CardTitle>
        <CardDescription>
          AI-powered predictions and insights for clinical trial design
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Therapeutic Area
          </label>
          <Select value={indication} onValueChange={setIndication}>
            <SelectTrigger>
              <SelectValue placeholder="Select indication" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All indications</SelectItem>
              {indications.map((ind: string) => (
                <SelectItem key={ind} value={ind}>
                  {ind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={() => {}} 
          className="w-full mb-4"
        >
          Generate Predictive Analysis
        </Button>
        
        {isLoadingPredictive ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : predictive ? (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-md">
              <h4 className="font-medium mb-2">Predicted Endpoints</h4>
              <div className="space-y-2">
                {predictive.predictedEndpoints.map((endpoint, idx) => (
                  <div key={idx} className="text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">{endpoint.endpointName}</span>
                      <Badge variant={endpoint.reliability === 'High' ? 'default' : endpoint.reliability === 'Moderate' ? 'secondary' : 'outline'}>
                        {endpoint.reliability}
                      </Badge>
                    </div>
                    <div className="mt-1">
                      <span className="text-slate-500">Predicted effect size: {endpoint.predictedEffectSize}%</span>
                      <div className="text-xs text-slate-400">(CI: {endpoint.confidenceInterval[0]}% - {endpoint.confidenceInterval[1]}%)</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-md">
              <h4 className="font-medium mb-2">Trial Design Recommendations</h4>
              <div className="space-y-2">
                {predictive.trialDesignRecommendations.map((rec, idx) => (
                  <div key={idx} className="text-sm flex items-start">
                    <Badge variant={rec.impactLevel === 'High' ? 'destructive' : rec.impactLevel === 'Medium' ? 'secondary' : 'outline'} className="mt-0.5 mr-2">
                      {rec.impactLevel}
                    </Badge>
                    <div>
                      <span className="font-medium">{rec.factor}:</span> {rec.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-md">
              <h4 className="font-medium mb-2">Market & Competitive Trends</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium mb-1">Indication Trends</h5>
                  <div className="space-y-1 text-sm">
                    {predictive.marketTrends.map((trend, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{trend.indication}</span>
                        <span className={
                          trend.trend === 'Increasing' ? 'text-green-600' : 
                          trend.trend === 'Decreasing' ? 'text-red-600' : 
                          'text-amber-600'
                        }>
                          {trend.trend} ({trend.numberOfTrials})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-1">Competitive Insights</h5>
                  <div className="space-y-1 text-sm">
                    {predictive.competitiveInsights.map((insight, idx) => (
                      <div key={idx}>
                        <span className="font-medium">{insight.sponsor}:</span> {insight.trend} ({insight.significance})
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-slate-500">Select an indication to see AI-powered predictions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Analytics summary card component  
function AnalyticsSummaryCard({ isLoading = false }) {
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['/api/analytics/summary'],
  });
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <BarChart2 className="h-5 w-5 text-indigo-600 mr-2" />
          Analytics Summary
        </CardTitle>
        <CardDescription>
          Comprehensive overview of your clinical trial portfolio
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingSummary ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : summary ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-blue-50 rounded-md text-center">
                <div className="text-xl font-bold text-blue-700">{summary.totalReports}</div>
                <div className="text-xs text-blue-600">Total Reports</div>
              </div>
              <div className="p-3 bg-green-50 rounded-md text-center">
                <div className="text-xl font-bold text-green-700">{summary.averageEndpoints}</div>
                <div className="text-xs text-green-600">Avg. Endpoints</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-md text-center">
                <div className="text-xl font-bold text-purple-700">{Math.round(summary.processingStats.successRate)}%</div>
                <div className="text-xs text-purple-600">Success Rate</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-md text-center">
                <div className="text-xl font-bold text-amber-700">{(summary.processingStats.averageProcessingTime / 1000).toFixed(1)}s</div>
                <div className="text-xs text-amber-600">Avg. Processing</div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-md">
              <h4 className="font-medium mb-2">Reports by Indication</h4>
              <div className="space-y-1">
                {Object.entries(summary.reportsByIndication).map(([indication, count]) => (
                  <div key={indication} className="flex justify-between text-sm">
                    <span>{indication}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-md">
              <h4 className="font-medium mb-2">Reports by Phase</h4>
              <div className="space-y-1">
                {Object.entries(summary.reportsByPhase).map(([phase, count]) => (
                  <div key={phase} className="flex justify-between text-sm">
                    <span>Phase {phase}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-md">
              <h4 className="font-medium mb-2">Common Endpoints</h4>
              <div className="flex flex-wrap gap-2">
                {summary.mostCommonEndpoints.map((endpoint, idx) => (
                  <Badge key={idx} variant="secondary">
                    {endpoint}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-slate-500">No analytics data available yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Study Design Agent component
function StudyDesignAgentCard() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = () => {
    setIsLoading(true);
    // In a real implementation, this would call an API to get the response
    setTimeout(() => {
      setResponse(
        "Based on your CSR database analysis, for this Alzheimer's Phase 2 trial, I recommend:\n\n" +
        "1. Primary endpoint: Change in ADAS-Cog score at 18 months (not 12)\n" +
        "2. Key secondary endpoints: CDR-SB, hippocampal volume\n" +
        "3. Inclusion of APOE4 stratification (69% of successful trials used this)\n" +
        "4. Higher dose arms compared to similar compounds\n" +
        "5. Extended screening period to reduce placebo effect\n\n" +
        "This design incorporates patterns from the 7 most successful trials in your database while avoiding common pitfalls seen in failed studies."
      );
      setIsLoading(false);
    }, 2000);
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Lightbulb className="h-5 w-5 text-amber-500 mr-2" />
          AI Study Design Agent
        </CardTitle>
        <CardDescription>
          Get trial design advice based on patterns from successful clinical trials
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              What would you like advice on?
            </label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: What endpoint should I use for my Alzheimer's Phase 2 trial?"
              className="w-full rounded-md border border-slate-300 py-2 px-3 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={!prompt.trim() || isLoading}
          >
            {isLoading ? 'Analyzing CSR Database...' : 'Get Design Advice'}
          </Button>
          
          {response && (
            <div className="p-4 mt-4 bg-blue-50 rounded-md border border-blue-200">
              <h4 className="font-medium mb-2 text-blue-900">AI Study Design Recommendation</h4>
              <div className="text-sm whitespace-pre-line text-blue-800">
                {response}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg shadow p-6 border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Advanced Analytics & Predictive Modeling</h2>
        <p className="text-slate-600 max-w-2xl">
          Leverage powerful statistical models, predictive analytics, and AI-powered insights to optimize trial design and accelerate drug development.
        </p>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Analysis</TabsTrigger>
          <TabsTrigger value="compare">Trial Comparison</TabsTrigger>
          <TabsTrigger value="design">Study Design</TabsTrigger>
          <TabsTrigger value="modeling">Statistical Modeling</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <AnalyticsSummaryCard />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Endpoint Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full bg-slate-50 rounded-md flex items-center justify-center">
                  <span className="text-slate-400">Endpoint visualization coming soon</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Trial Success by Phase</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full bg-slate-50 rounded-md flex items-center justify-center">
                  <span className="text-slate-400">Success rate visualization coming soon</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="predictive" className="space-y-4">
          <PredictiveAnalysisCard />
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Historical Efficacy Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full bg-slate-50 rounded-md flex items-center justify-center">
                <span className="text-slate-400">Trend visualization coming soon</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="compare" className="space-y-4">
          <TrialComparisonCard />
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Efficacy Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full bg-slate-50 rounded-md flex items-center justify-center">
                <span className="text-slate-400">Comparative efficacy visualization coming soon</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="design" className="space-y-4">
          <StudyDesignAgentCard />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Design Elements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['Sample Size Calculation', 'Stratification Factors', 'Randomization Ratio', 'Endpoint Selection', 'Visit Schedule'].map((elem, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span>{elem}</span>
                      <Button size="sm" variant="outline">Generate</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Reference Design Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { name: 'Standard Phase 1 FIH', score: 95 },
                    { name: 'Adaptive Dose Escalation', score: 87 },
                    { name: 'Biomarker-Driven Phase 2', score: 83 },
                    { name: 'Basket Trial Design', score: 79 },
                    { name: 'Pragmatic Phase 4', score: 76 }
                  ].map((template, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span>{template.name}</span>
                      <Badge variant="outline">{template.score}% match</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="modeling" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                  Statistical Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['Survival Analysis', 'Mixed Effects', 'Repeated Measures', 'Bayesian Analysis', 'Adaptive Design'].map((model, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 rounded flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>{model}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
                  Risk Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { factor: 'Inadequate Sample Size', risk: 'High' },
                    { factor: 'Incomplete Safety Data', risk: 'Medium' },
                    { factor: 'Endpoint Reliability', risk: 'Medium' },
                    { factor: 'Population Heterogeneity', risk: 'High' },
                    { factor: 'Dosing Frequency', risk: 'Low' }
                  ].map((item, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 rounded flex justify-between">
                      <span>{item.factor}</span>
                      <Badge variant={
                        item.risk === 'High' ? 'destructive' : 
                        item.risk === 'Medium' ? 'secondary' : 
                        'outline'
                      }>
                        {item.risk} Risk
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Beaker className="h-5 w-5 text-purple-600 mr-2" />
                  Virtual Trial Simulator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Simulate trial outcomes using historical data and statistical models
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">
                        Sample Size
                      </label>
                      <Input type="number" placeholder="100" min="10" max="1000" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">
                        Effect Size
                      </label>
                      <Input type="number" placeholder="0.25" min="0.05" max="1.0" step="0.05" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">
                        Dropout Rate
                      </label>
                      <Input type="number" placeholder="15%" min="0" max="50" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">
                        Arms
                      </label>
                      <Input type="number" placeholder="2" min="1" max="6" />
                    </div>
                  </div>
                  <Button className="w-full" size="sm">Run Simulation</Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">
                Open-Source Statistical Modeling Engine
              </CardTitle>
              <CardDescription>
                Power your trials with advanced statistical capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-blue-50 rounded-md">
                  <h4 className="font-medium mb-2 flex items-center">
                    <FileSymlink className="h-4 w-4 mr-1" />
                    Forecasting Tools
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• Parametric survival models</li>
                    <li>• Dropout prediction</li>
                    <li>• Event rate forecasting</li>
                    <li>• Recruitment modeling</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 rounded-md">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Patient Population Tools
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• Enrichment strategy modeling</li>
                    <li>• Responder analysis</li>
                    <li>• Subgroup identification</li>
                    <li>• Biomarker stratification</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-md">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Flag className="h-4 w-4 mr-1" />
                    Trial Success Factors
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• Power calculation tools</li>
                    <li>• Sample size optimization</li>
                    <li>• Protocol deviation impact</li>
                    <li>• Endpoint sensitivity</li>
                  </ul>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-slate-500 text-sm mb-2">Ready to use our Statistical Modeling API in your workflows?</p>
                <div className="inline-flex space-x-2">
                  <Button variant="outline" size="sm">View Documentation</Button>
                  <Button size="sm">Request API Access</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
