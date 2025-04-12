import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock,
  Target,
  BarChart2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  XCircle,
  Award,
  Calendar,
  Users,
  LogOut
} from "lucide-react";

// Risk classification component
const RiskIndicator = ({ level, text }: { level: 'low' | 'medium' | 'high', text: string }) => {
  const bgColor = 
    level === 'low' ? 'bg-green-100 border-green-300 text-green-800' : 
    level === 'medium' ? 'bg-amber-100 border-amber-300 text-amber-800' : 
    'bg-red-100 border-red-300 text-red-800';
  
  const icon = 
    level === 'low' ? <CheckCircle className="h-4 w-4 mr-1" /> : 
    level === 'medium' ? <AlertCircle className="h-4 w-4 mr-1" /> : 
    <AlertTriangle className="h-4 w-4 mr-1" />;
  
  return (
    <div className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${bgColor}`}>
      {icon}
      <span>{text}</span>
    </div>
  );
};

// Enhanced metric component
const MetricCard = ({ 
  title, 
  value, 
  prevValue, 
  unit = "", 
  icon, 
  trend = 0,
  target = null,
  trendText = ""
}: { 
  title: string, 
  value: number | string, 
  prevValue?: number | string,
  unit?: string,
  icon: React.ReactNode,
  trend?: number,
  target?: number | null,
  trendText?: string
}) => {
  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getTrendColor = () => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-slate-600";
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="bg-primary/10 p-3 rounded-full">
            {icon}
          </div>
          {target !== null && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Target: {target}{unit}
            </Badge>
          )}
        </div>
        <h3 className="text-xl font-semibold mt-4">{title}</h3>
        <div className="flex items-end gap-2 mt-2">
          <span className="text-3xl font-bold">{value}</span>
          {unit && <span className="text-xl text-slate-500">{unit}</span>}
        </div>
        {trend !== 0 && (
          <div className="flex items-center mt-2">
            {getTrendIcon()}
            <span className={`text-sm ml-1 ${getTrendColor()}`}>
              {trend > 0 ? "+" : ""}{trend}{unit} {trendText}
            </span>
          </div>
        )}
        {prevValue !== undefined && (
          <div className="text-xs text-slate-500 mt-1">
            Previous: {prevValue}{unit}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Risk factor component
const RiskFactorCard = ({ 
  title, 
  riskLevel, 
  impact,
  mitigationSteps,
  potentialUpside
}: { 
  title: string, 
  riskLevel: 'low' | 'medium' | 'high',
  impact: string,
  mitigationSteps: string[],
  potentialUpside?: string
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <Card className={`
      border-l-4 
      ${riskLevel === 'low' ? 'border-l-green-500' : 
        riskLevel === 'medium' ? 'border-l-amber-500' : 
        'border-l-red-500'}
    `}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">{title}</CardTitle>
          <RiskIndicator 
            level={riskLevel} 
            text={riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} 
          />
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-slate-600 mb-2">{impact}</p>
        {isExpanded && (
          <div className="mt-3 space-y-2">
            <div>
              <h4 className="text-sm font-medium">Mitigation Steps:</h4>
              <ul className="mt-1 space-y-1">
                {mitigationSteps.map((step, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-start">
                    <span className="text-primary mr-2">•</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
            
            {potentialUpside && (
              <div className="mt-2">
                <h4 className="text-sm font-medium">Potential Upside:</h4>
                <p className="text-sm text-slate-600 mt-1">{potentialUpside}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs hover:bg-slate-100"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Show Less" : "Show More"}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Insight card component
const InsightCard = ({ 
  title, 
  insight,
  recommendation,
  supportingEvidence,
  impactLevel = 'medium'
}: { 
  title: string, 
  insight: string,
  recommendation: string,
  supportingEvidence: string,
  impactLevel?: 'low' | 'medium' | 'high'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const impactColors = {
    low: 'bg-blue-50 text-blue-800',
    medium: 'bg-purple-50 text-purple-800',
    high: 'bg-indigo-50 text-indigo-800'
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">{title}</CardTitle>
          <Badge className={impactColors[impactLevel]}>
            {impactLevel.charAt(0).toUpperCase() + impactLevel.slice(1)} Impact
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-slate-600">{insight}</p>
        
        {isExpanded && (
          <div className="mt-3 space-y-3">
            <div>
              <h4 className="text-sm font-medium">Recommendation:</h4>
              <p className="text-sm text-slate-600 mt-1">{recommendation}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium">Supporting Evidence:</h4>
              <p className="text-sm text-slate-600 mt-1">{supportingEvidence}</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs hover:bg-slate-100"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Show Less" : "Show More"}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Mock API response for CSR-based KPIs
const useCsrPerformanceMetrics = (drugName: string) => {
  return useQuery({
    queryKey: ['/api/csr-intelligence/metrics', drugName],
    initialData: {
      enrollmentMetrics: {
        // Enrollment metrics
        targetEnrollment: 150,
        currentEnrollment: 86,
        enrollmentRate: 5.7, // per week
        averageSiteActivation: 28, // days
        screenFailureRate: 23.5, // percent
        dropoutRate: 12.4, // percent
        projectedCompletion: "2025-08-15",
        enrollmentTrend: [
          { month: 'Jan', enrollment: 12 },
          { month: 'Feb', enrollment: 18 },
          { month: 'Mar', enrollment: 24 },
          { month: 'Apr', enrollment: 32 },
        ],
        // Calculated field
        percentComplete: 57.3,
        enrollmentLastMonth: 32,
        enrollmentPreviousMonth: 24,
        enrollmentChange: 8,
      },
      
      riskIndicators: {
        protocolDeviations: 12,
        sitePerformance: {
          lowPerforming: 2,
          moderatePerforming: 5,
          highPerforming: 3,
        },
        currentRisks: [
          {
            title: "Enrollment Rate Below Target",
            level: "medium" as const,
            impact: "Current enrollment rate of 5.7 patients/week is below target of 8 patients/week, potentially delaying study completion.",
            mitigationSteps: [
              "Increase site monitoring at low-performing sites",
              "Add 2 additional sites in high-potential regions",
              "Implement targeted recruitment strategies for key demographics"
            ],
            potentialUpside: "Successful mitigation could accelerate timeline by up to 4 weeks."
          },
          {
            title: "Higher Than Expected Screen Failure Rate",
            level: "high" as const,
            impact: "Screen failure rate of 23.5% exceeds the expected 15%, increasing recruitment costs and timeline.",
            mitigationSteps: [
              "Review inclusion/exclusion criteria with investigators",
              "Implement pre-screening questionnaire",
              "Provide additional training to site staff on eligibility assessment"
            ]
          },
          {
            title: "Data Entry Delays at Sites",
            level: "low" as const,
            impact: "2 sites showing consistent delays in data entry, potentially affecting interim analysis.",
            mitigationSteps: [
              "Schedule targeted site training sessions",
              "Implement weekly data completion reminders",
              "Consider incentive program for data entry completion"
            ]
          }
        ]
      },
      
      csrIntelligence: {
        similarTrials: 28,
        benchmarkMetrics: {
          avgSampleSize: 165,
          avgDuration: 14.2, // months
          avgDropout: 16.7, // percent
          avgSuccess: 62, // percent
        },
        endpointPerformance: [
          { endpoint: "Weight Loss", avgValue: 5.2, unit: "%", benchmark: 4.8 },
          { endpoint: "HbA1c Reduction", avgValue: 0.8, unit: "%", benchmark: 1.1 },
          { endpoint: "Waist Circumference", avgValue: 4.1, unit: "cm", benchmark: 3.8 }
        ],
        keyInsights: [
          {
            title: "Endpoint Selection Impact",
            insight: "Trials using weight loss at 12 weeks as primary endpoint had 34% higher success rates than those using longer timeframes.",
            recommendation: "Consider adding a key secondary endpoint at 12 weeks in addition to primary at 24 weeks.",
            supportingEvidence: "Meta-analysis of 12 similar obesity trials shows strong correlation (r=0.78) between 12-week and 24-week outcomes.",
            impactLevel: "high" as const
          },
          {
            title: "Sample Size Optimization",
            insight: "Successful similar trials averaged 165 participants, but stratified analysis shows minimal benefit above 140 participants for this mechanism of action.",
            recommendation: "Consider optimizing sample size to 140 with appropriate stratification by BMI and baseline characteristics.",
            supportingEvidence: "Power analysis based on 28 similar trials indicates 90% power with n=140 when using proposed stratification.",
            impactLevel: "medium" as const
          },
          {
            title: "Dropout Rate Factors",
            insight: "Trials with bi-weekly visits in first 8 weeks showed 31% lower dropout rates than those with monthly visits.",
            recommendation: "Implement bi-weekly visits during initial 8 weeks, then transition to monthly schedule.",
            supportingEvidence: "Analysis of participant retention factors across 18 weight management trials (2023-2025) shows early engagement critically impacts completion rates.",
            impactLevel: "medium" as const
          }
        ]
      },
      
      opportunityAreas: {
        protocolOptimization: [
          {
            area: "Inclusion/Exclusion Criteria",
            opportunity: "Relaxing BMI upper limit from 40 to 45 kg/m² could increase eligible population by ~22% with minimal impact on safety profile.",
            confidence: 85
          },
          {
            area: "Visit Schedule",
            opportunity: "Telemedicine visits for 50% of follow-ups could reduce burden and improve retention by estimated 18%.",
            confidence: 73
          },
          {
            area: "Secondary Endpoints",
            opportunity: "Adding quality of life assessment would increase regulatory and publication impact with minimal additional burden.",
            confidence: 91
          }
        ],
        timelineAcceleration: {
          potentialWeeksSaved: 8.5,
          confidenceLevel: 72,
          accelerationAreas: [
            "Parallel site activation",
            "Centralized recruitment", 
            "Streamlined data monitoring"
          ]
        }
      }
    }
  });
};

const LumenBioPerformanceMetrics = () => {
  // In a real implementation, this would be dynamically determined
  const drugName = "LMN-0801";
  
  const { data: metrics, isLoading } = useCsrPerformanceMetrics(drugName);
  
  if (isLoading) {
    return <div className="p-8 flex justify-center">Loading metrics...</div>;
  }
  
  const { 
    enrollmentMetrics, 
    riskIndicators, 
    csrIntelligence,
    opportunityAreas
  } = metrics;
  
  // Format projected completion date
  const formattedCompletionDate = new Date(enrollmentMetrics.projectedCompletion).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="metrics">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="metrics">
            <Activity className="h-4 w-4 mr-2" />
            Performance KPIs
          </TabsTrigger>
          <TabsTrigger value="risks">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Risk Indicators
          </TabsTrigger>
          <TabsTrigger value="insights">
            <BarChart2 className="h-4 w-4 mr-2" />
            CSR Insights
          </TabsTrigger>
          <TabsTrigger value="opportunities">
            <Target className="h-4 w-4 mr-2" />
            Opportunities
          </TabsTrigger>
        </TabsList>
        
        {/* Performance Metrics Tab */}
        <TabsContent value="metrics" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              title="Enrollment Progress"
              value={enrollmentMetrics.percentComplete}
              unit="%"
              icon={<Activity className="h-6 w-6 text-primary" />}
              trend={enrollmentMetrics.enrollmentChange}
              trendText="vs previous month"
              target={100}
            />
            
            <MetricCard
              title="Enrollment Rate"
              value={enrollmentMetrics.enrollmentRate}
              unit=" pts/week"
              icon={<TrendingUp className="h-6 w-6 text-primary" />}
              target={8}
            />
            
            <MetricCard
              title="Current Enrollment"
              value={enrollmentMetrics.currentEnrollment}
              prevValue={enrollmentMetrics.targetEnrollment}
              icon={<Users className="h-6 w-6 text-primary" />}
            />
            
            <MetricCard
              title="Screen Failure Rate"
              value={riskIndicators.screenFailureRate}
              unit="%"
              icon={<XCircle className="h-6 w-6 text-primary" />}
              target={15}
            />
            
            <MetricCard
              title="Dropout Rate"
              value={enrollmentMetrics.dropoutRate}
              unit="%"
              icon={<LogOut className="h-6 w-6 text-primary" />}
              target={10}
            />
            
            <MetricCard
              title="Projected Completion"
              value={formattedCompletionDate}
              icon={<Calendar className="h-6 w-6 text-primary" />}
            />
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Enrollment Trend</CardTitle>
              <CardDescription>Monthly recruitment progress vs targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={enrollmentMetrics.enrollmentTrend}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="enrollment" fill="#6366f1" name="Patients Enrolled" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Risk Indicators Tab */}
        <TabsContent value="risks" className="pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-semibold text-lg">Current Risk Factors</h3>
              {riskIndicators.currentRisks.map((risk, index) => (
                <RiskFactorCard 
                  key={index}
                  title={risk.title}
                  riskLevel={risk.level}
                  impact={risk.impact}
                  mitigationSteps={risk.mitigationSteps}
                  potentialUpside={risk.potentialUpside}
                />
              ))}
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Site Performance Distribution</h3>
              <Card>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={[
                        { name: 'Low', value: riskIndicators.sitePerformance.lowPerforming, fill: '#f87171' },
                        { name: 'Moderate', value: riskIndicators.sitePerformance.moderatePerforming, fill: '#fbbf24' },
                        { name: 'High', value: riskIndicators.sitePerformance.highPerforming, fill: '#34d399' }
                      ]}
                      margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" name="Sites" />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  <div className="mt-4">
                    <h4 className="font-medium text-sm mb-2">Protocol Deviations</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Total: {riskIndicators.protocolDeviations}</span>
                      <Badge variant={riskIndicators.protocolDeviations > 15 ? "destructive" : "outline"}>
                        {riskIndicators.protocolDeviations > 15 ? "High" : "Acceptable"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <h3 className="font-semibold text-lg mt-6">Industry Benchmarks</h3>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Dropout Rate</span>
                        <div className="flex items-center">
                          <span className="font-medium">{enrollmentMetrics.dropoutRate}%</span>
                          <span className="text-xs ml-2 px-1.5 py-0.5 rounded bg-green-100 text-green-800">
                            vs {csrIntelligence.benchmarkMetrics.avgDropout}%
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={(enrollmentMetrics.dropoutRate / csrIntelligence.benchmarkMetrics.avgDropout) * 100} 
                        className="h-2" 
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Sample Size</span>
                        <div className="flex items-center">
                          <span className="font-medium">{enrollmentMetrics.targetEnrollment}</span>
                          <span className="text-xs ml-2 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            vs {csrIntelligence.benchmarkMetrics.avgSampleSize}
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={(enrollmentMetrics.targetEnrollment / csrIntelligence.benchmarkMetrics.avgSampleSize) * 100} 
                        className="h-2" 
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Enrollment Rate</span>
                        <div className="flex items-center">
                          <span className="font-medium">{enrollmentMetrics.enrollmentRate}/week</span>
                          <span className="text-xs ml-2 px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                            vs 7.4/week
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={(enrollmentMetrics.enrollmentRate / 7.4) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* CSR Insights Tab */}
        <TabsContent value="insights" className="pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <h3 className="font-semibold text-lg">Key CSR-Derived Insights</h3>
              <div className="space-y-4">
                {csrIntelligence.keyInsights.map((insight, idx) => (
                  <InsightCard 
                    key={idx}
                    title={insight.title}
                    insight={insight.insight}
                    recommendation={insight.recommendation}
                    supportingEvidence={insight.supportingEvidence}
                    impactLevel={insight.impactLevel}
                  />
                ))}
              </div>
            </div>
            
            <div className="space-y-6">
              <h3 className="font-semibold text-lg">Endpoint Performance vs Benchmarks</h3>
              <Card>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={csrIntelligence.endpointPerformance}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="endpoint" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="avgValue" fill="#6366f1" name="Your Trial" />
                      <Bar dataKey="benchmark" fill="#94a3b8" name="Benchmark" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <h3 className="font-semibold text-lg mt-4">Benchmark Comparison</h3>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm text-slate-500">Similar CSRs Analyzed</span>
                        <p className="font-semibold text-lg">{csrIntelligence.similarTrials}</p>
                      </div>
                      <Award className="h-8 w-8 text-amber-500" />
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <div>
                        <span className="text-sm text-slate-500">Success Rate in Similar Trials</span>
                        <p className="font-semibold text-lg">{csrIntelligence.benchmarkMetrics.avgSuccess}%</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <div>
                        <span className="text-sm text-slate-500">Avg. Trial Duration</span>
                        <p className="font-semibold text-lg">{csrIntelligence.benchmarkMetrics.avgDuration} months</p>
                      </div>
                      <Clock className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Protocol Optimization Opportunities</CardTitle>
                  <CardDescription>
                    CSR-driven analysis identified these potential improvements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {opportunityAreas.protocolOptimization.map((item, idx) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="flex justify-between">
                          <h3 className="font-semibold">{item.area}</h3>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {item.confidence}% Confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mt-2">{item.opportunity}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Timeline Acceleration</CardTitle>
                  <CardDescription>
                    Potential speed improvements based on CSR intelligence
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col justify-center items-center pb-6">
                    <div className="relative">
                      <svg viewBox="0 0 100 100" width="160" height="160">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="10"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="10"
                          strokeDasharray="283"
                          strokeDashoffset={283 - (283 * opportunityAreas.timelineAcceleration.confidenceLevel / 100)}
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold">{opportunityAreas.timelineAcceleration.potentialWeeksSaved}</span>
                        <span className="text-sm">weeks saved</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-4 text-center">
                      {opportunityAreas.timelineAcceleration.confidenceLevel}% confidence level
                    </p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="font-medium text-sm mb-2">Key Acceleration Areas:</h3>
                    <ul className="space-y-2">
                      {opportunityAreas.timelineAcceleration.accelerationAreas.map((area, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          <ArrowUpRight className="h-4 w-4 text-green-500 mr-2" />
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LumenBioPerformanceMetrics;